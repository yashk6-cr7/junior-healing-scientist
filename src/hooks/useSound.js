/**
 * useSound.js — Hook to manage game sound effects using Howler.js
 * Will be fully implemented in Task 8.
 */
import { useCallback } from 'react'
import { useGameState } from './useGameState'

export const SOUNDS = {
  TAP: 'tap',
  SUCCESS: 'success',
  FAILURE: 'fail',
  DROP: 'drop',
  SIZZLE: 'sizzle',
  BUBBLE: 'bubble',
  SPARKLE: 'sparkle',
  HEALING: 'healing',
  BADGE: 'badge',
  WHOOSH: 'whoosh',
  BACKGROUND: 'background',
}

export function useSound() {
  const { state } = useGameState()

  const play = useCallback((soundKey) => {
    if (!state.soundEnabled) return
    // Howler.js implementation deferred to Task 8
    // Will load from /public/sounds/{soundKey}.mp3
    console.log(`[Sound] Playing: ${soundKey}`)
  }, [state.soundEnabled])

  return { play, sounds: SOUNDS }
}
