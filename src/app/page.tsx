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
          <Image
            src="/dashboard-mockup.jpg"
            alt="Founders Hook Dashboard"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "top left" }}
          />
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
        <div className="mug-body" />
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
            <span>Built by Student Founders. For Student Founders.</span>
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

      {/* ─── BOTTOM — Founders Photo ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="landing-bottom-section"
      >
        <div className="landing-founders-image">
          <Image
            src="/founders-working.jpg"
            alt="Founders working together — Build Disrupt Repeat"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div />
      </motion.div>

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
        © {new Date().getFullYear()} Founders Hook. Built for founders, by
        founders.
      </footer>
    </main>
  );
}
