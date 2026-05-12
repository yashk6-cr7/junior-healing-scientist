/**
 * SoundManager.jsx — Audio control component using Howler.js
 * Provides sound toggle button and manages background music.
 * Will be fully implemented in Task 8.
 */
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'

export default function SoundManager() {
  const { state, dispatch } = useGameState()

  return (
    <button
      onClick={() => dispatch({ type: ACTIONS.TOGGLE_SOUND })}
      className="btn-secondary"
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 50,
        width: '44px',
        height: '44px',
        padding: 0,
        borderRadius: '50%',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={state.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {state.soundEnabled ? '🔊' : '🔇'}
    </button>
  )
}
