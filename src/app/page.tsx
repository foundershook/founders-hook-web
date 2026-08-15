"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  Rocket,
  Briefcase,
  Handshake,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Globe,
  BookOpen,
  Star,
  Menu,
  X,
  CheckCircle2,
  Calendar,
  UserCheck,
  Trophy,
  Share2,
  Lightbulb,
} from "lucide-react";

type Stats = { founders: number; startups: number; openRoles: number };

const NAV_LINKS = [
  { label: "Discover", href: "/feed" },
  { label: "Community", href: "/feed" },
  { label: "Startups", href: "/feed" },
  { label: "Resources", href: "/feed" },
  { label: "Events", href: "/feed" },
];

function useAuthedUser() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(Boolean(d.user)))
      .catch(() => setLoggedIn(false));
  }, []);
  return loggedIn;
}

/* iMac Keyboard Row Component */
function KeyboardRow({ keys, hasWideKey }: { keys: number; hasWideKey?: boolean }) {
  return (
    <div className="kb-row">
      {Array.from({ length: keys }).map((_, i) => (
        <div
          key={i}
          className={`kb-key${hasWideKey && i === Math.floor(keys / 2) ? " kb-key-wide" : ""}`}
        />
      ))}
    </div>
  );
}

/* iMac Launch Countdown Timer (Target: 24 August 2026, 6:00 PM IST) */
const LAUNCH_TARGET_DATE_MS = new Date("2026-08-20T18:00:00+05:30").getTime();

function MacLaunchTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
    mounted: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = LAUNCH_TARGET_DATE_MS - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
          mounted: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isEnded: false,
        mounted: true,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative h-full w-full flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden font-sans">
      {/* Top macOS Browser / Window Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] shadow-sm inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] shadow-sm inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f] shadow-sm inline-block" />
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-medium text-white/80 backdrop-blur-md border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b893a] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b6b44c]" />
          </span>
          foundershook.com/launch
        </div>
        <div className="text-[10px] sm:text-xs font-semibold text-[#8b893a] uppercase tracking-wider hidden sm:block">
          Live Timer
        </div>
      </div>

      {/* Main Countdown Display Area */}
      <div className="my-auto z-10 flex flex-col items-center text-center px-1">
        {/* Launch Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8b893a]/40 bg-[#8b893a]/15 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#d8d672] backdrop-blur-md mb-2 sm:mb-3 shadow-sm">
          <Sparkles size={13} className="text-[#e2e078] animate-pulse" />
          <span>Platform Launch Countdown</span>
        </div>

        {/* Big Countdown Timer Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full max-w-[420px] my-1 sm:my-2">
          {/* Days */}
          <div className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 p-2 sm:p-3 backdrop-blur-lg shadow-lg">
            <span className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white tabular-nums">
              {timeLeft.mounted ? pad(timeLeft.days) : "--"}
            </span>
            <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#d4d0c8] mt-0.5">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 p-2 sm:p-3 backdrop-blur-lg shadow-lg">
            <span className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white tabular-nums">
              {timeLeft.mounted ? pad(timeLeft.hours) : "--"}
            </span>
            <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#d4d0c8] mt-0.5">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 p-2 sm:p-3 backdrop-blur-lg shadow-lg">
            <span className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white tabular-nums">
              {timeLeft.mounted ? pad(timeLeft.minutes) : "--"}
            </span>
            <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#d4d0c8] mt-0.5">
              Mins
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 p-2 sm:p-3 backdrop-blur-lg shadow-lg">
            <span className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#e8e4dc] tabular-nums">
              {timeLeft.mounted ? pad(timeLeft.seconds) : "--"}
            </span>
            <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#d4d0c8] mt-0.5">
              Secs
            </span>
          </div>
        </div>

        {/* Target Time Callout */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#FAF8F4]/90 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <Calendar size={13} className="text-[#8b893a]" />
          <span>20 August 2026 • 6:00 PM IST</span>
        </div>
      </div>

      {/* Bottom Bar: Access Status */}
      <div className="z-10 flex items-center justify-between pt-1 border-t border-white/10 text-[10px] sm:text-xs text-white/70">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Waitlist Applications Active</span>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1 font-semibold text-[#f0ece4] hover:text-white transition-colors underline underline-offset-2"
        >
          <span>Get Early Access</span>
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}

/* Pure CSS iMac Mockup */
function IMacMockup() {
  return (
    <div className="imac-wrapper">
      {/* iMac Body */}
      <div className="imac-body">
        <div className="imac-bezel-top">
          <div className="imac-camera" />
        </div>
        <div className="imac-screen">
          {/* Background Dashboard Mockup Image */}
          <Image
            src="/dashboard-mockup.jpg"
            alt="Founders Hook Dashboard"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "top left" }}
            className="opacity-25 filter blur-[1px]"
          />
          {/* Dark Glassmorphic Radial Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#12140d]/90 via-[#18181b]/92 to-[#09090b]/95" />
          {/* Ambient Glows */}
          <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-[#8b893a]/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-[#6B7A2F]/20 blur-3xl pointer-events-none" />

          {/* Interactive Live Countdown Timer inside Mac */}
          <MacLaunchTimer />
        </div>
        <div className="imac-chin" />
      </div>

      {/* Stand */}
      <div className="imac-stand">
        <div className="imac-stand-neck" />
        <div className="imac-stand-base" />
      </div>
    </div>
  );
}

/* Desk accessories: keyboard + mouse + mug */
function DeskAccessories() {
  return (
    <div className="desk-accessories">
      {/* Keyboard */}
      <div className="css-keyboard">
        <KeyboardRow keys={14} />
        <KeyboardRow keys={13} />
        <KeyboardRow keys={12} />
        <KeyboardRow keys={10} hasWideKey />
      </div>

      {/* Mouse */}
      <div className="css-mouse" />

      {/* Coffee Mug */}
      <div className="css-mug">
        <div className="mug-body">
          <div className="absolute inset-0 flex items-center justify-center pt-2 pointer-events-none z-10">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md border border-[#FAF8F4]/50 p-0.5 overflow-hidden">
              <div className="relative h-full w-full rounded-full overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786784397/foundershook_2_djiwvw.jpg"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mug-handle" />
      </div>
    </div>
  );
}

/* Avatar Stack for social proof */
const AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80",
];

/* Founders Ecosystem Spiderweb Diagram Component */
function FoundersEcosystemWeb() {
  const baseCardClass = "flex flex-col lg:flex-row items-center justify-center text-center lg:text-left gap-1.5 lg:gap-3 rounded-xl lg:rounded-2xl border border-[#e8e4dc] bg-white/95 backdrop-blur-sm p-1.5 lg:p-3 shadow-md hover:shadow-xl transition-all duration-300 w-[85px] sm:w-[120px] lg:w-auto lg:max-w-[240px]";
  const ecosystemNodes = [
    {
      title: "Find Co-founders",
      desc: "Connect with builders who match your vibe",
      icon: Users,
      positionClass: "top-[12%] lg:top-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center",
      cardClass: baseCardClass,
      floatY: [0, -5, 2, -3, 0],
      floatX: [0, 2.5, -2, 1.5, 0],
      rotate: [0, 0.6, -0.4, 0.3, 0],
      duration: 7.2,
      delay: 0,
      iconColor: "text-[#6B7A2F] bg-[#FAF8F4]",
    },
    {
      title: "Validate Ideas",
      desc: "Test your ideas with real people",
      icon: CheckCircle2,
      positionClass: "top-[16%] lg:top-10 right-[4%] lg:right-6 flex items-center",
      cardClass: baseCardClass,
      floatY: [0, 4, -3, 2, 0],
      floatX: [0, -3, 2.5, -1.5, 0],
      rotate: [0, -0.7, 0.5, -0.3, 0],
      duration: 6.8,
      delay: 0.8,
      iconColor: "text-[#2563EB] bg-[#EFF6FF]",
    },
    {
      title: "Resources & Tools",
      desc: "Access curated tools and templates",
      icon: Briefcase,
      positionClass: "top-1/2 right-[2%] lg:right-0 -translate-y-1/2 flex items-center",
      cardClass: baseCardClass,
      floatY: [0, -4, 3, -2, 0],
      floatX: [0, 3, -2.5, 2, 0],
      rotate: [0, 0.8, -0.6, 0.4, 0],
      duration: 8.0,
      delay: 1.5,
      iconColor: "text-[#D97706] bg-[#FEF3C7]",
    },
    {
      title: "Pitch Nights & Events",
      desc: "Showcase and grow with the community",
      icon: Calendar,
      positionClass: "bottom-[16%] lg:bottom-10 right-[4%] lg:right-6 flex items-center",
      cardClass: baseCardClass,
      floatY: [0, 4.5, -2.5, 3, 0],
      floatX: [0, -2.5, 3, -2, 0],
      rotate: [0, -0.6, 0.5, -0.3, 0],
      duration: 7.0,
      delay: 2.2,
      iconColor: "text-[#7C3AED] bg-[#F5F3FF]",
    },
    {
      title: "Mentorship & Guidance",
      desc: "Learn from founders who've done it",
      icon: UserCheck,
      positionClass: "bottom-[12%] lg:bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center",
      cardClass: baseCardClass,
      floatY: [0, 5, -4, 2, 0],
      floatX: [0, -3, 2, -2.5, 0],
      rotate: [0, 0.7, -0.5, 0.3, 0],
      duration: 7.6,
      delay: 0.5,
      iconColor: "text-[#059669] bg-[#ECFDF5]",
    },
    {
      title: "Hackathons & Contests",
      desc: "Build, compete and win opportunities",
      icon: Trophy,
      positionClass: "bottom-[16%] lg:bottom-10 left-[4%] lg:left-6 flex items-center",
      cardClass: baseCardClass,
      floatY: [0, -3.5, 4, -2.5, 0],
      floatX: [0, 3, -2, 2.5, 0],
      rotate: [0, -0.8, 0.7, -0.4, 0],
      duration: 6.9,
      delay: 1.8,
      iconColor: "text-[#E11D48] bg-[#FFF1F2]",
    },
    {
      title: "Build Network",
      desc: "Expand your network across colleges",
      icon: Share2,
      positionClass: "top-1/2 left-[2%] lg:left-0 -translate-y-1/2 flex items-center",
      cardClass: baseCardClass,
      floatY: [0, 3.5, -3, 2.5, 0],
      floatX: [0, -3.5, 2.5, -1.8, 0],
      rotate: [0, 0.7, -0.8, 0.5, 0],
      duration: 7.4,
      delay: 1.2,
      iconColor: "text-[#0891B2] bg-[#ECFEFF]",
    },
    {
      title: "Share Ideas",
      desc: "Get feedback and validate your ideas",
      icon: Lightbulb,
      positionClass: "top-[16%] lg:top-10 left-[4%] lg:left-6 flex items-center",
      cardClass: baseCardClass,
      floatY: [0, -4.5, 2.5, -3.5, 0],
      floatX: [0, 2.5, -3, 1.8, 0],
      rotate: [0, -0.6, 0.8, -0.5, 0],
      duration: 6.6,
      delay: 2.6,
      iconColor: "text-[#CA8A04] bg-[#FEFCE8]",
    },
  ];

  // Floating decorative ambient icons around the web (subtle ambient drift)
  const floatingAmbientIcons = [
    {
      icon: Sparkles,
      color: "text-[#8b893a]/70 bg-white/80",
      size: 14,
      position: "top-[18%] left-[28%]",
      floatY: [0, -5, 2, -4, 0],
      floatX: [0, 3, -2, 2, 0],
      rotate: [0, 10, -8, 6, 0],
      duration: 8.5,
      delay: 0.6,
    },
    {
      icon: Rocket,
      color: "text-[#2563EB]/70 bg-white/80",
      size: 15,
      position: "top-[22%] right-[26%]",
      floatY: [0, 5, -3, 4, 0],
      floatX: [0, -3.5, 2.5, -2, 0],
      rotate: [0, -8, 10, -6, 0],
      duration: 7.8,
      delay: 1.3,
    },
    {
      icon: Star,
      color: "text-[#D97706]/70 bg-white/80",
      size: 13,
      position: "bottom-[24%] left-[27%]",
      floatY: [0, -4, 5, -3, 0],
      floatX: [0, 2.5, -3, 2, 0],
      rotate: [0, 12, -10, 8, 0],
      duration: 8.8,
      delay: 2.0,
    },
    {
      icon: TrendingUp,
      color: "text-[#059669]/70 bg-white/80",
      size: 14,
      position: "bottom-[20%] right-[28%]",
      floatY: [0, 5.5, -4, 3, 0],
      floatX: [0, -3, 3.5, -2, 0],
      rotate: [0, -10, 8, -6, 0],
      duration: 7.2,
      delay: 2.7,
    },
  ];

  // Concentric octagons radiuses in percentage
  const radiuses = [10, 20, 30, 40];
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  const getOctagonPoints = (r: number) => {
    return angles
      .map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF8F4] py-16 lg:py-24 border-t border-[#e8e4dc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-[#f0ece4] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B7A2F] border border-[#d4d0c8]">
            Founders Hook Ecosystem
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
            Everything Student Founders Need to Launch
          </h2>
          <p className="mt-2 text-base text-[#666] max-w-2xl mx-auto">
            Our interconnected platform empowers ambition at every stage of your startup journey.
          </p>
        </div>

        {/* Spiderweb Diagram Area */}
        <div className="relative mx-auto min-h-[580px] lg:min-h-[660px] w-full max-w-[1000px] flex items-center justify-center">
          {/* SVG Background Octagonal Web Grid */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              className="h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]"
              viewBox="0 0 100 100"
            >
              {/* Concentric Octagon Rings */}
              {radiuses.map((r, idx) => (
                <polygon
                  key={idx}
                  points={getOctagonPoints(r)}
                  fill="none"
                  stroke="#8b893a"
                  strokeWidth="0.4"
                  strokeOpacity="0.45"
                />
              ))}

              {/* Radial Spokes */}
              {angles.map((a, idx) => {
                const rad = ((a - 90) * Math.PI) / 180;
                const maxR = radiuses[radiuses.length - 1];
                const x2 = 50 + maxR * Math.cos(rad);
                const y2 = 50 + maxR * Math.sin(rad);
                return (
                  <line
                    key={idx}
                    x1="50"
                    y1="50"
                    x2={x2}
                    y2={y2}
                    stroke="#8b893a"
                    strokeWidth="0.4"
                    strokeOpacity="0.45"
                  />
                );
              })}

              {/* Golden Grid Intersection Dots */}
              {radiuses.map((r) =>
                angles.map((a, i) => {
                  const rad = ((a - 90) * Math.PI) / 180;
                  const cx = 50 + r * Math.cos(rad);
                  const cy = 50 + r * Math.sin(rad);
                  return (
                    <circle
                      key={`${r}-${i}`}
                      cx={cx}
                      cy={cy}
                      r="0.8"
                      fill="#8b893a"
                    />
                  );
                })
              )}
            </svg>
          </div>

          {/* Floating Ambient Micro Icons */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-10">
            {floatingAmbientIcons.map((ambient, idx) => {
              const AmbientIcon = ambient.icon;
              return (
                <motion.div
                  key={`ambient-${idx}`}
                  className={`absolute ${ambient.position}`}
                  animate={{
                    y: ambient.floatY,
                    x: ambient.floatX,
                    rotate: ambient.rotate,
                    scale: [0.98, 1.02, 0.99, 1.01, 0.98],
                  }}
                  transition={{
                    duration: ambient.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: ambient.delay,
                  }}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e4dc] shadow-sm backdrop-blur-sm ${ambient.color}`}>
                    <AmbientIcon size={ambient.size} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Central Logo Badge with Subtle Gentle Pulse */}
          <motion.div
            className="relative z-20 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-white shadow-xl border-4 border-[#FAF8F4] p-2 text-center overflow-hidden cursor-pointer"
            animate={{
              scale: [1, 1.015, 0.99, 1.01, 1],
              y: [0, -1.5, 1, -0.8, 0],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.06, rotate: 1.5 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="relative h-full w-full rounded-full overflow-hidden">
              <Image
                src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg"
                alt="Founders Hook Logo"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Floating Node Cards with Subtle Float Motion */}
          <div className="absolute inset-0 pointer-events-auto z-10 max-lg:animate-[spin_40s_linear_infinite]">
            {ecosystemNodes.map((node, idx) => {
              const IconComp = node.icon;
              return (
                <div
                  key={idx}
                  className={`absolute ${node.positionClass}`}
                >
                  <div className="max-lg:animate-[spin_40s_linear_infinite_reverse]">
                    <motion.div
                      animate={{
                        y: node.floatY,
                        x: node.floatX,
                        rotate: node.rotate,
                      }}
                      transition={{
                        duration: node.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: node.delay,
                      }}
                      whileHover={{
                        scale: 1.04,
                        y: -3,
                        transition: { duration: 0.2 },
                      }}
                      className={node.cardClass}
                    >
                      {/* Animated Icon Circle with Gentle Micro-Pulse */}
                      <motion.div
                        animate={{
                          rotate: [0, 2, -2, 1, 0],
                          scale: [1, 1.03, 0.98, 1.02, 1],
                        }}
                      transition={{
                        duration: node.duration * 0.9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: node.delay + 0.4,
                      }}
                      whileHover={{
                        rotate: [0, -6, 6, -3, 0],
                        scale: 1.1,
                        transition: { duration: 0.3 },
                      }}
                      className={`flex h-6 w-6 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full border border-[#e8e4dc] ${node.iconColor}`}
                    >
                      <IconComp className="h-3 w-3 lg:h-[18px] lg:w-[18px]" />
                    </motion.div>

                    <div className="w-full">
                      <h3 className="font-bold text-[#1a1a1a] text-[9px] sm:text-[10px] lg:text-sm leading-[1.1] lg:leading-snug">
                        {node.title}
                      </h3>
                      <p className="hidden lg:block text-xs text-[#666] font-normal leading-tight mt-0.5">
                        {node.desc}
                      </p>
                    </div>
                  </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const loggedIn = useAuthedUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const primaryHref = loggedIn ? "/feed" : "/signup";
  const primaryLabel = loggedIn ? "Go to Feed" : "Join Waitlist";

  return (
    <main className="landing-page">
      {/* ─── NAVBAR ─── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="landing-nav"
      >
        <Link href="/" className="landing-nav-logo">
          <Image
            src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg"
            alt="Founders Hook Logo"
            width={36}
            height={36}
            className="landing-nav-logo-icon"
          />
          <span className="landing-nav-logo-text">Founders Hook</span>
        </Link>

        <nav className="landing-nav-links">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1a1a1a] transition-colors hover:bg-black/5 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Link href={primaryHref} className="landing-nav-cta">
            {primaryLabel}
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.header>

      {/* MOBILE MENU BACKDROP */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* MOBILE MENU DRAWER */}
      <aside
        className={`fixed right-0 top-0 z-[51] flex h-full w-72 flex-col bg-[#FAF8F4] shadow-2xl transition-transform duration-300 ease-out md:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#e8e4dc]">
          <span className="font-bold text-lg tracking-wider text-[#1a1a1a]">
            MENU
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-black/5 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-6 pt-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-[#1a1a1a] transition-colors hover:bg-black/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-6 pt-4 border-t border-[#e8e4dc]">
          <Link
            href={primaryHref}
            onClick={() => setMobileMenuOpen(false)}
            className="landing-btn-primary w-full justify-center"
          >
            {primaryLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      </aside>

      {/* ─── HERO ─── */}
      <section className="landing-hero">
        {/* Left Column */}
        <div className="landing-hero-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="landing-badge"
          >
            <span className="landing-badge-dot" />
            <span>What if. It works?</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="landing-heading"
          >
            Meet Your Next{" "}
            <span className="landing-heading-accent">Co-founder.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="landing-subtitle"
          >
            India&apos;s private network where ambitious student founders build
            startups together, find teammates, validate ideas and launch faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="landing-cta-group"
          >
            <Link href={primaryHref} className="landing-btn-primary">
              {primaryLabel}
              <ArrowRight size={15} />
            </Link>
            <Link href="/feed" className="landing-btn-secondary">
              Explore Community
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="landing-social-proof"
          >
            <div className="landing-avatar-stack">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt={`Founder ${i + 1}`} />
              ))}
            </div>
            <div className="landing-stars">
              {[1, 2, 3, 4].map((s) => (
                <Star key={s} size={14} fill="#1a1a1a" />
              ))}
            </div>
            <span className="landing-social-text">
              {stats ? `${stats.founders.toLocaleString()}+` : "1000+"} founders
              joining the waitlist
            </span>
          </motion.div>
        </div>

        {/* Right Column — iMac + Desk */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="landing-hero-right"
        >
          <IMacMockup />
          <DeskAccessories />
        </motion.div>
      </section>

      {/* ─── ECOSYSTEM SPIDERWEB DIAGRAM (BELOW COMPUTER) ─── */}
      <FoundersEcosystemWeb />

      {/* ─── NETWORKING SECTION ─── */}
      <section className="landing-section relative z-10 w-full border-t border-[#e8e4dc] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4d0c8] bg-[#f0ece4] text-[#6B7A2F]">
                <Globe size={28} />
              </div>
              <h2 className="text-3xl sm:text-4xl tracking-tight text-[#1a1a1a]">
                The Network for the Next Generation
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#666] font-normal">
                Connect with passionate student founders from campuses around
                the world. Whether you&apos;re looking for a technical co-founder to
                build your MVP or a marketing wiz to launch your product, our
                networking tools make it effortless to find the right people for
                your startup journey.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Discover founders by campus, major, or skill set.",
                  "Filter startups by industry and funding stage.",
                  "Join localized communities and special interest groups.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-[#4a4a4a] font-normal"
                  >
                    <div className="h-2 w-2 rounded-full bg-[#6B7A2F]" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square max-h-[500px] w-full overflow-hidden rounded-2xl border border-[#e8e4dc] lg:h-[500px] shadow-lg"
            >
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                alt="Students networking"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FOUNDERS INTERACTION SECTION ─── */}
      <section className="landing-section relative z-10 w-full py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-2 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#e8e4dc] lg:order-1 lg:h-[500px] shadow-lg"
            >
              <Image
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                alt="Founders discussing ideas"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4d0c8] bg-[#f0ece4] text-[#6B7A2F]">
                <MessageSquare size={28} />
              </div>
              <h2 className="text-3xl sm:text-4xl tracking-tight text-[#1a1a1a]">
                Meaningful Interactions
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#666] font-normal">
                Stop shouting into the void. Founders Hook provides dedicated
                spaces to discuss ideas, ask for feedback, and form
                partnerships. It&apos;s a community that actually cares about what
                you&apos;re building.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-[#d4d0c8] bg-[#f0ece4]/50 p-5">
                  <h4 className="font-bold text-[#1a1a1a] text-base">
                    Direct Messaging
                  </h4>
                  <p className="mt-2 text-sm text-[#666] font-normal">
                    Reach out directly to potential co-founders and team members
                    securely.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4d0c8] bg-[#f0ece4]/50 p-5">
                  <h4 className="font-bold text-[#1a1a1a] text-base">
                    Project Feeds
                  </h4>
                  <p className="mt-2 text-sm text-[#666] font-normal">
                    Share your progress, post updates, and get constructive
                    feedback from peers.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── KNOWLEDGE HUB SECTION ─── */}
      <section className="landing-section relative z-10 w-full border-t border-[#e8e4dc] py-24 pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d4d0c8] bg-[#f0ece4] text-[#6B7A2F]">
                <BookOpen size={32} />
              </div>
              <h2 className="text-3xl sm:text-4xl tracking-tight text-[#1a1a1a]">
                The Founders Knowledge Hub
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#666] font-normal">
                Building a startup is hard. We provide the resources you need to
                navigate the journey from idea to execution. Access guides,
                templates, and case studies tailored for student entrepreneurs.
              </p>
            </motion.div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Startup Playbooks",
                desc: "Step-by-step guides from ideation to seed round.",
                img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=800",
              },
              {
                title: "Pitch Templates",
                desc: "Winning pitch deck structures used by successful founders.",
                img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
              },
              {
                title: "Legal & Equity",
                desc: "Understand term sheets, vesting, and founder agreements.",
                img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group overflow-hidden rounded-2xl border border-[#e8e4dc] bg-white transition-all duration-300 hover:border-[#6B7A2F]/40 hover:shadow-md"
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#f0ece4]">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-[#1a1a1a] group-hover:text-[#6B7A2F] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#666] font-normal">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex justify-center"
          >
            <Link href={primaryHref} className="landing-btn-primary">
              Explore Resources
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-section relative z-10 border-t border-[#e8e4dc] py-8 text-center text-xs text-[#999] font-normal">
        © {new Date().getFullYear()} Founders Hook. What if it works?
      </footer>
    </main>
  );
}
