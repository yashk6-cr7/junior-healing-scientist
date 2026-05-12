/**
 * HealingScene.js — Stage 7: Arjun Heals + Badge Celebration
 * Healing animation, badge award, confetti, day 7 finale.
 */
import { Container, Graphics, Text } from 'pixi.js'
import gsap from 'gsap'
import { ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'
import { getBadgeForDay, getMasterBadge } from '../data/badges'
import { getRemedy } from '../data/remedies'

export function createHealingScene(app, state, dispatch) {
  const container = new Container()
  const W = app.renderer?.width || window.innerWidth
  const H = app.renderer?.height || window.innerHeight
  const badge = getBadgeForDay(state.currentDay)
  const remedy = getRemedy(state.currentDay)
  const isDay7 = state.currentDay >= 7

  const bg = new Graphics()
  bg.rect(0, 0, W, H)
  bg.fill({ color: 0x1a0a2e })
  container.addChild(bg)

  // Warm healing glow
  const glow = new Graphics()
  glow.circle(W / 2, H * 0.4, 200)
  glow.fill({ color: 0x4caf7d, alpha: 0.08 })
  container.addChild(glow)
  gsap.to(glow, { alpha: 0.15, duration: 2, yoyo: true, repeat: -1 })

  // ── Arjun (transitions from sick to healthier) ──
  const arjun = new Container()
  arjun.x = W / 2; arjun.y = H * 0.35

  const prevHealth = Math.max(10, state.arjunHealth - 13)
  const newHealth = state.arjunHealth

  // Start at previous health visuals
  const startFrac = (prevHealth - 10) / 90
  const endFrac = (newHealth - 10) / 90
  const startSkin = lerpColor(0x908080, 0xffcc99, startFrac)
  const endSkin = lerpColor(0x908080, 0xffcc99, endFrac)

  const head = new Graphics(); head.circle(0, -35, 34); head.fill({ color: startSkin })
  const bodyG = new Graphics(); bodyG.ellipse(0, 20, 24, 35); bodyG.fill({ color: 0x4a3578 })
  const eyeL = new Graphics(); eyeL.circle(-10, -40, 4); eyeL.fill({ color: 0x1a0a2e })
  const eyeR = new Graphics(); eyeR.circle(10, -40, 4); eyeR.fill({ color: 0x1a0a2e })
  arjun.addChild(bodyG, head, eyeL, eyeR)

  // Start hunched
  arjun.rotation = 0.04 * (1 - startFrac)
  container.addChild(arjun)

  // ── Healing animation (3-4 seconds) ──
  const healTitle = new Text({
    text: '✨ Healing in Progress...',
    style: { fontFamily: 'Nunito', fontSize: Math.min(24, W * 0.06), fontWeight: '900', fill: 0x4caf7d },
  })
  healTitle.anchor.set(0.5); healTitle.x = W / 2; healTitle.y = H * 0.08
  container.addChild(healTitle)

  // Healing particles flowing into Arjun
  const healingInterval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      const p = new Graphics()
      p.circle(0, 0, 3 + Math.random() * 2)
      p.fill({ color: remedy?.color || 0x4caf7d, alpha: 0.7 })
      const fromLeft = Math.random() > 0.5
      p.x = fromLeft ? -20 : W + 20
      p.y = H * 0.3 + Math.random() * H * 0.15
      container.addChild(p)
      gsap.to(p, {
        x: W / 2 + (Math.random() - 0.5) * 30,
        y: H * 0.35,
        alpha: 0,
        duration: 1.2,
        ease: 'power2.in',
        onComplete: () => { if (p.parent) p.parent.removeChild(p) },
      })
    }
  }, 200)

  // Skin color transition over 3s
  gsap.to({ t: 0 }, {
    t: 1, duration: 3, ease: 'power2.inOut',
    onUpdate: function() {
      const t = this.targets()[0].t
      // Straighten posture
      arjun.rotation = 0.04 * (1 - startFrac) * (1 - t)
    },
  })

  // ── After 3.5 seconds: show badge ──
  setTimeout(() => {
    clearInterval(healingInterval)
    healTitle.text = `Day ${state.currentDay} Complete!`
    SoundManager.playTriumphant()

    // Dispatch state
    dispatch({ type: ACTIONS.COMPLETE_DAY, payload: state.currentDay })
    dispatch({ type: ACTIONS.EARN_BADGE, payload: `day${state.currentDay}` })

    // Confetti
    for (let i = 0; i < 30; i++) {
      const conf = new Graphics()
      const colors = [0xf5c842, 0x4caf7d, 0xff8c42, 0x7c4dff, 0xe53935]
      conf.rect(0, 0, 6 + Math.random() * 4, 3 + Math.random() * 2)
      conf.fill({ color: colors[i % colors.length] })
      conf.x = Math.random() * W; conf.y = -10
      conf.rotation = Math.random() * Math.PI
      container.addChild(conf)
      gsap.to(conf, { y: H + 20, rotation: conf.rotation + Math.PI * 4, duration: 2 + Math.random() * 2, delay: Math.random(), onComplete: () => { if (conf.parent) conf.parent.removeChild(conf) } })
    }

    // Badge drop
    if (badge) {
      const badgeContainer = new Container()
      badgeContainer.x = W / 2; badgeContainer.y = H * 0.58

      const badgeCircle = new Graphics()
      badgeCircle.circle(0, 0, 50)
      badgeCircle.fill({ color: badge.color, alpha: 0.15 })
      badgeCircle.circle(0, 0, 40)
      badgeCircle.stroke({ color: badge.color, width: 3 })
      badgeContainer.addChild(badgeCircle)

      const badgeEmoji = new Text({ text: badge.emoji, style: { fontSize: 36 } })
      badgeEmoji.anchor.set(0.5)
      badgeContainer.addChild(badgeEmoji)

      const badgeName = new Text({
        text: badge.name,
        style: { fontFamily: 'Nunito', fontSize: 18, fontWeight: '800', fill: badge.color },
      })
      badgeName.anchor.set(0.5); badgeName.y = 60
      badgeContainer.addChild(badgeName)

      const badgeDesc = new Text({
        text: badge.description,
        style: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '600', fill: 0xfffbf0, alpha: 0.7, wordWrap: true, wordWrapWidth: 280, align: 'center' },
      })
      badgeDesc.anchor.set(0.5); badgeDesc.y = 82
      badgeContainer.addChild(badgeDesc)

      container.addChild(badgeContainer)
      gsap.from(badgeContainer, { y: -100, duration: 0.8, ease: 'bounce.out' })
      gsap.to(badgeCircle, { alpha: 0.05, duration: 1.5, yoyo: true, repeat: -1 })
    }

    // Next button
    const nextBtn = new Container()
    nextBtn.x = W / 2; nextBtn.y = H * 0.88
    nextBtn.eventMode = 'static'; nextBtn.cursor = 'pointer'
    const nBg = new Graphics()
    nBg.roundRect(-110, -25, 220, 50, 25)
    nBg.fill({ color: 0xf5c842 })
    nextBtn.addChild(nBg)
    const nText = new Text({
      text: isDay7 ? '🏆 See Final Results!' : `Next: Day ${state.currentDay + 1} →`,
      style: { fontFamily: 'Nunito', fontSize: 15, fontWeight: '800', fill: 0x1a0a2e },
    })
    nText.anchor.set(0.5)
    nextBtn.addChild(nText)

    nextBtn.on('pointerup', () => {
      SoundManager.play('whoosh')
      if (isDay7) {
        dispatch({ type: ACTIONS.EARN_BADGE, payload: 'master' })
        dispatch({ type: ACTIONS.SET_STAGE, payload: 'home' })
      } else {
        dispatch({ type: ACTIONS.SET_DAY, payload: state.currentDay + 1 })
      }
    })
    container.addChild(nextBtn)
    gsap.from(nextBtn, { alpha: 0, y: nextBtn.y + 20, duration: 0.4, delay: 0.5 })
  }, 3500)

  return { container, onEnter(){}, onExit(){}, destroy() { gsap.killTweensOf(glow) } }
}

function lerpColor(c1, c2, t) {
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return (r << 16) | (g << 8) | b
}
