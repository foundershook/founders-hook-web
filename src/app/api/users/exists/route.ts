import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/users/exists?ids=id1,id2
// Returns which of the requested user ids still exist. Used by the messaging
// UI to detect accounts that have been permanently deleted.
export async function GET(req: NextRequest) {
  try {
    const idsParam = req.nextUrl.searchParams.get("ids") || "";
    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.isValidObjectId(id))
      .slice(0, 100);

    if (ids.length === 0) {
      return NextResponse.json({ existing: [] });
    }

    await connectToDatabase();
    const users = await User.find({ _id: { $in: ids } })
      .select("_id")
      .lean<{ _id: mongoose.Types.ObjectId }[]>();

    return NextResponse.json({
      existing: users.map((user) => String(user._id)),
    });
  } catch (error) {
    console.error("Error checking user existence:", error);
    return NextResponse.json({ error: "Failed to check users" }, { status: 500 });
  }
}
