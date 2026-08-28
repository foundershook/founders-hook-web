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
  const hasPendingInsights = !hasInsights && !!startup.website;

  return (
    <>
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.18 }}
        onClick={() => setDetailOpen(true)}
        className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-850 cursor-pointer transition-all hover:border-white/30 hover:shadow-glow"
        style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
      >
        {/* Featured badge */}
        {startup.featured && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-purple-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
            Featured
          </span>
        )}

        {/* Cover image */}
        <div className="relative h-32 w-full bg-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={startup.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Reduced gradient overlay so the banner is clearer */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/30 to-transparent" />

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
          <h3 className="font-bold text-base text-sand-100 leading-tight">
            {startup.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-sand-400 leading-relaxed">
            {startup.tagline}
          </p>

          {/* Category pill */}
          <span className="mt-3 inline-block w-fit rounded-full border border-ink-700/60 bg-ink-800 px-3 py-1 text-[11px] font-medium text-sand-400">
            {startup.category}
          </span>

          {/* ── AI Insights strip ── */}
          {hasInsights && startup.aiInsights && (
            <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-3 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={11} className="text-cyan-400 shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                  AI Analysis
                </span>
              </div>

              <InsightRow emoji="🚀" label="About" text={startup.aiInsights.about} />
              <InsightRow emoji="🔍" label="Problem" text={startup.aiInsights.problem} />
              <InsightRow emoji="💡" label="Solution" text={startup.aiInsights.solution} />
            </div>
          )}

          {/* Pending analysis shimmer */}
          {hasPendingInsights && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
              <Globe size={11} className="shrink-0 text-sand-600" />
              <span className="text-[10px] text-sand-600 italic">AI analysis pending…</span>
              <span className="ml-auto flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1 w-1 rounded-full bg-sand-700 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-ink-700/50 pt-2.5">
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

// ── Small sub-component for a single insight row ─────────────────────────────
function InsightRow({
  emoji,
  label,
  text,
}: {
  emoji: string;
  label: string;
  text: string;
}) {
  return (
    <div className="flex gap-1.5">
      <span className="text-[11px] shrink-0 leading-relaxed">{emoji}</span>
      <div className="min-w-0">
        <span className="text-[10px] font-semibold text-cyan-300/80">{label}: </span>
        <span className="text-[10px] text-sand-400 leading-relaxed line-clamp-2">{text}</span>
      </div>
    </div>
  );
}
