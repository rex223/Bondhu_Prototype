"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useInView, MotionValue } from "framer-motion"

// ===== TYPES =====
interface ParallaxContextType {
  scrollY: MotionValue<number>
  scrollYProgress: MotionValue<number>
  isMobile: boolean
  prefersReducedMotion: boolean
}

interface ParallaxProviderProps {
  children: React.ReactNode
}

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  duration?: number
  once?: boolean
}

interface ParallaxLayerProps {
  children: React.ReactNode
  speed?: number // -1 to 1, where negative moves opposite to scroll
  className?: string
}

interface ScrollProgressProps {
  className?: string
}

// ===== CONTEXT =====
const ParallaxContext = createContext<ParallaxContextType | null>(null)

export function useParallax() {
  const context = useContext(ParallaxContext)
  if (!context) {
    throw new Error("useParallax must be used within a ParallaxProvider")
  }
  return context
}

// ===== PROVIDER =====
export function ParallaxProvider({ children }: ParallaxProviderProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  const { scrollY, scrollYProgress } = useScroll()
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    const checkMotionPreference = () => {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    }
    
    checkMobile()
    checkMotionPreference()
    
    window.addEventListener("resize", checkMobile)
    const motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    motionMediaQuery.addEventListener("change", checkMotionPreference)
    
    return () => {
      window.removeEventListener("resize", checkMobile)
      motionMediaQuery.removeEventListener("change", checkMotionPreference)
    }
  }, [])
  
  return (
    <ParallaxContext.Provider
      value={{
        scrollY,
        scrollYProgress,
        isMobile,
        prefersReducedMotion,
      }}
    >
      {children}
    </ParallaxContext.Provider>
  )
}

// ===== SCROLL REVEAL =====
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: "-100px" })
  
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  }
  
  const { prefersReducedMotion } = useParallax()
  
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      animate={isInView ? {
        opacity: 1,
        x: 0,
        y: 0,
      } : {
        opacity: 0,
        ...directions[direction],
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1], // Custom easing for smooth feel
      }}
    >
      {children}
    </motion.div>
  )
}

// ===== PARALLAX LAYER =====
export function ParallaxLayer({
  children,
  speed = 0.5,
  className = "",
}: ParallaxLayerProps) {
  const { scrollY, isMobile, prefersReducedMotion } = useParallax()
  
  // Smooth the scroll value for buttery parallax
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })
  
  const y = useTransform(
    smoothScrollY,
    [0, 1000],
    [0, 1000 * speed]
  )
  
  if (isMobile || prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }
  
  return (
    <motion.div
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  )
}

// ===== SCROLL PROGRESS INDICATOR =====
export function ScrollProgress({ className = "" }: ScrollProgressProps) {
  const { scrollYProgress } = useParallax()
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })
  
  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left ${className}`}
      style={{ scaleX }}
    />
  )
}

// ===== STAGGER CONTAINER =====
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: "-50px" })
  const { prefersReducedMotion } = useParallax()
  
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
      },
    },
  }
  
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  )
}

// ===== STAGGER ITEM =====
interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  const { prefersReducedMotion } = useParallax()
  
  const itemVariants = {
    hidden: prefersReducedMotion 
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  }
  
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}

// ===== COUNTER ANIMATION =====
interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}

export function AnimatedCounter({
  value,
  duration = 2,
  className = "",
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)
  const { prefersReducedMotion } = useParallax()
  
  useEffect(() => {
    if (!isInView) return
    
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }
    
    const startTime = Date.now()
    const endTime = startTime + duration * 1000
    
    const updateValue = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.round(easeOutQuart * value)
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }
    
    requestAnimationFrame(updateValue)
  }, [isInView, value, duration, prefersReducedMotion])
  
  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

export default ParallaxProvider
