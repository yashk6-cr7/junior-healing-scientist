/**
 * GameContext.jsx — Complete global state provider
 * Section 5 spec: saves ALL progress to localStorage on every state change.
 * Loads from localStorage on app start. Never loses progress between sessions.
 */
import { createContext, useReducer, useEffect } from 'react'
import { loadGameState, saveGameState } from '../utils/localStorage'

// ─── Initial State (Section 5) ───────────────────────────────────────────────
export const initialState = {
  currentStage: 1,        // 1 | 2 | 3
  currentDay: 1,          // 1–7
  healingProgress: 0,     // 0–100 (derived from completedDays)
  completedDays: [],      // [1, 2, 3 …] days finished
  earnedBadges: [],       // badge IDs earned
  patientHealth: 'sick',  // 'sick' | 'recovering' | 'healthy'
  totalAttempts: 0,       // analytics: total ingredient drop attempts
  failedAttempts: 0,      // analytics: wrong combo attempts
  sessionStartTime: null, // ISO timestamp of current session
}

// ─── Action Types ─────────────────────────────────────────────────────────────
export const ACTIONS = {
  // Navigation
  SET_STAGE: 'SET_STAGE',
  SET_DAY: 'SET_DAY',

  // Patient
  SET_PATIENT_HEALTH: 'SET_PATIENT_HEALTH',

  // Progress
  COMPLETE_DAY: 'COMPLETE_DAY',
  SET_HEALING_PROGRESS: 'SET_HEALING_PROGRESS',

  // Badges
  EARN_BADGE: 'EARN_BADGE',

  // Analytics
  INCREMENT_ATTEMPTS: 'INCREMENT_ATTEMPTS',
  INCREMENT_FAILURES: 'INCREMENT_FAILURES',

  // Settings
  TOGGLE_SOUND: 'TOGGLE_SOUND',

  // Session
  START_SESSION: 'START_SESSION',

  // Persistence
  LOAD_STATE: 'LOAD_STATE',
  RESET_GAME: 'RESET_GAME',
}

// ─── Pure Helpers ─────────────────────────────────────────────────────────────
function computePatientHealth(completedCount) {
  if (completedCount >= 7) return 'healthy'
  if (completedCount >= 3) return 'recovering'
  return 'sick'
}

function computeHealingProgress(completedDays) {
  return Math.round((completedDays.length / 7) * 100)
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    // ── Persistence ──
    case ACTIONS.LOAD_STATE:
      return { ...initialState, ...action.payload }

    case ACTIONS.RESET_GAME:
      return { ...initialState, sessionStartTime: new Date().toISOString() }

    // ── Navigation ──
    case ACTIONS.SET_STAGE:
      return { ...state, currentStage: action.payload }

    case ACTIONS.SET_DAY:
      return {
        ...state,
        currentDay: action.payload,
        currentStage: 1,   // always start a new day from Stage 1
      }

    // ── Patient ──
    case ACTIONS.SET_PATIENT_HEALTH:
      return { ...state, patientHealth: action.payload }

    // ── Progress ──
    case ACTIONS.SET_HEALING_PROGRESS:
      return { ...state, healingProgress: Math.min(100, Math.max(0, action.payload)) }

    case ACTIONS.COMPLETE_DAY: {
      const day = action.payload
      // Guard: don't double-count
      if (state.completedDays.includes(day)) return state

      const completedDays = [...state.completedDays, day]
      const healingProgress = computeHealingProgress(completedDays)
      const patientHealth = computePatientHealth(completedDays.length)

      return { ...state, completedDays, healingProgress, patientHealth }
    }

    // ── Badges ──
    case ACTIONS.EARN_BADGE: {
      const badgeId = action.payload
      if (state.earnedBadges.includes(badgeId)) return state
      return { ...state, earnedBadges: [...state.earnedBadges, badgeId] }
    }

    // ── Analytics ──
    case ACTIONS.INCREMENT_ATTEMPTS:
      return { ...state, totalAttempts: state.totalAttempts + 1 }

    case ACTIONS.INCREMENT_FAILURES:
      return { ...state, failedAttempts: state.failedAttempts + 1 }

    // ── Settings ──
    case ACTIONS.TOGGLE_SOUND:
      return { ...state, soundEnabled: !state.soundEnabled }

    // ── Session ──
    case ACTIONS.START_SESSION:
      return { ...state, sessionStartTime: new Date().toISOString() }

    default:
      console.warn('[GameContext] Unknown action:', action.type)
      return state
  }
}

// ─── Contexts ────────────────────────────────────────────────────────────────
export const GameContext = createContext(null)
export const GameDispatchContext = createContext(null)

// ─── Provider ────────────────────────────────────────────────────────────────
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    soundEnabled: true,
    sessionStartTime: new Date().toISOString(),
  })

  // ── Load saved state on mount ─────────────────────────────────────────────
  useEffect(() => {
    const saved = loadGameState()
    if (saved) {
      // Merge saved into initial to handle new fields gracefully
      dispatch({
        type: ACTIONS.LOAD_STATE,
        payload: { ...initialState, ...saved, sessionStartTime: new Date().toISOString() },
      })
    }
  }, [])

  // ── Persist on every state change ────────────────────────────────────────
  useEffect(() => {
    saveGameState(state)
  }, [state])

  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  )
}
