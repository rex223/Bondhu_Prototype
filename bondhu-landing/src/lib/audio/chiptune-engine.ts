"use client"

// ============================================
// 8-BIT CHIPTUNE SOUND ENGINE
// Generates all sounds dynamically - no files needed
// ============================================

type WaveType = 'square' | 'triangle' | 'sawtooth' | 'sine'
type SceneMood = 'calm' | 'mysterious' | 'intense' | 'happy' | 'sad' | 'triumphant'

interface Note {
  frequency: number
  duration: number
  type?: WaveType
  volume?: number
}

// Musical note frequencies (A4 = 440Hz standard)
const NOTES: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50,
}

// Chord progressions for different moods
const CHORD_PROGRESSIONS: Record<SceneMood, string[][]> = {
  calm: [['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']],
  mysterious: [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['E3', 'G3', 'B3'], ['A3', 'C4', 'E4']],
  intense: [['E3', 'G3', 'B3'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['E3', 'G3', 'B3']],
  happy: [['C4', 'E4', 'G4'], ['G4', 'B4', 'D5'], ['A4', 'C5', 'E5'], ['F4', 'A4', 'C5']],
  sad: [['A3', 'C4', 'E4'], ['D4', 'F4', 'A4'], ['E4', 'G4', 'B4'], ['A3', 'C4', 'E4']],
  triumphant: [['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['E4', 'G4', 'B4'], ['C5', 'E5', 'G5']],
}

// Bass patterns for different moods
const BASS_PATTERNS: Record<SceneMood, string[]> = {
  calm: ['C3', 'G3', 'F3', 'G3'],
  mysterious: ['A3', 'E3', 'F3', 'E3'],
  intense: ['E3', 'E3', 'F3', 'G3'],
  happy: ['C3', 'G3', 'A3', 'F3'],
  sad: ['A3', 'D3', 'E3', 'A3'],
  triumphant: ['C3', 'D3', 'E3', 'C4'],
}

class ChiptuneEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private isPlaying = false
  private currentMood: SceneMood = 'calm'
  private bgmInterval: NodeJS.Timeout | null = null
  private currentChordIndex = 0
  private bassOscillator: OscillatorNode | null = null
  private arpeggioTimeout: NodeJS.Timeout | null = null
  
  // Volume settings
  private masterVolume = 0.3
  private bgmVolume = 0.15
  private sfxVolume = 0.4

  constructor() {
    if (typeof window !== 'undefined') {
      // Lazy init on first interaction
    }
  }

  private initAudio() {
    if (this.audioContext) return

    this.audioContext = new AudioContext()
    
    // Master gain
    this.masterGain = this.audioContext.createGain()
    this.masterGain.gain.value = this.masterVolume
    this.masterGain.connect(this.audioContext.destination)

    // BGM gain
    this.bgmGain = this.audioContext.createGain()
    this.bgmGain.gain.value = this.bgmVolume
    this.bgmGain.connect(this.masterGain)

    // SFX gain
    this.sfxGain = this.audioContext.createGain()
    this.sfxGain.gain.value = this.sfxVolume
    this.sfxGain.connect(this.masterGain)
  }

  private ensureContext() {
    this.initAudio()
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  // ============================================
  // SOUND EFFECT GENERATORS
  // ============================================

  // Basic beep/click
  playClick() {
    this.playTone({ frequency: 800, duration: 0.05, type: 'square', volume: 0.3 })
  }

  // Menu selection
  playSelect() {
    this.playTone({ frequency: 600, duration: 0.08, type: 'square', volume: 0.25 })
    setTimeout(() => {
      this.playTone({ frequency: 900, duration: 0.08, type: 'square', volume: 0.25 })
    }, 50)
  }

  // Confirm action
  playConfirm() {
    const notes = [523, 659, 784] // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.1, type: 'square', volume: 0.3 })
      }, i * 60)
    })
  }

  // Cancel/back
  playCancel() {
    this.playTone({ frequency: 400, duration: 0.15, type: 'square', volume: 0.25 })
  }

  // Text typing sound (very short)
  playType() {
    this.playTone({ frequency: 1200 + Math.random() * 200, duration: 0.02, type: 'square', volume: 0.1 })
  }

  // Dialogue advance
  playDialogueAdvance() {
    this.playTone({ frequency: 500, duration: 0.05, type: 'triangle', volume: 0.2 })
  }

  // Personality trait increased
  playTraitUp() {
    const notes = [440, 554, 659, 880] // A4, C#5, E5, A5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.12, type: 'triangle', volume: 0.25 })
      }, i * 80)
    })
  }

  // Personality trait decreased
  playTraitDown() {
    const notes = [440, 349, 294, 220] // A4, F4, D4, A3
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.12, type: 'triangle', volume: 0.25 })
      }, i * 80)
    })
  }

  // Level up / milestone
  playLevelUp() {
    const melody = [
      { freq: 523, dur: 0.1 },  // C5
      { freq: 587, dur: 0.1 },  // D5
      { freq: 659, dur: 0.1 },  // E5
      { freq: 784, dur: 0.1 },  // G5
      { freq: 1047, dur: 0.3 }, // C6
    ]
    let time = 0
    melody.forEach(({ freq, dur }) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: dur, type: 'square', volume: 0.35 })
      }, time)
      time += dur * 800
    })
  }

  // Chapter complete fanfare
  playFanfare() {
    const fanfare = [
      { notes: [523, 659], delay: 0 },    // C5, E5
      { notes: [587, 698], delay: 150 },  // D5, F5
      { notes: [659, 784], delay: 300 },  // E5, G5
      { notes: [784, 988], delay: 450 },  // G5, B5
      { notes: [1047], delay: 700 },       // C6
    ]
    fanfare.forEach(({ notes, delay }) => {
      setTimeout(() => {
        notes.forEach(freq => {
          this.playTone({ frequency: freq, duration: 0.25, type: 'square', volume: 0.3 })
        })
      }, delay)
    })
  }

  // Error/wrong sound
  playError() {
    this.playTone({ frequency: 200, duration: 0.2, type: 'square', volume: 0.3 })
    setTimeout(() => {
      this.playTone({ frequency: 150, duration: 0.3, type: 'square', volume: 0.3 })
    }, 150)
  }

  // Coin/pickup sound
  playCoin() {
    this.playTone({ frequency: 988, duration: 0.05, type: 'square', volume: 0.25 })
    setTimeout(() => {
      this.playTone({ frequency: 1319, duration: 0.15, type: 'square', volume: 0.25 })
    }, 50)
  }

  // Damage/hit sound
  playHit() {
    this.playNoise(0.1, 0.4)
    this.playTone({ frequency: 150, duration: 0.1, type: 'square', volume: 0.3 })
  }

  // Footstep
  playFootstep() {
    this.playNoise(0.03, 0.15)
  }

  // Door open
  playDoor() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone({ frequency: 100 + i * 50, duration: 0.05, type: 'square', volume: 0.2 })
      }, i * 30)
    }
  }

  // Magic/spell sound
  playMagic() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const freq = 400 + Math.random() * 800
        this.playTone({ frequency: freq, duration: 0.05, type: 'sine', volume: 0.2 })
      }, i * 30)
    }
  }

  // ============================================
  // CORE TONE GENERATOR
  // ============================================

  private playTone(note: Note) {
    this.ensureContext()
    if (!this.audioContext || !this.sfxGain) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = note.type || 'square'
    osc.frequency.value = note.frequency

    // NES-style envelope (quick attack, sustain, quick release)
    const now = this.audioContext.currentTime
    const vol = note.volume || 0.3
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(vol, now + 0.005) // 5ms attack
    gain.gain.setValueAtTime(vol, now + note.duration - 0.01)
    gain.gain.linearRampToValueAtTime(0, now + note.duration) // 10ms release

    osc.connect(gain)
    gain.connect(this.sfxGain)

    osc.start(now)
    osc.stop(now + note.duration + 0.01)
  }

  // White noise generator (for drums/hits)
  private playNoise(duration: number, volume: number) {
    this.ensureContext()
    if (!this.audioContext || !this.sfxGain) return

    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    const gain = this.audioContext.createGain()

    noise.buffer = buffer
    
    const now = this.audioContext.currentTime
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    noise.connect(gain)
    gain.connect(this.sfxGain)

    noise.start(now)
    noise.stop(now + duration)
  }

  // ============================================
  // BACKGROUND MUSIC SYSTEM
  // ============================================

  startBGM(mood: SceneMood = 'calm') {
    this.ensureContext()
    if (!this.audioContext || !this.bgmGain) return

    this.stopBGM()
    this.currentMood = mood
    this.isPlaying = true
    this.currentChordIndex = 0

    // Start the music loop
    this.playBGMLoop()
  }

  private playBGMLoop() {
    if (!this.isPlaying || !this.audioContext || !this.bgmGain) return

    const chords = CHORD_PROGRESSIONS[this.currentMood]
    const bassNotes = BASS_PATTERNS[this.currentMood]
    const chord = chords[this.currentChordIndex]
    const bassNote = bassNotes[this.currentChordIndex]

    // Play bass note (triangle wave for that NES bass sound)
    this.playBGMNote(NOTES[bassNote], 'triangle', 0.8, 0.2)

    // Play arpeggio of the chord
    this.playArpeggio(chord)

    // Move to next chord
    this.currentChordIndex = (this.currentChordIndex + 1) % chords.length

    // Schedule next iteration (tempo varies by mood)
    const tempo = this.getTempoForMood(this.currentMood)
    this.bgmInterval = setTimeout(() => this.playBGMLoop(), tempo)
  }

  private playArpeggio(chord: string[]) {
    if (!this.isPlaying) return

    const tempo = this.getTempoForMood(this.currentMood)
    const noteLength = tempo / (chord.length * 2)

    chord.forEach((note, i) => {
      this.arpeggioTimeout = setTimeout(() => {
        if (this.isPlaying) {
          this.playBGMNote(NOTES[note], 'square', noteLength / 1000, 0.12)
        }
      }, i * noteLength)
    })

    // Play descending for more movement
    if (this.currentMood === 'intense' || this.currentMood === 'happy') {
      [...chord].reverse().forEach((note, i) => {
        setTimeout(() => {
          if (this.isPlaying) {
            this.playBGMNote(NOTES[note], 'square', noteLength / 1000, 0.1)
          }
        }, (chord.length + i) * noteLength)
      })
    }
  }

  private playBGMNote(frequency: number, type: WaveType, duration: number, volume: number) {
    if (!this.audioContext || !this.bgmGain) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = type
    osc.frequency.value = frequency

    const now = this.audioContext.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + 0.01)
    gain.gain.setValueAtTime(volume, now + duration * 0.7)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(this.bgmGain)

    osc.start(now)
    osc.stop(now + duration + 0.01)
  }

  private getTempoForMood(mood: SceneMood): number {
    const tempos: Record<SceneMood, number> = {
      calm: 1200,      // Slow, peaceful
      mysterious: 1000, // Medium, suspenseful
      intense: 600,    // Fast, action
      happy: 800,      // Upbeat
      sad: 1400,       // Very slow
      triumphant: 700, // Energetic
    }
    return tempos[mood]
  }

  stopBGM() {
    this.isPlaying = false
    if (this.bgmInterval) {
      clearTimeout(this.bgmInterval)
      this.bgmInterval = null
    }
    if (this.arpeggioTimeout) {
      clearTimeout(this.arpeggioTimeout)
      this.arpeggioTimeout = null
    }
  }

  // Crossfade to new mood
  changeMood(newMood: SceneMood) {
    if (this.currentMood === newMood) return
    
    // Fade out current, start new
    if (this.bgmGain && this.audioContext) {
      const now = this.audioContext.currentTime
      this.bgmGain.gain.linearRampToValueAtTime(0, now + 0.5)
      
      setTimeout(() => {
        this.currentMood = newMood
        if (this.bgmGain) {
          this.bgmGain.gain.value = this.bgmVolume
        }
      }, 500)
    }
  }

  // ============================================
  // VOLUME CONTROLS
  // ============================================

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume
    }
  }

  setBGMVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume))
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.bgmVolume
    }
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume
    }
  }

  mute() {
    this.setMasterVolume(0)
  }

  unmute() {
    this.setMasterVolume(0.3)
  }

  // ============================================
  // CLEANUP
  // ============================================

  dispose() {
    this.stopBGM()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

// Singleton instance
let engineInstance: ChiptuneEngine | null = null

export function getChiptuneEngine(): ChiptuneEngine {
  if (!engineInstance) {
    engineInstance = new ChiptuneEngine()
  }
  return engineInstance
}

export type { SceneMood }
export { ChiptuneEngine }
