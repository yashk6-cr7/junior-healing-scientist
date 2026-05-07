/**
 * GameContext.jsx — Global state provider
 * Manages all game state per Section 5 spec.
 * Save ALL progress to localStorage so nothing is lost.
 */
import { createContext, useReducer, useEffect } from 'react'
import { loadGameState, saveGameState } from '../utils/localStorage'

// Initial game state — matches Section 5 spec exactly
const initialState = {
  currentStage: 1,          // 1, 2, or 3
  currentDay: 1,            // 1-7
  healingProgress: 0,       // 0-100
  completedDays: [],        // [1, 2, 3...]
  earnedBadges: [],         // badge IDs earned
  patientHealth: 'sick',    // sick / recovering / healthy
  totalAttempts: 0,         // for analytics
  failedAttempts: 0,        // for analytics
  sessionStartTime: null,   // timestamp
  soundEnabled: true,       // audio toggle
}

// Action types
export const ACTIONS = {
  SET_STAGE: 'SET_STAGE',
  SET_DAY: 'SET_DAY',
  UPDATE_HEALING: 'UPDATE_HEALING',
  SET_PATIENT_HEALTH: 'SET_PATIENT_HEALTH',
  COMPLETE_DAY: 'COMPLETE_DAY',
  EARN_BADGE: 'EARN_BADGE',
  INCREMENT_ATTEMPTS: 'INCREMENT_ATTEMPTS',
  INCREMENT_FAILURES: 'INCREMENT_FAILURES',
  TOGGLE_SOUND: 'TOGGLE_SOUND',
  RESET_GAME: 'RESET_GAME',
  LOAD_STATE: 'LOAD_STATE',
}

// Reducer — will be fully fleshed out in Task 2
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_STATE:
      return { ...state, ...action.payload }

    case ACTIONS.SET_STAGE:
      return { ...state, currentStage: action.payload }

    case ACTIONS.SET_DAY:
      return { ...state, currentDay: action.payload, currentStage: 1 }

    case ACTIONS.UPDATE_HEALING:
      return { ...state, healingProgress: Math.min(100, action.payload) }

    case ACTIONS.SET_PATIENT_HEALTH:
      return { ...state, patientHealth: action.payload }

    case ACTIONS.COMPLETE_DAY: {
      const day = action.payload
      if (state.completedDays.includes(day)) return state
      const completedDays = [...state.completedDays, day]
      const progress = Math.round((completedDays.length / 7) * 100)
      let health = state.patientHealth
      if (completedDays.length >= 7) health = 'healthy'
      else if (completedDays.length >= 3) health = 'recovering'
      return {
        ...state,
        completedDays,
        healingProgress: progress,
        patientHealth: health,
      }
    }

    case ACTIONS.EARN_BADGE: {
      const badgeId = action.payload
      if (state.earnedBadges.includes(badgeId)) return state
      return { ...state, earnedBadges: [...state.earnedBadges, badgeId] }
    }

    case ACTIONS.INCREMENT_ATTEMPTS:
      return { ...state, totalAttempts: state.totalAttempts + 1 }

    case ACTIONS.INCREMENT_FAILURES:
      return { ...state, failedAttempts: state.failedAttempts + 1 }

    case ACTIONS.TOGGLE_SOUND:
      return { ...state, soundEnabled: !state.soundEnabled }

    case ACTIONS.RESET_GAME:
      return { ...initialState, sessionStartTime: new Date().toISOString() }

    default:
      return state
  }
}

// Context objects
export const GameContext = createContext(null)
export const GameDispatchContext = createContext(null)

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    sessionStartTime: new Date().toISOString(),
  })

  // Load saved state on mount
  useEffect(() => {
    const saved = loadGameState()
    if (saved) {
      dispatch({ type: ACTIONS.LOAD_STATE, payload: saved })
    }
  }, [])

  // Save state on every change
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
