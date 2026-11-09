import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import SettingsOtp from "@/models/SettingsOtp";
import { sendSettingsChangeOtpEmail } from "@/lib/brevo";
import { requireUser, tooManyRequests } from "@/lib/auth-guard";
import { rateLimit } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password-policy";
import { isValidEmail, isValidUsername } from "@/lib/validation";

const RequestSchema = z.object({
  action: z.enum(["email", "username", "password"]),
  newData: z.string().max(254).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    const user = auth.user;

    const limit = await rateLimit(`settings-otp:${user._id}`, 5, 15 * 60);
    if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { action, newData } = parsed.data;

    await connectToDatabase();

    if (action === "email") {
      if (!isValidEmail(newData)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }
      const existing = await User.findOne({ email: newData.toLowerCase() });
      if (existing && String(existing._id) !== String(user._id)) {
        return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
      }
    }

    if (action === "username") {
      if (!isValidUsername(newData)) {
        return NextResponse.json({ error: "Please enter a valid username." }, { status: 400 });
      }
      const existing = await User.findOne({ username: newData.toLowerCase() });
      if (existing && String(existing._id) !== String(user._id)) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
      }
    }

    if (action === "password") {
      const passwordError = validatePassword(newData);
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await SettingsOtp.deleteMany({ userId: user._id, action });

    await SettingsOtp.create({
      userId: user._id,
      action,
      newData: newData ? newData.toLowerCase() : undefined,
      otpHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    // For an email change the code must be delivered to the NEW address, which
    // proves the caller controls it. Username/password changes are confirmed via
    // the current email address.
    const emailToSend = action === "email" ? newData.toLowerCase() : user.email;

    await sendSettingsChangeOtpEmail({
      to: emailToSend,
      action,
      otp,
    });

    return NextResponse.json({ success: true, message: "Verification code sent." });
  } catch (error) {
    console.error("Request OTP error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
