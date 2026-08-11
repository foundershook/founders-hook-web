import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import OtpVerification from "@/models/OtpVerification";
import { sendOtpEmail } from "@/lib/brevo";

// Generate a 6-digit numeric OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await connectToDatabase();

    const record = await OtpVerification.findOne({ email: email.toLowerCase() });

    if (!record) {
      return NextResponse.json(
        { error: "Session expired. Please sign up again." },
        { status: 404 }
      );
    }

    // Generate a fresh OTP and reset the expiry + attempts
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 8);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await OtpVerification.updateOne(
      { _id: record._id },
      { $set: { otpHash, expiresAt, attempts: 0 } }
    );

    // Send fresh OTP email
    await sendOtpEmail({ to: email, otp });

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error: any) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to resend code. Please try again." },
      { status: 500 }
    );
  }
}
