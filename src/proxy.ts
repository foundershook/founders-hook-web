import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-edge";
import { SESSION_COOKIE } from "@/lib/auth-constants";

// Pages that require a signed-in user. API routes enforce their own auth.
const PROTECTED = [
  "/onboarding",
  "/dashboard",
  "/waitlist-success",
  "/feed",
  "/founders-hook",
  "/profile",
  "/settings",
  "/messages",
];

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getRequestHost(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host") ||
    ""
  );
}

/**
 * Rejects cross-site state-changing requests. Combined with SameSite=Lax
 * cookies this closes the remaining CSRF gaps without needing per-route tokens.
 * Requests with no Origin/Referer (curl, server-to-server) are allowed because
 * they cannot carry a victim's browser cookies cross-site.
 */
function isSameOrigin(req: NextRequest): boolean {
  const allowedHost = getRequestHost(req);
  const appOrigin = process.env.APP_ORIGIN;

  const candidates = [req.headers.get("origin"), req.headers.get("referer")].filter(
    (value): value is string => Boolean(value)
  );

  if (candidates.length === 0) return true;

  for (const candidate of candidates) {
    if (candidate === "null") return false;
    try {
      const url = new URL(candidate);
      if (appOrigin && url.origin === appOrigin) return true;
      if (allowedHost && url.host === allowedHost) return true;
    } catch {
      return false;
    }
  }

  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (MUTATING_METHODS.has(req.method) && !isSameOrigin(req)) {
      return NextResponse.json(
        { error: "Cross-site request blocked." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/waitlist-success")) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/waitlist-success/:path*",
    "/feed/:path*",
    "/founders-hook/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/messages/:path*",
  ],
};
