/**
 * symptoms.js — Patient symptom data for Stage 1 (Diagnose)
 * Each symptom has an icon, animation type, and investigation text.
 */

export const SYMPTOMS = [
  {
    id: 'cough',
    name: 'Cough',
    emoji: '😷',
    icon: '💨',
    color: '#FF8A65',
    position: { top: '15%', right: '10%' },
    animationType: 'shake',
    sound: 'cough',
    investigateText: 'Arjun has a persistent cough...',
    description: 'A dry, scratchy cough that won\'t stop.',
  },
  {
    id: 'fever',
    name: 'Fever',
    emoji: '🤒',
    icon: '🌡️',
    color: '#EF5350',
    position: { top: '25%', left: '8%' },
    animationType: 'pulse',
    sound: 'beep',
    investigateText: 'Arjun feels very warm — 101°F!',
    description: 'His forehead is hot and he feels chills.',
  },
  {
    id: 'weakness',
    name: 'Weakness',
    emoji: '😩',
    icon: '💫',
    color: '#AB47BC',
    position: { bottom: '30%', right: '12%' },
    animationType: 'droop',
    sound: 'sigh',
    investigateText: 'Arjun feels tired and can\'t play...',
    description: 'He has no energy and his arms feel heavy.',
  },
  {
    id: 'sore_throat',
    name: 'Sore Throat',
    emoji: '🤢',
    icon: '🔴',
    color: '#FF5252',
    position: { bottom: '35%', left: '10%' },
    animationType: 'glow-red',
    sound: 'ouch',
    investigateText: 'Arjun\'s throat is red and swollen!',
    description: 'Swallowing food and water hurts.',
  },
]

export function getSymptomById(id) {
  return SYMPTOMS.find(s => s.id === id)
}
