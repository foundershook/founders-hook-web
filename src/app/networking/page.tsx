"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Network,
  Search,
  Users,
  UserPlus,
  UserCheck,
  Loader2,
  Rocket,
  X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface NetworkUser {
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
  startups: { _id: string; name: string }[];
  role: string | null;
}

// ── User Card ────────────────────────────────────────────────────────────────
function UserCard({
  user,
  isFollowing,
  isPending,
  currentUser,
  onFollow,
  onViewProfile,
}: {
  user: NetworkUser;
  isFollowing: boolean;
  isPending: boolean;
  currentUser: any;
  onFollow: (e: React.MouseEvent) => void;
  onViewProfile: () => void;
}) {
  return (
    <div
      onClick={onViewProfile}
      className="group relative flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850 p-6 text-center transition-all duration-200 hover:border-white/50 hover:shadow-md"
    >
      {/* Founder badge */}
      {user.isFounder && (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl border-b border-l border-white/30 bg-white/10 px-2 py-0.5">
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white">
            <Rocket size={8} /> Founder
          </span>
        </div>
      )}

      {/* Circular avatar — centered */}
      <div className="relative mb-3 h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-ink-700/60 shadow-md transition-transform duration-200 group-hover:scale-105">
        <Image
          src={user.avatarUrl || "https://picsum.photos/seed/user/120/120"}
          alt={user.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Name */}
      <h3 className="line-clamp-1 font-display text-[15px] font-bold text-sand-100 transition-colors group-hover:text-sand-100">
        {user.name}
      </h3>

      {/* Username / role */}
      <p className="mt-0.5 text-xs text-sand-600">
        {user.role ? user.role : `@${user.username}`}
      </p>

      {/* Follow / You button */}
      <div className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
        {user.isCurrentUser ? (
          <span className="block w-full rounded-full border border-ink-700/60 py-2 text-center text-xs font-semibold text-sand-600">
            You
          </span>
        ) : currentUser ? (
          <button
            onClick={onFollow}
            disabled={isPending}
            id={`follow-${user._id}`}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full border py-2 text-xs font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              isFollowing
                ? "border-white/50 bg-white/10 text-white hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                : "border-ink-700/60 bg-ink-900 text-sand-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
            }`}
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
        ) : null}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function NetworkingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [followState, setFollowState] = useState<Record<string, boolean>>({});
  const [followPending, setFollowPending] = useState<Record<string, boolean>>({});
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const [meRes, usersRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/network${q ? `?q=${encodeURIComponent(q)}` : ""}`),
      ]);
      if (meRes.ok) setCurrentUser((await meRes.json()).user);
      if (usersRes.ok) {
        const list: NetworkUser[] = (await usersRes.json()).users || [];
        setUsers(list);
        const fs: Record<string, boolean> = {};
        const fc: Record<string, number> = {};
        list.forEach((u) => { fs[u._id] = u.isFollowing; fc[u._id] = u.followerCount; });
        setFollowState(fs);
        setFollowerCounts(fc);
      }
    } catch (err) {
      console.error("Failed to load network:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(debouncedQuery); }, [debouncedQuery, fetchUsers]);

  async function handleFollow(userId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (followPending[userId]) return;
    const wasFollowing = followState[userId];
    setFollowState((p) => ({ ...p, [userId]: !wasFollowing }));
    setFollowerCounts((p) => ({ ...p, [userId]: (p[userId] ?? 0) + (wasFollowing ? -1 : 1) }));
    setFollowPending((p) => ({ ...p, [userId]: true }));

    try {
      const res = await fetch("/api/follow", {
        method: wasFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      if (!res.ok) {
        setFollowState((p) => ({ ...p, [userId]: wasFollowing }));
        setFollowerCounts((p) => ({ ...p, [userId]: (p[userId] ?? 0) + (wasFollowing ? 1 : -1) }));
      }
    } catch {
      setFollowState((p) => ({ ...p, [userId]: wasFollowing }));
      setFollowerCounts((p) => ({ ...p, [userId]: (p[userId] ?? 0) + (wasFollowing ? 1 : -1) }));
    } finally {
      setFollowPending((p) => ({ ...p, [userId]: false }));
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-950 text-sand-200" style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}>
      <Sidebar user={currentUser} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        {/* Background Image Overlay restricted to header */}
        <div
          className="absolute top-0 left-0 right-0 h-72 z-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: "url('YOUR_CLOUDINARY_IMAGE_URL_HERE')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-16 lg:pt-10 lg:px-10">

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="mb-8 border-b border-ink-700/60 pb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <Network size={13} /> Platform Community
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-sand-100 sm:text-5xl">
              Networking
            </h1>
            <p className="mt-2 text-sm text-sand-400">
              Discover and connect with everyone on the Founders Hook platform.
            </p>

            {/* Search */}
            <div className="mt-6 relative w-full max-w-md">
              <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sand-600" />
              <input
                id="networking-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, username, or bio…"
                className="field-input pl-11 pr-10"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-600 hover:text-sand-300 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── Grid ────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-32 text-sand-400">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
                <Loader2 size={22} className="animate-spin text-white" />
              </div>
              <p className="text-sm font-medium">Loading members…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700 bg-ink-900 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-700/60 bg-ink-850">
                <Users size={24} className="text-sand-600" />
              </div>
              <p className="text-base font-semibold text-sand-300">No members found</p>
              <p className="text-sm text-sand-600">
                {query ? `No results for "${query}".` : "Be the first to join!"}
              </p>
              {query && (
                <button onClick={() => setQuery("")} className="text-xs text-white hover:text-sand-100 transition-colors">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="mb-5 text-xs text-sand-600">
                Showing <span className="font-semibold text-sand-300">{users.length}</span>{" "}
                {users.length === 1 ? "person" : "people"}
                {query && <> matching <span className="text-sand-300">&quot;{query}&quot;</span></>}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    isFollowing={followState[user._id] ?? user.isFollowing}
                    isPending={followPending[user._id] ?? false}
                    currentUser={currentUser}
                    onFollow={(e) => handleFollow(user._id, e)}
                    onViewProfile={() => router.push(`/users/${user._id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
