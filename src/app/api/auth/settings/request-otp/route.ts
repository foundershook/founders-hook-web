import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import SettingsOtp from "@/models/SettingsOtp";
import { sendSettingsChangeOtpEmail } from "@/lib/brevo";
import { getSession } from "@/lib/auth"; // Assuming getSession is available in auth or we need to extract from headers

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("founders_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Simple mock or use jsonwebtoken. In typical next apps, we might use jose or jwt
    // We will find user by fetching /api/auth/me equivalent or importing standard auth check
    // Since getSession logic might be complex, let's use the DB directly if we know how tokens are signed.
    
    // Instead of duplicating session logic, let's just decode the JWT (from /lib/auth if possible)
    const { verifySession } = await import("@/lib/auth");
    const session = await verifySession(sessionCookie);
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, newData } = await req.json();

    if (!["email", "username", "password"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validation
    if (action === "email" && newData) {
      const existing = await User.findOne({ email: newData.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
      }
    }

    if (action === "username" && newData) {
      const existing = await User.findOne({ username: newData.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Delete existing unverified OTPs for this user & action
    await SettingsOtp.deleteMany({ userId: user._id, action });

    // Save token to DB, expires in 15 minutes
    await SettingsOtp.create({
      userId: user._id,
      action,
      newData: newData ? newData.toLowerCase() : undefined,
      otpHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Send email.
    // If changing email -> OTP goes to old email
    // If changing username -> OTP goes to current email
    // If changing password -> OTP goes to current email
    const emailToSend = user.email;

    await sendSettingsChangeOtpEmail({
      to: emailToSend,
      action,
      otp,
    });

    return NextResponse.json({ success: true, message: "Verification code sent." });
  } catch (error) {
    console.error("Request OTP error:", error);
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
}
