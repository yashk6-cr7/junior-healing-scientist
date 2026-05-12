/**
 * ParticleCanvas.jsx — Three.js particle canvas wrapper
 * Maps day number to the correct particle scene builder.
 * Handles React mount/unmount lifecycle cleanly.
 */
import { useRef, useEffect } from 'react'

export default function ParticleCanvas({ sceneBuilder, day = 1, style = {} }) {
  const containerRef = useRef(null)
  const cleanupRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !sceneBuilder) return

    // Small delay to ensure container has dimensions
    const timer = setTimeout(() => {
      try {
        cleanupRef.current = sceneBuilder(container)
      } catch (e) {
        console.warn('ParticleCanvas: scene creation failed:', e)
      }
    }, 50)

    return () => {
      clearTimeout(timer)
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [sceneBuilder, day])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    />
  )
}
