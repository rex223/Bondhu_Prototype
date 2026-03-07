"use client"

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Pixel art color palettes (NES-inspired)
const PALETTES = {
  hero: {
    skin: '#ffd8a8',
    hair: '#5c3317',
    clothes: '#3b82f6',
    accent: '#1d4ed8',
    outline: '#1a1a2e',
  },
  wizard: {
    skin: '#f5deb3',
    hair: '#d4d4d4',
    clothes: '#7c3aed',
    accent: '#a855f7',
    outline: '#1a1a2e',
  },
  goblin: {
    skin: '#4ade80',
    hair: '#166534',
    clothes: '#854d0e',
    accent: '#a16207',
    outline: '#1a1a2e',
  },
  fairy: {
    skin: '#fef3c7',
    hair: '#f472b6',
    clothes: '#ec4899',
    accent: '#f9a8d4',
    outline: '#1a1a2e',
  },
  villager: {
    skin: '#ffd8a8',
    hair: '#92400e',
    clothes: '#65a30d',
    accent: '#84cc16',
    outline: '#1a1a2e',
  },
  merchant: {
    skin: '#ffd8a8',
    hair: '#1c1917',
    clothes: '#dc2626',
    accent: '#fbbf24',
    outline: '#1a1a2e',
  },
}

type CharacterType = keyof typeof PALETTES
type AnimationState = 'idle' | 'talk' | 'walk' | 'attack' | 'hurt' | 'happy'
type Direction = 'left' | 'right'

interface PixelCharacterProps {
  type: CharacterType
  animation?: AnimationState
  direction?: Direction
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// 16x16 pixel grid for character sprites (1 = outline, 2 = skin, 3 = hair, 4 = clothes, 5 = accent)
const SPRITE_DATA: Record<CharacterType, number[][]> = {
  hero: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,1,2,2,2,2,1,1,2,2,2,2,1,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
    [0,0,1,4,4,5,4,4,4,4,5,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,0,1,4,4,4,1,1,4,4,4,1,0,0,0],
    [0,0,0,1,2,2,1,0,0,1,2,2,1,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
  ],
  wizard: [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,1,4,5,4,4,5,4,1,0,0,0,0],
    [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,1,2,2,2,2,1,1,2,2,2,2,1,0,0],
    [0,0,0,1,3,2,2,2,2,2,2,3,1,0,0,0],
    [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
    [0,0,1,4,4,4,5,4,4,5,4,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,0,1,4,4,4,1,1,4,4,4,1,0,0,0],
    [0,0,0,1,2,2,1,0,0,1,2,2,1,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
  ],
  goblin: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,1,2,2,1,1,1,1,1,1,2,2,1,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,1,2,1,1,2,2,2,2,1,1,2,1,0,0],
    [0,0,1,2,1,3,2,2,2,2,3,1,2,1,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,0,1,2,2,1,1,1,1,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
    [0,0,0,0,1,4,4,1,1,4,4,1,0,0,0,0],
    [0,0,0,0,1,2,1,0,0,1,2,1,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
  ],
  fairy: [
    [0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,5,5,5,5,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,5,5,1,2,1,2,2,1,2,1,5,5,0,0],
    [0,5,5,5,1,2,1,2,2,1,2,1,5,5,5,0],
    [0,5,5,5,1,2,2,1,1,2,2,1,5,5,5,0],
    [0,0,5,5,0,1,2,2,2,2,1,0,5,5,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,1,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,1,0,0,0,0],
    [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  villager: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,1,2,2,2,2,1,1,2,2,2,2,1,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,0,1,4,4,4,1,1,4,4,4,1,0,0,0],
    [0,0,0,1,2,2,1,0,0,1,2,2,1,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
  ],
  merchant: [
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,5,5,5,5,5,5,5,5,1,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,1,2,2,1,2,2,2,2,1,2,2,1,0,0],
    [0,0,1,2,2,2,2,1,1,2,2,2,2,1,0,0],
    [0,0,0,1,3,2,2,2,2,2,2,3,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
    [0,0,1,4,4,5,5,4,4,5,5,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
    [0,0,0,1,4,4,4,1,1,4,4,4,1,0,0,0],
    [0,0,0,1,2,2,1,0,0,1,2,2,1,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
  ],
}

const SIZE_MAP = {
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
}

export function PixelCharacter({ 
  type, 
  animation = 'idle', 
  direction = 'right',
  size = 'lg',
  className 
}: PixelCharacterProps) {
  const [frame, setFrame] = useState(0)
  const palette = PALETTES[type]
  const spriteData = SPRITE_DATA[type]
  const pixelSize = SIZE_MAP[size] / 16

  // Animation frames
  useEffect(() => {
    if (animation === 'idle') {
      const interval = setInterval(() => {
        setFrame(f => (f + 1) % 2)
      }, 800)
      return () => clearInterval(interval)
    } else if (animation === 'talk') {
      const interval = setInterval(() => {
        setFrame(f => (f + 1) % 4)
      }, 150)
      return () => clearInterval(interval)
    } else if (animation === 'walk') {
      const interval = setInterval(() => {
        setFrame(f => (f + 1) % 4)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [animation])

  // Generate pixel colors
  const getPixelColor = (value: number): string => {
    switch (value) {
      case 0: return 'transparent'
      case 1: return palette.outline
      case 2: return palette.skin
      case 3: return palette.hair
      case 4: return palette.clothes
      case 5: return palette.accent
      default: return 'transparent'
    }
  }

  // Animation transforms
  const animationVariants = useMemo(() => {
    switch (animation) {
      case 'idle':
        return {
          y: frame === 0 ? 0 : -2,
          transition: { duration: 0.4, ease: 'easeInOut' as const }
        }
      case 'talk':
        return {
          scaleY: frame % 2 === 0 ? 1 : 0.98,
          y: frame % 2 === 0 ? 0 : 1,
          transition: { duration: 0.1 }
        }
      case 'walk':
        return {
          x: [0, -2, 0, 2, 0][frame],
          y: [0, -4, 0, -4, 0][frame],
          transition: { duration: 0.15 }
        }
      case 'happy':
        return {
          y: [-4, 0],
          rotate: [-5, 5, -5],
          transition: { duration: 0.3, repeat: Infinity, repeatType: 'reverse' as const }
        }
      default:
        return {}
    }
  }, [animation, frame])

  return (
    <motion.div
      className={cn("relative", className)}
      style={{
        width: SIZE_MAP[size],
        height: SIZE_MAP[size],
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
        imageRendering: 'pixelated',
      }}
      animate={animationVariants}
    >
      {/* Render pixel grid */}
      <div 
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(16, ${pixelSize}px)`,
          gridTemplateRows: `repeat(16, ${pixelSize}px)`,
        }}
      >
        {spriteData.flat().map((pixel, index) => (
          <div
            key={index}
            style={{
              backgroundColor: getPixelColor(pixel),
              width: pixelSize,
              height: pixelSize,
            }}
          />
        ))}
      </div>

      {/* Talk animation overlay - mouth movement */}
      {animation === 'talk' && (
        <motion.div
          className="absolute"
          style={{
            left: pixelSize * 6,
            top: pixelSize * 7,
            width: pixelSize * 4,
            height: pixelSize * (frame % 2 === 0 ? 1 : 2),
            backgroundColor: palette.outline,
          }}
          animate={{ height: frame % 2 === 0 ? pixelSize : pixelSize * 1.5 }}
        />
      )}

      {/* Shadow */}
      <div 
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/30"
        style={{
          width: SIZE_MAP[size] * 0.6,
          height: SIZE_MAP[size] * 0.15,
          filter: 'blur(2px)',
        }}
      />
    </motion.div>
  )
}

// Simple NPC display
interface NPCProps {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isTalking?: boolean
}

export function NPC({ name, className, size = 'lg', isTalking = false }: NPCProps) {
  const typeMap: Record<string, CharacterType> = {
    'Wizard Aldric': 'wizard',
    'Chief Gruk': 'goblin',
    'Goblin Guard': 'goblin',
    'Fairy': 'fairy',
    'Merchant': 'merchant',
    'Child': 'villager',
    'Elder': 'villager',
    'Goblins': 'goblin',
  }

  const type = typeMap[name] || 'villager'
  
  return (
    <PixelCharacter 
      type={type} 
      animation={isTalking ? 'talk' : 'idle'}
      size={size}
      className={className}
    />
  )
}

// Hero character with more control
interface HeroProps {
  animation?: AnimationState
  direction?: Direction
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Hero({ animation = 'idle', direction = 'right', size = 'lg', className }: HeroProps) {
  return (
    <PixelCharacter 
      type="hero" 
      animation={animation}
      direction={direction}
      size={size}
      className={className}
    />
  )
}

export default PixelCharacter
