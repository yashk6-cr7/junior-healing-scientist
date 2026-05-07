/**
 * ProgressBar.jsx — Healing progress bar component
 * Shows overall healing progress (0-100%) across all 7 days.
 * Animated fill with glow effect per spec.
 * Will be fully styled in Task 6.
 */
import { motion } from 'framer-motion'

export default function ProgressBar({ progress = 0, color = '#00FF88', label = 'Healing Progress' }) {
  return (
    <div className="progress-bar-container" style={{
      width: '100%',
      padding: '8px 16px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px',
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)',
      }}>
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div style={{
        width: '100%',
        height: '12px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 'var(--radius-full)',
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      </div>
    </div>
  )
}
