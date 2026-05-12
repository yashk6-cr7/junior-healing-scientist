/**
 * SpiceParticles.js — Day 6: Piperine amplifies curcumin
 */
import { ParticleEngine } from './ParticleEngine'
import { randomInSphere } from '../utils/particles'

export function createSpiceScene(container) {
  const engine = new ParticleEngine(container, { background: '#0D1B2A', cameraZ: 35 })
  const curcumin = engine.addParticleGroup({ name: 'curcumin', color: '#FFD700', count: 80, size: 2.0 })
  const cp = curcumin.geometry.attributes.position.array
  for (let i = 0; i < 80; i++) {
    const [x, y, z] = randomInSphere(10)
    cp[i * 3] = x; cp[i * 3 + 1] = y; cp[i * 3 + 2] = z
  }
  curcumin.geometry.attributes.position.needsUpdate = true

  const piperine = engine.addParticleGroup({ name: 'piperine', color: '#424242', count: 60, size: 1.5 })
  const pp = piperine.geometry.attributes.position.array
  for (let i = 0; i < 60; i++) {
    const [x, y, z] = randomInSphere(18)
    pp[i * 3] = x; pp[i * 3 + 1] = y; pp[i * 3 + 2] = z
  }
  piperine.geometry.attributes.position.needsUpdate = true

  engine.updateParticles = (elapsed) => {
    const t = Math.min(1, elapsed / 4.0)
    for (let i = 0; i < 60; i++) {
      const tgt = i % 80, i3 = i * 3
      pp[i3] += (cp[tgt * 3] - pp[i3]) * 0.008 * t
      pp[i3 + 1] += (cp[tgt * 3 + 1] - pp[i3 + 1]) * 0.008 * t
      pp[i3 + 2] += (cp[tgt * 3 + 2] - pp[i3 + 2]) * 0.005 * t
    }
    piperine.geometry.attributes.position.needsUpdate = true
    for (let i = 0; i < 80; i++) {
      cp[i * 3] += Math.sin(elapsed * 0.2 + i) * 0.01
      cp[i * 3 + 1] += Math.cos(elapsed * 0.15 + i) * 0.01
    }
    curcumin.geometry.attributes.position.needsUpdate = true
    curcumin.material.size = 2.0 + t * 2.0
    curcumin.material.opacity = 0.7 + t * 0.3
    engine.camera.position.x = Math.sin(elapsed * 0.12) * 5
    engine.camera.lookAt(0, 0, 0)
  }
  engine.start()
  return () => engine.destroy()
}
