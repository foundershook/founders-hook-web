import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { signSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session-cookie";
import { rateLimit, getClientIp, normalizeKeyPart } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/auth-guard";
import { audit, hashIdentifier } from "@/lib/audit";

const LoginSchema = z.object({
  identifier: z.string().min(1).max(254),
  password: z.string().min(1).max(256),
});

// Used to keep timing roughly constant when the account does not exist.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8G8g0u5Zt4QvX8k7wG6n8b9Yw5o3Hu";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ipLimit = await rateLimit(`login-ip:${ip}`, 20, 60 * 60);
    if (!ipLimit.allowed) return tooManyRequests(ipLimit.retryAfterSeconds);

    const parsed = LoginSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter your username/email and password" },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const normalized = identifier.toLowerCase();

    const idLimit = await rateLimit(
      `login-id:${ip}:${normalizeKeyPart(normalized)}`,
      5,
      60
    );
    if (!idLimit.allowed) return tooManyRequests(idLimit.retryAfterSeconds);

    await connectToDatabase();

    const user = await User.findOne({
      $or: [{ email: normalized }, { username: normalized }],
    }).select("+passwordHash");

    if (!user) {
      // Normalize timing and avoid account enumeration.
      await bcrypt.compare(password, DUMMY_HASH);
      audit("auth.login.failed", req, {
        identifierHash: hashIdentifier(normalized),
        reason: "unknown_account",
      });
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      audit("auth.login.failed", req, {
        userId: user._id.toString(),
        reason: "bad_password",
      });
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    if (user.emailVerified === false) {
      audit("auth.login.blocked", req, {
        userId: user._id.toString(),
        reason: "email_unverified",
      });
      return NextResponse.json(
        { error: "Please verify your email before signing in." },
        { status: 403 }
      );
    }

    const token = signSession({
      userId: user._id.toString(),
      username: user.username,
      sessionVersion: user.sessionVersion ?? 0,
    });

    const res = NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        onboardingComplete: user.onboardingComplete,
      },
    });

    setSessionCookie(res, token);
    audit("auth.login.success", req, { userId: user._id.toString() });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
