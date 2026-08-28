import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
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

  // Auth
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  await connectToDatabase();

  const startup = await Startup.findById(id).lean() as {
    _id: { toString(): string };
    founder: { toString(): string };
    website?: string;
  } | null;

  if (!startup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (startup.founder.toString() !== session.userId) {
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
