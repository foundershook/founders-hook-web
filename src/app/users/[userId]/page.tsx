"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  FileText,
  UserRound,
  Loader2,
  Rocket,
  Users,
  UserPlus,
  UserCheck,
  ArrowLeft,
  X,
  ChevronRight,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StartupCard, { StartupDTO } from "@/components/StartupCard";

const QUESTION_LABELS: Record<string, string> = {
  "6a65a437a2b367178cacb7ea": "Current Role",
  "6a6cb2450a2a7c50815cf930": "Years of Experience",
  "6a6cb2d70a2a7c50815cf932": "Main Objective",
};

function formatAnswer(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "Not answered";
  return String(value);
}

interface PublicUser {
  _id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isCurrentUser: boolean;
  isFounder: boolean;
  onboardingAnswers: Record<string, any>;
  startups: StartupDTO[];
}

// ── Follow List Modal ────────────────────────────────────────────────────────
interface FollowUser {
  _id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

function FollowListModal({
  type,
  userId,
  onClose,
  onUserClick,
}: {
  type: "followers" | "following";
  userId: string;
  onClose: () => void;
  onUserClick: (id: string) => void;
}) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/follow/${userId}/list?type=${type}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, type]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold capitalize text-white">{type}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-mist-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-gold-400" />
          </div>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-sm text-mist-500">
            {type === "followers" ? "No followers yet." : "Not following anyone yet."}
          </p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {users.map((u) => (
              <li key={u._id}>
                <button
                  onClick={() => { onClose(); onUserClick(u._id); }}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition-all hover:border-white/8 hover:bg-white/[0.04]"
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={u.avatarUrl || "https://picsum.photos/seed/user/80/80"}
                      alt={u.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{u.name}</p>
                    <p className="truncate text-xs text-mist-400">@{u.username}</p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-mist-600 group-hover:text-gold-400 transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Main Public Profile Page ──────────────────────────────────────────────────
export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followPending, setFollowPending] = useState(false);

  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, profileRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/users/${userId}`),
      ]);
      if (meRes.ok) setCurrentUser((await meRes.json()).user);
      if (profileRes.ok) {
        const data = await profileRes.json();
        const u: PublicUser = data.user;
        setProfile(u);
        setIsFollowing(u.isFollowing);
        setFollowerCount(u.followerCount);
      } else {
        router.push("/networking");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function handleFollow() {
    if (!profile || followPending) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((c) => c + (wasFollowing ? -1 : 1));
    setFollowPending(true);
    try {
      const res = await fetch("/api/follow", {
        method: wasFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profile._id }),
      });
      if (!res.ok) {
        setIsFollowing(wasFollowing);
        setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
      }
    } catch {
      setIsFollowing(wasFollowing);
      setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
    } finally {
      setFollowPending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-ink-950">
        <Sidebar user={currentUser} />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gold-400" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const answers = profile.onboardingAnswers || {};
  const answerEntries = Object.entries(answers).filter(([, value]) => {
    if (Array.isArray(value)) return (value as any[]).length > 0;
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })
    : "Recently";

  const sidebarUser = currentUser
    ? { name: currentUser.name, username: currentUser.username, avatarUrl: currentUser.avatarUrl, isFounder: currentUser.isFounder }
    : null;

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar user={sidebarUser} />

      <main className="relative min-w-0 flex-1 overflow-hidden">
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-16 lg:px-10">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-sm text-mist-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* ── Profile Header ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

              {/* Avatar */}
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-card">
                <Image
                  src={profile.avatarUrl || "https://picsum.photos/seed/user/160/160"}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-200">
                    <UserRound size={14} />
                    {profile.isFounder ? "Founder" : "Member"} profile
                  </p>
                </div>
                <h1 className="font-display text-4xl font-semibold text-white">{profile.name}</h1>
                <p className="mt-1 text-sm text-mist-400">@{profile.username}</p>

                {/* Stats row */}
                <div className="mt-3 flex items-center gap-5">
                  <button
                    onClick={() => setFollowModal("followers")}
                    className="group flex flex-col items-start transition-colors hover:text-gold-300"
                  >
                    <span className="text-lg font-bold leading-none text-white group-hover:text-gold-300 transition-colors">
                      {followerCount}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-mist-400">
                      <Users size={11} /> Followers
                    </span>
                  </button>

                  <div className="h-8 w-px bg-white/10" />

                  <button
                    onClick={() => setFollowModal("following")}
                    className="group flex flex-col items-start transition-colors hover:text-gold-300"
                  >
                    <span className="text-lg font-bold leading-none text-white group-hover:text-gold-300 transition-colors">
                      {profile.followingCount}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-mist-400">
                      <Users size={11} /> Following
                    </span>
                  </button>

                  <div className="h-8 w-px bg-white/10" />

                  <div className="flex flex-col items-start">
                    <span className="flex items-center gap-1 text-sm text-mist-400">
                      <CalendarDays size={13} />
                      {joinedDate}
                    </span>
                    <span className="text-xs text-mist-600">Joined</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow button */}
            {!profile.isCurrentUser && currentUser && (
              <button
                onClick={handleFollow}
                disabled={followPending}
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isFollowing
                    ? "border-gold-500/40 bg-gold-500/10 text-gold-300 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
                    : "border-white/15 bg-white/[0.03] text-mist-100 hover:border-gold-400/60 hover:bg-white/[0.06]"
                }`}
              >
                {followPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isFollowing ? (
                  <UserCheck size={16} />
                ) : (
                  <UserPlus size={16} />
                )}
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
            {profile.isCurrentUser && (
              <button
                onClick={() => router.push("/profile")}
                className="btn-outline w-fit"
              >
                Edit your profile
              </button>
            )}
          </div>

          {/* ── Bio + Details ──────────────────────────────────────────── */}
          <div className="mt-8 grid grid-cols-1 gap-6 border-b border-white/10 pb-8 lg:grid-cols-[minmax(0,1.5fr)_1fr]">

            {/* Bio */}
            <section className="flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <p className="flex-1 text-base leading-relaxed text-mist-200 whitespace-pre-wrap">
                {profile.bio || "This user hasn't written a bio yet."}
              </p>
            </section>

            {/* Profile details */}
            <section className="h-full rounded-2xl border border-white/10 bg-ink-900/75 p-6 shadow-card backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-mist-300">
                  <FileText size={18} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">Profile Details</h2>
                  <p className="text-sm text-mist-500">From onboarding</p>
                </div>
              </div>

              {answerEntries.length > 0 ? (
                <dl className="space-y-4">
                  {answerEntries.slice(0, 6).map(([question, answer]) => (
                    <div key={question}>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
                        {QUESTION_LABELS[question] || question}
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-mist-200">
                        {formatAnswer(answer)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm leading-6 text-mist-400">
                  No profile details available.
                </p>
              )}
            </section>
          </div>

          {/* ── Projects ──────────────────────────────────────────────── */}
          <section className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
                <Rocket size={19} />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-white">
                  {profile.isCurrentUser ? "My Projects" : `${profile.name.split(" ")[0]}'s Projects`}
                </h2>
                <p className="text-sm text-mist-500">
                  {profile.startups.length === 0
                    ? "No published projects yet"
                    : `${profile.startups.length} published ${profile.startups.length === 1 ? "project" : "projects"}`}
                </p>
              </div>
            </div>

            {profile.startups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900/40 px-6 py-12 text-center">
                <Rocket size={36} className="mx-auto mb-3 text-mist-600" />
                <p className="text-base font-medium text-mist-300">No projects yet</p>
                <p className="mt-1 text-sm text-mist-500">
                  This user hasn&apos;t published a project yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.startups.map((startup) => (
                  <StartupCard key={startup._id} startup={startup} />
                ))}
              </div>
            )}
          </section>

        </section>
      </main>

      {/* ── Followers / Following Modal ─────────────────────────── */}
      {followModal && (
        <FollowListModal
          type={followModal}
          userId={profile._id}
          onClose={() => setFollowModal(null)}
          onUserClick={(id) => router.push(`/users/${id}`)}
        />
      )}
    </div>
  );
}
