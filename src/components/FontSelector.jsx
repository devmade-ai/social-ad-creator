import { memo } from 'react'
import { fonts } from '../config/fonts'

export default memo(function FontSelector({ selectedFonts, onFontsChange }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Fonts</h3>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Title Font</label>
        <select
          value={selectedFonts.title}
          onChange={(e) => onFontsChange({ title: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {fonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Body Font</label>
        <select
          value={selectedFonts.body}
          onChange={(e) => onFontsChange({ body: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {fonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-2 bg-gray-50 rounded">
        <p className="text-xs text-gray-500 mb-1">Preview:</p>
        <p
          className="text-lg font-bold"
          style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.title)?.family }}
        >
          Title Text
        </p>
        <p
          className="text-sm"
          style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.body)?.family }}
        >
          Body text preview
        </p>
      </div>
    </div>
  )
})
