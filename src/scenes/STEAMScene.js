/**
 * STEAMScene.js — Stage 6: STEAM Discovery Cards
 * PLACEHOLDER — Full implementation in Task 10
 */
import { Container, Graphics, Text } from 'pixi.js'
import { ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'

export function createSTEAMScene(app, state, dispatch) {
  const container = new Container()
  const W = app.renderer?.width || window.innerWidth
  const H = app.renderer?.height || window.innerHeight

  const bg = new Graphics()
  bg.rect(0, 0, W, H)
  bg.fill({ color: 0x1a0a2e })
  container.addChild(bg)

  const text = new Text({
    text: `Day ${state.currentDay}: STEAM Discovery\n(Full implementation in Task 10)`,
    style: { fontFamily: 'Nunito', fontSize: 24, fontWeight: '700', fill: 0x7c4dff, align: 'center' },
  })
  text.anchor.set(0.5)
  text.x = W / 2
  text.y = H / 2 - 40
  container.addChild(text)

  // Skip button
  const btn = new Container()
  btn.x = W / 2
  btn.y = H / 2 + 60
  btn.eventMode = 'static'
  btn.cursor = 'pointer'
  const btnBg = new Graphics()
  btnBg.roundRect(-100, -25, 200, 50, 25)
  btnBg.fill({ color: 0x7c4dff })
  btn.addChild(btnBg)
  const btnText = new Text({
    text: 'Skip to Healing →',
    style: { fontFamily: 'Nunito', fontSize: 16, fontWeight: '800', fill: 0xfffbf0 },
  })
  btnText.anchor.set(0.5)
  btn.addChild(btnText)
  btn.on('pointerup', () => {
    SoundManager.play('whoosh')
    dispatch({ type: ACTIONS.SET_STAGE, payload: 'healing' })
  })
  container.addChild(btn)

  return { container, onEnter() {}, onExit() {}, destroy() {} }
}
