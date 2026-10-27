import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-edge";
import { SESSION_COOKIE } from "@/lib/auth-constants";

// Added /feed to the protected routes array
const PROTECTED = ["/onboarding", "/dashboard", "/waitlist-success", "/feed", "/founders-hook"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect old VIP code waitlist page directly to feed
  if (pathname.startsWith("/waitlist-success")) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Ensure /feed is included in the matcher
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/waitlist-success/:path*",
    "/feed/:path*",
    "/founders-hook/:path*"
  ],
};