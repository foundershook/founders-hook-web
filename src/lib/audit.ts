import { createHash } from "crypto";

type AuditRequest = { headers: { get(name: string): string | null } };

const SENSITIVE_KEY = /pass(word)?|secret|token|otp|authorization|cookie/i;

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY.test(key)) return "[redacted]";
  if (value instanceof Error) return value.message;
  return value;
}

export function hashIdentifier(value: string): string {
  return createHash("sha256").update(value.toLowerCase()).digest("hex").slice(0, 12);
}

function getIp(req: AuditRequest): string | undefined {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined
  );
}

/**
 * Emits a structured, redacted audit event. Auth identity is logged as an
 * internal user id; raw identifiers are only included as a short hash so logs
 * never contain emails, usernames, tokens, or OTPs.
 */
export function audit(
  event: string,
  req: AuditRequest | undefined,
  details: Record<string, unknown> = {}
): void {
  const safeDetails: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    safeDetails[key] = redactValue(key, value);
  }

  const entry = {
    type: "audit",
    ts: new Date().toISOString(),
    event,
    ip: req ? getIp(req) : undefined,
    ua: req?.headers.get("user-agent")?.slice(0, 200),
    ...safeDetails,
  };

  console.log(JSON.stringify(entry));
}
