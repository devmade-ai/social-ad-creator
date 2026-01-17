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
  { id: 'minimal', name: 'Minimal', primary: '#f5f5f5', secondary: '#404040', accent: '#000000' },
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
]
