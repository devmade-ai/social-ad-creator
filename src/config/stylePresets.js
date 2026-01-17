// Complete style presets that combine layout, theme, fonts, and image treatment
// These provide one-click professional looks

export const stylePresets = [
  // ========== MODERN & BOLD ==========
  {
    id: 'bold-modern',
    name: 'Bold Modern',
    description: 'High-impact dark design with bold typography',
    category: 'modern',
    preview: { bg: '#1a1a1a', accent: '#3b82f6', style: 'bold' },
    settings: {
      theme: { preset: 'dark', primary: '#1a1a1a', secondary: '#ffffff', accent: '#3b82f6' },
      fonts: { title: 'bebas-neue', body: 'inter' },
      layout: {
        type: 'fullbleed',
        structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'end',
        cellAlignments: [],
      },
      overlay: { type: 'gradient-up', color: 'primary', opacity: 70 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 110, brightness: 95 },
      textCells: {
        title: null,
        tagline: null,
        bodyHeading: null,
        bodyText: null,
        cta: null,
        footnote: null,
      },
    },
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Electric neon glow with high contrast',
    category: 'modern',
    preview: { bg: '#0f0f0f', accent: '#00ff88', style: 'neon' },
    settings: {
      theme: { preset: 'neon', primary: '#0f0f0f', secondary: '#00ff88', accent: '#ff00ff' },
      fonts: { title: 'space-grotesk', body: 'dm-sans' },
      layout: {
        type: 'fullbleed',
        structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [],
      },
      overlay: { type: 'vignette', color: 'primary', opacity: 60 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 120, brightness: 90 },
      textCells: {
        title: null,
        tagline: null,
        bodyHeading: null,
        bodyText: null,
        cta: null,
        footnote: null,
      },
    },
  },
  {
    id: 'vibrant-pop',
    name: 'Vibrant Pop',
    description: 'Eye-catching colors that demand attention',
    category: 'modern',
    preview: { bg: '#7c3aed', accent: '#fbbf24', style: 'vibrant' },
    settings: {
      theme: { preset: 'vibrant', primary: '#7c3aed', secondary: '#fbbf24', accent: '#ec4899' },
      fonts: { title: 'poppins', body: 'poppins' },
      layout: {
        type: 'rows',
        structure: [
          { size: 65, subdivisions: 1, subSizes: [100] },
          { size: 35, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'center' },
          { textAlign: 'center', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'gradient-down', color: 'primary', opacity: 40 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 105, brightness: 105 },
      textCells: {
        title: 0,
        tagline: 0,
        bodyHeading: 1,
        bodyText: 1,
        cta: 1,
        footnote: 1,
      },
    },
  },

  // ========== PROFESSIONAL ==========
  {
    id: 'clean-corporate',
    name: 'Clean Corporate',
    description: 'Professional and trustworthy business look',
    category: 'professional',
    preview: { bg: '#1e3a5f', accent: '#f59e0b', style: 'corporate' },
    settings: {
      theme: { preset: 'corporate', primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b' },
      fonts: { title: 'montserrat', body: 'inter' },
      layout: {
        type: 'columns',
        structure: [
          { size: 50, subdivisions: 1, subSizes: [100] },
          { size: 50, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
        textAlign: 'left',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'center' },
          { textAlign: 'left', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'solid', color: 'primary', opacity: 30 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
      textCells: {
        title: 1,
        tagline: 1,
        bodyHeading: 1,
        bodyText: 1,
        cta: 1,
        footnote: 1,
      },
    },
  },
  {
    id: 'slate-minimal',
    name: 'Slate Minimal',
    description: 'Modern professional with subtle elegance',
    category: 'professional',
    preview: { bg: '#334155', accent: '#0ea5e9', style: 'slate' },
    settings: {
      theme: { preset: 'slate', primary: '#334155', secondary: '#f1f5f9', accent: '#0ea5e9' },
      fonts: { title: 'dm-sans', body: 'dm-sans' },
      layout: {
        type: 'rows',
        structure: [
          { size: 70, subdivisions: 1, subSizes: [100] },
          { size: 30, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'end' },
          { textAlign: 'center', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'gradient-up', color: 'primary', opacity: 50 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 105, brightness: 98 },
      textCells: {
        title: 0,
        tagline: 0,
        bodyHeading: 1,
        bodyText: 1,
        cta: 1,
        footnote: 1,
      },
    },
  },
  {
    id: 'minimal-zen',
    name: 'Minimal Zen',
    description: 'Ultra-clean with maximum breathing room',
    category: 'professional',
    preview: { bg: '#f5f5f5', accent: '#000000', style: 'minimal' },
    settings: {
      theme: { preset: 'minimal', primary: '#f5f5f5', secondary: '#404040', accent: '#000000' },
      fonts: { title: 'raleway', body: 'open-sans' },
      layout: {
        type: 'columns',
        structure: [
          { size: 55, subdivisions: 1, subSizes: [100] },
          { size: 45, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
        textAlign: 'left',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'center' },
          { textAlign: 'left', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'solid', color: 'secondary', opacity: 10 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 95, brightness: 105 },
      textCells: {
        title: 1,
        tagline: 1,
        bodyHeading: 1,
        bodyText: 1,
        cta: 1,
        footnote: 1,
      },
    },
  },

  // ========== ELEGANT ==========
  {
    id: 'elegant-editorial',
    name: 'Elegant Editorial',
    description: 'Sophisticated serif typography with classic appeal',
    category: 'elegant',
    preview: { bg: '#ffffff', accent: '#1a1a1a', style: 'serif' },
    settings: {
      theme: { preset: 'light', primary: '#ffffff', secondary: '#1a1a1a', accent: '#3b82f6' },
      fonts: { title: 'playfair', body: 'lora' },
      layout: {
        type: 'fullbleed',
        structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [],
      },
      overlay: { type: 'vignette', color: 'primary', opacity: 30 },
      imageFilters: { grayscale: 0, sepia: 10, blur: 0, contrast: 95, brightness: 102 },
      textCells: {
        title: null,
        tagline: null,
        bodyHeading: null,
        bodyText: null,
        cta: null,
        footnote: null,
      },
    },
  },
  {
    id: 'luxury-dark',
    name: 'Luxury Dark',
    description: 'Premium dark aesthetic with refined typography',
    category: 'elegant',
    preview: { bg: '#1a1a1a', accent: '#d4af37', style: 'luxury' },
    settings: {
      theme: { preset: 'dark', primary: '#1a1a1a', secondary: '#f5f5f5', accent: '#d4af37' },
      fonts: { title: 'playfair', body: 'merriweather' },
      layout: {
        type: 'rows',
        structure: [
          { size: 60, subdivisions: 1, subSizes: [100] },
          { size: 40, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'center' },
          { textAlign: 'center', textVerticalAlign: 'start' },
        ],
      },
      overlay: { type: 'vignette', color: 'primary', opacity: 50 },
      imageFilters: { grayscale: 0, sepia: 5, blur: 0, contrast: 110, brightness: 95 },
      textCells: {
        title: 1,
        tagline: 1,
        bodyHeading: 1,
        bodyText: 1,
        cta: 1,
        footnote: 1,
      },
    },
  },

  // ========== WARM & NATURAL ==========
  {
    id: 'warm-earth',
    name: 'Warm Earth',
    description: 'Cozy earth tones with organic warmth',
    category: 'warm',
    preview: { bg: '#78350f', accent: '#d97706', style: 'earth' },
    settings: {
      theme: { preset: 'earth', primary: '#78350f', secondary: '#fef3c7', accent: '#d97706' },
      fonts: { title: 'merriweather', body: 'lato' },
      layout: {
        type: 'columns',
        structure: [
          { size: 60, subdivisions: 1, subSizes: [100] },
          { size: 40, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
        textAlign: 'left',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'center' },
          { textAlign: 'left', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'gradient-down', color: 'accent', opacity: 35 },
      imageFilters: { grayscale: 0, sepia: 20, blur: 0, contrast: 100, brightness: 102 },
      textCells: {
        title: 1,
        tagline: 1,
        bodyHeading: 1,
        bodyText: 1,
        cta: 1,
        footnote: 1,
      },
    },
  },
  {
    id: 'forest-fresh',
    name: 'Forest Fresh',
    description: 'Natural greens with an eco-friendly vibe',
    category: 'warm',
    preview: { bg: '#166534', accent: '#84cc16', style: 'forest' },
    settings: {
      theme: { preset: 'forest', primary: '#166534', secondary: '#f0fdf4', accent: '#84cc16' },
      fonts: { title: 'raleway', body: 'open-sans' },
      layout: {
        type: 'rows',
        structure: [
          { size: 55, subdivisions: 1, subSizes: [100] },
          { size: 45, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'end' },
          { textAlign: 'center', textVerticalAlign: 'start' },
        ],
      },
      overlay: { type: 'gradient-up', color: 'primary', opacity: 45 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 105, brightness: 100 },
      textCells: {
        title: 0,
        tagline: 0,
        bodyHeading: 1,
        bodyText: 1,
        cta: 1,
        footnote: 1,
      },
    },
  },

  // ========== FRESH & BRIGHT ==========
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Cool aquatic tones with a refreshing feel',
    category: 'fresh',
    preview: { bg: '#0891b2', accent: '#06b6d4', style: 'ocean' },
    settings: {
      theme: { preset: 'ocean', primary: '#0891b2', secondary: '#ecfeff', accent: '#06b6d4' },
      fonts: { title: 'poppins', body: 'inter' },
      layout: {
        type: 'columns',
        structure: [
          { size: 45, subdivisions: 1, subSizes: [100] },
          { size: 55, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 1,
        textAlign: 'left',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'left', textVerticalAlign: 'center' },
          { textAlign: 'center', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'solid', color: 'primary', opacity: 25 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 105 },
      textCells: {
        title: 0,
        tagline: 0,
        bodyHeading: 0,
        bodyText: 0,
        cta: 0,
        footnote: 0,
      },
    },
  },
  {
    id: 'candy-sweet',
    name: 'Candy Sweet',
    description: 'Playful pinks with youthful energy',
    category: 'fresh',
    preview: { bg: '#ec4899', accent: '#a855f7', style: 'candy' },
    settings: {
      theme: { preset: 'candy', primary: '#ec4899', secondary: '#fdf2f8', accent: '#a855f7' },
      fonts: { title: 'poppins', body: 'dm-sans' },
      layout: {
        type: 'fullbleed',
        structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [],
      },
      overlay: { type: 'solid', color: 'primary', opacity: 40 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 95, brightness: 108 },
      textCells: {
        title: null,
        tagline: null,
        bodyHeading: null,
        bodyText: null,
        cta: null,
        footnote: null,
      },
    },
  },

  // ========== RETRO & VINTAGE ==========
  {
    id: 'retro-sunset',
    name: 'Retro Sunset',
    description: 'Warm nostalgic vibes with vintage charm',
    category: 'retro',
    preview: { bg: '#f97316', accent: '#dc2626', style: 'sunset' },
    settings: {
      theme: { preset: 'sunset', primary: '#f97316', secondary: '#fef3c7', accent: '#dc2626' },
      fonts: { title: 'oswald', body: 'lato' },
      layout: {
        type: 'rows',
        structure: [
          { size: 65, subdivisions: 1, subSizes: [100] },
          { size: 35, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'end' },
          { textAlign: 'center', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'gradient-up', color: 'primary', opacity: 55 },
      imageFilters: { grayscale: 0, sepia: 25, blur: 0, contrast: 105, brightness: 98 },
      textCells: {
        title: 0,
        tagline: 0,
        bodyHeading: 1,
        bodyText: 1,
        cta: 1,
        footnote: 1,
      },
    },
  },
  {
    id: 'noir-classic',
    name: 'Noir Classic',
    description: 'Timeless black and white with dramatic contrast',
    category: 'retro',
    preview: { bg: '#1a1a1a', accent: '#ffffff', style: 'noir' },
    settings: {
      theme: { preset: 'dark', primary: '#1a1a1a', secondary: '#ffffff', accent: '#888888' },
      fonts: { title: 'archivo-black', body: 'inter' },
      layout: {
        type: 'fullbleed',
        structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'end',
        cellAlignments: [],
      },
      overlay: { type: 'vignette', color: 'primary', opacity: 55 },
      imageFilters: { grayscale: 100, sepia: 0, blur: 0, contrast: 120, brightness: 90 },
      textCells: {
        title: null,
        tagline: null,
        bodyHeading: null,
        bodyText: null,
        cta: null,
        footnote: null,
      },
    },
  },

  // ========== GRID LAYOUTS ==========
  {
    id: 'split-showcase',
    name: 'Split Showcase',
    description: 'Image with organized text sections',
    category: 'grid',
    preview: { bg: '#334155', accent: '#0ea5e9', style: 'grid' },
    settings: {
      theme: { preset: 'slate', primary: '#334155', secondary: '#f1f5f9', accent: '#0ea5e9' },
      fonts: { title: 'montserrat', body: 'inter' },
      layout: {
        type: 'columns',
        structure: [
          { size: 50, subdivisions: 1, subSizes: [100] },
          { size: 50, subdivisions: 2, subSizes: [50, 50] },
        ],
        imageCell: 0,
        textAlign: 'left',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'center' },
          { textAlign: 'left', textVerticalAlign: 'center' },
          { textAlign: 'left', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'solid', color: 'primary', opacity: 20 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
      textCells: {
        title: 1,
        tagline: 1,
        bodyHeading: 2,
        bodyText: 2,
        cta: 2,
        footnote: 2,
      },
    },
  },
  {
    id: 'hero-banner',
    name: 'Hero Banner',
    description: 'Large hero image with text bar below',
    category: 'grid',
    preview: { bg: '#1e3a5f', accent: '#f59e0b', style: 'banner' },
    settings: {
      theme: { preset: 'corporate', primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b' },
      fonts: { title: 'bebas-neue', body: 'open-sans' },
      layout: {
        type: 'rows',
        structure: [
          { size: 70, subdivisions: 1, subSizes: [100] },
          { size: 30, subdivisions: 2, subSizes: [60, 40] },
        ],
        imageCell: 0,
        textAlign: 'center',
        textVerticalAlign: 'center',
        cellAlignments: [
          { textAlign: 'center', textVerticalAlign: 'end' },
          { textAlign: 'left', textVerticalAlign: 'center' },
          { textAlign: 'center', textVerticalAlign: 'center' },
        ],
      },
      overlay: { type: 'gradient-up', color: 'primary', opacity: 60 },
      imageFilters: { grayscale: 0, sepia: 0, blur: 0, contrast: 105, brightness: 98 },
      textCells: {
        title: 0,
        tagline: 0,
        bodyHeading: 1,
        bodyText: 1,
        cta: 2,
        footnote: 1,
      },
    },
  },
]

// Categories for filtering
export const styleCategories = [
  { id: 'all', name: 'All' },
  { id: 'modern', name: 'Modern' },
  { id: 'professional', name: 'Professional' },
  { id: 'elegant', name: 'Elegant' },
  { id: 'warm', name: 'Warm' },
  { id: 'fresh', name: 'Fresh' },
  { id: 'retro', name: 'Retro' },
  { id: 'grid', name: 'Grid' },
]

// Get presets by category
export const getStylePresetsByCategory = (categoryId) => {
  if (categoryId === 'all') return stylePresets
  return stylePresets.filter(preset => preset.category === categoryId)
}
