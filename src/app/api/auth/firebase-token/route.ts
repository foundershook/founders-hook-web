import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { rateLimit } from "@/lib/rate-limit";
import { createFirebaseCustomToken, isFirebaseAdminConfigured } from "@/lib/firebase-token";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    const userId = auth.user._id.toString();

    const limit = await rateLimit(`firebase-token:${userId}`, 30, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: "Firebase chat authentication is not configured." },
        { status: 503 }
      );
    }

    const token = await createFirebaseCustomToken(userId);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Firebase token error:", error);
    return NextResponse.json(
      { error: "Unable to authenticate chat." },
      { status: 500 }
    );
  }
}
