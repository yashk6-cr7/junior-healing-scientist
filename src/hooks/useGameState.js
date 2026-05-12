/**
 * useGameState.js — Primary hook for game state and dispatch
 */
import { useContext } from 'react'
import { GameContext, GameDispatchContext } from '../context/GameContext'

export function useGameState() {
  const state = useContext(GameContext)
  const dispatch = useContext(GameDispatchContext)

  if (state === null) {
    throw new Error('useGameState must be used inside a <GameProvider>.')
  }

  return { state, dispatch }
}
