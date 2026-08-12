"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";

const CATEGORY_COLORS: Record<string, string> = {
  "Startup Growth": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Fundraising:      "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Productivity:     "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Marketing:        "bg-white/10 text-sand-100 border-white/20",
  Operations:       "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Engineering:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export type PostDTO = {
  _id: string;
  title: string;
  category: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
};

export default function PostCard({ post }: { post: PostDTO }) {
  const [saved, setSaved] = useState(false);
  const colorClass =
    CATEGORY_COLORS[post.category] ||
    "bg-white/10 text-sand-100 border-white/20";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex w-56 shrink-0 snap-start flex-col rounded-2xl border border-ink-700/70 bg-ink-850 p-3.5"
      style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
    >
      {/* Category + bookmark */}
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}>
          {post.category}
        </span>
        <button
          onClick={() => setSaved((s) => !s)}
          className={`shrink-0 transition-colors ${saved ? "text-sand-100" : "text-sand-600 hover:text-sand-200"}`}
          aria-label="Save"
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Title */}
      <h4 className="mt-2.5 line-clamp-2 text-xs font-semibold leading-snug text-sand-100">
        {post.title}
      </h4>
      <p className="mt-1 line-clamp-2 flex-1 text-[11px] leading-relaxed text-sand-400">
        {post.excerpt}
      </p>

      {/* Author */}
      <div className="mt-3 flex items-center gap-2 border-t border-ink-700/50 pt-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.authorAvatar}
          alt={post.authorName}
          className="h-5 w-5 rounded-full object-cover border border-ink-700/60 shrink-0"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[11px] font-medium text-sand-200">{post.authorName}</p>
          <p className="text-[10px] text-sand-600">{timeAgo(post.createdAt)}</p>
        </div>
      </div>
    </motion.div>
  );
}
