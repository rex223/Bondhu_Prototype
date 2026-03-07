"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Heart,
  MessageCircle,
  Gamepad2,
  TrendingUp,
  Trophy,
  Activity,
  Flame,
  Calendar,
  Music,
  Video,
  ArrowLeft,
  ChevronRight,
  Sparkles
} from "lucide-react"
import AnimatedLoader from "@/components/ui/animated-loader"
import type { Profile } from "@/types/auth"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { BottomNav } from "@/components/ui/bottom-nav"
import { EmotionalOrb } from "@/components/ui/emotional-orb"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  trend?: string
  trendPositive?: boolean
  color: string
  gradient?: string
}

function StatsCard({ icon, title, value, subtitle, trend, trendPositive, color, gradient }: StatsCardProps) {
  return (
    <div className={cn(
      "relative group overflow-hidden rounded-2xl p-4 sm:p-5 space-y-3",
      "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
      "border border-white/20 dark:border-white/10",
      "shadow-lg shadow-black/5 dark:shadow-black/20",
      "hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
    )}>
      <GlowingEffect disabled={false} proximity={80} spread={25} blur={1} borderWidth={1} />
      
      {/* Gradient background accent */}
      {gradient && (
        <div className={cn(
          "absolute inset-0 opacity-30 bg-gradient-to-br pointer-events-none",
          gradient
        )} />
      )}
      
      <div className="relative flex items-center justify-between">
        <div className={cn(
          "p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg",
          color
        )}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full",
            trendPositive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="text-2xl sm:text-3xl font-bold">{value}</div>
        <div className="text-sm sm:text-base font-medium text-foreground/80">{title}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  )
}

// Helper function to transform raw stats data to ActivityStats format
function transformStats(data: Record<string, any> | null | undefined): any {
  if (!data) {
    return {
      wellnessScore: 0,
      wellnessTrend: 0,
      totalMessages: 0,
      messagesToday: 0,
      totalGamesPlayed: 0,
      gamesThisWeek: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      totalAchievements: 0,
      achievementsThisMonth: 0,
      activeSessions: 0,
      activeSessionsToday: 0,
      gamesPlayedCount: 0,
      videosWatchedCount: 0,
      songsListenedCount: 0,
      achievementList: [],
      lastActivityDate: undefined,
      updatedAt: undefined
    }
  }

  return {
    wellnessScore: data.wellness_score || 0,
    wellnessTrend: data.wellness_trend || 0,
    totalMessages: data.total_messages || 0,
    messagesToday: data.messages_today || 0,
    totalGamesPlayed: data.total_games_played || 0,
    gamesThisWeek: data.games_this_week || 0,
    currentStreakDays: data.current_streak_days || 0,
    longestStreakDays: data.longest_streak_days || 0,
    totalAchievements: data.total_achievements || 0,
    achievementsThisMonth: data.achievements_this_month || 0,
    activeSessions: data.active_sessions || 0,
    activeSessionsToday: data.active_sessions_today || 0,
    gamesPlayedCount: data.games_played_count || 0,
    videosWatchedCount: data.videos_watched_count || 0,
    songsListenedCount: data.songs_listened_count || 0,
    achievementList: data.achievement_list || [],
    lastActivityDate: data.last_activity_date,
    updatedAt: data.updated_at
  }
}

// Wellness component type
interface WellnessComponent {
  score: number
  max: number
  label: string
  description: string
  detail: string
}

interface WellnessDetails {
  wellness_score: number
  trend: number
  components: {
    activity: WellnessComponent
    consistency: WellnessComponent
    engagement: WellnessComponent
    growth: WellnessComponent
  }
  history: Array<{ date: string; score: number }>
  calculated_at: string
}

export default function ProgressPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activityStats, setActivityStats] = useState<any>(null)
  const [wellnessDetails, setWellnessDetails] = useState<WellnessDetails | null>(null)
  const router = useRouter()

  // Memoize Supabase client to prevent re-creating on every render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const getProfileAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/sign-in')
          return
        }

        // Fetch profile and activity stats in parallel
        const [profileResult, statsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
          supabase
            .from('user_activity_stats')
            .select('*')
            .eq('user_id', user.id)
            .single()
        ])

        if (profileResult.error) {
          console.error('Error fetching profile:', profileResult.error)
          return
        }

        setProfile(profileResult.data)

        // Transform stats data using helper function
        setActivityStats(transformStats(statsResult.data))

        // Fetch wellness score details with component breakdown
        const { data: wellnessData, error: wellnessError } = await supabase
          .rpc('get_wellness_score_details', { p_user_id: user.id })
        
        if (wellnessError) {
          console.error('Error fetching wellness details:', wellnessError)
        } else if (wellnessData) {
          setWellnessDetails(wellnessData as WellnessDetails)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getProfileAndStats()

    // Set up real-time subscription for activity stats
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('activity-stats-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_activity_stats',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Activity stats updated:', payload)
            if (payload.new) {
              // Transform stats using helper function
              setActivityStats(transformStats(payload.new as any))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupRealtimeSubscription()

    return () => {
      cleanup.then(fn => fn?.())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - supabase is memoized and stable

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

  // Calculate stats with fallbacks
  const wellnessScore = wellnessDetails?.wellness_score ?? activityStats?.wellnessScore ?? 0
  const wellnessTrend = wellnessDetails?.trend ?? activityStats?.wellnessTrend ?? 0
  const totalMessages = activityStats?.totalMessages || 0
  const messagesToday = activityStats?.messagesToday || 0
  const totalGamesPlayed = activityStats?.totalGamesPlayed || 0
  const gamesThisWeek = activityStats?.gamesThisWeek || 0
  const currentStreakDays = activityStats?.currentStreakDays || 0
  const longestStreakDays = activityStats?.longestStreakDays || 0
  const totalAchievements = activityStats?.totalAchievements || 0
  const achievementsThisMonth = activityStats?.achievementsThisMonth || 0
  const videosWatchedCount = activityStats?.videosWatchedCount || 0
  const songsListenedCount = activityStats?.songsListenedCount || 0

  const wellnessTrendText = wellnessTrend > 0
    ? `+${wellnessTrend}%`
    : wellnessTrend < 0
      ? `${wellnessTrend}%`
      : 'Stable'

  const messageTrendText = messagesToday > 0
    ? `+${messagesToday} today`
    : 'Start chatting!'

  const gameTrendText = gamesThisWeek > 0
    ? `+${gamesThisWeek} this week`
    : 'Play a game!'

  const streakText = currentStreakDays > 0
    ? currentStreakDays >= longestStreakDays && currentStreakDays >= 7
      ? '🔥 Best ever!'
      : currentStreakDays >= 7
        ? 'Amazing!'
        : 'Keep going!'
    : 'Start today!'

  const achievementTrendText = achievementsThisMonth > 0
    ? `+${achievementsThisMonth} this month`
    : 'Earn your first!'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex flex-col">
      {/* Header - Matching other pages */}
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

      {/* Main Content - Responsive width */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full pb-bottom-nav space-y-6 sm:space-y-8">
        {/* Hero Section with Wellness Score */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-6 sm:p-8",
          "bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20",
          "border border-green-500/20",
          "shadow-2xl shadow-black/10 dark:shadow-black/30",
          "animate-slide-up"
        )}>
          {/* Animated background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]">
            <div className="absolute inset-0" style={{ 
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }} />
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Progress</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                {profile.full_name?.split(' ')[0] || 'Your'} Wellness Journey
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Track your growth and celebrate your achievements
              </p>
              
              {/* Wellness Score inline for mobile */}
              <div className="flex items-center gap-4 sm:hidden">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">{wellnessScore}%</div>
                <div className="text-sm text-muted-foreground">
                  {wellnessScore > 70 ? "You're doing great!" :
                    wellnessScore > 40 ? "Keep it up!" :
                      "Let's get started!"}
                </div>
              </div>
            </div>
            
            {/* Wellness Score Circle - Desktop */}
            <div className="hidden sm:block relative">
              <svg 
                className="w-32 h-32 lg:w-40 lg:h-40 transform -rotate-90"
                role="progressbar"
                aria-valuenow={wellnessScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Wellness score: ${wellnessScore}%`}
              >
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-white/20"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="url(#wellness-gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${wellnessScore * 2.83} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="wellness-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">{wellnessScore}%</span>
                <span className="text-xs text-muted-foreground">Wellness</span>
              </div>
            </div>
            
            {/* Emotional Orb */}
            <div className="absolute top-4 right-4 sm:hidden">
              <EmotionalOrb
                emotion={wellnessScore > 50 ? "happy" : wellnessScore > 25 ? "neutral" : "focused"}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Wellness Component Breakdown */}
        {wellnessDetails && (
          <div className="animate-slide-up stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
              <h2 className="font-semibold text-lg sm:text-xl">Wellness Breakdown</h2>
              <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-medium text-green-600 dark:text-green-400">LIVE</span>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Object.entries(wellnessDetails.components).map(([key, component]) => {
                const percentage = Math.round((component.score / component.max) * 100)
                const colorMap: Record<string, { gradient: string; text: string; ring: string }> = {
                  activity: { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/20' },
                  consistency: { gradient: 'from-orange-500 to-amber-500', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/20' },
                  engagement: { gradient: 'from-purple-500 to-pink-500', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/20' },
                  growth: { gradient: 'from-emerald-500 to-green-500', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' }
                }
                const colors = colorMap[key] || colorMap.activity
                
                return (
                  <div
                    key={key}
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-4 sm:p-5",
                      "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
                      "border border-white/20 dark:border-white/10",
                      "shadow-lg shadow-black/5 dark:shadow-black/20",
                      "hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    )}
                  >
                    <GlowingEffect disabled={false} proximity={80} spread={25} blur={1} borderWidth={1} />
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {component.label}
                      </span>
                      <span className={cn("text-lg font-bold", colors.text)}>
                        {component.score}/{component.max}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden mb-3">
                      <div 
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", colors.gradient)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {component.detail}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats Grid - Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        <div className="animate-slide-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            <h2 className="font-semibold text-lg sm:text-xl">Your Stats</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            icon={<MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />}
            title="Chat Sessions"
            value={totalMessages}
            subtitle="Messages with Bondhu"
            trend={messageTrendText}
            trendPositive={messagesToday > 0}
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
            gradient="from-blue-500/10 to-cyan-500/5"
          />
          <StatsCard
            icon={<Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            title="Day Streak"
            value={`${currentStreakDays}`}
            subtitle={longestStreakDays > 0 ? `Best: ${longestStreakDays} days` : "Start your streak!"}
            trend={streakText}
            trendPositive={currentStreakDays >= 3}
            color="bg-gradient-to-br from-orange-500 to-amber-500"
            gradient="from-orange-500/10 to-amber-500/5"
          />
          <StatsCard
            icon={<Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            title="Games Played"
            value={totalGamesPlayed}
            subtitle="Interactive games"
            trend={gameTrendText}
            trendPositive={gamesThisWeek > 0}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
            gradient="from-purple-500/10 to-pink-500/5"
          />
          <StatsCard
            icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            title="Achievements"
            value={totalAchievements}
            subtitle="Milestones earned"
            trend={achievementTrendText}
            trendPositive={achievementsThisMonth > 0}
            color="bg-gradient-to-br from-amber-500 to-yellow-500"
            gradient="from-amber-500/10 to-yellow-500/5"
          />
          <StatsCard
            icon={<Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            title="Songs Played"
            value={songsListenedCount}
            subtitle="Music listened"
            trend={songsListenedCount > 0 ? "Keep vibing!" : "Listen to music!"}
            trendPositive={songsListenedCount > 0}
            color="bg-gradient-to-br from-pink-500 to-rose-500"
            gradient="from-pink-500/10 to-rose-500/5"
          />
          <StatsCard
            icon={<Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            title="Videos Watched"
            value={videosWatchedCount}
            subtitle="Entertainment enjoyed"
            trend={videosWatchedCount > 0 ? "Nice!" : "Watch something!"}
            trendPositive={videosWatchedCount > 0}
            color="bg-gradient-to-br from-red-500 to-orange-500"
            gradient="from-red-500/10 to-orange-500/5"
          />
          </div>
        </div>

        {/* Activity Section - Improved with real data awareness */}
        <div className="animate-slide-up stagger-2">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl">
            <GlowingEffect disabled={false} proximity={100} spread={30} blur={1} borderWidth={1} />
            
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg">This Week&apos;s Activity</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {currentStreakDays > 0 
                        ? `${currentStreakDays} day streak! Keep it up!` 
                        : "Start your streak today!"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Weekly activity grid - Responsive */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  // Calculate which days should be marked as active based on streak
                  // The streak is consecutive days ending today (or last activity date)
                  const today = new Date()
                  const currentDayOfWeek = today.getDay() // 0 = Sunday
                  const adjustedDayIndex = i // 0 = Monday in our grid
                  
                  // Convert to same scale: Monday=0, ..., Sunday=6
                  const todayAdjusted = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1
                  
                  // Mark days as active if they're within the streak
                  // Streak counts back from today
                  const daysFromToday = todayAdjusted - adjustedDayIndex
                  const isActive = daysFromToday >= 0 && daysFromToday < currentStreakDays
                  const isToday = adjustedDayIndex === todayAdjusted
                  const isFuture = adjustedDayIndex > todayAdjusted
                  
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300",
                          isActive
                            ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                            : isFuture
                              ? "bg-muted/30 text-muted-foreground/50"
                              : "bg-muted/50 text-muted-foreground",
                          isToday && !isActive && "ring-2 ring-green-500/50 ring-offset-2 ring-offset-background"
                        )}
                      >
                        {isActive ? "✓" : day.charAt(0)}
                      </div>
                      <span className={cn(
                        "text-[10px] sm:text-xs font-medium",
                        isToday ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                      )}>
                        {day.slice(0, 3)}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              {/* Activity stats row */}
              {activityStats?.lastActivityDate && (
                <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Last active: {new Date(activityStats.lastActivityDate).toLocaleDateString()}</span>
                  <span className="text-green-600 dark:text-green-400">
                    {currentStreakDays >= longestStreakDays && currentStreakDays > 0 ? "🔥 Personal best!" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - Premium Style with responsive grid */}
        <div className="animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            <h2 className="font-semibold text-lg sm:text-xl">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="w-full justify-start h-16 sm:h-20 rounded-2xl border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:shadow-lg hover:scale-[1.02] transition-all group"
              onClick={() => router.push('/personality-insights')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-base">Personality Insights</div>
                <div className="text-xs sm:text-sm text-muted-foreground">View your profile</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Button>
            
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
              className="w-full justify-start h-16 sm:h-20 rounded-2xl border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl hover:bg-purple-500/5 hover:border-purple-500/20 hover:shadow-lg hover:scale-[1.02] transition-all group"
              onClick={() => router.push('/entertainment')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-base">Play Games</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Fun and learning</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Member Since - Enhanced */}
        <div className="animate-slide-up stagger-4 text-center py-6 sm:py-8 border-t border-border/30">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

