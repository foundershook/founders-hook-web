import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; 
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    let { userId, bio, profilePic } = body;

    if (!userId) {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        userId = currentUser._id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          ...(bio !== undefined && { bio }),
          // FIX: Map the incoming profilePic to the database's avatarUrl field
          ...(profilePic !== undefined && { avatarUrl: profilePic }) 
        }
      },
      { new: true } 
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Error updating profile in MongoDB:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}