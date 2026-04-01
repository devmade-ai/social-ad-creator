// Requirement: Visual styling controls — background, overlay, frames, spacing, fonts.
// Approach: Five collapsible sections in visual-priority order. Overlay stacks on top of
//   per-image overlay (Media tab) giving users two independent overlay layers.
// Alternatives:
//   - Merge overlay with Media tab: Rejected - cell overlay is independent of image overlay;
//     users need both layers for effects like tinted text areas over clear image areas.
import { useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import ThemeColorPicker from './ThemeColorPicker'
import MiniCellGrid from './MiniCellGrid'
import { countCells } from '../utils/cellUtils'
import { fonts } from '../config/fonts'
import { overlayTypesByCategory } from '../config/layouts'

// Reusable overlay type button — extracted from 4 repeated instances
function OverlayTypeButton({ type, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-1.5 py-1 text-[9px] rounded truncate ${
        isActive
          ? 'bg-primary text-primary-content'
          : 'bg-base-200 text-base-content/70 hover:bg-base-300'
      }`}
      title={type.name}
      aria-label={`Overlay type: ${type.name}`}
    >
      {type.name}
    </button>
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
  selectedCell: selectedCellProp = 0,
  onSelectCell,
  onLoadAllFonts,
}) {
  const { cellOverlays = {} } = layout

  // Clamp selectedCell to valid range when layout shrinks
  const totalCells = useMemo(() => countCells(layout.structure), [layout.structure])
  const clampedCell = selectedCellProp >= totalCells ? 0 : selectedCellProp

  // Both overlay and spacing sections use the same global cell selection

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
      <h3 className="text-sm font-semibold text-base-content">Style</h3>

      {/* Background Section */}
      <CollapsibleSection title="Background" defaultExpanded={false}>
        <div className="space-y-3">
          <div className="text-xs text-center py-1.5 bg-base-200 rounded">
            <span className="text-primary">
              Cell {clampedCell + 1}
            </span>
          </div>

          <div className="p-3 bg-base-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`bg-custom-${clampedCell}`}
                checked={layout.cellBackgrounds?.[clampedCell] !== undefined}
                onChange={(e) => {
                  const newBgs = { ...(layout.cellBackgrounds || {}) }
                  if (e.target.checked) {
                    newBgs[clampedCell] = 'secondary'
                  } else {
                    delete newBgs[clampedCell]
                  }
                  onLayoutChange({ cellBackgrounds: newBgs })
                }}
                className="w-4 h-4 text-primary rounded border-base-300 focus:ring-primary"
              />
              <label
                htmlFor={`bg-custom-${clampedCell}`}
                className="text-xs text-base-content/60"
              >
                Override theme color
              </label>
            </div>

            {layout.cellBackgrounds?.[clampedCell] !== undefined && (
              <div className="pl-6">
                <ThemeColorPicker
                  value={layout.cellBackgrounds[clampedCell]}
                  onChange={(id) => {
                    const newBgs = { ...(layout.cellBackgrounds || {}), [clampedCell]: id }
                    onLayoutChange({ cellBackgrounds: newBgs })
                  }}
                  theme={theme}
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Overlay Section */}
      <CollapsibleSection title="Color Tint" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Cell indicator */}
          <div className="text-xs text-center py-1.5 bg-base-200 rounded">
            <span className="text-primary">
              Cell {clampedCell + 1}
              {cellHasImage(clampedCell) && <span className="text-primary ml-1">(image)</span>}
            </span>
          </div>

          {/* Cell Overlay Controls */}
          <div className="space-y-3 p-3 bg-base-200 rounded-lg">
              {/* Enable/Disable */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`overlay-enabled-${clampedCell}`}
                  checked={isCellOverlayEnabled(clampedCell)}
                  onChange={(e) => updateCellOverlay(clampedCell, { enabled: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-base-300 focus:ring-primary"
                />
                <label
                  htmlFor={`overlay-enabled-${clampedCell}`}
                  className="text-xs font-medium text-base-content/70"
                >
                  Enable Color Tint
                </label>
              </div>

              {isCellOverlayEnabled(clampedCell) && (
                <>
                  {/* Custom settings toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`overlay-custom-${clampedCell}`}
                      checked={getCellOverlayConfig(clampedCell)?.type !== undefined}
                      // Requirement: Toggle custom overlay settings on/off per cell.
                      // Approach: When disabling, keep only `enabled: true` — removing type/color/opacity
                      //   keys entirely instead of setting them to undefined.
                      // Alternatives:
                      //   - Set to undefined: Rejected — leaves keys present with undefined values,
                      //     creating confusing state that passes truthiness checks differently.
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateCellOverlay(clampedCell, {
                            enabled: true,
                            type: 'solid',
                            color: 'primary',
                            opacity: 50,
                          })
                        } else {
                          // Replace entire config with just `enabled: true` to clear custom settings
                          const newCellOverlays = { ...cellOverlays }
                          newCellOverlays[clampedCell] = { enabled: true }
                          onLayoutChange({ cellOverlays: newCellOverlays })
                        }
                      }}
                      className="w-4 h-4 text-primary rounded border-base-300 focus:ring-primary"
                    />
                    <label
                      htmlFor={`overlay-custom-${clampedCell}`}
                      className="text-xs text-base-content/60"
                    >
                      Custom settings
                    </label>
                  </div>

                  {/* Custom overlay settings */}
                  {getCellOverlayConfig(clampedCell)?.type !== undefined && (
                    <div className="space-y-3 pt-2 border-t border-base-300">
                      {/* Type - organized by category */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-base-content/70">Type</label>
                        {/* Overlay type categories */}
                        {[
                          { key: 'basicAndLinear', label: 'Basic & Gradients' },
                          { key: 'radial', label: 'Circular' },
                          { key: 'effectAndTexture', label: 'Effects' },
                          { key: 'blend', label: 'Blending' },
                        ].map(({ key, label }) => (
                          <div key={key} className="space-y-1">
                            <span className="text-[9px] text-base-content/40 uppercase tracking-wide">{label}</span>
                            <div className="grid grid-cols-3 gap-1">
                              {overlayTypesByCategory[key].map((t) => (
                                <OverlayTypeButton
                                  key={t.id}
                                  type={t}
                                  isActive={getCellOverlayConfig(clampedCell)?.type === t.id}
                                  onClick={() => updateCellOverlay(clampedCell, { type: t.id })}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Color */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-base-content/70">Color</label>
                        <ThemeColorPicker
                          value={getCellOverlayConfig(clampedCell)?.color}
                          onChange={(id) => updateCellOverlay(clampedCell, { color: id })}
                          theme={theme}
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="text-xs font-medium text-base-content/70">Transparency</label>
                          <span className="text-xs text-base-content/60">
                            {getCellOverlayConfig(clampedCell)?.opacity ?? 50}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={getCellOverlayConfig(clampedCell)?.opacity ?? 50}
                          onChange={(e) =>
                            updateCellOverlay(clampedCell, { opacity: parseInt(e.target.value, 10) })
                          }
                          className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Reset */}
              <button
                onClick={() => updateCellOverlay(clampedCell, null)}
                className="w-full px-2 py-1.5 text-xs bg-base-300 text-base-content/70 hover:bg-base-300 rounded"
              >
                Reset to Default
              </button>
            </div>
        </div>
      </CollapsibleSection>

      {/* Frames Section */}
      <CollapsibleSection title="Frames" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Outer Frame */}
          <div className="space-y-2 p-3 bg-base-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-base-content/70">Outer Frame</span>
              <span className="text-[10px] text-base-content/40">
                % of spacing used as border
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs text-base-content/60">Border %</label>
                <span className="text-xs text-base-content/60">
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
                className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {(frame.outer?.percent || 0) > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs text-base-content/60">Color</label>
                <ThemeColorPicker
                  value={frame.outer?.color}
                  onChange={(id) => onFrameChange?.({ outer: { ...frame.outer, color: id } })}
                  theme={theme}
                />
              </div>
            )}
          </div>

          {/* Per-cell frame */}
          <div className="pt-3 border-t border-base-300-subtle space-y-3">
            <div className="text-xs text-center py-1.5 bg-base-200 rounded">
              <span className="text-primary">
                Cell {clampedCell + 1}
              </span>
            </div>

            <div className="p-3 bg-base-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`frame-custom-${clampedCell}`}
                  checked={frame.cellFrames?.[clampedCell] !== undefined}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newCellFrames = { ...frame.cellFrames, [clampedCell]: { percent: 50, color: 'primary' } }
                      onFrameChange?.({ cellFrames: newCellFrames })
                    } else {
                      const newCellFrames = { ...frame.cellFrames }
                      delete newCellFrames[clampedCell]
                      onFrameChange?.({ cellFrames: newCellFrames })
                    }
                  }}
                  className="w-4 h-4 text-primary rounded border-base-300 focus:ring-primary"
                />
                <label
                  htmlFor={`frame-custom-${clampedCell}`}
                  className="text-xs text-base-content/60"
                >
                  Custom frame
                </label>
              </div>

              {frame.cellFrames?.[clampedCell] !== undefined && (
                <div className="space-y-2 pl-6">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs text-base-content/60">Border %</label>
                      <span className="text-xs text-base-content/60">
                        {frame.cellFrames[clampedCell]?.percent || 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={frame.cellFrames[clampedCell]?.percent || 0}
                      onChange={(e) => {
                        const newCellFrames = {
                          ...frame.cellFrames,
                          [clampedCell]: {
                            ...frame.cellFrames[clampedCell],
                            percent: parseInt(e.target.value, 10),
                          },
                        }
                        onFrameChange?.({ cellFrames: newCellFrames })
                      }}
                      className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-base-content/60">Color</label>
                    <ThemeColorPicker
                      value={frame.cellFrames[clampedCell]?.color}
                      onChange={(id) => {
                        const newCellFrames = {
                          ...frame.cellFrames,
                          [clampedCell]: {
                            ...frame.cellFrames[clampedCell],
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
      </CollapsibleSection>

      {/* Spacing Section */}
      <CollapsibleSection title="Spacing" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Global Padding */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-base-content/70">Overall Spacing</label>
              <span className="text-xs text-base-content/60">{padding.global}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={padding.global}
              onChange={(e) => onPaddingChange?.({ global: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Per-cell padding */}
          <div className="pt-3 border-t border-base-300-subtle space-y-3">
            <div className="text-xs text-center py-1.5 bg-base-200 rounded">
              <span className="text-primary">
                Cell {clampedCell + 1}
              </span>
            </div>

            <div className="p-3 bg-base-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`padding-custom-${clampedCell}`}
                  checked={padding.cellOverrides?.[clampedCell] !== undefined}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateCellPadding(clampedCell, padding.global)
                    } else {
                      updateCellPadding(clampedCell, null)
                    }
                  }}
                  className="w-4 h-4 text-primary rounded border-base-300 focus:ring-primary"
                />
                <label
                  htmlFor={`padding-custom-${clampedCell}`}
                  className="text-xs text-base-content/60"
                >
                  Custom spacing
                </label>
              </div>

              {padding.cellOverrides?.[clampedCell] !== undefined && (
                <div className="space-y-1 pl-6">
                  <div className="flex justify-between">
                    <label className="text-xs text-base-content/60">Spacing</label>
                    <span className="text-xs text-base-content/60">
                      {getCellPaddingValue(clampedCell)}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={getCellPaddingValue(clampedCell)}
                    onChange={(e) => updateCellPadding(clampedCell, parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Fonts Section */}
      <CollapsibleSection title="Fonts" defaultExpanded={false} onExpand={onLoadAllFonts}>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-base-content/70">Title Font</label>
            <select
              value={selectedFonts.title}
              onChange={(e) => onFontsChange({ title: e.target.value })}
              className="w-full px-3 py-2 text-sm text-base-content border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-base-100"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-base-content/70">Body Font</label>
            <select
              value={selectedFonts.body}
              onChange={(e) => onFontsChange({ body: e.target.value })}
              className="w-full px-3 py-2 text-sm text-base-content border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-base-100"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="p-3 bg-base-200 rounded-lg">
            <p className="text-[10px] text-base-content/60 mb-1">Preview:</p>
            <p
              className="text-lg font-bold text-base-content"
              style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.title)?.family }}
            >
              Title Text
            </p>
            <p
              className="text-sm text-base-content/70 mt-0.5"
              style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.body)?.family }}
            >
              Body text preview
            </p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
})
