"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, X, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/timeAgo";

export interface NotificationItem {
  _id: string;
  type: "application_accepted" | "application_rejected" | "new_application" | "general";
  title: string;
  message: string;
  link?: string;
  applicationId?: string;
  startupName?: string;
  roleTitle?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking notifications read:", err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationIds: [notif._id] }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification read:", err);
      }
    }

    setIsOpen(false);

    if (notif.link) {
      router.push(notif.link);
    } else if (notif.applicationId) {
      router.push(`/founders-hook?applicationId=${notif.applicationId}`);
    } else {
      router.push("/founders-hook");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-sand-400 hover:text-sand-100 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-ink-950 shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{ fontFamily: "'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" }}
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-ink-700/80 bg-ink-900/95 p-0 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-800/80 px-4 py-3 bg-ink-950/60">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sand-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-medium text-sand-400 hover:text-emerald-400 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-ink-800/40 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-sand-500">
                <Bell size={24} className="mx-auto mb-2 opacity-30 text-sand-400" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => {
                const isAccepted = notif.type === "application_accepted";
                const isRejected = notif.type === "application_rejected";

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-ink-800/60 ${
                      !notif.read ? "bg-emerald-950/20" : ""
                    }`}
                  >
                    {/* Icon indicator */}
                    <div className="shrink-0 mt-0.5">
                      {isAccepted ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Check size={14} />
                        </div>
                      ) : isRejected ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          <X size={14} />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 text-sand-400 border border-ink-700">
                          <Clock size={14} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs font-semibold truncate ${!notif.read ? "text-sand-100" : "text-sand-300"}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-sand-500 shrink-0">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-sand-400 leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.roleTitle && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                            isAccepted
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : isRejected
                              ? "bg-red-500/10 text-red-300 border-red-500/20"
                              : "bg-ink-800 text-sand-300 border-ink-700"
                          }`}>
                            {notif.roleTitle}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium inline-flex items-center gap-0.5 ml-auto">
                            View details <ExternalLink size={10} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
