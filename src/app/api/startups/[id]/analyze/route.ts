import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import { requireUser } from "@/lib/auth-guard";
import { analyzeWebsite } from "@/lib/analyzeWebsite";

/**
 * POST /api/startups/[id]/analyze
 *
 * Re-runs AI website analysis for a startup. Only the founder can trigger this.
 * Useful when:
 *  - the initial analysis timed out
 *  - the website content has changed meaningfully
 *  - the founder wants a fresh summary
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await requireUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  await connectToDatabase();

  const startup = await Startup.findById(id).lean() as {
    _id: { toString(): string };
    founder: { toString(): string };
    website?: string;
  } | null;

  if (!startup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (startup.founder.toString() !== String(user._id)) {
    return NextResponse.json(
      { error: "Forbidden – only the founder can trigger analysis" },
      { status: 403 }
    );
  }

  if (!startup.website) {
    return NextResponse.json(
      { error: "No website URL set for this startup" },
      { status: 400 }
    );
  }

  const insights = await analyzeWebsite(startup.website);

  if (!insights) {
    return NextResponse.json(
      { error: "Analysis failed – check website URL or try again later" },
      { status: 422 }
    );
  }

  await Startup.findByIdAndUpdate(id, {
    $set: { aiInsights: { ...insights, analysedAt: new Date() } },
  });

  return NextResponse.json({ aiInsights: insights });
}
