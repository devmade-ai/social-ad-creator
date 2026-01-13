import { useState, useMemo } from 'react'
import {
  layoutPresets,
  presetCategories,
  presetIcons,
  getPresetsByCategory,
  getSuggestedLayouts,
} from '../config/layoutPresets'
import { overlayTypes } from '../config/layouts'
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

const textGroupDefs = [
  { id: 'titleGroup', name: 'Title + Tagline', short: 'Title' },
  { id: 'bodyGroup', name: 'Body Text', short: 'Body' },
  { id: 'cta', name: 'Call to Action', short: 'CTA' },
  { id: 'footnote', name: 'Footnote', short: 'Note' },
]

// Sub-tabs for the Layout section
const subTabs = [
  { id: 'presets', name: 'Presets', icon: '⊞' },
  { id: 'structure', name: 'Structure', icon: '⊟' },
  { id: 'placement', name: 'Placement', icon: '◫' },
  { id: 'overlay', name: 'Overlay', icon: '◐' },
  { id: 'spacing', name: 'Spacing', icon: '⊡' },
]

const overlayColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
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
    return [{ index: 0, label: 'All', sectionIndex: 0, subIndex: 0 }]
  }

  const cells = []
  let cellIndex = 0

  structure.forEach((section, sectionIndex) => {
    const subdivisions = section.subdivisions || 1
    for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
      // Simple numbered labels
      cells.push({
        index: cellIndex,
        label: `${cellIndex + 1}`,
        sectionIndex,
        subIndex
      })
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

// Visual grid preview for cell selection - supports multiple modes
function CellGrid({
  layout,
  imageCell,
  selectedCell = null,
  mode = 'image', // 'image' | 'alignment' | 'placement'
  onSelectCell,
  textGroups = {},
  aspectRatio = 1, // width / height
}) {
  const { type, structure } = layout

  // Get cells that have text groups assigned
  const textGroupCells = useMemo(() => {
    const cellMap = {}
    textGroupDefs.forEach(group => {
      const cell = textGroups?.[group.id]?.cell
      if (cell !== null && cell !== undefined) {
        if (!cellMap[cell]) cellMap[cell] = []
        cellMap[cell].push(group.short)
      }
    })
    return cellMap
  }, [textGroups])

  // Dynamic aspect ratio style
  const containerStyle = {
    aspectRatio: aspectRatio,
    maxWidth: aspectRatio >= 1 ? '180px' : `${180 * aspectRatio}px`,
  }

  if (type === 'fullbleed' || !structure) {
    const isSelected = selectedCell === 0
    return (
      <div
        className={`rounded cursor-pointer border-2 transition-all ${
          mode === 'image'
            ? 'bg-blue-500 border-blue-600'
            : isSelected
              ? 'bg-purple-500 border-purple-600'
              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
        }`}
        style={containerStyle}
        onClick={() => onSelectCell(0)}
        title={mode === 'image' ? 'Image covers full area' : 'Click to select'}
      >
        <div className={`w-full h-full flex items-center justify-center text-xs font-medium ${
          mode === 'image' || isSelected ? 'text-white' : 'text-gray-500'
        }`}>
          {mode === 'image' ? '📷' : isSelected ? '✓' : 'All'}
        </div>
      </div>
    )
  }

  const isRows = type === 'rows'
  let cellIndex = 0

  return (
    <div
      className={`rounded overflow-hidden border border-gray-300 flex ${isRows ? 'flex-col' : 'flex-row'}`}
      style={containerStyle}
    >
      {structure.map((section, sectionIndex) => {
        const sectionSize = section.size || (100 / structure.length)
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isImage = currentCellIndex === imageCell
          const isSelected = currentCellIndex === selectedCell
          cellIndex++

          // Determine cell styling based on mode
          let bgClass, textClass, content

          if (mode === 'image') {
            bgClass = isImage
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-200 hover:bg-gray-300'
            textClass = isImage ? 'text-white' : 'text-gray-500'
            content = isImage ? '📷' : currentCellIndex
          } else if (mode === 'alignment') {
            if (isSelected) {
              bgClass = 'bg-purple-500 hover:bg-purple-600'
              textClass = 'text-white'
              content = '✓'
            } else if (isImage) {
              bgClass = 'bg-blue-400 hover:bg-blue-500'
              textClass = 'text-white'
              content = '📷'
            } else {
              bgClass = 'bg-gray-200 hover:bg-gray-300'
              textClass = 'text-gray-500'
              content = currentCellIndex
            }
          } else if (mode === 'placement') {
            const assignedGroups = textGroupCells[currentCellIndex]
            if (isSelected) {
              bgClass = 'bg-purple-500 hover:bg-purple-600'
              textClass = 'text-white'
              content = '✓'
            } else if (isImage) {
              bgClass = 'bg-blue-400 hover:bg-blue-500'
              textClass = 'text-white'
              content = '📷'
            } else if (assignedGroups) {
              bgClass = 'bg-amber-100 hover:bg-amber-200'
              textClass = 'text-amber-700'
              content = assignedGroups.join(', ')
            } else {
              bgClass = 'bg-gray-200 hover:bg-gray-300'
              textClass = 'text-gray-500'
              content = currentCellIndex
            }
          }

          sectionCells.push(
            <div
              key={`cell-${currentCellIndex}`}
              className={`relative cursor-pointer transition-colors ${bgClass}`}
              style={{ flex: `0 0 ${subSizes[subIndex]}%` }}
              onClick={() => onSelectCell(currentCellIndex)}
              title={mode === 'image'
                ? (isImage ? 'Image cell (click another to move)' : 'Click to place image here')
                : (isSelected ? 'Click to deselect' : 'Click to edit this cell')
              }
            >
              <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium ${textClass}`}>
                {content}
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

// Structure grid with clickable section labels and cells
function StructureGrid({
  layout,
  imageCell,
  structureSelection, // { type: 'section', index } | { type: 'cell', cellIndex, sectionIndex, subIndex } | null
  onSelectSection,
  onSelectCell,
}) {
  const { type, structure } = layout

  if (type === 'fullbleed' || !structure) {
    return (
      <div className="w-full aspect-[4/3] rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-500">Single cell layout</span>
      </div>
    )
  }

  const isRows = type === 'rows'
  let cellIndex = 0

  return (
    <div className={`w-full aspect-[4/3] flex ${isRows ? 'flex-row' : 'flex-col'}`}>
      {/* Section labels */}
      <div className={`flex ${isRows ? 'flex-col w-8' : 'flex-row h-6'} shrink-0`}>
        {structure.map((section, sectionIndex) => {
          const sectionSize = section.size || (100 / structure.length)
          const isSelected = structureSelection?.type === 'section' && structureSelection.index === sectionIndex
          return (
            <div
              key={`label-${sectionIndex}`}
              className={`flex items-center justify-center cursor-pointer text-[10px] font-medium transition-colors rounded-l ${
                isSelected
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              style={{ flex: `0 0 ${sectionSize}%` }}
              onClick={() => onSelectSection(sectionIndex)}
              title={`Click to edit ${isRows ? 'row' : 'column'} ${sectionIndex + 1}`}
            >
              {isRows ? `R${sectionIndex + 1}` : `C${sectionIndex + 1}`}
            </div>
          )
        })}
      </div>

      {/* Grid cells */}
      <div className={`flex-1 rounded-r overflow-hidden border border-gray-300 flex ${isRows ? 'flex-col' : 'flex-row'}`}>
        {structure.map((section, sectionIndex) => {
          const sectionSize = section.size || (100 / structure.length)
          const subdivisions = section.subdivisions || 1
          const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)
          const isSectionSelected = structureSelection?.type === 'section' && structureSelection.index === sectionIndex

          const sectionCells = []
          for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
            const currentCellIndex = cellIndex
            const isImage = currentCellIndex === imageCell
            const isCellSelected = structureSelection?.type === 'cell' && structureSelection.cellIndex === currentCellIndex
            cellIndex++

            let bgClass, textClass
            if (isCellSelected) {
              bgClass = 'bg-purple-500 hover:bg-purple-600'
              textClass = 'text-white'
            } else if (isSectionSelected) {
              bgClass = 'bg-purple-200 hover:bg-purple-300'
              textClass = 'text-purple-700'
            } else if (isImage) {
              bgClass = 'bg-blue-400 hover:bg-blue-500'
              textClass = 'text-white'
            } else {
              bgClass = 'bg-gray-100 hover:bg-gray-200'
              textClass = 'text-gray-500'
            }

            sectionCells.push(
              <div
                key={`cell-${currentCellIndex}`}
                className={`relative cursor-pointer transition-colors ${bgClass} ${
                  subdivisions > 1 ? 'border border-gray-200' : ''
                }`}
                style={{ flex: `0 0 ${subSizes[subIndex]}%` }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectCell(currentCellIndex, sectionIndex, subIndex)
                }}
                title={subdivisions > 1
                  ? `Click to resize this ${isRows ? 'column' : 'row'}`
                  : `Click to edit ${isRows ? 'row' : 'column'} ${sectionIndex + 1}`
                }
              >
                <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium ${textClass}`}>
                  {isImage ? '📷' : (subdivisions > 1 ? `${Math.round(subSizes[subIndex])}%` : '')}
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
    </div>
  )
}

// Individual text element definitions for placement
const textElementDefs = [
  { id: 'title', label: 'Title', placeholder: 'Title text...' },
  { id: 'tagline', label: 'Tagline', placeholder: 'Tagline...' },
  { id: 'bodyHeading', label: 'Body Heading', placeholder: 'Heading...' },
  { id: 'bodyText', label: 'Body Text', placeholder: 'Body text...' },
  { id: 'cta', label: 'CTA', placeholder: 'Call to action...' },
  { id: 'footnote', label: 'Footnote', placeholder: 'Footnote...' },
]

const colorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

export default function LayoutSelector({
  layout,
  onLayoutChange,
  textGroups = {},
  onTextGroupsChange,
  text = {},
  onTextChange,
  imageAspectRatio,
  platform,
  overlay,
  theme,
  padding = { global: 5, cellOverrides: {} },
  onPaddingChange,
  imageObjectFit = 'cover',
  onImageObjectFitChange,
  imageFilters = {},
  onImageFiltersChange,
}) {
  const { type = 'fullbleed', structure = [], imageCell = 0, textAlign, textVerticalAlign, cellAlignments = [], cellOverlays = {} } = layout

  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState('presets')
  // Cell selection state for alignment/placement tabs (null = all cells)
  const [selectedCell, setSelectedCell] = useState(null)
  // Structure selection state: { type: 'section', index } | { type: 'cell', cellIndex, sectionIndex, subIndex } | null
  const [structureSelection, setStructureSelection] = useState(null)
  // Preset category state
  const [activeCategory, setActiveCategory] = useState('all')

  const totalCells = useMemo(() => getTotalCells(structure), [structure])
  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

  // Calculate platform aspect ratio for cell selector
  const platformAspectRatio = useMemo(() => {
    const p = platforms.find(pl => pl.id === platform) || platforms[0]
    return p.width / p.height
  }, [platform])

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

  // Update all cells' alignment
  const updateAllCellsAlignment = (updates) => {
    // Update global alignment
    onLayoutChange(updates)
    // Also update all cell alignments to match
    const newAlignments = cellInfoList.map((_, idx) => ({
      ...(cellAlignments?.[idx] || {}),
      ...updates,
    }))
    onLayoutChange({ cellAlignments: newAlignments, ...updates })
  }

  // Get current alignment for a cell
  const getCellAlignment = (cellIndex, prop) => {
    const cellAlign = cellAlignments?.[cellIndex]?.[prop]
    if (cellAlign !== null && cellAlign !== undefined) return cellAlign
    return prop === 'textAlign' ? textAlign : textVerticalAlign
  }

  // Handle cell selection for alignment/placement tabs
  const handleCellSelect = (cellIndex) => {
    if (activeSubTab === 'image') {
      // Image mode: directly set image cell
      onLayoutChange({ imageCell: cellIndex })
    } else {
      // Alignment/placement mode: toggle selection
      setSelectedCell(selectedCell === cellIndex ? null : cellIndex)
    }
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
      onLayoutChange({
        type: newType,
        structure: [
          { size: 50, subdivisions: 1, subSizes: [100] },
          { size: 50, subdivisions: 1, subSizes: [100] },
        ],
        imageCell: 0,
      })
    }
    setSelectedCell(null)
  }

  // Add a section
  const addSection = () => {
    if (type === 'fullbleed') return
    const newStructure = [...structure]
    const newSize = 100 / (newStructure.length + 1)
    newStructure.forEach(s => s.size = newSize)
    newStructure.push({ size: newSize, subdivisions: 1, subSizes: [100] })
    onLayoutChange({ structure: newStructure })
  }

  // Remove a section
  const removeSection = (index) => {
    if (structure.length <= 1) return
    const newStructure = structure.filter((_, i) => i !== index)
    const newSize = 100 / newStructure.length
    newStructure.forEach(s => s.size = newSize)
    const newTotalCells = getTotalCells(newStructure)
    const newImageCell = imageCell >= newTotalCells ? 0 : imageCell
    onLayoutChange({ structure: newStructure, imageCell: newImageCell })
  }

  // Update section size with proportional balancing
  const updateSectionSize = (index, newSize) => {
    const newStructure = [...structure]
    const oldSize = newStructure[index].size
    const sizeDiff = newSize - oldSize

    const otherIndices = structure.map((_, i) => i).filter(i => i !== index)
    const otherTotalSize = otherIndices.reduce((sum, i) => sum + structure[i].size, 0)

    if (otherTotalSize > 0 && otherIndices.length > 0) {
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

    const total = newStructure.reduce((sum, s) => sum + s.size, 0)
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total
      newStructure.forEach((s, i) => {
        newStructure[i] = { ...s, size: s.size * scale }
      })
    }

    onLayoutChange({ structure: newStructure })
  }

  // Add subdivision to a section
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

  // Remove subdivision from a section
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
  }

  // Update subdivision sizes
  const updateSubSize = (sectionIndex, subIndex, newSize) => {
    const newStructure = [...structure]
    const section = newStructure[sectionIndex]
    const subSizes = [...(section.subSizes || [])]
    const oldSize = subSizes[subIndex]
    const sizeDiff = newSize - oldSize

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

  // Apply a preset
  const applyPreset = (preset) => {
    onLayoutChange(preset.layout)
    if (onTextGroupsChange) {
      onTextGroupsChange(preset.textGroups)
    }
    setSelectedCell(null)
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
    setSelectedCell(null)
  }

  // Category tabs for presets
  const categoryTabs = [
    ...(suggestedPresets.length > 0 ? [{ id: 'suggested', name: 'Suggested' }] : []),
    { id: 'all', name: 'All' },
    ...presetCategories.map(c => ({ id: c.id, name: c.name })),
  ]

  // Render sub-tab content
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'presets':
        return (
          <div className="space-y-3">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1">
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

            {/* Preset Grid */}
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
        )

      case 'structure':
        // Get info about current selection
        const selectedSection = structureSelection?.type === 'section' ? structure[structureSelection.index] : null
        const selectedSectionIndex = structureSelection?.type === 'section' ? structureSelection.index : null
        const selectedCellInfo = structureSelection?.type === 'cell' ? structureSelection : null
        const selectedCellSection = selectedCellInfo ? structure[selectedCellInfo.sectionIndex] : null

        return (
          <div className="space-y-3">
            {/* Layout Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Layout Type</label>
              <div className="flex gap-1">
                {layoutTypes.map((lt) => (
                  <button
                    key={lt.id}
                    onClick={() => {
                      handleTypeChange(lt.id)
                      setStructureSelection(null)
                    }}
                    className={`flex-1 px-2 py-2 text-xs rounded flex flex-col items-center gap-0.5 ${
                      type === lt.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-sm">{lt.icon}</span>
                    <span>{lt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {type === 'fullbleed' ? (
              <div className="text-xs text-gray-500 text-center py-4">
                Full image layout has a single cell.
                <br />
                Switch to Rows or Columns for more structure options.
              </div>
            ) : (
              <>
                {/* Structure Grid */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select to Edit <span className="text-gray-400 font-normal">(click label or cell)</span>
                  </label>
                  <StructureGrid
                    layout={layout}
                    imageCell={imageCell}
                    structureSelection={structureSelection}
                    onSelectSection={(index) => {
                      if (structureSelection?.type === 'section' && structureSelection.index === index) {
                        setStructureSelection(null)
                      } else {
                        setStructureSelection({ type: 'section', index })
                      }
                    }}
                    onSelectCell={(cellIndex, sectionIndex, subIndex) => {
                      const section = structure[sectionIndex]
                      // If only 1 subdivision, selecting cell = selecting section
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

                {/* Selection Info & Controls */}
                {structureSelection === null ? (
                  <div className="space-y-2">
                    <div className="text-xs text-center py-2 bg-gray-50 rounded text-gray-500">
                      Click a {type === 'rows' ? 'row label (R1, R2...)' : 'column label (C1, C2...)'} to adjust its size,
                      <br />or click a cell to adjust subdivision sizes
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{structure.length} {type === 'rows' ? 'rows' : 'columns'}</span>
                      <button
                        onClick={addSection}
                        disabled={structure.length >= 4}
                        className={`px-2 py-1 text-xs rounded ${
                          structure.length >= 4
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        + Add {type === 'rows' ? 'Row' : 'Column'}
                      </button>
                    </div>
                  </div>
                ) : structureSelection.type === 'section' ? (
                  <div className="space-y-3 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-purple-700">
                        {type === 'rows' ? `Row ${selectedSectionIndex + 1}` : `Column ${selectedSectionIndex + 1}`}
                      </span>
                      <button
                        onClick={() => setStructureSelection(null)}
                        className="text-[10px] text-purple-500 hover:text-purple-700"
                      >
                        ✕ Deselect
                      </button>
                    </div>

                    {/* Section size (height for rows, width for columns) */}
                    <div>
                      <label className="block text-[10px] text-purple-600 mb-1">
                        {type === 'rows' ? 'Height' : 'Width'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={selectedSection.size}
                          onChange={(e) => updateSectionSize(selectedSectionIndex, Number(e.target.value))}
                          className="flex-1 h-1.5 accent-purple-500"
                        />
                        <span className="text-xs text-purple-700 w-10 text-right">{Math.round(selectedSection.size)}%</span>
                      </div>
                    </div>

                    {/* Subdivisions */}
                    <div>
                      <label className="block text-[10px] text-purple-600 mb-1">
                        Split into {type === 'rows' ? 'columns' : 'rows'}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeSubdivision(selectedSectionIndex)}
                          disabled={(selectedSection.subdivisions || 1) <= 1}
                          className={`w-8 h-8 text-sm rounded ${
                            (selectedSection.subdivisions || 1) <= 1
                              ? 'bg-purple-100 text-purple-300 cursor-not-allowed'
                              : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
                          }`}
                        >
                          −
                        </button>
                        <span className="text-sm font-medium text-purple-700 w-8 text-center">
                          {selectedSection.subdivisions || 1}
                        </span>
                        <button
                          onClick={() => addSubdivision(selectedSectionIndex)}
                          disabled={(selectedSection.subdivisions || 1) >= 3}
                          className={`w-8 h-8 text-sm rounded ${
                            (selectedSection.subdivisions || 1) >= 3
                              ? 'bg-purple-100 text-purple-300 cursor-not-allowed'
                              : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Delete section */}
                    {structure.length > 1 && (
                      <button
                        onClick={() => {
                          removeSection(selectedSectionIndex)
                          setStructureSelection(null)
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded"
                      >
                        Delete {type === 'rows' ? 'Row' : 'Column'}
                      </button>
                    )}
                  </div>
                ) : (
                  // Cell selected (subdivision size)
                  <div className="space-y-3 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-purple-700">
                        {type === 'rows'
                          ? `Row ${selectedCellInfo.sectionIndex + 1}, Column ${selectedCellInfo.subIndex + 1}`
                          : `Column ${selectedCellInfo.sectionIndex + 1}, Row ${selectedCellInfo.subIndex + 1}`
                        }
                      </span>
                      <button
                        onClick={() => setStructureSelection(null)}
                        className="text-[10px] text-purple-500 hover:text-purple-700"
                      >
                        ✕ Deselect
                      </button>
                    </div>

                    {/* Cell size (width for cells in rows, height for cells in columns) */}
                    <div>
                      <label className="block text-[10px] text-purple-600 mb-1">
                        {type === 'rows' ? 'Width' : 'Height'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={selectedCellSection?.subSizes?.[selectedCellInfo.subIndex] || 50}
                          onChange={(e) => updateSubSize(selectedCellInfo.sectionIndex, selectedCellInfo.subIndex, Number(e.target.value))}
                          className="flex-1 h-1.5 accent-purple-500"
                        />
                        <span className="text-xs text-purple-700 w-10 text-right">
                          {Math.round(selectedCellSection?.subSizes?.[selectedCellInfo.subIndex] || 50)}%
                        </span>
                      </div>
                    </div>

                    {/* Quick link to edit parent section */}
                    <button
                      onClick={() => setStructureSelection({ type: 'section', index: selectedCellInfo.sectionIndex })}
                      className="w-full px-3 py-1.5 text-xs bg-purple-200 text-purple-700 hover:bg-purple-300 rounded"
                    >
                      Edit Parent {type === 'rows' ? 'Row' : 'Column'}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Reset */}
            <button
              onClick={() => {
                handleReset()
                setStructureSelection(null)
              }}
              className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 rounded"
            >
              Reset to Default
            </button>
          </div>
        )

      case 'placement':
        return (
          <div className="space-y-4">
            {/* Image Section */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Image</label>
              <div className="flex gap-3">
                {/* Cell selector */}
                <CellGrid
                  layout={layout}
                  imageCell={imageCell}
                  mode="image"
                  onSelectCell={(idx) => onLayoutChange({ imageCell: idx })}
                  aspectRatio={platformAspectRatio}
                />
                {/* Quick controls */}
                <div className="flex-1 space-y-2">
                  {/* Fit toggle */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => onImageObjectFitChange?.('cover')}
                      className={`flex-1 px-2 py-1.5 text-[10px] rounded ${
                        imageObjectFit === 'cover'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Cover
                    </button>
                    <button
                      onClick={() => onImageObjectFitChange?.('contain')}
                      className={`flex-1 px-2 py-1.5 text-[10px] rounded ${
                        imageObjectFit === 'contain'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Contain
                    </button>
                  </div>
                  {/* Grayscale toggle */}
                  <button
                    onClick={() => onImageFiltersChange?.({ grayscale: !imageFilters.grayscale })}
                    className={`w-full px-2 py-1.5 text-[10px] rounded ${
                      imageFilters.grayscale
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {imageFilters.grayscale ? 'Grayscale On' : 'Grayscale Off'}
                  </button>
                  {/* Overlay slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Overlay</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={overlay?.opacity || 0}
                      onChange={(e) => {
                        const opacity = parseInt(e.target.value)
                        onLayoutChange({ cellOverlays: { ...cellOverlays, [imageCell]: { enabled: opacity > 0, opacity } } })
                      }}
                      className="flex-1 h-1 accent-blue-500"
                    />
                    <span className="text-[10px] text-gray-500 w-6">{overlay?.opacity || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Alignment */}
            {type !== 'fullbleed' && (
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-600">Text Alignment</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 block mb-1">Horizontal</span>
                    <div className="flex gap-1">
                      {textAlignOptions.map((align) => {
                        const isActive = textAlign === align.id
                        return (
                          <button
                            key={align.id}
                            onClick={() => updateAllCellsAlignment({ textAlign: align.id })}
                            title={align.name}
                            className={`flex-1 px-2 py-2 rounded flex items-center justify-center ${
                              isActive
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <align.Icon />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 block mb-1">Vertical</span>
                    <div className="flex gap-1">
                      {verticalAlignOptions.map((align) => {
                        const isActive = textVerticalAlign === align.id
                        return (
                          <button
                            key={align.id}
                            onClick={() => updateAllCellsAlignment({ textVerticalAlign: align.id })}
                            title={align.name}
                            className={`flex-1 px-2 py-2 rounded flex items-center justify-center ${
                              isActive
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            )}

            {/* Individual Text Elements */}
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-600">Text Elements</label>
              {textElementDefs.map((element) => {
                const elementState = text?.[element.id] || { content: '', visible: false, color: 'secondary' }
                // Map element to its group for cell placement
                const groupId = element.id === 'title' || element.id === 'tagline' ? 'titleGroup'
                  : element.id === 'bodyHeading' || element.id === 'bodyText' ? 'bodyGroup'
                  : element.id
                const currentCell = textGroups?.[groupId]?.cell

                return (
                  <div key={element.id} className="p-2 bg-gray-50 rounded space-y-1.5">
                    {/* Row 1: Label, visibility, color */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-gray-600 w-16">{element.label}</span>
                      <button
                        onClick={() => onTextChange?.(element.id, { visible: !elementState.visible })}
                        className={`px-1.5 py-0.5 text-[9px] rounded ${
                          elementState.visible
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {elementState.visible ? 'On' : 'Off'}
                      </button>
                      <div className="flex gap-0.5 ml-auto">
                        {colorOptions.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => onTextChange?.(element.id, { color: color.id })}
                            title={color.name}
                            className={`w-4 h-4 rounded border ${
                              elementState.color === color.id
                                ? 'border-blue-500 ring-1 ring-blue-500'
                                : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: theme?.[color.id] || '#888' }}
                          />
                        ))}
                      </div>
                      {/* Cell placement (only show if not fullbleed and multiple cells) */}
                      {type !== 'fullbleed' && cellInfoList.length > 1 && (
                        <div className="flex gap-0.5">
                          {cellInfoList.map((cell) => (
                            <button
                              key={cell.index}
                              onClick={() => onTextGroupsChange?.({ [groupId]: { cell: cell.index } })}
                              className={`w-5 h-5 text-[9px] rounded ${
                                currentCell === cell.index
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              {cell.index + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Row 2: Text input */}
                    <input
                      type="text"
                      value={elementState.content}
                      onChange={(e) => onTextChange?.(element.id, { content: e.target.value })}
                      placeholder={element.placeholder}
                      className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'overlay':
        // Helper to get current cell overlay config
        const getCellOverlayConfig = (cellIndex) => {
          return cellOverlays[cellIndex] || null
        }

        // Helper to update cell overlay
        const updateCellOverlay = (cellIndex, updates) => {
          const newCellOverlays = { ...cellOverlays }
          if (updates === null) {
            delete newCellOverlays[cellIndex]
          } else {
            newCellOverlays[cellIndex] = { ...(cellOverlays[cellIndex] || {}), ...updates }
          }
          onLayoutChange({ cellOverlays: newCellOverlays })
        }

        // Check if a cell has overlay enabled
        const isCellOverlayEnabled = (cellIndex) => {
          const config = cellOverlays[cellIndex]
          if (config === undefined) {
            // Default: image cell has overlay, others don't
            return cellIndex === imageCell
          }
          return config.enabled !== false
        }

        return (
          <div className="space-y-3">
            {type === 'fullbleed' ? (
              <div className="text-xs text-gray-500 text-center py-4">
                Full image layout has a single cell.
                <br />
                Overlay is controlled in the Image tab.
              </div>
            ) : (
              <>
                {/* Cell Selector Grid */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Cell <span className="text-gray-400 font-normal">(to configure overlay)</span>
                  </label>
                  <CellGrid
                    layout={layout}
                    imageCell={imageCell}
                    selectedCell={selectedCell}
                    mode="alignment"
                    onSelectCell={handleCellSelect}
                    aspectRatio={platformAspectRatio}
                  />
                </div>

                {/* Selection indicator */}
                <div className="text-xs text-center py-1 bg-gray-50 rounded">
                  {selectedCell === null ? (
                    <span className="text-gray-600">Select a cell to configure its overlay</span>
                  ) : (
                    <span className="text-purple-600">
                      Editing: <strong>{cellInfoList.find(c => c.index === selectedCell)?.label || `Cell ${selectedCell}`}</strong>
                      {selectedCell === imageCell && <span className="text-blue-500 ml-1">(image)</span>}
                    </span>
                  )}
                </div>

                {/* Cell Overlay Controls */}
                {selectedCell !== null && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    {/* Enable/Disable */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`overlay-enabled-${selectedCell}`}
                        checked={isCellOverlayEnabled(selectedCell)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateCellOverlay(selectedCell, { enabled: true })
                          } else {
                            updateCellOverlay(selectedCell, { enabled: false })
                          }
                        }}
                        className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor={`overlay-enabled-${selectedCell}`} className="text-xs font-medium text-gray-700">
                        Enable Overlay
                      </label>
                    </div>

                    {/* Overlay options - only show if enabled */}
                    {isCellOverlayEnabled(selectedCell) && (
                      <>
                        {/* Use global or custom */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`overlay-custom-${selectedCell}`}
                            checked={getCellOverlayConfig(selectedCell)?.type !== undefined}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Enable custom settings with current global values
                                updateCellOverlay(selectedCell, {
                                  enabled: true,
                                  type: overlay?.type || 'solid',
                                  color: overlay?.color || 'primary',
                                  opacity: overlay?.opacity ?? 50,
                                })
                              } else {
                                // Reset to use global
                                updateCellOverlay(selectedCell, { enabled: true, type: undefined, color: undefined, opacity: undefined })
                              }
                            }}
                            className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor={`overlay-custom-${selectedCell}`} className="text-xs text-gray-600">
                            Custom settings (otherwise uses global)
                          </label>
                        </div>

                        {/* Custom overlay settings */}
                        {getCellOverlayConfig(selectedCell)?.type !== undefined && (
                          <div className="space-y-3 pt-2 border-t border-gray-200">
                            {/* Type */}
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-600">Type</label>
                              <div className="grid grid-cols-2 gap-1">
                                {overlayTypes.map((t) => (
                                  <button
                                    key={t.id}
                                    onClick={() => updateCellOverlay(selectedCell, { type: t.id })}
                                    className={`px-2 py-1 text-[10px] rounded ${
                                      getCellOverlayConfig(selectedCell)?.type === t.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {t.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Color */}
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-600">Color</label>
                              <div className="flex gap-1">
                                {overlayColorOptions.map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() => updateCellOverlay(selectedCell, { color: c.id })}
                                    className={`flex-1 px-2 py-1.5 text-[10px] rounded ${
                                      getCellOverlayConfig(selectedCell)?.color === c.id
                                        ? 'ring-2 ring-blue-500 ring-offset-1'
                                        : ''
                                    }`}
                                    style={{ backgroundColor: theme?.[c.id] || '#000' }}
                                  >
                                    <span style={{ color: c.id === 'primary' ? theme?.secondary : theme?.primary }}>
                                      {c.name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Opacity */}
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <label className="text-xs font-medium text-gray-600">Opacity</label>
                                <span className="text-xs text-gray-500">{getCellOverlayConfig(selectedCell)?.opacity ?? 50}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={getCellOverlayConfig(selectedCell)?.opacity ?? 50}
                                onChange={(e) => updateCellOverlay(selectedCell, { opacity: parseInt(e.target.value, 10) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Reset cell to default */}
                    <button
                      onClick={() => updateCellOverlay(selectedCell, null)}
                      className="w-full px-2 py-1.5 text-xs bg-gray-200 text-gray-600 hover:bg-gray-300 rounded"
                    >
                      Reset to Default
                    </button>
                  </div>
                )}

                {/* Quick overview */}
                {selectedCell === null && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Cell Overlays</label>
                    <div className="space-y-1">
                      {cellInfoList.map((cell) => (
                        <div
                          key={cell.index}
                          className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded text-xs"
                        >
                          <span className="text-gray-600">
                            {cell.label}
                            {cell.index === imageCell && <span className="text-blue-500 ml-1">(img)</span>}
                          </span>
                          <span className={isCellOverlayEnabled(cell.index) ? 'text-green-600' : 'text-gray-400'}>
                            {isCellOverlayEnabled(cell.index) ? 'On' : 'Off'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )

      case 'spacing':
        // Helper to get cell padding value
        const getCellPaddingValue = (cellIndex) => {
          return padding.cellOverrides?.[cellIndex] ?? padding.global
        }

        // Helper to update cell padding
        const updateCellPadding = (cellIndex, value) => {
          if (value === null || value === padding.global) {
            // Reset to global
            const newOverrides = { ...padding.cellOverrides }
            delete newOverrides[cellIndex]
            onPaddingChange?.({ cellOverrides: newOverrides })
          } else {
            onPaddingChange?.({ cellOverrides: { ...padding.cellOverrides, [cellIndex]: value } })
          }
        }

        return (
          <div className="space-y-3">
            {/* Global Padding */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-600">Global Padding</label>
                <span className="text-xs text-gray-500">{padding.global}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={padding.global}
                onChange={(e) => onPaddingChange?.({ global: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Per-cell padding */}
            {type !== 'fullbleed' && cellInfoList.length > 1 && (
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cell Padding <span className="text-gray-400 font-normal">(overrides global)</span>
                  </label>
                  <CellGrid
                    layout={layout}
                    imageCell={imageCell}
                    selectedCell={selectedCell}
                    mode="alignment"
                    onSelectCell={handleCellSelect}
                    aspectRatio={platformAspectRatio}
                  />
                </div>

                {/* Selected cell padding */}
                {selectedCell !== null && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        {cellInfoList.find(c => c.index === selectedCell)?.label || `Cell ${selectedCell}`}
                      </span>
                      <button
                        onClick={() => setSelectedCell(null)}
                        className="text-[10px] text-gray-500 hover:text-gray-700"
                      >
                        ✕ Deselect
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`padding-custom-${selectedCell}`}
                        checked={padding.cellOverrides?.[selectedCell] !== undefined}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateCellPadding(selectedCell, padding.global)
                          } else {
                            updateCellPadding(selectedCell, null)
                          }
                        }}
                        className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor={`padding-custom-${selectedCell}`} className="text-xs text-gray-600">
                        Custom padding for this cell
                      </label>
                    </div>

                    {padding.cellOverrides?.[selectedCell] !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-xs text-gray-600">Padding</label>
                          <span className="text-xs text-gray-500">{getCellPaddingValue(selectedCell)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={getCellPaddingValue(selectedCell)}
                          onChange={(e) => updateCellPadding(selectedCell, parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Overview when no cell selected */}
                {selectedCell === null && (
                  <div className="space-y-1">
                    {cellInfoList.map((cell) => (
                      <div
                        key={cell.index}
                        className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded text-xs"
                      >
                        <span className="text-gray-600">{cell.label}</span>
                        <span className={padding.cellOverrides?.[cell.index] !== undefined ? 'text-purple-600' : 'text-gray-400'}>
                          {getCellPaddingValue(cell.index)}%
                          {padding.cellOverrides?.[cell.index] !== undefined && ' (custom)'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Layout</h3>

      {/* Sub-tabs - prominent navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id)
              // Reset selections when switching tabs
              if (tab.id !== 'placement' && tab.id !== 'overlay' && tab.id !== 'spacing') {
                setSelectedCell(null)
              }
              if (tab.id !== 'structure') {
                setStructureSelection(null)
              }
            }}
            className={`flex-1 px-2 py-2 text-xs font-medium rounded-md transition-all ${
              activeSubTab === tab.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {renderSubTabContent()}
    </div>
  )
}
