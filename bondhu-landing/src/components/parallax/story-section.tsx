"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

// ===== TYPES =====
interface StorySectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  title?: string
  subtitle?: string
  badge?: string
  background?: "default" | "secondary" | "gradient" | "none"
  parallaxIntensity?: number // 0 to 1
}

interface StoryCardProps {
  children: React.ReactNode
  className?: string
  direction?: "left" | "right" | "center"
  delay?: number
}

interface StoryProgressProps {
  sections: { id: string; label: string }[]
  className?: string
}

// ===== STORY SECTION WRAPPER =====
export function StorySection({
  children,
  className = "",
  id,
  title,
  subtitle,
  badge,
  background = "default",
  parallaxIntensity = 0.3,
}: StorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: false, margin: "-20%" })
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  
  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 100 * parallaxIntensity]
  )
  
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.3, 1, 1, 0.3]
  )
  
  const backgroundClasses = {
    default: "bg-background",
    secondary: "bg-secondary/20",
    gradient: "bg-gradient-to-b from-background via-secondary/10 to-background",
    none: "",
  }
  
  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        "relative py-16 sm:py-20 md:py-24 overflow-hidden",
        backgroundClasses[background],
        className
      )}
      data-story-section={id}
    >
      {/* Parallax Background Decoration */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      </motion.div>
      
      {/* Section Header */}
      {(title || badge) && (
        <motion.div
          className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {badge && (
            <span className="inline-block px-4 py-1.5 mb-4 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full">
              {badge}
            </span>
          )}
          {title && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>
      )}
      
      {/* Section Content with fade effect */}
      <motion.div
        className="relative z-10"
        style={{ opacity: contentOpacity }}
      >
        {children}
      </motion.div>
    </section>
  )
}

// ===== STORY CARD - Slides in from direction =====
export function StoryCard({
  children,
  className = "",
  direction = "center",
  delay = 0,
}: StoryCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const getInitialX = () => {
    switch (direction) {
      case "left":
        return -60
      case "right":
        return 60
      default:
        return 0
    }
  }
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative",
        className
      )}
      initial={{
        opacity: 0,
        x: getInitialX(),
        y: direction === "center" ? 40 : 0,
      }}
      animate={isInView ? {
        opacity: 1,
        x: 0,
        y: 0,
      } : {
        opacity: 0,
        x: getInitialX(),
        y: direction === "center" ? 40 : 0,
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

// ===== STORY PROGRESS - Vertical progress indicator =====
export function StoryProgress({ sections, className = "" }: StoryProgressProps) {
  return (
    <nav
      className={cn(
        "fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3",
        className
      )}
      aria-label="Section navigation"
    >
      {sections.map((section, index) => (
        <StoryProgressDot
          key={section.id}
          id={section.id}
          label={section.label}
          index={index}
        />
      ))}
    </nav>
  )
}

function StoryProgressDot({
  id,
  label,
  index,
}: {
  id: string
  label: string
  index: number
}) {
  const [isActive, setIsActive] = React.useState(false)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting)
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    )
    
    const element = document.getElementById(id)
    if (element) {
      observer.observe(element)
    }
    
    return () => observer.disconnect()
  }, [id])
  
  const handleClick = () => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }
  
  return (
    <button
      onClick={handleClick}
      className="group relative flex items-center"
      aria-label={`Go to ${label}`}
    >
      {/* Dot */}
      <motion.div
        className={cn(
          "w-3 h-3 rounded-full border-2 transition-all duration-300",
          isActive
            ? "bg-primary border-primary scale-125"
            : "bg-transparent border-muted-foreground/40 hover:border-primary/60"
        )}
        initial={false}
        animate={isActive ? { scale: 1.25 } : { scale: 1 }}
      />
      
      {/* Label - appears on hover */}
      <span
        className={cn(
          "absolute right-6 whitespace-nowrap px-2 py-1 text-xs rounded bg-popover border shadow-lg",
          "opacity-0 translate-x-2 pointer-events-none",
          "group-hover:opacity-100 group-hover:translate-x-0",
          "transition-all duration-200"
        )}
      >
        {label}
      </span>
    </button>
  )
}

// ===== STICKY HEADER FOR SECTIONS =====
interface StickyHeaderProps {
  children: React.ReactNode
  className?: string
}

export function StickyHeader({ children, className = "" }: StickyHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-16 z-30 py-4 backdrop-blur-xl bg-background/80 border-b border-border/50",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}

// ===== FADE DIVIDER =====
interface FadeDividerProps {
  className?: string
  direction?: "down" | "up" | "both"
}

export function FadeDivider({
  className = "",
  direction = "down",
}: FadeDividerProps) {
  const gradients = {
    down: "bg-gradient-to-b from-transparent via-border/50 to-transparent",
    up: "bg-gradient-to-t from-transparent via-border/50 to-transparent",
    both: "bg-gradient-to-b from-transparent via-border/50 to-transparent",
  }
  
  return (
    <div
      className={cn(
        "h-24 w-full pointer-events-none",
        gradients[direction],
        className
      )}
      aria-hidden="true"
    />
  )
}

export default StorySection
