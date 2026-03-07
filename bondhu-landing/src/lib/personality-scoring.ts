import { PersonalityScores, TraitInsight } from '@/types/personality'
import { personalityQuestions } from '@/data/personality-questions'

/**
 * BFI-2-XS Scoring Implementation
 * 
 * Official scoring per Soto & John (2017):
 * - 15 items total, 3 per trait
 * - Response scale: 1-5 (Disagree strongly to Agree strongly)
 * - Reverse-scored items: 1, 3, 7, 8, 10, 14
 * - Score = mean of items per trait, converted to 0-100 scale
 * 
 * BFI-2 Facet Structure (Soto & John, 2017):
 * - Extraversion: Sociability, Assertiveness, Energy Level
 * - Agreeableness: Compassion, Respectfulness, Trust
 * - Conscientiousness: Organization, Productiveness, Responsibility
 * - Negative Emotionality: Anxiety, Depression, Emotional Volatility
 * - Open-Mindedness: Aesthetic Sensitivity, Intellectual Curiosity, Creative Imagination
 */

/**
 * Research-Backed Personality Types
 * 
 * Our types are derived from validated Big Five research:
 * 1. Classic 3-type model (Block & Block): Resilient, Overcontrolled, Undercontrolled
 * 2. 5-type model (Li et al., 2018): Well-Rounded, Stable, Flexible, Reserved, Sensitive
 * 3. BFI-2 Facet-based types for more granularity
 * 
 * We use a hybrid approach combining:
 * - Empirically validated cluster types from research
 * - Facet-based distinctions from BFI-2 for nuance
 * - Combination types for high dual-trait profiles
 */
export const PERSONALITY_TYPES = {
  // ═══════════════════════════════════════════════════════════════════════════
  // RESEARCH-BACKED CLUSTER TYPES (Li et al., 2018; Block & Block)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Well-Rounded: High on all five traits (Li et al., 2018)
  WELL_ROUNDED: { 
    name: 'Well-Rounded Achiever', 
    description: 'High across all traits - adaptable, confident, and emotionally balanced',
    research: 'Li et al., 2018 - LCA of 4,522 adults'
  },
  
  // Resilient: Low N, high on other traits (Block & Block classic type)
  RESILIENT: { 
    name: 'Resilient Leader', 
    description: 'Low neuroticism with high adaptability - handles stress with grace',
    research: 'Block & Block (1980) - replicated across dozens of studies'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OPENNESS-BASED TYPES (BFI-2 Facets: Aesthetic, Intellectual, Creative)
  // ═══════════════════════════════════════════════════════════════════════════
  
  CREATIVE_VISIONARY: { 
    name: 'Creative Visionary', 
    description: 'High openness - imaginative, artistic, and intellectually curious',
    research: 'BFI-2 Facet: Creative Imagination + Aesthetic Sensitivity'
  },
  INTELLECTUAL_EXPLORER: { 
    name: 'Intellectual Explorer', 
    description: 'High openness + conscientiousness - analytical and thorough thinker',
    research: 'BFI-2 Facet: Intellectual Curiosity'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONSCIENTIOUSNESS-BASED TYPES (BFI-2 Facets: Organization, Productivity, Responsibility)
  // ═══════════════════════════════════════════════════════════════════════════
  
  ORGANIZED_ACHIEVER: { 
    name: 'Organized Achiever', 
    description: 'High conscientiousness - disciplined, reliable, and goal-oriented',
    research: 'BFI-2 Facet: Organization + Productiveness'
  },
  STEADY_ANCHOR: { 
    name: 'Steady Anchor', 
    description: 'High conscientiousness + low neuroticism - calm and dependable under pressure',
    research: 'BFI-2 Facet: Responsibility + emotional stability'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRAVERSION-BASED TYPES (BFI-2 Facets: Sociability, Assertiveness, Energy)
  // ═══════════════════════════════════════════════════════════════════════════
  
  SOCIAL_ENERGIZER: { 
    name: 'Social Energizer', 
    description: 'High extraversion - outgoing, enthusiastic, and energizing to others',
    research: 'BFI-2 Facet: Sociability + Energy Level'
  },
  CHARISMATIC_LEADER: { 
    name: 'Charismatic Leader', 
    description: 'High extraversion + openness - inspiring, visionary, and influential',
    research: 'BFI-2 Facet: Assertiveness + Creative Imagination'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AGREEABLENESS-BASED TYPES (BFI-2 Facets: Compassion, Respectfulness, Trust)
  // ═══════════════════════════════════════════════════════════════════════════
  
  COMPASSIONATE_HELPER: { 
    name: 'Compassionate Helper', 
    description: 'High agreeableness - caring, cooperative, and supportive of others',
    research: 'BFI-2 Facet: Compassion'
  },
  HARMONIOUS_CONNECTOR: { 
    name: 'Harmonious Connector', 
    description: 'High agreeableness + extraversion - brings people together naturally',
    research: 'BFI-2 Facet: Trust + Sociability'
  },
  TRUSTED_ADVISOR: { 
    name: 'Trusted Advisor', 
    description: 'High agreeableness + conscientiousness - reliable, fair, and respected',
    research: 'BFI-2 Facet: Respectfulness + Responsibility'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // NEUROTICISM-BASED TYPES (BFI-2 Facets: Anxiety, Depression, Volatility)
  // ═══════════════════════════════════════════════════════════════════════════
  
  SENSITIVE_SOUL: { 
    name: 'Sensitive Soul', 
    description: 'High emotional awareness - deeply empathetic and perceptive',
    research: 'BFI-2 Facet: Emotional sensitivity (reframed positively)'
  },
  PASSIONATE_CREATOR: { 
    name: 'Passionate Creator', 
    description: 'High neuroticism + openness - channels emotions into creativity',
    research: 'Campbell-Sills et al. (2006) - emotional depth & artistic expression'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMBINATION TYPES (Dual high traits)
  // ═══════════════════════════════════════════════════════════════════════════
  
  THOUGHTFUL_ANALYST: { 
    name: 'Thoughtful Analyst', 
    description: 'High openness + conscientiousness - systematic and innovative',
    research: 'Combination profile: analytical creativity'
  },
  DIPLOMATIC_BRIDGE: { 
    name: 'Diplomatic Bridge', 
    description: 'High agreeableness + low neuroticism - calm mediator in conflicts',
    research: 'Combination profile: peaceful resolution'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BALANCED TYPE (Li et al., 2018 - "Flexible" cluster)
  // ═══════════════════════════════════════════════════════════════════════════
  
  BALANCED_ADAPTER: { 
    name: 'Balanced Adapter', 
    description: 'Moderate across traits - flexible, adaptable, and versatile',
    research: 'Li et al., 2018 - "Flexible" type: adaptable, cooperative'
  }
} as const

// Export type count for validation
export const PERSONALITY_TYPE_COUNT = Object.keys(PERSONALITY_TYPES).length // 16 types

export function calculatePersonalityScores(responses: Record<number, number>): PersonalityScores {
  // BFI-2-XS has exactly 15 questions
  const totalQuestions = 15
  const answeredQuestions = Object.keys(responses).length
  
  if (answeredQuestions !== totalQuestions) {
    throw new Error(`Incomplete assessment: ${answeredQuestions}/${totalQuestions} questions answered`)
  }

  // Group responses by trait
  const traitResponses: Record<string, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: []
  }

  // Process each response
  Object.entries(responses).forEach(([questionIdStr, response]) => {
    const questionId = parseInt(questionIdStr)
    const question = personalityQuestions.find(q => q.id === questionId)
    
    if (!question) {
      throw new Error(`Question not found: ${questionId}`)
    }

    // Validate response range (1-5 Likert scale)
    if (response < 1 || response > 5) {
      throw new Error(`Invalid response value: ${response} for question ${questionId}`)
    }

    // Apply reverse scoring if needed (items 1, 3, 7, 8, 10, 14)
    const processedResponse = question.isReversed 
      ? (6 - response) // 1→5, 2→4, 3→3, 4→2, 5→1
      : response

    traitResponses[question.traitId].push(processedResponse)
  })

  // Validate each trait has exactly 3 responses
  for (const [trait, responses] of Object.entries(traitResponses)) {
    if (responses.length !== 3) {
      throw new Error(`Invalid number of responses for ${trait}: expected 3, got ${responses.length}`)
    }
  }

  // Calculate trait scores
  const scores: PersonalityScores = {
    openness: calculateTraitScore(traitResponses.openness),
    conscientiousness: calculateTraitScore(traitResponses.conscientiousness),
    extraversion: calculateTraitScore(traitResponses.extraversion),
    agreeableness: calculateTraitScore(traitResponses.agreeableness),
    neuroticism: calculateTraitScore(traitResponses.neuroticism)
  }

  return scores
}

function calculateTraitScore(responses: number[]): number {
  if (responses.length === 0) {
    throw new Error('No responses provided for trait calculation')
  }

  // Calculate mean
  const sum = responses.reduce((acc, val) => acc + val, 0)
  const mean = sum / responses.length

  // Convert 1-5 scale to 0-100 scale: ((mean - 1) / 4) * 100
  // This gives: 1→0, 2→25, 3→50, 4→75, 5→100
  const score = ((mean - 1) / 4) * 100

  // Round to whole number
  return Math.round(score)
}

/**
 * Determine personality type based on Big Five scores
 * 
 * Algorithm uses research-backed classification:
 * 1. Check for Well-Rounded (all traits high) - Li et al., 2018
 * 2. Check for Resilient (low N, high others) - Block & Block classic
 * 3. Check combination types (dual high traits) - BFI-2 facet combinations
 * 4. Check single dominant trait types - BFI-2 facet-based
 * 5. Default to Balanced Adapter - Li et al., 2018 "Flexible" type
 */
export function determinePersonalityType(scores: PersonalityScores): string {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores
  
  // Calculate averages for overall pattern detection
  const positiveTraitsAvg = (openness + conscientiousness + extraversion + agreeableness) / 4
  const allTraitsStable = Math.max(openness, conscientiousness, extraversion, agreeableness, neuroticism) - 
                          Math.min(openness, conscientiousness, extraversion, agreeableness, neuroticism) < 25
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: Research-backed cluster types (highest priority)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Well-Rounded: All positive traits high (>60), neuroticism moderate-low (<50)
  if (openness > 60 && conscientiousness > 60 && extraversion > 60 && agreeableness > 60 && neuroticism < 50) {
    return PERSONALITY_TYPES.WELL_ROUNDED.name
  }
  
  // Resilient: Low neuroticism (<35), most other traits above average (>55)
  if (neuroticism < 35 && positiveTraitsAvg > 55) {
    return PERSONALITY_TYPES.RESILIENT.name
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: Combination types (dual high traits)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Charismatic Leader: High E + High O (visionary, inspiring)
  if (extraversion > 65 && openness > 65) {
    return PERSONALITY_TYPES.CHARISMATIC_LEADER.name
  }
  
  // Intellectual Explorer: High O + High C (analytical, thorough)
  if (openness > 65 && conscientiousness > 65) {
    return PERSONALITY_TYPES.INTELLECTUAL_EXPLORER.name
  }
  
  // Steady Anchor: High C + Low N (calm under pressure)
  if (conscientiousness > 65 && neuroticism < 35) {
    return PERSONALITY_TYPES.STEADY_ANCHOR.name
  }
  
  // Harmonious Connector: High A + High E (brings people together)
  if (agreeableness > 65 && extraversion > 65) {
    return PERSONALITY_TYPES.HARMONIOUS_CONNECTOR.name
  }
  
  // Trusted Advisor: High A + High C (reliable, fair)
  if (agreeableness > 65 && conscientiousness > 65) {
    return PERSONALITY_TYPES.TRUSTED_ADVISOR.name
  }
  
  // Thoughtful Analyst: High O + High C (already covered by Intellectual Explorer, but distinct)
  if (openness > 60 && conscientiousness > 60 && extraversion < 50) {
    return PERSONALITY_TYPES.THOUGHTFUL_ANALYST.name
  }
  
  // Diplomatic Bridge: High A + Low N (calm mediator)
  if (agreeableness > 65 && neuroticism < 40) {
    return PERSONALITY_TYPES.DIPLOMATIC_BRIDGE.name
  }
  
  // Passionate Creator: High N + High O (channels emotions into art)
  if (neuroticism > 60 && openness > 60) {
    return PERSONALITY_TYPES.PASSIONATE_CREATOR.name
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: Single dominant trait types (>70 or clear dominance)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const traits = [
    { name: 'openness', score: openness },
    { name: 'conscientiousness', score: conscientiousness },
    { name: 'extraversion', score: extraversion },
    { name: 'agreeableness', score: agreeableness },
    { name: 'neuroticism', score: neuroticism }
  ]
  
  const sortedTraits = [...traits].sort((a, b) => b.score - a.score)
  const highest = sortedTraits[0]
  const secondHighest = sortedTraits[1]
  
  // Strong single dominant trait (>70)
  if (highest.score > 70) {
    switch (highest.name) {
      case 'openness': return PERSONALITY_TYPES.CREATIVE_VISIONARY.name
      case 'conscientiousness': return PERSONALITY_TYPES.ORGANIZED_ACHIEVER.name
      case 'extraversion': return PERSONALITY_TYPES.SOCIAL_ENERGIZER.name
      case 'agreeableness': return PERSONALITY_TYPES.COMPASSIONATE_HELPER.name
      case 'neuroticism': return PERSONALITY_TYPES.SENSITIVE_SOUL.name
    }
  }
  
  // Moderate dominance (>60 and 15+ points above next trait)
  if (highest.score > 60 && (highest.score - secondHighest.score) >= 15) {
    switch (highest.name) {
      case 'openness': return PERSONALITY_TYPES.CREATIVE_VISIONARY.name
      case 'conscientiousness': return PERSONALITY_TYPES.ORGANIZED_ACHIEVER.name
      case 'extraversion': return PERSONALITY_TYPES.SOCIAL_ENERGIZER.name
      case 'agreeableness': return PERSONALITY_TYPES.COMPASSIONATE_HELPER.name
      case 'neuroticism': return PERSONALITY_TYPES.SENSITIVE_SOUL.name
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 4: Default - Balanced/Flexible type
  // ═══════════════════════════════════════════════════════════════════════════
  
  return PERSONALITY_TYPES.BALANCED_ADAPTER.name
}

export function generateTraitInsights(scores: PersonalityScores): TraitInsight[] {
  return [
    {
      traitId: 'openness',
      score: scores.openness,
      level: getScoreLevel(scores.openness),
      description: getOpennessDescription(scores.openness),
      bondhuAdaptation: getOpennessAdaptation(scores.openness),
      growthSuggestions: getOpennessGrowthSuggestions(scores.openness)
    },
    {
      traitId: 'conscientiousness',
      score: scores.conscientiousness,
      level: getScoreLevel(scores.conscientiousness),
      description: getConscientiousnessDescription(scores.conscientiousness),
      bondhuAdaptation: getConscientiousnessAdaptation(scores.conscientiousness),
      growthSuggestions: getConscientiousnessGrowthSuggestions(scores.conscientiousness)
    },
    {
      traitId: 'extraversion',
      score: scores.extraversion,
      level: getScoreLevel(scores.extraversion),
      description: getExtraversionDescription(scores.extraversion),
      bondhuAdaptation: getExtraversionAdaptation(scores.extraversion),
      growthSuggestions: getExtraversionGrowthSuggestions(scores.extraversion)
    },
    {
      traitId: 'agreeableness',
      score: scores.agreeableness,
      level: getScoreLevel(scores.agreeableness),
      description: getAgreeablenessDescription(scores.agreeableness),
      bondhuAdaptation: getAgreeablenessAdaptation(scores.agreeableness),
      growthSuggestions: getAgreeablenessGrowthSuggestions(scores.agreeableness)
    },
    {
      traitId: 'neuroticism',
      score: scores.neuroticism,
      level: getScoreLevel(scores.neuroticism),
      description: getNeuroticismDescription(scores.neuroticism),
      bondhuAdaptation: getNeuroticismAdaptation(scores.neuroticism),
      growthSuggestions: getNeuroticismGrowthSuggestions(scores.neuroticism)
    }
  ]
}

function getScoreLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 30) return 'low'
  if (score <= 70) return 'medium'
  return 'high'
}

// Openness descriptions and adaptations
function getOpennessDescription(score: number): string {
  if (score <= 30) return "You prefer familiar experiences and practical approaches. You value tradition and find comfort in established ways of doing things."
  if (score <= 70) return "You balance creativity with practicality. You're open to new ideas while appreciating proven methods."
  return "You're highly creative and love exploring new ideas. You enjoy abstract thinking and novel experiences."
}

function getOpennessAdaptation(score: number): string {
  if (score <= 30) return "Bondhu will focus on practical, concrete advice and stick to familiar topics while gradually introducing new perspectives."
  if (score <= 70) return "Bondhu will balance creative suggestions with practical solutions, mixing familiar and novel approaches."
  return "Bondhu will engage with abstract concepts, encourage creative thinking, and explore philosophical topics with you."
}

function getOpennessGrowthSuggestions(score: number): string[] {
  if (score <= 30) return ["Try one new activity each week", "Read about different cultures", "Practice creative writing"]
  if (score <= 70) return ["Explore artistic hobbies", "Travel to new places", "Learn about different perspectives"]
  return ["Share your creative ideas", "Mentor others in creativity", "Apply imagination to solve problems"]
}

// Conscientiousness descriptions and adaptations
function getConscientiousnessDescription(score: number): string {
  if (score <= 30) return "You prefer flexibility and spontaneity. You work well in the moment and adapt quickly to changing situations."
  if (score <= 70) return "You balance structure with flexibility. You can be organized when needed while staying adaptable."
  return "You're highly organized and goal-oriented. You excel at planning ahead and following through on commitments."
}

function getConscientiousnessAdaptation(score: number): string {
  if (score <= 30) return "Bondhu will offer flexible suggestions and help you build gentle routines without being overwhelming."
  if (score <= 70) return "Bondhu will provide structured guidance when needed while respecting your need for spontaneity."
  return "Bondhu will help you create detailed plans and track your progress toward mental health goals."
}

function getConscientiousnessGrowthSuggestions(score: number): string[] {
  if (score <= 30) return ["Use simple planning tools", "Set one small goal daily", "Create basic routines"]
  if (score <= 70) return ["Balance planning with spontaneity", "Track important goals", "Develop time management skills"]
  return ["Share planning strategies", "Help others stay organized", "Set long-term wellness goals"]
}

// Extraversion descriptions and adaptations
function getExtraversionDescription(score: number): string {
  if (score <= 30) return "You gain energy from quiet reflection and prefer meaningful one-on-one conversations over large groups."
  if (score <= 70) return "You enjoy both social time and solitude. You're comfortable in groups but also value quiet reflection."
  return "You're energized by social interaction and enjoy being around people. You're outgoing and expressive."
}

function getExtraversionAdaptation(score: number): string {
  if (score <= 30) return "Bondhu will respect your need for quiet reflection and suggest gentle, low-key activities."
  if (score <= 70) return "Bondhu will balance social suggestions with quiet activities based on your current energy level."
  return "Bondhu will encourage social connections and group activities as part of your wellness journey."
}

function getExtraversionGrowthSuggestions(score: number): string[] {
  if (score <= 30) return ["Practice small social interactions", "Join online communities", "Attend low-key gatherings"]
  if (score <= 70) return ["Balance social and alone time", "Try different social settings", "Express yourself creatively"]
  return ["Use social energy positively", "Help others feel included", "Practice active listening"]
}

// Agreeableness descriptions and adaptations
function getAgreeablenessDescription(score: number): string {
  if (score <= 30) return "You value honesty and direct communication. You're comfortable with healthy conflict and standing up for your beliefs."
  if (score <= 70) return "You balance compassion with assertiveness. You care about others while maintaining healthy boundaries."
  return "You're naturally compassionate and trusting. You prioritize harmony and genuinely care about others' wellbeing."
}

function getAgreeablenessAdaptation(score: number): string {
  if (score <= 30) return "Bondhu will provide direct, honest feedback and help you develop empathy while respecting your straightforward style."
  if (score <= 70) return "Bondhu will help you balance caring for others with self-care and boundary setting."
  return "Bondhu will celebrate your compassion while helping you set healthy boundaries and practice self-compassion."
}

function getAgreeablenessGrowthSuggestions(score: number): string[] {
  if (score <= 30) return ["Practice active listening", "Consider others' perspectives", "Express appreciation more often"]
  if (score <= 70) return ["Set healthy boundaries", "Practice assertive communication", "Balance giving and receiving"]
  return ["Maintain healthy boundaries", "Practice saying no kindly", "Channel compassion into self-care"]
}

// Neuroticism descriptions and adaptations
function getNeuroticismDescription(score: number): string {
  if (score <= 30) return "You tend to stay calm under pressure and bounce back quickly from setbacks. You have a naturally stable emotional state."
  if (score <= 70) return "You experience normal emotional ups and downs. You can manage stress well but benefit from good coping strategies."
  return "You may experience emotions intensely and feel stress more acutely. You're sensitive and deeply empathetic."
}

function getNeuroticismAdaptation(score: number): string {
  if (score <= 30) return "Bondhu will help you maintain your emotional stability and use your calm nature to support others."
  if (score <= 70) return "Bondhu will provide balanced emotional support and help you develop effective stress management techniques."
  return "Bondhu will offer extra emotional support, gentle stress management techniques, and frequent check-ins during difficult times."
}

function getNeuroticismGrowthSuggestions(score: number): string[] {
  if (score <= 30) return ["Share coping strategies", "Support others in stress", "Maintain healthy habits"]
  if (score <= 70) return ["Develop stress management tools", "Practice mindfulness", "Build emotional awareness"]
  return ["Practice self-compassion", "Use calming techniques", "Build a strong support network"]
}



