import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { requireUser } from "@/lib/auth-guard";

function getTargetId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const value = (body as { targetUserId?: unknown }).targetUserId;
  if (typeof value !== "string" || !mongoose.isValidObjectId(value)) return null;
  return value;
}

// POST /api/follow — follow a user
export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    const currentId = auth.user._id.toString();

    const targetUserId = getTargetId(await req.json());
    if (!targetUserId) {
      return NextResponse.json({ error: "A valid targetUserId is required" }, { status: 400 });
    }
    if (currentId === targetUserId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    await connectToDatabase();

    const target = await User.findById(targetUserId).select("_id");
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Promise.all([
      User.findByIdAndUpdate(currentId, { $addToSet: { following: targetUserId } }),
      User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentId } }),
    ]);

    return NextResponse.json({ success: true, action: "followed" });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 });
  }
}

// DELETE /api/follow — unfollow a user
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    const currentId = auth.user._id.toString();

    const targetUserId = getTargetId(await req.json());
    if (!targetUserId) {
      return NextResponse.json({ error: "A valid targetUserId is required" }, { status: 400 });
    }

    await connectToDatabase();

    await Promise.all([
      User.findByIdAndUpdate(currentId, { $pull: { following: targetUserId } }),
      User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentId } }),
    ]);

    return NextResponse.json({ success: true, action: "unfollowed" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 });
  }
}
