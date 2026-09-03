import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
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

    // Fetch applications where current user is applicant OR startup founder
    const apps = await Application.find({
      $or: [
        { applicant: user._id },
        ...(myStartupIds.length > 0 ? [{ startup: { $in: myStartupIds } }] : []),
      ],
    })
      .populate("startup", "name icon coverImage founder openRoles")
      .populate("applicant", "name username avatarUrl email mobile gender experience resumeUrl resumeName message status createdAt")
      .sort({ createdAt: -1 });

    // Map each application into a conversation thread metadata object for Firestore
    const conversations = apps.map((app: any) => {
      const startup = app.startup;
      const applicant = app.applicant;
      const participants: string[] = [];

      if (applicant?._id) {
        participants.push(applicant._id.toString());
      }
      if (startup?.founder) {
        const founderIdStr = startup.founder.toString();
        if (!participants.includes(founderIdStr)) {
          participants.push(founderIdStr);
        }
      }

      const roleIdStr = app.roleId ? app.roleId.toString() : "";
      const matchedRole = startup?.openRoles?.find(
        (r: any) => r._id?.toString() === roleIdStr
      );
      const roleTitle = matchedRole?.title || app.roleTitle || "Role";

      return {
        _id: `app_${app._id.toString()}`,
        applicationId: app._id.toString(),
        startupId: startup?._id ? startup._id.toString() : null,
        type: "application",
        participants,
        startup: {
          _id: startup?._id ? startup._id.toString() : null,
          name: startup?.name || "Startup",
          icon: startup?.icon || null,
          coverImage: startup?.coverImage || null,
          founder: startup?.founder ? startup.founder.toString() : null,
        },
        application: {
          _id: app._id.toString(),
          roleTitle,
          status: app.status || "Pending",
          message: app.message || "",
          email: app.email || applicant?.email || null,
          mobile: app.mobile || applicant?.mobile || null,
          gender: app.gender || applicant?.gender || null,
          experience: app.experience || applicant?.experience || null,
          resumeUrl: app.resumeUrl || applicant?.resumeUrl || null,
          resumeName: app.resumeName || applicant?.resumeName || null,
          applicant: applicant
            ? {
                _id: applicant._id.toString(),
                name: app.name || applicant.name || "Applicant",
                username: applicant.username || "",
                avatarUrl: applicant.avatarUrl || "",
                email: app.email || applicant.email || null,
                mobile: app.mobile || applicant.mobile || null,
                gender: app.gender || applicant.gender || null,
                experience: app.experience || applicant.experience || null,
                resumeUrl: app.resumeUrl || applicant.resumeUrl || null,
                resumeName: app.resumeName || applicant.resumeName || null,
                message: app.message || "",
                createdAt: applicant.createdAt ? applicant.createdAt.toString() : null,
              }
            : null,
        },
      };
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations metadata:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
