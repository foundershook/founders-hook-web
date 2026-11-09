import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { requireUser } from "@/lib/auth-guard";

// Schema now just checks that the body is an object of key/value pairs
const DynamicOnboardingSchema = z.record(z.string(), z.any());

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await req.json();
    const parsed = DynamicOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await User.findByIdAndUpdate(
      user._id,
      { 
        onboardingAnswers: parsed.data, 
        onboardingComplete: true 
      },
      { new: true } // Returns the updated document
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Onboarding submission error:", error);
    return NextResponse.json({ error: "Something went wrong saving your answers" }, { status: 500 });
  }
}