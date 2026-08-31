"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";

import { DEFAULT_ICONS } from "@/lib/startupDefaults";

const CATEGORIES = [
  "Artificial Intelligence",
  "Climate Tech",
  "Cybersecurity",
  "Aerospace",
  "Consulting",
  "Fintech",
  "HealthTech",
  "EdTech",
  "E-commerce",
  "Other",
];

const ICONS = DEFAULT_ICONS;

type Role = { title: string; type: "Internship" | "Full-time" | "Part-time" };

export default function CreateStartupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addRole() {
    setRoles((r) => [...r, { title: "", type: "Internship" }]);
  }
  function updateRole(i: number, patch: Partial<Role>) {
    setRoles((r) => r.map((role, idx) => (idx === i ? { ...role, ...patch } : role)));
  }
  function removeRole(i: number) {
    setRoles((r) => r.filter((_, idx) => idx !== i));
  }

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tagline,
          description,
          category,
          icon,
          openRoles: roles.filter((r) => r.title.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      onCreated();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-card"
      >
        <div className="mb-5 flex items-start justify-between">
          <h3 className="font-display text-lg font-semibold text-white">
            Publish your startup
          </h3>
          <button onClick={onClose} className="text-mist-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg transition-colors ${
                  icon === ic
                    ? "border-gold-400/70 bg-gold-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {ic}
              </button>
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Startup name"
            className="field-input"
          />
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="One-line tagline"
            className="field-input"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you building? (optional)"
            rows={3}
            className="field-input resize-none"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field-input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-ink-900">
                {c}
              </option>
            ))}
          </select>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-mist-400">
                Open internship / job roles
              </label>
              <button
                onClick={addRole}
                className="flex items-center gap-1 text-xs font-medium text-gold-300 hover:text-gold-200"
              >
                <Plus size={13} /> Add role
              </button>
            </div>

            <div className="space-y-2">
              {roles.map((role, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={role.title}
                    onChange={(e) => updateRole(i, { title: e.target.value })}
                    placeholder="e.g. Frontend Intern"
                    className="field-input flex-1"
                  />
                  <select
                    value={role.type}
                    onChange={(e) =>
                      updateRole(i, { type: e.target.value as Role["type"] })
                    }
                    className="field-input w-32"
                  >
                    <option className="bg-ink-900">Internship</option>
                    <option className="bg-ink-900">Full-time</option>
                    <option className="bg-ink-900">Part-time</option>
                  </select>
                  <button
                    onClick={() => removeRole(i)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-mist-400 hover:text-red-300"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={!name.trim() || !tagline.trim() || loading}
          className="btn-gold mt-5 w-full justify-center disabled:opacity-60"
        >
          {loading ? "Publishing…" : "Publish startup"}
        </button>
      </motion.div>
    </div>
  );
}
