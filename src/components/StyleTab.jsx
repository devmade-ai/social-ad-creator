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
function MiniCellGrid({ layout, cellImages = {}, selectedCell, onSelectCell, platform }) {
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
      className="flex overflow-hidden border border-zinc-300 dark:border-zinc-600 rounded"
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
          const hasImage = !!cellImages[currentCellIndex]
          const isSelected = selectedCell === currentCellIndex
          cellIndex++

          let bgClass, content
          if (isSelected) {
            bgClass = 'bg-primary hover:bg-primary-hover'
            content = <span className="text-white text-[10px]">✓</span>
          } else if (hasImage) {
            bgClass = 'bg-violet-200 dark:bg-violet-800 hover:bg-violet-300 dark:hover:bg-violet-700'
            content = <span className="text-violet-700 dark:text-violet-200 text-[10px]">📷</span>
          } else {
            bgClass = 'bg-zinc-200 dark:bg-dark-subtle hover:bg-zinc-300 dark:hover:bg-dark-elevated'
            content = <span className="text-zinc-500 dark:text-zinc-400 text-[10px]">{currentCellIndex + 1}</span>
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
        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-200 dark:border-zinc-600 shadow-sm"
      />
      <div className="flex-1">
        <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 block">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm font-mono border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle dark:text-zinc-100"
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
  frame = { outer: { percent: 0, color: 'primary' }, cellFrames: {} },
  onFrameChange,
  cellImages = {},
}) {
  const { cellOverlays = {} } = layout
  const [selectedOverlayCell, setSelectedOverlayCell] = useState(null)
  const [selectedSpacingCell, setSelectedSpacingCell] = useState(null)

  // Determine which cells have images
  const cellHasImage = (cellIndex) => !!cellImages[cellIndex]

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
      return cellHasImage(cellIndex)
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
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Style</h3>

      {/* Themes Section */}
      <CollapsibleSection title="Themes" defaultExpanded={false}>
        {/* Preset Themes */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {presetThemes.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onPresetChange(preset.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  theme.preset === preset.id
                    ? 'border-primary bg-violet-50 dark:bg-violet-900/20 ring-2 ring-primary/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-dark-subtle'
                }`}
              >
                <div className="flex gap-1 mb-1.5 justify-center">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.accent }} />
                </div>
                <span className="text-[10px] text-zinc-700 dark:text-zinc-300 font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Custom Colors</label>
            {!isCustomTheme && <span className="text-[10px] text-zinc-400">(Edit to customize)</span>}
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
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">Title Font</label>
            <select
              value={selectedFonts.title}
              onChange={(e) => onFontsChange({ title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle dark:text-zinc-100"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">Body Font</label>
            <select
              value={selectedFonts.body}
              onChange={(e) => onFontsChange({ body: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle dark:text-zinc-100"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="p-3 bg-zinc-50 dark:bg-dark-subtle rounded-lg">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">Preview:</p>
            <p
              className="text-lg font-bold text-zinc-800 dark:text-zinc-100"
              style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.title)?.family }}
            >
              Title Text
            </p>
            <p
              className="text-sm text-zinc-600 dark:text-zinc-300 mt-0.5"
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
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Select Cell</label>
            <MiniCellGrid
              layout={layout}
              cellImages={cellImages}
              selectedCell={selectedOverlayCell}
              onSelectCell={(idx) => setSelectedOverlayCell(selectedOverlayCell === idx ? null : idx)}
              platform={platform}
            />
          </div>

          {/* Selection indicator */}
          <div className="text-xs text-center py-1.5 bg-zinc-50 dark:bg-dark-subtle rounded">
            {selectedOverlayCell === null ? (
              <span className="text-zinc-500 dark:text-zinc-400">Select a cell to configure overlay</span>
            ) : (
              <span className="text-primary dark:text-violet-400">
                Editing: <strong>Cell {selectedOverlayCell + 1}</strong>
                {cellHasImage(selectedOverlayCell) && <span className="text-violet-400 ml-1">(image)</span>}
              </span>
            )}
          </div>

          {/* Cell Overlay Controls */}
          {selectedOverlayCell !== null && (
            <div className="space-y-3 p-3 bg-zinc-50 dark:bg-dark-subtle rounded-lg">
              {/* Enable/Disable */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`overlay-enabled-${selectedOverlayCell}`}
                  checked={isCellOverlayEnabled(selectedOverlayCell)}
                  onChange={(e) => updateCellOverlay(selectedOverlayCell, { enabled: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-zinc-300 focus:ring-primary"
                />
                <label
                  htmlFor={`overlay-enabled-${selectedOverlayCell}`}
                  className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
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
                      className="w-4 h-4 text-primary rounded border-zinc-300 focus:ring-primary"
                    />
                    <label
                      htmlFor={`overlay-custom-${selectedOverlayCell}`}
                      className="text-xs text-zinc-600 dark:text-zinc-400"
                    >
                      Custom settings
                    </label>
                  </div>

                  {/* Custom overlay settings */}
                  {getCellOverlayConfig(selectedOverlayCell)?.type !== undefined && (
                    <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      {/* Type - organized by category */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">Type</label>
                        {/* Basic & Linear */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Basic & Gradients</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'basic' || t.category === 'linear').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-primary text-white'
                                    : 'bg-zinc-200 dark:bg-dark-subtle text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-dark-elevated'
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
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Radial</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'radial').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-primary text-white'
                                    : 'bg-zinc-200 dark:bg-dark-subtle text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-dark-elevated'
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
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Effects</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'effect' || t.category === 'texture').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-primary text-white'
                                    : 'bg-zinc-200 dark:bg-dark-subtle text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-dark-elevated'
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
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Blend Modes</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'blend').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-primary text-white'
                                    : 'bg-zinc-200 dark:bg-dark-subtle text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-dark-elevated'
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
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">Color</label>
                        <div className="flex gap-1">
                          {themeColorOptions.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => updateCellOverlay(selectedOverlayCell, { color: c.id })}
                              className={`flex-1 px-2 py-1.5 text-[10px] rounded ${
                                getCellOverlayConfig(selectedOverlayCell)?.color === c.id
                                  ? 'ring-2 ring-primary ring-offset-1'
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
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Neutrals:</span>
                          {neutralColors.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => updateCellOverlay(selectedOverlayCell, { color: c.id })}
                              title={c.name}
                              className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                                getCellOverlayConfig(selectedOverlayCell)?.color === c.id
                                  ? 'ring-2 ring-primary ring-offset-1 border-transparent'
                                  : 'border-zinc-300 dark:border-zinc-600'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Opacity</label>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
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
                          className="w-full h-2 bg-zinc-200 dark:bg-dark-subtle rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Reset */}
              <button
                onClick={() => updateCellOverlay(selectedOverlayCell, null)}
                className="w-full px-2 py-1.5 text-xs bg-zinc-200 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-dark-elevated rounded"
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
                  className="flex items-center justify-between px-2 py-1.5 bg-zinc-50 dark:bg-dark-subtle rounded text-xs"
                >
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Cell {cell.index + 1}
                    {cellHasImage(cell.index) && <span className="text-primary ml-1">(img)</span>}
                  </span>
                  <span className={isCellOverlayEnabled(cell.index) ? 'text-green-600' : 'text-zinc-400'}>
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
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Global Padding</label>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{padding.global}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={padding.global}
              onChange={(e) => onPaddingChange?.({ global: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-zinc-200 dark:bg-dark-subtle rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Per-cell padding */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Cell Padding</label>
              <MiniCellGrid
                layout={layout}
                cellImages={cellImages}
                selectedCell={selectedSpacingCell}
                onSelectCell={(idx) => setSelectedSpacingCell(selectedSpacingCell === idx ? null : idx)}
                platform={platform}
              />
            </div>

            {/* Selected cell padding */}
            {selectedSpacingCell !== null && (
              <div className="space-y-2 p-3 bg-zinc-50 dark:bg-dark-subtle rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Cell {selectedSpacingCell + 1}
                  </span>
                  <button
                    onClick={() => setSelectedSpacingCell(null)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
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
                    className="w-4 h-4 text-primary rounded border-zinc-300 focus:ring-primary"
                  />
                  <label
                    htmlFor={`padding-custom-${selectedSpacingCell}`}
                    className="text-xs text-zinc-600 dark:text-zinc-400"
                  >
                    Custom padding
                  </label>
                </div>

                {padding.cellOverrides?.[selectedSpacingCell] !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs text-zinc-600 dark:text-zinc-400">Padding</label>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
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
                      className="w-full h-2 bg-zinc-200 dark:bg-dark-subtle rounded-lg appearance-none cursor-pointer"
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
                    className="flex items-center justify-between px-2 py-1.5 bg-zinc-50 dark:bg-dark-subtle rounded text-xs"
                  >
                    <span className="text-zinc-600 dark:text-zinc-400">Cell {cell.index + 1}</span>
                    <span
                      className={
                        padding.cellOverrides?.[cell.index] !== undefined
                          ? 'text-primary dark:text-violet-400'
                          : 'text-zinc-400'
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

          {/* Frame Section */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Frame (Border)</label>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Frame uses a percentage of padding as a colored border
            </p>

            {/* Outer Frame */}
            <div className="space-y-2 p-3 bg-zinc-50 dark:bg-dark-subtle rounded-lg">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Outer Frame</span>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs text-zinc-600 dark:text-zinc-400">Frame %</label>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {frame.outer?.percent || 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={frame.outer?.percent || 0}
                  onChange={(e) => onFrameChange?.({ outer: { ...frame.outer, percent: parseInt(e.target.value, 10) } })}
                  className="w-full h-2 bg-zinc-200 dark:bg-dark-subtle rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {(frame.outer?.percent || 0) > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-600 dark:text-zinc-400">Color</label>
                  <div className="flex gap-1">
                    {themeColorOptions.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onFrameChange?.({ outer: { ...frame.outer, color: c.id } })}
                        className={`flex-1 px-2 py-1.5 text-[10px] rounded ${
                          frame.outer?.color === c.id
                            ? 'ring-2 ring-primary ring-offset-1'
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Neutrals:</span>
                    {neutralColors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onFrameChange?.({ outer: { ...frame.outer, color: c.id } })}
                        title={c.name}
                        className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                          frame.outer?.color === c.id
                            ? 'ring-2 ring-primary ring-offset-1 border-transparent'
                            : 'border-zinc-300 dark:border-zinc-600'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Per-cell frame - only show when a cell is selected in spacing */}
            {selectedSpacingCell !== null && (
              <div className="space-y-2 p-3 bg-zinc-50 dark:bg-dark-subtle rounded-lg">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Cell {selectedSpacingCell + 1} Frame
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`frame-custom-${selectedSpacingCell}`}
                    checked={frame.cellFrames?.[selectedSpacingCell] !== undefined}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newCellFrames = { ...frame.cellFrames, [selectedSpacingCell]: { percent: 50, color: 'primary' } }
                        onFrameChange?.({ cellFrames: newCellFrames })
                      } else {
                        const newCellFrames = { ...frame.cellFrames }
                        delete newCellFrames[selectedSpacingCell]
                        onFrameChange?.({ cellFrames: newCellFrames })
                      }
                    }}
                    className="w-4 h-4 text-primary rounded border-zinc-300 focus:ring-primary"
                  />
                  <label
                    htmlFor={`frame-custom-${selectedSpacingCell}`}
                    className="text-xs text-zinc-600 dark:text-zinc-400"
                  >
                    Custom cell frame
                  </label>
                </div>

                {frame.cellFrames?.[selectedSpacingCell] !== undefined && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs text-zinc-600 dark:text-zinc-400">Frame %</label>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {frame.cellFrames[selectedSpacingCell]?.percent || 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={frame.cellFrames[selectedSpacingCell]?.percent || 0}
                        onChange={(e) => {
                          const newCellFrames = {
                            ...frame.cellFrames,
                            [selectedSpacingCell]: {
                              ...frame.cellFrames[selectedSpacingCell],
                              percent: parseInt(e.target.value, 10),
                            },
                          }
                          onFrameChange?.({ cellFrames: newCellFrames })
                        }}
                        className="w-full h-2 bg-zinc-200 dark:bg-dark-subtle rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-600 dark:text-zinc-400">Color</label>
                      <div className="flex gap-1">
                        {themeColorOptions.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              const newCellFrames = {
                                ...frame.cellFrames,
                                [selectedSpacingCell]: {
                                  ...frame.cellFrames[selectedSpacingCell],
                                  color: c.id,
                                },
                              }
                              onFrameChange?.({ cellFrames: newCellFrames })
                            }}
                            className={`flex-1 px-2 py-1.5 text-[10px] rounded ${
                              frame.cellFrames[selectedSpacingCell]?.color === c.id
                                ? 'ring-2 ring-primary ring-offset-1'
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
})
