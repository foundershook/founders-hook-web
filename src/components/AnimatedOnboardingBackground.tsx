"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Floating ambient tags/chips drifting subtly in the background
const FLOATING_BADGES = [
  { text: "✦ Co-Founder Intelligence", x: "7%", y: "17%", delay: 0, duration: 18, floatY: [-14, 16, -14] },
  { text: "// Real-time Profile Sync", x: "42%", y: "9%", delay: 2, duration: 22, floatY: [15, -15, 15] },
  { text: "⬡ Early Stage Ecosystem", x: "10%", y: "76%", delay: 1, duration: 20, floatY: [-14, 14, -14] },
  { text: "{ Tech & Architecture }", x: "50%", y: "83%", delay: 3, duration: 24, floatY: [14, -16, 14] },
  { text: "⚡ AI Smart Synthesis", x: "78%", y: "38%", delay: 1.5, duration: 21, floatY: [-16, 14, -16] },
];

// Twinkling stars/particles with staggered animation
const AMBIENT_PARTICLES = [
  { top: "14%", left: "18%", size: 3.5, delay: 0, duration: 3.2 },
  { top: "25%", left: "38%", size: 2.5, delay: 1.2, duration: 4.1 },
  { top: "38%", left: "12%", size: 4, delay: 0.7, duration: 3.8 },
  { top: "62%", left: "28%", size: 3, delay: 2.1, duration: 4.5 },
  { top: "84%", left: "15%", size: 3.5, delay: 1.5, duration: 3.5 },
  { top: "18%", left: "70%", size: 3, delay: 0.4, duration: 3.9 },
  { top: "35%", left: "84%", size: 3.5, delay: 1.8, duration: 4.2 },
  { top: "68%", left: "65%", size: 2.5, delay: 2.5, duration: 3.3 },
  { top: "86%", left: "48%", size: 4, delay: 0.9, duration: 4.6 },
  { top: "9%", left: "55%", size: 2.5, delay: 1.1, duration: 3.6 },
  { top: "52%", left: "6%", size: 3, delay: 2.3, duration: 4.0 },
  { top: "45%", left: "58%", size: 2.5, delay: 1.7, duration: 3.7 },
  { top: "78%", left: "82%", size: 3.5, delay: 0.8, duration: 3.4 },
];

export default function AnimatedOnboardingBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
      {/* ── 1. Deep Base Atmosphere ────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* ── 2. Vivid Cyber Tech Grid & Dot Matrix with Radial Fade ─────────── */}
      <div
        className="absolute inset-0 opacity-[0.40]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.18) 1.5px, transparent 1.5px),
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px, 44px 44px, 44px 44px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 35%, transparent 95%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 35%, transparent 95%)",
        }}
      />

      {/* ── 3. Moving Ambient Glow Orbs (Brand Warm Amber & Soft Gold) ─────── */}
      {/* Orb 1: Upper-Left White Drift */}
      <motion.div
        className="absolute -top-24 left-[15%] h-[580px] w-[580px] rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent blur-[115px]"
        animate={{
          x: [0, 110, -80, 60, 0],
          y: [0, -70, 60, -50, 0],
          scale: [1, 1.25, 0.92, 1.18, 1],
          opacity: [0.55, 0.85, 0.6, 0.8, 0.55],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb 2: Mid-Right White Aura */}
      <motion.div
        className="absolute top-1/4 -right-10 h-[640px] w-[640px] rounded-full bg-gradient-to-tl from-white/10 via-white/5 to-transparent blur-[125px]"
        animate={{
          x: [0, -90, 80, -60, 0],
          y: [0, 80, -70, 50, 0],
          scale: [1, 0.9, 1.25, 0.95, 1],
          opacity: [0.45, 0.75, 0.5, 0.8, 0.45],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Orb 3: Bottom-Center White Radiance */}
      <motion.div
        className="absolute -bottom-28 left-1/4 h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-white/10 via-white/5 to-transparent blur-[110px]"
        animate={{
          x: [0, 80, -100, 50, 0],
          y: [0, -60, 50, -40, 0],
          scale: [1, 1.2, 0.9, 1.15, 1],
          opacity: [0.4, 0.7, 0.45, 0.65, 0.4],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Orb 4: Left Mid Subtle Pearl Glow */}
      <motion.div
        className="absolute top-1/2 -left-28 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-white/[0.08] via-white/10/[0.12] to-transparent blur-[105px]"
        animate={{
          x: [0, 60, -50, 40, 0],
          y: [0, -70, 80, -50, 0],
          scale: [0.95, 1.2, 0.95, 1.15, 0.95],
          opacity: [0.35, 0.65, 0.4, 0.6, 0.35],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* ── 4. Rotating Tech Concentric Rings / Gyroscope (Top-Right) ──────── */}
      <div className="absolute -top-12 -right-12 w-[440px] h-[440px] hidden md:block opacity-[0.45]">
        <motion.div
          className="absolute inset-0 rounded-full border border-dashed border-white/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-[0_0_12px_#ffffff]" />
        </motion.div>

        <motion.div
          className="absolute inset-10 rounded-full border border-dotted border-white/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-2 rounded-full bg-sand-100 shadow-[0_0_8px_#ffffff]" />
        </motion.div>

        <motion.div
          className="absolute inset-24 rounded-full border border-white/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* ── 5. Rotating Tech Concentric Rings (Bottom-Left) ────────────────── */}
      <div className="absolute -bottom-20 -left-16 w-[420px] h-[420px] hidden lg:block opacity-[0.40]">
        <motion.div
          className="absolute inset-0 rounded-full border border-dashed border-white/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
        </motion.div>

        <motion.div
          className="absolute inset-12 rounded-full border border-dashed border-white/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* ── 6. Floating Geometric Polygons & Wireframes ────────────────────── */}
      {/* Geometric Diamond 1 - Upper Left */}
      <motion.div
        className="absolute top-28 left-[11%] hidden md:block"
        animate={{
          y: [-14, 18, -14],
          rotate: [45, 70, 45],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative h-16 w-16 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md shadow-[0_0_30px_rgba(255, 255, 255,0.3)] flex items-center justify-center">
          <div className="h-7 w-7 rounded-xl border border-white/20 bg-white/[0.04]" />
        </div>
      </motion.div>

      {/* Geometric Hexagon Node - Mid Right */}
      <motion.div
        className="absolute top-1/2 right-[27%] hidden xl:block"
        animate={{
          y: [18, -20, 18],
          rotate: [0, 180, 360],
          scale: [0.95, 1.1, 0.95],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg width="74" height="74" viewBox="0 0 68 68" fill="none" className="opacity-65 drop-shadow-[0_0_16px_rgba(255, 255, 255,0.35)]">
          <polygon
            points="34,4 62,20 62,48 34,64 6,48 6,20"
            stroke="url(#hexGrad)"
            strokeWidth="1.8"
            fill="rgba(255, 255, 255, 0.08)"
            strokeDasharray="5 3"
          />
          <circle cx="34" cy="34" r="6" fill="#ffffff" fillOpacity="0.7" className="animate-pulse" />
          <defs>
            <linearGradient id="hexGrad" x1="0" y1="0" x2="68" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f8f3e9" />
              <stop offset="0.5" stopColor="#ffffff" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Wireframe Triangle / Delta - Bottom Center */}
      <motion.div
        className="absolute bottom-20 left-[42%] hidden sm:block"
        animate={{
          y: [-16, 14, -16],
          rotate: [0, -18, 12, 0],
          scale: [1, 1.08, 0.98, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <svg width="58" height="58" viewBox="0 0 50 50" fill="none" className="opacity-50 drop-shadow-[0_0_12px_rgba(255, 255, 255,0.25)]">
          <polygon
            points="25,6 45,42 5,42"
            stroke="#ffffff"
            strokeWidth="1.6"
            fill="rgba(255, 255, 255, 0.04)"
          />
          <circle cx="25" cy="6" r="3" fill="#ffffff" />
          <circle cx="45" cy="42" r="3" fill="#ffffff" />
          <circle cx="5" cy="42" r="3" fill="#ffffff" />
        </svg>
      </motion.div>

      {/* Geometric Diamond 2 - Lower Left */}
      <motion.div
        className="absolute bottom-36 left-[7%] hidden md:block"
        animate={{
          y: [16, -16, 16],
          rotate: [-45, -20, -45],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <div className="h-12 w-12 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-md shadow-[0_0_24px_rgba(255, 255, 255,0.25)] flex items-center justify-center">
          <div className="h-4 w-4 rounded-md bg-white/10" />
        </div>
      </motion.div>

      {/* ── 7. Sparkling 4-Point Star Crosses (✦) ─────────────────────────── */}
      <motion.div
        className="absolute top-20 right-[18%] text-white/80 text-xl hidden sm:block drop-shadow-[0_0_8px_#ffffff]"
        animate={{
          scale: [0.8, 1.4, 0.8],
          opacity: [0.4, 0.95, 0.4],
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        ✦
      </motion.div>

      <motion.div
        className="absolute bottom-28 right-[18%] text-white/80 text-base hidden md:block drop-shadow-[0_0_6px_#ffffff]"
        animate={{
          scale: [0.7, 1.35, 0.7],
          opacity: [0.3, 0.9, 0.3],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        ✦
      </motion.div>

      <motion.div
        className="absolute top-2/3 left-[20%] text-white/80 text-sm hidden lg:block drop-shadow-[0_0_6px_#ffffff]"
        animate={{
          scale: [0.7, 1.3, 0.7],
          opacity: [0.35, 0.95, 0.35],
        }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        ✦
      </motion.div>

      {/* ── 8. Coordinate Tech Crosshairs (+) ────────────────────────────── */}
      <div className="absolute top-20 left-10 text-[11px] font-mono text-white/80/60 select-none hidden lg:block tracking-wider">
        + 01.INIT // PROFILE_ENGINE
      </div>
      <div className="absolute bottom-16 right-10 text-[11px] font-mono text-white/80/60 select-none hidden lg:block tracking-wider">
        + CO-FOUNDER_AI // ACTIVE
      </div>
      <div className="absolute top-1/2 left-6 text-[10px] font-mono text-white/35 select-none hidden xl:block">
        [ 37.7749° N, 122.4194° W ]
      </div>

      {/* ── 9. Floating Brand Intelligence Badges / Chips ────────────────── */}
      {mounted &&
        FLOATING_BADGES.map((badge, idx) => (
          <motion.div
            key={idx}
            className="absolute hidden xl:flex items-center gap-1.5 rounded-full border border-white/20 bg-ink-900/80 px-3.5 py-1 text-[11px] font-medium text-white/80 shadow-[0_0_20px_rgba(255, 255, 255,0.18)] backdrop-blur-md"
            style={{ left: badge.x, top: badge.y }}
            animate={{
              y: badge.floatY,
              opacity: [0.65, 1, 0.65],
            }}
            transition={{
              duration: badge.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: badge.delay,
            }}
          >
            <span>{badge.text}</span>
          </motion.div>
        ))}

      {/* ── 10. Ambient Twinkling Particles ───────────────────────────────── */}
      {mounted &&
        AMBIENT_PARTICLES.map((p, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-gradient-to-br from-white to-white/5"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
            }}
            animate={{
              opacity: [0.25, 1, 0.25],
              scale: [0.8, 1.4, 0.8],
              boxShadow: [
                "0 0 2px rgba(255, 255, 255, 0.4)",
                "0 0 10px rgba(255, 255, 255, 1)",
                "0 0 2px rgba(255, 255, 255, 0.4)",
              ],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}

      {/* ── 11. Subtle Horizontal Animated Cyber Scanning Beams ──────────── */}
      <motion.div
        className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/5 to-transparent"
        style={{ top: "32%" }}
        animate={{
          x: ["-100%", "100%"],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/5 to-transparent"
        style={{ top: "72%" }}
        animate={{
          x: ["100%", "-100%"],
          opacity: [0, 0.7, 0],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "linear",
          delay: 3,
        }}
      />
    </div>
  );
}
