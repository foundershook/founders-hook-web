import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";

/**
 * GET /api/notifications — fetch notifications for the current user
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const notifications = await Notification.find({ recipient: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ recipient: user._id, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications — mark notifications as read
 */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      await Notification.updateMany(
        { recipient: user._id, read: false },
        { $set: { read: true } }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, recipient: user._id },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
