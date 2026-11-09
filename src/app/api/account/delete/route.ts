import { NextRequest, NextResponse } from "next/server";
import type { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Startup from "@/models/Startup";
import Application from "@/models/Application";
import Notification from "@/models/Notification";
import Post from "@/models/Post";
import OtpVerification from "@/models/OtpVerification";
import ResetToken from "@/models/ResetToken";
import SettingsOtp from "@/models/SettingsOtp";
import { requireUser, tooManyRequests } from "@/lib/auth-guard";
import { rateLimit } from "@/lib/rate-limit";
import { clearSessionCookie } from "@/lib/session-cookie";
import { audit } from "@/lib/audit";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// POST /api/account/delete
// Permanently deletes the signed-in user's account and associated data.
// Messages exchanged in Firebase are intentionally retained so other
// participants keep their history, matching the Privacy Policy.
export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    const sessionUser = auth.user;

    const limit = await rateLimit(`account-delete:${sessionUser._id}`, 5, 60);
    if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

    let body: { password?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const password = typeof body.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete your account." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const dbUser = await User.findById(sessionUser._id).select(
      "+passwordHash email avatarUrl bannerUrl"
    );
    if (!dbUser?.passwordHash) {
      return NextResponse.json(
        { error: "Unable to verify this account." },
        { status: 400 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, dbUser.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
    }

    const email = dbUser.email;
    const startups = await Startup.find({ founder: sessionUser._id })
      .select("_id icon coverImage")
      .lean<{ _id: Types.ObjectId; icon?: string; coverImage?: string }[]>();
    const startupIds = startups.map((startup) => startup._id);

    const imageUrls = [
      dbUser.avatarUrl,
      dbUser.bannerUrl,
      ...startups.flatMap((startup) => [startup.icon, startup.coverImage]),
    ];

    const applicationsQuery =
      startupIds.length > 0
        ? {
            $or: [
              { applicant: sessionUser._id },
              { startup: { $in: startupIds } },
            ],
          }
        : { applicant: sessionUser._id };

    const applications = await Application.find(applicationsQuery)
      .select("_id")
      .lean<{ _id: Types.ObjectId }[]>();
    const applicationIds = applications.map((application) => application._id);

    await Promise.all([
      User.updateMany({ followers: sessionUser._id }, { $pull: { followers: sessionUser._id } }),
      User.updateMany({ following: sessionUser._id }, { $pull: { following: sessionUser._id } }),
      Startup.updateMany({ members: sessionUser._id }, { $pull: { members: sessionUser._id } }),
      Application.deleteMany(applicationsQuery),
      Notification.deleteMany(
        applicationIds.length > 0
          ? {
              $or: [
                { recipient: sessionUser._id },
                { applicationId: { $in: applicationIds } },
              ],
            }
          : { recipient: sessionUser._id }
      ),
      Post.deleteMany({ author: sessionUser._id }),
      OtpVerification.deleteMany({ email }),
      ResetToken.deleteMany({ email }),
      SettingsOtp.deleteMany({ userId: sessionUser._id }),
    ]);

    await Startup.deleteMany({ founder: sessionUser._id });
    await User.deleteOne({ _id: sessionUser._id });

    await Promise.allSettled(
      imageUrls.map((url) => deleteCloudinaryAsset(url))
    );

    audit("account.deleted", req, { userId: String(sessionUser._id) });

    const res = NextResponse.json({ ok: true });
    clearSessionCookie(res);
    return res;
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting your account." },
      { status: 500 }
    );
  }
}
