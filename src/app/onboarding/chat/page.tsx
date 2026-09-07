"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  CheckCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Sliders,
  Compass,
  Briefcase,
  Code2,
  Lightbulb,
  Pencil,
  Sparkles,
  Rocket,
} from "lucide-react";
import AnimatedOnboardingBackground from "@/components/AnimatedOnboardingBackground";

const FOUNDERS_HOOK_LOGO =
  "https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ProfileData {
  role: "Founder" | "Applicant";
  industry: string;
  experience: string;
  bio: string;
  skills: string[];
  onboardingAnswers?: Record<string, any>;
}

// ── Founders Hook Logo Icon Component ───────────────────────────────────────
function FoundersHookLogoIcon({
  size = 36,
  className = "rounded-xl",
  glow = false,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden shrink-0 border border-white/10 ${glow ? "shadow-[0_0_18px_rgba(255,255,255,0.35)] border-white/20" : "shadow-sm"
        } ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={FOUNDERS_HOOK_LOGO}
        alt="Founders Hook Logo"
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
}

// ── Formatted Markdown-like Content for Assistant Responses ─────────────────
function FormattedMessageContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-3 text-sm leading-relaxed text-sand-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={idx} className="my-3 border-white/10" />;
        }

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const contentText = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : line;

        const parts = contentText.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
            return (
              <strong key={pIdx} className="font-semibold text-sand-100">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
            return (
              <em key={pIdx} className="italic text-white">
                {part.slice(1, -1)}
              </em>
            );
          }
          if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
            return (
              <code key={pIdx} className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-white font-mono">
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="min-h-[1em]">
            {renderedLine}
          </p>
        );
      })}
    </div>
  );
}

function AIOnboardingChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "onboarding";

  const [user, setUser] = useState<{
    id?: string;
    _id?: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
    bio?: string;
    skills?: string[];
    isFounder?: boolean;
  } | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [liveProfile, setLiveProfile] = useState<Partial<ProfileData>>({});
  const [profileReady, setProfileReady] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialized = useRef(false);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, profileReady]);

  // Load user data on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data?.user) {
          const u = data.user;
          setUser(u);
          const firstName = u.name ? u.name.split(" ")[0] : "there";

          if (mode === "edit") {
            setLiveProfile({
              role: u.isFounder ? "Founder" : "Applicant",
              bio: u.bio || "",
              skills: Array.isArray(u.skills) ? u.skills : [],
            });
            if (u.bio) {
              setProfileReady(true);
            }
          }

          if (!initialized.current) {
            initialized.current = true;
            if (mode === "edit") {
              setMessages([
                {
                  role: "assistant",
                  content: `Welcome back, **${firstName}**! 👋\n\nI'm your **Founders Hook AI Profile Co-pilot**. I can help you rewrite your bio to be punchier, update your skills, or highlight your recent startup achievements.\n\nWhat would you like to refine today? Pick a quick option below or type whatever you want to change!`,
                },
              ]);
            } else {
              setMessages([
                {
                  role: "assistant",
                  content: `Hey **${firstName}**! 👋 Welcome to **Founders Hook**.\n\nI'm your **AI Profile Co-pilot**. In just a couple of quick questions, I'll build your founder profile, craft an inspiring bio, and connect you with top builders.\n\nFirst up: are you joining primarily as a **Founder** building a startup, or an **Applicant** looking to join an exciting project?`,
                },
              ]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, [router, mode]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  // Fallback text parser to detect profile fields from markdown if JSON tag was omitted
  function checkAndParseFallbackSummary(text: string): Partial<ProfileData> | null {
    const roleMatch = text.match(/\*\*Role:\*\*\s*([^\n\r]+)/i);
    const bioMatch =
      text.match(/\*\*Crafted Bio:\*\*\s*[\r\n]+["“']?([\s\S]*?)["”']?[\r\n]+(?=\*\*|---|$)/i) ||
      text.match(/\*\*Updated Bio:\*\*\s*[\r\n]+["“']?([\s\S]*?)["”']?[\r\n]+(?=\*\*|---|$)/i);
    const skillsMatch =
      text.match(/\*\*Key Skills:\*\*\s*([^\n\r]+)/i) || text.match(/\*\*Skills:\*\*\s*([^\n\r]+)/i);
    const industryMatch = text.match(/\*\*Industry:\*\*\s*([^\n\r]+)/i);
    const experienceMatch = text.match(/\*\*Experience:\*\*\s*([^\n\r]+)/i);

    if (roleMatch || bioMatch || skillsMatch) {
      const parsed: Partial<ProfileData> = {};
      if (roleMatch) {
        parsed.role = roleMatch[1].toLowerCase().includes("founder") ? "Founder" : "Applicant";
      }
      if (bioMatch) {
        parsed.bio = bioMatch[1].replace(/^\s*["*]+|["*]+\s*$/g, "").trim();
      }
      if (skillsMatch) {
        parsed.skills = skillsMatch[1]
          .split(/[,•|]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (industryMatch) {
        parsed.industry = industryMatch[1].trim();
      }
      if (experienceMatch) {
        parsed.experience = experienceMatch[1].trim();
      }
      return parsed;
    }
    return null;
  }

  // Send message to AI endpoint
  async function sendMessage(textToSend?: string) {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text || isTyping || isSaving) return;

    setError("");
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai-onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          mode,
          currentProfile: liveProfile,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get response from AI");
      }

      const data = await res.json();
      const aiReply = data.reply || "";
      const isComplete: boolean = Boolean(data.isComplete);
      let profileData: ProfileData | null = data.profileData;

      if (!profileData) {
        const fallback = checkAndParseFallbackSummary(aiReply);
        if (fallback && (fallback.role || fallback.bio || fallback.skills)) {
          profileData = {
            role: fallback.role || liveProfile.role || "Founder",
            industry: fallback.industry || liveProfile.industry || "",
            experience: fallback.experience || liveProfile.experience || "",
            bio: fallback.bio || liveProfile.bio || "",
            skills: fallback.skills || liveProfile.skills || [],
            onboardingAnswers: { ...fallback },
          };
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);

      if (profileData) {
        setLiveProfile((prev) => ({
          ...prev,
          ...profileData,
          skills:
            profileData?.skills && profileData.skills.length > 0
              ? Array.from(new Set([...(prev.skills || []), ...profileData.skills]))
              : prev.skills,
        }));
      }

      if (isComplete || profileData?.bio) {
        setProfileReady(true);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Failed to reach AI. Please try again.");
    } finally {
      setIsTyping(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  // Show options only for the first question
  const showFirstQuestionOptions =
    mode === "onboarding" &&
    messages.filter((m) => m.role === "user").length === 0 &&
    messages.length > 0 &&
    !isTyping &&
    !profileReady;

  // Save to MongoDB & proceed
  async function handleProceed() {
    if (isSaving || savedSuccess) return;
    setIsSaving(true);
    setError("");

    try {
      const userId = user?.id || user?._id;

      if (liveProfile.bio || liveProfile.skills) {
        const bioRes = await fetch("/api/profile/bio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            bio: liveProfile.bio || "",
            skills: liveProfile.skills || [],
          }),
        });

        if (!bioRes.ok) {
          throw new Error("Could not update bio and skills");
        }
      }

      if (mode === "onboarding") {
        const answersPayload = liveProfile.onboardingAnswers || {
          role: liveProfile.role || "Founder",
          industry: liveProfile.industry || "",
          experience: liveProfile.experience || "",
          bio: liveProfile.bio || "",
          skills: liveProfile.skills || [],
        };

        const obRes = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answersPayload),
        });

        if (!obRes.ok) {
          throw new Error("Could not record onboarding answers");
        }
      }

      setSavedSuccess(true);

      setTimeout(() => {
        if (mode === "edit") {
          router.push("/profile");
        } else {
          router.push("/onboarding?phase=startup");
        }
      }, 700);
    } catch (err: any) {
      console.error("Saving profile failed:", err);
      setError(err.message || "Error saving profile. Please tap Proceed again.");
      setIsSaving(false);
    }
  }


  if (loadingUser) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-ink-950 text-sand-200">
        <AnimatedOnboardingBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <FoundersHookLogoIcon size={48} className="rounded-2xl animate-pulseGlow" glow />
          <div className="flex items-center gap-2.5 text-xs text-sand-400">
            <Loader2 size={15} className="animate-spin text-white" />
            <span className="gemini-shimmer-text">Initializing Founders Hook AI...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-ink-950 text-sand-100 selection:bg-white/20 selection:text-white font-sans">
      {/* Dynamic Animated Website Background (Shapes, Orbs, Tech Grid, Particles) */}
      <AnimatedOnboardingBackground />

      {/* ── Header Bar ───────────────────────────────────────────────── */}
      <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-ink-950/75 px-4 backdrop-blur-xl sm:px-8">
        {/* Animated Brand Gold Edge Beam */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-center gap-3">
          {mode === "edit" ? (
            <Link
              href="/profile"
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sand-300 transition-all hover:bg-white/10 hover:text-white"
              title="Return to Profile"
            >
              <ArrowLeft size={17} />
            </Link>
          ) : (
            <Link
              href="/onboarding"
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sand-300 transition-all hover:bg-white/10 hover:text-white"
              title="Back to Questionnaire"
            >
              <ArrowLeft size={17} />
            </Link>
          )}

          {/* Founders Hook Website Logo */}
          <FoundersHookLogoIcon size={38} className="rounded-xl" glow />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm sm:text-base font-semibold text-white tracking-wide">
                FOUNDERS HOOK AI
              </span>
            </div>
            <p className="text-[11px] text-sand-400">
              {mode === "edit" ? "Profile Refinement" : "Interactive Profile Intelligence"}
            </p>
          </div>
        </div>

        {/* Header Right: User avatar & Mobile preview toggle */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Preview Toggle */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-sand-200 transition-all hover:bg-white/10 lg:hidden"
          >
            <Sliders size={13} className="text-white" />
            <span>Preview</span>
            {liveProfile.skills && liveProfile.skills.length > 0 && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-ink-950">
                {liveProfile.skills.length}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-sand-100">{user?.name}</p>
              <p className="text-[11px] text-sand-400">@{user?.username}</p>
            </div>
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-ink-900 shadow-sm">
              {user?.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name || "User"} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Chat + Live Inspector Layout ─────────────────────────── */}
      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Chat Column with Glassmorphic Translucency */}
        <div className="relative flex min-h-0 flex-col overflow-hidden bg-ink-950/30 backdrop-blur-[2px]">
          {/* Messages Scroll Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 overscroll-contain sm:px-8"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {/* Messages Stream */}
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl rounded-tr-md border border-white/15 bg-ink-800/90 px-5 py-3.5 text-xs sm:text-sm text-sand-100 shadow-md backdrop-blur-sm">
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="group flex max-w-[95%] sm:max-w-[88%] items-start gap-3.5">
                      {/* Founders Hook Logo in Chat */}
                      <FoundersHookLogoIcon size={32} className="rounded-xl mt-1" />

                      {/* Open Gemini-style Response Layout */}
                      <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.06] bg-ink-900/60 p-5 shadow-card backdrop-blur-md">
                        <FormattedMessageContent text={msg.content} />

                        {/* Proceed button directly inside the chatbot message */}
                        {profileReady && idx === messages.length - 1 && (
                          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-sand-300 text-xs">
                              <CheckCircle2 size={16} className="text-white shrink-0" />
                              <span className="font-medium text-white">
                                {mode === "edit" ? "Profile update ready" : "Profile setup complete"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={handleProceed}
                              disabled={isSaving || savedSuccess}
                              className="btn-white !py-2.5 !px-6 text-xs sm:text-sm font-semibold rounded-full inline-flex items-center justify-center gap-2 shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  <span>Saving Profile...</span>
                                </>
                              ) : savedSuccess ? (
                                <>
                                  <Check size={14} className="text-white" />
                                  <span>Saved! Redirecting...</span>
                                </>
                              ) : (
                                <>
                                  <span>{mode === "edit" ? "Save & Return to Profile" : "Proceed"}</span>
                                  <ArrowRight size={14} />
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Options for the first question only */}
              {showFirstQuestionOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2.5 pl-0 sm:pl-[46px]"
                >
                  {[
                    { label: "Founder", value: "Founder", icon: Rocket },
                    { label: "Applicant", value: "Applicant", icon: Briefcase },
                    { label: "A bit of both", value: "A bit of both", icon: Sparkles },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => sendMessage(opt.value)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all hover:bg-white/20 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm backdrop-blur-sm"
                      >
                        <Icon size={14} className="text-white/80 shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Thinking / Shimmer State */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3.5 max-w-[88%]"
                >
                  <FoundersHookLogoIcon size={32} className="rounded-xl mt-1 animate-pulseGlow" glow />
                  <div className="rounded-2xl border border-white/[0.06] bg-ink-900/60 px-5 py-4 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="gemini-shimmer-text text-xs sm:text-sm font-medium">
                        Founders Hook AI is thinking...
                      </span>
                    </div>
                    <div className="mt-2.5 h-0.5 w-36 rounded-full gemini-shimmer-bar" />
                  </div>
                </motion.div>
              )}


              {/* Error banner */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* ── Floating Prompt Dock ─────────────────────────────────── */}
          <footer className="relative shrink-0 px-4 pb-4 pt-2 sm:px-8 sm:pb-6">
            <div className="mx-auto max-w-3xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="relative flex flex-col rounded-[26px] border border-white/10 bg-ink-900/75 p-2 sm:p-2.5 backdrop-blur-2xl transition-all duration-300 focus-within:border-white/20 focus-within:shadow-[0_0_30px_rgba(255,255,255,0.18)] hover:border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
              >
                {/* Subtle ambient gold rim line */}
                <div className="pointer-events-none absolute -top-px left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={
                    mode === "edit"
                      ? "Tell the AI to refine your bio, rewrite for investors, or suggest skills..."
                      : "Type your response or answer here..."
                  }
                  disabled={isTyping || isSaving || savedSuccess}
                  className="max-h-36 min-h-[44px] w-full resize-none border-none bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-sand-100 placeholder-sand-600 focus:outline-none disabled:opacity-50"
                />

                <div className="flex items-center justify-between pt-1 px-1.5">
                  <div className="flex items-center gap-2 text-sand-400">
                    <FoundersHookLogoIcon size={20} className="rounded-md" />
                    <span className="text-[11px] hidden sm:inline text-sand-500">
                      Press <kbd className="rounded border border-white/10 px-1 py-0.5 text-[10px]">Enter</kbd> to send
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping || isSaving || savedSuccess}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${input.trim() && !isTyping
                      ? "bg-gradient-to-r from-white via-white to-white text-ink-950 font-bold shadow-gold hover:scale-105 active:scale-95"
                      : "bg-white/5 text-sand-600 border border-white/5 cursor-not-allowed"
                      }`}
                    aria-label="Send message"
                  >
                    {isTyping ? (
                      <Loader2 size={15} className="animate-spin text-white" />
                    ) : (
                      <Send size={15} className="translate-x-[1px]" />
                    )}
                  </button>
                </div>
              </form>

              <p className="mt-2 text-center text-[10px] text-sand-600">
                Founders Hook AI helps build your profile. You can edit your bio & skills anytime.
              </p>
            </div>
          </footer>
        </div>

        {/* ── Desktop Live Profile Preview Inspector Sidebar ──────────── */}
        <aside className="hidden relative border-l border-white/[0.08] bg-ink-950/45 p-6 backdrop-blur-2xl lg:flex lg:flex-col lg:justify-between overflow-y-auto">
          {/* Animated vertical flowing amber border beam */}
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <div>
            <div className="mb-5 flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-1.5">
                  <FoundersHookLogoIcon size={16} className="rounded-md" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                    Live Profile Preview
                  </span>
                </div>
                <p className="text-[11px] text-sand-400">Real-time sync with AI</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Sync
              </span>
            </div>

            {/* Profile Card Mockup */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-850/80 p-5 shadow-card hover:border-white/20 transition-all backdrop-blur-md">
              {/* Subtle top gold rim */}
              <div className="pointer-events-none absolute -top-px left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-center gap-3.5 mb-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white/20 bg-ink-800 shadow-md shrink-0">
                  {user?.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-sand-300">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-sm font-semibold text-sand-100 truncate">
                    {user?.name || "Your Name"}
                  </h3>
                  <p className="text-xs text-sand-400 truncate">@{user?.username || "username"}</p>

                  {/* Role Badge */}
                  {liveProfile.role && (
                    <span className="mt-1.5 inline-block rounded-md border border-white/20 bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {liveProfile.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio Preview with Direct Edit Option */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                    Bio
                  </span>
                </div>

                <div className="mt-1.5 min-h-[60px] text-xs text-sand-200 leading-relaxed bg-ink-900 p-3 rounded-xl border border-white/5">
                  {liveProfile.bio ? (
                    <p className="italic text-sand-200">"{liveProfile.bio}"</p>
                  ) : (
                    <span className="text-sand-600 not-italic">
                      Your AI copilot will generate an inspiring bio as you chat...
                    </span>
                  )}
                </div>
              </div>

              {/* Skills Preview */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                  Detected Skills ({liveProfile.skills?.length || 0})
                </span>
                <div className="mt-1.5 flex min-h-[38px] flex-wrap gap-1.5">
                  {liveProfile.skills && liveProfile.skills.length > 0 ? (
                    liveProfile.skills.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-white/20 bg-white/20 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-sand-600">
                      Skills will appear here as detected...
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <p className="text-[11px] text-sand-400">
              {mode === "edit"
                ? "Changes save directly to your profile upon tapping Save."
                : "You can adjust your bio and skills anytime from your profile."}
            </p>
          </div>
        </aside>
      </div>

      {/* ── Mobile Live Profile Sheet ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative z-10 flex h-full w-full max-w-sm flex-col justify-between border-l border-white/10 bg-ink-950 p-6 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <FoundersHookLogoIcon size={24} className="rounded-md" />
                    <h2 className="font-display text-sm font-semibold text-sand-100">Live Profile</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sand-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/20 bg-ink-800 shrink-0">
                      {user?.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                          {user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-sand-100">{user?.name}</h3>
                      <p className="text-xs text-sand-400">@{user?.username}</p>
                      {liveProfile.role && (
                        <span className="mt-1 inline-block rounded-md border border-white/20 bg-white/20 px-2 py-0.5 text-[10px] text-white">
                          {liveProfile.role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      Bio
                    </span>
                    <p className="mt-1 text-xs text-sand-200 italic bg-ink-900 p-3 rounded-xl border border-white/5">
                      {liveProfile.bio ? `"${liveProfile.bio}"` : "Bio will appear as you chat..."}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      Skills
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {liveProfile.skills && liveProfile.skills.length > 0 ? (
                        liveProfile.skills.map((s, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-white/20 bg-white/20 px-2 py-1 text-[11px] text-white"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-sand-600">No skills detected yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {(profileReady || liveProfile.bio) && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleProceed();
                  }}
                  disabled={isSaving || savedSuccess}
                  className="btn-white w-full !py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-glow"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                  <span>{mode === "edit" ? "Save & Return to Profile" : "Proceed"}</span>
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function AIOnboardingChatPage() {
  return (
    <Suspense
      fallback={
        <main className="fixed inset-0 flex items-center justify-center bg-ink-950 text-sand-200">
          <AnimatedOnboardingBackground />
          <div className="relative z-10 flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-white" />
            <span className="text-sm">Loading session...</span>
          </div>
        </main>
      }
    >
      <AIOnboardingChatContent />
    </Suspense>
  );
}
