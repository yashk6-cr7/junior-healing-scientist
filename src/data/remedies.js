/**
 * remedies.js — All 7 remedy definitions
 * Each day has a unique remedy with ingredients and preparation rules.
 */

export const REMEDIES = [
  {
    day: 1,
    name: 'Haldi Milk',
    nameHindi: 'हल्दी दूध',
    subtitle: 'Golden Healing Milk',
    icon: '🥛',
    color: '#FFD700',
    colorLight: '#FFF9C4',
    description: 'A warm golden drink made with turmeric and milk to fight infection.',
    ingredients: [
      { id: 'milk', name: 'Milk', emoji: '🥛', color: '#FFFFFF' },
      { id: 'haldi', name: 'Haldi (Turmeric)', emoji: '🟡', color: '#FFD700' },
      { id: 'black_pepper', name: 'Black Pepper', emoji: '⚫', color: '#333333' },
      { id: 'honey', name: 'Honey', emoji: '🍯', color: '#FFA000' },
    ],
    // Distractors — wrong ingredients that cause fun failure animations
    distractors: [
      { id: 'ketchup', name: 'Ketchup', emoji: '🍅', color: '#FF1744' },
      { id: 'ice_cream', name: 'Ice Cream', emoji: '🍦', color: '#E1BEE7' },
    ],
    correctSet: ['milk', 'haldi', 'black_pepper', 'honey'],
    particleScene: 'HaldiParticles',
  },
  {
    day: 2,
    name: 'Tulsi Drink',
    nameHindi: 'तुलसी पेय',
    subtitle: 'Holy Basil Brew',
    icon: '🌿',
    color: '#00C853',
    colorLight: '#C8E6C9',
    description: 'A herbal brew with holy basil leaves to boost immunity.',
    ingredients: [
      { id: 'water', name: 'Water', emoji: '💧', color: '#40C4FF' },
      { id: 'tulsi_leaves', name: 'Tulsi Leaves', emoji: '🌿', color: '#00C853' },
      { id: 'ginger', name: 'Ginger', emoji: '🫚', color: '#FF8F00' },
      { id: 'honey', name: 'Honey', emoji: '🍯', color: '#FFA000' },
    ],
    distractors: [
      { id: 'cola', name: 'Cola', emoji: '🥤', color: '#4E342E' },
      { id: 'chips', name: 'Chips', emoji: '🍟', color: '#FFD54F' },
    ],
    correctSet: ['water', 'tulsi_leaves', 'ginger', 'honey'],
    particleScene: 'TulsiParticles',
  },
  {
    day: 3,
    name: 'Ginger Honey',
    nameHindi: 'अदरक शहद',
    subtitle: 'Ginger Honey Mix',
    icon: '🫚',
    color: '#FF6D00',
    colorLight: '#FFE0B2',
    description: 'Warm ginger and honey mixture to fight bacteria and soothe the throat.',
    ingredients: [
      { id: 'warm_water', name: 'Warm Water', emoji: '♨️', color: '#BBDEFB' },
      { id: 'ginger_juice', name: 'Ginger Juice', emoji: '🫚', color: '#FF6D00' },
      { id: 'honey', name: 'Honey', emoji: '🍯', color: '#FFA000' },
      { id: 'lemon', name: 'Lemon', emoji: '🍋', color: '#FDD835' },
    ],
    distractors: [
      { id: 'chocolate', name: 'Chocolate', emoji: '🍫', color: '#5D4037' },
      { id: 'candy', name: 'Candy', emoji: '🍬', color: '#E040FB' },
    ],
    correctSet: ['warm_water', 'ginger_juice', 'honey', 'lemon'],
    particleScene: 'GingerParticles',
  },
  {
    day: 4,
    name: 'Steam Therapy',
    nameHindi: 'भाप चिकित्सा',
    subtitle: 'Healing Steam',
    icon: '💨',
    color: '#40C4FF',
    colorLight: '#E1F5FE',
    description: 'Warm steam therapy to clear nasal passages and fight congestion.',
    ingredients: [
      { id: 'hot_water', name: 'Hot Water', emoji: '♨️', color: '#E3F2FD' },
      { id: 'eucalyptus', name: 'Eucalyptus Oil', emoji: '🌿', color: '#43A047' },
      { id: 'towel', name: 'Towel', emoji: '🧣', color: '#FFFFFF' },
      { id: 'bowl', name: 'Large Bowl', emoji: '🥣', color: '#B0BEC5' },
    ],
    distractors: [
      { id: 'cold_water', name: 'Cold Water', emoji: '🧊', color: '#90CAF9' },
      { id: 'fan', name: 'Fan', emoji: '💨', color: '#CFD8DC' },
    ],
    correctSet: ['hot_water', 'eucalyptus', 'towel', 'bowl'],
    particleScene: 'SteamParticles',
  },
  {
    day: 5,
    name: 'Herbal Soup',
    nameHindi: 'जड़ी-बूटी सूप',
    subtitle: 'Immunity Soup',
    icon: '🍲',
    color: '#FF8F00',
    colorLight: '#FFF3E0',
    description: 'A warm herbal soup packed with garlic and spices for immunity.',
    ingredients: [
      { id: 'vegetable_broth', name: 'Vegetable Broth', emoji: '🍲', color: '#FF8F00' },
      { id: 'garlic', name: 'Garlic', emoji: '🧄', color: '#F5F5DC' },
      { id: 'turmeric', name: 'Turmeric', emoji: '🟡', color: '#FFD700' },
      { id: 'black_pepper', name: 'Black Pepper', emoji: '⚫', color: '#333333' },
    ],
    distractors: [
      { id: 'pizza', name: 'Pizza', emoji: '🍕', color: '#FF7043' },
      { id: 'burger', name: 'Burger', emoji: '🍔', color: '#8D6E63' },
    ],
    correctSet: ['vegetable_broth', 'garlic', 'turmeric', 'black_pepper'],
    particleScene: 'SoupParticles',
  },
  {
    day: 6,
    name: 'Spice Mix',
    nameHindi: 'मसाला मिश्रण',
    subtitle: 'Trikatu Power Mix',
    icon: '⭐',
    color: '#E040FB',
    colorLight: '#F3E5F5',
    description: 'A powerful spice mix (Trikatu) that amplifies all other remedies.',
    ingredients: [
      { id: 'black_pepper', name: 'Black Pepper', emoji: '⚫', color: '#333333' },
      { id: 'long_pepper', name: 'Long Pepper', emoji: '🌶️', color: '#D32F2F' },
      { id: 'dry_ginger', name: 'Dry Ginger', emoji: '🫚', color: '#BCAAA4' },
      { id: 'honey', name: 'Honey', emoji: '🍯', color: '#FFA000' },
    ],
    distractors: [
      { id: 'sugar', name: 'Sugar', emoji: '🍬', color: '#FFFFFF' },
      { id: 'salt', name: 'Salt', emoji: '🧂', color: '#ECEFF1' },
    ],
    correctSet: ['black_pepper', 'long_pepper', 'dry_ginger', 'honey'],
    particleScene: 'SpiceParticles',
  },
  {
    day: 7,
    name: 'Kadha',
    nameHindi: 'काढ़ा',
    subtitle: 'The Ultimate Healing Drink',
    icon: '👑',
    color: '#FFD700',
    colorLight: '#FFF9C4',
    description: 'The ultimate healing Kadha combining all 7 days of wisdom.',
    ingredients: [
      { id: 'water', name: 'Water', emoji: '💧', color: '#40C4FF' },
      { id: 'tulsi', name: 'Tulsi', emoji: '🌿', color: '#00C853' },
      { id: 'ginger', name: 'Ginger', emoji: '🫚', color: '#FF6D00' },
      { id: 'haldi', name: 'Haldi', emoji: '🟡', color: '#FFD700' },
      { id: 'dalchini', name: 'Dalchini (Cinnamon)', emoji: '🫕', color: '#8D6E63' },
      { id: 'black_pepper', name: 'Black Pepper', emoji: '⚫', color: '#333333' },
    ],
    distractors: [
      { id: 'soda', name: 'Soda', emoji: '🥤', color: '#FF5252' },
    ],
    correctSet: ['water', 'tulsi', 'ginger', 'haldi', 'dalchini', 'black_pepper'],
    particleScene: 'KadhaParticles',
  },
]

export function getRemedyByDay(day) {
  return REMEDIES.find(r => r.day === day)
}

export function getAllIngredients(day) {
  const remedy = getRemedyByDay(day)
  if (!remedy) return []
  return [...remedy.ingredients, ...remedy.distractors]
}
