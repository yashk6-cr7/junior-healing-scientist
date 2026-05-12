/**
 * particles.js — Particle behavior configurations per Section 10 spec
 * Each day has unique colors, behaviors, and scientific visualization goals.
 */

export const PARTICLE_CONFIGS = {
  day1: {
    name: 'Haldi Diffusion',
    description: 'Golden curcumin particles spread through white milk molecules when heated',
    particleGroups: [
      { name: 'curcumin', color: '#FFD700', count: 200, size: 3, behavior: 'cluster-then-diffuse' },
      { name: 'milk', color: '#FFFFFF', count: 300, size: 2, behavior: 'ambient-drift' },
    ],
    blending: 'additive',
    background: '#1a1200',
  },
  day2: {
    name: 'Tulsi Release',
    description: 'Green eugenol particles release from leaf shapes and spiral into water',
    particleGroups: [
      { name: 'eugenol', color: '#00C853', count: 250, size: 3, behavior: 'spiral-release' },
      { name: 'water', color: '#40C4FF', count: 200, size: 2, behavior: 'expanding-rings' },
    ],
    blending: 'additive',
    background: '#001a0d',
  },
  day3: {
    name: 'Antibacterial Attack',
    description: 'Gingerol and honey surround and dissolve bacteria particles',
    particleGroups: [
      { name: 'gingerol', color: '#FF6D00', count: 150, size: 3, behavior: 'seek-target' },
      { name: 'honey', color: '#FFD700', count: 150, size: 2.5, behavior: 'encircle' },
      { name: 'bacteria', color: '#FF1744', count: 30, size: 5, behavior: 'dissolve-target' },
    ],
    blending: 'additive',
    background: '#1a0800',
  },
  day4: {
    name: 'Steam Flow',
    description: 'White-blue steam particles rise and sweep mucus away',
    particleGroups: [
      { name: 'steam', color: '#E3F2FD', count: 400, size: 2.5, behavior: 'rise-upward' },
      { name: 'mucus', color: '#9E9E9E', count: 50, size: 4, behavior: 'swept-away' },
    ],
    blending: 'additive',
    background: '#0a1520',
  },
  day5: {
    name: 'Ingredient Swirl',
    description: 'Multiple colored healing particles mix in a unified swirl',
    particleGroups: [
      { name: 'quercetin', color: '#9C27B0', count: 120, size: 3, behavior: 'swirl' },
      { name: 'allicin', color: '#FFFFFF', count: 120, size: 2.5, behavior: 'swirl' },
      { name: 'beta_carotene', color: '#FF8F00', count: 120, size: 2.5, behavior: 'swirl' },
    ],
    blending: 'additive',
    background: '#1a0d00',
  },
  day6: {
    name: 'Bioavailability Boost',
    description: 'Piperine particles attach to curcumin making them glow brighter',
    particleGroups: [
      { name: 'piperine', color: '#212121', count: 200, size: 2, behavior: 'seek-and-attach' },
      { name: 'curcumin', color: '#FFD700', count: 100, size: 4, behavior: 'glow-on-attach' },
    ],
    blending: 'additive',
    background: '#0d0d00',
  },
  day7: {
    name: 'Grand Convergence',
    description: 'All previous particle types unite in a golden convergence stream',
    particleGroups: [
      { name: 'turmeric', color: '#FFD700', count: 80, size: 3, behavior: 'converge' },
      { name: 'tulsi', color: '#00C853', count: 80, size: 3, behavior: 'converge' },
      { name: 'ginger', color: '#FF6D00', count: 80, size: 3, behavior: 'converge' },
      { name: 'steam', color: '#40C4FF', count: 80, size: 2.5, behavior: 'converge' },
      { name: 'allicin', color: '#FFFFFF', count: 80, size: 2.5, behavior: 'converge' },
      { name: 'piperine', color: '#E040FB', count: 80, size: 2.5, behavior: 'converge' },
    ],
    blending: 'additive',
    background: '#0d0d1a',
  },
}

export function getParticleConfig(day) {
  return PARTICLE_CONFIGS[`day${day}`] || null
}
