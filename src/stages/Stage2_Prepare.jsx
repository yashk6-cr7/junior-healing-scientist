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

// ─── GrindBowl — drag-to-grind mechanic ──────────────────────────────────────
// User drags the pestle LEFT/RIGHT across the mortar to grind ingredients.
// Total horizontal distance dragged (500 px total) = 100% crushed.
// Pestle follows pointer X position. Dust bursts out on active grinding.
function GrindBowl({ remedyColor, crushProgress, onProgressChange, StepIndicator, ingredients, currentDay }) {
  const mortarRef = useRef(null)
  const lastXRef = useRef(null)
  const totalDistRef = useRef(crushProgress * 5) // resume: 500px = 100%
  const isActiveRef = useRef(false)
  const [pestleX, setPestleX] = useState(50) // 0-100% across mortar
  const [particles, setParticles] = useState([])

  const TOTAL_PX = 500 // total drag distance for 100%

  function getRelX(clientX) {
    const rect = mortarRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }

  function spawnParticles(x) {
    const id = Date.now() + Math.random()
    setParticles(prev => [...prev.slice(-10), { id, x, color: remedyColor }])
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 800)
  }

  function handleStart(clientX) {
    isActiveRef.current = true
    lastXRef.current = clientX
    setPestleX(getRelX(clientX))
  }

  function handleMove(clientX) {
    if (!isActiveRef.current || lastXRef.current === null) return
    const delta = Math.abs(clientX - lastXRef.current)
    lastXRef.current = clientX
    totalDistRef.current += delta
    const pct = Math.min(100, (totalDistRef.current / TOTAL_PX) * 100)
    onProgressChange(pct)
    const rx = getRelX(clientX)
    setPestleX(rx)
    if (delta > 3) spawnParticles(rx)
  }

  function handleEnd() {
    isActiveRef.current = false
    lastXRef.current = null
  }

  function onPointerDown(e) { e.currentTarget.setPointerCapture(e.pointerId); handleStart(e.clientX) }
  function onPointerMove(e) { handleMove(e.clientX) }
  function onPointerUp() { handleEnd() }
  function onTouchStart(e) { handleStart(e.touches[0].clientX) }
  function onTouchMove(e) { e.preventDefault(); handleMove(e.touches[0].clientX) }
  function onTouchEnd() { handleEnd() }

  const isDone = crushProgress >= 100
  const crushScale = 1 - (crushProgress / 100) * 0.35 // ingredients shrink as crushed
  const crushBlur = (crushProgress / 100) * 3

  // Science tip based on day
  const tips = {
    4: 'Crushing garlic releases Allicin — it only activates when cell walls break!',
    5: 'Ginger releases Gingerols when crushed — 10× more potent than whole ginger!',
    6: 'Black pepper releases Piperine when ground — makes turmeric 2000% more effective!',
    7: 'Crushing all spices together creates a synergistic blend — each amplifies the others!',
  }
  const tip = tips[currentDay] || tips[4]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: '64px 16px 100px', gap: '14px' }}>
      <h2 className="font-heading" style={{ color: remedyColor, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
        🔨 Crush the Ingredients!
      </h2>
      <p className="game-text" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        Fresh ingredients release more healing compounds when crushed first!
      </p>
      <StepIndicator />

      <p style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>
        {isDone ? '✅ Perfectly crushed!' : 'Drag the pestle left & right across the mortar! 🪨'}
      </p>

      {/* Mortar & Pestle container */}
      <div style={{ position: 'relative', width: '280px', height: '200px', userSelect: 'none' }}>

        {/* Dust/spice particles flying out */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            animate={{ opacity: 0, y: -40, x: (Math.random() - 0.5) * 60, scale: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: '30%',
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: p.color,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}

        {/* Pestle (draggable) — sits above mortar */}
        <motion.div
          style={{
            position: 'absolute',
            left: `${pestleX}%`,
            top: '0px',
            transform: 'translateX(-50%)',
            zIndex: 5,
            cursor: isActiveRef.current ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          animate={{
            rotate: isActiveRef.current ? [-8, 8] : 0,
            y: isActiveRef.current ? [0, 4, 0] : 0,
          }}
          transition={{ duration: 0.15, repeat: isActiveRef.current ? Infinity : 0 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Pestle head */}
          <div style={{
            width: '22px', height: '70px',
            background: 'linear-gradient(180deg, #BCAAA4, #8D6E63)',
            borderRadius: '4px 4px 10px 10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            margin: '0 auto',
          }} />
          {/* Pestle tip */}
          <div style={{
            width: '28px', height: '16px',
            background: 'linear-gradient(180deg, #8D6E63, #5D4037)',
            borderRadius: '4px 4px 14px 14px',
            boxShadow: `0 2px 8px ${remedyColor}44`,
            margin: '-2px auto 0',
          }} />
        </motion.div>

        {/* Mortar bowl */}
        <div
          ref={mortarRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0, right: 0,
            height: '120px',
            cursor: 'grab',
            touchAction: 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Mortar bowl shape */}
          <div style={{
            width: '100%', height: '100%',
            borderRadius: '0 0 140px 140px',
            background: 'linear-gradient(180deg, rgba(120,90,60,0.5), rgba(60,35,15,0.85))',
            border: '3px solid rgba(200,160,110,0.35)',
            boxShadow: 'inset 0 -12px 40px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Ground paste filling up */}
            <motion.div
              animate={{ height: `${crushProgress * 0.65}%` }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: `linear-gradient(0deg, ${remedyColor}66, ${remedyColor}33)`,
                transition: 'background 0.5s',
              }}
            />

            {/* Ingredient emojis — shrink & blur as crushed */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', gap: '6px', pointerEvents: 'none' }}>
              {ingredients.map((ing, i) => (
                <motion.span key={i}
                  animate={{
                    scale: crushScale,
                    rotate: isActiveRef.current ? [-8, 8, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: '1.8rem',
                    display: 'block',
                    filter: `blur(${crushBlur}px)`,
                    transformOrigin: 'center',
                  }}>
                  {ing.emoji}
                </motion.span>
              ))}
            </div>

            {/* Grinding streak lines */}
            {isActiveRef.current && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                style={{
                  position: 'absolute', top: '30%',
                  left: `${pestleX - 10}%`, width: '20%', height: '3px',
                  background: `linear-gradient(90deg, transparent, ${remedyColor}88, transparent)`,
                  borderRadius: '2px',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Drag distance hint */}
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
        {Math.round(Math.min(totalDistRef.current, TOTAL_PX) / 5)}px / 100px dragged
      </p>

      {/* Progress bar */}
      <div style={{ width: '240px' }}>
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            animate={{ width: `${crushProgress}%` }}
            style={{ height: '100%', borderRadius: '4px', background: remedyColor }}
          />
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '6px' }}>
          {isDone ? '✅ Perfectly crushed!' : `Crushed: ${Math.round(crushProgress)}%`}
        </p>
      </div>

      {/* Science tip */}
      <div style={{
        padding: '12px 16px', borderRadius: '12px', maxWidth: '320px',
        background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)',
      }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, textAlign: 'center' }}>
          💡 <strong>Science tip:</strong> {tip}
        </p>
      </div>
    </div>
  )
}

// ─── StirBowl — rotation-tracking stir mechanic ──────────────────────────────
// Tracks the angle of cursor/finger around the bowl center.
// Every degree rotated (clockwise or CCW) accumulates toward 100%.
// 3 full circles (1080°) = 100% mixed.
function StirBowl({ remedyColor, stirProgress, onProgressChange, StepIndicator, totalDegNeeded }) {
  const bowlRef = useRef(null)
  const lastAngleRef = useRef(null)    // last recorded angle in degrees
  const totalRotRef = useRef(stirProgress * totalDegNeeded / 100) // resume from saved
  const isActiveRef = useRef(false)    // pointer is down / finger is touching

  function getAngle(clientX, clientY) {
    const rect = bowlRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    return Math.atan2(dy, dx) * (180 / Math.PI) // -180 to 180
  }

  function handleStart(clientX, clientY) {
    isActiveRef.current = true
    lastAngleRef.current = getAngle(clientX, clientY)
  }

  function handleMove(clientX, clientY) {
    if (!isActiveRef.current || lastAngleRef.current === null) return
    const newAngle = getAngle(clientX, clientY)
    let delta = newAngle - lastAngleRef.current
    // Wrap around -180/180 boundary
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    // Count absolute rotation (either direction)
    totalRotRef.current += Math.abs(delta)
    lastAngleRef.current = newAngle
    const pct = Math.min(100, (totalRotRef.current / totalDegNeeded) * 100)
    onProgressChange(pct)
  }

  function handleEnd() {
    isActiveRef.current = false
    lastAngleRef.current = null
  }

  // Pointer events (mouse + stylus)
  function onPointerDown(e) { e.currentTarget.setPointerCapture(e.pointerId); handleStart(e.clientX, e.clientY) }
  function onPointerMove(e) { handleMove(e.clientX, e.clientY) }
  function onPointerUp() { handleEnd() }

  // Touch events (mobile fallback)
  function onTouchStart(e) { const t = e.touches[0]; handleStart(t.clientX, t.clientY) }
  function onTouchMove(e) { e.preventDefault(); const t = e.touches[0]; handleMove(t.clientX, t.clientY) }
  function onTouchEnd() { handleEnd() }

  const isDone = stirProgress >= 100
  const rotationDeg = (totalRotRef.current / totalDegNeeded) * 360 * 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: '72px 16px 100px', gap: '16px' }}>
      <h2 className="font-heading" style={{ color: remedyColor, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
        🧪 Prepare the Remedy
      </h2>
      <p className="game-text" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        Find the right ingredients, mix them, and heat to the perfect temperature!
      </p>
      <StepIndicator />
      <p style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>
        {isDone ? '✅ Perfectly mixed!' : 'Move your finger in circles inside the bowl! 🌀'}
      </p>

      {/* Bowl */}
      <div
        ref={bowlRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          width: '220px', height: '220px', borderRadius: '50%', cursor: 'crosshair',
          background: `radial-gradient(circle at 40% 40%, ${remedyColor}44, ${remedyColor}22)`,
          border: `3px solid ${remedyColor}${isDone ? 'ff' : '66'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 ${isDone ? 60 : 30}px ${remedyColor}${isDone ? '55' : '22'}`,
          position: 'relative',
          touchAction: 'none',
          userSelect: 'none',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}
      >
        {/* Swirl trail rings */}
        {stirProgress > 10 && (
          <div style={{
            position: 'absolute', inset: 12, borderRadius: '50%',
            border: `2px dashed ${remedyColor}33`,
            animation: 'spin 4s linear infinite',
          }} />
        )}
        {stirProgress > 40 && (
          <div style={{
            position: 'absolute', inset: 30, borderRadius: '50%',
            border: `2px dashed ${remedyColor}44`,
            animation: 'spin 2.5s linear infinite reverse',
          }} />
        )}
        {/* Spiral emoji rotating with actual rotation amount */}
        <motion.span
          animate={{ rotate: rotationDeg }}
          transition={{ type: 'tween', ease: 'linear', duration: 0 }}
          style={{ fontSize: '3.5rem', display: 'block', pointerEvents: 'none', userSelect: 'none' }}>
          🌀
        </motion.span>
        {/* Centre ripple when done */}
        {isDone && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute', width: 60, height: 60, borderRadius: '50%',
              background: remedyColor, pointerEvents: 'none',
            }} />
        )}
      </div>

      {/* Circles counter */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
        {Math.min(3, Math.floor(totalRotRef.current / 360))} / 3 circles completed
      </p>

      {/* Progress bar */}
      <div style={{ width: '220px' }}>
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            animate={{ width: `${stirProgress}%` }}
            style={{ height: '100%', borderRadius: '4px', background: remedyColor }}
          />
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '6px' }}>
          Mix: {Math.round(stirProgress)}%
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
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
  const [phase, setPhase] = useState('select') // select → crush? → stir → heat → microscope → done
  const [bowlItems, setBowlItems] = useState([])
  const [stirProgress, setStirProgress] = useState(0)
  const [temperature, setTemperature] = useState(25)
  const [isHeating, setIsHeating] = useState(false)
  const [crushProgress, setCrushProgress] = useState(0)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const heatInterval = useRef(null)
  const isDay7 = state.currentDay >= 7
  const needsCrush = state.currentDay >= 4

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

  // Watch for completion → crush (Days 4-7) or stir (Days 1-3)
  useEffect(() => {
    if (isComplete && phase === 'select') {
      setTimeout(() => setPhase(needsCrush ? 'crush' : 'stir'), 1000)
    }
  }, [isComplete, phase, needsCrush])

  // Crush complete → stir
  useEffect(() => {
    if (phase === 'crush' && crushProgress >= 100) {
      setTimeout(() => setPhase('stir'), 600)
    }
  }, [phase, crushProgress])

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

  // ─── Interactive Microscope Canvas ───
  const bacteriaRef = useRef([])
  const curRef = useRef([])
  const pointerRef = useRef({ x: -999, y: -999, active: false })
  const [bacteriaKilled, setBacteriaKilled] = useState(0)
  const TOTAL_BACTERIA = 12

  useEffect(() => {
    if (phase !== 'microscope' || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    // Init bacteria (red enemies)
    bacteriaRef.current = Array.from({ length: TOTAL_BACTERIA }, (_, i) => ({
      id: i,
      x: 60 + Math.random() * (W - 120),
      y: 60 + Math.random() * (H - 120),
      r: 14 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      alive: true,
      deathAlpha: 1,
      pulse: Math.random() * Math.PI * 2,
    }))

    // Curcumin healing particles (gold — follow pointer cluster)
    curRef.current = Array.from({ length: 60 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 40,
      y: H / 2 + (Math.random() - 0.5) * 40,
      r: 3 + Math.random() * 3,
      ox: (Math.random() - 0.5) * 30, // orbit offset from pointer
      oy: (Math.random() - 0.5) * 30,
      glow: 0.6 + Math.random() * 0.4,
    }))

    // Milk drift particles
    const milks = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 1.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: 0.2 + Math.random() * 0.35,
    }))

    let frame = 0
    let killed = 0

    // Pointer event handlers on canvas
    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = W / rect.width, scaleY = H / rect.height
      const cx = (e.touches ? e.touches[0].clientX : e.clientX)
      const cy = (e.touches ? e.touches[0].clientY : e.clientY)
      pointerRef.current = { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY, active: true }
    }
    const handleLeave = () => { pointerRef.current.active = false }
    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('touchmove', handleMove, { passive: true })
    canvas.addEventListener('mouseleave', handleLeave)
    canvas.addEventListener('touchend', handleLeave)

    function draw() {
      frame++
      ctx.fillStyle = '#0a0f1a'
      ctx.fillRect(0, 0, W, H)

      // Vignette
      const vig = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.72)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

      // Milk molecules
      milks.forEach(m => {
        m.x += m.vx + Math.sin(frame * 0.01 + m.y * 0.01) * 0.08
        m.y += m.vy + Math.cos(frame * 0.01 + m.x * 0.01) * 0.08
        if (m.x < 0) m.x = W; if (m.x > W) m.x = 0
        if (m.y < 0) m.y = H; if (m.y > H) m.y = 0
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,220,230,${m.alpha})`; ctx.fill()
      })

      // Bacteria
      bacteriaRef.current.forEach(b => {
        if (!b.alive) {
          // Death flash
          b.deathAlpha -= 0.05
          if (b.deathAlpha > 0) {
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,100,0,${b.deathAlpha * 0.5})`; ctx.fill()
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,255,100,${b.deathAlpha})`; ctx.fill()
          }
          return
        }
        b.pulse += 0.04
        b.x += b.vx; b.y += b.vy
        if (b.x < b.r || b.x > W - b.r) b.vx *= -1
        if (b.y < b.r || b.y > H - b.r) b.vy *= -1

        const pulseR = b.r + Math.sin(b.pulse) * 2
        // Bacteria glow
        const bg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pulseR * 3)
        bg.addColorStop(0, 'rgba(220,50,50,0.5)')
        bg.addColorStop(1, 'rgba(220,50,50,0)')
        ctx.beginPath(); ctx.arc(b.x, b.y, pulseR * 3, 0, Math.PI * 2)
        ctx.fillStyle = bg; ctx.fill()
        // Body
        ctx.beginPath(); ctx.arc(b.x, b.y, pulseR, 0, Math.PI * 2)
        ctx.fillStyle = '#C62828'; ctx.fill()
        ctx.strokeStyle = '#EF9A9A'; ctx.lineWidth = 1.5; ctx.stroke()
        // Flagella
        ctx.beginPath()
        ctx.moveTo(b.x + pulseR, b.y)
        ctx.bezierCurveTo(b.x + pulseR + 12, b.y - 6 + Math.sin(frame * 0.08 + b.id) * 4,
          b.x + pulseR + 18, b.y + 4, b.x + pulseR + 22, b.y + Math.sin(frame * 0.06) * 3)
        ctx.strokeStyle = 'rgba(239,154,154,0.5)'; ctx.lineWidth = 1.2; ctx.stroke()
      })

      // Curcumin cluster — follows pointer
      const { x: px, y: py, active } = pointerRef.current
      curRef.current.forEach(c => {
        const tx = active ? px + c.ox : W / 2 + c.ox + Math.cos(frame * 0.01 + c.oy) * 20
        const ty = active ? py + c.oy : H / 2 + c.oy + Math.sin(frame * 0.01 + c.ox) * 20
        c.x += (tx - c.x) * 0.12
        c.y += (ty - c.y) * 0.12
        c.glow = 0.5 + Math.sin(frame * 0.04 + c.ox) * 0.3

        const cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 5)
        cg.addColorStop(0, `rgba(255,215,0,${0.8 * c.glow})`)
        cg.addColorStop(1, 'rgba(255,180,0,0)')
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = cg; ctx.fill()
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,215,0,0.95)`; ctx.fill()

        // Collision check with bacteria
        bacteriaRef.current.forEach(b => {
          if (!b.alive) return
          const dx = c.x - b.x, dy = c.y - b.y
          if (Math.sqrt(dx*dx + dy*dy) < b.r + c.r * 1.5) {
            b.alive = false
            killed++
            setBacteriaKilled(killed)
          }
        })
      })

      // Center instruction if pointer not active yet
      if (!active && frame < 150) {
        ctx.fillStyle = `rgba(255,215,0,${0.6 + Math.sin(frame * 0.08) * 0.3})`
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Move your finger / cursor to guide the gold', W / 2, H - 20)
        ctx.fillText('healing particles into the red bacteria! 🦠', W / 2, H - 5)
        ctx.textAlign = 'left'
      }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('touchmove', handleMove)
      canvas.removeEventListener('mouseleave', handleLeave)
      canvas.removeEventListener('touchend', handleLeave)
    }
  }, [phase])


  function handleContinueToHeal() {
    dispatch({ type: ACTIONS.SET_STAGE, payload: 3 })
  }

  if (!remedy) return null

  // Step indicator — adds Crush step for Days 4-7
  const steps = needsCrush
    ? [{ n: 1, label: 'Find' }, { n: 2, label: 'Crush' }, { n: 3, label: 'Stir' }, { n: 4, label: 'Heat' }]
    : [{ n: 1, label: 'Find' }, { n: 2, label: 'Stir' }, { n: 3, label: 'Heat' }]
  const stepNum = phase === 'select' ? 1 : phase === 'crush' ? 2 : phase === 'stir' ? (needsCrush ? 3 : 2) : phase === 'heat' ? (needsCrush ? 4 : 3) : 5

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700,
            background: stepNum > s.n ? '#00C853' : stepNum === s.n ? remedy.color : 'rgba(255,255,255,0.1)',
            color: stepNum >= s.n ? 'white' : 'rgba(255,255,255,0.4)',
            border: `2px solid ${stepNum > s.n ? '#00C853' : stepNum === s.n ? remedy.color : 'rgba(255,255,255,0.15)'}`,
          }}>
            {stepNum > s.n ? '✓' : s.n}
          </div>
          <span style={{ fontSize: '0.7rem', color: stepNum >= s.n ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.3)' }}>{s.label}</span>
          {i < steps.length - 1 && <span style={{ color: 'rgba(255,255,255,0.12)', margin: '0 2px' }}>—</span>}
        </div>
      ))}
    </div>
  )

  // ═══ CRUSH PHASE (Days 4-7) ═══
  if (phase === 'crush') {
    const crushIngredients = [
      { emoji: '🧄', label: 'Garlic' }, { emoji: '🫚', label: 'Ginger' },
      { emoji: '⚫', label: 'Pepper' },
    ].slice(0, state.currentDay >= 6 ? 3 : state.currentDay >= 5 ? 2 : 1)

    return (
      <GrindBowl
        remedyColor={remedy.color}
        crushProgress={crushProgress}
        onProgressChange={setCrushProgress}
        StepIndicator={StepIndicator}
        ingredients={crushIngredients}
        currentDay={state.currentDay}
      />
    )
  }

  if (phase === 'stir') {
    const TOTAL_DEG_NEEDED = 1080 // 3 full circles = 100%

    return (
      <StirBowl
        remedyColor={remedy.color}
        stirProgress={stirProgress}
        onProgressChange={setStirProgress}
        StepIndicator={StepIndicator}
        totalDegNeeded={TOTAL_DEG_NEEDED}
      />
    )
  }

  // ═══ HEAT PHASE — Thermometer + Boiling Pot ═══
  if (phase === 'heat') {
    const fillH = Math.max(0, ((temperature - 20) / 70) * 200)
    const tempColor = temperature < 50 ? '#40C4FF' : temperature < 75 ? '#FFB74D' : '#FF5722'
    const boilIntensity = Math.max(0, (temperature - 30) / 60) // 0 → 1 as temp 30→90°C
    const numBubbles = Math.floor(boilIntensity * 8) + (boilIntensity > 0 ? 2 : 0)
    const showSteam = temperature > 60
    const liquidColor = temperature < 50
      ? remedy.color + '88'
      : temperature < 75
        ? remedy.color + 'bb'
        : remedy.color + 'ee'
    const bubbleSpeed = Math.max(0.4, 1.8 - boilIntensity * 1.4) // faster as hotter

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh', padding: '60px 16px 100px', gap: '10px' }}>
        <h2 className="font-heading" style={{ color: remedy.color, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
          🧪 Prepare the Remedy
        </h2>
        <p className="game-text" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Find the right ingredients, mix them, and heat to the perfect temperature!
        </p>
        <StepIndicator />
        <p style={{ color: '#f5c842', fontWeight: 600, fontSize: '0.9rem' }}>
          Hold the flame to heat! Find the sweet spot 🔥
        </p>
        <p style={{ color: tempColor, fontSize: '2rem', fontWeight: 800, transition: 'color 0.3s' }}>
          {Math.round(temperature)}°C
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{tempLabel}</p>

        {/* ── Side-by-side: Thermometer + Boiling Pot ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px', marginTop: '4px' }}>

          {/* Thermometer */}
          <div style={{ position: 'relative', width: '50px', height: '240px', flexShrink: 0 }}>
            {/* Tube */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              width: '28px', height: '200px', bottom: '20px',
              borderRadius: '14px', background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.15)', overflow: 'hidden',
            }}>
              {/* Fill */}
              <motion.div
                animate={{ height: `${fillH}px` }}
                transition={{ type: 'tween', ease: 'linear', duration: 0.15 }}
                style={{
                  position: 'absolute', bottom: 0, width: '100%',
                  background: tempColor,
                  borderRadius: '0 0 12px 12px',
                  boxShadow: `0 0 10px ${tempColor}88`,
                  transition: 'background 0.3s',
                }}
              />
              {/* Target zone indicator */}
              <div style={{
                position: 'absolute',
                bottom: `${((remedy.targetTemp - 5 - 20) / 70) * 200}px`,
                height: `${(10 / 70) * 200}px`,
                width: '100%',
                background: 'rgba(0,200,83,0.2)',
                borderTop: '1px dashed rgba(0,200,83,0.7)',
                borderBottom: '1px dashed rgba(0,200,83,0.7)',
              }} />
              {/* Tick marks */}
              {[40, 60, 80].map(t => (
                <div key={t} style={{
                  position: 'absolute', bottom: `${((t - 20) / 70) * 200}px`,
                  width: '100%', height: '1px',
                  borderTop: '1px dashed rgba(255,255,255,0.2)',
                }} />
              ))}
            </div>
            {/* Bulb */}
            <motion.div
              animate={{ boxShadow: isHeating ? `0 0 20px ${tempColor}` : 'none' }}
              style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                background: tempColor, transition: 'background 0.3s',
              }}
            />
            {/* Temp labels */}
            <span style={{ position: 'absolute', right: '100%', bottom: `${((remedy.targetTemp - 20) / 70) * 200 + 14}px`,
              fontSize: '0.6rem', color: '#00C853', whiteSpace: 'nowrap', marginRight: '4px', fontWeight: 700 }}>
              🎯
            </span>
          </div>

          {/* Boiling Pot */}
          <div style={{ position: 'relative', width: '160px', flexShrink: 0 }}>
            {/* Steam wisps above pot */}
            <div style={{ position: 'relative', height: '80px', overflow: 'visible' }}>
              {showSteam && Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 0.7, scaleX: 1 }}
                  animate={{ y: -70, opacity: 0, scaleX: [1, 1.4, 0.8, 1.2, 0] }}
                  transition={{
                    duration: bubbleSpeed * 1.8,
                    repeat: Infinity,
                    delay: i * (bubbleSpeed * 0.4),
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${20 + i * 28}px`,
                    width: '14px', height: '28px',
                    borderRadius: '50%',
                    background: `rgba(255,255,255,${0.08 + boilIntensity * 0.12})`,
                    filter: 'blur(4px)',
                  }}
                />
              ))}
            </div>

            {/* Pot body */}
            <div style={{
              position: 'relative',
              width: '160px', height: '130px',
              background: 'rgba(255,255,255,0.06)',
              border: `2px solid rgba(255,255,255,0.15)`,
              borderRadius: '0 0 28px 28px',
              borderTop: 'none',
              overflow: 'hidden',
            }}>
              {/* Liquid fill */}
              <motion.div
                animate={{ height: `${70 + boilIntensity * 20}px` }}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: `linear-gradient(180deg, ${liquidColor} 0%, ${remedy.color}cc 100%)`,
                  transition: 'background 0.5s',
                  borderRadius: '0 0 26px 26px',
                }}
              >
                {/* Liquid surface wave */}
                <motion.div
                  animate={{ x: [0, -20, 0, 20, 0] }}
                  transition={{ duration: bubbleSpeed * 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: -8, left: -10, right: -10, height: '16px',
                    background: liquidColor,
                    borderRadius: '50%',
                  }}
                />

                {/* Bubbles rising inside liquid */}
                {Array.from({ length: numBubbles }).map((_, i) => {
                  const size = 6 + Math.random() * 10
                  return (
                    <motion.div
                      key={i}
                      initial={{ y: 0, opacity: 0.9 }}
                      animate={{ y: -(70 + boilIntensity * 20), opacity: [0.9, 0.7, 0] }}
                      transition={{
                        duration: bubbleSpeed + Math.random() * 0.4,
                        repeat: Infinity,
                        delay: i * (bubbleSpeed * 0.25),
                        ease: 'easeOut',
                      }}
                      style={{
                        position: 'absolute',
                        bottom: `${Math.random() * 20}px`,
                        left: `${10 + i * (130 / numBubbles)}px`,
                        width: `${size}px`, height: `${size}px`,
                        borderRadius: '50%',
                        background: `rgba(255,255,255,${0.3 + boilIntensity * 0.4})`,
                        border: '1px solid rgba(255,255,255,0.5)',
                        boxShadow: `0 0 4px rgba(255,255,255,0.3)`,
                      }}
                    />
                  )
                })}
              </motion.div>

              {/* Flame glow at bottom when heating */}
              {isHeating && (
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px',
                    background: 'linear-gradient(0deg, rgba(255,109,0,0.5), transparent)',
                    borderRadius: '0 0 26px 26px',
                  }}
                />
              )}
            </div>

            {/* Pot rim */}
            <div style={{
              width: '176px', height: '14px', marginLeft: '-8px',
              background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              position: 'relative', zIndex: 2,
            }} />

            {/* Flame label */}
            {isHeating && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', marginTop: '6px', fontSize: '1.4rem' }}>
                🔥🔥🔥
              </motion.div>
            )}
          </div>
        </div>

        {/* Ingredient icons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {bowlItems.map(item => <span key={item.id} style={{ fontSize: '1.5rem' }}>{item.emoji}</span>)}
        </div>

        {/* Flame button */}
        <motion.button
          onMouseDown={() => setIsHeating(true)} onMouseUp={() => setIsHeating(false)} onMouseLeave={() => setIsHeating(false)}
          onTouchStart={() => setIsHeating(true)} onTouchEnd={() => setIsHeating(false)}
          whileTap={{ scale: 0.9 }}
          animate={{ boxShadow: isHeating ? '0 0 40px rgba(255,109,0,0.6)' : '0 0 0px transparent' }}
          style={{
            width: '80px', height: '80px', borderRadius: '50%', fontSize: '2.2rem',
            background: isHeating ? 'rgba(255,109,0,0.4)' : 'rgba(255,109,0,0.15)',
            border: `3px solid ${isHeating ? '#FF6D00' : 'rgba(255,109,0,0.3)'}`,
            cursor: 'pointer', transition: 'background 0.2s, border 0.2s',
          }}>
          🔥
        </motion.button>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>Hold the flame to heat!</p>
      </div>
    )
  }

  // ═══ MICROSCOPE PHASE ═══
  if (phase === 'microscope') {
    const allKilled = bacteriaKilled >= TOTAL_BACTERIA
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100dvh', padding: '24px', gap: '12px',
      }}>
        <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="font-heading"
          style={{ color: '#f5c842', fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', textAlign: 'center' }}>
          🔬 Microscopic Attack!
        </motion.h2>

        {/* Kill counter HUD */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', maxWidth: 600 }}>
          <div style={{ display: 'flex', align: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>🦠</span>
            <span style={{ color: '#EF5350', fontWeight: 700, fontSize: '0.9rem' }}>
              {TOTAL_BACTERIA - bacteriaKilled} remaining
            </span>
          </div>
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              animate={{ width: `${(bacteriaKilled / TOTAL_BACTERIA) * 100}%` }}
              style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #FFD700, #00C853)' }}
            />
          </div>
          <span style={{ color: '#FFD700', fontWeight: 700, fontSize: '0.9rem' }}>
            {bacteriaKilled}/{TOTAL_BACTERIA} 💥
          </span>
        </motion.div>

        {/* Canvas */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            width: '100%', maxWidth: '600px', aspectRatio: '3/2',
            borderRadius: '16px', overflow: 'hidden',
            border: `2px solid ${allKilled ? '#00C853' : remedy.color}66`,
            boxShadow: `0 0 40px ${allKilled ? '#00C85333' : remedy.color + '22'}`,
            position: 'relative',
          }}>
          <canvas ref={canvasRef} width={600} height={400}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }} />
          {/* All killed overlay */}
          {allKilled && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
              }}>
              <p style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</p>
              <p className="font-heading" style={{ color: '#00C853', fontSize: '1.2rem' }}>All bacteria defeated!</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '4px' }}>The remedy worked! 🌟</p>
            </motion.div>
          )}
        </motion.div>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', textAlign: 'center', maxWidth: 400 }}>
          {allKilled
            ? '✅ Every last germ has been defeated by your remedy!'
            : 'Move your cursor or finger over the canvas — guide the golden healing particles into the red bacteria!'}
        </p>

        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: allKilled ? 0.3 : 3 }} className="btn-primary"
          onClick={handleContinueToHeal}
          style={{ padding: '14px 36px', fontSize: '1rem', marginTop: '4px' }}>
          {allKilled ? '🏆 Give Remedy to Arjun!' : 'Skip to Healing →'}
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

  // ═══ DAY 7 MASTER KADHA FINALE ═══
  if (phase === 'select' && isDay7) {
    const MASTER_INGREDIENTS = [
      { id: 'turmeric',   emoji: '🌿', name: 'Turmeric',    color: '#FFD700', day: 1, fact: 'Curcumin — the golden healer' },
      { id: 'tulsi',      emoji: '🌱', name: 'Tulsi',       color: '#00C853', day: 2, fact: 'Eugenol — the viral shield' },
      { id: 'ginger',     emoji: '🫚', name: 'Ginger',      color: '#FF8F00', day: 3, fact: 'Gingerol — the bacteria killer' },
      { id: 'eucalyptus', emoji: '💨', name: 'Eucalyptus',  color: '#40C4FF', day: 4, fact: 'Cineole — opens the airways' },
      { id: 'garlic',     emoji: '🧄', name: 'Garlic',      color: '#FFFDE7', day: 5, fact: 'Allicin — nature\'s antibiotic' },
      { id: 'pepper',     emoji: '⚫', name: 'Black Pepper', color: '#78909C', day: 6, fact: 'Piperine — the power amplifier' },
    ]
    const allMasterAdded = addedIngredients.length >= MASTER_INGREDIENTS.length
    const potFill = (addedIngredients.length / MASTER_INGREDIENTS.length) * 100

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: '100dvh', padding: '64px 16px 100px', gap: '12px',
      }}>
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '4px' }}>👑</p>
          <h2 className="font-heading" style={{ color: '#FFD700', fontSize: 'clamp(1.3rem, 5vw, 1.8rem)' }}>
            Master Kadha — Day 7 Finale!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '4px' }}>
            Add ALL 6 remedies you've learned into the pot!
          </p>
        </motion.div>

        {/* Big pot with animated boiling */}
        <div style={{ position: 'relative', width: '200px', height: '200px', flexShrink: 0 }}>
          {/* Bubbles when boiling */}
          {addedIngredients.length > 0 && [0,1,2,3].map(i => (
            <motion.div key={i}
              animate={{ y: [-0, -40 - i * 15], opacity: [0.6, 0], scale: [0.4, 1.2] }}
              transition={{ duration: 1.2 + i * 0.3, repeat: Infinity, delay: i * 0.3 }}
              style={{
                position: 'absolute',
                left: `${30 + i * 35}px`,
                bottom: '80px',
                width: 12 + i * 4, height: 12 + i * 4,
                borderRadius: '50%',
                background: `rgba(255,215,0,0.4)`,
              }} />
          ))}

          {/* Pot SVG */}
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            {/* Pot handles */}
            <rect x="15" y="90" width="20" height="14" rx="7" fill="#546E7A" />
            <rect x="165" y="90" width="20" height="14" rx="7" fill="#546E7A" />
            {/* Pot body */}
            <path d="M 35 95 Q 35 185 100 185 Q 165 185 165 95 Z" fill="rgba(40,60,80,0.8)" stroke="#78909C" strokeWidth="3" />
            {/* Liquid fill — color blends all added ingredients */}
            {addedIngredients.length > 0 && (
              <motion.path
                d={`M 40 ${170 - potFill * 0.7} Q 40 178 100 178 Q 160 178 160 ${170 - potFill * 0.7} Z`}
                fill={`${remedy.color}66`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
            {/* Rim */}
            <ellipse cx="100" cy="95" rx="65" ry="14" fill="rgba(50,70,90,0.9)" stroke="#90A4AE" strokeWidth="2" />
            {/* Steam when full */}
            {allMasterAdded && [0,1].map(i => (
              <motion.ellipse key={i} cx={80 + i * 40} cy="75"
                rx="8" ry="18"
                fill="rgba(255,255,255,0.06)"
                animate={{ cy: [75, 45, 75], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }} />
            ))}
            {/* Ingredient emojis in pot */}
            {addedIngredients.map((id, i) => {
              const ing = MASTER_INGREDIENTS.find(m => m.id === id)
              return (
                <motion.text key={id}
                  initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  x={55 + (i % 3) * 35} y={135 + Math.floor(i / 3) * 30}
                  fontSize="22" textAnchor="middle">
                  {ing?.emoji}
                </motion.text>
              )
            })}
          </svg>
        </div>

        {/* Ingredient grid — 6 slots */}
        <div style={{ width: '100%', maxWidth: 420 }}>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Tap each ingredient to add it to the pot
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {MASTER_INGREDIENTS.map((ing, i) => {
              const added = addedIngredients.includes(ing.id)
              return (
                <motion.button key={ing.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  onClick={() => !added && setAddedIngredients(prev => [...prev, ing.id])}
                  whileHover={!added ? { scale: 1.06, y: -3 } : {}}
                  whileTap={!added ? { scale: 0.94 } : {}}
                  disabled={added}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                    padding: '12px 8px', borderRadius: '14px', cursor: added ? 'default' : 'pointer',
                    background: added ? `${ing.color}18` : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${added ? ing.color + '66' : 'rgba(255,255,255,0.1)'}`,
                    transition: 'all 0.25s',
                    position: 'relative',
                  }}>
                  {/* Day badge */}
                  <span style={{
                    position: 'absolute', top: 4, right: 6,
                    fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700,
                  }}>Day {ing.day}</span>
                  <span style={{ fontSize: '1.6rem', filter: added ? 'none' : 'grayscale(0.3)' }}>{ing.emoji}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: added ? ing.color : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                    {ing.name}
                  </span>
                  {added && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ fontSize: '0.65rem', color: '#00C853', fontWeight: 700 }}>✓ Added</motion.span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
            <motion.div animate={{ width: `${potFill}%` }}
              style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #FFD700, #FF8F00, #00C853)' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center', marginTop: '4px' }}>
            {addedIngredients.length}/6 ingredients added
          </p>
        </div>

        {/* Success overlay — all 6 added */}
        <AnimatePresence>
          {allMasterAdded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
                flexDirection: 'column', gap: '16px',
              }}>
              <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10 }}
                style={{
                  textAlign: 'center', padding: '36px 28px', borderRadius: '28px',
                  background: 'linear-gradient(135deg, #0f1a2e, #1a0a2e)',
                  border: '2px solid rgba(255,215,0,0.4)',
                  boxShadow: '0 0 80px rgba(255,215,0,0.2)',
                  maxWidth: '340px', width: '90%',
                }}>
                <p style={{ fontSize: '2.8rem', marginBottom: '8px' }}>🏆✨👑</p>
                <h2 className="font-heading" style={{ color: '#FFD700', fontSize: '1.4rem', marginBottom: '8px' }}>
                  Master Kadha Ready!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  You've combined all 6 healing compounds! Ancient healers called this the "Liquid Gold" of Ayurveda.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {MASTER_INGREDIENTS.map(ing => (
                    <span key={ing.id} style={{ fontSize: '1.4rem' }}>{ing.emoji}</span>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase(needsCrush ? 'crush' : 'stir')}
                  style={{ width: '100%', fontSize: '1rem' }}>
                  Start the Final Preparation! 🔥
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
