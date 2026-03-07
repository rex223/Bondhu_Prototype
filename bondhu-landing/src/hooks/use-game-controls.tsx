"use client"

import { useEffect, useCallback, useState } from 'react'

interface GameControlsOptions {
  onConfirm?: () => void
  onCancel?: () => void
  onUp?: () => void
  onDown?: () => void
  onLeft?: () => void
  onRight?: () => void
  enabled?: boolean
}

interface GameControlsState {
  selectedIndex: number
  isHolding: boolean
  lastKey: string | null
}

export function useGameControls({
  onConfirm,
  onCancel,
  onUp,
  onDown,
  onLeft,
  onRight,
  enabled = true,
}: GameControlsOptions = {}) {
  const [state, setState] = useState<GameControlsState>({
    selectedIndex: 0,
    isHolding: false,
    lastKey: null,
  })

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Prevent default for game keys
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space', 'Escape', 'KeyZ', 'KeyX']
    if (gameKeys.includes(event.code)) {
      event.preventDefault()
    }

    setState(prev => ({ ...prev, lastKey: event.code, isHolding: true }))

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        onUp?.()
        break
      case 'ArrowDown':
      case 'KeyS':
        onDown?.()
        break
      case 'ArrowLeft':
      case 'KeyA':
        onLeft?.()
        break
      case 'ArrowRight':
      case 'KeyD':
        onRight?.()
        break
      case 'Enter':
      case 'Space':
      case 'KeyZ':
        onConfirm?.()
        break
      case 'Escape':
      case 'KeyX':
        onCancel?.()
        break
    }
  }, [enabled, onConfirm, onCancel, onUp, onDown, onLeft, onRight])

  const handleKeyUp = useCallback(() => {
    setState(prev => ({ ...prev, isHolding: false, lastKey: null }))
  }, [])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [enabled, handleKeyDown, handleKeyUp])

  return state
}

// Hook for menu navigation with choices
export function useMenuNavigation(itemCount: number, enabled = true) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [confirmed, setConfirmed] = useState(false)

  const handleUp = useCallback(() => {
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : itemCount - 1))
  }, [itemCount])

  const handleDown = useCallback(() => {
    setSelectedIndex(prev => (prev < itemCount - 1 ? prev + 1 : 0))
  }, [itemCount])

  const handleConfirm = useCallback(() => {
    setConfirmed(true)
  }, [])

  const reset = useCallback(() => {
    setSelectedIndex(0)
    setConfirmed(false)
  }, [])

  useGameControls({
    onUp: handleUp,
    onDown: handleDown,
    onConfirm: handleConfirm,
    enabled,
  })

  return {
    selectedIndex,
    confirmed,
    setSelectedIndex,
    reset,
  }
}

// Virtual gamepad for mobile
interface VirtualGamepadProps {
  onConfirm?: () => void
  onCancel?: () => void
  onUp?: () => void
  onDown?: () => void
  className?: string
}

export function VirtualGamepad({ onConfirm, onCancel, onUp, onDown, className }: VirtualGamepadProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* D-Pad */}
      <div className="relative w-20 h-20">
        <button
          className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 border-2 border-gray-600 flex items-center justify-center"
          onClick={onUp}
          aria-label="Up"
        >
          <span className="text-white text-xs">▲</span>
        </button>
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 border-2 border-gray-600 flex items-center justify-center"
          onClick={onDown}
          aria-label="Down"
        >
          <span className="text-white text-xs">▼</span>
        </button>
        {/* Center of D-pad */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 border-2 border-gray-600" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-400 border-4 border-red-800 text-white text-xs font-bold shadow-lg"
          onClick={onCancel}
          aria-label="Cancel (B)"
        >
          B
        </button>
        <button
          className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 active:bg-green-400 border-4 border-green-800 text-white text-xs font-bold shadow-lg"
          onClick={onConfirm}
          aria-label="Confirm (A)"
        >
          A
        </button>
      </div>
    </div>
  )
}

export default useGameControls
