import { Navbar1 } from "@/components/ui/navbar-1"
import { HeroSection } from "@/components/sections/hero-section"
import { ProblemSection } from "@/components/sections/problem-section"
import { SolutionSection } from "@/components/sections/solution-section"
import MultiAgentArchitecture from "@/components/landing/multi-agent-architecture"
import { InteractiveDemo } from "@/components/sections/interactive-demo"
import { FeaturesSection } from "@/components/sections/features-section"
import TechnicalDifferentiationPanel from "@/components/landing/technical-differentiation-panel"
import { PricingSection } from "@/components/sections/pricing-section"
import { CurvedMarqueeSection } from "@/components/sections/curved-marquee-section"
import { Footer } from "@/components/sections/footer"
import { FloatingCTA } from "@/components/floating-cta"
import { FAQSection } from "@/components/sections/faq-section"
import { HomePageSchemas } from "./page-schemas"
import { LLMOptimizedContent } from "@/components/seo/llm-optimized-content"
import { BondhuCitationBlocks } from "@/components/seo/citation-blocks"
import { ParallaxProvider, ScrollProgress } from "@/components/parallax"

export default function Home() {
  return (
    <ParallaxProvider>
      {/* Schema markup for SEO */}
      <HomePageSchemas />
      
      {/* Hidden content for LLM/AI extraction (GEO) */}
      <LLMOptimizedContent />
      <BondhuCitationBlocks />
      
      {/* Scroll progress indicator */}
      <ScrollProgress className="hidden sm:block" />
      
      <div className="min-h-screen">
        <Navbar1 />
        <main className="pt-14">
          {/* Hero - Introduction */}
          <HeroSection />
          
          {/* Problem - The Crisis */}
          <ProblemSection />
          
          {/* Solution - The Answer */}
          <SolutionSection />
          
          {/* How it Works - Multi-Agent Architecture */}
          <MultiAgentArchitecture />
          
          {/* Try It - Interactive Demo */}
          <InteractiveDemo />
          
          {/* Features - Why Choose Bondhu */}
          <FeaturesSection />
          
          {/* Technical - Under the Hood */}
          <TechnicalDifferentiationPanel />
          
          {/* Pricing - Get Started */}
          <PricingSection />
          
          {/* FAQ - Questions Answered */}
          <FAQSection />
          
          {/* Social Proof - Testimonials */}
          <CurvedMarqueeSection />
        </main>
        <Footer />
        <FloatingCTA />
      </div>
    </ParallaxProvider>
  )
}
