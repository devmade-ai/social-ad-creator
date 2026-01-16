import { useState, useMemo } from 'react'
import { stylePresets, styleCategories, getStylePresetsByCategory } from '../config/stylePresets'

// Preview swatch component
function PresetSwatch({ preset, isActive }) {
  const { bg, accent, style } = preset.preview

  return (
    <div
      className={`w-10 h-7 rounded overflow-hidden border-2 transition-all ${
        isActive ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'
      }`}
      style={{ backgroundColor: bg }}
    >
      {/* Visual representation of the style */}
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
          <div className="w-1/2 bg-gray-300" />
          <div className="w-1/2 flex flex-col justify-center gap-0.5 pl-0.5">
            <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />
            <div className="h-0.5 w-2/3 bg-gray-500 opacity-50" />
          </div>
        </div>
      )}
      {style === 'serif' && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-[8px] font-serif text-gray-800 opacity-80">Aa</div>
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
            <div className="flex-1 border-b border-gray-300" />
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

export default function StylePresetSelector({ activePresetId, onSelectPreset }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [isExpanded, setIsExpanded] = useState(true)

  const displayPresets = useMemo(() => {
    return getStylePresetsByCategory(activeCategory)
  }, [activeCategory])

  // Find active preset for display
  const activePreset = stylePresets.find(p => p.id === activePresetId)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-card">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-xl transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Style Presets</h3>
          {activePreset && (
            <span className="px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full font-medium">
              {activePreset.name}
            </span>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {styleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Preset grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {displayPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                title={`${preset.name}: ${preset.description}`}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                  activePresetId === preset.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <PresetSwatch preset={preset} isActive={activePresetId === preset.id} />
                <span className={`text-[10px] leading-tight text-center line-clamp-1 ${
                  activePresetId === preset.id ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          {/* Active preset description */}
          {activePreset && (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-100 dark:border-gray-800">
              {activePreset.description}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
