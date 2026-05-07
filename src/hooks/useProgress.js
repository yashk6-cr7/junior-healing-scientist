/**
 * useProgress.js — Derived progress values
 */
import { useGameState } from './useGameState'

export function useProgress() {
  const { state } = useGameState()

  const totalDays = 7
  const completedCount = state.completedDays.length
  const isGameComplete = completedCount >= totalDays

  // Progress for today's stage (0-3)
  const stageProgress = state.currentStage - 1

  return {
    totalDays,
    completedCount,
    healingProgress: state.healingProgress, // 0-100
    isGameComplete,
    currentDay: state.currentDay,
    currentStage: state.currentStage,
    stageProgress,
    patientHealth: state.patientHealth,
    completedDays: state.completedDays,
    isDayComplete: (day) => state.completedDays.includes(day),
  }
}
