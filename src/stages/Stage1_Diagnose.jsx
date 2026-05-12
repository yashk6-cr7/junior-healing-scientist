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

// ─── Mystery Remedy Card ─────────────────────────────────────────────────────
function MysteryRemedyCard({ day, onContinue }) {
  const hint = MYSTERY_HINTS[day]
  if (!hint) return null

  return (
    <motion.div
      initial={{ y: 60, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 500, gap: '16px',
      }}
    >
      {/* Big icon in glowing circle */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `${hint.iconBg}33`,
          border: `3px solid ${hint.iconBg}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem',
          boxShadow: `0 0 30px ${hint.iconBg}33`,
        }}>
        {hint.icon}
      </motion.div>

      {/* Keyword tags */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {hint.tags.map((tag, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            style={{
              padding: '8px 16px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.85rem', color: 'var(--color-text-primary)',
            }}>
            <span>{tag.emoji}</span>
            <span style={{ fontWeight: 600 }}>{tag.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Riddle */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="glass-card"
        style={{
          padding: '20px 24px', width: '100%', textAlign: 'center',
          border: '1px solid rgba(255,215,0,0.2)',
        }}>
        <p style={{
          color: 'var(--color-text-secondary)', fontSize: '0.95rem',
          fontStyle: 'italic', lineHeight: 1.6,
        }}>
          {hint.riddle}
        </p>
      </motion.div>

      {/* Visual clue cards */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {hint.clues.map((clue, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.2 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            }}>
            <div style={{
              width: 40, height: 40, borderRadius: '8px',
              background: clue.color, border: '2px solid rgba(255,255,255,0.15)',
            }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              {clue.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Continue button */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="btn-primary" onClick={onContinue}
        style={{ width: '100%', maxWidth: 350, fontSize: '1rem', marginTop: '8px' }}>
        Let's Prepare It! →
      </motion.button>
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

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 480, gap: '16px',
      }}>
      {/* Arjun with health ring */}
      <div style={{ position: 'relative' }}>
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `conic-gradient(${isDay7 ? '#00C853' : '#FFD700'} ${(healedCount / 4) * 360}deg, rgba(255,255,255,0.08) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px',
          }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: 'var(--color-bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
          }}>
            {isDay7 ? '🎉' : day <= 3 ? '🤒' : '😊'}
          </div>
        </motion.div>
      </div>

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
  const [showCheckup, setShowCheckup] = useState(state.currentDay > 1)

  const remedy = getRemedyByDay(state.currentDay)
  const allInvestigated = investigated.size >= SYMPTOM_POSITIONS.length
  const isDay1 = state.currentDay === 1

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 500
  const orbitRadius = isMobile ? 110 : 135

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
    subtitle = 'Can you figure out what Arjun needs today?'
  } else if (showCheckup) {
    title = `Day ${state.currentDay} — Check-up`
    subtitle = "Let's see how Arjun is doing today!"
  } else {
    title = `Day ${state.currentDay} — Meet Arjun`
    subtitle = allInvestigated
      ? '✅ You found all the symptoms!'
      : `Tap the glowing icons to investigate! (${investigated.size}/${SYMPTOM_POSITIONS.length})`
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

      {/* ── Day 2-7: Daily Checkup ── */}
      {showCheckup && (
        <DailyCheckup day={state.currentDay} onContinue={handleContinue} />
      )}

      {/* ── Day 1: Character + floating symptoms ── */}
      {isDay1 && !showDiagnosis && !showCheckup && (
        <div style={{
          position: 'relative',
          width: orbitRadius * 2 + 80, height: orbitRadius * 2 + 80,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', width: orbitRadius * 2, height: orbitRadius * 2,
            borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.07)', pointerEvents: 'none',
          }} />
          <PatientCharacter health={state.patientHealth} size={isMobile ? 120 : 150} showLabel={false} />
          {SYMPTOM_POSITIONS.map(sym => (
            <SymptomIcon key={sym.id} symptom={sym}
              isInvestigated={investigated.has(sym.id)}
              onTap={() => handleSymptomTap(sym.id)}
              orbitRadius={orbitRadius} angle={sym.angleDeg} />
          ))}
        </div>
      )}

      {/* Investigate text popup (Day 1 only) */}
      <AnimatePresence>
        {activeText && !showDiagnosis && (
          <motion.div key={activeText}
            initial={{ scale: 0.8, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-card"
            style={{ padding: '14px 20px', maxWidth: 340, textAlign: 'center', borderColor: 'rgba(255,215,0,0.3)' }}>
            <p className="game-text" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.05rem)', lineHeight: 1.5 }}>
              {activeText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mystery Remedy card */}
      <AnimatePresence>
        {showDiagnosis && !showCheckup && (
          <MysteryRemedyCard day={state.currentDay} onContinue={handleContinue} />
        )}
      </AnimatePresence>

      {/* Patient label (Day 1 only, when idle) */}
      {isDay1 && !showDiagnosis && !activeText && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>
          {state.patientHealth === 'sick' && '😟 Arjun needs your help!'}
          {state.patientHealth === 'recovering' && '🙂 Arjun is getting better!'}
          {state.patientHealth === 'healthy' && '🎉 Arjun feels great!'}
        </motion.p>
      )}
    </div>
  )
}
