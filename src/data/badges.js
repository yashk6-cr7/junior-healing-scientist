/**
 * badges.js — Badge definitions per Section 9 spec
 * Exactly matches the spec badge list.
 */

export const BADGES = [
  {
    id: 'turmeric_scientist',
    name: 'Turmeric Scientist',
    emoji: '🌟',
    day: 1,
    remedy: 'Haldi Milk',
    color: '#FFD700',
    description: 'Discovered the power of Curcumin!',
  },
  {
    id: 'herb_explorer',
    name: 'Herb Explorer',
    emoji: '🌿',
    day: 2,
    remedy: 'Tulsi Drink',
    color: '#00C853',
    description: 'Unlocked Tulsi\'s healing secrets!',
  },
  {
    id: 'spice_master',
    name: 'Spice Master',
    emoji: '🔥',
    day: 3,
    remedy: 'Ginger Honey',
    color: '#FF6D00',
    description: 'Combined Gingerol and Honey power!',
  },
  {
    id: 'steam_wizard',
    name: 'Steam Wizard',
    emoji: '💨',
    day: 4,
    remedy: 'Steam Therapy',
    color: '#40C4FF',
    description: 'Mastered the power of steam!',
  },
  {
    id: 'soup_chef',
    name: 'Soup Chef',
    emoji: '🍲',
    day: 5,
    remedy: 'Herbal Soup',
    color: '#FF8F00',
    description: 'Brewed the perfect healing soup!',
  },
  {
    id: 'spice_blender',
    name: 'Spice Blender',
    emoji: '⭐',
    day: 6,
    remedy: 'Spice Mix',
    color: '#E040FB',
    description: 'Blended the Trikatu power mix!',
  },
  {
    id: 'master_healer',
    name: 'Master Healer',
    emoji: '👑',
    day: 7,
    remedy: 'Kadha',
    color: '#FFD700',
    description: 'Created the ultimate Kadha!',
  },
  {
    id: 'junior_healing_scientist',
    name: 'Junior Healing Scientist',
    emoji: '🏆',
    day: 'all',
    remedy: 'Complete Journey',
    color: '#FFD700',
    description: 'Completed the full healing journey!',
  },
]

export function getBadgeById(id) {
  return BADGES.find(b => b.id === id)
}

export function getBadgeForDay(day) {
  return BADGES.find(b => b.day === day)
}
