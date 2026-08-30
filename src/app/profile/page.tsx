"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Pencil,
  UserRound,
  Upload,
  Save,
  Loader2,
  Bot,
  X,
  Rocket,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { CldUploadWidget } from "next-cloudinary";
import StartupCard, { StartupDTO } from "@/components/StartupCard";

// 1. ADD YOUR CUSTOM TEXT HERE
const QUESTION_LABELS: Record<string, string> = {
  "6a65a437a2b367178cacb7ea": "Current Role",
  "6a6cb2450a2a7c50815cf930": "Years of Experience",
  "6a6cb2d70a2a7c50815cf932": "Main Objective",
};

function normalizeAnswers(value: unknown): Record<string, unknown> {
  if (!value) return {};

  if (value instanceof Map) {
    return Object.fromEntries(value.entries());
  }

  if (typeof value === "object") {
    return JSON.parse(JSON.stringify(value));
  }

  return {};
}

function formatAnswer(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "Not answered";
  return String(value);
}

// ── Follow Stats Modal ──────────────────────────────────────────────────────
interface FollowUser {
  _id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

interface FollowModalProps {
  type: "followers" | "following";
  userId: string;
  currentUserId: string | null;
  onClose: () => void;
}

function FollowModal({ type, userId, onClose }: FollowModalProps) {
  const router = useRouter();
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-ink-700/60 bg-ink-850 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold capitalize text-sand-100">{type}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sand-400 transition-colors hover:bg-ink-800 hover:text-sand-100"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-sm text-sand-400">
            {type === "followers" ? "No followers yet." : "Not following anyone yet."}
          </p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {users.map((u) => (
              <li key={u._id}>
                <button
                  onClick={() => { onClose(); router.push(`/users/${u._id}`); }}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition-all hover:border-ink-700/50 hover:bg-ink-800"
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-ink-700/50">
                    <Image
                      src={u.avatarUrl || "https://picsum.photos/seed/user/80/80"}
                      alt={u.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-sand-100">{u.name}</p>
                    <p className="truncate text-xs text-sand-400">@{u.username}</p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-sand-600 group-hover:text-sand-100 transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();

  // State for user data and form
  const [user, setUser] = useState<any>(null);
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [myStartups, setMyStartups] = useState<StartupDTO[]>([]);
  const [startupsLoading, setStartupsLoading] = useState(true);

  // Follow stats
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  const fetchFollowStats = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/follow/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setFollowStats({ followers: data.followers, following: data.following });
      }
    } catch (err) {
      console.error("Failed to fetch follow stats:", err);
    }
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          setBio(data.user.bio || "");
          setProfilePic(data.user.profilePic || data.user.avatarUrl || "");
          fetchFollowStats(data.user._id || data.user.id);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();

    async function fetchMyStartups() {
      try {
        const res = await fetch("/api/profile/startups");
        if (res.ok) {
          const data = await res.json();
          setMyStartups(data.startups || []);
        }
      } catch (err) {
        console.error("Failed to fetch startups:", err);
      } finally {
        setStartupsLoading(false);
      }
    }
    fetchMyStartups();
  }, [router, fetchFollowStats]);

  // 1. Update your save function to pass the user ID
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/bio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id || user.id, // Pass ID to backend
          bio,
          profilePic
        }),
      });

      if (!res.ok) {
        alert("Failed to update profile.");
      } else {
        setIsEditingBio(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const answers = normalizeAnswers(user.onboardingAnswers);
  const answerEntries = Object.entries(answers).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })
    : "Recently";

  const sidebarUser = {
    name: user.name,
    username: user.username,
    avatarUrl: profilePic || user.avatarUrl,
    isFounder: user.isFounder,
  };

  const userId = user._id || user.id;

  return (
    <div
      className="flex min-h-screen bg-ink-950 text-sand-200"
      style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
    >
      <Sidebar user={sidebarUser} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        <section className="relative z-10 w-full px-6 pb-28 pt-20 lg:pt-16 lg:px-10">

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

              <div className="flex flex-col items-center gap-3 sm:items-start">
                {/* 2. Update your Cloudinary Widget to auto-save immediately */}
                <CldUploadWidget
                  uploadPreset="founders_hook_users"
                  options={{ folder: "users-profile-pic", multiple: false, maxFiles: 1 }}
                  onSuccess={async (result) => {
                    if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                      const newPicUrl = result.info.secure_url;
                      setProfilePic(newPicUrl); // Update UI instantly

                      // AUTO-SAVE to MongoDB so it doesn't disappear on refresh
                      try {
                        await fetch("/api/profile/bio", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userId: user._id || user.id,
                            bio: bio,
                            profilePic: newPicUrl
                          }),
                        });
                      } catch (error) {
                        console.error("Failed to auto-save image to database", error);
                      }
                    }
                  }}
                >
                  {({ open }) => (
                    <div
                      onClick={() => open()}
                      className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                    >
                      <Image
                        src={profilePic || "https://picsum.photos/seed/user/160/160"}
                        alt={user.name}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 hidden flex-col items-center justify-center bg-black/60 transition-all group-hover:flex">
                        <Upload size={20} className="mb-1 text-white" />
                        <span className="text-xs font-medium text-white">Edit</span>
                      </div>
                    </div>
                  )}
                </CldUploadWidget>
              </div>

              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-sand-100">
                  <UserRound size={14} />
                  Founder profile
                </p>
                <h1 className="font-display text-4xl font-semibold text-sand-100">{user.name}</h1>
                <p className="mt-1 text-sm text-sand-400">@{user.username}</p>

                {/* ── Follow stats ── */}
                <div className="mt-3 flex items-center gap-5">
                  <button
                    onClick={() => setFollowModal("followers")}
                    className="group flex flex-col items-start transition-colors hover:text-sand-100"
                  >
                    <span className="text-lg font-bold leading-none text-sand-100 group-hover:text-sand-100 transition-colors">
                      {followStats.followers}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-sand-400">
                      <Users size={11} />
                      Followers
                    </span>
                  </button>

                  <div className="h-8 w-px bg-ink-700/60" />

                  <button
                    onClick={() => setFollowModal("following")}
                    className="group flex flex-col items-start transition-colors hover:text-sand-100"
                  >
                    <span className="text-lg font-bold leading-none text-sand-100 group-hover:text-sand-100 transition-colors">
                      {followStats.following}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-sand-400">
                      <Users size={11} />
                      Following
                    </span>
                  </button>

                  <div className="h-8 w-px bg-ink-700/60" />

                  <div className="flex flex-col items-start">
                    <span className="flex items-center gap-1 text-sm text-sand-400">
                      <CalendarDays size={13} />
                      {joinedDate}
                    </span>
                    <span className="text-xs text-sand-600">Joined</span>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/onboarding" className="btn-outline w-fit">
              <Pencil size={16} />
              Edit profile
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_1fr] gap-6 border-b border-ink-700/50 pb-8">

            <section className="rounded-2xl border border-ink-700/50 bg-ink-900 p-6 h-full flex flex-col justify-between shadow-sm">
              {isEditingBio ? (
                <div className="flex-1 flex flex-col gap-4">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="What are you building? What's your background?"
                    rows={6}
                    className="w-full flex-1 resize-y rounded-xl border border-ink-700/60 bg-ink-850 p-4 text-base leading-relaxed text-sand-200 placeholder:text-sand-600 focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
                  />
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      disabled={isSaving}
                      className="inline-flex w-fit items-center gap-2 px-4 py-2 text-sm text-sand-400 hover:text-sand-200 transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="btn-white inline-flex w-fit items-center gap-2 px-4 py-2 text-sm disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isSaving ? "Saving..." : "Save Bio"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-base leading-relaxed text-sand-200 whitespace-pre-wrap">
                      {bio || "You haven't written a bio yet. Tell the community what you are building!"}
                    </p>

                    {/* Skills list */}
                    {user?.skills && user.skills.length > 0 && (
                      <div className="mt-5 border-t border-ink-700/40 pt-4">
                        <div className="mb-2.5 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-sand-300" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-sand-400">
                            Skills & Expertise
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill: string) => (
                            <span
                              key={skill}
                              className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-sand-200 shadow-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <Pencil size={16} />
                      Edit Bio
                    </button>

                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-ink-700/50 bg-ink-850 text-sand-600 cursor-not-allowed"
                      title="Coming Soon"
                    >
                      <Bot size={16} />
                      Write with AI (Coming Soon)
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-ink-700/50 bg-ink-900 p-6 shadow-sm h-full">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sand-100">
                  <FileText size={18} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-sand-100">Profile Details</h2>
                  <p className="text-sm text-sand-400">From onboarding</p>
                </div>
              </div>

              {answerEntries.length > 0 || (user?.skills && user.skills.length > 0) ? (
                <dl className="space-y-4">
                  {user?.skills && user.skills.length > 0 && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand-400">
                        Skills
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {user.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-sand-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {answerEntries.slice(0, 6).map(([question, answer]) => (
                    <div key={question}>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand-400">
                        {QUESTION_LABELS[question] || question}
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-sand-200">
                        {formatAnswer(answer)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm leading-6 text-sand-400">
                  Finish onboarding to fill out this profile framework.
                </p>
              )}
            </section>

          </div>

          {/* ── My Projects Section ── */}
          <section className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sand-100">
                <Rocket size={19} />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-sand-100">My Projects</h2>
                <p className="text-sm text-sand-400">Startups you&apos;ve published</p>
              </div>
            </div>

            {startupsLoading ? (
              <div className="flex items-center gap-3 py-8 text-sand-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading your projects…</span>
              </div>
            ) : myStartups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-700/60 bg-ink-900 px-6 py-12 text-center">
                <Rocket size={36} className="mx-auto mb-3 text-sand-600" />
                <p className="text-base font-medium text-sand-200">No projects yet</p>
                <p className="mt-1 text-sm text-sand-400">Publish your first startup from the feed page to see it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {myStartups.map((startup) => (
                  <StartupCard key={startup._id} startup={startup} />
                ))}
              </div>
            )}
          </section>

        </section>
      </main>

      {/* ── Follow Modal ── */}
      {followModal && (
        <FollowModal
          type={followModal}
          userId={userId}
          currentUserId={userId}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  );
}