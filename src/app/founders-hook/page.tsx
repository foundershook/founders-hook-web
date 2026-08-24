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
  CheckCircle,
  XCircle,
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
  MessageSquare
} from "lucide-react";

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
  createdAt: string;
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
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  // Fetch conversations
  const fetchConversations = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.conversations || []);
        setLoadingConvos(false);
      })
      .catch(() => setLoadingConvos(false));
  }, []);

  useEffect(() => {
    if (!me) return;
    fetchConversations();
    // Poll conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [me, fetchConversations]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(() => {
    if (!activeConversationId) return;
    fetch(`/api/conversations/${activeConversationId}/messages`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages || []);
      })
      .catch((e) => console.error(e));
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      setLoadingMessages(true);
      fetchMessages();
      setLoadingMessages(false);
      
      // Poll messages every 3 seconds for active chat
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || sending) return;
    
    setSending(true);
    const content = newMessage;
    setNewMessage("");

    // Optimistic append
    const tempMsg: Message = {
      _id: Date.now().toString(),
      conversation: activeConversationId,
      sender: { _id: me?.id, name: me?.name, username: me?.username, avatarUrl: me?.avatarUrl },
      content,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      fetchMessages();
      fetchConversations();
    } catch (e) {
      console.error(e);
      // rollback could be added here
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: "Accepted" | "Rejected") => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/founders-hook/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
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
  const getChatMetadata = (convo: Conversation) => {
    if (convo.type === "application") {
      // If I'm the founder, show applicant info. If I'm the applicant, show startup/founder info.
      const isApplicant = convo.application?.applicant?._id === me?.id;
      if (isApplicant) {
        return {
          title: convo.startup?.name || "Startup",
          subtitle: `Application: ${convo.application?.roleTitle || "Role"}`,
          avatar: convo.startup?.icon?.startsWith("http") ? convo.startup.icon : null,
          iconText: convo.startup?.icon && !convo.startup?.icon.startsWith("http") ? convo.startup.icon : "🚀",
        };
      } else {
        return {
          title: convo.application?.applicant?.name || "Applicant",
          subtitle: `Applied for ${convo.application?.roleTitle || "Role"} at ${convo.startup?.name}`,
          avatar: convo.application?.applicant?.avatarUrl,
          iconText: "U",
        };
      }
    }
    return { title: "Conversation", subtitle: "", avatar: null, iconText: "💬" };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950 text-sand-200" style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}>
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
        <div className="flex w-full flex-1 min-h-0 relative z-10 rounded-2xl overflow-hidden">
          
          {/* ─── LEFT SIDEBAR: CONVERSATIONS LIST ─── */}
          <div 
            className={`w-full md:w-80 lg:w-96 flex-col bg-transparent h-full
            ${mobileView === "list" ? "flex" : "hidden md:flex"}
          `}>
            {/* Header */}
            <div className="p-5 border-b border-ink-800/60 shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
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
                      <div className="relative h-12 w-12 shrink-0 rounded-full bg-ink-800 flex items-center justify-center overflow-hidden border border-ink-700/50">
                        {meta.avatar ? (
                          <Image src={meta.avatar} alt={meta.title} fill className="object-cover" />
                        ) : (
                          <span className="text-lg">{meta.iconText}</span>
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
                    
                    <div className="relative h-10 w-10 shrink-0 rounded-full bg-ink-800 flex items-center justify-center overflow-hidden border border-ink-700">
                      {getChatMetadata(activeConvo).avatar ? (
                        <Image src={getChatMetadata(activeConvo).avatar!} alt="" fill className="object-cover" />
                      ) : (
                        <span>{getChatMetadata(activeConvo).iconText}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-sand-100 text-sm md:text-base leading-tight">
                        {getChatMetadata(activeConvo).title}
                      </h2>
                      <p className="text-xs text-emerald-400/80 leading-tight">
                        {getChatMetadata(activeConvo).subtitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Indicator / Actions in Header */}
                  {activeConvo.type === "application" && activeConvo.application && (
                    <div className="flex items-center gap-3">
                      {/* Badge */}
                      <span className={`hidden sm:inline-flex px-2.5 py-1 text-xs font-bold rounded-md border ${
                        activeConvo.application.status === "Accepted" ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300" :
                        activeConvo.application.status === "Rejected" ? "border-red-500/30 bg-red-500/15 text-red-300" :
                        "border-amber-500/30 bg-amber-500/15 text-amber-300"
                      }`}>
                        {activeConvo.application.status}
                      </span>
                      <button className="text-sand-400 hover:text-sand-200 p-2 rounded-full hover:bg-ink-800 transition">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Application Details Panel (Optional info bar) */}
                {activeConvo.type === "application" && activeConvo.application && activeConvo.application.applicant._id !== me?.id && (
                  <div className="bg-ink-900/50 border-b border-ink-800/50 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-sand-300">
                      {activeConvo.application.email && (
                        <span className="flex items-center gap-1.5"><Mail size={13} className="text-sand-500"/> {activeConvo.application.email}</span>
                      )}
                      {activeConvo.application.mobile && (
                        <span className="flex items-center gap-1.5"><Phone size={13} className="text-sand-500"/> {activeConvo.application.mobile}</span>
                      )}
                      {activeConvo.application.resumeUrl && (
                         <a href={activeConvo.application.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-400 hover:underline">
                           <FileText size={13}/> View Resume
                         </a>
                      )}
                    </div>
                    {/* Action buttons if Pending */}
                    {activeConvo.application.status === "Pending" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(activeConvo.application._id, "Accepted")}
                          disabled={updatingStatus}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-md text-xs font-semibold transition"
                        >
                          <CheckCircle size={14}/> Accept
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(activeConvo.application._id, "Rejected")}
                          disabled={updatingStatus}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-md text-xs font-semibold transition"
                        >
                          <XCircle size={14}/> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                  {/* First message is the application message if available */}
                  {activeConvo.type === "application" && activeConvo.application?.message && (
                     <div className="flex justify-start mb-6">
                       <div className="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                         <div className="w-8 h-8 rounded-full bg-ink-800 shrink-0 overflow-hidden relative border border-ink-700">
                           <Image src={activeConvo.application.applicant.avatarUrl || "https://picsum.photos/seed/user/64/64"} alt="" fill className="object-cover" />
                         </div>
                         <div className="bg-ink-800 border border-ink-700 text-sand-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm text-sm whitespace-pre-wrap">
                           <p className="font-semibold text-xs text-emerald-400 mb-1">Application Note:</p>
                           {activeConvo.application.message}
                         </div>
                       </div>
                     </div>
                  )}

                  {messages.map((msg, i) => {
                    const isMe = msg.sender._id === me?.id;
                    const showAvatar = !isMe && (i === 0 || messages[i-1].sender._id !== msg.sender._id);

                    return (
                      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%]`}>
                          {!isMe && (
                            <div className={`w-8 h-8 rounded-full shrink-0 overflow-hidden relative border border-ink-700 ${showAvatar ? "bg-ink-800" : "bg-transparent border-transparent"}`}>
                              {showAvatar && (
                                <Image src={msg.sender.avatarUrl || "https://picsum.photos/seed/user/64/64"} alt="" fill className="object-cover" />
                              )}
                            </div>
                          )}
                          <div className={`
                            px-4 py-2.5 text-sm shadow-sm
                            ${isMe 
                              ? "bg-emerald-600 text-white rounded-2xl rounded-br-sm" 
                              : "bg-ink-800 border border-ink-700 text-sand-200 rounded-2xl rounded-bl-sm"
                            }
                          `}>
                            {msg.content}
                          </div>
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
