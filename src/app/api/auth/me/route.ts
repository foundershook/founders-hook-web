import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import Application from "@/models/Application";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  await connectToDatabase();
  const founderCheck = await Startup.exists({ founder: user._id });
  const applicationCheck = await Application.exists({ applicant: user._id });

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email || "",
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl || "",
      bio: user.bio || "",
      skills: user.skills || [],
      onboardingAnswers: user.onboardingAnswers || {},
      onboardingComplete: user.onboardingComplete,
      isFounder: !!founderCheck,
      hasApplied: !!applicationCheck,
    },
  });
}
