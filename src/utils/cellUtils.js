// Requirement: Shared cell info utilities used by ContentTab, StyleTab, and LayoutTab.
// Approach: Extract duplicated getCellInfo() and getCellPositionLabel() into a single module.
// Alternatives:
//   - Keep per-file copies: Rejected — 3x duplication, divergent bugs.

/**
 * Get cell info array from a layout structure.
 * Returns [{index, label, sectionIndex, subIndex}] for each cell.
 */
export function getCellInfo(layout) {
  const { structure } = layout
  if (!structure || structure.length === 0) {
    return [{ index: 0, label: '1', sectionIndex: 0, subIndex: 0 }]
  }

  const cells = []
  let cellIndex = 0

  structure.forEach((section, sectionIndex) => {
    const subdivisions = section.subdivisions || 1
    for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
      cells.push({
        index: cellIndex,
        label: `${cellIndex + 1}`,
        sectionIndex,
        subIndex,
      })
      cellIndex++
    }
  })

  return cells
}

/**
 * Derive a human-readable position label for a cell (e.g. "top, left").
 * Used by ContentTab freeform mode to show cell positions.
 */
export function getCellPositionLabel(layout, cellIndex, totalCells) {
  if (totalCells <= 1) return ''
  const { type, structure } = layout
  if (type === 'fullbleed' || !structure || structure.length === 0) return ''

  // Rows: sections stack vertically (top/bottom), subs go horizontally (left/right)
  // Columns: sections stack horizontally (left/right), subs go vertically (top/bottom)
  const isRows = type === 'rows'
  const sectionAxis = isRows ? ['top', 'middle', 'bottom'] : ['left', 'center', 'right']
  const subAxis = isRows ? ['left', 'center', 'right'] : ['top', 'middle', 'bottom']

  let idx = 0
  for (let s = 0; s < structure.length; s++) {
    const subs = structure[s].subdivisions || 1
    for (let sub = 0; sub < subs; sub++) {
      if (idx === cellIndex) {
        const sectionLabel = structure.length <= 1 ? '' :
          s === 0 ? sectionAxis[0] : s === structure.length - 1 ? sectionAxis[2] : sectionAxis[1]
        const subLabel = subs <= 1 ? '' :
          sub === 0 ? subAxis[0] : sub === subs - 1 ? subAxis[2] : subAxis[1]
        return [sectionLabel, subLabel].filter(Boolean).join(', ')
      }
      idx++
    }
  }
  return ''
}

/**
 * Count total cells in a layout structure.
 */
export function countCells(structure) {
  if (!structure || structure.length === 0) return 1
  return structure.reduce((total, section) => total + (section.subdivisions || 1), 0)
}

/**
 * Clean up cell-indexed data that references cells beyond newCellCount.
 * Used when layout changes reduce the number of cells.
 */
export function cleanupOrphanedCells(prevState, newCellCount) {
  const cleanTextCells = { ...prevState.textCells }
  Object.keys(cleanTextCells).forEach((key) => {
    if (cleanTextCells[key] !== null && cleanTextCells[key] >= newCellCount) {
      cleanTextCells[key] = null
    }
  })

  const cleanCellImages = { ...prevState.cellImages }
  Object.keys(cleanCellImages).forEach((cellIndex) => {
    if (parseInt(cellIndex) >= newCellCount) {
      delete cleanCellImages[cellIndex]
    }
  })

  const cleanPaddingOverrides = { ...(prevState.padding?.cellOverrides || {}) }
  Object.keys(cleanPaddingOverrides).forEach((cellIndex) => {
    if (parseInt(cellIndex) >= newCellCount) {
      delete cleanPaddingOverrides[cellIndex]
    }
  })

  const cleanCellFrames = { ...(prevState.frame?.cellFrames || {}) }
  Object.keys(cleanCellFrames).forEach((cellIndex) => {
    if (parseInt(cellIndex) >= newCellCount) {
      delete cleanCellFrames[cellIndex]
    }
  })

  const cleanFreeformText = { ...(prevState.freeformText || {}) }
  Object.keys(cleanFreeformText).forEach((cellIndex) => {
    if (parseInt(cellIndex) >= newCellCount) {
      delete cleanFreeformText[cellIndex]
    }
  })

  return {
    textCells: cleanTextCells,
    cellImages: cleanCellImages,
    paddingOverrides: cleanPaddingOverrides,
    cellFrames: cleanCellFrames,
    freeformText: cleanFreeformText,
  }
}
