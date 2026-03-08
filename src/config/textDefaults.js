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
