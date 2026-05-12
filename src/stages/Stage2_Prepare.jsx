/**
 * Stage2_Prepare.jsx — Full Remedy Preparation
 * Phases: select → pour → stir → heat → microscope → done
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameState } from '../hooks/useGameState'
import { ACTIONS } from '../context/GameContext'
import { getRemedyByDay, getAllIngredients } from '../data/remedies'

export default function Stage2_Prepare() {
  const { state, dispatch } = useGameState()
  const remedy = getRemedyByDay(state.currentDay)

  const allItems = useMemo(() => {
    const items = getAllIngredients(state.currentDay)
    return [...items].sort(() => Math.random() - 0.5)
  }, [state.currentDay])

  const [addedIngredients, setAddedIngredients] = useState([])
  const [wrongItem, setWrongItem] = useState(null)
  const [phase, setPhase] = useState('select') // select→pour→stir→heat→microscope→done
  const [pourLevel, setPourLevel] = useState(0)
  const [stirProgress, setStirProgress] = useState(0)
  const [temperature, setTemperature] = useState(25)
  const [bacteria, setBacteria] = useState([])
  const [destroyed, setDestroyed] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const [bowlBubbles, setBowlBubbles] = useState([])
  const canvasRef = useRef(null)
  const animRef = useRef(null)

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
      setBowlBubbles(prev => [...prev, {
        id: Date.now(), color: item.color, emoji: item.emoji,
        x: 30 + Math.random() * 40, y: 20 + Math.random() * 40,
      }])
    } else {
      setWrongItem(item)
      setShakeKey(prev => prev + 1)
      setTimeout(() => setWrongItem(null), 1200)
    }
  }

  // Watch for ingredient completion → move to pour
  useEffect(() => {
    if (isComplete && phase === 'select') {
      setTimeout(() => setPhase('pour'), 800)
    }
  }, [isComplete, phase])

  // Pour phase: hold to pour
  useEffect(() => {
    if (phase === 'pour' && pourLevel >= 100) {
      setTimeout(() => setPhase('stir'), 500)
    }
  }, [phase, pourLevel])

  // Stir phase complete
  useEffect(() => {
    if (phase === 'stir' && stirProgress >= 100) {
      setTimeout(() => setPhase('heat'), 500)
    }
  }, [phase, stirProgress])

  // Heat phase complete
  useEffect(() => {
    if (phase === 'heat' && temperature >= 90) {
      setTimeout(() => {
        // Init bacteria for microscope
        const b = Array.from({ length: 12 }, (_, i) => ({
          id: i, x: 15 + Math.random() * 70, y: 15 + Math.random() * 60,
          alive: true, size: 18 + Math.random() * 12,
        }))
        setBacteria(b)
        setPhase('microscope')
      }, 500)
    }
  }, [phase, temperature])

  // Microscope canvas rendering
  useEffect(() => {
    if (phase !== 'microscope' || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    // Blood cells
    const cells = Array.from({ length: 30 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 8 + Math.random() * 6, vx: 0.3 + Math.random() * 0.4
    }))

    // Curcumin particles
    const curcumins = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 2 + Math.random() * 3, vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5, glow: Math.random()
    }))

    let frame = 0
    function draw() {
      frame++
      ctx.fillStyle = '#3a0a0a'
      ctx.fillRect(0, 0, W, H)

      // Pulsing overlay
      const pulseAlpha = 0.05 + Math.sin(frame * 0.03) * 0.03
      ctx.fillStyle = `rgba(90, 16, 16, ${pulseAlpha})`
      ctx.fillRect(0, 0, W, H)

      // Blood cells (donut shape)
      cells.forEach(c => {
        c.x += c.vx
        if (c.x > W + 20) c.x = -20
        ctx.beginPath()
        ctx.ellipse(c.x, c.y, c.r, c.r * 0.7, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(204, 51, 51, ${0.3 + Math.random() * 0.2})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(c.x, c.y, c.r * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(58, 10, 10, 0.3)'
        ctx.fill()
      })

      // Curcumin particles (golden glowing)
      curcumins.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        p.glow = 0.5 + Math.sin(frame * 0.05 + p.x * 0.01) * 0.5

        // Glow effect
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        grad.addColorStop(0, `rgba(255, 215, 0, ${0.8 * p.glow})`)
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 215, 0, ${0.9})`
        ctx.fill()
      })

      // Bacteria (green spiky blobs)
      bacteria.forEach(b => {
        if (!b.alive) return
        const bx = b.x * W / 100, by = b.y * H / 100
        const wobble = Math.sin(frame * 0.04 + b.id) * 2

        // Spiky shape
        ctx.beginPath()
        for (let a = 0; a < Math.PI * 2; a += 0.3) {
          const spike = b.size + Math.sin(a * 5 + frame * 0.05) * 4
          const px = bx + Math.cos(a) * (spike + wobble)
          const py = by + Math.sin(a) * (spike + wobble)
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fillStyle = '#4caf50'
        ctx.fill()
        ctx.strokeStyle = '#2e7d32'
        ctx.lineWidth = 2
        ctx.stroke()

        // Evil eyes
        ctx.fillStyle = '#1b5e20'
        ctx.beginPath()
        ctx.arc(bx - 5, by - 3, 3, 0, Math.PI * 2)
        ctx.arc(bx + 5, by - 3, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(bx - 5, by - 3, 1.5, 0, Math.PI * 2)
        ctx.arc(bx + 5, by - 3, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Counter
      ctx.fillStyle = 'rgba(26, 10, 46, 0.8)'
      ctx.beginPath()
      ctx.roundRect(W / 2 - 110, 8, 220, 32, 16)
      ctx.fill()
      ctx.fillStyle = '#f5c842'
      ctx.font = 'bold 14px Nunito, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`Bacteria destroyed: ${destroyed} / ${bacteria.length}`, W / 2, 30)

      // Progress bar
      ctx.fillStyle = '#2a1548'
      ctx.beginPath()
      ctx.roundRect(W / 2 - 100, 46, 200, 6, 3)
      ctx.fill()
      const fillW = 200 * (destroyed / Math.max(1, bacteria.length))
      ctx.fillStyle = '#f5c842'
      ctx.beginPath()
      ctx.roundRect(W / 2 - 100, 46, fillW, 6, 3)
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [phase, bacteria, destroyed])

  // Tap bacteria to destroy
  function handleCanvasTap(e) {
    if (phase !== 'microscope') return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setBacteria(prev => {
      const next = [...prev]
      for (let i = 0; i < next.length; i++) {
        if (!next[i].alive) continue
        const dx = next[i].x - x, dy = next[i].y - y
        if (Math.sqrt(dx * dx + dy * dy) < 8) {
          next[i] = { ...next[i], alive: false }
          setDestroyed(d => {
            const nd = d + 1
            if (nd >= next.filter(b => true).length) {
              setTimeout(() => setPhase('done'), 800)
            }
            return nd
          })
          break
        }
      }
      return next
    })
  }

  function handleContinueToHeal() {
    dispatch({ type: ACTIONS.SET_STAGE, payload: 3 })
  }

  if (!remedy) return null
  const fillPercent = (addedIngredients.length / remedy.correctSet.length) * 100

  // ── Phase Instructions ──
  const instructions = {
    select: 'Tap the ingredients you think belong in this remedy!',
    pour: '🥛 Hold the POUR button to fill the bowl!',
    stir: '🥄 Tap STIR repeatedly to mix the ingredients!',
    heat: '🔥 Hold the HEAT button to warm the remedy!',
    microscope: '🔬 Tap bacteria to destroy them with curcumin!',
    done: '✅ Remedy is ready! Continue to healing.',
  }

  return (
    <div className="bg-animated" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100dvh', padding: '16px', gap: '12px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Title */}
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="font-heading"
        style={{ color: remedy.color, textAlign: 'center', fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)' }}>
        {remedy.icon} {phase === 'microscope' ? 'Microscopic World' : `Prepare ${remedy.name}`}
      </motion.h2>

      <p className="game-text" style={{ color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: '0.85rem' }}>
        {instructions[phase]}
      </p>

      {/* ═══ SELECT PHASE ═══ */}
      {phase === 'select' && (<>
        <motion.div key={shakeKey}
          animate={wrongItem ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ position: 'relative', width: 'clamp(160px, 45vw, 240px)', height: 'clamp(140px, 40vw, 200px)' }}>
          <svg viewBox="0 0 200 180" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="100" cy="130" rx="85" ry="30" fill="#5D4037" opacity="0.3" />
            <path d="M 20 80 Q 20 160 100 160 Q 180 160 180 80 Z" fill="rgba(30,50,80,0.6)" stroke="#90A4AE" strokeWidth="2" />
            <path d="M 20 80 Q 20 160 100 160 Q 180 160 180 80 Z"
              fill={`rgba(${hexToRgb(remedy.color)}, ${fillPercent / 200})`} />
            <ellipse cx="100" cy="80" rx="82" ry="18" fill="rgba(30,50,80,0.3)" stroke="#B0BEC5" strokeWidth="3" />
            {bowlBubbles.map(b => (
              <motion.g key={b.id} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <circle cx={b.x + 50} cy={b.y + 80} r={12} fill={b.color} opacity={0.6} />
                <text x={b.x + 50} y={b.y + 85} fontSize="14" textAnchor="middle">{b.emoji}</text>
              </motion.g>
            ))}
            <text x="100" y="125" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.7">
              {addedIngredients.length} / {remedy.correctSet.length}
            </text>
          </svg>
        </motion.div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', maxWidth: '480px', padding: '8px' }}>
          {allItems.map(item => {
            const added = isAdded(item.id)
            return (
              <motion.button key={item.id} onClick={() => handleIngredientTap(item)} disabled={added}
                whileHover={!added ? { scale: 1.08 } : {}} whileTap={!added ? { scale: 0.92 } : {}}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  padding: '10px 14px', borderRadius: '14px',
                  border: `2px solid ${added ? 'var(--color-heal-green)' : 'rgba(255,255,255,0.15)'}`,
                  background: added ? 'rgba(0,200,83,0.15)' : 'rgba(255,255,255,0.06)',
                  cursor: added ? 'default' : 'pointer', opacity: added ? 0.5 : 1, minWidth: '75px',
                }}>
                <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
                <span style={{ fontSize: '0.65rem', color: added ? 'var(--color-heal-green)' : 'var(--color-text-primary)', fontWeight: 600 }}>
                  {item.name}
                </span>
              </motion.button>
            )
          })}
        </div>
      </>)}

      {/* ═══ POUR PHASE ═══ */}
      {phase === 'pour' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '200px', height: '160px', position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${pourLevel}%`,
              background: `linear-gradient(to top, ${remedy.color}88, ${remedy.color}44)`,
              transition: 'height 0.1s', borderRadius: '0 0 14px 14px' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🥣</div>
          </div>
          <p style={{ color: remedy.color, fontWeight: 700, fontSize: '1.2rem' }}>{Math.round(pourLevel)}%</p>
          <button className="btn-primary"
            onMouseDown={() => {
              const id = setInterval(() => setPourLevel(p => Math.min(100, p + 2)), 50)
              const up = () => { clearInterval(id); window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up) }
              window.addEventListener('mouseup', up); window.addEventListener('touchend', up)
            }}
            onTouchStart={() => {
              const id = setInterval(() => setPourLevel(p => Math.min(100, p + 2)), 50)
              const up = () => { clearInterval(id); window.removeEventListener('touchend', up) }
              window.addEventListener('touchend', up)
            }}
            style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
            🥛 Hold to Pour
          </button>
        </div>
      )}

      {/* ═══ STIR PHASE ═══ */}
      {phase === 'stir' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '200px', height: '200px', position: 'relative' }}>
            <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
              <circle cx="100" cy="100" r="80" fill={`${remedy.color}33`} stroke={remedy.color} strokeWidth="3" />
              <motion.g animate={{ rotate: stirProgress * 3.6 }} style={{ originX: '100px', originY: '100px' }}>
                <line x1="100" y1="100" x2="100" y2="30" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
                <circle cx="100" cy="30" r="8" fill="#5D4037" />
              </motion.g>
              <text x="100" y="108" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">{Math.round(stirProgress)}%</text>
            </svg>
          </div>
          <button className="btn-primary"
            onClick={() => setStirProgress(p => Math.min(100, p + 8))}
            style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
            🥄 Stir! ({Math.round(stirProgress)}%)
          </button>
        </div>
      )}

      {/* ═══ HEAT PHASE ═══ */}
      {phase === 'heat' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '200px', height: '200px', position: 'relative' }}>
            <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="heatGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#FF6D00" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
              <rect x="30" y="140" width="140" height="50" rx="8" fill="#5D4037" />
              <rect x="30" y="140" width="140" height={50 * ((temperature - 25) / 65)} rx="4" fill="url(#heatGrad)" opacity="0.8" />
              <ellipse cx="100" cy="130" rx="60" ry="25" fill={`${remedy.color}66`} stroke={remedy.color} strokeWidth="2" />
              {temperature > 60 && Array.from({ length: 5 }).map((_, i) => (
                <motion.text key={i} x={60 + i * 20} y={120 - (temperature - 60) * 0.5}
                  animate={{ y: [120, 90, 70], opacity: [0.8, 0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  fontSize="16">💨</motion.text>
              ))}
              <text x="100" y="110" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{Math.round(temperature)}°</text>
            </svg>
          </div>
          <button className="btn-primary"
            onMouseDown={() => {
              const id = setInterval(() => setTemperature(t => Math.min(95, t + 1.5)), 60)
              const up = () => { clearInterval(id); window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up) }
              window.addEventListener('mouseup', up); window.addEventListener('touchend', up)
            }}
            onTouchStart={() => {
              const id = setInterval(() => setTemperature(t => Math.min(95, t + 1.5)), 60)
              const up = () => { clearInterval(id); window.removeEventListener('touchend', up) }
              window.addEventListener('touchend', up)
            }}
            style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
            🔥 Hold to Heat
          </button>
        </div>
      )}

      {/* ═══ MICROSCOPE PHASE ═══ */}
      {phase === 'microscope' && (
        <div style={{ width: '100%', maxWidth: '600px', flex: 1, position: 'relative' }}>
          <canvas ref={canvasRef} width={600} height={400} onClick={handleCanvasTap}
            style={{ width: '100%', height: 'auto', borderRadius: '16px', border: `2px solid ${remedy.color}44`, cursor: 'crosshair' }} />
        </div>
      )}

      {/* ═══ DONE PHASE ═══ */}
      {phase === 'done' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
          style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉✨🎊</p>
          <h3 className="font-heading" style={{ color: remedy.color, fontSize: '1.4rem' }}>
            {remedy.name} is Ready!
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
            All bacteria destroyed! Time to heal Arjun.
          </p>
          <button className="btn-primary" onClick={handleContinueToHeal}
            style={{ marginTop: '24px', padding: '14px 36px', fontSize: '1.1rem' }}>
            Continue to Healing →
          </button>
        </motion.div>
      )}

      {/* Wrong ingredient popup */}
      <AnimatePresence>
        {wrongItem && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              background: 'rgba(255,23,68,0.9)', padding: '20px 32px', borderRadius: '20px', zIndex: 100, textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>💥</p>
            <p className="font-heading" style={{ color: 'white', fontSize: '1.1rem' }}>
              Oops! {wrongItem.name} doesn't belong here!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function hexToRgb(hex) {
  if (!hex) return '255,255,255'
  const h = hex.replace('#', '')
  return `${parseInt(h.substring(0, 2), 16)},${parseInt(h.substring(2, 4), 16)},${parseInt(h.substring(4, 6), 16)}`
}
