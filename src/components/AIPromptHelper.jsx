// Requirement: AI image prompt builder UI for generating AI-ready image prompts.
// Approach: Self-contained component with style/mood/purpose/orientation selectors
//   that compose into a copy-ready prompt string.
//   Option selectors use DaisyUI btn classes for consistency with app-wide button styling.
//   Non-wrapping groups (purpose, orientation, colors) use join for connected borders.
//   Wrapping groups (style, mood) use flex gap with individual btn items.
// Alternatives:
//   - Hand-rolled px-2 py-1 rounded-lg styling: Replaced — DaisyUI btn provides
//     consistent sizing, focus states, and theme-aware colors.
//   - Inline in MediaTab: Rejected — adds ~230 lines to an already large file.
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
        <label className="block text-xs font-medium text-base-content/70">Subject / Context</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., coffee shop interior, mountain landscape, abstract geometric shapes..."
          className="textarea textarea-bordered textarea-sm w-full resize-none"
          rows={2}
        />
      </div>

      {/* Style — wrapping group, individual btn items */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-base-content/70">Style</label>
        <div className="flex flex-wrap gap-1">
          {styleOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStyle(opt.id)}
              className={`btn btn-xs ${
                style === opt.id ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mood — wrapping group, individual btn items */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-base-content/70">Mood / Lighting</label>
        <div className="flex flex-wrap gap-1">
          {moodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMood(opt.id)}
              className={`btn btn-xs ${
                mood === opt.id ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Purpose — 2 items, connected group */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-base-content/70">Image Purpose</label>
        <div className="join w-full">
          {purposeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPurpose(opt.id)}
              className={`btn btn-xs flex-1 join-item ${
                purpose === opt.id ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-base-content/50">
          {purpose === 'hero' ? 'Clean focal point for featured images' : 'Subtle details, good for text overlays'}
        </p>
      </div>

      {/* Orientation — 3 items, connected group */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-base-content/70">Orientation</label>
        <div className="join w-full">
          {orientationOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setOrientation(opt.id)}
              className={`btn btn-xs flex-1 join-item ${
                orientation === opt.id ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Colors — 2 items, connected group */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-base-content/70">Colors (optional)</label>
        <div className="join w-full mb-2">
          <button
            onClick={() => setUseThemeColors(true)}
            className={`btn btn-xs flex-1 join-item ${
              useThemeColors ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            Use Theme
          </button>
          <button
            onClick={() => setUseThemeColors(false)}
            className={`btn btn-xs flex-1 join-item ${
              !useThemeColors ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            Custom
          </button>
        </div>
        {useThemeColors ? (
          theme ? (
            <div className="flex gap-2 items-center text-xs text-base-content/60">
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.primary }} />
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.secondary }} />
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.accent }} />
              <span>From Style tab</span>
            </div>
          ) : (
            <p className="text-[10px] text-base-content/50">
              Select a theme in the Style tab, or switch to Custom
            </p>
          )
        ) : (
          <input
            type="text"
            value={customColors}
            onChange={(e) => setCustomColors(e.target.value)}
            placeholder="e.g., blue and orange, muted earth tones..."
            className="input input-bordered input-sm w-full"
          />
        )}
      </div>

      {/* Generated Prompt */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-medium text-base-content/70">Generated Prompt</label>
          <span className="text-[10px] text-base-content/50">Updates as you change options</span>
        </div>
        <div className="relative">
          <div className="w-full px-3 py-2 text-xs bg-base-200 border border-base-300 rounded-lg text-base-content/70 max-h-24 overflow-y-auto">
            {generatedPrompt}
          </div>
          <button
            onClick={handleCopy}
            className={`btn btn-xs absolute top-1.5 right-1.5 ${
              copied ? 'btn-success' : 'btn-primary'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
