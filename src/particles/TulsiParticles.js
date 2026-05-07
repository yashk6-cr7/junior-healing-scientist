/**
 * TulsiParticles.js — Day 2: Tulsi eugenol release scene
 * Green eugenol particles spiral out from leaf clusters into water.
 * Will be fully implemented in Task 7.
 */
import { ParticleEngine } from './ParticleEngine'
import { getParticleConfig } from '../data/particles'

export function createTulsiScene(container) {
  const config = getParticleConfig(2)
  const engine = new ParticleEngine(container, { background: config.background })

  for (const group of config.particleGroups) {
    engine.addParticleGroup(group)
  }

  engine.start()
  return () => engine.destroy()
}
