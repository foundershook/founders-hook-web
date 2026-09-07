"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  Bot,
  User,
  Check,
  ArrowRight,
} from "lucide-react";

interface Message {
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

// Helper to render markdown text with bolding, italics, and clean dividers
function FormattedMessageContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-sand-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Horizontal divider
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={idx} className="my-2 border-white/10" />;
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Parse inline **bold** and *italic*
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);

        return (
          <p key={idx} className="min-h-[1em]">
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
                return (
                  <strong key={pIdx} className="font-semibold text-sand-100">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
                return (
                  <em key={pIdx} className="italic text-gold-200/90">
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function AIOnboardingChatPage() {
  const router = useRouter();

  const [user, setUser] = useState<{
    id?: string;
    _id?: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
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

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  // Auto scroll within the chat container only (prevents window scrolling)
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

  // Load user data on mount and initialize conversation
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
          setUser(data.user);
          const firstName = data.user.name ? data.user.name.split(" ")[0] : "there";

          if (!initialized.current) {
            initialized.current = true;
            setMessages([
              {
                role: "assistant",
                content: `Hey ${firstName}! 👋 Welcome to Founders Hook. I'm your AI profile co-pilot.\n\nI'll ask you a few quick questions to build your profile, highlight your expertise, and connect you with the right founders and teams.\n\nFirst up: are you joining primarily as a **Founder** building a startup, or an **Applicant** looking to join an exciting project?`,
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, [router]);

  // Fallback text parser to detect profile fields directly from AI reply if needed
  function checkAndParseFallbackSummary(text: string): Partial<ProfileData> | null {
    const roleMatch = text.match(/\*\*Role:\*\*\s*([^\n\r]+)/i);
    const bioMatch = text.match(/\*\*Crafted Bio:\*\*\s*[\r\n]+["“']?([\s\S]*?)["”']?[\r\n]+(?=\*\*|---|$)/i);
    const skillsMatch = text.match(/\*\*Key Skills:\*\*\s*([^\n\r]+)/i) || text.match(/\*\*Skills:\*\*\s*([^\n\r]+)/i);
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

  // Send message to AI route
  async function sendMessage(textToSend?: string) {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text || isTyping || isSaving) return;

    setError("");
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai-onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get response from AI");
      }

      const data = await res.json();
      const aiReply = data.reply || "";
      const isComplete: boolean = Boolean(data.isComplete);
      let profileData: ProfileData | null = data.profileData;

      // Fallback extraction if backend profileData wasn't triggered
      if (!profileData) {
        const fallback = checkAndParseFallbackSummary(aiReply);
        if (fallback && (fallback.role || fallback.bio || fallback.skills)) {
          profileData = {
            role: fallback.role || "Applicant",
            industry: fallback.industry || "",
            experience: fallback.experience || "",
            bio: fallback.bio || "",
            skills: fallback.skills || [],
            onboardingAnswers: { ...fallback },
          };
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);

      if (profileData) {
        setLiveProfile((prev) => ({
          ...prev,
          ...profileData,
        }));
      }

      // If AI is complete or bio/skills were drafted, activate the Proceed button
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

  // Handle Proceed: Save profile to MongoDB and redirect to Startup Registration
  async function handleProceed() {
    if (isSaving || savedSuccess) return;
    setIsSaving(true);
    setError("");

    try {
      const userId = user?.id || user?._id;

      // 1. Update Bio and Skills in MongoDB
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

      // 2. Submit Onboarding Answers & mark onboardingComplete: true
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

      setSavedSuccess(true);

      // Redirect user to startup registration page
      setTimeout(() => {
        router.push("/onboarding?phase=startup");
      }, 500);
    } catch (err: any) {
      console.error("Saving profile failed:", err);
      setError(err.message || "Error saving profile. Please tap Proceed again.");
      setIsSaving(false);
    }
  }

  // Suggestion quick chips for common early questions
  const getSuggestions = () => {
    if (messages.length === 1) {
      return [
        "I'm a Founder building a startup 🚀",
        "I'm an Applicant looking for roles 💻",
        "A bit of both! ⚡",
      ];
    }
    return [];
  };

  const suggestions = getSuggestions();

  if (loadingUser) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-ink-radial text-mist-400">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-gold-400" />
          <span>Setting up your session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-ink-radial text-mist-100">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[400px] w-[400px] rounded-full bg-purple-900/15 blur-[140px]" />

      {/* Header bar - Permanently pinned at top */}
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-ink-950/80 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient shadow-gold text-ink-950">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm sm:text-base font-semibold text-white tracking-wide">
                FOUNDERS HOOK
              </span>
              <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[10px] font-medium text-gold-300">
                AI Copilot
              </span>
            </div>
            <p className="text-[11px] text-mist-400">
              Interactive Profile Builder
            </p>
          </div>
        </div>

        {/* User avatar snapshot in header */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-white">{user?.name}</p>
            <p className="text-[11px] text-mist-400">@{user?.username}</p>
          </div>
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-ink-900 shadow-sm">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gold-300">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main container: Left is Chat, Right is Live Preview */}
      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
        {/* Chat Column */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          {/* Messages Scroll Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 overscroll-contain sm:px-8"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm border border-gold-400/35 bg-gradient-to-r from-gold-500/20 to-gold-400/25 px-5 py-3.5 text-xs sm:text-sm text-sand-100 shadow-card">
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="flex max-w-[92%] sm:max-w-[85%] items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/15 text-gold-300 shadow-sm">
                        <Bot size={16} />
                      </div>
                      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-white/10 bg-ink-900/90 px-5 py-4 shadow-card backdrop-blur-md">
                        <FormattedMessageContent text={msg.content} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 max-w-[85%]"
                >
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/15 text-gold-300 shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-ink-900/90 px-4 py-3 text-xs text-mist-400">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-400 [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-400 [animation-delay:0.4s]" />
                    <span className="ml-2 text-xs">Pondering...</span>
                  </div>
                </motion.div>
              )}

              {/* Chatbot Completion Message with Proceed Button */}
              {profileReady && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex w-full justify-start"
                >
                  <div className="flex max-w-[92%] sm:max-w-[85%] items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/15 text-gold-300 shadow-sm">
                      <Bot size={16} />
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-gold-500/30 bg-ink-900/90 px-5 py-4 shadow-card backdrop-blur-md">
                      <p className="text-xs sm:text-sm text-sand-100 leading-relaxed font-medium">
                        Woohoo!! 🎉 Your profile is complete, you may proceed!
                      </p>
                      <div className="mt-3.5">
                        <button
                          type="button"
                          onClick={handleProceed}
                          disabled={isSaving || savedSuccess}
                          className="btn-gold !py-2.5 !px-5 text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-2 shadow-gold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              <span>Saving & Proceeding...</span>
                            </>
                          ) : (
                            <>
                              <span>Proceed</span>
                              <ArrowRight size={15} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Suggestions chips */}
              {suggestions.length > 0 && !isTyping && !profileReady && (
                <div className="mt-2 flex flex-wrap gap-2 pl-11">
                  {suggestions.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(chip)}
                      className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1.5 text-xs text-gold-200 transition-all hover:bg-gold-500/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="mx-auto w-full max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Saving / Success state banner */}
          <AnimatePresence>
            {(isSaving || savedSuccess) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="mx-4 mb-2 max-w-3xl rounded-2xl border border-gold-500/30 bg-ink-950/90 p-4 text-center shadow-gold backdrop-blur-lg sm:mx-auto sm:w-full"
              >
                {savedSuccess ? (
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400">
                    <CheckCircle2 size={18} />
                    <span>Redirecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-gold-300">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Finalizing your profile and saving answers...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Bar - Aligned with the max-w-3xl messages container */}
          <footer className="shrink-0 border-t border-white/10 bg-ink-950/80 px-4 py-3 backdrop-blur-md sm:px-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="mx-auto flex max-w-3xl items-center gap-2.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                disabled={isTyping || isSaving || savedSuccess}
                className="field-input flex-1 !py-3 !px-4 text-xs sm:text-sm placeholder-sand-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping || isSaving || savedSuccess}
                className="btn-gold !py-3 !px-4 shrink-0 rounded-xl disabled:opacity-40"
              >
                {isTyping ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </footer>
        </div>

        {/* Live Profile Card Sidebar (Desktop) */}
        <aside className="hidden border-l border-white/10 bg-ink-900/60 p-6 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between overflow-y-auto">
          <div>
            <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400">
                  Live Profile Preview
                </span>
                <p className="text-[11px] text-mist-400">Updates as you chat</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* Profile Card Mockup */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-gold-500/40 bg-ink-800 shadow-sm shrink-0">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-sand-300">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-sm font-semibold text-white truncate">
                    {user?.name || "Your Name"}
                  </h3>
                  <p className="text-xs text-mist-400 truncate">
                    @{user?.username || "username"}
                  </p>
                  {liveProfile.role && (
                    <span className="mt-1.5 inline-block rounded-md border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[10px] font-semibold text-gold-300">
                      {liveProfile.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio Preview */}
              <div className="mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">
                  Bio
                </span>
                <p className="mt-1.5 min-h-[50px] text-xs text-sand-200 leading-relaxed italic bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  {liveProfile.bio ? (
                    `"${liveProfile.bio}"`
                  ) : (
                    <span className="text-mist-500 not-italic">
                      Your AI copilot will write a custom bio as you chat...
                    </span>
                  )}
                </p>
              </div>

              {/* Skills Preview */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">
                  Detected Skills
                </span>
                <div className="mt-1.5 flex min-h-[36px] flex-wrap gap-1.5">
                  {liveProfile.skills && liveProfile.skills.length > 0 ? (
                    liveProfile.skills.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-gold-500/20 bg-gold-500/10 px-2 py-1 text-[11px] font-medium text-gold-200"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-mist-500">
                      Skills will appear here...
                    </span>
                  )}
                </div>
              </div>

              {/* Proceed button in preview card if profile is ready */}
              {(profileReady || liveProfile.bio) && (
                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={isSaving || savedSuccess}
                  className="btn-gold mt-4 w-full !py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-gold disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving & Proceeding...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <p className="text-[11px] text-mist-400">
              Chat freely! You can always edit your profile later.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
