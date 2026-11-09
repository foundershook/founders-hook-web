import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import SettingsOtp from "@/models/SettingsOtp";
import { requireUser, tooManyRequests } from "@/lib/auth-guard";
import { rateLimit } from "@/lib/rate-limit";
import { signSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session-cookie";
import { validatePassword } from "@/lib/password-policy";
import { isValidEmail, isValidUsername } from "@/lib/validation";
import { audit } from "@/lib/audit";

const MAX_ATTEMPTS = 5;

const VerifySchema = z.object({
  action: z.enum(["email", "username", "password"]),
  otp: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit code."),
  newPassword: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    const user = auth.user;

    const limit = await rateLimit(`settings-verify:${user._id}`, 10, 15 * 60);
    if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

    const parsed = VerifySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request." },
        { status: 400 }
      );
    }

    const { action, otp, newPassword } = parsed.data;

    if (action === "password") {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }
    }

    await connectToDatabase();

    const record = await SettingsOtp.findOne({ userId: user._id, action });
    if (!record) {
      return NextResponse.json(
        { error: "Verification code expired or not found. Please request a new one." },
        { status: 404 }
      );
    }

    if (new Date() > record.expiresAt) {
      await SettingsOtp.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "This code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await SettingsOtp.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code." },
        { status: 429 }
      );
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      await SettingsOtp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      if (remaining <= 0) {
        await SettingsOtp.deleteOne({ _id: record._id });
      }
      return NextResponse.json(
        { error: `Incorrect code. ${Math.max(0, remaining)} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        { status: 400 }
      );
    }

    const dbUser = await User.findById(user._id).select("+passwordHash");
    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (action === "email") {
      if (!record.newData || !isValidEmail(record.newData)) {
        return NextResponse.json({ error: "Invalid email change request." }, { status: 400 });
      }
      const existing = await User.findOne({ email: record.newData });
      if (existing && String(existing._id) !== String(dbUser._id)) {
        return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
      }
      dbUser.email = record.newData;
      dbUser.emailVerified = true;
    } else if (action === "username") {
      if (!record.newData || !isValidUsername(record.newData)) {
        return NextResponse.json({ error: "Invalid username change request." }, { status: 400 });
      }
      const existing = await User.findOne({ username: record.newData });
      if (existing && String(existing._id) !== String(dbUser._id)) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
      }
      dbUser.username = record.newData;
    } else if (action === "password") {
      dbUser.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // Invalidate all existing sessions, then re-issue one for the current device.
    dbUser.sessionVersion = (dbUser.sessionVersion ?? 0) + 1;
    await dbUser.save();

    await SettingsOtp.deleteOne({ _id: record._id });

    const token = signSession({
      userId: dbUser._id.toString(),
      username: dbUser.username,
      sessionVersion: dbUser.sessionVersion,
    });

    const res = NextResponse.json(
      { success: true, message: `Your ${action} has been updated successfully.` },
      { status: 200 }
    );
    setSessionCookie(res, token);
    audit("auth.settings.updated", req, {
      userId: dbUser._id.toString(),
      action,
    });
    return res;
  } catch (error: unknown) {
    console.error("Settings OTP Verification Error:", error);
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: "This email or username is already in use." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
