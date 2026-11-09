/**
 * Best-effort rate limiting.
 *
 * Uses Upstash Redis when `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN` are configured. Otherwise falls back to an
 * in-process map, which only limits per server instance (acceptable for local
 * development; configure Upstash in production for shared limits).
 */

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memory = new Map<string, MemoryEntry>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const existing = memory.get(key);

  if (!existing || existing.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

async function upstashLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return memoryLimit(key, limit, windowSeconds);
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSeconds)],
        ["TTL", key],
      ]),
      // Don't let a Redis hiccup take down auth endpoints.
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) {
      return memoryLimit(key, limit, windowSeconds);
    }

    const data = (await res.json()) as Array<{ result?: number }>;
    const count = Number(data?.[0]?.result ?? 0);
    const ttl = Number(data?.[2]?.result ?? windowSeconds);

    if (count > limit) {
      return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : windowSeconds };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    return memoryLimit(key, limit, windowSeconds);
  }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  return upstashLimit(key, limit, windowSeconds);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function normalizeKeyPart(value: unknown): string {
  return String(value ?? "").toLowerCase().slice(0, 128);
}
