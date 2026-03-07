"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Play, 
  Gamepad2, 
  Video, 
  Headphones, 
  RefreshCw,
  Sparkles,
  ChevronRight,
  Loader2
} from "lucide-react"
import AnimatedLoader from "@/components/ui/animated-loader"
import { toast } from "sonner"
import type { Profile } from "@/types/auth"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import VideoRecommendations from "@/components/video-recommendations"
import MusicRecommendationsSpotify from "@/components/music-recommendations-spotify"
import Link from "next/link"
import { BottomNav } from "@/components/ui/bottom-nav"
import { cn } from "@/lib/utils"
import { useSwipe, usePullToRefresh } from "@/hooks/use-swipe"

// Import new entertainment components
import {
  EntertainmentHero,
  SectionTabs,
  type SectionType,
  GameCard,
  GameCarousel,
  type GameData as NewGameData,
} from "@/components/entertainment"

// Game Components (keep existing implementations)
const PuzzleMaster = ({ onGameComplete }: { onGameComplete: (data: GameCompletionData) => void }) => (
  <div className="p-6 sm:p-8 text-center bg-gradient-to-br from-purple-500/10 to-violet-500/5 rounded-2xl">
    <div className="text-6xl mb-4">🧩</div>
    <h3 className="text-xl font-bold mb-2">Puzzle Master</h3>
    <p className="text-muted-foreground mb-6">Challenge your mind with spatial puzzles</p>
    <Button 
      onClick={() => onGameComplete({
        gameId: 'puzzle_master',
        completionRate: 85,
        performance: { creativity: 75, speed: 80, accuracy: 90 },
        emotionalState: 'focused'
      })}
      className="bg-gradient-to-r from-purple-500 to-violet-600"
    >
      Complete Demo
    </Button>
  </div>
)

const MemoryPalace = ({ onGameComplete }: { onGameComplete: (data: GameCompletionData) => void }) => (
  <div className="p-6 sm:p-8 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl">
    <div className="text-6xl mb-4">🧠</div>
    <h3 className="text-xl font-bold mb-2">Memory Palace</h3>
    <p className="text-muted-foreground mb-6">Train your memory with visual patterns</p>
    <Button 
      onClick={() => onGameComplete({
        gameId: 'memory_palace',
        completionRate: 92,
        performance: { creativity: 60, speed: 85, accuracy: 95 },
        emotionalState: 'determined'
      })}
      className="bg-gradient-to-r from-green-500 to-emerald-600"
    >
      Complete Demo
    </Button>
  </div>
)

const ColorSymphony = ({ onGameComplete }: { onGameComplete: (data: GameCompletionData) => void }) => (
  <div className="p-6 sm:p-8 text-center bg-gradient-to-br from-pink-500/10 to-rose-500/5 rounded-2xl">
    <div className="text-6xl mb-4">🎨</div>
    <h3 className="text-xl font-bold mb-2">Color Symphony</h3>
    <p className="text-muted-foreground mb-6">Express creativity through color mixing</p>
    <Button 
      onClick={() => onGameComplete({
        gameId: 'color_symphony',
        completionRate: 78,
        performance: { creativity: 95, speed: 70, accuracy: 80 },
        emotionalState: 'creative'
      })}
      className="bg-gradient-to-r from-pink-500 to-rose-600"
    >
      Complete Demo
    </Button>
  </div>
)

// Types
interface GameCompletionData {
  gameId: string
  completionRate: number
  performance: {
    creativity: number
    speed: number
    accuracy: number
  }
  emotionalState: string
}

interface ActivityData {
  type: 'game' | 'video' | 'music'
  name: string
  duration: number
  timestamp: string
  performance?: {
    creativity: number
    speed: number
    accuracy: number
  }
  completionRate?: number
  category?: string
  interaction?: string
}

// Enhanced AI Learning Engine
class EnhancedAILearningEngine {
  private supabase = createClient()
  private profileId: string | null = null

  constructor(profileId: string) {
    this.profileId = profileId
  }

  async addGameplayData(data: GameCompletionData & { userId: string; timestamp: string; sessionDuration: number }) {
    try {
      const analysisData = {
        profile_id: this.profileId,
        content_type: 'game',
        content_id: data.gameId,
        interaction_data: data,
        insights: this.analyzeGameplayPatterns(data),
        timestamp: new Date().toISOString(),
        emotional_state: data.emotionalState,
        performance_metrics: data.performance
      }
      console.log('Enhanced game analysis:', analysisData)
      return this.getPersonalizedGameRecommendations(data)
    } catch (error) {
      console.error('Error storing gameplay data:', error)
    }
  }

  async addVideoData(data: { contentId: string; watchTime: number; completionRate: number; interactions: string[]; category?: string }) {
    try {
      const analysisData = {
        profile_id: this.profileId,
        content_type: 'video',
        content_id: data.contentId,
        watch_time: data.watchTime,
        completion_rate: data.completionRate,
        interaction_patterns: data.interactions,
        timestamp: new Date().toISOString()
      }
      console.log('Enhanced video analysis:', analysisData)
      return this.getPersonalizedVideoRecommendations(data)
    } catch (error) {
      console.error('Error storing video data:', error)
    }
  }

  private analyzeGameplayPatterns(data: GameCompletionData) {
    return {
      problemSolvingStyle: this.determineProblemSolvingStyle(data.performance),
      stressResponse: this.analyzeStressResponse(data.performance, data.emotionalState),
      learningPreference: this.identifyLearningPreference(data),
      personalityTraits: this.extractPersonalityTraits(data)
    }
  }

  private determineProblemSolvingStyle(performance: { speed: number; accuracy: number; creativity: number }) {
    if (performance.speed > 80 && performance.accuracy > 85) return 'analytical_fast'
    if (performance.creativity > 80) return 'creative_explorer'
    if (performance.accuracy > 90) return 'methodical_precise'
    return 'balanced_approach'
  }

  private analyzeStressResponse(performance: { accuracy: number; speed: number }, emotionalState: string) {
    return {
      performance_drop: performance.accuracy < 70,
      time_pressure_effect: performance.speed < 50,
      emotional_response: emotionalState
    }
  }

  private identifyLearningPreference(data: GameCompletionData) {
    return {
      visual: data.gameId.includes('color') || data.gameId.includes('puzzle'),
      kinesthetic: data.performance.speed > 75,
      analytical: data.performance.accuracy > 85
    }
  }

  private extractPersonalityTraits(data: GameCompletionData) {
    return {
      openness: data.performance.creativity,
      conscientiousness: data.performance.accuracy,
      extraversion: data.completionRate > 90 ? 75 : 45,
      agreeableness: 65,
      neuroticism: this.calculateNeuroticism(data.emotionalState, data.performance)
    }
  }

  private calculateNeuroticism(emotionalState: string, performance: { accuracy: number }) {
    const stressKeywords = ['anxious', 'frustrated', 'overwhelmed']
    const isStressed = stressKeywords.some(keyword => emotionalState.includes(keyword))
    return isStressed ? Math.max(70, 100 - performance.accuracy) : Math.min(40, 60 - performance.accuracy / 2)
  }

  private getPersonalizedGameRecommendations(data: GameCompletionData) {
    const recommendations = []
    if (data.performance.creativity > 80) {
      recommendations.push({
        type: 'creative_games',
        reason: 'High creativity score detected',
        games: ['color_symphony', 'artistic_expression', 'story_builder']
      })
    }
    if (data.performance.accuracy > 85) {
      recommendations.push({
        type: 'strategy_games',
        reason: 'Excellent precision and attention to detail',
        games: ['chess_master', 'logic_puzzles', 'pattern_recognition']
      })
    }
    return recommendations
  }

  private getPersonalizedVideoRecommendations(data: { completionRate: number }) {
    const recommendations = []
    if (data.completionRate > 80) {
      recommendations.push({
        type: 'deep_content',
        reason: 'High engagement with educational content',
        categories: ['advanced_psychology', 'neuroscience', 'philosophy']
      })
    }
    return recommendations
  }
}

// Available Games Data
const availableGames: NewGameData[] = [
  {
    id: 'personality_quest',
    name: 'Bondhu Quest',
    description: 'An epic RPG adventure where YOUR choices reveal YOUR personality! Every decision shapes who you are.',
    icon: '⚔️',
    category: 'rpg',
    difficulty: 'easy',
    duration: '5-10 min',
    insights: ['All Big 5 Traits', 'Decision Making', 'Values & Priorities'],
    popularity: 98,
    recentPlays: 512,
    featured: true,
  },
  {
    id: 'puzzle_master',
    name: 'Puzzle Master',
    description: 'Challenge your mind with spatial reasoning puzzles that reveal your problem-solving style.',
    icon: '🧩',
    category: 'puzzle',
    difficulty: 'medium',
    duration: '5-10 min',
    insights: ['Problem Solving', 'Spatial Reasoning', 'Pattern Recognition'],
    popularity: 87,
    recentPlays: 234,
  },
  {
    id: 'memory_palace',
    name: 'Memory Palace',
    description: 'Build your memory skills through visual pattern recognition and recall exercises.',
    icon: '🧠',
    category: 'memory',
    difficulty: 'medium',
    duration: '8-12 min',
    insights: ['Memory', 'Focus', 'Attention'],
    popularity: 92,
    recentPlays: 189,
  },
  {
    id: 'color_symphony',
    name: 'Color Symphony',
    description: 'Express your creativity through color mixing and artistic expression challenges.',
    icon: '🎨',
    category: 'creative',
    difficulty: 'easy',
    duration: '5-8 min',
    insights: ['Creativity', 'Emotional Expression', 'Aesthetic Sense'],
    popularity: 78,
    recentPlays: 156,
  },
]

// Game Components Map
const gameComponents: Record<string, React.ComponentType<{ onGameComplete: (data: GameCompletionData) => void }>> = {
  puzzle_master: PuzzleMaster,
  memory_palace: MemoryPalace,
  color_symphony: ColorSymphony,
}

// Helper functions
function calculateStreak(history: ActivityData[]) {
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const hasActivity = history.some(activity => {
      const activityDate = new Date(activity.timestamp)
      return activityDate.toDateString() === checkDate.toDateString()
    })
    if (hasActivity) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

async function loadUserPreferences(_userId: string) {
  return {
    favoriteGameTypes: ['puzzle', 'strategy'],
    preferredVideoLength: 'medium',
    musicMoods: ['Focus', 'Relax'],
    playingTime: 'evening',
    difficulty: 'medium'
  }
}

async function loadActivityHistory(userId: string): Promise<ActivityData[]> {
  // This function now returns empty - actual stats come from user_activity_stats table
  // In the future, this could load detailed activity logs
  return []
}

// Load stats from user_activity_stats table
async function loadUserActivityStats(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from('user_activity_stats')
    .select('games_played_count, videos_watched_count, songs_listened_count, current_streak_days')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error loading activity stats:', error)
    // Try to create the row if it doesn't exist
    if (error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('user_activity_stats')
        .insert({ user_id: userId })
        .select('games_played_count, videos_watched_count, songs_listened_count, current_streak_days')
        .single()
      
      if (insertError) {
        console.error('Error creating activity stats:', insertError)
        return null
      }
      return newData
    }
    return null
  }
  
  return data
}

// Increment game played count
async function incrementGamePlayed(supabase: ReturnType<typeof createClient>, userId: string, gameDuration: number = 5) {
  try {
    // Call the RPC function
    const { error: rpcError } = await supabase.rpc('increment_game_played', {
      user_id: userId,
      game_duration: gameDuration
    })
    
    if (rpcError) {
      // Fallback: direct update if RPC doesn't exist
      console.log('RPC not available, using direct update')
      const { error: updateError } = await supabase
        .from('user_activity_stats')
        .update({
          games_played_count: supabase.rpc('increment', { x: 1 }),
          total_games_played: supabase.rpc('increment', { x: 1 }),
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (updateError) {
        // Simplest fallback
        const { data: current } = await supabase
          .from('user_activity_stats')
          .select('games_played_count, total_games_played')
          .eq('user_id', userId)
          .single()
        
        if (current) {
          await supabase
            .from('user_activity_stats')
            .update({
              games_played_count: (current.games_played_count || 0) + 1,
              total_games_played: (current.total_games_played || 0) + 1,
              last_activity_date: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      }
    }
    return true
  } catch (error) {
    console.error('Error incrementing game played:', error)
    return false
  }
}

async function generatePersonalizedContent(_userId: string, _preferences: unknown, _history: unknown) {
  return { videos: [], games: [], music: [] }
}

// Main Page Component
export default function EntertainmentHubPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userPreferences, setUserPreferences] = useState<unknown>(null)
  const [activityHistory, setActivityHistory] = useState<ActivityData[]>([])
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<{ videos?: unknown[]; games?: unknown[]; music?: unknown[] } | null>(null)
  const [dbStats, setDbStats] = useState<{
    games_played_count: number
    videos_watched_count: number
    songs_listened_count: number
    current_streak_days: number
  } | null>(null)
  const [activeSection, setActiveSection] = useState<SectionType>("games")
  const router = useRouter()
  const supabase = createClient()
  const aiEngine = useRef<EnhancedAILearningEngine | null>(null)

  // Add activity to history
  const addActivityToHistory = useCallback((activity: ActivityData) => {
    setActivityHistory(prev => [...prev, activity])
  }, [])

  // Calculate user stats - prefer database stats over local history
  const userStats = useMemo(() => {
    // Use database stats if available
    if (dbStats) {
      return {
        gamesPlayed: dbStats.games_played_count || 0,
        videosWatched: dbStats.videos_watched_count || 0,
        musicListened: dbStats.songs_listened_count || 0,
        streak: dbStats.current_streak_days || 0,
      }
    }
    
    // Fallback to local activity history
    const gamesPlayed = activityHistory.filter(a => a.type === 'game').length
    const videosWatched = activityHistory.filter(a => a.type === 'video').length
    const totalTime = activityHistory.reduce((acc, a) => acc + (a.duration || 0), 0)
    return {
      gamesPlayed,
      videosWatched,
      musicListened: Math.round(totalTime / 60),
      streak: activityHistory.length > 0 ? calculateStreak(activityHistory) : 0,
    }
  }, [activityHistory, dbStats])

  // Load user data
  const loadUserData = useCallback(async (userId: string) => {
    try {
      aiEngine.current = new EnhancedAILearningEngine(userId)
      const preferences = await loadUserPreferences(userId)
      setUserPreferences(preferences)
      const history = await loadActivityHistory(userId)
      setActivityHistory(history)
      const recommendations = await generatePersonalizedContent(userId, preferences, history)
      setPersonalizedRecommendations(recommendations)
      
      // Load stats from database
      const stats = await loadUserActivityStats(supabase, userId)
      if (stats) {
        setDbStats(stats)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [supabase])

  // Initial load
  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/sign-in')
          return
        }
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
        await loadUserData(user.id)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    getProfile()
  }, [supabase, router, loadUserData])

  // Handle URL params for OAuth callbacks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('spotify_connected') === 'true') {
        setActiveSection('music')
        toast.success('🎵 Spotify connected successfully!')
        window.history.replaceState({}, document.title, window.location.pathname)
      } else if (urlParams.get('spotify_error')) {
        setActiveSection('music')
        toast.error(`Spotify connection failed: ${urlParams.get('spotify_error')}`)
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  // Section tabs configuration
  const sectionTabs = [
    { id: "games" as const, label: "Games", icon: <Gamepad2 className="w-full h-full" />, color: "green" as const },
    { id: "videos" as const, label: "Videos", icon: <Video className="w-full h-full" />, color: "blue" as const },
    { id: "music" as const, label: "Music", icon: <Headphones className="w-full h-full" />, color: "purple" as const },
  ]

  // Swipe navigation between sections
  const sections: SectionType[] = ["games", "videos", "music"]
  const currentIndex = sections.indexOf(activeSection)
  
  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1])
    }
  }, [currentIndex])

  const handleSwipeRight = useCallback(() => {
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1])
    }
  }, [currentIndex])

  const { ref: swipeRef } = useSwipe<HTMLDivElement>({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
  })

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    if (profile) {
      await loadUserData(profile.id)
      toast.success('Content refreshed!')
    }
  }, [profile, loadUserData])

  const { isRefreshing, pullDistance, pullProgress } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <AnimatedLoader size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Button onClick={() => router.push('/sign-in')}>
            Return to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-[60] flex justify-center pt-4 pointer-events-none"
          style={{ transform: `translateY(${Math.min(pullDistance, 60)}px)` }}
        >
          <div 
            className={cn(
              "w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center",
              "border border-primary/20 shadow-lg",
              pullProgress >= 1 && "animate-pulse"
            )}
          >
            <RefreshCw 
              className={cn(
                "w-5 h-5 text-primary transition-transform",
                isRefreshing && "animate-spin"
              )}
              style={{ transform: `rotate(${pullProgress * 360}deg)` }}
            />
          </div>
        </div>
      )}

      {/* Minimal Header */}
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
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={swipeRef} className="max-w-4xl mx-auto px-4 py-6 pb-bottom-nav space-y-6">
        {/* Hero Section */}
        <div className="animate-slide-up">
          <EntertainmentHero
            userName={profile.full_name?.split(' ')[0]}
            stats={userStats}
            activeSection={activeSection}
          />
        </div>

        {/* Section Tabs */}
        <div className="animate-slide-up stagger-1">
          <SectionTabs
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            tabs={sectionTabs}
          />
        </div>

        {/* Content Sections */}
        <div className="animate-slide-up stagger-2 relative">
          {activeSection === "games" && (
            <GamesSection
              profile={profile}
              userPreferences={userPreferences}
              aiEngine={aiEngine.current}
              recommendations={personalizedRecommendations?.games as string[] | undefined}
              addActivityToHistory={addActivityToHistory}
            />
          )}
          {activeSection === "videos" && (
            <VideosSection
              profile={profile}
              aiEngine={aiEngine.current}
              addActivityToHistory={addActivityToHistory}
            />
          )}
          {activeSection === "music" && (
            <div className="space-y-4">
              <MusicRecommendationsSpotify />
            </div>
          )}
        </div>

        {/* Swipe Indicator - Mobile Only */}
        <div className="sm:hidden flex items-center justify-center gap-2 py-4 text-muted-foreground/50">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            activeSection === "games" ? "bg-green-500" : "bg-muted-foreground/30"
          )} />
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            activeSection === "videos" ? "bg-blue-500" : "bg-muted-foreground/30"
          )} />
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            activeSection === "music" ? "bg-purple-500" : "bg-muted-foreground/30"
          )} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

// Games Section Component
function GamesSection({
  profile,
  aiEngine,
  recommendations,
  addActivityToHistory,
}: {
  profile: Profile
  userPreferences: unknown
  aiEngine: EnhancedAILearningEngine | null
  recommendations?: string[]
  addActivityToHistory: (activity: ActivityData) => void
}) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameStats, setGameStats] = useState<Record<string, { completions?: number; bestScore?: number; averageScore?: number; startTime?: number }>>({})
  const router = useRouter()

  const handleGameComplete = useCallback(async (gameData: GameCompletionData) => {
    const enhancedData = {
      ...gameData,
      userId: profile.id,
      timestamp: new Date().toISOString(),
      sessionDuration: Date.now() - (gameStats[gameData.gameId]?.startTime || Date.now())
    }

    setSelectedGame(null)

    // Update activity stats
    try {
      const gameNames: Record<string, string> = {
        'puzzle_master': 'Puzzle Master',
        'memory_palace': 'Memory Palace',
        'color_symphony': 'Color Symphony',
        'personality_quest': 'Bondhu Quest'
      }
      await fetch('/api/activity-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'increment_game',
          data: { gameName: gameNames[gameData.gameId] || gameData.gameId }
        })
      })
    } catch (statsError) {
      console.error('Failed to update game stats:', statsError)
    }

    // Add to activity history
    addActivityToHistory({
      type: 'game',
      name: gameData.gameId,
      duration: enhancedData.sessionDuration / 1000,
      timestamp: enhancedData.timestamp,
      performance: gameData.performance,
      completionRate: gameData.completionRate
    })

    // Update game stats
    setGameStats(prev => ({
      ...prev,
      [gameData.gameId]: {
        ...prev[gameData.gameId],
        completions: (prev[gameData.gameId]?.completions || 0) + 1,
        bestScore: Math.max(prev[gameData.gameId]?.bestScore || 0, gameData.completionRate),
        averageScore: prev[gameData.gameId]?.averageScore 
          ? ((prev[gameData.gameId].averageScore! * (prev[gameData.gameId].completions || 0)) + gameData.completionRate) / ((prev[gameData.gameId].completions || 0) + 1)
          : gameData.completionRate
      }
    }))

    // Send to AI engine
    if (aiEngine) {
      await aiEngine.addGameplayData(enhancedData)
    }

    toast.success('Game completed! Your personality insights have been updated.')
  }, [profile.id, gameStats, aiEngine, addActivityToHistory])

  const startGame = useCallback((gameId: string) => {
    // For Personality Quest, navigate to dedicated page
    if (gameId === 'personality_quest') {
      router.push('/games/personality-quest')
      return
    }
    
    setSelectedGame(gameId)
    setGameStats(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], startTime: Date.now() }
    }))
  }, [router])

  // Show active game
  if (selectedGame) {
    const GameComponent = gameComponents[selectedGame]
    const gameInfo = availableGames.find(g => g.id === selectedGame)
    
    return (
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{gameInfo?.icon}</span>
              <div>
                <CardTitle>{gameInfo?.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{gameInfo?.description}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedGame(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <GameComponent onGameComplete={handleGameComplete} />
        </CardContent>
      </Card>
    )
  }

  // Show game selection
  return (
    <div className="space-y-6">
      {/* Quick Play Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-500" />
            Games for You
          </h2>
          <p className="text-sm text-muted-foreground">
            Play games that help Bondhu understand your personality
          </p>
        </div>
        <Button variant="ghost" size="sm">
          See All <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Game Stats Summary */}
      {Object.keys(gameStats).length > 0 && (
        <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">
                  {Object.values(gameStats).reduce((acc, s) => acc + (s.completions || 0), 0)}
                </span>
                <span className="text-muted-foreground">games played</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">
                  {Math.round(Object.values(gameStats).reduce((acc, s) => acc + (s.bestScore || 0), 0) / Math.max(Object.keys(gameStats).length, 1))}%
                </span>
                <span className="text-muted-foreground">avg best score</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Cards - Horizontal Scroll on Mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 scrollbar-hide snap-x snap-mandatory sm:snap-none">
        {availableGames.map((game, index) => (
          <div 
            key={game.id} 
            className={cn(
              "flex-shrink-0 w-[280px] sm:w-auto snap-start",
              `animate-slide-up stagger-${index + 1}`
            )}
          >
            <GameCard
              game={game}
              onPlay={startGame}
              isRecommended={recommendations?.includes(game.id)}
              stats={gameStats[game.id]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Videos Section Component
function VideosSection({
  profile,
  aiEngine,
  addActivityToHistory,
}: {
  profile: Profile
  aiEngine: EnhancedAILearningEngine | null
  addActivityToHistory: (activity: ActivityData) => void
}) {
  const [personalityProfile, setPersonalityProfile] = useState<{
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  } | null>(null)
  const [youtubeConnected, setYoutubeConnected] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Check YouTube connection status on mount
  useEffect(() => {
    const checkYouTubeConnection = async () => {
      try {
        const response = await fetch(`/api/v1/auth/youtube/status/${profile.id}`)
        if (response.ok) {
          const data = await response.json()
          setYoutubeConnected(data.connected || false)
        }
      } catch (error) {
        console.error('Error checking YouTube connection:', error)
        setYoutubeConnected(false)
      }
    }

    // Load personality profile
    setPersonalityProfile({
      openness: 0.7,
      conscientiousness: 0.6,
      extraversion: 0.5,
      agreeableness: 0.8,
      neuroticism: 0.3
    })

    checkYouTubeConnection()

    // Check URL parameters for OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('youtube_connected') === 'true') {
      setYoutubeConnected(true)
      toast.success('🎉 YouTube connected successfully!')
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (urlParams.get('youtube_error')) {
      setConnectionError(urlParams.get('youtube_error'))
      toast.error(`Failed to connect YouTube: ${urlParams.get('youtube_error')}`)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [profile.id])

  const handleYouTubeConnect = useCallback(async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const response = await fetch(`/api/v1/auth/youtube/connect?user_id=${profile.id}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (error) {
      console.error('Error connecting to YouTube:', error)
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect')
      toast.error('Failed to connect to YouTube. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }, [profile.id])

  const handleYouTubeDisconnect = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/auth/youtube/disconnect/${profile.id}`, {
        method: 'POST'
      })
      if (response.ok) {
        setYoutubeConnected(false)
        toast.success('YouTube disconnected successfully')
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('Error disconnecting YouTube:', error)
      toast.error('Failed to disconnect YouTube. Please try again.')
    }
  }, [profile.id])

  const handleVideoInteraction = useCallback(async (video: { id: string; title: string; category_name?: string; duration_seconds?: number }, interaction: string) => {
    addActivityToHistory({
      type: 'video',
      name: video.title,
      duration: interaction === 'watch' ? (video.duration_seconds || 0) : 0,
      timestamp: new Date().toISOString(),
      category: video.category_name,
      interaction: interaction
    })

    if (aiEngine) {
      await aiEngine.addVideoData({
        contentId: video.id,
        watchTime: interaction === 'watch' ? (video.duration_seconds || 0) * 0.8 : 0,
        completionRate: interaction === 'watch' ? 80 : interaction === 'like' ? 100 : 0,
        interactions: [interaction],
        category: video.category_name
      })
    }
  }, [aiEngine, addActivityToHistory])

  return (
    <div className="space-y-6">
      {/* YouTube Connection Status Card */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-red-500/5 via-red-500/10 to-transparent">
        <CardContent className="p-4 sm:p-6">
          {youtubeConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    YouTube Connected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Getting personalized recommendations from your data
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleYouTubeDisconnect}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Connect YouTube</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get personalized video recommendations based on your watch history and subscriptions.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Better Recommendations
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      AI Personality Matching
                    </Badge>
                  </div>
                </div>
              </div>

              {connectionError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Connection failed: {connectionError}
                  </p>
                </div>
              )}

              <Button
                onClick={handleYouTubeConnect}
                disabled={isConnecting}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Connect YouTube
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Recommendations */}
      <VideoRecommendations
        userId={profile.id}
        personalityProfile={personalityProfile || {
          openness: 0.5,
          conscientiousness: 0.5,
          extraversion: 0.5,
          agreeableness: 0.5,
          neuroticism: 0.5
        }}
        onVideoInteraction={handleVideoInteraction}
      />
    </div>
  )
}
