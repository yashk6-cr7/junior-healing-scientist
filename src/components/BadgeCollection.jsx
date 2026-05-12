/**
 * BadgeCollection.jsx — Displays all badges in a grid
 * Shows earned and locked badges for the full 7-day journey.
 * Will be fully implemented in Task 6.
 */
import Badge from './Badge'
import { BADGES } from '../data/badges'

export default function BadgeCollection({ earnedBadges = [] }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '8px',
      padding: '16px',
    }}>
      {BADGES.map(badge => (
        <Badge
          key={badge.id}
          badge={badge}
          earned={earnedBadges.includes(badge.id)}
        />
      ))}
    </div>
  )
}
