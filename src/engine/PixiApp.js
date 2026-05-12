/**
 * PixiApp.js — PixiJS v8 Application singleton
 * 
 * Creates and manages the single PixiJS Application instance.
 * Handles resize, device pixel ratio, and 60fps target.
 * 
 * NOTE: resizeTo handles resizing automatically — no manual resize needed.
 * destroy() uses PixiJS v8 signature.
 */
import { Application } from 'pixi.js'

let app = null
let destroying = false

export async function initPixiApp(container) {
  if (app) return app
  if (destroying) return null

  app = new Application()

  await app.init({
    background: 0x1a0a2e,
    resizeTo: window,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    powerPreference: 'high-performance',
  })

  // Style the canvas
  app.canvas.style.position = 'absolute'
  app.canvas.style.top = '0'
  app.canvas.style.left = '0'
  app.canvas.style.width = '100%'
  app.canvas.style.height = '100%'
  app.canvas.style.display = 'block'

  container.appendChild(app.canvas)

  return app
}

export function getPixiApp() {
  return app
}

export function destroyPixiApp() {
  if (!app || destroying) return
  destroying = true
  try {
    // PixiJS v8 destroy: first arg = removeCanvas, second = options
    app.destroy(true, { children: true })
  } catch (e) {
    // Gracefully handle destroy errors (StrictMode double unmount)
    console.warn('PixiApp destroy warning:', e.message)
  }
  app = null
  destroying = false
}
