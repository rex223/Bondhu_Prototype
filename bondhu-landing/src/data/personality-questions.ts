import { PersonalityTrait, PersonalityQuestion } from '@/types/personality'

/**
 * Official BFI-2-XS (Big Five Inventory-2 Extra-Short Form)
 * 
 * Citation: Soto, C. J., & John, O. P. (2017). Short and extra-short forms of the 
 * Big Five Inventory–2: The BFI-2-S and BFI-2-XS. Journal of Research in Personality, 68, 69-81.
 * 
 * 15 items, 3 per trait. Response scale: 1-5 (Disagree strongly to Agree strongly)
 * All items begin with "I am someone who..."
 */
export const personalityQuestions: PersonalityQuestion[] = [
  // Item 1 - Extraversion (Reverse-scored)
  {
    id: 1,
    traitId: 'extraversion',
    scenario: "You're at a lively gathering where conversations buzz all around you...",
    questionText: "I am someone who tends to be quiet.",
    isReversed: true
  },
  // Item 2 - Agreeableness
  {
    id: 2,
    traitId: 'agreeableness',
    scenario: "A friend shares their struggles with you, needing support...",
    questionText: "I am someone who is compassionate, has a soft heart.",
    isReversed: false
  },
  // Item 3 - Conscientiousness (Reverse-scored)
  {
    id: 3,
    traitId: 'conscientiousness',
    scenario: "You look around your workspace and notice its current state...",
    questionText: "I am someone who tends to be disorganized.",
    isReversed: true
  },
  // Item 4 - Neuroticism
  {
    id: 4,
    traitId: 'neuroticism',
    scenario: "Uncertainty looms ahead, and your mind races with possibilities...",
    questionText: "I am someone who worries a lot.",
    isReversed: false
  },
  // Item 5 - Openness
  {
    id: 5,
    traitId: 'openness',
    scenario: "You discover a gallery filled with paintings, music, and poetry...",
    questionText: "I am someone who is fascinated by art, music, or literature.",
    isReversed: false
  },
  // Item 6 - Extraversion
  {
    id: 6,
    traitId: 'extraversion',
    scenario: "Your group needs direction and someone to take charge...",
    questionText: "I am someone who is dominant, acts as a leader.",
    isReversed: false
  },
  // Item 7 - Agreeableness (Reverse-scored)
  {
    id: 7,
    traitId: 'agreeableness',
    scenario: "Someone frustrates you, testing your patience...",
    questionText: "I am someone who is sometimes rude to others.",
    isReversed: true
  },
  // Item 8 - Conscientiousness (Reverse-scored)
  {
    id: 8,
    traitId: 'conscientiousness',
    scenario: "A new project awaits, but the first step feels daunting...",
    questionText: "I am someone who has difficulty getting started on tasks.",
    isReversed: true
  },
  // Item 9 - Neuroticism
  {
    id: 9,
    traitId: 'neuroticism',
    scenario: "Dark clouds gather in your mind after a difficult day...",
    questionText: "I am someone who tends to feel depressed, blue.",
    isReversed: false
  },
  // Item 10 - Openness (Reverse-scored)
  {
    id: 10,
    traitId: 'openness',
    scenario: "Someone presents complex philosophical ideas for discussion...",
    questionText: "I am someone who has little interest in abstract ideas.",
    isReversed: true
  },
  // Item 11 - Extraversion
  {
    id: 11,
    traitId: 'extraversion',
    scenario: "A new day begins with endless possibilities ahead...",
    questionText: "I am someone who is full of energy.",
    isReversed: false
  },
  // Item 12 - Agreeableness
  {
    id: 12,
    traitId: 'agreeableness',
    scenario: "You meet someone new and form first impressions...",
    questionText: "I am someone who assumes the best about people.",
    isReversed: false
  },
  // Item 13 - Conscientiousness
  {
    id: 13,
    traitId: 'conscientiousness',
    scenario: "Others depend on you to deliver on your promises...",
    questionText: "I am someone who is reliable, can always be counted on.",
    isReversed: false
  },
  // Item 14 - Neuroticism (Reverse-scored)
  {
    id: 14,
    traitId: 'neuroticism',
    scenario: "Challenges arise and pressure builds around you...",
    questionText: "I am someone who is emotionally stable, not easily upset.",
    isReversed: true
  },
  // Item 15 - Openness
  {
    id: 15,
    traitId: 'openness',
    scenario: "A problem needs solving and fresh thinking is required...",
    questionText: "I am someone who is original, comes up with new ideas.",
    isReversed: false
  }
]

export const personalityTraits: PersonalityTrait[] = [
  {
    id: 'extraversion',
    displayName: 'Extraversion',
    storyTitle: 'Social Energy',
    storyDescription: "Discover how you gain energy—through social connection or quiet reflection. These questions reveal your natural social style.",
    color: '#8b5cf6', // purple - social energy
    questions: personalityQuestions.filter(q => q.traitId === 'extraversion'),
    imageUrl: '/images/personality/village-festival.jpg',
    completedQuestions: 0,
    totalQuestions: 3
  },
  {
    id: 'agreeableness',
    displayName: 'Agreeableness',
    storyTitle: 'Compassion & Trust',
    storyDescription: "How do you relate to others? These questions explore your natural tendencies toward empathy, cooperation, and trust.",
    color: '#f59e0b', // amber - warmth/empathy
    questions: personalityQuestions.filter(q => q.traitId === 'agreeableness'),
    imageUrl: '/images/personality/compassion-temple.jpg',
    completedQuestions: 0,
    totalQuestions: 3
  },
  {
    id: 'conscientiousness',
    displayName: 'Conscientiousness',
    storyTitle: 'Organization & Drive',
    storyDescription: "Your approach to goals and responsibilities. These questions reveal how you organize your life and pursue your ambitions.",
    color: '#3b82f6', // blue - reliability/structure
    questions: personalityQuestions.filter(q => q.traitId === 'conscientiousness'),
    imageUrl: '/images/personality/mountain-achievement.jpg',
    completedQuestions: 0,
    totalQuestions: 3
  },
  {
    id: 'neuroticism',
    displayName: 'Emotional Sensitivity',
    storyTitle: 'Emotional Landscape',
    storyDescription: "How you experience and process emotions. These questions explore your emotional patterns and resilience.",
    color: '#f97316', // softer orange for sensitivity
    questions: personalityQuestions.filter(q => q.traitId === 'neuroticism'),
    imageUrl: '/images/personality/weather-station.jpg',
    completedQuestions: 0,
    totalQuestions: 3
  },
  {
    id: 'openness',
    displayName: 'Open-Mindedness',
    storyTitle: 'Curiosity & Creativity',
    storyDescription: "Your relationship with ideas, art, and new experiences. These questions reveal your intellectual curiosity and creativity.",
    color: '#22c55e', // green - creativity/growth
    questions: personalityQuestions.filter(q => q.traitId === 'openness'),
    imageUrl: '/images/personality/enchanted-forest.jpg',
    completedQuestions: 0,
    totalQuestions: 3
  }
]

export const introCard = {
  id: 'intro',
  storyTitle: 'Personality Discovery',
  storyDescription: "Welcome! You're about to take the BFI-2-XS, a scientifically validated personality assessment. Your honest responses will help Bondhu understand you better and provide personalized support.",
  instructions: [
    "🎯 15 quick questions about yourself",
    "⚡ Answer honestly—there are no wrong answers",
    "🌱 Helps Bondhu personalize your experience",
    "⏱️ Takes about 3-5 minutes"
  ],
  imageUrl: '/images/personality/neuron-valley.jpg'
}



