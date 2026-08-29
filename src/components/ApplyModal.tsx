"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  FileText,
  Trash2,
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  Paperclip,
  Send,
  Building2,
  CheckCircle2,
  ChevronDown,
  Info,
  ShieldCheck,
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
  const [showSenderDetails, setShowSenderDetails] = useState(false);

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [resumeName, setResumeName] = useState<string>("");
  const [uploadingResume, setUploadingResume] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedRole = startup.openRoles.find((r) => r._id === roleId) || startup.openRoles[0];

  // Pre-fill user details if logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          if (d.user.name && !name) setName(d.user.name);
          if (d.user.email && !email) setEmail(d.user.email);
          if (d.user.mobile && !mobile) setMobile(d.user.mobile);
          if (d.user.gender && !gender) setGender(d.user.gender);
          if (d.user.experience && !experience) setExperience(d.user.experience);
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

  function applyTemplate(type: "standard" | "projects" | "pitch") {
    const roleTitle = selectedRole?.title || "Role";
    if (type === "standard") {
      setMessage(
        `Dear ${startup.name} Team,\n\nI am writing to express my strong interest in the ${roleTitle} position. With my background in this domain and strong enthusiasm for your mission, I am eager to contribute directly to your team's success.\n\nPlease find my resume attached for your review. Looking forward to discussing how my skills align with your vision.`
      );
    } else if (type === "projects") {
      setMessage(
        `Hi ${startup.name} Founders,\n\nI came across ${startup.name} and love what you are building. I have hands-on experience delivering end-to-end projects and solving core challenges in this space. I would love to bring my technical skills and builder mindset to the ${roleTitle} role.\n\nI've attached my resume and would welcome a conversation.`
      );
    } else if (type === "pitch") {
      setMessage(
        `Hey ${startup.name} Team!\n\nSuper excited about your company. I bring a strong background with fast execution speed and relevant experience. I am ready to hit the ground running for the ${roleTitle} role.\n\nLooking forward to connecting!`
      );
    }
  }

  async function submit() {
    if (!name.trim()) {
      setError("Please enter your full name in the Sender section");
      setShowSenderDetails(true);
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address in the Sender section");
      setShowSenderDetails(true);
      return;
    }
    if (!mobile.trim()) {
      setError("Please enter your contact mobile number in the Sender section");
      setShowSenderDetails(true);
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`/api/startups/${startup._id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: roleId || startup.openRoles[0]?._id,
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

  const cleanCompanyName = startup.name.toLowerCase().replace(/[^a-z0-9]/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="my-auto w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0e0e12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        {/* Email Window Chrome / Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#14141a] px-4 py-3 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
            <Mail size={14} className="text-amber-400" />
            <span>Compose Application</span>
            <span className="hidden sm:inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60 font-mono">
              to @{cleanCompanyName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-white/40">
              <ShieldCheck size={13} className="text-emerald-400" /> Verified Founder Inbox
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition-colors ml-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {status === "done" ? (
          /* Sent Success State */
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center my-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4"
            >
              <CheckCircle2 size={36} />
            </motion.div>

            <h3 className="text-2xl font-bold text-white mb-2">Application Dispatched</h3>
            <p className="max-w-md text-sm text-white/60 leading-relaxed mb-6">
              Your email application and credentials have been securely delivered to the inbox of{" "}
              <span className="font-semibold text-white">{startup.name}</span> for the{" "}
              <span className="text-amber-300 font-medium">{selectedRole?.title}</span> position.
            </p>

            <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-3.5 mb-6 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-white/50">
                <span>Recipient:</span>
                <span className="text-white font-medium">{startup.name} Hiring Team</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Role:</span>
                <span className="text-white font-medium">{selectedRole?.title}</span>
              </div>
              {resumeName && (
                <div className="flex justify-between text-white/50">
                  <span>Attachment:</span>
                  <span className="text-emerald-400 font-medium truncate max-w-[180px]">
                    {resumeName}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="btn-white !py-2.5 !px-8 text-sm font-semibold rounded-full shadow-glow"
            >
              Done
            </button>
          </div>
        ) : (
          /* Email Composer Form */
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {/* Header Metadata Section (Email Fields) */}
              <div className="border-b border-white/10 bg-[#121217] divide-y divide-white/5 text-sm">
                {/* 1. SENDER FIELD */}
                <div className="px-4 py-2.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-16 shrink-0 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        From:
                      </span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {name ? name.charAt(0).toUpperCase() : <User size={12} />}
                        </div>
                        <input
                          type="text"
                          placeholder="Your Full Name *"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-transparent text-sm text-white placeholder-white/30 focus:outline-none flex-1 min-w-0 font-medium"
                        />
                        <span className="text-white/20 hidden sm:inline">&lt;</span>
                        <input
                          type="email"
                          placeholder="your.email@example.com *"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-transparent text-xs text-white/70 placeholder-white/30 focus:outline-none flex-1 min-w-0"
                        />
                        <span className="text-white/20 hidden sm:inline">&gt;</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSenderDetails(!showSenderDetails)}
                      className="text-[11px] text-amber-400/90 hover:text-amber-300 ml-2 flex items-center gap-1 shrink-0 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                    >
                      <span>{showSenderDetails ? "Hide Info" : "Phone & Details"}</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          showSenderDetails ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Expandable Sender Details (Phone, Gender) */}
                  <AnimatePresence>
                    {showSenderDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5">
                          <Phone size={13} className="text-white/40 shrink-0" />
                          <input
                            type="tel"
                            placeholder="Mobile / WhatsApp Number *"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="bg-transparent text-xs text-white placeholder-white/30 focus:outline-none w-full"
                          />
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5">
                          <span className="text-[11px] text-white/40 shrink-0">Gender:</span>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
                          >
                            {GENDER_OPTIONS.map((g) => (
                              <option key={g} value={g} className="bg-[#1a1a24] text-white">
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. RECEIVER FIELD */}
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    To:
                  </span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 rounded-full bg-white/10 pl-1.5 pr-2.5 py-0.5 border border-white/10">
                      {startup.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={startup.icon}
                          alt=""
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      ) : (
                        <Building2 size={12} className="text-amber-400" />
                      )}
                      <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                        {startup.name}
                      </span>
                    </div>
                    <span className="text-xs text-white/50 truncate font-mono">
                      &lt;hiring@{cleanCompanyName}.foundershook.com&gt;
                    </span>
                  </div>
                </div>

                {/* 3. ROLE / SUBJECT FIELD */}
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Role:
                  </span>
                  <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
                    <div className="relative flex-1 min-w-[200px]">
                      <select
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        className="w-full bg-[#181822] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer appearance-none pr-8"
                      >
                        {startup.openRoles.map((r, idx) => (
                          <option
                            key={r._id || `role-${idx}`}
                            value={r._id || `role-${idx}`}
                            className="bg-[#181822] text-white"
                          >
                            Application for: {r.title} ({r.type})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                      />
                    </div>

                    {/* Inline Experience Tag */}
                    <div className="flex items-center gap-1.5 bg-[#181822] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
                      <Briefcase size={12} className="text-amber-400 shrink-0" />
                      <span className="text-[11px] text-white/50 shrink-0">Exp:</span>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
                      >
                        {EXPERIENCE_OPTIONS.map((exp) => (
                          <option key={exp} value={exp} className="bg-[#181822] text-white">
                            {exp}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Body Writing Canvas */}
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                {/* Quick Pitch Starters Bar */}
                <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Quick Pitch Templates:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => applyTemplate("standard")}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-white/70 hover:text-white border border-white/5 transition-all"
                    >
                      💼 Professional Intro
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("projects")}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-white/70 hover:text-white border border-white/5 transition-all"
                    >
                      🚀 Projects & Skills
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("pitch")}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-white/70 hover:text-white border border-white/5 transition-all"
                    >
                      ⚡ Fast Pitch
                    </button>
                  </div>
                </div>

                {/* Body Textarea */}
                <div className="relative flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={7}
                    maxLength={1000}
                    placeholder={`Dear ${startup.name} team,\n\nI would love to apply for the ${
                      selectedRole?.title || "role"
                    }. Here is a quick introduction to my background, what I've built, and why I want to work with ${
                      startup.name
                    }...\n\n(Feel free to share links to your GitHub, Portfolio, or standout achievements)`}
                    className="w-full bg-transparent text-sm text-white/90 placeholder-white/25 focus:outline-none resize-none leading-relaxed font-sans border-0 p-0"
                  />
                </div>

                {/* Attached Resume Display (Within the Email Body) */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="email-resume-input"
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
                          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                            <span>PDF Attached</span>
                            <span>•</span>
                            <span className="text-white/40">Ready to deliver</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeResume}
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Remove Attachment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : uploadingResume ? (
                    <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                      <Loader2 size={16} className="animate-spin text-amber-400" />
                      <span>Uploading Resume PDF to attachment pool…</span>
                    </div>
                  ) : (
                    <label
                      htmlFor="email-resume-input"
                      className="group flex items-center justify-between rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-3 text-xs cursor-pointer hover:border-amber-400/40 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                          <Paperclip size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white/90 group-hover:text-white">
                            Attach Resume <span className="text-white/40 font-normal">(.pdf format, up to 10MB)</span>
                          </p>
                          <p className="text-[10px] text-white/40">
                            Founders review applications with attached resumes first
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-400/90 group-hover:text-amber-300">
                        + Browse File
                      </span>
                    </label>
                  )}
                </div>

                {error && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    <Info size={14} className="shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Email Dispatch Footer Toolbar */}
            <div className="border-t border-white/10 bg-[#121217] px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="email-resume-input"
                  className={`flex items-center gap-1.5 text-xs text-white/60 hover:text-white cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                    resumeUrl ? "text-emerald-400 font-medium" : ""
                  }`}
                  title="Attach Resume PDF"
                >
                  <Paperclip size={14} className={resumeUrl ? "text-emerald-400" : "text-white/60"} />
                  <span className="hidden sm:inline">
                    {resumeUrl ? "Resume Attached" : "Attach File"}
                  </span>
                </label>

                <span className="text-[11px] text-white/30 font-mono">
                  {message.length}/1000 chars
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Discard
                </button>

                <button
                  onClick={submit}
                  disabled={!roleId || status === "loading" || uploadingResume}
                  className="btn-white !py-2.5 !px-5 text-xs sm:text-sm font-bold rounded-xl shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Sending Application…</span>
                    </>
                  ) : (
                    <>
                      <span>Send Application</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}


