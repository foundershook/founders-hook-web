import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  await connectToDatabase();
  const founderCheck = await Startup.exists({ founder: user._id });

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio || "",
      onboardingAnswers: user.onboardingAnswers || {},
      onboardingComplete: user.onboardingComplete,
      isFounder: !!founderCheck,
    },
  });
}
