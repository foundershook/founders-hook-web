import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Application from "@/models/Application";
import Startup from "@/models/Startup";
import User from "@/models/User"; // Ensure registered

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // Find startups where user is founder
    const myStartups = await Startup.find({ founder: user._id });
    const myStartupIds = myStartups.map((s) => s._id);

    // Sync missing conversations for applications
    const apps = await Application.find({
      $or: [{ applicant: user._id }, { startup: { $in: myStartupIds } }],
    });

    for (const app of apps) {
      const exists = await Conversation.exists({ application: app._id });
      if (!exists) {
        const startup = await Startup.findById(app.startup);
        if (startup) {
          // Avoid duplicate participants if founder is applying to their own startup (edge case)
          const participants = [app.applicant.toString()];
          if (startup.founder.toString() !== app.applicant.toString()) {
            participants.push(startup.founder.toString());
          }
          await Conversation.create({
            participants,
            type: "application",
            application: app._id,
            startup: startup._id,
          });
        }
      }
    }

    // Fetch all conversations for the user
    const conversations = await Conversation.find({ participants: user._id })
      .populate("participants", "name username avatarUrl")
      .populate({
        path: "application",
        populate: [
          { path: "startup", select: "name icon" },
          { path: "applicant", select: "name username avatarUrl email mobile gender experience resumeUrl resumeName message status createdAt" },
        ],
      })
      .populate("startup", "name icon")
      .sort({ lastMessageAt: -1 });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
