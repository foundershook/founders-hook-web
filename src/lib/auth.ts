import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "./mongodb";
import User, { IUser } from "@/models/User";
import { SESSION_COOKIE } from "./auth-constants";
import { getJwtSecret } from "./env";

export { SESSION_COOKIE };

export interface SessionPayload {
  userId: string;
  username: string;
  sessionVersion?: number;
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

/** Reads the session cookie (server components / route handlers) and returns the logged-in user, or null. */
export async function getCurrentUser(): Promise<IUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const payload = verifySession(token);
  if (!payload) return null;

  await connectToDatabase();
  const user = await User.findById(payload.userId).select("-passwordHash").lean<IUser>();
  if (!user) return null;

  // Revoke tokens issued before the last credential change.
  const tokenVersion = payload.sessionVersion ?? 0;
  const currentVersion = user.sessionVersion ?? 0;
  if (tokenVersion !== currentVersion) return null;

  return user;
}