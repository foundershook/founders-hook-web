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
} from "lucide-react";

type Stats = { founders: number; startups: number; openRoles: number };

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Founders", href: "/feed" },
  { label: "Startups", href: "/feed" },
  { label: "Community", href: "/feed" },
  { label: "Resources", href: "/feed" },
];

const FEATURES = [
  {
    icon: Handshake,
    title: "Connect",
    desc: "Meet fellow student founders building in your field.",
  },
  {
    icon: Sparkles,
    title: "Collaborate",
    desc: "Form co-founding teams and ship your idea together.",
  },
  {
    icon: TrendingUp,
    title: "Grow",
    desc: "Get resources, mentorship and expert guidance.",
  },
  {
    icon: Briefcase,
    title: "Hire",
    desc: "Bring on student interns who want real experience.",
  },
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

export default function LandingPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const loggedIn = useAuthedUser();

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const primaryHref = loggedIn ? "/feed" : "/signup";
  const primaryLabel = loggedIn ? "Go to Feed" : "Join the Community";

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-ink-950 text-mist-100 selection:bg-purple-500/30 selection:text-white">
      {/* Ambient Purple Glow Background Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[140px] animate-pulseGlow" />
      <div className="pointer-events-none absolute top-[35%] left-[-150px] h-[500px] w-[500px] rounded-full bg-brand-accent/15 blur-[150px]" />
      <div className="pointer-events-none absolute top-[65%] right-[-150px] h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[150px]" />

      {/* NAVBAR */}
      <header className="relative z-20 flex w-full items-center justify-between px-4 py-6 sm:px-6 lg:px-8 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg"
            alt="Founders Hook Logo"
            width={38}
            height={38}
            className="rounded-xl object-cover ring-2 ring-purple-500/30 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(99,91,255,0.4)]"
          />
          <span className="font-display text-lg font-bold tracking-wider text-white">
            FOUNDERS HOOK
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-medium text-mist-300 md:flex">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              className={`transition-colors hover:text-white ${
                i === 0 ? "text-purple-400 font-semibold border-b-2 border-purple-500 pb-0.5" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href={primaryHref} className="btn-purple !py-2.5 !px-5 text-xs md:text-sm">
          {primaryLabel}
          <ArrowRight size={15} />
        </Link>
      </header>

      {/* HERO */}
      <section className="relative z-10 w-full pb-16 pt-6">
        <div className="relative overflow-hidden border-y border-white/10 shadow-card lg:border-x">
          <div className="absolute inset-0">
            <Image
              src="https://res.cloudinary.com/t7efuhnd/image/upload/v1785570893/tyler-franta-iusJ25iYu1c-unsplash_ysk7pp.jpg"
              alt="Founders collaborating in a coworking space"
              fill
              priority
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
          </div>

          <div className="relative px-6 pb-14 pt-14 sm:px-10 lg:px-14 lg:pb-20 lg:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="badge-purple mb-4"
            >
              <span>BUILD. CONNECT. GROW.</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="max-w-2xl font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
            >
              The Exclusive Network for{" "}
              <span className="bg-gradient-to-r from-purple-400 via-brand-accent to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(124,58,237,0.5)]">
                Startup Founders
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 max-w-lg text-base leading-relaxed text-mist-300"
            >
              Founders Hook is where college founders publish their ideas,
              build teams, and connect with students looking for real
              startup internships. Built for founders, by founders.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link href={primaryHref} className="btn-purple !px-7 !py-3.5">
                {primaryLabel}
                <ArrowRight size={16} />
              </Link>
              <Link href="/feed" className="btn-purple-outline !px-7 !py-3.5">
                Explore Founders
              </Link>
            </motion.div>

            <span className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 text-right font-display text-3xl font-extrabold uppercase leading-tight text-purple-500/15 xl:block">
              Building
              <br />
              the Future
              <br />
              Together
            </span>
          </div>

          {/* STATS BAR — pulled live from MongoDB via /api/stats */}
          <div className="relative mb-8 grid grid-cols-1 gap-6 border-y border-white/10 bg-gradient-to-r from-purple-900/60 via-brand-950/80 to-indigo-950/60 px-8 py-7 backdrop-blur-md sm:grid-cols-3 lg:px-14">
            <StatItem icon={Users} value={stats?.founders} label="Active Founders" />
            <StatItem icon={Rocket} value={stats?.startups} label="Startups" divider />
            <StatItem icon={Briefcase} value={stats?.openRoles} label="Open Internships" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 w-full pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-500/50 hover:shadow-[0_10px_30px_rgba(99,91,255,0.2)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-transform duration-200 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white">
                  <f.icon size={22} />
                </div>
                <h3 className="mb-1.5 font-display text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-mist-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NETWORKING SECTION */}
      <section className="relative z-10 w-full border-y border-white/10 bg-ink-900/40 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                <Globe size={28} />
              </div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl text-white">
                The Network for the Next Generation
              </h2>
              <p className="mt-6 text-base leading-relaxed text-mist-300">
                Connect with passionate student founders from campuses around the world. 
                Whether you're looking for a technical co-founder to build your MVP or 
                a marketing wiz to launch your product, our networking tools make it 
                effortless to find the right people for your startup journey.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Discover founders by campus, major, or skill set.",
                  "Filter startups by industry and funding stage.",
                  "Join localized communities and special interest groups.",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-mist-300">
                    <div className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
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
              className="relative aspect-square max-h-[500px] w-full overflow-hidden rounded-2xl border border-purple-500/30 lg:h-[500px] shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                alt="Students networking"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-purple-950/20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOUNDERS INTERACTION SECTION */}
      <section className="relative z-10 w-full bg-ink-950 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-2 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 lg:order-1 lg:h-[500px] shadow-card"
            >
              <Image
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                alt="Founders discussing ideas"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink-950 via-ink-950/50 to-purple-950/30" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                <MessageSquare size={28} />
              </div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl text-white">
                Meaningful Interactions
              </h2>
              <p className="mt-6 text-base leading-relaxed text-mist-300">
                Stop shouting into the void. Founders Hook provides dedicated spaces 
                to discuss ideas, ask for feedback, and form partnerships. It's a 
                community that actually cares about what you're building.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-950/30 to-ink-900 p-5 backdrop-blur-sm">
                  <h4 className="font-display font-bold text-white text-base">Direct Messaging</h4>
                  <p className="mt-2 text-sm text-mist-400">Reach out directly to potential co-founders and team members securely.</p>
                </div>
                <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-950/30 to-ink-900 p-5 backdrop-blur-sm">
                  <h4 className="font-display font-bold text-white text-base">Project Feeds</h4>
                  <p className="mt-2 text-sm text-mist-400">Share your progress, post updates, and get constructive feedback from peers.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* KNOWLEDGE HUB SECTION */}
      <section className="relative z-10 w-full border-t border-white/10 bg-ink-900/50 py-24 pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_25px_rgba(124,58,237,0.35)]">
                <BookOpen size={32} />
              </div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl text-white">
                The Founders Knowledge Hub
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist-300">
                Building a startup is hard. We provide the resources you need to 
                navigate the journey from idea to execution. Access guides, templates, 
                and case studies tailored for student entrepreneurs.
              </p>
            </motion.div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Startup Playbooks",
                desc: "Step-by-step guides from ideation to seed round.",
                img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=800"
              },
              {
                title: "Pitch Templates",
                desc: "Winning pitch deck structures used by successful founders.",
                img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"
              },
              {
                title: "Legal & Equity",
                desc: "Understand term sheets, vesting, and founder agreements.",
                img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-ink-900 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_10px_30px_rgba(99,91,255,0.2)]"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-mist-400">{item.desc}</p>
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
            <Link href={primaryHref} className="btn-purple !px-8 !py-3.5">
              Explore Resources
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-ink-950 py-8 text-center text-xs text-mist-500">
        © {new Date().getFullYear()} Founders Hook. Built for founders, by founders.
      </footer>
    </main>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
  divider,
}: {
  icon: React.ElementType;
  value?: number;
  label: string;
  divider?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 ${divider ? "sm:border-x sm:border-white/15 sm:px-6" : ""}`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(99,91,255,0.3)]">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-display text-2xl font-extrabold text-white">
          {value === undefined ? (
            <span className="inline-block h-6 w-14 animate-pulse rounded bg-white/10 align-middle" />
          ) : (
            `${value.toLocaleString()}+`
          )}
        </p>
        <p className="text-sm font-medium text-purple-200">{label}</p>
      </div>
    </div>
  );
}
