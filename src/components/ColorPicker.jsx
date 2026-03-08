// Requirement: Shared color picker used in both structured text and freeform text editors
// Approach: Extracted component rendering theme swatches + neutral swatches with divider
// Alternatives:
//   - Inline in each editor: Rejected - duplicated code, harder to maintain consistent touch targets
//   - Single generic picker: Rejected - this is specific to text color with theme integration
import { memo } from 'react'
import { neutralColors } from '../config/themes'

const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

export default memo(function ColorPicker({ value, onChange, theme }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {themeColorOptions.map((color) => (
        <button
          key={color.id}
          onClick={() => onChange(color.id)}
          title={color.name}
          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
            value === color.id
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-ui-border'
          }`}
          style={{ backgroundColor: theme[color.id] }}
        />
      ))}
      <span className="w-px h-5 bg-ui-surface-hover mx-0.5" />
      {neutralColors.map((color) => (
        <button
          key={color.id}
          onClick={() => onChange(color.id)}
          title={color.name}
          className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 active:scale-95 ${
            value === color.id
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-ui-border-strong'
          }`}
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  )
})
