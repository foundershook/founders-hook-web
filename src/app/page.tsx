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
  Menu,
  X,
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
  const primaryLabel = loggedIn ? "Go to Feed" : "Join the Early Access";

  return (
    <main className="relative min-h-screen w-full bg-white text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg"
            alt="Founders Hook Logo"
            width={38}
            height={38}
            className="rounded-xl object-cover ring-2 ring-purple-500/20 transition-transform group-hover:scale-105 shadow-sm"
          />
          <span className="font-extrabold text-lg tracking-wider text-slate-950">
            FOUNDERS HOOK
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-medium text-slate-600 md:flex">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              className={`transition-colors hover:text-slate-950 ${
                i === 0 ? "text-purple-600 font-bold border-b-2 border-purple-600 pb-0.5" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Link href={primaryHref} className="btn-purple !py-2.5 !px-5 text-xs md:text-sm font-semibold">
            {primaryLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* MOBILE MENU BACKDROP */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* MOBILE MENU DRAWER */}
      <aside
        className={`fixed right-0 top-0 z-[51] flex h-full w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <span className="font-extrabold text-lg tracking-wider text-slate-950">
            MENU
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-6">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-slate-100 ${
                i === 0
                  ? "text-purple-600 font-bold bg-purple-50"
                  : "text-slate-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-6 pt-4">
          <Link
            href={primaryHref}
            onClick={() => setMobileMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            {primaryLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      </aside>

      {/* HERO */}
      <section className="relative z-10 w-full pb-16 pt-6">
        <div className="relative overflow-hidden border-y border-slate-200 bg-slate-50/50 shadow-sm lg:border-x">
          <div className="absolute inset-0">
            <Image
              src="https://res.cloudinary.com/t7efuhnd/image/upload/v1785570893/tyler-franta-iusJ25iYu1c-unsplash_ysk7pp.jpg"
              alt="Founders collaborating in a coworking space"
              fill
              priority
              className="object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/30" />
          </div>

          <div className="relative px-6 pb-14 pt-14 sm:px-10 lg:px-14 lg:pb-24 lg:pt-24 min-h-[420px] sm:min-h-[500px] lg:min-h-[560px]">
            {/* Floating Feature Bubbles — desktop */}
            {FEATURES.map((f, i) => {
              const positions = [
                "left-3 top-10 sm:left-6 sm:top-14 lg:left-8 lg:top-16",
                "right-3 top-8 sm:right-6 sm:top-12 lg:right-10 lg:top-14",
                "left-3 bottom-24 sm:left-8 sm:bottom-28 lg:left-10 lg:bottom-32",
                "right-3 bottom-20 sm:right-8 sm:bottom-24 lg:right-8 lg:bottom-28",
              ];
              const floatDelays = ["0s", "1.5s", "3s", "4.5s"];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.8, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.35 + i * 0.12 }}
                  style={{ animationDelay: floatDelays[i] }}
                  className={`absolute ${positions[i]} z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-lg px-4 py-3 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-default animate-floatSlow`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <f.icon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{f.title}</p>
                    <p className="text-[11px] text-slate-500 max-w-[150px] leading-snug">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Centered Hero Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
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
                className="mx-auto max-w-3xl font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight text-slate-950 tracking-tight"
              >
                The Exclusive Network for{" "}
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 bg-clip-text text-transparent">
                  Startup Founders
                </span>
                .
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mx-auto mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-slate-600 font-normal"
              >
                Founders Hook is where college founders publish their ideas,
                build teams, and connect with students looking for real
                startup internships. Built for founders, by founders.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-9 flex flex-wrap justify-center gap-4"
              >
                <Link href={primaryHref} className="btn-purple !px-7 !py-3.5 font-semibold">
                  {primaryLabel}
                  <ArrowRight size={16} />
                </Link>
                <Link href="/feed" className="btn-purple-outline !px-7 !py-3.5 font-semibold">
                  Explore Founders
                </Link>
              </motion.div>
            </div>

            {/* Mobile Feature Bubbles — horizontal scroll */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex sm:hidden gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none"
            >
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md px-3.5 py-2.5 shadow-md"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <f.icon size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{f.title}</p>
                    <p className="text-[10px] text-slate-500 max-w-[110px] leading-tight">{f.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* STATS BAR */}
          <div className="relative mb-8 grid grid-cols-1 gap-6 border-y border-slate-200 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-8 py-7 text-white shadow-md sm:grid-cols-3 lg:px-14">
            <StatItem icon={Users} value={stats?.founders} label="Active Founders" />
            <StatItem icon={Rocket} value={stats?.startups} label="Startups" divider />
            <StatItem icon={Briefcase} value={stats?.openRoles} label="Open Internships" />
          </div>
        </div>
      </section>



      {/* NETWORKING SECTION */}
      <section className="relative z-10 w-full border-y border-slate-200 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 text-purple-600 shadow-xs">
                <Globe size={28} />
              </div>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight">
                The Network for the Next Generation
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-600 font-normal">
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
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-normal">
                    <div className="h-2 w-2 rounded-full bg-purple-600" />
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
              className="relative aspect-square max-h-[500px] w-full overflow-hidden rounded-2xl border border-slate-200 lg:h-[500px] shadow-lg"
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

      {/* FOUNDERS INTERACTION SECTION */}
      <section className="relative z-10 w-full bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="order-2 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 lg:order-1 lg:h-[500px] shadow-lg"
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
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 text-purple-600 shadow-xs">
                <MessageSquare size={28} />
              </div>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight">
                Meaningful Interactions
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-600 font-normal">
                Stop shouting into the void. Founders Hook provides dedicated spaces 
                to discuss ideas, ask for feedback, and form partnerships. It's a 
                community that actually cares about what you're building.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-5">
                  <h4 className="font-bold text-slate-950 text-base">Direct Messaging</h4>
                  <p className="mt-2 text-sm text-slate-600 font-normal">Reach out directly to potential co-founders and team members securely.</p>
                </div>
                <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-5">
                  <h4 className="font-bold text-slate-950 text-base">Project Feeds</h4>
                  <p className="mt-2 text-sm text-slate-600 font-normal">Share your progress, post updates, and get constructive feedback from peers.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* KNOWLEDGE HUB SECTION */}
      <section className="relative z-10 w-full border-t border-slate-200 bg-slate-50/50 py-24 pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 text-purple-600 shadow-xs">
                <BookOpen size={32} />
              </div>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight">
                The Founders Knowledge Hub
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 font-normal">
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
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-purple-300 hover:shadow-md"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-950 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 font-normal">{item.desc}</p>
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
            <Link href={primaryHref} className="btn-purple !px-8 !py-3.5 font-semibold">
              Explore Resources
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 font-normal">
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
    <div className={`flex items-center gap-4 ${divider ? "sm:border-x sm:border-purple-500/40 sm:px-6" : ""}`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-xs">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-extrabold text-2xl text-white">
          {value === undefined ? (
            <span className="inline-block h-6 w-14 animate-pulse rounded bg-white/20 align-middle" />
          ) : (
            `${value.toLocaleString()}+`
          )}
        </p>
        <p className="text-xs font-semibold text-purple-100">{label}</p>
      </div>
    </div>
  );
}
