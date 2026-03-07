// Requirement: Deduplicate RGBA conversion used by all overlay types.
// Approach: Single toRgba() helper replaces 28 inline conversions.
// Alternatives:
//   - Inline everywhere: Rejected — 28x duplication, hard to maintain.
// Convert rgb() or rgba() color to rgba with specified opacity.
// Safe for both rgb(...) and rgba(...) inputs.
function toRgba(rgbColor, opacity) {
  const match = rgbColor.match(/^rgba?\(([^)]+)\)/)
  if (!match) return rgbColor
  const channels = match[1].split(',').slice(0, 3).map(s => s.trim())
  return `rgba(${channels.join(', ')}, ${opacity / 100})`
}

function toTransparentRgba(rgbColor) {
  return toRgba(rgbColor, 0)
}

export const overlayTypes = [
  // Basic
  { id: 'solid', name: 'Solid', category: 'basic', getCss: toRgba },
  // Linear Gradients
  { id: 'gradient-down', name: 'Gradient ↓', category: 'linear', getCss: (c, o) => `linear-gradient(to bottom, ${toRgba(c, o)}, transparent)` },
  { id: 'gradient-up', name: 'Gradient ↑', category: 'linear', getCss: (c, o) => `linear-gradient(to top, ${toRgba(c, o)}, transparent)` },
  { id: 'gradient-left', name: 'Gradient ←', category: 'linear', getCss: (c, o) => `linear-gradient(to left, ${toRgba(c, o)}, transparent)` },
  { id: 'gradient-right', name: 'Gradient →', category: 'linear', getCss: (c, o) => `linear-gradient(to right, ${toRgba(c, o)}, transparent)` },
  { id: 'gradient-tl', name: 'Gradient ↖', category: 'linear', getCss: (c, o) => `linear-gradient(to top left, ${toRgba(c, o)}, transparent)` },
  { id: 'gradient-tr', name: 'Gradient ↗', category: 'linear', getCss: (c, o) => `linear-gradient(to top right, ${toRgba(c, o)}, transparent)` },
  { id: 'gradient-bl', name: 'Gradient ↙', category: 'linear', getCss: (c, o) => `linear-gradient(to bottom left, ${toRgba(c, o)}, transparent)` },
  { id: 'gradient-br', name: 'Gradient ↘', category: 'linear', getCss: (c, o) => `linear-gradient(to bottom right, ${toRgba(c, o)}, transparent)` },
  // Radial Gradients
  { id: 'vignette', name: 'Vignette', category: 'radial', getCss: (c, o) => `radial-gradient(ellipse at center, transparent 0%, ${toRgba(c, o)} 100%)` },
  { id: 'spotlight', name: 'Spotlight', category: 'radial', getCss: (c, o) => `radial-gradient(ellipse at center, ${toRgba(c, o)} 0%, transparent 70%)` },
  { id: 'radial-soft', name: 'Radial Soft', category: 'radial', getCss: (c, o) => `radial-gradient(circle at center, ${toRgba(c, o)} 0%, transparent 50%)` },
  { id: 'radial-ring', name: 'Radial Ring', category: 'radial', getCss: (c, o) => `radial-gradient(circle at center, transparent 30%, ${toRgba(c, o)} 50%, transparent 70%)` },
  // Radial from corners
  { id: 'radial-tl', name: 'Corner ↖', category: 'radial', getCss: (c, o) => `radial-gradient(ellipse at top left, ${toRgba(c, o)} 0%, transparent 70%)` },
  { id: 'radial-tr', name: 'Corner ↗', category: 'radial', getCss: (c, o) => `radial-gradient(ellipse at top right, ${toRgba(c, o)} 0%, transparent 70%)` },
  { id: 'radial-bl', name: 'Corner ↙', category: 'radial', getCss: (c, o) => `radial-gradient(ellipse at bottom left, ${toRgba(c, o)} 0%, transparent 70%)` },
  { id: 'radial-br', name: 'Corner ↘', category: 'radial', getCss: (c, o) => `radial-gradient(ellipse at bottom right, ${toRgba(c, o)} 0%, transparent 70%)` },
  // Edge Effects
  { id: 'blur-edges', name: 'Blur Edges', category: 'effect', special: 'blur-edges', getCss: (c, o) => `radial-gradient(ellipse at center, transparent 40%, ${toRgba(c, o)} 100%)` },
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

// Image style presets combining overlay + filters
export const imagePresets = [
  {
    id: 'none',
    name: 'None',
    overlay: { type: 'solid', color: 'primary', opacity: 0 },
    filters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
  },
  {
    id: 'dramatic-dark',
    name: 'Dramatic Dark',
    overlay: { type: 'vignette', color: 'primary', opacity: 70 },
    filters: { grayscale: 0, sepia: 0, blur: 0, contrast: 110, brightness: 90 },
  },
  {
    id: 'light-airy',
    name: 'Light & Airy',
    overlay: { type: 'solid', color: 'secondary', opacity: 20 },
    filters: { grayscale: 0, sepia: 0, blur: 0, contrast: 90, brightness: 110 },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    overlay: { type: 'vignette', color: 'primary', opacity: 40 },
    filters: { grayscale: 0, sepia: 30, blur: 0, contrast: 95, brightness: 95 },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    overlay: { type: 'gradient-up', color: 'primary', opacity: 60 },
    filters: { grayscale: 0, sepia: 10, blur: 0, contrast: 115, brightness: 95 },
  },
  {
    id: 'soft-focus',
    name: 'Soft Focus',
    overlay: { type: 'solid', color: 'secondary', opacity: 15 },
    filters: { grayscale: 0, sepia: 0, blur: 1, contrast: 90, brightness: 105 },
  },
  {
    id: 'noir',
    name: 'Noir',
    overlay: { type: 'vignette', color: 'primary', opacity: 50 },
    filters: { grayscale: 100, sepia: 0, blur: 0, contrast: 120, brightness: 90 },
  },
  {
    id: 'warm-glow',
    name: 'Warm Glow',
    overlay: { type: 'gradient-down', color: 'accent', opacity: 30 },
    filters: { grayscale: 0, sepia: 20, blur: 0, contrast: 100, brightness: 105 },
  },
]
