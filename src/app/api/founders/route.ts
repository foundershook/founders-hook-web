import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get the logged-in user so we can compute isFollowing per founder
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser ? (currentUser._id as any).toString() : null;

    // 1. Find all distinct founder ObjectIds from the Startup collection
    const founderIds = await Startup.distinct("founder");

    if (!founderIds || founderIds.length === 0) {
      return NextResponse.json({ founders: [] });
    }

    // 2. Query users collection matching those founder IDs (include social arrays)
    const founders = await User.find({ _id: { $in: founderIds } })
      .select("name username avatarUrl bio skills onboardingAnswers createdAt followers following")
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
      }[]>();

    // 3. Query startups associated with these founders
    const startups = await Startup.find({ founder: { $in: founderIds } })
      .select("_id name tagline category icon coverImage founder")
      .lean();

    // 4. Combine founders with their published startups + follow data
    const result = founders.map((founder) => {
      const founderStartups = startups.filter(
        (s) => s.founder.toString() === founder._id.toString()
      );

      const followerCount = founder.followers?.length ?? 0;
      const followingCount = founder.following?.length ?? 0;
      const isFollowing = currentUserId
        ? (founder.followers ?? []).some((id: any) => id.toString() === currentUserId)
        : false;

      return {
        _id: founder._id.toString(),
        name: founder.name,
        username: founder.username,
        avatarUrl: founder.avatarUrl,
        bio: founder.bio || "",
        skills: founder.skills || [],
        createdAt: founder.createdAt,
        followerCount,
        followingCount,
        isFollowing,
        isCurrentUser: currentUserId ? founder._id.toString() === currentUserId : false,
        startups: founderStartups.map((s: any) => ({
          _id: s._id.toString(),
          name: s.name,
          tagline: s.tagline,
          category: s.category,
          icon: s.icon,
          coverImage: s.coverImage,
        })),
      };
    });

    return NextResponse.json({ founders: result });
  } catch (error) {
    console.error("Error fetching founders:", error);
    return NextResponse.json({ error: "Failed to fetch founders" }, { status: 500 });
  }
}
