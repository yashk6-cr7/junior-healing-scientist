/**
 * Stage2_Prepare.jsx — Remedy preparation with drag-and-drop
 * 
 * MAIN gameplay stage — inquiry-based learning.
 * Layout adapts for desktop (3 panels) vs mobile (stacked).
 * Child explores freely — NO correct order shown.
 * Wrong combos → fun failure animations.
 * Correct combo → success burst → particle world zoom.
 * 
 * Will be fully implemented in Task 4.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'
import { getRemedyByDay, getAllIngredients } from '../data/remedies'

export default function Stage2_Prepare() {
  const { state, dispatch } = useGameState()
  const remedy = getRemedyByDay(state.currentDay)
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [showParticleWorld, setShowParticleWorld] = useState(false)

  function handleContinue() {
    dispatch({ type: ACTIONS.SET_STAGE, payload: 3 })
  }

  // Placeholder — will be fully built in Task 4
  return (
    <div className="bg-animated" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '24px',
    }}>
      <h2 className="font-heading" style={{ color: remedy?.color || 'var(--color-gold)', marginBottom: '16px' }}>
        {remedy?.icon} Prepare {remedy?.name}
      </h2>
      <p className="game-text" style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        Drag ingredients into the bowl to create the remedy!
      </p>

      {/* Ingredient shelf + Bowl + Particle view — Task 4 */}
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '500px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
      }}>
        🥣
      </div>

      <p style={{ color: 'var(--color-text-secondary)', marginTop: '16px', fontSize: '0.9rem' }}>
        Selected: {selectedIngredients.length} / {remedy?.correctSet?.length || 0}
      </p>

      {/* Placeholder continue button — real logic in Task 4 */}
      <button className="btn-primary" onClick={handleContinue} style={{ marginTop: '24px' }}>
        Continue to Healing →
      </button>
    </div>
  )
}
