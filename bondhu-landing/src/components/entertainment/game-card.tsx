"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Play, Clock, Star, Users, Trophy } from "lucide-react";

export interface GameData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  duration: string;
  insights: string[];
  popularity?: number;
  recentPlays?: number;
  bestScore?: number;
  completions?: number;
  featured?: boolean;
}

interface GameCardProps {
  game: GameData;
  onPlay: (gameId: string) => void;
  isRecommended?: boolean;
  stats?: {
    completions?: number;
    bestScore?: number;
    averageScore?: number;
  };
  className?: string;
  variant?: "default" | "compact" | "featured";
}

const difficultyConfig = {
  easy: {
    label: "Easy",
    color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    stars: 1,
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    stars: 2,
  },
  hard: {
    label: "Hard",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    stars: 3,
  },
};

const categoryGradients: Record<string, string> = {
  puzzle: "from-purple-500/20 via-violet-500/10 to-indigo-500/20",
  strategy: "from-blue-500/20 via-cyan-500/10 to-teal-500/20",
  creative: "from-pink-500/20 via-rose-500/10 to-orange-500/20",
  memory: "from-green-500/20 via-emerald-500/10 to-teal-500/20",
  rpg: "from-amber-500/20 via-orange-500/15 to-red-500/20",
  default: "from-gray-500/20 via-slate-500/10 to-zinc-500/20",
};

export function GameCard({
  game,
  onPlay,
  isRecommended = false,
  stats,
  className,
  variant = "default",
}: GameCardProps) {
  const difficulty = difficultyConfig[game.difficulty];
  const gradient = categoryGradients[game.category.toLowerCase()] || categoryGradients.default;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "relative group flex items-center gap-3 p-3 rounded-xl",
          "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
          "border border-white/20 dark:border-white/10",
          "hover:shadow-lg hover:scale-[1.02] transition-all duration-300",
          "cursor-pointer",
          className
        )}
        onClick={() => onPlay(game.id)}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
            "bg-gradient-to-br",
            gradient
          )}
        >
          {game.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{game.name}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{game.duration}</span>
            <span>•</span>
            <span className={difficulty.color}>{difficulty.label}</span>
          </div>
        </div>
        <Play className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "bg-gradient-to-br",
          gradient,
          "border border-white/20 dark:border-white/10",
          "shadow-xl",
          className
        )}
      >
        <GlowingEffect disabled={false} proximity={150} spread={40} blur={2} />
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl">
              {game.icon}
            </div>
            {isRecommended && (
              <Badge className="bg-yellow-500 text-yellow-950 border-yellow-400">
                <Star className="w-3 h-3 mr-1 fill-current" />
                For You
              </Badge>
            )}
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
          <p className="text-muted-foreground mb-4 line-clamp-2">{game.description}</p>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline" className={difficulty.color}>
              {Array.from({ length: difficulty.stars }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
              <span className="ml-1">{difficulty.label}</span>
            </Badge>
            <Badge variant="outline" className="bg-white/10 border-white/20">
              <Clock className="w-3 h-3 mr-1" />
              {game.duration}
            </Badge>
            {game.recentPlays && (
              <Badge variant="outline" className="bg-white/10 border-white/20">
                <Users className="w-3 h-3 mr-1" />
                {game.recentPlays} playing
              </Badge>
            )}
          </div>

          {/* Stats if available */}
          {stats && stats.completions && stats.completions > 0 && (
            <div className="flex items-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Best: {stats.bestScore}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Played {stats.completions}x</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={() => onPlay(game.id)}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white border border-white/20"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            {stats?.completions ? "Play Again" : "Play Now"}
          </Button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-2xl",
        "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
        "border border-white/20 dark:border-white/10",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        "hover:scale-[1.02]",
        isRecommended && "ring-2 ring-green-500/50",
        className
      )}
    >
      <GlowingEffect disabled={false} proximity={120} spread={35} blur={1.5} />

      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-green-500 text-white border-green-400">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Recommended
          </Badge>
        </div>
      )}

      {/* Icon area with gradient */}
      <div
        className={cn(
          "relative h-32 flex items-center justify-center",
          "bg-gradient-to-br",
          gradient
        )}
      >
        <span className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
          {game.icon}
        </span>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float" />
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-float" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white/25 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-lg mb-1">{game.name}</h4>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {game.description}
        </p>

        {/* Insights tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {game.insights.slice(0, 2).map((insight) => (
            <Badge
              key={insight}
              variant="secondary"
              className="text-xs bg-muted/50"
            >
              {insight}
            </Badge>
          ))}
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {game.duration}
            </span>
            <Badge variant="outline" className={cn("text-[10px] py-0", difficulty.color)}>
              {difficulty.label}
            </Badge>
          </div>
          {game.popularity && (
            <span className="flex items-center gap-1">
              ❤️ {game.popularity}%
            </span>
          )}
        </div>

        {/* Stats row if available */}
        {stats && stats.completions && stats.completions > 0 && (
          <div className="flex items-center gap-2 text-xs mb-3 p-2 bg-muted/30 rounded-lg">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span>Best: {stats.bestScore}%</span>
            <span className="text-muted-foreground">• Avg: {Math.round(stats.averageScore || 0)}%</span>
          </div>
        )}

        {/* Play button */}
        <Button
          onClick={() => onPlay(game.id)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          {stats?.completions ? "Play Again" : "Play"}
        </Button>
      </div>
    </div>
  );
}

// Horizontal scroll container for game cards
interface GameCarouselProps {
  games: GameData[];
  onPlay: (gameId: string) => void;
  gameStats?: Record<string, { completions?: number; bestScore?: number; averageScore?: number }>;
  recommendations?: string[];
  title?: string;
  className?: string;
}

export function GameCarousel({
  games,
  onPlay,
  gameStats = {},
  recommendations = [],
  title,
  className,
}: GameCarouselProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">
            {games.length} games
          </span>
        </div>
      )}
      
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {games.map((game) => (
          <div key={game.id} className="flex-shrink-0 w-[280px] snap-start">
            <GameCard
              game={game}
              onPlay={onPlay}
              isRecommended={recommendations.includes(game.id)}
              stats={gameStats[game.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
