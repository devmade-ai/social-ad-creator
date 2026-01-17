export const overlayTypes = [
  {
    id: 'solid',
    name: 'Solid',
    getCss: (color, opacity) => color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba'),
  },
  {
    id: 'gradient-down',
    name: 'Gradient ↓',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to bottom, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-up',
    name: 'Gradient ↑',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to top, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-left',
    name: 'Gradient ←',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to left, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-right',
    name: 'Gradient →',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to right, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-tl',
    name: 'Gradient ↖',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to top left, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-tr',
    name: 'Gradient ↗',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to top right, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-bl',
    name: 'Gradient ↙',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to bottom left, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-br',
    name: 'Gradient ↘',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to bottom right, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'vignette',
    name: 'Vignette',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `radial-gradient(ellipse at center, transparent 0%, ${rgbaColor} 100%)`
    },
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `radial-gradient(ellipse at center, ${rgbaColor} 0%, transparent 70%)`
    },
  },
]

// Helper to convert hex to rgb string
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 'rgb(0, 0, 0)'
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
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
