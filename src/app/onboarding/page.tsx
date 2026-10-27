"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profilePic, setProfilePic] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          if (params.get("phase") === "startup") {
            router.replace("/feed");
            return;
          }
        }

        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData?.user) {
            setCurrentUser(userData.user);
            if (userData.user.avatarUrl) setProfilePic(userData.user.avatarUrl);
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch {
        setProfileError("Failed to load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function handleProfileSubmit() {
    setProfileSaving(true);
    setProfileError("");
    try {
      if (profilePic) {
        const res = await fetch("/api/profile/bio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser?.id || currentUser?._id,
            profilePic: profilePic || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setProfileError(data.error || "Failed to save profile picture.");
          setProfileSaving(false);
          return;
        }
      }

      router.push("/onboarding/chat");
    } catch {
      setProfileError("Network error. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-radial">
        <div className="flex items-center gap-3 text-mist-400 text-sm">
          <Loader2 size={18} className="animate-spin text-white" />
          <span>Setting up your profile...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-ink-radial px-4 sm:px-6 py-12">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-white/5 blur-[110px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-ink-900/80 p-6 sm:p-8 shadow-card backdrop-blur-xl">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-sand-100 tracking-tight">
              Welcome{currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="mt-1.5 text-xs text-mist-400">
              Add a photo so other founders and builders can recognize you.
            </p>
          </div>

          {/* 1. Add Photo in the middle */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative">
              <CldUploadWidget
                uploadPreset="founders_hook_users"
                options={{
                  folder: "users-profile-pic",
                  cropping: true,
                  croppingAspectRatio: 1,
                  showSkipCropButton: false,
                  multiple: false,
                  maxFiles: 1,
                  clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
                }}
                onSuccess={(res) => {
                  if (res.info && typeof res.info === "object") {
                    const url = (res.info as Record<string, string>).secure_url;
                    if (url) setProfilePic(url);
                  }
                }}
              >
                {({ open }) => (
                  <div
                    onClick={() => open()}
                    className="group relative h-24 w-24 sm:h-28 sm:w-28 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-white/25 hover:border-white/60 bg-white/5 transition-all hover:scale-105 shadow-md flex items-center justify-center"
                    title="Upload Profile Picture"
                  >
                    {profilePic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profilePic}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-sand-400">
                        <Camera size={24} className="text-sand-400 mb-1 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-semibold tracking-wider text-sand-400 group-hover:text-white uppercase">
                          Add Photo
                        </span>
                      </div>
                    )}

                    {/* Hover Camera Overlay if pic exists */}
                    {profilePic && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 text-white">
                        <Camera size={18} className="mb-0.5" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider">Change</span>
                      </div>
                    )}
                  </div>
                )}
              </CldUploadWidget>

              {profilePic && (
                <button
                  type="button"
                  onClick={() => setProfilePic("")}
                  className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors shadow-sm"
                  title="Remove Photo"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          </div>

          {profileError && (
            <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {profileError}
            </p>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleProfileSubmit}
            disabled={profileSaving}
            className="btn-gold w-full !py-3 !px-6 text-sm font-semibold rounded-full shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {profileSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving photo...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Continue to AI Profile Builder</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}