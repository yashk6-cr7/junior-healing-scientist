/**
 * SoundManager.js — Howler.js audio engine
 * 
 * All game sounds managed through a single interface.
 * Supports muting, volume control, and looping.
 */
import { Howl, Howler } from 'howler'

// Sound definitions — will be replaced with real audio files
// For now using generated tones via Web Audio API as fallback
const SOUND_DEFS = {
  ingredient_tap:     { src: [], fallbackFreq: 440,  fallbackDur: 0.08 },
  correct_ingredient: { src: [], fallbackFreq: 523,  fallbackDur: 0.3  },
  wrong_ingredient:   { src: [], fallbackFreq: 220,  fallbackDur: 0.3  },
  pour_liquid:        { src: [], fallbackFreq: 330,  fallbackDur: 0.5  },
  stir_sound:         { src: [], fallbackFreq: 280,  fallbackDur: 0.4  },
  bubble_sound:       { src: [], fallbackFreq: 600,  fallbackDur: 0.1  },
  steam_sound:        { src: [], fallbackFreq: 180,  fallbackDur: 0.6  },
  perfect_temp:       { src: [], fallbackFreq: 660,  fallbackDur: 0.5  },
  bacteria_pop:       { src: [], fallbackFreq: 500,  fallbackDur: 0.12 },
  badge_earn:         { src: [], fallbackFreq: 784,  fallbackDur: 0.8  },
  whoosh:             { src: [], fallbackFreq: 300,  fallbackDur: 0.2  },
  celebrate:          { src: [], fallbackFreq: 880,  fallbackDur: 1.0  },
}

let audioCtx = null
let muted = false

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

// Synthesize a simple tone as fallback when no audio files exist
function playTone(freq, duration, type = 'sine') {
  if (muted) return
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (e) {
    // Audio not available
  }
}

export const SoundManager = {
  play(soundId) {
    if (muted) return
    const def = SOUND_DEFS[soundId]
    if (!def) return

    // If we have real audio files, use Howler
    if (def.src && def.src.length > 0) {
      const howl = new Howl({ src: def.src, volume: 0.7 })
      howl.play()
      return
    }

    // Fallback: synthesized tone
    playTone(def.fallbackFreq, def.fallbackDur)
  },

  playChime() {
    // Ascending 3-note chime
    playTone(523, 0.15)
    setTimeout(() => playTone(659, 0.15), 100)
    setTimeout(() => playTone(784, 0.2), 200)
  },

  playWobble() {
    // Descending wobble
    playTone(440, 0.1)
    setTimeout(() => playTone(330, 0.1), 80)
    setTimeout(() => playTone(220, 0.15), 160)
  },

  playTriumphant() {
    // 5-note celebration
    const notes = [523, 659, 784, 880, 1047]
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 120))
  },

  setMuted(val) {
    muted = val
    Howler.mute(val)
  },

  isMuted() {
    return muted
  },

  toggleMute() {
    muted = !muted
    Howler.mute(muted)
    return muted
  },
}
