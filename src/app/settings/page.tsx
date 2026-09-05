"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  LogOut,
  Check,
  ExternalLink,
  Moon,
  Volume2,
  Mail,
  Smartphone,
  Loader2,
  CalendarDays,
  UserRound,
  Pencil,
  Save,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "appearance" | "security">("account");
  const [savedAlert, setSavedAlert] = useState(false);

  // Preference states
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dmAlerts, setDmAlerts] = useState(true);
  const [compactFeed, setCompactFeed] = useState(false);

  // Settings Change states
  const [changeAction, setChangeAction] = useState<"email" | "username" | "password" | null>(null);
  const [newData, setNewData] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Fetch current user
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data?.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("founders_hook_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.inAppAlerts === "boolean") setInAppAlerts(parsed.inAppAlerts);
        if (typeof parsed.emailAlerts === "boolean") setEmailAlerts(parsed.emailAlerts);
        if (typeof parsed.soundEnabled === "boolean") setSoundEnabled(parsed.soundEnabled);
        if (typeof parsed.dmAlerts === "boolean") setDmAlerts(parsed.dmAlerts);
        if (typeof parsed.compactFeed === "boolean") setCompactFeed(parsed.compactFeed);
      }
    } catch {
      // ignore
    }
  }, []);

  const savePreferences = (updates?: Partial<{
    inAppAlerts: boolean;
    emailAlerts: boolean;
    soundEnabled: boolean;
    dmAlerts: boolean;
    compactFeed: boolean;
  }>) => {
    try {
      const current = {
        inAppAlerts,
        emailAlerts,
        soundEnabled,
        dmAlerts,
        compactFeed,
        ...updates,
      };
      localStorage.setItem("founders_hook_settings", JSON.stringify(current));
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2500);
    } catch {
      // ignore
    }
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handleRequestOtp(action: "email" | "username" | "password") {
    if (action !== "password" && !newData.trim()) {
      setActionError(`New ${action} is required.`);
      return;
    }
    if (action === "password" && newData.length < 8) {
      setActionError("Password must be at least 8 characters long.");
      return;
    }

    setActionError("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/settings/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, newData: newData.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request OTP");
      setStep("verify");
      setChangeAction(action);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setActionError("Please enter a valid 6-digit code.");
      return;
    }
    setActionError("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/settings/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: changeAction, otp: otp.trim(), newPassword: newData.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify OTP");
      
      if (changeAction === "email") setCurrentUser({ ...currentUser, email: newData });
      if (changeAction === "username") setCurrentUser({ ...currentUser, username: newData });

      setChangeAction(null);
      setStep("request");
      setNewData("");
      setOtp("");
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        className="profile-calibri-container flex min-h-screen bg-ink-950 text-sand-200"
        style={{ fontFamily: "'Calibri', 'Carlito', 'Segoe UI', Candara, Optima, Arial, sans-serif" }}
      >
        <Sidebar user={currentUser} />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      </div>
    );
  }

  const joinedDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })
    : "Recently";

  return (
    <div
      className="profile-calibri-container flex min-h-screen bg-ink-950 text-sand-200"
      style={{ fontFamily: "'Calibri', 'Carlito', 'Segoe UI', Candara, Optima, Arial, sans-serif" }}
    >
      <Sidebar user={currentUser} />

      <main className="relative min-w-0 flex-1 overflow-y-auto pb-20">
        <div className="w-full px-6 pt-20 lg:pt-12 lg:px-10">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-ink-700/60 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sand-100 shadow-sm">
                  <Settings size={22} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sand-100">
                    Settings
                  </h1>
                  <p className="text-sm text-sand-400">
                    Manage your account details, preferences, notifications, and security.
                  </p>
                </div>
              </div>
            </div>

            {savedAlert && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-sm">
                <Check size={15} />
                Preferences updated successfully
              </div>
            )}
          </div>

          {/* Main Layout: Tabs + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Nav Tabs */}
            <aside className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 shrink-0">
              <button
                onClick={() => setActiveTab("account")}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all w-full text-left shrink-0 ${
                  activeTab === "account"
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                    : "text-sand-400 hover:bg-white/5 hover:text-sand-100"
                }`}
              >
                <User size={18} />
                <span>Account & Profile</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all w-full text-left shrink-0 ${
                  activeTab === "notifications"
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                    : "text-sand-400 hover:bg-white/5 hover:text-sand-100"
                }`}
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>

              <button
                onClick={() => setActiveTab("appearance")}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all w-full text-left shrink-0 ${
                  activeTab === "appearance"
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                    : "text-sand-400 hover:bg-white/5 hover:text-sand-100"
                }`}
              >
                <Palette size={18} />
                <span>Appearance</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all w-full text-left shrink-0 ${
                  activeTab === "security"
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                    : "text-sand-400 hover:bg-white/5 hover:text-sand-100"
                }`}
              >
                <Shield size={18} />
                <span>Security & Session</span>
              </button>
            </aside>

            {/* Content Area */}
            <div className="space-y-8">
              {/* TAB 1: Account & Profile */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-ink-700/60 bg-ink-900 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-sand-100 mb-4">Profile Overview</h2>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-ink-700/50">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/20 shadow-card">
                        <Image
                          src={currentUser?.avatarUrl || "https://picsum.photos/seed/user/160/160"}
                          alt={currentUser?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-xl font-bold text-sand-100">{currentUser?.name || "Your Name"}</h3>
                          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white uppercase">
                            {currentUser?.isFounder ? "Founder" : "Candidate"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-sand-400">@{currentUser?.username || "username"}</p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-sand-500">
                          <CalendarDays size={13} />
                          Member since {joinedDate}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 rounded-xl border border-ink-700/60 bg-ink-850 px-4 py-2 text-sm font-semibold text-sand-200 hover:bg-ink-800 hover:text-white transition-all shadow-sm"
                      >
                        <Pencil size={15} />
                        Edit Profile
                      </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-ink-700/50 bg-ink-850 p-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-sand-400">Full Name</span>
                        <p className="mt-1 text-sm font-medium text-sand-100">{currentUser?.name || "—"}</p>
                      </div>

                      <div className="rounded-xl border border-ink-700/50 bg-ink-850 p-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-sand-400">Email Address</span>
                        <p className="mt-1 text-sm font-medium text-sand-100">{currentUser?.email || "—"}</p>
                      </div>

                      <div className="rounded-xl border border-ink-700/50 bg-ink-850 p-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-sand-400">Profile URL</span>
                        <p className="mt-1 text-sm font-medium text-sand-100">/users/{currentUser?._id || currentUser?.id || ""}</p>
                      </div>

                      <div className="rounded-xl border border-ink-700/50 bg-ink-850 p-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-sand-400">Account Status</span>
                        <p className="mt-1 text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Active Member
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-ink-700/60 bg-ink-900 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-sand-100 mb-2">Onboarding & Framework Details</h2>
                    <p className="text-sm text-sand-400 mb-5">
                      Update your role, years of experience, and main objective filled during onboarding.
                    </p>

                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-sand-200 transition-all active:scale-95 shadow-sm"
                    >
                      <ExternalLink size={16} />
                      Go to Onboarding Settings
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 2: Notifications */}
              {activeTab === "notifications" && (
                <div className="rounded-2xl border border-ink-700/60 bg-ink-900 p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-sand-100">Notification Preferences</h2>
                    <p className="text-sm text-sand-400">Manage what alerts you receive across Founders Hook.</p>
                  </div>

                  <div className="space-y-4">
                    {/* In-App */}
                    <div className="flex items-center justify-between rounded-xl border border-ink-700/60 bg-ink-850 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sand-200 shrink-0">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-sand-100">In-App Notifications</p>
                          <p className="text-xs text-sand-400">Receive badge counters and notifications inside the header bell</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const v = !inAppAlerts;
                          setInAppAlerts(v);
                          savePreferences({ inAppAlerts: v });
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          inAppAlerts ? "bg-white" : "bg-ink-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-ink-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                            inAppAlerts ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Sound */}
                    <div className="flex items-center justify-between rounded-xl border border-ink-700/60 bg-ink-850 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sand-200 shrink-0">
                          <Volume2 size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-sand-100">Sound Effects</p>
                          <p className="text-xs text-sand-400">Play an alert chime when receiving new messages</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const v = !soundEnabled;
                          setSoundEnabled(v);
                          savePreferences({ soundEnabled: v });
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          soundEnabled ? "bg-white" : "bg-ink-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-ink-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                            soundEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Email Alerts */}
                    <div className="flex items-center justify-between rounded-xl border border-ink-700/60 bg-ink-850 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sand-200 shrink-0">
                          <Mail size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-sand-100">Email Notifications</p>
                          <p className="text-xs text-sand-400">Get email updates about applications, team invites, and announcements</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const v = !emailAlerts;
                          setEmailAlerts(v);
                          savePreferences({ emailAlerts: v });
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          emailAlerts ? "bg-white" : "bg-ink-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-ink-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                            emailAlerts ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Appearance */}
              {activeTab === "appearance" && (
                <div className="rounded-2xl border border-ink-700/60 bg-ink-900 p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-sand-100">Display & Appearance</h2>
                    <p className="text-sm text-sand-400">Configure theme, layout density, and typography styling.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-ink-700/60 bg-ink-850 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sand-200">
                            <Moon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-sand-100">Dark Midnight Theme</p>
                            <p className="text-xs text-sand-400">High-contrast dark mode tailored for Founders Hook</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                          Active (Default)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-ink-700/60 bg-ink-850 p-5">
                      <div>
                        <p className="text-sm font-bold text-sand-100">Typography</p>
                        <p className="text-xs text-sand-400">Application font family</p>
                      </div>
                      <span className="rounded-xl border border-ink-700/60 bg-ink-800 px-3 py-1.5 text-xs font-semibold text-sand-200">
                        Calibri
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-ink-700/60 bg-ink-850 p-5">
                      <div>
                        <p className="text-sm font-bold text-sand-100">Compact Layout</p>
                        <p className="text-xs text-sand-400">Reduce spacing between cards for denser startup browsing</p>
                      </div>
                      <button
                        onClick={() => {
                          const v = !compactFeed;
                          setCompactFeed(v);
                          savePreferences({ compactFeed: v });
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          compactFeed ? "bg-white" : "bg-ink-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-ink-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                            compactFeed ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Security & Session */}
              {activeTab === "security" && (
                <div className="rounded-2xl border border-ink-700/60 bg-ink-900 p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-sand-100">Security & Session Management</h2>
                    <p className="text-sm text-sand-400">Manage your credentials, login status, and active session.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Settings Change Block */}
                    <div className="rounded-xl border border-ink-700/60 bg-ink-850 p-5 flex flex-col gap-4">
                      
                      {/* Change Email */}
                      {(!changeAction || changeAction === "email") && (
                        <div className="flex flex-col gap-3 pb-4 border-b border-ink-700/40">
                          <div>
                            <p className="text-sm font-bold text-sand-100">Change Email</p>
                            <p className="text-xs text-sand-400">Update the email address associated with your account. Current: <span className="font-semibold text-sand-300">{currentUser?.email}</span></p>
                          </div>
                          {changeAction === "email" ? (
                            <div className="bg-ink-900 rounded-xl p-4 border border-ink-700/60 space-y-3">
                              {step === "request" ? (
                                <>
                                  <input 
                                    type="email" 
                                    placeholder="Enter new email" 
                                    value={newData} 
                                    onChange={(e) => setNewData(e.target.value)}
                                    className="w-full rounded-lg bg-ink-950 border border-ink-700/60 px-3 py-2 text-sm text-sand-100 placeholder:text-sand-500 focus:outline-none focus:border-white/20"
                                  />
                                  {actionError && <p className="text-xs text-rose-400">{actionError}</p>}
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleRequestOtp("email")} 
                                      disabled={actionLoading}
                                      className="rounded-lg bg-white text-ink-950 px-4 py-2 text-xs font-semibold hover:bg-sand-200 transition-all disabled:opacity-50"
                                    >
                                      {actionLoading ? <Loader2 size={14} className="animate-spin inline" /> : "Request OTP"}
                                    </button>
                                    <button 
                                      onClick={() => { setChangeAction(null); setActionError(""); setNewData(""); }} 
                                      className="rounded-lg bg-ink-800 text-sand-300 px-4 py-2 text-xs font-semibold hover:bg-ink-700 transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="text-xs text-sand-300">We sent a 6-digit code to your current email. Enter it below to verify.</p>
                                  <input 
                                    type="text" 
                                    maxLength={6}
                                    placeholder="000000" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full rounded-lg bg-ink-950 border border-ink-700/60 px-3 py-2 text-sm text-sand-100 placeholder:text-sand-500 focus:outline-none focus:border-white/20 tracking-widest font-mono"
                                  />
                                  {actionError && <p className="text-xs text-rose-400">{actionError}</p>}
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={handleVerifyOtp} 
                                      disabled={actionLoading}
                                      className="rounded-lg bg-white text-ink-950 px-4 py-2 text-xs font-semibold hover:bg-sand-200 transition-all disabled:opacity-50"
                                    >
                                      {actionLoading ? <Loader2 size={14} className="animate-spin inline" /> : "Verify & Update"}
                                    </button>
                                    <button 
                                      onClick={() => { setStep("request"); setOtp(""); setActionError(""); }} 
                                      className="rounded-lg bg-ink-800 text-sand-300 px-4 py-2 text-xs font-semibold hover:bg-ink-700 transition-all"
                                    >
                                      Back
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setChangeAction("email"); setStep("request"); setNewData(""); setActionError(""); }}
                              className="self-start rounded-lg border border-ink-700/60 bg-ink-800 px-4 py-2 text-xs font-semibold text-sand-200 hover:bg-ink-700 hover:text-white transition-all shadow-sm"
                            >
                              Change Email
                            </button>
                          )}
                        </div>
                      )}

                      {/* Change Username */}
                      {(!changeAction || changeAction === "username") && (
                        <div className="flex flex-col gap-3 pb-4 border-b border-ink-700/40">
                          <div>
                            <p className="text-sm font-bold text-sand-100">Change Username</p>
                            <p className="text-xs text-sand-400">Update your public @username. Current: <span className="font-semibold text-sand-300">@{currentUser?.username}</span></p>
                          </div>
                          {changeAction === "username" ? (
                            <div className="bg-ink-900 rounded-xl p-4 border border-ink-700/60 space-y-3">
                              {step === "request" ? (
                                <>
                                  <input 
                                    type="text" 
                                    placeholder="Enter new username" 
                                    value={newData} 
                                    onChange={(e) => setNewData(e.target.value)}
                                    className="w-full rounded-lg bg-ink-950 border border-ink-700/60 px-3 py-2 text-sm text-sand-100 placeholder:text-sand-500 focus:outline-none focus:border-white/20"
                                  />
                                  {actionError && <p className="text-xs text-rose-400">{actionError}</p>}
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleRequestOtp("username")} 
                                      disabled={actionLoading}
                                      className="rounded-lg bg-white text-ink-950 px-4 py-2 text-xs font-semibold hover:bg-sand-200 transition-all disabled:opacity-50"
                                    >
                                      {actionLoading ? <Loader2 size={14} className="animate-spin inline" /> : "Request OTP"}
                                    </button>
                                    <button 
                                      onClick={() => { setChangeAction(null); setActionError(""); setNewData(""); }} 
                                      className="rounded-lg bg-ink-800 text-sand-300 px-4 py-2 text-xs font-semibold hover:bg-ink-700 transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="text-xs text-sand-300">We sent a 6-digit code to your email. Enter it below to verify.</p>
                                  <input 
                                    type="text" 
                                    maxLength={6}
                                    placeholder="000000" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full rounded-lg bg-ink-950 border border-ink-700/60 px-3 py-2 text-sm text-sand-100 placeholder:text-sand-500 focus:outline-none focus:border-white/20 tracking-widest font-mono"
                                  />
                                  {actionError && <p className="text-xs text-rose-400">{actionError}</p>}
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={handleVerifyOtp} 
                                      disabled={actionLoading}
                                      className="rounded-lg bg-white text-ink-950 px-4 py-2 text-xs font-semibold hover:bg-sand-200 transition-all disabled:opacity-50"
                                    >
                                      {actionLoading ? <Loader2 size={14} className="animate-spin inline" /> : "Verify & Update"}
                                    </button>
                                    <button 
                                      onClick={() => { setStep("request"); setOtp(""); setActionError(""); }} 
                                      className="rounded-lg bg-ink-800 text-sand-300 px-4 py-2 text-xs font-semibold hover:bg-ink-700 transition-all"
                                    >
                                      Back
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setChangeAction("username"); setStep("request"); setNewData(""); setActionError(""); }}
                              className="self-start rounded-lg border border-ink-700/60 bg-ink-800 px-4 py-2 text-xs font-semibold text-sand-200 hover:bg-ink-700 hover:text-white transition-all shadow-sm"
                            >
                              Change Username
                            </button>
                          )}
                        </div>
                      )}

                      {/* Change Password */}
                      {(!changeAction || changeAction === "password") && (
                        <div className="flex flex-col gap-3">
                          <div>
                            <p className="text-sm font-bold text-sand-100">Change Password</p>
                            <p className="text-xs text-sand-400">Update the password used to access your account.</p>
                          </div>
                          {changeAction === "password" ? (
                            <div className="bg-ink-900 rounded-xl p-4 border border-ink-700/60 space-y-3">
                              {step === "request" ? (
                                <>
                                  <input 
                                    type="password" 
                                    placeholder="Enter new password" 
                                    value={newData} 
                                    onChange={(e) => setNewData(e.target.value)}
                                    className="w-full rounded-lg bg-ink-950 border border-ink-700/60 px-3 py-2 text-sm text-sand-100 placeholder:text-sand-500 focus:outline-none focus:border-white/20"
                                  />
                                  {actionError && <p className="text-xs text-rose-400">{actionError}</p>}
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleRequestOtp("password")} 
                                      disabled={actionLoading}
                                      className="rounded-lg bg-white text-ink-950 px-4 py-2 text-xs font-semibold hover:bg-sand-200 transition-all disabled:opacity-50"
                                    >
                                      {actionLoading ? <Loader2 size={14} className="animate-spin inline" /> : "Request OTP"}
                                    </button>
                                    <button 
                                      onClick={() => { setChangeAction(null); setActionError(""); setNewData(""); }} 
                                      className="rounded-lg bg-ink-800 text-sand-300 px-4 py-2 text-xs font-semibold hover:bg-ink-700 transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="text-xs text-sand-300">We sent a 6-digit code to your email. Enter it below to verify.</p>
                                  <input 
                                    type="text" 
                                    maxLength={6}
                                    placeholder="000000" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full rounded-lg bg-ink-950 border border-ink-700/60 px-3 py-2 text-sm text-sand-100 placeholder:text-sand-500 focus:outline-none focus:border-white/20 tracking-widest font-mono"
                                  />
                                  {actionError && <p className="text-xs text-rose-400">{actionError}</p>}
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={handleVerifyOtp} 
                                      disabled={actionLoading}
                                      className="rounded-lg bg-white text-ink-950 px-4 py-2 text-xs font-semibold hover:bg-sand-200 transition-all disabled:opacity-50"
                                    >
                                      {actionLoading ? <Loader2 size={14} className="animate-spin inline" /> : "Verify & Update"}
                                    </button>
                                    <button 
                                      onClick={() => { setStep("request"); setOtp(""); setActionError(""); }} 
                                      className="rounded-lg bg-ink-800 text-sand-300 px-4 py-2 text-xs font-semibold hover:bg-ink-700 transition-all"
                                    >
                                      Back
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setChangeAction("password"); setStep("request"); setNewData(""); setActionError(""); }}
                              className="self-start rounded-lg border border-ink-700/60 bg-ink-800 px-4 py-2 text-xs font-semibold text-sand-200 hover:bg-ink-700 hover:text-white transition-all shadow-sm"
                            >
                              Change Password
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-ink-700/60 bg-ink-850 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-sand-100">Active Authentication Session</p>
                        <p className="text-xs text-sand-400">Currently logged in as @{currentUser?.username || "user"}</p>
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                        Secure
                      </span>
                    </div>

                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-sand-100">Log Out</p>
                        <p className="text-xs text-sand-400">End your current session across this browser</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/30 transition-all active:scale-95"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
