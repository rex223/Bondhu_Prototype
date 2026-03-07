"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Check, Zap, Crown, ArrowRight, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const isCardsInView = useInView(cardsRef, { once: true, margin: "-100px" })
  
  // Parallax background
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 60])

  const betaFeatures = [
    "Complete personality assessment",
    "Unlimited conversations",
    "Basic mood tracking",
    "Gamified onboarding experience",
    "Privacy-first encryption",
    "24/7 availability",
    "Early access to new features",
  ]

  const premiumFeatures = [
    "Voice conversations",
    "Advanced personality analytics",
    "Group chat capabilities",
    "Therapist referral network",
    "Custom personality insights",
    "Priority support",
  ]

  // Animation variants for slide-in cards
  const leftSlideVariants = {
    hidden: { opacity: 0, x: -60, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  }

  const rightSlideVariants = {
    hidden: { opacity: 0, x: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: 0.15,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  }

  return (
    <section 
      ref={sectionRef}
      id="pricing" 
      className="relative py-16 sm:py-20 md:py-24 overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background"
      data-ai-summary="true"
    >
      {/* Parallax Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 sm:w-80 sm:h-80 bg-yellow-500/5 rounded-full blur-3xl" />
      </motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          viewport={{ once: true }}
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Gift className="w-3.5 h-3.5" />
            Pricing
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Free beta access with premium features coming soon
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Beta Access - Free - Slides from Left */}
            <motion.div
              variants={leftSlideVariants}
              initial="hidden"
              animate={isCardsInView ? "visible" : "hidden"}
            >
              <Card className="h-full relative overflow-hidden border-primary/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant="secondary" className="w-fit">
                      <Zap className="h-3 w-3 mr-1" />
                      Current Offer
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold">Free</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Beta Access</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-xl sm:text-2xl font-bold">Beta Access</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Full access to Bondhu while we perfect the experience
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  <div className="space-y-2.5 sm:space-y-3 mb-6">
                    {betaFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3"
                        custom={index}
                        variants={featureVariants}
                        initial="hidden"
                        animate={isCardsInView ? "visible" : "hidden"}
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <Button size="lg" className="w-full h-11 sm:h-12 text-sm sm:text-base touch-target" asChild>
                    <Link href="/sign-up">
                      Join Beta Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>

                  <div className="mt-3 sm:mt-4 text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      No credit card required • Join beta users
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Features - Coming Soon - Slides from Right */}
            <motion.div
              variants={rightSlideVariants}
              initial="hidden"
              animate={isCardsInView ? "visible" : "hidden"}
            >
              <Card className="h-full relative overflow-hidden bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-primary/5 border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge className="w-fit bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      <Crown className="h-3 w-3 mr-1" />
                      Coming Soon
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold">₹299</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-xl sm:text-2xl font-bold">Premium Features</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Advanced capabilities for the ultimate AI companion experience
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  <div className="space-y-2.5 sm:space-y-3 mb-6">
                    {premiumFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3"
                        custom={index}
                        variants={featureVariants}
                        initial="hidden"
                        animate={isCardsInView ? "visible" : "hidden"}
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <Crown className="h-3 w-3 text-yellow-600" />
                        </div>
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <Button size="lg" variant="outline" className="w-full h-11 sm:h-12 text-sm sm:text-base touch-target opacity-60" disabled>
                    Coming Soon
                  </Button>

                  <div className="mt-3 sm:mt-4 text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Get notified when premium features launch
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Value Proposition - Staggered reveal */}
          <motion.div
            className="mt-10 sm:mt-12 text-center"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            viewport={{ once: true }}
          >
            <Card className="max-w-2xl mx-auto p-5 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800 backdrop-blur-sm">
              <CardContent className="p-0 text-center">
                <motion.div 
                  className="text-3xl sm:text-4xl mb-2 sm:mb-3"
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  💡
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Why Start with Beta?</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Shape the future of AI mental health companions while getting full access for free
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  {[
                    { icon: Check, color: "green", label: "Your feedback matters" },
                    { icon: Zap, color: "blue", label: "Early access benefits" },
                    { icon: Crown, color: "purple", label: "Lifetime beta perks" },
                  ].map((item, index) => (
                    <motion.div 
                      key={item.label}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-full flex items-center justify-center mb-2`}>
                        <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${item.color}-600`} />
                      </div>
                      <span className="text-center leading-tight">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Hidden AI-readable content for GEO */}
      <div className="sr-only ai-readable" aria-hidden="true">
        <h3>Bondhu Pricing</h3>
        <p>Bondhu offers free beta access with the following features: Complete personality assessment, Unlimited conversations, Basic mood tracking, Gamified onboarding, Privacy-first encryption, 24/7 availability.</p>
        <p>Premium features (₹299/month, coming soon): Voice conversations, Advanced personality analytics, Group chat capabilities, Therapist referral network, Custom personality insights, Priority support.</p>
      </div>
    </section>
  )
}
