import { memo } from 'react'
import { fonts } from '../config/fonts'

export default memo(function FontSelector({ selectedFonts, onFontsChange }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Fonts</h3>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Title Font</label>
        <select
          value={selectedFonts.title}
          onChange={(e) => onFontsChange({ title: e.target.value })}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
        >
          {fonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Body Font</label>
        <select
          value={selectedFonts.body}
          onChange={(e) => onFontsChange({ body: e.target.value })}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
        >
          {fonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
        <p
          className="text-xl font-bold text-gray-800 dark:text-gray-100"
          style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.title)?.family }}
        >
          Title Text
        </p>
        <p
          className="text-sm text-gray-600 dark:text-gray-300 mt-1"
          style={{ fontFamily: fonts.find((f) => f.id === selectedFonts.body)?.family }}
        >
          Body text preview
        </p>
      </div>
    </div>
  )
})
