/**
 * localStorage.js — Robust save/load with versioning
 * Ensures progress is never lost between sessions.
 */

const STORAGE_KEY = 'junior-healing-scientist-save'
const STORAGE_VERSION = 1

export function saveGameState(state) {
  try {
    const payload = { _version: STORAGE_VERSION, ...state }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (err) {
    // Storage might be full or disabled (private mode)
    console.warn('[Storage] Failed to save:', err)
  }
}

export function loadGameState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)

    // Version mismatch → start fresh
    if (parsed._version !== STORAGE_VERSION) {
      console.info('[Storage] Version mismatch — resetting save.')
      clearGameState()
      return null
    }

    const { _version, ...state } = parsed
    return state
  } catch (err) {
    console.warn('[Storage] Failed to load:', err)
    return null
  }
}

export function clearGameState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[Storage] Failed to clear:', err)
  }
}

export function hasSavedGame() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

/** Debug helper — logs saved state to console */
export function debugSave() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw) {
    console.group('[Storage] Saved game state')
    console.log(JSON.parse(raw))
    console.groupEnd()
  } else {
    console.log('[Storage] No save found.')
  }
}
