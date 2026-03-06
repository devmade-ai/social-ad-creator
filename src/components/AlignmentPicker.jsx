// Requirement: Shared alignment picker used in both structured text and freeform text editors
// Approach: Extracted component with Default/Left/Center/Right options and mobile-friendly touch targets
// Alternatives:
//   - Inline in each editor: Rejected - duplicated SVG icons and button logic
//   - Dropdown select: Rejected - buttons are more discoverable for alignment
import { memo } from 'react'

const AlignDefaultIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor" opacity="0.4">
    <rect x="2" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="3" y="8" width="8" height="2" />
  </svg>
)
const AlignLeftIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="0" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="0" y="8" width="8" height="2" />
  </svg>
)
const AlignCenterIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="2" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="3" y="8" width="8" height="2" />
  </svg>
)
const AlignRightIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="4" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="6" y="8" width="8" height="2" />
  </svg>
)

const textAlignOptions = [
  { id: null, name: 'Default', Icon: AlignDefaultIcon },
  { id: 'left', name: 'Left', Icon: AlignLeftIcon },
  { id: 'center', name: 'Center', Icon: AlignCenterIcon },
  { id: 'right', name: 'Right', Icon: AlignRightIcon },
]

export default memo(function AlignmentPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {textAlignOptions.map((align) => {
        const isActive = value === align.id
        return (
          <button
            key={align.id ?? 'default'}
            onClick={() => onChange(align.id)}
            title={align.name}
            className={`w-8 h-7 sm:w-6 sm:h-5 rounded flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-ui-surface-inset text-ui-text-subtle hover:bg-ui-surface-hover'
            }`}
          >
            <align.Icon />
          </button>
        )
      })}
    </div>
  )
})
