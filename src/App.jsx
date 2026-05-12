/**
 * App.jsx — Root component
 * 
 * Architecture:
 * - #game-canvas: PixiJS renders ALL game visuals here
 * - #ui-overlay: React renders UI chrome (HUD, buttons, text) on top
 * - GameProvider: React context for state + localStorage persistence
 * 
 * All scenes are registered with SceneManager on mount.
 */
import { useEffect, useRef, useState } from 'react'
import { GameProvider, useGame } from './state/GameContext'
import { initPixiApp, destroyPixiApp, getPixiApp } from './engine/PixiApp'
import { SceneManager } from './engine/SceneManager'
import UIOverlay from './ui/UIOverlay'

// Import all scene factories
import { createHomeScene } from './scenes/HomeScene'
import { createSymptomScene } from './scenes/SymptomScene'
import { createDiscoveryScene } from './scenes/DiscoveryScene'
import { createPreparationScene } from './scenes/PreparationScene'
import { createDosageScene } from './scenes/DosageScene'
import { createMicroscopeScene } from './scenes/MicroscopeScene'
import { createSTEAMScene } from './scenes/STEAMScene'
import { createHealingScene } from './scenes/HealingScene'

// Register all scenes
SceneManager.register('home', createHomeScene)
SceneManager.register('symptoms', createSymptomScene)
SceneManager.register('discovery', createDiscoveryScene)
SceneManager.register('preparation', createPreparationScene)
SceneManager.register('dosage', createDosageScene)
SceneManager.register('microscope', createMicroscopeScene)
SceneManager.register('steam', createSTEAMScene)
SceneManager.register('healing', createHealingScene)

function GameCanvas() {
  const canvasRef = useRef(null)
  const { state, dispatch } = useGame()
  const [ready, setReady] = useState(false)

  // Initialize PixiJS once
  useEffect(() => {
    let cancelled = false

    const setup = async () => {
      if (!canvasRef.current) return

      try {
        const pixiApp = await initPixiApp(canvasRef.current)
        if (cancelled || !pixiApp) return

        SceneManager.init(pixiApp, state, dispatch)
        await SceneManager.goTo(state.currentStage || 'home')
        setReady(true)
      } catch (err) {
        console.error('PixiJS init failed:', err)
      }
    }
    setup()

    return () => {
      cancelled = true
      // Don't destroy on StrictMode remount — only on real unmount
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // React to stage changes
  useEffect(() => {
    if (ready && SceneManager.isReady()) {
      SceneManager.goTo(state.currentStage || 'home')
    }
  }, [state.currentStage, ready])

  // Sync state to SceneManager whenever it changes
  useEffect(() => {
    if (ready && SceneManager.isReady()) {
      SceneManager.syncState(state, dispatch)
    }
  }, [state, dispatch, ready])

  return <div id="game-canvas" ref={canvasRef} />
}

export default function App() {
  return (
    <GameProvider>
      <GameCanvas />
      <UIOverlay />
    </GameProvider>
  )
}
