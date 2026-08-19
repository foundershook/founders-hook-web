"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  PenSquare,
  Plus,
  X,
  Loader2,
  Sparkles,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { timeAgo } from "@/lib/timeAgo";

interface Post {
  _id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
}

const CATEGORIES = [
  "All",
  "Startup Growth",
  "Fundraising",
  "Productivity",
  "Marketing",
  "Operations",
  "Engineering",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Startup Growth": "bg-emerald-900/40 text-emerald-300 border-emerald-800",
  Fundraising: "bg-sky-900/40 text-sky-300 border-sky-800",
  Productivity: "bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-800",
  Marketing: "bg-ink-800 text-sand-200 border-ink-700",
  Operations: "bg-cyan-900/40 text-cyan-300 border-cyan-800",
  Engineering: "bg-indigo-900/40 text-indigo-300 border-indigo-800",
};

const SECTIONS = ["Articles", "Startup Playbooks", "Pitch Templates", "Legal & Equity"];

export default function KnowledgeHubPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("Articles");

  // Modals state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [readingPost, setReadingPost] = useState<Post | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Startup Growth");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, postsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/posts"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
        }
      } catch (err) {
        console.error("Failed to load knowledge hub data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      setErrorMsg("Title and excerpt are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          excerpt,
          content: content || excerpt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to publish article.");
      } else {
        setPosts((prev) => [data.post, ...prev]);
        setIsWriteModalOpen(false);
        setTitle("");
        setExcerpt("");
        setContent("");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while publishing.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.authorName.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex min-h-screen bg-ink-950 text-sand-200" style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}>
      <Sidebar user={currentUser} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        {readingPost ? (
          <div className="w-full max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
            <button
              onClick={() => setReadingPost(null)}
              className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-sand-400 hover:text-sand-100 transition-colors"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to Knowledge Hub
            </button>

            <div className="mb-6 inline-block">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  CATEGORY_COLORS[readingPost.category] ||
                  "bg-white/10 text-white border-white/30"
                }`}
              >
                {readingPost.category}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-sand-100 leading-tight mb-8">
              {readingPost.title}
            </h1>

            <div className="mb-10 flex items-center gap-4 border-y border-ink-800 py-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={readingPost.authorAvatar || "https://picsum.photos/seed/user/64/64"}
                alt={readingPost.authorName}
                className="h-14 w-14 rounded-full object-cover border border-ink-700/60"
              />
              <div>
                <p className="text-base font-semibold text-sand-100">{readingPost.authorName}</p>
                <p className="flex items-center gap-2 text-sm text-sand-500 mt-1">
                  <Calendar size={14} /> Published {timeAgo(readingPost.createdAt)}
                </p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-sand-300 text-base sm:text-lg leading-relaxed space-y-6 whitespace-pre-wrap">
              {readingPost.content || readingPost.excerpt}
            </div>
          </div>
        ) : (
          <>
            {/* Background Image Overlay restricted to header */}
            <div
              className="absolute top-0 left-0 right-0 h-[400px] z-0 pointer-events-none opacity-50"
              style={{
                backgroundImage: "url('https://res.cloudinary.com/t7efuhnd/image/upload/v1787058158/jonathan-cooper-PxHVkcgN1sg-unsp_onspzm.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
              }}
            />
            <div className="relative z-10 w-full px-6 pb-28 pt-16 lg:pt-12 lg:px-10">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-8">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                <BookOpen size={14} />
                Knowledge Base
              </div>
              <h1 className="font-display text-3xl font-semibold text-sand-100 sm:text-4xl">
                Knowledge Hub
              </h1>
              <p className="mt-1.5 text-sm text-sand-400">
                Insights, startup playbooks, and guides published by fellow founders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full max-w-xs sm:w-auto">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sand-600"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles or authors…"
                  className="w-full rounded-full border border-white/10 bg-white/5 backdrop-blur-md pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-sand-400 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all shadow-sm"
                />
              </div>

              {/* Write Article Button */}
              {activeSection === "Articles" && (
                <button
                  onClick={() => setIsWriteModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-white/20 shrink-0"
                >
                  <PenSquare size={16} />
                  Write Article
                </button>
              )}
            </div>
          </div>

          {/* Sections Tab Bar */}
          <div className="mt-6 flex items-center justify-center gap-6 overflow-x-auto no-scrollbar">
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`relative whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
                  activeSection === sec
                    ? "text-sand-100"
                    : "text-sand-400 hover:text-sand-200"
                }`}
              >
                {sec}
                {activeSection === sec && (
                  <motion.div
                    layoutId="activeKnowledgeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sand-100"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {activeSection === "Articles" ? (
          <div className="mt-10">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-sand-400">
              <Loader2 size={24} className="animate-spin text-white" />
              <span className="text-base font-medium">Loading articles…</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-ink-700 bg-ink-900 px-6 py-16 text-center">
              <BookOpen size={40} className="mx-auto mb-3 text-sand-600" />
              <p className="text-lg font-medium text-sand-300">No articles found</p>
              <p className="mt-1 text-sm text-sand-600">
                Be the first to share your startup knowledge and insights with the community.
              </p>
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="btn-white mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs"
              >
                <Plus size={15} /> Write standard article
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => {
                const badgeColor =
                  CATEGORY_COLORS[post.category] ||
                  "bg-white/10 text-white border-white/30";
                return (
                  <div
                    key={post._id}
                    onClick={() => setReadingPost(post)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-white/50 hover:shadow-md cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeColor}`}
                        >
                          {post.category}
                        </span>
                        <span className="text-[11px] text-sand-600">
                          {timeAgo(post.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-sand-100 group-hover:text-white transition-colors">
                        {post.title}
                      </h3>

                      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-sand-400">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-3 border-t border-ink-700/60 pt-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.authorAvatar || "https://picsum.photos/seed/user/64/64"}
                        alt={post.authorName}
                        className="h-8 w-8 rounded-full object-cover border border-ink-700/60"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-sand-300">
                          {post.authorName}
                        </p>
                        <p className="text-[10px] text-sand-600">Founder</p>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-ink-700 bg-ink-900 px-6 py-16 text-center">
              <BookOpen size={40} className="mx-auto mb-3 text-sand-600" />
              <p className="text-lg font-medium text-sand-300">{activeSection}</p>
              <p className="mt-1 text-sm text-sand-600">
                This section is coming soon. Stay tuned!
              </p>
            </div>
          )}
        </div>
        </>
        )}
      </main>

      {/* WRITE ARTICLE MODAL */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-ink-900 p-8 shadow-2xl shadow-black/80 my-8">
            <button
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-sand-500 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white shadow-inner">
                <PenSquare size={22} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                  Publish Knowledge Article
                </h2>
                <p className="mt-1 text-sm text-sand-400">
                  Share startup guides, technical insights, or lessons learned.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-sand-200">
                  Article Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5 Lessons from Scaling Our MVP to 10k Users"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-sand-600 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-sand-200">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat} className="bg-ink-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-sand-200">
                  Summary / Excerpt <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence overview of what this article covers..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-sand-600 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-sand-200">
                  Full Article Content
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article body here..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-sand-600 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-sand-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-ink-950 shadow-glow hover:bg-sand-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Publish Article
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
