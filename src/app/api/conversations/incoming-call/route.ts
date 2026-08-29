import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ incomingCall: null });
    }

    await connectToDatabase();

    // Find all conversations the user is a part of
    const userConvos = await Conversation.find({ participants: user._id })
      .select("_id startup")
      .populate("startup", "name");

    if (!userConvos || userConvos.length === 0) {
      return NextResponse.json({ incomingCall: null });
    }

    const convoIds = userConvos.map((c) => c._id);

    // Look for meet messages in the last 3 minutes sent by SOMEONE ELSE
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    const latestMeetMessage = await Message.findOne({
      conversation: { $in: convoIds },
      sender: { $ne: user._id },
      type: "meet",
      meetStatus: { $ne: "ended" },
      createdAt: { $gte: threeMinutesAgo },
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name username avatarUrl");

    if (!latestMeetMessage) {
      return NextResponse.json({ incomingCall: null });
    }

    const parentConvo = userConvos.find(
      (c) => c._id.toString() === latestMeetMessage.conversation.toString()
    );

    return NextResponse.json({
      incomingCall: {
        messageId: latestMeetMessage._id.toString(),
        conversationId: latestMeetMessage.conversation.toString(),
        meetUrl: latestMeetMessage.meetUrl || "https://meet.google.com/new",
        sender: latestMeetMessage.sender,
        startupName: parentConvo?.startup?.name || "Founders Hook",
        createdAt: latestMeetMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error checking incoming call:", error);
    return NextResponse.json({ incomingCall: null }, { status: 500 });
  }
}
