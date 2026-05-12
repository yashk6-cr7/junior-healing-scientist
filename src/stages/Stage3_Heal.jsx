/**
 * Stage3_Heal.jsx — Healing animation + Badge celebration
 * 
 * Shows healing particles flowing into Arjun.
 * Arjun visually transforms. Progress bar fills.
 * Badge earned with explosive animation.
 * "Day X Complete!" celebration.
 * After Day 7: full recovery + master badge.
 * 
 * Will be fully implemented in Task 6.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PatientCharacter from '../components/PatientCharacter'
import ProgressBar from '../components/ProgressBar'
import Badge from '../components/Badge'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'
import { getBadgeForDay } from '../data/badges'
import { getRemedyByDay } from '../data/remedies'

export default function Stage3_Heal() {
  const { state, dispatch } = useGameState()
  const [showBadge, setShowBadge] = useState(false)
  const [healingDone, setHealingDone] = useState(false)
  const remedy = getRemedyByDay(state.currentDay)
  const badge = getBadgeForDay(state.currentDay)

  useEffect(() => {
    // Simulate healing animation timing
    const timer1 = setTimeout(() => setHealingDone(true), 2000)
    const timer2 = setTimeout(() => {
      dispatch({ type: ACTIONS.COMPLETE_DAY, payload: state.currentDay })
      if (badge) dispatch({ type: ACTIONS.EARN_BADGE, payload: badge.id })
      setShowBadge(true)
    }, 2500)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [])

  function handleNextDay() {
    if (state.currentDay >= 7) {
      dispatch({ type: ACTIONS.EARN_BADGE, payload: 'junior_healing_scientist' })
      // Show final celebration — Task 6
      return
    }
    dispatch({ type: ACTIONS.SET_DAY, payload: state.currentDay + 1 })
  }

  // Placeholder — will be fully built in Task 6
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '24px',
      gap: '24px',
    }}>
      <h2 className="font-heading" style={{ color: 'var(--color-heal-green)' }}>
        ✨ Healing in Progress...
      </h2>

      <PatientCharacter health={state.patientHealth} size="large" />

      <ProgressBar
        progress={state.healingProgress}
        color="var(--color-heal-green)"
      />

      <AnimatePresence>
        {showBadge && badge && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center' }}
          >
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', fontSize: '1.5rem' }}>
              🎉 Day {state.currentDay} Complete!
            </h3>
            <Badge badge={badge} earned={true} showAnimation={true} />
            <button
              className="btn-primary"
              onClick={handleNextDay}
              style={{ marginTop: '24px' }}
            >
              {state.currentDay >= 7 ? '🏆 See Final Results' : 'Next Day →'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
