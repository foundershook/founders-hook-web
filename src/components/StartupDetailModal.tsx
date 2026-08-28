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

type FullStartup = StartupDTO & {
  description: string;
  website?: string;
  aiInsights?: AiInsights;
  founder?: { _id: string; name: string; username: string; avatarUrl: string };
};

const roleTypeColors: Record<string, string> = {
  Internship:
    "bg-violet-50 text-violet-700 border border-violet-200",
  "Full-time":
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Part-time": "bg-ink-800 text-sand-200 border border-ink-700",
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
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <X size={16} />
          </button>

          {/* Edit button – only visible to the founder */}
          {isFounder && !loading && (
            <button
              onClick={() => setEditOpen(true)}
              className="absolute right-14 top-4 z-10 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-sm transition hover:bg-white hover:text-purple-600"
            >
              <Pencil size={12} /> Edit
            </button>
          )}

          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-purple-600" />
            </div>
          ) : !startup ? (
            <div className="flex h-72 items-center justify-center text-slate-500">
              Failed to load startup details.
            </div>
          ) : (
            <>
              {/* ── Banner ── */}
              <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={startup.coverImage}
                  alt={startup.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />

                {startup.featured && (
                  <span className="absolute left-4 top-4 rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Star size={10} className="mr-1 inline" />
                    Featured
                  </span>
                )}
              </div>

              {/* ── Logo + name ── */}
              <div className="relative px-6 pb-0 pt-0">
                {/* Icon sits on the banner edge */}
                <div className="-mt-7 mb-3 flex items-end gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white bg-slate-50 text-3xl shadow-sm overflow-hidden">
                    {startup.icon?.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={startup.icon} alt={startup.name} className="h-full w-full object-cover" />
                    ) : (
                      startup.icon || "🚀"
                    )}
                  </span>
                  <div className="pb-1">
                    <h2 className="font-display text-xl font-semibold leading-tight text-slate-950">
                      {startup.name}
                    </h2>
                    <span className="mt-0.5 inline-block rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-600">
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
                    className="mb-3 flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-500 hover:text-purple-600 hover:border-purple-200 transition-colors"
                  >
                    <Globe size={11} />
                    {startup.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}

                {/* Tagline */}
                <p className="text-sm font-medium text-slate-700">
                  {startup.tagline}
                </p>

                {/* Description */}
                {startup.description && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    {startup.description}
                  </p>
                )}

                {/* ── AI Analysis section ── */}
                <div className="mt-5">
                  {startup.aiInsights ? (
                    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-sky-50 p-4">
                      {/* Header row */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-cyan-500" />
                          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-600">
                            AI Analysis
                          </span>
                        </div>
                        {isFounder && (
                          <button
                            onClick={handleReanalyse}
                            disabled={reanalysing}
                            title="Re-run analysis"
                            className="flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-[10px] font-medium text-cyan-600 transition hover:bg-cyan-50 disabled:opacity-50"
                          >
                            <RefreshCw
                              size={10}
                              className={reanalysing ? "animate-spin" : ""}
                            />
                            {reanalysing ? "Analysing…" : "Refresh"}
                          </button>
                        )}
                      </div>

                      {/* Three insight cards */}
                      <div className="space-y-2.5">
                        <AiCard
                          emoji="🚀"
                          label="What is it?"
                          text={startup.aiInsights.about}
                          accentClass="border-cyan-200 bg-white"
                        />
                        <AiCard
                          emoji="🔍"
                          label="Problem"
                          text={startup.aiInsights.problem}
                          accentClass="border-amber-100 bg-white"
                        />
                        <AiCard
                          emoji="💡"
                          label="Solution"
                          text={startup.aiInsights.solution}
                          accentClass="border-emerald-100 bg-white"
                        />
                      </div>

                      {startup.aiInsights.analysedAt && (
                        <p className="mt-2.5 text-right text-[9px] text-slate-400">
                          Analysed{" "}
                          {new Date(startup.aiInsights.analysedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : startup.website ? (
                    /* Website set but analysis pending */
                    <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                      <Sparkles size={14} className="text-slate-400 shrink-0" />
                      <p className="text-xs text-slate-400 italic">
                        AI analysis is being generated — check back in a moment.
                      </p>
                      {isFounder && (
                        <button
                          onClick={handleReanalyse}
                          disabled={reanalysing}
                          className="ml-auto shrink-0 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 hover:text-purple-600 hover:border-purple-200 transition"
                        >
                          <RefreshCw size={10} className={reanalysing ? "animate-spin" : ""} />
                          {reanalysing ? "Running…" : "Run now"}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>

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
                          className="h-8 w-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users size={13} />
                      {startup.members.length}{" "}
                      {startup.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                )}

                {/* ── Open Roles ── */}
                <div className="mt-6 mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Briefcase size={14} className="text-purple-600" />
                    Open Roles
                    {startup.openRoles.length > 0 && (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                        {startup.openRoles.length}
                      </span>
                    )}
                  </h3>

                  {startup.openRoles.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-400">
                      No open roles at the moment.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {startup.openRoles.map((role, idx) => (
                        <motion.li
                          key={role._id || `role-${idx}`}
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-purple-200 hover:bg-purple-50/50"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-950">
                              {role.title}
                            </span>
                            {role.description && (
                              <span className="line-clamp-1 text-xs text-slate-400">
                                {role.description}
                              </span>
                            )}
                            <span
                              className={`mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                roleTypeColors[role.type] ??
                                "bg-slate-50 text-slate-500"
                              }`}
                            >
                              <Clock size={9} />
                              {role.type}
                            </span>
                          </div>
                          <button
                            onClick={() => handleApply(role._id)}
                            className="ml-4 flex shrink-0 items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 transition hover:bg-purple-100"
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

// ── AI insight card ──────────────────────────────────────────────────────────
function AiCard({
  emoji,
  label,
  text,
  accentClass,
}: {
  emoji: string;
  label: string;
  text: string;
  accentClass: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${accentClass}`}>
      <div className="flex items-start gap-2">
        <span className="text-base leading-none shrink-0 mt-0.5">{emoji}</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            {label}
          </p>
          <p className="text-xs leading-relaxed text-slate-700">{text}</p>
        </div>
      </div>
    </div>
  );
}
