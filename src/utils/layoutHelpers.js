// Requirement: Pure layout-structure helper functions extracted from LayoutTab.jsx.
// Approach: Centralise cell-to-section mapping, section start calculation, and size
//   constraint logic so they can be reused (e.g. by AdCanvas, cellUtils, or tests)
//   without importing the full LayoutTab component.
// Alternatives:
//   - Keep in LayoutTab.jsx: Rejected — functions are pure (no component state) and
//     could be needed elsewhere; co-locating them couples reusable logic to the UI.
//   - Merge into cellUtils.js: Rejected — cellUtils handles cell-index arithmetic
//     (counting, shifting, swapping), while these deal with layout-structure geometry.
//     Separate concerns warrant separate files.

// Size constraints for layout sections and subdivisions
export const MIN_SIZE = 10
export const MAX_SIZE = 90

// Calculate the maximum size a section/cell can be based on how many others need minimum space
export function getMaxSize(totalItems) {
  if (totalItems <= 1) return 100
  return Math.min(MAX_SIZE, 100 - (totalItems - 1) * MIN_SIZE)
}

// Requirement: Derive section context from selectedCell instead of maintaining separate state.
// Approach: Maps a cell index to its containing section index and subdivision index.
// Why: Eliminates the parallel structureSelection state that caused sync bugs.
export function cellToSection(structure, type, cellIndex) {
  const normalized =
    type === 'fullbleed' || !structure || structure.length === 0
      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
      : structure
  // Guard: clamp invalid indices to first cell instead of silently misattributing
  if (cellIndex < 0) return { sectionIndex: 0, subIndex: 0 }
  let idx = 0
  for (let si = 0; si < normalized.length; si++) {
    const subs = normalized[si].subdivisions || 1
    for (let sub = 0; sub < subs; sub++) {
      if (idx === cellIndex) return { sectionIndex: si, subIndex: sub }
      idx++
    }
  }
  // cellIndex exceeds total cells — fall back to first cell
  return { sectionIndex: 0, subIndex: 0 }
}

// Calculate the first cell index of a given section
export function getFirstCellOfSection(structure, sectionIndex) {
  let idx = 0
  for (let i = 0; i < sectionIndex; i++) {
    idx += structure[i].subdivisions || 1
  }
  return idx
}
