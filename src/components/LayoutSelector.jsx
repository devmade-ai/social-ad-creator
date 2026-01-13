import { useState, useMemo } from 'react'
import {
  layoutPresets,
  presetCategories,
  presetIcons,
  getPresetsByCategory,
  getSuggestedLayouts,
} from '../config/layoutPresets'
import { defaultState } from '../hooks/useAdState'

const layoutTypes = [
  { id: 'fullbleed', name: 'Full Image', icon: '□' },
  { id: 'rows', name: 'Rows', icon: '☰' },
  { id: 'columns', name: 'Columns', icon: '|||' },
]

const textAlignOptions = [
  { id: 'left', name: 'Left', icon: '◀' },
  { id: 'center', name: 'Center', icon: '●' },
  { id: 'right', name: 'Right', icon: '▶' },
]

const verticalAlignOptions = [
  { id: 'start', name: 'Top', icon: '▲' },
  { id: 'center', name: 'Middle', icon: '●' },
  { id: 'end', name: 'Bottom', icon: '▼' },
]

const textGroupDefs = [
  { id: 'titleGroup', name: 'Title + Tagline' },
  { id: 'bodyGroup', name: 'Body Heading + Text' },
  { id: 'cta', name: 'Call to Action' },
  { id: 'footnote', name: 'Footnote' },
]

// Helper to count total cells in structure
function getTotalCells(structure) {
  if (!structure) return 1
  return structure.reduce((sum, section) => sum + (section.subdivisions || 1), 0)
}

// Helper to get cell info for display
function getCellInfo(layout) {
  const { type, structure } = layout
  if (type === 'fullbleed' || !structure) {
    return [{ index: 0, label: 'Full', sectionIndex: 0, subIndex: 0 }]
  }

  const cells = []
  let cellIndex = 0
  const isRows = type === 'rows'

  structure.forEach((section, sectionIndex) => {
    const subdivisions = section.subdivisions || 1
    for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
      let label
      if (subdivisions === 1) {
        label = isRows ? `Row ${sectionIndex + 1}` : `Col ${sectionIndex + 1}`
      } else {
        const subLabel = isRows ? `Col ${subIndex + 1}` : `Row ${subIndex + 1}`
        const sectionLabel = isRows ? `R${sectionIndex + 1}` : `C${sectionIndex + 1}`
        label = `${sectionLabel}-${subLabel}`
      }
      cells.push({ index: cellIndex, label, sectionIndex, subIndex })
      cellIndex++
    }
  })

  return cells
}

// SVG Preview Icon Component
function PresetIcon({ presetId, isActive }) {
  const iconData = presetIcons[presetId]
  if (!iconData) return <span className="text-base">?</span>

  return (
    <svg
      viewBox={iconData.viewBox}
      className="w-10 h-7"
      style={{ display: 'block' }}
    >
      {iconData.elements.map((el, i) => {
        const Element = el.type
        const props = { ...el.props }
        if (isActive) {
          if (props.fill === '#3b82f6') props.fill = '#ffffff'
          if (props.fill === '#e5e7eb') props.fill = 'rgba(255,255,255,0.4)'
        }
        return <Element key={i} {...props} />
      })}
    </svg>
  )
}

// Visual grid preview for cell selection
function GridPreview({ layout, imageCell, onSelectCell }) {
  const { type, structure } = layout

  if (type === 'fullbleed' || !structure) {
    return (
      <div
        className="w-full aspect-[4/3] bg-blue-500 rounded cursor-pointer border-2 border-blue-600"
        onClick={() => onSelectCell(0)}
        title="Image covers full area"
      >
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
          Image
        </div>
      </div>
    )
  }

  const isRows = type === 'rows'
  let cellIndex = 0

  return (
    <div
      className={`w-full aspect-[4/3] rounded overflow-hidden border border-gray-300 flex ${isRows ? 'flex-col' : 'flex-row'}`}
    >
      {structure.map((section, sectionIndex) => {
        const sectionSize = section.size || (100 / structure.length)
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isImage = currentCellIndex === imageCell
          cellIndex++

          sectionCells.push(
            <div
              key={`cell-${currentCellIndex}`}
              className={`relative cursor-pointer transition-colors ${
                isImage
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              style={{ flex: `0 0 ${subSizes[subIndex]}%` }}
              onClick={() => onSelectCell(currentCellIndex)}
              title={isImage ? 'Image cell (click another to move)' : 'Click to place image here'}
            >
              <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium ${
                isImage ? 'text-white' : 'text-gray-500'
              }`}>
                {isImage ? '📷' : currentCellIndex}
              </div>
            </div>
          )
        }

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`flex ${isRows ? 'flex-row' : 'flex-col'}`}
            style={{ flex: `0 0 ${sectionSize}%` }}
          >
            {sectionCells}
          </div>
        )
      })}
    </div>
  )
}

export default function LayoutSelector({
  layout,
  onLayoutChange,
  textGroups = {},
  onTextGroupsChange,
  imageAspectRatio,
  platform,
}) {
  const { type = 'fullbleed', structure = [], imageCell = 0, textAlign, textVerticalAlign, cellAlignments = [] } = layout
  // Default to 'suggested' if there are suggested presets, otherwise 'all'
  const [activeCategory, setActiveCategory] = useState('suggested')
  const [showFineTune, setShowFineTune] = useState(false)

  const totalCells = useMemo(() => getTotalCells(structure), [structure])
  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

  // Get suggested layouts
  const suggestedIds = useMemo(() => {
    return getSuggestedLayouts(imageAspectRatio, platform)
  }, [imageAspectRatio, platform])

  const suggestedPresets = useMemo(() => {
    return layoutPresets.filter(p => suggestedIds.includes(p.id))
  }, [suggestedIds])

  const displayPresets = useMemo(() => {
    if (activeCategory === 'all') return layoutPresets
    if (activeCategory === 'suggested') {
      // Fall back to showing popular presets if no suggestions available
      return suggestedPresets.length > 0 ? suggestedPresets : layoutPresets.slice(0, 6)
    }
    return getPresetsByCategory(activeCategory)
  }, [activeCategory, suggestedPresets])

  // Helper to update a specific cell's alignment
  const updateCellAlignment = (cellIndex, updates) => {
    const newAlignments = [...(cellAlignments || [])]
    while (newAlignments.length <= cellIndex) {
      newAlignments.push({ textAlign: null, textVerticalAlign: null })
    }
    newAlignments[cellIndex] = { ...newAlignments[cellIndex], ...updates }
    onLayoutChange({ cellAlignments: newAlignments })
  }

  // Get current alignment for a cell
  const getCellAlignment = (cellIndex, prop) => {
    const cellAlign = cellAlignments?.[cellIndex]?.[prop]
    if (cellAlign !== null && cellAlign !== undefined) return cellAlign
    return prop === 'textAlign' ? textAlign : textVerticalAlign
  }

  // Change layout type
  const handleTypeChange = (newType) => {
    if (newType === 'fullbleed') {
      onLayoutChange({
        type: 'fullbleed',
        structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
        imageCell: 0,
      })
    } else {
      // Default to 2 equal sections
      onLayoutChange({
        type: newType,
        structure: [
          { size: 50, subdivisions: 1, subSizes: [100] },
          { size: 50, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
      })
    }
  }

  // Add a section
  const addSection = () => {
    if (type === 'fullbleed') return
    const newStructure = [...structure]
    const newSize = 100 / (newStructure.length + 1)
    // Redistribute sizes evenly
    newStructure.forEach(s => s.size = newSize)
    newStructure.push({ size: newSize, subdivisions: 1, subSizes: [100] })
    onLayoutChange({ structure: newStructure })
  }

  // Remove a section
  const removeSection = (index) => {
    if (structure.length <= 1) return
    const newStructure = structure.filter((_, i) => i !== index)
    // Redistribute sizes
    const newSize = 100 / newStructure.length
    newStructure.forEach(s => s.size = newSize)
    // Adjust imageCell if needed
    const newTotalCells = getTotalCells(newStructure)
    const newImageCell = imageCell >= newTotalCells ? 0 : imageCell
    onLayoutChange({ structure: newStructure, imageCell: newImageCell })
  }

  // Update section size with proportional balancing
  const updateSectionSize = (index, newSize) => {
    const newStructure = [...structure]
    const oldSize = newStructure[index].size
    const sizeDiff = newSize - oldSize

    // Proportionally adjust other sections
    const otherIndices = structure.map((_, i) => i).filter(i => i !== index)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + structure[i].size, 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      // Distribute the difference proportionally among other sections
      otherIndices.forEach(i => {
        const proportion = structure[i].size / otherTotalSize
        const adjustment = sizeDiff * proportion
        newStructure[i] = {
          ...newStructure[i],
          size: Math.max(10, Math.min(90, structure[i].size - adjustment))
        }
      })
    }

    newStructure[index] = { ...newStructure[index], size: newSize }

    // Normalize to ensure total is 100%
    const total = newStructure.reduce((sum, s) => sum + s.size, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      newStructure.forEach((s, i) => {
        newStructure[i] = { ...s, size: s.size * scale }
      })
    }

    onLayoutChange({ structure: newStructure })
  }

  // Add subdivision to a section (up to 3)
  const addSubdivision = (sectionIndex) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const currentSubs = section.subdivisions || 1

    if (currentSubs >= 3) return

    const newSubs = currentSubs + 1
    // Distribute sizes evenly
    const evenSize = 100 / newSubs
    const newSubSizes = Array(newSubs).fill(evenSize)

    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: newSubSizes }
    onLayoutChange({ structure: newStructure })
  }

  // Remove subdivision from a section (minimum 1)
  const removeSubdivision = (sectionIndex) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const currentSubs = section.subdivisions || 1

    if (currentSubs <= 1) return

    const newSubs = currentSubs - 1
    // Distribute sizes evenly
    const evenSize = 100 / newSubs
    const newSubSizes = Array(newSubs).fill(evenSize)

    newStructure[sectionIndex] = { ...section, subdivisions: newSubs, subSizes: newSubSizes }

    // Recalculate imageCell if it was in removed subdivision
    const newTotalCells = getTotalCells(newStructure)
    const newImageCell = imageCell >= newTotalCells ? 0 : imageCell
    onLayoutChange({ structure: newStructure, imageCell: newImageCell })
  }

  // Update subdivision sizes with proportional balancing
  const updateSubSize = (sectionIndex, subIndex, newSize) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const subSizes = [...(section.subSizes || [])]
    const oldSize = subSizes[subIndex]
    const sizeDiff = newSize - oldSize

    // Proportionally adjust other subdivisions
    const otherIndices = subSizes.map((_, i) => i).filter(i => i !== subIndex)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + subSizes[i], 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
      otherIndices.forEach(i => {
        const proportion = subSizes[i] / otherTotalSize
        const adjustment = sizeDiff * proportion
        subSizes[i] = Math.max(10, Math.min(90, subSizes[i] - adjustment))
      })
    }

    subSizes[subIndex] = newSize

    // Normalize to ensure total is 100%
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

  // Select image cell
  const selectImageCell = (cellIndex) => {
    onLayoutChange({ imageCell: cellIndex })
  }

  // Apply a preset
  const applyPreset = (preset) => {
    onLayoutChange(preset.layout)
    if (onTextGroupsChange) {
      onTextGroupsChange(preset.textGroups)
    }
  }

  // Check if current layout matches a preset
  const getActivePreset = () => {
    return layoutPresets.find(preset => {
      return JSON.stringify(preset.layout) === JSON.stringify(layout)
    })
  }

  const activePreset = getActivePreset()

  // Reset to default
  const handleReset = () => {
    onLayoutChange(defaultState.layout)
    if (onTextGroupsChange) {
      onTextGroupsChange(defaultState.textGroups)
    }
  }

  // Category tabs
  const categoryTabs = [
    { id: 'all', name: 'All' },
    ...(suggestedPresets.length > 0 ? [{ id: 'suggested', name: 'Suggested' }] : []),
    ...presetCategories.map(c => ({ id: c.id, name: c.name })),
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Layout</h3>

      {/* Layout Type Selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
        <div className="flex gap-1">
          {layoutTypes.map((lt) => (
            <button
              key={lt.id}
              onClick={() => handleTypeChange(lt.id)}
              className={`flex-1 px-2 py-2 text-xs rounded flex flex-col items-center gap-1 ${
                type === lt.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-base">{lt.icon}</span>
              <span>{lt.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Grid Preview & Image Cell Selector */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Image Position <span className="text-gray-400 font-normal">(click to move)</span>
        </label>
        <GridPreview
          layout={layout}
          imageCell={imageCell}
          onSelectCell={selectImageCell}
        />
      </div>

      {/* Structure Controls (for rows/columns) */}
      {type !== 'fullbleed' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">
              {type === 'rows' ? 'Rows' : 'Columns'}
            </label>
            <button
              onClick={addSection}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              disabled={structure.length >= 4}
            >
              + Add
            </button>
          </div>

          {structure.map((section, sectionIndex) => (
            <div key={sectionIndex} className="p-2 bg-gray-50 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  {type === 'rows' ? `Row ${sectionIndex + 1}` : `Col ${sectionIndex + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  {/* Subdivision controls: - count + */}
                  <span className="text-[10px] text-gray-500 mr-1">Split:</span>
                  <button
                    onClick={() => removeSubdivision(sectionIndex)}
                    disabled={(section.subdivisions || 1) <= 1}
                    className={`w-5 h-5 text-[10px] rounded ${
                      (section.subdivisions || 1) <= 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Remove split"
                  >
                    −
                  </button>
                  <span className="text-[10px] text-gray-600 w-4 text-center font-medium">
                    {section.subdivisions || 1}
                  </span>
                  <button
                    onClick={() => addSubdivision(sectionIndex)}
                    disabled={(section.subdivisions || 1) >= 3}
                    className={`w-5 h-5 text-[10px] rounded ${
                      (section.subdivisions || 1) >= 3
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Add split"
                  >
                    +
                  </button>
                  {structure.length > 1 && (
                    <button
                      onClick={() => removeSection(sectionIndex)}
                      className="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 hover:bg-red-200 rounded ml-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Section size slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-8">Size</span>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={section.size}
                  onChange={(e) => updateSectionSize(sectionIndex, Number(e.target.value))}
                  className="flex-1 h-1"
                />
                <span className="text-[10px] text-gray-500 w-8">{Math.round(section.size)}%</span>
              </div>

              {/* Subdivision sizes */}
              {section.subdivisions > 1 && (
                <div className="pl-2 border-l-2 border-gray-200">
                  <span className="text-[10px] text-gray-400">
                    {type === 'rows' ? 'Column widths' : 'Row heights'}
                  </span>
                  {section.subSizes?.map((subSize, subIndex) => (
                    <div key={subIndex} className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 w-6">{subIndex + 1}</span>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={subSize}
                        onChange={(e) => updateSubSize(sectionIndex, subIndex, Number(e.target.value))}
                        className="flex-1 h-1"
                      />
                      <span className="text-[10px] text-gray-500 w-8">{Math.round(subSize)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Start Presets */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {categoryTabs.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2 py-1 text-[10px] rounded-full ${
                activeCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
              {cat.id === 'suggested' && <span className="ml-1">★</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {displayPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              title={preset.description}
              className={`px-1.5 py-2 text-xs rounded flex flex-col items-center gap-1 transition-colors ${
                activePreset?.id === preset.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <PresetIcon presetId={preset.id} isActive={activePreset?.id === preset.id} />
              <span className="text-[9px] leading-tight text-center line-clamp-2">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fine-tune Toggle */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setShowFineTune(!showFineTune)}
          className="flex items-center justify-between w-full text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <span>Alignment & Text Placement</span>
          <span className="transform transition-transform" style={{ transform: showFineTune ? 'rotate(180deg)' : '' }}>
            ▼
          </span>
        </button>
      </div>

      {showFineTune && (
        <div className="space-y-4 pt-2">
          {/* Global Text Alignment - shown only when fullbleed */}
          {type === 'fullbleed' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Align</label>
                <div className="flex gap-1">
                  {textAlignOptions.map((align) => (
                    <button
                      key={align.id}
                      onClick={() => onLayoutChange({ textAlign: align.id })}
                      title={align.name}
                      className={`flex-1 px-2 py-1.5 text-sm rounded ${
                        textAlign === align.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {align.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vertical Align</label>
                <div className="flex gap-1">
                  {verticalAlignOptions.map((align) => (
                    <button
                      key={align.id}
                      onClick={() => onLayoutChange({ textVerticalAlign: align.id })}
                      title={align.name}
                      className={`flex-1 px-2 py-1.5 text-sm rounded ${
                        textVerticalAlign === align.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {align.icon}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Per-Cell Alignment - shown when not fullbleed */}
          {type !== 'fullbleed' && cellInfoList.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700">Cell Alignment</label>
              {cellInfoList.map((cell) => (
                <div key={cell.index} className="space-y-2 p-2 bg-gray-50 rounded">
                  <span className="text-xs font-medium text-gray-600">
                    {cell.label} {cell.index === imageCell ? '[img]' : ''}
                  </span>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 mb-1">Horizontal</label>
                      <div className="flex gap-0.5">
                        {textAlignOptions.map((align) => (
                          <button
                            key={align.id}
                            onClick={() => updateCellAlignment(cell.index, { textAlign: align.id })}
                            title={align.name}
                            className={`flex-1 px-1 py-1 text-xs rounded ${
                              getCellAlignment(cell.index, 'textAlign') === align.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {align.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 mb-1">Vertical</label>
                      <div className="flex gap-0.5">
                        {verticalAlignOptions.map((align) => (
                          <button
                            key={align.id}
                            onClick={() => updateCellAlignment(cell.index, { textVerticalAlign: align.id })}
                            title={align.name}
                            className={`flex-1 px-1 py-1 text-xs rounded ${
                              getCellAlignment(cell.index, 'textVerticalAlign') === align.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {align.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text Group Cell Assignment - shown when not fullbleed */}
          {type !== 'fullbleed' && onTextGroupsChange && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <label className="block text-xs font-semibold text-gray-700">Text Placement</label>
              <p className="text-[10px] text-gray-400">Assign text groups to cells</p>
              {textGroupDefs.map((group) => {
                const currentCell = textGroups?.[group.id]?.cell
                return (
                  <div key={group.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-600">{group.name}</span>
                    <select
                      value={currentCell === null || currentCell === undefined ? 'auto' : currentCell}
                      onChange={(e) => {
                        const value = e.target.value === 'auto' ? null : parseInt(e.target.value)
                        onTextGroupsChange({ [group.id]: { cell: value } })
                      }}
                      className="text-xs px-2 py-1 border border-gray-200 rounded bg-white"
                    >
                      <option value="auto">Auto</option>
                      {cellInfoList.map((cell) => (
                        <option key={cell.index} value={cell.index}>
                          {cell.label} {cell.index === imageCell ? '[img]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 rounded"
          >
            Reset to Default
          </button>
        </div>
      )}
    </div>
  )
}
