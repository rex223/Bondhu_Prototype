"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import { getChiptuneEngine, SceneMood } from '@/lib/audio/chiptune-engine'

interface UseChiptuneOptions {
  autoStartBGM?: boolean
  initialMood?: SceneMood
  masterVolume?: number
  bgmVolume?: number
  sfxVolume?: number
}

export function useChiptune(options: UseChiptuneOptions = {}) {
  const {
    autoStartBGM = false,
    initialMood = 'calm',
    masterVolume = 0.3,
    bgmVolume = 0.15,
    sfxVolume = 0.4,
  } = options

  const engineRef = useRef(getChiptuneEngine())
  const [isMuted, setIsMuted] = useState(false)
  const [currentMood, setCurrentMood] = useState<SceneMood>(initialMood)
  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize volumes
  useEffect(() => {
    const engine = engineRef.current
    engine.setMasterVolume(masterVolume)
    engine.setBGMVolume(bgmVolume)
    engine.setSFXVolume(sfxVolume)
  }, [masterVolume, bgmVolume, sfxVolume])

  // Auto-start BGM if enabled
  useEffect(() => {
    if (autoStartBGM) {
      engineRef.current.startBGM(initialMood)
      setIsPlaying(true)
    }
    
    return () => {
      engineRef.current.stopBGM()
    }
  }, [autoStartBGM, initialMood])

  // SFX Methods
  const playClick = useCallback(() => {
    engineRef.current.playClick()
  }, [])

  const playSelect = useCallback(() => {
    engineRef.current.playSelect()
  }, [])

  const playConfirm = useCallback(() => {
    engineRef.current.playConfirm()
  }, [])

  const playCancel = useCallback(() => {
    engineRef.current.playCancel()
  }, [])

  const playType = useCallback(() => {
    engineRef.current.playType()
  }, [])

  const playDialogueAdvance = useCallback(() => {
    engineRef.current.playDialogueAdvance()
  }, [])

  const playTraitUp = useCallback(() => {
    engineRef.current.playTraitUp()
  }, [])

  const playTraitDown = useCallback(() => {
    engineRef.current.playTraitDown()
  }, [])

  const playLevelUp = useCallback(() => {
    engineRef.current.playLevelUp()
  }, [])

  const playFanfare = useCallback(() => {
    engineRef.current.playFanfare()
  }, [])

  const playError = useCallback(() => {
    engineRef.current.playError()
  }, [])

  const playCoin = useCallback(() => {
    engineRef.current.playCoin()
  }, [])

  const playHit = useCallback(() => {
    engineRef.current.playHit()
  }, [])

  const playFootstep = useCallback(() => {
    engineRef.current.playFootstep()
  }, [])

  const playDoor = useCallback(() => {
    engineRef.current.playDoor()
  }, [])

  const playMagic = useCallback(() => {
    engineRef.current.playMagic()
  }, [])

  // BGM Methods
  const startBGM = useCallback((mood: SceneMood = 'calm') => {
    engineRef.current.startBGM(mood)
    setCurrentMood(mood)
    setIsPlaying(true)
  }, [])

  const stopBGM = useCallback(() => {
    engineRef.current.stopBGM()
    setIsPlaying(false)
  }, [])

  const changeMood = useCallback((mood: SceneMood) => {
    engineRef.current.changeMood(mood)
    setCurrentMood(mood)
  }, [])

  // Volume Methods
  const setMasterVolume = useCallback((volume: number) => {
    engineRef.current.setMasterVolume(volume)
  }, [])

  const setBGMVolume = useCallback((volume: number) => {
    engineRef.current.setBGMVolume(volume)
  }, [])

  const setSFXVolume = useCallback((volume: number) => {
    engineRef.current.setSFXVolume(volume)
  }, [])

  const toggleMute = useCallback(() => {
    if (isMuted) {
      engineRef.current.unmute()
      setIsMuted(false)
    } else {
      engineRef.current.mute()
      setIsMuted(true)
    }
  }, [isMuted])

  return {
    // SFX
    playClick,
    playSelect,
    playConfirm,
    playCancel,
    playType,
    playDialogueAdvance,
    playTraitUp,
    playTraitDown,
    playLevelUp,
    playFanfare,
    playError,
    playCoin,
    playHit,
    playFootstep,
    playDoor,
    playMagic,
    
    // BGM
    startBGM,
    stopBGM,
    changeMood,
    currentMood,
    isPlaying,
    
    // Volume
    setMasterVolume,
    setBGMVolume,
    setSFXVolume,
    toggleMute,
    isMuted,
  }
}

// Map scene types to moods
export function getSceneMood(scene: string): SceneMood {
  const moodMap: Record<string, SceneMood> = {
    forest: 'mysterious',
    village: 'happy',
    cave: 'intense',
    castle: 'triumphant',
    road: 'calm',
    room: 'calm',
    night: 'mysterious',
  }
  return moodMap[scene] || 'calm'
}
