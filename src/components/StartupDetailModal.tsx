"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Briefcase,
  Clock,
  ArrowRight,
  Loader2,
  Star,
  Pencil,
  Sparkles,
  Globe,
  RefreshCw,
} from "lucide-react";
import type { StartupDTO, AiInsights } from "./StartupCard";
import ApplyModal from "./ApplyModal";
import ProjectSetupModal, { type ProjectSetupInitialData } from "./ProjectSetupModal";
import { StartupBanner, StartupLogo } from "./StartupMedia";

type FullStartup = StartupDTO & {
  description: string;
  website?: string;
  aiInsights?: AiInsights;
  founder?: { _id: string; name: string; username: string; avatarUrl: string };
};

const roleTypeColors: Record<string, string> = {
  Internship:
    "bg-ink-800 text-sand-300 border border-ink-700",
  "Full-time":
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  "Part-time": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

export default function StartupDetailModal({
  startupId,
  onClose,
}: {
  startupId: string;
  onClose: () => void;
}) {
  const [startup, setStartup] = useState<FullStartup | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [reanalysing, setReanalysing] = useState(false);

  // Fetch current user id
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMeId(d.user?.id ?? null))
      .catch(() => {});
  }, []);

  function loadStartup() {
    setLoading(true);
    fetch(`/api/startups/${startupId}`)
      .then((r) => r.json())
      .then((d) => {
        setStartup(d.startup);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadStartup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleApply(roleId?: string) {
    if (roleId) setSelectedRole(roleId);
    setApplyOpen(true);
  }

  async function handleReanalyse() {
    if (!startup || reanalysing) return;
    setReanalysing(true);
    try {
      const res = await fetch(`/api/startups/${startupId}/analyze`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setStartup((prev) =>
          prev ? { ...prev, aiInsights: data.aiInsights } : prev
        );
      }
    } catch {
      // silently fail
    } finally {
      setReanalysing(false);
    }
  }

  // When ApplyModal opens, pass a startup with pre-selected role first
  const startupForApply = startup
    ? {
        ...startup,
        openRoles: selectedRole
          ? [
              ...startup.openRoles.filter((r) => r._id === selectedRole),
              ...startup.openRoles.filter((r) => r._id !== selectedRole),
            ]
          : startup.openRoles,
      }
    : null;

  const isFounder =
    meId && startup?.founder ? startup.founder._id === meId : false;

  const descriptionText = startup?.aiInsights?.about || startup?.description;

  // Build initialData for edit modal
  const editInitialData: ProjectSetupInitialData | undefined = startup
    ? {
        projectName: startup.name,
        tagline: startup.tagline,
        website: startup.website ?? "",
        projectDescription: startup.description ?? "",
        category: startup.category,
        logoUrl: startup.icon?.startsWith("http") ? startup.icon : "",
        bannerUrl: startup.coverImage ?? "",
        openRoles: startup.openRoles.map((r) => ({
          title: r.title,
          type: r.type as "Internship" | "Full-time" | "Part-time",
          description: r.description ?? "",
          paid: false,
        })),
      }
    : undefined;

  return (
    <AnimatePresence>
      <motion.div
        key="startup-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl text-sand-200"
          style={{ fontFamily: "'Calibri', sans-serif" }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-sand-300 border border-white/10 backdrop-blur-md transition hover:bg-black/80 hover:text-white"
          >
            <X size={16} />
          </button>

          {/* Edit button – only visible to the founder */}
          {isFounder && !loading && (
            <button
              onClick={() => setEditOpen(true)}
              className="absolute right-14 top-4 z-10 flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800/90 px-3 py-1.5 text-xs font-medium text-sand-200 backdrop-blur-md transition hover:bg-ink-700 hover:text-white"
            >
              <Pencil size={12} /> Edit
            </button>
          )}

          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-white" />
            </div>
          ) : !startup ? (
            <div className="flex h-72 items-center justify-center text-sand-400">
              Failed to load startup details.
            </div>
          ) : (
            <>
              {/* ── Banner ── */}
              <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-ink-850 border-b border-ink-700/80">
                <StartupBanner
                  coverImage={startup.coverImage}
                  name={startup.name}
                  category={startup.category}
                  id={startup._id}
                  className="h-full w-full object-cover"
                />

                {startup.featured && (
                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    <Star size={10} className="mr-1 inline text-amber-400 fill-amber-400" />
                    Featured
                  </span>
                )}
              </div>

              {/* ── Logo + name ── */}
              <div className="relative px-6 pb-0 pt-0">
                {/* Icon sits on the banner edge */}
                <div className="-mt-7 mb-3 flex items-end gap-4">
                  <StartupLogo
                    icon={startup.icon}
                    name={startup.name}
                    category={startup.category}
                    id={startup._id}
                    size="xl"
                    className="border-2 border-ink-700 shadow-card"
                  />
                  <div className="pb-1">
                    <h2 className="font-bold text-xl leading-tight text-sand-100">
                      {startup.name}
                    </h2>
                    <span className="mt-0.5 inline-block rounded-full border border-ink-700/60 bg-ink-800 px-2.5 py-0.5 text-[11px] font-medium text-sand-400">
                      {startup.category}
                    </span>
                  </div>
                </div>

                {/* Website link */}
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mb-3 flex w-fit items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800 px-3 py-1 text-[11px] text-sand-400 hover:text-white hover:border-sand-600 transition-colors"
                  >
                    <Globe size={11} />
                    {startup.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}

                {/* Tagline */}
                <p className="text-sm font-medium text-sand-200">
                  {startup.tagline}
                </p>

                {/* ── Description (What it is) ── */}
                {descriptionText && (
                  <div className="mt-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-sand-400 mb-1.5">
                      Description
                    </h4>
                    <p className="text-sm leading-relaxed text-sand-200">
                      {descriptionText}
                    </p>
                  </div>
                )}

                {/* ── Solution (Left) & Problem (Right) ── */}
                {(startup.aiInsights?.solution || startup.aiInsights?.problem) && (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Left side: Solution */}
                    <div className="flex flex-col justify-start">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-sand-400 mb-1.5">
                        Solution
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-sand-200">
                        {startup.aiInsights?.solution || "No solution summary provided."}
                      </p>
                    </div>

                    {/* Right side: Problem */}
                    <div className="flex flex-col justify-start">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-sand-400 mb-1.5">
                        Problem
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-sand-200">
                        {startup.aiInsights?.problem || "No problem statement provided."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reanalyse option for founder or pending state */}
                {isFounder && startup.aiInsights && (
                  <div className="mt-2.5 flex items-center justify-between">
                    {startup.aiInsights.analysedAt && (
                      <span className="text-[10px] text-sand-600">
                        Analysed {new Date(startup.aiInsights.analysedAt).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={handleReanalyse}
                      disabled={reanalysing}
                      title="Re-run analysis"
                      className="ml-auto flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800 px-3 py-1 text-[11px] font-medium text-sand-400 hover:text-white hover:border-sand-600 transition disabled:opacity-50"
                    >
                      <RefreshCw size={11} className={reanalysing ? "animate-spin" : ""} />
                      {reanalysing ? "Analysing…" : "Refresh AI Analysis"}
                    </button>
                  </div>
                )}

                {!startup.aiInsights && startup.website && (
                  <div className="mt-3.5 flex items-center justify-between gap-2 rounded-xl border border-dashed border-ink-700 bg-ink-850 px-4 py-3">
                    <p className="text-xs text-sand-400 italic">
                      AI analysis is being generated — check back in a moment.
                    </p>
                    {isFounder && (
                      <button
                        onClick={handleReanalyse}
                        disabled={reanalysing}
                        className="shrink-0 flex items-center gap-1 rounded-full border border-ink-700 bg-ink-800 px-2.5 py-1 text-[10px] font-medium text-sand-400 hover:text-white hover:border-sand-600 transition"
                      >
                        <RefreshCw size={10} className={reanalysing ? "animate-spin" : ""} />
                        {reanalysing ? "Running…" : "Run now"}
                      </button>
                    )}
                  </div>
                )}

                {/* ── Team ── */}
                {startup.members.length > 0 && (
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {startup.members.slice(0, 5).map((m, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={m._id || `member-${idx}`}
                          src={m.avatarUrl}
                          alt={m.name}
                          title={m.name}
                          className="h-8 w-8 rounded-full border-2 border-ink-850 object-cover"
                        />
                      ))}
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-sand-400">
                      <Users size={13} />
                      {startup.members.length}{" "}
                      {startup.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                )}

                {/* ── Open Roles ── */}
                <div className="mt-6 mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-sand-100">
                    <Briefcase size={14} className="text-sand-300" />
                    Open Roles
                    {startup.openRoles.length > 0 && (
                      <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white">
                        {startup.openRoles.length}
                      </span>
                    )}
                  </h3>

                  {startup.openRoles.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-ink-700 bg-ink-850 px-4 py-5 text-center text-sm text-sand-400">
                      No open roles at the moment.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {startup.openRoles.map((role, idx) => (
                        <motion.li
                          key={role._id || `role-${idx}`}
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-850 px-4 py-3 transition hover:border-white/30 hover:bg-ink-800"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-sand-100">
                              {role.title}
                            </span>
                            {role.description && (
                              <span className="line-clamp-1 text-xs text-sand-400">
                                {role.description}
                              </span>
                            )}
                            <span
                              className={`mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                roleTypeColors[role.type] ??
                                "bg-ink-800 text-sand-300 border border-ink-700"
                              }`}
                            >
                              <Clock size={9} />
                              {role.type}
                            </span>
                          </div>
                          <button
                            onClick={() => handleApply(role._id)}
                            className="ml-4 flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-950 hover:bg-sand-200 transition-colors"
                          >
                            Apply <ArrowRight size={11} />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      {applyOpen && startupForApply && (
        <ApplyModal
          key="apply-modal"
          startup={startupForApply}
          onClose={() => {
            setApplyOpen(false);
            setSelectedRole(null);
          }}
        />
      )}

      {editOpen && startup && editInitialData && (
        <ProjectSetupModal
          key="edit-modal"
          startupId={startup._id}
          initialData={editInitialData}
          onClose={() => {
            setEditOpen(false);
            // Reload the startup details after edit
            loadStartup();
          }}
        />
      )}
    </AnimatePresence>
  );
}
