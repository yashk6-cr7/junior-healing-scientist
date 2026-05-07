/**
 * Stage1_Diagnose.jsx — Meet Arjun + Investigate Symptoms
 * 
 * Layout: Arjun character center, symptom icons floating around him.
 * Interaction: Tap symptoms to investigate (no instructions given).
 * After all tapped: Diagnosis card reveals today's remedy.
 * Transitions to Stage 2 on continue.
 * 
 * Will be fully implemented in Task 3.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PatientCharacter from '../components/PatientCharacter'
import { SYMPTOMS } from '../data/symptoms'
import { getRemedyByDay } from '../data/remedies'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'

export default function Stage1_Diagnose() {
  const { state, dispatch } = useGameState()
  const [investigatedSymptoms, setInvestigatedSymptoms] = useState([])
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const remedy = getRemedyByDay(state.currentDay)

  const allInvestigated = investigatedSymptoms.length >= SYMPTOMS.length

  function handleSymptomTap(symptomId) {
    if (investigatedSymptoms.includes(symptomId)) return
    setInvestigatedSymptoms(prev => [...prev, symptomId])
  }

  function handleContinue() {
    dispatch({ type: ACTIONS.SET_STAGE, payload: 2 })
  }

  // Placeholder — will be fully built in Task 3
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '24px',
      position: 'relative',
    }}>
      <h2 className="font-heading" style={{ color: 'var(--color-gold)', marginBottom: '24px' }}>
        Day {state.currentDay} — Meet Arjun
      </h2>

      <div style={{ position: 'relative', width: '280px', height: '280px' }}>
        <PatientCharacter health={state.patientHealth} size="large" />
        {/* Symptom icons will float around character — Task 3 */}
      </div>

      <p className="game-text" style={{ color: 'var(--color-text-secondary)', marginTop: '24px' }}>
        Tap the symptoms to investigate! ({investigatedSymptoms.length}/{SYMPTOMS.length})
      </p>

      {allInvestigated && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="btn-primary"
          onClick={handleContinue}
          style={{ marginTop: '24px' }}
        >
          Prepare {remedy?.name} →
        </motion.button>
      )}
    </div>
  )
}
