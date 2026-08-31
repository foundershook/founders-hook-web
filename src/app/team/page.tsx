"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UsersRound,
  Search,
  Loader2,
  UserPlus,
  UserCheck,
  Rocket,
  ArrowLeft,
  Sparkles,
  Check,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// ── Predefined skill categories ──────────────────────────────────────────────
const SKILL_OPTIONS = [
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "UI/UX Design",
  "Mobile Development",
  "DevOps / Cloud",
  "Data Science / ML",
  "Product Management",
  "Marketing / Growth",
  "Content & Social Media",
  "Business Development",
  "Blockchain / Web3",
];

// ── Types ────────────────────────────────────────────────────────────────────
interface TeamUser {
  _id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isCurrentUser: boolean;
  isFounder: boolean;
}

// ── Skill Chip ───────────────────────────────────────────────────────────────
function SkillChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
        selected
          ? "border-white/60 bg-white/15 text-white shadow-md"
          : "border-ink-700/60 bg-ink-850 text-sand-400 hover:border-white/30 hover:bg-ink-800 hover:text-sand-200"
      }`}
    >
      {selected && <Check size={14} className="shrink-0" />}
      {label}
    </button>
  );
}

// ── User Card ────────────────────────────────────────────────────────────────
function UserCard({
  user,
  isFollowing,
  isPending,
  currentUser,
  selectedSkills,
  onFollow,
  onViewProfile,
}: {
  user: TeamUser;
  isFollowing: boolean;
  isPending: boolean;
  currentUser: any;
  selectedSkills: string[];
  onFollow: (e: React.MouseEvent) => void;
  onViewProfile: () => void;
}) {
  return (
    <div
      onClick={onViewProfile}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850 p-5 transition-all duration-200 hover:border-white/50 hover:shadow-md"
    >
      {/* Founder badge */}
      {user.isFounder && (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl border-b border-l border-white/30 bg-white/10 px-2 py-0.5">
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white">
            <Rocket size={8} /> Founder
          </span>
        </div>
      )}

      {/* Top row: avatar + info + follow */}
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-ink-700/60 shadow-sm transition-transform group-hover:scale-105">
          <Image
            src={user.avatarUrl || "https://picsum.photos/seed/user/120/120"}
            alt={user.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Name & username */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-bold text-sand-100 transition-colors group-hover:text-white">
            {user.name}
          </h3>
          <p className="truncate text-xs text-sand-500">@{user.username}</p>
        </div>

        {/* Follow button */}
        {!user.isCurrentUser && currentUser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFollow(e);
            }}
            disabled={isPending}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
              isFollowing
                ? "border-white/50 bg-white/10 text-white hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                : "border-ink-700/60 bg-ink-900 text-sand-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isFollowing ? "Unfollow" : "Follow"}
          >
            {isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : isFollowing ? (
              <UserCheck size={12} />
            ) : (
              <UserPlus size={12} />
            )}
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* Bio */}
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-sand-400">
        {user.bio || "No bio available."}
      </p>

      {/* Skill tags */}
      {user.skills && user.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.skills.map((skill) => {
            const isMatch = selectedSkills.some(
              (s) => s.toLowerCase() === skill.toLowerCase()
            );
            return (
              <span
                key={skill}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  isMatch
                    ? "border border-white/40 bg-white/15 text-white"
                    : "border border-ink-700/60 bg-ink-900 text-sand-500"
                }`}
              >
                {skill}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Phase: "select" | "results"
  const [phase, setPhase] = useState<"select" | "results">("select");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Results
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Follow state
  const [followState, setFollowState] = useState<Record<string, boolean>>({});
  const [followPending, setFollowPending] = useState<Record<string, boolean>>(
    {}
  );
  const [followerCounts, setFollowerCounts] = useState<
    Record<string, number>
  >({});

  // Fetch current user on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {});
  }, []);

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleSearch() {
    if (selectedSkills.length === 0) return;
    setPhase("results");
    setLoading(true);

    try {
      const params = encodeURIComponent(selectedSkills.join(","));
      const res = await fetch(`/api/team?skills=${params}`);
      if (res.ok) {
        const data = await res.json();
        const list: TeamUser[] = data.users || [];
        setUsers(list);

        // Seed follow state
        const fs: Record<string, boolean> = {};
        const fc: Record<string, number> = {};
        list.forEach((u) => {
          fs[u._id] = u.isFollowing;
          fc[u._id] = u.followerCount;
        });
        setFollowState(fs);
        setFollowerCounts(fc);
      }
    } catch (err) {
      console.error("Failed to fetch team matches:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow(userId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (followPending[userId]) return;
    const wasFollowing = followState[userId];
    setFollowState((p) => ({ ...p, [userId]: !wasFollowing }));
    setFollowerCounts((p) => ({
      ...p,
      [userId]: (p[userId] ?? 0) + (wasFollowing ? -1 : 1),
    }));
    setFollowPending((p) => ({ ...p, [userId]: true }));

    try {
      const res = await fetch("/api/follow", {
        method: wasFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      if (!res.ok) {
        setFollowState((p) => ({ ...p, [userId]: wasFollowing }));
        setFollowerCounts((p) => ({
          ...p,
          [userId]: (p[userId] ?? 0) + (wasFollowing ? 1 : -1),
        }));
      }
    } catch {
      setFollowState((p) => ({ ...p, [userId]: wasFollowing }));
      setFollowerCounts((p) => ({
        ...p,
        [userId]: (p[userId] ?? 0) + (wasFollowing ? 1 : -1),
      }));
    } finally {
      setFollowPending((p) => ({ ...p, [userId]: false }));
    }
  }

  return (
    <div
      className="flex min-h-screen bg-ink-950 text-sand-200"
      style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
    >
      <Sidebar user={currentUser} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        {/* Background Image Overlay */}
        <div
          className="absolute top-0 left-0 right-0 h-[400px] z-0 pointer-events-none opacity-50"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/t7efuhnd/image/upload/v1787056856/m-accelerator-yTsy3PYFPtc-unsplash_k9gga1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",
          }}
        />

        <div className="relative z-10 w-full px-6 pb-28 pt-16 lg:pt-10 lg:px-10">
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="mb-8 pb-4">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <UsersRound size={13} /> Find Teammates
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-sand-100 sm:text-5xl">
              Team
            </h1>
            <p className="mt-2 text-sm text-sand-400">
              Select the skills you need and discover founders & members who
              match.
            </p>
          </div>

          {/* ── Phase 1: Skill Selection ───────────────────────────── */}
          {phase === "select" && (
            <div className="mt-8">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-sand-100">
                  <Sparkles size={18} className="text-sand-300" />
                  What skills are you looking for?
                </h2>
                <p className="mt-1 text-sm text-sand-500">
                  Pick one or more skills to find matching team members.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {SKILL_OPTIONS.map((skill) => (
                  <SkillChip
                    key={skill}
                    label={skill}
                    selected={selectedSkills.includes(skill)}
                    onToggle={() => toggleSkill(skill)}
                  />
                ))}
              </div>

              {/* Find button */}
              <div className="mt-10">
                <button
                  onClick={handleSearch}
                  disabled={selectedSkills.length === 0}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white bg-white px-8 py-3 text-sm font-bold text-ink-950 shadow-glow transition-all hover:bg-sand-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  <Search size={16} />
                  Find Teammates
                  {selectedSkills.length > 0 && (
                    <span className="ml-1 rounded-full bg-ink-950 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {selectedSkills.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Selected preview */}
              {selectedSkills.length > 0 && (
                <p className="mt-4 text-xs text-sand-600">
                  Selected:{" "}
                  <span className="text-sand-300">
                    {selectedSkills.join(", ")}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* ── Phase 2: Results ───────────────────────────────────── */}
          {phase === "results" && (
            <div className="mt-4">
              {/* Back button & selected skills */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setPhase("select")}
                  className="inline-flex items-center gap-2 rounded-full border border-ink-700/60 bg-ink-850 px-4 py-2 text-sm font-medium text-sand-300 transition-all hover:border-white/30 hover:text-white"
                >
                  <ArrowLeft size={14} />
                  Change Skills
                </button>

                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-32 text-sand-400">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
                    <Loader2 size={22} className="animate-spin text-white" />
                  </div>
                  <p className="text-sm font-medium">
                    Finding teammates…
                  </p>
                </div>
              ) : users.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700 bg-ink-900 py-20 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-700/60 bg-ink-850">
                    <UsersRound size={24} className="text-sand-600" />
                  </div>
                  <p className="text-base font-semibold text-sand-300">
                    No matching members found
                  </p>
                  <p className="text-sm text-sand-600">
                    Try selecting different skills or broaden your search.
                  </p>
                  <button
                    onClick={() => setPhase("select")}
                    className="mt-2 text-xs font-medium text-white hover:text-sand-100 transition-colors"
                  >
                    ← Change skills
                  </button>
                </div>
              ) : (
                /* Results grid */
                <>
                  <p className="mb-5 text-xs text-sand-600">
                    Showing{" "}
                    <span className="font-semibold text-sand-300">
                      {users.length}
                    </span>{" "}
                    {users.length === 1 ? "person" : "people"} matching your
                    skills
                  </p>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                      <UserCard
                        key={user._id}
                        user={user}
                        isFollowing={
                          followState[user._id] ?? user.isFollowing
                        }
                        isPending={followPending[user._id] ?? false}
                        currentUser={currentUser}
                        selectedSkills={selectedSkills}
                        onFollow={(e) => handleFollow(user._id, e)}
                        onViewProfile={() =>
                          router.push(`/users/${user._id}`)
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
