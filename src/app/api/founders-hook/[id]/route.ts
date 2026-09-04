import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Application from "@/models/Application";
import Startup from "@/models/Startup";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["Accepted", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const startup = await Startup.findById(application.startup);
    if (!startup || startup.founder.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    application.status = status;
    await application.save();

    // Create notification for applicant
    try {
      const Notification = (await import("@/models/Notification")).default;
      const matchedRole = startup.openRoles?.find(
        (r: any) => r._id?.toString() === application.roleId?.toString()
      );
      const roleTitle = matchedRole?.title || "Role";

      await Notification.create({
        recipient: application.applicant,
        type: status === "Accepted" ? "application_accepted" : "application_rejected",
        title: status === "Accepted" ? "Application Accepted! 🎉" : "Application Update",
        message:
          status === "Accepted"
            ? `${startup.name} accepted your application for ${roleTitle}!`
            : `${startup.name} has updated the status of your application for ${roleTitle} to Rejected.`,
        link: `/founders-hook?applicationId=${application._id.toString()}`,
        applicationId: application._id,
        startupName: startup.name,
        roleTitle,
        read: false,
      });
    } catch (notifErr) {
      console.error("Failed to create application notification:", notifErr);
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
