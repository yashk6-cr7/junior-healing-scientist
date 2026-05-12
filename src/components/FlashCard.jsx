/**
 * FlashCard.jsx — Science fact card component
 * Appears AFTER success (inquiry-based: explanation after discovery).
 * Auto-disappears after 5 seconds per spec.
 * Will be fully implemented in Task 5.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function FlashCard({ data, visible = false, onDismiss }) {
  const [show, setShow] = useState(visible)

  useEffect(() => {
    setShow(visible)
    if (visible) {
      const timer = setTimeout(() => {
        setShow(false)
        onDismiss?.()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [visible, onDismiss])

  if (!data) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="glass-card"
          style={{
            position: 'fixed',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '24px',
            maxWidth: '360px',
            width: '90%',
            zIndex: 100,
            textAlign: 'center',
            border: `2px solid ${data.color}44`,
          }}
          onClick={() => { setShow(false); onDismiss?.() }}
        >
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: data.color }}>
            {data.title}
          </h3>
          <p className="game-text" style={{ marginBottom: '8px', lineHeight: 1.5 }}>
            {data.fact}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            {data.science}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
