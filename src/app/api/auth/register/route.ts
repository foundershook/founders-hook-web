import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import { sendOtpEmail } from "@/lib/brevo";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/auth-guard";
import { validatePassword } from "@/lib/password-policy";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name is too short").max(60),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24)
    .regex(
      /^[a-zA-Z0-9_.,@]+$/,
      "Only letters, numbers, and special characters (.,_@) are allowed"
    ),
  email: z.string().email("Please enter a valid email address").max(254),
  password: z.string().min(1, "Password is required").max(256),
});

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function generateVipCode(username: string) {
  const prefix = username.substring(0, 4).toUpperCase();
  const randomString = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `EARLY-${prefix}-${randomString}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = await rateLimit(`register:${ip}`, 3, 60);
    if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid input provided.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const passwordError = validatePassword(parsed.data.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const { name, username, email, password } = parsed.data;
    const lowerEmail = email.toLowerCase();
    const lowerUsername = username.toLowerCase();

    await connectToDatabase();

    const existingUser = await User.findOne({
      $or: [{ email: lowerEmail }, { username: lowerUsername }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username is already in use." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const vipCode = generateVipCode(username);
    const avatarUrl = `https://picsum.photos/seed/${encodeURIComponent(username)}/200/200`;

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await OtpVerification.findOneAndUpdate(
      { email: lowerEmail },
      {
        email: lowerEmail,
        otpHash,
        formData: {
          name,
          username: lowerUsername,
          passwordHash,
          avatarUrl,
          vipCode,
        },
        attempts: 0,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    await sendOtpEmail({ to: lowerEmail, otp });

    return NextResponse.json(
      { ok: true, email: lowerEmail, message: "Verification code sent to your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
