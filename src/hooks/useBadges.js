/**
 * useBadges.js — Badge state and earn logic
 */
import { useGameState } from './useGameState'
import { ACTIONS } from '../context/GameContext'
import { BADGES, getBadgeById, getBadgeForDay } from '../data/badges'

export function useBadges() {
  const { state, dispatch } = useGameState()

  const earnedBadges = state.earnedBadges
    .map(id => getBadgeById(id))
    .filter(Boolean)

  function hasBadge(badgeId) {
    return state.earnedBadges.includes(badgeId)
  }

  function earnBadge(badgeId) {
    if (hasBadge(badgeId)) return false
    dispatch({ type: ACTIONS.EARN_BADGE, payload: badgeId })
    return true
  }

  function earnDayBadge(day) {
    const badge = getBadgeForDay(day)
    if (!badge) return false
    return earnBadge(badge.id)
  }

  // Award master badge when all 7 day badges are earned
  function checkMasterBadge() {
    const dayBadgeIds = BADGES
      .filter(b => typeof b.day === 'number')
      .map(b => b.id)
    const allDaysDone = dayBadgeIds.every(id => state.earnedBadges.includes(id))
    if (allDaysDone) earnBadge('junior_healing_scientist')
  }

  return {
    earnedBadges,
    earnedBadgeIds: state.earnedBadges,
    allBadges: BADGES,
    totalBadges: BADGES.length,
    earnedCount: earnedBadges.length,
    hasBadge,
    earnBadge,
    earnDayBadge,
    checkMasterBadge,
  }
}
