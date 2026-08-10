import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-edge";
import { SESSION_COOKIE } from "@/lib/auth-constants";

// Added /feed to the protected routes array
const PROTECTED = ["/onboarding", "/dashboard", "/waitlist-success", "/feed", "/founders-hook"];

// Define who gets to bypass the waitlist and see the app
// Replace these with the exact username(s) you register with
const ADMIN_USERNAMES = ["shubham", "adwait","saraswat"];

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

  // Developer-only access block for the Feed
  if (pathname.startsWith("/feed")) {
    const userLower = session.username?.toLowerCase() || "";
    const isAllowed = ADMIN_USERNAMES.some((u) => u.toLowerCase() === userLower);
    if (!isAllowed) {
      // If a normal user tries to access /feed, bounce them back to the home page
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
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