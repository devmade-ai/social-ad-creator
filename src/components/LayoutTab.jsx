// Requirement: Interactive grid structure editor with per-row/column and per-cell controls.
// Approach: Uses the same global selectedCell as all other tabs. Section context
//   (which row/column the cell belongs to) is derived, not stored separately.
//   Size constraints (MIN_SIZE=10, MAX_SIZE=90) prevent cells from becoming unusably small.
//   UI is split into two clear control groups: section (row/column) and cell controls.
// Alternatives:
//   - Separate structureSelection state: Rejected — caused sync bugs between internal
//     and global selection, required complex bidirectional sync logic.
//   - Drag-to-resize on canvas: Rejected - complex to implement and hard to be precise on mobile.
//   - Numeric input only: Rejected - sliders give visual feedback for proportional sizing.
import { useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import ConfirmButton from './ConfirmButton'
import MiniCellGrid from './MiniCellGrid'
import PageDots from './PageDots'
import { platforms } from '../config/platforms'
import { defaultState } from '../hooks/useAdState'
import { MIN_SIZE, MAX_SIZE, getMaxSize, cellToSection, getFirstCellOfSection } from '../utils/layoutHelpers'

const layoutTypes = [
  { id: 'fullbleed', name: 'Full', icon: '□' },
  { id: 'rows', name: 'Rows', icon: '☰' },
  { id: 'columns', name: 'Cols', icon: '|||' },
]

// Shared button style constants — DaisyUI btn-ghost with colored text for semantics
const btnAction = 'btn btn-ghost btn-sm text-primary'
const btnSecondary = 'btn btn-ghost btn-sm text-secondary'
const btnDisabled = 'btn btn-ghost btn-sm btn-disabled text-base-content/30'
const btnSecondaryDisabled = 'btn btn-ghost btn-sm btn-disabled text-base-content/30'
const btnDelete = 'btn btn-ghost btn-sm text-error'
const btnSnap = 'btn btn-ghost btn-sm text-success'

export default memo(function LayoutTab({
  layout,
  onLayoutChange,
  platform,
  selectedCell = 0,
  onSelectCell,
  cellImages = {},
  images = [],
  onUpdateImage,
  // Page management — moved here from ContextBar for logical grouping with structure controls
  pages = [null],
  activePage = 0,
  onSetActivePage,
  onAddPage,
  onDuplicatePage,
  onRemovePage,
  onMovePage,
  getPageState,
}) {
  const { type = 'fullbleed', structure = [] } = layout

  // Derive section context from the globally selected cell
  const { sectionIndex: selectedSectionIndex, subIndex: selectedSubIndex } = useMemo(
    () => cellToSection(structure, type, selectedCell),
    [structure, type, selectedCell]
  )
  const selectedSection = type !== 'fullbleed' && structure.length > 0 ? structure[selectedSectionIndex] : null
  const hasSubdivisions = (selectedSection?.subdivisions || 1) > 1

  // Layout-aware labels for rows vs columns
  const isRows = type === 'rows'
  const sectionLabel = isRows ? 'Row' : 'Column'

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
    const newCellCount = newType === 'fullbleed' ? 1 : 2
    if (selectedCell >= newCellCount) {
      onSelectCell?.(0)
    }
  }

  // --- Section (Row/Column) Operations ---

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
    let firstCellAtPosition = 0
    for (let i = 0; i < position; i++) {
      firstCellAtPosition += structure[i].subdivisions || 1
    }
    onLayoutChange({
      structure: newStructure,
      _cellShift: { fromIndex: firstCellAtPosition, shiftBy: 1 },
    })
    if (selectedCell >= firstCellAtPosition) {
      onSelectCell?.(selectedCell + 1)
    }
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
    let firstCellOfRemoved = getFirstCellOfSection(structure, index)
    onLayoutChange({
      structure: newStructure,
      _cellShift: { fromIndex: firstCellOfRemoved + removedSubs, shiftBy: -removedSubs },
    })
    const newCellCount = newStructure.reduce((total, s) => total + (s.subdivisions || 1), 0)
    if (selectedCell >= firstCellOfRemoved && selectedCell < firstCellOfRemoved + removedSubs) {
      onSelectCell?.(Math.min(firstCellOfRemoved, newCellCount - 1))
    } else if (selectedCell >= firstCellOfRemoved + removedSubs) {
      onSelectCell?.(selectedCell - removedSubs)
    }
  }

  // Update section size with dynamic constraints
  const updateSectionSize = (index, newSize) => {
    const numSections = structure.length
    const maxAllowed = getMaxSize(numSections)
    const clampedSize = Math.max(MIN_SIZE, Math.min(maxAllowed, newSize))
    const newStructure = [...structure]
    const oldSize = newStructure[index].size
    const sizeDiff = clampedSize - oldSize
    const otherIndices = structure.map((_, i) => i).filter((i) => i !== index)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + structure[i].size, 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      otherIndices.forEach((i) => {
        const proportion = structure[i].size / otherTotalSize
        const adjustment = sizeDiff * proportion
        const newOtherSize = structure[i].size - adjustment
        newStructure[i] = { ...newStructure[i], size: Math.max(MIN_SIZE, Math.min(maxAllowed, newOtherSize)) }
      })
    }

    newStructure[index] = { ...newStructure[index], size: clampedSize }

    const total = newStructure.reduce((sum, s) => sum + s.size, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      newStructure.forEach((s, i) => {
        newStructure[i] = { ...s, size: Math.max(MIN_SIZE, s.size * scale) }
      })
    }

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
    const [lo, hi] = indexA < indexB ? [indexA, indexB] : [indexB, indexA]
    const newStructure = [...structure]
    newStructure[lo] = structure[hi]
    newStructure[hi] = structure[lo]

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
    for (let s = 0; s < structure.length; s++) {
      const subs = structure[s].subdivisions || 1
      const destIndex = s === lo ? hi : s === hi ? lo : s
      const oldStart = oldStarts[s]
      const newStart = newStarts[destIndex]
      for (let sub = 0; sub < subs; sub++) {
        cellMap[oldStart + sub] = newStart + sub
      }
    }

    onLayoutChange({ structure: newStructure, _cellSwap: cellMap })
    if (cellMap[selectedCell] !== undefined) {
      onSelectCell?.(cellMap[selectedCell])
    }
  }

  // --- Cell (Subdivision) Operations ---

  // Requirement: Insert a cell at a specific position within a section.
  // Approach: Splice into subSizes at position, redistribute sizes evenly, shift cell indices.
  // Alternatives:
  //   - Only append at end: Rejected — user can't add cell before the selected one.
  //   - No index shift: Rejected — content in later cells moves to wrong visual position.
  const insertCell = (sectionIndex, subPosition) => {
    const section = structure[sectionIndex]
    const currentSubs = section.subdivisions || 1
    if (currentSubs >= 3) return

    const newSubs = currentSubs + 1
    const evenSize = 100 / newSubs

    const newStructure = [...structure]
    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: Array(newSubs).fill(evenSize) }

    // The inserted cell shifts everything at and after its absolute index
    const firstCellOfSection = getFirstCellOfSection(structure, sectionIndex)
    const insertedCellIndex = firstCellOfSection + subPosition
    onLayoutChange({
      structure: newStructure,
      _cellShift: { fromIndex: insertedCellIndex, shiftBy: 1 },
    })
    if (selectedCell >= insertedCellIndex) {
      onSelectCell?.(selectedCell + 1)
    }
  }

  // Requirement: Remove a specific cell (subdivision) from a section.
  // Approach: Remove from subSizes at position, redistribute evenly, shift cell indices.
  // Alternatives:
  //   - Only remove last: Rejected — user can't remove a specific cell in the middle.
  //   - No index shift: Rejected — content in later cells moves to wrong visual position.
  const removeCell = (sectionIndex, subIndex) => {
    const section = structure[sectionIndex]
    const currentSubs = section.subdivisions || 1
    if (currentSubs <= 1) return

    const newSubs = currentSubs - 1
    const evenSize = 100 / newSubs
    const redistributed = Array(newSubs).fill(evenSize)

    const newStructure = [...structure]
    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: redistributed }

    const firstCellOfSection = getFirstCellOfSection(structure, sectionIndex)
    const removedCellIndex = firstCellOfSection + subIndex
    // Cells after the removed one shift down by 1
    onLayoutChange({
      structure: newStructure,
      _cellShift: { fromIndex: removedCellIndex + 1, shiftBy: -1 },
    })
    // Update selectedCell: stay in same section if possible, shift if after removed cell
    const newCellCount = newStructure.reduce((total, s) => total + (s.subdivisions || 1), 0)
    if (selectedCell === removedCellIndex) {
      // If deleted cell wasn't the last in its section, select the next cell (now at same index).
      // If it was the last in the section, select the previous cell (stays in same section).
      if (subIndex < newSubs) {
        onSelectCell?.(Math.min(removedCellIndex, newCellCount - 1))
      } else {
        onSelectCell?.(Math.max(0, removedCellIndex - 1))
      }
    } else if (selectedCell > removedCellIndex) {
      onSelectCell?.(selectedCell - 1)
    }
  }

  // Requirement: Swap two adjacent cells (subdivisions) within a section.
  // Approach: Swap subSizes entries and build a bidirectional cell map via _cellSwap.
  // Alternatives:
  //   - Drag-to-reorder: Rejected — complex for mobile.
  //   - Two sequential shifts: Rejected — overlapping ranges cause data loss.
  const swapCells = (sectionIndex, subIndexA, subIndexB) => {
    const section = structure[sectionIndex]
    const currentSubs = section.subdivisions || 1
    if (subIndexA < 0 || subIndexB < 0 || subIndexA >= currentSubs || subIndexB >= currentSubs) return
    if (subIndexA === subIndexB) return

    const newSubSizes = [...(section.subSizes || Array(currentSubs).fill(100 / currentSubs))]
    const temp = newSubSizes[subIndexA]
    newSubSizes[subIndexA] = newSubSizes[subIndexB]
    newSubSizes[subIndexB] = temp

    const newStructure = [...structure]
    newStructure[sectionIndex] = { ...section, subSizes: newSubSizes }

    const firstCellOfSection = getFirstCellOfSection(structure, sectionIndex)
    const cellIndexA = firstCellOfSection + subIndexA
    const cellIndexB = firstCellOfSection + subIndexB
    const cellMap = { [cellIndexA]: cellIndexB, [cellIndexB]: cellIndexA }

    onLayoutChange({ structure: newStructure, _cellSwap: cellMap })
    if (cellMap[selectedCell] !== undefined) {
      onSelectCell?.(cellMap[selectedCell])
    }
  }

  // Requirement: Move a cell from one section to an adjacent section, automatically creating
  //   a new section if none exists in that direction, or deleting the source section if it
  //   would be left empty (source had only 1 cell).
  // Approach: Three cases handled atomically via _cellSwap:
  //   Case 1 (normal): source has 2+ cells, target exists → move cell, source shrinks
  //   Case 2 (delete source): source has 1 cell, target exists → move cell, delete source section
  //   Case 3 (create target): target doesn't exist, source has 2+ cells → create new section, move cell
  // Alternatives:
  //   - Two separate operations (remove + insert): Rejected — intermediate state loses data.
  //   - Drag-and-drop across sections: Rejected — complex for mobile.
  const moveCellToSection = (sourceSectionIndex, sourceSubIndex, targetSectionIndex) => {
    const sourceSection = structure[sourceSectionIndex]
    const sourceSubs = sourceSection.subdivisions || 1
    const targetExists = targetSectionIndex >= 0 && targetSectionIndex < structure.length
    const deleteSource = sourceSubs === 1
    const needsNewSection = !targetExists

    // Can't move lone cell to non-existent section (would create+delete = no-op)
    if (needsNewSection && deleteSource) return
    // Can't create section beyond max (4 sections)
    if (needsNewSection && structure.length >= 4) return
    // Can't move to full target section (3 cells max)
    if (targetExists && (structure[targetSectionIndex].subdivisions || 1) >= 3) return
    if (sourceSectionIndex === targetSectionIndex) return

    // Compute old cell start indices
    const oldStarts = []
    let idx = 0
    for (let s = 0; s < structure.length; s++) {
      oldStarts.push(idx)
      idx += structure[s].subdivisions || 1
    }

    let newStructure
    let cellMap = {}

    if (needsNewSection) {
      // Case 3: Create new section at edge, move cell into it
      const insertPos = targetSectionIndex < 0 ? 0 : structure.length
      const newSize = 100 / (structure.length + 1)
      newStructure = structure.map(s => ({ ...s, size: newSize }))
      newStructure.splice(insertPos, 0, { size: newSize, subdivisions: 1, subSizes: [100] })

      // Source section index shifts if new section was inserted before it
      const adjSourceIdx = insertPos <= sourceSectionIndex ? sourceSectionIndex + 1 : sourceSectionIndex
      newStructure[adjSourceIdx] = {
        ...newStructure[adjSourceIdx],
        subdivisions: sourceSubs - 1,
        subSizes: Array(sourceSubs - 1).fill(100 / (sourceSubs - 1)),
      }

      // Compute new starts
      const newStarts = []
      idx = 0
      for (let s = 0; s < newStructure.length; s++) {
        newStarts.push(idx)
        idx += newStructure[s].subdivisions || 1
      }

      // Build cell map: old sections map to shifted positions
      for (let s = 0; s < structure.length; s++) {
        const oldSubs = structure[s].subdivisions || 1
        const newSIdx = insertPos <= s ? s + 1 : s

        if (s === sourceSectionIndex) {
          let newSubIdx = 0
          for (let sub = 0; sub < oldSubs; sub++) {
            if (sub === sourceSubIndex) {
              cellMap[oldStarts[s] + sub] = newStarts[insertPos]
            } else {
              cellMap[oldStarts[s] + sub] = newStarts[newSIdx] + newSubIdx
              newSubIdx++
            }
          }
        } else {
          for (let sub = 0; sub < oldSubs; sub++) {
            cellMap[oldStarts[s] + sub] = newStarts[newSIdx] + sub
          }
        }
      }
    } else if (deleteSource) {
      // Case 2: Move lone cell to target, delete empty source section
      const targetSubs = structure[targetSectionIndex].subdivisions || 1
      const newTargetSubs = targetSubs + 1

      const newSize = 100 / (structure.length - 1)
      newStructure = structure
        .filter((_, i) => i !== sourceSectionIndex)
        .map(s => ({ ...s, size: newSize }))

      // Target index shifts down if source was before it
      const adjTargetIdx = targetSectionIndex > sourceSectionIndex
        ? targetSectionIndex - 1
        : targetSectionIndex
      newStructure[adjTargetIdx] = {
        ...newStructure[adjTargetIdx],
        subdivisions: newTargetSubs,
        subSizes: Array(newTargetSubs).fill(100 / newTargetSubs),
      }

      // Compute new starts
      const newStarts = []
      idx = 0
      for (let s = 0; s < newStructure.length; s++) {
        newStarts.push(idx)
        idx += newStructure[s].subdivisions || 1
      }

      // Build cell map: source's lone cell goes to end of target, others shift
      for (let s = 0; s < structure.length; s++) {
        const oldSubs = structure[s].subdivisions || 1

        if (s === sourceSectionIndex) {
          cellMap[oldStarts[s] + sourceSubIndex] = newStarts[adjTargetIdx] + newTargetSubs - 1
        } else {
          const newSIdx = s > sourceSectionIndex ? s - 1 : s
          for (let sub = 0; sub < oldSubs; sub++) {
            cellMap[oldStarts[s] + sub] = newStarts[newSIdx] + sub
          }
        }
      }
    } else {
      // Case 1: Normal move (source has 2+ cells, target exists)
      const targetSection = structure[targetSectionIndex]
      const targetSubs = targetSection.subdivisions || 1
      const newSourceSubs = sourceSubs - 1
      const newTargetSubs = targetSubs + 1

      newStructure = [...structure]
      newStructure[sourceSectionIndex] = {
        ...sourceSection,
        subdivisions: newSourceSubs,
        subSizes: Array(newSourceSubs).fill(100 / newSourceSubs),
      }
      newStructure[targetSectionIndex] = {
        ...targetSection,
        subdivisions: newTargetSubs,
        subSizes: Array(newTargetSubs).fill(100 / newTargetSubs),
      }

      const newStarts = []
      idx = 0
      for (let s = 0; s < newStructure.length; s++) {
        newStarts.push(idx)
        idx += newStructure[s].subdivisions || 1
      }

      for (let s = 0; s < structure.length; s++) {
        const oldSubs = structure[s].subdivisions || 1
        if (s === sourceSectionIndex) {
          let newSubIdx = 0
          for (let sub = 0; sub < oldSubs; sub++) {
            if (sub === sourceSubIndex) {
              cellMap[oldStarts[s] + sub] = newStarts[targetSectionIndex] + newTargetSubs - 1
            } else {
              cellMap[oldStarts[s] + sub] = newStarts[s] + newSubIdx
              newSubIdx++
            }
          }
        } else {
          for (let sub = 0; sub < oldSubs; sub++) {
            cellMap[oldStarts[s] + sub] = newStarts[s] + sub
          }
        }
      }
    }

    onLayoutChange({ structure: newStructure, _cellSwap: cellMap })
    if (cellMap[selectedCell] !== undefined) {
      onSelectCell?.(cellMap[selectedCell])
    }
  }

  // Check if a cell can be moved to an adjacent section in the given direction
  const canMoveCellToSection = (direction) => {
    if (type === 'fullbleed' || !selectedSection) return false
    const targetIdx = selectedSectionIndex + direction
    const targetExists = targetIdx >= 0 && targetIdx < structure.length
    const sourceSubs = selectedSection.subdivisions || 1
    const deleteSource = sourceSubs === 1
    const needsNewSection = !targetExists

    if (needsNewSection && deleteSource) return false
    if (needsNewSection && structure.length >= 4) return false
    if (targetExists && (structure[targetIdx].subdivisions || 1) >= 3) return false
    return true
  }

  // Get label for move-to-section button
  const getMoveSectionLabel = (direction) => {
    const targetIdx = selectedSectionIndex + direction
    const targetExists = targetIdx >= 0 && targetIdx < structure.length
    if (!targetExists) {
      return isRows ? 'To New Row' : 'To New Col'
    }
    return isRows ? `To Row ${targetIdx + 1}` : `To Col ${targetIdx + 1}`
  }

  // Update subdivision sizes with dynamic constraints
  const updateSubSize = (sectionIndex, subIndex, newSize) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const subSizes = [...(section.subSizes || [])]
    const numSubs = subSizes.length
    const maxAllowed = getMaxSize(numSubs)
    const clampedSize = Math.max(MIN_SIZE, Math.min(maxAllowed, newSize))
    const oldSize = subSizes[subIndex]
    const sizeDiff = clampedSize - oldSize
    const otherIndices = subSizes.map((_, i) => i).filter((i) => i !== subIndex)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + subSizes[i], 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      otherIndices.forEach((i) => {
        const proportion = subSizes[i] / otherTotalSize
        const adjustment = sizeDiff * proportion
        const newOtherSize = subSizes[i] - adjustment
        subSizes[i] = Math.max(MIN_SIZE, Math.min(maxAllowed, newOtherSize))
      })
    }

    subSizes[subIndex] = clampedSize
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

  // --- Snap to Fit ---

  // Requirement: Snap cell boundary so image fills cell with no empty space, setting fit to contain.
  // Approach: Set image fit to 'contain' first (so the full image is visible), then adjust the
  //   cell boundary (section size or subdivision size) to eliminate empty space around it.
  // Alternatives:
  //   - Require user to set contain first: Rejected — extra step, snap button should just work.
  //   - Manual slider adjustment: Still available — snap is a convenience shortcut.
  const snapCellToImage = (cellIndex, sectionIndex, subIndex) => {
    const imageId = cellImages[cellIndex]
    if (!imageId) return

    const image = images.find(img => img.id === imageId)
    if (!image) return

    // Set fit to contain so the full image is visible before snapping the boundary
    if (image.fit !== 'contain') {
      onUpdateImage?.(imageId, { fit: 'contain' })
    }

    const doSnap = (imgWidth, imgHeight) => {
      const imageAR = imgWidth / imgHeight
      const platformData = platforms.find(p => p.id === platform) || platforms[0]

      const section = structure[sectionIndex]
      const subs = section.subdivisions || 1
      const subSizes = section.subSizes || Array(subs).fill(100 / subs)

      let cellWidth, cellHeight
      if (isRows) {
        cellWidth = platformData.width * (subSizes[subIndex] / 100)
        cellHeight = platformData.height * (section.size / 100)
      } else {
        cellWidth = platformData.width * (section.size / 100)
        cellHeight = platformData.height * (subSizes[subIndex] / 100)
      }

      const cellAR = cellWidth / cellHeight
      if (Math.abs(imageAR - cellAR) < 0.01) return

      if (imageAR > cellAR) {
        if (isRows) {
          const newHeight = cellWidth / imageAR
          updateSectionSize(sectionIndex, (newHeight / platformData.height) * 100)
        } else {
          const newHeight = cellWidth / imageAR
          updateSubSize(sectionIndex, subIndex, (newHeight / platformData.height) * 100)
        }
      } else {
        if (isRows) {
          const newWidth = cellHeight * imageAR
          updateSubSize(sectionIndex, subIndex, (newWidth / platformData.width) * 100)
        } else {
          const newWidth = cellHeight * imageAR
          updateSectionSize(sectionIndex, (newWidth / platformData.width) * 100)
        }
      }
    }

    if (image.naturalWidth && image.naturalHeight) {
      doSnap(image.naturalWidth, image.naturalHeight)
    } else {
      const img = new Image()
      img.onload = () => doSnap(img.naturalWidth, img.naturalHeight)
      img.onerror = () => {}
      img.src = image.src
    }
  }

  // Show snap button for any cell with an image (snap sets fit to contain automatically)
  const canSnapCell = (cellIndex) => {
    return !!cellImages[cellIndex]
  }

  const handleReset = () => {
    onLayoutChange(defaultState.layout)
    onSelectCell?.(0)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-base-content">Structure</h3>

      {/* Pages Section — add, duplicate, reorder, delete pages */}
      <CollapsibleSection title="Pages" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Page thumbnails — reuses shared PageDots component (validated colors, ARIA, 44px touch targets) */}
          {pages.length > 1 && (
            <div className="overflow-x-auto scrollbar-thin pb-1">
              <PageDots
                pages={pages}
                activePage={activePage}
                getPageState={getPageState}
                onSetActivePage={onSetActivePage}
              />
            </div>
          )}

          {/* Page actions */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={onAddPage}
              className={`flex-1 ${btnAction}`}
            >
              + Add Page
            </button>
            {pages.length > 1 && (
              <button
                onClick={onDuplicatePage}
                className="flex-1 px-3 py-2 text-sm rounded-lg font-medium bg-base-200 text-base-content/70 hover:bg-base-300"
              >
                Duplicate
              </button>
            )}
          </div>

          {/* Move & delete — only when multiple pages */}
          {pages.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onMovePage(activePage, activePage - 1)}
                disabled={activePage === 0}
                className={`flex-1 ${activePage === 0 ? btnDisabled : btnAction}`}
              >
                ← Move Left
              </button>
              <button
                onClick={() => onMovePage(activePage, activePage + 1)}
                disabled={activePage === pages.length - 1}
                className={`flex-1 ${activePage === pages.length - 1 ? btnDisabled : btnAction}`}
              >
                Move Right →
              </button>
            </div>
          )}

          {pages.length > 1 && (
            <ConfirmButton
              onConfirm={() => onRemovePage(activePage)}
              confirmLabel={`Delete page ${activePage + 1}?`}
              className={`w-full ${btnDelete}`}
            >
              Delete Page {activePage + 1}
            </ConfirmButton>
          )}

          {pages.length <= 1 && (
            <p className="text-xs text-base-content/50 text-center">
              Add pages to create multi-page documents, books, or presentations.
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Grid Section */}
      <CollapsibleSection title="Grid" defaultExpanded={true}>
        <div className="space-y-4">
          {/* Layout Type */}
          <div>
            <label className="block text-xs font-medium text-base-content/70 mb-2">Layout Type</label>
            <div className="flex gap-1.5">
              {layoutTypes.map((lt) => (
                <button
                  key={lt.id}
                  onClick={() => handleTypeChange(lt.id)}
                  className={`flex-1 px-3 py-2.5 text-sm rounded-lg flex flex-col items-center gap-1 font-medium ${
                    type === lt.id
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                  }`}
                >
                  <span className="text-base">{lt.icon}</span>
                  <span>{lt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cell Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-base-content/70 text-center">
              Select Cell <span className="text-base-content/50 font-normal">(to configure)</span>
            </label>
            <div className="flex justify-center">
              <MiniCellGrid
                layout={layout}
                selectedCell={selectedCell}
                onSelectCell={onSelectCell}
                platform={platform}
                cellImages={cellImages}
                size="medium"
              />
            </div>
            {type !== 'fullbleed' && selectedSection && (
              <div className="text-sm text-center py-2 bg-base-200 rounded-lg">
                <span className="text-primary">
                  {hasSubdivisions
                    ? `${isRows ? 'Column' : 'Row'} ${selectedSubIndex + 1} in ${sectionLabel} ${selectedSectionIndex + 1}`
                    : `${sectionLabel} ${selectedSectionIndex + 1}`}
                </span>
              </div>
            )}
          </div>

          {/* Cell Controls (subdivision within a section) — shown first for direct manipulation */}
          {type !== 'fullbleed' && selectedSection && (
            <div className="space-y-4 p-4 bg-base-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary">
                  {hasSubdivisions
                    ? `${isRows ? 'Column' : 'Row'} ${selectedSubIndex + 1}`
                    : 'Cell'}
                </span>
                <span className="text-xs text-base-content/70">
                  {selectedSection.subdivisions || 1} {selectedSection.subdivisions > 1 ? (isRows ? 'columns' : 'rows') : 'cell'} in {sectionLabel.toLowerCase()} {selectedSectionIndex + 1}
                </span>
              </div>

              {/* Add cell before/after */}
              {(selectedSection.subdivisions || 1) < 3 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => insertCell(selectedSectionIndex, selectedSubIndex)}
                    className={`flex-1 ${btnSecondary}`}
                  >
                    + {isRows ? 'Cell Left' : 'Cell Above'}
                  </button>
                  <button
                    onClick={() => insertCell(selectedSectionIndex, selectedSubIndex + 1)}
                    className={`flex-1 ${btnSecondary}`}
                  >
                    + {isRows ? 'Cell Right' : 'Cell Below'}
                  </button>
                </div>
              )}

              {/* Move cell left/right or up/down */}
              {hasSubdivisions && (
                <div className="flex gap-2">
                  <button
                    onClick={() => swapCells(selectedSectionIndex, selectedSubIndex, selectedSubIndex - 1)}
                    disabled={selectedSubIndex === 0}
                    className={`flex-1 ${
                      selectedSubIndex === 0
                        ? btnSecondaryDisabled
                        : btnSecondary
                    }`}
                  >
                    {isRows ? 'Move Left' : 'Move Up'}
                  </button>
                  <button
                    onClick={() => swapCells(selectedSectionIndex, selectedSubIndex, selectedSubIndex + 1)}
                    disabled={selectedSubIndex === (selectedSection.subdivisions || 1) - 1}
                    className={`flex-1 ${
                      selectedSubIndex === (selectedSection.subdivisions || 1) - 1
                        ? btnSecondaryDisabled
                        : btnSecondary
                    }`}
                  >
                    {isRows ? 'Move Right' : 'Move Down'}
                  </button>
                </div>
              )}

              {/* Move cell to adjacent section — auto-creates/deletes sections as needed */}
              {(canMoveCellToSection(-1) || canMoveCellToSection(1)) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => moveCellToSection(selectedSectionIndex, selectedSubIndex, selectedSectionIndex - 1)}
                    disabled={!canMoveCellToSection(-1)}
                    className={`flex-1 ${
                      !canMoveCellToSection(-1)
                        ? btnSecondaryDisabled
                        : btnSecondary
                    }`}
                  >
                    {getMoveSectionLabel(-1)}
                  </button>
                  <button
                    onClick={() => moveCellToSection(selectedSectionIndex, selectedSubIndex, selectedSectionIndex + 1)}
                    disabled={!canMoveCellToSection(1)}
                    className={`flex-1 ${
                      !canMoveCellToSection(1)
                        ? btnSecondaryDisabled
                        : btnSecondary
                    }`}
                  >
                    {getMoveSectionLabel(1)}
                  </button>
                </div>
              )}

              {/* Cell size slider (width for rows, height for columns) */}
              {hasSubdivisions && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-secondary font-medium">
                      {isRows ? 'Cell Width' : 'Cell Height'}
                    </label>
                    <span className="text-xs text-secondary font-medium">
                      {Math.round(selectedSection.subSizes?.[selectedSubIndex] || 50)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-base-content/50 w-7">Small</span>
                    <input
                      type="range"
                      min={MIN_SIZE}
                      max={getMaxSize(selectedSection.subdivisions || 2)}
                      step="5"
                      value={selectedSection.subSizes?.[selectedSubIndex] || 50}
                      onChange={(e) => updateSubSize(selectedSectionIndex, selectedSubIndex, Number(e.target.value))}
                      className="range range-primary range-sm flex-1"
                    />
                    <span className="text-[10px] text-base-content/50 w-7 text-right">Large</span>
                  </div>
                </div>
              )}

              {/* Snap to Fit — for cells in subdivided sections */}
              {hasSubdivisions && canSnapCell(selectedCell) && (
                <button
                  onClick={() => snapCellToImage(selectedCell, selectedSectionIndex, selectedSubIndex)}
                  className={`w-full ${btnSnap}`}
                  title="Adjust this cell's boundary so the contained image fills it perfectly"
                >
                  Snap to Fit Image
                </button>
              )}

              {/* Delete cell */}
              {hasSubdivisions && (
                <button
                  onClick={() => removeCell(selectedSectionIndex, selectedSubIndex)}
                  className={`w-full ${btnDelete}`}
                >
                  Delete {isRows ? 'Cell' : 'Cell'}
                </button>
              )}
            </div>
          )}

          {/* Section Controls (Row or Column) */}
          {type !== 'fullbleed' && selectedSection && (
            <div className="space-y-4 p-4 bg-base-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  {sectionLabel} {selectedSectionIndex + 1}
                </span>
                <span className="text-xs text-base-content/70">
                  {structure.length} {isRows ? 'rows' : 'columns'}
                </span>
              </div>

              {/* Add section above/below (or before/after for columns) */}
              {structure.length < 4 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => insertSection(selectedSectionIndex)}
                    className={`flex-1 ${btnAction}`}
                  >
                    + {isRows ? 'Row Above' : 'Col Left'}
                  </button>
                  <button
                    onClick={() => insertSection(selectedSectionIndex + 1)}
                    className={`flex-1 ${btnAction}`}
                  >
                    + {isRows ? 'Row Below' : 'Col Right'}
                  </button>
                </div>
              )}

              {/* Move section up/down or left/right */}
              {structure.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => swapSections(selectedSectionIndex, selectedSectionIndex - 1)}
                    disabled={selectedSectionIndex === 0}
                    className={`flex-1 ${selectedSectionIndex === 0 ? btnDisabled : btnAction}`}
                  >
                    {isRows ? 'Move Up' : 'Move Left'}
                  </button>
                  <button
                    onClick={() => swapSections(selectedSectionIndex, selectedSectionIndex + 1)}
                    disabled={selectedSectionIndex === structure.length - 1}
                    className={`flex-1 ${selectedSectionIndex === structure.length - 1 ? btnDisabled : btnAction}`}
                  >
                    {isRows ? 'Move Down' : 'Move Right'}
                  </button>
                </div>
              )}

              {/* Section size slider (height for rows, width for columns) */}
              {structure.length > 1 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-primary font-medium">
                      {isRows ? 'Row Height' : 'Col Width'}
                    </label>
                    <span className="text-xs text-primary font-medium">
                      {Math.round(selectedSection.size)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-base-content/50 w-7">Small</span>
                    <input
                      type="range"
                      min={MIN_SIZE}
                      max={getMaxSize(structure.length)}
                      step="5"
                      value={selectedSection.size}
                      onChange={(e) => updateSectionSize(selectedSectionIndex, Number(e.target.value))}
                      className="range range-primary range-sm flex-1"
                    />
                    <span className="text-[10px] text-base-content/50 w-7 text-right">Large</span>
                  </div>
                </div>
              )}

              {/* Snap to Fit — only for single-cell sections */}
              {!hasSubdivisions && canSnapCell(selectedCell) && (
                <button
                  onClick={() => snapCellToImage(selectedCell, selectedSectionIndex, 0)}
                  className={`w-full ${btnSnap}`}
                  title={`Adjust this ${sectionLabel.toLowerCase()} size so the contained image fills the cell perfectly`}
                >
                  Snap to Fit Image
                </button>
              )}

              {/* Delete section */}
              {structure.length > 1 && (
                <button
                  onClick={() => removeSection(selectedSectionIndex)}
                  className={`w-full ${btnDelete}`}
                >
                  Delete {sectionLabel}
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full px-3 py-2.5 text-sm bg-base-200 text-base-content/70 hover:bg-base-300 rounded-lg font-medium"
          >
            Reset to Default
          </button>
        </div>
      </CollapsibleSection>

    </div>
  )
})
