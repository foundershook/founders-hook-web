import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import SettingsOtp from "@/models/SettingsOtp";
import { getCurrentUser } from "@/lib/auth";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, otp, newPassword } = await req.json();

    if (!["email", "username", "password"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit code." }, { status: 400 });
    }

    if (action === "password") {
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
      }
    }

    await connectToDatabase();

    // Find the pending OTP record for this user and action
    const record = await SettingsOtp.findOne({ userId: user._id, action });

    if (!record) {
      return NextResponse.json(
        { error: "Verification code expired or not found. Please request a new one." },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > record.expiresAt) {
      await SettingsOtp.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "This code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Check attempt limit
    if (record.attempts >= MAX_ATTEMPTS) {
      await SettingsOtp.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code." },
        { status: 429 }
      );
    }

    // Verify OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    
    if (record.otpHash !== hashedOtp) {
      // Increment attempt counter
      await SettingsOtp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      return NextResponse.json(
        { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        { status: 400 }
      );
    }

    // OTP is valid. Now apply the change to the user.
    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (action === "email") {
      const existing = await User.findOne({ email: record.newData });
      if (existing) {
        return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
      }
      dbUser.email = record.newData;
    } else if (action === "username") {
      const existing = await User.findOne({ username: record.newData });
      if (existing) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
      }
      dbUser.username = record.newData;
    } else if (action === "password") {
      const salt = await bcrypt.genSalt(10);
      dbUser.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await dbUser.save();
    
    // Clean up the OTP record
    await SettingsOtp.deleteOne({ _id: record._id });

    return NextResponse.json(
      { success: true, message: `Your ${action} has been updated successfully.` },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Settings OTP Verification Error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "This email or username is already in use." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
