"use client";

import React, { useState } from "react";
import {
  getDefaultStartupIcon,
  getDefaultStartupBanner,
  BannerPreset,
} from "@/lib/startupDefaults";

interface StartupBannerProps {
  coverImage?: string | null;
  name?: string;
  category?: string;
  id?: string;
  className?: string;
  alt?: string;
}

export function StartupBanner({
  coverImage,
  name,
  category,
  id,
  className = "h-full w-full object-cover",
  alt = "",
}: StartupBannerProps) {
  const [imageError, setImageError] = useState(false);

  // Check if valid image URL is supplied
  const hasValidImage =
    coverImage &&
    typeof coverImage === "string" &&
    coverImage.trim() !== "" &&
    !coverImage.includes("seed/startup/800/500") && // avoid default picsum if broken
    !imageError;

  if (hasValidImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverImage}
        alt={alt || name || "Startup Banner"}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  }

  const preset: BannerPreset = getDefaultStartupBanner(name, category, id);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{
        background: preset.bgGradient,
      }}
    >
      {/* Dynamic Background Pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-30 mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 400 150"
      >
        <defs>
          <pattern
            id={`grid-${preset.id}`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={preset.accentColor}
              strokeWidth="0.5"
              strokeOpacity="0.6"
            />
          </pattern>
          <radialGradient
            id={`glow-${preset.id}`}
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={preset.accentColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={preset.accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill={`url(#grid-${preset.id})`} />
        <circle cx="80%" cy="30%" r="90" fill={`url(#glow-${preset.id})`} />
        <circle cx="20%" cy="80%" r="70" fill={`url(#glow-${preset.id})`} />
      </svg>

      {/* Modern abstract geometric lines */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full blur-2xl opacity-40" style={{ backgroundColor: preset.accentColor }} />
      <div className="absolute left-6 -top-6 w-24 h-24 rounded-full blur-xl opacity-30" style={{ backgroundColor: preset.accentColor }} />

      {/* Subtle Startup Name / Category Watermark */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {name && (
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 drop-shadow-sm">
            {category || "Startup"}
          </span>
        )}
      </div>
    </div>
  );
}

interface StartupLogoProps {
  icon?: string | null;
  name?: string;
  category?: string;
  id?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alt?: string;
}

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-xs rounded-md",
  sm: "h-8 w-8 text-sm rounded-lg",
  md: "h-10 w-10 text-base rounded-xl",
  lg: "h-12 w-12 text-xl rounded-lg sm:rounded-xl",
  xl: "h-14 w-14 text-3xl rounded-2xl",
  "2xl": "h-20 w-20 text-4xl rounded-2xl",
};

export function StartupLogo({
  icon,
  name,
  category,
  id,
  size = "lg",
  className = "",
  alt = "",
}: StartupLogoProps) {
  const [imageError, setImageError] = useState(false);

  const cleanIcon = typeof icon === "string" ? icon.trim() : "";
  const isHttpUrl =
    cleanIcon.startsWith("http://") ||
    cleanIcon.startsWith("https://") ||
    cleanIcon.startsWith("/");

  // Determine fallback emoji icon if not a valid URL or image failed
  const fallbackIcon =
    !isHttpUrl && cleanIcon !== ""
      ? cleanIcon
      : getDefaultStartupIcon(name, category, id);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.lg;

  if (isHttpUrl && !imageError) {
    return (
      <span
        className={`flex items-center justify-center shrink-0 overflow-hidden border border-ink-700/60 bg-ink-800 shadow-card ${sizeClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cleanIcon}
          alt={alt || name || "Startup Logo"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`flex items-center justify-center shrink-0 border border-ink-700/60 bg-gradient-to-br from-ink-800 to-ink-900 select-none shadow-card ${sizeClass} ${className}`}
      title={name || "Startup"}
    >
      <span className="leading-none transition-transform hover:scale-110 duration-200">
        {fallbackIcon}
      </span>
    </span>
  );
}
