"use client";

import ProjectSetupModal from "@/components/ProjectSetupModal";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Plus, ChevronRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StartupCard, { StartupDTO } from "@/components/StartupCard";
import PostCard, { PostDTO } from "@/components/PostCard";

type Me = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isFounder?: boolean;
  hasApplied?: boolean;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}


export default function FeedPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [startups, setStartups] = useState<StartupDTO[]>([]);
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [query, setQuery] = useState("");
  const [loadingStartups, setLoadingStartups] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const loadStartups = useCallback(async (q?: string) => {
    setLoadingStartups(true);
    const url = q ? `/api/startups?q=${encodeURIComponent(q)}` : "/api/startups";
    const res = await fetch(url);
    const data = await res.json();
    setStartups(data.startups || []);
    setLoadingStartups(false);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user));
    loadStartups();
    fetch("/api/posts").then((r) => r.json()).then((d) => setPosts(d.posts || []));
  }, [loadStartups]);

  useEffect(() => {
    const t = setTimeout(() => loadStartups(query), 350);
    return () => clearTimeout(t);
  }, [query, loadStartups]);

  return (
    <div
      className="flex min-h-screen bg-ink-950 text-sand-200"
      style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
    >
      <Sidebar user={me} />

      {/* MAIN CONTENT */}
      <div className="relative flex-1 overflow-y-auto pb-16 lg:pb-0">
        {/* Background Image Overlay restricted to header */}
        <div
          className="absolute top-0 left-0 right-0 h-72 z-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/t7efuhnd/image/upload/v1786473992/ebenezer42-planet-6092940_gyiiif.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
          }}
        />

        <main className="relative z-10 w-full px-5 pb-10 pt-16 lg:pt-7 lg:px-8">

          {/* ── HEADER ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-bold text-2xl sm:text-[1.75rem] tracking-tight text-sand-100">
                {greeting()}, {me?.name ? me.name.split(" ")[0] : "there"} 👋
              </h1>
              <p className="mt-0.5 text-sm text-sand-400">
                Let&apos;s build something impactful today.
              </p>
            </div>

            {/* Search + Bell */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:flex-initial">
                <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-600" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for founders or startups..."
                  className="h-9 w-full rounded-full border border-white/10 bg-white/5 backdrop-blur-md pl-9 pr-4 text-base text-white placeholder:text-sand-400 outline-none transition-all focus:border-white/30 focus:ring-1 focus:ring-white/20 sm:w-64 sm:text-xs shadow-sm"
                />
              </div>

              <button
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-sand-400 hover:text-sand-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white" />
              </button>
            </div>
          </div>

          {/* ── DISCOVER STARTUPS ── */}
          <section className="mt-20">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-base text-sand-100">
                Discover Impactful Startups
              </h2>
            </div>

            {loadingStartups ? (
              /* Skeleton grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[290px] w-full animate-pulse rounded-2xl bg-ink-850"
                  />
                ))}
              </div>
            ) : startups.length === 0 ? (
              <EmptyState
                title="No startups yet"
                subtitle="Be the first founder to publish an idea."
                actionLabel="Publish a startup"
                onAction={() => setCreateOpen(true)}
              />
            ) : (
              /* Grid expanding downwards */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                {startups.map((s) => (
                  <div key={s._id} className="w-full">
                    <StartupCard startup={s} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── KNOWLEDGE HUB ── */}
          <section className="mt-9">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-base text-sand-100">
                Knowledge Hub
              </h2>
              <button className="flex items-center gap-1 text-xs font-semibold text-white hover:text-sand-100 transition-colors">
                View all <ChevronRight size={13} />
              </button>
            </div>

            {posts.length === 0 ? (
              <EmptyState
                title="Nothing here yet"
                subtitle="Founder tips and guides will show up here as they're published."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                {posts.map((p) => (
                  <PostCard key={p._id} post={p} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>



      {/* Desktop "Create Startup" button – floating bottom-right on desktop */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-950 shadow-glow hover:bg-sand-200 transition-all hover:scale-[1.03] active:scale-[0.97] lg:h-auto lg:w-auto lg:gap-2 lg:px-5 lg:py-2.5"
        style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
        aria-label="Create Startup"
      >
        <Plus size={20} className="shrink-0" />
        <span className="hidden text-sm font-semibold lg:inline">Create Startup</span>
      </button>

      {createOpen && (
        <ProjectSetupModal
          onClose={() => {
            setCreateOpen(false);
            loadStartups();
          }}
        />
      )}
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-dashed border-ink-700 bg-ink-900 px-8 py-10 text-center"
    >
      <p className="font-bold text-sm text-sand-200">{title}</p>
      <p className="mt-1 text-xs text-sand-400">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-white mt-4 !py-1.5 !px-4 text-xs rounded-full"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}