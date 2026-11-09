import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Application from "@/models/Application";
import Startup from "@/models/Startup";
import ConversationDeletion from "@/models/ConversationDeletion";
import { requireUser, forbidden } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

// DELETE /api/conversations/[id]
// Records that a conversation was intentionally deleted so the application
// sync does not recreate it on the next Messages page load.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const { id } = await params;
    const conversationId = decodeURIComponent(id);

    // Only application conversations are re-created from MongoDB.
    if (!conversationId.startsWith("app_")) {
      return NextResponse.json({ ok: true });
    }

    const applicationId = conversationId.slice("app_".length);
    if (!mongoose.isValidObjectId(applicationId)) {
      return NextResponse.json({ ok: true });
    }

    await connectToDatabase();

    const application = await Application.findById(applicationId)
      .select("applicant startup")
      .lean<{ applicant: mongoose.Types.ObjectId; startup: mongoose.Types.ObjectId }>();

    if (application) {
      const startup = await Startup.findById(application.startup)
        .select("founder")
        .lean<{ founder: mongoose.Types.ObjectId }>();

      const isParticipant =
        String(application.applicant) === String(auth.user._id) ||
        String(startup?.founder) === String(auth.user._id);

      if (!isParticipant) return forbidden();
    }

    await ConversationDeletion.updateOne(
      { conversationId },
      { $setOnInsert: { conversationId, deletedBy: auth.user._id } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Conversation deletion error:", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting the conversation." },
      { status: 500 }
    );
  }
}
