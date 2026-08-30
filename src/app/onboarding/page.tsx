"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
  Plus,
  Trash2,
  Briefcase,
  DollarSign,
  Ban,
  Clock,
  UploadCloud,
  Image as ImageIcon,
  Network,
  Activity,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

// ─── Questionnaire Types ───────────────────────────────────────────────────────

type Question = {
  _id: string;
  text: string;
  type: "single_choice" | "multiple_choice" | "text";
  options?: string[];
  order: number;
};

// ─── Startup Form Types ────────────────────────────────────────────────────────

type RoleType = "Internship" | "Full-time" | "Part-time";

interface OpenRole {
  title: string;
  type: RoleType;
  description: string;
  paid: boolean;
}

interface StartupForm {
  projectName: string;
  tagline: string;
  website: string;
  projectDescription: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  openRoles: OpenRole[];
}

const CATEGORIES = [
  "AI / ML",
  "FinTech",
  "EdTech",
  "HealthTech",
  "SaaS",
  "E-Commerce",
  "Web3 / Crypto",
  "Climate Tech",
  "Consumer",
  "Developer Tools",
  "Other",
];

const ROLE_TYPES: RoleType[] = ["Internship", "Part-time", "Full-time"];

// Startup setup has 6 steps: 0=intro, 1=name+tagline+category, 2=website,
// 3=description, 4=media, 5=roles, 6=done
const STARTUP_TOTAL_STEPS = 6;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  // ── Questionnaire state ────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qStep, setQStep] = useState(0);
  const [qError, setQError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // ── Phase state ────────────────────────────────────────────────────────────
  // "questions" → answer the questionnaire
  // "startup"   → fill in startup details
  const [phase, setPhase] = useState<"questions" | "startup">("questions");

  // ── Startup form state ─────────────────────────────────────────────────────
  const [startupStep, setStartupStep] = useState(0);
  const [startupSubmitting, setStartupSubmitting] = useState(false);
  const [startupError, setStartupError] = useState("");
  const [startupForm, setStartupForm] = useState<StartupForm>({
    projectName: "",
    tagline: "",
    website: "",
    projectDescription: "",
    category: "",
    logoUrl: "",
    bannerUrl: "",
    openRoles: [],
  });
  const [draftRole, setDraftRole] = useState<OpenRole>({
    title: "",
    type: "Internship",
    description: "",
    paid: false,
  });

  // ── Load questions ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json();
        setQuestions(data);
      } catch {
        setQError("Failed to load onboarding questions. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // ── Questionnaire helpers ──────────────────────────────────────────────────
  function canAdvance() {
    const currentAnswer = answers[questions[qStep]?._id];
    if (questions[qStep]?.type === "multiple_choice") {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    return !!currentAnswer && String(currentAnswer).trim() !== "";
  }

  function handleToggle(value: string) {
    const q = questions[qStep];
    if (q.type === "single_choice") {
      setAnswers((a) => ({ ...a, [q._id]: value }));
    } else if (q.type === "multiple_choice") {
      setAnswers((a) => {
        const cur = (a[q._id] as string[]) || [];
        return {
          ...a,
          [q._id]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
        };
      });
    }
  }

  function handleTextChange(value: string) {
    setAnswers((a) => ({ ...a, [questions[qStep]._id]: value }));
  }

  async function handleQuestionnaireFinish() {
    setQError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) {
        setQError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }
      // Transition to the startup setup phase
      setPhase("startup");
    } catch {
      setQError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    if (qStep === questions.length - 1) {
      handleQuestionnaireFinish();
    } else {
      setQStep((s) => s + 1);
    }
  }

  // ── Startup form helpers ───────────────────────────────────────────────────
  function updateStartup(patch: Partial<StartupForm>) {
    setStartupForm((prev) => ({ ...prev, ...patch }));
  }

  function addRole() {
    if (!draftRole.title.trim()) return;
    updateStartup({ openRoles: [...startupForm.openRoles, { ...draftRole }] });
    setDraftRole({ title: "", type: "Internship", description: "", paid: false });
  }

  function removeRole(idx: number) {
    updateStartup({ openRoles: startupForm.openRoles.filter((_, i) => i !== idx) });
  }

  async function handleStartupLaunch() {
    setStartupSubmitting(true);
    setStartupError("");
    try {
      const finalRoles = draftRole.title.trim()
        ? [...startupForm.openRoles, { ...draftRole }]
        : startupForm.openRoles;

      const res = await fetch("/api/startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: startupForm.projectName.trim(),
          tagline: startupForm.tagline.trim(),
          description: startupForm.projectDescription.trim(),
          category: startupForm.category,
          logoUrl: startupForm.logoUrl || undefined,
          bannerUrl: startupForm.bannerUrl || undefined,
          openRoles: finalRoles,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStartupError(data.error || "Something went wrong.");
        setStartupSubmitting(false);
        return;
      }
      setStartupStep(STARTUP_TOTAL_STEPS);
      setTimeout(() => router.push("/waitlist-success"), 2500);
    } catch {
      setStartupError("Network error. Please try again.");
      setStartupSubmitting(false);
    }
  }

  // ── Loading / empty states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-radial">
        <p className="text-mist-400">Loading your onboarding experience...</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-radial">
        <p className="text-mist-400">No questions found. Please add them to your database.</p>
      </main>
    );
  }

  // ── Questionnaire phase ────────────────────────────────────────────────────
  if (phase === "questions") {
    const currentQuestion = questions[qStep];
    const progress = ((qStep + 1) / questions.length) * 100;

    return (
      <main className="relative flex min-h-screen items-center justify-center bg-ink-radial px-6 py-16">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-white/5 blur-[110px]" />

        <div className="relative z-10 w-full max-w-xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-xs text-mist-500">
              <span>Step {qStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-white/20"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-ink-900/80 p-8 shadow-card backdrop-blur-xl sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion._id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <QuestionBlock title={currentQuestion.text}>
                  {(currentQuestion.type === "single_choice" ||
                    currentQuestion.type === "multiple_choice") && (
                      <OptionGrid
                        options={currentQuestion.options || []}
                        selected={
                          currentQuestion.type === "multiple_choice"
                            ? answers[currentQuestion._id] || []
                            : answers[currentQuestion._id]
                              ? [answers[currentQuestion._id]]
                              : []
                        }
                        multi={currentQuestion.type === "multiple_choice"}
                        onToggle={handleToggle}
                      />
                    )}
                  {currentQuestion.type === "text" && (
                    <textarea
                      value={answers[currentQuestion._id] || ""}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="field-input w-full resize-none"
                    />
                  )}
                </QuestionBlock>
              </motion.div>
            </AnimatePresence>

            {qError && (
              <p className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {qError}
              </p>
            )}

            <div className="mt-9 flex items-center justify-between">
              <button
                onClick={() => setQStep((s) => Math.max(0, s - 1))}
                disabled={qStep === 0}
                className="inline-flex items-center gap-1.5 text-sm text-mist-400 transition-colors hover:text-white disabled:opacity-0"
              >
                <ArrowLeft size={15} /> Back
              </button>

              <button
                onClick={nextQuestion}
                disabled={!canAdvance() || submitting}
                className="btn-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {qStep === questions.length - 1
                  ? submitting
                    ? "Saving..."
                    : "Continue"
                  : "Continue"}
                {qStep === questions.length - 1 ? (
                  <ArrowRight size={16} />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Startup setup phase ────────────────────────────────────────────────────
  const textGlow = { textShadow: "0 4px 24px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)" };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-radial px-4 py-12">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-white/5 blur-[110px]" />
      <motion.div
        style={{ filter: "blur(130px)" }}
        animate={{ x: [0, 60, -40, 30, 0], y: [0, -60, 40, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-24 -left-20 h-[400px] w-[400px] rounded-full bg-purple-900/30"
      />
      <motion.div
        style={{ filter: "blur(140px)" }}
        animate={{ x: [0, -50, 70, -40, 0], y: [0, 40, -60, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-24 right-0 h-[400px] w-[400px] rounded-full bg-indigo-900/30"
      />

      <div className="relative z-10 w-full max-w-2xl">

        {/* Header badge */}
        <AnimatePresence>
          {startupStep < STARTUP_TOTAL_STEPS && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center justify-center gap-3"
            >
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-medium text-white">
                <Rocket size={14} />
                Tell us about your startup
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#09090b] shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[560px] flex flex-col items-center">

          {/* Animated background blobs */}
          <motion.div
            style={{ filter: "blur(110px)" }}
            animate={{ x: [0, 40, -30, 20, 0], y: [0, -40, 30, -20, 0], scale: [1, 1.15, 0.9, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-16 -left-16 h-[350px] w-[350px] rounded-full bg-cyan-900/30 pointer-events-none z-0"
          />
          <motion.div
            style={{ filter: "blur(120px)" }}
            animate={{ x: [0, -30, 50, -30, 0], y: [0, 30, -40, 20, 0], scale: [1, 0.9, 1.2, 0.95, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-16 -right-16 h-[350px] w-[350px] rounded-full bg-indigo-900/30 pointer-events-none z-0"
          />

          {/* Progress dots */}
          {startupStep < STARTUP_TOTAL_STEPS && (
            <div className="relative z-10 flex items-center gap-2 mt-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`transition-all duration-300 rounded-full ${startupStep >= s
                    ? "w-6 h-2 bg-white"
                    : startupStep === s - 1 || startupStep === 0
                      ? "w-2 h-2 bg-white/20"
                      : "w-2 h-2 bg-white/10"
                    }`}
                />
              ))}
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex h-full w-full flex-col items-center pt-10 px-8 pb-12">
            <AnimatePresence mode="wait">

              {/* STEP 0 – Intro */}
              {startupStep === 0 && (
                <motion.div
                  key="s-step-0"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex flex-col items-center text-center w-full pt-8 md:pt-12"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-white shadow-[0_0_25px_rgba(251,191,36,0.25)]">
                    <Rocket size={30} />
                  </div>
                  <h2 style={textGlow} className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    Tell us about your startup
                  </h2>
                  <p className="mt-4 max-w-md text-sm text-mist-400 leading-relaxed">
                    We&apos;re collecting startups now so the platform is alive from day one.
                    Takes about 2 minutes — and your startup will be featured at launch!
                  </p>

                  <div className="mt-10 flex flex-col items-center gap-4">
                    <button
                      onClick={() => setStartupStep(1)}
                      className="btn-gold !px-8 !py-3"
                    >
                      Set Up My Startup <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1 – Name, Tagline, Category */}
              {startupStep === 1 && (
                <motion.div
                  key="s-step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center text-center w-full max-w-xl"
                >
                  <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl">
                    Name your Startup
                  </h3>

                  <input
                    type="text"
                    placeholder="My Awesome Startup"
                    value={startupForm.projectName}
                    onChange={(e) => updateStartup({ projectName: e.target.value })}
                    className="mt-10 w-full max-w-md rounded-xl border border-white/20 bg-black/40 backdrop-blur-md py-4 px-6 text-center text-xl text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none transition-all shadow-xl"
                    autoFocus
                  />

                  <input
                    type="text"
                    placeholder="One-line tagline…"
                    maxLength={120}
                    value={startupForm.tagline}
                    onChange={(e) => updateStartup({ tagline: e.target.value })}
                    className="mt-4 w-full max-w-md rounded-xl border border-white/20 bg-black/40 backdrop-blur-md py-3 px-6 text-center text-base text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none transition-all shadow-xl"
                  />

                  {/* Category pills */}
                  <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateStartup({ category: cat })}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${startupForm.category === cat
                          ? "bg-white/20 border-white/40 text-white backdrop-blur-md shadow-[0_4px_12px_rgba(255,255,255,0.05)]"
                          : "bg-white/5 border-white/15 text-gray-300 hover:bg-white/10"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="mt-10 flex w-full max-w-md items-center justify-between">
                    <button
                      onClick={() => setStartupStep(0)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      style={textGlow}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={() => setStartupStep(2)}
                      disabled={
                        !startupForm.projectName.trim() ||
                        !startupForm.tagline.trim() ||
                        !startupForm.category
                      }
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={textGlow}
                    >
                      Next Phase <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 – Website */}
              {startupStep === 2 && (
                <motion.div
                  key="s-step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center text-center w-full max-w-xl"
                >
                  <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl">
                    Do you have a Website?
                  </h3>
                  <input
                    type="url"
                    placeholder="https://your-startup.com"
                    value={startupForm.website}
                    onChange={(e) => updateStartup({ website: e.target.value })}
                    className="mt-12 w-full max-w-md rounded-xl border border-white/20 bg-black/40 backdrop-blur-md py-4 px-6 text-center text-xl text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none transition-all shadow-xl"
                    autoFocus
                  />
                  <div className="mt-12 flex w-full max-w-md items-center justify-between">
                    <button
                      onClick={() => setStartupStep(1)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      style={textGlow}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => { updateStartup({ website: "" }); setStartupStep(3); }}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        style={textGlow}
                      >
                        No, not yet
                      </button>
                      <button
                        onClick={() => setStartupStep(3)}
                        disabled={!startupForm.website.trim()}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        style={textGlow}
                      >
                        Next <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 – Description */}
              {startupStep === 3 && (
                <motion.div
                  key="s-step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center text-center w-full max-w-2xl"
                >
                  <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl">
                    Describe your Startup/Idea
                  </h3>
                  <textarea
                    value={startupForm.projectDescription}
                    onChange={(e) => updateStartup({ projectDescription: e.target.value })}
                    placeholder="What problem are you solving? What makes you different?"
                    maxLength={1000}
                    className="mt-10 min-h-[160px] w-full max-w-lg resize-none rounded-xl border border-white/20 bg-black/40 backdrop-blur-md py-4 px-6 text-base text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none transition-all shadow-xl"
                    autoFocus
                  />
                  <p className="mt-1.5 self-end max-w-lg text-xs text-gray-600">
                    {startupForm.projectDescription.length}/1000
                  </p>
                  <div className="mt-8 flex w-full max-w-lg items-center justify-between">
                    <button
                      onClick={() => setStartupStep(2)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      style={textGlow}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={() => setStartupStep(4)}
                      disabled={!startupForm.projectDescription.trim()}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={textGlow}
                    >
                      Next Phase <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 – Media Upload */}
              {startupStep === 4 && (
                <motion.div
                  key="s-step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center text-center w-full max-w-2xl"
                >
                  <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl">
                    Upload Startup Media
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add a logo and a banner to make your startup stand out. Both are optional.
                  </p>

                  <div className="mt-10 flex w-full max-w-lg flex-col gap-4">
                    {/* Logo Upload */}
                    <div className="flex items-center justify-between w-full rounded-xl border border-white/20 bg-black/40 backdrop-blur-md p-4 text-white">
                      <div className="flex items-center gap-3">
                        {startupForm.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={startupForm.logoUrl}
                            alt="Logo preview"
                            className="h-12 w-12 rounded-xl object-cover bg-black border border-white/10"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                            <ImageIcon size={22} />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="font-medium text-gray-200 text-sm">Startup Logo</p>
                          <p className="text-xs text-gray-500">Square, min 200×200px</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {startupForm.logoUrl && (
                          <button
                            onClick={() => updateStartup({ logoUrl: "" })}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Remove Logo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <CldUploadWidget
                          uploadPreset="founders_hook_users"
                          options={{
                            folder: "startups-logo",
                            cropping: true,
                            croppingAspectRatio: 1,
                            showSkipCropButton: false,
                            multiple: false,
                            maxFiles: 1,
                            clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
                          }}
                          onSuccess={(res) => {
                            if (res.info && typeof res.info === "object") {
                              const url = (res.info as Record<string, string>).secure_url;
                              if (url) updateStartup({ logoUrl: url });
                            }
                          }}
                        >
                          {({ open }) => (
                            <button
                              onClick={() => open()}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                            >
                              {startupForm.logoUrl ? "Change" : "Upload"} <UploadCloud size={16} />
                            </button>
                          )}
                        </CldUploadWidget>
                      </div>
                    </div>

                    {/* Banner Upload */}
                    <div className="flex items-center justify-between w-full rounded-xl border border-white/20 bg-black/40 backdrop-blur-md p-4 text-white">
                      <div className="flex items-center gap-3">
                        {startupForm.bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={startupForm.bannerUrl}
                            alt="Banner preview"
                            className="h-12 w-20 rounded-lg object-cover bg-black border border-white/10"
                          />
                        ) : (
                          <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-white/10 text-white">
                            <ImageIcon size={22} />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="font-medium text-gray-200 text-sm">Cover Banner</p>
                          <p className="text-xs text-cyan-400 font-medium">3:1 aspect ratio (recommended: 1200×400px)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {startupForm.bannerUrl && (
                          <button
                            onClick={() => updateStartup({ bannerUrl: "" })}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Remove Banner"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <CldUploadWidget
                          uploadPreset="founders_hook_users"
                          options={{
                            folder: "startups-banner",
                            cropping: true,
                            croppingAspectRatio: 3,
                            showSkipCropButton: false,
                            multiple: false,
                            maxFiles: 1,
                            clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
                          }}
                          onSuccess={(res) => {
                            if (res.info && typeof res.info === "object") {
                              const url = (res.info as Record<string, string>).secure_url;
                              if (url) updateStartup({ bannerUrl: url });
                            }
                          }}
                        >
                          {({ open }) => (
                            <button
                              onClick={() => open()}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                            >
                              {startupForm.bannerUrl ? "Change" : "Upload"} <UploadCloud size={16} />
                            </button>
                          )}
                        </CldUploadWidget>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex w-full max-w-lg items-center justify-between">
                    <button
                      onClick={() => setStartupStep(3)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      style={textGlow}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={() => setStartupStep(5)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      style={textGlow}
                    >
                      Next Phase <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5 – Open Roles */}
              {startupStep === 5 && (
                <motion.div
                  key="s-step-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center w-full max-w-2xl"
                >
                  <h3
                    style={textGlow}
                    className="text-3xl font-medium text-white md:text-4xl text-center"
                  >
                    Open Roles
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Add any roles you&apos;re looking to fill — co-founders, engineers, designers. You can skip this.
                  </p>

                  {/* Existing roles */}
                  {startupForm.openRoles.length > 0 && (
                    <ul className="mt-6 w-full space-y-2">
                      {startupForm.openRoles.map((role, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3"
                        >
                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="text-sm font-semibold text-white">{role.title}</span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Clock size={10} /> {role.type}
                              </span>
                              <span
                                className={`flex items-center gap-1 text-[11px] ${role.paid ? "text-white" : "text-gray-500"
                                  }`}
                              >
                                {role.paid ? <DollarSign size={10} /> : <Ban size={10} />}
                                {role.paid ? "Paid" : "Unpaid"}
                              </span>
                            </div>
                            {role.description && (
                              <span className="text-xs text-gray-600 line-clamp-1">
                                {role.description}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeRole(idx)}
                            className="ml-4 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  )}

                  {/* Draft role composer */}
                  <div className="mt-5 w-full rounded-2xl border border-white/15 bg-black/30 backdrop-blur-md p-5 flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                      <Briefcase size={12} /> Add a Role
                    </p>

                    <input
                      type="text"
                      placeholder="Role title  e.g. Frontend Engineer"
                      value={draftRole.title}
                      onChange={(e) => setDraftRole((d) => ({ ...d, title: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-white/40 focus:outline-none transition-all"
                    />

                    <div className="flex gap-3 flex-wrap">
                      <div className="flex gap-2">
                        {ROLE_TYPES.map((t) => (
                          <button
                            key={t}
                            onClick={() => setDraftRole((d) => ({ ...d, type: t }))}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${draftRole.type === t
                              ? "bg-white/20 border-white/40 text-white backdrop-blur-md shadow-[0_4px_12px_rgba(255,255,255,0.05)]"
                              : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10"
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setDraftRole((d) => ({ ...d, paid: !d.paid }))}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${draftRole.paid
                          ? "bg-white/20 border-white/40 text-white backdrop-blur-md shadow-[0_4px_12px_rgba(255,255,255,0.05)]"
                          : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10"
                          }`}
                      >
                        {draftRole.paid ? <DollarSign size={11} /> : <Ban size={11} />}
                        {draftRole.paid ? "Paid" : "Unpaid"}
                      </button>
                    </div>

                    <textarea
                      placeholder="Brief job description, skills required, hours per week…"
                      value={draftRole.description}
                      onChange={(e) => setDraftRole((d) => ({ ...d, description: e.target.value }))}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-white/40 focus:outline-none transition-all"
                    />

                    <button
                      onClick={addRole}
                      disabled={!draftRole.title.trim()}
                      className="self-end flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} /> Add Role
                    </button>
                  </div>

                  {startupError && (
                    <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 w-full">
                      {startupError}
                    </p>
                  )}

                  <div className="mt-8 flex w-full items-center justify-between">
                    <button
                      onClick={() => setStartupStep(4)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      style={textGlow}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={handleStartupLaunch}
                      disabled={startupSubmitting}
                      className="btn-gold !px-8 !py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {startupSubmitting ? "Saving…" : "Save & Continue"}
                      <Network size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 6 – Done */}
              {startupStep === STARTUP_TOTAL_STEPS && (
                <motion.div
                  key="s-step-done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center pt-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/30"
                  >
                    <CheckCircle2 size={30} className="text-white" />
                  </motion.div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                    <Activity size={16} /> Startup Saved!
                  </div>
                  <h3 style={textGlow} className="text-4xl font-semibold text-white">
                    You&apos;re all set!
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Your startup is saved. Redirecting to your waitlist spot…
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Questionnaire sub-components ─────────────────────────────────────────────

function QuestionBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-mist-400">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function OptionGrid({
  options,
  selected,
  onToggle,
  multi = false,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`chip justify-start text-left ${isActive ? "chip-active" : ""}`}
          >
            <span className="flex w-full items-center justify-between">
              {opt}
              {isActive && <Check size={15} className="text-white" />}
            </span>
          </button>
        );
      })}
      {multi && (
        <p className="col-span-full mt-1 text-xs text-mist-500">{selected.length} selected</p>
      )}
    </div>
  );
}