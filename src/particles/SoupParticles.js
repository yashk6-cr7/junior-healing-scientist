/**
 * SoupParticles.js — Day 5: Ingredient swirl scene
 * Purple quercetin, white allicin, orange beta-carotene swirl together.
 * Will be fully implemented in Task 7.
 */
import { ParticleEngine } from './ParticleEngine'
import { getParticleConfig } from '../data/particles'

export function createSoupScene(container) {
  const config = getParticleConfig(5)
  const engine = new ParticleEngine(container, { background: config.background })

  for (const group of config.particleGroups) {
    engine.addParticleGroup(group)
  }

  engine.start()
  return () => engine.destroy()
}
