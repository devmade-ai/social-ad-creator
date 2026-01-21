import { useState, useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { presetThemes, neutralColors } from '../config/themes'
import { fonts } from '../config/fonts'
import { overlayTypes } from '../config/layouts'
import { platforms } from '../config/platforms'

// Theme color options for overlay
const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

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

// Mini cell grid for overlay/spacing selection
function MiniCellGrid({ layout, imageCell, selectedCell, onSelectCell, platform }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure =
    isFullbleed || !structure || structure.length === 0
      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
      : structure

  // Calculate aspect ratio
  const platformData = platforms.find((p) => p.id === platform) || platforms[0]
  const aspectRatio = platformData.width / platformData.height

  let cellIndex = 0

  return (
    <div
      className="flex overflow-hidden border border-gray-300 dark:border-gray-600 rounded"
      style={{
        width: '120px',
        height: `${120 / aspectRatio}px`,
        flexDirection: isRows || isFullbleed ? 'column' : 'row',
      }}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isImage = currentCellIndex === imageCell
          const isSelected = selectedCell === currentCellIndex
          cellIndex++

          let bgClass, content
          if (isSelected) {
            bgClass = 'bg-blue-500 hover:bg-blue-600'
            content = <span className="text-white text-[10px]">✓</span>
          } else if (isImage) {
            bgClass = 'bg-blue-400 hover:bg-blue-500'
            content = <span className="text-white text-[10px]">📷</span>
          } else {
            bgClass = 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            content = <span className="text-gray-500 dark:text-gray-400 text-[10px]">{currentCellIndex + 1}</span>
          }

          sectionCells.push(
            <div
              key={`cell-${currentCellIndex}`}
              className={`relative cursor-pointer transition-colors min-h-[16px] ${bgClass} flex items-center justify-center`}
              style={{ flex: `1 1 ${subSizes[subIndex]}%` }}
              onClick={() => onSelectCell(currentCellIndex)}
            >
              {content}
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
}

// Color input component for custom theme colors
const ColorInput = memo(function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600 shadow-sm"
      />
      <div className="flex-1">
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 block">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm font-mono border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
    </div>
  )
})

export default memo(function StyleTab({
  theme,
  onThemeChange,
  onPresetChange,
  selectedFonts,
  onFontsChange,
  layout,
  onLayoutChange,
  overlay,
  platform,
  padding = { global: 5, cellOverrides: {} },
  onPaddingChange,
}) {
  const { imageCell = 0, cellOverlays = {} } = layout
  const [selectedOverlayCell, setSelectedOverlayCell] = useState(null)
  const [selectedSpacingCell, setSelectedSpacingCell] = useState(null)

  const isCustomTheme = theme.preset === 'custom'
  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

  // Overlay helpers
  const getCellOverlayConfig = (cellIndex) => {
    return cellOverlays[cellIndex] || null
  }

  const updateCellOverlay = (cellIndex, updates) => {
    const newCellOverlays = { ...cellOverlays }
    if (updates === null) {
      delete newCellOverlays[cellIndex]
    } else {
      newCellOverlays[cellIndex] = { ...(cellOverlays[cellIndex] || {}), ...updates }
    }
    onLayoutChange({ cellOverlays: newCellOverlays })
  }

  const isCellOverlayEnabled = (cellIndex) => {
    const config = cellOverlays[cellIndex]
    if (config === undefined) {
      return cellIndex === imageCell
    }
    return config.enabled !== false
  }

  // Spacing helpers
  const getCellPaddingValue = (cellIndex) => {
    return padding.cellOverrides?.[cellIndex] ?? padding.global
  }

  const updateCellPadding = (cellIndex, value) => {
    if (value === null || value === padding.global) {
      const newOverrides = { ...padding.cellOverrides }
      delete newOverrides[cellIndex]
      onPaddingChange?.({ cellOverrides: newOverrides })
    } else {
      onPaddingChange?.({ cellOverrides: { ...padding.cellOverrides, [cellIndex]: value } })
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Style</h3>

      {/* Themes Section */}
      <CollapsibleSection title="Themes" defaultExpanded={false}>
        {/* Preset Themes */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {presetThemes.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onPresetChange(preset.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  theme.preset === preset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex gap-1 mb-1.5 justify-center">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.accent }} />
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300 font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Custom Colors</label>
            {!isCustomTheme && <span className="text-[10px] text-gray-400">(Edit to customize)</span>}
          </div>
          <div className="space-y-2">
            <ColorInput
              label="Primary"
              value={theme.primary}
              onChange={(value) => onThemeChange({ preset: 'custom', primary: value })}
            />
            <ColorInput
              label="Secondary"
              value={theme.secondary}
              onChange={(value) => onThemeChange({ preset: 'custom', secondary: value })}
            />
            <ColorInput
              label="Accent"
              value={theme.accent}
              onChange={(value) => onThemeChange({ preset: 'custom', accent: value })}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Typography Section */}
      <CollapsibleSection title="Typography" defaultExpanded={false}>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Title Font</label>
            <select
              value={selectedFonts.title}
              onChange={(e) => onFontsChange({ title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Body Font</label>
            <select
              value={selectedFonts.body}
              onChange={(e) => onFontsChange({ body: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
            <p
              className="text-lg font-bold text-gray-800 dark:text-gray-100"
              style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.title)?.family }}
            >
              Title Text
            </p>
            <p
              className="text-sm text-gray-600 dark:text-gray-300 mt-0.5"
              style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.body)?.family }}
            >
              Body text preview
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Overlay Section */}
      <CollapsibleSection title="Overlay" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Cell Selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Select Cell</label>
            <MiniCellGrid
              layout={layout}
              imageCell={imageCell}
              selectedCell={selectedOverlayCell}
              onSelectCell={(idx) => setSelectedOverlayCell(selectedOverlayCell === idx ? null : idx)}
              platform={platform}
            />
          </div>

          {/* Selection indicator */}
          <div className="text-xs text-center py-1.5 bg-gray-50 dark:bg-gray-800 rounded">
            {selectedOverlayCell === null ? (
              <span className="text-gray-500 dark:text-gray-400">Select a cell to configure overlay</span>
            ) : (
              <span className="text-blue-600 dark:text-blue-400">
                Editing: <strong>Cell {selectedOverlayCell + 1}</strong>
                {selectedOverlayCell === imageCell && <span className="text-blue-400 ml-1">(image)</span>}
              </span>
            )}
          </div>

          {/* Cell Overlay Controls */}
          {selectedOverlayCell !== null && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* Enable/Disable */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`overlay-enabled-${selectedOverlayCell}`}
                  checked={isCellOverlayEnabled(selectedOverlayCell)}
                  onChange={(e) => updateCellOverlay(selectedOverlayCell, { enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`overlay-enabled-${selectedOverlayCell}`}
                  className="text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Enable Overlay
                </label>
              </div>

              {isCellOverlayEnabled(selectedOverlayCell) && (
                <>
                  {/* Custom settings toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`overlay-custom-${selectedOverlayCell}`}
                      checked={getCellOverlayConfig(selectedOverlayCell)?.type !== undefined}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateCellOverlay(selectedOverlayCell, {
                            enabled: true,
                            type: overlay?.type || 'solid',
                            color: overlay?.color || 'primary',
                            opacity: overlay?.opacity ?? 50,
                          })
                        } else {
                          updateCellOverlay(selectedOverlayCell, {
                            enabled: true,
                            type: undefined,
                            color: undefined,
                            opacity: undefined,
                          })
                        }
                      }}
                      className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`overlay-custom-${selectedOverlayCell}`}
                      className="text-xs text-gray-600 dark:text-gray-400"
                    >
                      Custom settings
                    </label>
                  </div>

                  {/* Custom overlay settings */}
                  {getCellOverlayConfig(selectedOverlayCell)?.type !== undefined && (
                    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {/* Type - organized by category */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Type</label>
                        {/* Basic & Linear */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Basic & Gradients</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'basic' || t.category === 'linear').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                                title={t.name}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Radial */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Radial</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'radial').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                                title={t.name}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Effects */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Effects</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'effect' || t.category === 'texture').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                                title={t.name}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Blend Modes */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Blend Modes</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'blend').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                                title={t.name}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Color */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Color</label>
                        <div className="flex gap-1">
                          {themeColorOptions.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => updateCellOverlay(selectedOverlayCell, { color: c.id })}
                              className={`flex-1 px-2 py-1.5 text-[10px] rounded ${
                                getCellOverlayConfig(selectedOverlayCell)?.color === c.id
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
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">Neutrals:</span>
                          {neutralColors.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => updateCellOverlay(selectedOverlayCell, { color: c.id })}
                              title={c.name}
                              className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                                getCellOverlayConfig(selectedOverlayCell)?.color === c.id
                                  ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Opacity</label>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getCellOverlayConfig(selectedOverlayCell)?.opacity ?? 50}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={getCellOverlayConfig(selectedOverlayCell)?.opacity ?? 50}
                          onChange={(e) =>
                            updateCellOverlay(selectedOverlayCell, { opacity: parseInt(e.target.value, 10) })
                          }
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Reset */}
              <button
                onClick={() => updateCellOverlay(selectedOverlayCell, null)}
                className="w-full px-2 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              >
                Reset to Default
              </button>
            </div>
          )}

          {/* Overview when no cell selected */}
          {selectedOverlayCell === null && (
            <div className="space-y-1">
              {cellInfoList.map((cell) => (
                <div
                  key={cell.index}
                  className="flex items-center justify-between px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded text-xs"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    Cell {cell.index + 1}
                    {cell.index === imageCell && <span className="text-blue-500 ml-1">(img)</span>}
                  </span>
                  <span className={isCellOverlayEnabled(cell.index) ? 'text-green-600' : 'text-gray-400'}>
                    {isCellOverlayEnabled(cell.index) ? 'On' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Spacing Section */}
      <CollapsibleSection title="Spacing" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Global Padding */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Global Padding</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{padding.global}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={padding.global}
              onChange={(e) => onPaddingChange?.({ global: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Per-cell padding */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Cell Padding</label>
              <MiniCellGrid
                layout={layout}
                imageCell={imageCell}
                selectedCell={selectedSpacingCell}
                onSelectCell={(idx) => setSelectedSpacingCell(selectedSpacingCell === idx ? null : idx)}
                platform={platform}
              />
            </div>

            {/* Selected cell padding */}
            {selectedSpacingCell !== null && (
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Cell {selectedSpacingCell + 1}
                  </span>
                  <button
                    onClick={() => setSelectedSpacingCell(null)}
                    className="text-[10px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✕ Deselect
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`padding-custom-${selectedSpacingCell}`}
                    checked={padding.cellOverrides?.[selectedSpacingCell] !== undefined}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateCellPadding(selectedSpacingCell, padding.global)
                      } else {
                        updateCellPadding(selectedSpacingCell, null)
                      }
                    }}
                    className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`padding-custom-${selectedSpacingCell}`}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    Custom padding
                  </label>
                </div>

                {padding.cellOverrides?.[selectedSpacingCell] !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Padding</label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getCellPaddingValue(selectedSpacingCell)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={getCellPaddingValue(selectedSpacingCell)}
                      onChange={(e) => updateCellPadding(selectedSpacingCell, parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Overview when no cell selected */}
            {selectedSpacingCell === null && (
              <div className="space-y-1">
                {cellInfoList.map((cell) => (
                  <div
                    key={cell.index}
                    className="flex items-center justify-between px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded text-xs"
                  >
                    <span className="text-gray-600 dark:text-gray-400">Cell {cell.index + 1}</span>
                    <span
                      className={
                        padding.cellOverrides?.[cell.index] !== undefined
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400'
                      }
                    >
                      {getCellPaddingValue(cell.index)}px
                      {padding.cellOverrides?.[cell.index] !== undefined && ' (custom)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
})
