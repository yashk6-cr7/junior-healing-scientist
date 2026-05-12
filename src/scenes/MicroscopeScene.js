/**
 * MicroscopeScene.js — Stage 5: Interactive Microscopic World
 * Live PixiJS scene: bloodstream, bacteria, curcumin particles.
 * Child taps bacteria → curcumin swarms → bacteria pops.
 */
import { Container, Graphics, Text } from 'pixi.js'
import gsap from 'gsap'
import { ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'

export function createMicroscopeScene(app, state, dispatch) {
  const container = new Container()
  const W = app.renderer?.width || window.innerWidth
  const H = app.renderer?.height || window.innerHeight

  let tickerFn = null
  let destroyed = 0
  const totalBacteria = 15
  const bacteria = []
  const curcumins = []
  const bloodCells = []
  let targetBacteria = null
  let tempSlider = 75

  // ── Background: bloodstream ──
  const bg = new Graphics()
  bg.rect(0, 0, W, H)
  bg.fill({ color: 0x3a0a0a })
  container.addChild(bg)

  // Pulsing overlay
  const pulse = new Graphics()
  pulse.rect(0, 0, W, H)
  pulse.fill({ color: 0x5a1010, alpha: 0.1 })
  container.addChild(pulse)
  gsap.to(pulse, { alpha: 0, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  // ── Blood cells (background) ──
  for (let i = 0; i < 25; i++) {
    const cell = new Graphics()
    cell.ellipse(0, 0, 12 + Math.random() * 8, 8 + Math.random() * 5)
    cell.fill({ color: 0xcc3333, alpha: 0.4 + Math.random() * 0.3 })
    // Donut center
    cell.circle(0, 0, 4)
    cell.fill({ color: 0x3a0a0a, alpha: 0.3 })
    cell.x = Math.random() * W
    cell.y = Math.random() * H
    cell.vx = 0.3 + Math.random() * 0.5
    container.addChild(cell)
    bloodCells.push(cell)
  }

  // ── Counter ──
  const counterBg = new Graphics()
  counterBg.roundRect(W / 2 - 120, 10, 240, 36, 18)
  counterBg.fill({ color: 0x1a0a2e, alpha: 0.8 })
  container.addChild(counterBg)

  const counterText = new Text({
    text: `Bacteria destroyed: 0 / ${totalBacteria}`,
    style: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', fill: 0xf5c842 },
  })
  counterText.anchor.set(0.5)
  counterText.x = W / 2
  counterText.y = 28
  container.addChild(counterText)

  // Progress bar
  const progBg = new Graphics()
  progBg.roundRect(W / 2 - 100, 50, 200, 8, 4)
  progBg.fill({ color: 0x2a1548 })
  container.addChild(progBg)

  const progFill = new Graphics()
  container.addChild(progFill)

  function updateProgress() {
    progFill.clear()
    const fillW = 200 * (destroyed / totalBacteria)
    progFill.roundRect(W / 2 - 100, 50, fillW, 8, 4)
    progFill.fill({ color: 0x4caf7d })
    counterText.text = `Bacteria destroyed: ${destroyed} / ${totalBacteria}`
  }

  // ── Bacteria ──
  for (let i = 0; i < totalBacteria; i++) {
    const b = new Container()
    b.x = 80 + Math.random() * (W - 160)
    b.y = 100 + Math.random() * (H - 250)
    b.eventMode = 'static'
    b.cursor = 'pointer'
    b.alive = true

    // Spiky body
    const body = new Graphics()
    const r = 14 + Math.random() * 6
    b.radius = r
    // Draw spiky circle
    for (let s = 0; s < 10; s++) {
      const a = (s / 10) * Math.PI * 2
      const innerR = r * 0.7
      const outerR = r + 4 + Math.random() * 4
      if (s === 0) body.moveTo(Math.cos(a) * outerR, Math.sin(a) * outerR)
      const midA = ((s + 0.5) / 10) * Math.PI * 2
      body.lineTo(Math.cos(midA) * innerR, Math.sin(midA) * innerR)
      const nextA = ((s + 1) / 10) * Math.PI * 2
      body.lineTo(Math.cos(nextA) * outerR, Math.sin(nextA) * outerR)
    }
    body.closePath()
    body.fill({ color: 0xe53935 })
    body.stroke({ color: 0xff6659, width: 1 })
    b.addChild(body)

    // Eyes
    const eye = new Graphics()
    eye.circle(-4, -3, 2); eye.fill({ color: 0xffffff })
    eye.circle(4, -3, 2); eye.fill({ color: 0xffffff })
    b.addChild(eye)

    // Drift animation
    b.vx = (Math.random() - 0.5) * 0.4
    b.vy = (Math.random() - 0.5) * 0.3

    // Tap to target
    b.on('pointerup', () => {
      if (!b.alive || targetBacteria === b) return
      targetBacteria = b
      SoundManager.play('ingredient_tap')
      // Highlight
      gsap.to(b.scale, { x: 1.2, y: 1.2, duration: 0.2, yoyo: true, repeat: 1 })
    })

    container.addChild(b)
    bacteria.push(b)
  }

  // ── Curcumin particles ──
  for (let i = 0; i < 12; i++) {
    const c = new Graphics()
    // Hexagon shape
    const sz = 5 + Math.random() * 3
    for (let h = 0; h < 6; h++) {
      const a = (h / 6) * Math.PI * 2 - Math.PI / 6
      if (h === 0) c.moveTo(Math.cos(a) * sz, Math.sin(a) * sz)
      else c.lineTo(Math.cos(a) * sz, Math.sin(a) * sz)
    }
    c.closePath()
    c.fill({ color: 0xf5c842 })
    c.stroke({ color: 0xffd700, width: 1 })
    c.x = -20 - Math.random() * 60
    c.y = 100 + Math.random() * (H - 250)
    c.baseY = c.y
    container.addChild(c)
    curcumins.push(c)
  }

  // ── Temperature slider ──
  const sliderContainer = new Container()
  sliderContainer.x = W / 2
  sliderContainer.y = H - 50
  container.addChild(sliderContainer)

  const sliderBg = new Graphics()
  sliderBg.roundRect(-100, -4, 200, 8, 4)
  sliderBg.fill({ color: 0x2a1548 })
  sliderContainer.addChild(sliderBg)

  const sliderHandle = new Graphics()
  sliderHandle.circle(0, 0, 12)
  sliderHandle.fill({ color: 0xf5c842 })
  sliderHandle.x = 0 // maps to 75°C
  sliderContainer.addChild(sliderHandle)
  sliderHandle.eventMode = 'static'
  sliderHandle.cursor = 'grab'

  const sliderLabel = new Text({
    text: 'Curcumin strength: 75°C',
    style: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', fill: 0xfffbf0 },
  })
  sliderLabel.anchor.set(0.5)
  sliderLabel.y = -20
  sliderContainer.addChild(sliderLabel)

  sliderHandle.on('pointerdown', () => { sliderHandle.dragging = true })
  container.on('pointermove', (e) => {
    if (!sliderHandle.dragging) return
    const localX = e.global.x - sliderContainer.x
    sliderHandle.x = Math.max(-100, Math.min(100, localX))
    tempSlider = 40 + ((sliderHandle.x + 100) / 200) * 45 // 40-85
    sliderLabel.text = `Curcumin strength: ${Math.round(tempSlider)}°C`
  })
  container.on('pointerup', () => { sliderHandle.dragging = false })

  // ── Tooltip system ──
  const tooltip = new Container()
  tooltip.visible = false
  const ttBg = new Graphics()
  ttBg.roundRect(-110, -18, 220, 32, 8)
  ttBg.fill({ color: 0x1a0a2e, alpha: 0.9 })
  tooltip.addChild(ttBg)
  const ttText = new Text({
    text: '',
    style: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '600', fill: 0xfffbf0, align: 'center' },
  })
  ttText.anchor.set(0.5)
  ttText.y = -2
  tooltip.addChild(ttText)
  container.addChild(tooltip)

  // ── Ticker: game loop ──
  tickerFn = () => {
    // Move blood cells
    bloodCells.forEach(c => {
      c.x += c.vx
      if (c.x > W + 20) c.x = -20
    })

    // Move bacteria
    bacteria.forEach(b => {
      if (!b.alive) return
      b.x += b.vx
      b.y += b.vy
      if (b.x < 30 || b.x > W - 30) b.vx *= -1
      if (b.y < 80 || b.y > H - 100) b.vy *= -1
      b.rotation += 0.005
    })

    // Speed factor from temperature
    let speedFactor = 0
    if (tempSlider >= 60 && tempSlider <= 85) {
      speedFactor = 1 - Math.abs(tempSlider - 75) / 15
    } else if (tempSlider < 60) {
      speedFactor = 0.1
    }
    // Above 85: curcumin breaks down
    if (tempSlider > 85) speedFactor = 0

    // Move curcumin particles
    curcumins.forEach(c => {
      if (targetBacteria && targetBacteria.alive) {
        // Swarm toward target
        const dx = targetBacteria.x - c.x
        const dy = targetBacteria.y - c.y
        const dist = Math.hypot(dx, dy)
        const speed = 1.5 * speedFactor
        if (dist > 5) {
          c.x += (dx / dist) * speed
          c.y += (dy / dist) * speed
        }
        // Check collision
        if (dist < targetBacteria.radius + 8) {
          // Damage bacteria (shrink)
          if (targetBacteria.scale.x > 0.1) {
            targetBacteria.scale.x -= 0.008 * speedFactor
            targetBacteria.scale.y -= 0.008 * speedFactor
          } else {
            // POP!
            targetBacteria.alive = false
            targetBacteria.visible = false
            destroyed++
            updateProgress()
            SoundManager.play('bacteria_pop')

            // Golden burst
            for (let i = 0; i < 10; i++) {
              const spark = new Graphics()
              spark.circle(0, 0, 2)
              spark.fill({ color: 0xf5c842 })
              spark.x = targetBacteria.x
              spark.y = targetBacteria.y
              container.addChild(spark)
              const a = (i / 10) * Math.PI * 2
              gsap.to(spark, { x: spark.x + Math.cos(a) * 40, y: spark.y + Math.sin(a) * 40, alpha: 0, duration: 0.5, onComplete: () => { if (spark.parent) spark.parent.removeChild(spark) } })
            }

            targetBacteria = null

            // Check victory
            if (destroyed >= totalBacteria) {
              showVictory()
            }
          }
        }
      } else {
        // Float gently
        c.x += 0.3 * speedFactor
        c.y += Math.sin(Date.now() * 0.002 + curcumins.indexOf(c)) * 0.3
        if (c.x > W + 20) c.x = -20
      }
    })
  }
  app.ticker.add(tickerFn)

  // ── Victory ──
  function showVictory() {
    const victoryOverlay = new Graphics()
    victoryOverlay.rect(0, 0, W, H)
    victoryOverlay.fill({ color: 0xf5c842, alpha: 0.15 })
    container.addChild(victoryOverlay)
    gsap.to(victoryOverlay, { alpha: 0, duration: 2 })

    const victoryText = new Text({
      text: "🌟 Arjun's immune system is winning! 🌟",
      style: { fontFamily: 'Nunito', fontSize: Math.min(22, W * 0.055), fontWeight: '900', fill: 0xf5c842, align: 'center' },
    })
    victoryText.anchor.set(0.5)
    victoryText.x = W / 2; victoryText.y = H / 2
    container.addChild(victoryText)
    gsap.from(victoryText.scale, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' })
    SoundManager.playTriumphant()

    const nextBtn = new Container()
    nextBtn.x = W / 2; nextBtn.y = H / 2 + 60
    nextBtn.eventMode = 'static'; nextBtn.cursor = 'pointer'
    const nBg = new Graphics()
    nBg.roundRect(-100, -22, 200, 44, 22)
    nBg.fill({ color: 0x4caf7d })
    nextBtn.addChild(nBg)
    const nText = new Text({ text: 'Continue →', style: { fontFamily: 'Nunito', fontSize: 15, fontWeight: '800', fill: 0x1a0a2e } })
    nText.anchor.set(0.5)
    nextBtn.addChild(nText)
    nextBtn.on('pointerup', () => {
      dispatch({ type: ACTIONS.SET_STAGE, payload: 'healing' })
    })
    container.addChild(nextBtn)
    gsap.from(nextBtn, { alpha: 0, y: nextBtn.y + 20, duration: 0.4, delay: 0.5 })
  }

  return {
    container,
    onEnter() {},
    onExit() {},
    destroy() {
      if (tickerFn) app.ticker.remove(tickerFn)
      gsap.killTweensOf(pulse)
    },
  }
}
