// Requirement: Deduplicate RGBA conversion used by all overlay types.
// Approach: Single toRgba() helper replaces 28 inline conversions.
// Alternatives:
//   - Inline everywhere: Rejected — 28x duplication, hard to maintain.
// Convert rgb() or rgba() color to rgba with specified opacity.
// Safe for both rgb(...) and rgba(...) inputs.
// Exported for unit testing — pure color conversion functions.
export function toRgba(rgbColor, opacity) {
  const match = rgbColor.match(/^rgba?\(([^)]+)\)/)
  if (!match) return rgbColor
  const channels = match[1].split(',').slice(0, 3).map(s => s.trim())
  return `rgba(${channels.join(', ')}, ${opacity / 100})`
}

export function toTransparentRgba(rgbColor) {
  return toRgba(rgbColor, 0)
}

// Requirement: Smooth gradient rendering in PDF/image export.
// Approach: Multi-stop gradients with explicit intermediate opacity values.
//   2-stop gradients (e.g. transparent→color) produce smooth CSS in-browser but
//   degrade badly when html-to-image serializes to canvas and JPEG compresses them.
//   Adding 4-6 stops gives the renderer precise anchor points, reducing banding.
// Alternatives:
//   - 2-stop gradients with higher JPEG quality only: Rejected — banding persists
//     because the issue is partly in canvas rendering, not just JPEG compression.
//   - Canvas API overlay rendering: Rejected — would bypass html-to-image entirely,
//     too complex for the improvement needed.

// Gradient stop multipliers — tuned to minimize banding in html-to-image canvas export.
// These values were empirically tested: 2-stop gradients produce visible banding after
// canvas serialization + JPEG compression. 4-6 stops with these opacity curves give the
// renderer precise anchor points for smooth interpolation.
//
// Linear fade: 100%→70%→40%→15%→0% opacity at positions 0→30→55→75→100%
// Vignette:    0%→5%→20%→50%→80%→100% opacity at positions 0→30→50→70→85→100%
// Spotlight:   100%→80%→40%→10%→0% opacity at positions 0→30%→60%→85%→100% of endPct

// Build linear gradient with smooth multi-stop fade
function linearFade(direction, c, o) {
  return `linear-gradient(${direction}, ${toRgba(c, o)} 0%, ${toRgba(c, o * 0.7)} 30%, ${toRgba(c, o * 0.4)} 55%, ${toRgba(c, o * 0.15)} 75%, transparent 100%)`
}

// Build radial gradient with smooth multi-stop vignette (transparent center → color edges)
function radialVignette(shape, position, c, o) {
  return `radial-gradient(${shape} at ${position}, transparent 0%, ${toRgba(c, o * 0.05)} 30%, ${toRgba(c, o * 0.2)} 50%, ${toRgba(c, o * 0.5)} 70%, ${toRgba(c, o * 0.8)} 85%, ${toRgba(c, o)} 100%)`
}

// Build radial gradient with smooth multi-stop spotlight (color center → transparent edges)
function radialSpotlight(shape, position, c, o, endPct) {
  return `radial-gradient(${shape} at ${position}, ${toRgba(c, o)} 0%, ${toRgba(c, o * 0.8)} ${endPct * 0.3}%, ${toRgba(c, o * 0.4)} ${endPct * 0.6}%, ${toRgba(c, o * 0.1)} ${endPct * 0.85}%, transparent ${endPct}%)`
}

export const overlayTypes = [
  // Basic
  { id: 'solid', name: 'Solid', category: 'basic', getCss: toRgba },
  // Linear Gradients — multi-stop for smooth export rendering
  { id: 'gradient-down', name: 'Gradient ↓', category: 'linear', getCss: (c, o) => linearFade('to bottom', c, o) },
  { id: 'gradient-up', name: 'Gradient ↑', category: 'linear', getCss: (c, o) => linearFade('to top', c, o) },
  { id: 'gradient-left', name: 'Gradient ←', category: 'linear', getCss: (c, o) => linearFade('to left', c, o) },
  { id: 'gradient-right', name: 'Gradient →', category: 'linear', getCss: (c, o) => linearFade('to right', c, o) },
  { id: 'gradient-tl', name: 'Gradient ↖', category: 'linear', getCss: (c, o) => linearFade('to top left', c, o) },
  { id: 'gradient-tr', name: 'Gradient ↗', category: 'linear', getCss: (c, o) => linearFade('to top right', c, o) },
  { id: 'gradient-bl', name: 'Gradient ↙', category: 'linear', getCss: (c, o) => linearFade('to bottom left', c, o) },
  { id: 'gradient-br', name: 'Gradient ↘', category: 'linear', getCss: (c, o) => linearFade('to bottom right', c, o) },
  // Radial Gradients — multi-stop for smooth export rendering
  { id: 'vignette', name: 'Vignette', category: 'radial', getCss: (c, o) => radialVignette('ellipse', 'center', c, o) },
  { id: 'spotlight', name: 'Spotlight', category: 'radial', getCss: (c, o) => radialSpotlight('ellipse', 'center', c, o, 70) },
  { id: 'radial-soft', name: 'Radial Soft', category: 'radial', getCss: (c, o) => radialSpotlight('circle', 'center', c, o, 50) },
  { id: 'radial-ring', name: 'Radial Ring', category: 'radial', getCss: (c, o) => `radial-gradient(circle at center, transparent 25%, ${toRgba(c, o * 0.3)} 35%, ${toRgba(c, o)} 45%, ${toRgba(c, o)} 55%, ${toRgba(c, o * 0.3)} 65%, transparent 75%)` },
  // Radial from corners — multi-stop for smooth export rendering
  { id: 'radial-tl', name: 'Corner ↖', category: 'radial', getCss: (c, o) => radialSpotlight('ellipse', 'top left', c, o, 70) },
  { id: 'radial-tr', name: 'Corner ↗', category: 'radial', getCss: (c, o) => radialSpotlight('ellipse', 'top right', c, o, 70) },
  { id: 'radial-bl', name: 'Corner ↙', category: 'radial', getCss: (c, o) => radialSpotlight('ellipse', 'bottom left', c, o, 70) },
  { id: 'radial-br', name: 'Corner ↘', category: 'radial', getCss: (c, o) => radialSpotlight('ellipse', 'bottom right', c, o, 70) },
  // Edge Effects — multi-stop vignette variant
  { id: 'blur-edges', name: 'Blur Edges', category: 'effect', special: 'blur-edges', getCss: (c, o) => `radial-gradient(ellipse at center, transparent 35%, ${toRgba(c, o * 0.1)} 50%, ${toRgba(c, o * 0.4)} 70%, ${toRgba(c, o * 0.7)} 85%, ${toRgba(c, o)} 100%)` },
  {
    id: 'frame', name: 'Frame', category: 'effect',
    getCss: (c, o) => {
      const rgba = toRgba(c, o)
      const transparent = toTransparentRgba(c)
      return `linear-gradient(to right, ${rgba} 0%, ${transparent} 5%, ${transparent} 95%, ${rgba} 100%), linear-gradient(to bottom, ${rgba} 0%, ${transparent} 5%, ${transparent} 95%, ${rgba} 100%)`
    },
  },
  // Blend Mode Effects (use mix-blend-mode)
  { id: 'multiply', name: 'Multiply', category: 'blend', blendMode: 'multiply', getCss: toRgba },
  { id: 'screen', name: 'Screen', category: 'blend', blendMode: 'screen', getCss: toRgba },
  { id: 'overlay-blend', name: 'Overlay', category: 'blend', blendMode: 'overlay', getCss: toRgba },
  { id: 'color-burn', name: 'Color Burn', category: 'blend', blendMode: 'color-burn', getCss: toRgba },
  // Texture Effects
  { id: 'noise', name: 'Noise', category: 'texture', special: 'noise', getCss: () => 'transparent' },
  { id: 'grain', name: 'Film Grain', category: 'texture', special: 'grain', getCss: () => 'transparent' },
  // Duotone (applies filter + color)
  { id: 'duotone', name: 'Duotone', category: 'effect', special: 'duotone', getCss: toRgba },
]

// Pre-grouped overlay types to avoid .filter() on every render
export const overlayTypesByCategory = {
  basicAndLinear: overlayTypes.filter(t => t.category === 'basic' || t.category === 'linear'),
  radial: overlayTypes.filter(t => t.category === 'radial'),
  effectAndTexture: overlayTypes.filter(t => t.category === 'effect' || t.category === 'texture'),
  blend: overlayTypes.filter(t => t.category === 'blend'),
}

// Helper to convert hex to rgb string
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 'rgb(0, 0, 0)'
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
}

// Helper to get overlay type by id
export function getOverlayType(id) {
  return overlayTypes.find((o) => o.id === id) || overlayTypes[0]
}
