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
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        onClick={() => setDetailOpen(true)}
        className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-purple-200 cursor-pointer transition-all"
      >
        {startup.featured && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Featured
          </span>
        )}

        <div className="relative h-28 w-full overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={startup.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
          <span className="absolute -bottom-5 left-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-md overflow-hidden">
            {startup.icon?.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={startup.icon} alt={startup.name} className="h-full w-full object-cover" />
            ) : (
              startup.icon || "🚀"
            )}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 pt-8">
          <h3 className="font-bold text-base text-slate-950">
            {startup.name}
          </h3>
          <p className="mt-1 line-clamp-2 flex-1 text-xs sm:text-sm text-slate-600 font-normal">
            {startup.tagline}
          </p>

          <span className="mt-3 inline-block w-fit rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
            {startup.category}
          </span>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="flex -space-x-2">
                {startup.members.slice(0, 3).map((m, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={m._id || `member-${idx}`}
                    src={m.avatarUrl}
                    alt={m.name}
                    className="h-6 w-6 rounded-full border-2 border-white object-cover shadow-xs"
                  />
                ))}
              </div>
              <span className="flex items-center gap-1 font-medium">
                <Users size={12} /> {startup.members.length}
              </span>
            </div>

            {startup.openRoles.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // don't open detail modal
                  setApplyOpen(true);
                }}
                className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors"
              >
                Apply <ArrowRight size={12} />
              </button>
            ) : (
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-purple-50 hover:text-purple-600"
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
