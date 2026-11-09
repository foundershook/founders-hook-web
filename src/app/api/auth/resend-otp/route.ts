import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import OtpVerification from "@/models/OtpVerification";
import { sendOtpEmail } from "@/lib/brevo";
import { rateLimit, getClientIp, normalizeKeyPart } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/auth-guard";

const ResendSchema = z.object({
  email: z.string().email().max(254),
});

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const parsed = ResendSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const lowerEmail = parsed.data.email.toLowerCase();
    const ip = getClientIp(req);

    const limit = await rateLimit(
      `resend-otp:${ip}:${normalizeKeyPart(lowerEmail)}`,
      3,
      15 * 60
    );
    if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

    await connectToDatabase();

    const record = await OtpVerification.findOne({ email: lowerEmail });

    if (!record) {
      return NextResponse.json(
        { error: "Session expired. Please sign up again." },
        { status: 404 }
      );
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await OtpVerification.updateOne(
      { _id: record._id },
      { $set: { otpHash, expiresAt, attempts: 0 } }
    );

    await sendOtpEmail({ to: lowerEmail, otp });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to resend code. Please try again." },
      { status: 500 }
    );
  }
}
