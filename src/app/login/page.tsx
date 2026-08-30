"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't log you in");
        return;
      }
      const target = data.user.onboardingComplete ? "/feed" : "/onboarding";
      window.location.href = target;
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
          src="https://picsum.photos/seed/foundershook-auth/1800/1200"
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
          <span className="font-display text-lg font-semibold tracking-wide">
            FOUNDERS HOOK
          </span>
        </Link>

        <h1 className="font-display text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-mist-400">
          Log in to keep building with your network.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-400">
              Username or email
            </label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your@email.com or username"
                className="field-input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-400">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field-input pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mist-500 transition-colors hover:text-mist-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full justify-center disabled:opacity-60">
            {loading ? "Logging in…" : "Log in"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-mist-400">
          New to Founders Hook?{" "}
          <Link href="/signup" className="font-medium text-gold-300 hover:text-gold-200">
            Create an account
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
