// Requirement: Independent per-mode DaisyUI theme selection.
// Approach: Curated lists of light and dark themes with metadata for UI and PWA theming.
//   Each mode remembers its own theme choice via localStorage.
// Alternatives:
//   - Paired combos (glow-props pattern): Rejected — user wants independent selection.
//   - All 30+ DaisyUI themes: Rejected — too many, some are novelty. Curated for quality.

// Meta theme-color for PWA status bar — matches each theme's primary or base color.
// These are approximate hex values for the DaisyUI oklch-defined colors.

export const lightThemes = [
  { id: 'nord', name: 'Nord', description: 'Cool blue-gray', metaColor: '#5E81AC' },
  { id: 'lofi', name: 'Lo-Fi', description: 'Minimal mono', metaColor: '#808080' },
  { id: 'emerald', name: 'Emerald', description: 'Fresh green', metaColor: '#66CC8A' },
  { id: 'cupcake', name: 'Cupcake', description: 'Soft pastels', metaColor: '#65C3C8' },
  { id: 'garden', name: 'Garden', description: 'Warm green', metaColor: '#5C7F67' },
  { id: 'autumn', name: 'Autumn', description: 'Earthy warm', metaColor: '#8C0327' },
  { id: 'pastel', name: 'Pastel', description: 'Soft muted', metaColor: '#D1C1D7' },
  { id: 'caramellatte', name: 'Caramel', description: 'Warm brown', metaColor: '#C67B47' },
]

export const darkThemes = [
  { id: 'night', name: 'Night', description: 'Deep blue', metaColor: '#0F172A' },
  { id: 'black', name: 'Black', description: 'True OLED', metaColor: '#000000' },
  { id: 'forest', name: 'Forest', description: 'Deep green', metaColor: '#171212' },
  { id: 'dracula', name: 'Dracula', description: 'Bold purple', metaColor: '#282A36' },
  { id: 'dim', name: 'Dim', description: 'Muted warm', metaColor: '#1D232A' },
  { id: 'synthwave', name: 'Synthwave', description: 'Neon retro', metaColor: '#1A103C' },
  { id: 'luxury', name: 'Luxury', description: 'Dark gold', metaColor: '#09090B' },
  { id: 'coffee', name: 'Coffee', description: 'Dark roast', metaColor: '#20161F' },
]

export const DEFAULT_LIGHT_THEME = 'nord'
export const DEFAULT_DARK_THEME = 'night'

// Look up meta theme-color for a given theme ID.
// Falls back to neutral values if theme not found.
export function getMetaColor(themeId) {
  const all = [...lightThemes, ...darkThemes]
  const found = all.find(t => t.id === themeId)
  return found?.metaColor ?? '#808080'
}
