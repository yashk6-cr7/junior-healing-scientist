# Junior Healing Scientist — Beyond Box

> 🧪 An interactive STEM educational simulation teaching Ayurvedic remedies through inquiry-based learning.

**Client:** Beyond Box ([thebeyondbox.org](https://thebeyondbox.org))  
**Target Users:** Children Grade 1-4 (ages 6-10)  
**Live URL:** *Coming soon — junior-healing-scientist.vercel.app*

---

## What This Project Does

Junior Healing Scientist is a 7-day interactive game where children help a patient named **Arjun** recover from illness using natural Ayurvedic remedies. Each day introduces a new remedy through three stages:

1. **Stage 1 — Meet & Diagnose:** Explore Arjun's symptoms by tapping on them
2. **Stage 2 — Prepare & Observe:** Drag ingredients into a preparation bowl (inquiry-based — no instructions given!)
3. **Stage 3 — Heal & Celebrate:** Watch healing particles flow into Arjun, earn badges

### Core Learning Philosophy
- **Inquiry-based learning** — children explore freely, fail, retry, discover
- Wrong combinations show *interesting* failure animations, not punishment
- Science explanations appear AFTER success, not before
- Unlimited retries, no timer, no lives

### The 7 Remedy Days
| Day | Remedy | Key Science | Badge |
|-----|--------|-------------|-------|
| 1 | 🥛 Haldi Milk | Curcumin blocks NF-kB | Turmeric Scientist 🌟 |
| 2 | 🌿 Tulsi Drink | Eugenol blocks COX enzymes | Herb Explorer 🌿 |
| 3 | 🫚 Ginger Honey | Gingerol antibacterial synergy | Spice Master 🔥 |
| 4 | 💨 Steam Therapy | Mucociliary clearance | Steam Wizard 💨 |
| 5 | 🍲 Herbal Soup | Allicin disrupts bacteria | Soup Chef 🍲 |
| 6 | ⭐ Spice Mix | Piperine 2000% bioavailability | Spice Blender ⭐ |
| 7 | 👑 Kadha | Polyherbal synergism | Master Healer 👑 |

Complete all 7 days → **Junior Healing Scientist 🏆** master badge!

---

## How to Run Locally

```bash
git clone https://github.com/[your-username]/junior-healing-scientist.git
cd junior-healing-scientist
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## How to Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
3. Click "New Project" → Import the GitHub repo
4. Settings:
   - **Framework:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`
5. Click Deploy
6. For custom domain `lab.thebeyondbox.org`:
   - Vercel project → Settings → Domains → Add domain
   - Add DNS records shown by Vercel to your domain registrar

Every push to `main` auto-deploys.

---

## Project Structure

```
junior-healing-scientist/
├── index.html                   ← Entry point
├── package.json                 ← Dependencies
├── vite.config.js               ← Vite + Tailwind config
│
├── public/
│   ├── favicon.svg
│   ├── sounds/                  ← .mp3 sound effects
│   ├── images/                  ← Static images
│   │   └── badges/              ← Badge images
│   └── fonts/                   ← Custom fonts
│
└── src/
    ├── main.jsx                 ← React entry + GameProvider
    ├── App.jsx                  ← Stage routing + layout
    ├── index.css                ← Design system + Tailwind
    │
    ├── components/              ← Reusable UI components
    │   ├── ProgressBar.jsx      ← Healing progress bar
    │   ├── FlashCard.jsx        ← Science fact cards
    │   ├── Badge.jsx            ← Individual badge
    │   ├── BadgeCollection.jsx  ← All badges grid
    │   ├── PatientCharacter.jsx ← Arjun character
    │   ├── ParticleCanvas.jsx   ← Three.js wrapper
    │   └── SoundManager.jsx     ← Audio controls
    │
    ├── stages/                  ← Game stages
    │   ├── Stage1_Diagnose.jsx  ← Meet Arjun + symptoms
    │   ├── Stage2_Prepare.jsx   ← Remedy preparation
    │   └── Stage3_Heal.jsx      ← Healing + celebration
    │
    ├── days/                    ← Per-day configs
    │   ├── Day1_HaldiMilk.jsx
    │   ├── Day2_TulsiDrink.jsx
    │   ├── Day3_GingerHoney.jsx
    │   ├── Day4_SteamTherapy.jsx
    │   ├── Day5_HerbalSoup.jsx
    │   ├── Day6_SpiceMix.jsx
    │   └── Day7_Kadha.jsx
    │
    ├── particles/               ← Three.js particle scenes
    │   ├── ParticleEngine.js    ← Core Three.js setup
    │   ├── HaldiParticles.js
    │   ├── TulsiParticles.js
    │   ├── GingerParticles.js
    │   ├── SteamParticles.js
    │   ├── SoupParticles.js
    │   ├── SpiceParticles.js
    │   └── KadhaParticles.js
    │
    ├── data/                    ← Game data
    │   ├── remedies.js          ← 7 remedy definitions
    │   ├── symptoms.js          ← Patient symptoms
    │   ├── badges.js            ← Badge definitions
    │   ├── flashcards.js        ← Science facts
    │   └── particles.js         ← Particle configs
    │
    ├── hooks/                   ← Custom hooks
    │   ├── useGameState.js      ← Global state access
    │   ├── useBadges.js         ← Badge logic
    │   ├── useSound.js          ← Sound management
    │   └── useProgress.js       ← Progress tracking
    │
    ├── context/                 ← React context
    │   └── GameContext.jsx      ← State provider + reducer
    │
    └── utils/                   ← Helpers
        ├── localStorage.js      ← Save/load progress
        ├── particles.js         ← Particle math
        └── responsive.js        ← Device detection
```

---

## How to Add a New Remedy Day

1. Add remedy data to `src/data/remedies.js` (copy existing day, change values)
2. Add badge to `src/data/badges.js`
3. Add flashcard to `src/data/flashcards.js`
4. Add particle config to `src/data/particles.js`
5. Create `src/days/DayN_Name.jsx` (copy Day1 as template)
6. Create `src/particles/NameParticles.js` (copy HaldiParticles as template)
7. Update total days count in `useProgress.js` and `GameContext.jsx`

---

## How to Change Character Images

1. Place images in `public/images/`:
   - `arjun-sick.png` — sick state
   - `arjun-recovering.png` — recovering state
   - `arjun-healthy.png` — healthy state
2. Update `src/components/PatientCharacter.jsx` to use `<img>` tags instead of emoji placeholders
3. Recommended size: 300x300px PNG with transparent background

---

## How to Add New Badges

1. Add badge definition to `src/data/badges.js`:
   ```js
   {
     id: 'unique_id',
     name: 'Display Name',
     emoji: '🎯',
     day: 8,  // or 'all' for completion badges
     remedy: 'Remedy Name',
     color: '#HEX',
     description: 'Earned when...',
   }
   ```
2. Place badge image in `public/images/badges/unique_id.png` (optional)
3. Badge auto-appears in `BadgeCollection` component

---

## Technology Decisions

| Technology | Why |
|-----------|-----|
| **React + Vite** | Fast dev server, simple setup, great HMR |
| **Framer Motion** | Declarative animations, spring physics for kid-friendly UI |
| **Three.js (plain)** | Direct control over particle scenes, no R3F complexity |
| **Tailwind CSS** | Rapid responsive styling with utility classes |
| **Howler.js** | Reliable cross-browser audio with sprite support |
| **localStorage** | Zero-backend badge persistence, works offline |
| **Vercel** | Auto-deploy from GitHub, free tier sufficient |

**NOT used (and why):**
- Next.js — overkill for a single-page game
- React Three Fiber — too complex to debug for particle scenes
- CSS-in-JS — unnecessary overhead
- Backend/database — no auth needed, localStorage sufficient

---

## Known Issues

- [ ] Sound files not yet added (Task 8)
- [ ] Character uses emoji placeholders — needs real illustrations
- [ ] Particle scenes use default drift — need day-specific behaviors
- [ ] Drag-and-drop not yet implemented for Stage 2

---

## Progress Log

| Date | Task | Status |
|------|------|--------|
| 2026-05-07 | Task 1 — Project Setup | ✅ Complete |
| | Task 2 — Game State Foundation | ⬜ Pending |
| | Task 3 — Stage 1 (Meet & Diagnose) | ⬜ Pending |
| | Task 4 — Stage 2 Day 1 (Haldi Milk) | ⬜ Pending |
| | Task 5 — Particle Engine | ⬜ Pending |
| | Task 6 — Stage 3 (Heal & Celebrate) | ⬜ Pending |
| | Task 7 — Remaining Days (2-7) | ⬜ Pending |
| | Task 8 — Polish (sounds, responsive) | ⬜ Pending |
| | Task 9 — Deploy | ⬜ Pending |

---

## License

Built for Beyond Box educational platform. All rights reserved.
