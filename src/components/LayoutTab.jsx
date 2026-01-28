import { useState, useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
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

// Alignment icon components
const AlignLeftIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="0" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="0" y="8" width="8" height="2" />
  </svg>
)
const AlignCenterIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="2" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="3" y="8" width="8" height="2" />
  </svg>
)
const AlignRightIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="4" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="6" y="8" width="8" height="2" />
  </svg>
)
const AlignTopIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
    <rect x="0" y="0" width="10" height="2" />
    <rect x="3" y="4" width="4" height="10" opacity="0.4" />
  </svg>
)
const AlignMiddleIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
    <rect x="0" y="6" width="10" height="2" />
    <rect x="3" y="2" width="4" height="10" opacity="0.4" />
  </svg>
)
const AlignBottomIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
    <rect x="0" y="12" width="10" height="2" />
    <rect x="3" y="0" width="4" height="10" opacity="0.4" />
  </svg>
)

const textAlignOptions = [
  { id: 'left', name: 'Left', Icon: AlignLeftIcon },
  { id: 'center', name: 'Center', Icon: AlignCenterIcon },
  { id: 'right', name: 'Right', Icon: AlignRightIcon },
]

const verticalAlignOptions = [
  { id: 'start', name: 'Top', Icon: AlignTopIcon },
  { id: 'center', name: 'Middle', Icon: AlignMiddleIcon },
  { id: 'end', name: 'Bottom', Icon: AlignBottomIcon },
]

// Helper to count total cells in structure
function getTotalCells(structure) {
  if (!structure) return 1
  return structure.reduce((sum, section) => sum + (section.subdivisions || 1), 0)
}

// Helper to validate textCells against total cell count
function validateTextCells(textCells, totalCells) {
  if (!textCells) return textCells
  const validated = { ...textCells }
  let hasChanges = false
  Object.keys(validated).forEach((key) => {
    if (validated[key] !== null && validated[key] >= totalCells) {
      validated[key] = null
      hasChanges = true
    }
  })
  return hasChanges ? validated : null
}

// Helper to get cell info for display
function getCellInfo(layout) {
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

// Unified grid component for cell selection
function CellGrid({
  layout,
  imageCells = [],  // Array of image cell indices
  selectedCell = null,
  mode = 'cell', // 'cell' | 'image' | 'structure'
  onSelectCell,
  onSelectSection,
  structureSelection,
  aspectRatio = 1,
  size = 'normal',
}) {
  const { type, structure } = layout
  // Normalize imageCells to always be an array
  const normalizedImageCells = Array.isArray(imageCells) ? imageCells : [imageCells]
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

  const getCellContent = (cellIndex, isImage, isSelected, isSectionSelected, subdivisions, subSize) => {
    let bgClass, textClass, content

    if (mode === 'image') {
      bgClass = isImage ? 'bg-primary hover:bg-primary-hover' : 'bg-ui-surface-inset hover:bg-ui-surface-hover'
      textClass = isImage ? 'text-white' : 'text-ui-text-subtle'
      content = isImage ? '📷' : cellIndex + 1
    } else if (mode === 'structure') {
      if (isSelected) {
        bgClass = 'bg-primary hover:bg-primary-hover'
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
      content = isImage ? '📷' : subdivisions > 1 ? `${Math.round(subSize)}%` : ''
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

  let cellIndex = 0

  const renderCells = () => (
    <div
      className={`flex-1 ${showSectionLabels ? 'rounded-r' : 'rounded'} overflow-hidden border border-ui-border-strong flex h-full ${
        isRows || isFullbleed ? 'flex-col' : 'flex-row'
      }`}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)
        const isSectionSelected =
          mode === 'structure' && structureSelection?.type === 'section' && structureSelection.index === sectionIndex

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isImage = normalizedImageCells.includes(currentCellIndex)
          const isCellSelected =
            mode === 'structure'
              ? structureSelection?.type === 'cell' && structureSelection.cellIndex === currentCellIndex
              : selectedCell === currentCellIndex
          cellIndex++

          const { bgClass, textClass, content } = getCellContent(
            currentCellIndex,
            isImage,
            isCellSelected,
            isSectionSelected,
            subdivisions,
            subSizes[subIndex]
          )

          sectionCells.push(
            <div
              key={`cell-${currentCellIndex}`}
              className={`relative cursor-pointer transition-colors min-h-[20px] ${bgClass} ${
                mode === 'structure' && subdivisions > 1 ? 'border border-ui-border' : ''
              }`}
              style={{ flex: `1 1 ${subSizes[subIndex]}%` }}
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
        }

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`flex ${isRows || isFullbleed ? 'flex-row' : 'flex-col'}`}
            style={{ flex: `1 1 ${sectionSize}%` }}
          >
            {sectionCells}
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
  textCells = {},
  onTextCellsChange,
  platform,
}) {
  const { type = 'fullbleed', structure = [], textAlign, textVerticalAlign, cellAlignments = [] } = layout
  // Support both old imageCell (single) and new imageCells (array) format
  const imageCells = layout.imageCells ?? (layout.imageCell !== undefined ? [layout.imageCell] : [0])
  const [structureSelection, setStructureSelection] = useState(null)

  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

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
      if (onTextCellsChange) {
        const validatedTextCells = validateTextCells(textCells, 1)
        if (validatedTextCells) {
          onTextCellsChange(validatedTextCells)
        }
      }
    } else {
      onLayoutChange({
        type: newType,
        structure: [
          { size: 50, subdivisions: 1, subSizes: [100] },
          { size: 50, subdivisions: 1, subSizes: [100] },
        ],
        imageCells: [0],
      })
      if (onTextCellsChange) {
        const validatedTextCells = validateTextCells(textCells, 2)
        if (validatedTextCells) {
          onTextCellsChange(validatedTextCells)
        }
      }
    }
    setStructureSelection(null)
  }

  // Add a section
  const addSection = () => {
    if (type === 'fullbleed') return
    const newSize = 100 / (structure.length + 1)
    const newStructure = structure.map((s) => ({ ...s, size: newSize }))
    newStructure.push({ size: newSize, subdivisions: 1, subSizes: [100] })
    onLayoutChange({ structure: newStructure })
  }

  // Remove a section
  const removeSection = (index) => {
    if (structure.length <= 1) return
    const newSize = 100 / (structure.length - 1)
    const newStructure = structure
      .filter((_, i) => i !== index)
      .map((s) => ({ ...s, size: newSize }))
    const newTotalCells = getTotalCells(newStructure)
    // Filter out image cells that no longer exist
    const newImageCells = imageCells.filter(cell => cell < newTotalCells)
    // Ensure at least one image cell remains
    const finalImageCells = newImageCells.length > 0 ? newImageCells : [0]
    onLayoutChange({ structure: newStructure, imageCells: finalImageCells })
    const validatedTextCells = validateTextCells(textCells, newTotalCells)
    if (validatedTextCells && onTextCellsChange) {
      onTextCellsChange(validatedTextCells)
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

  // Add subdivision
  const addSubdivision = (sectionIndex) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const currentSubs = section.subdivisions || 1

    if (currentSubs >= 3) return

    const newSubs = currentSubs + 1
    const evenSize = 100 / newSubs
    const newSubSizes = Array(newSubs).fill(evenSize)

    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: newSubSizes }
    onLayoutChange({ structure: newStructure })
  }

  // Remove subdivision
  const removeSubdivision = (sectionIndex) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const currentSubs = section.subdivisions || 1

    if (currentSubs <= 1) return

    const newSubs = currentSubs - 1
    const evenSize = 100 / newSubs
    const newSubSizes = Array(newSubs).fill(evenSize)

    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: newSubSizes }

    const newTotalCells = getTotalCells(newStructure)
    // Filter out image cells that no longer exist
    const newImageCells = imageCells.filter(cell => cell < newTotalCells)
    // Ensure at least one image cell remains
    const finalImageCells = newImageCells.length > 0 ? newImageCells : [0]
    onLayoutChange({ structure: newStructure, imageCells: finalImageCells })
    const validatedTextCells = validateTextCells(textCells, newTotalCells)
    if (validatedTextCells && onTextCellsChange) {
      onTextCellsChange(validatedTextCells)
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
    if (onTextCellsChange) {
      onTextCellsChange(defaultState.textCells)
    }
    setStructureSelection(null)
  }

  // Get alignment for selected cell or global
  const getAlignmentForCell = (cellIndex, prop) => {
    if (cellIndex === null) {
      return prop === 'textAlign' ? textAlign : textVerticalAlign
    }
    const cellAlign = cellAlignments?.[cellIndex]?.[prop]
    if (cellAlign !== null && cellAlign !== undefined) return cellAlign
    return prop === 'textAlign' ? textAlign : textVerticalAlign
  }

  // Update alignment for selected cell or global
  const setAlignmentForCell = (cellIndex, prop, value) => {
    if (cellIndex === null) {
      onLayoutChange({ [prop]: value })
    } else {
      const newAlignments = [...(cellAlignments || [])]
      while (newAlignments.length <= cellIndex) {
        newAlignments.push({ textAlign: null, textVerticalAlign: null })
      }
      newAlignments[cellIndex] = { ...newAlignments[cellIndex], [prop]: value }
      onLayoutChange({ cellAlignments: newAlignments })
    }
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

      {/* Text Alignment Section */}
      <CollapsibleSection title="Text Alignment" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Context-aware label */}
          <div className="text-xs text-ui-text-subtle">
            {type === 'fullbleed' ? (
              'Global alignment for all text'
            ) : structureSelection?.type === 'section' ? (
              <>Alignment for <span className="font-medium text-primary dark:text-violet-400">{type === 'rows' ? 'Row' : 'Column'} {structureSelection.index + 1}</span> (all cells)</>
            ) : structureSelection?.type === 'cell' ? (
              <>Alignment for <span className="font-medium text-primary dark:text-violet-400">Cell {structureSelection.cellIndex + 1}</span></>
            ) : (
              <>Select a cell/row above, or set <span className="font-medium">global</span> alignment</>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <span className="text-xs text-ui-text-subtle block mb-1.5">Horizontal</span>
              <div className="flex gap-1.5">
                {textAlignOptions.map((align) => {
                  const targetCell = structureSelection?.type === 'cell' ? structureSelection.cellIndex : null
                  const isActive = getAlignmentForCell(targetCell, 'textAlign') === align.id
                  return (
                    <button
                      key={align.id}
                      onClick={() => {
                        if (structureSelection?.type === 'section') {
                          // Apply to all cells in this section
                          const sectionIndex = structureSelection.index
                          const section = structure[sectionIndex]
                          const subdivisions = section?.subdivisions || 1
                          let cellStart = 0
                          for (let i = 0; i < sectionIndex; i++) {
                            cellStart += structure[i]?.subdivisions || 1
                          }
                          for (let i = 0; i < subdivisions; i++) {
                            setAlignmentForCell(cellStart + i, 'textAlign', align.id)
                          }
                        } else if (structureSelection?.type === 'cell') {
                          setAlignmentForCell(structureSelection.cellIndex, 'textAlign', align.id)
                        } else {
                          setAlignmentForCell(null, 'textAlign', align.id)
                        }
                      }}
                      title={align.name}
                      className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                      }`}
                    >
                      <align.Icon />
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-xs text-ui-text-subtle block mb-1.5">Vertical</span>
              <div className="flex gap-1.5">
                {verticalAlignOptions.map((align) => {
                  const targetCell = structureSelection?.type === 'cell' ? structureSelection.cellIndex : null
                  const isActive = getAlignmentForCell(targetCell, 'textVerticalAlign') === align.id
                  return (
                    <button
                      key={align.id}
                      onClick={() => {
                        if (structureSelection?.type === 'section') {
                          // Apply to all cells in this section
                          const sectionIndex = structureSelection.index
                          const section = structure[sectionIndex]
                          const subdivisions = section?.subdivisions || 1
                          let cellStart = 0
                          for (let i = 0; i < sectionIndex; i++) {
                            cellStart += structure[i]?.subdivisions || 1
                          }
                          for (let i = 0; i < subdivisions; i++) {
                            setAlignmentForCell(cellStart + i, 'textVerticalAlign', align.id)
                          }
                        } else if (structureSelection?.type === 'cell') {
                          setAlignmentForCell(structureSelection.cellIndex, 'textVerticalAlign', align.id)
                        } else {
                          setAlignmentForCell(null, 'textVerticalAlign', align.id)
                        }
                      }}
                      title={align.name}
                      className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                      }`}
                    >
                      <align.Icon />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
})
