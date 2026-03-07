"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Play, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Play,
    href: "/entertainment",
  },
  {
    id: "progress",
    label: "Progress",
    icon: TrendingUp,
    href: "/progress",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    href: "/profile",
  },
];

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (item: NavItem) => {
    router.push(item.href);
  };

  const isActive = (item: NavItem) => {
    if (item.id === "home") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/80 backdrop-blur-xl border-t border-border/50",
        "safe-area-inset-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "transition-all duration-200 ease-out",
                "relative group",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}

              {/* Icon container */}
              <div
                className={cn(
                  "relative flex items-center justify-center",
                  "w-10 h-10 rounded-xl",
                  "transition-all duration-200",
                  active
                    ? "bg-primary/10"
                    : "group-hover:bg-muted group-active:scale-95"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    active && "scale-110"
                  )}
                />

                {/* Ripple effect on tap */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-primary/20 scale-0 group-active:scale-100 rounded-xl transition-transform duration-300" />
                </div>
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium mt-0.5",
                  "transition-all duration-200",
                  active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area spacer for devices with home indicators */}
      <div className="h-safe-area-inset-bottom bg-background/80" />
    </nav>
  );
}

// CSS for safe-area-inset-bottom (add to tailwind config if needed)
// .safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
// .h-safe-area-inset-bottom { height: env(safe-area-inset-bottom); }
