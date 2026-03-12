import { useState, useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import Tooltip from './Tooltip'
import { lookPresets } from '../config/stylePresets'
import {
  layoutPresets,
  presetCategories,
  presetIcons,
  getSuggestedLayouts,
  aspectRatioCategories,
  getPresetsByAspectRatio,
} from '../config/layoutPresets'
import { presetThemes } from '../config/themes'

// Color input component for custom theme colors
const ColorInput = memo(function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-2 border-ui-border shadow-sm"
      />
      <div className="flex-1">
        <label className="text-xs text-ui-text-subtle mb-0.5 block">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm text-ui-text font-mono border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle"
        />
      </div>
    </div>
  )
})

// Simple look preview swatch
function LookSwatch({ preset, isActive, theme }) {
  const { style } = preset.preview
  const imageFilters = preset.imageFilters
  const overlay = preset.layouts?.['hero']?.imageOverlay

  // Use theme colors for the swatch
  const primaryColor = theme?.primary || '#3b82f6'
  const secondaryColor = theme?.secondary || '#ffffff'

  // Determine background based on filters
  const isGrayscale = imageFilters?.grayscale > 50
  const isSepia = imageFilters?.sepia > 15

  let bgStyle = {}
  if (isGrayscale) {
    bgStyle = { background: 'linear-gradient(135deg, #374151, #6b7280)' }
  } else if (isSepia) {
    bgStyle = { background: 'linear-gradient(135deg, #92400e, #d97706)' }
  } else {
    bgStyle = { background: `linear-gradient(135deg, ${primaryColor}88, ${primaryColor})` }
  }

  // Overlay indicator
  const overlayOpacity = overlay?.opacity || 0
  const hasStrongOverlay = overlayOpacity > 40

  return (
    <div
      className={`w-10 h-7 rounded overflow-hidden border-2 transition-all relative ${
        isActive ? 'border-primary ring-2 ring-violet-300' : 'border-ui-border-strong'
      }`}
      style={bgStyle}
    >
      {/* Overlay indicator */}
      {hasStrongOverlay && (
        <div
          className="absolute inset-0"
          style={{
            background: overlay?.type?.includes('gradient-up')
              ? `linear-gradient(to top, ${primaryColor}${Math.round(overlayOpacity * 2.55).toString(16).padStart(2, '0')}, transparent)`
              : overlay?.type?.includes('gradient-down')
              ? `linear-gradient(to bottom, ${primaryColor}${Math.round(overlayOpacity * 2.55).toString(16).padStart(2, '0')}, transparent)`
              : overlay?.type === 'vignette'
              ? `radial-gradient(circle, transparent 30%, ${primaryColor}${Math.round(overlayOpacity * 2.55).toString(16).padStart(2, '0')})`
              : 'transparent'
          }}
        />
      )}
      {/* Text indicator */}
      <div className="absolute inset-0 flex items-end justify-center pb-0.5">
        <div className="w-4 h-0.5 rounded" style={{ backgroundColor: secondaryColor }} />
      </div>
    </div>
  )
}

// SVG Preview Icon Component for layout presets
function LayoutPresetIcon({ presetId, isActive }) {
  const iconData = presetIcons[presetId]
  if (!iconData) return <span className="text-base">?</span>

  return (
    <svg viewBox={iconData.viewBox} className="w-10 h-7" style={{ display: 'block' }}>
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

// Requirement: Hover preview for theme presets — shows enlarged color swatches before applying.
// Approach: Portal-based Tooltip component showing the three colors with labels.
//   Portal prevents clipping when themes are in first row or at sidebar edges.
// Why: Users (non-technical) can't tell what "Ocean" or "Sunset" means from tiny swatches.
//   Canva shows hover previews for templates; we adapt this for color themes.
// Alternatives:
//   - Live preview on canvas: Rejected — too expensive, causes flickering.
//   - Name-only tooltip: Rejected — colors are visual, text names aren't enough.
//   - Inline absolute tooltip: Rejected — clips at container overflow boundaries.
function ThemePreviewContent({ preset }) {
  return (
    <div className="bg-ui-surface border border-ui-border rounded-lg shadow-lg p-2.5 min-w-[120px]">
      <div className="flex gap-2 mb-1.5 justify-center">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-7 h-7 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: preset.primary }} />
          <span className="text-[8px] text-ui-text-faint">Primary</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-7 h-7 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: preset.secondary }} />
          <span className="text-[8px] text-ui-text-faint">Secondary</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-7 h-7 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: preset.accent }} />
          <span className="text-[8px] text-ui-text-faint">Accent</span>
        </div>
      </div>
      <p className="text-[10px] text-ui-text text-center font-medium">{preset.name}</p>
    </div>
  )
}

export default memo(function TemplatesTab({
  activeStylePreset,
  onSelectStylePreset,
  layout,
  onApplyLayoutPreset,
  platform,
  theme,
  onThemeChange,
  onThemePresetChange,
}) {
  const isCustomTheme = theme?.preset === 'custom'
  const [layoutCategory, setLayoutCategory] = useState('all')
  const [aspectRatioFilter, setAspectRatioFilter] = useState('all')

  const displayLayoutPresets = useMemo(() => {
    // First filter by aspect ratio
    let presets = aspectRatioFilter === 'all'
      ? layoutPresets
      : getPresetsByAspectRatio(aspectRatioFilter)

    // Then filter by category
    if (layoutCategory === 'suggested') {
      const suggestedIds = getSuggestedLayouts(null, platform)
      presets = presets.filter((p) => suggestedIds.includes(p.id))
    } else if (layoutCategory !== 'all') {
      presets = presets.filter((p) => p.category === layoutCategory)
    }

    return presets
  }, [layoutCategory, aspectRatioFilter, platform])

  const activeLookPreset = lookPresets.find((p) => p.id === activeStylePreset)

  // Check if a layout preset matches current layout (structure only, no imageCells)
  const isLayoutPresetActive = (preset) => {
    return (
      layout.type === preset.layout.type &&
      JSON.stringify(layout.structure) === JSON.stringify(preset.layout.structure)
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ui-text">Presets</h3>

      {/* Layout Presets - Structure only (shown first) */}
      <CollapsibleSection title="Layout" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Aspect Ratio Filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-ui-text-subtle uppercase tracking-wide">Shape</label>
            <div className="flex gap-1">
              {aspectRatioCategories.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatioFilter(ar.id)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    aspectRatioFilter === ar.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                  }`}
                >
                  {ar.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category pills */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-ui-text-subtle uppercase tracking-wide">Category</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setLayoutCategory('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                  layoutCategory === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLayoutCategory('suggested')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                  layoutCategory === 'suggested'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                }`}
              >
                Suggested
              </button>
              {presetCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLayoutCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                    layoutCategory === cat.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Layout preset grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {displayLayoutPresets.map((preset) => {
              const isActive = isLayoutPresetActive(preset)
              return (
                <button
                  key={preset.id}
                  onClick={() => onApplyLayoutPreset?.(preset)}
                  className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-ui-border bg-ui-surface hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30'
                  }`}
                  title={preset.description}
                >
                  <LayoutPresetIcon presetId={preset.id} isActive={isActive} />
                  <span className={`text-[10px] font-medium leading-tight text-center ${isActive ? '' : 'text-ui-text'}`}>{preset.name}</span>
                </button>
              )
            })}
          </div>

          {displayLayoutPresets.length === 0 && (
            <p className="text-sm text-ui-text-subtle text-center py-4">No layouts match the current filter</p>
          )}

          <p className="text-[10px] text-ui-text-subtle text-center">
            Layout presets change structure without affecting colors or fonts
          </p>
        </div>
      </CollapsibleSection>

      {/* Theme Presets */}
      <CollapsibleSection title="Themes" defaultExpanded={false}>
        {/* Preset Themes */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-ui-text-muted">Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presetThemes.map((preset) => (
              <Tooltip
                key={preset.id}
                content={<ThemePreviewContent preset={preset} />}
              >
                <button
                  onClick={() => onThemePresetChange?.(preset.id)}
                  className={`w-full p-2 rounded-lg border-2 transition-all ${
                    theme?.preset === preset.id
                      ? 'border-primary bg-violet-50 dark:bg-violet-900/20 ring-2 ring-primary/20'
                      : 'border-ui-border hover:border-ui-border-strong hover:bg-ui-surface-elevated'
                  }`}
                >
                  <div className="flex gap-1 mb-1.5 justify-center">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.primary }} />
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.secondary }} />
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.accent }} />
                  </div>
                  <span className="text-[10px] text-ui-text font-medium">{preset.name}</span>
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-2 pt-3 border-t border-ui-border-subtle">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ui-text-muted">Custom Colors</label>
            {!isCustomTheme && <span className="text-[10px] text-ui-text-faint">(Edit to customize)</span>}
          </div>
          <div className="space-y-2">
            <ColorInput
              label="Primary"
              value={theme?.primary || '#000000'}
              onChange={(value) => onThemeChange?.({ preset: 'custom', primary: value })}
            />
            <ColorInput
              label="Secondary"
              value={theme?.secondary || '#ffffff'}
              onChange={(value) => onThemeChange?.({ preset: 'custom', secondary: value })}
            />
            <ColorInput
              label="Accent"
              value={theme?.accent || '#888888'}
              onChange={(value) => onThemeChange?.({ preset: 'custom', accent: value })}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Looks - Visual effects presets */}
      <CollapsibleSection title="Looks" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Active look indicator */}
          {activeLookPreset && (
            <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <LookSwatch preset={activeLookPreset} isActive={true} theme={theme} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">{activeLookPreset.name}</p>
                <p className="text-xs text-primary dark:text-violet-400 truncate">{activeLookPreset.description}</p>
              </div>
            </div>
          )}

          {/* Look preset grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {lookPresets.map((preset) => (
              <Tooltip
                key={preset.id}
                content={
                  <div className="bg-ui-surface border border-ui-border rounded-lg shadow-lg px-2.5 py-1.5 whitespace-nowrap">
                    <p className="text-[10px] text-ui-text text-center">{preset.description}</p>
                  </div>
                }
              >
                <button
                  onClick={() => onSelectStylePreset(preset)}
                  className={`w-full flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                    activeStylePreset === preset.id
                      ? 'bg-violet-50 dark:bg-violet-900/20 ring-2 ring-primary'
                      : 'hover:bg-zinc-50 dark:hover:bg-dark-subtle'
                  }`}
                >
                  <LookSwatch preset={preset} isActive={activeStylePreset === preset.id} theme={theme} />
                  <span
                    className={`text-[10px] leading-tight text-center line-clamp-1 ${
                      activeStylePreset === preset.id
                        ? 'text-violet-700 dark:text-violet-300 font-medium'
                        : 'text-ui-text-subtle'
                    }`}
                  >
                    {preset.name}
                  </span>
                </button>
              </Tooltip>
            ))}
          </div>

          <p className="text-[10px] text-ui-text-subtle text-center">
            Looks apply color tints, fonts &amp; filters without changing layout or colors
          </p>
        </div>
      </CollapsibleSection>
    </div>
  )
})
