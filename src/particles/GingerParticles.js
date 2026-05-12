/**
 * GingerParticles.js — Day 3: Gingerol + honey destroy bacteria
 * Orange gingerol + gold honey particles seek red bacteria, encircle and dissolve them.
 */
import { ParticleEngine } from './ParticleEngine'
import { randomInSphere } from '../utils/particles'

export function createGingerScene(container) {
  const engine = new ParticleEngine(container, { background: '#0D1B2A', cameraZ: 35 })

  // Bacteria (red targets)
  const bacteria = engine.addParticleGroup({ name: 'bacteria', color: '#FF1744', count: 30, size: 3.5 })
  const bp = bacteria.geometry.attributes.position.array
  for (let i = 0; i < 30; i++) {
    const [x, y, z] = randomInSphere(12)
    bp[i * 3] = x; bp[i * 3 + 1] = y; bp[i * 3 + 2] = z
  }
  bacteria.geometry.attributes.position.needsUpdate = true

  // Gingerol (orange)
  const gingerol = engine.addParticleGroup({ name: 'gingerol', color: '#FF6D00', count: 100, size: 2.0 })

  // Honey (gold)
  const honey = engine.addParticleGroup({ name: 'honey', color: '#FFA000', count: 80, size: 1.8 })

  engine.updateParticles = (elapsed) => {
    const attackT = Math.min(1, elapsed / 3.0)

    // Gingerol homes toward bacteria
    const gp = gingerol.geometry.attributes.position.array
    for (let i = 0; i < 100; i++) {
      const target = i % 30
      const tx = bp[target * 3], ty = bp[target * 3 + 1], tz = bp[target * 3 + 2]
      const i3 = i * 3
      gp[i3] += (tx - gp[i3]) * 0.008 * attackT + Math.sin(elapsed + i) * 0.02
      gp[i3 + 1] += (ty - gp[i3 + 1]) * 0.008 * attackT + Math.cos(elapsed + i) * 0.02
      gp[i3 + 2] += (tz - gp[i3 + 2]) * 0.005 * attackT
    }
    gingerol.geometry.attributes.position.needsUpdate = true

    // Honey also approaches bacteria
    const hp = honey.geometry.attributes.position.array
    for (let i = 0; i < 80; i++) {
      const target = i % 30
      const tx = bp[target * 3], ty = bp[target * 3 + 1]
      const i3 = i * 3
      hp[i3] += (tx - hp[i3]) * 0.005 * attackT
      hp[i3 + 1] += (ty - hp[i3 + 1]) * 0.005 * attackT
    }
    honey.geometry.attributes.position.needsUpdate = true

    // Bacteria fade after 3s
    bacteria.material.opacity = Math.max(0, 1 - (elapsed - 3) / 2)
    bacteria.material.size = Math.max(0.5, 3.5 * (1 - attackT * 0.7))

    engine.camera.position.x = Math.sin(elapsed * 0.12) * 5
    engine.camera.position.y = Math.cos(elapsed * 0.1) * 3
    engine.camera.lookAt(0, 0, 0)
  }

  engine.start()
  return () => engine.destroy()
}
