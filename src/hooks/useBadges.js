/**
 * useBadges.js — Hook to manage badge logic
 */
import { useGameState } from './useGameState'
import { BADGES, getBadgeById } from '../data/badges'

export function useBadges() {
  const { state } = useGameState()

  const earnedBadges = state.earnedBadges
    .map(id => getBadgeById(id))
    .filter(Boolean)

  const totalBadges = BADGES.length
  const earnedCount = earnedBadges.length

  function hasBadge(badgeId) {
    return state.earnedBadges.includes(badgeId)
  }

  return {
    earnedBadges,
    totalBadges,
    earnedCount,
    hasBadge,
    allBadges: BADGES,
  }
}
