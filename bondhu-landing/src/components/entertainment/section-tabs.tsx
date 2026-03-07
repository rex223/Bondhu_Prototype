"use client";

import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Badge } from "@/components/ui/badge";

export type SectionType = "games" | "videos" | "music";

interface SectionTab {
  id: SectionType;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  color: "green" | "blue" | "purple";
}

interface SectionTabsProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  tabs: SectionTab[];
  className?: string;
}

const colorConfig = {
  green: {
    active: "bg-gradient-to-br from-green-500 to-emerald-600",
    activeBorder: "border-green-400/50",
    activeShadow: "shadow-green-500/30",
    activeText: "text-white",
    hoverBg: "hover:bg-green-500/10",
    hoverBorder: "hover:border-green-400/30",
    iconColor: "text-green-600 dark:text-green-400",
    badgeBg: "bg-green-500",
  },
  blue: {
    active: "bg-gradient-to-br from-blue-500 to-cyan-600",
    activeBorder: "border-blue-400/50",
    activeShadow: "shadow-blue-500/30",
    activeText: "text-white",
    hoverBg: "hover:bg-blue-500/10",
    hoverBorder: "hover:border-blue-400/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500",
  },
  purple: {
    active: "bg-gradient-to-br from-purple-500 to-pink-600",
    activeBorder: "border-purple-400/50",
    activeShadow: "shadow-purple-500/30",
    activeText: "text-white",
    hoverBg: "hover:bg-purple-500/10",
    hoverBorder: "hover:border-purple-400/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-500",
  },
};

export function SectionTabs({
  activeSection,
  onSectionChange,
  tabs,
  className,
}: SectionTabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 p-1.5",
        "bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl",
        "border border-white/20 dark:border-white/10",
        "overflow-x-auto scrollbar-hide",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeSection === tab.id;
        const colors = colorConfig[tab.color];

        return (
          <button
            key={tab.id}
            onClick={() => onSectionChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl",
              "font-medium text-sm sm:text-base whitespace-nowrap",
              "transition-all duration-300 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              isActive
                ? cn(
                    colors.active,
                    colors.activeText,
                    colors.activeBorder,
                    "border",
                    "shadow-lg",
                    colors.activeShadow,
                    "scale-[1.02]"
                  )
                : cn(
                    "bg-transparent",
                    "border border-transparent",
                    colors.hoverBg,
                    colors.hoverBorder,
                    "text-muted-foreground hover:text-foreground"
                  )
            )}
          >
            {/* Glowing effect for active tab */}
            {isActive && (
              <GlowingEffect
                disabled={false}
                proximity={100}
                spread={30}
                blur={1}
                borderWidth={1}
              />
            )}

            {/* Icon */}
            <span
              className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform duration-300",
                isActive ? "text-white scale-110" : colors.iconColor
              )}
            >
              {tab.icon}
            </span>

            {/* Label */}
            <span className="hidden sm:inline">{tab.label}</span>

            {/* Badge for new items */}
            {tab.badge && tab.badge > 0 && (
              <Badge
                className={cn(
                  "ml-1 h-5 min-w-[20px] px-1.5 text-[10px] font-bold",
                  isActive
                    ? "bg-white/20 text-white border-white/30"
                    : cn(colors.badgeBg, "text-white border-transparent")
                )}
              >
                {tab.badge > 9 ? "9+" : tab.badge}
              </Badge>
            )}

            {/* Active indicator dot for mobile */}
            {isActive && (
              <span
                className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2",
                  "w-1.5 h-1.5 rounded-full bg-white",
                  "sm:hidden"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Compact version for mobile
export function SectionTabsCompact({
  activeSection,
  onSectionChange,
  tabs,
  className,
}: SectionTabsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 p-1",
        "bg-muted/50 backdrop-blur-sm rounded-full",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeSection === tab.id;
        const colors = colorConfig[tab.color];

        return (
          <button
            key={tab.id}
            onClick={() => onSectionChange(tab.id)}
            className={cn(
              "relative flex items-center justify-center p-2.5 rounded-full",
              "transition-all duration-300",
              isActive
                ? cn(colors.active, "text-white shadow-md", colors.activeShadow)
                : cn("text-muted-foreground", colors.hoverBg)
            )}
            aria-label={tab.label}
          >
            <span className="w-5 h-5">{tab.icon}</span>
            
            {/* Badge */}
            {tab.badge && tab.badge > 0 && (
              <span
                className={cn(
                  "absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full",
                  "flex items-center justify-center",
                  "text-[9px] font-bold text-white",
                  colors.badgeBg
                )}
              >
                {tab.badge > 9 ? "+" : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
