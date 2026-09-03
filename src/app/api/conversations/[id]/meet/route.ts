import { NextResponse } from "next/server";

// Deprecated: Meeting calls are handled in Firebase Firestore
export async function POST() {
  return NextResponse.json({ success: true, meetUrl: "https://meet.google.com/new" });
}

export async function PATCH() {
  return NextResponse.json({ success: true });
}
