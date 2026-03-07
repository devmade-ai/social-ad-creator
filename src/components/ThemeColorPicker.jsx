// Requirement: Reusable color picker for theme colors + neutrals, used in StyleTab overlay,
//   outer frame, and cell frame sections.
// Approach: Single component replacing 3 copy-pasted color picker UIs.
// Alternatives:
//   - Keep per-section copies: Rejected — 3x duplication of identical UI code.
import { neutralColors } from '../config/themes'

const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

export default function ThemeColorPicker({ value, onChange, theme }) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {themeColorOptions.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`flex-1 px-2 py-1.5 text-[10px] rounded ${
              value === c.id
                ? 'ring-2 ring-primary ring-offset-1'
                : ''
            }`}
            style={{ backgroundColor: theme?.[c.id] || '#000' }}
          >
            <span style={{ color: c.id === 'primary' ? theme?.secondary : theme?.primary }}>
              {c.name}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-ui-text-subtle">Neutrals:</span>
        {neutralColors.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            title={c.name}
            className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
              value === c.id
                ? 'ring-2 ring-primary ring-offset-1 border-transparent'
                : 'border-ui-border-strong'
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </div>
  )
}
