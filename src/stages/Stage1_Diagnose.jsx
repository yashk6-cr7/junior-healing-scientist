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
import { MYSTERY_HINTS } from '../data/hints'
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

// ─── Mystery Remedy Card — inquiry-based, no giveaways ───────────────────────
function MysteryRemedyCard({ day, onContinue }) {
  const hint = MYSTERY_HINTS[day]
  if (!hint) return null

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 520, gap: '14px' }}
    >
      {/* ── Header: pulsing mystery icon ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          style={{
            width: 88, height: 88, borderRadius: '50%',
            background: `radial-gradient(circle, ${hint.iconBg}44, ${hint.iconBg}11)`,
            border: `3px solid ${hint.iconBg}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.6rem',
            boxShadow: `0 0 40px ${hint.iconBg}44, 0 0 80px ${hint.iconBg}22`,
          }}>
          🔍
        </motion.div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Feeling {hint.mood}
        </p>
      </div>

      {/* ── Keyword mood pills (clue without answer) ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {hint.tags.map((tag, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.12, type: 'spring' }}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              background: `${hint.iconBg}18`, border: `1px solid ${hint.iconBg}44`,
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '0.82rem', color: 'var(--color-text-primary)',
            }}>
            <span style={{ fontSize: '1rem' }}>{tag.emoji}</span>
            <span style={{ fontWeight: 600 }}>{tag.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Riddle box ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{
          width: '100%', padding: '18px 22px', borderRadius: '16px',
          background: 'rgba(255,215,0,0.06)',
          border: '1px solid rgba(255,215,0,0.25)',
        }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,215,0,0.6)', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          🔮 Today's Riddle — Can you guess the remedy?
        </p>
        <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic' }}>
          "{hint.riddle}"
        </p>
      </motion.div>

      {/* ── Hint: science fact shown AFTER treatment, not here ── */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontStyle: 'italic' }}>
        🔬 Discover the science fact after you prepare and give the remedy!
      </motion.p>

      {/* ── Continue to lab ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
        style={{ width: '100%', maxWidth: 360 }}>
        <button className="btn-primary" onClick={onContinue}
          style={{ width: '100%', fontSize: '1rem' }}>
          Go to the Lab & Find Out! →
        </button>
      </motion.div>
    </motion.div>
  )
}


// Healing progress per symptom based on day (which symptoms improve each day)
const SYMPTOM_HEALING = {
  1: [],  // Day 1: all symptoms active
  2: ['sore_throat'],  // Day 2: sore throat improving
  3: ['sore_throat', 'cough'],  // Day 3: cough also improving
  4: ['sore_throat', 'cough', 'fever'],  // Day 4: fever breaking
  5: ['sore_throat', 'cough', 'fever'],  // Day 5: continuing
  6: ['sore_throat', 'cough', 'fever', 'weakness'],  // Day 6: weakness fading
  7: ['sore_throat', 'cough', 'fever', 'weakness'],  // Day 7: ALL cured
}

const SYMPTOM_STATUS_TEXT = {
  improving: '🟡 Improving',
  treated: '✅ Treated',
  active: '🔴 Active',
  cured: '🎉 Cured!',
}

function getSymptomStatus(symptomId, day) {
  if (day >= 7) return 'cured'
  const healed = SYMPTOM_HEALING[day] || []
  if (healed.includes(symptomId)) return day >= 6 ? 'treated' : 'improving'
  return 'active'
}

// ─── Daily Check-up (Days 2-7) ────────────────────────────────────────────────
function DailyCheckup({ day, onContinue }) {
  const isDay7 = day >= 7
  const healedCount = SYMPTOM_POSITIONS.filter(s => getSymptomStatus(s.id, day) !== 'active').length
  // Map day to health state for Arjun
  const health = day >= 7 ? 'healthy' : day >= 4 ? 'recovering' : 'sick'
  const ringColor = isDay7 ? '#00C853' : '#FFD700'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 480, gap: '16px',
      }}>
      {/* Arjun with healing progress ring */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* SVG ring behind Arjun */}
        <svg width="180" height="180" style={{ position: 'absolute' }}>
          {/* Background ring */}
          <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          {/* Progress ring */}
          <motion.circle
            cx="90" cy="90" r="80"
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - healedCount / 4) }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px', filter: `drop-shadow(0 0 8px ${ringColor})` }}
          />
        </svg>
        {/* Arjun character in centre */}
        <div style={{ zIndex: 1 }}>
          <PatientCharacter health={health} size={120} showLabel={false} />
        </div>
        {/* Day 7 crown overlay */}
        {isDay7 && (
          <motion.div
            initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{
              position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
              fontSize: '1.6rem', zIndex: 2,
            }}>
            👑
          </motion.div>
        )}
      </div>
      {/* Status label */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ fontSize: '0.9rem', color: ringColor, fontWeight: 700, textAlign: 'center' }}>
        {isDay7 ? '🎉 Arjun is completely healed!' : health === 'recovering' ? '🙂 Arjun is getting much better!' : '😷 Arjun still needs your help!'}
      </motion.p>

      {/* Symptom tracker */}
      <div style={{ width: '100%' }}>
        {SYMPTOM_POSITIONS.map((sym, i) => {
          const status = getSymptomStatus(sym.id, day)
          const statusColor = status === 'cured' ? '#00C853' : status === 'treated' ? '#00C853' : status === 'improving' ? '#FFD700' : '#EF5350'
          return (
            <motion.div key={sym.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', marginBottom: '8px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${statusColor}33`,
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `${sym.color}22`, border: `2px solid ${sym.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', flexShrink: 0,
              }}>
                {sym.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{sym.label}</p>
                <p style={{ color: statusColor, fontSize: '0.75rem', fontWeight: 600 }}>
                  {SYMPTOM_STATUS_TEXT[status]}
                </p>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: status === 'active' ? 'rgba(239,83,80,0.15)' : 'rgba(0,200,83,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem',
              }}>
                {status === 'active' ? '⏳' : '✓'}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Day 7 special message */}
      {isDay7 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.6 }}
          style={{ textAlign: 'center', padding: '12px' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🎊✨🏆</p>
          <p className="font-heading" style={{ color: '#00C853', fontSize: '1.1rem' }}>
            All symptoms cured! Final remedy time!
          </p>
        </motion.div>
      )}

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="btn-primary" onClick={onContinue}
        style={{ width: '100%', maxWidth: 350, fontSize: '1rem', marginTop: '4px' }}>
        {isDay7 ? 'Final Remedy! 👑' : 'Continue to Remedy →'}
      </motion.button>
    </motion.div>
  )
}

// ─── Main Stage 1 ─────────────────────────────────────────────────────────────
export default function Stage1_Diagnose() {
  const { state, dispatch } = useGameState()
  const { play } = useSound()
  const [investigated, setInvestigated] = useState(new Set())
  const [activeText, setActiveText] = useState(null)
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [showCheckup, setShowCheckup] = useState(true) // always show symptom list first

  const remedy = getRemedyByDay(state.currentDay)
  const allInvestigated = investigated.size >= SYMPTOM_POSITIONS.length
  const isDay1 = state.currentDay === 1

  const handleSymptomTap = useCallback((symptomId) => {
    if (investigated.has(symptomId)) return
    play(SOUNDS.WHOOSH)
    const next = new Set(investigated)
    next.add(symptomId)
    setInvestigated(next)
    setActiveText(INVESTIGATE_TEXT[symptomId])
    if (next.size >= SYMPTOM_POSITIONS.length) {
      setTimeout(() => { setActiveText(null); setShowDiagnosis(true) }, 1400)
    } else {
      setTimeout(() => setActiveText(null), 2000)
    }
  }, [investigated, play])

  function handleContinue() {
    play(SOUNDS.WHOOSH)
    if (showCheckup && !showDiagnosis) {
      // Checkup done → show Mystery Remedy
      setShowCheckup(false)
      setShowDiagnosis(true)
    } else {
      dispatch({ type: ACTIONS.SET_STAGE, payload: 2 })
    }
  }

  if (!remedy) return null

  // Determine title
  let title, subtitle
  if (showDiagnosis) {
    title = '🧩 Mystery Remedy'
    subtitle = 'Read the riddle — then head to the lab to discover the answer!'
  } else if (showCheckup) {
    title = isDay1
      ? `Day 1 — Arjun's Symptoms`
      : `Day ${state.currentDay} — Check-up`
    subtitle = isDay1
      ? "Arjun is sick! Look at his symptoms below."
      : "Let's see how Arjun is doing today!"
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', minHeight: '100dvh',
      padding: '72px 16px 100px', gap: 20,
    }}>
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} style={{ textAlign: 'center' }}>
        <h1 className="font-heading" style={{
          fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', color: 'var(--color-gold)', marginBottom: 4,
        }}>
          {title}
        </h1>
        <p className="game-text" style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>
          {subtitle}
        </p>
      </motion.div>

      {/* Symptom list — shown for all days */}
      {showCheckup && (
        <DailyCheckup day={state.currentDay} onContinue={handleContinue} />
      )}

      {/* Mystery Remedy card */}
      <AnimatePresence>
        {showDiagnosis && !showCheckup && (
          <MysteryRemedyCard day={state.currentDay} onContinue={handleContinue} />
        )}
      </AnimatePresence>
    </div>
  )
}
