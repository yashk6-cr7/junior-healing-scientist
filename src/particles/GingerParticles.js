/**
 * GingerParticles.js — Day 3: Antibacterial attack scene
 * Orange gingerol + gold honey surround and dissolve red bacteria.
 * Will be fully implemented in Task 7.
 */
import { ParticleEngine } from './ParticleEngine'
import { getParticleConfig } from '../data/particles'

export function createGingerScene(container) {
  const config = getParticleConfig(3)
  const engine = new ParticleEngine(container, { background: config.background })

  for (const group of config.particleGroups) {
    engine.addParticleGroup(group)
  }

  engine.start()
  return () => engine.destroy()
}
