"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Play,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Share2,
  Brain,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export interface VideoData {
  id: string;
  title: string;
  description: string;
  channel_title: string;
  duration_formatted: string;
  duration_seconds: number;
  view_count: number;
  thumbnail_url: string;
  youtube_url: string;
  category_name: string;
  content_themes: string[];
  personality_score: number;
  combined_score: number;
  source: "personalized" | "trending";
}

interface VideoCardProps {
  video: VideoData;
  onWatch: (video: VideoData) => void;
  onLike?: (video: VideoData) => void;
  onDislike?: (video: VideoData) => void;
  onShare?: (video: VideoData) => void;
  isLiked?: boolean | null;
  className?: string;
  variant?: "default" | "compact" | "featured";
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
}

export function VideoCard({
  video,
  onWatch,
  onLike,
  onDislike,
  onShare,
  isLiked,
  className,
  variant = "default",
}: VideoCardProps) {
  const matchPercentage = Math.round(video.combined_score * 100);

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "relative group flex gap-3 p-3 rounded-xl cursor-pointer",
          "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
          "border border-white/20 dark:border-white/10",
          "hover:shadow-lg hover:scale-[1.01] transition-all duration-300",
          className
        )}
        onClick={() => onWatch(video)}
      >
        {/* Thumbnail */}
        <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title}
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">
              🎬
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
            {video.duration_formatted}
          </div>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
          <p className="text-xs text-muted-foreground mb-1">
            {video.channel_title} • {formatViewCount(video.view_count)} views
          </p>
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">{matchPercentage}% match</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "bg-gradient-to-br from-blue-500/10 to-cyan-500/5",
          "border border-white/20 dark:border-white/10",
          "shadow-xl",
          className
        )}
      >
        <GlowingEffect disabled={false} proximity={150} spread={40} blur={2} />

        {/* Large Thumbnail */}
        <div className="relative aspect-video">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-6xl">
              🎬
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Play Button */}
          <button
            onClick={() => onWatch(video)}
            className="absolute inset-0 flex items-center justify-center group/play"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform group-hover/play:scale-110 transition-transform shadow-lg">
              <Play className="w-8 h-8 text-black fill-black ml-1" />
            </div>
          </button>

          {/* Duration badge */}
          <div className="absolute top-4 right-4 bg-black/80 text-white text-sm px-2 py-1 rounded-lg">
            {video.duration_formatted}
          </div>

          {/* Source badge */}
          <Badge
            className={cn(
              "absolute top-4 left-4",
              video.source === "personalized"
                ? "bg-primary text-primary-foreground"
                : "bg-orange-500 text-white"
            )}
          >
            {video.source === "personalized" ? (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                For You
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </>
            )}
          </Badge>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-xl font-bold mb-1 line-clamp-2">
              {video.title}
            </h3>
            <p className="text-white/80 text-sm">
              {video.channel_title} • {formatViewCount(video.view_count)} views
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Match score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-primary" />
                <span className="font-medium">Personality Match</span>
              </div>
              <span className="text-primary font-bold">{matchPercentage}%</span>
            </div>
            <Progress value={matchPercentage} className="h-2" />
          </div>

          {/* Themes */}
          {video.content_themes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.content_themes.slice(0, 4).map((theme) => (
                <Badge key={theme} variant="secondary" className="text-xs">
                  {theme.replace("_", " ")}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked === true ? "default" : "outline"}
                size="sm"
                onClick={() => onLike?.(video)}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Like
              </Button>
              <Button
                variant={isLiked === false ? "destructive" : "outline"}
                size="sm"
                onClick={() => onDislike?.(video)}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onShare?.(video)}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(video.youtube_url, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
        className
      )}
    >
      <GlowingEffect disabled={false} proximity={120} spread={35} blur={1.5} />

      {/* Thumbnail */}
      <div className="relative aspect-video">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-5xl">
            🎬
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onWatch(video)}
            className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center transform hover:scale-110 transition-transform shadow-lg"
          >
            <Play className="w-7 h-7 text-black fill-black ml-1" />
          </button>
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration_formatted}
        </div>

        {/* Source badge */}
        <Badge
          className={cn(
            "absolute top-2 left-2",
            video.source === "personalized"
              ? "bg-primary text-primary-foreground"
              : "bg-orange-500 text-white"
          )}
        >
          {video.source === "personalized" ? (
            <Sparkles className="w-3 h-3 mr-1" />
          ) : (
            <TrendingUp className="w-3 h-3 mr-1" />
          )}
          {video.source === "personalized" ? "For You" : "Trending"}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-base mb-1 line-clamp-2">{video.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">
          {video.channel_title} • {formatViewCount(video.view_count)} views
        </p>

        {/* Match indicator */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Brain className="w-3 h-3" />
              Personality Match
            </span>
            <span className="text-primary font-semibold">{matchPercentage}%</span>
          </div>
          <Progress value={matchPercentage} className="h-1.5" />
        </div>

        {/* Themes */}
        {video.content_themes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {video.content_themes.slice(0, 2).map((theme) => (
              <Badge key={theme} variant="secondary" className="text-[10px]">
                {theme.replace("_", " ")}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant={isLiked === true ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => onLike?.(video)}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              variant={isLiked === false ? "destructive" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => onDislike?.(video)}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => window.open(video.youtube_url, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Watch
          </Button>
        </div>
      </div>
    </div>
  );
}

// Video carousel component
interface VideoCarouselProps {
  videos: VideoData[];
  title: string;
  subtitle?: string;
  matchScore?: number;
  onWatch: (video: VideoData) => void;
  onLike?: (video: VideoData) => void;
  onDislike?: (video: VideoData) => void;
  onSeeAll?: () => void;
  className?: string;
}

export function VideoCarousel({
  videos,
  title,
  subtitle,
  matchScore,
  onWatch,
  onLike,
  onDislike,
  onSeeAll,
  className,
}: VideoCarouselProps) {
  if (videos.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
            {matchScore && (
              <Badge variant="secondary" className="text-xs">
                {matchScore}% match
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {onSeeAll && (
          <Button variant="ghost" size="sm" onClick={onSeeAll}>
            See All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-[300px] sm:w-[320px] snap-start">
            <VideoCard
              video={video}
              onWatch={onWatch}
              onLike={onLike}
              onDislike={onDislike}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton loader for video cards
export function VideoCardSkeleton({ variant = "default" }: { variant?: "default" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="flex gap-3 p-3 rounded-xl bg-muted/30 animate-pulse">
        <div className="w-32 h-20 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-muted/30 overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-2 bg-muted rounded w-full" />
        <div className="flex gap-2">
          <div className="h-8 bg-muted rounded w-16" />
          <div className="h-8 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  );
}
