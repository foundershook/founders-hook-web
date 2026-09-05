"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier) return;
    
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "An error occurred. Please try again.");
        return;
      }
      setStatus("idle");
      setStep(2); // Move to OTP entry
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      setStatus("error");
      setMessage("Please enter a valid 6-digit code.");
      return;
    }
    
    // In a real flow, you could optionally verify OTP here before asking for password.
    // For this flow, we will verify OTP along with the new password in step 3 to reduce API calls.
    setStatus("idle");
    setMessage("");
    setStep(3); // Move to new password entry
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "An error occurred. Please try again.");
        return;
      }
      setStatus("idle");
      setStep(4); // Move to success step
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
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

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="font-display text-2xl font-semibold text-white">Reset Password</h1>
              <p className="mt-1.5 text-sm text-mist-400">
                Enter your username or email to receive a verification code.
              </p>

              <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-400">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                    <input
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="your@email.com or username"
                      className="field-input pl-11"
                    />
                  </div>
                </div>

                {status === "error" && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {message}
                  </p>
                )}

                <button type="submit" disabled={status === "loading" || !identifier} className="btn-gold w-full justify-center disabled:opacity-60">
                  {status === "loading" ? "Sending code…" : "Send verification code"}
                </button>

                <Link href="/login" className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-mist-400 transition-colors hover:text-white">
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="font-display text-2xl font-semibold text-white">Verify Code</h1>
              <p className="mt-1.5 text-sm text-mist-400">
                We've sent a 6-digit code to the email associated with your account.
              </p>

              <form onSubmit={handleVerifyOtp} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-400">
                    Verification Code
                  </label>
                  <div className="relative">
                    <ShieldCheck size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="field-input pl-11 text-center tracking-[0.5em] font-mono text-lg"
                    />
                  </div>
                </div>

                {status === "error" && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {message}
                  </p>
                )}

                <button type="submit" disabled={otp.length !== 6} className="btn-gold w-full justify-center disabled:opacity-60">
                  Continue
                  <ArrowRight size={16} />
                </button>

                <button type="button" onClick={() => {setStep(1); setStatus("idle"); setMessage("");}} className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-mist-400 transition-colors hover:text-white">
                  <ArrowLeft size={16} />
                  Use a different email
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="font-display text-2xl font-semibold text-white">Create New Password</h1>
              <p className="mt-1.5 text-sm text-mist-400">
                Please enter your new password below.
              </p>

              <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-400">
                    New Password
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
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-400">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="field-input pl-11 pr-11"
                    />
                  </div>
                </div>

                {status === "error" && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {message}
                  </p>
                )}

                <button type="submit" disabled={status === "loading" || !password || !confirmPassword} className="btn-gold w-full justify-center disabled:opacity-60">
                  {status === "loading" ? "Resetting…" : "Reset password"}
                </button>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20 text-gold-400">
                <ShieldCheck size={32} />
              </div>
              <h1 className="font-display text-2xl font-semibold text-white">Password Updated</h1>
              <p className="mt-2 text-sm text-mist-400">
                Your password has been reset successfully. You can now log in with your new password.
              </p>

              <Link href="/login" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-700">
                Go to login
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
