/**
 * HaldiParticles.js — Day 1: Turmeric diffusion scene
 * Golden curcumin particles spread through white milk when heated.
 * Start clustered, heat makes them diffuse evenly.
 * Will be fully implemented in Task 5.
 */
import { ParticleEngine } from './ParticleEngine'
import { getParticleConfig } from '../data/particles'

export function createHaldiScene(container) {
  const config = getParticleConfig(1)
  const engine = new ParticleEngine(container, { background: config.background })

  for (const group of config.particleGroups) {
    engine.addParticleGroup(group)
  }

  engine.start()
  return () => engine.destroy()
}
