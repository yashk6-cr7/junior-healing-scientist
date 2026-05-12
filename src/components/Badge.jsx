/**
 * Badge.jsx — Individual badge component
 * Shows earned badges with glow pulse, locked as grey silhouette.
 * Animation: scale 0→1.2→1.0 spring per spec Section 9.
 * Will be fully styled in Task 6.
 */
import { motion } from 'framer-motion'

export default function Badge({ badge, earned = false, showAnimation = false }) {
  if (!badge) return null

  return (
    <motion.div
      initial={showAnimation ? { scale: 0, opacity: 0 } : false}
      animate={showAnimation ? { scale: [0, 1.2, 1], opacity: 1 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 15, duration: 0.6 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '16px',
        minWidth: '90px',
      }}
    >
      <div
        className={earned ? 'animate-pulse-glow-gold' : ''}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          background: earned
            ? `radial-gradient(circle, ${badge.color}33, ${badge.color}11)`
            : 'rgba(255,255,255,0.05)',
          border: `2px solid ${earned ? badge.color : 'rgba(255,255,255,0.1)'}`,
          filter: earned ? 'none' : 'grayscale(1) opacity(0.3)',
          boxShadow: earned ? `0 0 15px ${badge.color}44` : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {badge.emoji}
      </div>
      <span style={{
        fontSize: '0.75rem',
        color: earned ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        textAlign: 'center',
        maxWidth: '80px',
        lineHeight: 1.2,
      }}>
        {badge.name}
      </span>
    </motion.div>
  )
}
