// Requirement: Typography, per-cell overlay, and spacing/frame controls.
// Approach: Three collapsible sections. Overlay stacks on top of per-image overlay (Media tab)
//   giving users two independent overlay layers. Spacing section combines global padding,
//   per-cell padding overrides, outer frame, and per-cell frames.
// Alternatives:
//   - Merge overlay with Media tab: Rejected - cell overlay is independent of image overlay;
//     users need both layers for effects like tinted text areas over clear image areas.
//   - Separate frame tab: Rejected - frames are visual spacing; grouping with padding is intuitive.
import { useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import ThemeColorPicker from './ThemeColorPicker'
import MiniCellGrid from './MiniCellGrid'
import { countCells } from '../utils/cellUtils'
import { fonts } from '../config/fonts'
import { overlayTypesByCategory } from '../config/layouts'

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
  selectedCell: selectedCellProp = 0,
  onSelectCell,
}) {
  const { cellOverlays = {} } = layout

  // Clamp selectedCell to valid range when layout shrinks
  const totalCells = useMemo(() => countCells(layout.structure), [layout.structure])
  const clampedCell = selectedCellProp >= totalCells ? 0 : selectedCellProp

  // Use global selectedCell for both overlay and spacing
  const selectedOverlayCell = clampedCell
  const setSelectedOverlayCell = onSelectCell || (() => {})
  const selectedSpacingCell = clampedCell
  const setSelectedSpacingCell = onSelectCell || (() => {})

  // Determine which cells have images
  const cellHasImage = (cellIndex) => !!cellImages[cellIndex]

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
      <CollapsibleSection title="Fonts" defaultExpanded={false}>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-ui-text-muted">Title Font</label>
            <select
              value={selectedFonts.title}
              onChange={(e) => onFontsChange({ title: e.target.value })}
              className="w-full px-3 py-2 text-sm text-ui-text border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle"
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
              className="w-full px-3 py-2 text-sm text-ui-text border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle"
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
      <CollapsibleSection title="Color Tint" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Cell indicator */}
          <div className="text-xs text-center py-1.5 bg-ui-surface-elevated rounded">
            <span className="text-primary dark:text-violet-400">
              Cell {selectedOverlayCell + 1}
              {cellHasImage(selectedOverlayCell) && <span className="text-violet-400 ml-1">(image)</span>}
            </span>
          </div>

          {/* Cell Overlay Controls */}
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
                  Enable Color Tint
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
                            {overlayTypesByCategory.basicAndLinear.map((t) => (
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
                          <span className="text-[9px] text-ui-text-faint uppercase tracking-wide">Circular</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypesByCategory.radial.map((t) => (
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
                            {overlayTypesByCategory.effectAndTexture.map((t) => (
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
                          <span className="text-[9px] text-ui-text-faint uppercase tracking-wide">Blending</span>
                          <div className="grid grid-cols-3 gap-1">
                            {overlayTypesByCategory.blend.map((t) => (
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
                        <ThemeColorPicker
                          value={getCellOverlayConfig(selectedOverlayCell)?.color}
                          onChange={(id) => updateCellOverlay(selectedOverlayCell, { color: id })}
                          theme={theme}
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-xs font-medium text-ui-text-muted">Transparency</label>
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
        </div>
      </CollapsibleSection>

      {/* Spacing Section */}
      <CollapsibleSection title="Spacing" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Global Padding */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-ui-text-muted">Overall Spacing</label>
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
                % of spacing used as border
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs text-ui-text-subtle">Border %</label>
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
                <ThemeColorPicker
                  value={frame.outer?.color}
                  onChange={(id) => onFrameChange?.({ outer: { ...frame.outer, color: id } })}
                  theme={theme}
                />
              </div>
            )}
          </div>

          {/* Per-cell settings */}
          <div className="pt-3 border-t border-ui-border-subtle space-y-3">
            <div className="text-xs text-center py-1.5 bg-ui-surface-elevated rounded">
              <span className="text-primary dark:text-violet-400">
                Cell {selectedSpacingCell + 1}
              </span>
            </div>

            <div className="space-y-3 p-3 bg-ui-surface-elevated rounded-lg">

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
                      Custom spacing
                    </label>
                  </div>

                  {padding.cellOverrides?.[selectedSpacingCell] !== undefined && (
                    <div className="space-y-1 pl-6">
                      <div className="flex justify-between">
                        <label className="text-xs text-ui-text-subtle">Spacing</label>
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
                          <label className="text-xs text-ui-text-subtle">Border %</label>
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
                        <ThemeColorPicker
                          value={frame.cellFrames[selectedSpacingCell]?.color}
                          onChange={(id) => {
                            const newCellFrames = {
                              ...frame.cellFrames,
                              [selectedSpacingCell]: {
                                ...frame.cellFrames[selectedSpacingCell],
                                color: id,
                              },
                            }
                            onFrameChange?.({ cellFrames: newCellFrames })
                          }}
                          theme={theme}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </CollapsibleSection>
    </div>
  )
})
