// Neutral colors - always available regardless of theme
export const neutralColors = [
  { id: 'off-black', name: 'Off Black', hex: '#1a1a1a' },
  { id: 'dark-gray', name: 'Dark Gray', hex: '#4a4a4a' },
  { id: 'gray', name: 'Gray', hex: '#808080' },
  { id: 'light-gray', name: 'Light Gray', hex: '#d4d4d4' },
  { id: 'off-white', name: 'Off White', hex: '#f5f5f5' },
  { id: 'white', name: 'White', hex: '#ffffff' },
]

// Helper to get neutral color hex by id
export const getNeutralColor = (id) => {
  const neutral = neutralColors.find((c) => c.id === id)
  return neutral?.hex || null
}

export const presetThemes = [
  // Core themes
  { id: 'dark', name: 'Dark', primary: '#1a1a1a', secondary: '#ffffff', accent: '#3b82f6' },
  { id: 'light', name: 'Light', primary: '#ffffff', secondary: '#1a1a1a', accent: '#3b82f6' },

  // Professional
  { id: 'corporate', name: 'Corporate', primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b' },
  { id: 'minimal', name: 'Muted', primary: '#f5f5f5', secondary: '#404040', accent: '#000000' },
  { id: 'slate', name: 'Slate', primary: '#334155', secondary: '#f1f5f9', accent: '#0ea5e9' },

  // Vibrant
  { id: 'vibrant', name: 'Vibrant', primary: '#7c3aed', secondary: '#fbbf24', accent: '#ec4899' },
  { id: 'sunset', name: 'Sunset', primary: '#f97316', secondary: '#fef3c7', accent: '#dc2626' },
  { id: 'ocean', name: 'Ocean', primary: '#0891b2', secondary: '#ecfeff', accent: '#06b6d4' },

  // Nature
  { id: 'forest', name: 'Forest', primary: '#166534', secondary: '#f0fdf4', accent: '#84cc16' },
  { id: 'earth', name: 'Earth', primary: '#78350f', secondary: '#fef3c7', accent: '#d97706' },

  // Bold
  { id: 'neon', name: 'Neon', primary: '#0f0f0f', secondary: '#00ff88', accent: '#ff00ff' },
  { id: 'candy', name: 'Candy', primary: '#ec4899', secondary: '#fdf2f8', accent: '#a855f7' },

  // WordPress-inspired themes
  // Requirement: Color palettes derived from WordPress default themes (2010–2025)
  // Approach: Extracted primary/secondary/accent from each theme era's design tokens
  // Alternatives: Using exact WP hex values — rejected for some where contrast
  //   needed adjustment for use as overlay/text colors in CanvaGrid context
  { id: 'wp-classic', name: 'Classic', primary: '#1a4548', secondary: '#ffffff', accent: '#ffe2c7' },      // TT22 — dark teal + peach
  { id: 'wp-pastel', name: 'Sage', primary: '#D1E4DD', secondary: '#28303D', accent: '#D1D1E4' },        // TT21 — sage green + purple pastels
  { id: 'wp-warm', name: 'Warm', primary: '#e8e5ce', secondary: '#141412', accent: '#ca3c08' },             // TT13 — beige + orange-red
  { id: 'wp-cream', name: 'Cream', primary: '#f5efe0', secondary: '#000000', accent: '#cd2653' },           // TT20 — warm cream + pink-red
  { id: 'wp-editorial', name: 'Parchment', primary: '#f9f9f9', secondary: '#111111', accent: '#d8613c' },   // TT24 — clean + rust accent
  { id: 'wp-midnight', name: 'Midnight', primary: '#111111', secondary: '#ffffff', accent: '#FFEE58' },     // TT25 default — dark + yellow
  { id: 'wp-dusk', name: 'Dusk', primary: '#503AA8', secondary: '#ffffff', accent: '#F6CFF4' },             // TT25 — purple + lilac
  { id: 'wp-grove', name: 'Grove', primary: '#345C00', secondary: '#ffffff', accent: '#9DFF20' },           // TT23 — dark green + neon green
]
