// Requirement: Shared style controls between structured TextElementEditor and freeform FreeformBlockEditor.
// Approach: Single component that takes current style values and an onChange callback.
// Alternatives:
//   - Duplicate controls in each editor: Rejected — 150+ lines of identical JSX duplicated.
//   - Render props: Rejected — simple value/onChange is cleaner and more readable.
import ColorPicker from './ColorPicker'
import AlignmentPicker from './AlignmentPicker'

const sizeOptions = [
  { id: 0.6, name: 'XS' },
  { id: 0.8, name: 'S' },
  { id: 1, name: 'M' },
  { id: 1.2, name: 'L' },
  { id: 1.5, name: 'XL' },
]

const letterSpacingOptions = [
  { id: -1, name: 'Tight' },
  { id: 0, name: 'Normal' },
  { id: 1, name: 'Wide' },
  { id: 2, name: 'Extra' },
]

export default function TextStyleControls({ value, onChange, theme }) {
  return (
    <div className="space-y-2 p-2 bg-base-200/50 rounded-lg">
      {/* Alignment */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-base-content/60 w-10 shrink-0">Align</span>
        <AlignmentPicker
          value={value.textAlign}
          onChange={(id) => onChange({ textAlign: id })}
        />
      </div>

      {/* Color */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-base-content/60 w-10 shrink-0">Color</span>
        <ColorPicker
          value={value.color}
          onChange={(id) => onChange({ color: id })}
          theme={theme}
        />
      </div>

      {/* Size + Bold/Italic */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-base-content/60 w-10 shrink-0">Size</span>
        <div className="flex items-center gap-1">
          {sizeOptions.map((size) => (
            <button
              key={size.id}
              onClick={() => onChange({ size: size.id })}
              title={`Size ${size.name}`}
              className={`w-8 h-7 sm:w-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 font-medium rounded ${
                value.size === size.id
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content/70 hover:bg-base-300'
              }`}
            >
              {size.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => onChange({ bold: !value.bold })}
            title="Bold"
            className={`w-9 h-7 sm:w-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 font-bold rounded ${
              value.bold
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            B
          </button>
          <button
            onClick={() => onChange({ italic: !value.italic })}
            title="Italic"
            className={`w-9 h-7 sm:w-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 italic rounded ${
              value.italic
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            I
          </button>
        </div>
      </div>

      {/* Letter spacing */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-base-content/60 w-10 shrink-0">Spacing</span>
        <div className="flex items-center gap-1">
          {letterSpacingOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange({ letterSpacing: opt.id })}
              title={opt.name}
              className={`px-2.5 h-7 sm:px-2 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
                value.letterSpacing === opt.id
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content/70 hover:bg-base-300'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer/line above */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-base-content/60 w-10 shrink-0">Above</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ spacerAbove: ((value.spacerAbove || 0) + 1) % 3 })}
            title={`Spacer above: ${['None', 'Small', 'Large'][value.spacerAbove || 0]}`}
            className={`flex items-center gap-1 px-2 h-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
              (value.spacerAbove || 0) > 0
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            Gap {['Off', 'S', 'L'][value.spacerAbove || 0]}
          </button>
          <button
            onClick={() => onChange({ lineAbove: !value.lineAbove })}
            title={`Line above: ${value.lineAbove ? 'On' : 'Off'}`}
            className={`flex items-center gap-1 px-2 h-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
              value.lineAbove
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {/* Spacer/line below */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-base-content/60 w-10 shrink-0">Below</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ spacerBelow: ((value.spacerBelow || 0) + 1) % 3 })}
            title={`Spacer below: ${['None', 'Small', 'Large'][value.spacerBelow || 0]}`}
            className={`flex items-center gap-1 px-2 h-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
              (value.spacerBelow || 0) > 0
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            Gap {['Off', 'S', 'L'][value.spacerBelow || 0]}
          </button>
          <button
            onClick={() => onChange({ lineBelow: !value.lineBelow })}
            title={`Line below: ${value.lineBelow ? 'On' : 'Off'}`}
            className={`flex items-center gap-1 px-2 h-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
              value.lineBelow
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            Line
          </button>
        </div>
      </div>
    </div>
  )
}
