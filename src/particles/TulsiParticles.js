/**
 * TulsiParticles.js — Day 2: Eugenol spiral release into water
 * Green particles release from leaf clusters, spiral outward into blue water.
 */
import { ParticleEngine } from './ParticleEngine'
import { randomInSphere } from '../utils/particles'

export function createTulsiScene(container) {
  const engine = new ParticleEngine(container, { background: '#0D1B2A', cameraZ: 35 })

  // Water particles
  engine.addParticleGroup({ name: 'water', color: '#40C4FF', count: 150, size: 1.2 })

  // Eugenol (tulsi) particles — start in 3 leaf clusters
  const tulsi = engine.addParticleGroup({ name: 'tulsi', color: '#00C853', count: 120, size: 2.2 })
  const pos = tulsi.geometry.attributes.position.array
  const clusterCenters = [[-6, 4, 0], [6, 4, 0], [0, -5, 0]]

  for (let i = 0; i < 120; i++) {
    const cluster = clusterCenters[i % 3]
    const [rx, ry, rz] = randomInSphere(2)
    pos[i * 3] = cluster[0] + rx
    pos[i * 3 + 1] = cluster[1] + ry
    pos[i * 3 + 2] = cluster[2] + rz
  }
  tulsi.geometry.attributes.position.needsUpdate = true

  engine.updateParticles = (elapsed) => {
    const releaseT = Math.min(1, elapsed / 4.0)

    const p = tulsi.geometry.attributes.position.array
    for (let i = 0; i < 120; i++) {
      const i3 = i * 3
      const angle = elapsed * 0.5 + i * 0.15
      const radius = releaseT * (8 + i * 0.08)
      p[i3] += (Math.cos(angle) * radius * 0.003 - p[i3] * 0.001)
      p[i3 + 1] += (Math.sin(angle) * radius * 0.003 - p[i3 + 1] * 0.001)
      p[i3 + 2] += Math.sin(elapsed + i) * 0.005
    }
    tulsi.geometry.attributes.position.needsUpdate = true

    tulsi.material.opacity = 0.6 + releaseT * 0.4

    // Water drift
    const waterGroup = engine.particleGroups[0]
    const wp = waterGroup.geometry.attributes.position.array
    for (let i = 0; i < 150; i++) {
      wp[i * 3] += Math.sin(elapsed * 0.3 + i) * 0.008
      wp[i * 3 + 1] += Math.cos(elapsed * 0.25 + i * 0.5) * 0.008
    }
    waterGroup.geometry.attributes.position.needsUpdate = true

    engine.camera.position.x = Math.sin(elapsed * 0.1) * 4
    engine.camera.lookAt(0, 0, 0)
  }

  engine.start()
  return () => engine.destroy()
}
