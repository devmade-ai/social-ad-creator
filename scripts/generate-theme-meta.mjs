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
import { oklchToHex } from './oklchToHex.mjs'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

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
