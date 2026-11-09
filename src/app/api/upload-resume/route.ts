import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported. Please upload a PDF resume." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds the 5MB limit. Please upload a smaller PDF." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify the actual file signature; MIME type and extension are spoofable.
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json(
        { error: "The uploaded file is not a valid PDF." },
        { status: 400 }
      );
    }

    const base64Data = buffer.toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64Data}`;

    return NextResponse.json({
      url: dataUrl,
      name: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume. Please try again." },
      { status: 500 }
    );
  }
}
