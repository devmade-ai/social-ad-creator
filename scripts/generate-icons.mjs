import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

const svgBuffer = readFileSync(resolve(publicDir, 'icon.svg'))

// Requirement: Generate all PNG sizes from single SVG source.
// 1024px maskable icon uses separate manifest entry (purpose: "maskable" only).
// SVG design rule: important content within inner 80% (maskable safe zone).
//
// 400 DPI: ~5.5x the default 72 DPI. Sharp rasterizes the SVG at this density
// before downscaling, so edges are anti-aliased from high-res source data.
// The 192px PWA icon benefits most — arc and shape edges are noticeably crisper.
// Ref: glow-props Implementation Patterns → App Icons from SVG Source.
const SVG_DENSITY = 400

const sizes = [
  { name: 'favicon.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'pwa-maskable-1024.png', size: 1024 },
]

async function generate() {
  for (const { name, size } of sizes) {
    await sharp(svgBuffer, { density: SVG_DENSITY })
      .resize(size, size)
      .png()
      .toFile(resolve(publicDir, name))
    console.log(`  ${name} (${size}x${size})`)
  }
  console.log(`Done — ${sizes.length} icons generated.`)
}

generate().catch((err) => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
