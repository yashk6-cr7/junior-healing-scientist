/**
 * ParticleCanvas.jsx — Three.js particle canvas wrapper
 * Mounts a Three.js scene into a React component.
 * Handles canvas resize and cleanup.
 * Will be fully connected to ParticleEngine in Task 5.
 */
import { useRef, useEffect } from 'react'

export default function ParticleCanvas({ sceneBuilder, day = 1, style = {} }) {
  const containerRef = useRef(null)
  const cleanupRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // sceneBuilder will be a function that creates and starts the Three.js scene
    // It returns a cleanup function
    if (sceneBuilder) {
      cleanupRef.current = sceneBuilder(container, day)
    }

    return () => {
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
