import { useState, useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { neutralColors } from '../config/themes'
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
      className="flex overflow-hidden border border-ui-border-strong rounded"
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
            bgClass = 'bg-ui-surface-inset hover:bg-ui-surface-hover'
            content = <span className="text-ui-text-subtle text-[10px]">{currentCellIndex + 1}</span>
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

export default memo(function StyleTab({
  theme,
  selectedFonts,
  onFontsChange,
  layout,
  onLayoutChange,
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
      <h3 className="text-sm font-semibold text-ui-text">Style</h3>

      {/* Typography Section */}
      <CollapsibleSection title="Typography" defaultExpanded={false}>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-ui-text-muted">Title Font</label>
            <select
              value={selectedFonts.title}
              onChange={(e) => onFontsChange({ title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle dark:text-zinc-100"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-ui-text-muted">Body Font</label>
            <select
              value={selectedFonts.body}
              onChange={(e) => onFontsChange({ body: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle dark:text-zinc-100"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="p-3 bg-ui-surface-elevated rounded-lg">
            <p className="text-[10px] text-ui-text-subtle mb-1">Preview:</p>
            <p
              className="text-lg font-bold text-ui-text"
              style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.title)?.family }}
            >
              Title Text
            </p>
            <p
              className="text-sm text-ui-text-muted mt-0.5"
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
            <label className="text-xs font-medium text-ui-text-muted">Select Cell</label>
            <MiniCellGrid
              layout={layout}
              cellImages={cellImages}
              selectedCell={selectedOverlayCell}
              onSelectCell={(idx) => setSelectedOverlayCell(selectedOverlayCell === idx ? null : idx)}
              platform={platform}
            />
          </div>

          {/* Selection indicator */}
          <div className="text-xs text-center py-1.5 bg-ui-surface-elevated rounded">
            {selectedOverlayCell === null ? (
              <span className="text-ui-text-subtle">Select a cell to configure overlay</span>
            ) : (
              <span className="text-primary dark:text-violet-400">
                Editing: <strong>Cell {selectedOverlayCell + 1}</strong>
                {cellHasImage(selectedOverlayCell) && <span className="text-violet-400 ml-1">(image)</span>}
              </span>
            )}
          </div>

          {/* Cell Overlay Controls */}
          {selectedOverlayCell !== null && (
            <div className="space-y-3 p-3 bg-ui-surface-elevated rounded-lg">
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
                  className="text-xs font-medium text-ui-text-muted"
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
                            type: 'solid',
                            color: 'primary',
                            opacity: 50,
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
                      className="text-xs text-ui-text-subtle"
                    >
                      Custom settings
                    </label>
                  </div>

                  {/* Custom overlay settings */}
                  {getCellOverlayConfig(selectedOverlayCell)?.type !== undefined && (
                    <div className="space-y-3 pt-2 border-t border-ui-border">
                      {/* Type - organized by category */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-ui-text-muted">Type</label>
                        {/* Basic & Linear */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-ui-text-faint uppercase tracking-wide">Basic & Gradients</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'basic' || t.category === 'linear').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-primary text-white'
                                    : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                          <span className="text-[9px] text-ui-text-faint uppercase tracking-wide">Radial</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'radial').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-primary text-white'
                                    : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                          <span className="text-[9px] text-ui-text-faint uppercase tracking-wide">Effects</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'effect' || t.category === 'texture').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-primary text-white'
                                    : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                          <span className="text-[9px] text-ui-text-faint uppercase tracking-wide">Blend Modes</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypes.filter(t => t.category === 'blend').map((t) => (
                              <button
                                key={t.id}
                                onClick={() => updateCellOverlay(selectedOverlayCell, { type: t.id })}
                                className={`px-1.5 py-1 text-[9px] rounded truncate ${
                                  getCellOverlayConfig(selectedOverlayCell)?.type === t.id
                                    ? 'bg-primary text-white'
                                    : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                        <label className="block text-xs font-medium text-ui-text-muted">Color</label>
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
                          <span className="text-[10px] text-ui-text-subtle">Neutrals:</span>
                          {neutralColors.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => updateCellOverlay(selectedOverlayCell, { color: c.id })}
                              title={c.name}
                              className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                                getCellOverlayConfig(selectedOverlayCell)?.color === c.id
                                  ? 'ring-2 ring-primary ring-offset-1 border-transparent'
                                  : 'border-ui-border-strong'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-xs font-medium text-ui-text-muted">Opacity</label>
                          <span className="text-xs text-ui-text-subtle">
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
                          className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Reset */}
              <button
                onClick={() => updateCellOverlay(selectedOverlayCell, null)}
                className="w-full px-2 py-1.5 text-xs bg-zinc-200 dark:bg-dark-subtle text-ui-text-muted hover:bg-zinc-300 dark:hover:bg-dark-elevated rounded"
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
                  className="flex items-center justify-between px-2 py-1.5 bg-ui-surface-elevated rounded text-xs"
                >
                  <span className="text-ui-text-subtle">
                    Cell {cell.index + 1}
                    {cellHasImage(cell.index) && <span className="text-primary ml-1">(img)</span>}
                  </span>
                  <span className={isCellOverlayEnabled(cell.index) ? 'text-green-600 dark:text-green-400' : 'text-ui-text-faint'}>
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
              <label className="text-xs font-medium text-ui-text-muted">Global Padding</label>
              <span className="text-xs text-ui-text-subtle">{padding.global}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={padding.global}
              onChange={(e) => onPaddingChange?.({ global: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Outer Frame - right after global padding since it's also a global setting */}
          <div className="space-y-2 p-3 bg-ui-surface-elevated rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ui-text-muted">Outer Frame</span>
              <span className="text-[10px] text-ui-text-faint">
                % of padding as border
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs text-ui-text-subtle">Frame %</label>
                <span className="text-xs text-ui-text-subtle">
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
                className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {(frame.outer?.percent || 0) > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs text-ui-text-subtle">Color</label>
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
                  <span className="text-[10px] text-ui-text-subtle">Neutrals:</span>
                  {neutralColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onFrameChange?.({ outer: { ...frame.outer, color: c.id } })}
                      title={c.name}
                      className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                        frame.outer?.color === c.id
                          ? 'ring-2 ring-primary ring-offset-1 border-transparent'
                          : 'border-ui-border-strong'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Per-cell settings */}
          <div className="pt-3 border-t border-ui-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-ui-text-muted">Per-Cell Settings</label>
              <MiniCellGrid
                layout={layout}
                cellImages={cellImages}
                selectedCell={selectedSpacingCell}
                onSelectCell={(idx) => setSelectedSpacingCell(selectedSpacingCell === idx ? null : idx)}
                platform={platform}
              />
            </div>

            {/* Selected cell settings */}
            {selectedSpacingCell !== null && (
              <div className="space-y-3 p-3 bg-ui-surface-elevated rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ui-text-muted">
                    Cell {selectedSpacingCell + 1}
                  </span>
                  <button
                    onClick={() => setSelectedSpacingCell(null)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    ✕ Deselect
                  </button>
                </div>

                {/* Custom padding */}
                <div className="space-y-2">
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
                      className="text-xs text-ui-text-subtle"
                    >
                      Custom padding
                    </label>
                  </div>

                  {padding.cellOverrides?.[selectedSpacingCell] !== undefined && (
                    <div className="space-y-1 pl-6">
                      <div className="flex justify-between">
                        <label className="text-xs text-ui-text-subtle">Padding</label>
                        <span className="text-xs text-ui-text-subtle">
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
                        className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Custom frame */}
                <div className="space-y-2 pt-2 border-t border-ui-border">
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
                      className="text-xs text-ui-text-subtle"
                    >
                      Custom frame
                    </label>
                  </div>

                  {frame.cellFrames?.[selectedSpacingCell] !== undefined && (
                    <div className="space-y-2 pl-6">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-xs text-ui-text-subtle">Frame %</label>
                          <span className="text-xs text-ui-text-subtle">
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
                          className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-ui-text-subtle">Color</label>
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overview when no cell selected */}
            {selectedSpacingCell === null && (
              <div className="space-y-1">
                {cellInfoList.map((cell) => (
                  <div
                    key={cell.index}
                    className="flex items-center justify-between px-2 py-1.5 bg-ui-surface-elevated rounded text-xs"
                  >
                    <span className="text-ui-text-subtle">Cell {cell.index + 1}</span>
                    <span className="text-ui-text-faint">
                      {getCellPaddingValue(cell.index)}px
                      {padding.cellOverrides?.[cell.index] !== undefined && (
                        <span className="text-primary dark:text-violet-400"> (custom)</span>
                      )}
                      {frame.cellFrames?.[cell.index] !== undefined && (
                        <span className="text-primary dark:text-violet-400"> +frame</span>
                      )}
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
