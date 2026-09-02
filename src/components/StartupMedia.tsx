"use client";

import React, { useState } from "react";
// No longer importing default banner/icon logic, since we are using picsum fallbacks

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
    !imageError;

  const seed = id || name || "startup";
  const finalImage = hasValidImage ? coverImage : `https://picsum.photos/seed/${seed}/800/500`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalImage}
      alt={alt || name || "Startup Banner"}
      className={className}
      onError={() => {
        if (hasValidImage) {
          setImageError(true);
        }
      }}
    />
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

  const hasValidImage = isHttpUrl && !imageError;
  const seed = id || name || "startup";
  const finalImage = hasValidImage ? cleanIcon : `https://picsum.photos/seed/${seed}-logo/200/200`;

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.lg;

  return (
    <span
      className={`flex items-center justify-center shrink-0 overflow-hidden border border-ink-700/60 bg-ink-800 shadow-card ${sizeClass} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalImage}
        alt={alt || name || "Startup Logo"}
        className="h-full w-full object-cover"
        onError={() => {
          if (hasValidImage) {
            setImageError(true);
          }
        }}
      />
    </span>
  );
}
