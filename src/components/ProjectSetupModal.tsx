"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Network,
  Activity,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Plus,
  Briefcase,
  DollarSign,
  Ban,
  Clock,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { StartupLogo, StartupBanner } from "./StartupMedia";

// ─── Types ───────────────────────────────────────────────────────────────────

type RoleType = "Internship" | "Full-time" | "Part-time";

interface OpenRole {
  title: string;
  type: RoleType;
  description: string;
  paid: boolean;
}

interface FormData {
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

const TOTAL_STEPS = 6; // 0=intro, 1=name+tagline+category, 2=website, 3=description, 4=media, 5=roles, 6=done

// ─── Component ───────────────────────────────────────────────────────────────

export type ProjectSetupInitialData = {
  projectName: string;
  tagline: string;
  website?: string;
  projectDescription: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  openRoles: OpenRole[];
};

export default function ProjectSetupModal({
  onClose,
  startupId,
  initialData,
}: {
  onClose: () => void;
  startupId?: string;
  initialData?: ProjectSetupInitialData;
}) {
  const isEditMode = !!startupId;
  const [step, setStep] = useState(isEditMode ? 1 : 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    projectName: initialData?.projectName ?? "",
    tagline: initialData?.tagline ?? "",
    website: initialData?.website ?? "",
    projectDescription: initialData?.projectDescription ?? "",
    category: initialData?.category ?? "",
    logoUrl: initialData?.logoUrl ?? "",
    bannerUrl: initialData?.bannerUrl ?? "",
    openRoles: initialData?.openRoles ?? [],
  });

  // Role being composed in the roles step
  const [draftRole, setDraftRole] = useState<OpenRole>({
    title: "",
    type: "Internship",
    description: "",
    paid: false,
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function updateForm(patch: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  function addRole() {
    if (!draftRole.title.trim()) return;
    updateForm({ openRoles: [...formData.openRoles, { ...draftRole }] });
    setDraftRole({ title: "", type: "Internship", description: "", paid: false });
  }

  function removeRole(idx: number) {
    updateForm({ openRoles: formData.openRoles.filter((_, i) => i !== idx) });
  }

  async function handleLaunch() {
    setSubmitting(true);
    setError("");
    try {
      const url = isEditMode ? `/api/startups/${startupId}` : "/api/startups";
      const method = isEditMode ? "PATCH" : "POST";
      const finalRoles = draftRole.title.trim()
        ? [...formData.openRoles, { ...draftRole }]
        : formData.openRoles;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.projectName.trim(),
          tagline: formData.tagline.trim(),
          description: formData.projectDescription.trim(),
          category: formData.category,
          logoUrl: formData.logoUrl || undefined,
          bannerUrl: formData.bannerUrl || undefined,
          website: formData.website.trim() || undefined,
          openRoles: finalRoles,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setStep(TOTAL_STEPS);
      // Auto-close after success animation
      setTimeout(() => onClose(), 2800);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  // ── Background network animation scaling ────────────────────────────────────

  const networkAnim =
    step === 0 ? { scale: 0.9, y: [0, -4, 0] } :
    step === 1 ? { scale: 1.0, y: [0, -6, 0] } :
    step === 2 ? { scale: 1.05, y: [0, -8, 0] } :
    step === 3 ? { scale: 1.1, y: [0, -10, 0] } :
    step === 4 ? { scale: 1.15, y: [0, -12, 0] } :
    step === 5 ? { scale: 1.2, y: [0, -14, 0] } :
    { scale: 1.3 };

  const networkTrans: Transition =
    step === TOTAL_STEPS
      ? { duration: 1.8, ease: [0.4, 0, 0.2, 1] }
      : { duration: 4, repeat: Infinity, ease: "easeInOut" };

  const textGlow = {
    textShadow: "0 4px 24px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)",
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={step < TOTAL_STEPS ? onClose : undefined}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative flex w-full max-w-7xl flex-col items-center overflow-hidden rounded-[28px] border border-white/10 bg-[#09090b] shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[640px]"
      >
        {/* Close button */}
        {step < TOTAL_STEPS && (
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X size={18} />
          </button>
        )}

        {/* ── Animated background blobs ── */}
        <motion.div
          style={{ filter: "blur(130px)" }}
          animate={{ x: [0, 60, -40, 30, 0], y: [0, -60, 40, -30, 0], scale: [1, 1.2, 0.85, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -left-20 h-[500px] w-[500px] rounded-full bg-cyan-900/40 pointer-events-none z-0"
        />
        <motion.div
          style={{ filter: "blur(140px)" }}
          animate={{ x: [0, -50, 70, -40, 0], y: [0, 40, -60, 30, 0], scale: [1, 0.85, 1.25, 0.9, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-900/40 pointer-events-none z-0"
        />
        <motion.div
          style={{ filter: "blur(120px)" }}
          animate={{ x: [0, 40, -70, 50, 0], y: [0, 60, -40, -50, 0], scale: [1, 1.15, 0.9, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-900/40 pointer-events-none z-0"
        />

        {/* ── Network node graphic (back layer) ── */}
        <NetworkGraphic networkAnim={networkAnim} networkTrans={networkTrans} step={step} zIndex={0} />

        {/* ── Main content ── */}
        <div className="relative z-10 flex h-full w-full flex-col items-center pt-20 px-8 pb-12">
          <AnimatePresence mode="wait">

            {/* STEP 0 – Intro */}
            {step === 0 && (
              <motion.div key="step-0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex flex-col items-center text-center w-full pt-16 md:pt-24">
                <h2 style={textGlow} className="text-4xl font-medium tracking-tight text-white md:text-[44px]">
                  Ready to build your startup network?
                </h2>
                <button onClick={() => setStep(1)} className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors" style={textGlow}>
                  Let&apos;s hit it on <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* STEP 1 – Name, Tagline, Category */}
            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center text-center w-full max-w-xl">
                <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl">
                  Name your Startup
                </h3>

                <input
                  type="text"
                  placeholder="My Awesome Startup"
                  value={formData.projectName}
                  onChange={(e) => updateForm({ projectName: e.target.value })}
                  className="mt-10 w-full max-w-md rounded-xl border border-white/20 bg-black/40 backdrop-blur-md py-4 px-6 text-center text-xl text-white placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none transition-all shadow-xl"
                  autoFocus
                />

                <input
                  type="text"
                  placeholder="One-line tagline…"
                  maxLength={120}
                  value={formData.tagline}
                  onChange={(e) => updateForm({ tagline: e.target.value })}
                  className="mt-4 w-full max-w-md rounded-xl border border-white/20 bg-black/40 backdrop-blur-md py-3 px-6 text-center text-base text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none transition-all shadow-xl"
                />

                {/* Category pills */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateForm({ category: cat })}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                        formData.category === cat
                          ? "bg-cyan-500 border-cyan-400 text-black"
                          : "bg-white/5 border-white/15 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex w-full max-w-md items-center justify-between">
                  <button onClick={() => setStep(0)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors" style={textGlow}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.projectName.trim() || !formData.tagline.trim() || !formData.category}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={textGlow}
                  >
                    Next Phase <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 – Website */}
            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center text-center w-full max-w-xl">
                <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl">
                  Do you have a Website?
                </h3>
                <input
                  type="url"
                  placeholder="https://your-startup.com"
                  value={formData.website}
                  onChange={(e) => updateForm({ website: e.target.value })}
                  className="mt-12 w-full max-w-md rounded-xl border border-white/20 bg-black/40 backdrop-blur-md py-4 px-6 text-center text-xl text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none transition-all shadow-xl"
                  autoFocus
                />
                <div className="mt-12 flex w-full max-w-md items-center justify-between">
                  <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors" style={textGlow}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <div className="flex items-center gap-6">
                    <button onClick={() => { updateForm({ website: "" }); setStep(3); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors" style={textGlow}>
                      No, not yet
                    </button>
                    <button onClick={() => setStep(3)} disabled={!formData.website.trim()} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={textGlow}>
                      Next <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3 – Description */}
            {step === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center text-center w-full max-w-2xl">
                <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl">
                  Describe your Startup
                </h3>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => updateForm({ projectDescription: e.target.value })}
                  placeholder="What problem are you solving? What makes you different?"
                  maxLength={1000}
                  className="mt-10 min-h-[160px] w-full max-w-lg resize-none rounded-xl border border-white/20 bg-black/40 backdrop-blur-md py-4 px-6 text-base text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none transition-all shadow-xl"
                  autoFocus
                />
                <p className="mt-1.5 self-end max-w-lg text-xs text-gray-600">{formData.projectDescription.length}/1000</p>
                <div className="mt-8 flex w-full max-w-lg items-center justify-between">
                  <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors" style={textGlow}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!formData.projectDescription.trim()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={textGlow}
                  >
                    Next Phase <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 – Media Upload (Logo + Banner only) */}
            {step === 4 && (
              <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center text-center w-full max-w-2xl">
                <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl">
                  Upload Startup Media
                </h3>
                <p className="mt-2 text-sm text-gray-500">Add a logo and a banner to make your startup stand out.</p>

                <div className="mt-10 flex w-full max-w-lg flex-col gap-4">

                  {/* ── Logo Upload ── */}
                  <div className="flex items-center justify-between w-full rounded-xl border border-white/20 bg-black/40 backdrop-blur-md p-4 text-white">
                    <div className="flex items-center gap-3">
                      {formData.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.logoUrl} alt="Logo preview" className="h-12 w-12 rounded-xl object-cover bg-black border border-white/10" />
                      ) : (
                        <StartupLogo
                          icon=""
                          name={formData.projectName || "Startup"}
                          category={formData.category}
                          size="lg"
                          className="h-12 w-12 rounded-xl border border-white/15"
                        />
                      )}
                      <div className="text-left">
                        <p className="font-medium text-gray-200 text-sm">Startup Logo</p>
                        <p className="text-xs text-gray-500">
                          {formData.logoUrl ? "Custom logo uploaded" : "Default icon assigned (or upload custom)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {formData.logoUrl && (
                        <button onClick={() => updateForm({ logoUrl: "" })} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Remove Logo">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <CldUploadWidget
                        uploadPreset="founders_hook_users"
                        options={{ folder: "startups-logo", cropping: true, croppingAspectRatio: 1, showSkipCropButton: false, multiple: false, maxFiles: 1, clientAllowedFormats: ["png", "jpeg", "jpg", "webp"] }}
                        onSuccess={(res) => {
                          if (res.info && typeof res.info === "object") {
                            const url = (res.info as Record<string, string>).secure_url;
                            if (url) updateForm({ logoUrl: url });
                          }
                        }}
                      >
                        {({ open }) => (
                          <button onClick={() => open()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors">
                            {formData.logoUrl ? "Change" : "Upload"} <UploadCloud size={16} />
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>

                  {/* ── Banner Upload ── */}
                  <div className="flex items-center justify-between w-full rounded-xl border border-white/20 bg-black/40 backdrop-blur-md p-4 text-white">
                    <div className="flex items-center gap-3">
                      {formData.bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.bannerUrl} alt="Banner preview" className="h-12 w-20 rounded-lg object-cover bg-black border border-white/10" />
                      ) : (
                        <StartupBanner
                          coverImage=""
                          name={formData.projectName || "Startup"}
                          category={formData.category}
                          className="h-12 w-20 rounded-lg object-cover border border-white/15 shrink-0"
                        />
                      )}
                      <div className="text-left">
                        <p className="font-medium text-gray-200 text-sm">Cover Banner</p>
                        <p className="text-xs text-cyan-400 font-medium">
                          {formData.bannerUrl ? "Custom banner uploaded" : "Default themed banner assigned (3:1 ratio)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {formData.bannerUrl && (
                        <button onClick={() => updateForm({ bannerUrl: "" })} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Remove Banner">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <CldUploadWidget
                        uploadPreset="founders_hook_users"
                        options={{ folder: "startups-banner", cropping: true, croppingAspectRatio: 3, showSkipCropButton: false, multiple: false, maxFiles: 1, clientAllowedFormats: ["png", "jpeg", "jpg", "webp"] }}
                        onSuccess={(res) => {
                          if (res.info && typeof res.info === "object") {
                            const url = (res.info as Record<string, string>).secure_url;
                            if (url) updateForm({ bannerUrl: url });
                          }
                        }}
                      >
                        {({ open }) => (
                          <button onClick={() => open()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors">
                            {formData.bannerUrl ? "Change" : "Upload"} <UploadCloud size={16} />
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex w-full max-w-lg items-center justify-between">
                  <button onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors" style={textGlow}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={() => setStep(5)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors" style={textGlow}>
                    Next Phase <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5 – Open Roles */}
            {step === 5 && (
              <motion.div key="step-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center w-full max-w-2xl">
                <h3 style={textGlow} className="text-3xl font-medium text-white md:text-4xl text-center">
                  Open Roles
                </h3>
                <p className="mt-2 text-sm text-gray-500 text-center">Add the roles you&apos;re looking for co-founders or team members to fill. You can skip this.</p>

                {/* ── Existing roles list ── */}
                {formData.openRoles.length > 0 && (
                  <ul className="mt-6 w-full space-y-2">
                    {formData.openRoles.map((role, idx) => (
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
                            <span className={`flex items-center gap-1 text-[11px] ${role.paid ? "text-emerald-400" : "text-gray-500"}`}>
                              {role.paid ? <DollarSign size={10} /> : <Ban size={10} />}
                              {role.paid ? "Paid" : "Unpaid"}
                            </span>
                          </div>
                          {role.description && (
                            <span className="text-xs text-gray-600 line-clamp-1">{role.description}</span>
                          )}
                        </div>
                        <button onClick={() => removeRole(idx)} className="ml-4 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}

                {/* ── Draft role composer ── */}
                <div className="mt-5 w-full rounded-2xl border border-white/15 bg-black/30 backdrop-blur-md p-5 flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    <Briefcase size={12} /> Add a Role
                  </p>

                  {/* Title */}
                  <input
                    type="text"
                    placeholder="Role title  e.g. Frontend Engineer"
                    value={draftRole.title}
                    onChange={(e) => setDraftRole((d) => ({ ...d, title: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-cyan-400 focus:outline-none transition-all"
                  />

                  <div className="flex gap-3 flex-wrap">
                    {/* Type selector */}
                    <div className="flex gap-2">
                      {ROLE_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => setDraftRole((d) => ({ ...d, type: t }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                            draftRole.type === t
                              ? "bg-cyan-500 border-cyan-400 text-black"
                              : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Paid / Unpaid toggle */}
                    <button
                      onClick={() => setDraftRole((d) => ({ ...d, paid: !d.paid }))}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                        draftRole.paid
                          ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                          : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {draftRole.paid ? <DollarSign size={11} /> : <Ban size={11} />}
                      {draftRole.paid ? "Paid" : "Unpaid"}
                    </button>
                  </div>

                  {/* Description */}
                  <textarea
                    placeholder="Brief job description, skills required, hours per week…"
                    value={draftRole.description}
                    onChange={(e) => setDraftRole((d) => ({ ...d, description: e.target.value }))}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-cyan-400 focus:outline-none transition-all"
                  />

                  <button
                    onClick={addRole}
                    disabled={!draftRole.title.trim()}
                    className="self-end flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} /> Add Role
                  </button>
                </div>

                {error && (
                  <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 w-full">
                    {error}
                  </p>
                )}

                <div className="mt-8 flex w-full items-center justify-between">
                  <button onClick={() => setStep(4)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors" style={textGlow}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={handleLaunch}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all hover:bg-cyan-400 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? (isEditMode ? "Saving…" : "Launching…")
                      : (isEditMode ? "Save Changes" : "Activate Network")}
                    <Network size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6 – Done */}
            {step === TOTAL_STEPS && (
              <motion.div key="step-done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400/40"
                >
                  <CheckCircle2 size={30} className="text-cyan-400" />
                </motion.div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/20 px-4 py-1.5 text-sm font-medium text-cyan-300 backdrop-blur-md">
                  <Activity size={16} /> Sync Complete
                </div>
                <h3 style={textGlow} className="text-4xl font-semibold text-white">
                  {isEditMode ? "Changes Saved!" : "Network Online!"}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {isEditMode
                    ? "Your startup has been updated on Founders Hook."
                    : "Your startup is live on Founders Hook."}
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Network node graphic (front / blueprint layer) ── */}
        <NetworkGraphic networkAnim={networkAnim} networkTrans={networkTrans} step={step} zIndex={20} blueprint />
      </motion.div>
    </div>
  );
}

// ─── Network graphic (shared between back and front layers) ──────────────────

function NetworkGraphic({
  networkAnim,
  networkTrans,
  step,
  zIndex,
  blueprint = false,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  networkAnim: any;
  networkTrans: Transition;
  step: number;
  zIndex: number;
  blueprint?: boolean;
}) {
  if (blueprint) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-${zIndex} overflow-visible`}>
        <motion.div animate={networkAnim} transition={networkTrans} className="relative w-[180%] h-[180%] md:w-[130%] md:h-[130%] mt-32 flex items-center justify-center">
          <svg viewBox="0 0 140 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="blueprintGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <g stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 3" fill="none" opacity="0.4" filter="url(#blueprintGlow)">
              <circle cx="70" cy="170" r="18" />
              <circle cx="30" cy="110" r="9" />
              <circle cx="115" cy="125" r="11" />
              <circle cx="45" cy="230" r="8" />
              <circle cx="105" cy="215" r="10" />
              <circle cx="20" cy="175" r="7" />
              <line x1="70" y1="170" x2="30" y2="110" />
              <line x1="70" y1="170" x2="115" y2="125" />
              <line x1="70" y1="170" x2="45" y2="230" />
              <line x1="70" y1="170" x2="105" y2="215" />
              <line x1="70" y1="170" x2="20" y2="175" />
            </g>
          </svg>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-visible">
      <motion.div animate={networkAnim} transition={networkTrans} className="relative w-[180%] h-[180%] md:w-[130%] md:h-[130%] mt-32 flex items-center justify-center">
        <svg viewBox="0 0 140 300" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] opacity-90" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="nodeCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="nodeBranch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
            <motion.line x1="70" y1="170" x2="30" y2="110" initial={{ pathLength: 0 }} animate={{ pathLength: step >= 1 ? 1 : 0 }} transition={{ duration: 0.6, ease: "easeOut" }} />
            <motion.line x1="70" y1="170" x2="115" y2="125" initial={{ pathLength: 0 }} animate={{ pathLength: step >= 2 ? 1 : 0 }} transition={{ duration: 0.6, ease: "easeOut" }} />
            <motion.line x1="70" y1="170" x2="45" y2="230" initial={{ pathLength: 0 }} animate={{ pathLength: step >= 3 ? 1 : 0 }} transition={{ duration: 0.6, ease: "easeOut" }} />
            <motion.line x1="70" y1="170" x2="105" y2="215" initial={{ pathLength: 0 }} animate={{ pathLength: step >= 4 ? 1 : 0 }} transition={{ duration: 0.6, ease: "easeOut" }} />
            <motion.line x1="70" y1="170" x2="20" y2="175" initial={{ pathLength: 0 }} animate={{ pathLength: step >= 5 ? 1 : 0 }} transition={{ duration: 0.6, ease: "easeOut" }} />
          </g>

          {[
            { cx: 30, cy: 110, threshold: 1 },
            { cx: 115, cy: 125, threshold: 2 },
            { cx: 45, cy: 230, threshold: 3 },
            { cx: 105, cy: 215, threshold: 4 },
            { cx: 20, cy: 175, threshold: 5 },
          ].map(({ cx, cy, threshold }) => (
            <motion.g key={threshold} initial={{ scale: 0, opacity: 0 }} animate={{ scale: step >= threshold ? 1 : 0, opacity: step >= threshold ? 1 : 0 }} transition={{ type: "spring", stiffness: 100 }} style={{ originX: `${cx}px`, originY: `${cy}px` }}>
              <circle cx={cx} cy={cy} r={step >= threshold ? 9 : 6} fill="url(#nodeBranch)" filter="url(#nodeGlow)" />
            </motion.g>
          ))}

          <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 12 }}>
            <circle cx="70" cy="170" r={14 + step * 1.5} fill="url(#nodeCore)" filter="url(#nodeGlow)" />
            <motion.circle cx="70" cy="170" r={16 + step * 1.5} fill="none" stroke="#22d3ee" strokeWidth="2" animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
          </motion.g>

          <motion.g initial={{ opacity: 0 }} animate={{ opacity: step === 6 ? 1 : 0 }} transition={{ duration: 0.3 }}>
            <motion.circle cx="70" cy="170" r="2.5" fill="#fff" filter="url(#nodeGlow)" animate={step === 6 ? { cx: [70, 30], cy: [170, 110], opacity: [0, 1, 0] } : {}} transition={{ duration: 1, repeat: Infinity }} />
            <motion.circle cx="70" cy="170" r="2.5" fill="#fff" filter="url(#nodeGlow)" animate={step === 6 ? { cx: [70, 115], cy: [170, 125], opacity: [0, 1, 0] } : {}} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} />
            <motion.circle cx="70" cy="170" r="2.5" fill="#fff" filter="url(#nodeGlow)" animate={step === 6 ? { cx: [70, 45], cy: [170, 230], opacity: [0, 1, 0] } : {}} transition={{ duration: 0.9, repeat: Infinity, delay: 0.5 }} />
            <motion.circle cx="70" cy="170" r="2.5" fill="#fff" filter="url(#nodeGlow)" animate={step === 6 ? { cx: [70, 105], cy: [170, 215], opacity: [0, 1, 0] } : {}} transition={{ duration: 1.1, repeat: Infinity, delay: 0.1 }} />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
