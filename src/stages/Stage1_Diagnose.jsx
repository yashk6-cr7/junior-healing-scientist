/**
 * Stage1_Diagnose.jsx — Meet Arjun + Investigate Symptoms
 *
 * Spec Section 8 — Stage 1:
 * - Arjun center, breathing animation
 * - Symptom icons float around him
 * - Tap any symptom → individual animation + reveal text
 * - NO instructions shown — child explores freely
 * - After ALL 4 symptoms tapped → diagnosis card appears
 * - Diagnosis card shows today's remedy ingredients
 * - Continue → Stage 2
 *
 * Mobile-first, min 360px width.
 */
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PatientCharacter from '../components/PatientCharacter'
import { SYMPTOMS } from '../data/symptoms'
import { getRemedyByDay } from '../data/remedies'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'
import { useSound, SOUNDS } from '../hooks/useSound'

// ─── Symptom icon positions (polar coords around Arjun) ──────────────────────
// Defined as [angleRad, radiusFraction] — computed into px in render
const SYMPTOM_POSITIONS = [
  { id: 'cough',       angleDeg: 45,  label: 'Cough',       emoji: '💨', color: '#FF8A65' },
  { id: 'fever',       angleDeg: 135, label: 'Fever',       emoji: '🌡️', color: '#EF5350' },
  { id: 'weakness',    angleDeg: 225, label: 'Weakness',    emoji: '😩', color: '#AB47BC' },
  { id: 'sore_throat', angleDeg: 315, label: 'Sore Throat', emoji: '🔴', color: '#FF5252' },
]

// Per-symptom investigation text shown when tapped
const INVESTIGATE_TEXT = {
  cough:       'Arjun has a dry, scratchy cough that won\'t stop! 😷',
  fever:       'Arjun\'s temperature is 101°F — he\'s burning up! 🌡️',
  weakness:    'Arjun feels too tired to stand or play... 😩',
  sore_throat: 'Arjun\'s throat is red and swollen — it hurts to swallow! 🔴',
}

// ─── Floating symptom button ──────────────────────────────────────────────────
function SymptomIcon({ symptom, isInvestigated, onTap, orbitRadius, angle }) {
  const rad = (angle * Math.PI) / 180
  const x = Math.cos(rad) * orbitRadius
  const y = Math.sin(rad) * orbitRadius

  return (
    <motion.button
      id={`symptom-${symptom.id}`}
      onClick={onTap}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isInvestigated ? 0.85 : [1, 1.08, 1],
        opacity: isInvestigated ? 0.5 : 1,
        x,
        y,
      }}
      transition={
        isInvestigated
          ? { duration: 0.3 }
          : { scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 0.5 }, y: { duration: 0.5 } }
      }
      whileTap={{ scale: 1.4 }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 56,
        height: 56,
        marginLeft: -28,
        marginTop: -28,
        borderRadius: '50%',
        border: `2px solid ${isInvestigated ? 'transparent' : symptom.color}`,
        background: isInvestigated
          ? 'rgba(255,255,255,0.05)'
          : `radial-gradient(circle, ${symptom.color}33, ${symptom.color}11)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.6rem',
        cursor: isInvestigated ? 'default' : 'pointer',
        boxShadow: isInvestigated ? 'none' : `0 0 12px ${symptom.color}55`,
        transition: 'border 0.3s, background 0.3s',
        zIndex: 10,
        touchAction: 'manipulation',
        lineHeight: 1,
      }}
      aria-label={`Investigate ${symptom.label}`}
      disabled={isInvestigated}
    >
      <span style={{ fontSize: '1.5rem' }}>{symptom.emoji}</span>
      {/* Checkmark overlay when investigated */}
      {isInvestigated && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#00C853',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
          }}
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  )
}

// ─── Diagnosis reveal card ────────────────────────────────────────────────────
function DiagnosisCard({ remedy, onContinue }) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="glass-card"
      style={{
        padding: '24px 20px',
        width: '100%',
        maxWidth: 380,
        textAlign: 'center',
        border: `1px solid ${remedy.color}44`,
        boxShadow: `0 0 30px ${remedy.color}22`,
      }}
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ fontSize: '3rem', marginBottom: 8 }}
      >
        {remedy.icon}
      </motion.div>

      <h3 className="font-heading" style={{ color: remedy.color, fontSize: '1.3rem', marginBottom: 6 }}>
        Today's Remedy!
      </h3>
      <p style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
        {remedy.name}
      </p>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.5 }}>
        {remedy.description}
      </p>

      {/* Ingredient preview */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {remedy.ingredients.map(ing => (
          <motion.div
            key={ing.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: `${ing.color}22`,
              border: `2px solid ${ing.color}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}>
              {ing.emoji}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', maxWidth: 52, textAlign: 'center', lineHeight: 1.2 }}>
              {ing.name}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.button
        id="diagnose-continue-btn"
        className="btn-primary"
        onClick={onContinue}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{ width: '100%', fontSize: '1rem' }}
      >
        Let's Prepare It! →
      </motion.button>
    </motion.div>
  )
}

// ─── Main Stage 1 ─────────────────────────────────────────────────────────────
export default function Stage1_Diagnose() {
  const { state, dispatch } = useGameState()
  const { play } = useSound()
  const [investigated, setInvestigated] = useState(new Set())
  const [activeText, setActiveText] = useState(null) // currently shown investigate text
  const [showDiagnosis, setShowDiagnosis] = useState(false)

  const remedy = getRemedyByDay(state.currentDay)
  const allInvestigated = investigated.size >= SYMPTOM_POSITIONS.length

  // Orbit radius scales with viewport
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 500
  const orbitRadius = isMobile ? 110 : 135

  const handleSymptomTap = useCallback((symptomId) => {
    if (investigated.has(symptomId)) return
    play(SOUNDS.WHOOSH)

    const next = new Set(investigated)
    next.add(symptomId)
    setInvestigated(next)
    setActiveText(INVESTIGATE_TEXT[symptomId])

    // After all tapped, show diagnosis with a small delay
    if (next.size >= SYMPTOM_POSITIONS.length) {
      setTimeout(() => {
        setActiveText(null)
        setShowDiagnosis(true)
      }, 1400)
    } else {
      // Auto-clear investigate text after 2s
      setTimeout(() => setActiveText(null), 2000)
    }
  }, [investigated, play])

  function handleContinue() {
    play(SOUNDS.WHOOSH)
    dispatch({ type: ACTIONS.SET_STAGE, payload: 2 })
  }

  if (!remedy) return null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: '100dvh',
      padding: '72px 16px 100px',
      gap: 20,
    }}>

      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <h1 className="font-heading" style={{
          fontSize: 'clamp(1.3rem, 5vw, 1.8rem)',
          color: 'var(--color-gold)',
          marginBottom: 4,
        }}>
          Day {state.currentDay} — Meet Arjun
        </h1>
        <p className="game-text" style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>
          {allInvestigated
            ? '✅ You found all the symptoms!'
            : `Tap the glowing icons to investigate! (${investigated.size}/${SYMPTOM_POSITIONS.length})`}
        </p>
      </motion.div>

      {/* ── Character + floating symptoms ── */}
      {!showDiagnosis && (
        <div style={{
          position: 'relative',
          width: orbitRadius * 2 + 80,
          height: orbitRadius * 2 + 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {/* Orbit ring guide */}
          <div style={{
            position: 'absolute',
            width: orbitRadius * 2,
            height: orbitRadius * 2,
            borderRadius: '50%',
            border: '1px dashed rgba(255,255,255,0.07)',
            pointerEvents: 'none',
          }} />

          {/* Arjun */}
          <PatientCharacter health={state.patientHealth} size={isMobile ? 120 : 150} showLabel={false} />

          {/* Symptom icons */}
          {SYMPTOM_POSITIONS.map(sym => (
            <SymptomIcon
              key={sym.id}
              symptom={sym}
              isInvestigated={investigated.has(sym.id)}
              onTap={() => handleSymptomTap(sym.id)}
              orbitRadius={orbitRadius}
              angle={sym.angleDeg}
            />
          ))}
        </div>
      )}

      {/* ── Investigate text popup ── */}
      <AnimatePresence>
        {activeText && !showDiagnosis && (
          <motion.div
            key={activeText}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-card"
            style={{
              padding: '14px 20px',
              maxWidth: 340,
              textAlign: 'center',
              borderColor: 'rgba(255,215,0,0.3)',
            }}
          >
            <p className="game-text" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.05rem)', lineHeight: 1.5 }}>
              {activeText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Diagnosis card ── */}
      <AnimatePresence>
        {showDiagnosis && (
          <DiagnosisCard remedy={remedy} onContinue={handleContinue} />
        )}
      </AnimatePresence>

      {/* ── Patient label (when not showing diagnosis) ── */}
      {!showDiagnosis && !activeText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-heading)',
            textAlign: 'center',
          }}
        >
          {state.patientHealth === 'sick' && '😟 Arjun needs your help!'}
          {state.patientHealth === 'recovering' && '🙂 Arjun is getting better!'}
          {state.patientHealth === 'healthy' && '🎉 Arjun feels great!'}
        </motion.p>
      )}
    </div>
  )
}
