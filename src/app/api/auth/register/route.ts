import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import { sendOtpEmail } from "@/lib/brevo";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name is too short").max(60),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24)
    .regex(/^[a-zA-Z0-9_.,@]+$/, "Only letters, numbers, and special characters (.,_@) are allowed"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Helper function to generate a 6-digit numeric OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to generate a unique, readable VIP code
function generateVipCode(username: string) {
  const prefix = username.substring(0, 4).toUpperCase();
  const randomString = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `EARLY-${prefix}-${randomString}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid input provided.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, username, email, password } = parsed.data;
    const lowerEmail = email.toLowerCase();
    const lowerUsername = username.toLowerCase();

    await connectToDatabase();

    const existingUser = await User.findOne({
      $or: [{ email: lowerEmail }, { username: lowerUsername }],
    });

    if (existingUser) {
      const isEmailTaken = existingUser.email === lowerEmail;
      const field = isEmailTaken ? "Email" : "Username";
      return NextResponse.json({ error: `${field} is already in use.` }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const vipCode = generateVipCode(username);
    const avatarUrl = `https://picsum.photos/seed/${encodeURIComponent(username)}/200/200`;

    // Generate 6-digit OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 8);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store or update pending verification record in database
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

    // Send OTP email
    await sendOtpEmail({ to: lowerEmail, otp });

    return NextResponse.json(
      { ok: true, email: lowerEmail, message: "Verification code sent to your email." },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Registration Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json({ error: `Database Validation Error: ${messages.join(", ")}` }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json({ error: "A user with this email or username already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "An unexpected error occurred during registration. Please try again." }, { status: 500 });
  }
}