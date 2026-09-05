import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import ResetToken from "@/models/ResetToken";
import { sendPasswordResetSuccessEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { identifier, otp, newPassword } = await req.json();

    if (!identifier || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    await connectToDatabase();

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid identifier or verification code" }, { status: 400 });
    }

    // Hash the incoming OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Find valid OTP for this email
    const resetTokenDoc = await ResetToken.findOne({
      email: user.email,
      otpHash: hashedOtp,
      expiresAt: { $gt: new Date() }, // Ensure not expired
    });

    if (!resetTokenDoc) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.passwordHash = passwordHash;
    await user.save();

    // Delete the used OTP
    await ResetToken.deleteOne({ _id: resetTokenDoc._id });

    // Send success email
    await sendPasswordResetSuccessEmail(user.email);

    return NextResponse.json({ success: true, message: "Password has been successfully reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "An error occurred while resetting your password" }, { status: 500 });
  }
}
