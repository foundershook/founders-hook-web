"use client";

import ProjectSetupModal from "@/components/ProjectSetupModal";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
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
  
  // This state controls ProjectSetupModal
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
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user));
    loadStartups();
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []));
  }, [loadStartups]);

  useEffect(() => {
    const t = setTimeout(() => loadStartups(query), 350);
    return () => clearTimeout(t);
  }, [query, loadStartups]);

  return (
    <div className="flex min-h-screen bg-slate-50/60 text-slate-900 font-sans">
      <Sidebar user={me} />

      <div className="relative flex-1">
        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-8 lg:px-10">
          {/* HEADER */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="font-extrabold text-2xl font-bold text-slate-950 sm:text-3xl tracking-tight">
                {greeting()}{me?.name ? `, ${me.name.split(" ")[0]}` : ""} 👋
              </h1>
              <p className="mt-1 text-sm text-slate-600 font-normal">
                Let&apos;s build something impactful today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-xs">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for founders or startups…"
                  className="field-input pl-11 pr-10 border-slate-200 bg-white"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
                  ⌘K
                </kbd>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="btn-purple flex shrink-0 items-center gap-1.5 !px-4 !py-2.5 text-sm font-semibold rounded-full shadow-md"
              >
                <Plus size={15} /> Create Startup
              </button>
              <button className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-purple-600 hover:border-purple-200 shadow-xs">
                <Bell size={18} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white" />
              </button>
            </div>
          </div>

          {/* DISCOVER STARTUPS */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-extrabold text-xl text-slate-950">
                Discover Impactful Startups
              </h2>
            </div>

            {loadingStartups ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {startups.map((s) => (
                  <StartupCard key={s._id} startup={s} />
                ))}
              </div>
            )}
          </section>

          {/* KNOWLEDGE HUB */}
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-extrabold text-xl text-slate-950">
                Knowledge Hub
              </h2>
              <button className="flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-700">
                View all <ChevronRight size={15} />
              </button>
            </div>

            {posts.length === 0 ? (
              <EmptyState
                title="Nothing here yet"
                subtitle="Founder tips and guides will show up here as they're published."
              />
            ) : (
              <div className="flex snap-x gap-4 overflow-x-auto pb-3">
                {posts.map((p) => (
                  <PostCard key={p._id} post={p} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

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
      className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-10 text-center shadow-xs"
    >
      <p className="font-bold text-base text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500 font-normal">{subtitle}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-purple mt-4 !py-2 !px-5 text-xs font-semibold rounded-full">
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}