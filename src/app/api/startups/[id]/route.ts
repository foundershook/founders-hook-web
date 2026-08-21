import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectToDatabase();

  const startup = await Startup.findById(id)
    .populate("founder", "name username avatarUrl")
    .populate("members", "name username avatarUrl")
    .lean();

  if (!startup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ startup });
}

const OpenRoleInput = z.object({
  title: z.string().min(1, "Role title is required"),
  type: z.enum(["Internship", "Full-time", "Part-time"]).default("Internship"),
  description: z.string().optional().default(""),
  paid: z.boolean().optional().default(false),
});

const UpdateStartupSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  tagline: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().min(1).optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  openRoles: z.array(OpenRoleInput).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  await connectToDatabase();

  const existing = await Startup.findById(id).lean() as { founder: { toString(): string } } | null;
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.founder.toString() !== session.userId) {
    return NextResponse.json({ error: "Forbidden – only the founder can edit this startup" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateStartupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = { ...parsed.data };

  // Map logoUrl / bannerUrl → icon / coverImage
  if (parsed.data.logoUrl !== undefined) {
    update.icon = parsed.data.logoUrl || "🚀";
    delete update.logoUrl;
  }
  if (parsed.data.bannerUrl !== undefined) {
    if (parsed.data.bannerUrl) {
      update.coverImage = parsed.data.bannerUrl;
    }
    delete update.bannerUrl;
  }

  const updated = await Startup.findByIdAndUpdate(id, { $set: update }, { new: true })
    .populate("founder", "name username avatarUrl")
    .populate("members", "name username avatarUrl")
    .lean();

  return NextResponse.json({ startup: updated });
}
