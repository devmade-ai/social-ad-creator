// Export helper utilities — pure functions and constants used by ExportButtons.
// Extracted to keep the component focused on UI and to enable reuse/testing.

import { toCanvas } from 'html-to-image'

// Requirement: Export in multiple image formats (PNG, JPG, WebP)
// Approach: Format toggle above export buttons, shared captureElement helper
// Why: Different platforms recommend different formats. JPG for photos (smaller),
//   PNG for text/graphics (lossless), WebP for best compression.
// Alternatives:
//   - Always PNG: Rejected - users asked for format choice, platforms recommend JPG
//   - Auto-detect from platform: Rejected - user should have final say

export const FORMAT_OPTIONS = [
  { id: 'png', label: 'PNG', description: 'Lossless, best for text & graphics' },
  { id: 'jpg', label: 'JPG', description: 'Smaller files, best for photos' },
  { id: 'webp', label: 'WebP', description: 'Smallest files, modern format' },
]

export const FILE_EXTENSIONS = { jpg: 'jpg', webp: 'webp', png: 'png' }

// Capture element as blob in the selected format.
// Uses toCanvas → canvas.toBlob for all formats to avoid the wasteful
// fetch(dataUrl) round-trip that the toJpeg/toPng → fetch pattern requires.
const MIME_TYPES = { jpg: 'image/jpeg', webp: 'image/webp', png: 'image/png' }

// Requirement: Timestamp-first filenames for chronological sort in downloads folder
// Approach: YYMMdd-HHmm prefix ensures newest files sort first alphabetically.
//   Also avoids browser "already exists" prompts on repeated downloads.
// Alternatives:
//   - App name prefix (canvagrid-): Rejected - adds noise, doesn't help sorting
//   - Full ISO timestamp: Rejected - too long, clutters filename
//   - Unix epoch: Rejected - not human-readable
export function getTimestamp() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `${yy}${mm}${dd}-${hh}${min}${ss}`
}

// Wait for React re-render + browser paint to settle before canvas capture.
// Double-rAF ensures at least one paint cycle has occurred.
// Extra 100ms timeout ensures complex layouts with images/fonts are fully composited on slower devices.
export function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)))
  })
}

// Temporarily hide canvas during export and restore after.
// Returns a restore function to call in finally blocks.
export function hideCanvas(element) {
  const originalOpacity = element.style.opacity
  element.style.opacity = '0'
  return () => { element.style.opacity = originalOpacity }
}

// Set canvas to full size for capture, returns restore function
export function setFullScale(element) {
  const originalTransform = element.style.transform
  element.style.transform = 'scale(1)'
  return () => { element.style.transform = originalTransform }
}

export async function captureAsBlob(element, width, height, format) {
  const canvas = await toCanvas(element, {
    width,
    height,
    pixelRatio: 1,
    style: { opacity: '1', transform: 'scale(1)' },
  })
  const mime = MIME_TYPES[format] || 'image/png'
  // PNG is lossless (no quality param). WebP needs higher quality than JPG because
  // its lossy encoder handles smooth gradients differently — 0.95 can show subtle
  // blocking on vignettes that JPG doesn't at the same number.
  const quality = format === 'png' ? undefined : format === 'webp' ? 0.98 : 0.95
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas capture failed — image may be cross-origin')),
      mime,
      quality,
    )
  )
}

// Requirement: PDF export preserving full platform resolution for sharing/uploading.
// Approach: Capture at user-selected pixelRatio (1x/2x/3x), embed in PDF page at
//   platform pixel dimensions (1:1 px-to-pt). Image pixels exceed page points,
//   giving integer px/pt ratios (1:1 low, 2:1 standard, 3:1 high).
// Print exception: pixelRatio always 1 with 72/150 DPI-to-point conversion for
//   correct physical page size. Higher ratios would create non-integer scaling.
// History: (1) 72/96 conversion → 2.667:1 non-integer ratio, gradient banding.
//   (2) 1:1 mapping + page scaled with pixelRatio → all qualities identical on mobile.
//   (3) pxToPt=1 fixed page + variable pixelRatio → current approach.
// Alternatives:
//   - pixelRatio:1 for everything: Rejected — 72 DPI looks blurry on 2-3x screens.
//   - JPEG capture: Rejected — DCT 8x8 blocks cause banding on smooth gradients.
//     PNG is lossless and pdf-lib embeds via FlateDecode (no re-encoding).

export async function captureForPdf(element, width, height, pixelRatio = 2) {
  const canvas = await toCanvas(element, {
    width,
    height,
    pixelRatio,
    style: { opacity: '1', transform: 'scale(1)' },
  })
  // PNG: lossless capture — pdf-lib embeds directly with FlateDecode (no re-encoding).
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('Canvas capture failed')),
      'image/png',
    )
  )
  return { data: new Uint8Array(await blob.arrayBuffer()), format: 'png' }
}
