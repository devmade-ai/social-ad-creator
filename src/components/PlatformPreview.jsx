import { memo, useMemo, useState } from 'react'
import { platforms } from '../config/platforms'
import CollapsibleSection from './CollapsibleSection'

// Category labels for display
const categoryLabels = {
  social: 'Social Media',
  web: 'Website',
  banner: 'Banners',
  email: 'Email',
  print: 'Print',
  other: 'Other',
}

export default memo(function PlatformPreview({ selectedPlatform, onPlatformChange }) {
  const platform = platforms.find((p) => p.id === selectedPlatform) || platforms[0]
  const [expandedCategories, setExpandedCategories] = useState({})

  // Group platforms by category
  const groupedPlatforms = useMemo(() => {
    const groups = {}
    platforms.forEach((p) => {
      const cat = p.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(p)
    })
    return groups
  }, [])

  // Order of categories to display
  const categoryOrder = ['social', 'web', 'banner', 'email', 'print', 'other']

  // Get which category the selected platform belongs to
  const selectedCategory = platform.category || 'other'

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const isCategoryExpanded = (category) => {
    // Default: all categories collapsed for less overwhelming initial load
    if (expandedCategories[category] !== undefined) {
      return expandedCategories[category]
    }
    return false
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ui-text">Platform</h3>
        <span className="text-sm text-ui-text-subtle font-medium">
          {platform.name} ({platform.width} × {platform.height})
        </span>
      </div>

      <CollapsibleSection title="Select Platform" defaultExpanded={false}>
        <div className="space-y-1">
          {categoryOrder.map((category) => {
            const categoryPlatforms = groupedPlatforms[category]
            if (!categoryPlatforms || categoryPlatforms.length === 0) return null

            const isExpanded = isCategoryExpanded(category)
            const hasSelectedPlatform = categoryPlatforms.some((p) => p.id === selectedPlatform)

            return (
              <div key={category} className="space-y-1">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between py-1 hover:bg-ui-surface-elevated rounded transition-colors"
                >
                  <span className="text-[10px] text-ui-text-faint uppercase tracking-wide font-medium flex items-center gap-1">
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {categoryLabels[category] || category}
                  </span>
                  {hasSelectedPlatform && !isExpanded && (
                    <span className="text-[10px] text-primary font-medium">{platform.name}</span>
                  )}
                </button>
                {isExpanded && (
                  <div className="flex flex-wrap gap-1 pl-4">
                    {categoryPlatforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onPlatformChange(p.id)}
                        title={`${p.width} × ${p.height}`}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                          selectedPlatform === p.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-ui-surface-inset text-ui-text hover:bg-ui-surface-hover'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CollapsibleSection>
    </div>
  )
})
