/**
 * SymptomScene.js — Stage 1: Symptom Discovery (Day 1) / Progressive Dashboard (Day 2-7)
 */
import { Container, Graphics, Text } from 'pixi.js'
import gsap from 'gsap'
import { ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'

export function createSymptomScene(app, state, dispatch) {
  const container = new Container()
  const W = app.renderer?.width || window.innerWidth
  const H = app.renderer?.height || window.innerHeight
  const isDay1 = state.currentDay === 1 && state.completedDays.length === 0

  const bg = new Graphics()
  bg.rect(0, 0, W, H)
  bg.fill({ color: 0x1a0a2e })
  container.addChild(bg)

  if (!isDay1) {
    // ── Day 2-7: Progressive dashboard ──
    const healthFrac = (state.arjunHealth - 10) / 90
    const skinR = Math.round(0x90 + healthFrac * (0xff - 0x90))
    const skinG = Math.round(0x78 + healthFrac * (0xcc - 0x78))
    const skinB = Math.round(0x78 + healthFrac * (0x99 - 0x78))
    const skinColor = (skinR << 16) | (skinG << 8) | skinB

    const arjun = new Container()
    arjun.x = W / 2; arjun.y = H * 0.35
    const head = new Graphics(); head.circle(0, -30, 30); head.fill({ color: skinColor })
    const body = new Graphics(); body.ellipse(0, 20, 22, 32); body.fill({ color: 0x4a3578 })
    const eyeL = new Graphics(); eyeL.circle(-9, -35, 3); eyeL.fill({ color: 0x1a0a2e })
    const eyeR = new Graphics(); eyeR.circle(9, -35, 3); eyeR.fill({ color: 0x1a0a2e })
    const smile = new Graphics()
    smile.arc(0, -25, 7, 0.2, Math.PI - 0.2)
    smile.stroke({ color: 0x1a0a2e, width: 2 })
    arjun.addChild(body, head, eyeL, eyeR, smile)
    container.addChild(arjun)
    gsap.to(arjun.scale, { x: 1.02, y: 0.98, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' })

    const dayText = new Text({
      text: `Day ${state.currentDay} — Arjun is getting better!`,
      style: { fontFamily: 'Nunito', fontSize: Math.min(22, W * 0.055), fontWeight: '800', fill: 0x4caf7d, align: 'center' },
    })
    dayText.anchor.set(0.5); dayText.x = W / 2; dayText.y = H * 0.08
    container.addChild(dayText)
    gsap.from(dayText, { alpha: 0, y: dayText.y - 15, duration: 0.5 })

    // Energy bar
    const barY = H * 0.58
    const barW = Math.min(300, W * 0.7)
    const barBg = new Graphics()
    barBg.roundRect(W / 2 - barW / 2, barY, barW, 16, 8)
    barBg.fill({ color: 0x2a1548 })
    container.addChild(barBg)
    const barFill = new Graphics()
    barFill.roundRect(W / 2 - barW / 2 + 2, barY + 2, (barW - 4) * healthFrac, 12, 6)
    barFill.fill({ color: 0x4caf7d })
    container.addChild(barFill)
    gsap.from(barFill.scale, { x: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 })

    const healthLabel = new Text({
      text: `⚡ ${state.arjunHealth}% health`,
      style: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', fill: 0x4caf7d },
    })
    healthLabel.anchor.set(0.5); healthLabel.x = W / 2; healthLabel.y = barY + 28
    container.addChild(healthLabel)

    // Continue button
    const btn = new Container()
    btn.x = W / 2; btn.y = H * 0.75
    btn.eventMode = 'static'; btn.cursor = 'pointer'
    const btnBg = new Graphics()
    btnBg.roundRect(-100, -25, 200, 50, 25)
    btnBg.fill({ color: 0xf5c842 })
    btn.addChild(btnBg)
    const btnText = new Text({ text: 'Find Today\'s Remedy →', style: { fontFamily: 'Nunito', fontSize: 15, fontWeight: '800', fill: 0x1a0a2e } })
    btnText.anchor.set(0.5)
    btn.addChild(btnText)
    btn.on('pointerup', () => { SoundManager.play('whoosh'); dispatch({ type: ACTIONS.SET_STAGE, payload: 'discovery' }) })
    container.addChild(btn)
    gsap.from(btn, { alpha: 0, y: btn.y + 20, duration: 0.4, delay: 0.5 })

    return { container, onEnter(){}, onExit(){}, destroy() { gsap.killTweensOf(arjun.scale) } }
  }

  // ── Day 1: Full symptom screen ──
  const title = new Text({
    text: 'Meet Arjun — He\'s Not Feeling Well',
    style: { fontFamily: 'Nunito', fontSize: Math.min(20, W * 0.05), fontWeight: '800', fill: 0xe53935, align: 'center' },
  })
  title.anchor.set(0.5); title.x = W / 2; title.y = 30
  container.addChild(title)

  // Arjun (pale, sad)
  const arjun = new Container()
  arjun.x = W / 2; arjun.y = H * 0.38
  const head = new Graphics(); head.circle(0, -35, 35); head.fill({ color: 0x908080 })
  const body = new Graphics(); body.ellipse(0, 25, 26, 38); body.fill({ color: 0x4a3578 })
  const eyeL = new Graphics(); eyeL.circle(-12, -42, 4); eyeL.fill({ color: 0x1a0a2e })
  const eyeR = new Graphics(); eyeR.circle(12, -42, 4); eyeR.fill({ color: 0x1a0a2e })
  // Sad frown
  const frown = new Graphics()
  frown.arc(0, -26, 8, Math.PI + 0.3, -0.3)
  frown.stroke({ color: 0x1a0a2e, width: 2 })
  arjun.addChild(body, head, eyeL, eyeR, frown)
  // Hunched posture
  arjun.rotation = 0.05
  container.addChild(arjun)

  // ── 4 Symptom zones ──
  const symptoms = [
    { label: 'Sore Throat', x: W / 2, y: H * 0.38 + 5, emoji: '😣' },
    { label: 'Headache', x: W / 2, y: H * 0.38 - 55, emoji: '🤕' },
    { label: 'Chest Congestion', x: W / 2 - 15, y: H * 0.38 + 25, emoji: '😮‍💨' },
    { label: 'Low Energy', x: W / 2 + 40, y: H * 0.38 + 30, emoji: '😴' },
  ]

  let tapped = 0
  const instruction = new Text({
    text: 'Tap each symptom to learn what Arjun feels',
    style: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '600', fill: 0xfffbf0, align: 'center' },
  })
  instruction.anchor.set(0.5); instruction.x = W / 2; instruction.y = H * 0.62
  container.addChild(instruction)

  symptoms.forEach((sym, idx) => {
    const zone = new Container()
    zone.x = sym.x; zone.y = sym.y
    zone.eventMode = 'static'; zone.cursor = 'pointer'

    // Pulsing red glow
    const glow = new Graphics()
    glow.circle(0, 0, 22)
    glow.fill({ color: 0xe53935, alpha: 0.3 })
    zone.addChild(glow)
    gsap.to(glow, { alpha: 0.1, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' })

    zone.tapped = false

    zone.on('pointerup', () => {
      if (zone.tapped) return
      zone.tapped = true
      SoundManager.play('ingredient_tap')

      // Pop animation
      gsap.to(glow.scale, { x: 1.8, y: 1.8, duration: 0.2 })
      gsap.to(glow, { alpha: 0, duration: 0.3 })

      // Change to green
      const greenGlow = new Graphics()
      greenGlow.circle(0, 0, 18)
      greenGlow.fill({ color: 0x4caf7d, alpha: 0.3 })
      zone.addChild(greenGlow)

      // Show label
      const label = new Text({
        text: sym.label,
        style: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', fill: 0x4caf7d },
      })
      label.anchor.set(0.5); label.y = 28
      zone.addChild(label)
      gsap.from(label, { alpha: 0, y: label.y + 8, duration: 0.3 })

      tapped++
      if (tapped >= 4) {
        instruction.text = 'Now let\'s find the remedy!'
        setTimeout(() => {
          SoundManager.play('whoosh')
          dispatch({ type: ACTIONS.SET_STAGE, payload: 'discovery' })
        }, 1500)
      }
    })

    container.addChild(zone)
  })

  return { container, onEnter(){}, onExit(){}, destroy(){} }
}
