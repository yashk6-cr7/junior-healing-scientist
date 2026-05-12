/**
 * responsive.js — Device detection helpers per Section 6 spec
 * Provides responsive breakpoints and orientation detection.
 */

export function getDeviceInfo() {
  const width = window.innerWidth
  const height = window.innerHeight

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isPortrait: height > width,
    isLandscape: width > height,
    width,
    height,
  }
}

/**
 * Get responsive value based on current breakpoint.
 * Usage: responsive({ mobile: 14, tablet: 16, desktop: 18 })
 */
export function responsive({ mobile, tablet, desktop }) {
  const { isMobile, isTablet } = getDeviceInfo()
  if (isMobile) return mobile
  if (isTablet) return tablet ?? desktop
  return desktop
}

/**
 * Check if touch is supported (for drag-and-drop).
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Get safe area insets for notched phones.
 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0,
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0,
  }
}
