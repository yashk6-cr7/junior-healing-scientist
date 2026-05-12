/**
 * HaldiParticles.js — Day 1: Curcumin diffusion in milk
 * Golden curcumin particles start clustered, then diffuse evenly through white milk on "heating".
 */
import { ParticleEngine } from './ParticleEngine'
import { randomInSphere } from '../utils/particles'

export function createHaldiScene(container) {
  const engine = new ParticleEngine(container, { background: '#0D1B2A', cameraZ: 35 })

  // Milk particles — spread randomly
  const milk = engine.addParticleGroup({ name: 'milk', color: '#E0E0E0', count: 200, size: 1.5 })
  const milkPositions = milk.geometry.attributes.position.array
  for (let i = 0; i < 200; i++) {
    const [x, y, z] = randomInSphere(18)
    milkPositions[i * 3] = x
    milkPositions[i * 3 + 1] = y
    milkPositions[i * 3 + 2] = z
  }
  milk.geometry.attributes.position.needsUpdate = true

  // Curcumin particles — start clustered at center
  const curcumin = engine.addParticleGroup({ name: 'curcumin', color: '#FFD700', count: 150, size: 2.5 })
  const curcuminPos = curcumin.geometry.attributes.position.array
  const targetPositions = new Float32Array(150 * 3)
  for (let i = 0; i < 150; i++) {
    const [x, y, z] = randomInSphere(3) // start clustered
    curcuminPos[i * 3] = x
    curcuminPos[i * 3 + 1] = y
    curcuminPos[i * 3 + 2] = z
    // Target: spread out
    const [tx, ty, tz] = randomInSphere(16)
    targetPositions[i * 3] = tx
    targetPositions[i * 3 + 1] = ty
    targetPositions[i * 3 + 2] = tz
  }
  curcumin.geometry.attributes.position.needsUpdate = true

  // Override update for diffusion behavior
  engine.updateParticles = (elapsed) => {
    const diffusionStart = 2.0 // seconds before diffusion starts
    const t = Math.min(1, Math.max(0, (elapsed - diffusionStart) / 3.0)) // 3s to fully diffuse

    // Curcumin: lerp from clustered to spread
    const pos = curcumin.geometry.attributes.position.array
    for (let i = 0; i < 150; i++) {
      const i3 = i * 3
      pos[i3] += (targetPositions[i3] - pos[i3]) * t * 0.02
      pos[i3 + 1] += (targetPositions[i3 + 1] - pos[i3 + 1]) * t * 0.02
      pos[i3 + 2] += (targetPositions[i3 + 2] - pos[i3 + 2]) * t * 0.02
    }
    curcumin.geometry.attributes.position.needsUpdate = true

    // Curcumin glow increases as diffusion happens
    curcumin.material.size = 2.5 + t * 1.5
    curcumin.material.opacity = 0.7 + t * 0.3

    // Milk: gentle ambient drift
    const milkP = milk.geometry.attributes.position.array
    for (let i = 0; i < 200; i++) {
      const i3 = i * 3
      milkP[i3] += Math.sin(elapsed + i) * 0.01
      milkP[i3 + 1] += Math.cos(elapsed + i * 0.7) * 0.01
    }
    milk.geometry.attributes.position.needsUpdate = true

    // Camera gentle orbit
    engine.camera.position.x = Math.sin(elapsed * 0.15) * 5
    engine.camera.position.y = Math.cos(elapsed * 0.12) * 3
    engine.camera.lookAt(0, 0, 0)
  }

  engine.start()
  return () => engine.destroy()
}
