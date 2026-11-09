import { jwtVerify } from "jose";
import { getJwtSecret } from "./env";

// Proxy (formerly middleware) runs on the Edge runtime, which can't use the
// `jsonwebtoken` package (it relies on Node's crypto module). `jose` works in
// both runtimes, so it's used here just for the lightweight "is this cookie
// signature valid" check. Session revocation is enforced in server routes via
// getCurrentUser().
export async function verifySession(token: string) {
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jwtVerify(token, secret);
    return payload as {
      userId: string;
      username: string;
      sessionVersion?: number;
    };
  } catch {
    return null;
  }
}
