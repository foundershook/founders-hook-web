import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import { requireUser } from "@/lib/auth-guard";

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  await connectToDatabase();

  const startups = await Startup.find({ founder: user._id })
    .sort({ createdAt: -1 })
    .populate("founder", "name username avatarUrl")
    .populate("members", "name username avatarUrl")
    .lean();

  return NextResponse.json({ startups });
}
