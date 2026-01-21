import { useState, useMemo, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { stylePresets, styleCategories, getStylePresetsByCategory } from '../config/stylePresets'
import {
  layoutPresets,
  presetCategories,
  presetIcons,
  getPresetsByCategory,
  getSuggestedLayouts,
} from '../config/layoutPresets'

// Preview swatch component for style presets
function PresetSwatch({ preset, isActive }) {
  const { bg, accent, style } = preset.preview

  return (
    <div
      className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
        isActive ? 'border-primary ring-2 ring-violet-300' : 'border-transparent'
      }`}
      style={{ backgroundColor: bg }}
    >
      {style === 'bold' && (
        <div className="w-full h-full flex flex-col justify-end p-0.5">
          <div className="h-1 w-full rounded-sm" style={{ backgroundColor: accent }} />
          <div className="h-0.5 w-3/4 mt-0.5 rounded-sm bg-white opacity-60" />
        </div>
      )}
      {style === 'neon' && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4 h-4 rounded-full opacity-80" style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }} />
        </div>
      )}
      {style === 'vibrant' && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1" />
          <div className="h-2.5" style={{ backgroundColor: accent }} />
        </div>
      )}
      {style === 'corporate' && (
        <div className="w-full h-full flex">
          <div className="w-1/2" />
          <div className="w-1/2 flex flex-col justify-center gap-0.5 pr-0.5">
            <div className="h-0.5 w-full bg-white opacity-80" />
            <div className="h-0.5 w-3/4 bg-white opacity-50" />
          </div>
        </div>
      )}
      {style === 'slate' && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 flex items-end justify-center pb-0.5">
            <div className="h-0.5 w-4 bg-white opacity-60" />
          </div>
          <div className="h-2" style={{ backgroundColor: '#f1f5f9' }} />
        </div>
      )}
      {style === 'minimal' && (
        <div className="w-full h-full flex">
          <div className="w-1/2 bg-zinc-300" />
          <div className="w-1/2 flex flex-col justify-center gap-0.5 pl-0.5">
            <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />
            <div className="h-0.5 w-2/3 bg-zinc-500 opacity-50" />
          </div>
        </div>
      )}
      {style === 'serif' && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-[8px] font-serif text-zinc-800 opacity-80">Aa</div>
        </div>
      )}
      {style === 'luxury' && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1" />
          <div className="h-3 flex items-center justify-center">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: '#d4af37' }} />
          </div>
        </div>
      )}
      {style === 'earth' && (
        <div className="w-full h-full flex">
          <div className="w-3/5" />
          <div className="w-2/5" style={{ backgroundColor: '#fef3c7' }} />
        </div>
      )}
      {style === 'forest' && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1" />
          <div className="h-3" style={{ backgroundColor: '#f0fdf4' }} />
        </div>
      )}
      {style === 'ocean' && (
        <div className="w-full h-full flex">
          <div className="w-2/5" style={{ backgroundColor: '#ecfeff' }} />
          <div className="w-3/5" />
        </div>
      )}
      {style === 'candy' && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
        </div>
      )}
      {style === 'sunset' && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1" />
          <div className="h-2.5" style={{ backgroundColor: '#fef3c7' }} />
        </div>
      )}
      {style === 'noir' && (
        <div className="w-full h-full flex flex-col justify-end p-0.5">
          <div className="h-0.5 w-full bg-white" />
          <div className="h-0.5 w-1/2 mt-0.5 bg-white opacity-50" />
        </div>
      )}
      {style === 'grid' && (
        <div className="w-full h-full flex">
          <div className="w-1/2" />
          <div className="w-1/2 flex flex-col" style={{ backgroundColor: '#f1f5f9' }}>
            <div className="flex-1 border-b border-zinc-300" />
            <div className="flex-1" />
          </div>
        </div>
      )}
      {style === 'banner' && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1" />
          <div className="h-2.5 flex" style={{ backgroundColor: '#ffffff' }}>
            <div className="w-3/5" />
            <div className="w-2/5 flex items-center justify-center">
              <div className="w-2 h-1 rounded-sm" style={{ backgroundColor: accent }} />
            </div>
          </div>
        </div>
      )}
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

export default memo(function TemplatesTab({
  activeStylePreset,
  onSelectStylePreset,
  layout,
  onApplyLayoutPreset,
  imageAspectRatio,
  platform,
}) {
  const [styleCategory, setStyleCategory] = useState('all')
  const [layoutCategory, setLayoutCategory] = useState('all')

  const displayStylePresets = useMemo(() => {
    return getStylePresetsByCategory(styleCategory)
  }, [styleCategory])

  const displayLayoutPresets = useMemo(() => {
    if (layoutCategory === 'all') return layoutPresets
    if (layoutCategory === 'suggested') {
      const suggestedIds = getSuggestedLayouts(imageAspectRatio, platform)
      return layoutPresets.filter((p) => suggestedIds.includes(p.id))
    }
    return getPresetsByCategory(layoutCategory)
  }, [layoutCategory, imageAspectRatio, platform])

  const activeStylePresetData = stylePresets.find((p) => p.id === activeStylePreset)

  // Check if a layout preset matches current layout
  const isLayoutPresetActive = (preset) => {
    return (
      layout.type === preset.layout.type &&
      layout.imageCell === preset.layout.imageCell &&
      JSON.stringify(layout.structure) === JSON.stringify(preset.layout.structure)
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Templates</h3>

      {/* Style Presets - Complete designs */}
      <CollapsibleSection title="Complete Designs" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Active preset indicator */}
          {activeStylePresetData && (
            <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <PresetSwatch preset={activeStylePresetData} isActive={true} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">{activeStylePresetData.name}</p>
                <p className="text-xs text-primary dark:text-violet-400 truncate">{activeStylePresetData.description}</p>
              </div>
            </div>
          )}

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {styleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setStyleCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  styleCategory === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Style preset grid */}
          <div className="grid grid-cols-3 gap-2">
            {displayStylePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectStylePreset(preset)}
                title={`${preset.name}: ${preset.description}`}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                  activeStylePreset === preset.id
                    ? 'bg-violet-50 dark:bg-violet-900/20 ring-2 ring-primary'
                    : 'hover:bg-zinc-50 dark:hover:bg-dark-subtle'
                }`}
              >
                <PresetSwatch preset={preset} isActive={activeStylePreset === preset.id} />
                <span
                  className={`text-[10px] leading-tight text-center line-clamp-1 ${
                    activeStylePreset === preset.id
                      ? 'text-violet-700 dark:text-violet-300 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
            Complete designs apply theme, fonts, layout, and effects
          </p>
        </div>
      </CollapsibleSection>

      {/* Layout Presets - Structure only */}
      <CollapsibleSection title="Layout Only" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setLayoutCategory('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                layoutCategory === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLayoutCategory('suggested')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                layoutCategory === 'suggested'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
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
                    : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Layout preset grid */}
          <div className="grid grid-cols-3 gap-2">
            {displayLayoutPresets.map((preset) => {
              const isActive = isLayoutPresetActive(preset)
              return (
                <button
                  key={preset.id}
                  onClick={() => onApplyLayoutPreset?.(preset)}
                  className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-dark-subtle hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30'
                  }`}
                  title={preset.description}
                >
                  <LayoutPresetIcon presetId={preset.id} isActive={isActive} />
                  <span className="text-[10px] font-medium leading-tight text-center">{preset.name}</span>
                </button>
              )
            })}
          </div>

          {displayLayoutPresets.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No layouts match the current filter</p>
          )}

          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
            Layout only presets change structure without affecting colors or fonts
          </p>
        </div>
      </CollapsibleSection>
    </div>
  )
})
