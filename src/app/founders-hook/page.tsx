"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { timeAgo } from "@/lib/timeAgo";
import {
  Anchor,
  Send,
  MoreVertical,
  Clock,
  User,
  Briefcase,
  FileText,
  Phone,
  Mail,
  Loader2,
  Menu,
  ChevronLeft,
  ExternalLink,
  MessageSquare,
  Video,
  VideoOff,
  Paperclip,
} from "lucide-react";
import { StartupLogo } from "@/components/StartupMedia";
import {
  subscribeConversations,
  subscribeMessages,
  sendChatMessage,
  sendMeetingInvite,
  endMeetingCall,
  syncFirestoreConversation,
} from "@/lib/chat";

type Me = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isFounder: boolean;
  hasApplied?: boolean;
};

interface Conversation {
  _id: string;
  participants: any[];
  type: string;
  application?: any;
  startup?: any;
  lastMessageAt: string;
  lastMessagePreview: string;
}

interface Message {
  _id: string;
  conversation: string;
  sender: any;
  content: string;
  type?: "text" | "meet" | "application_card";
  applicationData?: {
    roleTitle: string;
    applicantName: string;
    email?: string;
    mobile?: string;
    experience?: string;
    resumeUrl?: string;
    resumeName?: string;
    message?: string;
  };
  meetUrl?: string;
  meetStatus?: "active" | "ended";
  endedAt?: string;
  createdAt: string;
}


function ApplicationEmailCard({
  senderName,
  senderEmail,
  roleTitle,
  startupName,
  message,
  resumeUrl,
  resumeName,
  createdAt,
  isMe = false,
}: {
  senderName: string;
  senderEmail?: string | null;
  roleTitle: string;
  startupName: string;
  message?: string | null;
  resumeUrl?: string | null;
  resumeName?: string | null;
  createdAt?: string | null;
  isMe?: boolean;
}) {
  return (
    <div 
      style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
      className={`w-full max-w-lg lg:max-w-xl rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md border transition-all ${
        isMe
          ? "rounded-br-sm bg-gradient-to-b from-ink-900 via-ink-900/95 to-ink-950 border-emerald-500/35"
          : "rounded-bl-sm bg-gradient-to-b from-ink-900 via-ink-900/95 to-ink-950 border-ink-700/80"
      }`}
    >
      {/* Email Header Bar */}
      <div className={`px-5 py-3.5 border-b flex flex-col gap-2.5 ${
        isMe ? "bg-emerald-950/30 border-emerald-500/20" : "bg-ink-950/90 border-ink-800/80"
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Briefcase size={15} />
            <span>{isMe ? "Job Application (Sent)" : "Job Application (Received)"}</span>
          </div>
          {createdAt && (
            <span className="text-[11px] text-sand-500">
              {timeAgo(createdAt)}
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-baseline gap-2">
            <span className="text-sand-500 font-semibold w-12 shrink-0">From:</span>
            <span className="font-bold text-sand-100">
              {isMe ? `You (${senderName})` : senderName}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sand-500 font-semibold w-12 shrink-0">Role:</span>
            <span className="text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
              {roleTitle || "Role"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sand-500 font-semibold w-12 shrink-0">To:</span>
            <span className="text-sand-300 font-medium">
              {isMe ? startupName : `You (${startupName})`}
            </span>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="px-5 py-4 text-xs sm:text-sm text-sand-200 leading-relaxed space-y-3.5">
        {message ? (
          <div 
            style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
            className="whitespace-pre-wrap text-sand-100 bg-ink-950/50 p-3.5 rounded-xl border border-ink-800/60 leading-relaxed text-xs sm:text-sm"
          >
            {message}
          </div>
        ) : (
          <p 
            style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
            className="text-sand-400 italic text-xs"
          >
            No cover message provided.
          </p>
        )}

        {/* Attached Resume */}
        {resumeUrl && (
          <div className="pt-2.5 border-t border-ink-800/70">
            <span className="text-xs font-semibold text-sand-400 block mb-2">
              📎 Attached Resume:
            </span>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-ink-850 hover:bg-emerald-500/15 border border-ink-700/80 hover:border-emerald-500/30 text-sand-200 hover:text-emerald-300 font-medium text-xs transition shadow-sm group"
            >
              <div className="p-1 rounded bg-red-500/15 text-red-400 group-hover:text-red-300">
                <FileText size={15} />
              </div>
              <span className="font-semibold truncate max-w-xs">{resumeName || "Resume.pdf"}</span>
              <ExternalLink size={13} className="text-sand-400 group-hover:text-emerald-300 ml-1 shrink-0" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FoundersHookPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [startingMeet, setStartingMeet] = useState(false);

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        setMeLoading(false);
      })
      .catch(() => setMeLoading(false));
  }, []);

  // Fetch conversations metadata from applications and sync to Firestore
  const syncConversations = useCallback(() => {
    if (!me?.id) return;
    fetch("/api/conversations")
      .then((r) => r.json())
      .then(async (d) => {
        const threads = d.conversations || [];
        for (const thread of threads) {
          await syncFirestoreConversation({
            id: thread._id,
            participants: thread.participants,
            type: thread.type,
            applicationId: thread.applicationId,
            startupId: thread.startupId,
            application: thread.application,
            startup: thread.startup,
          });
        }
      })
      .catch((err) => console.error("Error syncing conversations:", err));
  }, [me?.id]);

  // Subscribe to user's conversations in Firestore in real time
  useEffect(() => {
    if (!me?.id) return;
    syncConversations();

    const unsubscribe = subscribeConversations(
      me.id,
      (convos) => {
        setConversations(convos as any);
        setLoadingConvos(false);
      },
      (err) => {
        console.error("Firestore conversation subscription error:", err);
        setLoadingConvos(false);
      }
    );

    return () => unsubscribe();
  }, [me?.id, syncConversations]);

  // Subscribe to messages of active conversation in real time
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const unsubscribe = subscribeMessages(
      activeConversationId,
      (msgs) => {
        setMessages(msgs as any);
        setLoadingMessages(false);
      },
      (err) => {
        console.error("Firestore messages subscription error:", err);
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [activeConversationId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || !me || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    try {
      await sendChatMessage(
        activeConversationId,
        { _id: me.id, name: me.name, username: me.username, avatarUrl: me.avatarUrl },
        content
      );
    } catch (e) {
      console.error("Error sending message via Firestore:", e);
    } finally {
      setSending(false);
    }
  };

  const handleStartMeet = async () => {
    if (!activeConversationId || !me || startingMeet) return;

    // Open new tab immediately on user click to prevent popup blocking
    const meetWindow = window.open("https://meet.google.com/new", "_blank");
    setStartingMeet(true);

    try {
      const activeConvo = conversations.find((c) => c._id === activeConversationId);
      const startupName = activeConvo?.startup?.name || "Founders Hook";
      const createdMessageId = await sendMeetingInvite(
        activeConversationId,
        { _id: me.id, name: me.name, username: me.username, avatarUrl: me.avatarUrl },
        "https://meet.google.com/new",
        startupName
      );

      // Monitor when the Google Meet tab is closed to automatically end the call
      if (meetWindow) {
        const checkTimer = setInterval(async () => {
          if (meetWindow.closed) {
            clearInterval(checkTimer);
            try {
              await endMeetingCall(activeConversationId, createdMessageId);
            } catch (err) {
              console.error("Failed to update ended call status in Firestore:", err);
            }
          }
        }, 1500);
      }
    } catch (e) {
      console.error("Error starting meet invitation:", e);
    } finally {
      setStartingMeet(false);
    }
  };

  const handleJoinMeet = (meetUrl: string, messageId?: string) => {
    const meetWindow = window.open(meetUrl || "https://meet.google.com/new", "_blank");
    if (meetWindow && activeConversationId) {
      const checkTimer = setInterval(async () => {
        if (meetWindow.closed) {
          clearInterval(checkTimer);
          try {
            await endMeetingCall(activeConversationId, messageId);
          } catch (err) {
            console.error("Failed to update ended call status in Firestore:", err);
          }
        }
      }, 1500);
    }
  };

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

  const activeConvo = conversations.find((c) => c._id === activeConversationId);

  // Helper to get chat title/avatar
  const getChatMetadata = (convo: Conversation): {
    title: string;
    subtitle: string;
    isStartup: boolean;
    startup: any;
    avatar: string | null;
    iconText: string;
  } => {
    if (convo.type === "application") {
      const isApplicant =
        convo.application?.applicant?._id === me?.id ||
        convo.application?.applicant === me?.id;

      if (isApplicant) {
        return {
          title: convo.startup?.name || "Startup",
          subtitle: `Application: ${convo.application?.roleTitle || "Role"}`,
          isStartup: true,
          startup: convo.startup,
          avatar: convo.startup?.icon?.startsWith("http") ? convo.startup.icon : null,
          iconText: convo.startup?.name ? convo.startup.name.charAt(0).toUpperCase() : "S",
        };
      } else {
        const applicantName =
          convo.application?.name ||
          convo.application?.applicant?.name ||
          "Applicant";
        const role = convo.application?.roleTitle || "Role";
        const startupName = convo.startup?.name ? ` • ${convo.startup.name}` : "";

        return {
          title: applicantName,
          subtitle: `Candidate for ${role}${startupName}`,
          isStartup: false,
          startup: null,
          avatar: convo.application?.applicant?.avatarUrl || null,
          iconText: applicantName.charAt(0).toUpperCase(),
        };
      }
    }
    return { title: "Conversation", subtitle: "", isStartup: false, startup: null, avatar: null, iconText: "💬" };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950 text-sand-200" style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}>
      <Sidebar user={me ? { ...me, isFounder: me.isFounder, hasApplied: me.hasApplied } : null} />

      <main className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Background Image Overlay restricted to header */}
        <div
          className="absolute top-0 left-0 right-0 h-72 z-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/t7efuhnd/image/upload/v1787576104/data-center-manager-supervising-technician-monitoring-system-performance_r8ox2w.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
          }}
        />

        {/* Header Space */}
        <div className="relative z-10 w-full px-5 pt-32 lg:pt-24 lg:px-10 pb-6 shrink-0">
          <div className="flex flex-col items-start text-left">
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
          </div>
        </div>
        {/* Apple Messages Style Layout */}
        <div 
          style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
          className="flex w-full flex-1 min-h-0 relative z-10 rounded-2xl overflow-hidden"
        >
          
          {/* ─── LEFT SIDEBAR: CONVERSATIONS LIST ─── */}
          <div 
            style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
            className={`w-full md:w-80 lg:w-96 flex-col bg-transparent h-full
            ${mobileView === "list" ? "flex" : "hidden md:flex"}
          `}>
            {/* Header */}
            <div className="p-5 border-b border-ink-800/60 shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
                  className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-lg py-2 px-4 text-sm text-white placeholder:text-sand-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingConvos ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-ink-500" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-sm text-sand-500">
                  No conversations yet.
                </div>
              ) : (
                conversations.map((convo) => {
                  const meta = getChatMetadata(convo);
                  const isActive = convo._id === activeConversationId;
                  return (
                    <div
                      key={convo._id}
                      onClick={() => {
                        setActiveConversationId(convo._id);
                        setMobileView("chat");
                      }}
                      className={`flex items-center gap-3 p-4 border-b border-ink-800/30 cursor-pointer transition-colors
                        ${isActive ? "bg-emerald-900/20" : "hover:bg-ink-800/40"}
                      `}
                    >
                      <div className="shrink-0 flex items-center justify-center">
                        {meta.isStartup ? (
                          <StartupLogo
                            icon={meta.startup?.icon}
                            name={meta.startup?.name}
                            id={meta.startup?._id}
                            size="md"
                            className="!rounded-full border border-ink-700/50"
                          />
                        ) : meta.avatar ? (
                          <div className="relative h-12 w-12 shrink-0 rounded-full bg-ink-800 flex items-center justify-center overflow-hidden border border-ink-700/50">
                            <Image src={meta.avatar} alt={meta.title} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="relative h-12 w-12 shrink-0 rounded-full bg-ink-800 flex items-center justify-center border border-ink-700/50 text-sand-200 font-bold text-base">
                            {meta.iconText}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="font-semibold text-sand-200 truncate text-sm">
                            {meta.title}
                          </h3>
                          <span className="text-[10px] text-sand-500 shrink-0 ml-2">
                            {timeAgo(convo.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-sand-400 truncate">
                          {convo.lastMessagePreview || <span className="italic">No messages yet</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ─── RIGHT SIDE: CHAT AREA ─── */}
          <div 
            className={`flex-1 flex-col h-full bg-transparent relative
            ${mobileView === "chat" ? "flex" : "hidden md:flex"}
          `}>
            {activeConversationId && activeConvo ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b border-ink-800/60 px-4 md:px-6 flex items-center justify-between shrink-0 bg-ink-900/20 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <button 
                      className="md:hidden mr-1 text-sand-400 hover:text-sand-200"
                      onClick={() => setMobileView("list")}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <div className="shrink-0 flex items-center justify-center">
                      {getChatMetadata(activeConvo).isStartup ? (
                        <StartupLogo
                          icon={getChatMetadata(activeConvo).startup?.icon}
                          name={getChatMetadata(activeConvo).startup?.name}
                          id={getChatMetadata(activeConvo).startup?._id}
                          size="md"
                          className="!rounded-full border border-ink-700"
                        />
                      ) : getChatMetadata(activeConvo).avatar ? (
                        <div className="relative h-10 w-10 shrink-0 rounded-full bg-ink-800 flex items-center justify-center overflow-hidden border border-ink-700">
                          <Image src={getChatMetadata(activeConvo).avatar!} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="relative h-10 w-10 shrink-0 rounded-full bg-ink-800 flex items-center justify-center border border-ink-700 text-sand-200 font-bold text-sm">
                          {getChatMetadata(activeConvo).iconText}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-sand-100 text-sm md:text-base leading-tight">
                        {getChatMetadata(activeConvo).title}
                      </h2>
                      {getChatMetadata(activeConvo).subtitle && (
                        <p className="text-xs text-emerald-400/80 leading-tight mt-0.5">
                          {getChatMetadata(activeConvo).subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Header Actions: Meet Button & Status */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Google Meet Button - Founder only */}
                    {activeConvo.type === "application" && activeConvo.application?.applicant?._id !== me?.id && (
                      <button
                        onClick={handleStartMeet}
                        disabled={startingMeet}
                        title="Start a Google Meet and invite participant"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-ink-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition transform active:scale-95 disabled:opacity-50"
                      >
                        {startingMeet ? (
                          <Loader2 size={14} className="animate-spin text-ink-950" />
                        ) : (
                          <Video size={14} className="text-ink-950 fill-ink-950" />
                        )}
                        <span>Meet</span>
                      </button>
                    )}

                    {/* More Options */}
                    {activeConvo.type === "application" && (
                      <button className="text-sand-400 hover:text-sand-200 p-2 rounded-full hover:bg-ink-800 transition">
                        <MoreVertical size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Application Details Panel (Resume Quick Access) */}
                {activeConvo.type === "application" &&
                  activeConvo.application &&
                  (activeConvo.application.resumeUrl || activeConvo.application.applicant?.resumeUrl) && (
                    <div className="bg-ink-900/50 border-b border-ink-800/50 px-6 py-2.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs text-sand-300">
                        <a
                          href={activeConvo.application.resumeUrl || activeConvo.application.applicant?.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-emerald-400 hover:underline font-semibold"
                        >
                          <Paperclip size={13} /> View Resume
                        </a>
                      </div>
                    </div>
                )}

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                  {/* Fallback structured email application message for conversations without an application_card message */}
                  {activeConvo.type === "application" &&
                    !messages.some((m) => m.type === "application_card") && (() => {
                      const isApplicant =
                        String(activeConvo.application?.applicant?._id || activeConvo.application?.applicant || "") === String(me?.id || "");
                      return (
                        <div className={`w-full flex ${isApplicant ? "justify-end" : "justify-start"} my-3`}>
                          <div className={`flex items-end gap-2 max-w-[95%] md:max-w-[80%]`}>
                            {!isApplicant && (
                              <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden relative border border-ink-700 bg-ink-800 self-end mb-1">
                                <Image
                                  src={activeConvo.application?.applicant?.avatarUrl || "https://picsum.photos/seed/user/64/64"}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <ApplicationEmailCard
                              isMe={isApplicant}
                              senderName={
                                activeConvo.application?.name ||
                                activeConvo.application?.applicant?.name ||
                                "Applicant"
                              }
                              senderEmail={
                                activeConvo.application?.email ||
                                activeConvo.application?.applicant?.email
                              }
                              roleTitle={activeConvo.application?.roleTitle || "Role"}
                              startupName={activeConvo.startup?.name || "Startup"}
                              message={activeConvo.application?.message}
                              resumeUrl={
                                activeConvo.application?.resumeUrl ||
                                activeConvo.application?.applicant?.resumeUrl
                              }
                              resumeName={
                                activeConvo.application?.resumeName ||
                                activeConvo.application?.applicant?.resumeName ||
                                "resume.pdf"
                              }
                              createdAt={activeConvo.application?.createdAt || activeConvo.lastMessageAt}
                            />
                          </div>
                        </div>
                      );
                    })()}

                  {messages.map((msg, i) => {
                    const isApplicant =
                      String(activeConvo.application?.applicant?._id || activeConvo.application?.applicant || "") === String(me?.id || "");
                    const isMe = String(msg.sender?._id || "") === String(me?.id || "");
                    const isMeet = msg.type === "meet" || msg.content.includes("📹");
                    const isAppCard = msg.type === "application_card" || !!msg.applicationData;
                    const isAppCardMe = isAppCard ? (isMe || (!msg.sender?._id && isApplicant)) : isMe;
                    const showAvatar = !isMe && (i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id);

                    if (isAppCard) {
                      const appData = (msg.applicationData || {}) as Record<string, any>;
                      const resumeLink =
                        appData.resumeUrl ||
                        activeConvo.application?.resumeUrl ||
                        activeConvo.application?.applicant?.resumeUrl;
                      const resumeTitle =
                        appData.resumeName ||
                        activeConvo.application?.resumeName ||
                        activeConvo.application?.applicant?.resumeName ||
                        "resume.pdf";

                      return (
                        <div key={msg._id} className={`w-full flex ${isAppCardMe ? "justify-end" : "justify-start"} my-3`}>
                          <div className={`flex items-end gap-2 max-w-[95%] md:max-w-[80%]`}>
                            {!isAppCardMe && (
                              <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden relative border border-ink-700 bg-ink-800 self-end mb-1">
                                <Image
                                  src={msg.sender?.avatarUrl || activeConvo.application?.applicant?.avatarUrl || "https://picsum.photos/seed/user/64/64"}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <ApplicationEmailCard
                              isMe={isAppCardMe}
                              senderName={appData.applicantName || msg.sender?.name || "Applicant"}
                              senderEmail={appData.email || activeConvo.application?.applicant?.email}
                              roleTitle={appData.roleTitle || activeConvo.application?.roleTitle || "Role"}
                              startupName={activeConvo.startup?.name || "Startup"}
                              message={appData.message || activeConvo.application?.message}
                              resumeUrl={resumeLink}
                              resumeName={resumeTitle}
                              createdAt={msg.createdAt}
                            />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%]`}>
                          {!isMe && (
                            <div
                              className={`w-8 h-8 rounded-full shrink-0 overflow-hidden relative border border-ink-700 ${
                                showAvatar ? "bg-ink-800" : "bg-transparent border-transparent"
                              }`}
                            >
                              {showAvatar && (
                                <Image
                                  src={msg.sender?.avatarUrl || "https://picsum.photos/seed/user/64/64"}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                          )}

                          {isMeet ? (
                            msg.meetStatus === "ended" || msg.content.includes("ended") ? (
                              <div className="bg-ink-900/60 border border-ink-800/80 p-3.5 rounded-2xl shadow-sm max-w-xs sm:max-w-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-ink-800/80 border border-ink-700/60 flex items-center justify-center text-sand-400 shrink-0">
                                    <VideoOff size={18} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="h-2 w-2 rounded-full bg-sand-500"></span>
                                      <span className="text-[10px] font-bold text-sand-400 uppercase tracking-wider">
                                        Google Meet Ended
                                      </span>
                                    </div>
                                    <p className="text-xs text-sand-300 font-medium truncate mt-0.5">
                                      Video call finished
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gradient-to-br from-ink-900 via-ink-850 to-ink-900 border border-emerald-500/40 p-4 rounded-2xl shadow-xl shadow-emerald-950/40 max-w-xs sm:max-w-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                                    <Video size={20} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                      </span>
                                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                                        Google Meet
                                      </span>
                                    </div>
                                    <p className="text-xs text-sand-200 font-medium truncate mt-0.5">
                                      {isMe ? "You started a video call" : `${msg.sender?.name || "Host"} invited you to meet`}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleJoinMeet(msg.meetUrl || "https://meet.google.com/new", msg._id)}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-ink-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 cursor-pointer"
                                >
                                  <Video size={14} className="fill-ink-950" />
                                  <span>Join Google Meet</span>
                                  <ExternalLink size={12} className="opacity-70" />
                                </button>
                              </div>
                            )
                          ) : (
                            <div
                              style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
                              className={`
                              px-4 py-2.5 text-sm shadow-sm
                              ${
                                isMe
                                  ? "bg-emerald-600 text-white rounded-2xl rounded-br-sm"
                                  : "bg-ink-800 border border-ink-700 text-sand-200 rounded-2xl rounded-bl-sm"
                              }
                            `}
                            >
                              {msg.content}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-ink-900/30 border-t border-ink-800/60 backdrop-blur-md">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
                        className="w-full bg-ink-950 border border-ink-700 rounded-full py-3 pl-5 pr-12 text-sm text-sand-200 placeholder-sand-500 focus:outline-none focus:border-emerald-500/50 shadow-inner"
                      />
                      <button 
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
                      >
                        <Send size={14} className="ml-0.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              /* Empty State for Chat Area */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-ink-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-ink-700">
                  <MessageSquare size={32} className="text-emerald-500/50" />
                </div>
                <h3 className="text-xl font-bold text-sand-200 mb-2">Your Messages</h3>
                <p className="text-sm text-sand-500 max-w-sm">
                  Select a conversation from the sidebar to view details, approve applications, and chat with candidates.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
