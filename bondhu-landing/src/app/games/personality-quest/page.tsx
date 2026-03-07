"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PersonalityQuest } from '@/components/games/personality-quest'
import { GameState, PersonalityDelta } from '@/types/game'
import { createClient } from '@/lib/supabase/client'
import { normalizeForProfile, mergeWithProfilePersonality } from '@/lib/games/personality-engine'

export default function PersonalityQuestPage() {
  const [playerName, setPlayerName] = useState('Traveler')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Load player name from profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
          
          if (profile?.full_name) {
            setPlayerName(profile.full_name.split(' ')[0])
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfile()
  }, [supabase])

  // Handle game end - save personality data and increment stats
  const handleGameEnd = async (finalState: GameState) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/entertainment')
        return
      }

      // Get current profile personality scores
      const { data: profile } = await supabase
        .from('profiles')
        .select('personality_openness, personality_conscientiousness, personality_extraversion, personality_agreeableness, personality_neuroticism')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Normalize game scores
        const normalizedGameScores = normalizeForProfile(finalState.personalityScores)
        
        const currentProfileScores: PersonalityDelta = {
          openness: profile.personality_openness || 50,
          conscientiousness: profile.personality_conscientiousness || 50,
          extraversion: profile.personality_extraversion || 50,
          agreeableness: profile.personality_agreeableness || 50,
          neuroticism: profile.personality_neuroticism || 50
        }

        // Merge game personality with profile (20% weight for game)
        const mergedScores = mergeWithProfilePersonality(currentProfileScores, normalizedGameScores, 0.2)

        // Update profile with merged scores
        await supabase
          .from('profiles')
          .update({
            personality_openness: mergedScores.openness,
            personality_conscientiousness: mergedScores.conscientiousness,
            personality_extraversion: mergedScores.extraversion,
            personality_agreeableness: mergedScores.agreeableness,
            personality_neuroticism: mergedScores.neuroticism
          })
          .eq('id', user.id)

        console.log('Personality updated from game:', mergedScores)
      }

      // Increment game stats in user_activity_stats table
      try {
        await fetch('/api/activity-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'increment_game',
            data: { gameName: 'Bondhu Quest' }
          })
        })
        console.log('Game stats incremented successfully')
      } catch (statsError) {
        console.error('Failed to update game stats:', statsError)
      }

      // Also update streak
      try {
        await fetch('/api/activity-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_streak'
          })
        })
      } catch (streakError) {
        console.error('Failed to update streak:', streakError)
      }

    } catch (error) {
      console.error('Error saving game results:', error)
    }

    router.push('/entertainment')
  }

  // Handle real-time personality updates (for live tracking)
  const handlePersonalityUpdate = (scores: PersonalityDelta) => {
    // Could send to analytics or show live updates elsewhere
    console.log('Personality update:', scores)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#212529] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">⚔️</div>
          <p className="text-gray-400">Loading quest...</p>
        </div>
      </div>
    )
  }

  return (
    <PersonalityQuest 
      playerName={playerName}
      onGameEnd={handleGameEnd}
      onPersonalityUpdate={handlePersonalityUpdate}
    />
  )
}
