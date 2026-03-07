"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type SceneType = 'forest' | 'village' | 'cave' | 'castle' | 'road' | 'room' | 'night'

interface SceneBackgroundProps {
  scene: SceneType
  className?: string
}

// Pixel size for rendering (larger = more retro)
const PIXEL_SIZE = 6

// Number of columns to fill typical screen widths (200 * 6 = 1200px covers most screens)
const GRID_COLS = 200
const GRID_ROWS = 35

// Seeded random for consistent rendering (prevents hydration mismatch)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

// NES-inspired limited color palette
const PALETTE = {
  // Blacks & Grays
  black: '#0f0f0f',
  darkGray: '#2d2d2d',
  gray: '#5a5a5a',
  lightGray: '#9d9d9d',
  
  // Blues
  darkBlue: '#1a1a3d',
  blue: '#3b5dc9',
  lightBlue: '#6bc4e8',
  skyBlue: '#8fd3f4',
  
  // Greens
  darkGreen: '#1e4d2b',
  green: '#2d8a4e',
  lightGreen: '#58c070',
  
  // Browns
  darkBrown: '#3d2314',
  brown: '#6b4423',
  lightBrown: '#a66b3d',
  tan: '#d4a574',
  
  // Reds & Oranges
  darkRed: '#6b1c1c',
  red: '#b53838',
  orange: '#e07830',
  yellow: '#ffd93d',
  
  // Purples
  darkPurple: '#2d1b4e',
  purple: '#6b3fa0',
  lightPurple: '#9d72c1',
  
  // Special
  white: '#f0f0e8',
  cream: '#e8dcc8',
  gold: '#ffc73d',
}

export function SceneBackground({ scene, className }: SceneBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Base pixel grid container */}
      <div 
        className="absolute inset-0"
        style={{ 
          imageRendering: 'pixelated',
          WebkitFontSmoothing: 'none',
        }}
      >
        {scene === 'forest' && <ForestScene mounted={mounted} />}
        {scene === 'village' && <VillageScene mounted={mounted} />}
        {scene === 'cave' && <CaveScene mounted={mounted} />}
        {scene === 'castle' && <CastleScene mounted={mounted} />}
        {scene === 'road' && <RoadScene mounted={mounted} />}
        {scene === 'room' && <RoomScene mounted={mounted} />}
        {scene === 'night' && <NightScene mounted={mounted} />}
      </div>
      
      {/* CRT screen effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanlines */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
          }}
        />
        
        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />
        
        {/* Screen glow */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(100,200,255,0.3) 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  )
}

// ==================== PIXEL RENDERING HELPERS ====================

// Render a row of pixels
function PixelRow({ pixels, y, pixelSize = PIXEL_SIZE }: { pixels: string[]; y: number; pixelSize?: number }) {
  return (
    <div 
      className="absolute left-0 right-0 flex"
      style={{ top: y * pixelSize, height: pixelSize }}
    >
      {pixels.map((color, x) => (
        <div
          key={x}
          style={{
            width: pixelSize,
            height: pixelSize,
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

// Create dithered gradient (retro technique) - now deterministic
function createDitheredGradient(color1: string, color2: string, width: number, density: number = 0.5, seed: number = 0): string[] {
  return Array.from({ length: width }, (_, i) => {
    const ratio = i / width
    const threshold = ratio * (1 / density)
    return seededRandom(i + seed) < threshold ? color2 : color1
  })
}

// ==================== FOREST SCENE ====================
function ForestScene({ mounted }: { mounted: boolean }) {
  // Pre-compute dithered pattern
  const skyPattern = useMemo(() => {
    return Array.from({ length: 20 }, (_, y) => 
      Array.from({ length: GRID_COLS }, (_, x) => {
        const ratio = y / 20
        const rand = seededRandom(y * GRID_COLS + x)
        if (ratio > 0.6 && rand > 0.4) return PALETTE.green
        if (ratio > 0.3 && rand > 0.6) return PALETTE.green
        return PALETTE.darkGreen
      })
    )
  }, [])

  return (
    <div className="absolute inset-0" style={{ background: PALETTE.darkGreen }}>
      {/* Dithered forest sky/canopy */}
      <div className="absolute inset-0">
        {skyPattern.map((row, y) => (
          <div 
            key={y}
            className="absolute left-0 right-0 flex"
            style={{ top: y * PIXEL_SIZE, height: PIXEL_SIZE }}
          >
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Back layer trees */}
      <PixelTreeBig x={10} y={70} />
      <PixelTreeBig x={150} y={65} />
      <PixelTreeBig x={300} y={72} />
      <PixelTreeBig x={420} y={68} />
      
      {/* Front layer trees - slightly lower */}
      <PixelTreeBig x={70} y={85} />
      <PixelTreeBig x={220} y={88} />
      <PixelTreeBig x={360} y={82} />
      
      {/* Forest floor */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{ height: PIXEL_SIZE * 8, background: PALETTE.green }}
      >
        {/* Grass texture */}
        <div className="absolute top-0 left-0 right-0 flex" style={{ height: PIXEL_SIZE * 2 }}>
          {Array.from({ length: GRID_COLS }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <div style={{ width: PIXEL_SIZE, height: PIXEL_SIZE, backgroundColor: seededRandom(i * 2) > 0.5 ? PALETTE.lightGreen : PALETTE.green }} />
              <div style={{ width: PIXEL_SIZE, height: PIXEL_SIZE, backgroundColor: seededRandom(i * 2 + 1) > 0.7 ? PALETTE.lightGreen : PALETTE.green }} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Floating particles */}
      {mounted && (
        <>
          <PixelParticle color={PALETTE.lightGreen} delay={0} />
          <PixelParticle color={PALETTE.yellow} delay={1.5} />
          <PixelParticle color={PALETTE.lightGreen} delay={3} />
        </>
      )}
    </div>
  )
}

// ==================== VILLAGE SCENE ====================
function VillageScene({ mounted }: { mounted: boolean }) {
  // Pre-compute sky pattern
  const skyPattern = useMemo(() => {
    return Array.from({ length: 18 }, (_, y) => 
      Array.from({ length: GRID_COLS }, (_, x) => {
        if (y < 4) return PALETTE.lightBlue
        return seededRandom(y * GRID_COLS + x + 1000) > 0.6 ? PALETTE.skyBlue : PALETTE.lightBlue
      })
    )
  }, [])

  // Pre-compute grass texture
  const grassPattern = useMemo(() => {
    return Array.from({ length: GRID_COLS }, (_, i) => seededRandom(i + 2000) > 0.4 ? PALETTE.lightGreen : PALETTE.green)
  }, [])

  return (
    <div className="absolute inset-0" style={{ background: PALETTE.skyBlue }}>
      {/* Dithered sky gradient */}
      <div className="absolute inset-0">
        {skyPattern.map((row, y) => (
          <div 
            key={y}
            className="absolute left-0 right-0 flex"
            style={{ top: y * PIXEL_SIZE, height: PIXEL_SIZE }}
          >
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Pixel Sun */}
      <PixelSun x={380} y={15} />
      
      {/* Pixel Clouds */}
      {mounted && (
        <>
          <PixelCloud x={40} y={25} speed={25} />
          <PixelCloud x={180} y={40} speed={30} />
        </>
      )}
      
      {/* Rolling hills in background */}
      <PixelRollingHill x={-20} width={180} color={PALETTE.lightGreen} yOffset={115} />
      <PixelRollingHill x={140} width={200} color={PALETTE.green} yOffset={120} />
      <PixelRollingHill x={320} width={180} color={PALETTE.lightGreen} yOffset={112} />
      
      {/* Houses */}
      <PixelHouseBig x={50} y={105} />
      <PixelHouseBig x={200} y={95} />
      <PixelHouseBig x={350} y={108} />
      
      {/* Ground - solid grass */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{ 
          height: PIXEL_SIZE * 8,
          background: PALETTE.green,
        }}
      >
        {/* Grass texture variation */}
        <div className="absolute top-0 left-0 right-0 flex" style={{ height: PIXEL_SIZE }}>
          {grassPattern.map((color, i) => (
            <div
              key={i}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Path through village */}
      <div 
        className="absolute bottom-0 left-[35%] w-[30%]"
        style={{ 
          height: PIXEL_SIZE * 8,
          background: PALETTE.tan,
        }}
      />
    </div>
  )
}

// ==================== CAVE SCENE ====================
function CaveScene({ mounted }: { mounted: boolean }) {
  // Pre-compute cave pattern
  const cavePattern = useMemo(() => {
    const centerX = GRID_COLS / 2
    return Array.from({ length: GRID_ROWS }, (_, y) => 
      Array.from({ length: GRID_COLS }, (_, x) => {
        const distFromCenter = Math.abs(x - centerX) / centerX
        const brightness = 1 - distFromCenter * 0.7
        return brightness > 0.5 && seededRandom(y * GRID_COLS + x + 3000) > 0.7 
          ? PALETTE.darkBlue 
          : PALETTE.black
      })
    )
  }, [])

  return (
    <div className="absolute inset-0" style={{ background: PALETTE.black }}>
      {/* Dark cave gradient */}
      <div className="absolute inset-0">
        {cavePattern.map((row, y) => (
          <div 
            key={y}
            className="absolute left-0 right-0 flex"
            style={{ top: y * PIXEL_SIZE, height: PIXEL_SIZE }}
          >
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Stalactites */}
      <PixelStalactites />
      
      {/* Glowing crystals */}
      <PixelCrystal x={80} y={160} color="blue" size="lg" />
      <PixelCrystal x={150} y={170} color="purple" size="sm" />
      <PixelCrystal x={320} y={155} color="blue" size="lg" />
      <PixelCrystal x={380} y={168} color="purple" size="md" />
      
      {/* Animated glow */}
      {mounted && (
        <>
          <PixelGlow x={80} y={150} color={PALETTE.lightBlue} />
          <PixelGlow x={320} y={145} color={PALETTE.lightBlue} />
        </>
      )}
      
      {/* Rocky ground */}
      <PixelCaveFloor />
    </div>
  )
}

// ==================== CASTLE SCENE ====================
function CastleScene({ mounted }: { mounted: boolean }) {
  // Pre-compute sky pattern
  const skyPattern = useMemo(() => {
    return Array.from({ length: 20 }, (_, y) => 
      Array.from({ length: GRID_COLS }, (_, x) => {
        const rand = seededRandom(y * GRID_COLS + x + 4000)
        if (y < 8) return rand > 0.8 ? PALETTE.purple : PALETTE.darkPurple
        return rand > 0.6 ? PALETTE.lightPurple : PALETTE.purple
      })
    )
  }, [])

  return (
    <div className="absolute inset-0" style={{ background: PALETTE.darkPurple }}>
      {/* Dramatic sky */}
      <div className="absolute inset-0">
        {skyPattern.map((row, y) => (
          <div 
            key={y}
            className="absolute left-0 right-0 flex"
            style={{ top: y * PIXEL_SIZE, height: PIXEL_SIZE }}
          >
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Pixel Castle */}
      <PixelCastle x={120} y={60} />
      
      {/* Moon */}
      <PixelMoon x={50} y={25} />
      
      {/* Animated flags */}
      {mounted && (
        <>
          <PixelFlag x={168} y={48} color={PALETTE.red} />
          <PixelFlag x={228} y={58} color={PALETTE.red} />
          <PixelFlag x={288} y={48} color={PALETTE.red} />
        </>
      )}
      
      {/* Ground */}
      <PixelGround color={PALETTE.darkGray} altColor={PALETTE.black} />
    </div>
  )
}

// ==================== ROAD SCENE ====================
function RoadScene({ mounted }: { mounted: boolean }) {
  // Pre-compute sky pattern
  const skyPattern = useMemo(() => {
    return Array.from({ length: 18 }, (_, y) => 
      Array.from({ length: GRID_COLS }, (_, x) => {
        if (y < 5) return PALETTE.lightBlue
        return seededRandom(y * GRID_COLS + x + 6000) > 0.6 ? PALETTE.skyBlue : PALETTE.lightBlue
      })
    )
  }, [])

  return (
    <div className="absolute inset-0" style={{ background: PALETTE.skyBlue }}>
      {/* Sky gradient - dithered */}
      <div className="absolute inset-0">
        {skyPattern.map((row, y) => (
          <div 
            key={y}
            className="absolute left-0 right-0 flex"
            style={{ top: y * PIXEL_SIZE, height: PIXEL_SIZE }}
          >
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Mountains - positioned correctly */}
      <PixelMountainUp x={20} y={90} width={120} height={50} color={PALETTE.gray} highlightColor={PALETTE.lightGray} />
      <PixelMountainUp x={120} y={75} width={160} height={65} color={PALETTE.lightGray} highlightColor={PALETTE.white} />
      <PixelMountainUp x={280} y={85} width={140} height={55} color={PALETTE.gray} highlightColor={PALETTE.lightGray} />
      
      {/* Clouds */}
      {mounted && (
        <>
          <PixelCloud x={60} y={20} speed={35} />
          <PixelCloud x={250} y={35} speed={28} />
        </>
      )}
      
      {/* Trees on sides */}
      <PixelTreeBig x={15} y={95} />
      <PixelTreeBig x={400} y={100} />
      
      {/* Green grass area */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{ 
          height: PIXEL_SIZE * 10,
          background: PALETTE.green,
        }}
      />
      
      {/* Road on grass */}
      <div 
        className="absolute bottom-0 left-1/4 right-1/4"
        style={{ 
          height: PIXEL_SIZE * 10,
          background: PALETTE.gray,
        }}
      >
        {/* Yellow road markings */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-around px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              style={{ 
                width: PIXEL_SIZE * 4, 
                height: PIXEL_SIZE, 
                backgroundColor: PALETTE.yellow 
              }} 
            />
          ))}
        </div>
      </div>
      
      {/* Grass texture on top */}
      <GrassStrip />
    </div>
  )
}

// ==================== ROOM SCENE ====================
function RoomScene({ mounted }: { mounted: boolean }) {
  // Pre-compute wall pattern
  const wallPattern = useMemo(() => {
    return Array.from({ length: 22 }, (_, y) => 
      Array.from({ length: GRID_COLS }, (_, x) => {
        const isPlankEdge = y % 5 === 0
        if (isPlankEdge) return PALETTE.darkBrown
        return seededRandom(y * GRID_COLS + x + 8000) > 0.9 ? PALETTE.lightBrown : PALETTE.brown
      })
    )
  }, [])

  return (
    <div className="absolute inset-0" style={{ background: PALETTE.brown }}>
      {/* Wooden wall with planks */}
      <div className="absolute inset-0">
        {wallPattern.map((row, y) => (
          <div 
            key={y}
            className="absolute left-0 right-0 flex"
            style={{ top: y * PIXEL_SIZE, height: PIXEL_SIZE }}
          >
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Window with light */}
      <PixelWindowBig x={30} y={25} />
      
      {/* Light beam from window */}
      {mounted && <PixelLightBeam x={30} y={25} />}
      
      {/* Fireplace on right */}
      <PixelFireplaceBig x={340} y={95} mounted={mounted} />
      
      {/* Bookshelf */}
      <PixelBookshelfBig x={220} y={25} />
      
      {/* Table in center */}
      <PixelTableBig x={130} y={120} />
      
      {/* Wooden floor */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{ height: PIXEL_SIZE * 6 }}
      >
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex">
            {Array.from({ length: 40 }).map((_, col) => (
              <div
                key={col}
                style={{
                  width: PIXEL_SIZE * 2,
                  height: PIXEL_SIZE,
                  backgroundColor: (col + row) % 2 === 0 ? PALETTE.darkBrown : PALETTE.brown,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== NIGHT SCENE ====================
function NightScene({ mounted }: { mounted: boolean }) {
  const stars = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.floor(seededRandom(i * 3 + 9000) * 70),
      y: Math.floor(seededRandom(i * 3 + 9001) * 20),
      twinkle: seededRandom(i * 3 + 9002) > 0.5,
    })), [])

  // Pre-compute night sky pattern
  const skyPattern = useMemo(() => {
    return Array.from({ length: 25 }, (_, y) => 
      Array.from({ length: GRID_COLS }, (_, x) => {
        if (y < 10) return PALETTE.black
        return seededRandom(y * GRID_COLS + x + 10000) > 0.85 ? PALETTE.darkBlue : PALETTE.black
      })
    )
  }, [])

  return (
    <div className="absolute inset-0" style={{ background: PALETTE.black }}>
      {/* Night sky gradient */}
      <div className="absolute inset-0">
        {skyPattern.map((row, y) => (
          <div 
            key={y}
            className="absolute left-0 right-0 flex"
            style={{ top: y * PIXEL_SIZE, height: PIXEL_SIZE }}
          >
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Stars */}
      {stars.map((star, i) => (
        <PixelStar 
          key={i} 
          x={star.x * PIXEL_SIZE} 
          y={star.y * PIXEL_SIZE} 
          twinkle={mounted && star.twinkle}
        />
      ))}
      
      {/* Moon */}
      <PixelMoon x={320} y={20} large />
      
      {/* Tree silhouettes */}
      <PixelTreeSilhouette x={40} y={130} size="lg" />
      <PixelTreeSilhouette x={120} y={135} size="md" />
      <PixelTreeSilhouette x={350} y={128} size="lg" />
      <PixelTreeSilhouette x={420} y={138} size="md" />
      
      {/* Ground */}
      <PixelGround color={PALETTE.darkGray} altColor={PALETTE.black} />
      
      {/* Shooting star */}
      {mounted && <PixelShootingStar />}
    </div>
  )
}

// ==================== PIXEL ART COMPONENTS ====================

function PixelTree({ x, y, size, variant }: { x: number; y: number; size: 'md' | 'lg' | 'xl'; variant: 'dark' | 'mid' }) {
  const sizeMultiplier = size === 'xl' ? 1.5 : size === 'lg' ? 1.2 : 1
  const colors = variant === 'dark' 
    ? { leaves: PALETTE.darkGreen, trunk: PALETTE.darkBrown }
    : { leaves: PALETTE.green, trunk: PALETTE.brown }
  
  const treePixels = [
    '    XX    ',
    '   XXXX   ',
    '  XXXXXX  ',
    ' XXXXXXXX ',
    '  XXXXXX  ',
    ' XXXXXXXX ',
    'XXXXXXXXXX',
    '   TTTT   ',
    '   TTTT   ',
  ]
  
  return (
    <div 
      className="absolute"
      style={{ 
        left: x, 
        top: y,
        transform: `scale(${sizeMultiplier})`,
        transformOrigin: 'bottom center',
      }}
    >
      {treePixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: char === 'X' ? colors.leaves : char === 'T' ? colors.trunk : 'transparent',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelHouse({ x, y, size }: { x: number; y: number; size: 'sm' | 'lg' }) {
  const housePixels = size === 'lg' ? [
    '     RRRR     ',
    '    RRRRRR    ',
    '   RRRRRRRR   ',
    '  RRRRRRRRRR  ',
    ' RRRRRRRRRRRR ',
    '  WWWWWWWWWW  ',
    '  WBWWWWWBWW  ',
    '  WBWWWWWBWW  ',
    '  WWWWDDWWWW  ',
    '  WWWWDDWWWW  ',
  ] : [
    '    RRR    ',
    '   RRRRR   ',
    '  RRRRRRR  ',
    '  WWWWWWW  ',
    '  WBWWWBW  ',
    '  WWWDDWW  ',
    '  WWWDDWW  ',
  ]
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {housePixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: 
                  char === 'R' ? PALETTE.darkRed :
                  char === 'W' ? PALETTE.cream :
                  char === 'B' ? PALETTE.lightBlue :
                  char === 'D' ? PALETTE.darkBrown :
                  'transparent',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelSun({ x, y }: { x: number; y: number }) {
  const sunPixels = [
    ' YYY ',
    'YYYYY',
    'YYYYY',
    'YYYYY',
    ' YYY ',
  ]
  
  return (
    <motion.div 
      className="absolute"
      style={{ left: x, top: y }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {sunPixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: char === 'Y' ? PALETTE.yellow : 'transparent',
                boxShadow: char === 'Y' ? `0 0 ${PIXEL_SIZE}px ${PALETTE.yellow}` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </motion.div>
  )
}

function PixelMoon({ x, y, large }: { x: number; y: number; large?: boolean }) {
  const moonPixels = large ? [
    '  WWWW  ',
    ' WWWWWW ',
    'WWWGWWWW',
    'WWWWWWWW',
    'WWWWWGWW',
    'WWWWWWWW',
    ' WWWWWW ',
    '  WWWW  ',
  ] : [
    ' WWW ',
    'WWWWW',
    'WWGWW',
    'WWWWW',
    ' WWW ',
  ]
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {moonPixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: char === 'W' ? PALETTE.cream : char === 'G' ? PALETTE.lightGray : 'transparent',
                boxShadow: char === 'W' ? `0 0 ${PIXEL_SIZE * 2}px ${PALETTE.cream}40` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelCloud({ x, y, speed }: { x: number; y: number; speed: number }) {
  const cloudPixels = [
    '  WWW  ',
    ' WWWWW ',
    'WWWWWWW',
  ]
  
  return (
    <motion.div 
      className="absolute"
      style={{ top: y }}
      initial={{ left: x }}
      animate={{ left: [x, x + 100, x] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    >
      {cloudPixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: char === 'W' ? PALETTE.white : 'transparent',
              }}
            />
          ))}
        </div>
      ))}
    </motion.div>
  )
}

function PixelCrystal({ x, y, color, size }: { x: number; y: number; color: 'blue' | 'purple'; size: 'sm' | 'md' | 'lg' }) {
  const crystalColor = color === 'blue' ? PALETTE.lightBlue : PALETTE.lightPurple
  const pixels = size === 'lg' ? [
    ' X ',
    ' X ',
    'XXX',
    'XXX',
    ' X ',
  ] : size === 'md' ? [
    ' X ',
    'XXX',
    ' X ',
  ] : [
    'X',
    'X',
  ]
  
  return (
    <motion.div 
      className="absolute"
      style={{ left: x, top: y }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {pixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: char === 'X' ? crystalColor : 'transparent',
                boxShadow: char === 'X' ? `0 0 ${PIXEL_SIZE}px ${crystalColor}` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </motion.div>
  )
}

function PixelCastle({ x, y }: { x: number; y: number }) {
  const castlePixels = [
    '  X   X   X  ',
    ' XXX XXX XXX ',
    ' XXX XXX XXX ',
    ' XXXXXXXXXXX ',
    ' XGXXGXXGXXX ',
    ' XXXXXXXXXXX ',
    ' XXXXXXXXXXX ',
    ' XXXXX XXXXX ',
    ' XXXXX XXXXX ',
  ]
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {castlePixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE * 1.5,
                height: PIXEL_SIZE * 1.5,
                backgroundColor: 
                  char === 'X' ? PALETTE.darkGray :
                  char === 'G' ? PALETTE.gold :
                  'transparent',
                boxShadow: char === 'G' ? `0 0 4px ${PALETTE.gold}` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelStalactites() {
  const stalactiteCount = Math.floor(GRID_COLS / 4)
  const stalactites = useMemo(() => 
    Array.from({ length: stalactiteCount }, (_, i) => ({
      height: 2 + Math.floor(seededRandom(i + 13000) * 4)
    })), [stalactiteCount])

  return (
    <div className="absolute top-0 left-0 right-0 flex">
      {stalactites.map(({ height }, i) => (
        <div key={i} className="flex flex-col" style={{ width: PIXEL_SIZE * 2 }}>
          {Array.from({ length: height }).map((_, j) => (
            <div
              key={j}
              style={{
                width: PIXEL_SIZE * (j === height - 1 ? 1 : 2),
                height: PIXEL_SIZE,
                backgroundColor: PALETTE.darkGray,
                marginLeft: j === height - 1 ? PIXEL_SIZE / 2 : 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelMountain({ x, y, size, color }: { x: number; y: number; size: 'lg' | 'xl'; color: string }) {
  const width = size === 'xl' ? 15 : 10
  const height = size === 'xl' ? 8 : 5
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {Array.from({ length: height }).map((_, row) => (
        <div key={row} className="flex justify-center">
          {Array.from({ length: width - row * 2 }).map((_, col) => (
            <div
              key={col}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Proper mountain pointing UP
function PixelMountainUp({ x, y, width, height, color, highlightColor }: { 
  x: number; y: number; width: number; height: number; color: string; highlightColor: string 
}) {
  const rows = Math.floor(height / PIXEL_SIZE)
  const cols = Math.floor(width / PIXEL_SIZE)
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {Array.from({ length: rows }).map((_, row) => {
        // Mountain gets wider as we go down (row increases)
        const rowWidth = Math.floor(((row + 1) / rows) * cols)
        const offset = Math.floor((cols - rowWidth) / 2)
        
        return (
          <div key={row} className="flex" style={{ marginLeft: offset * PIXEL_SIZE }}>
            {Array.from({ length: rowWidth }).map((_, col) => {
              // Left side highlight
              const isHighlight = col < rowWidth * 0.3
              return (
                <div
                  key={col}
                  style={{
                    width: PIXEL_SIZE,
                    height: PIXEL_SIZE,
                    backgroundColor: isHighlight ? highlightColor : color,
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// Bigger tree for road scene
function PixelTreeBig({ x, y }: { x: number; y: number }) {
  const treePixels = [
    '    GGG    ',
    '   GGGGG   ',
    '  GGGGGGG  ',
    ' GGGGGGGGG ',
    '  GGGGGGG  ',
    ' GGGGGGGGG ',
    'GGGGGGGGGGG',
    '    BBB    ',
    '    BBB    ',
    '    BBB    ',
  ]
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {treePixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: 
                  char === 'G' ? PALETTE.green : 
                  char === 'B' ? PALETTE.brown : 
                  'transparent',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Grass strip for ground
function GrassStrip() {
  const pattern = useMemo(() => 
    Array.from({ length: GRID_COLS }, (_, i) => 
      seededRandom(i + 7000) > 0.5 ? PALETTE.green : PALETTE.lightGreen
    ), [])

  return (
    <div className="absolute bottom-[60px] left-0 right-0 flex overflow-hidden" style={{ height: PIXEL_SIZE }}>
      {pattern.map((color, i) => (
        <div
          key={i}
          style={{
            width: PIXEL_SIZE,
            height: PIXEL_SIZE,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  )
}

function PixelHill({ x, y, width, height, color }: { x: number; y: number; width: number; height: number; color: string }) {
  return (
    <div 
      className="absolute"
      style={{ 
        left: x, 
        top: y,
        width,
        height,
        backgroundColor: color,
        borderRadius: '50% 50% 0 0',
      }}
    />
  )
}

// Rolling hill with pixel steps
function PixelRollingHill({ x, width, color, yOffset }: { x: number; width: number; color: string; yOffset: number }) {
  const cols = Math.floor(width / PIXEL_SIZE)
  const maxHeight = 6
  
  // Pre-compute hill pattern
  const hillPattern = useMemo(() => {
    return Array.from({ length: cols }, (_, col) => {
      const progress = col / cols
      const hillHeight = Math.floor(Math.sin(progress * Math.PI) * maxHeight) + 1
      const topColor = seededRandom(col + x + 11000) > 0.5 ? PALETTE.lightGreen : color
      return { hillHeight, topColor }
    })
  }, [cols, color, x])
  
  return (
    <div className="absolute" style={{ left: x, top: yOffset }}>
      {/* Create hill shape from pixels */}
      <div className="flex items-end">
        {hillPattern.map(({ hillHeight, topColor }, col) => (
          <div key={col} className="flex flex-col-reverse">
            {Array.from({ length: hillHeight }).map((_, row) => (
              <div
                key={row}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: row === hillHeight - 1 ? topColor : color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Better house for village
function PixelHouseBig({ x, y }: { x: number; y: number }) {
  const housePixels = [
    '    RRRRR    ',
    '   RRRRRRR   ',
    '  RRRRRRRRR  ',
    ' RRRRRRRRRRR ',
    'RRRRRRRRRRRRR',
    ' WWWWWWWWWWW ',
    ' WBBWWWWWBBW ',
    ' WBBWWWWWBBW ',
    ' WWWWDDDWWWW ',
    ' WWWWDDDWWWW ',
    ' WWWWDDDWWWW ',
  ]
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {housePixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: 
                  char === 'R' ? PALETTE.darkRed :
                  char === 'W' ? PALETTE.cream :
                  char === 'B' ? PALETTE.lightBlue :
                  char === 'D' ? PALETTE.darkBrown :
                  'transparent',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelGround({ color, altColor, grassTop }: { color: string; altColor: string; grassTop?: boolean }) {
  const grassPattern = useMemo(() => 
    Array.from({ length: GRID_COLS }, (_, i) => ({
      height: seededRandom(i + 14000) > 0.5 ? PIXEL_SIZE : PIXEL_SIZE / 2,
      bgColor: seededRandom(i + 14100) > 0.3 ? color : altColor,
    })), [color, altColor])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16">
      {grassTop && (
        <div className="absolute top-0 left-0 right-0 flex h-2">
          {grassPattern.map(({ height, bgColor }, i) => (
            <div
              key={i}
              style={{
                width: PIXEL_SIZE,
                height,
                backgroundColor: bgColor,
              }}
            />
          ))}
        </div>
      )}
      <div 
        className="absolute inset-0 top-2"
        style={{
          background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} ${PIXEL_SIZE}px, ${altColor} ${PIXEL_SIZE}px, ${altColor} ${PIXEL_SIZE * 2}px)`,
        }}
      />
    </div>
  )
}

function PixelCaveFloor() {
  const floorPattern = useMemo(() => {
    return Array.from({ length: 3 }, (_, row) => 
      Array.from({ length: GRID_COLS }, (_, col) => 
        seededRandom(row * GRID_COLS + col + 5000) > 0.7 ? PALETTE.darkGray : PALETTE.black
      )
    )
  }, [])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12">
      {floorPattern.map((row, rowIdx) => (
        <div key={rowIdx} className="flex">
          {row.map((color, col) => (
            <div
              key={col}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelRoad() {
  return (
    <div className="absolute bottom-16 left-1/4 right-1/4 h-12">
      {/* Road surface */}
      <div className="absolute inset-0" style={{ backgroundColor: PALETTE.gray }} />
      {/* Center line */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-around h-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ width: PIXEL_SIZE * 3, backgroundColor: PALETTE.yellow }} />
        ))}
      </div>
    </div>
  )
}

function PixelWindow({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {/* Frame */}
      <div 
        className="relative"
        style={{ 
          width: PIXEL_SIZE * 8, 
          height: PIXEL_SIZE * 10,
          backgroundColor: PALETTE.darkBrown,
          padding: PIXEL_SIZE / 2,
        }}
      >
        {/* Glass */}
        <div 
          style={{ 
            width: '100%', 
            height: '100%',
            backgroundColor: PALETTE.lightBlue,
          }}
        >
          {/* Cross bar */}
          <div 
            className="absolute top-1/2 left-0 right-0"
            style={{ height: PIXEL_SIZE / 2, backgroundColor: PALETTE.darkBrown }}
          />
          <div 
            className="absolute left-1/2 top-0 bottom-0"
            style={{ width: PIXEL_SIZE / 2, backgroundColor: PALETTE.darkBrown }}
          />
        </div>
      </div>
    </div>
  )
}

// Bigger window for room
function PixelWindowBig({ x, y }: { x: number; y: number }) {
  const windowPixels = [
    'BBBBBBBBBB',
    'BLLLLLLLLB',
    'BLLLLLLLLB',
    'BLLLLLLLLB',
    'BBBBBBBBBB',
    'BLLLLLLLLB',
    'BLLLLLLLLB',
    'BLLLLLLLLB',
    'BBBBBBBBBB',
  ]
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {windowPixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: char === 'B' ? PALETTE.darkBrown : PALETTE.lightBlue,
                boxShadow: char === 'L' ? `inset 0 0 ${PIXEL_SIZE}px ${PALETTE.skyBlue}40` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Bigger fireplace
function PixelFireplaceBig({ x, y, mounted }: { x: number; y: number; mounted: boolean }) {
  const fireplacePixels = [
    'GGGGGGGGGGGG',
    'GGGGGGGGGGGGG',
    'GG        GG',
    'GG        GG',
    'GG        GG',
    'GG        GG',
    'GGGGGGGGGGGGG',
  ]
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {fireplacePixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: char === 'G' ? PALETTE.gray : PALETTE.black,
              }}
            />
          ))}
        </div>
      ))}
      {/* Fire inside */}
      {mounted && (
        <div className="absolute flex items-end justify-center" style={{ top: PIXEL_SIZE * 2, left: PIXEL_SIZE * 3, width: PIXEL_SIZE * 6, height: PIXEL_SIZE * 4 }}>
          <motion.div
            style={{ width: PIXEL_SIZE * 2, height: PIXEL_SIZE * 3, backgroundColor: PALETTE.red }}
            animate={{ height: [PIXEL_SIZE * 3, PIXEL_SIZE * 4, PIXEL_SIZE * 3] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          <motion.div
            style={{ width: PIXEL_SIZE * 2, height: PIXEL_SIZE * 4, backgroundColor: PALETTE.orange }}
            animate={{ height: [PIXEL_SIZE * 4, PIXEL_SIZE * 3, PIXEL_SIZE * 4] }}
            transition={{ duration: 0.25, repeat: Infinity }}
          />
          <motion.div
            style={{ width: PIXEL_SIZE * 2, height: PIXEL_SIZE * 3, backgroundColor: PALETTE.yellow }}
            animate={{ height: [PIXEL_SIZE * 3, PIXEL_SIZE * 2, PIXEL_SIZE * 3] }}
            transition={{ duration: 0.35, repeat: Infinity }}
          />
        </div>
      )}
    </div>
  )
}

// Bigger bookshelf
function PixelBookshelfBig({ x, y }: { x: number; y: number }) {
  // Pre-compute book layout
  const bookLayout = useMemo(() => {
    const colors = [PALETTE.red, PALETTE.blue, PALETTE.green, PALETTE.purple, PALETTE.orange]
    return [0, 1, 2, 3].map((shelf) => {
      const numBooks = 3 + Math.floor(seededRandom(shelf + 12000) * 2)
      return colors.slice(0, numBooks).map((color, i) => ({
        color,
        width: PIXEL_SIZE + seededRandom(shelf * 5 + i + 12100) * 4,
      }))
    })
  }, [])

  return (
    <div 
      className="absolute"
      style={{ 
        left: x, 
        top: y,
        width: PIXEL_SIZE * 10,
        height: PIXEL_SIZE * 14,
        backgroundColor: PALETTE.darkBrown,
      }}
    >
      {/* Shelves with books */}
      {bookLayout.map((books, shelf) => (
        <div 
          key={shelf}
          className="flex gap-px px-1"
          style={{ marginTop: shelf === 0 ? PIXEL_SIZE : PIXEL_SIZE / 2 }}
        >
          {books.map((book, i) => (
            <div
              key={i}
              style={{
                width: book.width,
                height: PIXEL_SIZE * 2,
                backgroundColor: book.color,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Bigger table
function PixelTableBig({ x, y }: { x: number; y: number }) {
  const tablePixels = [
    'TTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTT',
    'LL            LL',
    'LL            LL',
    'LL            LL',
  ]
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {tablePixels.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.split('').map((char, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: char === 'T' ? PALETTE.lightBrown : char === 'L' ? PALETTE.brown : 'transparent',
              }}
            />
          ))}
        </div>
      ))}
      {/* Items on table */}
      <div 
        className="absolute"
        style={{ top: -PIXEL_SIZE * 2, left: PIXEL_SIZE * 3, width: PIXEL_SIZE * 3, height: PIXEL_SIZE * 2, backgroundColor: PALETTE.cream }}
      />
      <div 
        className="absolute"
        style={{ top: -PIXEL_SIZE, left: PIXEL_SIZE * 10, width: PIXEL_SIZE * 2, height: PIXEL_SIZE, backgroundColor: PALETTE.yellow }}
      />
    </div>
  )
}

function PixelLightBeam({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x + PIXEL_SIZE * 4,
        top: y + PIXEL_SIZE * 10,
        width: PIXEL_SIZE * 20,
        height: PIXEL_SIZE * 25,
        background: `linear-gradient(135deg, ${PALETTE.yellow}30 0%, transparent 100%)`,
        transformOrigin: 'top left',
        transform: 'skewX(-15deg)',
      }}
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
  )
}

function PixelFireplace({ x, y, mounted }: { x: number; y: number; mounted: boolean }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {/* Stone frame */}
      <div 
        style={{
          width: PIXEL_SIZE * 10,
          height: PIXEL_SIZE * 8,
          backgroundColor: PALETTE.gray,
        }}
      >
        {/* Opening */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden"
          style={{
            width: PIXEL_SIZE * 6,
            height: PIXEL_SIZE * 5,
            backgroundColor: PALETTE.black,
            borderRadius: `${PIXEL_SIZE * 3}px ${PIXEL_SIZE * 3}px 0 0`,
          }}
        >
          {/* Fire */}
          {mounted && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <motion.div
                style={{
                  width: PIXEL_SIZE * 2,
                  height: PIXEL_SIZE * 3,
                  backgroundColor: PALETTE.red,
                }}
                animate={{ height: [PIXEL_SIZE * 3, PIXEL_SIZE * 4, PIXEL_SIZE * 3] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              <motion.div
                style={{
                  width: PIXEL_SIZE * 2,
                  height: PIXEL_SIZE * 4,
                  backgroundColor: PALETTE.orange,
                }}
                animate={{ height: [PIXEL_SIZE * 4, PIXEL_SIZE * 3, PIXEL_SIZE * 4] }}
                transition={{ duration: 0.25, repeat: Infinity }}
              />
              <motion.div
                style={{
                  width: PIXEL_SIZE * 2,
                  height: PIXEL_SIZE * 3,
                  backgroundColor: PALETTE.yellow,
                }}
                animate={{ height: [PIXEL_SIZE * 3, PIXEL_SIZE * 2, PIXEL_SIZE * 3] }}
                transition={{ duration: 0.35, repeat: Infinity }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PixelBookshelf({ x, y }: { x: number; y: number }) {
  const books = [PALETTE.red, PALETTE.blue, PALETTE.green, PALETTE.purple, PALETTE.orange]
  
  const shelfCounts = useMemo(() => 
    [0, 1, 2].map((shelf) => 3 + Math.floor(seededRandom(shelf + 15000) * 2)), [])
  
  return (
    <div 
      className="absolute"
      style={{ 
        left: x, 
        top: y,
        width: PIXEL_SIZE * 8,
        height: PIXEL_SIZE * 12,
        backgroundColor: PALETTE.darkBrown,
      }}
    >
      {/* Shelves */}
      {shelfCounts.map((count, shelf) => (
        <div 
          key={shelf}
          className="flex gap-px p-px"
          style={{ marginTop: shelf === 0 ? PIXEL_SIZE : 0 }}
        >
          {books.slice(0, count).map((color, i) => (
            <div
              key={i}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE * 2,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelTable({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {/* Table top */}
      <div 
        style={{
          width: PIXEL_SIZE * 12,
          height: PIXEL_SIZE * 2,
          backgroundColor: PALETTE.lightBrown,
        }}
      />
      {/* Legs */}
      <div className="flex justify-between">
        <div style={{ width: PIXEL_SIZE * 2, height: PIXEL_SIZE * 4, backgroundColor: PALETTE.brown }} />
        <div style={{ width: PIXEL_SIZE * 2, height: PIXEL_SIZE * 4, backgroundColor: PALETTE.brown }} />
      </div>
    </div>
  )
}

function PixelFloor() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-10">
      {Array.from({ length: 3 }).map((_, row) => (
        <div key={row} className="flex">
          {Array.from({ length: 40 }).map((_, col) => (
            <div
              key={col}
              style={{
                width: PIXEL_SIZE * 2,
                height: PIXEL_SIZE,
                backgroundColor: (col + row) % 2 === 0 ? PALETTE.darkBrown : PALETTE.brown,
                borderRight: `1px solid ${PALETTE.black}20`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function PixelStar({ x, y, twinkle }: { x: number; y: number; twinkle: boolean }) {
  // Use consistent duration based on position
  const duration = 1 + seededRandom(x + y + 16000)
  
  if (twinkle) {
    return (
      <motion.div
        className="absolute"
        style={{
          left: x,
          top: y,
          width: PIXEL_SIZE,
          height: PIXEL_SIZE,
          backgroundColor: PALETTE.white,
        }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration, repeat: Infinity }}
      />
    )
  }
  
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: PIXEL_SIZE / 2,
        height: PIXEL_SIZE / 2,
        backgroundColor: PALETTE.white,
        opacity: 0.6,
      }}
    />
  )
}

function PixelTreeSilhouette({ x, y, size }: { x: number; y: number; size: 'md' | 'lg' }) {
  const height = size === 'lg' ? 8 : 5
  
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {Array.from({ length: height }).map((_, row) => (
        <div key={row} className="flex justify-center">
          {Array.from({ length: height - row }).map((_, col) => (
            <div
              key={col}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: PALETTE.black,
              }}
            />
          ))}
        </div>
      ))}
      {/* Trunk */}
      <div className="flex justify-center">
        <div style={{ width: PIXEL_SIZE * 2, height: PIXEL_SIZE * 2, backgroundColor: PALETTE.black }} />
      </div>
    </div>
  )
}

function PixelShootingStar() {
  return (
    <motion.div
      className="absolute"
      initial={{ left: '80%', top: '10%', opacity: 0 }}
      animate={{
        left: ['80%', '20%'],
        top: ['10%', '40%'],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatDelay: 10,
      }}
    >
      <div className="flex">
        <div style={{ width: PIXEL_SIZE, height: PIXEL_SIZE, backgroundColor: PALETTE.white }} />
        <div style={{ width: PIXEL_SIZE, height: PIXEL_SIZE, backgroundColor: PALETTE.white, opacity: 0.7 }} />
        <div style={{ width: PIXEL_SIZE, height: PIXEL_SIZE, backgroundColor: PALETTE.white, opacity: 0.4 }} />
      </div>
    </motion.div>
  )
}

function PixelFlag({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <motion.div className="absolute" style={{ left: x, top: y }}>
      {/* Pole */}
      <div style={{ width: PIXEL_SIZE / 2, height: PIXEL_SIZE * 6, backgroundColor: PALETTE.gray }} />
      {/* Flag */}
      <motion.div
        className="absolute top-0 left-1"
        style={{
          width: PIXEL_SIZE * 3,
          height: PIXEL_SIZE * 2,
          backgroundColor: color,
        }}
        animate={{ skewX: [0, 5, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  )
}

function PixelParticle({ color, delay }: { color: string; delay: number }) {
  // Use delay as seed for consistent positioning
  const startX = 50 + seededRandom(delay * 100 + 17000) * 300
  const startY = 50 + seededRandom(delay * 100 + 17001) * 100
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: startX,
        top: startY,
        width: PIXEL_SIZE,
        height: PIXEL_SIZE,
        backgroundColor: color,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 10, -5, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
      }}
    />
  )
}

function PixelGlow({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: x - PIXEL_SIZE * 4,
        top: y - PIXEL_SIZE * 4,
        width: PIXEL_SIZE * 8,
        height: PIXEL_SIZE * 8,
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  )
}

export default SceneBackground
