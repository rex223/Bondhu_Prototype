"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  color?: "green" | "blue" | "purple" | "pink" | "orange";
  delay?: number;
  className?: string;
}

const colorVariants = {
  green: "from-green-500 to-emerald-600 text-green-600 dark:text-green-400",
  blue: "from-blue-500 to-cyan-600 text-blue-600 dark:text-blue-400",
  purple: "from-purple-500 to-pink-600 text-purple-600 dark:text-purple-400",
  pink: "from-pink-500 to-rose-600 text-pink-600 dark:text-pink-400",
  orange: "from-orange-500 to-amber-600 text-orange-600 dark:text-orange-400",
};

const bgVariants = {
  green: "bg-green-500/10 dark:bg-green-500/20",
  blue: "bg-blue-500/10 dark:bg-blue-500/20",
  purple: "bg-purple-500/10 dark:bg-purple-500/20",
  pink: "bg-pink-500/10 dark:bg-pink-500/20",
  orange: "bg-orange-500/10 dark:bg-orange-500/20",
};

export function StatCounter({
  value,
  label,
  icon,
  suffix = "",
  color = "green",
  delay = 0,
  className,
}: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          
          // Delay start of animation
          setTimeout(() => {
            const duration = 1500;
            const steps = 30;
            const stepValue = value / steps;
            const stepDuration = duration / steps;
            
            let current = 0;
            const interval = setInterval(() => {
              current += stepValue;
              if (current >= value) {
                setDisplayValue(value);
                clearInterval(interval);
              } else {
                setDisplayValue(Math.floor(current));
              }
            }, stepDuration);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, delay, hasAnimated]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl",
        "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
        "border border-white/20 dark:border-white/10",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        "transition-all duration-300 hover:scale-105 hover:shadow-xl",
        "group cursor-default",
        className
      )}
    >
      {/* Icon container with gradient background */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-2",
          "transition-transform duration-300 group-hover:scale-110",
          bgVariants[color]
        )}
      >
        <div className={cn("w-5 h-5", colorVariants[color].split(" ").slice(2).join(" "))}>
          {icon}
        </div>
      </div>

      {/* Animated number */}
      <div
        className={cn(
          "text-2xl font-bold tabular-nums",
          colorVariants[color].split(" ").slice(2).join(" ")
        )}
      >
        {displayValue}
        {suffix}
      </div>

      {/* Label */}
      <div className="text-xs text-muted-foreground font-medium mt-0.5">
        {label}
      </div>

      {/* Subtle glow on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300 pointer-events-none",
          `bg-gradient-to-br ${colorVariants[color].split(" ").slice(0, 2).join(" ")} blur-xl`
        )}
        style={{ transform: "scale(0.8)", opacity: 0.15 }}
      />
    </div>
  );
}

// Stats row component for displaying multiple stats
interface StatsRowProps {
  stats: {
    value: number;
    label: string;
    icon: React.ReactNode;
    suffix?: string;
    color?: "green" | "blue" | "purple" | "pink" | "orange";
  }[];
  className?: string;
}

export function StatsRow({ stats, className }: StatsRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-4 gap-3",
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatCounter
          key={stat.label}
          {...stat}
          delay={index * 100}
        />
      ))}
    </div>
  );
}
