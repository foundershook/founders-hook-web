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
      className="group relative flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-200 hover:border-purple-300 hover:shadow-md"
    >
      {/* Founder badge */}
      {user.isFounder && (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl border-b border-l border-purple-200 bg-purple-50 px-2 py-0.5">
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-purple-600">
            <Rocket size={8} /> Founder
          </span>
        </div>
      )}

      {/* Circular avatar — centered */}
      <div className="relative mb-3 h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-slate-200 shadow-md transition-transform duration-200 group-hover:scale-105">
        <Image
          src={user.avatarUrl || "https://picsum.photos/seed/user/120/120"}
          alt={user.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Name */}
      <h3 className="line-clamp-1 font-display text-[15px] font-bold text-slate-950 transition-colors group-hover:text-purple-700">
        {user.name}
      </h3>

      {/* Username / role */}
      <p className="mt-0.5 text-xs text-slate-400">
        {user.role ? user.role : `@${user.username}`}
      </p>

      {/* Follow / You button */}
      <div className="mt-4 w-full" onClick={(e) => e.stopPropagation()}>
        {user.isCurrentUser ? (
          <span className="block w-full rounded-full border border-slate-200 py-2 text-center text-xs font-semibold text-slate-400">
            You
          </span>
        ) : currentUser ? (
          <button
            onClick={onFollow}
            disabled={isPending}
            id={`follow-${user._id}`}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full border py-2 text-xs font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              isFollowing
                ? "border-purple-300 bg-purple-50 text-purple-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
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
    <div className="flex min-h-screen bg-white text-slate-900">
      <Sidebar user={currentUser} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-16 lg:pt-10 lg:px-10">

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="mb-8 border-b border-slate-200 pb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
              <Network size={13} /> Platform Community
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Networking
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Discover and connect with everyone on the Founders Hook platform.
            </p>

            {/* Search */}
            <div className="mt-6 relative w-full max-w-md">
              <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="networking-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, username, or bio…"
                className="field-input pl-11 pr-10"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── Grid ────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-32 text-slate-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-200 bg-purple-50">
                <Loader2 size={22} className="animate-spin text-purple-600" />
              </div>
              <p className="text-sm font-medium">Loading members…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <Users size={24} className="text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-700">No members found</p>
              <p className="text-sm text-slate-400">
                {query ? `No results for "${query}".` : "Be the first to join!"}
              </p>
              {query && (
                <button onClick={() => setQuery("")} className="text-xs text-purple-600 hover:text-purple-700 transition-colors">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="mb-5 text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-700">{users.length}</span>{" "}
                {users.length === 1 ? "person" : "people"}
                {query && <> matching <span className="text-slate-700">&quot;{query}&quot;</span></>}
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
