import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

// GET /api/follow/[userId]
// Returns { followers, following, isFollowing } for the given userId
// relative to the currently logged-in user.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    await connectToDatabase();

    const targetUser = await User.findById(userId)
      .select("followers following")
      .lean<{ followers: any[]; following: any[] }>();

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followersCount = targetUser.followers?.length ?? 0;
    const followingCount = targetUser.following?.length ?? 0;

    // Check if the logged-in user is following this user and vice-versa
    let isFollowing = false;
    let isFollowedBy = false;
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const currentId = (currentUser._id as any).toString();
      isFollowing = (targetUser.followers ?? []).some(
        (id: any) => id.toString() === currentId
      );
      isFollowedBy = (targetUser.following ?? []).some(
        (id: any) => id.toString() === currentId
      );
    }
    const isMutualFollow = isFollowing && isFollowedBy;

    return NextResponse.json({
      followers: followersCount,
      following: followingCount,
      isFollowing,
      isFollowedBy,
      isMutualFollow,
    });
  } catch (error) {
    console.error("Error fetching follow stats:", error);
    return NextResponse.json({ error: "Failed to fetch follow stats" }, { status: 500 });
  }
}
