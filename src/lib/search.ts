/**
 * Escapes user input before it is embedded in a MongoDB `$regex` so a search
 * term is always treated literally (prevents regex injection / ReDoS).
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const MAX_SEARCH_LENGTH = 64;

export function normalizeSearchInput(input: string | null): string {
  return (input ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
}
