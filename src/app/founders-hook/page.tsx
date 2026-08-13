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
  ShieldAlert,
  Loader2,
  Quote,
} from "lucide-react";

type Me = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isFounder: boolean;
};

interface ApplicationItem {
  _id: string;
  applicant: { _id: string; name: string; username: string; avatarUrl: string };
  startup: { _id: string; name: string; icon: string };
  roleTitle: string;
  roleType: string;
  message: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
}

const roleTypeColors: Record<string, string> = {
  Internship: "bg-violet-50 text-violet-700 border border-violet-200",
  "Full-time": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Part-time": "bg-ink-800 text-sand-200 border border-ink-700",
};

const TABS = ["All", "Pending", "Accepted", "Rejected"] as const;

export default function FoundersHookPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [meLoading, setMeLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplications = useCallback((statusFilter: string) => {
    setLoading(true);
    const url =
      statusFilter && statusFilter !== "All"
        ? `/api/founders-hook?status=${statusFilter}`
        : "/api/founders-hook";

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setApplications(d.applications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        setMeLoading(false);
      })
      .catch(() => setMeLoading(false));
  }, []);

  useEffect(() => {
    loadApplications(activeTab);
  }, [activeTab, loadApplications]);

  async function handleUpdateStatus(id: string, newStatus: "Accepted" | "Rejected") {
    setUpdatingId(id);

    // Optimistic update
    setApplications((prev) =>
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
        loadApplications(activeTab);
      }
    } catch {
      loadApplications(activeTab);
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Loading state ──
  if (meLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50/60">
        <Sidebar user={null} />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-purple-600" />
        </main>
      </div>
    );
  }

  // ── Access denied for non-founders ──
  if (me && !me.isFounder) {
    return (
      <div className="flex min-h-screen bg-slate-50/60">
        <Sidebar user={me} />
        <main className="flex flex-1 items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <ShieldAlert size={32} />
            </div>
            <h1 className="font-display mb-3 text-2xl font-bold text-slate-900">
              Founders Only
            </h1>
            <p className="mb-8 leading-relaxed text-slate-500">
              This section is exclusively for founders who have published a startup.
              Create a startup to unlock your Founders Hook dashboard.
            </p>
            <a href="/feed" className="btn-purple">
              Go back to feed
            </a>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 text-slate-900 font-sans">
      <Sidebar user={me ? { ...me, isFounder: me.isFounder } : null} />

      <main className="relative min-w-0 flex-1 overflow-y-auto">
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-16 lg:pt-10 lg:px-10">
          {/* ── Header ── */}
          <div className="mb-10 border-b border-slate-200/80 pb-8">
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
              className="font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl"
            >
              Founders Hook
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500"
            >
              Review applications and messages for your startup roles
            </motion.p>
          </div>

          {/* ── Filter tabs ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </motion.div>

          {/* ── Content ── */}
          <div className="space-y-5">
            {loading ? (
              /* Skeleton cards */
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex animate-pulse flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row"
                  >
                    <div className="flex-1">
                      <div className="mb-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/3 rounded bg-slate-200" />
                          <div className="h-3 w-1/4 rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-4/5 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-3 sm:w-44">
                      <div className="h-10 rounded-xl bg-slate-200" />
                      <div className="h-10 rounded-xl bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-xs"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <Inbox size={32} />
                </div>
                <p className="font-display text-lg font-bold text-slate-900">
                  No applications yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  When someone applies to your startup roles, they&apos;ll appear here.
                </p>
              </motion.div>
            ) : (
              /* Application cards */
              <AnimatePresence mode="popLayout">
                {applications.map((app, index) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: index * 0.04, duration: 0.25 }}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col gap-0 sm:flex-row">
                      {/* ── Left: content ── */}
                      <div className="min-w-0 flex-1 p-6">
                        {/* Applicant header */}
                        <div className="mb-5 flex items-start justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-100 shadow-sm">
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
                              <h4 className="text-sm font-bold text-slate-950">
                                {app.applicant.name}
                              </h4>
                              <p className="text-xs text-slate-500">
                                @{app.applicant.username}
                              </p>
                            </div>
                          </div>
                          <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
                            <Clock size={12} />
                            {timeAgo(app.createdAt)}
                          </span>
                        </div>

                        {/* Role + startup info */}
                        <div className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs">
                          <span className="text-slate-500">Applied for</span>
                          <span className="font-semibold text-slate-900">
                            {app.roleTitle}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              roleTypeColors[app.roleType] ||
                              "border border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {app.roleType}
                          </span>
                          <span className="text-slate-400">at</span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5">
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
                            <span className="font-semibold text-slate-700">
                              {app.startup.name}
                            </span>
                          </span>
                        </div>

                        {/* Message */}
                        {app.message && (
                          <div className="relative rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                            <Quote
                              size={14}
                              className="absolute left-3 top-3 text-slate-300"
                            />
                            <p className="whitespace-pre-wrap pl-6 text-sm leading-relaxed text-slate-600">
                              {app.message}
                            </p>
                          </div>
                        )}

                        {/* Mobile timestamp */}
                        <span className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 sm:hidden">
                          <Clock size={12} />
                          {timeAgo(app.createdAt)}
                        </span>
                      </div>

                      {/* ── Right: actions ── */}
                      <div className="flex shrink-0 flex-col justify-center border-t border-slate-100 p-5 sm:w-48 sm:border-l sm:border-t-0">
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
                          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500">
                            <XCircle size={22} className="mb-1.5 text-slate-400" />
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
        </div>
      </main>
    </div>
  );
}
