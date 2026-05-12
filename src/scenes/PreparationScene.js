/**
 * PreparationScene.js — Stage 3: Prepare the Remedy
 * Bowl with liquid simulation, pour, stir (circular gesture), heat, and honey drizzle.
 * ALL inside PixiJS canvas — zero HTML divs.
 */
import { Container, Graphics, Text } from 'pixi.js'
import gsap from 'gsap'
import { ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'
import { getRemedy } from '../data/remedies'

// ── Liquid particle pool ──
function createLiquidParticle(x, y, color) {
  const p = new Graphics()
  p.circle(0, 0, 3 + Math.random() * 2)
  p.fill({ color, alpha: 0.8 })
  p.x = x; p.y = y
  p.vx = (Math.random() - 0.5) * 0.5
  p.vy = Math.random() * 0.3
  p.baseColor = color
  return p
}

export function createPreparationScene(app, state, dispatch) {
  const container = new Container()
  const W = app.renderer?.width || window.innerWidth
  const H = app.renderer?.height || window.innerHeight
  const remedy = getRemedy(state.currentDay)
  if (!remedy) return { container, onEnter(){}, onExit(){}, destroy(){} }

  // ── State ──
  let phase = 'pour'  // pour → addSpice → stir → heat → drizzle → done
  let liquidLevel = 0  // 0-1
  let spiceAdded = false
  let stirProgress = 0  // 0-100
  let temperature = 20
  let isHeating = false
  let honeyAdded = false
  let liquidColor = 0xffffff  // starts white (milk)
  let tickerFn = null

  // ── Background ──
  const bg = new Graphics()
  bg.rect(0, 0, W, H)
  bg.fill({ color: 0x1a0a2e })
  container.addChild(bg)

  // Countertop
  const counter = new Graphics()
  counter.rect(0, H * 0.72, W, H * 0.28)
  counter.fill({ color: 0x3e2723 })
  counter.rect(0, H * 0.72, W, 4)
  counter.fill({ color: 0x5d4037 })
  container.addChild(counter)

  // ── Title / instruction ──
  const instruction = new Text({
    text: '🥛 Pour the milk into the bowl',
    style: { fontFamily: 'Nunito', fontSize: Math.min(18, W * 0.045), fontWeight: '700', fill: 0xfffbf0, align: 'center', wordWrap: true, wordWrapWidth: W * 0.8 },
  })
  instruction.anchor.set(0.5)
  instruction.x = W / 2
  instruction.y = 30
  container.addChild(instruction)

  // ── Bowl ──
  const bowlX = W / 2
  const bowlY = H * 0.55
  const bowlW = Math.min(200, W * 0.45)
  const bowlH = bowlW * 0.55

  const bowl = new Graphics()
  // Bowl shape (arc/ellipse)
  bowl.ellipse(bowlX, bowlY, bowlW / 2, bowlH / 2)
  bowl.stroke({ color: 0x8d6e63, width: 4 })
  bowl.ellipse(bowlX, bowlY, bowlW / 2 - 4, bowlH / 2 - 4)
  bowl.fill({ color: 0x5d4037, alpha: 0.3 })
  // Bowl rim
  bowl.ellipse(bowlX, bowlY - bowlH / 2 + 4, bowlW / 2, 8)
  bowl.fill({ color: 0xa1887f })
  container.addChild(bowl)

  // ── Liquid inside bowl ──
  const liquidContainer = new Container()
  container.addChild(liquidContainer)
  const liquidParticles = []

  function updateLiquid() {
    // Draw liquid fill
    liquidContainer.removeChildren()
    if (liquidLevel <= 0) return
    const fillH = bowlH * liquidLevel * 0.7
    const liq = new Graphics()
    liq.ellipse(bowlX, bowlY + bowlH / 2 - fillH / 2 - 8, (bowlW / 2 - 8) * Math.min(1, liquidLevel + 0.3), fillH / 2)
    liq.fill({ color: liquidColor, alpha: 0.85 })
    liquidContainer.addChild(liq)

    // Surface shimmer
    if (liquidLevel > 0.1) {
      const shimmer = new Graphics()
      shimmer.ellipse(bowlX, bowlY + bowlH / 2 - fillH - 4, (bowlW / 2 - 12) * Math.min(1, liquidLevel + 0.2), 4)
      shimmer.fill({ color: 0xffffff, alpha: 0.15 })
      liquidContainer.addChild(shimmer)
    }
  }

  // ── Milk container (draggable) ──
  const milkJar = new Container()
  milkJar.x = W * 0.15
  milkJar.y = H * 0.25
  milkJar.eventMode = 'static'
  milkJar.cursor = 'grab'

  const milkBody = new Graphics()
  milkBody.roundRect(-20, -35, 40, 70, 8)
  milkBody.fill({ color: 0xffffff })
  milkBody.stroke({ color: 0xbbbbbb, width: 2 })
  milkJar.addChild(milkBody)

  const milkLabel = new Text({ text: '🥛', style: { fontSize: 24 } })
  milkLabel.anchor.set(0.5)
  milkJar.addChild(milkLabel)

  const milkText = new Text({
    text: 'Milk',
    style: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', fill: 0x1a0a2e },
  })
  milkText.anchor.set(0.5)
  milkText.y = 45
  milkJar.addChild(milkText)
  container.addChild(milkJar)

  // Drag milk
  let draggingMilk = false
  let milkStartPos = { x: milkJar.x, y: milkJar.y }
  milkJar.on('pointerdown', (e) => {
    if (phase !== 'pour') return
    draggingMilk = true
    milkJar.cursor = 'grabbing'
  })

  // ── Spice container ──
  const spiceJar = new Container()
  spiceJar.x = W * 0.85
  spiceJar.y = H * 0.25
  spiceJar.eventMode = 'static'
  spiceJar.cursor = 'pointer'
  spiceJar.visible = false

  const spiceBody = new Graphics()
  spiceBody.roundRect(-20, -25, 40, 50, 8)
  spiceBody.fill({ color: remedy.color })
  spiceBody.stroke({ color: 0xffffff, width: 1, alpha: 0.3 })
  spiceJar.addChild(spiceBody)

  const spiceLabel = new Text({
    text: remedy.correct[0]?.name || 'Spice',
    style: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '700', fill: 0x1a0a2e },
  })
  spiceLabel.anchor.set(0.5)
  spiceLabel.y = 35
  spiceJar.addChild(spiceLabel)
  container.addChild(spiceJar)

  spiceJar.on('pointerup', () => {
    if (phase !== 'addSpice') return
    spiceAdded = true
    // Golden particles fall into bowl
    for (let i = 0; i < 15; i++) {
      const p = new Graphics()
      p.circle(0, 0, 2 + Math.random() * 2)
      p.fill({ color: remedy.color })
      p.x = spiceJar.x + (Math.random() - 0.5) * 20
      p.y = spiceJar.y
      container.addChild(p)
      gsap.to(p, {
        x: bowlX + (Math.random() - 0.5) * 40,
        y: bowlY,
        duration: 0.6 + Math.random() * 0.3,
        ease: 'power2.in',
        onComplete: () => { if (p.parent) p.parent.removeChild(p) },
      })
    }
    // Transition liquid color
    gsap.to({ t: 0 }, {
      t: 1, duration: 3, ease: 'power2.inOut',
      onUpdate: function() {
        const t = this.targets()[0].t
        const r = Math.round(0xff + t * ((remedy.color >> 16 & 0xff) - 0xff))
        const g = Math.round(0xff + t * ((remedy.color >> 8 & 0xff) - 0xff))
        const b = Math.round(0xff + t * ((remedy.color & 0xff) - 0xff))
        liquidColor = (r << 16) | (g << 8) | b
        updateLiquid()
      },
    })
    SoundManager.play('correct_ingredient')
    instruction.text = '🌀 Stir the mixture! Draw circles in the bowl'
    phase = 'stir'
    gsap.to(spiceJar, { alpha: 0.3, duration: 0.3 })
    showStirMeter()
  })

  // ── Stir meter ──
  const stirMeter = new Container()
  stirMeter.x = W - 40
  stirMeter.y = H * 0.35
  stirMeter.visible = false
  container.addChild(stirMeter)

  const stirBg = new Graphics()
  stirBg.roundRect(-12, 0, 24, 150, 12)
  stirBg.fill({ color: 0x2a1548 })
  stirBg.stroke({ color: 0xf5c842, width: 1, alpha: 0.3 })
  stirMeter.addChild(stirBg)

  const stirFill = new Graphics()
  stirMeter.addChild(stirFill)

  const stirLabel = new Text({
    text: 'Mix',
    style: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '700', fill: 0xf5c842 },
  })
  stirLabel.anchor.set(0.5)
  stirLabel.y = -12
  stirMeter.addChild(stirLabel)

  function showStirMeter() { stirMeter.visible = true }

  function updateStirMeter() {
    stirFill.clear()
    const fillH = 150 * (stirProgress / 100)
    stirFill.roundRect(-10, 150 - fillH, 20, fillH, 10)
    stirFill.fill({ color: remedy.color })
  }

  // ── Stir gesture tracking ──
  let lastPointerAngle = null
  let totalAngle = 0

  container.eventMode = 'static'
  container.on('pointermove', (e) => {
    const pos = e.global
    if (draggingMilk && phase === 'pour') {
      milkJar.x = pos.x
      milkJar.y = pos.y
      // If near bowl, pour
      const dist = Math.hypot(pos.x - bowlX, pos.y - bowlY)
      if (dist < bowlW * 0.8 && liquidLevel < 1) {
        liquidLevel = Math.min(1, liquidLevel + 0.008)
        updateLiquid()
        if (Math.random() < 0.3) SoundManager.play('pour_liquid')
      }
      return
    }
    if (phase === 'stir' && e.buttons > 0) {
      const dx = pos.x - bowlX
      const dy = pos.y - bowlY
      const dist = Math.hypot(dx, dy)
      if (dist < bowlW * 0.6) {
        const angle = Math.atan2(dy, dx)
        if (lastPointerAngle !== null) {
          let delta = angle - lastPointerAngle
          if (delta > Math.PI) delta -= 2 * Math.PI
          if (delta < -Math.PI) delta += 2 * Math.PI
          totalAngle += Math.abs(delta)
          stirProgress = Math.min(100, (totalAngle / (Math.PI * 8)) * 100)
          updateStirMeter()
          if (stirProgress >= 100 && phase === 'stir') {
            phase = 'heat'
            instruction.text = '🔥 Hold the flame to heat! Watch the thermometer!'
            stirMeter.visible = false
            showThermometer()
            SoundManager.playChime()
          }
        }
        lastPointerAngle = angle
      }
    }
  })

  container.on('pointerup', () => {
    if (draggingMilk) {
      draggingMilk = false
      milkJar.cursor = 'grab'
      if (liquidLevel >= 0.6) {
        phase = 'addSpice'
        instruction.text = `✨ Tap the ${remedy.correct[0]?.name || 'spice'} to add it!`
        spiceJar.visible = true
        gsap.from(spiceJar.scale, { x: 0, y: 0, duration: 0.4, ease: 'back.out(2)' })
        gsap.to(milkJar, { alpha: 0.3, duration: 0.3 })
        SoundManager.playChime()
      } else {
        // Snap back
        gsap.to(milkJar, { x: milkStartPos.x, y: milkStartPos.y, duration: 0.3 })
      }
    }
    lastPointerAngle = null
  })

  // ── Thermometer ──
  const thermo = new Container()
  thermo.x = W - 45
  thermo.y = H * 0.25
  thermo.visible = false
  container.addChild(thermo)

  const thermoBg = new Graphics()
  thermoBg.roundRect(-14, 0, 28, 200, 14)
  thermoBg.fill({ color: 0x2a1548 })
  thermoBg.stroke({ color: 0x666, width: 1 })
  thermo.addChild(thermoBg)

  // Bulb at bottom
  const thermoBulb = new Graphics()
  thermoBulb.circle(0, 210, 16)
  thermoBulb.fill({ color: 0xe53935 })
  thermo.addChild(thermoBulb)

  const thermoFill = new Graphics()
  thermo.addChild(thermoFill)

  const thermoLabel = new Text({
    text: '20°C',
    style: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', fill: 0xfffbf0 },
  })
  thermoLabel.anchor.set(0.5)
  thermoLabel.y = -16
  thermo.addChild(thermoLabel)

  // Sweet spot marker
  const sweetSpot = new Graphics()
  const ssY = 200 - (75 / 100) * 200  // 75°C position
  sweetSpot.rect(-18, ssY - 2, 36, 4)
  sweetSpot.fill({ color: 0x4caf7d })
  thermo.addChild(sweetSpot)

  const ssText = new Text({
    text: '75°C',
    style: { fontFamily: 'Nunito', fontSize: 9, fill: 0x4caf7d },
  })
  ssText.x = 20
  ssText.y = ssY - 6
  thermo.addChild(ssText)

  function showThermometer() {
    thermo.visible = true
    gsap.from(thermo, { alpha: 0, x: thermo.x + 30, duration: 0.4 })
    showFlameButton()
  }

  function updateThermometer() {
    const fill = Math.min(200, (temperature / 100) * 200)
    thermoFill.clear()

    let color = 0x42a5f5  // blue
    if (temperature >= 40) color = 0xfdd835  // yellow
    if (temperature >= 60) color = 0xff8c42  // orange
    if (temperature >= 75 && temperature <= 85) color = 0x4caf7d  // green (sweet spot)
    if (temperature > 85) color = 0xe53935  // red (too hot)

    thermoFill.roundRect(-10, 200 - fill, 20, fill, 10)
    thermoFill.fill({ color })

    thermoLabel.text = `${Math.round(temperature)}°C`
    thermoLabel.style.fill = color

    // Bubbles at 40+
    if (temperature >= 40 && Math.random() < 0.15) {
      const bub = new Graphics()
      bub.circle(0, 0, 2)
      bub.fill({ color: 0xffffff, alpha: 0.5 })
      bub.x = bowlX + (Math.random() - 0.5) * 40
      bub.y = bowlY - 10
      container.addChild(bub)
      gsap.to(bub, { y: bub.y - 30, alpha: 0, duration: 0.8, onComplete: () => { if (bub.parent) bub.parent.removeChild(bub) } })
    }

    // Steam at 60+
    if (temperature >= 60 && Math.random() < 0.1) {
      const steam = new Graphics()
      steam.circle(0, 0, 4 + Math.random() * 4)
      steam.fill({ color: 0xffffff, alpha: 0.15 })
      steam.x = bowlX + (Math.random() - 0.5) * 50
      steam.y = bowlY - 20
      container.addChild(steam)
      gsap.to(steam, { y: steam.y - 60, alpha: 0, scaleX: 2, scaleY: 2, duration: 1.5, onComplete: () => { if (steam.parent) steam.parent.removeChild(steam) } })
    }

    // Sweet spot reached
    if (temperature >= 75 && temperature <= 85) {
      // Golden glow
      if (!container.__sweetSpotShown) {
        container.__sweetSpotShown = true
        const successText = new Text({
          text: '✨ PERFECT TEMPERATURE! ✨',
          style: { fontFamily: 'Nunito', fontSize: 16, fontWeight: '900', fill: 0x4caf7d },
        })
        successText.anchor.set(0.5)
        successText.x = W / 2
        successText.y = bowlY - bowlH - 20
        container.addChild(successText)
        gsap.from(successText.scale, { x: 0, y: 0, duration: 0.4, ease: 'back.out(2)' })
        container.__successText = successText
      }
    }

    // Too hot
    if (temperature > 85) {
      if (!container.__tooHotShown) {
        container.__tooHotShown = true
        instruction.text = '⚠️ Too hot! Curcumin breaks down! Tap Reset'
        // Darken liquid
        liquidColor = 0x5d4037
        updateLiquid()
        showResetButton()
      }
    }
  }

  // ── Flame button (hold) ──
  const flameBtn = new Container()
  flameBtn.x = bowlX
  flameBtn.y = H * 0.82
  flameBtn.eventMode = 'static'
  flameBtn.cursor = 'pointer'
  flameBtn.visible = false
  container.addChild(flameBtn)

  const flameBg = new Graphics()
  flameBg.circle(0, 0, 30)
  flameBg.fill({ color: 0xff5722, alpha: 0.2 })
  flameBg.circle(0, 0, 22)
  flameBg.fill({ color: 0xff5722 })
  flameBtn.addChild(flameBg)

  const flameIcon = new Text({ text: '🔥', style: { fontSize: 26 } })
  flameIcon.anchor.set(0.5)
  flameBtn.addChild(flameIcon)

  const holdText = new Text({
    text: 'HOLD',
    style: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '800', fill: 0xfffbf0 },
  })
  holdText.anchor.set(0.5)
  holdText.y = 38
  flameBtn.addChild(holdText)

  function showFlameButton() {
    flameBtn.visible = true
    gsap.from(flameBtn.scale, { x: 0, y: 0, duration: 0.4, ease: 'back.out(2)' })
  }

  flameBtn.on('pointerdown', () => {
    if (phase !== 'heat') return
    isHeating = true
  })
  flameBtn.on('pointerup', () => {
    isHeating = false
    if (phase === 'heat' && temperature >= 75 && temperature <= 85) {
      // Success!
      phase = 'done'
      instruction.text = '🎉 Remedy prepared perfectly!'
      flameBtn.visible = false
      thermo.visible = false
      SoundManager.playTriumphant()

      // Golden burst
      for (let i = 0; i < 25; i++) {
        const p = new Graphics()
        p.circle(0, 0, 3)
        p.fill({ color: remedy.color })
        p.x = bowlX; p.y = bowlY
        container.addChild(p)
        const angle = (i / 25) * Math.PI * 2
        gsap.to(p, { x: bowlX + Math.cos(angle) * 80, y: bowlY + Math.sin(angle) * 80, alpha: 0, duration: 0.8, onComplete: () => { if (p.parent) p.parent.removeChild(p) } })
      }

      // Next stage button
      setTimeout(() => showNextButton(), 1000)
    }
  })
  flameBtn.on('pointerupoutside', () => { isHeating = false })

  // ── Reset button (for too-hot) ──
  function showResetButton() {
    const resetBtn = new Container()
    resetBtn.x = W / 2
    resetBtn.y = H * 0.92
    resetBtn.eventMode = 'static'
    resetBtn.cursor = 'pointer'

    const rBg = new Graphics()
    rBg.roundRect(-70, -20, 140, 40, 20)
    rBg.fill({ color: 0xe53935 })
    resetBtn.addChild(rBg)

    const rText = new Text({
      text: '🔄 Try Again',
      style: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', fill: 0xfffbf0 },
    })
    rText.anchor.set(0.5)
    resetBtn.addChild(rText)

    resetBtn.on('pointerup', () => {
      temperature = 20
      isHeating = false
      container.__tooHotShown = false
      container.__sweetSpotShown = false
      if (container.__successText) { container.removeChild(container.__successText); container.__successText = null }
      liquidColor = remedy.color
      updateLiquid()
      updateThermometer()
      instruction.text = '🔥 Hold the flame to heat! Watch the thermometer!'
      container.removeChild(resetBtn)
    })
    container.addChild(resetBtn)
  }

  // ── Next stage button ──
  function showNextButton() {
    const nextBtn = new Container()
    nextBtn.x = W / 2
    nextBtn.y = H * 0.88
    nextBtn.eventMode = 'static'
    nextBtn.cursor = 'pointer'

    const nBg = new Graphics()
    nBg.roundRect(-110, -25, 220, 50, 25)
    nBg.fill({ color: remedy.color })
    nextBtn.addChild(nBg)

    const nText = new Text({
      text: 'Go to Dosage →',
      style: { fontFamily: 'Nunito', fontSize: 16, fontWeight: '800', fill: 0x1a0a2e },
    })
    nText.anchor.set(0.5)
    nextBtn.addChild(nText)

    nextBtn.on('pointerup', () => {
      SoundManager.play('whoosh')
      dispatch({ type: ACTIONS.SET_STAGE, payload: 'dosage' })
    })

    container.addChild(nextBtn)
    gsap.from(nextBtn, { alpha: 0, y: nextBtn.y + 20, duration: 0.5 })
  }

  // ── Ticker: heating loop ──
  tickerFn = () => {
    if (isHeating && phase === 'heat' && temperature < 100) {
      temperature += 0.15
      updateThermometer()
    }
  }
  app.ticker.add(tickerFn)

  updateLiquid()

  return {
    container,
    onEnter() {},
    onExit() {},
    destroy() {
      if (tickerFn) app.ticker.remove(tickerFn)
      gsap.killTweensOf(container)
    },
  }
}
