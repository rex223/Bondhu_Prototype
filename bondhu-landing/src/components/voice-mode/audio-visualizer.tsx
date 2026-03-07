"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  isActive: boolean;
  audioLevel?: number; // 0-1
  className?: string;
  variant?: "bars" | "wave" | "circle";
}

/**
 * AudioVisualizer - Shows audio activity during voice mode
 */
export function AudioVisualizer({
  isActive,
  audioLevel = 0,
  className,
  variant = "bars",
}: AudioVisualizerProps) {
  const barsCount = 5;

  if (variant === "bars") {
    return (
      <div className={cn("flex items-end justify-center gap-1 h-8", className)}>
        {Array.from({ length: barsCount }).map((_, i) => {
          // Create varying heights based on position and audio level
          const baseHeight = 0.3 + Math.sin((i / barsCount) * Math.PI) * 0.4;
          const height = isActive
            ? baseHeight + audioLevel * (0.7 - baseHeight)
            : 0.2;

          return (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-100",
                isActive ? "bg-primary" : "bg-muted-foreground/30"
              )}
              style={{
                height: `${height * 100}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={cn("flex items-center justify-center gap-0.5 h-8", className)}>
        {Array.from({ length: 12 }).map((_, i) => {
          const delay = i * 0.08;
          return (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all",
                isActive
                  ? "bg-primary animate-sound-wave"
                  : "bg-muted-foreground/30 h-1"
              )}
              style={{
                height: isActive ? `${20 + audioLevel * 60}%` : "4px",
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    );
  }

  // Circle variant
  return (
    <div className={cn("relative w-16 h-16", className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 transition-all duration-200",
          isActive ? "border-primary" : "border-muted-foreground/30"
        )}
        style={{
          transform: `scale(${1 + audioLevel * 0.3})`,
        }}
      />
      <div
        className={cn(
          "absolute inset-2 rounded-full border transition-all duration-150",
          isActive ? "border-primary/60" : "border-muted-foreground/20"
        )}
        style={{
          transform: `scale(${1 + audioLevel * 0.2})`,
        }}
      />
      <div
        className={cn(
          "absolute inset-4 rounded-full transition-all duration-100",
          isActive ? "bg-primary/20" : "bg-muted-foreground/10"
        )}
        style={{
          transform: `scale(${1 + audioLevel * 0.1})`,
        }}
      />
    </div>
  );
}

/**
 * VoiceActivityIndicator - Simple dot indicator for voice activity
 */
export function VoiceActivityIndicator({
  isActive,
  isSpeaking,
  className,
}: {
  isActive: boolean;
  isSpeaking: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-all duration-200",
          isActive
            ? isSpeaking
              ? "bg-primary animate-pulse"
              : "bg-emerald-500"
            : "bg-muted-foreground/30"
        )}
      />
      <span className="text-xs text-muted-foreground">
        {isActive ? (isSpeaking ? "Speaking..." : "Listening") : "Inactive"}
      </span>
    </div>
  );
}

