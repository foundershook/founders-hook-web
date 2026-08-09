"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  PenSquare,
  Plus,
  X,
  Loader2,
  Sparkles,
  Calendar,
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
  "Startup Growth": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Fundraising: "bg-sky-50 text-sky-700 border-sky-200",
  Productivity: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  Marketing: "bg-amber-50 text-amber-700 border-amber-200",
  Operations: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Engineering: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default function KnowledgeHubPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="flex min-h-screen bg-white text-slate-900">
      <Sidebar user={currentUser} />

      <main className="relative min-w-0 flex-1 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-12 lg:px-10">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                <BookOpen size={14} />
                Knowledge Base
              </div>
              <h1 className="font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
                Knowledge Hub
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Insights, startup playbooks, and guides published by fellow founders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full max-w-xs sm:w-auto">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles or authors…"
                  className="field-input pl-11 pr-4"
                />
              </div>

              {/* Write Article Button */}
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="btn-purple inline-flex items-center gap-2 px-4 py-2.5 text-sm shrink-0"
              >
                <PenSquare size={16} />
                Write Article
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex snap-x gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`snap-start rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-purple-300 hover:text-purple-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-slate-500">
              <Loader2 size={24} className="animate-spin text-purple-600" />
              <span className="text-base font-medium">Loading articles…</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <BookOpen size={40} className="mx-auto mb-3 text-slate-400" />
              <p className="text-lg font-medium text-slate-700">No articles found</p>
              <p className="mt-1 text-sm text-slate-400">
                Be the first to share your startup knowledge and insights with the community.
              </p>
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="btn-purple mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs"
              >
                <Plus size={15} /> Write standard article
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => {
                const badgeColor =
                  CATEGORY_COLORS[post.category] ||
                  "bg-purple-50 text-purple-600 border-purple-200";
                return (
                  <div
                    key={post._id}
                    onClick={() => setReadingPost(post)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-md cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeColor}`}
                        >
                          {post.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {timeAgo(post.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-slate-950 group-hover:text-purple-600 transition-colors">
                        {post.title}
                      </h3>

                      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-500">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.authorAvatar || "https://picsum.photos/seed/user/64/64"}
                        alt={post.authorName}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {post.authorName}
                        </p>
                        <p className="text-[10px] text-slate-400">Founder</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* WRITE ARTICLE MODAL */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl my-8">
            <button
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={18} />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <PenSquare size={19} />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-950">
                  Publish Knowledge Article
                </h2>
                <p className="text-xs text-slate-500">
                  Share startup guides, technical insights, or lessons learned.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5 Lessons from Scaling Our MVP to 10k Users"
                  className="field-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="field-input bg-white cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Summary / Excerpt *
                </label>
                <textarea
                  required
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence overview of what this article covers..."
                  className="field-input resize-y"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Full Article Content
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article body here..."
                  className="field-input resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-purple inline-flex items-center gap-2 px-5 py-2.5 text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Publish Article
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* READING ARTICLE MODAL */}
      {readingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setReadingPost(null)}
              className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={20} />
            </button>

            <div className="mb-4 inline-block">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  CATEGORY_COLORS[readingPost.category] ||
                  "bg-purple-50 text-purple-600 border-purple-200"
                }`}
              >
                {readingPost.category}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-950 leading-snug">
              {readingPost.title}
            </h1>

            <div className="my-6 flex items-center gap-3 border-y border-slate-200 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={readingPost.authorAvatar || "https://picsum.photos/seed/user/64/64"}
                alt={readingPost.authorName}
                className="h-10 w-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-sm font-semibold text-slate-950">{readingPost.authorName}</p>
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={13} /> Published {timeAgo(readingPost.createdAt)}
                </p>
              </div>
            </div>

            <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap">
              {readingPost.content || readingPost.excerpt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
