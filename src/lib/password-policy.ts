const MIN_LENGTH = 12;
// bcrypt silently truncates input after 72 bytes, so reject longer values.
const MAX_BYTES = 72;

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "password1234",
  "1234567890",
  "123456789012",
  "qwertyuiop12",
  "letmein12345",
  "admin1234567",
  "welcome12345",
  "iloveyou1234",
]);

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string") {
    return "Password is required.";
  }

  const byteLength = new TextEncoder().encode(password).length;
  if (password.length < MIN_LENGTH) {
    return `Password must be at least ${MIN_LENGTH} characters long.`;
  }
  if (byteLength > MAX_BYTES) {
    return `Password must be at most ${MAX_BYTES} bytes long.`;
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "This password is too common. Please choose a stronger one.";
  }

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) =>
    re.test(password)
  ).length;
  if (classes < 3) {
    return "Password must include at least three of: lowercase, uppercase, numbers, symbols.";
  }

  return null;
}

export const PASSWORD_MIN_LENGTH = MIN_LENGTH;
