"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameState, GameScene, GameChoice, PersonalityDelta } from '@/types/game'
import { gameScenes, STARTING_SCENE } from '@/data/games/personality-quest/scenes'
import {
  createInitialGameState,
  applyChoiceToPersonality,
  generatePersonalitySnapshot,
  getTraitDisplayName,
  getTraitColor,
  getTraitEmoji,
  getSignificantChanges,
  calculateDelta,
  getPersonalityType
} from '@/lib/games/personality-engine'
import { cn } from '@/lib/utils'
import { useGameControls, useMenuNavigation, VirtualGamepad } from '@/hooks/use-game-controls'
import { useChiptune, getSceneMood } from '@/hooks/use-chiptune'
import { PixelCharacter, NPC, Hero } from './sprites/PixelCharacter'
import { SceneBackground } from './sprites/SceneBackground'
import 'nes.css/css/nes.min.css'

interface PersonalityQuestProps {
  onGameEnd?: (finalState: GameState) => void
  onPersonalityUpdate?: (scores: PersonalityDelta) => void
  playerName?: string
}

export function PersonalityQuest({ 
  onGameEnd, 
  onPersonalityUpdate,
  playerName = 'Traveler' 
}: PersonalityQuestProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(playerName))
  const [currentScene, setCurrentScene] = useState<GameScene | null>(null)
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [showPersonalityPanel, setShowPersonalityPanel] = useState(false)
  const [lastDelta, setLastDelta] = useState<PersonalityDelta | null>(null)
  const [consequence, setConsequence] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const typewriterRef = useRef<NodeJS.Timeout | null>(null)

  // Sound system
  const {
    playClick,
    playSelect,
    playConfirm,
    playCancel,
    playType,
    playDialogueAdvance,
    playTraitUp,
    playTraitDown,
    playFanfare,
    startBGM,
    stopBGM,
    changeMood,
    toggleMute,
    isMuted,
  } = useChiptune()

  // Check if mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 640)
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load scene and update BGM mood
  useEffect(() => {
    const scene = gameScenes[gameState.currentScene]
    if (scene) {
      setCurrentScene(scene)
      setDialogueIndex(0)
      setShowPersonalityPanel(false)
      setConsequence(null)
      
      // Change BGM mood based on scene type
      if (gameStarted && soundEnabled) {
        const mood = getSceneMood(scene.background)
        changeMood(mood)
      }
    }
  }, [gameState.currentScene, gameStarted, soundEnabled, changeMood])

  // Typewriter effect for dialogue
  useEffect(() => {
    if (!currentScene || !gameStarted) return
    
    const currentDialogue = currentScene.dialogue[dialogueIndex]
    if (!currentDialogue) return

    // Clear previous timeout
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
    }

    setIsTyping(true)
    setDisplayedText('')
    
    const text = currentDialogue.text
    let charIndex = 0
    
    typewriterRef.current = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1))
        // Play typing sound every 3rd character (not too spammy)
        if (soundEnabled && charIndex % 3 === 0) {
          playType()
        }
        charIndex++
      } else {
        setIsTyping(false)
        if (typewriterRef.current) {
          clearInterval(typewriterRef.current)
        }
      }
    }, 25) // Faster typing speed

    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current)
      }
    }
  }, [currentScene, dialogueIndex, gameStarted])

  // Skip typing animation
  const skipTyping = useCallback(() => {
    if (isTyping && currentScene) {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current)
      }
      setDisplayedText(currentScene.dialogue[dialogueIndex]?.text || '')
      setIsTyping(false)
    }
  }, [isTyping, currentScene, dialogueIndex])

  // Handle dialogue advance
  const advanceDialogue = useCallback(() => {
    if (!currentScene) return

    if (isTyping) {
      skipTyping()
      soundEnabled && playClick()
      return
    }

    // Play dialogue advance sound
    soundEnabled && playDialogueAdvance()

    // Check if there's more dialogue
    if (dialogueIndex < currentScene.dialogue.length - 1) {
      setDialogueIndex(prev => prev + 1)
    } else {
      // End of dialogue
      if (currentScene.autoAdvance) {
        setGameState(prev => ({
          ...prev,
          currentScene: currentScene.autoAdvance!,
          visitedScenes: [...prev.visitedScenes, currentScene.id]
        }))
      } else if (currentScene.chapterEnd) {
        soundEnabled && playFanfare()
        setShowSummary(true)
      }
    }
  }, [currentScene, dialogueIndex, isTyping, skipTyping, soundEnabled, playDialogueAdvance, playClick, playFanfare])

  // Choice navigation for keyboard
  const isDialogueComplete = currentScene && dialogueIndex >= currentScene.dialogue.length - 1 && !isTyping
  const showChoices = isDialogueComplete && currentScene?.choices && !currentScene?.autoAdvance
  const choiceCount = currentScene?.choices?.length || 0

  const { selectedIndex, confirmed, reset: resetMenu } = useMenuNavigation(
    choiceCount,
    !!showChoices
  )

  // Handle choice confirmation via keyboard
  useEffect(() => {
    if (confirmed && showChoices && currentScene?.choices) {
      const choice = currentScene.choices[selectedIndex]
      if (choice) {
        handleChoice(choice)
        resetMenu()
      }
    }
  }, [confirmed, showChoices, currentScene, selectedIndex])

  // Keyboard controls for dialogue
  useGameControls({
    onConfirm: advanceDialogue,
    enabled: gameStarted && !showChoices && !showSummary,
  })

  // Handle choice selection
  const handleChoice = (choice: GameChoice) => {
    // Play confirm sound
    soundEnabled && playConfirm()

    const previousScores = { ...gameState.personalityScores }
    const newScores = applyChoiceToPersonality(gameState.personalityScores, choice)
    const delta = calculateDelta(previousScores, newScores)
    
    setLastDelta(delta)
    setConsequence(choice.consequence || null)
    
    setGameState(prev => ({
      ...prev,
      personalityScores: newScores,
      choiceHistory: [...prev.choiceHistory, {
        sceneId: prev.currentScene,
        choiceId: choice.id,
        timestamp: Date.now()
      }],
      totalChoices: prev.totalChoices + 1,
      currentScene: choice.nextScene,
      visitedScenes: [...prev.visitedScenes, prev.currentScene]
    }))

    const significant = getSignificantChanges(delta)
    if (significant.length > 0 || currentScene?.showPersonalityUpdate) {
      // Play trait change sound
      const netChange = Object.values(delta).reduce((sum, v) => sum + v, 0)
      if (soundEnabled) {
        setTimeout(() => netChange >= 0 ? playTraitUp() : playTraitDown(), 200)
      }
      setShowPersonalityPanel(true)
      setTimeout(() => setShowPersonalityPanel(false), 3000)
    }

    onPersonalityUpdate?.(newScores)
  }

  // Handle game end
  const handleGameEnd = () => {
    onGameEnd?.(gameState)
    setShowSummary(false)
  }

  // Get current speaker info
  const currentDialogue = currentScene?.dialogue[dialogueIndex]
  const speakerName = currentDialogue?.speakerName
  const isSpeaking = isTyping || (dialogueIndex < (currentScene?.dialogue.length || 0) - 1)

  // Start screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[#212529] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="nes-container is-dark with-title max-w-lg w-full relative overflow-hidden"
        >
          <p className="title">Bondhu Quest</p>
          
          <div className="text-center space-y-6 p-4">
            {/* Pixel art hero */}
            <div className="flex justify-center mb-4">
              <Hero size="xl" animation="idle" />
            </div>
            
            <h1 className="nes-text is-primary text-xl">
              The Personality Adventure
            </h1>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              Embark on a quest where YOUR choices reveal YOUR personality!
              Every decision shapes who you are.
            </p>
            
            <div className="nes-container is-rounded is-dark text-left text-xs">
              <p className="nes-text is-warning mb-2">Controls:</p>
              <ul className="list-none space-y-1 text-gray-400">
                <li>↑↓ / W/S - Navigate choices</li>
                <li>Enter / Space / Z - Confirm</li>
                <li>Esc / X - Cancel</li>
                <li className="sm:hidden">Or use on-screen buttons</li>
              </ul>
            </div>
            
            <button 
              className="nes-btn is-primary"
              onClick={() => {
                playConfirm()
                startBGM('calm')
                setGameStarted(true)
              }}
            >
              Start Quest
            </button>
            
            {/* Sound toggle */}
            <button 
              className="nes-btn is-warning mt-2"
              onClick={() => {
                playClick()
                toggleMute()
                setSoundEnabled(!soundEnabled)
              }}
            >
              {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Summary screen
  if (showSummary) {
    const snapshot = generatePersonalitySnapshot(gameState.personalityScores)
    const personalityType = getPersonalityType(gameState.personalityScores)
    
    return (
      <div className="min-h-screen bg-[#212529] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nes-container is-dark with-title max-w-2xl w-full"
        >
          <p className="title">Quest Complete!</p>
          
          <div className="space-y-6 p-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Hero size="xl" animation="happy" />
              </div>
              <h2 className="nes-text is-success text-lg">{personalityType}</h2>
              <p className="text-gray-400 text-sm mt-2">{snapshot.description}</p>
            </div>
            
            {/* Personality Bars */}
            <div className="space-y-3">
              <p className="nes-text is-primary text-sm">Your Personality Profile:</p>
              
              {(Object.entries(gameState.personalityScores) as [keyof PersonalityDelta, number][]).map(([trait, score]) => (
                <div key={trait} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{getTraitEmoji(trait)} {getTraitDisplayName(trait)}</span>
                    <span>{trait === 'neuroticism' ? 100 - score : score}%</span>
                  </div>
                  <progress 
                    className={cn(
                      "nes-progress",
                      score > 60 ? "is-success" : score > 40 ? "is-warning" : "is-error"
                    )}
                    value={trait === 'neuroticism' ? 100 - score : score} 
                    max="100"
                  />
                </div>
              ))}
            </div>
            
            {/* Stats */}
            <div className="nes-container is-rounded is-dark">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Choices Made:</span>
                  <span className="nes-text is-primary ml-2">{gameState.totalChoices}</span>
                </div>
                <div>
                  <span className="text-gray-400">Time:</span>
                  <span className="nes-text is-primary ml-2">
                    {Math.round((Date.now() - gameState.startTime) / 60000)}m
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button 
                className="nes-btn is-primary"
                onClick={() => {
                  playConfirm()
                  stopBGM()
                  handleGameEnd()
                }}
                onMouseEnter={() => soundEnabled && playSelect()}
              >
                Save & Exit
              </button>
              <button 
                className="nes-btn"
                onClick={() => {
                  playConfirm()
                  setGameState(createInitialGameState(playerName))
                  setShowSummary(false)
                  setGameStarted(true)
                  startBGM('calm')
                }}
                onMouseEnter={() => soundEnabled && playSelect()}
              >
                Play Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main game screen
  if (!currentScene) return null

  return (
    <div className="min-h-screen bg-[#212529] flex flex-col">
      {/* Header with personality stats */}
      <header className="bg-[#1a1d21] border-b-4 border-[#4a4a4a] p-2 sm:p-3 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="nes-text is-primary text-xs sm:text-sm">Bondhu Quest</span>
            {currentScene.title && (
              <span className="hidden sm:inline text-gray-500 text-xs">• {currentScene.title}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span>Ch.{gameState.chapter}</span>
              <span>•</span>
              <span>{gameState.totalChoices} choices</span>
            </div>
            
            {/* Mini personality indicators */}
            <div className="flex gap-1">
              {(Object.entries(gameState.personalityScores) as [keyof PersonalityDelta, number][])
                .slice(0, isMobile ? 3 : 5)
                .map(([trait, score]) => (
                  <div 
                    key={trait}
                    className="relative w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs"
                    style={{ backgroundColor: getTraitColor(trait) + '40' }}
                    title={`${getTraitDisplayName(trait)}: ${score}`}
                  >
                    <span className="text-[10px] sm:text-xs">{getTraitEmoji(trait)}</span>
                    {/* Mini progress bar */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-b"
                      style={{ 
                        backgroundColor: getTraitColor(trait),
                        width: `${trait === 'neuroticism' ? 100 - score : score}%`,
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-2 sm:p-4 gap-2 sm:gap-3">
        {/* Scene display area */}
        <div className="relative flex-1 min-h-[200px] sm:min-h-[280px] rounded-lg overflow-hidden border-4 border-[#4a4a4a]">
          {/* Animated background */}
          <SceneBackground scene={currentScene.background} />
          
          {/* Scene title */}
          <AnimatePresence>
            {currentScene.title && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-2 left-2 right-2 z-10"
              >
                <span className="nes-badge">
                  <span className="is-dark text-xs">{currentScene.title}</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Character display area */}
          <div className="absolute inset-0 flex items-end justify-center pb-12 sm:pb-16">
            <AnimatePresence mode="wait">
              {currentDialogue && (
                <motion.div
                  key={speakerName || 'narrator'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-end gap-4"
                >
                  {/* Show hero on left for player dialogue */}
                  {currentDialogue.speaker === 'player' && (
                    <Hero 
                      size={isMobile ? 'md' : 'lg'} 
                      animation={isSpeaking ? 'talk' : 'idle'}
                      direction="right"
                    />
                  )}
                  
                  {/* Show NPC */}
                  {speakerName && currentDialogue.speaker !== 'player' && (
                    <NPC 
                      name={speakerName} 
                      size={isMobile ? 'md' : 'lg'}
                      isTalking={isSpeaking}
                    />
                  )}
                  
                  {/* Show hero for narrator scenes with no NPC */}
                  {currentDialogue.speaker === 'narrator' && !speakerName && (
                    <Hero 
                      size={isMobile ? 'md' : 'lg'} 
                      animation="idle"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Personality update toast */}
          <AnimatePresence>
            {showPersonalityPanel && lastDelta && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className="absolute top-12 right-2 nes-container is-dark text-xs p-2 z-20"
              >
                <p className="nes-text is-warning mb-1 text-[10px]">Personality Update!</p>
                {getSignificantChanges(lastDelta).slice(0, 3).map(({ trait, change }) => (
                  <div key={trait} className="flex items-center gap-1 text-[10px]">
                    <span>{getTraitEmoji(trait)}</span>
                    <span className={change > 0 ? 'nes-text is-success' : 'nes-text is-error'}>
                      {change > 0 ? '+' : ''}{change}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Consequence text */}
        <AnimatePresence>
          {consequence && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="nes-container is-rounded is-dark text-center text-xs sm:text-sm py-2"
            >
              <span className="nes-text is-warning">{consequence}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialogue box */}
        <motion.div 
          className="nes-container is-dark is-rounded cursor-pointer relative min-h-[80px] sm:min-h-[100px]"
          onClick={advanceDialogue}
          whileTap={{ scale: 0.995 }}
        >
          {currentDialogue && (
            <div className="space-y-2">
              {/* Speaker name */}
              {currentDialogue.speaker !== 'narrator' && speakerName && (
                <p className={cn(
                  "text-xs font-bold",
                  currentDialogue.speaker === 'player' ? 'nes-text is-primary' :
                  currentDialogue.speaker === 'system' ? 'nes-text is-warning' :
                  'nes-text is-success'
                )}>
                  {speakerName}:
                </p>
              )}
              
              {/* Dialogue text */}
              <p className={cn(
                "text-sm sm:text-base leading-relaxed",
                currentDialogue.speaker === 'narrator' && 'italic text-gray-300',
                currentDialogue.speaker === 'system' && 'nes-text is-warning text-center'
              )}>
                {displayedText}
                {isTyping && <span className="animate-pulse ml-1">▌</span>}
              </p>
              
              {/* Continue indicator */}
              {!isTyping && !showChoices && (
                <motion.p 
                  className="text-right text-xs text-gray-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ▼ Press Enter or tap
                </motion.p>
              )}
            </div>
          )}
        </motion.div>

        {/* Choice buttons */}
        <AnimatePresence>
          {showChoices && currentScene.choices && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              {currentScene.choices.map((choice, index) => (
                <motion.button
                  key={choice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "nes-btn w-full text-left text-xs sm:text-sm py-2 sm:py-3 relative",
                    selectedIndex === index ? 'is-primary' : '',
                    index === 0 && selectedIndex !== 0 && 'is-success',
                    index === 1 && selectedIndex !== 1 && '',
                    index === 2 && selectedIndex !== 2 && 'is-warning',
                  )}
                  onClick={() => handleChoice(choice)}
                  onMouseEnter={() => soundEnabled && playSelect()}
                >
                  {/* Selection indicator */}
                  {selectedIndex === index && (
                    <motion.span 
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      ▶
                    </motion.span>
                  )}
                  <span className={selectedIndex === index ? 'ml-6' : ''}>
                    {choice.text}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile virtual gamepad */}
        {isMobile && showChoices && (
          <div className="mt-2">
            <VirtualGamepad
              onUp={() => {
                const newIndex = selectedIndex > 0 ? selectedIndex - 1 : choiceCount - 1
                // This is handled by useMenuNavigation
              }}
              onDown={() => {
                const newIndex = selectedIndex < choiceCount - 1 ? selectedIndex + 1 : 0
              }}
              onConfirm={() => {
                if (currentScene?.choices) {
                  handleChoice(currentScene.choices[selectedIndex])
                }
              }}
              className="justify-center"
            />
          </div>
        )}
      </main>

      {/* Keyboard hints - desktop only */}
      <footer className="hidden sm:block bg-[#1a1d21] border-t-2 border-[#4a4a4a] py-2 px-4 text-center">
        <p className="text-xs text-gray-500">
          {showChoices ? '↑↓ Navigate • Enter/Z Confirm' : 'Enter/Space/Z Continue • Click to advance'}
        </p>
      </footer>
    </div>
  )
}

export default PersonalityQuest
