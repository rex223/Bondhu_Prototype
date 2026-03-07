// Personality Quest Game Types

export interface PersonalityDelta {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export interface GameChoice {
  id: string
  text: string
  emoji?: string
  personality: PersonalityDelta
  weight: number // 1-3, how significant is this choice
  nextScene: string
  consequence?: string // Brief text shown after choice
}

export interface DialogueLine {
  speaker: 'narrator' | 'npc' | 'player' | 'system'
  speakerName?: string
  text: string
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'thinking'
}

export interface GameScene {
  id: string
  title?: string
  background: 'forest' | 'village' | 'cave' | 'castle' | 'road' | 'room' | 'night'
  dialogue: DialogueLine[]
  choices?: GameChoice[]
  autoAdvance?: string // Auto-advance to next scene after dialogue
  showPersonalityUpdate?: boolean // Show the personality delta after this scene
  isCheckpoint?: boolean // Save progress here
  chapterEnd?: boolean // End of chapter, show summary
}

export interface GameState {
  currentScene: string
  visitedScenes: string[]
  choiceHistory: { sceneId: string; choiceId: string; timestamp: number }[]
  personalityScores: PersonalityDelta
  playerName: string
  chapter: number
  startTime: number
  totalChoices: number
}

export interface PersonalitySnapshot {
  scores: PersonalityDelta
  dominantTrait: keyof PersonalityDelta
  secondaryTrait: keyof PersonalityDelta
  description: string
}

// Character sprite types
export type CharacterType = 'hero' | 'wizard' | 'villager' | 'goblin' | 'merchant' | 'knight'
export type Direction = 'down' | 'up' | 'left' | 'right'

// Game events
export type GameEvent = 
  | { type: 'SCENE_CHANGE'; sceneId: string }
  | { type: 'CHOICE_MADE'; choice: GameChoice }
  | { type: 'DIALOGUE_ADVANCE' }
  | { type: 'GAME_START' }
  | { type: 'GAME_END' }
  | { type: 'CHECKPOINT_REACHED' }
  | { type: 'PERSONALITY_UPDATE'; delta: PersonalityDelta }
