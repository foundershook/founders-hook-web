import dns from "node:dns/promises";
import net from "node:net";

/**
 * Server-side fetch that refuses to hit private/internal addresses. Used for
 * fetching user-supplied website URLs, which would otherwise allow SSRF against
 * localhost, RFC1918 ranges, or cloud metadata endpoints.
 *
 * Residual risk: DNS can be re-bound between the lookup and the request. For
 * higher assurance, deploy behind an egress proxy or pin the resolved IP.
 */

const MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_URL_LENGTH = 2048;

function ipv4ToLong(ip: string): number {
  return ip.split(".").reduce((acc, part) => acc * 256 + Number(part), 0);
}

function isPrivateIpv4(ip: string): boolean {
  const value = ipv4ToLong(ip);
  const inRange = (base: string, prefix: number) => {
    const baseValue = ipv4ToLong(base);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return (value & mask) === (baseValue & mask);
  };

  return (
    inRange("0.0.0.0", 8) ||
    inRange("10.0.0.0", 8) ||
    inRange("100.64.0.0", 10) ||
    inRange("127.0.0.0", 8) ||
    inRange("169.254.0.0", 16) ||
    inRange("172.16.0.0", 12) ||
    inRange("192.0.0.0", 24) ||
    inRange("192.168.0.0", 16) ||
    inRange("198.18.0.0", 15) ||
    inRange("224.0.0.0", 4) ||
    inRange("240.0.0.0", 4)
  );
}

function normalizeIpv6(ip: string): string {
  return ip.toLowerCase().split("%")[0];
}

function isPrivateIpv6(ip: string): boolean {
  const value = normalizeIpv6(ip);
  if (value === "::" || value === "::1") return true;
  if (value.startsWith("fe80:")) return true; // link-local
  if (value.startsWith("fc") || value.startsWith("fd")) return true; // ULA
  // IPv4-mapped IPv6, e.g. ::ffff:127.0.0.1
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIpv4(mapped[1]);
  return false;
}

function isPrivateAddress(address: string): boolean {
  const family = net.isIP(address);
  if (family === 4) return isPrivateIpv4(address);
  if (family === 6) return isPrivateIpv6(address);
  return true;
}

export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  if (typeof rawUrl !== "string" || rawUrl.length > MAX_URL_LENGTH) {
    throw new Error("URL is too long");
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }
  if (url.username || url.password) {
    throw new Error("URLs with credentials are not allowed");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Internal hosts are not allowed");
  }

  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error("Private addresses are not allowed");
    }
    return url;
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0) {
    throw new Error("Host could not be resolved");
  }
  for (const record of records) {
    if (isPrivateAddress(record.address)) {
      throw new Error("Host resolves to a private address");
    }
  }

  return url;
}

export async function safeFetch(
  rawUrl: string,
  options: { timeoutMs?: number; headers?: Record<string, string> } = {}
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let current = await assertPublicUrl(rawUrl);

    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      const response = await fetch(current, {
        signal: controller.signal,
        redirect: "manual",
        headers: options.headers,
      });

      if (response.status >= 300 && response.status < 400) {
        if (redirects === MAX_REDIRECTS) {
          throw new Error("Too many redirects");
        }
        const location = response.headers.get("location");
        if (!location) {
          throw new Error("Redirect without a location");
        }
        current = await assertPublicUrl(new URL(location, current).toString());
        continue;
      }

      return response;
    }

    throw new Error("Too many redirects");
  } finally {
    clearTimeout(timer);
  }
}
