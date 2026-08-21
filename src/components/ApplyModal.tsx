"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  Check,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
} from "lucide-react";
import type { StartupDTO } from "./StartupCard";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"] as const;

const EXPERIENCE_OPTIONS = [
  "Fresher (0 years)",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5+ years",
] as const;

export default function ApplyModal({
  startup,
  onClose,
}: {
  startup: StartupDTO;
  onClose: () => void;
}) {
  const [roleId, setRoleId] = useState(startup.openRoles[0]?._id || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState<string>("Male");
  const [experience, setExperience] = useState<string>("Fresher (0 years)");
  const [message, setMessage] = useState("");

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [resumeName, setResumeName] = useState<string>("");
  const [uploadingResume, setUploadingResume] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          if (d.user.name && !name) setName(d.user.name);
          if (d.user.email && !email) setEmail(d.user.email);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload your resume in PDF format only (.pdf)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Resume file size must be less than 10MB");
      return;
    }

    setError("");
    setResumeFile(file);
    setResumeName(file.name);
    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload resume");
        setResumeFile(null);
        setResumeName("");
        setResumeUrl("");
      } else {
        setResumeUrl(data.url);
        setResumeName(data.name || file.name);
      }
    } catch {
      setError("Network error while uploading resume. Please try again.");
      setResumeFile(null);
      setResumeName("");
      setResumeUrl("");
    } finally {
      setUploadingResume(false);
    }
  }

  function removeResume() {
    setResumeFile(null);
    setResumeUrl("");
    setResumeName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function submit() {
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!mobile.trim()) {
      setError("Please enter your mobile number");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`/api/startups/${startup._id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId,
          name: name.trim(),
          gender,
          mobile: mobile.trim(),
          email: email.trim(),
          experience,
          resumeUrl,
          resumeName,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="my-auto w-full max-w-lg rounded-2xl border border-white/15 bg-ink-900 p-6 shadow-2xl max-h-[90vh] flex flex-col"
        style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
      >
        {/* Modal Header */}
        <div className="mb-4 flex items-start justify-between border-b border-ink-700/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300 text-sm">
                <Sparkles size={15} />
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                Apply to {startup.name}
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-sand-400">{startup.tagline}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-sand-400 hover:bg-ink-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {status === "done" ? (
          <div className="flex flex-col items-center gap-3.5 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Check size={28} />
            </span>
            <p className="font-display text-xl font-bold text-white">Application Submitted!</p>
            <p className="max-w-sm text-sm text-sand-300 leading-relaxed">
              Your application with resume has been sent to{" "}
              <span className="font-semibold text-white">{startup.name}</span>. You can track
              its review status anytime in <span className="text-amber-400 font-semibold">Founders Hook</span>.
            </p>
            <button
              onClick={onClose}
              className="btn-white mt-4 !py-2.5 !px-8 text-sm font-semibold rounded-full"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-left">
            {/* Role Selection */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-sand-300 uppercase tracking-wider">
                Select Role <span className="text-red-400">*</span>
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="field-input w-full bg-ink-950 text-sand-100 border-ink-700 focus:border-white/40"
              >
                {startup.openRoles.map((r, idx) => (
                  <option
                    key={r._id || `role-${idx}`}
                    value={r._id || `role-${idx}`}
                    className="bg-ink-900 text-sand-100"
                  >
                    {r.title} · {r.type}
                  </option>
                ))}
              </select>
            </div>

            {/* Name and Gender Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-sand-300 uppercase tracking-wider">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-500" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field-input w-full pl-9 bg-ink-950 text-sand-100 border-ink-700 focus:border-white/40 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-sand-300 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="field-input w-full bg-ink-950 text-sand-100 border-ink-700 focus:border-white/40 text-sm"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g} className="bg-ink-900 text-sand-100">
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email and Mobile Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-sand-300 uppercase tracking-wider">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-500" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field-input w-full pl-9 bg-ink-950 text-sand-100 border-ink-700 focus:border-white/40 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-sand-300 uppercase tracking-wider">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-500" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="field-input w-full pl-9 bg-ink-950 text-sand-100 border-ink-700 focus:border-white/40 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Experience in Years */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-sand-300 uppercase tracking-wider">
                Experience in Years
              </label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-500 pointer-events-none" />
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="field-input w-full pl-9 bg-ink-950 text-sand-100 border-ink-700 focus:border-white/40 text-sm"
                >
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <option key={exp} value={exp} className="bg-ink-900 text-sand-100">
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resume Upload (PDF) */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-sand-300 uppercase tracking-wider">
                Resume (PDF format)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload-input"
              />

              {resumeUrl ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">
                        {resumeName || "Resume.pdf"}
                      </p>
                      <p className="text-[11px] text-emerald-400">PDF uploaded successfully</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeResume}
                    className="p-1.5 rounded-lg text-sand-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Remove Resume"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="resume-upload-input"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-700 bg-ink-950/60 p-4 text-center cursor-pointer transition-all hover:border-white/30 hover:bg-ink-900/80"
                >
                  {uploadingResume ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                      <Loader2 size={16} className="animate-spin" /> Uploading PDF…
                    </div>
                  ) : (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sand-300">
                        <UploadCloud size={18} />
                      </div>
                      <p className="text-xs font-semibold text-sand-200">
                        Click to upload resume <span className="text-sand-400 font-normal">(.pdf)</span>
                      </p>
                      <p className="text-[10px] text-sand-500">PDF up to 10MB</p>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Why you / Message */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-sand-300 uppercase tracking-wider">
                Why you? / Message to Founder <span className="text-sand-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Briefly introduce yourself, mention your relevant projects, coursework, or why you'd be a great fit…"
                className="field-input w-full resize-none bg-ink-950 text-sand-100 border-ink-700 focus:border-white/40 text-sm"
              />
              <p className="mt-1 text-right text-[10px] text-sand-500">
                {message.length}/1000
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={submit}
                disabled={!roleId || status === "loading" || uploadingResume}
                className="btn-white w-full justify-center !py-3 text-sm font-bold rounded-xl shadow-glow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Submitting Application…
                  </span>
                ) : (
                  "Send Application"
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

