import { NextResponse } from "next/server";

// Deprecated: Incoming calls are subscribed via Firestore real-time listeners
export async function GET() {
  return NextResponse.json({ incomingCall: null });
}
