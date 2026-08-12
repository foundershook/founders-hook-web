"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ChevronDown,
  LogOut,
  UserRound,
  Users,
  BookOpen,
  Network,
  Anchor,
  Rss,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { label: "Home",          icon: Home,     href: "/feed" },
  { label: "Feed",          icon: Rss,      href: "/feed" },
  { label: "Profile",       icon: UserRound, href: "/profile" },
  { label: "Founders",      icon: Users,    href: "/founders" },
  { label: "Founders Hook", icon: Anchor,   href: "/founders-hook" },
  { label: "Networking",    icon: Network,  href: "/networking" },
  { label: "Knowledge Hub", icon: BookOpen, href: "/knowledge-hub" },
];

export default function Sidebar({
  user,
}: {
  user: { name: string; username: string; avatarUrl: string; isFounder?: boolean } | null;
}) {
  const pathname = usePathname();
  const router   = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside
      className="hidden w-[72px] flex-col items-center border-r border-ink-700/60 bg-ink-900 py-5 lg:flex xl:w-52 xl:items-stretch xl:px-3"
      style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
    >
      {/* LOGO — matches amber "F" badge in screenshot */}
      <Link href="/" className="mb-7 flex items-center gap-2.5 xl:px-2 group">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-ink-950 font-extrabold text-base shadow-glow">
          F
        </div>
        <div className="hidden flex-col xl:flex leading-none">
          <span className="font-bold text-[11px] tracking-[0.18em] text-sand-100 uppercase">
            Founders Hook
          </span>
        </div>
      </Link>

      {/* NAV ITEMS */}
      <nav className="flex flex-1 flex-col gap-0.5" style={{ fontFamily: "'Calibri', sans-serif" }}>
        {NAV_ITEMS.map((item) => {
          // both /feed routes point same, highlight whichever matches
          const active = pathname === item.href || (item.href === "/feed" && pathname === "/feed");
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all xl:px-3 ${
                active
                  ? "bg-white/15 text-white font-semibold border-l-2 border-white"
                  : "text-sand-400 font-medium hover:bg-ink-800 hover:text-sand-100 border-l-2 border-transparent"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="hidden xl:inline">{item.label}</span>
            </Link>
          );
        })}

        <div className="my-2 border-t border-ink-700/60" />

        <button
          onClick={handleLogout}
          title="Log out"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400/80 transition-all hover:bg-rose-500/10 hover:text-rose-400 border-l-2 border-transparent"
        >
          <LogOut size={17} className="shrink-0" />
          <span className="hidden xl:inline">Log out</span>
        </button>
      </nav>

      {/* USER PROFILE */}
      <div ref={menuRef} className="relative mt-3">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-ink-800 border border-ink-700/60"
        >
          <Image
            src={user?.avatarUrl || "https://picsum.photos/seed/user/64/64"}
            alt={user?.name || "You"}
            width={32}
            height={32}
            className="rounded-full border border-white/30 object-cover shrink-0"
          />
          <span className="hidden min-w-0 flex-1 xl:block">
            <span className="block truncate text-sm font-bold text-sand-100">
              {user?.name || "Guest"}
            </span>
            <span className="block truncate text-xs text-white/80 font-medium">Founder</span>
          </span>
          <ChevronDown size={14} className="hidden shrink-0 text-sand-600 xl:block" />
        </button>

        {menuOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 overflow-hidden rounded-xl border border-ink-700/60 bg-ink-850 shadow-card z-50">
            <Link
              href="/profile"
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-sand-200 font-medium transition-colors hover:bg-ink-800 hover:text-sand-100"
            >
              <UserRound size={14} /> Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-rose-400 font-medium transition-colors hover:bg-rose-500/10"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
