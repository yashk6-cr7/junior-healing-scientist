/**
 * Stage2_Prepare.jsx — Remedy preparation stage
 *
 * Spec Section 8 — Stage 2 (main gameplay):
 * - Ingredient shelf (all ingredients + distractors shuffled)
 * - Preparation bowl in center
 * - Tap to add ingredients (mobile-friendly)
 * - Wrong ingredient → POOF failure animation
 * - Correct combo → success burst → particle world zoom
 * - Inquiry-based: NO recipe shown, child explores freely
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'
import { getRemedyByDay, getAllIngredients } from '../data/remedies'
import ParticleCanvas from '../components/ParticleCanvas'
import { createHaldiScene } from '../particles/HaldiParticles'
import { createTulsiScene } from '../particles/TulsiParticles'
import { createGingerScene } from '../particles/GingerParticles'
import { createSteamScene } from '../particles/SteamParticles'
import { createSoupScene } from '../particles/SoupParticles'
import { createSpiceScene } from '../particles/SpiceParticles'
import { createKadhaScene } from '../particles/KadhaParticles'

// Map day number to scene builder
const SCENE_MAP = {
  1: createHaldiScene,
  2: createTulsiScene,
  3: createGingerScene,
  4: createSteamScene,
  5: createSoupScene,
  6: createSpiceScene,
  7: createKadhaScene,
}

export default function Stage2_Prepare() {
  const { state, dispatch } = useGameState()
  const remedy = getRemedyByDay(state.currentDay)

  // Shuffle all ingredients once on mount
  const allItems = useMemo(() => {
    const items = getAllIngredients(state.currentDay)
    return [...items].sort(() => Math.random() - 0.5)
  }, [state.currentDay])

  const [addedIngredients, setAddedIngredients] = useState([])
  const [wrongItem, setWrongItem] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showParticleWorld, setShowParticleWorld] = useState(false)
  const [bowlBubbles, setBowlBubbles] = useState([])
  const [shakeKey, setShakeKey] = useState(0)

  // Check if an ingredient is already added
  const isAdded = useCallback((id) => addedIngredients.includes(id), [addedIngredients])

  // Check if all correct ingredients are added
  const isComplete = useMemo(() => {
    if (!remedy) return false
    return remedy.correctSet.every(id => addedIngredients.includes(id))
  }, [addedIngredients, remedy])

  // Handle ingredient tap
  function handleIngredientTap(item) {
    if (isAdded(item.id) || showSuccess || showParticleWorld) return

    const isCorrect = remedy.correctSet.includes(item.id)

    if (isCorrect) {
      // Correct ingredient
      setAddedIngredients(prev => [...prev, item.id])
      // Add bubble to bowl
      setBowlBubbles(prev => [...prev, {
        id: Date.now(),
        color: item.color,
        emoji: item.emoji,
        x: 30 + Math.random() * 40,
        y: 20 + Math.random() * 40,
      }])
    } else {
      // Wrong ingredient — POOF!
      setWrongItem(item)
      setShakeKey(prev => prev + 1)
      setTimeout(() => setWrongItem(null), 1200)
    }
  }

  // Watch for completion
  useEffect(() => {
    if (isComplete && !showSuccess) {
      setTimeout(() => setShowSuccess(true), 400)
      setTimeout(() => setShowParticleWorld(true), 2000)
    }
  }, [isComplete, showSuccess])

  // Go to Stage 3
  function handleContinueToHeal() {
    dispatch({ type: ACTIONS.SET_STAGE, payload: 3 })
  }

  if (!remedy) return null

  // Calculate bowl fill level
  const fillPercent = (addedIngredients.length / remedy.correctSet.length) * 100

  return (
    <div className="bg-animated" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100dvh',
      padding: '16px',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading"
        style={{ color: remedy.color, textAlign: 'center', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}
      >
        {remedy.icon} Prepare {remedy.name}
      </motion.h2>

      <p className="game-text" style={{
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
        fontSize: '0.9rem',
        maxWidth: '400px',
      }}>
        Tap the ingredients you think belong in this remedy!
      </p>

      {/* ─── Bowl ─── */}
      <motion.div
        key={shakeKey}
        animate={wrongItem ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative',
          width: 'clamp(180px, 50vw, 280px)',
          height: 'clamp(160px, 45vw, 240px)',
        }}
      >
        {/* Bowl SVG */}
        <svg viewBox="0 0 200 180" style={{ width: '100%', height: '100%' }}>
          {/* Bowl body */}
          <ellipse cx="100" cy="130" rx="85" ry="30" fill="#5D4037" opacity="0.3" />
          <path d="M 20 80 Q 20 160 100 160 Q 180 160 180 80 Z"
            fill="rgba(30,50,80,0.6)" stroke="#90A4AE" strokeWidth="2" />
          <path d="M 20 80 Q 20 160 100 160 Q 180 160 180 80 Z"
            fill={`rgba(${hexToRgb(remedy.color)}, ${fillPercent / 200})`}
            style={{ transition: 'fill 0.5s ease' }} />

          {/* Rim */}
          <ellipse cx="100" cy="80" rx="82" ry="18" fill="none" stroke="#B0BEC5" strokeWidth="3" />
          <ellipse cx="100" cy="80" rx="82" ry="18" fill="rgba(30,50,80,0.3)" />

          {/* Bubbles for added ingredients */}
          {bowlBubbles.map((b) => (
            <motion.g key={b.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <circle cx={b.x + 50} cy={b.y + 80} r={12} fill={b.color} opacity={0.6} />
              <text x={b.x + 50} y={b.y + 85} fontSize="14" textAnchor="middle">{b.emoji}</text>
            </motion.g>
          ))}

          {/* Fill level indicator text */}
          <text x="100" y="125" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.7">
            {addedIngredients.length} / {remedy.correctSet.length}
          </text>
        </svg>
      </motion.div>

      {/* ─── Ingredient Shelf ─── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        maxWidth: '500px',
        padding: '16px',
      }}>
        {allItems.map((item) => {
          const added = isAdded(item.id)
          const isWrong = wrongItem?.id === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => handleIngredientTap(item)}
              disabled={added}
              whileHover={!added ? { scale: 1.08 } : {}}
              whileTap={!added ? { scale: 0.92 } : {}}
              animate={isWrong ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.1, 0.3, 0] } : {}}
              transition={isWrong ? { duration: 0.6 } : { type: 'spring', stiffness: 300 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '12px 16px',
                borderRadius: '16px',
                border: `2px solid ${added ? 'var(--color-heal-green)' : isWrong ? '#FF1744' : 'rgba(255,255,255,0.15)'}`,
                background: added
                  ? 'rgba(0,200,83,0.15)'
                  : isWrong
                    ? 'rgba(255,23,68,0.2)'
                    : 'rgba(255,255,255,0.06)',
                cursor: added ? 'default' : 'pointer',
                opacity: added ? 0.5 : 1,
                minWidth: '80px',
                transition: 'background 0.3s, border 0.3s',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>{item.emoji}</span>
              <span style={{
                fontSize: '0.7rem',
                color: added ? 'var(--color-heal-green)' : 'var(--color-text-primary)',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                {item.name}
              </span>
              {added && <span style={{ fontSize: '0.6rem', color: 'var(--color-heal-green)' }}>✓ Added</span>}
            </motion.button>
          )
        })}
      </div>

      {/* ─── Wrong Ingredient POOF ─── */}
      <AnimatePresence>
        {wrongItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,23,68,0.9)',
              padding: '20px 32px',
              borderRadius: '20px',
              zIndex: 100,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>💥</p>
            <p className="font-heading" style={{ color: 'white', fontSize: '1.1rem' }}>
              Oops! {wrongItem.name} doesn't belong here!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginTop: '4px' }}>
              Try something else...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Success Burst ─── */}
      <AnimatePresence>
        {showSuccess && !showParticleWorld && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: `rgba(${hexToRgb(remedy.color)}, 0.9)`,
              padding: '32px 48px',
              borderRadius: '24px',
              zIndex: 100,
              textAlign: 'center',
              boxShadow: `0 0 60px rgba(${hexToRgb(remedy.color)}, 0.5)`,
            }}
          >
            <motion.p
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ fontSize: '3rem', marginBottom: '12px' }}
            >
              🎉✨🎊
            </motion.p>
            <h3 className="font-heading" style={{ color: 'white', fontSize: '1.5rem' }}>
              {remedy.name} Ready!
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '8px' }}>
              Watch the science happen...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Particle World Overlay ─── */}
      <AnimatePresence>
        {showParticleWorld && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 200,
              background: '#0D1B2A',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Scene title */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 210,
              textAlign: 'center',
            }}>
              <h3 className="font-heading" style={{
                color: remedy.color,
                fontSize: '1.3rem',
                textShadow: `0 0 20px ${remedy.color}`,
              }}>
                {remedy.icon} {remedy.subtitle || remedy.name}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '4px' }}>
                Watch how the ingredients work at a microscopic level!
              </p>
            </div>

            {/* Three.js Canvas */}
            <ParticleCanvas
              sceneBuilder={SCENE_MAP[state.currentDay]}
              day={state.currentDay}
              style={{ flex: 1 }}
            />

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3 }}
              onClick={handleContinueToHeal}
              className="btn-primary"
              style={{
                position: 'absolute',
                bottom: '32px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 210,
                padding: '14px 36px',
                fontSize: '1.1rem',
              }}
            >
              Continue to Healing →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper: convert hex to RGB string
function hexToRgb(hex) {
  if (!hex) return '255,255,255'
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r},${g},${b}`
}
