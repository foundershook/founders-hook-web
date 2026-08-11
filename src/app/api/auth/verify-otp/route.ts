import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp || typeof otp !== "string" || otp.length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit code." }, { status: 400 });
    }

    await connectToDatabase();

    // Find the pending OTP record
    const record = await OtpVerification.findOne({ email: email.toLowerCase() });

    if (!record) {
      return NextResponse.json(
        { error: "Verification code expired or not found. Please sign up again." },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > record.expiresAt) {
      await OtpVerification.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "This code has expired. Please sign up again." },
        { status: 410 }
      );
    }

    // Check attempt limit
    if (record.attempts >= MAX_ATTEMPTS) {
      await OtpVerification.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please sign up again." },
        { status: 429 }
      );
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, record.otpHash);

    if (!isValid) {
      // Increment attempt counter
      await OtpVerification.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      return NextResponse.json(
        { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        { status: 400 }
      );
    }

    // OTP is correct — check one more time that user hasn't been created in the meantime
    const existing = await User.findOne({
      $or: [
        { email: record.email },
        { username: record.formData.username },
      ],
    });
    if (existing) {
      await OtpVerification.deleteOne({ _id: record._id });
      return NextResponse.json({ error: "Account already exists. Please log in." }, { status: 409 });
    }

    // Create the user now that email is verified
    const newUser = await User.create({
      name: record.formData.name,
      username: record.formData.username,
      email: record.email,
      passwordHash: record.formData.passwordHash,
      avatarUrl: record.formData.avatarUrl,
      isEarlyAccess: true,
      vipCode: record.formData.vipCode,
      emailVerified: true,
    });

    // Clean up the OTP record
    await OtpVerification.deleteOne({ _id: record._id });

    // Sign session token — same as login/register
    const token = signSession({
      userId: newUser._id.toString(),
      username: newUser.username,
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

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;

  } catch (error: any) {
    console.error("OTP Verification Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A user with this email or username already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
