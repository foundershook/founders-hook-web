import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import ResetToken from "@/models/ResetToken";
import { sendPasswordResetEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Username or email is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Find by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });
    
    // For security reasons, we do not reveal if a user exists or not.
    if (!user) {
      return NextResponse.json({ success: true, message: "If that account exists, we have sent a verification code to its email." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Delete any existing tokens for this user to invalidate them
    await ResetToken.deleteMany({ email: user.email });

    // Save token to DB, expires in 15 minutes
    await ResetToken.create({
      email: user.email,
      otpHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Send email with OTP
    await sendPasswordResetEmail({
      to: user.email,
      otp,
    });

    return NextResponse.json({ success: true, message: "If that account exists, we have sent a verification code to its email.", email: user.email });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
}
