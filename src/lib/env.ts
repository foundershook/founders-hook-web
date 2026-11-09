// Central environment validation. Kept dependency-free so it can run in both
// the Node and Edge runtimes.
//
// We deliberately fail closed: a missing or weak JWT_SECRET must never silently
// fall back to a hard-coded value.

const MIN_JWT_SECRET_LENGTH = 32;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      "JWT_SECRET is not configured correctly. Set a random value of at least 32 characters (e.g. `openssl rand -base64 48`)."
    );
  }
  return secret;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
