/**
 * Stage3_Heal.jsx — Healing animation + Badge celebration
 *
 * Spec Section 8 — Stage 3:
 * - Healing particles flow INTO Arjun from the sides
 * - Arjun transforms visually (color, posture, expression)
 * - Progress bar fills to new percentage
 * - Badge earned with explosive animation
 * - "Day X Complete!" celebration
 * - After Day 7: full recovery + master badge
 */
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PatientCharacter from '../components/PatientCharacter'
import ProgressBar from '../components/ProgressBar'
import FlashCard from '../components/FlashCard'
import Badge from '../components/Badge'
import BadgeCollection from '../components/BadgeCollection'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'
import { getBadgeForDay, BADGES } from '../data/badges'
import { getRemedyByDay } from '../data/remedies'
import { FLASHCARDS } from '../data/flashcards'
import { MYSTERY_HINTS } from '../data/hints'

export default function Stage3_Heal() {
  const { state, dispatch } = useGameState()
  const [phase, setPhase] = useState('healing') // healing → badge → flashcard → done
  const [showConfetti, setShowConfetti] = useState(false)
  const [showGameComplete, setShowGameComplete] = useState(false)
  const remedy = getRemedyByDay(state.currentDay)
  const badge = getBadgeForDay(state.currentDay)
  const flashcard = FLASHCARDS[`day${state.currentDay}`]
  const hint = MYSTERY_HINTS[state.currentDay]

  // Determine Arjun's health state based on progress
  const healthState = useMemo(() => {
    const progress = state.healingProgress || 0
    if (progress >= 85) return 'healthy'
    if (progress >= 40) return 'recovering'
    return 'sick'
  }, [state.healingProgress])

  // Healing sequence
  useEffect(() => {
    const timers = []

    // Phase 1: Healing animation (2s)
    timers.push(setTimeout(() => {
      dispatch({ type: ACTIONS.COMPLETE_DAY, payload: state.currentDay })
      if (badge) dispatch({ type: ACTIONS.EARN_BADGE, payload: badge.id })
    }, 2000))

    // Phase 2: Show badge (2.5s)
    timers.push(setTimeout(() => {
      setPhase('badge')
      setShowConfetti(true)
    }, 2500))

    // Phase 3: Show flashcard (4s)
    timers.push(setTimeout(() => {
      setPhase('flashcard')
    }, 5000))

    // Phase 4: Done (7s)
    timers.push(setTimeout(() => {
      setPhase('done')
      setShowConfetti(false)
    }, 8000))

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  function handleNextDay() {
    if (state.currentDay >= 7) {
      dispatch({ type: ACTIONS.EARN_BADGE, payload: 'junior_healing_scientist' })
      setShowGameComplete(true)
      return
    }
    dispatch({ type: ACTIONS.SET_DAY, payload: state.currentDay + 1 })
  }

  function handleRestart() {
    dispatch({ type: ACTIONS.RESET_GAME })
  }

  if (!remedy) return null

  // ─── Game Complete Screen ────────────────────────────────────────────
  if (showGameComplete) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '24px',
        gap: '24px',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 8 }}
        >
          <h1 className="font-heading" style={{ color: 'var(--color-gold)', fontSize: '2rem' }}>
            🏆 Congratulations! 🏆
          </h1>
          <p className="game-text" style={{ color: 'var(--color-text-primary)', marginTop: '8px' }}>
            You are now a Junior Healing Scientist!
          </p>
        </motion.div>

        <PatientCharacter health="healthy" size={200} showLabel={true} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <h3 className="font-heading" style={{ color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            Your Badges
          </h3>
          <BadgeCollection earnedBadges={state.earnedBadges} />
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="btn-primary"
          onClick={handleRestart}
          style={{ marginTop: '16px' }}
        >
          🔄 Play Again
        </motion.button>
      </div>
    )
  }

  // ─── Main Healing Screen ─────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '24px',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  y: window.innerHeight + 20,
                  rotate: Math.random() * 720 - 360,
                  opacity: 0,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 1.5,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  background: ['#FFD700', '#FF1744', '#00C853', '#40C4FF', '#E040FB', '#FF6D00'][i % 6],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Healing particles flowing toward Arjun */}
      {phase === 'healing' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: i % 2 === 0 ? -60 : window.innerWidth + 60,
                y: 150 + Math.random() * 200,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                x: window.innerWidth / 2 - 10,
                y: window.innerHeight / 2 - 60,
                opacity: [0, 1, 0.8, 0],
                scale: [0.5, 1.2, 0.3],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: remedy.color,
                boxShadow: `0 0 12px ${remedy.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <motion.h2
        animate={phase === 'healing' ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
        transition={phase === 'healing' ? { duration: 1.5, repeat: Infinity } : {}}
        className="font-heading"
        style={{ color: remedy.color, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', textAlign: 'center', zIndex: 20 }}
      >
        {phase === 'healing' ? `✨ ${remedy.name} is healing Arjun...` :
         phase === 'badge' ? '🎉 Day Complete!' :
         phase === 'flashcard' ? '🔬 Science Fact!' :
         `✅ Day ${state.currentDay} Complete!`}
      </motion.h2>

      {/* Arjun */}
      <motion.div
        animate={phase === 'healing' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 1, repeat: phase === 'healing' ? Infinity : 0 }}
        style={{ zIndex: 20 }}
      >
        <PatientCharacter
          health={phase === 'healing' ? healthState : (state.healingProgress > 80 ? 'healthy' : 'recovering')}
          size={180}
          showLabel={phase !== 'healing'}
        />
      </motion.div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '400px', zIndex: 20 }}>
        <ProgressBar
          progress={state.healingProgress}
          color={remedy.color}
        />
      </div>

      {/* Badge reveal */}
      <AnimatePresence>
        {(phase === 'badge' || phase === 'done') && badge && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 8, stiffness: 100 }}
            style={{ textAlign: 'center', zIndex: 20 }}
          >
            <Badge badge={badge} earned={true} showAnimation={true} />
            <p className="font-heading" style={{ color: 'var(--color-gold)', fontSize: '1rem', marginTop: '8px' }}>
              {badge.name} Earned!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Science flashcard */}
      <AnimatePresence>
        {phase === 'flashcard' && flashcard && (
          <FlashCard
            title={flashcard.title}
            fact={flashcard.fact}
            science={flashcard.science}
            onDismiss={() => setPhase('done')}
          />
        )}
      </AnimatePresence>

      {/* Science Fact — shown after treatment in 'done' phase */}
      <AnimatePresence>
        {phase === 'done' && hint && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 18 }}
            style={{
              width: '100%', maxWidth: '420px', padding: '18px 20px',
              borderRadius: '16px', zIndex: 20,
              background: 'rgba(0,200,83,0.08)',
              border: '1px solid rgba(0,200,83,0.35)',
              boxShadow: '0 0 30px rgba(0,200,83,0.1)',
            }}
          >
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00C853', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              🔬 Science Fact Unlocked!
            </p>
            <p style={{ color: 'var(--color-text-primary)', fontSize: '0.88rem', lineHeight: 1.65 }}>
              {hint.scienceFact}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="btn-primary"
            onClick={handleNextDay}
            style={{ padding: '14px 36px', fontSize: '1.1rem', zIndex: 20 }}
          >
            {state.currentDay >= 7 ? '🏆 See Final Results' : `Next Day → Day ${state.currentDay + 1}`}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
