import type { NextResponse } from "next/server";
import { SESSION_COOKIE } from "./auth-constants";
import { isProduction } from "./env";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: 0,
  });
}
