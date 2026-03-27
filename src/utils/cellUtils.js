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

  // Positional label for a section or subdivision index within its group
  const getPositionLabel = (index, total, axis) => {
    if (total <= 1) return ''
    if (total === 2) return index === 0 ? axis[0] : axis[2]
    if (index === 0) return axis[0]
    if (index === total - 1) return axis[2]
    // For 4+ items, use numbered middle labels (e.g. "middle 2", "middle 3")
    if (total > 3) return `${axis[1]} ${index}`
    return axis[1]
  }

  const sectionAxis = isRows ? ['top', 'middle', 'bottom'] : ['left', 'center', 'right']
  const subAxis = isRows ? ['left', 'center', 'right'] : ['top', 'middle', 'bottom']

  let idx = 0
  for (let s = 0; s < structure.length; s++) {
    const subs = structure[s].subdivisions || 1
    for (let sub = 0; sub < subs; sub++) {
      if (idx === cellIndex) {
        const sectionLabel = getPositionLabel(s, structure.length, sectionAxis)
        const subLabel = getPositionLabel(sub, subs, subAxis)
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

// Remove entries from a cell-indexed object where the key >= newCellCount.
// Guards against NaN from non-numeric keys (corrupted state) by treating them as invalid.
function pruneOrphanedKeys(obj, newCellCount) {
  const clean = { ...obj }
  Object.keys(clean).forEach((key) => {
    const idx = parseInt(key, 10)
    if (isNaN(idx) || idx >= newCellCount) {
      delete clean[key]
    }
  })
  return clean
}

/**
 * Clean up cell-indexed data that references cells beyond newCellCount.
 * Used when layout changes reduce the number of cells.
 */
export function cleanupOrphanedCells(prevState, newCellCount) {
  const cleanCellImages = pruneOrphanedKeys(prevState.cellImages || {}, newCellCount)
  const cleanPaddingOverrides = pruneOrphanedKeys(prevState.padding?.cellOverrides || {}, newCellCount)
  const cleanCellFrames = pruneOrphanedKeys(prevState.frame?.cellFrames || {}, newCellCount)
  const cleanFreeformText = pruneOrphanedKeys(prevState.freeformText || {}, newCellCount)
  const cleanText = pruneOrphanedKeys(prevState.text || {}, newCellCount)

  // Note: cellAlignments and cellOverlays live inside layout and are cleaned
  // by setLayout/applyLayoutPreset separately (they need to clean from the
  // NEW layout, not prev.layout). Don't duplicate that cleanup here.
  return {
    text: cleanText,
    cellImages: cleanCellImages,
    paddingOverrides: cleanPaddingOverrides,
    cellFrames: cleanCellFrames,
    freeformText: cleanFreeformText,
  }
}

/**
 * Shift layout-internal cell data (cellAlignments, cellOverlays, cellBackgrounds)
 * when cells are inserted or removed at a position.
 * Requirement: Layout-internal per-cell data must stay in sync with shiftCellIndices.
 * Approach: Centralizes the 3 parallel shift loops that were inline in useAdState.setLayout.
 *
 * @param {Object} layout - Current layout object
 * @param {number} fromIndex - First cell index affected by the shift
 * @param {number} shiftBy - Number of cells to shift (positive = insert, negative = remove)
 * @returns {Object} { cellAlignments, cellOverlays, cellBackgrounds }
 */
export function shiftLayoutCellData(layout, fromIndex, shiftBy) {
  const defaultAlignment = { textAlign: null, textVerticalAlign: null }

  // Shift array-indexed cellAlignments
  const oldAlignments = layout.cellAlignments || []
  const shiftedAlignments = []
  for (let i = 0; i < oldAlignments.length; i++) {
    if (i >= fromIndex) {
      const newIdx = i + shiftBy
      if (newIdx >= 0) shiftedAlignments[newIdx] = oldAlignments[i]
    } else {
      shiftedAlignments[i] = oldAlignments[i]
    }
  }
  for (let i = 0; i < shiftedAlignments.length; i++) {
    if (!shiftedAlignments[i]) shiftedAlignments[i] = defaultAlignment
  }

  // Shift object-keyed fields using a shared helper
  const shiftObjKeys = (obj) => {
    if (!obj) return {}
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      const idx = parseInt(key, 10)
      if (idx >= fromIndex) {
        const newIdx = idx + shiftBy
        if (newIdx >= 0) result[newIdx] = value
      } else {
        result[key] = value
      }
    }
    return result
  }

  return {
    cellAlignments: shiftedAlignments,
    cellOverlays: shiftObjKeys(layout.cellOverlays),
    cellBackgrounds: shiftObjKeys(layout.cellBackgrounds),
  }
}

/**
 * Swap layout-internal cell data (cellAlignments, cellOverlays, cellBackgrounds)
 * when sections are reordered.
 * Requirement: Layout-internal per-cell data must stay in sync with swapCellIndices.
 * Approach: Centralizes the 3 parallel swap blocks that were inline in useAdState.setLayout.
 *
 * @param {Object} layout - Current layout object
 * @param {Object} cellMap - Map of oldIndex → newIndex
 * @returns {Object} { cellAlignments, cellOverlays, cellBackgrounds }
 */
export function swapLayoutCellData(layout, cellMap) {
  const defaultAlignment = { textAlign: null, textVerticalAlign: null }

  // Remap cellAlignments (array)
  const oldAlignments = layout.cellAlignments || []
  const swappedAlignments = [...oldAlignments]
  for (const [oldIdx, newIdx] of Object.entries(cellMap)) {
    swappedAlignments[newIdx] = oldAlignments[parseInt(oldIdx, 10)] || defaultAlignment
  }

  // Remap object-keyed fields
  const remapObjKeys = (obj) => {
    if (!obj) return {}
    const result = { ...obj }
    for (const oldIdx of Object.keys(cellMap)) {
      delete result[oldIdx]
    }
    for (const [oldIdx, newIdx] of Object.entries(cellMap)) {
      if (obj[oldIdx]) result[newIdx] = obj[oldIdx]
    }
    return result
  }

  return {
    cellAlignments: swappedAlignments,
    cellOverlays: remapObjKeys(layout.cellOverlays),
    cellBackgrounds: remapObjKeys(layout.cellBackgrounds),
  }
}

/**
 * Shift cell-indexed data when cells are inserted or removed at a position.
 * Requirement: When inserting/removing sections or subdivisions, all per-cell data
 *   (text, images, overlays, etc.) must be remapped so content stays with the correct cell.
 * Approach: Remap object keys and array indices by shifting all indices >= fromIndex by shiftBy.
 * Alternatives:
 *   - Only clean orphans (no shift): Rejected — silently reassigns content to wrong cells.
 *
 * @param {Object} prevState - Current state
 * @param {number} fromIndex - First cell index affected by the shift
 * @param {number} shiftBy - Number of cells to shift (positive = insert, negative = remove)
 * @returns {Object} State fields with remapped cell indices
 */
export function shiftCellIndices(prevState, fromIndex, shiftBy) {
  const shiftObjectKeys = (obj) => {
    if (!obj) return {}
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      const idx = parseInt(key, 10)
      if (idx >= fromIndex) {
        const newIdx = idx + shiftBy
        if (newIdx >= 0) result[newIdx] = value
      } else {
        result[key] = value
      }
    }
    return result
  }

  return {
    text: shiftObjectKeys(prevState.text),
    cellImages: shiftObjectKeys(prevState.cellImages),
    paddingOverrides: shiftObjectKeys(prevState.padding?.cellOverrides),
    cellFrames: shiftObjectKeys(prevState.frame?.cellFrames),
    freeformText: shiftObjectKeys(prevState.freeformText),
  }
}

/**
 * Swap cell-indexed data between two sections.
 * Requirement: When reordering sections, all per-cell data must follow the content.
 * Approach: Build a bidirectional index mapping from the two sections' cell ranges, then rekey.
 * Alternatives:
 *   - Two sequential shifts: Rejected — overlapping ranges cause data loss.
 *   - Store data by section ID instead of index: Rejected — massive refactor for one feature.
 *
 * @param {Object} prevState - Current state
 * @param {Object} cellMap - Map of oldIndex → newIndex (must be bidirectional/complete for affected cells)
 * @returns {Object} State fields with remapped cell indices
 */
export function swapCellIndices(prevState, cellMap) {
  const remapObjectKeys = (obj) => {
    if (!obj) return {}
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      const idx = parseInt(key, 10)
      const newIdx = cellMap[idx]
      result[newIdx !== undefined ? newIdx : idx] = value
    }
    return result
  }

  return {
    text: remapObjectKeys(prevState.text),
    cellImages: remapObjectKeys(prevState.cellImages),
    paddingOverrides: remapObjectKeys(prevState.padding?.cellOverrides),
    cellFrames: remapObjectKeys(prevState.frame?.cellFrames),
    freeformText: remapObjectKeys(prevState.freeformText),
  }
}
