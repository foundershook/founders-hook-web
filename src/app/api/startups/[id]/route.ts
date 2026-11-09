import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import { requireUser } from "@/lib/auth-guard";
import { analyzeWebsite } from "@/lib/analyzeWebsite";
import { getDefaultStartupIcon } from "@/lib/startupDefaults";
import { isSafeHttpsUrl, isSafeHttpUrl } from "@/lib/validation";

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
  website: z.string().optional(),
  openRoles: z.array(OpenRoleInput).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await requireUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  await connectToDatabase();

  const existing = (await Startup.findById(id).lean()) as {
    name?: string;
    category?: string;
    founder: { toString(): string };
    website?: string;
  } | null;
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existingName = existing.name || "";
  const existingCategory = existing.category || "";

  if (existing.founder.toString() !== String(user._id)) {
    return NextResponse.json(
      { error: "Forbidden – only the founder can edit this startup" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = UpdateStartupSchema.safeParse(body);
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

  const update: Record<string, unknown> = { ...parsed.data };

  // Map logoUrl / bannerUrl → icon / coverImage
  if (parsed.data.logoUrl !== undefined) {
    update.icon =
      parsed.data.logoUrl ||
      getDefaultStartupIcon(parsed.data.name || existingName, parsed.data.category || existingCategory, id);
    delete update.logoUrl;
  }
  if (parsed.data.bannerUrl !== undefined) {
    update.coverImage = parsed.data.bannerUrl || "";
    delete update.bannerUrl;
  }

  const updated = await Startup.findByIdAndUpdate(id, { $set: update }, { new: true })
    .populate("founder", "name username avatarUrl")
    .populate("members", "name username avatarUrl")
    .lean();

  // Re-trigger AI analysis if the website URL changed
  const newWebsite = parsed.data.website;
  const websiteChanged =
    newWebsite !== undefined && newWebsite !== (existing.website ?? "");

  if (websiteChanged && newWebsite) {
    void (async () => {
      try {
        const insights = await analyzeWebsite(newWebsite);
        if (insights) {
          await Startup.findByIdAndUpdate(id, {
            $set: { aiInsights: { ...insights, analysedAt: new Date() } },
          });
        }
      } catch (err) {
        console.warn("[PATCH /api/startups/[id]] Background analysis failed:", err);
      }
    })();
  }

  return NextResponse.json({ startup: updated });
}
