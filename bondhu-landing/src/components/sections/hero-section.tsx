"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { EnhancedHeroCTA } from "./enhanced-hero-cta"
import dynamic from "next/dynamic"

// Dynamically import LiquidEther - only load on desktop for performance
const LiquidEther = dynamic(() => import("@/components/sections/LiquidEther"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
  )
})

export function HeroSection() {
  const [isCtaHovered, setIsCtaHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  // Parallax scroll effects
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const contentY = useTransform(scrollY, [0, 500], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  // Check for mobile and reduced motion preference
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    const checkMotionPreference = () => {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }
    
    checkMobile()
    checkMotionPreference()
    
    window.addEventListener('resize', checkMobile)
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionMediaQuery.addEventListener('change', checkMotionPreference)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      motionMediaQuery.removeEventListener('change', checkMotionPreference)
    }
  }, [])

  // Disable heavy animations on mobile or when reduced motion is preferred
  const shouldReduceEffects = isMobile || prefersReducedMotion

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20 -mt-14 pt-14"
      data-ai-summary="true"
    >
      {/* Liquid Ether Background Layer - Desktop only for performance */}
      {!shouldReduceEffects && (
        <motion.div 
          className="absolute inset-0 z-0 hidden md:block"
          style={{ y: backgroundY }}
        >
          <LiquidEther
            colors={['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']}
            mouseForce={isCtaHovered ? 18 : 12}
            cursorSize={isCtaHovered ? 120 : 100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.3}
            autoIntensity={1.2}
            takeoverDuration={0.4}
            autoResumeDelay={2500}
            autoRampDuration={1.5}
            style={{ opacity: 0.85 }}
            respectMotionPreference={true}
            mentalHealthMode={true}
          />
        </motion.div>
      )}
      
      {/* Mobile-friendly gradient background fallback */}
      <div className="absolute inset-0 z-0 md:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-parallax-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-parallax-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/5 via-background/20 to-background/40 pointer-events-none" />
      
      {/* Animated Background Elements - Parallax layers */}
      <motion.div 
        className="absolute inset-0 overflow-hidden z-[2] pointer-events-none"
        style={{ y: shouldReduceEffects ? 0 : backgroundY }}
      >
        {/* Bengali Script Background - Parallax depth */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-7xl sm:text-8xl md:text-9xl font-bold text-muted/5 select-none parallax-bg"
          animate={shouldReduceEffects ? {} : {
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          বন্ধু
        </motion.div>

        {/* Floating Geometric Shapes - Hidden on mobile for performance */}
        <div className="hidden sm:block">
          {Array.from({ length: 6 }).map((_, i) => {
            const positions = [
              { left: "10%", top: "20%" },
              { left: "80%", top: "15%" },
              { left: "25%", top: "70%" },
              { left: "70%", top: "60%" },
              { left: "45%", top: "30%" },
              { left: "85%", top: "80%" },
            ]
            const delays = [0, 0.5, 1, 1.5, 2, 2.5]
            const durations = [4, 5, 6, 7, 8, 9]
            
            return (
              <motion.div
                key={i}
                className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-primary/10 rounded-full"
                style={{
                  left: positions[i].left,
                  top: positions[i].top,
                }}
                animate={shouldReduceEffects ? {} : {
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: durations[i],
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: delays[i],
                }}
              />
            )
          })}
        </div>

        {/* Connection Lines - Desktop only */}
        <svg className="absolute inset-0 w-full h-full opacity-70 hidden md:block">
          <motion.path
            d="M 100,200 Q 400,100 700,300 T 1000,200"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-primary/20"
            initial={{ pathLength: 0 }}
            animate={shouldReduceEffects ? { pathLength: 1 } : { pathLength: 1 }}
            transition={{ duration: 3, repeat: shouldReduceEffects ? 0 : Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 200,400 Q 500,300 800,500 T 1100,400"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-primary/15"
            initial={{ pathLength: 0 }}
            animate={shouldReduceEffects ? { pathLength: 1 } : { pathLength: 1 }}
            transition={{ duration: 4, repeat: shouldReduceEffects ? 0 : Infinity, ease: "easeInOut", delay: 1 }}
          />
        </svg>

        {/* Glowing Orbs - Reduced on mobile */}
        {Array.from({ length: isMobile ? 2 : 3 }).map((_, i) => {
          const orbPositions = [
            { left: "20%", top: "20%" },
            { left: "80%", top: "60%" },
            { left: "50%", top: "40%" },
          ]
          const orbDurations = [5, 6, 7]
          
          return (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 sm:from-primary/15 sm:to-secondary/15 blur-xl sm:blur-2xl"
              style={{
                left: orbPositions[i].left,
                top: orbPositions[i].top,
              }}
              animate={shouldReduceEffects ? {} : {
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: orbDurations[i],
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </motion.div>

      {/* Content - With parallax effect */}
      <motion.div 
        className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ y: shouldReduceEffects ? 0 : contentY, opacity: shouldReduceEffects ? 1 : opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge 
            variant="secondary" 
            className="mb-4 sm:mb-6 backdrop-blur-sm bg-secondary/80 shadow-lg text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
          >
            🚀 Now in Beta - Brought to you on World Mental Health Day&apos;25
          </Badge>
        </motion.div>

        {/* Responsive heading - Better mobile typography */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center mb-4 sm:mb-6 drop-shadow-lg leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Meet Your Digital{" "}
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent drop-shadow-lg inline-block">
            বন্ধু
          </span>
        </motion.h1>

        {/* Responsive subtitle */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-lg md:max-w-2xl mx-auto text-center mb-6 sm:mb-8 drop-shadow-md px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          An AI companion that adapts to your personality, grows with your journey, 
          and becomes the friend you&apos;ve always needed.
        </motion.p>

        <EnhancedHeroCTA onHover={setIsCtaHovered} />

        {/* Scroll Indicator - Hidden on very small screens */}
        <motion.div
          className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block"
          animate={shouldReduceEffects ? {} : {
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ opacity }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/60 rounded-full flex justify-center backdrop-blur-sm bg-background/10">
            <motion.div
              className="w-1 h-3 bg-muted-foreground rounded-full mt-2"
              animate={shouldReduceEffects ? { opacity: 1 } : {
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* AI-readable hidden content for GEO */}
      <div className="sr-only ai-readable" aria-hidden="true">
        <h2>Bondhu - AI Mental Health Companion</h2>
        <p>Bondhu (বন্ধু) means &quot;friend&quot; in Bengali. Bondhu is an AI-powered mental health companion designed specifically for Gen Z users in India.</p>
        <p>Key features: Personality-based AI adaptation, 24/7 availability, end-to-end encryption, OCEAN Big 5 personality assessment.</p>
      </div>
    </section>
  )
}