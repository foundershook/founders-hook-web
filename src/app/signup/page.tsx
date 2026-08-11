"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, AtSign, Lock, Mail, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't create your account");
        return;
      }
      
      // Navigate to OTP verification page
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
      
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-radial px-6 py-16">
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/foundershook-auth2/1800/1200"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-ink-950/70" />
      </div>
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[110px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-ink-900/80 p-8 shadow-card backdrop-blur-xl sm:p-10"
      >
        <Link href="/" className="mb-8 flex items-center gap-2">
          <Image src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg" alt="Founders Hook Logo" width={36} height={36} className="rounded-lg object-cover" />
          <span className="font-display text-lg font-semibold tracking-wide text-white">
            FOUNDERS HOOK
          </span>
        </Link>

        {/* Updated Text for Waitlist Context */}
        <h1 className="font-display text-2xl font-semibold text-white">
          Join the Early Access Waitlist
        </h1>
        <p className="mt-1.5 text-sm text-mist-400">
          Secure your spot and unlock VIP benefits. Next, we&apos;ll get to know you a little.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-400">Full name</label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="john doe"
                className="field-input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-400">Username</label>
            <div className="relative">
              <AtSign size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                required
                value={form.username}
                onChange={(e) => update("username", e.target.value.replace(/\s/g, ""))}
                placeholder="johndoe"
                className="field-input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-400">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="your@email.com"
                className="field-input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-400">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="At least 6 characters"
                className="field-input pl-11"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full justify-center disabled:opacity-60 mt-2">
            {loading ? "Securing Spot…" : "Continue"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-mist-400">
          Already a member?{" "}
          <Link href="/login" className="font-medium text-gold-300 hover:text-gold-200">
            Log in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}