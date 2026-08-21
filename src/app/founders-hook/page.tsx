"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { timeAgo } from "@/lib/timeAgo";
import {
  Anchor,
  CheckCircle,
  XCircle,
  Clock,
  Inbox,
  Loader2,
  Quote,
  FileText,
  Eye,
  Check,
  X,
  Mail,
  Phone,
  User,
  Briefcase,
  ExternalLink,
} from "lucide-react";

type Me = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isFounder: boolean;
  hasApplied?: boolean;
};

// ── Founder's view application type ──
interface FounderApplicationItem {
  _id: string;
  applicant: { _id: string; name: string; username: string; avatarUrl: string; email?: string };
  startup: { _id: string; name: string; icon: string };
  roleTitle: string;
  roleType: string;
  name?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  experience?: string;
  resumeUrl?: string;
  resumeName?: string;
  message: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
}

// ── Applicant's view application type ──
interface ApplicantApplicationItem {
  _id: string;
  startup: { _id: string; name: string; icon: string };
  roleTitle: string;
  roleType: string;
  name?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  experience?: string;
  resumeUrl?: string;
  resumeName?: string;
  message: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
}

const roleTypeColors: Record<string, string> = {
  Internship: "bg-violet-900/40 text-violet-300 border border-violet-800",
  "Full-time": "bg-emerald-900/40 text-emerald-300 border border-emerald-800",
  "Part-time": "bg-ink-800 text-sand-200 border border-ink-700",
};

const TABS = ["All", "Pending", "Accepted", "Rejected"] as const;

// ═══════════════════════════════════════════════════════
// Status Progress Tracker Component (like shipping status)
// ═══════════════════════════════════════════════════════
function StatusTracker({ status }: { status: "Pending" | "Accepted" | "Rejected" }) {
  // Step states
  const step1Done = true; // "Application Submitted" is always done
  const step2Done = status !== "Pending"; // "Application Reviewed" when founder acts
  const step3Done = status === "Accepted" || status === "Rejected";
  const isRejected = status === "Rejected";

  const steps = [
    {
      title: "Application Submitted",
      subtitle: "Sent to founder",
      done: step1Done,
      icon: FileText,
    },
    {
      title: "Application Reviewed",
      subtitle: step2Done ? "Reviewed by founder" : "Under review",
      done: step2Done,
      icon: Eye,
    },
    {
      title: isRejected ? "Application Rejected" : "Application Accepted",
      subtitle: isRejected
        ? "Not selected"
        : status === "Accepted"
        ? "Accepted by founder"
        : "Awaiting decision",
      done: step3Done,
      icon: isRejected ? X : Check,
    },
  ];

  return (
    <div className="w-full py-5 px-2 sm:px-4">
      {/* Current status highlight bar at top */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-700/80 bg-ink-900/90 px-4 py-2.5">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-sand-300">
          Application Progress
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs sm:text-sm font-bold ${
            status === "Accepted"
              ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              : status === "Rejected"
              ? "border border-red-500/30 bg-red-500/15 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
              : "border border-amber-500/30 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          }`}
        >
          {status === "Accepted"
            ? "✓ Accepted"
            : status === "Rejected"
            ? "✕ Rejected"
            : "⏳ Under Review"}
        </span>
      </div>

      {/* Stepper progress */}
      <div className="relative flex items-start justify-between">
        {/* Background track line */}
        <div className="absolute top-[22px] left-[24px] right-[24px] h-[5px] rounded-full bg-ink-700" />

        {/* Filled progress line */}
        <div
          className="absolute top-[22px] left-[24px] h-[5px] rounded-full transition-all duration-500"
          style={{
            width: step3Done
              ? "calc(100% - 48px)"
              : step2Done
              ? "calc(50% - 24px)"
              : "0%",
            backgroundColor: isRejected && step3Done ? "#ef4444" : "#f59e0b",
            boxShadow:
              isRejected && step3Done
                ? "0 0 14px rgba(239, 68, 68, 0.6)"
                : "0 0 14px rgba(245, 158, 11, 0.6)",
          }}
        />

        {/* Steps */}
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isLast = i === steps.length - 1;
          const isFailed = isLast && isRejected && step.done;

          let dotBg = "bg-ink-900 border-ink-600 text-sand-300";
          let textColor = "text-sand-200";
          let subTextColor = "text-sand-400";

          if (step.done) {
            if (isFailed) {
              dotBg =
                "bg-red-500 border-red-300 text-white shadow-[0_0_18px_rgba(239,68,68,0.5)]";
              textColor = "text-red-300";
              subTextColor = "text-red-300/90";
            } else {
              dotBg =
                "bg-amber-500 border-amber-300 text-white shadow-[0_0_18px_rgba(245,158,11,0.5)]";
              textColor = "text-amber-300";
              subTextColor = "text-amber-300/90";
            }
          }

          return (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center text-center px-1"
              style={{ width: "33.33%", maxWidth: "180px" }}
            >
              {/* Dot Node */}
              <div
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 ${dotBg} transition-all duration-300`}
              >
                <StepIcon size={20} className="shrink-0" strokeWidth={2.5} />
              </div>

              {/* Title */}
              <span
                className={`mt-3 text-xs sm:text-sm font-bold leading-tight ${textColor}`}
              >
                {step.title}
              </span>

              {/* Subtitle */}
              <span className={`mt-1 text-[11px] sm:text-xs font-medium ${subTextColor}`}>
                {step.subtitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════
export default function FoundersHookPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  // Founder state
  const [founderApplications, setFounderApplications] = useState<FounderApplicationItem[]>([]);
  const [founderLoading, setFounderLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Applicant state
  const [myApplications, setMyApplications] = useState<ApplicantApplicationItem[]>([]);
  const [applicantLoading, setApplicantLoading] = useState(true);

  // ── Fetch current user ──
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        setMeLoading(false);
      })
      .catch(() => setMeLoading(false));
  }, []);

  // ── Founder: load applications ──
  const loadFounderApplications = useCallback((statusFilter: string) => {
    setFounderLoading(true);
    const url =
      statusFilter && statusFilter !== "All"
        ? `/api/founders-hook?status=${statusFilter}`
        : "/api/founders-hook";

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setFounderApplications(d.applications || []);
        setFounderLoading(false);
      })
      .catch(() => setFounderLoading(false));
  }, []);

  // ── Applicant: load my applications ──
  const loadMyApplications = useCallback(() => {
    setApplicantLoading(true);
    fetch("/api/founders-hook?view=my-applications")
      .then((r) => r.json())
      .then((d) => {
        setMyApplications(d.applications || []);
        setApplicantLoading(false);
      })
      .catch(() => setApplicantLoading(false));
  }, []);

  // Load data based on user role
  useEffect(() => {
    if (!me) return;
    if (me.isFounder) {
      loadFounderApplications(activeTab);
    }
    // Always load my applications for every user
    loadMyApplications();
  }, [me, activeTab, loadFounderApplications, loadMyApplications]);

  async function handleUpdateStatus(id: string, newStatus: "Accepted" | "Rejected") {
    setUpdatingId(id);

    // Optimistic update
    setFounderApplications((prev) =>
      prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
    );

    try {
      const res = await fetch(`/api/founders-hook/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        loadFounderApplications(activeTab);
      }
    } catch {
      loadFounderApplications(activeTab);
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Loading state ──
  if (meLoading) {
    return (
      <div className="flex min-h-screen bg-ink-950 text-sand-200" style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}>
        <Sidebar user={null} />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-white" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink-950 text-sand-200" style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}>
      <Sidebar user={me ? { ...me, isFounder: me.isFounder, hasApplied: me.hasApplied } : null} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        {/* Background Image Overlay restricted to header */}
        <div
          className="absolute top-0 left-0 right-0 h-72 z-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: "url('YOUR_CLOUDINARY_IMAGE_URL_HERE')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-16 lg:pt-10 lg:px-10">
          {/* ── Header ── */}
          <div className="mb-10 border-b border-ink-700/80 pb-8 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="badge-purple mb-4 inline-flex"
            >
              <Anchor size={14} />
              Founders Hook
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-3xl font-extrabold tracking-tight text-sand-100 sm:text-4xl"
            >
              Founders Hook
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 max-w-xl text-sm leading-relaxed text-sand-400"
            >
              {me?.isFounder
                ? "Review applications and manage your startup roles"
                : "Track your job applications and explore startup opportunities"}
            </motion.p>
          </div>

          {/* ═══════════════════════════════════════════════
              FOUNDER SECTION — Your Startup Applications
              ═══════════════════════════════════════════════ */}
          <section className="mb-12">
            <h2 className="mb-5 text-lg font-bold text-sand-100">
              {me?.isFounder ? "📥 Received Applications" : "🚀 Your Startup"}
            </h2>

            {me?.isFounder ? (
              <>
                {/* ── Filter tabs ── */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-8 flex flex-wrap justify-start gap-2"
                >
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                        activeTab === tab
                          ? "bg-white text-white shadow-md shadow-white/20"
                          : "border border-ink-700/60 bg-ink-850 text-sand-400 hover:border-ink-700 hover:bg-ink-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </motion.div>

                {/* ── Content ── */}
                <div className="space-y-5">
                  {founderLoading ? (
                    /* Skeleton cards */
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex animate-pulse flex-col gap-6 rounded-2xl border border-ink-700/60 bg-ink-850 p-6 shadow-xs sm:flex-row"
                        >
                          <div className="flex-1">
                            <div className="mb-5 flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-ink-800" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 rounded bg-ink-800" />
                                <div className="h-3 w-1/4 rounded bg-ink-800" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 w-full rounded bg-ink-800" />
                              <div className="h-4 w-4/5 rounded bg-ink-800" />
                            </div>
                          </div>
                          <div className="flex flex-col justify-center gap-3 sm:w-44">
                            <div className="h-10 rounded-xl bg-ink-800" />
                            <div className="h-10 rounded-xl bg-ink-800" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : founderApplications.length === 0 ? (
                    /* Empty state */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl border-2 border-dashed border-ink-700 bg-ink-850 px-8 py-16 text-center shadow-xs"
                    >
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                        <Inbox size={32} />
                      </div>
                      <p className="font-display text-lg font-bold text-sand-200">
                        No applications yet
                      </p>
                      <p className="mt-2 text-sm text-sand-400">
                        When someone applies to your startup roles, they&apos;ll appear here.
                      </p>
                    </motion.div>
                  ) : (
                    /* Application cards */
                    <AnimatePresence mode="popLayout">
                      {founderApplications.map((app, index) => (
                        <motion.div
                          key={app._id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ delay: index * 0.04, duration: 0.25 }}
                          className="group overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850 shadow-xs transition-shadow hover:shadow-md"
                        >
                          <div className="flex flex-col gap-0 sm:flex-row">
                            {/* ── Left: content ── */}
                            <div className="min-w-0 flex-1 p-6">
                              {/* Applicant header */}
                              <div className="mb-5 flex items-start justify-between">
                                <div className="flex items-center gap-3.5">
                                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ink-800 shadow-sm">
                                    <Image
                                      src={
                                        app.applicant.avatarUrl ||
                                        "https://picsum.photos/seed/user/64/64"
                                      }
                                      alt={app.applicant.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-sand-100">
                                      {app.applicant.name}
                                    </h4>
                                    <p className="text-xs text-sand-400">
                                      @{app.applicant.username}
                                    </p>
                                  </div>
                                </div>
                                <span className="hidden items-center gap-1.5 text-xs text-sand-600 sm:flex">
                                  <Clock size={12} />
                                  {timeAgo(app.createdAt)}
                                </span>
                              </div>

                              {/* Role + startup info */}
                              <div className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs">
                                <span className="text-sand-400">Applied for</span>
                                <span className="font-semibold text-sand-200">
                                  {app.roleTitle}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                    roleTypeColors[app.roleType] ||
                                    "border border-ink-700/60 bg-ink-900 text-sand-400"
                                  }`}
                                >
                                  {app.roleType}
                                </span>
                                <span className="text-sand-600">at</span>
                                <span className="inline-flex items-center gap-1 rounded-md border border-ink-800 bg-ink-900 px-2 py-0.5">
                                  {app.startup.icon?.startsWith("http") ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={app.startup.icon}
                                      alt=""
                                      className="h-3.5 w-3.5 rounded object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm leading-none">
                                      {app.startup.icon || "🚀"}
                                    </span>
                                  )}
                                  <span className="font-semibold text-sand-300">
                                    {app.startup.name}
                                  </span>
                                </span>
                              </div>

                              {/* Candidate Profile Details & Resume */}
                              <div className="mb-4 rounded-xl border border-ink-800 bg-ink-900/80 p-3.5 space-y-2.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  {app.email && (
                                    <div className="flex items-center gap-2 text-sand-300">
                                      <Mail size={13} className="text-sand-500 shrink-0" />
                                      <span className="truncate">{app.email}</span>
                                    </div>
                                  )}
                                  {app.mobile && (
                                    <div className="flex items-center gap-2 text-sand-300">
                                      <Phone size={13} className="text-sand-500 shrink-0" />
                                      <span>{app.mobile}</span>
                                    </div>
                                  )}
                                  {app.gender && (
                                    <div className="flex items-center gap-2 text-sand-300">
                                      <User size={13} className="text-sand-500 shrink-0" />
                                      <span>Gender: {app.gender}</span>
                                    </div>
                                  )}
                                  {app.experience && (
                                    <div className="flex items-center gap-2 text-sand-300">
                                      <Briefcase size={13} className="text-sand-500 shrink-0" />
                                      <span>Exp: {app.experience}</span>
                                    </div>
                                  )}
                                </div>

                                {/* PDF Resume Link */}
                                {app.resumeUrl && (
                                  <div className="border-t border-ink-800 pt-2 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 truncate">
                                      <FileText size={15} className="shrink-0" />
                                      <span className="truncate">{app.resumeName || "Candidate_Resume.pdf"}</span>
                                    </div>
                                    <a
                                      href={app.resumeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={app.resumeName || "Resume.pdf"}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors shrink-0"
                                    >
                                      <ExternalLink size={12} /> View / Download PDF
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Message */}
                              {app.message && (
                                <div className="relative rounded-xl border border-ink-800 bg-ink-850 p-4">
                                  <Quote
                                    size={14}
                                    className="absolute left-3 top-3 text-ink-600"
                                  />
                                  <p className="whitespace-pre-wrap pl-6 text-sm leading-relaxed text-sand-400">
                                    {app.message}
                                  </p>
                                </div>
                              )}

                              {/* Mobile timestamp */}
                              <span className="mt-3 flex items-center gap-1.5 text-xs text-sand-600 sm:hidden">
                                <Clock size={12} />
                                {timeAgo(app.createdAt)}
                              </span>
                            </div>

                            {/* ── Right: actions ── */}
                            <div className="flex shrink-0 flex-col justify-center border-t border-ink-800 p-5 sm:w-48 sm:border-l sm:border-t-0">
                              {app.status === "Pending" ? (
                                <div className="space-y-2.5">
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(app._id, "Accepted")
                                    }
                                    disabled={updatingId === app._id}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                                  >
                                    {updatingId === app._id ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle size={14} />
                                        Accept
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(app._id, "Rejected")
                                    }
                                    disabled={updatingId === app._id}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                                  >
                                    <XCircle size={14} />
                                    Reject
                                  </button>
                                </div>
                              ) : app.status === "Accepted" ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700">
                                  <CheckCircle size={22} className="mb-1.5 text-emerald-500" />
                                  <span className="text-sm font-bold">Accepted</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-ink-700/60 bg-ink-900 p-4 text-sand-400">
                                  <XCircle size={22} className="mb-1.5 text-sand-600" />
                                  <span className="text-sm font-bold">Rejected</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </>
            ) : (
              /* Non-founder: No startup message */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border-2 border-dashed border-ink-700 bg-ink-850 px-8 py-12 text-center shadow-xs"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                  <Anchor size={28} />
                </div>
                <p className="font-display text-lg font-bold text-sand-200">
                  No startup yet
                </p>
                <p className="mt-2 text-sm text-sand-400">
                  Create a startup from the feed to receive applications and manage your team.
                </p>
                <a href="/feed" className="btn-white mt-5 inline-block">
                  Go to Feed
                </a>
              </motion.div>
            )}
          </section>

          {/* ═══════════════════════════════════════════════
              MY APPLICATIONS — Shown to everyone
              ═══════════════════════════════════════════════ */}
          <section>
            <h2 className="mb-5 text-lg font-bold text-sand-100">
              📋 My Applications
            </h2>

            <div className="space-y-5">
              {applicantLoading ? (
                /* Skeleton cards */
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-2xl border border-ink-700/60 bg-ink-850 p-6 shadow-xs"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-ink-800" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/3 rounded bg-ink-800" />
                          <div className="h-3 w-1/4 rounded bg-ink-800" />
                        </div>
                      </div>
                      <div className="flex justify-between px-4 py-6">
                        <div className="h-7 w-7 rounded-full bg-ink-800" />
                        <div className="h-7 w-7 rounded-full bg-ink-800" />
                        <div className="h-7 w-7 rounded-full bg-ink-800" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : myApplications.length === 0 ? (
                /* Empty state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border-2 border-dashed border-ink-700 bg-ink-850 px-8 py-12 text-center shadow-xs"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                    <Inbox size={28} />
                  </div>
                  <p className="font-display text-lg font-bold text-sand-200">
                    No applications yet
                  </p>
                  <p className="mt-2 text-sm text-sand-400">
                    Apply to startup roles from the feed to track your applications here.
                  </p>
                  <a href="/feed" className="btn-white mt-5 inline-block">
                    Browse startups
                  </a>
                </motion.div>
              ) : (
                /* Applicant application cards with status tracker */
                <AnimatePresence mode="popLayout">
                  {myApplications.map((app, index) => (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: index * 0.04, duration: 0.25 }}
                      className="group overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850 shadow-xs transition-shadow hover:shadow-md"
                    >
                      {/* Card header: Startup info + role */}
                      <div className="p-6 pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3.5">
                            {/* Startup icon */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-ink-700/80 bg-ink-900 shadow-sm">
                              {app.startup.icon?.startsWith("http") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={app.startup.icon}
                                  alt=""
                                  className="h-8 w-8 rounded-lg object-cover"
                                />
                              ) : (
                                <span className="text-2xl leading-none">
                                  {app.startup.icon || "🚀"}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-base sm:text-lg font-bold text-sand-100">
                                {app.startup.name}
                              </h4>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                <span className="text-sand-300">Applied for</span>
                                <span className="font-bold text-sand-100">
                                  {app.roleTitle}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                                    roleTypeColors[app.roleType] ||
                                    "border border-ink-700/60 bg-ink-900 text-sand-300"
                                  }`}
                                >
                                  {app.roleType}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-sand-400">
                            <Clock size={14} />
                            {timeAgo(app.createdAt)}
                          </span>
                        </div>

                        {/* Applicant submitted details & resume */}
                        {(app.email || app.mobile || app.resumeUrl || app.experience) && (
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-ink-800 bg-ink-900/60 px-4 py-2.5 text-xs">
                            <div className="flex flex-wrap items-center gap-3 text-sand-300">
                              {app.mobile && (
                                <span className="flex items-center gap-1.5">
                                  <Phone size={13} className="text-sand-500" /> {app.mobile}
                                </span>
                              )}
                              {app.experience && (
                                <span className="flex items-center gap-1.5">
                                  <Briefcase size={13} className="text-sand-500" /> {app.experience}
                                </span>
                              )}
                            </div>
                            {app.resumeUrl && (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={app.resumeName || "Resume.pdf"}
                                className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <FileText size={14} /> {app.resumeName || "View Resume (PDF)"}
                              </a>
                            )}
                          </div>
                        )}

                        {/* Application message if any */}
                        {app.message && (
                          <div className="relative mt-4 rounded-xl border border-ink-800 bg-ink-900/70 p-4">
                            <Quote
                              size={16}
                              className="absolute left-3.5 top-3.5 text-sand-400"
                            />
                            <p className="whitespace-pre-wrap pl-7 text-sm sm:text-base leading-relaxed text-sand-200">
                              {app.message}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status Progress Tracker */}
                      <div className="border-t border-ink-800 px-6 py-2">
                        <StatusTracker status={app.status} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
