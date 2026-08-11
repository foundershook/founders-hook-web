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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/feed" },
  { label: "Profile", icon: UserRound, href: "/profile" },
  { label: "Founders", icon: Users, href: "/founders" },
  { label: "Founders Hook", icon: Anchor, href: "/founders-hook" },
  { label: "Networking", icon: Network, href: "/networking" },
  { label: "Knowledge Hub", icon: BookOpen, href: "/knowledge-hub" },
];

export default function Sidebar({
  user,
}: {
  user: { name: string; username: string; avatarUrl: string; isFounder?: boolean } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // State for dropdown menu
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
    <aside className="hidden w-[84px] flex-col items-center border-r border-slate-200 bg-white py-6 lg:flex xl:w-56 xl:items-stretch xl:px-4 shadow-xs">
        <Link href="/" className="mb-8 flex items-center gap-2.5 xl:px-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-extrabold text-lg shadow-md shadow-purple-200">
            F
          </div>
          <div className="hidden flex-col xl:flex">
            <span className="font-bold text-sm tracking-wider text-slate-950 leading-tight">
              FOUNDERS
            </span>
            <span className="font-bold text-xs tracking-widest text-purple-600 leading-tight">
              HOOK
            </span>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = item.href === pathname;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors xl:px-3 ${
                  active
                    ? "bg-purple-50 text-purple-700 font-bold shadow-xs"
                    : "text-slate-600 font-medium hover:bg-slate-50 hover:text-purple-600"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER PROFILE SECTION */}
        <div ref={menuRef} className="relative mt-4">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50 border border-slate-100"
          >
            <Image
              src={user?.avatarUrl || "https://picsum.photos/seed/user/64/64"}
              alt={user?.name || "You"}
              width={34}
              height={34}
              className="rounded-full border border-slate-200 object-cover"
            />
            <span className="hidden min-w-0 flex-1 xl:block">
              <span className="block truncate text-sm font-bold text-slate-900">
                {user?.name || "Guest"}
              </span>
              <span className="block truncate text-xs text-purple-600 font-semibold">Founder</span>
            </span>
            <ChevronDown size={15} className="hidden shrink-0 text-slate-400 xl:block" />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg z-50">
              <Link
                href="/profile"
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 font-medium transition-colors hover:bg-slate-50 hover:text-purple-600"
              >
                <UserRound size={15} /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-rose-600 font-medium transition-colors hover:bg-rose-50"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </aside>
  );
}
