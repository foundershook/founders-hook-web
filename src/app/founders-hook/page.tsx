"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { timeAgo } from "@/lib/timeAgo";
import {
  Anchor,
  Loader2,
  ExternalLink,
  MessageSquare,
  Briefcase,
  FileText,
  Clock,
  Check,
  X,
  ChevronDown,
  Search,
  Inbox,
  Send,
  Mail,
  Phone,
  User,
  Building,
  Sparkles,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";
import { StartupLogo } from "@/components/StartupMedia";
import { syncFirestoreConversation, sendChatMessage } from "@/lib/chat";

type Me = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  isFounder: boolean;
  hasApplied?: boolean;
};

interface ReceivedApplication {
  _id: string;
  applicant: {
    _id: string;
    name: string;
    username: string;
    avatarUrl: string;
    email?: string;
  };
  name?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  experience?: string;
  resumeUrl?: string;
  resumeName?: string;
  startup: {
    _id: string;
    name: string;
    icon?: string;
  };
  roleTitle: string;
  roleType?: string;
  message?: string;
  status: "Pending" | "Accepted" | "Rejected" | string;
  createdAt: string;
}

interface SubmittedApplication {
  _id: string;
  startup: {
    _id: string;
    name: string;
    icon?: string;
  };
  roleTitle: string;
  roleType?: string;
  name?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  experience?: string;
  resumeUrl?: string;
  resumeName?: string;
  message?: string;
  status: "Pending" | "Accepted" | "Rejected" | string;
  createdAt: string;
}

type StatusFilter = "ALL" | "Pending" | "Accepted" | "Rejected";

function FoundersHookContent() {
  const searchParams = useSearchParams();
  const targetApplicationId = searchParams.get("applicationId");

  const [me, setMe] = useState<Me | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  // Tab state: "received" (for founders) or "submitted" (for applicants)
  const [activeTab, setActiveTab] = useState<"received" | "submitted">("received");

  // Data lists
  const [receivedApps, setReceivedApps] = useState<ReceivedApplication[]>([]);
  const [submittedApps, setSubmittedApps] = useState<SubmittedApplication[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded card tracking (accordion)
  const [expandedId, setExpandedId] = useState<string | null>(targetApplicationId || null);

  // Status update mutation tracking
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Decision Modal State for Accept / Reject with custom DM
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    app: ReceivedApplication | null;
    status: "Accepted" | "Rejected";
    message: string;
  }>({
    isOpen: false,
    app: null,
    status: "Accepted",
    message: "",
  });

  // 1. Fetch current authenticated user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setMe(data.user);
          // Default tab: founders see "received" by default, non-founders see "submitted"
          if (!data.user.isFounder) {
            setActiveTab("submitted");
          }
        }
        setMeLoading(false);
      })
      .catch(() => setMeLoading(false));
  }, []);

  // 2. Fetch applications depending on user role
  const loadApplications = useCallback(async () => {
    if (!me) return;
    setLoadingData(true);

    try {
      if (me.isFounder) {
        // Fetch received applications for founder's startups
        const resReceived = await fetch("/api/founders-hook");
        if (resReceived.ok) {
          const data = await resReceived.json();
          setReceivedApps(data.applications || []);
        }

        // Also fetch submitted applications if any
        const resSubmitted = await fetch("/api/founders-hook?view=my-applications");
        if (resSubmitted.ok) {
          const data = await resSubmitted.json();
          setSubmittedApps(data.applications || []);
        }
      } else {
        // Non-founder: fetch submitted applications
        const resSubmitted = await fetch("/api/founders-hook?view=my-applications");
        if (resSubmitted.ok) {
          const data = await resSubmitted.json();
          setSubmittedApps(data.applications || []);
        }
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoadingData(false);
    }
  }, [me]);

  useEffect(() => {
    if (me) {
      loadApplications();
    }
  }, [me, loadApplications]);

  // Set target application from URL query if present
  useEffect(() => {
    if (targetApplicationId) {
      setExpandedId(targetApplicationId);
    }
  }, [targetApplicationId]);

  // 3. Open Decision Modal
  const openAcceptModal = (app: ReceivedApplication) => {
    const candidateName = app.name || app.applicant?.name || "there";
    const startupName = app.startup?.name || "our startup";
    const roleTitle = app.roleTitle || "this role";

    setDecisionModal({
      isOpen: true,
      app,
      status: "Accepted",
      message: `Hi ${candidateName}! 🎉\n\nCongratulations! We reviewed your application and were very impressed with your background. We are excited to accept your application for the ${roleTitle} position at ${startupName}.\n\nLet's connect here in messages to discuss the next steps!`,
    });
  };

  const openRejectModal = (app: ReceivedApplication) => {
    const candidateName = app.name || app.applicant?.name || "there";
    const startupName = app.startup?.name || "our startup";
    const roleTitle = app.roleTitle || "this role";

    setDecisionModal({
      isOpen: true,
      app,
      status: "Rejected",
      message: `Hi ${candidateName},\n\nThank you for taking the time to apply for the ${roleTitle} role at ${startupName}. While we were impressed with your application, we have decided to move forward with other candidates whose experience more closely matches our current needs.\n\nWe wish you all the best in your career search!`,
    });
  };

  // 4. Confirm Decision: updates MongoDB status, creates Notification, and sends DM in Firestore chat
  const handleConfirmDecision = async () => {
    if (!decisionModal.app || !me) return;
    const { app, status, message } = decisionModal;
    const appId = app._id;
    setUpdatingId(appId);

    try {
      // Step A: Update status in MongoDB and trigger applicant notification
      const res = await fetch(`/api/founders-hook/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, message }),
      });

      if (res.ok) {
        // Step B: Sync Firestore conversation & post the DM message
        const convoId = `app_${appId}`;
        const applicantId = app.applicant?._id || "";
        const startupId = app.startup?._id || "";
        const startupName = app.startup?.name || "Startup";

        try {
          await syncFirestoreConversation({
            id: convoId,
            participants: [me.id, applicantId].filter(Boolean),
            type: "application",
            applicationId: appId,
            startupId: startupId,
            application: {
              _id: appId,
              roleTitle: app.roleTitle,
              status: status,
            },
            startup: {
              _id: startupId,
              name: startupName,
            },
          });

          if (message.trim()) {
            await sendChatMessage(
              convoId,
              {
                _id: me.id,
                name: me.name || "Founder",
                username: me.username || "",
                avatarUrl: me.avatarUrl || "",
              },
              message.trim()
            );
          }
        } catch (chatErr) {
          console.error("Failed to post decision message to Firestore chat:", chatErr);
        }

        // Step C: Update local UI state
        setReceivedApps((prev) =>
          prev.map((item) => (item._id === appId ? { ...item, status } : item))
        );

        // Close modal
        setDecisionModal({ isOpen: false, app: null, status: "Accepted", message: "" });
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error("Error confirming decision:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 5. Compute filtered lists
  const currentList = activeTab === "received" ? receivedApps : submittedApps;

  const counts = useMemo(() => {
    const list = activeTab === "received" ? receivedApps : submittedApps;
    return {
      all: list.length,
      pending: list.filter((a) => a.status === "Pending").length,
      accepted: list.filter((a) => a.status === "Accepted").length,
      rejected: list.filter((a) => a.status === "Rejected").length,
    };
  }, [activeTab, receivedApps, submittedApps]);

  const filteredApplications = useMemo(() => {
    return currentList.filter((app) => {
      // Filter by status
      if (statusFilter !== "ALL" && app.status !== statusFilter) {
        return false;
      }

      // Filter by search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const candidateName =
        (activeTab === "received" ? (app as ReceivedApplication).applicant?.name : (app as SubmittedApplication).name) || "";
      const startupName = app.startup?.name || "";
      const roleTitle = app.roleTitle || "";
      const email = app.email || "";

      return (
        candidateName.toLowerCase().includes(q) ||
        startupName.toLowerCase().includes(q) ||
        roleTitle.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q)
      );
    });
  }, [currentList, statusFilter, searchQuery, activeTab]);

  if (meLoading) {
    return (
      <div className="flex min-h-screen bg-ink-950 text-sand-200">
        <Sidebar user={null} />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-white" />
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen bg-ink-950 text-sand-200"
      style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
    >
      <Sidebar user={me ? { ...me, isFounder: me.isFounder, hasApplied: me.hasApplied } : null} />

      <main className="flex flex-1 flex-col h-screen overflow-y-auto relative custom-scrollbar">
        {/* Ambient Top Background Image Banner */}
        <div
          className="absolute top-0 left-0 right-0 h-80 z-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/t7efuhnd/image/upload/v1787576104/data-center-manager-supervising-technician-monitoring-system-performance_r8ox2w.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          }}
        />

        <div className="relative z-10 w-full px-5 pt-20 lg:pt-12 lg:px-10 pb-16 max-w-7xl mx-auto">
          {/* Header Title & Badge */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white shadow-sm mb-3"
            >
              <Anchor size={13} className="text-sand-300" />
              Founders Hook
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl font-extrabold tracking-tight text-sand-100 sm:text-4xl font-display"
            >
              {me?.isFounder ? "Startup Applications" : "My Applications"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-sand-400 max-w-2xl"
            >
              {me?.isFounder
                ? "Review applications received for open roles across your startups, manage candidate decisions, and connect directly via message or video call."
                : "Track the status of your applications to startups."}
            </motion.p>
          </div>

          {/* Tab Switcher (Visible to founders who also have submitted applications, or when isFounder) */}
          {me?.isFounder && (
            <div className="flex items-center gap-2 mb-6 border-b border-ink-800/80 pb-4">
              <button
                onClick={() => {
                  setActiveTab("received");
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "received"
                    ? "bg-white text-ink-950 shadow-glow"
                    : "text-sand-400 hover:text-sand-200 hover:bg-ink-900/60"
                }`}
              >
                <Inbox size={16} />
                <span>Applications Received</span>
                {receivedApps.length > 0 && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                      activeTab === "received"
                        ? "bg-ink-950 text-white"
                        : "bg-ink-800 text-sand-300"
                    }`}
                  >
                    {receivedApps.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("submitted");
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "submitted"
                    ? "bg-white text-ink-950 shadow-glow"
                    : "text-sand-400 hover:text-sand-200 hover:bg-ink-900/60"
                }`}
              >
                <Send size={15} />
                <span>My Submitted Applications</span>
                {submittedApps.length > 0 && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                      activeTab === "submitted"
                        ? "bg-ink-950 text-white"
                        : "bg-ink-800 text-sand-300"
                    }`}
                  >
                    {submittedApps.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Search Bar and Status Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              {(
                [
                  { id: "ALL", label: "All", count: counts.all },
                  { id: "Pending", label: "Pending", count: counts.pending },
                  { id: "Accepted", label: "Accepted", count: counts.accepted },
                  { id: "Rejected", label: "Rejected", count: counts.rejected },
                ] as const
              ).map((f) => {
                const isSelected = statusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      isSelected
                        ? "bg-white text-ink-950 shadow-sm font-bold"
                        : "bg-ink-900/80 border border-ink-800 text-sand-400 hover:border-ink-700 hover:text-sand-200"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected
                          ? "bg-ink-950/20 text-ink-950 font-bold"
                          : "bg-ink-800 text-sand-400"
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] sm:w-72">
              <Search
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "received"
                    ? "Search candidate, role, email..."
                    : "Search startup, role..."
                }
                className="h-9 w-full rounded-full border border-ink-700/80 bg-ink-900/80 pl-9 pr-4 text-xs text-white placeholder:text-sand-500 outline-none transition-all focus:border-white/40 focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Applications List Area */}
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-28 text-sand-400">
              <Loader2 size={32} className="animate-spin text-white mb-3" />
              <p className="text-xs">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-dashed border-ink-800 bg-ink-900/40 p-12 text-center max-w-xl mx-auto my-8"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-850 border border-ink-700/80 text-sand-400">
                {activeTab === "received" ? <Inbox size={26} /> : <Briefcase size={26} />}
              </div>

              <h3 className="text-base font-bold text-sand-100 mb-1">
                {searchQuery || statusFilter !== "ALL"
                  ? "No matching applications"
                  : activeTab === "received"
                  ? "No applications received yet"
                  : "You haven't submitted any applications yet"}
              </h3>

              <p className="text-xs text-sand-400 max-w-md mx-auto leading-relaxed mb-6">
                {searchQuery || statusFilter !== "ALL"
                  ? "Try resetting your search query or status filter to see more applications."
                  : activeTab === "received"
                  ? "When candidates apply for your startup's open positions, their full details and resume will be displayed here."
                  : "Explore impactful startups on Founders Hook and apply to join their founding team."}
              </p>

              {activeTab === "submitted" && !searchQuery && statusFilter === "ALL" && (
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-ink-950 text-xs font-bold shadow-glow hover:bg-sand-100 transition-all active:scale-95"
                >
                  <Sparkles size={14} />
                  <span>Discover Startups</span>
                </Link>
              )}
            </motion.div>
          ) : (
            /* Application Cards Grid */
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const isReceived = activeTab === "received";
                const isExpanded = expandedId === app._id;
                const isUpdating = updatingId === app._id;

                const receivedItem = isReceived ? (app as ReceivedApplication) : null;
                const submittedItem = !isReceived ? (app as SubmittedApplication) : null;

                const applicantName =
                  receivedItem?.name || receivedItem?.applicant?.name || "Candidate";
                const candidateAvatar = receivedItem?.applicant?.avatarUrl;
                const startupName = app.startup?.name || "Startup";
                const roleTitle = app.roleTitle || "Role";
                const status = app.status || "Pending";

                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? "border-white/30 bg-ink-900/90 shadow-xl"
                        : "border-ink-800/80 bg-ink-900/40 hover:border-ink-700 hover:bg-ink-900/70"
                    }`}
                  >
                    {/* Top Row: Card Summary */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : app._id)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer select-none"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        {/* Avatar / Startup Logo */}
                        <div className="shrink-0">
                          {isReceived ? (
                            candidateAvatar ? (
                              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-ink-700 bg-ink-800">
                                <Image
                                  src={candidateAvatar}
                                  alt={applicantName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center font-bold text-sand-200 text-sm">
                                {applicantName.charAt(0).toUpperCase()}
                              </div>
                            )
                          ) : (
                            <StartupLogo
                              icon={submittedItem?.startup?.icon}
                              name={startupName}
                              id={submittedItem?.startup?._id}
                              size="md"
                              className="!rounded-full border border-ink-700/60"
                            />
                          )}
                        </div>

                        {/* Text summary */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-sand-100 text-sm truncate">
                              {isReceived ? applicantName : startupName}
                            </h3>

                            {/* Status badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                status === "Accepted"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : status === "Rejected"
                                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {status === "Accepted" ? (
                                <Check size={11} />
                              ) : status === "Rejected" ? (
                                <X size={11} />
                              ) : (
                                <Clock size={11} />
                              )}
                              {status === "Pending" ? "Under Review" : status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sand-400">
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <Briefcase size={12} />
                              {roleTitle}
                              {app.roleType && (
                                <span className="text-sand-500">• {app.roleType}</span>
                              )}
                            </span>

                            {isReceived && startupName && (
                              <span className="text-sand-400 flex items-center gap-1">
                                <Building size={12} className="text-sand-500" />
                                {startupName}
                              </span>
                            )}

                            <span className="text-sand-500">{timeAgo(app.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        {/* Direct Chat Link for Founders */}
                        {isReceived && (
                          <Link
                            href={`/messages?conversationId=${app._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-ink-700 bg-ink-800 hover:bg-emerald-500/15 hover:border-emerald-500/30 text-sand-300 hover:text-emerald-300 text-xs font-semibold transition-all shadow-sm"
                          >
                            <MessageSquare size={13} />
                            <span>Chat</span>
                          </Link>
                        )}

                        {/* Accordion trigger icon */}
                        <div
                          className={`p-1.5 text-sand-500 transition-transform ${
                            isExpanded ? "rotate-180 text-sand-200" : ""
                          }`}
                        >
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Details Area */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-ink-800/80 bg-ink-950/40 px-5 py-5"
                        >
                          <div className="space-y-4">
                            {/* Candidate Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-ink-900/60 border border-ink-800/60 text-xs">
                              {app.email && (
                                <div className="space-y-0.5">
                                  <span className="text-sand-500 font-medium flex items-center gap-1">
                                    <Mail size={12} /> Email
                                  </span>
                                  <a
                                    href={`mailto:${app.email}`}
                                    className="text-sand-200 font-semibold hover:underline truncate block"
                                  >
                                    {app.email}
                                  </a>
                                </div>
                              )}

                              {app.mobile && (
                                <div className="space-y-0.5">
                                  <span className="text-sand-500 font-medium flex items-center gap-1">
                                    <Phone size={12} /> Mobile
                                  </span>
                                  <span className="text-sand-200 font-semibold block">
                                    {app.mobile}
                                  </span>
                                </div>
                              )}

                              {app.experience && (
                                <div className="space-y-0.5">
                                  <span className="text-sand-500 font-medium flex items-center gap-1">
                                    <Briefcase size={12} /> Experience
                                  </span>
                                  <span className="text-sand-200 font-semibold block truncate">
                                    {app.experience}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Cover Letter / Message */}
                            {app.message && (
                              <div className="space-y-1.5">
                                <span className="text-xs font-semibold text-sand-400">
                                  Cover Letter / Application Note:
                                </span>
                                <div className="p-4 rounded-xl bg-ink-900/40 border border-ink-800/70 text-xs sm:text-sm text-sand-200 whitespace-pre-wrap leading-relaxed">
                                  {app.message}
                                </div>
                              </div>
                            )}

                            {/* Attached Resume */}
                            {app.resumeUrl && (
                              <div>
                                <span className="text-xs font-semibold text-sand-400 block mb-2">
                                  📎 Attached Resume:
                                </span>
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-ink-850 hover:bg-emerald-500/15 border border-ink-700/80 hover:border-emerald-500/30 text-sand-200 hover:text-emerald-300 font-medium text-xs transition shadow-sm group"
                                >
                                  <div className="p-1 rounded bg-red-500/15 text-red-400 group-hover:text-red-300">
                                    <FileText size={15} />
                                  </div>
                                  <span className="font-semibold truncate max-w-sm">
                                    {app.resumeName || "Resume.pdf"}
                                  </span>
                                  <ExternalLink
                                    size={13}
                                    className="text-sand-400 group-hover:text-emerald-300 ml-1 shrink-0"
                                  />
                                </a>
                              </div>
                            )}

                            {/* Footer Decision Actions for Founders */}
                            {isReceived && (
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink-800/80">
                                <div className="text-xs text-sand-500">
                                  {status === "Pending"
                                    ? "Review this candidate and choose to accept or reject the application with a custom message."
                                    : `Application decision: ${status}`}
                                </div>

                                <div className="flex items-center gap-2.5">
                                  {status === "Pending" && (
                                    <>
                                      <button
                                        onClick={() => receivedItem && openAcceptModal(receivedItem)}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-ink-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                                      >
                                        <Check size={13} />
                                        <span>Accept Application</span>
                                      </button>

                                      <button
                                        onClick={() => receivedItem && openRejectModal(receivedItem)}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 py-2 px-4 rounded-xl bg-ink-800 hover:bg-red-500/20 border border-ink-700 hover:border-red-500/30 text-sand-300 hover:text-red-300 font-bold text-xs transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                                      >
                                        <X size={13} />
                                        <span>Reject</span>
                                      </button>
                                    </>
                                  )}

                                  <Link
                                    href={`/messages?conversationId=${app._id}`}
                                    className="flex items-center gap-2 py-2 px-4 rounded-xl bg-ink-800 hover:bg-ink-700 border border-ink-700 text-sand-200 hover:text-white font-bold text-xs transition-all"
                                  >
                                    <MessageSquare size={13} />
                                    <span>Open Messages</span>
                                    <ArrowUpRight size={12} className="opacity-70" />
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* Applicant View Action Bar */}
                            {!isReceived && (
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink-800/80">
                                <div className="text-xs text-sand-400">
                                  {status === "Pending"
                                    ? "Your application is currently under review by the startup founder."
                                    : status === "Accepted"
                                    ? "Congratulations! Your application has been accepted."
                                    : "Thank you for applying. The startup decided not to move forward."}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Decision Dialogue Box Modal ── */}
        <AnimatePresence>
          {decisionModal.isOpen && decisionModal.app && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg rounded-2xl border border-ink-700/80 bg-ink-900 shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div
                  className={`px-5 py-4 border-b flex items-center justify-between ${
                    decisionModal.status === "Accepted"
                      ? "bg-emerald-950/40 border-emerald-500/20"
                      : "bg-red-950/40 border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        decisionModal.status === "Accepted"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {decisionModal.status === "Accepted" ? <Check size={16} /> : <X size={16} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-sand-100">
                        {decisionModal.status === "Accepted"
                          ? "Accept Application & Message Candidate"
                          : "Reject Application & Send Message"}
                      </h3>
                      <p className="text-[11px] text-sand-400">
                        Candidate:{" "}
                        <span className="text-sand-200 font-semibold">
                          {decisionModal.app.name || decisionModal.app.applicant?.name || "Applicant"}
                        </span>{" "}
                        • Role:{" "}
                        <span className="text-emerald-400 font-semibold">
                          {decisionModal.app.roleTitle}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setDecisionModal({ isOpen: false, app: null, status: "Accepted", message: "" })
                    }
                    className="p-1.5 rounded-lg text-sand-400 hover:text-sand-100 hover:bg-ink-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-sand-300 mb-2">
                      Direct Message to Candidate:
                    </label>
                    <textarea
                      rows={5}
                      value={decisionModal.message}
                      onChange={(e) =>
                        setDecisionModal((prev) => ({ ...prev, message: e.target.value }))
                      }
                      placeholder="Write a message to the candidate..."
                      className={`w-full rounded-xl border bg-ink-950/90 p-3.5 text-xs text-sand-100 placeholder:text-sand-500 outline-none leading-relaxed transition-all ${
                        decisionModal.status === "Accepted"
                          ? "border-emerald-500/30 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                          : "border-red-500/30 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30"
                      }`}
                    />
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-ink-950/60 border border-ink-800/80 text-[11px] text-sand-400">
                    <MessageCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      This message will be delivered directly to the candidate&apos;s <strong>Messages (DM)</strong> thread, and they will receive an in-app notification in their bell icon.
                    </span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3.5 border-t border-ink-800/80 bg-ink-950/60 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDecisionModal({ isOpen: false, app: null, status: "Accepted", message: "" })
                    }
                    disabled={updatingId === decisionModal.app._id}
                    className="px-4 py-2 rounded-xl border border-ink-700 bg-ink-800 text-sand-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmDecision}
                    disabled={updatingId === decisionModal.app._id}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer ${
                      decisionModal.status === "Accepted"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-ink-950 shadow-emerald-500/20"
                        : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/20"
                    }`}
                  >
                    {updatingId === decisionModal.app._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>
                      {decisionModal.status === "Accepted"
                        ? "Confirm & Accept"
                        : "Confirm & Reject"}
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function FoundersHookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-ink-950 text-sand-200 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-white" />
        </div>
      }
    >
      <FoundersHookContent />
    </Suspense>
  );
}
