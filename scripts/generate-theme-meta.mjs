// Requirement: Auto-generate hex meta theme-color values from DaisyUI's oklch theme definitions.
// Approach: Read DaisyUI's theme objects, convert oklch→hex, and update daisyuiThemes.js + index.html.
//   Light themes use --color-primary, dark themes use --color-base-100.
//   Light/dark classification derived from each theme's color-scheme property.
// Alternatives:
//   - Manual hex values: Rejected — error-prone, goes stale on DaisyUI updates.
//   - Runtime conversion: Rejected — adds bundle size, flash-prevention script can't import modules.
//
// Run: node scripts/generate-theme-meta.mjs
// Run after: DaisyUI version updates, or adding/removing curated themes.

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// ---------------------------------------------------------------------------
// 1. oklch → hex conversion (oklab → LMS → linear-sRGB → gamma-sRGB → hex)
// ---------------------------------------------------------------------------

function oklchToHex(oklchStr) {
  // Parse "oklch(L% C H)" — L is percentage (0–100), C is chroma, H is hue in degrees
  const match = oklchStr.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!match) return null

  let L = parseFloat(match[1])
  const C = parseFloat(match[2])
  const H = parseFloat(match[3])

  // Normalize L from percentage to 0–1 range
  if (L > 1) L = L / 100

  // oklch → oklab
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  // oklab → LMS (cube roots)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  // LMS → linear sRGB
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  // Gamma correction (linear → sRGB)
  function gammaCorrect(c) {
    if (c <= 0.0031308) return 12.92 * c
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  }

  // Clamp to 0–255 and convert to hex
  function toHexByte(c) {
    const val = Math.round(Math.max(0, Math.min(1, gammaCorrect(c))) * 255)
    return val.toString(16).padStart(2, '0')
  }

  return `#${toHexByte(lr)}${toHexByte(lg)}${toHexByte(lb)}`
}

// ---------------------------------------------------------------------------
// 2. Read DaisyUI theme objects and extract hex colors
// ---------------------------------------------------------------------------

const daisyuiThemes = require('daisyui/theme/object.js').default

// Curated theme list — order matters (determines UI display order).
// To add/remove themes, edit these arrays and re-run.
const LIGHT_THEME_IDS = ['nord', 'lofi', 'emerald', 'cupcake', 'garden', 'autumn', 'pastel', 'caramellatte']
const DARK_THEME_IDS = ['night', 'black', 'forest', 'dracula', 'dim', 'synthwave', 'luxury', 'coffee']

// Display names and descriptions — must match daisyuiThemes.js
const THEME_META = {
  nord: { name: 'Nord', description: 'Cool blue-gray' },
  lofi: { name: 'Lo-Fi', description: 'Minimal mono' },
  emerald: { name: 'Emerald', description: 'Fresh green' },
  cupcake: { name: 'Cupcake', description: 'Soft pastels' },
  garden: { name: 'Garden', description: 'Warm green' },
  autumn: { name: 'Autumn', description: 'Earthy warm' },
  pastel: { name: 'Pastel', description: 'Soft muted' },
  caramellatte: { name: 'Caramel', description: 'Warm brown' },
  night: { name: 'Night', description: 'Deep blue' },
  black: { name: 'Black', description: 'True OLED' },
  forest: { name: 'Forest', description: 'Deep green' },
  dracula: { name: 'Dracula', description: 'Bold purple' },
  dim: { name: 'Dim', description: 'Muted warm' },
  synthwave: { name: 'Synthwave', description: 'Neon retro' },
  luxury: { name: 'Luxury', description: 'Dark gold' },
  coffee: { name: 'Coffee', description: 'Dark roast' },
}

const DEFAULT_LIGHT = 'lofi'
const DEFAULT_DARK = 'black'

// Per-theme color key overrides. Default: dark → base-100, light → primary.
// Some light themes have primary colors that don't represent the theme feel
// (e.g. lofi primary is near-black, garden primary is hot pink, caramellatte
// primary is pure black). Override those to use a more representative color.
const COLOR_KEY_OVERRIDES = {
  lofi: '--color-base-300',        // Monochrome theme — neutral gray > near-black primary
  garden: '--color-base-300',      // Theme feel is warm green — primary is pink accent
  caramellatte: '--color-base-300', // Theme feel is warm brown — primary is pure black
}

function getHexForTheme(id) {
  const theme = daisyuiThemes[id]
  if (!theme) throw new Error(`Theme "${id}" not found in DaisyUI`)

  const scheme = theme['color-scheme']
  const defaultKey = scheme === 'dark' ? '--color-base-100' : '--color-primary'
  const colorKey = COLOR_KEY_OVERRIDES[id] || defaultKey
  const oklch = theme[colorKey]
  if (!oklch) throw new Error(`Theme "${id}" missing ${colorKey}`)

  const hex = oklchToHex(oklch)
  if (!hex) throw new Error(`Failed to convert ${oklch} for theme "${id}"`)

  return hex
}

// ---------------------------------------------------------------------------
// 3. Generate all hex values
// ---------------------------------------------------------------------------

const lightEntries = LIGHT_THEME_IDS.map(id => ({
  id,
  ...THEME_META[id],
  metaColor: getHexForTheme(id),
}))

const darkEntries = DARK_THEME_IDS.map(id => ({
  id,
  ...THEME_META[id],
  metaColor: getHexForTheme(id),
}))

const defaultLightHex = getHexForTheme(DEFAULT_LIGHT)
const defaultDarkHex = getHexForTheme(DEFAULT_DARK)

console.log('Generated meta theme-colors:')
console.log('Light themes:')
lightEntries.forEach(e => console.log(`  ${e.id}: ${e.metaColor}`))
console.log('Dark themes:')
darkEntries.forEach(e => console.log(`  ${e.id}: ${e.metaColor}`))
console.log(`Defaults: light=${defaultLightHex}, dark=${defaultDarkHex}`)

// ---------------------------------------------------------------------------
// 4. Update daisyuiThemes.js
// ---------------------------------------------------------------------------

function generateThemeEntry(entry) {
  return `  { id: '${entry.id}', name: '${entry.name}', description: '${entry.description}', metaColor: '${entry.metaColor}' },`
}

const themeFileContent = `// Requirement: Independent per-mode DaisyUI theme selection.
// Approach: Curated lists of light and dark themes with metadata for UI and PWA theming.
//   Each mode remembers its own theme choice via localStorage.
// Alternatives:
//   - Paired combos (glow-props pattern): Rejected — user wants independent selection.
//   - All 30+ DaisyUI themes: Rejected — too many, some are novelty. Curated for quality.

// Meta theme-color for PWA status bar — matches each theme's primary or base color.
// AUTO-GENERATED by scripts/generate-theme-meta.mjs from DaisyUI oklch values.
// Do not edit metaColor values manually — run the script after DaisyUI updates.

export const lightThemes = [
${lightEntries.map(generateThemeEntry).join('\n')}
]

export const darkThemes = [
${darkEntries.map(generateThemeEntry).join('\n')}
]

export const DEFAULT_LIGHT_THEME = '${DEFAULT_LIGHT}'
export const DEFAULT_DARK_THEME = '${DEFAULT_DARK}'

// Look up meta theme-color for a given theme ID.
// Falls back to neutral values if theme not found.
export function getMetaColor(themeId) {
  const all = [...lightThemes, ...darkThemes]
  const found = all.find(t => t.id === themeId)
  return found?.metaColor ?? '#808080'
}
`

writeFileSync(resolve(rootDir, 'src/config/daisyuiThemes.js'), themeFileContent)
console.log('\n✓ Updated src/config/daisyuiThemes.js')

// ---------------------------------------------------------------------------
// 5. Update index.html — meta tags and inline flash-prevention script
// ---------------------------------------------------------------------------

let html = readFileSync(resolve(rootDir, 'index.html'), 'utf-8')

// Update meta theme-color tags
html = html.replace(
  /(<meta name="theme-color" content=")([^"]+)(" media="\(prefers-color-scheme: light\)")/,
  `$1${defaultLightHex}$3`
)
html = html.replace(
  /(<meta name="theme-color" content=")([^"]+)(" media="\(prefers-color-scheme: dark\)")/,
  `$1${defaultDarkHex}$3`
)

// Update comment with default theme hex values
html = html.replace(
  /Light = lofi \([^)]+\), Dark = black \([^)]+\)/,
  `Light = lofi (${defaultLightHex}), Dark = black (${defaultDarkHex})`
)

// Update inline allowlists in flash-prevention script
const lightList = LIGHT_THEME_IDS.map(id => `'${id}'`).join(',')
const darkList = DARK_THEME_IDS.map(id => `'${id}'`).join(',')
html = html.replace(
  /var light = \[[^\]]+\];/,
  `var light = [${lightList}];`
)
html = html.replace(
  /var dark = \[[^\]]+\];/,
  `var dark = [${darkList}];`
)

// Update meta theme-color map in flash-prevention script (add if not present)
// Build inline color map for the flash-prevention script
const allColorMap = {}
lightEntries.forEach(e => { allColorMap[e.id] = e.metaColor })
darkEntries.forEach(e => { allColorMap[e.id] = e.metaColor })

const colorMapStr = JSON.stringify(allColorMap)

// Check if there's already a meta color map in the inline script
if (html.includes('var metaColors =')) {
  html = html.replace(
    /var metaColors = [^;]+;/,
    `var metaColors = ${colorMapStr};`
  )
  // Also update the fallback color after the map
  html = html.replace(
    /var mc = metaColors\[theme\] \|\| '[^']+';/,
    `var mc = metaColors[theme] || '#808080';`
  )
} else {
  // Insert meta color update into the flash-prevention script, before the closing catch
  html = html.replace(
    "root.setAttribute('data-theme', theme);",
    `root.setAttribute('data-theme', theme);
          var metaColors = ${colorMapStr};
          var mc = metaColors[theme] || '#808080';
          document.querySelectorAll('meta[name="theme-color"]').forEach(function(m) { m.setAttribute('content', mc); });`
  )
}

writeFileSync(resolve(rootDir, 'index.html'), html)
console.log('✓ Updated index.html (meta tags + inline script)')

console.log('\nDone. All theme-color values are now in sync.')
