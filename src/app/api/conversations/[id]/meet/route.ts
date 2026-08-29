import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    await connectToDatabase();

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: user._id,
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const meetUrl = "https://meet.google.com/new";

    // Create the special meeting message
    const message = await Message.create({
      conversation: conversationId,
      sender: user._id,
      content: "📹 Started a Google Meet: Click to join",
      type: "meet",
      meetUrl,
      readBy: [user._id],
    });

    // Update conversation metadata
    conversation.lastMessageAt = message.createdAt;
    conversation.lastMessagePreview = "📹 Google Meet Invitation";
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name username avatarUrl"
    );

    return NextResponse.json({
      success: true,
      meetUrl,
      message: populatedMessage,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating meet invitation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
