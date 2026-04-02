// Requirement: Convert DaisyUI's oklch color strings to hex for meta theme-color tags.
// Approach: oklch → oklab → LMS → linear-sRGB → gamma-sRGB → hex.
//   Extracted to a standalone module for testability and reuse by generate-theme-meta.mjs.
// Alternatives:
//   - Inline in generate-theme-meta.mjs: Rejected — not testable without importing the whole script.
//   - Runtime CSS conversion (getComputedStyle): Rejected — requires a browser/DOM environment.

// Parse oklch string and convert to hex.
// Handles: oklch(L% C H), oklch(L C H), oklch(L% C H / alpha).
// Achromatic colors (C=0) work correctly — hue is irrelevant when chroma is zero.
export function oklchToHex(oklchStr) {
  // Regex handles:
  //   - L as percentage (e.g. "50%") or decimal (e.g. "0.5")
  //   - Optional hue (achromatic when C=0, some implementations omit H)
  //   - Optional alpha channel (ignored — meta theme-color doesn't support alpha)
  const match = oklchStr.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)(?:\s+([\d.]+))?\s*(?:\/\s*[\d.]+%?\s*)?\)/)
  if (!match) return null

  let L = parseFloat(match[1])
  const C = parseFloat(match[2])
  const H = match[3] !== undefined ? parseFloat(match[3]) : 0

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
