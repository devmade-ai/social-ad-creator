import { useState, useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import Tooltip from './Tooltip'
import PlatformPreview from './PlatformPreview'
import { lookPresets } from '../config/stylePresets'
import {
  layoutPresets,
  presetCategories,
  presetIcons,
  getSuggestedLayouts,
  aspectRatioCategories,
  getPresetsByAspectRatio,
} from '../config/layoutPresets'
import { presetThemes, getThemeVariant } from '../config/themes'

// Color input component for custom theme colors
const ColorInput = memo(function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
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
// Requirement: Hover preview for theme presets — shows both light and dark variant swatches.
// Approach: Stacked rows showing light variant on top, dark variant below, with labels.
//   Active variant gets a ring highlight so user knows which mode they're in.
// Why: Users need to see what both variants look like before committing to a theme.
function ThemePreviewContent({ preset, activeVariant }) {
  return (
    <div className="bg-ui-surface border border-ui-border rounded-lg shadow-lg p-2.5 min-w-[140px]">
      <p className="text-[10px] text-ui-text text-center font-medium mb-2">{preset.name}</p>
      {['light', 'dark'].map((variant) => {
        const colors = getThemeVariant(preset, variant)
        const isActive = activeVariant === variant
        return (
          <div key={variant} className={`flex items-center gap-1.5 px-1.5 py-1 rounded ${isActive ? 'bg-violet-100 dark:bg-violet-900/30' : ''}`}>
            <span className="text-[8px] text-ui-text-faint w-7 shrink-0">{variant === 'light' ? 'Light' : 'Dark'}</span>
            <div className="flex gap-1">
              <div className="w-5 h-5 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: colors.primary }} />
              <div className="w-5 h-5 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: colors.secondary }} />
              <div className="w-5 h-5 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: colors.accent }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default memo(function TemplatesTab({
  activeStylePreset,
  onSelectStylePreset,
  layout,
  onApplyLayoutPreset,
  platform,
  onPlatformChange,
  theme,
  onThemeChange,
  onThemePresetChange,
  onThemeVariantChange,
  imageAspectRatio,
}) {
  const isCustomTheme = theme?.preset === 'custom'
  const currentVariant = theme?.variant || 'dark'
  const [layoutCategory, setLayoutCategory] = useState('all')
  const [aspectRatioFilter, setAspectRatioFilter] = useState('all')

  const displayLayoutPresets = useMemo(() => {
    // First filter by aspect ratio
    let presets = aspectRatioFilter === 'all'
      ? layoutPresets
      : getPresetsByAspectRatio(aspectRatioFilter)

    // Then filter by category
    if (layoutCategory === 'suggested') {
      const suggestedIds = getSuggestedLayouts(imageAspectRatio, platform)
      presets = presets.filter((p) => suggestedIds.includes(p.id))
    } else if (layoutCategory !== 'all') {
      presets = presets.filter((p) => p.category === layoutCategory)
    }

    return presets
  }, [layoutCategory, aspectRatioFilter, platform, imageAspectRatio])

  const activeLookPreset = lookPresets.find((p) => p.id === activeStylePreset)

  // Performance: memoize active layout preset ID to avoid JSON.stringify comparison
  // on every render for every preset button. Compare structure once, store the result.
  const activeLayoutPresetId = useMemo(() => {
    for (const preset of layoutPresets) {
      if (layout.type !== preset.layout.type) continue
      const a = layout.structure
      const b = preset.layout.structure
      if (!a || !b || a.length !== b.length) continue
      let match = true
      for (let i = 0; i < a.length; i++) {
        if (a[i].size !== b[i].size || a[i].subdivisions !== b[i].subdivisions) {
          match = false
          break
        }
        const subA = a[i].subSizes || [100]
        const subB = b[i].subSizes || [100]
        if (subA.length !== subB.length || subA.some((v, j) => v !== subB[j])) {
          match = false
          break
        }
      }
      if (match) return preset.id
    }
    return null
  }, [layout.type, layout.structure])

  const isLayoutPresetActive = (preset) => preset.id === activeLayoutPresetId

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ui-text">Presets</h3>

      {/* Requirement: Platform selection as first section in Presets tab
          Why: Platform defines canvas dimensions — a foundational design decision,
            not an export-time action. Users should pick platform before layout/theme.
          Alternatives:
            - Export tab (previous): Rejected — buries a design-time decision in export flow
            - Structure tab: Rejected — Structure is for fine-tuning, not initial setup
            - Always-visible strip: Rejected — wastes permanent screen space on mobile */}
      {onPlatformChange && (
        <CollapsibleSection title="Platform" defaultExpanded={false}>
          <PlatformPreview selectedPlatform={platform} onPlatformChange={onPlatformChange} />
        </CollapsibleSection>
      )}

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
            <p className="text-sm text-ui-text-subtle text-center py-4">No layouts match — try a different shape or category</p>
          )}

          <p className="text-[10px] text-ui-text-subtle text-center">
            Layout presets change structure without affecting colors or fonts
          </p>
        </div>
      </CollapsibleSection>

      {/* Theme Presets */}
      <CollapsibleSection title="Themes" defaultExpanded={false}>
        {/* Requirement: Light/dark variant toggle — global control above theme grid.
            Approach: Single toggle affects which variant colors are shown on all presets
              and which variant is applied when selecting a theme. When toggled, re-applies
              the current theme in the new variant so the canvas updates immediately.
            Why: Non-technical users understand "light mode / dark mode" as a global concept.
              Per-theme toggles would be overwhelming and unclear.
            Alternatives:
              - Per-theme toggle: Rejected — too many controls, confusing for non-tech users.
              - Separate light/dark sections: Rejected — doubles visual clutter. */}
        <div className="space-y-3">
          {/* Variant Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ui-text-muted">Mode</label>
            <div className="flex bg-ui-surface-inset rounded-lg p-0.5">
              <button
                onClick={() => onThemeVariantChange?.('light')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  currentVariant === 'light'
                    ? 'bg-white dark:bg-zinc-700 text-ui-text shadow-sm'
                    : 'text-ui-text-muted hover:text-ui-text'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                Light
              </button>
              <button
                onClick={() => onThemeVariantChange?.('dark')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  currentVariant === 'dark'
                    ? 'bg-white dark:bg-zinc-700 text-ui-text shadow-sm'
                    : 'text-ui-text-muted hover:text-ui-text'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark
              </button>
            </div>
          </div>

          {/* Preset Themes */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-ui-text-muted">Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presetThemes.map((preset) => {
                const variantColors = getThemeVariant(preset, currentVariant)
                return (
                  <Tooltip
                    key={preset.id}
                    content={<ThemePreviewContent preset={preset} activeVariant={currentVariant} />}
                  >
                    <button
                      onClick={() => onThemePresetChange?.(preset.id, currentVariant)}
                      className={`w-full p-2 rounded-lg border-2 transition-all ${
                        theme?.preset === preset.id
                          ? 'border-primary bg-violet-50 dark:bg-violet-900/20 ring-2 ring-primary/20'
                          : 'border-ui-border hover:border-ui-border-strong hover:bg-ui-surface-elevated'
                      }`}
                    >
                      <div className="flex gap-1 mb-1.5 justify-center">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: variantColors.primary }} />
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: variantColors.secondary }} />
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: variantColors.accent }} />
                      </div>
                      <span className="text-[10px] text-ui-text font-medium">{preset.name}</span>
                    </button>
                  </Tooltip>
                )
              })}
            </div>
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
