/**
 * localStorage.js — Save/load game progress
 * Never lose progress between sessions.
 */

const STORAGE_KEY = 'junior-healing-scientist-save'

export function saveGameState(state) {
  try {
    const serialized = JSON.stringify(state)
    window.localStorage.setItem(STORAGE_KEY, serialized)
  } catch (err) {
    console.warn('[Storage] Failed to save:', err)
  }
}

export function loadGameState() {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null
    return JSON.parse(serialized)
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
