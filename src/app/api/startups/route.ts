import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import { requireUser } from "@/lib/auth-guard";
import { analyzeWebsite } from "@/lib/analyzeWebsite";
import { getDefaultStartupIcon } from "@/lib/startupDefaults";
import { escapeRegex, normalizeSearchInput } from "@/lib/search";
import { isSafeHttpsUrl, isSafeHttpUrl } from "@/lib/validation";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const q = normalizeSearchInput(searchParams.get("q"));
  const category = (searchParams.get("category")?.trim() || "").slice(0, 64);

  const filter: Record<string, unknown> = {};
  if (category && category !== "All") filter.category = category;
  if (q) {
    const pattern = escapeRegex(q);
    filter.$or = [
      { name: { $regex: pattern, $options: "i" } },
      { tagline: { $regex: pattern, $options: "i" } },
      { category: { $regex: pattern, $options: "i" } },
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
  website: z.string().optional().default(""),
  openRoles: z.array(OpenRoleInput).optional().default([]),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const body = await req.json();
  const parsed = CreateStartupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  if (parsed.data.website && !isSafeHttpUrl(parsed.data.website)) {
    return NextResponse.json({ error: "Invalid website URL." }, { status: 400 });
  }
  if (parsed.data.bannerUrl && !isSafeHttpsUrl(parsed.data.bannerUrl)) {
    return NextResponse.json({ error: "Invalid banner URL." }, { status: 400 });
  }
  if (
    parsed.data.logoUrl &&
    parsed.data.logoUrl.includes("://") &&
    !isSafeHttpsUrl(parsed.data.logoUrl)
  ) {
    return NextResponse.json({ error: "Invalid logo URL." }, { status: 400 });
  }

  await connectToDatabase();

  const assignedIcon =
    parsed.data.logoUrl ||
    parsed.data.icon ||
    getDefaultStartupIcon(parsed.data.name, parsed.data.category);

  const startup = await Startup.create({
    ...parsed.data,
    founder: user._id,
    members: [user._id],
    icon: assignedIcon,
    coverImage: parsed.data.bannerUrl || "",
    website: parsed.data.website || "",
  });

  // Fire-and-forget AI analysis — runs in background, doesn't block the response
  if (parsed.data.website) {
    void (async () => {
      try {
        const insights = await analyzeWebsite(parsed.data.website!);
        if (insights) {
          await Startup.findByIdAndUpdate(startup._id, {
            $set: { aiInsights: { ...insights, analysedAt: new Date() } },
          });
        }
      } catch (err) {
        console.warn("[POST /api/startups] Background analysis failed:", err);
      }
    })();
  }

  return NextResponse.json({ startup }, { status: 201 });
}
