// Requirement: Single source of truth for default text layer state.
// Approach: Shared constant used by AdCanvas (rendering) and ContentTab (editing fallback).
// Alternatives:
//   - Separate defaults per file: Rejected — fields drift out of sync (e.g. AdCanvas was
//     missing bold, italic, letterSpacing that ContentTab expected).

export const defaultTextLayer = {
  content: '',
  visible: false,
  color: 'secondary',
  size: 1,
  bold: false,
  italic: false,
  letterSpacing: 0,
  textAlign: null,
  textVerticalAlign: null,
}

// Requirement: Per-group spacers and line separators in structured text mode.
// Approach: Stored as text[cellIndex].groupSpacing[groupId], read by AdCanvas for rendering.
// Alternatives:
//   - Store in layout state: Rejected — this is content decoration, not layout structure.
//   - Per-element instead of per-group: Rejected — groups are the visual unit users see.
export const defaultGroupSpacing = {
  spacerAbove: 0,   // 0 = none, 1 = small (0.5em), 2 = large (1.5em)
  spacerBelow: 0,
  lineAbove: false,
  lineBelow: false,
}

// Map spacer values to em units for rendering
export const spacerSizeMap = {
  0: 0,
  1: 0.5,
  2: 1.5,
}
