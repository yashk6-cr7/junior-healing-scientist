/**
 * particles.js — Particle math helpers for Three.js scenes
 * Shared utility functions used by all particle scenes.
 */

/**
 * Generate a random position within a sphere of given radius.
 */
export function randomInSphere(radius) {
  const u = Math.random()
  const v = Math.random()
  const theta = 2 * Math.PI * u
  const phi = Math.acos(2 * v - 1)
  const r = radius * Math.cbrt(Math.random())
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ]
}

/**
 * Generate a random position within a disk (2D circle, z=0).
 */
export function randomInDisk(radius) {
  const angle = Math.random() * 2 * Math.PI
  const r = radius * Math.sqrt(Math.random())
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
    z: 0,
  }
}

/**
 * Lerp between two values.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Smooth step between edge0 and edge1.
 */
export function smoothStep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * Convert hex color to Three.js-compatible float array [r, g, b].
 */
export function hexToRgbFloat(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}

/**
 * Create a circular glow texture as a canvas for particle material.
 */
export function createGlowTexture(size = 64) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)')
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}

/**
 * Oscillate a value between min and max over time.
 */
export function oscillate(time, min, max, speed = 1) {
  return lerp(min, max, (Math.sin(time * speed) + 1) / 2)
}
