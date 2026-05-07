/**
 * KadhaParticles.js — Day 7: Grand convergence scene
 * ALL previous particle colors appear together flowing into golden stream.
 * Most impressive particle scene — rainbow transitioning to gold.
 * Will be fully implemented in Task 7.
 */
import { ParticleEngine } from './ParticleEngine'
import { getParticleConfig } from '../data/particles'

export function createKadhaScene(container) {
  const config = getParticleConfig(7)
  const engine = new ParticleEngine(container, { background: config.background })

  for (const group of config.particleGroups) {
    engine.addParticleGroup(group)
  }

  engine.start()
  return () => engine.destroy()
}
