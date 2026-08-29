"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Video, X, ExternalLink, PhoneCall } from "lucide-react";

interface IncomingCall {
  messageId: string;
  conversationId: string;
  meetUrl: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  startupName: string;
  createdAt: string;
}

// Gentle Web Audio API Chime for incoming call notification
function playCallChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.1, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch {
    // Audio autoplay might be blocked if user hasn't interacted yet
  }
}

export default function IncomingCallNotifier() {
  const [mounted, setMounted] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const dismissedCallIds = useRef<Set<string>>(new Set());
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize dismissed calls from sessionStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = sessionStorage.getItem("fh_dismissed_calls");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => dismissedCallIds.current.add(id));
        }
      }
    } catch {
      // ignore storage errors
    }

    // Set up BroadcastChannel for instant cross-tab sync
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("founders_hook_call_channel");
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === "DISMISS_CALL") {
          const id = event.data.messageId;
          dismissedCallIds.current.add(id);
          setIncomingCall((curr) => (curr?.messageId === id ? null : curr));
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  const dismissCall = useCallback((messageId: string) => {
    dismissedCallIds.current.add(messageId);
    try {
      sessionStorage.setItem(
        "fh_dismissed_calls",
        JSON.stringify(Array.from(dismissedCallIds.current))
      );
    } catch {
      // ignore storage errors
    }

    // Broadcast dismiss to other open tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "DISMISS_CALL",
        messageId,
      });
    }

    setIncomingCall(null);
  }, []);

  // Poll for incoming calls every 4 seconds across all pages
  useEffect(() => {
    let isMounted = true;

    const checkIncomingCalls = async () => {
      try {
        const res = await fetch("/api/conversations/incoming-call");
        if (!res.ok) return;
        const data = await res.json();

        if (data.incomingCall && isMounted) {
          const call: IncomingCall = data.incomingCall;
          if (!dismissedCallIds.current.has(call.messageId)) {
            setIncomingCall((prev) => {
              if (prev?.messageId !== call.messageId) {
                playCallChime();
              }
              return call;
            });
          }
        }
      } catch {
        // network error / unauthenticated
      }
    };

    checkIncomingCalls();
    const interval = setInterval(checkIncomingCalls, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleJoinCall = () => {
    if (!incomingCall) return;
    const url = incomingCall.meetUrl || "https://meet.google.com/new";
    const convoId = incomingCall.conversationId;
    const msgId = incomingCall.messageId;
    const meetWindow = window.open(url, "_blank");
    dismissCall(msgId);

    if (meetWindow && convoId) {
      const checkTimer = setInterval(async () => {
        if (meetWindow.closed) {
          clearInterval(checkTimer);
          try {
            await fetch(`/api/conversations/${convoId}/meet`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messageId: msgId }),
            });
          } catch (err) {
            console.error("Failed to mark call ended:", err);
          }
        }
      }, 1500);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>

      {incomingCall && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-[9999] w-[calc(100vw-3rem)] max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl bg-ink-950/95 border border-emerald-500/50 p-4 sm:p-5 shadow-2xl shadow-emerald-950/80 backdrop-blur-xl ring-1 ring-emerald-500/30">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header / Dismiss */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Incoming Google Meet Call
                </span>
              </div>
              <button
                onClick={() => dismissCall(incomingCall.messageId)}
                className="text-sand-400 hover:text-sand-100 p-1 rounded-lg hover:bg-ink-800 transition"
                title="Dismiss call alert"
              >
                <X size={16} />
              </button>
            </div>

            {/* Caller details */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 shrink-0 rounded-full bg-ink-800 border border-emerald-500/30 overflow-hidden">
                <Image
                  src={incomingCall.sender.avatarUrl || "https://picsum.photos/seed/avatar/200/200"}
                  alt={incomingCall.sender.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-sand-100 truncate">
                  {incomingCall.sender.name}
                </h4>
                <p className="text-xs text-emerald-400/90 truncate">
                  {incomingCall.startupName || "Founders Hook"}
                </p>
                <p className="text-[11px] text-sand-400 truncate">
                  is inviting you to join a live video call
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => dismissCall(incomingCall.messageId)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-ink-700 bg-ink-900/60 hover:bg-ink-800 text-xs font-semibold text-sand-300 hover:text-sand-100 transition"
              >
                Dismiss
              </button>
              <button
                onClick={handleJoinCall}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-ink-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition transform active:scale-95 cursor-pointer"
              >
                <Video size={15} className="fill-ink-950" />
                <span>Join Call</span>
                <ExternalLink size={12} className="opacity-70" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
