"use client"

import { motion } from "framer-motion"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { PersonalityScores } from "@/types/personality"
import { cn } from "@/lib/utils"

interface PersonalityRadarChartProps {
  scores: PersonalityScores
  className?: string
  showAnimation?: boolean
}

export function PersonalityRadarChart({ 
  scores, 
  className,
  showAnimation = true 
}: PersonalityRadarChartProps) {
  // Transform scores for radar chart - shorter names for mobile
  const chartData = [
    {
      trait: 'Open',
      fullName: 'Openness to Experience',
      score: scores.openness,
      color: '#22c55e'
    },
    {
      trait: 'Extra',
      fullName: 'Extraversion',
      score: scores.extraversion,
      color: '#8b5cf6'
    },
    {
      trait: 'Agree',
      fullName: 'Agreeableness',
      score: scores.agreeableness,
      color: '#f59e0b'
    },
    {
      trait: 'Consc',
      fullName: 'Conscientiousness',
      score: scores.conscientiousness,
      color: '#3b82f6'
    },
    {
      trait: 'Sens',
      fullName: 'Emotional Sensitivity',
      score: scores.neuroticism,
      color: '#f97316'
    }
  ]

  // Full names for the score breakdown cards
  const fullTraitNames: Record<string, string> = {
    'Open': 'Openness',
    'Extra': 'Extraversion',
    'Agree': 'Agreeableness',
    'Consc': 'Conscientiousness',
    'Sens': 'Sensitivity'
  }

  const getPersonalityType = () => {
    const maxTrait = chartData.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    )
    const secondMax = chartData
      .filter(trait => trait !== maxTrait)
      .reduce((prev, current) => prev.score > current.score ? prev : current)
    
    return `${fullTraitNames[maxTrait.trait]} & ${fullTraitNames[secondMax.trait]}`
  }

  const personalityType = getPersonalityType()

  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, scale: 0.95 } : {}}
      animate={showAnimation ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("space-y-4 sm:space-y-6", className)}
    >
      {/* Chart Container - Mobile optimized */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-white/10">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative p-4 sm:p-6">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 sm:mb-2">Your Personality Profile</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Dominant: <span className="font-medium text-primary">{personalityType}</span>
            </p>
          </div>

          {/* Radar chart - responsive height */}
          <div className="h-56 sm:h-72 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <PolarGrid 
                  gridType="polygon" 
                  className="opacity-30"
                />
                <PolarAngleAxis 
                  dataKey="trait" 
                  tick={{ 
                    fontSize: 10, 
                    fontWeight: 500,
                    fill: 'hsl(var(--foreground))'
                  }}
                  className="text-foreground"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ 
                    fontSize: 8,
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  tickCount={5}
                />
                <Radar
                  name="Personality"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={{ 
                    r: 3, 
                    fill: "hsl(var(--primary))",
                    strokeWidth: 2,
                    stroke: "hsl(var(--background))"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Score Breakdown - Horizontal scroll on mobile, grid on desktop */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 min-w-max sm:min-w-0">
          {chartData.map((trait, index) => (
            <motion.div
              key={trait.trait}
              initial={showAnimation ? { opacity: 0, y: 15 } : {}}
              animate={showAnimation ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: showAnimation ? index * 0.08 : 0 }}
              className="w-32 sm:w-auto shrink-0 sm:shrink bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: trait.color }}
                />
                <h4 className="font-medium text-xs sm:text-sm truncate">{fullTraitNames[trait.trait]}</h4>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold" style={{ color: trait.color }}>
                    {trait.score}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">/ 100</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <motion.div
                    initial={showAnimation ? { width: 0 } : { width: `${trait.score}%` }}
                    animate={{ width: `${trait.score}%` }}
                    transition={{ duration: 0.8, delay: showAnimation ? index * 0.08 + 0.3 : 0, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: trait.color }}
                  />
                </div>
                
                {/* Level indicator */}
                <div className="text-center">
                  <span className={cn(
                    "text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium",
                    trait.score <= 30 
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : trait.score <= 70
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  )}>
                    {trait.score <= 30 ? 'Low' : trait.score <= 70 ? 'Moderate' : 'High'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Compact view for dashboard/profile pages
export function PersonalityRadarChartCompact({ 
  scores, 
  className 
}: PersonalityRadarChartProps) {
  const chartData = [
    { trait: 'O', fullName: 'Openness', score: scores.openness, color: '#22c55e' },
    { trait: 'E', fullName: 'Extraversion', score: scores.extraversion, color: '#8b5cf6' },
    { trait: 'A', fullName: 'Agreeableness', score: scores.agreeableness, color: '#f59e0b' },
    { trait: 'C', fullName: 'Conscientiousness', score: scores.conscientiousness, color: '#3b82f6' },
    { trait: 'S', fullName: 'Sensitivity', score: scores.neuroticism, color: '#f97316' }
  ]

  return (
    <div className={cn(
      "bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4", 
      className
    )}>
      <div className="h-36 sm:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid gridType="polygon" className="opacity-20" />
            <PolarAngleAxis 
              dataKey="trait" 
              tick={{ fontSize: 9, fill: 'hsl(var(--foreground))' }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} />
            <Radar
              name="Personality"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 2, fill: "hsl(var(--primary))" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
