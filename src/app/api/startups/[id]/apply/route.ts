import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import Application from "@/models/Application";
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

  const roleExists = startup.openRoles.some(
    (r: any) => r._id.toString() === parsed.data.roleId
  );
  if (!roleExists) {
    return NextResponse.json({ error: "That role no longer exists" }, { status: 404 });
  }

  try {
    const application = await Application.create({
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
    return NextResponse.json({ application }, { status: 201 });
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
