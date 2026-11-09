import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { requireUser } from "@/lib/auth-guard";
import { cleanString, cleanStringArray, isSafeHttpsUrl } from "@/lib/validation";

export async function PUT(req: Request) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    const currentUser = auth.user;

    const body = await req.json();

    // Identity always comes from the session. Any `userId` in the body is
    // ignored on purpose so a caller can never mutate another account.
    const update: Record<string, unknown> = {};

    if (body.bio !== undefined) {
      const bio = cleanString(body.bio, 1200);
      if (bio === null) {
        return NextResponse.json({ error: "Bio is too long." }, { status: 400 });
      }
      update.bio = bio;
    }

    if (body.profilePic !== undefined) {
      if (!isSafeHttpsUrl(body.profilePic)) {
        return NextResponse.json({ error: "Invalid profile picture URL." }, { status: 400 });
      }
      update.avatarUrl = body.profilePic;
    }

    if (body.bannerUrl !== undefined) {
      if (body.bannerUrl !== "" && !isSafeHttpsUrl(body.bannerUrl)) {
        return NextResponse.json({ error: "Invalid banner URL." }, { status: 400 });
      }
      update.bannerUrl = body.bannerUrl;
    }

    if (body.skills !== undefined) {
      const skills = cleanStringArray(body.skills, 50, 40);
      if (skills === null) {
        return NextResponse.json({ error: "Invalid skills list." }, { status: 400 });
      }
      update.skills = skills;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: update },
      { new: true }
    )
      .select("_id name username email avatarUrl bannerUrl bio skills")
      .lean<{
        _id: unknown;
        name: string;
        username: string;
        email: string;
        avatarUrl: string;
        bannerUrl?: string;
        bio: string;
        skills: string[];
      }>();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: String(updatedUser._id),
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        bannerUrl: updatedUser.bannerUrl || "",
        bio: updatedUser.bio || "",
        skills: updatedUser.skills || [],
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
