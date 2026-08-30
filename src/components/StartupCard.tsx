"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Sparkles, Globe } from "lucide-react";
import ApplyModal from "./ApplyModal";
import StartupDetailModal from "./StartupDetailModal";

export type AiInsights = {
  about: string;
  problem: string;
  solution: string;
  analysedAt?: string;
};

export type StartupDTO = {
  _id: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  coverImage: string;
  website?: string;
  aiInsights?: AiInsights;
  featured?: boolean;
  members: { _id: string; name: string; avatarUrl: string }[];
  openRoles: { _id: string; title: string; type: string; description?: string }[];
};

export default function StartupCard({ startup }: { startup: StartupDTO }) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const hasInsights = !!startup.aiInsights;

  return (
    <>
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.18 }}
        onClick={() => setDetailOpen(true)}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-850 cursor-pointer transition-all hover:border-white/30 hover:shadow-glow"
        style={{ fontFamily: "'Calibri', sans-serif" }}
      >
        {/* Featured badge */}
        {startup.featured && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
            Featured
          </span>
        )}

        {/* Cover image */}
        <div className="relative h-32 w-full shrink-0 bg-ink-800 border-b border-ink-700/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={startup.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />

          {/* Icon badge over image bottom-left */}
          <span className="absolute -bottom-6 left-4 flex h-12 w-12 items-center justify-center rounded-lg border border-ink-700/60 bg-ink-800 text-xl shadow-card overflow-hidden">
            {startup.icon?.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={startup.icon} alt={startup.name} className="h-full w-full object-cover" />
            ) : (
              startup.icon || "🚀"
            )}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4 pt-8">
          <h3 className="font-bold text-base text-sand-100 leading-tight line-clamp-1">
            {startup.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs text-sand-400 leading-relaxed min-h-[32px]">
            {startup.tagline}
          </p>

          {/* Category & Badges row */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-block rounded-full border border-ink-700/60 bg-ink-800 px-2.5 py-0.5 text-[11px] font-medium text-sand-400">
              {startup.category}
            </span>
            {hasInsights && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-950/30 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                <Sparkles size={10} className="shrink-0" /> AI Insights
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-ink-700/50">
            {/* Member avatars + count */}
            <div className="flex items-center gap-1.5 text-xs text-sand-600">
              <div className="flex -space-x-1.5">
                {startup.members.slice(0, 3).map((m, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={m._id || `member-${idx}`}
                    src={m.avatarUrl}
                    alt={m.name}
                    className="h-6 w-6 rounded-full border border-ink-850 object-cover"
                  />
                ))}
              </div>
              <span className="flex items-center gap-0.5 font-medium text-sand-600">
                <Users size={12} /> {startup.members.length}
              </span>
            </div>

            {/* Apply / Arrow button */}
            {startup.openRoles.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setApplyOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-950 hover:bg-sand-200 transition-colors"
              >
                Apply <ArrowRight size={12} />
              </button>
            ) : (
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 text-sand-400 hover:bg-white/10 hover:text-sand-100 transition-colors"
              >
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {applyOpen && (
        <ApplyModal startup={startup} onClose={() => setApplyOpen(false)} />
      )}
      {detailOpen && (
        <StartupDetailModal
          startupId={startup._id}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}
