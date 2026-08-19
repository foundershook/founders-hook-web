"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Users, Search, Rocket, CalendarDays, Loader2, UserPlus, UserCheck } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StartupDetailModal from "@/components/StartupDetailModal";

interface StartupItem {
  _id: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  coverImage: string;
}

interface Founder {
  _id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  startups: StartupItem[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isCurrentUser: boolean;
}

export default function FoundersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  // Track optimistic follow state: { [founderId]: boolean }
  const [followState, setFollowState] = useState<Record<string, boolean>>({});
  // Track pending follow calls to prevent double-clicks
  const [followPending, setFollowPending] = useState<Record<string, boolean>>({});
  // Track optimistic follower counts
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, foundersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/founders"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }

        if (foundersRes.ok) {
          const foundersData = await foundersRes.json();
          const list: Founder[] = foundersData.founders || [];
          setFounders(list);

          // Seed optimistic state from server-returned values
          const initialFollowState: Record<string, boolean> = {};
          const initialCounts: Record<string, number> = {};
          list.forEach((f) => {
            initialFollowState[f._id] = f.isFollowing;
            initialCounts[f._id] = f.followerCount;
          });
          setFollowState(initialFollowState);
          setFollowerCounts(initialCounts);
        }
      } catch (error) {
        console.error("Failed to load founders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleFollow(founderId: string) {
    if (followPending[founderId]) return;

    const wasFollowing = followState[founderId];

    // Optimistic update
    setFollowState((prev) => ({ ...prev, [founderId]: !wasFollowing }));
    setFollowerCounts((prev) => ({
      ...prev,
      [founderId]: (prev[founderId] ?? 0) + (wasFollowing ? -1 : 1),
    }));
    setFollowPending((prev) => ({ ...prev, [founderId]: true }));

    try {
      const res = await fetch("/api/follow", {
        method: wasFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: founderId }),
      });

      if (!res.ok) {
        // Revert on error
        setFollowState((prev) => ({ ...prev, [founderId]: wasFollowing }));
        setFollowerCounts((prev) => ({
          ...prev,
          [founderId]: (prev[founderId] ?? 0) + (wasFollowing ? 1 : -1),
        }));
      }
    } catch (err) {
      // Revert on network error
      setFollowState((prev) => ({ ...prev, [founderId]: wasFollowing }));
      setFollowerCounts((prev) => ({
        ...prev,
        [founderId]: (prev[founderId] ?? 0) + (wasFollowing ? 1 : -1),
      }));
    } finally {
      setFollowPending((prev) => ({ ...prev, [founderId]: false }));
    }
  }

  const filteredFounders = founders.filter((f) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const matchName = f.name?.toLowerCase().includes(q);
    const matchUsername = f.username?.toLowerCase().includes(q);
    const matchBio = f.bio?.toLowerCase().includes(q);
    const matchStartup = f.startups?.some(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
    return matchName || matchUsername || matchBio || matchStartup;
  });

  return (
    <div className="flex min-h-screen bg-ink-950 text-sand-200" style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}>
      <Sidebar user={currentUser} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        {/* Background Image Overlay restricted to header */}
        <div
          className="absolute top-0 left-0 right-0 h-[400px] z-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/t7efuhnd/image/upload/v1787056207/miguel-henriques-RfiBK6Y_upQ-unsplash_eukpex.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
          }}
        />
        <div className="relative z-10 w-full px-6 pb-28 pt-16 lg:pt-12 lg:px-10">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-8">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                <Users size={14} />
                Community Founders
              </div>
              <h1 className="font-display text-3xl font-semibold text-sand-100 sm:text-4xl">
                Startup Founders
              </h1>
              <p className="mt-1.5 text-sm text-sand-400">
                Discover founders who have launched and published projects on Founders Hook.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sand-600"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search founders or projects…"
                className="w-full rounded-full border border-white/10 bg-white/5 backdrop-blur-md pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-sand-400 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-sand-400">
              <Loader2 size={24} className="animate-spin text-white" />
              <span className="text-base font-medium">Loading founders…</span>
            </div>
          ) : filteredFounders.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-ink-700 bg-ink-900 px-6 py-16 text-center">
              <Users size={40} className="mx-auto mb-3 text-sand-600" />
              <p className="text-lg font-medium text-sand-300">No founders found</p>
              <p className="mt-1 text-sm text-sand-600">
                {query ? "Try adjusting your search query." : "No founders have published a project yet."}
              </p>
            </div>
          ) : (
            <div className="mt-32 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFounders.map((founder) => {
                const isFollowing = followState[founder._id] ?? founder.isFollowing;
                const followerCount = followerCounts[founder._id] ?? founder.followerCount;
                const isPending = followPending[founder._id] ?? false;

                return (
                  <div
                    key={founder._id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850 p-6 shadow-sm transition-all duration-200 hover:border-white/50 hover:shadow-md"
                  >
                    <div>
                      {/* Profile Info */}
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => router.push(`/users/${founder._id}`)}
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-ink-700/60 transition-transform hover:scale-105"
                        >
                          <Image
                            src={founder.avatarUrl || "https://picsum.photos/seed/user/120/120"}
                            alt={founder.name}
                            fill
                            className="object-cover"
                          />
                        </button>
                        <div className="min-w-0 flex-1">
                          <h3
                            onClick={() => router.push(`/users/${founder._id}`)}
                            className="truncate cursor-pointer font-display text-lg font-semibold text-sand-100 hover:text-white transition-colors"
                          >
                            {founder.name}
                          </h3>
                          <p className="truncate text-xs text-sand-400">@{founder.username}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-sand-600">
                            <CalendarDays size={12} />
                            Joined{" "}
                            {founder.createdAt
                              ? new Date(founder.createdAt).toLocaleDateString("en", {
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recently"}
                          </p>
                        </div>

                        {/* Follow Button — hidden for current user's own card */}
                        {!founder.isCurrentUser && currentUser && (
                          <button
                            onClick={() => handleFollow(founder._id)}
                            disabled={isPending}
                            className={`
                              shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150
                              ${isFollowing
                                ? "border-white/50 bg-white/10 text-white hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                : "border-ink-700/60 bg-ink-900 text-sand-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
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

                      {/* Follower count */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-sand-600">
                        <Users size={11} />
                        <span>
                          <span className="font-semibold text-sand-300">{followerCount}</span>{" "}
                          {followerCount === 1 ? "follower" : "followers"}
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-sand-400">
                        {founder.bio || "No bio available."}
                      </p>
                    </div>

                    {/* Published Projects */}
                    <div className="mt-6 border-t border-ink-700/60 pt-4">
                      <div className="mb-3 flex items-center justify-between text-xs text-sand-400 font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 text-white">
                          <Rocket size={13} /> Published Projects ({founder.startups.length})
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {founder.startups.map((startup) => (
                          <div
                            key={startup._id}
                            onClick={() => setSelectedStartupId(startup._id)}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink-800 bg-ink-900 p-2.5 transition-colors hover:border-white/50 hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-700/60 bg-ink-850 text-sm overflow-hidden">
                                {startup.icon?.startsWith("http") ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={startup.icon}
                                    alt={startup.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  startup.icon || "🚀"
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-sand-100">
                                  {startup.name}
                                </p>
                                <p className="truncate text-[11px] text-sand-400">
                                  {startup.tagline}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full border border-ink-700/60 bg-ink-900 px-2 py-0.5 text-[10px] text-sand-400">
                              {startup.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Startup Detail Modal */}
      {selectedStartupId && (
        <StartupDetailModal
          startupId={selectedStartupId}
          onClose={() => setSelectedStartupId(null)}
        />
      )}
    </div>
  );
}
