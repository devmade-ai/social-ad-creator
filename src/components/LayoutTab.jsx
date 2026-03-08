// Requirement: Interactive grid structure editor with per-cell alignment controls.
// Approach: Two collapsible sections — Structure (layout type, section/subdivision sizing)
//   and Text Alignment (context-aware: global, section, or cell depending on selection).
//   Size constraints (MIN_SIZE=10, MAX_SIZE=90) prevent cells from becoming unusably small.
// Alternatives:
//   - Drag-to-resize on canvas: Rejected - complex to implement and hard to be precise on mobile.
//   - Numeric input only: Rejected - sliders give visual feedback for proportional sizing.
import { useState, useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { countCells } from '../utils/cellUtils'
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

// Unified grid component for cell selection
function CellGrid({
  layout,
  imageCells = [],  // Array of image cell indices
  selectedCell = null,
  globalSelectedCell = null, // Global cell from ContextBar (shown as indicator in structure mode)
  mode = 'cell', // 'cell' | 'image' | 'structure'
  onSelectCell,
  onSelectSection,
  structureSelection,
  aspectRatio = 1,
  size = 'normal',
}) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure =
    isFullbleed || !structure || structure.length === 0
      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
      : structure
  const showSectionLabels = mode === 'structure' && !isFullbleed && normalizedStructure.length > 1

  const sizeConfig = {
    small: { maxWidth: 100, minHeight: 50 },
    normal: { maxWidth: 180, minHeight: 100 },
    large: { maxWidth: 280, minHeight: 160 },
  }
  const config = sizeConfig[size] || sizeConfig.normal

  const containerStyle = {
    aspectRatio: aspectRatio,
    maxWidth: `${config.maxWidth}px`,
    minHeight: `${config.minHeight}px`,
    width: '100%',
    flexShrink: 0,
  }

  // Requirement: Show which cell is globally selected (from ContextBar) in the Structure grid
  // Approach: Inset ring indicator, separate from structure editing selection colors
  // Alternatives:
  //   - Auto-sync global→structure selection: Rejected — splitting rows hides split controls
  //   - Colored background: Rejected — conflicts with section/cell selection highlighting
  const getCellContent = (cellIndex, isImage, isSelected, isSectionSelected, subdivisions, subSize) => {
    let bgClass, textClass, content
    const isGlobalSelected = mode === 'structure' && globalSelectedCell === cellIndex

    if (mode === 'image') {
      bgClass = isImage ? 'bg-primary hover:bg-primary-hover' : 'bg-ui-surface-inset hover:bg-ui-surface-hover'
      textClass = isImage ? 'text-white' : 'text-ui-text-subtle'
      content = isImage ? '📷' : cellIndex + 1
    } else if (mode === 'structure') {
      if (isSelected) {
        // Darker shade for selected image cells so they're distinguishable from unselected ones
        bgClass = isImage ? 'bg-violet-800 hover:bg-violet-900 dark:bg-violet-700 dark:hover:bg-violet-600' : 'bg-primary hover:bg-primary-hover'
        textClass = 'text-white'
      } else if (isSectionSelected) {
        bgClass = 'bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/40'
        textClass = 'text-violet-700 dark:text-violet-300'
      } else if (isImage) {
        bgClass = 'bg-primary hover:bg-primary-hover'
        textClass = 'text-white'
      } else {
        bgClass = 'bg-ui-surface-inset hover:bg-ui-surface-hover'
        textClass = 'text-ui-text-subtle'
      }
      // Show global selection ring unless this cell is already the structure selection
      if (isGlobalSelected && !isSelected) {
        bgClass += ' ring-2 ring-inset ring-violet-400 dark:ring-violet-500'
      }
      // Show checkmark on selected image cells so selection is visible
      content = isImage ? (isSelected ? '📷 ✓' : '📷') : subdivisions > 1 ? `${Math.round(subSize)}%` : ''
    } else {
      if (isSelected) {
        bgClass = 'bg-primary hover:bg-primary-hover'
        textClass = 'text-white'
        content = '✓'
      } else if (isImage) {
        bgClass = 'bg-primary hover:bg-primary-hover'
        textClass = 'text-white'
        content = '📷'
      } else {
        bgClass = 'bg-ui-surface-inset hover:bg-ui-surface-hover'
        textClass = 'text-ui-text-subtle'
        content = cellIndex + 1
      }
    }

    return { bgClass, textClass, content }
  }

  // Requirement: Pre-compute cell mapping to avoid mutable cellIndex during render.
  // Approach: useMemo builds a Map like MiniCellGrid does.
  // Alternatives:
  //   - Mutable let cellIndex = 0 in render: Rejected — side effect during render,
  //     breaks under React strict mode or concurrent features.
  const sectionCellMap = useMemo(() => {
    const grouped = new Map()
    let idx = 0
    const src = isFullbleed || !structure || structure.length === 0
      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
      : structure
    src.forEach((section, sectionIndex) => {
      const subdivisions = section.subdivisions || 1
      const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)
      const cells = []
      for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
        cells.push({ cellIndex: idx, subIndex, subSize: subSizes[subIndex] })
        idx++
      }
      grouped.set(sectionIndex, cells)
    })
    return grouped
  }, [type, structure])

  const renderCells = () => (
    <div
      className={`flex-1 ${showSectionLabels ? 'rounded-r' : 'rounded'} overflow-hidden border border-ui-border-strong flex h-full ${
        isRows || isFullbleed ? 'flex-col' : 'flex-row'
      }`}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const subdivisions = section.subdivisions || 1
        const isSectionSelected =
          mode === 'structure' && structureSelection?.type === 'section' && structureSelection.index === sectionIndex
        const cells = sectionCellMap.get(sectionIndex) || []

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`flex ${isRows || isFullbleed ? 'flex-row' : 'flex-col'}`}
            style={{ flex: `1 1 ${sectionSize}%` }}
          >
            {cells.map(({ cellIndex: currentCellIndex, subIndex, subSize }) => {
              const isImage = imageCells.includes(currentCellIndex)
              const isCellSelected =
                mode === 'structure'
                  ? structureSelection?.type === 'cell' && structureSelection.cellIndex === currentCellIndex
                  : selectedCell === currentCellIndex

              const { bgClass, textClass, content } = getCellContent(
                currentCellIndex,
                isImage,
                isCellSelected,
                isSectionSelected,
                subdivisions,
                subSize
              )

              return (
                <div
                  key={`cell-${currentCellIndex}`}
                  className={`relative cursor-pointer transition-colors min-h-[20px] ${bgClass} ${
                    mode === 'structure' && subdivisions > 1 ? 'border border-ui-border' : ''
                  }`}
                  style={{ flex: `1 1 ${subSize}%` }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (mode === 'structure') {
                      onSelectCell?.(currentCellIndex, sectionIndex, subIndex)
                    } else {
                      onSelectCell?.(currentCellIndex)
                    }
                  }}
                >
                  <div className={`absolute inset-0 flex items-center justify-center text-[11px] font-medium ${textClass}`}>
                    {content}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )

  const renderSectionLabels = () => {
    if (!showSectionLabels) return null

    return (
      <div className={`flex ${isRows ? 'flex-col w-8' : 'flex-row h-6'} shrink-0`}>
        {normalizedStructure.map((section, sectionIndex) => {
          const sectionSize = section.size || 100 / normalizedStructure.length
          const isSelected = structureSelection?.type === 'section' && structureSelection.index === sectionIndex
          return (
            <div
              key={`label-${sectionIndex}`}
              className={`flex items-center justify-center cursor-pointer text-[10px] font-medium transition-colors ${
                isRows ? 'rounded-l' : 'rounded-t'
              } ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-ui-surface-inset text-ui-text-subtle hover:bg-ui-surface-hover'
              }`}
              style={{ flex: `0 0 ${sectionSize}%` }}
              onClick={() => onSelectSection?.(sectionIndex)}
              title={`Click to edit ${isRows ? 'row' : 'column'} ${sectionIndex + 1}`}
            >
              {isRows ? `R${sectionIndex + 1}` : `C${sectionIndex + 1}`}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`flex ${showSectionLabels ? (isRows ? 'flex-row' : 'flex-col') : ''}`} style={containerStyle}>
      {renderSectionLabels()}
      {renderCells()}
    </div>
  )
}

export default memo(function LayoutTab({
  layout,
  onLayoutChange,
  platform,
  selectedCell = 0,
  onSelectCell,
}) {
  const { type = 'fullbleed', structure = [] } = layout
  const imageCells = layout.imageCells || [0]
  const [structureSelection, setStructureSelection] = useState(null)

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
        imageCells: [0],
      })
    } else {
      onLayoutChange({
        type: newType,
        structure: [
          { size: 50, subdivisions: 1, subSizes: [100] },
          { size: 50, subdivisions: 1, subSizes: [100] },
        ],
        imageCells: [0],
      })
    }
    setStructureSelection(null)
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
    // Update selection to track the element that moved
    if (structureSelection?.type === 'section' && structureSelection.index >= position) {
      setStructureSelection({ type: 'section', index: structureSelection.index + 1 })
    } else if (structureSelection?.type === 'cell' && structureSelection.cellIndex >= firstCellAtPosition) {
      setStructureSelection({ type: 'cell', cellIndex: structureSelection.cellIndex + 1 })
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
    // Update cell selection: clear if selected cell was in removed section, shift if after it
    if (structureSelection?.type === 'cell') {
      const ci = structureSelection.cellIndex
      if (ci >= firstCellOfRemoved && ci < firstCellOfRemoved + removedSubs) {
        setStructureSelection(null)
      } else if (ci >= firstCellOfRemoved + removedSubs) {
        setStructureSelection({ type: 'cell', cellIndex: ci - removedSubs })
      }
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
    // Update cell selection if it's after the newly added subdivision
    if (structureSelection?.type === 'cell' && structureSelection.cellIndex >= firstCellAfterSection) {
      setStructureSelection({ type: 'cell', cellIndex: structureSelection.cellIndex + 1 })
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
    // Update cell selection: clear if it was the removed sub, shift if after it
    if (structureSelection?.type === 'cell') {
      const ci = structureSelection.cellIndex
      if (ci === removedCellIndex) {
        setStructureSelection(null)
      } else if (ci >= firstCellAfterSection) {
        setStructureSelection({ type: 'cell', cellIndex: ci - 1 })
      }
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

  // Reset to default
  const handleReset = () => {
    onLayoutChange(defaultState.layout)
    setStructureSelection(null)
  }

  // Get info about current selection
  const selectedSection = structureSelection?.type === 'section' ? structure[structureSelection.index] : null
  const selectedSectionIndex = structureSelection?.type === 'section' ? structureSelection.index : null
  const selectedCellInfo = structureSelection?.type === 'cell' ? structureSelection : null
  const selectedCellSection = selectedCellInfo ? structure[selectedCellInfo.sectionIndex] : null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ui-text">Structure</h3>

      {/* Structure Section */}
      <CollapsibleSection title="Structure" defaultExpanded={false}>
        <div className="space-y-4">
          {/* Layout Type */}
          <div>
            <label className="block text-xs font-medium text-ui-text-muted mb-2">Layout Type</label>
            <div className="flex gap-1.5">
              {layoutTypes.map((lt) => (
                <button
                  key={lt.id}
                  onClick={() => {
                    handleTypeChange(lt.id)
                    setStructureSelection(null)
                  }}
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

          {/* Structure Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-ui-text-muted text-center">
              Select Cell <span className="text-ui-text-faint font-normal">(to configure)</span>
            </label>
            <div className="flex justify-center">
              <CellGrid
                layout={layout}
                imageCells={imageCells}
                mode="structure"
                globalSelectedCell={selectedCell}
                structureSelection={structureSelection}
                aspectRatio={platformAspectRatio}
                size="large"
                onSelectSection={(index) => {
                  if (structureSelection?.type === 'section' && structureSelection.index === index) {
                    setStructureSelection(null)
                  } else {
                    setStructureSelection({ type: 'section', index })
                  }
                }}
                onSelectCell={(cellIndex, sectionIndex, subIndex) => {
                  // Always sync to global cell selection so ContextBar and other tabs stay in sync
                  onSelectCell?.(cellIndex)
                  const normalizedStructure =
                    !structure || structure.length === 0
                      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
                      : structure
                  const section = normalizedStructure[sectionIndex]
                  if ((section.subdivisions || 1) === 1) {
                    if (structureSelection?.type === 'section' && structureSelection.index === sectionIndex) {
                      setStructureSelection(null)
                    } else {
                      setStructureSelection({ type: 'section', index: sectionIndex })
                    }
                  } else {
                    if (structureSelection?.type === 'cell' && structureSelection.cellIndex === cellIndex) {
                      setStructureSelection(null)
                    } else {
                      setStructureSelection({ type: 'cell', cellIndex, sectionIndex, subIndex })
                    }
                  }
                }}
              />
            </div>
            <div className="text-sm text-center py-2 bg-ui-surface-elevated rounded-lg">
              {structureSelection === null ? (
                <span className="text-ui-text-subtle">
                  {type === 'fullbleed' ? 'Single cell layout' : `Select a ${type === 'rows' ? 'row' : 'column'} or cell to edit`}
                </span>
              ) : structureSelection.type === 'section' ? (
                <span className="text-primary dark:text-violet-400">
                  Editing: <strong>{type === 'rows' || type === 'fullbleed' ? `Row ${structureSelection.index + 1}` : `Column ${structureSelection.index + 1}`}</strong>
                </span>
              ) : (
                <span className="text-primary dark:text-violet-400">
                  Editing: <strong>Cell {structureSelection.cellIndex + 1}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Add section button */}
          {type !== 'fullbleed' && structureSelection === null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-ui-text-subtle">
                {structure.length} {type === 'rows' ? 'rows' : 'columns'}
              </span>
              <button
                onClick={addSection}
                disabled={structure.length >= 4}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  structure.length >= 4
                    ? 'bg-ui-surface-inset text-ui-text-faint cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
                }`}
              >
                + Add {type === 'rows' ? 'Row' : 'Column'}
              </button>
            </div>
          )}

          {/* Section editing controls */}
          {type !== 'fullbleed' && structureSelection?.type === 'section' && selectedSection && (
            <div className="space-y-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {type === 'rows' ? `Row ${selectedSectionIndex + 1}` : `Column ${selectedSectionIndex + 1}`}
                </span>
                <button
                  onClick={() => setStructureSelection(null)}
                  className="text-xs text-primary hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                >
                  ✕ Deselect
                </button>
              </div>

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

              {structure.length > 1 && (
                <button
                  onClick={() => {
                    removeSection(selectedSectionIndex)
                    setStructureSelection(null)
                  }}
                  className="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium"
                >
                  Delete {type === 'rows' ? 'Row' : 'Column'}
                </button>
              )}
            </div>
          )}

          {/* Cell editing controls */}
          {type !== 'fullbleed' && structureSelection?.type === 'cell' && selectedCellInfo && (
            <div className="space-y-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  {type === 'rows'
                    ? `Row ${selectedCellInfo.sectionIndex + 1}, Column ${selectedCellInfo.subIndex + 1}`
                    : `Column ${selectedCellInfo.sectionIndex + 1}, Row ${selectedCellInfo.subIndex + 1}`}
                </span>
                <button
                  onClick={() => setStructureSelection(null)}
                  className="text-xs text-primary hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                >
                  ✕ Deselect
                </button>
              </div>

              <div>
                <label className="block text-xs text-primary dark:text-violet-400 mb-2 font-medium">
                  {type === 'rows' ? 'Width' : 'Height'} <span className="font-normal text-violet-400 dark:text-primary">({MIN_SIZE}–{getMaxSize(selectedCellSection?.subdivisions || 2)}%)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={MIN_SIZE}
                    max={getMaxSize(selectedCellSection?.subdivisions || 2)}
                    step="5"
                    value={selectedCellSection?.subSizes?.[selectedCellInfo.subIndex] || 50}
                    onChange={(e) => updateSubSize(selectedCellInfo.sectionIndex, selectedCellInfo.subIndex, Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-violet-700 dark:text-violet-300 w-12 text-right font-medium">
                    {Math.round(selectedCellSection?.subSizes?.[selectedCellInfo.subIndex] || 50)}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStructureSelection({ type: 'section', index: selectedCellInfo.sectionIndex })}
                className="w-full px-3 py-2 text-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/40 rounded-lg font-medium"
              >
                Edit Parent {type === 'rows' ? 'Row' : 'Column'}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              handleReset()
              setStructureSelection(null)
            }}
            className="w-full px-3 py-2.5 text-sm bg-zinc-100 dark:bg-dark-subtle text-ui-text-muted hover:bg-zinc-200 dark:hover:bg-dark-elevated rounded-lg font-medium"
          >
            Reset to Default
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
})
