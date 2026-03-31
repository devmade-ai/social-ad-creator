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

// Requirement: Light/dark variants for every theme.
// Approach: Each theme has a `variants` object with `light` and `dark` keys,
//   each containing { primary, secondary, accent }. Accent colors are intentionally
//   different per variant — not just swapped — because an accent that works on a dark
//   background often fails on light (washes out, clashes, or loses its visual role).
// Alternatives:
//   - Simple primary/secondary swap with same accent: Rejected — accent contrast fails
//     in many cases (e.g., bright yellow invisible on white, neon green garish on light).
//   - Separate theme entries per variant: Rejected — doubles the picker, clutters UI.
//   - Auto-derive variants algorithmically: Rejected — accent mood is subjective and
//     requires human judgment (e.g., Ruby's gold→burnt-orange shift on light bg).

export const presetThemes = [
  // --- Neutral ---
  // Merges old 'dark' and 'light' themes into one with proper accent treatment.
  // Light accent: deeper blue (#2563eb) — lighter #3b82f6 feels washed on white.
  // Dark accent: lighter blue (#60a5fa) — glows invitingly on dark backgrounds.
  {
    id: 'neutral',
    name: 'Neutral',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#ffffff', secondary: '#1a1a1a', accent: '#2563eb' },
      dark: { primary: '#1a1a1a', secondary: '#ffffff', accent: '#60a5fa' },
    },
  },

  // --- Professional ---

  // Corporate: Navy + gold.
  // Light accent: deeper amber (#b45309) — bright gold is too loud on white, this is boardroom-appropriate.
  // Dark accent: brighter warm gold (#fbbf24) — pops against navy, reads as premium.
  {
    id: 'corporate',
    name: 'Corporate',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#ffffff', secondary: '#1e3a5f', accent: '#b45309' },
      dark: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#fbbf24' },
    },
  },

  // Muted: Deliberately restrained palette.
  // Light accent: medium gray (#737373) — keeps the minimalist intent.
  // Dark accent: lighter gray (#a3a3a3) — same understated feel, visible on dark.
  {
    id: 'minimal',
    name: 'Muted',
    defaultVariant: 'light',
    variants: {
      light: { primary: '#f5f5f5', secondary: '#404040', accent: '#737373' },
      dark: { primary: '#2a2a2a', secondary: '#d4d4d4', accent: '#a3a3a3' },
    },
  },

  // Slate: Cool blue-gray palette.
  // Light accent: deeper sky blue (#0284c7) — anchors against cool light bg.
  // Dark accent: brighter cyan (#38bdf8) — glows on dark slate, doesn't disappear into it.
  {
    id: 'slate',
    name: 'Slate',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#f1f5f9', secondary: '#1e293b', accent: '#0284c7' },
      dark: { primary: '#334155', secondary: '#f1f5f9', accent: '#38bdf8' },
    },
  },

  // --- Vibrant ---

  // Ruby: Deep burgundy jewel tone.
  // Light accent: burnt orange (#c2410c) — gold felt disconnected on blush bg; orange bridges red+warm.
  // Dark accent: true gold (#fcd34d) — on burgundy reads as luxurious, high contrast.
  {
    id: 'ruby',
    name: 'Ruby',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#fef2f2', secondary: '#7f1d1d', accent: '#c2410c' },
      dark: { primary: '#7f1d1d', secondary: '#fef2f2', accent: '#fcd34d' },
    },
  },

  // Sunset: Warm orange-red.
  // Light accent: rose-red (#e11d48) — cooler red distinguishes from warm text, creates tension.
  // Dark accent: bright orange (#fb923c) — glows warmly on deep brown, like actual sunset sky.
  {
    id: 'sunset',
    name: 'Sunset',
    defaultVariant: 'light',
    variants: {
      light: { primary: '#fffbeb', secondary: '#9a3412', accent: '#e11d48' },
      dark: { primary: '#7c2d12', secondary: '#fed7aa', accent: '#fb923c' },
    },
  },

  // Ocean: Cyan-teal palette.
  // Light accent: teal (#0d9488) — shifts toward green to avoid monotone blue-on-blue.
  // Dark accent: bright cyan (#22d3ee) — electric pop on deep ocean, bioluminescence feel.
  {
    id: 'ocean',
    name: 'Ocean',
    defaultVariant: 'light',
    variants: {
      light: { primary: '#ecfeff', secondary: '#155e75', accent: '#0d9488' },
      dark: { primary: '#164e63', secondary: '#cffafe', accent: '#22d3ee' },
    },
  },

  // --- Nature ---

  // Forest: Deep green palette.
  // Light accent: deep gold (#a16207) — earthy contrast to green, like sunlight through leaves.
  //   Originally #ca8a04 but failed WCAG 3:1 on #f0fdf4 (2.81:1). Darkened to 4.76:1.
  // Dark accent: bright lime (#a3e635) — neon against deep forest, reads as new growth.
  {
    id: 'forest',
    name: 'Forest',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#f0fdf4', secondary: '#166534', accent: '#a16207' },
      dark: { primary: '#166534', secondary: '#f0fdf4', accent: '#a3e635' },
    },
  },

  // Earth: Brown-amber warmth.
  // Light accent: deep amber (#a16207) — warm but distinct from brown text, like clay pottery.
  // Dark accent: bright amber (#f59e0b) — campfire glow on darkest brown.
  {
    id: 'earth',
    name: 'Earth',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#fefce8', secondary: '#78350f', accent: '#a16207' },
      dark: { primary: '#78350f', secondary: '#fef3c7', accent: '#f59e0b' },
    },
  },

  // --- Bold ---

  // Neon: Electric palette.
  // Light accent: teal (#0d9488) — turquoise-family accent readable on light bg.
  // Dark accent: coral (#fb7185) — warm complement to cyan, glows on black.
  {
    id: 'neon',
    name: 'Neon',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#fafafa', secondary: '#18181b', accent: '#0d9488' },
      dark: { primary: '#0a0a0a', secondary: '#22d3ee', accent: '#fb7185' },
    },
  },

  // Candy: Playful pink.
  // Light accent: fuchsia (#c026d3) — shifts from gold to purple-pink for a more playful candy palette.
  // Dark accent: soft gold (#fde68a) — warm glow on dark pink, like candy wrapper foil.
  {
    id: 'candy',
    name: 'Candy',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#fff1f2', secondary: '#be185d', accent: '#c026d3' },
      dark: { primary: '#be185d', secondary: '#ffffff', accent: '#fde68a' },
    },
  },

  // --- WordPress-inspired themes ---

  // Classic: Dark teal + peach (TT22).
  // Light accent: muted terracotta (#c2754e) — peach #ffe2c7 is invisible on light bg, needs substance.
  // Dark accent: warm peach (#fcd9b8) — softer than white, glows on teal like candlelight.
  {
    id: 'wp-classic',
    name: 'Classic',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#f5f5f0', secondary: '#1a4548', accent: '#c2754e' },
      dark: { primary: '#1a4548', secondary: '#f5f5f0', accent: '#fcd9b8' },
    },
  },

  // Sage: Sage green + purple pastels (TT21).
  // Light accent: muted lavender (#7c7cba) — gives the purple hint more definition against green-gray.
  // Dark accent: lighter lavender (#b8b8e0) — dreamy pastel that floats on dark blue-gray.
  {
    id: 'wp-pastel',
    name: 'Sage',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#e8f0eb', secondary: '#28303D', accent: '#7c7cba' },
      dark: { primary: '#28303D', secondary: '#D1E4DD', accent: '#b8b8e0' },
    },
  },

  // Warm: Beige + orange-red (TT13).
  // Light accent: burnt orange (#ca3c08) — already well-balanced on warm beige.
  // Dark accent: brighter orange (#ef6c36) — needs more luminance on dark bg to carry same warmth.
  {
    id: 'wp-warm',
    name: 'Warm',
    defaultVariant: 'light',
    variants: {
      light: { primary: '#e8e5ce', secondary: '#141412', accent: '#ca3c08' },
      dark: { primary: '#292521', secondary: '#e8e5ce', accent: '#ef6c36' },
    },
  },

  // Cream: Warm cream + pink-red (TT20).
  // Light accent: pink-red (#cd2653) — already well-balanced on cream.
  // Dark accent: softer pink (#f472b6) — pure #cd2653 too aggressive on warm dark; pink feels editorial.
  {
    id: 'wp-cream',
    name: 'Cream',
    defaultVariant: 'light',
    variants: {
      light: { primary: '#f5efe0', secondary: '#000000', accent: '#cd2653' },
      dark: { primary: '#1c1410', secondary: '#f5efe0', accent: '#f472b6' },
    },
  },

  // Parchment: Clean + rust accent (TT24).
  // Light accent: rust (#d8613c) — already clean and intentional on near-white.
  // Dark accent: lighter terracotta (#e88b6a) — desaturated slightly so it doesn't overpower on dark.
  {
    id: 'wp-editorial',
    name: 'Parchment',
    defaultVariant: 'light',
    variants: {
      light: { primary: '#f9f9f9', secondary: '#111111', accent: '#d8613c' },
      dark: { primary: '#1a1a1a', secondary: '#e5e5e5', accent: '#e88b6a' },
    },
  },

  // Midnight: Dark + yellow (TT25 default).
  // Light accent: dark gold (#a16207) — bright #FFEE58 yellow is invisible on white; deep gold has gravitas.
  // Dark accent: electric yellow (#FFEE58) — on black this IS the point.
  {
    id: 'wp-midnight',
    name: 'Midnight',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#fafaf9', secondary: '#1c1917', accent: '#a16207' },
      dark: { primary: '#111111', secondary: '#ffffff', accent: '#FFEE58' },
    },
  },

  // Dusk: Purple + lilac (TT25).
  // Light accent: medium purple (#a855f7) — the lilac #F6CFF4 disappears on light; need visible purple.
  // Dark accent: soft lilac (#F6CFF4) — ethereal glow on deep purple, like actual dusk sky.
  {
    id: 'wp-dusk',
    name: 'Dusk',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#f5f0ff', secondary: '#3b1d8e', accent: '#a855f7' },
      dark: { primary: '#2e1065', secondary: '#ede9fe', accent: '#F6CFF4' },
    },
  },

  // Grove: Dark green + neon green (TT23).
  // Light accent: olive green (#4d7c0f) — neon #9DFF20 is blinding on light bg; olive keeps forest feel.
  // Dark accent: neon green (#9DFF20) — on near-black is bold and deliberate.
  {
    id: 'wp-grove',
    name: 'Grove',
    defaultVariant: 'dark',
    variants: {
      light: { primary: '#f7fee7', secondary: '#365314', accent: '#4d7c0f' },
      dark: { primary: '#1a2e05', secondary: '#ecfccb', accent: '#9DFF20' },
    },
  },
]

// Helper to resolve a theme's colors for a given variant.
// Returns { primary, secondary, accent } for the requested variant,
// falling back to the theme's defaultVariant if the variant doesn't exist.
export const getThemeVariant = (theme, variant) => {
  if (!theme?.variants) return { primary: '#1a1a1a', secondary: '#ffffff', accent: '#3b82f6' }
  return theme.variants[variant] || theme.variants[theme.defaultVariant] || theme.variants.dark
}

// Helper to find a theme by ID, with backward compatibility for old 'dark'/'light' IDs.
// Returns { theme, variant } where variant is resolved from old IDs or the theme's default.
export const resolveThemePreset = (presetId) => {
  // Backward compat: old 'dark' and 'light' presets map to 'neutral'
  if (presetId === 'dark') return { theme: presetThemes[0], variant: 'dark' }
  if (presetId === 'light') return { theme: presetThemes[0], variant: 'light' }

  const theme = presetThemes.find((t) => t.id === presetId)
  if (!theme) return null
  return { theme, variant: theme.defaultVariant }
}
