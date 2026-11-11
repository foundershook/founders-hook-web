import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import { signSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session-cookie";
import { rateLimit, getClientIp, normalizeKeyPart } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/auth-guard";
import { audit } from "@/lib/audit";

const MAX_ATTEMPTS = 5;

const VerifySchema = z.object({
  email: z.string().email().max(254),
  otp: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit code."),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = VerifySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please enter a valid 6-digit code." },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;
    const lowerEmail = email.toLowerCase();
    const ip = getClientIp(req);

    const limit = await rateLimit(
      `verify-otp:${ip}:${normalizeKeyPart(lowerEmail)}`,
      10,
      15 * 60
    );
    if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

    await connectToDatabase();

    const record = await OtpVerification.findOne({ email: lowerEmail });

    if (!record) {
      return NextResponse.json(
        { error: "Verification code expired or not found. Please sign up again." },
        { status: 404 }
      );
    }

    if (new Date() > record.expiresAt) {
      await OtpVerification.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "This code has expired. Please sign up again." },
        { status: 410 }
      );
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await OtpVerification.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please sign up again." },
        { status: 429 }
      );
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);

    if (!isValid) {
      await OtpVerification.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      if (remaining <= 0) {
        await OtpVerification.deleteOne({ _id: record._id });
      }
      return NextResponse.json(
        { error: `Incorrect code. ${Math.max(0, remaining)} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        { status: 400 }
      );
    }

    const existing = await User.findOne({
      $or: [{ email: record.email }, { username: record.formData.username }],
    });
    if (existing) {
      await OtpVerification.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "Account already exists. Please log in." },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name: record.formData.name,
      username: record.formData.username,
      email: record.email,
      passwordHash: record.formData.passwordHash,
      avatarUrl: record.formData.avatarUrl,
      isEarlyAccess: true,
      vipCode: record.formData.vipCode,
      emailVerified: true,
      sessionVersion: 0,
      tncAccepted: record.formData.tncAccepted === true,
      tncVersion: record.formData.tncVersion,
    });

    await OtpVerification.deleteOne({ _id: record._id });

    const token = signSession({
      userId: newUser._id.toString(),
      username: newUser.username,
      sessionVersion: newUser.sessionVersion ?? 0,
    });

    const res = NextResponse.json(
      {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          onboardingComplete: newUser.onboardingComplete,
          vipCode: newUser.vipCode,
        },
      },
      { status: 201 }
    );

    setSessionCookie(res, token);
    audit("auth.register.verified", req, {
      userId: newUser._id.toString(),
    });
    return res;
  } catch (error) {
    console.error("OTP Verification Error:", error);
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email or username already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
