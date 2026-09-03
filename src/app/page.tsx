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
  Network,
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
  AlertCircle,
  Mail,
  Check,
  Mic,
  Video,
  Phone,
  Code,
  Shield,
  Bookmark,
} from "lucide-react";

type Stats = { founders: number; startups: number; openRoles: number };

const NAV_LINKS = [
  { label: "Discover", href: "/signup" },
  { label: "Community", href: "/signup" },
  { label: "Startups", href: "/signup" },
  { label: "Resources", href: "/signup" },
  { label: "Events", href: "/signup" },
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

/* iMac Launch Countdown Timer (Target: 5 September 2026, 6:00 PM IST) */
const LAUNCH_TARGET_DATE_MS = new Date("2026-09-05T18:00:00+05:30").getTime();

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
    <div className="relative h-full w-full flex flex-col justify-between p-2 sm:p-5 select-none overflow-hidden font-sans">
      {/* Top macOS Browser / Window Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] shadow-sm inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] shadow-sm inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f] shadow-sm inline-block" />
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-xs font-medium text-white/80 backdrop-blur-md border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b893a] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b6b44c]" />
          </span>
          foundershook.in/launch
        </div>
        <div className="text-[10px] sm:text-xs font-semibold text-[#8b893a] uppercase tracking-wider hidden sm:block">
          Live Timer
        </div>
      </div>

      {/* Main Countdown Display Area */}
      <div className="my-auto z-10 flex flex-col items-center text-center px-0.5 sm:px-1">
        {/* Launch Pill */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#8b893a]/40 bg-[#8b893a]/15 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-xs font-semibold uppercase tracking-wider text-[#d8d672] backdrop-blur-md mb-1 sm:mb-3 shadow-sm">
          <Sparkles size={10} className="text-[#e2e078] animate-pulse sm:hidden" />
          <Sparkles size={13} className="text-[#e2e078] animate-pulse hidden sm:block" />
          <span>Platform Launch Countdown</span>
        </div>

        {/* Big Countdown Timer Grid */}
        <div className="grid grid-cols-4 gap-1 sm:gap-3 w-full max-w-[420px] my-0.5 sm:my-2">
          {/* Days */}
          <div className="flex flex-col items-center justify-center rounded-lg sm:rounded-2xl border border-white/15 bg-white/10 p-1 sm:p-3 backdrop-blur-lg shadow-lg">
            <span className="text-lg sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white tabular-nums">
              {timeLeft.mounted ? pad(timeLeft.days) : "--"}
            </span>
            <span className="text-[7px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#d4d0c8] mt-0">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center rounded-lg sm:rounded-2xl border border-white/15 bg-white/10 p-1 sm:p-3 backdrop-blur-lg shadow-lg">
            <span className="text-lg sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white tabular-nums">
              {timeLeft.mounted ? pad(timeLeft.hours) : "--"}
            </span>
            <span className="text-[7px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#d4d0c8] mt-0">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center rounded-lg sm:rounded-2xl border border-white/15 bg-white/10 p-1 sm:p-3 backdrop-blur-lg shadow-lg">
            <span className="text-lg sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white tabular-nums">
              {timeLeft.mounted ? pad(timeLeft.minutes) : "--"}
            </span>
            <span className="text-[7px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#d4d0c8] mt-0">
              Mins
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center justify-center rounded-lg sm:rounded-2xl border border-white/15 bg-white/10 p-1 sm:p-3 backdrop-blur-lg shadow-lg">
            <span className="text-lg sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#e8e4dc] tabular-nums">
              {timeLeft.mounted ? pad(timeLeft.seconds) : "--"}
            </span>
            <span className="text-[7px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#d4d0c8] mt-0">
              Secs
            </span>
          </div>
        </div>

        {/* Target Time Callout */}
        <div className="mt-1 sm:mt-2 flex items-center justify-center gap-1 sm:gap-1.5 text-[8px] sm:text-xs font-medium text-[#FAF8F4]/90 bg-black/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/10">
          <Calendar size={10} className="text-[#8b893a] sm:hidden" />
          <Calendar size={13} className="text-[#8b893a] hidden sm:block" />
          <span>5 September 2026 • 6:00 PM IST</span>
        </div>
      </div>

      {/* Bottom Bar: Access Status */}
      <div className="z-10 flex items-center justify-between pt-0.5 sm:pt-1 border-t border-white/10 text-[8px] sm:text-xs text-white/70">
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
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?auto=format&fit=crop&w=80&h=80&q=80",
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

/* ─── HOW IT WORKS STEPS ─── */
const STEPS = [
  {
    num: "01",
    title: "Build your Profile",
    desc: "In ~5 minutes, answer a few questions and let our AI turn it into a polished public profile that highlights your skills, experience, and what you're looking for.",
    mockup: (
      <div className="relative flex flex-col gap-3 p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#e8e4dc] shadow-xl w-full max-w-sm transform transition-transform hover:scale-105 duration-500">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#6B7A2F]/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#8b893a]/10 rounded-full blur-2xl"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f0ece4] to-[#e8e4dc] flex items-center justify-center text-[#6B7A2F] font-bold text-xl shadow-sm border border-white">WS</div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <div className="font-bold text-[#1a1a1a] text-lg">William Smith</div>
            <div className="text-xs text-[#666] flex items-center gap-1">
              <Globe size={10} /> Europe, United Kingdom
            </div>
          </div>
        </div>
        <div className="mt-2 p-4 rounded-xl bg-gradient-to-br from-[#FAF8F4] to-[#f0ece4] border border-[#e8e4dc] relative z-10 shadow-sm">
          <div className="inline-block px-2 py-1 bg-[#6B7A2F]/10 rounded text-[10px] font-bold text-[#6B7A2F] mb-2 uppercase tracking-wider">Top Skill</div>
          <div className="font-bold text-[#1a1a1a] text-[15px] mb-1">Content creation</div>
          <div className="text-xs text-[#666] leading-relaxed">I've developed a system which analyzes brand's competitors top performing videos and suggests a viral script based on trending patterns.</div>
        </div>
      </div>
    )
  },
  {
    num: "02",
    title: "Create the Company",
    desc: "Tell us about your idea/project and we'll generate a clean Company Page for you (problem, solution, links, media, context). You can edit anything anytime — and we use this info to match the right people to your project.",
    mockup: (
      <div className="relative w-full max-w-sm h-56 rounded-2xl bg-white overflow-hidden shadow-xl border border-[#e8e4dc] transform transition-transform hover:-translate-y-2 duration-500">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-[#1a1a1a] to-[#333]"></div>
        <div className="absolute top-4 left-5 text-white font-black tracking-widest text-lg z-10 flex items-center gap-2">
          <Rocket size={18} className="text-[#8b893a]" />
          FOUNDERS <span className="text-[#8b893a]">HOOK</span>
        </div>

        <div className="absolute top-14 left-4 right-4 flex flex-col gap-3 z-10">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-[#e8e4dc] shadow-sm transform -rotate-1 ml-auto w-[85%]">
            <div className="text-[10px] font-bold text-[#8b893a] mb-1 uppercase tracking-wider flex items-center gap-1"><AlertCircle size={10} /> Problem</div>
            <div className="text-[9px] text-[#4a4a4a] leading-relaxed">The current flight simulation equipment market does not actively showcase hardware flight dynamics, forcing them to point to dry routine.</div>
          </div>
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#e8e4dc] shadow-md transform rotate-1 mr-auto w-[85%]">
            <div className="text-[10px] font-bold text-[#6B7A2F] mb-1 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10} /> Solution</div>
            <div className="text-[9px] text-[#4a4a4a] leading-relaxed">Falcon Matter aims to build a modular HOTAS system which replicates real-life flight dynamics and feeling of flying jet cockpit parts. All ready and plug &amp; play.</div>
          </div>
        </div>
      </div>
    )
  },
  {
    num: "03",
    title: "Setup Your Campaign",
    desc: "Define who you need (skills, experience level, location, availability, working style). We'll build a highly targeted shortlist, then automatically reach out to the best matches and introduce your project to them.",
    mockup: (
      <div className="relative flex gap-4 w-full max-w-md items-center justify-center h-56">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#6B7A2F]/5 rounded-full blur-3xl z-0"></div>

        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white border border-[#e8e4dc] shadow-xl w-44 transform -rotate-6 z-10 transition-transform hover:-rotate-2 duration-500">
          <div className="text-[10px] font-bold text-[#6B7A2F] mb-2 text-center uppercase tracking-widest bg-[#6B7A2F]/5 py-1 rounded-md">Targeted Invitation</div>
          {[
            { n: "Will Smith", r: "Content Creator", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" },
            { n: "Adam Smith", r: "Growth Marketer", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80" }
          ].map((u, i) => (
            <div key={i} className="flex items-center gap-2.5 p-1">
              <div className="w-8 h-8 rounded-full overflow-hidden relative border border-[#e8e4dc]"><Image src={u.img} alt={u.n} fill className="object-cover" /></div>
              <div>
                <div className="text-[11px] font-bold text-[#1a1a1a]">{u.n}</div>
                <div className="text-[9px] text-[#666]">{u.r}</div>
              </div>
            </div>
          ))}
          <div className="mt-1 mx-auto w-6 h-6 bg-[#6B7A2F] rounded-full flex items-center justify-center shadow-md">
            <Mail size={10} className="text-white" />
          </div>
        </div>

        <div className="flex flex-col p-5 rounded-2xl bg-[#1a1a1a] border border-[#333] shadow-2xl w-52 transform rotate-3 z-20 transition-transform hover:rotate-1 duration-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
          <div className="text-[9px] text-white/50 mb-3 uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={10} /> Campaign</div>
          <div className="text-sm font-bold text-white leading-snug mb-4">We are looking for a <span className="text-[#8b893a]">Marketing Co-Founder</span></div>
          <div className="text-[10px] text-white/70 mb-2 border-b border-white/10 pb-1">About the project</div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#6B7A2F]"></div><div className="h-1.5 w-full bg-white/10 rounded-full"></div></div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#6B7A2F]"></div><div className="h-1.5 w-4/5 bg-white/10 rounded-full"></div></div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#6B7A2F]"></div><div className="h-1.5 w-5/6 bg-white/10 rounded-full"></div></div>
          </div>
        </div>
      </div>
    )
  },
  {
    num: "04",
    title: "Pick the Best Applicants",
    desc: "Once your campaign is live, qualified candidates apply. Review profiles, compare applicants, pick the best — and book meetings in one click.",
    mockup: (
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg items-center justify-center">
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-[#e8e4dc] shadow-xl w-full sm:w-64 z-10 relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center shadow-lg"><Users size={12} /></div>
          {[
            { n: "Zoe Clark", r: "UI/UX Designer", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" },
            { n: "Wade Warren", r: "Full Stack Developer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" },
            { n: "Carl Smith", r: "Product Strategist", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" }
          ].map((app, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF8F4] transition-colors border border-transparent hover:border-[#e8e4dc] group">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden relative"><Image src={app.img} alt={app.n} fill className="object-cover" /></div>
                <div>
                  <div className="text-xs font-bold text-[#1a1a1a]">{app.n}</div>
                  <div className="text-[9px] text-[#666]">{app.r}</div>
                </div>
              </div>
              <div className="text-[9px] font-semibold px-2.5 py-1.5 bg-[#f0ece4] text-[#1a1a1a] rounded-lg group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors cursor-pointer">View Profile</div>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-2xl bg-[#1a1a1a] border border-[#333] shadow-xl w-44 z-0 sm:-ml-6 mt-4 sm:mt-0 transform sm:translate-y-4">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-white justify-center uppercase tracking-widest border-b border-white/10 pb-2">
            <Calendar size={12} className="text-[#8b893a]" />
            Book Meeting
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${i === 6 || i === 10 || i === 11 || i === 14 ? 'bg-[#6B7A2F] text-white shadow-md shadow-[#6B7A2F]/20' : 'bg-white/5 hover:bg-white/10'}`}>
                {(i === 6 || i === 10 || i === 11 || i === 14) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <div className="w-6 h-6 rounded-full bg-[#8b893a] flex items-center justify-center text-white shadow-md"><Check size={12} strokeWidth={3} /></div>
          </div>
        </div>
      </div>
    )
  },
  {
    num: "05",
    title: "Meet your Candidates",
    desc: "Take meetings with the top applicants to talk through the project, ask questions, and see how you click. These conversations help you build a real connection and smoothly onboard the right person to your team.",
    mockup: (
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[#e8e4dc] bg-black aspect-[16/10] flex group">
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-[9px] text-white font-medium tracking-wider border border-white/10">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          REC
        </div>

        <div className="w-1/2 h-full relative">
          <Image src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600" alt="Candidate 1" fill className="object-cover" />
          <div className="absolute bottom-16 left-3 text-[10px] text-white bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">Alex R.</div>
        </div>
        <div className="w-1/2 h-full relative border-l border-white/10">
          <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" alt="Candidate 2" fill className="object-cover" />
          <div className="absolute bottom-16 left-3 text-[10px] text-white bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">Sam T.</div>
        </div>
        <div className="absolute bottom-16 right-4 w-28 h-20 rounded-xl overflow-hidden border-2 border-white/80 shadow-2xl transition-transform group-hover:scale-105">
          <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300" alt="You" fill className="object-cover" />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/10 shadow-2xl">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          REC
        </div>

        <div className="w-full h-full relative">
          <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Founder" fill className="object-cover" />
          <div className="absolute bottom-16 left-4 text-[10px] text-white bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Evelyn P. (Founder)</div>
        </div>

        <div className="absolute top-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-white/80 shadow-2xl transition-transform group-hover:scale-105 z-20">
          <Image src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=300" alt="You" fill className="object-cover" />
          <div className="absolute bottom-1 left-1 text-[8px] text-white bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">You</div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/10 shadow-2xl z-20">
          <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"><Mic size={14} className="text-white" /></div>
          <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"><Video size={14} className="text-white" /></div>
          <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"><MessageSquare size={14} className="text-white" /></div>
          <div className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center ml-2 cursor-pointer shadow-lg shadow-red-500/20"><Phone size={16} className="text-white fill-white transform rotate-[135deg]" /></div>
        </div>
      </div>
    )
  }
];

const APPLICANT_STEPS = [
  {
    num: "01",
    title: "Build your Profile",
    desc: "In ~5 minutes, our AI builds a strong profile from your skills and goals to match you with the right projects.",
    mockup: (
      <div className="relative w-full max-w-sm">
        {/* Profile Card Light Theme */}
        <div className="relative z-10 flex flex-col gap-3 p-5 rounded-2xl bg-white border border-[#d4d0c8] shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" alt="Ralf" width={56} height={56} className="rounded-full border-2 border-white shadow-sm" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <div className="font-bold text-[#1a1a1a] text-lg flex items-center gap-2">Ralf Martinez <span className="text-[10px] px-1 bg-black/5 rounded text-[#666]">🇺🇸</span></div>
              <div className="text-[10px] text-[#666]">North America, United States</div>
            </div>
          </div>
          <div className="text-[11px] text-[#666] leading-relaxed mt-2 border-b border-[#e8e4dc] pb-3">
            tl;dr: Ralf is a U.S. based software engineer and CTO specializing in AI automation algorithms for tech startups.
          </div>
          <div className="mt-1">
            <div className="text-[10px] font-bold text-[#1a1a1a] mb-2 uppercase tracking-wider">Top Skill</div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6B7A2F]/10 flex items-center justify-center text-[#6B7A2F] shrink-0"><Code size={16} /></div>
              <div>
                <div className="text-xs font-bold text-[#1a1a1a]">Programming (Python)</div>
                <div className="text-[10px] text-[#666] mt-1 space-y-0.5">
                  <div>• Built AI automation pipelines using Python</div>
                  <div>• Helped 10+ startups scale their products</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    num: "02",
    title: "Pick the Best Project",
    desc: "Our AI matches you with projects based on your skills, interests, location, and compensation preferences. Explore what teams are building, see who's already on board, and apply to the roles that fit you best.",
    mockup: (
      <div className="relative w-full max-w-lg p-5 rounded-2xl bg-[#f0ece4] border border-[#d4d0c8] shadow-xl">
        <div className="flex items-center gap-6 border-b border-[#d4d0c8] pb-3 mb-4">
          <div className="text-[11px] font-bold text-[#1a1a1a] border-b-2 border-[#6B7A2F] pb-3 -mb-[13px]">Projects for you</div>
          <div className="text-[11px] font-medium text-[#666]">All projects</div>
          <div className="text-[11px] font-medium text-[#666]">People</div>
          <div className="text-[11px] font-medium text-[#666]">Saved</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-[#d4d0c8] bg-white shadow-sm hover:border-[#6B7A2F]/40 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6B7A2F]/10 text-[#6B7A2F] flex items-center justify-center font-bold text-xs">P</div>
                <div>
                  <div className="text-xs font-bold text-[#1a1a1a]">PumpGuard</div>
                  <div className="text-[9px] text-[#666]">AI / HealthTech</div>
                </div>
              </div>
              <Bookmark size={14} className="text-[#999] group-hover:text-[#6B7A2F] transition-colors" />
            </div>
            <div className="text-[10px] text-[#666] mb-3 leading-tight h-8">AI-powered pump monitoring system to predict failures and reduce downtime.</div>
            <div className="flex items-center justify-between text-[10px] text-[#666] border-t border-[#f0ece4] pt-2">
              <div className="flex items-center gap-1"><Users size={12} /> 5 on board</div>
              <div className="font-semibold text-[#1a1a1a]">$80k - $120k</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#d4d0c8] bg-white shadow-sm hover:border-[#6B7A2F]/40 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8b893a]/10 text-[#8b893a] flex items-center justify-center"><BookOpen size={14} /></div>
                <div>
                  <div className="text-xs font-bold text-[#1a1a1a]">STUDAI</div>
                  <div className="text-[9px] text-[#666]">EdTech / AI</div>
                </div>
              </div>
              <Bookmark size={14} className="text-[#999] group-hover:text-[#6B7A2F] transition-colors" />
            </div>
            <div className="text-[10px] text-[#666] mb-3 leading-tight h-8">AI assistant for students that personalizes learning and boosts productivity.</div>
            <div className="flex items-center justify-between text-[10px] text-[#666] border-t border-[#f0ece4] pt-2">
              <div className="flex items-center gap-1"><Users size={12} /> 3 on board</div>
              <div className="font-semibold text-[#1a1a1a]">$40k - $70k</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#d4d0c8] bg-white shadow-sm hover:border-[#6B7A2F]/40 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6B7A2F] text-white flex items-center justify-center font-bold text-xs">S</div>
                <div>
                  <div className="text-xs font-bold text-[#1a1a1a]">Scallient AI</div>
                  <div className="text-[9px] text-[#666]">AI / SaaS</div>
                </div>
              </div>
              <Bookmark size={14} className="text-[#999] group-hover:text-[#6B7A2F] transition-colors" />
            </div>
            <div className="text-[10px] text-[#666] mb-3 leading-tight h-8">Scallient builds AI solutions that automate customer support at scale.</div>
            <div className="flex items-center justify-between text-[10px] text-[#666] border-t border-[#f0ece4] pt-2">
              <div className="flex items-center gap-1"><Users size={12} /> 4 on board</div>
              <div className="font-semibold text-[#1a1a1a]">$70k - $110k</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#d4d0c8] bg-white shadow-sm hover:border-[#6B7A2F]/40 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center"><Shield size={14} /></div>
                <div>
                  <div className="text-xs font-bold text-[#1a1a1a]">EverProbe</div>
                  <div className="text-[9px] text-[#666]">Cybersecurity</div>
                </div>
              </div>
              <Bookmark size={14} className="text-[#999] group-hover:text-[#6B7A2F] transition-colors" />
            </div>
            <div className="text-[10px] text-[#666] mb-3 leading-tight h-8">Real-time threat detection platform for modern infrastructure.</div>
            <div className="flex items-center justify-between text-[10px] text-[#666] border-t border-[#f0ece4] pt-2">
              <div className="flex items-center gap-1"><Users size={12} /> 6 on board</div>
              <div className="font-semibold text-[#1a1a1a]">$90k - $130k</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    num: "03",
    title: "Apply to join a team",
    desc: "Learn more about the role, answer a few quick questions, and book a meeting with the founder.",
    mockup: (
      <div className="relative flex gap-6 w-full max-w-md items-center justify-center h-64">
        <div className="flex flex-col p-5 rounded-2xl bg-white border border-[#d4d0c8] shadow-xl w-56 transform -rotate-3 z-10 hover:-rotate-1 transition-transform relative">
          <div className="text-[11px] font-bold text-[#1a1a1a] flex items-center gap-1.5 mb-4"><Mail size={14} className="text-[#6B7A2F]" /> E-Mail Invitation</div>

          <div className="mb-3">
            <div className="text-[9px] text-[#666] font-bold mb-0.5 uppercase tracking-wider">Role</div>
            <div className="text-[11px] font-semibold text-[#1a1a1a]">Backend Engineer</div>
          </div>
          <div className="mb-3">
            <div className="text-[9px] text-[#666] font-bold mb-0.5 uppercase tracking-wider">About the role</div>
            <div className="text-[10px] text-[#666] leading-relaxed">You'll be building the core APIs and infrastructure for our platform.</div>
          </div>
          <div className="mb-4">
            <div className="text-[9px] text-[#666] font-bold mb-1.5 uppercase tracking-wider">Why do you want to join?</div>
            <div className="h-14 w-full bg-[#FAF8F4] border border-[#d4d0c8] rounded-lg p-2 text-[10px] text-[#999]">Type your answer here...</div>
          </div>
          <div className="w-full bg-[#6B7A2F] hover:bg-[#5a6628] text-white text-[11px] font-bold py-2.5 rounded-lg text-center transition-colors shadow-md">
            Submit Answer
          </div>
        </div>

        <div className="flex flex-col p-4 rounded-2xl bg-white border border-[#d4d0c8] shadow-xl w-56 transform rotate-3 z-20 hover:rotate-1 transition-transform relative">
          <div className="text-[11px] font-bold text-[#1a1a1a] text-center mb-3">Campaign</div>

          <div className="relative h-24 w-full rounded-xl overflow-hidden mb-3 border border-[#e8e4dc]">
            <Image src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400" alt="Campaign" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute top-2 left-2 text-[9px] font-bold text-white flex items-center gap-1.5"><span className="w-4 h-4 bg-white/20 rounded flex items-center justify-center text-white backdrop-blur-sm">N</span> NEUROVIA</div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-white text-[10px] leading-tight">We are looking for a <br /><span className="text-[#6B7A2F] font-bold text-xs">Marketing Co-Founder</span></div>
          </div>

          <div className="text-[9px] text-[#666] font-bold mb-2 uppercase tracking-wider">About the campaign</div>
          <ul className="text-[10px] text-[#666] space-y-1.5 mb-4">
            <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#6B7A2F]/10 flex items-center justify-center shrink-0"><Check size={10} className="text-[#6B7A2F]" /></div> Build brand & GTM strategy</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#6B7A2F]/10 flex items-center justify-center shrink-0"><Check size={10} className="text-[#6B7A2F]" /></div> Lead user acquisition</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#6B7A2F]/10 flex items-center justify-center shrink-0"><Check size={10} className="text-[#6B7A2F]" /></div> Work with the founder</li>
          </ul>

          <div className="w-full bg-white border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] text-[11px] font-bold py-2 rounded-lg text-center transition-colors">
            Book Meeting
          </div>
        </div>
      </div>
    )
  },
  {
    num: "04",
    title: "Meet the founder",
    desc: "Hop on a quick call with the founder to see if you click. You'll align on the role, expectations, and whether this is the right team to build with.",
    mockup: (
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-[16/10] flex flex-col p-2 gap-2">
        {/* Top Row: Two people */}
        <div className="flex gap-2 h-1/2">
          <div className="relative w-1/2 h-full rounded-xl overflow-hidden bg-gray-100">
            <Image src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80" alt="Scott" fill className="object-cover" />
            <div className="absolute bottom-2 left-2 text-[10px] font-medium text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Scott White</div>
          </div>
          <div className="relative w-1/2 h-full rounded-xl overflow-hidden bg-gray-100">
            <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" alt="Evelyn" fill className="object-cover" />
            <div className="absolute bottom-2 left-2 text-[10px] font-medium text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Evelyn Parker</div>
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500/90 px-2 py-1 rounded-lg text-[9px] font-bold text-white backdrop-blur-md shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> REC</div>
          </div>
        </div>
        {/* Bottom Row: You + Controls */}
        <div className="relative h-1/2 rounded-xl overflow-hidden w-2/3 mx-auto shadow-inner bg-gray-100">
          <Image src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&q=80" alt="Carl" fill className="object-cover" />
          <div className="absolute bottom-2 left-2 text-[10px] font-medium text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Carl Peterson (You)</div>
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-full px-5 py-2.5 border border-[#e8e4dc] shadow-xl z-20">
          <div className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"><Mic size={16} className="text-[#1a1a1a]" /></div>
          <div className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"><Video size={16} className="text-[#1a1a1a]" /></div>
          <div className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center cursor-pointer shadow-lg shadow-red-500/20"><Phone size={18} className="text-white fill-white transform rotate-[135deg]" /></div>
          <div className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"><Users size={16} className="text-[#1a1a1a]" /></div>
          <div className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"><MessageSquare size={16} className="text-[#1a1a1a]" /></div>
        </div>
      </div>
    )
  }
];

function HowItWorksSteps() {
  const [activeTab, setActiveTab] = useState<'founder' | 'applicant'>('founder');
  const currentSteps = activeTab === 'founder' ? STEPS : APPLICANT_STEPS;

  return (
    <section className="landing-section relative w-full py-24 lg:py-32 bg-[#FAF8F4] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#6B7A2F]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block rounded-full bg-[#f0ece4] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B7A2F] border border-[#d4d0c8] shadow-sm"
          >
            How It Works
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="flex justify-center mt-6 mb-8"
          >
            <div className="bg-[#f0ece4] p-1.5 rounded-full inline-flex border border-[#d4d0c8] shadow-sm">
              <button
                onClick={() => setActiveTab('founder')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'founder' ? 'bg-white text-[#1a1a1a] shadow-md' : 'text-[#666] hover:text-[#1a1a1a]'}`}
              >
                For Founders
              </button>
              <button
                onClick={() => setActiveTab('applicant')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'applicant' ? 'bg-white text-[#1a1a1a] shadow-md' : 'text-[#666] hover:text-[#1a1a1a]'}`}
              >
                For Applicants
              </button>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-5xl"
          >
            {activeTab === 'founder' ? "Launch your startup in 5 steps" : "Join a startup in 4 steps"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-[#666] max-w-2xl mx-auto font-normal"
          >
            {activeTab === 'founder'
              ? "From building your profile to meeting your next co-founder, we streamline the entire process of finding the right team."
              : "From building your profile to meeting your next team, we streamline the entire process of finding your perfect project."}
          </motion.p>
        </div>

        <div className="space-y-12 sm:space-y-24 relative">
          {/* Connecting line between steps (desktop only) */}
          <div className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-[#e8e4dc] via-[#d4d0c8] to-[#e8e4dc] -translate-x-1/2 z-0"></div>

          {currentSteps.map((step, index) => (
            <motion.div
              key={`${activeTab}-${step.num}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-10 lg:gap-20 relative z-10`}
            >
              {/* Step number dot (desktop only) */}
              <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full border-4 border-[#FAF8F4] shadow-md items-center justify-center z-20">
                <div className="w-4 h-4 rounded-full bg-[#6B7A2F]"></div>
              </div>

              {/* Text Content */}
              <div className={`flex-1 w-full flex flex-col ${index % 2 === 0 ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"} items-center text-center`}>
                <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? "lg:flex-row-reverse" : ""}`}>
                  <span className="text-5xl sm:text-6xl font-black text-[#6B7A2F]/10">{step.num}</span>
                  <span className="text-xs font-bold tracking-widest uppercase text-[#8b893a] bg-[#8b893a]/10 px-3 py-1 rounded-full border border-[#8b893a]/20">Step {step.num}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-4">
                  {step.title}
                </h3>
                <p className="text-[#666] leading-relaxed font-normal text-base sm:text-lg max-w-md">
                  {step.desc}
                </p>
              </div>

              {/* Mockup */}
              <div className={`flex-1 w-full flex ${index % 2 === 0 ? "lg:justify-start" : "lg:justify-end"} justify-center`}>
                {step.mockup}
              </div>
            </motion.div>
          ))}
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
  const primaryLabel = loggedIn ? "Already Registered" : "Register your startup";

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
          <span className="landing-nav-logo-text whitespace-nowrap">Founders Hook</span>
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
            <span>What if. It works?</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="landing-heading font-bold"
            style={{ fontFamily: "'Calibri', sans-serif" }}
          >
            Get your{" "}
            <span className="landing-heading-accent">Early Access, Now!</span>
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
            <Link href={primaryHref} className="landing-btn-secondary">
              Join Startups
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
              500+ founders
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

      {/* ─── HOW IT WORKS STEPS ─── */}
      <HowItWorksSteps />

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
                <Network size={28} />
              </div>
              <h2
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1a1a]"
              >
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
              className="relative aspect-[1206/1179] w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl border border-[#e8e4dc] shadow-lg bg-[#FAF8F4]"
            >
              <Image
                src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786967516/1_gppfwv.jpg"
                alt="The Network for the Next Generation"
                fill
                sizes="(max-width: 768px) 100vw, 540px"
                priority
                unoptimized
                className="object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.02]"
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
              className="order-2 relative aspect-[1206/1179] w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl border border-[#e8e4dc] lg:order-1 shadow-lg bg-[#FAF8F4]"
            >
              <Image
                src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786967516/2_ixtp4f.jpg"
                alt="Meaningful Interactions"
                fill
                sizes="(max-width: 768px) 100vw, 540px"
                priority
                unoptimized
                className="object-cover rounded-2xl transition-transform duration-700 hover:scale-[1.02]"
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
              <h2
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1a1a]"
              >
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
            <Link href="/signup" className="landing-btn-primary">
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
