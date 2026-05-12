/**
 * SoupParticles.js — Day 5: Multi-ingredient healing swirl
 * Purple quercetin, white allicin, orange beta-carotene swirl in a unified vortex.
 */
import { ParticleEngine } from './ParticleEngine'
import { randomInSphere } from '../utils/particles'

export function createSoupScene(container) {
  const engine = new ParticleEngine(container, { background: '#0D1B2A', cameraZ: 35 })

  // Quercetin (purple)
  engine.addParticleGroup({ name: 'quercetin', color: '#CE93D8', count: 80, size: 2.0 })
  // Allicin (white)
  engine.addParticleGroup({ name: 'allicin', color: '#FFFFFF', count: 80, size: 1.8 })
  // Beta-carotene (orange)
  engine.addParticleGroup({ name: 'carotene', color: '#FF8F00', count: 80, size: 2.0 })

  engine.updateParticles = (elapsed) => {
    engine.particleGroups.forEach((group, gi) => {
      const pos = group.geometry.attributes.position.array
      const speed = 0.3 + gi * 0.1
      for (let i = 0; i < group.count; i++) {
        const i3 = i * 3
        const angle = elapsed * speed + i * 0.08 + gi * 2.1
        const radius = 8 + Math.sin(elapsed * 0.3 + i * 0.1) * 4
        const targetX = Math.cos(angle) * radius
        const targetY = Math.sin(angle) * radius * 0.6
        const targetZ = Math.sin(elapsed * 0.2 + i * 0.15) * 5
        pos[i3] += (targetX - pos[i3]) * 0.02
        pos[i3 + 1] += (targetY - pos[i3 + 1]) * 0.02
        pos[i3 + 2] += (targetZ - pos[i3 + 2]) * 0.02
      }
      group.geometry.attributes.position.needsUpdate = true
    })

    engine.camera.position.x = Math.sin(elapsed * 0.1) * 6
    engine.camera.position.y = Math.cos(elapsed * 0.08) * 4
    engine.camera.lookAt(0, 0, 0)
  }

  engine.start()
  return () => engine.destroy()
}
