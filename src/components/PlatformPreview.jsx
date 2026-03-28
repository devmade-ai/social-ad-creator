import { memo, useState, useEffect } from 'react'
import { categoryLabels, categoryOrder, platformGroupsByCategory, findFormat, findPlatformGroup } from '../config/platforms'
import CollapsibleSection from './CollapsibleSection'

// Requirement: Two-level platform → format selector with tips and spec info
// Approach: Category → Platform → Format nesting, with info bar below header
// Why: Scales to 50+ formats without overwhelming the user. Groups related formats
//   under their parent platform with tips visible on selection.
// Alternatives:
//   - Flat list (previous): Rejected - doesn't scale, no room for tips/metadata
//   - Modal picker: Rejected - extra interaction, breaks sidebar workflow

function ChevronIcon({ expanded, className = '' }) {
  return (
    <svg
      className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-90' : ''} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default memo(function PlatformPreview({ selectedPlatform, onPlatformChange }) {
  const format = findFormat(selectedPlatform)
  const parentGroup = findPlatformGroup(selectedPlatform)

  const [expandedCategories, setExpandedCategories] = useState({})
  const [expandedPlatforms, setExpandedPlatforms] = useState({})
  const [showTips, setShowTips] = useState(false)
  // Requirement: Quick-find for 42+ platform formats in a scrollable list.
  // Approach: Text filter that matches platform group names and format names.
  //   Auto-expands matching categories so results are immediately visible.
  // Alternatives:
  //   - Full-screen modal picker: Rejected for now — search filter is simpler
  //     and may be sufficient. Revisit if users still find it awkward.
  const [searchQuery, setSearchQuery] = useState('')

  // Reset tips panel when switching platforms — prevents showing stale tips
  useEffect(() => {
    setShowTips(false)
  }, [selectedPlatform])

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const togglePlatform = (platformId) => {
    setExpandedPlatforms((prev) => ({
      ...prev,
      [platformId]: !prev[platformId],
    }))
  }

  // When selecting a format from a platform that only has one format,
  // no need to expand — just select directly
  const handlePlatformClick = (group) => {
    if (group.formats.length === 1) {
      onPlatformChange(group.formats[0].id)
    } else {
      togglePlatform(group.id)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header: current selection */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ui-text">Platform</h3>
        <span className="text-sm text-ui-text-subtle font-medium">
          {format.width} × {format.height}
        </span>
      </div>

      {/* Info bar: selected format details + tips */}
      <div className="p-2.5 bg-ui-surface-elevated rounded-lg border border-ui-border space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ui-text">
            {parentGroup.name} — {format.name}
          </span>
          <span className="text-[10px] text-ui-text-faint font-medium">
            {format.recommendedFormat?.toUpperCase() || 'PNG'}
            {format.maxFileSize ? ` · ${format.maxFileSize}` : ''}
          </span>
        </div>

        {/* Tips toggle */}
        {parentGroup.tips && parentGroup.tips.length > 0 && (
          <div>
            <button
              onClick={() => setShowTips(!showTips)}
              aria-label="Toggle platform tips"
              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showTips ? 'Hide tips' : 'Tips for this platform'}
            </button>
            {showTips && (
              <ul className="mt-1.5 space-y-1">
                {parentGroup.tips.map((tip, i) => (
                  <li key={i} className="text-[10px] text-ui-text-muted leading-relaxed flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Platform selector */}
      <CollapsibleSection title="Select Platform" defaultExpanded={false}>
        {/* Search filter for quick platform finding */}
        <div className="mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platforms..."
            aria-label="Search platforms"
            className="w-full px-3 py-2 text-xs rounded-lg bg-ui-surface-inset border border-ui-border text-ui-text placeholder-ui-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          {categoryOrder.map((category) => {
            const categoryPlatformGroups = platformGroupsByCategory[category]
            if (!categoryPlatformGroups || categoryPlatformGroups.length === 0) return null

            // Filter groups by search query (match group name or any format name)
            const query = searchQuery.toLowerCase().trim()
            const filteredGroups = query
              ? categoryPlatformGroups.filter((g) =>
                  g.name.toLowerCase().includes(query) ||
                  g.formats.some((f) => f.name.toLowerCase().includes(query))
                )
              : categoryPlatformGroups
            if (query && filteredGroups.length === 0) return null

            // Auto-expand categories when searching so results are visible
            const isCatExpanded = query ? true : (expandedCategories[category] || false)
            // Use filteredGroups when searching to avoid showing indicator for hidden platforms
            const hasSelectedFormat = (query ? filteredGroups : categoryPlatformGroups).some((g) =>
              g.formats.some((f) => f.id === selectedPlatform)
            )

            return (
              <div key={category} className="space-y-1">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  aria-label={`${isCatExpanded ? 'Collapse' : 'Expand'} ${categoryLabels[category] || category}`}
                  className="w-full flex items-center justify-between py-1 hover:bg-ui-surface-elevated rounded transition-colors"
                >
                  <span className="text-[10px] text-ui-text-faint uppercase tracking-wide font-medium flex items-center gap-1">
                    <ChevronIcon expanded={isCatExpanded} />
                    {categoryLabels[category] || category}
                  </span>
                  {hasSelectedFormat && !isCatExpanded && (
                    <span className="text-[10px] text-primary font-medium">
                      {parentGroup.name} — {format.name}
                    </span>
                  )}
                </button>

                {/* Platform list within category */}
                {isCatExpanded && (
                  <div className="pl-4 space-y-1">
                    {filteredGroups.map((group) => {
                      const hasOneFormat = group.formats.length === 1
                      const isSelected = group.formats.some((f) => f.id === selectedPlatform)
                      const isGroupExpanded = expandedPlatforms[group.id] || false

                      return (
                        <div key={group.id}>
                          {/* Platform row */}
                          <button
                            onClick={() => handlePlatformClick(group)}
                            aria-label={hasOneFormat ? `Select ${group.name}` : `${isGroupExpanded ? 'Collapse' : 'Expand'} ${group.name}`}
                            className={`w-full flex items-center justify-between py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-primary/10 text-primary'
                                : 'text-ui-text hover:bg-ui-surface-hover'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {!hasOneFormat && (
                                <ChevronIcon expanded={isGroupExpanded} />
                              )}
                              {group.name}
                            </span>
                            {hasOneFormat && (
                              <span className="text-[10px] text-ui-text-faint">
                                {group.formats[0].width} × {group.formats[0].height}
                              </span>
                            )}
                            {!hasOneFormat && isSelected && !isGroupExpanded && (
                              <span className="text-[10px] text-primary">{format.name}</span>
                            )}
                          </button>

                          {/* Format options for multi-format platforms */}
                          {!hasOneFormat && isGroupExpanded && (
                            <div className="flex flex-wrap gap-1 pl-6 mt-1">
                              {group.formats.map((f) => (
                                <button
                                  key={f.id}
                                  onClick={() => onPlatformChange(f.id)}
                                  title={`${f.width} × ${f.height}`}
                                  aria-label={`Select ${f.name} format`}
                                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                                    selectedPlatform === f.id
                                      ? 'bg-primary text-white shadow-sm'
                                      : 'bg-ui-surface-inset text-ui-text hover:bg-ui-surface-hover'
                                  }`}
                                >
                                  {f.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
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
