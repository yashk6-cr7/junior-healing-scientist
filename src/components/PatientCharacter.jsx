/**
 * PatientCharacter.jsx — Arjun character with 3 health states
 * sick: droopy, pale, slow breathing animation
 * recovering: brighter, more upright
 * healthy: bright, smiling, bouncing
 * 
 * Uses SVG-drawn character (no external image dependency for Task 3).
 * Images (arjun-sick.png etc.) can replace in Task 8 polish.
 */
import { motion } from 'framer-motion'

// ─── Per-state visual config ──────────────────────────────────────────────────
const STATES = {
  sick: {
    skinColor: '#C8A882',
    shirtColor: '#78909C',
    eyeOpenAmount: 0.4,       // droopy eyes (fraction of full open)
    mouthCurve: -8,           // frown
    cheekColor: 'transparent',
    glow: 'none',
    floatY: [0, 3, 0],
    floatDuration: 3.5,
    label: 'Arjun is sick 😟',
    bgGlow: 'rgba(120,144,156,0.15)',
  },
  recovering: {
    skinColor: '#D4A96A',
    shirtColor: '#5C8A5E',
    eyeOpenAmount: 0.7,
    mouthCurve: 2,
    cheekColor: 'rgba(255,150,100,0.3)',
    glow: 'none',
    floatY: [0, -5, 0],
    floatDuration: 2.5,
    label: 'Arjun is recovering! 🙂',
    bgGlow: 'rgba(92,138,94,0.2)',
  },
  healthy: {
    skinColor: '#E8B87A',
    shirtColor: '#00C853',
    eyeOpenAmount: 1.0,
    mouthCurve: 12,
    cheekColor: 'rgba(255,100,100,0.35)',
    glow: '0 0 30px rgba(0,255,136,0.4)',
    floatY: [0, -12, 0],
    floatDuration: 1.5,
    label: 'Arjun is healthy! 🎉',
    bgGlow: 'rgba(0,200,83,0.2)',
  },
}

export default function PatientCharacter({ health = 'sick', size = 160, showLabel = true }) {
  const cfg = STATES[health] || STATES.sick
  const s = size        // shorthand
  const cx = s / 2      // center x
  const headR = s * 0.28
  const headCY = s * 0.30

  // Eye geometry
  const eyeW = headR * 0.22
  const eyeH = headR * 0.18 * cfg.eyeOpenAmount
  const eyeY = headCY - headR * 0.04
  const eyeLX = cx - headR * 0.30
  const eyeRX = cx + headR * 0.30

  // Mouth path
  const mouthY = headCY + headR * 0.38
  const mouthW = headR * 0.36
  const mouth = `M ${cx - mouthW} ${mouthY} Q ${cx} ${mouthY + cfg.mouthCurve} ${cx + mouthW} ${mouthY}`

  // Body
  const bodyTop = headCY + headR * 0.9
  const bodyW = s * 0.38
  const bodyH = s * 0.32
  const bodyLeft = cx - bodyW / 2

  // Arms
  const armY = bodyTop + bodyH * 0.15
  const armLen = s * 0.24
  // sick: droopy arms angled down; healthy: up
  const armAngle = health === 'healthy' ? -35 : health === 'recovering' ? 10 : 30

  // Legs
  const legTop = bodyTop + bodyH
  const legW = bodyW * 0.28
  const legH = s * 0.20

  return (
    <motion.div
      animate={{ y: cfg.floatY }}
      transition={{ duration: cfg.floatDuration, repeat: Infinity, ease: 'easeInOut' }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
    >
      <motion.div
        style={{
          borderRadius: '50%',
          padding: 8,
          background: cfg.bgGlow,
          boxShadow: cfg.glow,
          transition: 'all 0.6s ease',
        }}
      >
        <svg
          width={s}
          height={s * 1.1}
          viewBox={`0 0 ${s} ${s * 1.1}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Arjun — ${health}`}
        >
          {/* ── Legs ── */}
          <rect x={cx - bodyW * 0.25 - legW} y={legTop} width={legW} height={legH}
            rx={legW / 2} fill="#5D4037" />
          <rect x={cx + bodyW * 0.25} y={legTop} width={legW} height={legH}
            rx={legW / 2} fill="#5D4037" />

          {/* ── Body (shirt) ── */}
          <rect x={bodyLeft} y={bodyTop} width={bodyW} height={bodyH}
            rx={8} fill={cfg.shirtColor} />

          {/* ── Left arm ── */}
          <motion.line
            x1={bodyLeft} y1={armY}
            x2={bodyLeft - armLen * Math.cos(armAngle * Math.PI / 180)}
            y2={armY + armLen * Math.sin(armAngle * Math.PI / 180)}
            stroke={cfg.shirtColor} strokeWidth={s * 0.07} strokeLinecap="round"
          />

          {/* ── Right arm ── */}
          <motion.line
            x1={bodyLeft + bodyW} y1={armY}
            x2={bodyLeft + bodyW + armLen * Math.cos(armAngle * Math.PI / 180)}
            y2={armY + armLen * Math.sin(armAngle * Math.PI / 180)}
            stroke={cfg.shirtColor} strokeWidth={s * 0.07} strokeLinecap="round"
          />

          {/* ── Neck ── */}
          <rect x={cx - s * 0.06} y={headCY + headR * 0.85} width={s * 0.12} height={headR * 0.12}
            fill={cfg.skinColor} />

          {/* ── Head ── */}
          <circle cx={cx} cy={headCY} r={headR} fill={cfg.skinColor} />

          {/* ── Hair ── */}
          <ellipse cx={cx} cy={headCY - headR * 0.78} rx={headR * 0.90} ry={headR * 0.35}
            fill="#3E2723" />
          <ellipse cx={cx - headR * 0.55} cy={headCY - headR * 0.55} rx={headR * 0.28} ry={headR * 0.45}
            fill="#3E2723" />
          <ellipse cx={cx + headR * 0.55} cy={headCY - headR * 0.55} rx={headR * 0.28} ry={headR * 0.45}
            fill="#3E2723" />

          {/* ── Cheeks ── */}
          <ellipse cx={eyeLX - eyeW * 0.3} cy={eyeY + eyeH * 2.5} rx={eyeW * 0.9} ry={eyeW * 0.5}
            fill={cfg.cheekColor} />
          <ellipse cx={eyeRX + eyeW * 0.3} cy={eyeY + eyeH * 2.5} rx={eyeW * 0.9} ry={eyeW * 0.5}
            fill={cfg.cheekColor} />

          {/* ── Eyes (whites) ── */}
          <ellipse cx={eyeLX} cy={eyeY} rx={eyeW} ry={Math.max(1, eyeH * 1.4)} fill="white" />
          <ellipse cx={eyeRX} cy={eyeY} rx={eyeW} ry={Math.max(1, eyeH * 1.4)} fill="white" />

          {/* ── Pupils ── */}
          <circle cx={eyeLX} cy={eyeY + 1} r={eyeW * 0.55} fill="#1A1A1A" />
          <circle cx={eyeRX} cy={eyeY + 1} r={eyeW * 0.55} fill="#1A1A1A" />
          {/* Eye shine */}
          <circle cx={eyeLX + eyeW * 0.2} cy={eyeY - eyeH * 0.3} r={eyeW * 0.18} fill="white" />
          <circle cx={eyeRX + eyeW * 0.2} cy={eyeY - eyeH * 0.3} r={eyeW * 0.18} fill="white" />

          {/* ── Mouth ── */}
          <path d={mouth} stroke="#5D4037" strokeWidth={s * 0.025}
            fill="none" strokeLinecap="round" />

          {/* ── Healthy sparkles ── */}
          {health === 'healthy' && <>
            <text x={cx + headR * 0.9} y={headCY - headR * 0.8} fontSize={s * 0.12} opacity={0.9}>✨</text>
            <text x={cx - headR * 1.1} y={headCY - headR * 0.6} fontSize={s * 0.10} opacity={0.8}>⭐</text>
          </>}

          {/* ── Sick sweat drops ── */}
          {health === 'sick' && <>
            <ellipse cx={cx + headR * 0.85} cy={headCY - headR * 0.2} rx={s * 0.02} ry={s * 0.035}
              fill="#64B5F6" opacity={0.7} />
            <ellipse cx={cx + headR * 0.95} cy={headCY + headR * 0.1} rx={s * 0.015} ry={s * 0.025}
              fill="#64B5F6" opacity={0.5} />
          </>}
        </svg>
      </motion.div>

      {showLabel && (
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
        }}>
          {cfg.label}
        </p>
      )}
    </motion.div>
  )
}
