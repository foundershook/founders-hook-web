import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import Application from "@/models/Application";
import User from "@/models/User";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

const ApplySchema = z.object({
  roleId: z.string().min(1),
  name: z.string().optional().default(""),
  gender: z.string().optional().default(""),
  mobile: z.string().optional().default(""),
  email: z.string().optional().default(""),
  experience: z.string().optional().default(""),
  resumeUrl: z.string().optional().default(""),
  resumeName: z.string().optional().default(""),
  message: z.string().max(1000).optional().default(""),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;

  const startup = await Startup.findById(id);
  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const matchedRole = startup.openRoles.find(
    (r: any) => r._id.toString() === parsed.data.roleId
  );
  if (!matchedRole) {
    return NextResponse.json({ error: "That role no longer exists" }, { status: 404 });
  }

  try {
    let application = await Application.findOne({
      startup: startup._id,
      roleId: parsed.data.roleId,
      applicant: session.userId,
    });

    if (application) {
      application.name = parsed.data.name || application.name;
      application.gender = parsed.data.gender || application.gender;
      application.mobile = parsed.data.mobile || application.mobile;
      application.email = parsed.data.email || application.email;
      application.experience = parsed.data.experience || application.experience;
      application.resumeUrl = parsed.data.resumeUrl || application.resumeUrl;
      application.resumeName = parsed.data.resumeName || application.resumeName;
      application.message = parsed.data.message || application.message;
      application.status = "Pending";
      await application.save();
    } else {
      application = await Application.create({
        startup: startup._id,
        roleId: parsed.data.roleId,
        applicant: session.userId,
        name: parsed.data.name,
        gender: parsed.data.gender,
        mobile: parsed.data.mobile,
        email: parsed.data.email,
        experience: parsed.data.experience,
        resumeUrl: parsed.data.resumeUrl,
        resumeName: parsed.data.resumeName,
        message: parsed.data.message,
      });
    }

    const applicantUser = await User.findById(session.userId).select("name username avatarUrl email mobile");

    const participants: string[] = [session.userId];
    if (startup.founder) {
      const founderIdStr = startup.founder.toString();
      if (!participants.includes(founderIdStr)) {
        participants.push(founderIdStr);
      }
    }

    const roleTitle = matchedRole.title || "Role";

    const conversationData = {
      id: `app_${application._id.toString()}`,
      participants,
      type: "application",
      applicationId: application._id.toString(),
      startupId: startup._id.toString(),
      startup: {
        _id: startup._id.toString(),
        name: startup.name || "Startup",
        icon: startup.icon || "🚀",
        founder: startup.founder ? startup.founder.toString() : null,
      },
      application: {
        _id: application._id.toString(),
        roleTitle,
        status: application.status || "Pending",
        message: application.message || "",
        applicant: {
          _id: session.userId,
          name: parsed.data.name || applicantUser?.name || "Applicant",
          username: applicantUser?.username || "",
          avatarUrl: applicantUser?.avatarUrl || "",
          email: parsed.data.email || applicantUser?.email || null,
          mobile: parsed.data.mobile || applicantUser?.mobile || null,
          gender: parsed.data.gender || null,
          experience: parsed.data.experience || null,
          resumeUrl: parsed.data.resumeUrl || null,
          resumeName: parsed.data.resumeName || null,
          createdAt: application.createdAt ? application.createdAt.toISOString() : null,
        },
      },
      initialMessage: {
        roleTitle,
        applicantName: parsed.data.name || applicantUser?.name || "Applicant",
        email: parsed.data.email || applicantUser?.email || "",
        mobile: parsed.data.mobile || "",
        experience: parsed.data.experience || "",
        resumeUrl: parsed.data.resumeUrl || "",
        resumeName: parsed.data.resumeName || "",
        message: parsed.data.message || "",
      },
    };

    return NextResponse.json({ application, conversationData }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "You've already applied to this role" },
        { status: 409 }
      );
    }
    console.error("Apply error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
