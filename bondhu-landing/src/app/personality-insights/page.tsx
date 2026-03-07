"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Sparkles,
  Heart,
  Users,
  Zap,
  Target,
  TrendingUp,
  Star,
  ChevronRight,
  MessageCircle,
  RefreshCw,
  Crown,
  Gem,
  ArrowUp,
  Activity,
  ArrowLeft
} from "lucide-react"
import AnimatedLoader from "@/components/ui/animated-loader"
import type { Profile } from "@/types/auth"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { BottomNav } from "@/components/ui/bottom-nav"
import { FamousPersonalityMatch } from "@/components/ui/famous-personality-match"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Dynamic personality score type from RPC
interface DynamicScore {
  trait: string
  base_score: number
  adjustment_total: number
  weighted_score: number
  source_count: number
  last_updated: string | null
}

// Personality type configurations with premium styling
const PERSONALITY_CONFIG: Record<string, { emoji: string; gradient: string; borderColor: string; textColor: string }> = {
  'Well-Rounded Achiever': { emoji: '🌟', gradient: 'from-amber-500/20 via-yellow-500/10 to-orange-500/5', borderColor: 'border-amber-500/30', textColor: 'text-amber-600 dark:text-amber-400' },
  'Resilient Leader': { emoji: '💪', gradient: 'from-red-500/20 via-rose-500/10 to-pink-500/5', borderColor: 'border-red-500/30', textColor: 'text-red-600 dark:text-red-400' },
  'Creative Visionary': { emoji: '🎨', gradient: 'from-purple-500/20 via-violet-500/10 to-fuchsia-500/5', borderColor: 'border-purple-500/30', textColor: 'text-purple-600 dark:text-purple-400' },
  'Intellectual Explorer': { emoji: '🔍', gradient: 'from-blue-500/20 via-cyan-500/10 to-sky-500/5', borderColor: 'border-blue-500/30', textColor: 'text-blue-600 dark:text-blue-400' },
  'Organized Achiever': { emoji: '🎯', gradient: 'from-green-500/20 via-emerald-500/10 to-teal-500/5', borderColor: 'border-green-500/30', textColor: 'text-green-600 dark:text-green-400' },
  'Steady Anchor': { emoji: '⚓', gradient: 'from-slate-500/20 via-gray-500/10 to-zinc-500/5', borderColor: 'border-slate-500/30', textColor: 'text-slate-600 dark:text-slate-400' },
  'Social Energizer': { emoji: '⚡', gradient: 'from-yellow-500/20 via-amber-500/10 to-orange-500/5', borderColor: 'border-yellow-500/30', textColor: 'text-yellow-600 dark:text-yellow-400' },
  'Charismatic Leader': { emoji: '🚀', gradient: 'from-orange-500/20 via-red-500/10 to-rose-500/5', borderColor: 'border-orange-500/30', textColor: 'text-orange-600 dark:text-orange-400' },
  'Compassionate Helper': { emoji: '💝', gradient: 'from-pink-500/20 via-rose-500/10 to-red-500/5', borderColor: 'border-pink-500/30', textColor: 'text-pink-600 dark:text-pink-400' },
  'Harmonious Connector': { emoji: '🤝', gradient: 'from-teal-500/20 via-cyan-500/10 to-blue-500/5', borderColor: 'border-teal-500/30', textColor: 'text-teal-600 dark:text-teal-400' },
  'Trusted Advisor': { emoji: '🛡️', gradient: 'from-indigo-500/20 via-blue-500/10 to-violet-500/5', borderColor: 'border-indigo-500/30', textColor: 'text-indigo-600 dark:text-indigo-400' },
  'Sensitive Soul': { emoji: '🌙', gradient: 'from-violet-500/20 via-purple-500/10 to-indigo-500/5', borderColor: 'border-violet-500/30', textColor: 'text-violet-600 dark:text-violet-400' },
  'Passionate Creator': { emoji: '🔥', gradient: 'from-rose-500/20 via-red-500/10 to-orange-500/5', borderColor: 'border-rose-500/30', textColor: 'text-rose-600 dark:text-rose-400' },
  'Thoughtful Analyst': { emoji: '🔬', gradient: 'from-cyan-500/20 via-blue-500/10 to-indigo-500/5', borderColor: 'border-cyan-500/30', textColor: 'text-cyan-600 dark:text-cyan-400' },
  'Diplomatic Bridge': { emoji: '🌉', gradient: 'from-emerald-500/20 via-green-500/10 to-teal-500/5', borderColor: 'border-emerald-500/30', textColor: 'text-emerald-600 dark:text-emerald-400' },
  'Balanced Adapter': { emoji: '⚖️', gradient: 'from-gray-500/20 via-slate-500/10 to-zinc-500/5', borderColor: 'border-gray-500/30', textColor: 'text-gray-600 dark:text-gray-400' },
}

// Trait configuration with premium colors
const TRAITS = [
  { 
    key: 'openness', 
    name: 'Openness', 
    shortName: 'O',
    icon: Sparkles, 
    gradient: 'from-purple-500 to-violet-600',
    bgGradient: 'from-purple-500/10 to-violet-500/5',
    color: 'text-purple-600 dark:text-purple-400', 
    ringColor: 'ring-purple-500/20',
    description: 'Creativity & curiosity',
    highLabel: 'Imaginative',
    lowLabel: 'Practical'
  },
  { 
    key: 'conscientiousness', 
    name: 'Conscientiousness', 
    shortName: 'C',
    icon: Target, 
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-500/10 to-green-500/5',
    color: 'text-emerald-600 dark:text-emerald-400', 
    ringColor: 'ring-emerald-500/20',
    description: 'Organization & discipline',
    highLabel: 'Organized',
    lowLabel: 'Flexible'
  },
  { 
    key: 'extraversion', 
    name: 'Extraversion', 
    shortName: 'E',
    icon: Zap, 
    gradient: 'from-orange-500 to-amber-600',
    bgGradient: 'from-orange-500/10 to-amber-500/5',
    color: 'text-orange-600 dark:text-orange-400', 
    ringColor: 'ring-orange-500/20',
    description: 'Energy & sociability',
    highLabel: 'Outgoing',
    lowLabel: 'Reserved'
  },
  { 
    key: 'agreeableness', 
    name: 'Agreeableness', 
    shortName: 'A',
    icon: Heart, 
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-500/10 to-rose-500/5',
    color: 'text-pink-600 dark:text-pink-400', 
    ringColor: 'ring-pink-500/20',
    description: 'Empathy & cooperation',
    highLabel: 'Compassionate',
    lowLabel: 'Analytical'
  },
  { 
    key: 'neuroticism', 
    name: 'Emotional Range', 
    shortName: 'N',
    icon: Brain, 
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-500/10 to-indigo-500/5',
    color: 'text-blue-600 dark:text-blue-400', 
    ringColor: 'ring-blue-500/20',
    description: 'Emotional sensitivity',
    highLabel: 'Sensitive',
    lowLabel: 'Resilient'
  },
]

// Circular progress component for premium look
function CircularProgress({ score, size = 120, strokeWidth = 8, gradient }: { 
  score: number
  size?: number
  strokeWidth?: number
  gradient: string 
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted/30"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-1000 ease-out")}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={`url(#${gradient.replace(/\s/g, '')})`}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <defs>
          <linearGradient id={gradient.replace(/\s/g, '')} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-3xl font-bold">{score}%</span>
      </div>
    </div>
  )
}

// Premium trait card with glass morphism and dynamic adjustment indicator
function PremiumTraitCard({ 
  trait, 
  score, 
  baseScore,
  adjustmentTotal,
  sourceCount,
  isStrength,
  animationDelay 
}: { 
  trait: typeof TRAITS[0]
  score: number
  baseScore?: number
  adjustmentTotal?: number
  sourceCount?: number
  isStrength: boolean
  animationDelay: number
}) {
  const Icon = trait.icon
  const label = score >= 60 ? trait.highLabel : score <= 40 ? trait.lowLabel : 'Balanced'
  const hasAdjustment = adjustmentTotal && Math.abs(adjustmentTotal) >= 0.5
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-4",
        "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
        "border border-white/20 dark:border-white/10",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        "animate-slide-up"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <GlowingEffect disabled={false} proximity={80} spread={25} blur={0.8} borderWidth={1} />
      
      {/* Gradient background overlay */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 dark:opacity-20", trait.bgGradient)} />
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      {/* Badge area - Responsive positioning */}
      <div className="absolute top-2 right-2 flex flex-wrap items-center gap-1 justify-end max-w-[60%]">
        {hasAdjustment && (
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-[9px] sm:text-[10px] px-1.5 py-0.5 shadow-lg animate-pulse">
            <Activity className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
            <span className="hidden xs:inline">Live</span>
          </Badge>
        )}
        {isStrength && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[9px] sm:text-[10px] px-1.5 py-0.5 shadow-lg">
            <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
            <span className="hidden xs:inline">Top</span>
          </Badge>
        )}
      </div>
      
      {/* Icon - Responsive size */}
      <div className={cn(
        "relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3",
        "bg-gradient-to-br shadow-lg",
        trait.gradient
      )}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      
      {/* Score with adjustment indicator - Responsive */}
      <div className="relative flex items-baseline gap-1 mb-1">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{score}</span>
        <span className="text-xs sm:text-sm text-muted-foreground">%</span>
        {hasAdjustment && (
          <span className={cn(
            "flex items-center text-[10px] sm:text-xs font-medium ml-1",
            adjustmentTotal > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )}>
            <ArrowUp className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3", adjustmentTotal < 0 && "rotate-180")} />
            {Math.abs(adjustmentTotal).toFixed(1)}
          </span>
        )}
      </div>
      
      {/* Name & Label - Responsive text */}
      <div className="relative text-xs sm:text-sm font-medium text-foreground/90 truncate">{trait.name}</div>
      <div className="relative flex items-center gap-1.5 flex-wrap">
        <span className={cn("text-[10px] sm:text-xs font-medium", trait.color)}>{label}</span>
        {sourceCount && sourceCount > 0 && (
          <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">• {sourceCount} signal{sourceCount > 1 ? 's' : ''}</span>
        )}
      </div>
      
      {/* Progress bar with base score indicator - Responsive */}
      <div className="relative mt-2 sm:mt-3">
        <div className="h-1.5 sm:h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out", trait.gradient)}
            style={{ width: `${score}%` }}
          />
        </div>
        {/* Base score marker */}
        {baseScore && hasAdjustment && (
          <div 
            className="absolute top-0 w-0.5 h-1.5 sm:h-2 bg-foreground/30 rounded-full"
            style={{ left: `${baseScore}%` }}
            title={`Base: ${baseScore}%`}
          />
        )}
      </div>
    </div>
  )
}

export default function PersonalityInsightsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dynamicScores, setDynamicScores] = useState<DynamicScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  
  const supabase = useMemo(() => createClient(), [])

  // Fetch dynamic personality scores from RPC
  const fetchDynamicScores = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase.rpc('get_dynamic_personality_scores', {
        p_user_id: uid
      })
      
      if (error) {
        console.error('Error fetching dynamic scores:', error)
        return
      }
      
      if (data) {
        setDynamicScores(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }, [supabase])

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/sign-in')
          return
        }

        setUserId(user.id)

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        setProfile(profileData)
        
        // Fetch dynamic scores
        await fetchDynamicScores(user.id)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [supabase, router, fetchDynamicScores])

  // Real-time subscription for personality adjustments
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('personality-adjustments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personality_adjustments',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refetch dynamic scores when adjustments change
          fetchDynamicScores(userId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchDynamicScores])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AnimatedLoader size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Button onClick={() => router.push('/sign-in')}>
            Return to Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Helper to get dynamic score for a trait
  const getDynamicScore = (trait: string): DynamicScore | undefined => {
    return dynamicScores.find(s => s.trait === trait)
  }

  // Get base scores from profile
  const baseScores = {
    openness: profile.personality_openness || 50,
    conscientiousness: profile.personality_conscientiousness || 50,
    extraversion: profile.personality_extraversion || 50,
    agreeableness: profile.personality_agreeableness || 50,
    neuroticism: profile.personality_neuroticism || 50,
  }

  // Get weighted scores (use dynamic if available, otherwise base)
  const scores = {
    openness: getDynamicScore('openness')?.weighted_score ?? baseScores.openness,
    conscientiousness: getDynamicScore('conscientiousness')?.weighted_score ?? baseScores.conscientiousness,
    extraversion: getDynamicScore('extraversion')?.weighted_score ?? baseScores.extraversion,
    agreeableness: getDynamicScore('agreeableness')?.weighted_score ?? baseScores.agreeableness,
    neuroticism: getDynamicScore('neuroticism')?.weighted_score ?? baseScores.neuroticism,
  }

  // Check if any trait has dynamic adjustments
  const hasDynamicAdjustments = dynamicScores.some(s => Math.abs(s.adjustment_total) >= 0.5)
  const totalAdjustmentSources = dynamicScores.reduce((sum, s) => sum + s.source_count, 0)

  // Calculate top strengths (scores >= 60)
  const strengths = Object.entries(scores)
    .filter(([_, score]) => score >= 60)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => key)

  // Get personality type config
  const personalityType = profile.personality_type || 'Balanced Adapter'
  const typeConfig = PERSONALITY_CONFIG[personalityType] || PERSONALITY_CONFIG['Balanced Adapter']

  // Calculate overall personality score (average)
  const overallScore = Math.round(
    (scores.openness + scores.conscientiousness + scores.extraversion + scores.agreeableness + (100 - scores.neuroticism)) / 5
  )

  // Check if assessment is complete (has valid personality scores)
  const hasCompletedAssessment = 
    (profile.personality_openness !== null && profile.personality_openness > 0) && 
    (profile.personality_conscientiousness !== null && profile.personality_conscientiousness > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex flex-col">
      {/* Header - Responsive */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex h-14 items-center justify-between px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center">
              <Logo width={100} height={36} />
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full pb-bottom-nav space-y-6 sm:space-y-8">
        
        {/* Premium Hero Card - Enhanced with animations */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-6 sm:p-8",
          "bg-gradient-to-br",
          typeConfig.gradient,
          "border",
          typeConfig.borderColor,
          "shadow-2xl shadow-black/10 dark:shadow-black/30",
          "animate-slide-up"
        )}>
          {/* Animated background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl transform translate-x-8 -translate-y-8 animate-float" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl transform -translate-x-4 translate-y-4 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]">
            <div className="absolute inset-0" style={{ 
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }} />
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Gem className="w-4 h-4 text-primary/70" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Personality Type</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <span className="text-5xl sm:text-6xl">{typeConfig.emoji}</span>
                <div>
                  <h1 className={cn("text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight", typeConfig.textColor)}>
                    {personalityType}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Based on Big Five personality science
                  </p>
                </div>
              </div>
            </div>
            
            {/* Circular score - Responsive */}
            <div className="hidden sm:block">
              <CircularProgress score={overallScore} size={100} strokeWidth={8} gradient="primary-gradient" />
            </div>
            <div className="sm:hidden self-end">
              <CircularProgress score={overallScore} size={70} strokeWidth={6} gradient="primary-gradient" />
            </div>
          </div>
          
          {/* Mini trait bars - Responsive */}
          <div className="relative mt-6 pt-4 border-t border-white/10 dark:border-white/5">
            <div className="flex items-center justify-between gap-1.5 sm:gap-3">
              {TRAITS.map((trait, index) => {
                const score = scores[trait.key as keyof typeof scores]
                return (
                  <div key={trait.key} className="flex-1 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-full h-14 sm:h-20 bg-black/5 dark:bg-white/5 rounded-lg sm:rounded-xl overflow-hidden flex flex-col justify-end">
                        <div 
                          className={cn("w-full rounded-t-sm bg-gradient-to-t transition-all duration-1000 ease-out", trait.gradient)}
                          style={{ height: `${score}%` }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{trait.shortName}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* No Assessment CTA - Responsive */}
        {!hasCompletedAssessment && (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20 backdrop-blur-xl animate-slide-up stagger-1">
            <GlowingEffect disabled={false} proximity={100} spread={30} blur={1} borderWidth={1} />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl animate-float" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
                <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl text-amber-800 dark:text-amber-200">Unlock Full Insights</h3>
                <p className="text-sm sm:text-base text-amber-600/80 dark:text-amber-400/80 mb-3">
                  Complete the quick personality assessment to get detailed insights
                </p>
                <Button 
                  onClick={() => router.push('/onboarding/personality')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25 h-10 sm:h-11 px-5"
                >
                  Start Assessment
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Section Header - Responsive */}
        <div className="flex items-center justify-between animate-slide-up stagger-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            <h2 className="font-semibold text-lg sm:text-xl">Big Five Traits</h2>
          </div>
          <Badge variant="outline" className="text-xs font-normal px-3 py-1">
            BFI-2-XS
          </Badge>
        </div>

        {/* Dynamic scores indicator - Enhanced */}
        {hasDynamicAdjustments && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 border border-cyan-500/20 backdrop-blur-sm animate-slide-up stagger-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Live Personality Updates</span>
              <p className="text-xs text-cyan-600/80 dark:text-cyan-400/80">
                Your scores adapt based on {totalAdjustmentSources} behavioral signal{totalAdjustmentSources !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Premium Trait Cards Grid - Responsive: 2 cols mobile, 3 cols tablet, 5 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {TRAITS.map((trait, index) => {
            const score = scores[trait.key as keyof typeof scores]
            const dynamicScore = getDynamicScore(trait.key)
            return (
              <PremiumTraitCard
                key={trait.key}
                trait={trait}
                score={score}
                baseScore={dynamicScore?.base_score}
                adjustmentTotal={dynamicScore?.adjustment_total}
                sourceCount={dynamicScore?.source_count}
                isStrength={strengths.includes(trait.key)}
                animationDelay={index * 100}
              />
            )
          })}
        </div>

        {/* Key Insights - Responsive grid */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-black/5 animate-slide-up stagger-2">
          <GlowingEffect disabled={false} proximity={150} spread={40} blur={1.5} borderWidth={1} />
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl" />
          
          <div className="relative p-5 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg sm:text-xl">Key Insights</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Based on your personality profile</p>
              </div>
            </div>
            
            {/* Responsive grid for insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Strengths */}
              {strengths.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-emerald-700 dark:text-emerald-300">Your Strengths</p>
                    <p className="text-xs sm:text-sm text-emerald-600/80 dark:text-emerald-400/80">
                      You excel in {strengths.map(s => TRAITS.find(t => t.key === s)?.name).join(' and ')}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Social Style */}
              <div className="flex items-start gap-3 p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300">Social Style</p>
                  <p className="text-xs sm:text-sm text-blue-600/80 dark:text-blue-400/80">
                    {scores.extraversion >= 60 
                      ? "You thrive in social settings and enjoy meeting new people"
                      : scores.extraversion >= 40
                      ? "You balance social time with personal space"
                      : "You prefer meaningful one-on-one connections"}
                  </p>
                </div>
              </div>
              
              {/* Creative Approach */}
              <div className="flex items-start gap-3 p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium text-purple-700 dark:text-purple-300">Creative Approach</p>
                  <p className="text-xs sm:text-sm text-purple-600/80 dark:text-purple-400/80">
                    {scores.openness >= 60 
                      ? "You embrace new ideas and love exploring possibilities"
                      : scores.openness >= 40
                      ? "You balance tradition with openness to change"
                      : "You value practical, proven approaches"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Famous Personality Match */}
        <div className="animate-slide-up stagger-2">
          <FamousPersonalityMatch
            openness={scores.openness}
            conscientiousness={scores.conscientiousness}
            extraversion={scores.extraversion}
            agreeableness={scores.agreeableness}
            neuroticism={scores.neuroticism}
          />
        </div>

        {/* Quick Actions - Responsive grid */}
        <div className="animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            <h2 className="font-semibold text-lg sm:text-xl">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="w-full justify-start h-16 sm:h-20 rounded-2xl border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl hover:bg-blue-500/5 hover:border-blue-500/20 hover:shadow-lg hover:scale-[1.02] transition-all group"
              onClick={() => router.push('/dashboard')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-base">Chat with Bondhu</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Get personalized insights</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-16 sm:h-20 rounded-2xl border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:shadow-lg hover:scale-[1.02] transition-all group"
              onClick={() => router.push('/progress')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-base">View Progress</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Track your growth</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {hasCompletedAssessment && (
              <Button
                variant="outline"
                className="w-full justify-start h-16 sm:h-20 rounded-2xl border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl hover:bg-purple-500/5 hover:border-purple-500/20 hover:shadow-lg hover:scale-[1.02] transition-all group"
                onClick={() => router.push('/onboarding/personality?retake=true')}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-base">Retake Assessment</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Update your profile</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>

        {/* Footer - Enhanced */}
        <div className="text-center py-6 sm:py-8 border-t border-border/30 animate-slide-up stagger-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm mb-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Based on <span className="font-medium">Big Five Inventory 2 Extra Short</span>
            </p>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-2">
            Soto & John (2017) • 15 validated items • Peer-reviewed methodology
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
