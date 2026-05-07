/**
 * useSound.js — Howler.js sound management
 * Task 8 will load real .mp3 files from /public/sounds/.
 * For now, stubs are in place so all other code can call play() safely.
 */
import { useCallback, useRef } from 'react'
import { useGameState } from './useGameState'

export const SOUNDS = {
  // Per spec Section 11
  BACKGROUND: 'background',   // ambient loop
  WHOOSH: 'whoosh',           // drag start / particle entry
  DROP: 'bubble',             // ingredient drop in bowl
  SIZZLE: 'sizzle',           // heat action
  SUCCESS: 'sparkle',         // correct combination
  FAILURE: 'fail',            // wrong combination
  BADGE: 'healing',           // badge earn
  CELEBRATE: 'success',       // day complete fanfare
}

export function useSound() {
  const { state } = useGameState()
  // howlerRef will hold Howl instances in Task 8
  const howlerRef = useRef({})

  const play = useCallback((soundKey) => {
    if (!state.soundEnabled) return
    const howl = howlerRef.current[soundKey]
    if (howl) {
      howl.play()
    } else {
      // Stub: log until Task 8 loads real files
      console.log(`[Sound] 🔊 ${soundKey}`)
    }
  }, [state.soundEnabled])

  const stop = useCallback((soundKey) => {
    const howl = howlerRef.current[soundKey]
    if (howl) howl.stop()
  }, [])

  return { play, stop, sounds: SOUNDS, soundEnabled: state.soundEnabled }
}
