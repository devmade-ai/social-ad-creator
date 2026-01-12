import { useState, useMemo } from 'react'
import {
  layoutPresets,
  presetCategories,
  presetIcons,
  getPresetsByCategory,
  getSuggestedLayouts,
  flipLayoutHorizontal,
  flipLayoutVertical,
  rotateLayout,
} from '../config/layoutPresets'
import { defaultState } from '../hooks/useAdState'

const splitTypes = [
  { id: 'none', name: 'Full Image', icon: '[]' },
  { id: 'vertical', name: 'Columns', icon: '||' },
  { id: 'horizontal', name: 'Rows', icon: '=' },
]

const sectionCounts = [
  { id: 2, name: '2' },
  { id: 3, name: '3' },
]

const textAlignOptions = [
  { id: 'left', name: 'Left', icon: '<' },
  { id: 'center', name: 'Center', icon: '|' },
  { id: 'right', name: 'Right', icon: '>' },
]

const verticalAlignOptions = [
  { id: 'start', name: 'Top', icon: '^' },
  { id: 'center', name: 'Middle', icon: '-' },
  { id: 'end', name: 'Bottom', icon: 'v' },
]

const textGroupDefs = [
  { id: 'titleGroup', name: 'Title + Tagline' },
  { id: 'bodyGroup', name: 'Body Heading + Text' },
  { id: 'cta', name: 'Call to Action' },
  { id: 'footnote', name: 'Footnote' },
]

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
        // Adjust colors when active
        if (isActive) {
          if (props.fill === '#3b82f6') props.fill = '#ffffff'
          if (props.fill === '#e5e7eb') props.fill = 'rgba(255,255,255,0.4)'
        }
        return <Element key={i} {...props} />
      })}
    </svg>
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
  const { splitType, sections, imageCells = [], textAlign, textVerticalAlign, cellAlignments = [] } = layout
  const [activeCategory, setActiveCategory] = useState('all')
  const [showFineTune, setShowFineTune] = useState(false)

  // Get suggested layouts based on image and platform
  const suggestedIds = useMemo(() => {
    return getSuggestedLayouts(imageAspectRatio, platform)
  }, [imageAspectRatio, platform])

  const suggestedPresets = useMemo(() => {
    return layoutPresets.filter(p => suggestedIds.includes(p.id))
  }, [suggestedIds])

  // Get presets for current category
  const displayPresets = useMemo(() => {
    if (activeCategory === 'all') return layoutPresets
    if (activeCategory === 'suggested') return suggestedPresets
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

  // Get current alignment for a cell (falls back to global)
  const getCellAlignment = (cellIndex, prop) => {
    const cellAlign = cellAlignments?.[cellIndex]?.[prop]
    if (cellAlign !== null && cellAlign !== undefined) return cellAlign
    return prop === 'textAlign' ? textAlign : textVerticalAlign
  }

  // Check if a cell has image
  const cellHasImage = (index) => imageCells.includes(index)

  // Toggle image on a cell
  const toggleImageCell = (index) => {
    const newImageCells = cellHasImage(index)
      ? imageCells.filter(i => i !== index)
      : [...imageCells, index].sort((a, b) => a - b)
    onLayoutChange({ imageCells: newImageCells })
  }

  // Get cell label
  const getCellLabel = (index) => {
    const isVertical = splitType === 'vertical'
    const hasImage = cellHasImage(index)
    const posLabel = isVertical ? `Col ${index + 1}` : `Row ${index + 1}`
    return hasImage ? `${posLabel} [img]` : posLabel
  }

  // Handle section count change - reset imageCells if needed
  const handleSectionChange = (count) => {
    const updates = { sections: count }
    // Remove any imageCells that are out of range
    const validImageCells = imageCells.filter(i => i < count)
    if (validImageCells.length !== imageCells.length) {
      updates.imageCells = validImageCells.length > 0 ? validImageCells : [0]
    }
    onLayoutChange(updates)
  }

  // Apply a preset
  const applyPreset = (preset) => {
    onLayoutChange(preset.layout)
    if (onTextGroupsChange) {
      // Apply all text group settings at once
      onTextGroupsChange(preset.textGroups)
    }
  }

  // Check if current layout matches a preset
  const getActivePreset = () => {
    return layoutPresets.find(preset => {
      const layoutMatch =
        preset.layout.splitType === splitType &&
        preset.layout.sections === sections &&
        JSON.stringify(preset.layout.imageCells) === JSON.stringify(imageCells)
      return layoutMatch
    })
  }

  const activePreset = getActivePreset()

  // Quick actions
  const handleFlip = () => {
    if (splitType === 'vertical') {
      const result = flipLayoutHorizontal(layout, textGroups)
      onLayoutChange(result.layout)
      if (onTextGroupsChange) onTextGroupsChange(result.textGroups)
    } else if (splitType === 'horizontal') {
      const result = flipLayoutVertical(layout, textGroups)
      onLayoutChange(result.layout)
      if (onTextGroupsChange) onTextGroupsChange(result.textGroups)
    }
  }

  const handleRotate = () => {
    if (splitType !== 'none') {
      onLayoutChange(rotateLayout(layout))
    }
  }

  const handleReset = () => {
    onLayoutChange(defaultState.layout)
    if (onTextGroupsChange) {
      onTextGroupsChange(defaultState.textGroups)
    }
  }

  // Category tabs including "suggested" if we have suggestions
  const categoryTabs = [
    { id: 'all', name: 'All' },
    ...(suggestedPresets.length > 0 ? [{ id: 'suggested', name: 'Suggested' }] : []),
    ...presetCategories.map(c => ({ id: c.id, name: c.name })),
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Layout</h3>

      {/* Quick Actions */}
      <div className="flex gap-1">
        <button
          onClick={handleFlip}
          disabled={splitType === 'none'}
          title={splitType === 'vertical' ? 'Flip left/right' : 'Flip top/bottom'}
          className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
            splitType === 'none'
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>{splitType === 'horizontal' ? '↕' : '↔'}</span>
          <span>Flip</span>
        </button>
        <button
          onClick={handleRotate}
          disabled={splitType === 'none'}
          title="Switch between columns and rows"
          className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
            splitType === 'none'
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>↻</span>
          <span>Rotate</span>
        </button>
        <button
          onClick={handleReset}
          title="Reset to default layout"
          className="flex-1 px-2 py-1.5 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center gap-1"
        >
          <span>⟲</span>
          <span>Reset</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div>
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
      </div>

      {/* Quick Start Presets Grid */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Quick Start
          {activeCategory === 'suggested' && (
            <span className="ml-1 text-[10px] text-blue-500 font-normal">
              Based on your image
            </span>
          )}
        </label>
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
        {displayPresets.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No presets in this category</p>
        )}
      </div>

      {/* Fine-tune Toggle */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setShowFineTune(!showFineTune)}
          className="flex items-center justify-between w-full text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <span>Fine-tune Controls</span>
          <span className="transform transition-transform" style={{ transform: showFineTune ? 'rotate(180deg)' : '' }}>
            ▼
          </span>
        </button>
      </div>

      {showFineTune && (
        <div className="space-y-4 pt-2">
          {/* Split Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Split Type</label>
            <div className="flex gap-1">
              {splitTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onLayoutChange({ splitType: type.id })}
                  className={`flex-1 px-2 py-2 text-xs rounded flex flex-col items-center gap-1 ${
                    splitType === type.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-base font-mono">{type.icon}</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Only show split options when not 'none' */}
          {splitType !== 'none' && (
            <>
              {/* Number of Sections */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sections</label>
                <div className="flex gap-1">
                  {sectionCounts.map((count) => (
                    <button
                      key={count.id}
                      onClick={() => handleSectionChange(count.id)}
                      className={`flex-1 px-3 py-2 text-sm rounded ${
                        sections === count.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {count.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Layer Cells */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image covers</label>
                <p className="text-[10px] text-gray-400 mb-2">Select which cells the image spans</p>
                <div className="flex gap-1">
                  {Array.from({ length: sections }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => toggleImageCell(i)}
                      className={`flex-1 px-2 py-2 text-xs rounded ${
                        cellHasImage(i)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {splitType === 'vertical' ? `Col ${i + 1}` : `Row ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Global Text Alignment - shown only when no split */}
          {splitType === 'none' && (
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

          {/* Per-Cell Alignment - shown when split layout */}
          {splitType !== 'none' && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <label className="block text-xs font-semibold text-gray-700">Cell Alignment</label>
              {Array.from({ length: sections }).map((_, cellIndex) => (
                <div key={cellIndex} className="space-y-2 p-2 bg-gray-50 rounded">
                  <span className="text-xs font-medium text-gray-600">{getCellLabel(cellIndex)}</span>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 mb-1">Horizontal</label>
                      <div className="flex gap-0.5">
                        {textAlignOptions.map((align) => (
                          <button
                            key={align.id}
                            onClick={() => updateCellAlignment(cellIndex, { textAlign: align.id })}
                            title={align.name}
                            className={`flex-1 px-1 py-1 text-xs rounded ${
                              getCellAlignment(cellIndex, 'textAlign') === align.id
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
                            onClick={() => updateCellAlignment(cellIndex, { textVerticalAlign: align.id })}
                            title={align.name}
                            className={`flex-1 px-1 py-1 text-xs rounded ${
                              getCellAlignment(cellIndex, 'textVerticalAlign') === align.id
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

          {/* Text Group Cell Assignment - shown when split layout */}
          {splitType !== 'none' && onTextGroupsChange && (
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
                      {Array.from({ length: sections }).map((_, i) => (
                        <option key={i} value={i}>
                          {getCellLabel(i)}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
