// Requirement: AI image prompt builder UI for generating AI-ready image prompts.
// Approach: Self-contained component with style/mood/purpose/orientation selectors
//   that compose into a copy-ready prompt string.
// Alternatives:
//   - Inline in MediaTab: Rejected — adds ~230 lines to an already large file.
//   - External prompt template system: Rejected — over-engineering for a helper tool.
import { useState, useMemo, useCallback } from 'react'

const styleOptions = [
  { id: 'photorealistic', name: 'Photo', description: 'photorealistic photograph' },
  { id: 'cinematic', name: 'Cinematic', description: 'cinematic film still' },
  { id: 'editorial', name: 'Editorial', description: 'editorial photography' },
  { id: 'minimal', name: 'Minimal', description: 'minimalist clean image' },
  { id: 'abstract', name: 'Abstract', description: 'abstract artistic' },
  { id: 'illustration', name: 'Illustration', description: 'digital illustration' },
  { id: '3d', name: '3D', description: '3D rendered' },
]

const moodOptions = [
  { id: 'dark', name: 'Dark', description: 'dark moody lighting, deep shadows' },
  { id: 'light', name: 'Light', description: 'bright airy lighting, soft highlights' },
  { id: 'neutral', name: 'Neutral', description: 'balanced neutral lighting' },
  { id: 'dramatic', name: 'Dramatic', description: 'dramatic high-contrast lighting' },
  { id: 'soft', name: 'Soft', description: 'soft diffused lighting' },
  { id: 'warm', name: 'Warm', description: 'warm golden tones' },
  { id: 'cool', name: 'Cool', description: 'cool blue tones' },
]

const purposeOptions = [
  { id: 'hero', name: 'Hero Image', description: 'as a featured hero image with clear focal point' },
  { id: 'background', name: 'Background', description: 'as a background image suitable for text overlay, with subtle details and low contrast areas' },
]

const orientationOptions = [
  { id: 'landscape', name: 'Landscape', description: 'landscape orientation (wider than tall)' },
  { id: 'portrait', name: 'Portrait', description: 'portrait orientation (taller than wide)' },
  { id: 'square', name: 'Square', description: 'square orientation (1:1 aspect ratio)' },
]

// AI Image Prompt Helper Component
export default function AIPromptHelper({ theme }) {
  const [style, setStyle] = useState('photorealistic')
  const [mood, setMood] = useState('neutral')
  const [purpose, setPurpose] = useState('background')
  const [orientation, setOrientation] = useState('landscape')
  const [useThemeColors, setUseThemeColors] = useState(false)
  const [customColors, setCustomColors] = useState('')
  const [context, setContext] = useState('')
  const [copied, setCopied] = useState(false)

  // Generate the prompt
  const generatedPrompt = useMemo(() => {
    const parts = []

    // Style
    const styleData = styleOptions.find((s) => s.id === style)
    if (styleData) parts.push(styleData.description)

    // Context (subject)
    if (context.trim()) {
      parts.push(context.trim())
    }

    // Purpose
    const purposeData = purposeOptions.find((p) => p.id === purpose)
    if (purposeData) parts.push(purposeData.description)

    // Mood/Lighting
    const moodData = moodOptions.find((m) => m.id === mood)
    if (moodData) parts.push(moodData.description)

    // Colors
    if (useThemeColors && theme) {
      parts.push(`color palette: ${theme.primary} (primary), ${theme.secondary} (secondary), ${theme.accent} (accent)`)
    } else if (customColors.trim()) {
      parts.push(`color palette: ${customColors.trim()}`)
    }

    // Orientation
    const orientationData = orientationOptions.find((o) => o.id === orientation)
    if (orientationData) parts.push(orientationData.description)

    // Constants - always include
    parts.push('do not include any text, words, letters, numbers, or typography')
    parts.push('do not include any overlays, borders, watermarks, or graphic elements')

    return parts.join(', ')
  }, [style, mood, purpose, orientation, useThemeColors, customColors, context, theme])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedPrompt])

  return (
    <div className="space-y-3">
      {/* Subject/Context */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Subject / Context</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., coffee shop interior, mountain landscape, abstract geometric shapes..."
          className="w-full px-3 py-2 text-sm text-ui-text bg-white dark:bg-dark-subtle placeholder-zinc-400 dark:placeholder-zinc-500 border border-ui-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {/* Style */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Style</label>
        <div className="flex flex-wrap gap-1">
          {styleOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStyle(opt.id)}
              className={`px-2 py-1 text-xs rounded-lg font-medium ${
                style === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Mood / Lighting</label>
        <div className="flex flex-wrap gap-1">
          {moodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMood(opt.id)}
              className={`px-2 py-1 text-xs rounded-lg font-medium ${
                mood === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Image Purpose</label>
        <div className="flex gap-1.5">
          {purposeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPurpose(opt.id)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                purpose === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-ui-text-faint">
          {purpose === 'hero' ? 'Clean focal point for featured images' : 'Subtle details, good for text overlays'}
        </p>
      </div>

      {/* Orientation */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Orientation</label>
        <div className="flex gap-1">
          {orientationOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setOrientation(opt.id)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                orientation === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Colors (optional)</label>
        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => setUseThemeColors(true)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
              useThemeColors
                ? 'bg-primary text-white shadow-sm'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            Use Theme
          </button>
          <button
            onClick={() => setUseThemeColors(false)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
              !useThemeColors
                ? 'bg-primary text-white shadow-sm'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            Custom
          </button>
        </div>
        {useThemeColors ? (
          theme ? (
            <div className="flex gap-2 items-center text-xs text-ui-text-subtle">
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.primary }} />
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.secondary }} />
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.accent }} />
              <span>From Style tab</span>
            </div>
          ) : (
            <p className="text-[10px] text-ui-text-faint">
              Select a theme in the Style tab, or switch to Custom
            </p>
          )
        ) : (
          <input
            type="text"
            value={customColors}
            onChange={(e) => setCustomColors(e.target.value)}
            placeholder="e.g., blue and orange, muted earth tones..."
            className="w-full px-3 py-1.5 text-sm text-ui-text bg-white dark:bg-dark-subtle placeholder-zinc-400 dark:placeholder-zinc-500 border border-ui-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        )}
      </div>

      {/* Generated Prompt */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-medium text-ui-text-muted">Generated Prompt</label>
          <span className="text-[10px] text-ui-text-faint">Updates as you change options</span>
        </div>
        <div className="relative">
          <div className="w-full px-3 py-2 text-xs bg-ui-surface-elevated border border-ui-border rounded-lg text-ui-text-muted max-h-24 overflow-y-auto">
            {generatedPrompt}
          </div>
          <button
            onClick={handleCopy}
            className={`absolute top-1.5 right-1.5 px-2 py-1 text-[10px] rounded font-medium transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-primary-hover'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
