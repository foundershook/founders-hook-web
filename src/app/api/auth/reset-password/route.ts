import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import ResetToken from "@/models/ResetToken";
import { sendPasswordResetSuccessEmail } from "@/lib/brevo";
import { rateLimit, getClientIp, normalizeKeyPart } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/auth-guard";
import { validatePassword } from "@/lib/password-policy";
import { audit, hashIdentifier } from "@/lib/audit";

const MAX_ATTEMPTS = 5;

const ResetSchema = z.object({
  identifier: z.string().min(1).max(254),
  otp: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit code."),
  newPassword: z.string().max(256),
});

export async function POST(req: Request) {
  try {
    const parsed = ResetSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Missing required fields" },
        { status: 400 }
      );
    }

    const { identifier, otp, newPassword } = parsed.data;

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const ip = getClientIp(req);
    const normalizedIdentifier = identifier.toLowerCase();

    const limit = await rateLimit(
      `reset-password:${ip}:${normalizeKeyPart(normalizedIdentifier)}`,
      10,
      15 * 60
    );
    if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

    await connectToDatabase();

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    });

    const invalidResponse = NextResponse.json(
      { error: "Invalid or expired verification code" },
      { status: 400 }
    );

    if (!user) return invalidResponse;

    const resetTokenDoc = await ResetToken.findOne({ email: user.email });

    if (!resetTokenDoc) return invalidResponse;

    if (new Date() > resetTokenDoc.expiresAt) {
      await ResetToken.deleteOne({ _id: resetTokenDoc._id });
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    if (resetTokenDoc.attempts >= MAX_ATTEMPTS) {
      await ResetToken.deleteOne({ _id: resetTokenDoc._id });
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code." },
        { status: 429 }
      );
    }

    const isValid = await bcrypt.compare(otp, resetTokenDoc.otpHash);
    if (!isValid) {
      await ResetToken.updateOne(
        { _id: resetTokenDoc._id },
        { $inc: { attempts: 1 } }
      );
      const remaining = MAX_ATTEMPTS - (resetTokenDoc.attempts + 1);
      if (remaining <= 0) {
        await ResetToken.deleteOne({ _id: resetTokenDoc._id });
      }
      audit("auth.password.reset_failed", req, {
        identifierHash: hashIdentifier(identifier),
        reason: "bad_otp",
      });
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    // Invalidate every existing session for this account.
    user.sessionVersion = (user.sessionVersion ?? 0) + 1;
    await user.save();

    await ResetToken.deleteMany({ email: user.email });

    await sendPasswordResetSuccessEmail(user.email);

    audit("auth.password.reset", req, {
      userId: user._id.toString(),
    });

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
