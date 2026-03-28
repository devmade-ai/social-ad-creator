// Requirement: Single source of truth for default text layer state.
// Approach: Shared constant used by AdCanvas (rendering) and ContentTab (editing fallback).
// Alternatives:
//   - Separate defaults per file: Rejected — fields drift out of sync (e.g. AdCanvas was
//     missing bold, italic, letterSpacing that ContentTab expected).

export interface TextLayer {
  content: string
  visible: boolean
  color: string
  size: number
  bold: boolean
  italic: boolean
  letterSpacing: number
  textAlign: string | null
  textVerticalAlign: string | null
  spacerAbove: number
  spacerBelow: number
  lineAbove: boolean
  lineBelow: boolean
}

export interface FreeformBlock {
  id: string
  content: string
  color: string
  size: number
  bold: boolean
  italic: boolean
  letterSpacing: number
  textAlign: string | null
  spacerAbove: number
  spacerBelow: number
  lineAbove: boolean
  lineBelow: boolean
}

export const defaultTextLayer: TextLayer = {
  content: '',
  visible: false,
  color: 'secondary',
  size: 1,
  bold: false,
  italic: false,
  letterSpacing: 0,
  textAlign: null,
  textVerticalAlign: null,
  // Requirement: Per-element spacers and line separators in structured text mode.
  // Approach: Stored directly on each text layer, rendered by AdCanvas above/below the element.
  // Alternatives:
  //   - Per-group (groupSpacing object): Rejected — per-element gives finer control.
  //   - Separate decoration state: Rejected — co-locating with the element is simpler.
  spacerAbove: 0,   // 0 = none, 1 = small (0.5em), 2 = large (1.5em)
  spacerBelow: 0,
  lineAbove: false,
  lineBelow: false,
}

// Requirement: Multi-block freeform text — each block has independent styling.
// Approach: Shared default used by ContentTab (editing) and AdCanvas (rendering).
export const defaultFreeformBlock: FreeformBlock = {
  id: '',
  content: '',
  color: 'secondary',
  size: 1,
  bold: false,
  italic: false,
  letterSpacing: 0,
  textAlign: null,
  spacerAbove: 0,
  spacerBelow: 0,
  lineAbove: false,
  lineBelow: false,
}

export function createFreeformBlock(overrides: Partial<FreeformBlock> = {}): FreeformBlock {
  return {
    ...defaultFreeformBlock,
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    ...overrides,
  }
}

// Map spacer values to em units for rendering
export const spacerSizeMap: Record<number, number> = {
  0: 0,
  1: 0.5,
  2: 1.5,
}
