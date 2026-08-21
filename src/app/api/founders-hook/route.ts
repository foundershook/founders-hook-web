import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Startup from "@/models/Startup";
import Application from "@/models/Application";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    // ── Applicant view: return the current user's own applications ──
    if (view === "my-applications") {
      const statusFilter = searchParams.get("status");
      const filter: Record<string, unknown> = { applicant: user._id };
      if (statusFilter && ["Pending", "Accepted", "Rejected"].includes(statusFilter)) {
        filter.status = statusFilter;
      }

      const rawApplications = await Application.find(filter)
        .sort({ createdAt: -1 })
        .populate("startup", "_id name icon openRoles")
        .lean<
          {
            _id: any;
            startup: { _id: any; name: string; icon: string; openRoles: any[] };
            roleId: any;
            applicant: any;
            message: string;
            status: string;
            createdAt: Date;
          }[]
        >();

      const applications = rawApplications.map((app) => {
        const startupData = app.startup;
        const roleId = app.roleId?.toString() || "";
        const roleInfo = startupData?.openRoles?.find(
          (r: any) => r._id.toString() === roleId
        );

        return {
          _id: app._id.toString(),
          startup: {
            _id: startupData?._id?.toString() || "",
            name: startupData?.name || "Unknown",
            icon: startupData?.icon || "🚀",
          },
          roleTitle: roleInfo?.title || "Unknown Role",
          roleType: roleInfo?.type || "Internship",
          message: app.message || "",
          status: app.status,
          createdAt: app.createdAt,
        };
      });

      return NextResponse.json({ applications });
    }

    // ── Founder view (default): return applications for startups the user founded ──
    // Find all startups owned by this user
    const myStartups = await Startup.find({ founder: user._id })
      .select("_id name icon openRoles")
      .lean<{ _id: any; name: string; icon: string; openRoles: any[] }[]>();

    if (myStartups.length === 0) {
      return NextResponse.json({ applications: [] });
    }

    const startupIds = myStartups.map((s) => s._id);

    // Optional status filter
    const statusFilter = searchParams.get("status");
    const filter: Record<string, unknown> = { startup: { $in: startupIds } };
    if (statusFilter && ["Pending", "Accepted", "Rejected"].includes(statusFilter)) {
      filter.status = statusFilter;
    }

    // Fetch applications
    const rawApplications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .populate("applicant", "name username avatarUrl")
      .populate("startup", "name icon")
      .lean<
        {
          _id: any;
          startup: { _id: any; name: string; icon: string };
          roleId: any;
          applicant: { _id: any; name: string; username: string; avatarUrl: string };
          message: string;
          status: string;
          createdAt: Date;
        }[]
      >();

    // Build a lookup map: startupId -> { roleId -> { title, type } }
    const roleLookup: Record<string, Record<string, { title: string; type: string }>> = {};
    for (const s of myStartups) {
      const roleMap: Record<string, { title: string; type: string }> = {};
      for (const role of s.openRoles || []) {
        roleMap[role._id.toString()] = { title: role.title, type: role.type };
      }
      roleLookup[s._id.toString()] = roleMap;
    }

    // Map applications with resolved role info
    const applications = rawApplications.map((app) => {
      const startupId = app.startup?._id?.toString() || "";
      const roleId = app.roleId?.toString() || "";
      const roleInfo = roleLookup[startupId]?.[roleId];

      return {
        _id: app._id.toString(),
        applicant: {
          _id: app.applicant._id.toString(),
          name: app.applicant.name,
          username: app.applicant.username,
          avatarUrl: app.applicant.avatarUrl,
        },
        startup: {
          _id: startupId,
          name: app.startup?.name || "Unknown",
          icon: app.startup?.icon || "🚀",
        },
        roleTitle: roleInfo?.title || "Unknown Role",
        roleType: roleInfo?.type || "Internship",
        message: app.message || "",
        status: app.status,
        createdAt: app.createdAt,
      };
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching founder applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
