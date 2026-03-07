import { PersonalityDelta, GameChoice, GameState, PersonalitySnapshot } from '@/types/game'

// Initial personality scores (neutral baseline)
export const INITIAL_PERSONALITY: PersonalityDelta = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50
}

// Create initial game state
export function createInitialGameState(playerName: string = 'Traveler'): GameState {
  return {
    currentScene: 'intro',
    visitedScenes: [],
    choiceHistory: [],
    personalityScores: { ...INITIAL_PERSONALITY },
    playerName,
    chapter: 1,
    startTime: Date.now(),
    totalChoices: 0
  }
}

// Apply a choice's personality impact to the current scores
export function applyChoiceToPersonality(
  currentScores: PersonalityDelta,
  choice: GameChoice
): PersonalityDelta {
  const weight = choice.weight || 1
  
  return {
    openness: clampScore(currentScores.openness + (choice.personality.openness * weight)),
    conscientiousness: clampScore(currentScores.conscientiousness + (choice.personality.conscientiousness * weight)),
    extraversion: clampScore(currentScores.extraversion + (choice.personality.extraversion * weight)),
    agreeableness: clampScore(currentScores.agreeableness + (choice.personality.agreeableness * weight)),
    neuroticism: clampScore(currentScores.neuroticism + (choice.personality.neuroticism * weight))
  }
}

// Keep scores within 0-100 range
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

// Get the dominant personality trait
export function getDominantTrait(scores: PersonalityDelta): keyof PersonalityDelta {
  const traits = Object.entries(scores) as [keyof PersonalityDelta, number][]
  
  // For neuroticism, lower is "stronger" (emotional stability)
  const adjusted = traits.map(([trait, value]) => ({
    trait,
    strength: trait === 'neuroticism' ? 100 - value : value
  }))
  
  adjusted.sort((a, b) => b.strength - a.strength)
  return adjusted[0].trait
}

// Get the secondary personality trait
export function getSecondaryTrait(scores: PersonalityDelta): keyof PersonalityDelta {
  const dominant = getDominantTrait(scores)
  const traits = Object.entries(scores) as [keyof PersonalityDelta, number][]
  
  const adjusted = traits
    .filter(([trait]) => trait !== dominant)
    .map(([trait, value]) => ({
      trait,
      strength: trait === 'neuroticism' ? 100 - value : value
    }))
  
  adjusted.sort((a, b) => b.strength - a.strength)
  return adjusted[0].trait
}

// Get personality description based on scores
export function getPersonalityDescription(scores: PersonalityDelta): string {
  const dominant = getDominantTrait(scores)
  const secondary = getSecondaryTrait(scores)
  
  const descriptions: Record<keyof PersonalityDelta, string> = {
    openness: 'curious and creative',
    conscientiousness: 'organized and determined',
    extraversion: 'outgoing and energetic',
    agreeableness: 'compassionate and cooperative',
    neuroticism: 'thoughtful and careful'
  }
  
  return `You appear to be ${descriptions[dominant]} with a ${descriptions[secondary]} side.`
}

// Generate a personality snapshot for display
export function generatePersonalitySnapshot(scores: PersonalityDelta): PersonalitySnapshot {
  return {
    scores,
    dominantTrait: getDominantTrait(scores),
    secondaryTrait: getSecondaryTrait(scores),
    description: getPersonalityDescription(scores)
  }
}

// Get trait display name
export function getTraitDisplayName(trait: keyof PersonalityDelta): string {
  const names: Record<keyof PersonalityDelta, string> = {
    openness: 'Openness',
    conscientiousness: 'Conscientiousness',
    extraversion: 'Extraversion',
    agreeableness: 'Agreeableness',
    neuroticism: 'Emotional Stability'
  }
  return names[trait]
}

// Get trait color for UI
export function getTraitColor(trait: keyof PersonalityDelta): string {
  const colors: Record<keyof PersonalityDelta, string> = {
    openness: '#22c55e',      // Green
    conscientiousness: '#3b82f6', // Blue
    extraversion: '#8b5cf6',  // Purple
    agreeableness: '#f59e0b', // Amber
    neuroticism: '#ef4444'    // Red (but displayed as stability)
  }
  return colors[trait]
}

// Get trait emoji for UI
export function getTraitEmoji(trait: keyof PersonalityDelta): string {
  const emojis: Record<keyof PersonalityDelta, string> = {
    openness: '🎨',
    conscientiousness: '📋',
    extraversion: '🎉',
    agreeableness: '💝',
    neuroticism: '🧘'
  }
  return emojis[trait]
}

// Calculate personality delta (change) from a choice
export function calculateDelta(before: PersonalityDelta, after: PersonalityDelta): PersonalityDelta {
  return {
    openness: after.openness - before.openness,
    conscientiousness: after.conscientiousness - before.conscientiousness,
    extraversion: after.extraversion - before.extraversion,
    agreeableness: after.agreeableness - before.agreeableness,
    neuroticism: after.neuroticism - before.neuroticism
  }
}

// Get the most significant changes from a delta
export function getSignificantChanges(delta: PersonalityDelta): Array<{trait: keyof PersonalityDelta, change: number}> {
  return (Object.entries(delta) as [keyof PersonalityDelta, number][])
    .filter(([, change]) => Math.abs(change) >= 3)
    .map(([trait, change]) => ({ trait, change }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

// Convert game personality to normalized scores (0-100 for consistency with assessment)
export function normalizeForProfile(scores: PersonalityDelta): PersonalityDelta {
  return {
    openness: scores.openness,
    conscientiousness: scores.conscientiousness,
    extraversion: scores.extraversion,
    agreeableness: scores.agreeableness,
    // Invert neuroticism for storage (higher = more stable)
    neuroticism: 100 - scores.neuroticism
  }
}

// Merge game personality with existing profile personality
export function mergeWithProfilePersonality(
  profileScores: PersonalityDelta,
  gameScores: PersonalityDelta,
  gameWeight: number = 0.3 // How much weight to give game scores (0-1)
): PersonalityDelta {
  const profileWeight = 1 - gameWeight
  
  return {
    openness: Math.round(profileScores.openness * profileWeight + gameScores.openness * gameWeight),
    conscientiousness: Math.round(profileScores.conscientiousness * profileWeight + gameScores.conscientiousness * gameWeight),
    extraversion: Math.round(profileScores.extraversion * profileWeight + gameScores.extraversion * gameWeight),
    agreeableness: Math.round(profileScores.agreeableness * profileWeight + gameScores.agreeableness * gameWeight),
    neuroticism: Math.round(profileScores.neuroticism * profileWeight + gameScores.neuroticism * gameWeight)
  }
}

// Get personality type based on dominant traits
export function getPersonalityType(scores: PersonalityDelta): string {
  const dominant = getDominantTrait(scores)
  const secondary = getSecondaryTrait(scores)
  
  const typeMap: Record<string, string> = {
    'openness-extraversion': 'The Explorer',
    'openness-agreeableness': 'The Artist',
    'openness-conscientiousness': 'The Innovator',
    'conscientiousness-openness': 'The Achiever',
    'conscientiousness-extraversion': 'The Leader',
    'conscientiousness-agreeableness': 'The Guardian',
    'extraversion-openness': 'The Entertainer',
    'extraversion-agreeableness': 'The Socialite',
    'extraversion-conscientiousness': 'The Director',
    'agreeableness-openness': 'The Healer',
    'agreeableness-extraversion': 'The Diplomat',
    'agreeableness-conscientiousness': 'The Helper',
    'neuroticism-openness': 'The Philosopher',
    'neuroticism-conscientiousness': 'The Perfectionist',
    'neuroticism-agreeableness': 'The Caretaker',
  }
  
  const key = `${dominant}-${secondary}`
  return typeMap[key] || 'The Adventurer'
}
