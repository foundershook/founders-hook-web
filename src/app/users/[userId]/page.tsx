"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Sparkles,
  Pencil,
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
  bannerUrl?: string;
  bio: string;
  skills?: string[];
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
      className="profile-calibri-container fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Calibri', 'Carlito', 'Segoe UI', Candara, Optima, Arial, sans-serif" }}
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
      <div
        className="profile-calibri-container flex min-h-screen bg-ink-950"
        style={{ fontFamily: "'Calibri', 'Carlito', 'Segoe UI', Candara, Optima, Arial, sans-serif" }}
      >
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
    <div
      className="profile-calibri-container flex min-h-screen bg-ink-950"
      style={{ fontFamily: "'Calibri', 'Carlito', 'Segoe UI', Candara, Optima, Arial, sans-serif" }}
    >
      <Sidebar user={sidebarUser} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-20 lg:pt-16 lg:px-10">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-sm text-mist-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* ── LINKEDIN-STYLE BANNER & PROFILE CARD ── */}
          <div className="relative rounded-3xl border border-ink-700/60 bg-ink-900 shadow-xl overflow-hidden mb-8">
            {/* Cover Banner */}
            <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden bg-gradient-to-r from-ink-950 via-ink-850 to-ink-900">
              {profile.bannerUrl ? (
                <Image
                  src={profile.bannerUrl}
                  alt={profile.name + " Banner"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-neutral-900 via-ink-850 to-neutral-900">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                </div>
              )}
            </div>

            {/* Profile Info Header (Avatar overlapping banner) */}
            <div className="px-6 pb-6 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
                
                {/* Avatar with thick border overlapping banner */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                  <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-full border-4 border-ink-900 bg-ink-850 shadow-2xl shrink-0">
                    <Image
                      src={profile.avatarUrl || "https://picsum.photos/seed/user/160/160"}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Name & Role */}
                  <div className="mt-2 sm:mt-0 text-center sm:text-left">
                    <div className="mb-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-sand-100">
                        <UserRound size={13} />
                        {profile.isFounder ? "Founder" : "Candidate"} profile
                      </span>
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-sand-100">{profile.name}</h1>
                    <p className="text-sm text-sand-400">@{profile.username}</p>
                  </div>
                </div>

                {/* Follow button */}
                <div className="flex items-center justify-center sm:justify-end gap-3 self-center sm:self-end">
                  {!profile.isCurrentUser && currentUser && (
                    <button
                      onClick={handleFollow}
                      disabled={followPending}
                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isFollowing
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:border-rose-400/60 hover:bg-rose-500/20"
                          : "btn-white"
                      }`}
                    >
                      {followPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck size={16} />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                  {profile.isCurrentUser && (
                    <Link
                      href="/settings"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-700/60 bg-ink-850 text-sand-300 transition-all hover:border-white/40 hover:bg-ink-800 hover:text-white shadow-sm"
                      title="Edit profile"
                      aria-label="Edit profile"
                    >
                      <Pencil size={17} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Follow Stats & Joined Date */}
              <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-6 border-t border-ink-700/50 pt-4">
                <button
                  onClick={() => setFollowModal("followers")}
                  className="group flex items-center gap-2 transition-colors hover:text-sand-100"
                >
                  <span className="text-base font-bold text-sand-100">
                    {followerCount}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-sand-400">
                    <Users size={12} />
                    Followers
                  </span>
                </button>

                <div className="h-4 w-px bg-ink-700/60" />

                <button
                  onClick={() => setFollowModal("following")}
                  className="group flex items-center gap-2 transition-colors hover:text-sand-100"
                >
                  <span className="text-base font-bold text-sand-100">
                    {profile.followingCount}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-sand-400">
                    <Users size={12} />
                    Following
                  </span>
                </button>

                <div className="h-4 w-px bg-ink-700/60" />

                <div className="flex items-center gap-1.5 text-xs text-sand-400">
                  <CalendarDays size={13} />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bio + Details ──────────────────────────────────────────── */}
          <div className="mt-8 grid grid-cols-1 gap-6 border-b border-white/10 pb-8 lg:grid-cols-[minmax(0,1.5fr)_1fr]">

            {/* Bio */}
            <section className="flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <div>
                <p className="text-base leading-relaxed text-mist-200 whitespace-pre-wrap">
                  {profile.bio || "This user hasn't written a bio yet."}
                </p>

                {/* Skills list */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="mb-2.5 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-gold-300" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                        Skills & Expertise
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-mist-200 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

              {answerEntries.length > 0 || (profile.skills && profile.skills.length > 0) ? (
                <dl className="space-y-4">
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
                        Skills
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-mist-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
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
