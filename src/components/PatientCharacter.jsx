/**
 * PatientCharacter.jsx — Arjun character component
 * Three visual states: sick, recovering, healthy (per spec Section 8).
 * - Sick: droopy eyes, pale colors, slow breathing
 * - Recovering: slightly brighter, more upright
 * - Healthy: bright colors, smiling, jumping animation
 * Will be fully implemented in Task 3.
 */
import { motion } from 'framer-motion'

const CHARACTER_STATES = {
  sick: {
    bodyColor: '#B0BEC5',
    faceEmoji: '😷',
    animation: { y: [0, 2, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
    scale: 0.95,
    label: 'Arjun is feeling sick...',
  },
  recovering: {
    bodyColor: '#FFE082',
    faceEmoji: '🤒',
    animation: { y: [0, -3, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
    scale: 1.0,
    label: 'Arjun is getting better!',
  },
  healthy: {
    bodyColor: '#81C784',
    faceEmoji: '😊',
    animation: { y: [0, -8, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
    scale: 1.05,
    label: 'Arjun feels great!',
  },
}

export default function PatientCharacter({ health = 'sick', size = 'medium' }) {
  const config = CHARACTER_STATES[health] || CHARACTER_STATES.sick
  const sizeMap = { small: 80, medium: 140, large: 200 }
  const px = sizeMap[size] || sizeMap.medium

  return (
    <motion.div
      animate={config.animation}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Character body — placeholder, will use images in Task 3 */}
      <motion.div
        animate={{ scale: config.scale }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{
          width: `${px}px`,
          height: `${px}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle at 40% 40%, ${config.bodyColor}, ${config.bodyColor}88)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${px * 0.45}px`,
          boxShadow: `0 0 30px ${config.bodyColor}33`,
          border: `3px solid ${config.bodyColor}66`,
        }}
      >
        {config.faceEmoji}
      </motion.div>
      <span style={{
        fontSize: '0.9rem',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
      }}>
        {config.label}
      </span>
    </motion.div>
  )
}
