import { NextResponse } from "next/server";

// The primary application database (MongoDB) does not store chats or messages.
export async function GET() {
  return NextResponse.json({ messages: [], message: "Chats are not stored in the database." });
}

export async function POST() {
  return NextResponse.json({ success: true, message: "Chats are not stored in the database." });
}

