import { useState, useMemo } from 'react'
import { overlayTypes } from '../config/layouts'
import { platforms } from '../config/platforms'
import { defaultState } from '../hooks/useAdState'
import { neutralColors } from '../config/themes'
import {
  layoutPresets,
  presetCategories,
  presetIcons,
  getPresetsByCategory,
  getSuggestedLayouts,
} from '../config/layoutPresets'

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

// Sub-tab icon components
const StructureIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="14" rx="1" opacity="0.4" />
    <rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
)
const PlacementIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="14" height="14" rx="1" opacity="0.2" />
    <rect x="3" y="4" width="10" height="2" rx="0.5" />
    <rect x="4" y="7" width="8" height="1.5" rx="0.5" opacity="0.6" />
    <rect x="5" y="10" width="6" height="1.5" rx="0.5" opacity="0.4" />
  </svg>
)
const OverlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="14" height="14" rx="1" opacity="0.3" />
    <path d="M1 8 L1 14 Q1 15 2 15 L14 15 Q15 15 15 14 L15 8 Z" opacity="0.7" />
  </svg>
)
const SpacingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="4" y="4" width="8" height="8" rx="1" />
    <rect x="1" y="6" width="2" height="4" rx="0.5" opacity="0.4" />
    <rect x="13" y="6" width="2" height="4" rx="0.5" opacity="0.4" />
    <rect x="6" y="1" width="4" height="2" rx="0.5" opacity="0.4" />
    <rect x="6" y="13" width="4" height="2" rx="0.5" opacity="0.4" />
  </svg>
)
const PresetsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1" />
    <rect x="9" y="1" width="6" height="6" rx="1" opacity="0.5" />
    <rect x="1" y="9" width="6" height="6" rx="1" opacity="0.5" />
    <rect x="9" y="9" width="6" height="6" rx="1" opacity="0.3" />
  </svg>
)

// Sub-tabs for the Layout section
const subTabs = [
  { id: 'structure', name: 'Structure', Icon: StructureIcon },
  { id: 'placement', name: 'Placement', Icon: PlacementIcon },
  { id: 'overlay', name: 'Overlay', Icon: OverlayIcon },
  { id: 'spacing', name: 'Spacing', Icon: SpacingIcon },
  { id: 'presets', name: 'Presets', Icon: PresetsIcon },
]

// SVG Preview Icon Component for presets
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
          if (props.fill === '#d1d5db') props.fill = 'rgba(255,255,255,0.25)'
        }
        return <Element key={i} {...props} />
      })}
    </svg>
  )
}

const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

// Contextual tips for overlay settings
function getOverlayTip(type, opacity) {
  if (!type) return null

  const isLowOpacity = opacity <= 40
  const isMidOpacity = opacity > 40 && opacity <= 60
  const isHighOpacity = opacity > 60

  switch (type) {
    case 'solid':
      if (isLowOpacity) {
        return 'Subtle brand tint—keeps image details visible while adding color cohesion.'
      } else if (isMidOpacity) {
        return 'Balanced tint—good for text legibility while showing the image.'
      } else {
        return 'Strong tint dominates the image. Consider a gradient if you want partial visibility.'
      }
    case 'gradient-down':
      if (isLowOpacity) {
        return 'Soft top fade—adds subtle depth for top-placed text.'
      } else {
        return 'Top-to-bottom fade creates a natural "scrim" for headlines at the top.'
      }
    case 'gradient-up':
      if (isLowOpacity) {
        return 'Soft bottom fade—mimics natural shadow for bottom text.'
      } else {
        return 'Bottom fade creates a professional scrim—great for captions and CTAs.'
      }
    case 'vignette':
      if (isLowOpacity) {
        return 'Subtle vignette draws the eye to center content without being obvious.'
      } else if (isMidOpacity) {
        return 'Classic vignette effect—frames your content like professional photography.'
      } else {
        return 'Dramatic framing—creates strong focus but may obscure edge details.'
      }
    default:
      return null
  }
}

// Tip display component
function OverlayTip({ type, opacity }) {
  const tip = getOverlayTip(type, opacity)
  if (!tip) return null

  return (
    <div className="flex items-start gap-1.5 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded text-[10px] text-blue-700 dark:text-blue-300">
      <span className="flex-shrink-0 mt-0.5">💡</span>
      <span>{tip}</span>
    </div>
  )
}

// Helper to count total cells in structure
function getTotalCells(structure) {
  if (!structure) return 1
  return structure.reduce((sum, section) => sum + (section.subdivisions || 1), 0)
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
        subIndex
      })
      cellIndex++
    }
  })

  return cells
}

// Unified grid component for all cell selection needs
// Supports: structure editing (with section labels), image placement, text element placement, overlay/spacing selection
function UnifiedCellGrid({
  layout,
  imageCell,
  selectedCell = null,
  mode = 'cell', // 'cell' | 'image' | 'structure' | 'textGroup'
  onSelectCell,
  onSelectSection, // Only used when mode='structure'
  structureSelection, // Only used when mode='structure': { type: 'section', index } | { type: 'cell', cellIndex, sectionIndex, subIndex } | null
  highlightCell = null, // For text group mode - which cell this element is assigned to
  textCells = {}, // For showing text element assignments
  aspectRatio = 1,
  size = 'normal', // 'normal' | 'large' | 'small'
}) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  // Normalize structure - treat fullbleed as single-cell grid
  const normalizedStructure = (isFullbleed || !structure || structure.length === 0)
    ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
    : structure
  const showSectionLabels = mode === 'structure' && !isFullbleed && normalizedStructure.length > 1

  // Get cells that have text elements assigned (for visual feedback)
  const textElementCells = useMemo(() => {
    const cellMap = {}
    textElementDefs.forEach(element => {
      const cell = textCells?.[element.id]
      if (cell !== null && cell !== undefined) {
        if (!cellMap[cell]) cellMap[cell] = []
        cellMap[cell].push(element.label.substring(0, 4)) // Short label
      }
    })
    return cellMap
  }, [textCells])

  // Size configurations
  const sizeConfig = {
    small: { width: 60, height: 40 },
    normal: { maxWidth: 180, minHeight: 100 },
    large: { maxWidth: 280, minHeight: 160 },
  }
  const config = sizeConfig[size] || sizeConfig.normal

  // Dynamic aspect ratio style - small uses fixed dimensions, others use flexible
  const containerStyle = size === 'small'
    ? {
        width: `${config.width}px`,
        height: `${config.height}px`,
        flexShrink: 0,
      }
    : {
        aspectRatio: aspectRatio,
        maxWidth: `${config.maxWidth}px`,
        minHeight: `${config.minHeight}px`,
        width: '100%',
      }

  // Render cell content based on mode
  const getCellContent = (cellIndex, isImage, isSelected, isSectionSelected, subdivisions, subSize) => {
    let bgClass, textClass, content

    if (mode === 'image') {
      bgClass = isImage
        ? 'bg-blue-500 hover:bg-blue-600'
        : 'bg-gray-200 hover:bg-gray-300'
      textClass = isImage ? 'text-white' : 'text-gray-500'
      content = isImage ? '📷' : cellIndex + 1
    } else if (mode === 'structure') {
      if (isSelected) {
        bgClass = 'bg-blue-500 hover:bg-blue-600'
        textClass = 'text-white'
      } else if (isSectionSelected) {
        bgClass = 'bg-blue-200 hover:bg-blue-300'
        textClass = 'text-blue-700'
      } else if (isImage) {
        bgClass = 'bg-blue-400 hover:bg-blue-500'
        textClass = 'text-white'
      } else {
        bgClass = 'bg-gray-100 hover:bg-gray-200'
        textClass = 'text-gray-500'
      }
      content = isImage ? '📷' : (subdivisions > 1 ? `${Math.round(subSize)}%` : '')
    } else if (mode === 'textGroup') {
      const isHighlighted = highlightCell === cellIndex
      if (isHighlighted) {
        bgClass = 'bg-blue-500 hover:bg-blue-600'
        textClass = 'text-white'
        content = '✓'
      } else if (isImage) {
        bgClass = 'bg-blue-400 hover:bg-blue-500'
        textClass = 'text-white'
        content = '📷'
      } else {
        bgClass = 'bg-gray-200 hover:bg-gray-300'
        textClass = 'text-gray-500'
        content = cellIndex + 1
      }
    } else {
      // Default 'cell' mode (for overlay, spacing, etc.)
      const assignedGroups = textElementCells[cellIndex]
      if (isSelected) {
        bgClass = 'bg-blue-500 hover:bg-blue-600'
        textClass = 'text-white'
        content = '✓'
      } else if (isImage) {
        bgClass = 'bg-blue-400 hover:bg-blue-500'
        textClass = 'text-white'
        content = '📷'
      } else if (assignedGroups) {
        bgClass = 'bg-blue-100 hover:bg-blue-200'
        textClass = 'text-blue-700'
        content = assignedGroups.join(', ')
      } else {
        bgClass = 'bg-gray-200 hover:bg-gray-300'
        textClass = 'text-gray-500'
        content = cellIndex + 1
      }
    }

    return { bgClass, textClass, content }
  }

  let cellIndex = 0

  // Render grid cells
  const renderCells = () => (
    <div
      className={`flex-1 ${showSectionLabels ? 'rounded-r' : 'rounded'} overflow-hidden border border-gray-300 flex h-full ${isRows || isFullbleed ? 'flex-col' : 'flex-row'}`}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || (100 / normalizedStructure.length)
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)
        const isSectionSelected = mode === 'structure' && structureSelection?.type === 'section' && structureSelection.index === sectionIndex

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isImage = currentCellIndex === imageCell
          const isCellSelected = mode === 'structure'
            ? structureSelection?.type === 'cell' && structureSelection.cellIndex === currentCellIndex
            : selectedCell === currentCellIndex
          cellIndex++

          const { bgClass, textClass, content } = getCellContent(
            currentCellIndex, isImage, isCellSelected, isSectionSelected, subdivisions, subSizes[subIndex]
          )

          sectionCells.push(
            <div
              key={`cell-${currentCellIndex}`}
              className={`relative cursor-pointer transition-colors min-h-[20px] ${bgClass} ${
                mode === 'structure' && subdivisions > 1 ? 'border border-gray-200' : ''
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
              <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium ${textClass}`}>
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

  // Render section labels (only for structure mode with multiple sections)
  const renderSectionLabels = () => {
    if (!showSectionLabels) return null

    return (
      <div className={`flex ${isRows ? 'flex-col w-8' : 'flex-row h-6'} shrink-0`}>
        {normalizedStructure.map((section, sectionIndex) => {
          const sectionSize = section.size || (100 / normalizedStructure.length)
          const isSelected = structureSelection?.type === 'section' && structureSelection.index === sectionIndex
          return (
            <div
              key={`label-${sectionIndex}`}
              className={`flex items-center justify-center cursor-pointer text-[10px] font-medium transition-colors ${
                isRows ? 'rounded-l' : 'rounded-t'
              } ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
    <div
      className={`flex ${showSectionLabels ? (isRows ? 'flex-row' : 'flex-col') : ''}`}
      style={containerStyle}
    >
      {renderSectionLabels()}
      {renderCells()}
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

export default function LayoutSelector({
  layout,
  onLayoutChange,
  textCells = {},
  onTextCellsChange,
  text = {},
  onTextChange,
  imageAspectRatio,
  platform,
  overlay,
  theme,
  padding = { global: 5, cellOverrides: {} },
  onPaddingChange,
  onApplyLayoutPreset,
}) {
  const { type = 'fullbleed', structure = [], imageCell = 0, textAlign, textVerticalAlign, cellAlignments = [], cellOverlays = {} } = layout

  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState('structure')
  // Preset category filter
  const [presetCategory, setPresetCategory] = useState('all')
  // Cell selection state for alignment/placement tabs (null = all cells)
  const [selectedCell, setSelectedCell] = useState(null)
  // Structure selection state: { type: 'section', index } | { type: 'cell', cellIndex, sectionIndex, subIndex } | null
  const [structureSelection, setStructureSelection] = useState(null)

  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

  // Calculate platform aspect ratio for cell selector
  const platformAspectRatio = useMemo(() => {
    const p = platforms.find(pl => pl.id === platform) || platforms[0]
    return p.width / p.height
  }, [platform])

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
    const newSize = 100 / (structure.length + 1)
    // Create new objects to avoid mutating history
    const newStructure = structure.map(s => ({ ...s, size: newSize }))
    newStructure.push({ size: newSize, subdivisions: 1, subSizes: [100] })
    onLayoutChange({ structure: newStructure })
  }

  // Remove a section
  const removeSection = (index) => {
    if (structure.length <= 1) return
    const newSize = 100 / (structure.length - 1)
    // Create new objects to avoid mutating history
    const newStructure = structure
      .filter((_, i) => i !== index)
      .map(s => ({ ...s, size: newSize }))
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

  // Reset to default
  const handleReset = () => {
    onLayoutChange(defaultState.layout)
    if (onTextCellsChange) {
      onTextCellsChange(defaultState.textCells)
    }
    setSelectedCell(null)
  }

  // Get filtered presets based on category
  const filteredPresets = useMemo(() => {
    if (presetCategory === 'all') return layoutPresets
    if (presetCategory === 'suggested') {
      const suggestedIds = getSuggestedLayouts(imageAspectRatio, platform)
      return layoutPresets.filter(p => suggestedIds.includes(p.id))
    }
    return getPresetsByCategory(presetCategory)
  }, [presetCategory, imageAspectRatio, platform])

  // Render sub-tab content
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'presets':
        return (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setPresetCategory('all')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                  presetCategory === 'all'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPresetCategory('suggested')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                  presetCategory === 'suggested'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Suggested
              </button>
              {presetCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setPresetCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                    presetCategory === cat.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Preset Grid */}
            <div className="grid grid-cols-3 gap-2">
              {filteredPresets.map((preset) => {
                const isActive = layout.type === preset.layout.type &&
                  layout.imageCell === preset.layout.imageCell &&
                  JSON.stringify(layout.structure) === JSON.stringify(preset.layout.structure)
                return (
                  <button
                    key={preset.id}
                    onClick={() => onApplyLayoutPreset?.(preset)}
                    className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                      isActive
                        ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    title={preset.description}
                  >
                    <PresetIcon presetId={preset.id} isActive={isActive} />
                    <span className="text-xs font-medium leading-tight text-center">
                      {preset.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {filteredPresets.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">
                No presets match the current filter
              </p>
            )}
          </div>
        )

      case 'structure':
        // Get info about current selection
        const selectedSection = structureSelection?.type === 'section' ? structure[structureSelection.index] : null
        const selectedSectionIndex = structureSelection?.type === 'section' ? structureSelection.index : null
        const selectedCellInfo = structureSelection?.type === 'cell' ? structureSelection : null
        const selectedCellSection = selectedCellInfo ? structure[selectedCellInfo.sectionIndex] : null

        return (
          <div className="space-y-4">
            {/* Layout Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Layout Type</label>
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
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-base">{lt.icon}</span>
                    <span>{lt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Structure Grid - same for all layout types */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-600 text-center">
                Select Cell <span className="text-gray-400 font-normal">(to configure structure)</span>
              </label>
              <div className="flex justify-center">
                <UnifiedCellGrid
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
                    const normalizedStructure = (!structure || structure.length === 0)
                      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
                      : structure
                    const section = normalizedStructure[sectionIndex]
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
              {/* Selection indicator */}
              <div className="text-sm text-center py-2 bg-gray-50 rounded-lg">
                {structureSelection === null ? (
                  <span className="text-gray-600">
                    {type === 'fullbleed' ? 'Single cell layout' : `Select a ${type === 'rows' ? 'row' : 'column'} or cell to edit`}
                  </span>
                ) : structureSelection.type === 'section' ? (
                  <span className="text-blue-600">
                    Editing: <strong>{type === 'rows' || type === 'fullbleed' ? `Row ${structureSelection.index + 1}` : `Column ${structureSelection.index + 1}`}</strong>
                  </span>
                ) : (
                  <span className="text-blue-600">
                    Editing: <strong>Cell {structureSelection.cellIndex + 1}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Selection Controls */}
            {type !== 'fullbleed' && structureSelection === null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{structure.length} {type === 'rows' ? 'rows' : 'columns'}</span>
                <button
                  onClick={addSection}
                  disabled={structure.length >= 4}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                    structure.length >= 4
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                  }`}
                >
                  + Add {type === 'rows' ? 'Row' : 'Column'}
                </button>
              </div>
            )}

            {/* Section editing controls */}
            {type !== 'fullbleed' && structureSelection?.type === 'section' && selectedSection && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">
                    {type === 'rows' ? `Row ${selectedSectionIndex + 1}` : `Column ${selectedSectionIndex + 1}`}
                  </span>
                  <button
                    onClick={() => setStructureSelection(null)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                  >
                    ✕ Deselect
                  </button>
                </div>

                {/* Section size (height for rows, width for columns) */}
                {structure.length > 1 && (
                  <div>
                    <label className="block text-xs text-blue-600 mb-2 font-medium">
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
                      <span className="text-sm text-blue-700 w-12 text-right font-medium">{Math.round(selectedSection.size)}%</span>
                    </div>
                  </div>
                )}

                {/* Subdivisions */}
                <div>
                  <label className="block text-xs text-blue-600 mb-2 font-medium">
                    Split into {type === 'rows' ? 'columns' : 'rows'}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeSubdivision(selectedSectionIndex)}
                      disabled={(selectedSection.subdivisions || 1) <= 1}
                      className={`w-9 h-9 text-base rounded-lg font-medium ${
                        (selectedSection.subdivisions || 1) <= 1
                          ? 'bg-blue-100 text-blue-300 cursor-not-allowed'
                          : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
                      }`}
                    >
                      −
                    </button>
                    <span className="text-base font-semibold text-blue-700 w-8 text-center">
                      {selectedSection.subdivisions || 1}
                    </span>
                    <button
                      onClick={() => addSubdivision(selectedSectionIndex)}
                      disabled={(selectedSection.subdivisions || 1) >= 3}
                      className={`w-9 h-9 text-base rounded-lg font-medium ${
                        (selectedSection.subdivisions || 1) >= 3
                          ? 'bg-blue-100 text-blue-300 cursor-not-allowed'
                          : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
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
                    className="w-full px-3 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium"
                  >
                    Delete {type === 'rows' ? 'Row' : 'Column'}
                  </button>
                )}
              </div>
            )}

            {/* Cell editing controls (subdivision size) */}
            {type !== 'fullbleed' && structureSelection?.type === 'cell' && selectedCellInfo && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">
                    {type === 'rows'
                      ? `Row ${selectedCellInfo.sectionIndex + 1}, Column ${selectedCellInfo.subIndex + 1}`
                      : `Column ${selectedCellInfo.sectionIndex + 1}, Row ${selectedCellInfo.subIndex + 1}`
                    }
                  </span>
                  <button
                    onClick={() => setStructureSelection(null)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                  >
                    ✕ Deselect
                  </button>
                </div>

                {/* Cell size (width for cells in rows, height for cells in columns) */}
                <div>
                  <label className="block text-xs text-blue-600 mb-2 font-medium">
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
                    <span className="text-sm text-blue-700 w-12 text-right font-medium">
                      {Math.round(selectedCellSection?.subSizes?.[selectedCellInfo.subIndex] || 50)}%
                    </span>
                  </div>
                </div>

                {/* Quick link to edit parent section */}
                <button
                  onClick={() => setStructureSelection({ type: 'section', index: selectedCellInfo.sectionIndex })}
                  className="w-full px-3 py-2 text-sm bg-blue-200 text-blue-700 hover:bg-blue-300 rounded-lg font-medium"
                >
                  Edit Parent {type === 'rows' ? 'Row' : 'Column'}
                </button>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={() => {
                handleReset()
                setStructureSelection(null)
              }}
              className="w-full px-3 py-2.5 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
            >
              Reset to Default
            </button>
          </div>
        )

      case 'placement':
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
            // Update global alignment
            onLayoutChange({ [prop]: value })
          } else {
            // Update per-cell alignment
            const newAlignments = [...(cellAlignments || [])]
            while (newAlignments.length <= cellIndex) {
              newAlignments.push({ textAlign: null, textVerticalAlign: null })
            }
            newAlignments[cellIndex] = { ...newAlignments[cellIndex], [prop]: value }
            onLayoutChange({ cellAlignments: newAlignments })
          }
        }

        return (
          <div className="space-y-4">
            {/* Cell Alignment Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-600 text-center">
                Cell Alignment <span className="text-gray-400 font-normal">(select cell or set global)</span>
              </label>
              <div className="flex justify-center">
                <UnifiedCellGrid
                  layout={layout}
                  imageCell={imageCell}
                  selectedCell={selectedCell}
                  mode="cell"
                  onSelectCell={handleCellSelect}
                  aspectRatio={platformAspectRatio}
                  size="large"
                />
              </div>
              <div className="text-sm text-center py-2 bg-gray-50 rounded-lg">
                {selectedCell === null ? (
                  <span className="text-gray-600">Global alignment (all cells)</span>
                ) : (
                  <span className="text-blue-600">
                    Cell {selectedCell + 1} alignment
                    {selectedCell === imageCell && <span className="text-blue-500 ml-1">(image)</span>}
                  </span>
                )}
              </div>

              {/* Alignment Controls */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-xs text-gray-500 block mb-1.5">Horizontal</span>
                  <div className="flex gap-1.5">
                    {textAlignOptions.map((align) => {
                      const isActive = getAlignmentForCell(selectedCell, 'textAlign') === align.id
                      return (
                        <button
                          key={align.id}
                          onClick={() => setAlignmentForCell(selectedCell, 'textAlign', align.id)}
                          title={align.name}
                          className={`flex-1 px-2 py-2.5 rounded-lg flex items-center justify-center ${
                            isActive
                              ? 'bg-blue-500 text-white shadow-sm'
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
                  <span className="text-xs text-gray-500 block mb-1.5">Vertical</span>
                  <div className="flex gap-1.5">
                    {verticalAlignOptions.map((align) => {
                      const isActive = getAlignmentForCell(selectedCell, 'textVerticalAlign') === align.id
                      return (
                        <button
                          key={align.id}
                          onClick={() => setAlignmentForCell(selectedCell, 'textVerticalAlign', align.id)}
                          title={align.name}
                          className={`flex-1 px-2 py-2.5 rounded-lg flex items-center justify-center ${
                            isActive
                              ? 'bg-blue-500 text-white shadow-sm'
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

            {/* Image Cell Assignment */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 py-2">
                <span className="text-sm font-medium text-gray-600 w-24">📷 Image</span>
                <UnifiedCellGrid
                  layout={layout}
                  imageCell={imageCell}
                  mode="image"
                  onSelectCell={(idx) => onLayoutChange({ imageCell: idx })}
                  aspectRatio={platformAspectRatio}
                  size="small"
                />
                <span className="text-xs text-gray-500">Cell {imageCell + 1}</span>
              </div>
            </div>

            {/* Text Elements - cell assignment + visibility + alignment + color */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <label className="block text-sm font-medium text-gray-600">Text Elements</label>
              {textElementDefs.map((element) => {
                const currentCell = textCells?.[element.id]
                const textData = text?.[element.id] || {}
                const isVisible = textData.visible !== false
                const colorValue = textData.color || 'secondary'
                const elementAlign = textData.textAlign // null = use cell default

                return (
                  <div key={element.id} className="space-y-1.5 pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                    {/* Row 1: Toggle + Label + Cell */}
                    <div className="flex items-center gap-2">
                      {/* Visibility Toggle */}
                      <button
                        onClick={() => onTextChange?.(element.id, { visible: !isVisible })}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
                          isVisible
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        title={isVisible ? 'Visible - click to hide' : 'Hidden - click to show'}
                      >
                        {isVisible ? '✓' : '○'}
                      </button>

                      {/* Label */}
                      <span className={`text-sm flex-1 min-w-0 ${isVisible ? 'text-gray-700' : 'text-gray-400'}`}>
                        {element.label}
                      </span>

                      {/* Cell Selector */}
                      <UnifiedCellGrid
                        layout={layout}
                        imageCell={imageCell}
                        mode="textGroup"
                        highlightCell={currentCell}
                        onSelectCell={(idx) => onTextCellsChange?.({ [element.id]: idx })}
                        aspectRatio={platformAspectRatio}
                        size="small"
                      />

                      {/* Cell Label */}
                      <span className="text-xs text-gray-500 w-10 shrink-0 text-right">
                        {currentCell !== null ? `Cell ${currentCell + 1}` : 'Auto'}
                      </span>

                      {/* Reset Cell */}
                      {currentCell !== null && (
                        <button
                          onClick={() => onTextCellsChange?.({ [element.id]: null })}
                          className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
                          title="Reset to auto"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Row 2: Horizontal Alignment */}
                    <div className="flex gap-1 items-center pl-8">
                      <span className="text-[10px] text-gray-400 mr-1">Align:</span>
                      {textAlignOptions.map((align) => {
                        const isActive = elementAlign === align.id
                        const isDefault = elementAlign === null && align.id === 'center' // Show center as "default" indicator
                        return (
                          <button
                            key={align.id}
                            onClick={() => onTextChange?.(element.id, { textAlign: align.id })}
                            title={`${align.name}${isDefault ? ' (cell default)' : ''}`}
                            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                              isActive
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <align.Icon />
                          </button>
                        )
                      })}
                      {/* Reset to cell default */}
                      {elementAlign !== null && (
                        <button
                          onClick={() => onTextChange?.(element.id, { textAlign: null })}
                          className="text-[10px] text-gray-400 hover:text-gray-600 ml-1"
                          title="Use cell default alignment"
                        >
                          ×
                        </button>
                      )}
                      {elementAlign === null && (
                        <span className="text-[10px] text-gray-400 ml-1">(cell)</span>
                      )}
                    </div>

                    {/* Row 3: Color Picker */}
                    <div className="flex gap-1 items-center flex-wrap pl-8">
                      <span className="text-[10px] text-gray-400 mr-0.5">Color:</span>
                      {/* Theme colors */}
                      {themeColorOptions.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => onTextChange?.(element.id, { color: color.id })}
                          className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                            colorValue === color.id ? 'ring-2 ring-blue-400 ring-offset-1 border-transparent' : 'border-gray-200 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: theme?.[color.id] || '#666' }}
                          title={color.name}
                        />
                      ))}
                      {/* Separator */}
                      <span className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                      {/* Neutral colors */}
                      {neutralColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => onTextChange?.(element.id, { color: color.id })}
                          className={`w-4 h-4 rounded-full border transition-transform hover:scale-110 ${
                            colorValue === color.id ? 'ring-2 ring-blue-400 ring-offset-1 border-transparent' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
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
            {/* Cell Selector Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600 text-center">
                Select Cell <span className="text-gray-400 font-normal">(to configure overlay)</span>
              </label>
              <div className="flex justify-center">
                <UnifiedCellGrid
                  layout={layout}
                  imageCell={imageCell}
                  selectedCell={selectedCell}
                  mode="cell"
                  onSelectCell={handleCellSelect}
                  aspectRatio={platformAspectRatio}
                  size="large"
                />
              </div>
            </div>

            {/* Selection indicator */}
            <div className="text-xs text-center py-1 bg-gray-50 rounded">
              {selectedCell === null ? (
                <span className="text-gray-600">Select a cell to configure its overlay</span>
              ) : (
                <span className="text-blue-600">
                  Editing: <strong>Cell {selectedCell + 1}</strong>
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
                            <div className="space-y-1.5">
                              <label className="block text-xs font-medium text-gray-600">Color</label>
                              {/* Theme colors */}
                              <div className="flex gap-1">
                                {themeColorOptions.map((c) => (
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
                              {/* Neutral colors */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-500">Neutrals:</span>
                                {neutralColors.map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() => updateCellOverlay(selectedCell, { color: c.id })}
                                    title={c.name}
                                    className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                                      getCellOverlayConfig(selectedCell)?.color === c.id
                                        ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent'
                                        : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                  />
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

                    {/* Contextual tip */}
                    {isCellOverlayEnabled(selectedCell) && (
                      <OverlayTip
                        type={getCellOverlayConfig(selectedCell)?.type || overlay?.type || 'solid'}
                        opacity={getCellOverlayConfig(selectedCell)?.opacity ?? overlay?.opacity ?? 50}
                      />
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
                        Cell {cell.index + 1}
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
                <span className="text-xs text-gray-500">{padding.global}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="4"
                value={padding.global}
                onChange={(e) => onPaddingChange?.({ global: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0px</span>
                <span>60px</span>
              </div>
            </div>

            {/* Per-cell padding */}
            <div className="pt-3 border-t border-gray-200 space-y-3">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 text-center">
                  Cell Padding <span className="text-gray-400 font-normal">(overrides global)</span>
                </label>
                <div className="flex justify-center">
                  <UnifiedCellGrid
                    layout={layout}
                    imageCell={imageCell}
                    selectedCell={selectedCell}
                    mode="cell"
                    onSelectCell={handleCellSelect}
                    aspectRatio={platformAspectRatio}
                    size="large"
                  />
                </div>
              </div>

              {/* Selected cell padding */}
              {selectedCell !== null && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Cell {selectedCell + 1}
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
                        <span className="text-xs text-gray-500">{getCellPaddingValue(selectedCell)}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        step="4"
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
                      <span className="text-gray-600">Cell {cell.index + 1}</span>
                      <span className={padding.cellOverrides?.[cell.index] !== undefined ? 'text-blue-600' : 'text-gray-400'}>
                        {getCellPaddingValue(cell.index)}px
                        {padding.cellOverrides?.[cell.index] !== undefined && ' (custom)'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">
        {subTabs.find(tab => tab.id === activeSubTab)?.name || 'Layout'}
      </h3>

      {/* Sub-tabs - icon-only navigation */}
      <div className="flex gap-1 bg-gray-100 p-1.5 rounded-xl">
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
            title={tab.name}
            className={`flex-1 px-3 py-2.5 rounded-lg transition-all flex items-center justify-center ${
              activeSubTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            <tab.Icon />
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {renderSubTabContent()}
    </div>
  )
}
