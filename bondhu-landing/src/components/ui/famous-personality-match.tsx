"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Info, Star, Users } from "lucide-react"

interface FamousPersonality {
  id: string
  name: string
  short_name: string
  category: string
  nationality: string
  era: string
  notable_for: string
  personality_type: string
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  source_type: 'peer_reviewed' | 'expert_estimate' | 'curated'
  source_citation: string
  confidence_level: 'high' | 'medium' | 'low'
  similarity_score: number
  image_url: string | null
}

interface FamousPersonalityMatchProps {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

// Category icons and colors
const categoryConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  leader: { icon: "👑", color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-50 dark:bg-amber-950/20" },
  scientist: { icon: "🔬", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-50 dark:bg-blue-950/20" },
  artist: { icon: "🎨", color: "text-purple-700 dark:text-purple-300", bgColor: "bg-purple-50 dark:bg-purple-950/20" },
  humanitarian: { icon: "❤️", color: "text-rose-700 dark:text-rose-300", bgColor: "bg-rose-50 dark:bg-rose-950/20" },
  innovator: { icon: "💡", color: "text-yellow-700 dark:text-yellow-300", bgColor: "bg-yellow-50 dark:bg-yellow-950/20" },
  media: { icon: "📺", color: "text-indigo-700 dark:text-indigo-300", bgColor: "bg-indigo-50 dark:bg-indigo-950/20" },
  philosopher: { icon: "📚", color: "text-teal-700 dark:text-teal-300", bgColor: "bg-teal-50 dark:bg-teal-950/20" },
}

// Source type badges
const sourceTypeBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  peer_reviewed: { label: "Research-Backed", variant: "default" },
  expert_estimate: { label: "Expert Analysis", variant: "secondary" },
  curated: { label: "Curated", variant: "outline" },
}

// Confidence level colors
const confidenceColors: Record<string, string> = {
  high: "text-green-600 dark:text-green-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-gray-500 dark:text-gray-400",
}

export function FamousPersonalityMatch({
  openness,
  conscientiousness,
  extraversion,
  agreeableness,
  neuroticism,
}: FamousPersonalityMatchProps) {
  const [matches, setMatches] = useState<FamousPersonality[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: rpcError } = await supabase.rpc(
          'find_famous_personality_match',
          {
            p_openness: Math.round(openness),
            p_conscientiousness: Math.round(conscientiousness),
            p_extraversion: Math.round(extraversion),
            p_agreeableness: Math.round(agreeableness),
            p_neuroticism: Math.round(neuroticism),
            p_limit: 3,
          }
        )

        if (rpcError) {
          console.error('Error fetching famous matches:', rpcError)
          setError('Unable to find matches. Please try again later.')
          return
        }

        setMatches(data || [])
      } catch (err) {
        console.error('Error:', err)
        setError('Something went wrong.')
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if we have valid scores
    if (openness > 0 || conscientiousness > 0 || extraversion > 0) {
      fetchMatches()
    } else {
      setIsLoading(false)
    }
  }, [openness, conscientiousness, extraversion, agreeableness, neuroticism, supabase])

  if (isLoading) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Star className="h-6 w-6 mr-2 text-amber-500" />
            Famous Personality Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || matches.length === 0) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Star className="h-6 w-6 mr-2 text-amber-500" />
            Famous Personality Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {error || 'Complete your personality assessment to see your famous matches!'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const topMatch = matches[0]
  const otherMatches = matches.slice(1)
  const categoryInfo = categoryConfig[topMatch.category] || categoryConfig.leader

  return (
    <Card className="border-amber-200 dark:border-amber-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <Star className="h-6 w-6 mr-2 text-amber-500" />
            Famous Personality Match
          </div>
          <span 
            title="Matches are based on Big Five trait similarity using Euclidean distance. This is for entertainment and self-reflection only."
            className="cursor-help"
          >
            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Top Match - Featured */}
        <div className={`p-6 ${categoryInfo.bgColor} border-b`}>
          <div className="flex items-start space-x-4">
            {/* Avatar/Icon */}
            <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-4 border-amber-200 dark:border-amber-700 flex items-center justify-center text-4xl shadow-lg">
              {categoryConfig[topMatch.category]?.icon || "⭐"}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {topMatch.name}
                </h3>
                <Badge 
                  variant={sourceTypeBadge[topMatch.source_type]?.variant || "outline"}
                  className="text-xs"
                >
                  {sourceTypeBadge[topMatch.source_type]?.label || "Curated"}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {topMatch.nationality} • {topMatch.era}
              </p>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {topMatch.notable_for}
              </p>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                  {topMatch.personality_type}
                </Badge>
                <span 
                  className={`text-xs cursor-help ${confidenceColors[topMatch.confidence_level]}`}
                  title={topMatch.source_citation}
                >
                  {topMatch.confidence_level === 'high' ? '●●●' : topMatch.confidence_level === 'medium' ? '●●○' : '●○○'}
                  {' '}Confidence
                </span>
              </div>
            </div>
            
            {/* Similarity Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                {topMatch.similarity_score}%
              </div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>
          </div>
        </div>

        {/* Other Matches */}
        {otherMatches.length > 0 && (
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Other similar personalities</span>
            </div>
            <div className="space-y-3">
              {otherMatches.map((match, index) => (
                <div 
                  key={match.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl">
                    {categoryConfig[match.category]?.icon || "⭐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {match.name}
                      </h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {match.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {match.nationality} • {match.personality_type}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                      {match.similarity_score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground text-center border-t pt-3">
            🎭 For entertainment and self-reflection purposes. Personality assessments are approximations 
            based on historical records and expert analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
