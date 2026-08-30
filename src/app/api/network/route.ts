import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Startup from "@/models/Startup";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUser();
    const currentUserId = currentUser ? (currentUser._id as any).toString() : null;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    // Build search filter
    const searchFilter = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
            { bio: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    // Fetch all users
    const users = await User.find(searchFilter)
      .select("name username avatarUrl bio skills onboardingAnswers createdAt followers following")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<{
        _id: any;
        name: string;
        username: string;
        avatarUrl: string;
        bio: string;
        skills?: string[];
        createdAt: Date;
        followers: any[];
        following: any[];
        onboardingAnswers?: any;
      }[]>();

    // Find which users are founders (have at least one startup)
    const startups = await Startup.find({})
      .select("_id name tagline category icon founder")
      .lean();

    const founderIdSet = new Set(startups.map((s: any) => s.founder.toString()));

    const result = users.map((user) => {
      const followerCount = user.followers?.length ?? 0;
      const followingCount = user.following?.length ?? 0;
      const isFollowing = currentUserId
        ? (user.followers ?? []).some((id: any) => id.toString() === currentUserId)
        : false;
      const isCurrentUser = currentUserId ? user._id.toString() === currentUserId : false;
      const isFounder = founderIdSet.has(user._id.toString());

      // Get role from onboarding answers if available
      const answers = user.onboardingAnswers
        ? typeof user.onboardingAnswers === "object" && !(user.onboardingAnswers instanceof Map)
          ? user.onboardingAnswers
          : Object.fromEntries((user.onboardingAnswers as any) || [])
        : {};

      const userStartups = startups
        .filter((s: any) => s.founder.toString() === user._id.toString())
        .map((s: any) => ({
          _id: s._id.toString(),
          name: s.name,
          tagline: s.tagline,
          category: s.category,
          icon: s.icon,
        }));

      return {
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio || "",
        skills: user.skills || [],
        createdAt: user.createdAt,
        followerCount,
        followingCount,
        isFollowing,
        isCurrentUser,
        isFounder,
        startups: userStartups,
        role: answers["6a65a437a2b367178cacb7ea"] || null,
      };
    });

    return NextResponse.json({ users: result, total: result.length });
  } catch (error) {
    console.error("Error fetching network users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
