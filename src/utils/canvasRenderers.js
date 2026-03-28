// Requirement: Extract pure rendering helpers from AdCanvas.jsx to reduce file size
// Approach: Only functions with zero closure dependencies on component state
// Alternatives:
//   - Extract all render functions: Rejected — most close over themeColors, platform,
//     fonts, layout, text, etc. Extracting them would require passing 10+ params each,
//     hurting readability more than helping.

import { getOverlayType } from '../config/layouts'

/**
 * Build a CSS filter string from a filters config object.
 * @param {Object|null} filters - { grayscale, sepia, blur, contrast, brightness }
 * @returns {string} CSS filter value or 'none'
 */
export const buildFilterStyle = (filters) => {
  if (!filters) return 'none'
  const parts = []
  if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`)
  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`)
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`)
  if (filters.contrast && filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`)
  if (filters.brightness && filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`)
  return parts.length > 0 ? parts.join(' ') : 'none'
}

/**
 * Map horizontal text alignment to CSS align-items value.
 * @param {'left'|'center'|'right'} align
 * @returns {'flex-start'|'center'|'flex-end'}
 */
export const getAlignItems = (align) => {
  switch (align) {
    case 'left': return 'flex-start'
    case 'right': return 'flex-end'
    default: return 'center'
  }
}

/**
 * Map vertical alignment to CSS justify-content value.
 * @param {'start'|'center'|'end'} align
 * @returns {'flex-start'|'center'|'flex-end'}
 */
export const getJustifyContent = (align) => {
  switch (align) {
    case 'start': return 'flex-start'
    case 'end': return 'flex-end'
    default: return 'center'
  }
}

/**
 * Compute frame width and inner padding from total padding and frame percent.
 * @param {number} totalPadding - Total padding in px
 * @param {number} framePercent - Frame as percentage of padding (0-100)
 * @returns {{ frameWidth: number, innerPadding: number }}
 */
export const getFrameDimensions = (totalPadding, framePercent) => {
  const frameWidth = Math.round(totalPadding * (framePercent / 100))
  const innerPadding = totalPadding - frameWidth
  return { frameWidth, innerPadding }
}

/**
 * Check if an overlay config uses the duotone special effect.
 * @param {Object|null} overlayConfig - { type, color, opacity }
 * @returns {boolean}
 */
export const isDuotoneOverlay = (overlayConfig) => {
  if (!overlayConfig) return false
  const type = getOverlayType(overlayConfig.type)
  return type.special === 'duotone'
}
