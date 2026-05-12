/**
 * flashcards.js — Science fact content per Section 12 spec
 * Each flashcard appears AFTER success (inquiry-based: explanation after discovery).
 */

export const FLASHCARDS = {
  day1: {
    title: 'Turmeric Power! 🌟',
    fact: 'Curcumin in turmeric fights the tiny germs making Arjun sick!',
    science: 'Curcumin blocks NF-kB — the germ alarm in our body',
    color: '#FFD700',
  },
  day2: {
    title: 'Tulsi Magic! 🌿',
    fact: 'Eugenol in tulsi stops pain the same way medicine does!',
    science: 'Eugenol blocks COX enzymes — the pain makers in our body',
    color: '#00C853',
  },
  day3: {
    title: 'Ginger + Honey = Germ Fighter! 🔥',
    fact: 'Together they surround and destroy harmful bacteria!',
    science: 'Gingerol + hydrogen peroxide create synergistic antibacterial action',
    color: '#FF6D00',
  },
  day4: {
    title: 'Steam Clears the Way! 💨',
    fact: 'Warm steam helps tiny hairs in your nose sweep away germs!',
    science: 'Heat increases mucociliary clearance in nasal passages',
    color: '#40C4FF',
  },
  day5: {
    title: 'Soup Superpower! 🍲',
    fact: 'Allicin from garlic pokes holes in germ walls and destroys them!',
    science: 'Allicin disrupts bacterial thiol chemistry and cell walls',
    color: '#FF8F00',
  },
  day6: {
    title: 'Piperine Amplifier! ⭐',
    fact: 'Black pepper makes all other remedies 20x more powerful!',
    science: 'Piperine inhibits CYP3A4 increasing bioavailability by 2000%',
    color: '#E040FB',
  },
  day7: {
    title: 'The Ultimate Kadha! 👑',
    fact: 'All 7 healing powers united in one magical drink!',
    science: 'Polyherbal synergism attacks illness from multiple pathways',
    color: '#FFD700',
  },
}

export function getFlashcard(day) {
  return FLASHCARDS[`day${day}`] || null
}
