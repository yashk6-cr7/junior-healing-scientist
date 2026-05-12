/**
 * badges.js — Badge definitions for all 7 days + master badge
 */
export const BADGES = {
  day1: { id: 'day1', name: 'Golden Shield',       emoji: '🛡️', color: 0xf5c842, description: 'Mastered the golden healing power of turmeric!' },
  day2: { id: 'day2', name: 'Basil Guardian',      emoji: '🌿', color: 0x4caf7d, description: 'Unlocked the sacred immunity of holy basil!' },
  day3: { id: 'day3', name: 'Throat Healer',       emoji: '🫚', color: 0xff8c42, description: 'Soothed Arjun\'s throat with ginger & honey!' },
  day4: { id: 'day4', name: 'Steam Master',        emoji: '💨', color: 0x40c4ff, description: 'Cleared the pathways with healing steam!' },
  day5: { id: 'day5', name: 'Immunity Chef',       emoji: '🍲', color: 0xff8f00, description: 'Cooked the ultimate immunity-boosting soup!' },
  day6: { id: 'day6', name: 'Spice Alchemist',     emoji: '⭐', color: 0xe53935, description: 'Activated the triple-pepper amplifier!' },
  day7: { id: 'day7', name: 'Master Healer',       emoji: '👑', color: 0xffd700, description: 'Combined all wisdom into the ultimate kadha!' },
  master: { id: 'master', name: 'Junior Healing Scientist', emoji: '🏆', color: 0xffd700, description: 'Completed all 7 days — a true healing scientist!' },
}

export function getBadgeForDay(day) {
  return BADGES[`day${day}`] || null
}

export function getMasterBadge() {
  return BADGES.master
}
