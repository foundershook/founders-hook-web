import { NextResponse } from "next/server";

// Deprecated: Chat messages are managed natively in Firebase Firestore
export async function GET() {
  return NextResponse.json({ messages: [], message: "Messages are handled via Firestore" });
}

export async function POST() {
  return NextResponse.json({ success: true, message: "Messages are handled via Firestore" });
}
