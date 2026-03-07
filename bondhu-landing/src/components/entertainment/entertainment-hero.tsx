"use client";

import { cn } from "@/lib/utils";
import { StatsRow } from "./stat-counter";
import { Gamepad2, Video, Music, Flame } from "lucide-react";

interface EntertainmentHeroProps {
  userName?: string;
  stats: {
    gamesPlayed: number;
    videosWatched: number;
    musicListened: number;
    streak: number;
  };
  activeSection?: "games" | "videos" | "music";
  className?: string;
}

export function EntertainmentHero({
  userName,
  stats,
  activeSection = "games",
  className,
}: EntertainmentHeroProps) {
  // Dynamic gradient based on active section
  const sectionGradients = {
    games: "from-green-500/20 via-emerald-500/10 to-teal-500/5",
    videos: "from-blue-500/20 via-cyan-500/10 to-sky-500/5",
    music: "from-purple-500/20 via-pink-500/10 to-rose-500/5",
  };

  const statItems = [
    {
      value: stats.gamesPlayed,
      label: "Games",
      icon: <Gamepad2 className="w-full h-full" />,
      color: "green" as const,
    },
    {
      value: stats.videosWatched,
      label: "Videos",
      icon: <Video className="w-full h-full" />,
      color: "blue" as const,
    },
    {
      value: stats.musicListened,
      label: "Minutes",
      suffix: "m",
      icon: <Music className="w-full h-full" />,
      color: "purple" as const,
    },
    {
      value: stats.streak,
      label: "Streak",
      icon: <Flame className="w-full h-full" />,
      color: "orange" as const,
    },
  ];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br",
        sectionGradients[activeSection],
        "border border-white/20 dark:border-white/10",
        "transition-all duration-500",
        className
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div
          className={cn(
            "absolute w-64 h-64 rounded-full blur-3xl opacity-30",
            "bg-gradient-to-br from-primary/50 to-transparent",
            "-top-32 -right-32 animate-float"
          )}
        />
        <div
          className={cn(
            "absolute w-48 h-48 rounded-full blur-3xl opacity-20",
            "bg-gradient-to-br from-primary/30 to-transparent",
            "bottom-0 left-1/4 animate-float"
          )}
          style={{ animationDelay: "1s" }}
        />
        
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Entertainment Hub
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {userName
              ? `Welcome back, ${userName}! Explore personalized content.`
              : "Discover games, videos, and music tailored for you"}
          </p>
        </div>

        {/* Stats Row */}
        <StatsRow stats={statItems} />
      </div>
    </div>
  );
}

// Compact version for mobile or when scrolled
export function EntertainmentHeroCompact({
  stats,
  className,
}: Pick<EntertainmentHeroProps, "stats" | "className">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3",
        "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
        "border-b border-white/20 dark:border-white/10",
        className
      )}
    >
      <h2 className="font-semibold text-lg">Entertainment</h2>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
          <Gamepad2 className="w-4 h-4" />
          <span className="font-medium">{stats.gamesPlayed}</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Video className="w-4 h-4" />
          <span className="font-medium">{stats.videosWatched}</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
          <Music className="w-4 h-4" />
          <span className="font-medium">{stats.musicListened}m</span>
        </div>
        <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="font-medium">{stats.streak}</span>
        </div>
      </div>
    </div>
  );
}
