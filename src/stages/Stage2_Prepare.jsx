/**
 * Stage2_Prepare.jsx — Remedy Preparation (matches PixiJS layout)
 * Layout: Bowl (left) + Ingredient Shelf (right)
 * Phases: select → microscope → done
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'
import { getRemedyByDay, getAllIngredients } from '../data/remedies'

// Science descriptions per day for microscope phase
const MICRO_TEXT = {
  1: 'Watch Curcumin (gold) spread through the milk molecules, blocking the NF-kB germ alarm! ⚡',
  2: 'Eugenol from Tulsi leaves spirals outward, coating throat cells with a protective shield! 🛡️',
  3: 'Gingerol (orange) and honey (gold) home in on bacteria and dissolve their cell walls! 💥',
  4: 'Hot steam molecules rise upward, sweeping mucus particles out of nasal passages! 💨',
  5: 'Quercetin, allicin, and beta-carotene swirl together forming an immunity vortex! 🌪️',
  6: 'Piperine (dark) attaches to curcumin (gold), making it 2000% more absorbable! ✨',
  7: 'All six healing compounds converge, forming the ultimate Kadha healing stream! 👑',
}

export default function Stage2_Prepare() {
  const { state, dispatch } = useGameState()
  const remedy = getRemedyByDay(state.currentDay)

  const allItems = useMemo(() => {
    const items = getAllIngredients(state.currentDay)
    return [...items].sort(() => Math.random() - 0.5)
  }, [state.currentDay])

  const [addedIngredients, setAddedIngredients] = useState([])
  const [wrongItem, setWrongItem] = useState(null)
  const [wrongMsg, setWrongMsg] = useState('')
  const [phase, setPhase] = useState('select') // select → stir → heat → microscope → done
  const [bowlItems, setBowlItems] = useState([])
  const [stirProgress, setStirProgress] = useState(0)
  const [temperature, setTemperature] = useState(25)
  const [isHeating, setIsHeating] = useState(false)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const heatInterval = useRef(null)

  const isAdded = useCallback((id) => addedIngredients.includes(id), [addedIngredients])

  const isComplete = useMemo(() => {
    if (!remedy) return false
    return remedy.correctSet.every(id => addedIngredients.includes(id))
  }, [addedIngredients, remedy])

  // Handle ingredient tap
  function handleIngredientTap(item) {
    if (isAdded(item.id) || phase !== 'select') return
    const isCorrect = remedy.correctSet.includes(item.id)

    if (isCorrect) {
      setAddedIngredients(prev => [...prev, item.id])
      setBowlItems(prev => [...prev, { id: item.id, emoji: item.emoji, color: item.color }])
    } else {
      // Wrong — show bounce animation in bowl
      setWrongItem(item)
      setWrongMsg(`That ingredient didn't mix well! Try another 💡`)
      setTimeout(() => { setWrongItem(null); setWrongMsg('') }, 2000)
    }
  }

  // Reset bowl
  function handleReset() {
    setAddedIngredients([])
    setBowlItems([])
    setWrongItem(null)
    setWrongMsg('')
  }

  // Watch for completion → stir
  useEffect(() => {
    if (isComplete && phase === 'select') {
      setTimeout(() => setPhase('stir'), 1000)
    }
  }, [isComplete, phase])

  // Stir complete → heat
  useEffect(() => {
    if (phase === 'stir' && stirProgress >= 100) {
      setTimeout(() => setPhase('heat'), 500)
    }
  }, [phase, stirProgress])

  // Heat complete → microscope
  useEffect(() => {
    if (phase === 'heat' && temperature >= 85) {
      setTimeout(() => setPhase('microscope'), 800)
    }
  }, [phase, temperature])

  // Heating interval
  useEffect(() => {
    if (isHeating && phase === 'heat') {
      heatInterval.current = setInterval(() => {
        setTemperature(t => Math.min(90, t + 1.2))
      }, 80)
    } else {
      if (heatInterval.current) clearInterval(heatInterval.current)
    }
    return () => { if (heatInterval.current) clearInterval(heatInterval.current) }
  }, [isHeating, phase])

  const tempLabel = temperature < 40 ? '❄️ Cold' : temperature < 65 ? '🌡️ Warm' : temperature < 85 ? '🔥 Hot' : '✨ Perfect!'

  // ─── Microscope Canvas ───
  useEffect(() => {
    if (phase !== 'microscope' || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    // Curcumin cluster (gold) — starts center, diffuses out
    const curcumins = Array.from({ length: 80 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 20
      return {
        x: W / 2 + Math.cos(angle) * dist,
        y: H / 2 + Math.sin(angle) * dist,
        tx: W * 0.1 + Math.random() * W * 0.8,
        ty: H * 0.1 + Math.random() * H * 0.8,
        r: 2 + Math.random() * 3,
        glow: 0.5 + Math.random() * 0.5,
      }
    })

    // Milk molecules (white/cream)
    const milks = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 1.5 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      alpha: 0.3 + Math.random() * 0.5,
    }))

    let frame = 0
    const startTime = Date.now()

    function draw() {
      frame++
      const elapsed = (Date.now() - startTime) / 1000

      // Background
      ctx.fillStyle = '#0D1117'
      ctx.fillRect(0, 0, W, H)

      // Subtle vignette
      const vignette = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.7)
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(0,0,0,0.4)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)

      // Milk molecules — ambient drift
      milks.forEach(m => {
        m.x += m.vx + Math.sin(frame * 0.01 + m.y * 0.01) * 0.1
        m.y += m.vy + Math.cos(frame * 0.01 + m.x * 0.01) * 0.1
        if (m.x < 0) m.x = W; if (m.x > W) m.x = 0
        if (m.y < 0) m.y = H; if (m.y > H) m.y = 0

        // Glow
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 3)
        grad.addColorStop(0, `rgba(255,255,255,${m.alpha * 0.6})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(230,230,230,${m.alpha})`
        ctx.fill()
      })

      // Curcumin particles — diffuse from center after 2s
      const diffuseT = Math.min(1, Math.max(0, (elapsed - 1.5) / 3))
      curcumins.forEach(p => {
        p.x += (p.tx - p.x) * diffuseT * 0.012
        p.y += (p.ty - p.y) * diffuseT * 0.012
        p.glow = 0.5 + Math.sin(frame * 0.03 + p.x * 0.02) * 0.3

        // Big glow halo
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5)
        grad.addColorStop(0, `rgba(255,215,0,${0.7 * p.glow})`)
        grad.addColorStop(0.5, `rgba(255,180,0,${0.2 * p.glow})`)
        grad.addColorStop(1, 'rgba(255,215,0,0)')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,215,0,${0.9})`
        ctx.fill()
      })

      // Central curcumin cluster glow (fades as it diffuses)
      if (diffuseT < 0.8) {
        const centerGlow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 60 - diffuseT * 30)
        centerGlow.addColorStop(0, `rgba(255,255,0,${0.4 * (1 - diffuseT)})`)
        centerGlow.addColorStop(1, 'rgba(255,215,0,0)')
        ctx.beginPath()
        ctx.arc(W/2, H/2, 60, 0, Math.PI * 2)
        ctx.fillStyle = centerGlow
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [phase])

  function handleContinueToHeal() {
    dispatch({ type: ACTIONS.SET_STAGE, payload: 3 })
  }

  if (!remedy) return null

  // Step indicator component
  const stepNum = phase === 'select' ? 1 : phase === 'stir' ? 2 : phase === 'heat' ? 3 : 4
  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
      {[{ n: 1, label: 'Find' }, { n: 2, label: 'Stir' }, { n: 3, label: 'Heat' }].map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700,
            background: stepNum > s.n ? '#00C853' : stepNum === s.n ? remedy.color : 'rgba(255,255,255,0.1)',
            color: stepNum >= s.n ? 'white' : 'rgba(255,255,255,0.4)',
            border: `2px solid ${stepNum > s.n ? '#00C853' : stepNum === s.n ? remedy.color : 'rgba(255,255,255,0.15)'}`,
          }}>
            {stepNum > s.n ? '✓' : s.n}
          </div>
          <span style={{ fontSize: '0.75rem', color: stepNum >= s.n ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.3)' }}>{s.label}</span>
          {i < 2 && <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 4px' }}>—</span>}
        </div>
      ))}
    </div>
  )

  // ═══ STIR PHASE ═══
  if (phase === 'stir') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: '72px 16px 100px', gap: '16px' }}>
        <h2 className="font-heading" style={{ color: remedy.color, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
          🧪 Prepare the Remedy
        </h2>
        <p className="game-text" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Find the right ingredients, mix them, and heat to the perfect temperature!
        </p>
        <StepIndicator />
        <p style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>Stir the mixture! Tap rapidly 🥄</p>
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%' }}>
            <circle cx="80" cy="80" r="65" fill={`${remedy.color}22`} stroke={`${remedy.color}66`} strokeWidth="3" />
            <motion.line x1="80" y1="80" x2="80" y2="20"
              animate={{ rotate: stirProgress * 3.6 }}
              style={{ originX: '80px', originY: '80px' }}
              stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: remedy.color }}>{Math.round(stirProgress)}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {bowlItems.map(item => <span key={item.id} style={{ fontSize: '1.5rem' }}>{item.emoji}</span>)}
        </div>
        <button className="btn-primary" onClick={() => setStirProgress(p => Math.min(100, p + 6))}
          style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
          🥄 Stir!
        </button>
      </div>
    )
  }

  // ═══ HEAT PHASE — Thermometer ═══
  if (phase === 'heat') {
    const fillH = Math.max(0, ((temperature - 20) / 70) * 200)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: '72px 16px 100px', gap: '12px' }}>
        <h2 className="font-heading" style={{ color: remedy.color, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
          🧪 Prepare the Remedy
        </h2>
        <p className="game-text" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Find the right ingredients, mix them, and heat to the perfect temperature!
        </p>
        <StepIndicator />
        <p style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>Hold the flame to heat! Find the sweet spot 🔥</p>
        <p style={{ color: remedy.color, fontSize: '2rem', fontWeight: 800 }}>{Math.round(temperature)}°C</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{tempLabel}</p>

        {/* Thermometer */}
        <div style={{ position: 'relative', width: '50px', height: '220px' }}>
          {/* Tube */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            width: '28px', height: '200px', bottom: '20px',
            borderRadius: '14px', background: 'rgba(255,255,255,0.08)',
            border: '2px solid rgba(255,255,255,0.15)', overflow: 'hidden',
          }}>
            {/* Fill */}
            <div style={{
              position: 'absolute', bottom: 0, width: '100%', height: `${fillH}px`,
              background: temperature < 50 ? '#40C4FF' : temperature < 75 ? '#FFB74D' : '#FF5722',
              transition: 'height 0.1s, background 0.3s',
              borderRadius: '0 0 12px 12px',
            }} />
            {/* Tick marks */}
            {[25, 50, 75].map(t => (
              <div key={t} style={{
                position: 'absolute', bottom: `${((t - 20) / 70) * 200}px`, width: '100%', height: '1px',
                borderTop: '1px dashed rgba(255,255,255,0.2)',
              }} />
            ))}
          </div>
          {/* Bulb */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '36px', height: '36px', borderRadius: '50%',
            background: temperature < 50 ? '#40C4FF' : temperature < 75 ? '#FFB74D' : '#FF5722',
            transition: 'background 0.3s',
          }} />
        </div>

        {/* Ingredient icons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {bowlItems.map(item => <span key={item.id} style={{ fontSize: '1.5rem' }}>{item.emoji}</span>)}
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Hold the flame to heat!</p>

        {/* Flame button */}
        <motion.button
          onMouseDown={() => setIsHeating(true)} onMouseUp={() => setIsHeating(false)} onMouseLeave={() => setIsHeating(false)}
          onTouchStart={() => setIsHeating(true)} onTouchEnd={() => setIsHeating(false)}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '72px', height: '72px', borderRadius: '50%', fontSize: '2rem',
            background: isHeating ? 'rgba(255,109,0,0.4)' : 'rgba(255,109,0,0.15)',
            border: `3px solid ${isHeating ? '#FF6D00' : 'rgba(255,109,0,0.3)'}`,
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: isHeating ? '0 0 30px rgba(255,109,0,0.5)' : 'none',
          }}>
          🔥
        </motion.button>
      </div>
    )
  }

  // ═══ MICROSCOPE PHASE ═══
  if (phase === 'microscope') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100dvh', padding: '24px', gap: '16px',
      }}>
        <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="font-heading"
          style={{ color: '#f5c842', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', textAlign: 'center' }}>
          🔬 Microscopic World
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '500px', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {MICRO_TEXT[state.currentDay] || 'Watch the science happen at a molecular level!'}
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            width: '100%', maxWidth: '600px', aspectRatio: '3/2',
            borderRadius: '16px', overflow: 'hidden',
            border: `2px solid ${remedy.color}44`,
            boxShadow: `0 0 40px ${remedy.color}22`,
          }}>
          <canvas ref={canvasRef} width={600} height={400}
            style={{ width: '100%', height: '100%', display: 'block' }} />
        </motion.div>

        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }} className="btn-primary" onClick={handleContinueToHeal}
          style={{ padding: '14px 36px', fontSize: '1.1rem', marginTop: '8px' }}>
          Continue to Healing →
        </motion.button>
      </div>
    )
  }

  // ═══ DONE PHASE ═══
  if (phase === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '24px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉✨🎊</p>
          <h3 className="font-heading" style={{ color: remedy.color }}>{remedy.name} is Ready!</h3>
          <button className="btn-primary" onClick={handleContinueToHeal} style={{ marginTop: '24px' }}>
            Continue to Healing →
          </button>
        </motion.div>
      </div>
    )
  }

  // ═══ SELECT PHASE — Bowl (left) + Shelf (right) ═══
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100dvh', padding: '72px 16px 100px', gap: '16px',
    }}>
      {/* Title */}
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="font-heading"
        style={{ color: remedy.color, textAlign: 'center', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
        {remedy.icon} Prepare {remedy.name}
      </motion.h2>
      <p className="game-text" style={{ color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
        Try adding ingredients — see what works! ({addedIngredients.length}/{remedy.correctSet.length})
      </p>

      {/* Main layout: bowl left, shelf right */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'flex-start', gap: '32px', width: '100%', maxWidth: '800px',
      }}>
        {/* ── Bowl ── */}
        <div style={{ flex: '1 1 280px', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px', aspectRatio: '1.2' }}>
            <svg viewBox="0 0 300 250" style={{ width: '100%', height: '100%' }}>
              {/* Shadow */}
              <ellipse cx="150" cy="230" rx="100" ry="15" fill="rgba(0,0,0,0.3)" />

              {/* Bowl body */}
              <path d="M 40 100 Q 40 220 150 220 Q 260 220 260 100"
                fill="rgba(40,60,90,0.5)" stroke="#607D8B" strokeWidth="3" />

              {/* Liquid fill */}
              {bowlItems.length > 0 && (
                <path d={`M 50 ${180 - bowlItems.length * 15} Q 50 210 150 210 Q 250 210 250 ${180 - bowlItems.length * 15}`}
                  fill={`${remedy.color}44`} />
              )}

              {/* Bowl rim */}
              <ellipse cx="150" cy="100" rx="112" ry="22"
                fill="rgba(40,55,75,0.6)" stroke="#78909C" strokeWidth="3" />

              {/* Items in bowl */}
              {bowlItems.map((item, i) => (
                <motion.text key={item.id}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  x={100 + (i % 3) * 40} y={140 + Math.floor(i / 3) * 30}
                  fontSize="24" textAnchor="middle">
                  {item.emoji}
                </motion.text>
              ))}

              {/* Wrong item bounce out */}
              {wrongItem && (
                <motion.text
                  initial={{ x: 150, y: 150, opacity: 1 }}
                  animate={{ x: 100 + Math.random() * 100, y: 30, opacity: 0, rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  fontSize="28" textAnchor="middle">
                  {wrongItem.emoji}
                </motion.text>
              )}

              {/* "drop here" text when empty */}
              {bowlItems.length === 0 && !wrongItem && (
                <text x="150" y="165" textAnchor="middle" fill="rgba(255,255,255,0.25)"
                  fontSize="14" fontFamily="var(--font-body)">
                  drop here
                </text>
              )}
            </svg>
          </div>

          {/* Wrong message */}
          <AnimatePresence>
            {wrongMsg && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', maxWidth: '260px' }}>
                <p className="font-heading" style={{ color: '#FFB74D', fontSize: '1rem', marginBottom: '4px' }}>
                  Hmm, that doesn't seem right...
                </p>
                <p style={{ color: '#FF8A65', fontSize: '0.8rem' }}>{wrongMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Ingredient Shelf ── */}
        <div style={{ flex: '1 1 280px', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
            color: 'var(--color-text-secondary)', textTransform: 'uppercase',
          }}>
            Ingredient Shelf — Tap to Add
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '10px', width: '100%',
          }}>
            {allItems.map(item => {
              const added = isAdded(item.id)
              return (
                <motion.button key={item.id}
                  onClick={() => handleIngredientTap(item)} disabled={added}
                  whileHover={!added ? { scale: 1.06, y: -2 } : {}}
                  whileTap={!added ? { scale: 0.94 } : {}}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '12px 8px', borderRadius: '12px',
                    background: added ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${added ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    cursor: added ? 'default' : 'pointer',
                    opacity: added ? 0.4 : 1,
                    transition: 'all 0.2s',
                  }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: `${item.color}22`, border: `2px solid ${item.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}>
                    {item.emoji}
                  </div>
                  <span style={{
                    fontSize: '0.65rem', color: 'var(--color-text-secondary)',
                    fontWeight: 600, textAlign: 'center', lineHeight: 1.2,
                  }}>
                    {item.name}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reset Bowl button */}
      <motion.button
        onClick={handleReset}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        style={{
          padding: '10px 24px', borderRadius: '24px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', marginTop: '8px',
        }}>
        🗑️ Reset Bowl
      </motion.button>

      {/* Success overlay */}
      <AnimatePresence>
        {isComplete && phase === 'select' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              style={{ textAlign: 'center', padding: '32px', borderRadius: '24px', background: 'rgba(13,27,42,0.95)', border: `2px solid ${remedy.color}66` }}>
              <p style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉✨</p>
              <h3 className="font-heading" style={{ color: remedy.color, fontSize: '1.4rem' }}>
                Perfect Mix!
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                Entering microscopic world...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
