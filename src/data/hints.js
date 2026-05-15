/**
 * hints.js — Mystery Remedy riddles, emoji clues & science facts per day
 * Written for kids ages 7-12. Fun, curious, discovery-based.
 */
export const MYSTERY_HINTS = {
  1: {
    name: 'Haldi Milk',
    icon: '🥛',
    iconBg: '#FFD700',
    mood: 'warm and golden ✨',
    // 3 keyword pills shown at top
    tags: [
      { emoji: '🌙', label: 'Bedtime drink' },
      { emoji: '💛', label: 'Bright yellow' },
      { emoji: '🍼', label: 'Milk based' },
    ],
    // Main riddle - short, rhyming, fun
    riddle: 'I glow yellow like the sun! Granny stirs me warm at night to help you fight a cough. What am I?',
    // 3 emoji ingredient clue cards  
    clues: [
      { emoji: '🥛', label: 'Warm Milk', hint: 'White and creamy base' },
      { emoji: '🌿', label: 'Golden Spice', hint: 'Makes everything yellow!' },
      { emoji: '🖤', label: 'Black Pepper', hint: 'Tiny, dark and mighty' },
    ],
    // Science fact revealed after completion
    scienceFact: 'Turmeric has a superpower called Curcumin — it tells your body\'s army (white blood cells) to attack germs! 🦠⚔️',
    answer: 'Haldi Milk (Turmeric Milk)',
    answerEmoji: '🥛🌿',
  },
  2: {
    name: 'Tulsi Kadha',
    icon: '🍃',
    iconBg: '#00C853',
    mood: 'fresh and herbal 🌿',
    tags: [
      { emoji: '🌿', label: 'Sacred leaves' },
      { emoji: '🫖', label: 'Hot brew' },
      { emoji: '🛡️', label: 'Body shield' },
    ],
    riddle: 'My leaves are holy and bright green. Grandma picks me fresh from her garden. I taste a little like cloves! What am I?',
    clues: [
      { emoji: '🌱', label: 'Holy Basil', hint: 'Sacred green leaves' },
      { emoji: '🫚', label: 'Ginger', hint: 'Spicy and warming root' },
      { emoji: '🍯', label: 'Honey', hint: 'Sweet golden drops' },
    ],
    scienceFact: 'Tulsi leaves release Eugenol oil — it coats your throat like an invisible shield, stopping viruses from grabbing on! 🛡️🦠',
    answer: 'Tulsi Kadha (Holy Basil Tea)',
    answerEmoji: '🌿🫖',
  },
  3: {
    name: 'Ginger Honey Mix',
    icon: '🫚',
    iconBg: '#FF6D00',
    mood: 'spicy and sweet 🔥',
    tags: [
      { emoji: '🔥', label: 'Spicy kick' },
      { emoji: '🍯', label: 'Sweet honey' },
      { emoji: '🍋', label: 'Tangy lemon' },
    ],
    riddle: 'I\'m spicy, sweet, and a little bit sour. Squeeze me on a spoon — I\'ll make your throat feel better in an hour!',
    clues: [
      { emoji: '🫚', label: 'Fresh Ginger', hint: 'Knobbly, spicy root' },
      { emoji: '🍯', label: 'Raw Honey', hint: 'Nature\'s golden sweet' },
      { emoji: '🍋', label: 'Lemon Juice', hint: 'Yellow and very sour' },
    ],
    scienceFact: 'Gingerol in ginger is like tiny heat missiles that zap bacteria in your throat! Honey traps and drowns them at the same time. Double attack! 💥',
    answer: 'Ginger Honey Mix',
    answerEmoji: '🫚🍯🍋',
  },
  4: {
    name: 'Steam Inhalation',
    icon: '💨',
    iconBg: '#40C4FF',
    mood: 'steamy and misty 🌫️',
    tags: [
      { emoji: '♨️', label: 'Hot steam' },
      { emoji: '👃', label: 'Breathe in' },
      { emoji: '🌊', label: 'Water based' },
    ],
    riddle: 'I\'m not something you drink! You lean over me and breathe deeply. I float up like a cloud and open up your nose!',
    clues: [
      { emoji: '💧', label: 'Hot Water', hint: 'Steaming and bubbly' },
      { emoji: '🌿', label: 'Eucalyptus', hint: 'Strong smelling oil' },
      { emoji: '🧣', label: 'Towel Cover', hint: 'Trap the steam!' },
    ],
    scienceFact: 'Steam carries eucalyptus molecules straight into your nose, melting the sticky mucus blocking your breathing — like a mini pressure washer for your nose! 🚿👃',
    answer: 'Steam Inhalation',
    answerEmoji: '💨♨️',
  },
  5: {
    name: 'Herbal Immunity Soup',
    icon: '🍲',
    iconBg: '#FF8F00',
    mood: 'warm and nourishing 🥣',
    tags: [
      { emoji: '🧄', label: 'Strong smell' },
      { emoji: '🟡', label: 'Turmeric gold' },
      { emoji: '🍲', label: 'Warm soup' },
    ],
    riddle: 'I smell really strong — some people even hate my smell! But I\'m the best medicine in the kitchen. I come in layers you peel off!',
    clues: [
      { emoji: '🧄', label: 'Garlic', hint: 'Stinky but powerful!' },
      { emoji: '🌿', label: 'Turmeric', hint: 'The golden healer' },
      { emoji: '🥕', label: 'Vegetables', hint: 'Crunchy goodness' },
    ],
    scienceFact: 'Garlic contains Allicin — when you crush it, it releases a chemical so powerful it can destroy bacteria that are resistant to medicine! 🧄💥',
    answer: 'Herbal Immunity Soup',
    answerEmoji: '🍲🧄🌿',
  },
  6: {
    name: 'Trikatu Pepper Mix',
    icon: '🌶️',
    iconBg: '#E040FB',
    mood: 'fiery and powerful ⚡',
    tags: [
      { emoji: '⚫', label: 'Black pepper' },
      { emoji: '🌶️', label: 'Long pepper' },
      { emoji: '✨', label: 'Power booster' },
    ],
    riddle: 'We are THREE peppers that work as a team! Mix us with honey — we make every other remedy in your body 2000 times stronger!',
    clues: [
      { emoji: '⚫', label: 'Black Pepper', hint: 'Tiny black rounds' },
      { emoji: '🌶️', label: 'Long Pepper', hint: 'Like a tiny stick' },
      { emoji: '🟤', label: 'Dry Ginger', hint: 'Aged spicy powder' },
    ],
    scienceFact: 'Piperine in black pepper is a molecule that holds open the "doors" in your gut, letting curcumin and other healers pass through 20 times faster! 🚪⚡',
    answer: 'Trikatu (Three Pepper Mix)',
    answerEmoji: '⚫🌶️✨',
  },
  7: {
    name: 'Master Kadha',
    icon: '👑',
    iconBg: '#FFD700',
    mood: 'legendary and magical 🌟',
    tags: [
      { emoji: '👑', label: 'The final boss' },
      { emoji: '🌿', label: 'All 6 herbs' },
      { emoji: '🔥', label: 'Slow boiled' },
    ],
    riddle: 'I am the FINAL remedy — the one that uses EVERYTHING you\'ve learned in 6 days! Six plants, one pot, and all your wisdom. Make me!',
    clues: [
      { emoji: '🌿', label: 'Tulsi', hint: 'From Day 2' },
      { emoji: '🫚', label: 'Ginger', hint: 'From Day 3' },
      { emoji: '🌿', label: 'Turmeric', hint: 'From Day 1' },
      { emoji: '⚫', label: 'Pepper Mix', hint: 'From Day 6' },
      { emoji: '🍯', label: 'Honey', hint: 'The golden binder' },
      { emoji: '🌿', label: 'Cinnamon', hint: 'The warm bark' },
    ],
    scienceFact: 'The Master Kadha combines all 6 healing compounds — together they create a synergy where each ingredient makes the others stronger. That\'s why ancient healers called it liquid gold! 👑🌟',
    answer: 'Master Kadha (The Ultimate Healing Brew)',
    answerEmoji: '👑🌿🔥',
  },
}
