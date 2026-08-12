"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import ApplyModal from "./ApplyModal";
import StartupDetailModal from "./StartupDetailModal";

export type StartupDTO = {
  _id: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  coverImage: string;
  featured?: boolean;
  members: { _id: string; name: string; avatarUrl: string }[];
  openRoles: { _id: string; title: string; type: string; description?: string }[];
};

export default function StartupCard({ startup }: { startup: StartupDTO }) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

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
          <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
            Featured
          </span>
        )}

        {/* Cover image */}
        <div className="relative h-28 w-full overflow-hidden bg-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={startup.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Reduced gradient overlay so the banner is clearer */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-850/80 via-ink-850/10 to-transparent" />

          {/* Icon badge over image bottom-left */}
          <span className="absolute -bottom-4 left-3 flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700/60 bg-ink-800 text-base shadow-card overflow-hidden">
            {startup.icon?.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={startup.icon} alt={startup.name} className="h-full w-full object-cover" />
            ) : (
              startup.icon || "🚀"
            )}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-3 pt-7">
          <h3 className="font-bold text-sm text-sand-100 leading-tight">
            {startup.name}
          </h3>
          <p className="mt-1 line-clamp-2 flex-1 text-[11px] text-sand-400 leading-relaxed">
            {startup.tagline}
          </p>

          {/* Category pill */}
          <span className="mt-2.5 inline-block w-fit rounded-full border border-ink-700/60 bg-ink-800 px-2.5 py-0.5 text-[10px] font-medium text-sand-400">
            {startup.category}
          </span>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-ink-700/50 pt-2.5">
            {/* Member avatars + count */}
            <div className="flex items-center gap-1.5 text-[11px] text-sand-600">
              <div className="flex -space-x-1.5">
                {startup.members.slice(0, 3).map((m, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={m._id || `member-${idx}`}
                    src={m.avatarUrl}
                    alt={m.name}
                    className="h-5 w-5 rounded-full border border-ink-850 object-cover"
                  />
                ))}
              </div>
              <span className="flex items-center gap-0.5 font-medium text-sand-600">
                <Users size={10} /> {startup.members.length}
              </span>
            </div>

            {/* Apply / Arrow button */}
            {startup.openRoles.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setApplyOpen(true);
                }}
                className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-white hover:bg-sand-200 transition-colors"
              >
                Apply <ArrowRight size={11} />
              </button>
            ) : (
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-sand-400 hover:bg-white/10 hover:text-sand-100 transition-colors"
              >
                <ArrowRight size={12} />
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
