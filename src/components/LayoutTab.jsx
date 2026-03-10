// Requirement: Interactive grid structure editor with cell-based selection.
// Approach: Uses the same global selectedCell as all other tabs. Section context
//   (which row/column the cell belongs to) is derived, not stored separately.
//   Size constraints (MIN_SIZE=10, MAX_SIZE=90) prevent cells from becoming unusably small.
// Alternatives:
//   - Separate structureSelection state: Rejected — caused sync bugs between internal
//     and global selection, required complex bidirectional sync logic.
//   - Drag-to-resize on canvas: Rejected - complex to implement and hard to be precise on mobile.
//   - Numeric input only: Rejected - sliders give visual feedback for proportional sizing.
import { useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import MiniCellGrid from './MiniCellGrid'
import { platforms } from '../config/platforms'
import { defaultState } from '../hooks/useAdState'

const layoutTypes = [
  { id: 'fullbleed', name: 'Full', icon: '□' },
  { id: 'rows', name: 'Rows', icon: '☰' },
  { id: 'columns', name: 'Cols', icon: '|||' },
]

// Size constraints for layout sections and subdivisions
const MIN_SIZE = 10
const MAX_SIZE = 90

// Calculate the maximum size a section/cell can be based on how many others need minimum space
const getMaxSize = (totalItems) => {
  if (totalItems <= 1) return 100
  return Math.min(MAX_SIZE, 100 - (totalItems - 1) * MIN_SIZE)
}

// Requirement: Derive section context from selectedCell instead of maintaining separate state.
// Approach: Maps a cell index to its containing section index and subdivision index.
// Why: Eliminates the parallel structureSelection state that caused sync bugs.
function cellToSection(structure, type, cellIndex) {
  const normalized =
    type === 'fullbleed' || !structure || structure.length === 0
      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
      : structure
  let idx = 0
  for (let si = 0; si < normalized.length; si++) {
    const subs = normalized[si].subdivisions || 1
    for (let sub = 0; sub < subs; sub++) {
      if (idx === cellIndex) return { sectionIndex: si, subIndex: sub }
      idx++
    }
  }
  return { sectionIndex: 0, subIndex: 0 }
}

export default memo(function LayoutTab({
  layout,
  onLayoutChange,
  platform,
  selectedCell = 0,
  onSelectCell,
  cellImages = {},
  images = [],
}) {
  const { type = 'fullbleed', structure = [] } = layout

  // Derive section context from the globally selected cell
  const { sectionIndex: selectedSectionIndex, subIndex: selectedSubIndex } = useMemo(
    () => cellToSection(structure, type, selectedCell),
    [structure, type, selectedCell]
  )
  const selectedSection = type !== 'fullbleed' && structure.length > 0 ? structure[selectedSectionIndex] : null
  const hasSubdivisions = (selectedSection?.subdivisions || 1) > 1

  const platformAspectRatio = useMemo(() => {
    const p = platforms.find((pl) => pl.id === platform) || platforms[0]
    return p.width / p.height
  }, [platform])

  // Change layout type
  const handleTypeChange = (newType) => {
    if (newType === 'fullbleed') {
      onLayoutChange({
        type: 'fullbleed',
        structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
      })
    } else {
      onLayoutChange({
        type: newType,
        structure: [
          { size: 50, subdivisions: 1, subSizes: [100] },
          { size: 50, subdivisions: 1, subSizes: [100] },
        ],
      })
    }
    // Clamp global cell selection to valid range for the new layout
    const newCellCount = newType === 'fullbleed' ? 1 : 2
    if (selectedCell >= newCellCount) {
      onSelectCell?.(0)
    }
  }

  // Requirement: Insert a section at a specific position (before/after a given index)
  // Approach: splice() to insert at position, redistribute sizes equally, shift cell indices
  // Alternatives:
  //   - Always append at end: Rejected — user can't control placement without manual resizing
  //   - No index shift: Rejected — silently reassigns content to wrong cells
  const insertSection = (position) => {
    if (type === 'fullbleed' || structure.length >= 4) return
    const newSize = 100 / (structure.length + 1)
    const newStructure = structure.map((s) => ({ ...s, size: newSize }))
    newStructure.splice(position, 0, { size: newSize, subdivisions: 1, subSizes: [100] })
    // Calculate which cell index the new section occupies so we can shift data
    let firstCellAtPosition = 0
    for (let i = 0; i < position; i++) {
      firstCellAtPosition += structure[i].subdivisions || 1
    }
    onLayoutChange({
      structure: newStructure,
      _cellShift: { fromIndex: firstCellAtPosition, shiftBy: 1 },
    })
    // Shift selectedCell to follow the cell that moved
    if (selectedCell >= firstCellAtPosition) {
      onSelectCell?.(selectedCell + 1)
    }
  }

  // Add a section at the end (used when no section is selected)
  const addSection = () => {
    insertSection(structure.length)
  }

  // Requirement: Remove a section, shifting cell indices after the removed section.
  // Approach: Remove section, shift cells after it down by the section's subdivision count.
  // Alternatives:
  //   - No shift: Rejected — content in later cells moves to wrong visual position.
  const removeSection = (index) => {
    if (structure.length <= 1) return
    const removedSubs = structure[index].subdivisions || 1
    const newSize = 100 / (structure.length - 1)
    const newStructure = structure
      .filter((_, i) => i !== index)
      .map((s) => ({ ...s, size: newSize }))
    // Calculate first cell index of the removed section
    let firstCellOfRemoved = 0
    for (let i = 0; i < index; i++) {
      firstCellOfRemoved += structure[i].subdivisions || 1
    }
    onLayoutChange({
      structure: newStructure,
      _cellShift: { fromIndex: firstCellOfRemoved + removedSubs, shiftBy: -removedSubs },
    })
    // Update selectedCell: clamp if in removed section, shift if after it
    const newCellCount = newStructure.reduce((total, s) => total + (s.subdivisions || 1), 0)
    if (selectedCell >= firstCellOfRemoved && selectedCell < firstCellOfRemoved + removedSubs) {
      onSelectCell?.(Math.min(firstCellOfRemoved, newCellCount - 1))
    } else if (selectedCell >= firstCellOfRemoved + removedSubs) {
      onSelectCell?.(selectedCell - removedSubs)
    }
  }

  // Update section size with dynamic constraints
  // Max size is limited by needing to leave MIN_SIZE for each other section
  const updateSectionSize = (index, newSize) => {
    const numSections = structure.length
    const maxAllowed = getMaxSize(numSections)

    // Clamp the new size to valid range
    const clampedSize = Math.max(MIN_SIZE, Math.min(maxAllowed, newSize))

    const newStructure = [...structure]
    const oldSize = newStructure[index].size
    const sizeDiff = clampedSize - oldSize

    const otherIndices = structure.map((_, i) => i).filter((i) => i !== index)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + structure[i].size, 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      // Distribute the size change proportionally among other sections
      otherIndices.forEach((i) => {
        const proportion = structure[i].size / otherTotalSize
        const adjustment = sizeDiff * proportion
        const newOtherSize = structure[i].size - adjustment
        // Ensure each other section maintains at least MIN_SIZE
        newStructure[i] = { ...newStructure[i], size: Math.max(MIN_SIZE, Math.min(maxAllowed, newOtherSize)) }
      })
    }

    newStructure[index] = { ...newStructure[index], size: clampedSize }

    // Normalize to ensure total is exactly 100%
    const total = newStructure.reduce((sum, s) => sum + s.size, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      newStructure.forEach((s, i) => {
        newStructure[i] = { ...s, size: Math.max(MIN_SIZE, s.size * scale) }
      })
    }

    onLayoutChange({ structure: newStructure })
  }

  // Requirement: Add subdivision to a section, shifting cell indices after this section.
  // Approach: New sub is appended at end of section. Cells after this section shift by 1.
  // Alternatives:
  //   - No shift: Rejected — content in later cells moves to wrong visual position.
  const addSubdivision = (sectionIndex) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const currentSubs = section.subdivisions || 1

    if (currentSubs >= 3) return

    const newSubs = currentSubs + 1
    const evenSize = 100 / newSubs
    const newSubSizes = Array(newSubs).fill(evenSize)

    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: newSubSizes }
    // The new sub is added at the end of this section, so cells after it shift
    let firstCellAfterSection = 0
    for (let i = 0; i <= sectionIndex; i++) {
      firstCellAfterSection += structure[i].subdivisions || 1
    }
    onLayoutChange({
      structure: newStructure,
      _cellShift: { fromIndex: firstCellAfterSection, shiftBy: 1 },
    })
    // Shift selectedCell if it's after the new subdivision
    if (selectedCell >= firstCellAfterSection) {
      onSelectCell?.(selectedCell + 1)
    }
  }

  // Requirement: Remove subdivision from a section, shifting cell indices after it.
  // Approach: Last sub is removed. Cells after this section shift down by 1.
  // Alternatives:
  //   - No shift: Rejected — content in later cells moves to wrong visual position.
  const removeSubdivision = (sectionIndex) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const currentSubs = section.subdivisions || 1

    if (currentSubs <= 1) return

    const newSubs = currentSubs - 1
    const evenSize = 100 / newSubs
    const newSubSizes = Array(newSubs).fill(evenSize)

    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: newSubSizes }

    // The last sub of this section is removed, so cells after it shift down
    let firstCellAfterSection = 0
    for (let i = 0; i <= sectionIndex; i++) {
      firstCellAfterSection += structure[i].subdivisions || 1
    }
    // Shift from firstCellAfterSection (the cell that was after the removed sub)
    const removedCellIndex = firstCellAfterSection - 1
    onLayoutChange({
      structure: newStructure,
      _cellShift: { fromIndex: firstCellAfterSection, shiftBy: -1 },
    })
    // Update selectedCell: move to previous if removed, shift if after it
    if (selectedCell === removedCellIndex) {
      onSelectCell?.(Math.max(0, removedCellIndex - 1))
    } else if (selectedCell >= firstCellAfterSection) {
      onSelectCell?.(selectedCell - 1)
    }
  }

  // Update subdivision sizes with dynamic constraints
  // Max size is limited by needing to leave MIN_SIZE for each other subdivision
  const updateSubSize = (sectionIndex, subIndex, newSize) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const subSizes = [...(section.subSizes || [])]
    const numSubs = subSizes.length
    const maxAllowed = getMaxSize(numSubs)

    // Clamp the new size to valid range
    const clampedSize = Math.max(MIN_SIZE, Math.min(maxAllowed, newSize))

    const oldSize = subSizes[subIndex]
    const sizeDiff = clampedSize - oldSize

    const otherIndices = subSizes.map((_, i) => i).filter((i) => i !== subIndex)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + subSizes[i], 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      // Distribute the size change proportionally among other subdivisions
      otherIndices.forEach((i) => {
        const proportion = subSizes[i] / otherTotalSize
        const adjustment = sizeDiff * proportion
        const newOtherSize = subSizes[i] - adjustment
        // Ensure each other subdivision maintains at least MIN_SIZE
        subSizes[i] = Math.max(MIN_SIZE, Math.min(maxAllowed, newOtherSize))
      })
    }

    subSizes[subIndex] = clampedSize

    // Normalize to ensure total is exactly 100%
    const total = subSizes.reduce((sum, s) => sum + s, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      subSizes.forEach((s, i) => {
        subSizes[i] = Math.max(MIN_SIZE, s * scale)
      })
    }

    newStructure[sectionIndex] = { ...section, subSizes }
    onLayoutChange({ structure: newStructure })
  }

  // Requirement: Swap two adjacent sections so users can reorder rows/columns.
  // Approach: Swap structure entries and build a bidirectional cell index map via _cellSwap.
  // Alternatives:
  //   - Drag-and-drop reorder: Rejected — complex for mobile, overkill for 2-4 sections.
  //   - Two sequential shifts: Rejected — overlapping ranges cause data loss.
  const swapSections = (indexA, indexB) => {
    if (indexA < 0 || indexB < 0 || indexA >= structure.length || indexB >= structure.length) return
    if (indexA === indexB) return

    // Ensure A < B for consistent mapping
    const [lo, hi] = indexA < indexB ? [indexA, indexB] : [indexB, indexA]

    const newStructure = [...structure]
    newStructure[lo] = structure[hi]
    newStructure[hi] = structure[lo]

    // Build bidirectional cell index map.
    // Compute cell start offsets for old and new structure, then map each cell
    // from its old position to where it lands after the swap.
    const cellMap = {}

    const oldStarts = []
    let idx = 0
    for (let i = 0; i < structure.length; i++) {
      oldStarts.push(idx)
      idx += structure[i].subdivisions || 1
    }
    const newStarts = []
    idx = 0
    for (let i = 0; i < newStructure.length; i++) {
      newStarts.push(idx)
      idx += newStructure[i].subdivisions || 1
    }

    // Old section s moves to destIndex in new order.
    // Middle sections (between lo and hi) stay at same index but may shift
    // if lo and hi have different subdivision counts.
    for (let s = 0; s < structure.length; s++) {
      const subs = structure[s].subdivisions || 1
      const destIndex = s === lo ? hi : s === hi ? lo : s
      const oldStart = oldStarts[s]
      const newStart = newStarts[destIndex]

      for (let sub = 0; sub < subs; sub++) {
        cellMap[oldStart + sub] = newStart + sub
      }
    }

    onLayoutChange({
      structure: newStructure,
      _cellSwap: cellMap,
    })

    // Remap selectedCell through the same cellMap used for data
    if (cellMap[selectedCell] !== undefined) {
      onSelectCell?.(cellMap[selectedCell])
    }
  }

  // Requirement: Snap cell boundary so a contained image fills the cell with no empty space.
  // Approach: Compare image aspect ratio to cell aspect ratio, then adjust the boundary
  //   (section size or subdivision size) that eliminates the empty space. Direction is automatic:
  //   - If image is wider than cell → empty top/bottom → adjust section height (rows) or sub height (columns)
  //   - If image is narrower than cell → empty left/right → adjust sub width (rows) or section width (columns)
  // Alternatives:
  //   - Manual slider adjustment: Still available — snap is a convenience shortcut.
  //   - Change fit mode to cover: Rejected — user explicitly wants contain (full image visible).
  const snapCellToImage = (cellIndex, sectionIndex, subIndex) => {
    const imageId = cellImages[cellIndex]
    if (!imageId) return

    const image = images.find(img => img.id === imageId)
    if (!image || image.fit !== 'contain') return

    // Get image dimensions — use stored values or load async as fallback
    const doSnap = (imgWidth, imgHeight) => {
      const imageAR = imgWidth / imgHeight
      const platformData = platforms.find(p => p.id === platform) || platforms[0]
      const isRows = type === 'rows'

      const section = structure[sectionIndex]
      const subs = section.subdivisions || 1
      const subSizes = section.subSizes || Array(subs).fill(100 / subs)

      // Calculate actual cell dimensions in pixels
      let cellWidth, cellHeight
      if (isRows) {
        cellWidth = platformData.width * (subSizes[subIndex] / 100)
        cellHeight = platformData.height * (section.size / 100)
      } else {
        cellWidth = platformData.width * (section.size / 100)
        cellHeight = platformData.height * (subSizes[subIndex] / 100)
      }

      const cellAR = cellWidth / cellHeight

      // Already a close fit — no adjustment needed
      if (Math.abs(imageAR - cellAR) < 0.01) return

      if (imageAR > cellAR) {
        // Image wider than cell → empty space top/bottom
        if (isRows) {
          // Rows: reduce section height
          const newHeight = cellWidth / imageAR
          const newSectionPercent = (newHeight / platformData.height) * 100
          updateSectionSize(sectionIndex, newSectionPercent)
        } else {
          // Columns: reduce sub size (cell height within section)
          const newHeight = cellWidth / imageAR
          const newSubPercent = (newHeight / platformData.height) * 100
          updateSubSize(sectionIndex, subIndex, newSubPercent)
        }
      } else {
        // Image narrower than cell → empty space left/right
        if (isRows) {
          // Rows: reduce sub size (cell width within section)
          const newWidth = cellHeight * imageAR
          const newSubPercent = (newWidth / platformData.width) * 100
          updateSubSize(sectionIndex, subIndex, newSubPercent)
        } else {
          // Columns: reduce section width
          const newWidth = cellHeight * imageAR
          const newSectionPercent = (newWidth / platformData.width) * 100
          updateSectionSize(sectionIndex, newSectionPercent)
        }
      }
    }

    if (image.naturalWidth && image.naturalHeight) {
      doSnap(image.naturalWidth, image.naturalHeight)
    } else {
      // Fallback: load image to read dimensions (for images uploaded before this feature)
      const img = new Image()
      img.onload = () => doSnap(img.naturalWidth, img.naturalHeight)
      img.onerror = () => {} // Silently ignore — corrupted src can't be snapped
      img.src = image.src
    }
  }

  // Helper: check if snap-to-fit is available for a cell
  const canSnapCell = (cellIndex) => {
    const imageId = cellImages[cellIndex]
    if (!imageId) return false
    const image = images.find(img => img.id === imageId)
    return image && image.fit === 'contain'
  }

  // Reset to default
  const handleReset = () => {
    onLayoutChange(defaultState.layout)
    onSelectCell?.(0)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ui-text">Structure</h3>

      {/* Grid Section */}
      <CollapsibleSection title="Grid" defaultExpanded={false}>
        <div className="space-y-4">
          {/* Layout Type */}
          <div>
            <label className="block text-xs font-medium text-ui-text-muted mb-2">Layout Type</label>
            <div className="flex gap-1.5">
              {layoutTypes.map((lt) => (
                <button
                  key={lt.id}
                  onClick={() => handleTypeChange(lt.id)}
                  className={`flex-1 px-3 py-2.5 text-sm rounded-lg flex flex-col items-center gap-1 font-medium ${
                    type === lt.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                  }`}
                >
                  <span className="text-base">{lt.icon}</span>
                  <span>{lt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cell Selector — same as other tabs */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-ui-text-muted text-center">
              Select Cell <span className="text-ui-text-faint font-normal">(to configure)</span>
            </label>
            <div className="flex justify-center">
              <MiniCellGrid
                layout={layout}
                selectedCell={selectedCell}
                onSelectCell={onSelectCell}
                platform={platform}
                cellImages={cellImages}
                size="large"
              />
            </div>
            {type !== 'fullbleed' && selectedSection && (
              <div className="text-sm text-center py-2 bg-ui-surface-elevated rounded-lg">
                <span className="text-primary dark:text-violet-400">
                  Cell {selectedCell + 1} in{' '}
                  <strong>{type === 'rows' ? `Row ${selectedSectionIndex + 1}` : `Column ${selectedSectionIndex + 1}`}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Row/Column editing — controls for the section containing the selected cell */}
          {type !== 'fullbleed' && selectedSection && (
            <div className="space-y-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {type === 'rows' ? `Row ${selectedSectionIndex + 1}` : `Column ${selectedSectionIndex + 1}`}
                </span>
                <span className="text-xs text-violet-400 dark:text-violet-500">
                  {structure.length} {type === 'rows' ? 'rows' : 'columns'}
                </span>
              </div>

              {/* Move section up/down (reorder) */}
              {structure.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => swapSections(selectedSectionIndex, selectedSectionIndex - 1)}
                    disabled={selectedSectionIndex === 0}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium ${
                      selectedSectionIndex === 0
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-300 dark:text-violet-600 cursor-not-allowed'
                        : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/40'
                    }`}
                  >
                    {type === 'rows' ? '↑ Move Up' : '← Move Left'}
                  </button>
                  <button
                    onClick={() => swapSections(selectedSectionIndex, selectedSectionIndex + 1)}
                    disabled={selectedSectionIndex === structure.length - 1}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium ${
                      selectedSectionIndex === structure.length - 1
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-300 dark:text-violet-600 cursor-not-allowed'
                        : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/40'
                    }`}
                  >
                    {type === 'rows' ? '↓ Move Down' : '→ Move Right'}
                  </button>
                </div>
              )}

              {structure.length > 1 && (
                <div>
                  <label className="block text-xs text-primary dark:text-violet-400 mb-2 font-medium">
                    {type === 'rows' ? 'Height' : 'Width'} <span className="font-normal text-violet-400 dark:text-primary">({MIN_SIZE}–{getMaxSize(structure.length)}%)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={MIN_SIZE}
                      max={getMaxSize(structure.length)}
                      step="5"
                      value={selectedSection.size}
                      onChange={(e) => updateSectionSize(selectedSectionIndex, Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-violet-700 dark:text-violet-300 w-12 text-right font-medium">
                      {Math.round(selectedSection.size)}%
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-primary dark:text-violet-400 mb-2 font-medium">
                  Split into {type === 'rows' ? 'columns' : 'rows'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => removeSubdivision(selectedSectionIndex)}
                    disabled={(selectedSection.subdivisions || 1) <= 1}
                    className={`w-9 h-9 text-base rounded-lg font-medium ${
                      (selectedSection.subdivisions || 1) <= 1
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-300 dark:text-primary cursor-not-allowed'
                        : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/40'
                    }`}
                  >
                    −
                  </button>
                  <span className="text-base font-semibold text-violet-700 dark:text-violet-300 w-8 text-center">
                    {selectedSection.subdivisions || 1}
                  </span>
                  <button
                    onClick={() => addSubdivision(selectedSectionIndex)}
                    disabled={(selectedSection.subdivisions || 1) >= 3}
                    className={`w-9 h-9 text-base rounded-lg font-medium ${
                      (selectedSection.subdivisions || 1) >= 3
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-300 dark:text-primary cursor-not-allowed'
                        : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/40'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {structure.length < 4 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => insertSection(selectedSectionIndex)}
                    className="flex-1 px-3 py-2 text-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/40 rounded-lg font-medium"
                  >
                    + {type === 'rows' ? 'Above' : 'Before'}
                  </button>
                  <button
                    onClick={() => insertSection(selectedSectionIndex + 1)}
                    className="flex-1 px-3 py-2 text-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/40 rounded-lg font-medium"
                  >
                    + {type === 'rows' ? 'Below' : 'After'}
                  </button>
                </div>
              )}

              {/* Snap to Fit — snap the section boundary to fit the image */}
              {!hasSubdivisions && canSnapCell(selectedCell) && (
                <button
                  onClick={() => snapCellToImage(selectedCell, selectedSectionIndex, 0)}
                  className="w-full px-3 py-2 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-lg font-medium"
                  title="Adjust this row/column size so the contained image fills the cell perfectly"
                >
                  Snap to Fit Image
                </button>
              )}

              {structure.length > 1 && (
                <button
                  onClick={() => removeSection(selectedSectionIndex)}
                  className="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium"
                >
                  Delete {type === 'rows' ? 'Row' : 'Column'}
                </button>
              )}
            </div>
          )}

          {/* Cell subdivision editing — only shown when section has subdivisions */}
          {type !== 'fullbleed' && hasSubdivisions && selectedSection && (
            <div className="space-y-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                {type === 'rows'
                  ? `Row ${selectedSectionIndex + 1}, Column ${selectedSubIndex + 1}`
                  : `Column ${selectedSectionIndex + 1}, Row ${selectedSubIndex + 1}`}
              </span>

              <div>
                <label className="block text-xs text-primary dark:text-violet-400 mb-2 font-medium">
                  {type === 'rows' ? 'Width' : 'Height'} <span className="font-normal text-violet-400 dark:text-primary">({MIN_SIZE}–{getMaxSize(selectedSection.subdivisions || 2)}%)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={MIN_SIZE}
                    max={getMaxSize(selectedSection.subdivisions || 2)}
                    step="5"
                    value={selectedSection.subSizes?.[selectedSubIndex] || 50}
                    onChange={(e) => updateSubSize(selectedSectionIndex, selectedSubIndex, Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-violet-700 dark:text-violet-300 w-12 text-right font-medium">
                    {Math.round(selectedSection.subSizes?.[selectedSubIndex] || 50)}%
                  </span>
                </div>
              </div>

              {/* Snap to Fit — adjust boundary so contained image fills this cell */}
              {canSnapCell(selectedCell) && (
                <button
                  onClick={() => snapCellToImage(selectedCell, selectedSectionIndex, selectedSubIndex)}
                  className="w-full px-3 py-2 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-lg font-medium"
                  title="Adjust this cell's boundary so the contained image fills it perfectly"
                >
                  Snap to Fit Image
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full px-3 py-2.5 text-sm bg-zinc-100 dark:bg-dark-subtle text-ui-text-muted hover:bg-zinc-200 dark:hover:bg-dark-elevated rounded-lg font-medium"
          >
            Reset to Default
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
})
