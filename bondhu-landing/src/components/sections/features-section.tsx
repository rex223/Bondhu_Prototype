"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MagicBento from "@/components/ui/magic-bento"
import { GamifiedDiscoveryCard } from "@/components/cards/gamified-discovery-card"
import { EmotionalUnderstandingCard } from "@/components/cards/emotional-understanding-card"
import { Sparkles, Shield, Clock, Brain, Heart, Zap } from "lucide-react"

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const isHeaderInView = useInView(headerRef, { once: true })
  const [isMobile, setIsMobile] = useState(false)
  
  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])
  
  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 80])
  
  const bentoCards = [
    {
      title: "Adaptive Intelligence",
      description: "Learns your communication style and adapts conversations to match your personality over time",
      label: "Personalized",
    },
    {
      title: "Proactive Care",
      description: "Initiates check-ins and suggests activities based on your well-being patterns and preferences",
      label: "Wellness",
    },
    {
      customContent: <GamifiedDiscoveryCard />,
    },
    {
      customContent: <EmotionalUnderstandingCard />,
    },
    {
      title: "Privacy First",
      description: "End-to-end encryption ensures your conversations remain completely private and secure",
      label: "Secure",
    },
    {
      title: "Always Available",
      description: "24/7 companion that fits your schedule, perfect for late-night thoughts or early morning clarity",
      label: "Accessible",
    },
  ]

  // Feature highlights for better mobile experience and GEO
  const featureHighlights = [
    { icon: Brain, label: "Personality AI", color: "text-purple-500" },
    { icon: Heart, label: "Emotional Support", color: "text-pink-500" },
    { icon: Shield, label: "Privacy First", color: "text-green-500" },
    { icon: Clock, label: "24/7 Available", color: "text-blue-500" },
    { icon: Zap, label: "Proactive Care", color: "text-amber-500" },
    { icon: Sparkles, label: "Always Learning", color: "text-cyan-500" },
  ]

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  }

  return (
    <section 
      ref={sectionRef}
      id="features" 
      className="relative py-16 sm:py-20 md:py-24 overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background"
      data-ai-summary="true"
    >
      {/* Parallax Background Decoration */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-1/4 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/5 rounded-full blur-3xl" />
      </motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with stagger animation */}
        <motion.div
          ref={headerRef}
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Features
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Why Choose Bondhu?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced AI technology meets genuine emotional understanding
          </p>
        </motion.div>

        {/* Feature Highlights - Quick scan row for mobile */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featureHighlights.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-border/50 text-xs sm:text-sm font-medium"
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${feature.color}`} />
                <span>{feature.label}</span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Magic Bento Grid with stagger reveal */}
        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          viewport={{ once: true }}
        >
          <MagicBento 
            textAutoHide={false}
            enableStars={!isMobile} // Disable stars on mobile for performance
            enableSpotlight={!isMobile}
            enableBorderGlow={true}
            enableTilt={!isMobile}
            enableMagnetism={!isMobile}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={isMobile ? 6 : 12}
            glowColor="132, 0, 255"
            cards={bentoCards}
          />
        </motion.div>

        {/* Bottom CTA - Better mobile styling */}
        <motion.div
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          viewport={{ once: true }}
        >
          <Card className="max-w-2xl mx-auto p-6 sm:p-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20 backdrop-blur-sm">
            <CardContent className="p-0 text-center">
              <motion.div 
                className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ✨
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                Experience the Difference
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Join users who&apos;ve found their perfect AI companion
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {["Personality-aware", "Emotionally intelligent", "Privacy-focused", "Always learning"].map((badge, index) => (
                  <motion.div
                    key={badge}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      {badge}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Hidden AI-readable content for GEO */}
      <div className="sr-only ai-readable" aria-hidden="true">
        <h3>Bondhu AI Features</h3>
        <ul>
          <li>Adaptive Intelligence: Learns communication style and adapts to personality</li>
          <li>Proactive Care: Initiates check-ins based on well-being patterns</li>
          <li>Privacy First: End-to-end encryption for all conversations</li>
          <li>24/7 Availability: Always accessible for late-night support</li>
          <li>Gamified Discovery: Engaging personality exploration through games</li>
          <li>Emotional Understanding: Advanced emotional intelligence capabilities</li>
        </ul>
      </div>
    </section>
  )
}
