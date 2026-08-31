import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

const LoginSchema = z.object({
  identifier: z.string().min(1, "Enter your username or email"),
  password: z.string().min(1, "Enter your password"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Enter your username/email and password" }, { status: 400 });
    }

    const { identifier, password } = parsed.data;

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ 
        error: "Database configuration error: MONGODB_URI is not set. Please create a .env or .env.local file in the project root." 
      }, { status: 500 });
    }

    await connectToDatabase();

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with those details" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = signSession({ userId: user._id.toString(), username: user.username });

    const res = NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        onboardingComplete: user.onboardingComplete,
      },
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: `Login error: ${err.message || err}` }, { status: 500 });
  }
}
