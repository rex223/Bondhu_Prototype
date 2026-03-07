"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { TrendingDown, Users, Brain, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Component as ImageAutoSlider } from "@/components/ui/image-auto-slider"

// Animated counter component
function AnimatedStat({ 
  value, 
  suffix = "", 
  isInView 
}: { 
  value: number
  suffix?: string
  isInView: boolean 
}) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    if (!isInView) return
    
    const duration = 2000 // 2 seconds
    const startTime = Date.now()
    
    const updateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = easeOutQuart * value
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }
    
    requestAnimationFrame(updateValue)
  }, [isInView, value])
  
  return (
    <span>
      {displayValue.toFixed(suffix === "%" ? 1 : 0)}{suffix}
    </span>
  )
}

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100])
  
  const statistics = [
    {
      value: 43,
      suffix: "%",
      description: "of young Indians report feeling lonely despite digital connectivity",
      icon: Users,
      source: "National Mental Health Survey",
      sourceUrl: "https://www.mohfw.gov.in/sites/default/files/National%20Mental%20Health%20Survey%2C%202015-16%20-%20Prevalence%2C%20Pattern%20%26%20Outcomes_0.pdf",
    },
    {
      value: 24.8,
      suffix: "%",
      description: "of students exhibit high levels of social anxiety",
      icon: Brain,
      source: "NIMHANS Study 2024",
      sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11572450/",
    },
    {
      value: 13.5,
      suffix: "%",
      description: "mental health disorder prevalence in urban metros vs 7.3% national average",
      icon: TrendingDown,
      source: "National Mental Health Survey 2015-16",
      sourceUrl: "https://www.mohfw.gov.in/sites/default/files/National%20Mental%20Health%20Survey%2C%202015-16%20-%20Prevalence%2C%20Pattern%20%26%20Outcomes_0.pdf",
    },
  ]

  const painPoints = [
    {
      text: "Social media amplifies fear of judgment",
      icon: "📱",
    },
    {
      text: "Traditional therapy feels intimidating and expensive",
      icon: "💰",
    },
    {
      text: "Existing chatbots lack real personality understanding",
      icon: "🤖",
    },
    {
      text: "No one to talk to during late-night overthinking",
      icon: "🌙",
    },
  ]

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-secondary/10 via-secondary/20 to-secondary/10 overflow-hidden"
      data-ai-summary="true"
    >
      {/* Parallax Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-20 left-10 w-32 h-32 sm:w-64 sm:h-64 bg-destructive/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 sm:w-80 sm:h-80 bg-destructive/5 rounded-full blur-3xl" />
      </motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with stagger animation */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          viewport={{ once: true }}
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs sm:text-sm font-medium text-destructive bg-destructive/10 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            The Challenge
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            The Gen Z Mental Health Crisis
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            You&apos;re more connected than ever, yet loneliness feels overwhelming
          </p>
        </motion.div>

        {/* Statistics Grid with Animated Counters */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
          {statistics.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-4 sm:p-6 h-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30 relative overflow-hidden before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-white/20 before:to-transparent dark:before:from-white/5 dark:before:to-transparent before:pointer-events-none hover:shadow-xl hover:shadow-destructive/20 hover:scale-[1.02] transition-all duration-300 group">
                  <CardContent className="p-0 relative z-10">
                    {/* Icon with pulse animation on view */}
                    <motion.div 
                      className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-destructive/10 backdrop-blur-sm flex items-center justify-center border border-destructive/20 group-hover:bg-destructive/20 transition-colors"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 200, 
                        damping: 15,
                        delay: index * 0.15 + 0.2
                      }}
                      viewport={{ once: true }}
                    >
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                    </motion.div>
                    
                    {/* Animated Counter */}
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-destructive mb-2 tabular-nums">
                      <AnimatedStat 
                        value={stat.value} 
                        suffix={stat.suffix}
                        isInView={isStatsInView}
                      />
                    </div>
                    
                    <p className="text-sm sm:text-base text-muted-foreground mb-2">
                      {stat.description}
                    </p>
                    
                    {/* Source citation for GEO */}
                    <p className="text-xs text-muted-foreground/60 italic">
                      Source:{" "}
                      {stat.sourceUrl ? (
                        <a 
                          href={stat.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary underline"
                        >
                          {stat.source}
                        </a>
                      ) : (
                        stat.source
                      )}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Image Auto Slider */}
        <motion.div
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <ImageAutoSlider />
        </motion.div>

        {/* Pain Points with better mobile layout */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">
            The Reality You Face Every Day
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 sm:gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-border/50 hover:border-destructive/30 transition-colors"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
                viewport={{ once: true }}
              >
                <span className="text-2xl flex-shrink-0">{point.icon}</span>
                <p className="text-sm sm:text-base text-muted-foreground">{point.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Emotional Impact Visual - Better mobile styling */}
        <motion.div
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          viewport={{ once: true }}
        >
          <div className="max-w-md mx-auto relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-destructive/5 to-transparent border border-destructive/10">
            <motion.div 
              className="text-5xl sm:text-6xl mb-4"
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              😔
            </motion.div>
            <p className="text-base sm:text-lg text-muted-foreground italic">
              &quot;I&apos;m surrounded by people online, but I still feel alone...&quot;
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              — Anonymous Gen Z user
            </p>
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-destructive/30 animate-ping" />
          </div>
        </motion.div>
      </div>
      
      {/* Hidden AI-readable content for GEO */}
      <div className="sr-only ai-readable" aria-hidden="true">
        <h3>Gen Z Mental Health Statistics in India</h3>
        <ul>
          <li>43% of young Indians report feeling lonely despite digital connectivity (National Mental Health Survey)</li>
          <li>24.8% of students exhibit high levels of social anxiety (NIMHANS Study 2023)</li>
          <li>13.5% mental health disorder prevalence in urban metros vs 7.3% national average (WHO India Report)</li>
        </ul>
        <p>Key challenges: Social media judgment anxiety, expensive therapy, lack of personalized chatbots, late-night support unavailability.</p>
      </div>
    </section>
  )
}
