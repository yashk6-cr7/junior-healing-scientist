/**
 * SpiceParticles.js — Day 6: Bioavailability boost scene
 * Black piperine particles attach to gold curcumin, making them glow brighter.
 * Will be fully implemented in Task 7.
 */
import { ParticleEngine } from './ParticleEngine'
import { getParticleConfig } from '../data/particles'

export function createSpiceScene(container) {
  const config = getParticleConfig(6)
  const engine = new ParticleEngine(container, { background: config.background })

  for (const group of config.particleGroups) {
    engine.addParticleGroup(group)
  }

  engine.start()
  return () => engine.destroy()
}
