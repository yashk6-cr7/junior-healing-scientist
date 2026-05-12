/**
 * DiscoveryScene.js — Stage 2: Ingredient Discovery
 * The MOST CRITICAL stage. Child discovers correct ingredients through trial & error.
 * NO recipe card shown before completion. Unique wrong reactions per ingredient.
 */
import { Container, Graphics, Text } from 'pixi.js'
import gsap from 'gsap'
import { ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'
import { getRemedy } from '../data/remedies'

// ── Particle burst helper ──
function createBurst(container, x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const p = new Graphics()
    p.circle(0, 0, 2 + Math.random() * 3)
    p.fill({ color })
    p.x = x; p.y = y
    container.addChild(p)
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
    const dist = 40 + Math.random() * 50
    gsap.to(p, {
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      duration: 0.5 + Math.random() * 0.3,
      ease: 'power2.out',
      onComplete: () => { if (p.parent) p.parent.removeChild(p) },
    })
  }
}

// ── Freeze effect ──
function playFreezeEffect(container, W, H) {
  const frost = new Graphics()
  frost.rect(0, 0, W, H)
  frost.fill({ color: 0x90caf9, alpha: 0.15 })
  container.addChild(frost)
  gsap.to(frost, { alpha: 0, duration: 1.5, onComplete: () => { if (frost.parent) frost.parent.removeChild(frost) } })
  for (let i = 0; i < 20; i++) {
    const flake = new Graphics()
    flake.circle(0, 0, 2 + Math.random() * 3)
    flake.fill({ color: 0xe3f2fd })
    flake.x = Math.random() * W
    flake.y = H * 0.3 + Math.random() * H * 0.4
    container.addChild(flake)
    gsap.to(flake, { y: flake.y + 60, alpha: 0, duration: 1 + Math.random(), delay: Math.random() * 0.3, onComplete: () => { if (flake.parent) flake.parent.removeChild(flake) } })
  }
}

// ── Fire sparks effect ──
function playFireEffect(container, W, H) {
  const flash = new Graphics()
  flash.rect(0, 0, W, H)
  flash.fill({ color: 0xff5722, alpha: 0.1 })
  container.addChild(flash)
  gsap.to(flash, { alpha: 0, duration: 0.5, onComplete: () => { if (flash.parent) flash.parent.removeChild(flash) } })
  // Screen shake
  const orig = { x: container.x, y: container.y }
  gsap.to(container, { x: orig.x + 6, duration: 0.05, yoyo: true, repeat: 5, onComplete: () => { container.x = orig.x } })
  for (let i = 0; i < 15; i++) {
    const spark = new Graphics()
    spark.circle(0, 0, 2)
    spark.fill({ color: [0xff5722, 0xff8c42, 0xf5c842][i % 3] })
    spark.x = W / 2 + (Math.random() - 0.5) * 100
    spark.y = H * 0.55
    container.addChild(spark)
    gsap.to(spark, { y: spark.y - 80 - Math.random() * 60, alpha: 0, duration: 0.6 + Math.random() * 0.4, onComplete: () => { if (spark.parent) spark.parent.removeChild(spark) } })
  }
}

// ── Green smoke effect ──
function playSmokeEffect(container, W, H) {
  for (let i = 0; i < 12; i++) {
    const smoke = new Graphics()
    smoke.circle(0, 0, 8 + Math.random() * 12)
    smoke.fill({ color: 0x558b2f, alpha: 0.3 })
    smoke.x = W / 2 + (Math.random() - 0.5) * 80
    smoke.y = H * 0.5
    container.addChild(smoke)
    gsap.to(smoke, { y: smoke.y - 60 - Math.random() * 40, alpha: 0, scaleX: 2, scaleY: 2, duration: 1.2 + Math.random() * 0.5, onComplete: () => { if (smoke.parent) smoke.parent.removeChild(smoke) } })
  }
}

// ── Fizz effect ──
function playFizzEffect(container, W, H) {
  for (let i = 0; i < 18; i++) {
    const bub = new Graphics()
    bub.circle(0, 0, 2 + Math.random() * 3)
    bub.fill({ color: 0xfff176, alpha: 0.6 })
    bub.x = W / 2 + (Math.random() - 0.5) * 60
    bub.y = H * 0.55
    container.addChild(bub)
    gsap.to(bub, { y: bub.y - 40 - Math.random() * 80, alpha: 0, duration: 0.8 + Math.random() * 0.6, delay: Math.random() * 0.4, onComplete: () => { if (bub.parent) bub.parent.removeChild(bub) } })
  }
}

const EFFECT_MAP = {
  freeze: playFreezeEffect,
  fireSparks: playFireEffect,
  greenSmoke: playSmokeEffect,
  fizz: playFizzEffect,
  oilSlick: playSmokeEffect,
  sweetOverload: playFizzEffect,
  crystallize: playFizzEffect,
  grease: playSmokeEffect,
  heavy: playSmokeEffect,
  melt: playSmokeEffect,
  blow: playFizzEffect,
  sparkle: playFizzEffect,
  nothing: () => {},
}

export function createDiscoveryScene(app, state, dispatch) {
  const container = new Container()
  const W = app.renderer?.width || window.innerWidth
  const H = app.renderer?.height || window.innerHeight
  const remedy = getRemedy(state.currentDay)
  if (!remedy) { container.addChild(new Graphics().rect(0,0,W,H).fill({color:0x1a0a2e})); return { container, onEnter(){}, onExit(){}, destroy(){} } }

  const found = new Set()
  const totalCorrect = remedy.correct.length
  let feedbackActive = false

  // ── Background ──
  const bg = new Graphics()
  bg.rect(0, 0, W, H)
  bg.fill({ color: 0x1a0a2e })
  container.addChild(bg)

  // Ambient glow
  const glow = new Graphics()
  glow.circle(W / 2, H * 0.3, 200)
  glow.fill({ color: remedy.color, alpha: 0.05 })
  container.addChild(glow)

  // ── Hint area (top) ──
  const hintBox = new Container()
  hintBox.x = W / 2
  hintBox.y = 60

  // Glowing orb
  const orb = new Graphics()
  orb.circle(0, 0, 18)
  orb.fill({ color: remedy.color, alpha: 0.7 })
  hintBox.addChild(orb)
  gsap.to(orb, { alpha: 0.3, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  // Orb outer glow
  const orbGlow = new Graphics()
  orbGlow.circle(0, 0, 28)
  orbGlow.fill({ color: remedy.color, alpha: 0.15 })
  hintBox.addChildAt(orbGlow, 0)
  gsap.to(orbGlow.scale, { x: 1.3, y: 1.3, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  // Riddle text
  const riddle = new Text({
    text: remedy.hint.riddle,
    style: { fontFamily: 'Nunito', fontSize: Math.min(16, W * 0.04), fontWeight: '600', fill: 0xfffbf0, align: 'center', wordWrap: true, wordWrapWidth: W * 0.8 },
  })
  riddle.anchor.set(0.5)
  riddle.y = 35
  hintBox.addChild(riddle)

  // Temperature hint
  const tempIcon = new Text({
    text: remedy.hint.tempIcon === 'hot' ? '🔥' : remedy.hint.tempIcon === 'warm' ? '☕' : '🧊',
    style: { fontSize: 20 },
  })
  tempIcon.anchor.set(0.5)
  tempIcon.x = -100
  hintBox.addChild(tempIcon)

  // Body area hint
  const bodyHint = new Text({
    text: `🫁 ${remedy.hint.bodyArea}`,
    style: { fontFamily: 'Nunito', fontSize: 12, fill: 0xfffbf0, alpha: 0.6 },
  })
  bodyHint.anchor.set(0.5)
  bodyHint.y = 56
  hintBox.addChild(bodyHint)

  container.addChild(hintBox)
  gsap.from(hintBox, { alpha: 0, y: hintBox.y - 20, duration: 0.5 })

  // ── Progress counter ──
  const progressText = new Text({
    text: `🧪 Found: 0 / ${totalCorrect}`,
    style: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', fill: 0x4caf7d },
  })
  progressText.anchor.set(0.5)
  progressText.x = W / 2
  progressText.y = H - 30
  container.addChild(progressText)

  // ── Feedback area (Arjun speech) ──
  const feedbackContainer = new Container()
  feedbackContainer.visible = false
  feedbackContainer.x = W / 2
  feedbackContainer.y = H * 0.48

  const feedbackBubbleBg = new Graphics()
  feedbackBubbleBg.roundRect(-160, -35, 320, 65, 16)
  feedbackBubbleBg.fill({ color: 0x2a1548, alpha: 0.95 })
  feedbackBubbleBg.stroke({ color: 0xf5c842, width: 1, alpha: 0.3 })
  feedbackContainer.addChild(feedbackBubbleBg)

  const feedbackText = new Text({
    text: '',
    style: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '600', fill: 0xfffbf0, wordWrap: true, wordWrapWidth: 290, align: 'center' },
  })
  feedbackText.anchor.set(0.5)
  feedbackContainer.addChild(feedbackText)
  container.addChild(feedbackContainer)

  // ── Build ingredient grid ──
  const allIngredients = [...remedy.correct, ...remedy.distractors]
  // Shuffle
  for (let i = allIngredients.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIngredients[i], allIngredients[j]] = [allIngredients[j], allIngredients[i]]
  }

  const cols = W < 400 ? 2 : W < 600 ? 3 : 5
  const rows = Math.ceil(allIngredients.length / cols)
  const cardW = Math.min(100, (W - 40 - (cols - 1) * 10) / cols)
  const cardH = cardW * 1.15
  const gridW = cols * cardW + (cols - 1) * 10
  const startX = (W - gridW) / 2
  const startY = H * 0.18

  const cardContainers = []

  allIngredients.forEach((ing, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    const cx = startX + col * (cardW + 10) + cardW / 2
    const cy = startY + row * (cardH + 10) + cardH / 2
    const isCorrect = remedy.correct.some(c => c.id === ing.id)

    const card = new Container()
    card.x = cx
    card.y = cy
    card.eventMode = 'static'
    card.cursor = 'pointer'

    // Card background
    const cardBg = new Graphics()
    cardBg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)
    cardBg.fill({ color: 0x2a1548 })
    cardBg.stroke({ color: ing.color, width: 2, alpha: 0.4 })
    card.addChild(cardBg)

    // Ingredient color swatch
    const swatch = new Graphics()
    swatch.circle(0, -cardH * 0.12, cardW * 0.22)
    swatch.fill({ color: ing.color })
    card.addChild(swatch)

    // Name
    const nameText = new Text({
      text: ing.name,
      style: { fontFamily: 'Nunito', fontSize: Math.min(11, cardW * 0.13), fontWeight: '700', fill: 0xfffbf0, align: 'center', wordWrap: true, wordWrapWidth: cardW - 8 },
    })
    nameText.anchor.set(0.5)
    nameText.y = cardH * 0.25
    card.addChild(nameText)

    // Checkmark (hidden)
    const check = new Text({
      text: '✅',
      style: { fontSize: 22 },
    })
    check.anchor.set(0.5)
    check.y = -cardH * 0.12
    check.visible = false
    card.addChild(check)

    // Entrance animation
    gsap.from(card.scale, { x: 0, y: 0, duration: 0.3, delay: 0.1 + idx * 0.04, ease: 'back.out(1.7)' })

    // ── Tap handler ──
    card.on('pointerdown', () => {
      if (feedbackActive || found.has(ing.id)) return
      gsap.to(card.scale, { x: 0.9, y: 0.9, duration: 0.08 })
    })

    card.on('pointerup', () => {
      if (feedbackActive || found.has(ing.id)) return
      gsap.to(card.scale, { x: 1, y: 1, duration: 0.15, ease: 'back.out(2)' })

      if (isCorrect) {
        // ── CORRECT ──
        SoundManager.playChime()
        found.add(ing.id)
        check.visible = true
        swatch.visible = false

        // Golden burst
        createBurst(container, card.x, card.y, remedy.color, 15)

        // Green glow on card
        cardBg.clear()
        cardBg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)
        cardBg.fill({ color: 0x1b5e20, alpha: 0.4 })
        cardBg.stroke({ color: 0x4caf7d, width: 2 })

        // Update progress
        progressText.text = `🧪 Found: ${found.size} / ${totalCorrect}`

        // Show brief positive feedback
        feedbackActive = true
        feedbackContainer.visible = true
        feedbackText.text = `Yes! ${ing.name} is correct! 🌟`
        gsap.fromTo(feedbackContainer, { alpha: 0, y: H * 0.48 + 10 }, { alpha: 1, y: H * 0.48, duration: 0.3 })
        setTimeout(() => {
          feedbackContainer.visible = false
          feedbackActive = false

          // Check if ALL correct found
          if (found.size >= totalCorrect) {
            showVictory()
          }
        }, 1200)

      } else {
        // ── WRONG — unique reaction ──
        SoundManager.playWobble()
        feedbackActive = true
        const reaction = remedy.wrongReactions[ing.id]

        // Play visual effect
        const effectFn = EFFECT_MAP[reaction?.animation] || EFFECT_MAP.nothing
        effectFn(container, W, H)

        // Red flash on card
        gsap.to(card, { x: card.x + 4, duration: 0.05, yoyo: true, repeat: 3, onComplete: () => { card.x = cx } })
        cardBg.clear()
        cardBg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)
        cardBg.fill({ color: 0x3e1111 })
        cardBg.stroke({ color: 0xe53935, width: 2 })

        // Show speech
        feedbackContainer.visible = true
        feedbackText.text = reaction?.speech || "That's not right..."
        gsap.fromTo(feedbackContainer, { alpha: 0, y: H * 0.48 + 10 }, { alpha: 1, y: H * 0.48, duration: 0.3 })

        setTimeout(() => {
          // Reset card color
          cardBg.clear()
          cardBg.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 12)
          cardBg.fill({ color: 0x2a1548 })
          cardBg.stroke({ color: ing.color, width: 2, alpha: 0.4 })
          feedbackContainer.visible = false
          feedbackActive = false
        }, 2200)
      }
    })

    card.on('pointerupoutside', () => {
      gsap.to(card.scale, { x: 1, y: 1, duration: 0.1 })
    })

    container.addChild(card)
    cardContainers.push(card)
  })

  // ── Victory: All correct found ──
  function showVictory() {
    SoundManager.playTriumphant()

    // Golden full-screen burst
    const burst = new Graphics()
    burst.rect(0, 0, W, H)
    burst.fill({ color: remedy.color, alpha: 0.2 })
    container.addChild(burst)
    gsap.to(burst, { alpha: 0, duration: 2, onComplete: () => { if (burst.parent) burst.parent.removeChild(burst) } })

    // Massive particle explosion
    createBurst(container, W / 2, H / 2, remedy.color, 40)

    // Victory text
    const victoryText = new Text({
      text: '🌟 You found the recipe! 🌟',
      style: { fontFamily: 'Nunito', fontSize: Math.min(28, W * 0.07), fontWeight: '900', fill: 0xf5c842, align: 'center' },
    })
    victoryText.anchor.set(0.5)
    victoryText.x = W / 2
    victoryText.y = H * 0.42
    container.addChild(victoryText)
    gsap.from(victoryText.scale, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })

    // Recipe card (REWARD)
    const recipeCard = new Container()
    recipeCard.x = W / 2
    recipeCard.y = H * 0.62

    const recipeBg = new Graphics()
    const rcW = Math.min(320, W * 0.85)
    recipeBg.roundRect(-rcW / 2, -60, rcW, 120, 16)
    recipeBg.fill({ color: 0x2a1548, alpha: 0.95 })
    recipeBg.stroke({ color: remedy.color, width: 2, alpha: 0.6 })
    recipeCard.addChild(recipeBg)

    const recipeTitle = new Text({
      text: `${remedy.name} — ${remedy.nameHindi}`,
      style: { fontFamily: 'Nunito', fontSize: 18, fontWeight: '800', fill: remedy.color },
    })
    recipeTitle.anchor.set(0.5)
    recipeTitle.y = -40
    recipeCard.addChild(recipeTitle)

    const ingredientList = remedy.correct.map(c => `• ${c.name}`).join('\n')
    const recipeBody = new Text({
      text: ingredientList,
      style: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '600', fill: 0xfffbf0, align: 'center', lineHeight: 20 },
    })
    recipeBody.anchor.set(0.5)
    recipeBody.y = 10
    recipeCard.addChild(recipeBody)

    container.addChild(recipeCard)
    gsap.from(recipeCard, { alpha: 0, y: recipeCard.y + 30, duration: 0.5, delay: 0.8 })

    // "Now let's prepare it!" button
    const prepBtn = new Container()
    prepBtn.x = W / 2
    prepBtn.y = H * 0.85
    prepBtn.eventMode = 'static'
    prepBtn.cursor = 'pointer'

    const prepBg = new Graphics()
    prepBg.roundRect(-120, -25, 240, 50, 25)
    prepBg.fill({ color: remedy.color })
    prepBtn.addChild(prepBg)

    const prepLabel = new Text({
      text: "Now let's prepare it! →",
      style: { fontFamily: 'Nunito', fontSize: 16, fontWeight: '800', fill: 0x1a0a2e },
    })
    prepLabel.anchor.set(0.5)
    prepBtn.addChild(prepLabel)

    prepBtn.on('pointerup', () => {
      SoundManager.play('whoosh')
      dispatch({ type: ACTIONS.DISCOVER_REMEDY, payload: { day: state.currentDay, ingredients: [...found] } })
      dispatch({ type: ACTIONS.SET_STAGE, payload: 'preparation' })
    })

    container.addChild(prepBtn)
    gsap.from(prepBtn, { alpha: 0, y: prepBtn.y + 20, duration: 0.4, delay: 1.3 })
  }

  return {
    container,
    onEnter() {},
    onExit() {},
    destroy() {
      gsap.killTweensOf(orb)
      gsap.killTweensOf(orbGlow.scale)
    },
  }
}
