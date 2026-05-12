/**
 * SteamParticles.js — Day 4: Steam clearing scene
 * White-blue steam particles rise upward, sweeping grey mucus away.
 * Will be fully implemented in Task 7.
 */
import { ParticleEngine } from './ParticleEngine'
import { getParticleConfig } from '../data/particles'

export function createSteamScene(container) {
  const config = getParticleConfig(4)
  const engine = new ParticleEngine(container, { background: config.background })

  for (const group of config.particleGroups) {
    engine.addParticleGroup(group)
  }

  engine.start()
  return () => engine.destroy()
}
