"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Mail, RefreshCw, ShieldCheck } from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // If no email param, redirect back to signup
  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  function handleDigitChange(index: number, value: string) {
    // Handle paste of full OTP
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[index + i < OTP_LENGTH ? index + i : OTP_LENGTH - 1] = pasted[i];
      }
      setDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  const otp = digits.join("");
  const isComplete = otp.length === OTP_LENGTH;

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
        if (res.status === 404 || res.status === 410 || res.status === 429) {
          // Unrecoverable — bounce back to signup
          setTimeout(() => router.push("/signup"), 2500);
        }
        return;
      }

      // Success!
      setSuccess(true);
      setTimeout(() => router.push("/onboarding"), 1800);

    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendMsg("");
    setError("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't resend code. Please try again.");
        return;
      }

      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setResendMsg("A new code has been sent!");
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => setResendMsg(""), 4000);

    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-ink-radial px-6 py-8 sm:py-16">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/foundershook-auth2/1800/1200"
          alt=""
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-ink-950/70" />
      </div>

      {/* White glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-gold-400/10 blur-[110px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-ink-900/80 p-8 shadow-card backdrop-blur-xl sm:p-10">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2">
            <Image src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg" alt="Founders Hook Logo" width={36} height={36} className="rounded-lg object-cover" />
            <span className="font-display text-lg font-semibold tracking-wide text-white">
              FOUNDERS HOOK
            </span>
          </Link>

          <AnimatePresence mode="wait">
            {success ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                  className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gold-400/15 ring-1 ring-gold-400/30"
                >
                  <CheckCircle size={40} className="text-gold-400" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-white">Email Verified!</h2>
                <p className="mt-2 text-sm text-mist-400">
                  Taking you to your profile setup…
                </p>
                <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.6, ease: "linear" }}
                    className="h-full rounded-full bg-gold-gradient"
                  />
                </div>
              </motion.div>
            ) : (
              /* ── OTP form ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Icon */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-400/20 bg-gold-400/10">
                  <ShieldCheck size={26} className="text-gold-400" />
                </div>

                <h1 className="font-display text-2xl font-semibold text-white">
                  Check your inbox
                </h1>

                {/* Email callout */}
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <Mail size={15} className="mt-0.5 shrink-0 text-mist-400" />
                  <p className="text-sm leading-relaxed text-mist-300">
                    We have sent a verification code to{" "}
                    <span className="font-semibold text-gold-400">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="mt-7">
                  {/* 6-digit inputs */}
                  <div className="mb-2 flex justify-center gap-2.5 sm:gap-3">
                    {digits.map((digit, i) => (
                      <motion.input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        id={`otp-digit-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.3 }}
                        className={[
                          "h-14 w-11 rounded-xl border text-center font-mono text-xl font-bold text-white outline-none transition-all duration-300",
                          "bg-white/[0.04] placeholder:text-mist-600 hover:border-gold-400/60 hover:shadow-[0_0_18px_rgba(212,160,84,0.3)]",
                          digit
                            ? "border-gold-400/80 bg-gold-400/10 shadow-[0_0_20px_rgba(212,160,84,0.35)]"
                            : "border-white/10 focus:border-gold-400/80 focus:bg-white/[0.06] focus:shadow-[0_0_22px_rgba(212,160,84,0.4)]",
                        ].join(" ")}
                      />
                    ))}
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        key="error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300"
                      >
                        {error}
                      </motion.p>
                    )}
                    {resendMsg && (
                      <motion.p
                        key="resend-msg"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-center text-sm text-green-300"
                      >
                        {resendMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Verify button */}
                  <button
                    id="verify-otp-btn"
                    type="submit"
                    disabled={!isComplete || loading}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-ink-950 transition-all duration-300 hover:bg-white/95 hover:shadow-[0_0_30px_rgba(255,255,255,0.7)] hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Resend */}
                <div className="mt-5 text-center">
                  <span className="text-sm text-mist-500">Didn&apos;t receive it?&nbsp;</span>
                  <button
                    id="resend-otp-btn"
                    onClick={handleResend}
                    disabled={cooldown > 0 || resending}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold text-gold-400 transition-all duration-300 hover:bg-gold-400/15 hover:text-gold-300 hover:shadow-[0_0_20px_rgba(212,160,84,0.5)] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:text-mist-500 disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:scale-100"
                  >
                    {resending ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        Sending…
                      </>
                    ) : cooldown > 0 ? (
                      `Resend in ${cooldown}s`
                    ) : (
                      "Resend code"
                    )}
                  </button>
                </div>

                {/* Back to signup */}
                <p className="mt-6 text-center text-xs text-mist-400">
                  <span className="font-semibold text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">Wrong email?</span>{" "}
                  <Link href="/signup" className="inline-block font-semibold text-purple-300 underline underline-offset-4 transition-all duration-300 hover:text-purple-200 hover:drop-shadow-[0_0_12px_rgba(192,132,252,0.9)] hover:scale-105">
                    Go back
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Expiry hint below card */}
        <p className="mt-4 text-center text-xs text-mist-600">
          Code expires in 15 minutes · Check your spam folder if not received
        </p>
      </motion.div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950 text-white">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
