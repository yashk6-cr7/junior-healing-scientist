/**
 * UIOverlay.jsx — React UI chrome rendered on top of PixiJS canvas
 * 
 * Handles: mute button, day indicator, stage-specific React overlays.
 * pointer-events: none on container, auto on interactive children.
 */
import { useGame, ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'

export default function UIOverlay() {
  const { state, dispatch } = useGame()

  const handleMute = () => {
    const muted = SoundManager.toggleMute()
    dispatch({ type: ACTIONS.TOGGLE_SOUND })
  }

  return (
    <div id="ui-overlay">
      {/* Mute button */}
      <button
        className="mute-btn"
        onClick={handleMute}
        aria-label={state.soundEnabled ? 'Mute sound' : 'Unmute sound'}
      >
        {state.soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Day indicator (top-left) */}
      {state.currentStage !== 'home' && (
        <div style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 20,
          background: 'rgba(26, 10, 46, 0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(245, 200, 66, 0.2)',
        }}>
          <span style={{
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 14,
            color: '#f5c842',
          }}>
            Day {state.currentDay}
          </span>
          <span style={{
            fontFamily: 'Nunito',
            fontWeight: 600,
            fontSize: 12,
            color: 'rgba(255,251,240,0.5)',
          }}>
            ⚡ {state.arjunHealth}%
          </span>
        </div>
      )}
    </div>
  )
}
