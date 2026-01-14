import { memo } from 'react'
import { platforms } from '../config/platforms'

export default memo(function PlatformPreview({ selectedPlatform, onPlatformChange }) {
  const platform = platforms.find((p) => p.id === selectedPlatform) || platforms[0]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Platform</h3>
        <span className="text-xs text-gray-500">
          {platform.width} × {platform.height}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => onPlatformChange(p.id)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedPlatform === p.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
})
