/**
 * HomeScene.js — Stage 0: Premium Home Screen
 * Rich illustrated background, detailed Arjun, atmospheric particles, premium UI
 */
import { Container, Graphics, Text } from 'pixi.js'
import gsap from 'gsap'
import { ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'

function createFloatingParticle(W, H) {
  const p = new Graphics()
  const size = 1 + Math.random() * 2.5
  p.circle(0, 0, size)
  p.fill({ color: 0xf5c842, alpha: 0.1 + Math.random() * 0.3 })
  p.x = Math.random() * W
  p.y = Math.random() * H
  gsap.to(p, {
    y: p.y - 40 - Math.random() * 80,
    alpha: 0,
    duration: 3 + Math.random() * 4,
    repeat: -1,
    delay: Math.random() * 3,
    onRepeat: () => { p.x = Math.random() * W; p.y = H * 0.3 + Math.random() * H * 0.5 },
  })
  return p
}

function lerp(c1, c2, t) {
  const r = Math.round(((c1 >> 16) & 0xff) + t * (((c2 >> 16) & 0xff) - ((c1 >> 16) & 0xff)))
  const g = Math.round(((c1 >> 8) & 0xff) + t * (((c2 >> 8) & 0xff) - ((c1 >> 8) & 0xff)))
  const b = Math.round((c1 & 0xff) + t * ((c2 & 0xff) - (c1 & 0xff)))
  return (r << 16) | (g << 8) | b
}

function drawArjun(container, x, y, health, scale = 1) {
  const c = new Container()
  c.x = x; c.y = y; c.scale.set(scale)
  const healthFrac = Math.max(0, Math.min(1, (health - 10) / 90))

  // Shadow
  const shadow = new Graphics()
  shadow.ellipse(0, 72, 35, 8)
  shadow.fill({ color: 0x000000, alpha: 0.2 })
  c.addChild(shadow)

  // Legs
  const legL = new Graphics()
  legL.roundRect(-16, 48, 10, 28, 4)
  legL.fill({ color: 0x3949ab })
  const legR = new Graphics()
  legR.roundRect(6, 48, 10, 28, 4)
  legR.fill({ color: 0x3949ab })
  c.addChild(legL, legR)

  // Shoes
  const shoeL = new Graphics()
  shoeL.roundRect(-18, 72, 14, 6, 3)
  shoeL.fill({ color: 0x5d4037 })
  const shoeR = new Graphics()
  shoeR.roundRect(4, 72, 14, 6, 3)
  shoeR.fill({ color: 0x5d4037 })
  c.addChild(shoeL, shoeR)

  // Body / shirt
  const torso = new Graphics()
  torso.roundRect(-22, 10, 44, 42, 8)
  torso.fill({ color: 0x7c4dff })
  c.addChild(torso)

  // Shirt detail — collar
  const collar = new Graphics()
  collar.moveTo(-10, 10); collar.lineTo(0, 18); collar.lineTo(10, 10)
  collar.stroke({ color: 0x9c7cff, width: 2 })
  c.addChild(collar)

  // Shirt pattern — horizontal stripe
  const stripe = new Graphics()
  stripe.rect(-20, 30, 40, 4)
  stripe.fill({ color: 0x9c7cff, alpha: 0.3 })
  c.addChild(stripe)

  // Arms
  const armL = new Graphics()
  armL.roundRect(-30, 14, 10, 30, 5)
  armL.fill({ color: lerp(0x908080, 0xdeb887, healthFrac) })
  const armR = new Graphics()
  armR.roundRect(20, 14, 10, 30, 5)
  armR.fill({ color: lerp(0x908080, 0xdeb887, healthFrac) })
  c.addChild(armL, armR)

  // Hands
  const handL = new Graphics()
  handL.circle(-25, 46, 5)
  handL.fill({ color: lerp(0x908080, 0xdeb887, healthFrac) })
  const handR = new Graphics()
  handR.circle(25, 46, 5)
  handR.fill({ color: lerp(0x908080, 0xdeb887, healthFrac) })
  c.addChild(handL, handR)

  // Neck
  const neck = new Graphics()
  neck.rect(-6, 2, 12, 12)
  neck.fill({ color: lerp(0x908080, 0xdeb887, healthFrac) })
  c.addChild(neck)

  // Head
  const headColor = lerp(0x908080, 0xdeb887, healthFrac)
  const head = new Graphics()
  head.roundRect(-24, -42, 48, 48, 20)
  head.fill({ color: headColor })
  c.addChild(head)

  // Hair
  const hair = new Graphics()
  hair.roundRect(-26, -48, 52, 22, 14)
  hair.fill({ color: 0x1a1a2e })
  hair.roundRect(-27, -40, 8, 16, 4)
  hair.fill({ color: 0x1a1a2e })
  hair.roundRect(19, -40, 8, 16, 4)
  hair.fill({ color: 0x1a1a2e })
  c.addChild(hair)

  // Eyebrows
  const brows = new Graphics()
  if (healthFrac < 0.3) {
    brows.moveTo(-14, -28); brows.lineTo(-8, -26)
    brows.moveTo(8, -26); brows.lineTo(14, -28)
  } else {
    brows.moveTo(-14, -27); brows.lineTo(-7, -28)
    brows.moveTo(7, -28); brows.lineTo(14, -27)
  }
  brows.stroke({ color: 0x1a1a2e, width: 2 })
  c.addChild(brows)

  // Eyes
  const eyeWhiteL = new Graphics()
  eyeWhiteL.ellipse(-10, -20, 6, healthFrac < 0.3 ? 4 : 5)
  eyeWhiteL.fill({ color: 0xffffff })
  const eyeWhiteR = new Graphics()
  eyeWhiteR.ellipse(10, -20, 6, healthFrac < 0.3 ? 4 : 5)
  eyeWhiteR.fill({ color: 0xffffff })
  c.addChild(eyeWhiteL, eyeWhiteR)

  const pupilL = new Graphics()
  pupilL.circle(-10, -19, 3)
  pupilL.fill({ color: 0x3e2723 })
  pupilL.circle(-9, -20, 1)
  pupilL.fill({ color: 0xffffff })
  const pupilR = new Graphics()
  pupilR.circle(10, -19, 3)
  pupilR.fill({ color: 0x3e2723 })
  pupilR.circle(11, -20, 1)
  pupilR.fill({ color: 0xffffff })
  c.addChild(pupilL, pupilR)

  // Blush
  if (healthFrac > 0.4) {
    const blushL = new Graphics()
    blushL.circle(-16, -12, 5)
    blushL.fill({ color: 0xff8a80, alpha: 0.3 })
    const blushR = new Graphics()
    blushR.circle(16, -12, 5)
    blushR.fill({ color: 0xff8a80, alpha: 0.3 })
    c.addChild(blushL, blushR)
  }

  // Nose
  const nose = new Graphics()
  nose.circle(0, -13, 2.5)
  nose.fill({ color: lerp(0x807070, 0xc9a07a, healthFrac) })
  c.addChild(nose)

  // Mouth
  const mouth = new Graphics()
  if (healthFrac < 0.3) {
    mouth.arc(0, -4, 6, Math.PI + 0.4, -0.4)
    mouth.stroke({ color: 0x5d4037, width: 2 })
  } else if (healthFrac < 0.6) {
    mouth.moveTo(-5, -6); mouth.lineTo(5, -6)
    mouth.stroke({ color: 0x5d4037, width: 2 })
  } else {
    mouth.arc(0, -10, 7, 0.3, Math.PI - 0.3)
    mouth.stroke({ color: 0x5d4037, width: 2.5 })
    mouth.rect(-4, -8, 8, 3)
    mouth.fill({ color: 0xffffff })
  }
  c.addChild(mouth)

  // Sick indicators
  if (healthFrac < 0.3) {
    const therm = new Graphics()
    therm.roundRect(4, -8, 18, 3, 1.5)
    therm.fill({ color: 0xeeeeee })
    therm.circle(22, -6.5, 4)
    therm.fill({ color: 0xe53935 })
    c.addChild(therm)

    const sweat = new Graphics()
    sweat.moveTo(20, -30); sweat.lineTo(22, -24); sweat.lineTo(18, -24)
    sweat.closePath()
    sweat.fill({ color: 0x64b5f6, alpha: 0.7 })
    c.addChild(sweat)
    gsap.to(sweat, { y: 5, alpha: 0, duration: 1.5, repeat: -1, ease: 'power2.in' })
  }

  container.addChild(c)
  return c
}

export function createHomeScene(app, state, dispatch) {
  const container = new Container()
  const W = app.renderer?.width || window.innerWidth
  const H = app.renderer?.height || window.innerHeight

  // ══════════ BACKGROUND LAYERS ══════════
  const sky1 = new Graphics(); sky1.rect(0, 0, W, H); sky1.fill({ color: 0x0d0520 }); container.addChild(sky1)
  const sky2 = new Graphics(); sky2.rect(0, 0, W, H * 0.6); sky2.fill({ color: 0x1a0a2e }); container.addChild(sky2)
  const sky3 = new Graphics(); sky3.rect(0, H * 0.4, W, H * 0.3); sky3.fill({ color: 0x2a1040, alpha: 0.5 }); container.addChild(sky3)

  // Stars
  const stars = new Graphics()
  for (let i = 0; i < 60; i++) {
    const sx = Math.random() * W, sy = Math.random() * H * 0.5
    const sr = 0.5 + Math.random() * 1.5
    stars.circle(sx, sy, sr)
    stars.fill({ color: 0xffffff, alpha: 0.1 + Math.random() * 0.5 })
  }
  container.addChild(stars)
  gsap.to(stars, { alpha: 0.5, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  // Moon
  const moon = new Graphics()
  moon.circle(W * 0.82, H * 0.12, 30)
  moon.fill({ color: 0xfff9c4, alpha: 0.9 })
  moon.circle(W * 0.82, H * 0.12, 40)
  moon.fill({ color: 0xfff9c4, alpha: 0.08 })
  moon.circle(W * 0.82, H * 0.12, 55)
  moon.fill({ color: 0xfff9c4, alpha: 0.03 })
  container.addChild(moon)

  // Distant hills
  const hills = new Graphics()
  hills.moveTo(0, H * 0.55)
  hills.quadraticCurveTo(W * 0.15, H * 0.42, W * 0.3, H * 0.5)
  hills.quadraticCurveTo(W * 0.5, H * 0.38, W * 0.7, H * 0.48)
  hills.quadraticCurveTo(W * 0.85, H * 0.4, W, H * 0.45)
  hills.lineTo(W, H * 0.55); hills.lineTo(0, H * 0.55); hills.closePath()
  hills.fill({ color: 0x1a0830, alpha: 0.7 })
  container.addChild(hills)

  // House silhouette
  const house = new Graphics()
  const hx = W * 0.2, hy = H * 0.35
  house.moveTo(hx - 60, hy + 40); house.lineTo(hx, hy); house.lineTo(hx + 60, hy + 40)
  house.closePath()
  house.fill({ color: 0x2a1548 })
  house.rect(hx - 50, hy + 40, 100, 70)
  house.fill({ color: 0x231040 })
  house.roundRect(hx - 12, hy + 65, 24, 45, 12)
  house.fill({ color: 0x3e2060 })
  house.roundRect(hx - 40, hy + 50, 20, 18, 3)
  house.fill({ color: 0xf5c842, alpha: 0.25 })
  house.roundRect(hx + 20, hy + 50, 20, 18, 3)
  house.fill({ color: 0xf5c842, alpha: 0.2 })
  container.addChild(house)

  // Window glow
  const windowGlow = new Graphics()
  windowGlow.moveTo(hx - 40, hy + 55); windowGlow.lineTo(hx - 80, hy + 90)
  windowGlow.lineTo(hx - 20, hy + 68); windowGlow.closePath()
  windowGlow.fill({ color: 0xf5c842, alpha: 0.04 })
  container.addChild(windowGlow)

  // Ground
  const ground = new Graphics()
  ground.rect(0, H * 0.65, W, H * 0.35)
  ground.fill({ color: 0x1a0830 })
  ground.rect(0, H * 0.65, W, 3)
  ground.fill({ color: 0x2e7d32, alpha: 0.3 })
  container.addChild(ground)

  // Path
  const path = new Graphics()
  path.moveTo(W * 0.5, H); path.quadraticCurveTo(W * 0.35, H * 0.8, hx, hy + 110)
  path.lineTo(hx + 8, hy + 110); path.quadraticCurveTo(W * 0.37, H * 0.8, W * 0.52, H)
  path.closePath()
  path.fill({ color: 0x3e2723, alpha: 0.4 })
  container.addChild(path)

  // Trees
  for (const tx of [W * 0.08, W * 0.92, W * 0.75]) {
    const tree = new Graphics()
    tree.rect(tx - 4, H * 0.5, 8, H * 0.16)
    tree.fill({ color: 0x1a0820 })
    tree.circle(tx, H * 0.46, 25 + Math.random() * 15)
    tree.fill({ color: 0x1a0830, alpha: 0.8 })
    container.addChild(tree)
  }

  // Floating particles
  const particleLayer = new Container()
  for (let i = 0; i < 20; i++) {
    particleLayer.addChild(createFloatingParticle(W, H))
  }
  container.addChild(particleLayer)

  // ══════════ ARJUN ══════════
  const arjun = drawArjun(container, W / 2, H * 0.48, state.arjunHealth, 1.2)
  gsap.to(arjun.scale, { x: 1.22, y: 1.18, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  // Speech bubble
  const bubble = new Container()
  bubble.x = W / 2; bubble.y = H * 0.2
  const bubbleBg = new Graphics()
  bubbleBg.roundRect(-130, -28, 260, 48, 24)
  bubbleBg.fill({ color: 0xfffbf0, alpha: 0.95 })
  bubbleBg.roundRect(-131, -29, 262, 50, 25)
  bubbleBg.stroke({ color: 0xf5c842, width: 1.5, alpha: 0.4 })
  bubbleBg.moveTo(-6, 20); bubbleBg.lineTo(0, 34); bubbleBg.lineTo(6, 20)
  bubbleBg.fill({ color: 0xfffbf0, alpha: 0.95 })
  bubble.addChild(bubbleBg)
  const bubbleText = new Text({
    text: state.arjunHealth < 50 ? '🤒 I need your help!' : '💪 Let\'s keep going!',
    style: { fontFamily: 'Nunito', fontSize: 17, fontWeight: '800', fill: 0x1a0a2e, align: 'center' },
  })
  bubbleText.anchor.set(0.5); bubbleText.y = -4
  bubble.addChild(bubbleText)
  container.addChild(bubble)
  gsap.from(bubble, { alpha: 0, y: bubble.y + 20, duration: 0.6, ease: 'back.out(1.7)', delay: 0.4 })

  // ══════════ TITLE ══════════
  const titleGlow = new Text({
    text: 'Junior Healing Scientist',
    style: { fontFamily: 'Nunito', fontSize: Math.min(32, W * 0.065), fontWeight: '900', fill: 0xff8c42, align: 'center' },
  })
  titleGlow.anchor.set(0.5); titleGlow.x = W / 2 + 1; titleGlow.y = H * 0.055 + 1; titleGlow.alpha = 0.3
  container.addChild(titleGlow)

  const title = new Text({
    text: 'Junior Healing Scientist',
    style: {
      fontFamily: 'Nunito', fontSize: Math.min(32, W * 0.065), fontWeight: '900',
      fill: 0xf5c842, align: 'center',
      dropShadow: { color: 0xff8c42, blur: 12, distance: 0, alpha: 0.5 },
    },
  })
  title.anchor.set(0.5); title.x = W / 2; title.y = H * 0.055
  container.addChild(title)
  gsap.from(title, { alpha: 0, y: title.y - 25, duration: 0.6, ease: 'power3.out' })

  const subtitle = new Text({
    text: '🌿 A 7-Day Healing Journey',
    style: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '600', fill: 0xfffbf0, alpha: 0.5 },
  })
  subtitle.anchor.set(0.5); subtitle.x = W / 2; subtitle.y = H * 0.095
  container.addChild(subtitle)
  gsap.from(subtitle, { alpha: 0, duration: 0.5, delay: 0.3 })

  // ══════════ DAY DOTS ══════════
  const dots = new Container()
  dots.x = W / 2; dots.y = H * 0.89
  for (let i = 1; i <= 7; i++) {
    const completed = state.completedDays.includes(i)
    const current = state.currentDay === i
    const dx = (i - 4) * 32

    if (i < 7) {
      const line = new Graphics()
      line.moveTo(dx + 10, 0); line.lineTo(dx + 22, 0)
      line.stroke({ color: completed ? 0x4caf7d : 0x3a2560, width: 2 })
      dots.addChild(line)
    }

    const dot = new Graphics()
    if (completed) {
      dot.circle(dx, 0, 9); dot.fill({ color: 0x4caf7d })
      const chk = new Text({ text: '✓', style: { fontSize: 10, fontWeight: '900', fill: 0xffffff } })
      chk.anchor.set(0.5); chk.x = dx; chk.y = 0; dots.addChild(dot, chk)
    } else if (current) {
      dot.circle(dx, 0, 10); dot.fill({ color: 0xf5c842, alpha: 0.2 })
      dot.circle(dx, 0, 7); dot.fill({ color: 0xf5c842 })
      const dayNum = new Text({ text: `${i}`, style: { fontSize: 9, fontWeight: '900', fill: 0x1a0a2e } })
      dayNum.anchor.set(0.5); dayNum.x = dx; dots.addChild(dot, dayNum)
      const pulse = new Graphics()
      pulse.circle(dx, 0, 12); pulse.stroke({ color: 0xf5c842, width: 1.5, alpha: 0.4 })
      dots.addChild(pulse)
      gsap.to(pulse.scale, { x: 1.4, y: 1.4, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to(pulse, { alpha: 0.2, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    } else {
      dot.circle(dx, 0, 6); dot.fill({ color: 0x3a2560 })
      const dayNum = new Text({ text: `${i}`, style: { fontSize: 8, fontWeight: '700', fill: 0x665588 } })
      dayNum.anchor.set(0.5); dayNum.x = dx; dots.addChild(dot, dayNum)
    }
  }
  container.addChild(dots)

  // ══════════ BEGIN BUTTON ══════════
  const btnW = Math.min(240, W * 0.55)
  const btnH = 56
  const btn = new Container()
  btn.x = W / 2; btn.y = H * 0.78
  btn.eventMode = 'static'; btn.cursor = 'pointer'

  const btnShadow = new Graphics()
  btnShadow.roundRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, btnH / 2)
  btnShadow.fill({ color: 0x000000, alpha: 0.2 })
  btn.addChild(btnShadow)

  const btnBg = new Graphics()
  btnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, btnH / 2)
  btnBg.fill({ color: 0xf5c842 })
  btnBg.roundRect(-btnW / 2 + 4, -btnH / 2 + 2, btnW - 8, btnH / 2 - 2, btnH / 4)
  btnBg.fill({ color: 0xffdb58, alpha: 0.5 })
  btn.addChild(btnBg)

  const btnGlow = new Graphics()
  btnGlow.roundRect(-btnW / 2 - 6, -btnH / 2 - 6, btnW + 12, btnH + 12, btnH / 2 + 6)
  btnGlow.fill({ color: 0xf5c842, alpha: 0.15 })
  btn.addChildAt(btnGlow, 0)

  const btnLabel = new Text({
    text: state.completedDays.length > 0 ? `Continue Day ${state.currentDay} →` : '✨ Begin Adventure!',
    style: { fontFamily: 'Nunito', fontSize: 18, fontWeight: '900', fill: 0x1a0a2e, letterSpacing: 0.5 },
  })
  btnLabel.anchor.set(0.5)
  btn.addChild(btnLabel)
  container.addChild(btn)

  gsap.from(btn.scale, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)', delay: 0.6 })
  gsap.to(btnGlow, { alpha: 0.05, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  btn.on('pointerdown', () => gsap.to(btn.scale, { x: 0.93, y: 0.93, duration: 0.08 }))
  btn.on('pointerup', () => {
    gsap.to(btn.scale, { x: 1, y: 1, duration: 0.2, ease: 'back.out(2)' })
    SoundManager.play('whoosh')
    const stage = state.currentDay === 1 && state.completedDays.length === 0 ? 'symptoms' : 'discovery'
    dispatch({ type: ACTIONS.SET_STAGE, payload: stage })
  })
  btn.on('pointerupoutside', () => gsap.to(btn.scale, { x: 1, y: 1, duration: 0.15 }))

  // Arjun sparkle on tap
  arjun.eventMode = 'static'; arjun.cursor = 'pointer'
  arjun.on('pointerdown', () => {
    SoundManager.play('ingredient_tap')
    for (let i = 0; i < 12; i++) {
      const spark = new Graphics()
      spark.star(0, 0, 5, 1.5, 4)
      spark.fill({ color: [0xf5c842, 0xff8c42, 0x4caf7d][i % 3] })
      spark.x = arjun.x; spark.y = arjun.y - 50
      container.addChild(spark)
      const a = (i / 12) * Math.PI * 2
      gsap.to(spark, {
        x: spark.x + Math.cos(a) * 70, y: spark.y + Math.sin(a) * 70,
        alpha: 0, rotation: Math.PI, duration: 0.7, ease: 'power2.out',
        onComplete: () => { if (spark.parent) spark.parent.removeChild(spark) },
      })
    }
  })

  return {
    container,
    onEnter() {},
    onExit() {},
    onStateUpdate(s) {
      btnLabel.text = s.completedDays.length > 0 ? `Continue Day ${s.currentDay} →` : '✨ Begin Adventure!'
    },
    destroy() {
      gsap.killTweensOf(arjun.scale)
      gsap.killTweensOf(btnGlow)
      gsap.killTweensOf(stars)
    },
  }
}
