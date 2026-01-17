import { useState, useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { platforms } from '../config/platforms'
import { defaultState } from '../hooks/useAdState'

const layoutTypes = [
  { id: 'fullbleed', name: 'Full', icon: '□' },
  { id: 'rows', name: 'Rows', icon: '☰' },
  { id: 'columns', name: 'Cols', icon: '|||' },
]

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
  imageCell,
  selectedCell = null,
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
    small: { width: 80, height: 52 },
    normal: { maxWidth: 180, minHeight: 100 },
    large: { maxWidth: 280, minHeight: 160 },
  }
  const config = sizeConfig[size] || sizeConfig.normal

  const containerStyle =
    size === 'small'
      ? { width: `${config.width}px`, height: `${config.height}px`, flexShrink: 0 }
      : { aspectRatio: aspectRatio, maxWidth: `${config.maxWidth}px`, minHeight: `${config.minHeight}px`, width: '100%' }

  const getCellContent = (cellIndex, isImage, isSelected, isSectionSelected, subdivisions, subSize) => {
    let bgClass, textClass, content

    if (mode === 'image') {
      bgClass = isImage ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
      textClass = isImage ? 'text-white' : 'text-gray-500 dark:text-gray-400'
      content = isImage ? '📷' : cellIndex + 1
    } else if (mode === 'structure') {
      if (isSelected) {
        bgClass = 'bg-blue-500 hover:bg-blue-600'
        textClass = 'text-white'
      } else if (isSectionSelected) {
        bgClass = 'bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700'
        textClass = 'text-blue-700 dark:text-blue-300'
      } else if (isImage) {
        bgClass = 'bg-blue-400 hover:bg-blue-500'
        textClass = 'text-white'
      } else {
        bgClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
        textClass = 'text-gray-500 dark:text-gray-400'
      }
      content = isImage ? '📷' : subdivisions > 1 ? `${Math.round(subSize)}%` : ''
    } else {
      if (isSelected) {
        bgClass = 'bg-blue-500 hover:bg-blue-600'
        textClass = 'text-white'
        content = '✓'
      } else if (isImage) {
        bgClass = 'bg-blue-400 hover:bg-blue-500'
        textClass = 'text-white'
        content = '📷'
      } else {
        bgClass = 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
        textClass = 'text-gray-500 dark:text-gray-400'
        content = cellIndex + 1
      }
    }

    return { bgClass, textClass, content }
  }

  let cellIndex = 0

  const renderCells = () => (
    <div
      className={`flex-1 ${showSectionLabels ? 'rounded-r' : 'rounded'} overflow-hidden border border-gray-300 dark:border-gray-600 flex h-full ${
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
          const isImage = currentCellIndex === imageCell
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
                mode === 'structure' && subdivisions > 1 ? 'border border-gray-200 dark:border-gray-600' : ''
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
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
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
  const { type = 'fullbleed', structure = [], imageCell = 0, textAlign, textVerticalAlign, cellAlignments = [] } = layout
  const [structureSelection, setStructureSelection] = useState(null)
  const [selectedAlignmentCell, setSelectedAlignmentCell] = useState(null)

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
        imageCell: 0,
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
        imageCell: 0,
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
    const newImageCell = imageCell >= newTotalCells ? 0 : imageCell
    onLayoutChange({ structure: newStructure, imageCell: newImageCell })
    const validatedTextCells = validateTextCells(textCells, newTotalCells)
    if (validatedTextCells && onTextCellsChange) {
      onTextCellsChange(validatedTextCells)
    }
  }

  // Update section size
  const updateSectionSize = (index, newSize) => {
    const newStructure = [...structure]
    const oldSize = newStructure[index].size
    const sizeDiff = newSize - oldSize

    const otherIndices = structure.map((_, i) => i).filter((i) => i !== index)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + structure[i].size, 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      otherIndices.forEach((i) => {
        const proportion = structure[i].size / otherTotalSize
        const adjustment = sizeDiff * proportion
        newStructure[i] = { ...newStructure[i], size: Math.max(10, Math.min(90, structure[i].size - adjustment)) }
      })
    }

    newStructure[index] = { ...newStructure[index], size: newSize }

    const total = newStructure.reduce((sum, s) => sum + s.size, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      newStructure.forEach((s, i) => {
        newStructure[i] = { ...s, size: s.size * scale }
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
    const newImageCell = imageCell >= newTotalCells ? 0 : imageCell
    onLayoutChange({ structure: newStructure, imageCell: newImageCell })
    const validatedTextCells = validateTextCells(textCells, newTotalCells)
    if (validatedTextCells && onTextCellsChange) {
      onTextCellsChange(validatedTextCells)
    }
  }

  // Update subdivision sizes
  const updateSubSize = (sectionIndex, subIndex, newSize) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const subSizes = [...(section.subSizes || [])]
    const oldSize = subSizes[subIndex]
    const sizeDiff = newSize - oldSize

    const otherIndices = subSizes.map((_, i) => i).filter((i) => i !== subIndex)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + subSizes[i], 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      otherIndices.forEach((i) => {
        const proportion = subSizes[i] / otherTotalSize
        const adjustment = sizeDiff * proportion
        subSizes[i] = Math.max(10, Math.min(90, subSizes[i] - adjustment))
      })
    }

    subSizes[subIndex] = newSize

    const total = subSizes.reduce((sum, s) => sum + s, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      subSizes.forEach((s, i) => {
        subSizes[i] = s * scale
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
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Layout</h3>

      {/* Structure Section */}
      <CollapsibleSection title="Structure" defaultExpanded={true}>
        <div className="space-y-4">
          {/* Layout Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Layout Type</label>
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
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 text-center">
              Select Cell <span className="text-gray-400 font-normal">(to configure)</span>
            </label>
            <div className="flex justify-center">
              <CellGrid
                layout={layout}
                imageCell={imageCell}
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
            <div className="text-sm text-center py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {structureSelection === null ? (
                <span className="text-gray-600 dark:text-gray-400">
                  {type === 'fullbleed' ? 'Single cell layout' : `Select a ${type === 'rows' ? 'row' : 'column'} or cell to edit`}
                </span>
              ) : structureSelection.type === 'section' ? (
                <span className="text-blue-600 dark:text-blue-400">
                  Editing: <strong>{type === 'rows' || type === 'fullbleed' ? `Row ${structureSelection.index + 1}` : `Column ${structureSelection.index + 1}`}</strong>
                </span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400">
                  Editing: <strong>Cell {structureSelection.cellIndex + 1}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Add section button */}
          {type !== 'fullbleed' && structureSelection === null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {structure.length} {type === 'rows' ? 'rows' : 'columns'}
              </span>
              <button
                onClick={addSection}
                disabled={structure.length >= 4}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  structure.length >= 4
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                }`}
              >
                + Add {type === 'rows' ? 'Row' : 'Column'}
              </button>
            </div>
          )}

          {/* Section editing controls */}
          {type !== 'fullbleed' && structureSelection?.type === 'section' && selectedSection && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {type === 'rows' ? `Row ${selectedSectionIndex + 1}` : `Column ${selectedSectionIndex + 1}`}
                </span>
                <button
                  onClick={() => setStructureSelection(null)}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  ✕ Deselect
                </button>
              </div>

              {structure.length > 1 && (
                <div>
                  <label className="block text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
                    {type === 'rows' ? 'Height' : 'Width'}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={selectedSection.size}
                      onChange={(e) => updateSectionSize(selectedSectionIndex, Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-blue-700 dark:text-blue-300 w-12 text-right font-medium">
                      {Math.round(selectedSection.size)}%
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
                  Split into {type === 'rows' ? 'columns' : 'rows'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => removeSubdivision(selectedSectionIndex)}
                    disabled={(selectedSection.subdivisions || 1) <= 1}
                    className={`w-9 h-9 text-base rounded-lg font-medium ${
                      (selectedSection.subdivisions || 1) <= 1
                        ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-300 dark:text-blue-600 cursor-not-allowed'
                        : 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-700'
                    }`}
                  >
                    −
                  </button>
                  <span className="text-base font-semibold text-blue-700 dark:text-blue-300 w-8 text-center">
                    {selectedSection.subdivisions || 1}
                  </span>
                  <button
                    onClick={() => addSubdivision(selectedSectionIndex)}
                    disabled={(selectedSection.subdivisions || 1) >= 3}
                    className={`w-9 h-9 text-base rounded-lg font-medium ${
                      (selectedSection.subdivisions || 1) >= 3
                        ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-300 dark:text-blue-600 cursor-not-allowed'
                        : 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-700'
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
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {type === 'rows'
                    ? `Row ${selectedCellInfo.sectionIndex + 1}, Column ${selectedCellInfo.subIndex + 1}`
                    : `Column ${selectedCellInfo.sectionIndex + 1}, Row ${selectedCellInfo.subIndex + 1}`}
                </span>
                <button
                  onClick={() => setStructureSelection(null)}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  ✕ Deselect
                </button>
              </div>

              <div>
                <label className="block text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
                  {type === 'rows' ? 'Width' : 'Height'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={selectedCellSection?.subSizes?.[selectedCellInfo.subIndex] || 50}
                    onChange={(e) => updateSubSize(selectedCellInfo.sectionIndex, selectedCellInfo.subIndex, Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-blue-700 dark:text-blue-300 w-12 text-right font-medium">
                    {Math.round(selectedCellSection?.subSizes?.[selectedCellInfo.subIndex] || 50)}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStructureSelection({ type: 'section', index: selectedCellInfo.sectionIndex })}
                className="w-full px-3 py-2 text-sm bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-700 rounded-lg font-medium"
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
            className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium"
          >
            Reset to Default
          </button>
        </div>
      </CollapsibleSection>

      {/* Cell Assignment Section */}
      <CollapsibleSection title="Cell Assignment" defaultExpanded={true}>
        <div className="space-y-4">
          {/* Image Cell */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Image Cell</label>
            <div className="flex items-center gap-3">
              <CellGrid
                layout={layout}
                imageCell={imageCell}
                mode="image"
                onSelectCell={(idx) => onLayoutChange({ imageCell: idx })}
                aspectRatio={platformAspectRatio}
                size="small"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Cell {imageCell + 1}
              </span>
            </div>
          </div>

          {/* Cell Alignment */}
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
              Cell Alignment <span className="text-gray-400 font-normal">(select cell or set global)</span>
            </label>
            <div className="flex items-center gap-3">
              <CellGrid
                layout={layout}
                imageCell={imageCell}
                selectedCell={selectedAlignmentCell}
                mode="cell"
                onSelectCell={(idx) => setSelectedAlignmentCell(selectedAlignmentCell === idx ? null : idx)}
                aspectRatio={platformAspectRatio}
                size="small"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedAlignmentCell === null ? 'Global' : `Cell ${selectedAlignmentCell + 1}`}
              </span>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">Horizontal</span>
                <div className="flex gap-1.5">
                  {textAlignOptions.map((align) => {
                    const isActive = getAlignmentForCell(selectedAlignmentCell, 'textAlign') === align.id
                    return (
                      <button
                        key={align.id}
                        onClick={() => setAlignmentForCell(selectedAlignmentCell, 'textAlign', align.id)}
                        title={align.name}
                        className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center ${
                          isActive
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <align.Icon />
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">Vertical</span>
                <div className="flex gap-1.5">
                  {verticalAlignOptions.map((align) => {
                    const isActive = getAlignmentForCell(selectedAlignmentCell, 'textVerticalAlign') === align.id
                    return (
                      <button
                        key={align.id}
                        onClick={() => setAlignmentForCell(selectedAlignmentCell, 'textVerticalAlign', align.id)}
                        title={align.name}
                        className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center ${
                          isActive
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
        </div>
      </CollapsibleSection>
    </div>
  )
})
