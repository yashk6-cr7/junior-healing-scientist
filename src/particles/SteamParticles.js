/**
 * SteamParticles.js — Day 4: Steam rising and sweeping mucus away
 * White-blue steam rises upward; grey mucus particles are swept up and fade out.
 */
import { ParticleEngine } from './ParticleEngine'

export function createSteamScene(container) {
  const engine = new ParticleEngine(container, { background: '#0D1B2A', cameraZ: 35 })

  // Steam (white-blue)
  const steam = engine.addParticleGroup({ name: 'steam', color: '#B3E5FC', count: 200, size: 2.5 })
  const sp = steam.geometry.attributes.position.array
  for (let i = 0; i < 200; i++) {
    sp[i * 3] = (Math.random() - 0.5) * 20
    sp[i * 3 + 1] = -15 + Math.random() * 5
    sp[i * 3 + 2] = (Math.random() - 0.5) * 10
  }
  steam.geometry.attributes.position.needsUpdate = true

  // Mucus (grey — gets swept away)
  const mucus = engine.addParticleGroup({ name: 'mucus', color: '#78909C', count: 60, size: 3.0 })

  engine.updateParticles = (elapsed) => {
    // Steam rises upward in wavy columns
    const sPos = steam.geometry.attributes.position.array
    for (let i = 0; i < 200; i++) {
      const i3 = i * 3
      sPos[i3 + 1] += 0.06 + Math.sin(i) * 0.01 // rise
      sPos[i3] += Math.sin(elapsed * 0.5 + i * 0.3) * 0.03 // wave
      // Reset to bottom when reaching top
      if (sPos[i3 + 1] > 18) {
        sPos[i3 + 1] = -15
        sPos[i3] = (Math.random() - 0.5) * 20
      }
    }
    steam.geometry.attributes.position.needsUpdate = true

    // Mucus gets swept upward and fades
    const sweepT = Math.min(1, elapsed / 4.0)
    const mPos = mucus.geometry.attributes.position.array
    for (let i = 0; i < 60; i++) {
      mPos[i * 3 + 1] += sweepT * 0.04
      mPos[i * 3] += Math.sin(elapsed + i) * 0.01
    }
    mucus.geometry.attributes.position.needsUpdate = true
    mucus.material.opacity = Math.max(0, 1 - sweepT * 1.2)

    engine.camera.position.y = Math.sin(elapsed * 0.08) * 3
    engine.camera.lookAt(0, 0, 0)
  }

  engine.start()
  return () => engine.destroy()
}
