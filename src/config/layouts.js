export const overlayTypes = [
  {
    id: 'solid',
    name: 'Solid',
    getCss: (color, opacity) => color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba'),
  },
  {
    id: 'gradient-down',
    name: 'Gradient Down',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to bottom, ${rgbaColor}, transparent)`
    },
  },
  {
    id: 'gradient-up',
    name: 'Gradient Up',
    getCss: (color, opacity) => {
      const rgbaColor = color.replace(')', `, ${opacity / 100})`).replace('rgb', 'rgba')
      return `linear-gradient(to top, ${rgbaColor}, transparent)`
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
]

// Helper to convert hex to rgb string
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 'rgb(0, 0, 0)'
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
}
