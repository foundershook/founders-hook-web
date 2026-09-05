import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Startup from "@/models/Startup";
import { getCurrentUser } from "@/lib/auth";

// GET /api/users/[userId]
// Returns full public profile data for any user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    await connectToDatabase();

    const currentUser = await getCurrentUser();
    const currentUserId = currentUser ? (currentUser._id as any).toString() : null;

    const user = await User.findById(userId)
      .select("name username avatarUrl bannerUrl bio skills onboardingAnswers createdAt followers following")
      .lean<{
        _id: any;
        name: string;
        username: string;
        avatarUrl: string;
        bannerUrl?: string;
        bio: string;
        skills?: string[];
        onboardingAnswers?: any;
        createdAt: Date;
        followers: any[];
        following: any[];
      }>();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get startups for this user
    const startups = await Startup.find({ founder: userId })
      .select("_id name tagline category icon coverImage members openRoles featured")
      .lean();

    const followerCount = user.followers?.length ?? 0;
    const followingCount = user.following?.length ?? 0;
    const isFollowing = currentUserId
      ? (user.followers ?? []).some((id: any) => id.toString() === currentUserId)
      : false;
    const isCurrentUser = currentUserId ? user._id.toString() === currentUserId : false;
    const isFounder = startups.length > 0;

    // Normalize onboarding answers
    let onboardingAnswers: Record<string, any> = {};
    if (user.onboardingAnswers) {
      if (user.onboardingAnswers instanceof Map) {
        onboardingAnswers = Object.fromEntries(user.onboardingAnswers.entries());
      } else if (typeof user.onboardingAnswers === "object") {
        onboardingAnswers = JSON.parse(JSON.stringify(user.onboardingAnswers));
      }
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bannerUrl: user.bannerUrl || "",
        bio: user.bio || "",
        skills: user.skills || [],
        createdAt: user.createdAt,
        followerCount,
        followingCount,
        isFollowing,
        isCurrentUser,
        isFounder,
        onboardingAnswers,
        startups: startups.map((s: any) => ({
          _id: s._id.toString(),
          name: s.name,
          tagline: s.tagline,
          category: s.category,
          icon: s.icon,
          coverImage: s.coverImage,
          featured: s.featured || false,
          members: (s.members || []).map((m: any) => ({
            _id: m._id?.toString() || "",
            name: m.name || "",
            avatarUrl: m.avatarUrl || "",
          })),
          openRoles: (s.openRoles || []).map((r: any) => ({
            _id: r._id?.toString() || "",
            title: r.title || "",
            type: r.type || "",
            description: r.description || "",
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
