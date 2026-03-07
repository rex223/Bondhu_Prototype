"use client";

import { cn } from "@/lib/utils";
import type { BlobEmotion } from "./bondhu-blob";

interface ChatAvatarProps {
  emotion?: BlobEmotion;
  size?: "xs" | "sm" | "md";
  className?: string;
}

// Subtle color mapping for each emotion
const emotionColors: Record<BlobEmotion, { bg: string; ring: string }> = {
  happy: { bg: "bg-amber-400", ring: "ring-amber-400/30" },
  sad: { bg: "bg-blue-400", ring: "ring-blue-400/30" },
  angry: { bg: "bg-red-400", ring: "ring-red-400/30" },
  excited: { bg: "bg-pink-400", ring: "ring-pink-400/30" },
  confused: { bg: "bg-purple-400", ring: "ring-purple-400/30" },
  sleepy: { bg: "bg-indigo-400", ring: "ring-indigo-400/30" },
  focused: { bg: "bg-cyan-400", ring: "ring-cyan-400/30" },
  smart: { bg: "bg-orange-400", ring: "ring-orange-400/30" },
  neutral: { bg: "bg-emerald-400", ring: "ring-emerald-400/30" },
};

const sizeConfig = {
  xs: "w-2 h-2",
  sm: "w-3 h-3",
  md: "w-4 h-4",
};

/**
 * ChatAvatar - A subtle, minimal indicator for Bondhu in chat messages.
 * Uses a small colored dot with emotion-based colors.
 */
export function ChatAvatar({
  emotion = "neutral",
  size = "sm",
  className,
}: ChatAvatarProps) {
  const colors = emotionColors[emotion];
  const sizeClass = sizeConfig[size];

  return (
    <div
      className={cn(
        "relative rounded-full",
        sizeClass,
        colors.bg,
        "ring-2",
        colors.ring,
        "transition-all duration-300",
        "animate-pulse-subtle",
        className
      )}
      aria-label={`Bondhu - ${emotion}`}
    >
      {/* Inner glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          colors.bg,
          "opacity-50 blur-[2px]"
        )}
      />
    </div>
  );
}

/**
 * BondhuBadge - Alternative avatar showing "B" letter with gradient
 * Use this if you want a more recognizable indicator
 */
export function BondhuBadge({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeStyles = {
    sm: "w-5 h-5 text-[8px]",
    md: "w-6 h-6 text-[10px]",
    lg: "w-8 h-8 text-xs",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-cyan-400 to-purple-500",
        "text-white font-bold",
        "shadow-sm",
        sizeStyles[size],
        className
      )}
    >
      B
    </div>
  );
}

/**
 * MiniBlob - A tiny version of the blob without face
 * For when you want more visual connection to the main blob
 */
export function MiniBlob({
  emotion = "neutral",
  className,
}: {
  emotion?: BlobEmotion;
  className?: string;
}) {
  const gradients: Record<BlobEmotion, string> = {
    happy: "from-amber-300 to-orange-400",
    sad: "from-sky-300 to-violet-400",
    angry: "from-red-400 to-orange-500",
    excited: "from-pink-400 to-yellow-400",
    confused: "from-violet-400 to-cyan-400",
    sleepy: "from-indigo-400 to-purple-500",
    focused: "from-cyan-400 to-violet-400",
    smart: "from-amber-400 to-red-500",
    neutral: "from-cyan-400 to-violet-400",
  };

  return (
    <div
      className={cn(
        "relative w-5 h-5",
        className
      )}
    >
      {/* Outer glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br",
          gradients[emotion],
          "opacity-40 blur-[4px] scale-125"
        )}
      />
      {/* Main blob */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br",
          gradients[emotion],
          "animate-blob-mini"
        )}
        style={{
          borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
        }}
      />
    </div>
  );
}

