import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import type { IUser } from "@/models/User";

export type RequireUserResult =
  | { user: IUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

/**
 * Single authorization primitive for route handlers.
 *
 * Always resolves identity from the signed session cookie — never from the
 * request body or client-supplied ids.
 */
export async function requireUser(): Promise<RequireUserResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}

export function forbidden(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message = "Invalid request"): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  const res = NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  );
  res.headers.set("Retry-After", String(retryAfterSeconds));
  return res;
}

/**
 * Returns true when `ownerId` refers to the given user.
 */
export function isOwner(user: IUser, ownerId: unknown): boolean {
  if (!ownerId) return false;
  return String(ownerId) === String(user._id);
}
