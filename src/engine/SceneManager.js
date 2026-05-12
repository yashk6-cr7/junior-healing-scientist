/**
 * SceneManager.js — Manages PixiJS scene transitions
 * 
 * Each "scene" is a PixiJS Container that gets added/removed from stage.
 * Handles enter/exit animations via GSAP.
 */
import { Container } from 'pixi.js'
import gsap from 'gsap'

// Scene registry — populated by scene files
const scenes = {}
let app = null
let currentScene = null
let currentSceneName = null
let gameState = null
let gameDispatch = null
let ready = false

export const SceneManager = {
  init(pixiApp, state, dispatch) {
    app = pixiApp
    gameState = state
    gameDispatch = dispatch
    ready = true
  },

  isReady() {
    return ready
  },

  register(name, sceneFactory) {
    scenes[name] = sceneFactory
  },

  syncState(state, dispatch) {
    gameState = state
    gameDispatch = dispatch
    if (currentScene && currentScene.onStateUpdate) {
      currentScene.onStateUpdate(state, dispatch)
    }
  },

  getState() {
    return gameState
  },

  getDispatch() {
    return gameDispatch
  },

  async goTo(sceneName) {
    if (!app || !scenes[sceneName]) {
      console.warn(`Scene "${sceneName}" not found. Available:`, Object.keys(scenes))
      return
    }
    if (sceneName === currentSceneName && currentScene) return

    // Exit current scene
    if (currentScene) {
      if (currentScene.onExit) {
        await currentScene.onExit()
      }
      // Fade out
      await gsap.to(currentScene.container, {
        alpha: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
      app.stage.removeChild(currentScene.container)
      if (currentScene.destroy) currentScene.destroy()
    }

    // Create new scene
    const sceneFactory = scenes[sceneName]
    const scene = sceneFactory(app, gameState, gameDispatch)
    scene.container = scene.container || new Container()
    scene.container.alpha = 0

    app.stage.addChild(scene.container)

    if (scene.onEnter) {
      await scene.onEnter()
    }

    // Fade in
    await gsap.to(scene.container, {
      alpha: 1,
      duration: 0.4,
      ease: 'power2.out',
    })

    currentScene = scene
    currentSceneName = sceneName
  },
}
