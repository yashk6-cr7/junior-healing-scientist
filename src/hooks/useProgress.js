/**
 * useProgress.js — Hook to compute derived progress values
 */
import { useGameState } from './useGameState'

export function useProgress() {
  const { state } = useGameState()

  const totalDays = 7
  const completedCount = state.completedDays.length
  const progressPercent = state.healingProgress
  const isGameComplete = completedCount >= totalDays

  return {
    totalDays,
    completedCount,
    progressPercent,
    isGameComplete,
    currentDay: state.currentDay,
    currentStage: state.currentStage,
    patientHealth: state.patientHealth,
  }
}
