import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import ResetToken from "@/models/ResetToken";
import { sendPasswordResetEmail } from "@/lib/brevo";
import { rateLimit, getClientIp, normalizeKeyPart } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/auth-guard";

const ForgotSchema = z.object({
  identifier: z.string().min(1).max(254),
});

const GENERIC_MESSAGE =
  "If that account exists, we have sent a verification code to its email.";

export async function POST(req: Request) {
  try {
    const parsed = ForgotSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Username or email is required" },
        { status: 400 }
      );
    }

    const identifier = parsed.data.identifier.toLowerCase();
    const ip = getClientIp(req);

    const limit = await rateLimit(
      `forgot-password:${ip}:${normalizeKeyPart(identifier)}`,
      3,
      15 * 60
    );
    if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

    await connectToDatabase();

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    // Always return the same response to avoid account enumeration.
    if (!user) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await ResetToken.deleteMany({ email: user.email });

    await ResetToken.create({
      email: user.email,
      otpHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendPasswordResetEmail({ to: user.email, otp });

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
