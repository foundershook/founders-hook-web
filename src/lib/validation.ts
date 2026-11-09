/**
 * Small, dependency-free input validators shared by API routes.
 */

export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafeHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) {
    return false;
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isResumeUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.startsWith("data:application/pdf;base64,")) return true;
  return isSafeHttpsUrl(value);
}

export function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return null;
  return trimmed;
}

export function cleanStringArray(
  value: unknown,
  maxItems: number,
  maxItemLength: number
): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > maxItems) return null;

  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > maxItemLength) return null;
    result.push(trimmed);
  }
  return result;
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length > 254) return false;
  // Deliberately simple: full RFC validation belongs in a dedicated library.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidUsername(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 3 &&
    value.length <= 24 &&
    /^[a-zA-Z0-9_.,@]+$/.test(value)
  );
}
