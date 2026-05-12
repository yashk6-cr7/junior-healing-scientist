/**
 * DosageScene.js — Stage 4: Correct Dosage (measuring cup)
 * Child pours remedy into measuring cup. Must hit sweet spot (150ml).
 */
import { Container, Graphics, Text } from 'pixi.js'
import gsap from 'gsap'
import { ACTIONS } from '../state/GameContext'
import { SoundManager } from '../engine/SoundManager'
import { getRemedy } from '../data/remedies'

export function createDosageScene(app, state, dispatch) {
  const container = new Container()
  const W = app.renderer?.width || window.innerWidth
  const H = app.renderer?.height || window.innerHeight
  const remedy = getRemedy(state.currentDay)
  const targetMl = remedy?.doseMl || 150

  // ── Background ──
  const bg = new Graphics()
  bg.rect(0, 0, W, H)
  bg.fill({ color: 0x1a0a2e })
  container.addChild(bg)

  // Bedside scene hint
  const bed = new Graphics()
  bed.roundRect(W * 0.6, H * 0.5, W * 0.35, H * 0.4, 12)
  bed.fill({ color: 0x2a1548 })
  container.addChild(bed)

  // ── Arjun waiting ──
  const arjun = new Container()
  arjun.x = W * 0.78
  arjun.y = H * 0.42
  const arjunHead = new Graphics()
  arjunHead.circle(0, 0, 28)
  arjunHead.fill({ color: 0xb89878 })
  arjun.addChild(arjunHead)
  const eyes = new Graphics()
  eyes.circle(-8, -5, 3); eyes.fill({ color: 0x1a0a2e })
  eyes.circle(8, -5, 3); eyes.fill({ color: 0x1a0a2e })
  arjun.addChild(eyes)
  const arjunBody = new Graphics()
  arjunBody.ellipse(0, 40, 20, 30)
  arjunBody.fill({ color: 0x4a3578 })
  arjun.addChild(arjunBody)
  container.addChild(arjun)
  gsap.to(arjun.scale, { x: 1.02, y: 0.98, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  // ── Instruction ──
  const instruction = new Text({
    text: `Pour exactly ${targetMl}ml for Arjun`,
    style: { fontFamily: 'Nunito', fontSize: Math.min(18, W * 0.045), fontWeight: '700', fill: 0xf5c842, align: 'center' },
  })
  instruction.anchor.set(0.5)
  instruction.x = W / 2
  instruction.y = 30
  container.addChild(instruction)

  // ── Measuring cup ──
  const cupX = W * 0.35
  const cupY = H * 0.55
  const cupW = 80
  const cupH = 160

  // Cup outline
  const cup = new Graphics()
  cup.moveTo(cupX - cupW / 2, cupY - cupH / 2)
  cup.lineTo(cupX - cupW / 2 + 8, cupY + cupH / 2)
  cup.lineTo(cupX + cupW / 2 - 8, cupY + cupH / 2)
  cup.lineTo(cupX + cupW / 2, cupY - cupH / 2)
  cup.stroke({ color: 0xbbdefb, width: 2, alpha: 0.8 })
  // Bottom
  cup.moveTo(cupX - cupW / 2 + 8, cupY + cupH / 2)
  cup.lineTo(cupX + cupW / 2 - 8, cupY + cupH / 2)
  cup.stroke({ color: 0xbbdefb, width: 2 })
  container.addChild(cup)

  // Measurement lines
  const marks = [50, 100, 150, 200]
  marks.forEach(ml => {
    const frac = ml / 250
    const my = cupY + cupH / 2 - frac * cupH
    const isTarget = Math.abs(ml - targetMl) < 10
    const line = new Graphics()
    line.moveTo(cupX - cupW / 2 + 10, my)
    line.lineTo(cupX + cupW / 2 - 10, my)
    line.stroke({ color: isTarget ? 0xf5c842 : 0xbbdefb, width: isTarget ? 2 : 1, alpha: isTarget ? 0.8 : 0.3 })
    container.addChild(line)

    const label = new Text({
      text: `${ml}ml`,
      style: { fontFamily: 'Nunito', fontSize: 10, fontWeight: isTarget ? '800' : '600', fill: isTarget ? 0xf5c842 : 0xbbdefb },
    })
    label.x = cupX + cupW / 2 - 4
    label.y = my - 6
    container.addChild(label)
  })

  // ── Liquid fill in cup ──
  let currentMl = 0
  let pouring = false

  const cupLiquid = new Graphics()
  container.addChild(cupLiquid)

  function updateCupLiquid() {
    cupLiquid.clear()
    if (currentMl <= 0) return
    const frac = Math.min(1, currentMl / 250)
    const fillH = frac * cupH
    const topY = cupY + cupH / 2 - fillH
    // Tapered cup shape
    const topW = cupW - 16 + (16 * (1 - frac))
    const botW = cupW - 16
    cupLiquid.moveTo(cupX - botW / 2, cupY + cupH / 2)
    cupLiquid.lineTo(cupX - topW / 2, topY)
    cupLiquid.lineTo(cupX + topW / 2, topY)
    cupLiquid.lineTo(cupX + botW / 2, cupY + cupH / 2)
    cupLiquid.closePath()
    cupLiquid.fill({ color: remedy?.color || 0xf5c842, alpha: 0.8 })
  }

  // ML display
  const mlDisplay = new Text({
    text: '0 ml',
    style: { fontFamily: 'Nunito', fontSize: 20, fontWeight: '900', fill: 0xfffbf0 },
  })
  mlDisplay.anchor.set(0.5)
  mlDisplay.x = cupX
  mlDisplay.y = cupY + cupH / 2 + 25
  container.addChild(mlDisplay)

  // ── Source bowl (draggable) ──
  const srcBowl = new Container()
  srcBowl.x = W * 0.12
  srcBowl.y = H * 0.35
  srcBowl.eventMode = 'static'
  srcBowl.cursor = 'grab'

  const srcBody = new Graphics()
  srcBody.ellipse(0, 0, 30, 18)
  srcBody.fill({ color: remedy?.color || 0xf5c842, alpha: 0.8 })
  srcBody.stroke({ color: 0xa1887f, width: 3 })
  srcBowl.addChild(srcBody)

  const srcLabel = new Text({
    text: 'Remedy',
    style: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', fill: 0xfffbf0 },
  })
  srcLabel.anchor.set(0.5)
  srcLabel.y = 28
  srcBowl.addChild(srcLabel)
  container.addChild(srcBowl)

  const srcStart = { x: srcBowl.x, y: srcBowl.y }

  srcBowl.on('pointerdown', () => { pouring = true; srcBowl.cursor = 'grabbing' })

  container.eventMode = 'static'
  container.on('pointermove', (e) => {
    if (!pouring) return
    srcBowl.x = e.global.x
    srcBowl.y = e.global.y
    // Pour if near cup
    const dist = Math.hypot(e.global.x - cupX, e.global.y - cupY)
    if (dist < cupW * 1.5 && currentMl < 250) {
      currentMl = Math.min(250, currentMl + 0.5)
      updateCupLiquid()
      mlDisplay.text = `${Math.round(currentMl)} ml`
      // Color feedback
      if (currentMl >= targetMl - 10 && currentMl <= targetMl + 10) {
        mlDisplay.style.fill = 0x4caf7d
      } else if (currentMl > 200) {
        mlDisplay.style.fill = 0xe53935
      } else {
        mlDisplay.style.fill = 0xfffbf0
      }
    }
  })

  // ── Feedback bubble ──
  const feedback = new Container()
  feedback.x = arjun.x
  feedback.y = arjun.y - 50
  feedback.visible = false
  const fbBg = new Graphics()
  fbBg.roundRect(-100, -20, 200, 40, 12)
  fbBg.fill({ color: 0x2a1548, alpha: 0.9 })
  feedback.addChild(fbBg)
  const fbText = new Text({
    text: '',
    style: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', fill: 0xfffbf0, align: 'center', wordWrap: true, wordWrapWidth: 180 },
  })
  fbText.anchor.set(0.5)
  feedback.addChild(fbText)
  container.addChild(feedback)

  container.on('pointerup', () => {
    if (!pouring) return
    pouring = false
    srcBowl.cursor = 'grab'
    gsap.to(srcBowl, { x: srcStart.x, y: srcStart.y, duration: 0.3 })

    // Check dosage
    feedback.visible = true
    if (currentMl < 100) {
      fbText.text = "That's not enough to make a difference!"
      gsap.to(feedback, { alpha: 1, duration: 0.3 })
      // Shake cup
      gsap.to(cupLiquid, { x: 4, duration: 0.05, yoyo: true, repeat: 5, onComplete: () => { cupLiquid.x = 0 } })
      SoundManager.playWobble()
      setTimeout(() => { currentMl = 0; updateCupLiquid(); mlDisplay.text = '0 ml'; feedback.visible = false }, 2000)
    } else if (currentMl < targetMl - 10) {
      fbText.text = "Almost there... a little more?"
      feedback.visible = true
      setTimeout(() => { feedback.visible = false }, 1500)
    } else if (currentMl >= targetMl - 10 && currentMl <= targetMl + 10) {
      // PERFECT!
      fbText.text = "Perfect dose! Just right! 🌟"
      SoundManager.playTriumphant()
      // Star burst
      for (let i = 0; i < 15; i++) {
        const s = new Graphics(); s.circle(0, 0, 3); s.fill({ color: 0xf5c842 })
        s.x = cupX; s.y = cupY
        container.addChild(s)
        const a = (i / 15) * Math.PI * 2
        gsap.to(s, { x: cupX + Math.cos(a) * 60, y: cupY + Math.sin(a) * 60, alpha: 0, duration: 0.6, onComplete: () => { if (s.parent) s.parent.removeChild(s) } })
      }
      // Show learning text + next button after delay
      setTimeout(() => showDosageComplete(), 1500)
    } else if (currentMl > 200) {
      fbText.text = "Too much! It could upset my tummy!"
      SoundManager.playWobble()
      setTimeout(() => { currentMl = 0; updateCupLiquid(); mlDisplay.text = '0 ml'; mlDisplay.style.fill = 0xfffbf0; feedback.visible = false }, 2000)
    }
  })

  function showDosageComplete() {
    feedback.visible = false
    const learnText = new Text({
      text: 'Medicines work best at the right amount.\nToo little = no effect. Too much = side effects.\nThat\'s why doctors prescribe exact doses!',
      style: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '600', fill: 0xfffbf0, align: 'center', wordWrap: true, wordWrapWidth: W * 0.7, lineHeight: 18 },
    })
    learnText.anchor.set(0.5)
    learnText.x = W / 2
    learnText.y = H * 0.85
    container.addChild(learnText)
    gsap.from(learnText, { alpha: 0, y: learnText.y + 15, duration: 0.5 })

    const nextBtn = new Container()
    nextBtn.x = W / 2; nextBtn.y = H * 0.95
    nextBtn.eventMode = 'static'; nextBtn.cursor = 'pointer'
    const nBg = new Graphics()
    nBg.roundRect(-100, -22, 200, 44, 22)
    nBg.fill({ color: 0x7c4dff })
    nextBtn.addChild(nBg)
    const nText = new Text({ text: 'Enter Microscope →', style: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', fill: 0xfffbf0 } })
    nText.anchor.set(0.5)
    nextBtn.addChild(nText)
    nextBtn.on('pointerup', () => {
      SoundManager.play('whoosh')
      dispatch({ type: ACTIONS.SET_STAGE, payload: 'microscope' })
    })
    container.addChild(nextBtn)
    gsap.from(nextBtn, { alpha: 0, duration: 0.4, delay: 0.3 })
  }

  return { container, onEnter(){}, onExit(){}, destroy() { gsap.killTweensOf(arjun.scale) } }
}
