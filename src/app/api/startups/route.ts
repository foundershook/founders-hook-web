import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();

  const filter: Record<string, unknown> = {};
  if (category && category !== "All") filter.category = category;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { tagline: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  const startups = await Startup.find(filter)
    .sort({ featured: -1, createdAt: -1 })
    .limit(60)
    .populate("founder", "name username avatarUrl")
    .populate("members", "name username avatarUrl")
    .lean();

  return NextResponse.json({ startups });
}

const OpenRoleInput = z.object({
  title: z.string().min(1, "Role title is required"),
  type: z.enum(["Internship", "Full-time", "Part-time"]).default("Internship"),
  description: z.string().optional().default(""),
  paid: z.boolean().optional().default(false),
});

const CreateStartupSchema = z.object({
  name: z.string().min(1, "Startup name is required").max(60),
  tagline: z.string().min(1, "Tagline is required").max(120),
  description: z.string().max(1000).optional().default(""),
  category: z.string().min(1, "Category is required"),
  icon: z.string().optional().default("🚀"),
  logoUrl: z.string().optional().default(""),
  bannerUrl: z.string().optional().default(""),
  openRoles: z.array(OpenRoleInput).optional().default([]),
});

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateStartupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const fallbackCover = `https://picsum.photos/seed/${encodeURIComponent(parsed.data.name)}/800/500`;

  const startup = await Startup.create({
    ...parsed.data,
    founder: session.userId,
    members: [session.userId],
    // Use uploaded Cloudinary URL if provided, else picsum placeholder
    icon: parsed.data.logoUrl || "🚀",
    coverImage: parsed.data.bannerUrl || fallbackCover,
  });

  return NextResponse.json({ startup }, { status: 201 });
}
