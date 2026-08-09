"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import type { StartupDTO } from "./StartupCard";

export default function ApplyModal({
  startup,
  onClose,
}: {
  startup: StartupDTO;
  onClose: () => void;
}) {
  const [roleId, setRoleId] = useState(startup.openRoles[0]?._id || "");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/startups/${startup._id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, message }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-card"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Apply to {startup.name}
            </h3>
            <p className="mt-0.5 text-sm text-mist-400">{startup.tagline}</p>
          </div>
          <button onClick={onClose} className="text-mist-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {status === "done" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 shadow-[0_0_15px_rgba(99,91,255,0.3)]">
              <Check size={22} />
            </span>
            <p className="font-medium text-white">Application sent</p>
            <p className="text-sm text-mist-400">
              {startup.name} will be in touch if it&apos;s a match.
            </p>
            <button onClick={onClose} className="btn-purple-outline mt-2 !py-2 !px-5 text-xs">
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-400">
                Role
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="field-input"
              >
                {startup.openRoles.map((r, idx) => (
                  <option key={r._id || `role-${idx}`} value={r._id || `role-${idx}`} className="bg-ink-900">
                    {r.title} · {r.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-400">
                Why you? (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Tell them about relevant projects or coursework…"
                className="field-input resize-none"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              onClick={submit}
              disabled={!roleId || status === "loading"}
              className="btn-purple w-full justify-center disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send application"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
