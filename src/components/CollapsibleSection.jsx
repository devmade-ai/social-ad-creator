import { useRef, memo } from 'react'

/**
 * CollapsibleSection - Reusable collapsible section component for tab content
 *
 * Requirement: Consistent accordion sections across all sidebar tabs.
 * Approach: DaisyUI collapse component with checkbox-controlled state.
 *   Checkbox onChange fires onExpand callback when opening (e.g., font loading).
 *   Subtitle shown in collapse-title when collapsed via CSS sibling selector.
 * Alternatives:
 *   - Hand-rolled div+button accordion: Replaced — DaisyUI collapse provides
 *     smooth CSS grid animation, consistent styling, and arrow indicator.
 *   - DaisyUI details/summary: Rejected — no React-controlled state for onExpand.
 *
 * @param {string} title - Section header text
 * @param {string} subtitle - Optional preview text shown when collapsed (truncated)
 * @param {boolean} defaultExpanded - Whether section starts expanded (default: true)
 * @param {React.ReactNode} children - Section content
 * @param {string} className - Additional classes for the container
 * @param {Function} onExpand - Callback fired when section is expanded
 */
export default memo(function CollapsibleSection({
  title,
  subtitle,
  defaultExpanded = true,
  children,
  className = '',
  onExpand,
}) {
  const checkboxRef = useRef(null)

  return (
    <div className={`collapse collapse-arrow border border-base-300 bg-base-100 ${className}`}>
      <input
        ref={checkboxRef}
        type="checkbox"
        defaultChecked={defaultExpanded}
        onChange={(e) => {
          if (e.target.checked) onExpand?.()
        }}
      />
      <div className="collapse-title text-sm font-medium text-base-content px-3 py-3 lg:py-2.5 min-h-0 !pe-8 bg-base-200 flex items-center gap-2">
        <span className="shrink-0">{title}</span>
        {subtitle && (
          <span className="subtitle-when-collapsed text-[10px] text-base-content/50 font-normal truncate">— {subtitle}</span>
        )}
      </div>
      <div className="collapse-content px-3 !pb-3 bg-base-100">
        <div className="pt-3 space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
})
