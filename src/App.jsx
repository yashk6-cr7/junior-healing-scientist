/**
 * App.jsx — Main app with stage routing
 * Routes between Stage 1 (Diagnose), Stage 2 (Prepare), Stage 3 (Heal).
 * Manages top-level layout with animated gradient background.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState'
import Stage1_Diagnose from './stages/Stage1_Diagnose'
import Stage2_Prepare from './stages/Stage2_Prepare'
import Stage3_Heal from './stages/Stage3_Heal'
import SoundManager from './components/SoundManager'
import ProgressBar from './components/ProgressBar'
import HealerJournal from './components/HealerJournal'

const stageComponents = {
  1: Stage1_Diagnose,
  2: Stage2_Prepare,
  3: Stage3_Heal,
}

const pageTransition = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
  transition: { duration: 0.4, ease: 'easeInOut' },
}

function App() {
  const { state } = useGameState()
  const StageComponent = stageComponents[state.currentStage] || Stage1_Diagnose

  return (
    <div className="bg-animated" style={{ minHeight: '100dvh', position: 'relative' }}>
      {/* Sound toggle */}
      <SoundManager />

      {/* Healer's Journal */}
      <HealerJournal currentDay={state.currentDay} />

      {/* Day indicator */}
      <div style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(27, 40, 56, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)',
      }}>
        <span style={{ color: 'var(--color-gold)' }}>Day {state.currentDay}</span>
        <span>/ 7</span>
      </div>

      {/* Stage content with page transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state.currentStage}-${state.currentDay}`}
          {...pageTransition}
          style={{ minHeight: '100dvh' }}
        >
          <StageComponent />
        </motion.div>
      </AnimatePresence>

      {/* Bottom progress bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(13, 27, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <ProgressBar
          progress={state.healingProgress}
          color="#00FF88"
          label="Healing Progress"
        />
      </div>
    </div>
  )
}

export default App
