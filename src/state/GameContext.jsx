/**
 * GameContext.jsx — React context + localStorage persistence
 * 
 * State shape (from spec):
 * {
 *   currentDay: 1,             // 1-7
 *   currentStage: 'home',      // home | symptoms | discovery | preparation | dosage | microscope | steam | healing
 *   arjunHealth: 10,           // 10-100, increases per day
 *   completedDays: [],         // array of completed day numbers
 *   badges: [],                // earned badge IDs
 *   remediesDiscovered: {},    // map of day -> ingredients found
 *   soundEnabled: true,
 * }
 */
import { createContext, useContext, useReducer, useEffect } from 'react'

const STORAGE_KEY = 'healingScientist'

const initialState = {
  currentDay: 1,
  currentStage: 'home',
  arjunHealth: 10,
  completedDays: [],
  badges: [],
  remediesDiscovered: {},
  soundEnabled: true,
}

// ── Actions ──
export const ACTIONS = {
  SET_STAGE:       'SET_STAGE',
  SET_DAY:         'SET_DAY',
  COMPLETE_DAY:    'COMPLETE_DAY',
  EARN_BADGE:      'EARN_BADGE',
  DISCOVER_REMEDY: 'DISCOVER_REMEDY',
  SET_HEALTH:      'SET_HEALTH',
  TOGGLE_SOUND:    'TOGGLE_SOUND',
  RESET_GAME:      'RESET_GAME',
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_STAGE:
      return { ...state, currentStage: action.payload }

    case ACTIONS.SET_DAY:
      return { ...state, currentDay: action.payload, currentStage: 'symptoms' }

    case ACTIONS.COMPLETE_DAY: {
      const day = action.payload
      const newCompleted = state.completedDays.includes(day)
        ? state.completedDays
        : [...state.completedDays, day]
      // Health increases ~13 per day (10 → 100 over 7 days)
      const newHealth = Math.min(100, 10 + newCompleted.length * 13)
      return {
        ...state,
        completedDays: newCompleted,
        arjunHealth: newHealth,
      }
    }

    case ACTIONS.EARN_BADGE: {
      const badgeId = action.payload
      if (state.badges.includes(badgeId)) return state
      return { ...state, badges: [...state.badges, badgeId] }
    }

    case ACTIONS.DISCOVER_REMEDY:
      return {
        ...state,
        remediesDiscovered: {
          ...state.remediesDiscovered,
          [action.payload.day]: action.payload.ingredients,
        },
      }

    case ACTIONS.SET_HEALTH:
      return { ...state, arjunHealth: Math.min(100, Math.max(10, action.payload)) }

    case ACTIONS.TOGGLE_SOUND:
      return { ...state, soundEnabled: !state.soundEnabled }

    case ACTIONS.RESET_GAME:
      return { ...initialState }

    default:
      return state
  }
}

// ── Load from localStorage ──
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...initialState, ...parsed }
    }
  } catch (e) {
    console.warn('Failed to load saved state:', e)
  }
  return initialState
}

// ── Context ──
const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save state:', e)
    }
  }, [state])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
