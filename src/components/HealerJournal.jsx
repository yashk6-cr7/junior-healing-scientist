/**
 * HealerJournal.jsx — Collectible ingredient knowledge cards
 * Floats as a button in the top-left corner, opens a slide-up panel
 * Cards unlock as the player progresses through days
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// All ingredient science cards — unlocked by day
const JOURNAL_ENTRIES = [
  {
    id: 'turmeric', unlocksOnDay: 1, emoji: '🌿', name: 'Turmeric',
    color: '#FFD700', tag: 'Anti-inflammatory',
    fact: 'Contains Curcumin — a molecule that blocks the NF-kB "alarm signal" that causes inflammation.',
    bodyPart: 'Whole body', power: 'Fights swelling & germs',
    funFact: 'It\'s been used in India for over 4,000 years! Ancient texts called it "the golden healer".',
  },
  {
    id: 'milk', unlocksOnDay: 1, emoji: '🥛', name: 'Warm Milk',
    color: '#FFFDE7', tag: 'Sleep booster',
    fact: 'Contains tryptophan, which the body converts into melatonin — the sleep chemical!',
    bodyPart: 'Brain', power: 'Helps you rest and recover',
    funFact: 'Your body heals itself most during deep sleep. Warm milk makes healing happen faster!',
  },
  {
    id: 'blackpepper', unlocksOnDay: 1, emoji: '⚫', name: 'Black Pepper',
    color: '#78909C', tag: 'Absorption booster',
    fact: 'Piperine in pepper opens special "doors" (TRPV1 channels) in your gut so curcumin is absorbed 2000% better!',
    bodyPart: 'Digestive system', power: 'Supercharges other medicines',
    funFact: 'Without black pepper, turmeric passes through you barely absorbed. Together they\'re unstoppable!',
  },
  {
    id: 'tulsi', unlocksOnDay: 2, emoji: '🌱', name: 'Tulsi (Holy Basil)',
    color: '#00C853', tag: 'Adaptogen',
    fact: 'Eugenol in Tulsi coats throat cells, preventing viruses from attaching. It\'s like a force field!',
    bodyPart: 'Throat & Lungs', power: 'Antiviral shield',
    funFact: 'In Ayurveda, Tulsi is called "The Queen of Herbs". Every part — leaf, stem, seed — has healing powers.',
  },
  {
    id: 'ginger', unlocksOnDay: 2, emoji: '🫚', name: 'Ginger',
    color: '#FF8F00', tag: 'Antiviral',
    fact: 'Gingerol molecules are shaped like tiny heat missiles that break apart bacteria cell walls!',
    bodyPart: 'Throat & Stomach', power: 'Kills bacteria & soothes pain',
    funFact: 'Ginger was so valuable in medieval Europe that 1 pound of ginger cost as much as 1 sheep!',
  },
  {
    id: 'honey', unlocksOnDay: 2, emoji: '🍯', name: 'Raw Honey',
    color: '#FFA000', tag: 'Antimicrobial',
    fact: 'Honey produces hydrogen peroxide (H₂O₂) — the same chemical used in wound cleaners — killing bacteria naturally!',
    bodyPart: 'Throat & Gut', power: 'Coats & soothes sore throat',
    funFact: 'Archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible! Bacteria can\'t survive in it.',
  },
  {
    id: 'lemon', unlocksOnDay: 3, emoji: '🍋', name: 'Lemon',
    color: '#FDD835', tag: 'Vitamin C boost',
    fact: 'Vitamin C stimulates production of white blood cells — your body\'s germ-fighting army! One lemon = 40% of daily Vitamin C.',
    bodyPart: 'Immune system', power: 'Activates immune army',
    funFact: 'British sailors used to carry limes on ships to prevent scurvy (Vitamin C deficiency). That\'s why they\'re called "Limeys"!',
  },
  {
    id: 'steam', unlocksOnDay: 4, emoji: '💨', name: 'Steam',
    color: '#40C4FF', tag: 'Decongestant',
    fact: 'Hot steam (above 40°C) physically melts mucus and the heat damages the protein coating of many viruses!',
    bodyPart: 'Nose & Lungs', power: 'Clears blocked airways',
    funFact: 'The earliest record of steam inhalation is from Ancient Egypt, 3500 years ago!',
  },
  {
    id: 'eucalyptus', unlocksOnDay: 4, emoji: '🌿', name: 'Eucalyptus Oil',
    color: '#26A69A', tag: 'Bronchodilator',
    fact: 'Cineole in eucalyptus oil signals the muscles around your airways to relax and open wider — like widening a blocked road!',
    bodyPart: 'Lungs', power: 'Opens up the airway',
    funFact: 'Koalas eat only eucalyptus leaves (which are toxic to most animals!) because they evolved special livers to handle it.',
  },
  {
    id: 'garlic', unlocksOnDay: 5, emoji: '🧄', name: 'Garlic',
    color: '#F5F5DC', tag: 'Antibiotic',
    fact: 'Allicin — released when garlic is crushed — is one of nature\'s most powerful antibiotics. It can fight bacteria that even antibiotics can\'t!',
    bodyPart: 'Whole body', power: 'Nature\'s antibiotic',
    funFact: 'During World War I, the British army ran out of antibiotics and used garlic juice to treat infected wounds — and it worked!',
  },
  {
    id: 'cinnamon', unlocksOnDay: 7, emoji: '🌿', name: 'Cinnamon',
    color: '#8D6E63', tag: 'Antioxidant',
    fact: 'Cinnamaldehyde in cinnamon activates brown adipose tissue — special fat cells that generate heat and boost your metabolism!',
    bodyPart: 'Blood & Gut', power: 'Warms from the inside',
    funFact: 'Cinnamon was once worth more than gold. Ancient Romans burned it at funerals as a luxury offering to the gods!',
  },
]

export default function HealerJournal({ currentDay }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  const unlockedEntries = JOURNAL_ENTRIES.filter(e => e.unlocksOnDay <= currentDay)
  const lockedCount = JOURNAL_ENTRIES.length - unlockedEntries.length

  return (
    <>
      {/* ── Floating Journal Button ── */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', top: '16px', left: '80px', zIndex: 100,
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(255,215,0,0.15)',
          border: '2px solid rgba(255,215,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255,215,0,0.2)',
        }}>
        📖
        {/* Badge count */}
        <div style={{
          position: 'absolute', top: -4, right: -4,
          width: 18, height: 18, borderRadius: '50%',
          background: '#FFD700', color: '#000',
          fontSize: '0.6rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {unlockedEntries.length}
        </div>
      </motion.button>

      {/* ── Journal Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); setSelectedEntry(null) }}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              }}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
                maxHeight: '85vh', borderRadius: '24px 24px 0 0',
                background: 'linear-gradient(135deg, #0f1a2e 0%, #1a0a2e 100%)',
                border: '1px solid rgba(255,215,0,0.2)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}>
              {/* Header */}
              <div style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <div>
                  <h2 style={{ color: '#FFD700', fontSize: '1.2rem', fontWeight: 800, marginBottom: '2px' }}>
                    📖 Healer's Journal
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                    {unlockedEntries.length} ingredients discovered · {lockedCount} still locked 🔒
                  </p>
                </div>
                <button onClick={() => { setIsOpen(false); setSelectedEntry(null) }}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    color: 'white', fontSize: '1rem', cursor: 'pointer',
                  }}>✕</button>
              </div>

              {/* Detail view or grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                <AnimatePresence mode="wait">
                  {selectedEntry ? (
                    /* ── Detail card ── */
                    <motion.div key="detail"
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                      <button onClick={() => setSelectedEntry(null)}
                        style={{
                          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                          fontSize: '0.85rem', cursor: 'pointer', marginBottom: '16px',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                        ← Back to Journal
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Icon + name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: 64, height: 64, borderRadius: '16px',
                            background: `${selectedEntry.color}22`,
                            border: `2px solid ${selectedEntry.color}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem',
                          }}>
                            {selectedEntry.emoji}
                          </div>
                          <div>
                            <p style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>{selectedEntry.name}</p>
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                              background: `${selectedEntry.color}22`, color: selectedEntry.color,
                            }}>{selectedEntry.tag}</span>
                          </div>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {[
                            { label: 'Body Part', value: selectedEntry.bodyPart, icon: '🎯' },
                            { label: 'Power', value: selectedEntry.power, icon: '⚡' },
                          ].map((s, i) => (
                            <div key={i} style={{
                              flex: 1, padding: '10px 12px', borderRadius: '12px',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>{s.icon} {s.label}</p>
                              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Science fact */}
                        <div style={{
                          padding: '14px 16px', borderRadius: '12px',
                          background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.2)',
                        }}>
                          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00C853', marginBottom: '6px', textTransform: 'uppercase' }}>🔬 How It Works</p>
                          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{selectedEntry.fact}</p>
                        </div>

                        {/* Fun fact */}
                        <div style={{
                          padding: '14px 16px', borderRadius: '12px',
                          background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)',
                        }}>
                          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FFD700', marginBottom: '6px', textTransform: 'uppercase' }}>💡 Did You Know?</p>
                          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{selectedEntry.funFact}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Grid view ── */
                    <motion.div key="grid"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '10px',
                      }}>
                        {/* Unlocked entries */}
                        {unlockedEntries.map((entry, i) => (
                          <motion.button key={entry.id}
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedEntry(entry)}
                            style={{
                              padding: '14px 12px', borderRadius: '14px', cursor: 'pointer',
                              background: `${entry.color}11`,
                              border: `1px solid ${entry.color}33`,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                              textAlign: 'center',
                            }}>
                            <span style={{ fontSize: '2rem' }}>{entry.emoji}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{entry.name}</span>
                            <span style={{
                              fontSize: '0.62rem', padding: '2px 8px', borderRadius: '10px',
                              background: `${entry.color}22`, color: entry.color, fontWeight: 600,
                            }}>{entry.tag}</span>
                          </motion.button>
                        ))}
                        {/* Locked placeholders */}
                        {Array.from({ length: lockedCount }).map((_, i) => (
                          <div key={`locked-${i}`} style={{
                            padding: '14px 12px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                          }}>
                            <span style={{ fontSize: '2rem', filter: 'grayscale(1) opacity(0.3)' }}>🔒</span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>Locked</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
