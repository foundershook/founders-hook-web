import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Startup from "@/models/Startup";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUser();
    const currentUserId = currentUser
      ? (currentUser._id as any).toString()
      : null;

    const { searchParams } = new URL(req.url);
    const skillsParam = searchParams.get("skills") || "";

    if (!skillsParam.trim()) {
      return NextResponse.json({ users: [], total: 0 });
    }

    // Split comma-separated skills and build a case-insensitive regex filter
    const skillsArray = skillsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (skillsArray.length === 0) {
      return NextResponse.json({ users: [], total: 0 });
    }

    // Match users whose skills array contains at least one of the requested
    // skills (case-insensitive via $regex).
    const regexPatterns = skillsArray.map(
      (skill) => new RegExp(`^${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
    );

    const users = await User.find({
      skills: { $in: regexPatterns },
    })
      .select(
        "name username avatarUrl bio skills createdAt followers following"
      )
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<
        {
          _id: any;
          name: string;
          username: string;
          avatarUrl: string;
          bio: string;
          skills?: string[];
          createdAt: Date;
          followers: any[];
          following: any[];
        }[]
      >();

    // Check which users are founders (have at least one startup)
    const userIds = users.map((u) => u._id);
    const startups = await Startup.find({ founder: { $in: userIds } })
      .select("_id name founder")
      .lean();
    const founderIdSet = new Set(
      startups.map((s: any) => s.founder.toString())
    );

    const result = users.map((user) => {
      const followerCount = user.followers?.length ?? 0;
      const followingCount = user.following?.length ?? 0;
      const isFollowing = currentUserId
        ? (user.followers ?? []).some(
            (id: any) => id.toString() === currentUserId
          )
        : false;
      const isCurrentUser = currentUserId
        ? user._id.toString() === currentUserId
        : false;
      const isFounder = founderIdSet.has(user._id.toString());

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
      };
    });

    return NextResponse.json({ users: result, total: result.length });
  } catch (error) {
    console.error("Error fetching team matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
