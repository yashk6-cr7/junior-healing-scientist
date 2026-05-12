/**
 * ParticleEngine.js — Core Three.js setup for particle scenes
 * 
 * Creates Scene, Camera, Renderer with:
 * - AdditiveBlending for glow effect (per spec)
 * - Auto-resize with window
 * - requestAnimationFrame loop
 * - Cleanup on destroy
 * 
 * Will be fully implemented in Task 5.
 */
import * as THREE from 'three'
import { createGlowTexture } from '../utils/particles'

export class ParticleEngine {
  constructor(container, options = {}) {
    this.container = container
    this.width = container.clientWidth
    this.height = container.clientHeight
    this.animationId = null
    this.clock = new THREE.Clock()
    this.particleGroups = []

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(options.background || '#0D1B2A')

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000)
    this.camera.position.z = options.cameraZ || 30

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(this.renderer.domElement)

    // Glow texture
    const glowCanvas = createGlowTexture(64)
    this.glowTexture = new THREE.CanvasTexture(glowCanvas)

    // Resize handler
    this._onResize = this._handleResize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  /**
   * Add a group of particles with given color, count, and size.
   */
  addParticleGroup({ name, color, count, size }) {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 40
      positions[i3 + 1] = (Math.random() - 0.5) * 40
      positions[i3 + 2] = (Math.random() - 0.5) * 20
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: size || 2,
      map: this.glowTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    })

    const points = new THREE.Points(geometry, material)
    this.scene.add(points)

    this.particleGroups.push({
      name,
      points,
      geometry,
      material,
      velocities,
      count,
    })

    return points
  }

  /**
   * Start the animation loop.
   * Override updateParticles() in subclasses for custom behavior.
   */
  start() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      const elapsed = this.clock.getElapsedTime()
      const delta = this.clock.getDelta()
      this.updateParticles(elapsed, delta)
      this.renderer.render(this.scene, this.camera)
    }
    animate()
  }

  /**
   * Override this in scene-specific files for custom particle behavior.
   */
  updateParticles(elapsed, delta) {
    // Default: gentle ambient drift
    for (const group of this.particleGroups) {
      const positions = group.geometry.attributes.position.array
      for (let i = 0; i < group.count; i++) {
        const i3 = i * 3
        positions[i3] += group.velocities[i3]
        positions[i3 + 1] += group.velocities[i3 + 1]
        positions[i3 + 2] += group.velocities[i3 + 2]

        // Wrap around bounds
        if (Math.abs(positions[i3]) > 20) group.velocities[i3] *= -1
        if (Math.abs(positions[i3 + 1]) > 20) group.velocities[i3 + 1] *= -1
        if (Math.abs(positions[i3 + 2]) > 10) group.velocities[i3 + 2] *= -1
      }
      group.geometry.attributes.position.needsUpdate = true
    }
  }

  /**
   * Clean up and destroy.
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    window.removeEventListener('resize', this._onResize)

    for (const group of this.particleGroups) {
      group.geometry.dispose()
      group.material.dispose()
    }

    if (this.glowTexture) this.glowTexture.dispose()
    if (this.renderer) {
      this.renderer.dispose()
      if (this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement)
      }
    }
  }

  _handleResize() {
    this.width = this.container.clientWidth
    this.height = this.container.clientHeight
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
  }
}
