/**
 * KadhaParticles.js — Day 7: Grand convergence of all remedy colors
 * All 6 previous colors converge to center, then stream upward in golden flow.
 */
import { ParticleEngine } from './ParticleEngine'
import { randomInSphere } from '../utils/particles'

export function createKadhaScene(container) {
  const engine = new ParticleEngine(container, { background: '#0D1B2A', cameraZ: 40 })
  const colors = ['#FFD700', '#00C853', '#FF6D00', '#40C4FF', '#FF8F00', '#E040FB']
  colors.forEach((color, gi) => {
    const g = engine.addParticleGroup({ name: `kadha_${gi}`, color, count: 50, size: 2.2 })
    const p = g.geometry.attributes.position.array
    const angle = (gi / 6) * Math.PI * 2
    for (let i = 0; i < 50; i++) {
      const [rx, ry, rz] = randomInSphere(4)
      p[i * 3] = Math.cos(angle) * 16 + rx
      p[i * 3 + 1] = Math.sin(angle) * 16 + ry
      p[i * 3 + 2] = rz
    }
    g.geometry.attributes.position.needsUpdate = true
  })

  engine.updateParticles = (elapsed) => {
    const convergeT = Math.min(1, elapsed / 3.0)
    const streamT = Math.max(0, Math.min(1, (elapsed - 3) / 3.0))
    engine.particleGroups.forEach((group) => {
      const pos = group.geometry.attributes.position.array
      for (let i = 0; i < group.count; i++) {
        const i3 = i * 3
        if (elapsed < 3) {
          pos[i3] += (0 - pos[i3]) * 0.015 * convergeT
          pos[i3 + 1] += (0 - pos[i3 + 1]) * 0.015 * convergeT
          pos[i3 + 2] += (0 - pos[i3 + 2]) * 0.01 * convergeT
        } else {
          pos[i3 + 1] += streamT * 0.08
          pos[i3] += Math.sin(elapsed + i) * 0.02
          if (pos[i3 + 1] > 20) pos[i3 + 1] = -5
        }
      }
      group.geometry.attributes.position.needsUpdate = true
      group.material.size = 2.2 + convergeT * 1.5
    })
    engine.camera.position.x = Math.sin(elapsed * 0.1) * 8
    engine.camera.position.y = Math.cos(elapsed * 0.08) * 4
    engine.camera.lookAt(0, 0, 0)
  }
  engine.start()
  return () => engine.destroy()
}
