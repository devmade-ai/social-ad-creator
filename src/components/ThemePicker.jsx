import { memo } from 'react'
import { presetThemes } from '../config/themes'

export default memo(function ThemePicker({ theme, onThemeChange, onPresetChange }) {
  const isCustom = theme.preset === 'custom'

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Theme</h3>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {presetThemes.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              className={`p-2 rounded border transition-colors ${
                theme.preset === preset.id
                  ? 'border-blue-500 ring-1 ring-blue-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex gap-1 mb-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.secondary }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.accent }}
                />
              </div>
              <span className="text-xs text-gray-600">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">Custom Colors</label>
          {!isCustom && (
            <span className="text-xs text-gray-400">(Edit to customize)</span>
          )}
        </div>

        <div className="space-y-2">
          <ColorInput
            label="Primary"
            value={theme.primary}
            onChange={(value) => onThemeChange({ preset: 'custom', primary: value })}
          />
          <ColorInput
            label="Secondary"
            value={theme.secondary}
            onChange={(value) => onThemeChange({ preset: 'custom', secondary: value })}
          />
          <ColorInput
            label="Accent"
            value={theme.accent}
            onChange={(value) => onThemeChange({ preset: 'custom', accent: value })}
          />
        </div>
      </div>
    </div>
  )
})

const ColorInput = memo(function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-gray-200"
      />
      <div className="flex-1">
        <label className="text-xs text-gray-500">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-1 py-0.5 text-xs font-mono border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
})
