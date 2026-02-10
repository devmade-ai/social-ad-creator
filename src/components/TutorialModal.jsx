import { useState, memo } from 'react'

const tutorialSteps = [
  {
    title: 'Welcome',
    icon: '👋',
    content: (
      <div className="space-y-3">
        <p>Social Ad Creator helps you design professional social media ads in minutes.</p>
        <p className="text-ui-text-muted">Follow this quick guide to learn the basics, or explore on your own!</p>
        <div className="bg-ui-surface-inset rounded-lg p-3 text-sm">
          <strong>Workflow:</strong> Presets → Media → Content → Structure → Style → Export
        </div>
      </div>
    ),
  },
  {
    title: 'Presets',
    icon: '🎨',
    content: (
      <div className="space-y-3">
        <p><strong>Start here</strong> to quickly set up your design.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Layout:</strong> Grid structure presets with aspect ratio filtering</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Themes:</strong> Color schemes - 12 presets or custom colors</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Looks:</strong> Visual effects (fonts, filters, overlay) without changing layout or colors</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Tip: Presets are a great starting point - customize everything after!</p>
      </div>
    ),
  },
  {
    title: 'Media',
    icon: '🖼️',
    content: (
      <div className="space-y-3">
        <p>Upload and manage your images.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Images:</strong> Upload to library, then assign to cells in your layout</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Per-image settings:</strong> Fit, position, grayscale for each image</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Image Overlay:</strong> Add gradients, vignettes, or effects directly to images</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Logo:</strong> Optional logo with position and size controls</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Tip: Use the AI Prompt Helper to generate prompts for AI image tools!</p>
      </div>
    ),
  },
  {
    title: 'Content',
    icon: '✏️',
    content: (
      <div className="space-y-3">
        <p>Write your ad copy.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Title & Tagline:</strong> Main headline and supporting text</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Body:</strong> Heading + body text for longer content</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>CTA:</strong> Call-to-action button text</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Footnote:</strong> Fine print or disclaimers</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Each text element can be assigned to different cells and styled individually.</p>
      </div>
    ),
  },
  {
    title: 'Structure',
    icon: '📐',
    content: (
      <div className="space-y-3">
        <p>Fine-tune your layout grid.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Layout Type:</strong> Full bleed, rows, or columns</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Interactive Grid:</strong> Drag dividers to resize sections, click to select</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Text Alignment:</strong> Set alignment per-cell or globally</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Tip: Select a cell first, then adjust its alignment in the Text Alignment section.</p>
      </div>
    ),
  },
  {
    title: 'Style',
    icon: '🎭',
    content: (
      <div className="space-y-3">
        <p>Polish the visual look.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Typography:</strong> Choose title and body fonts from 15 Google Fonts</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Overlay:</strong> Per-cell overlays (stacks on top of image overlays)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Spacing:</strong> Global padding and per-cell custom padding</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Frames:</strong> Add colored borders around the canvas or individual cells</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Note: Color themes are in the Presets tab.</p>
      </div>
    ),
  },
  {
    title: 'Export',
    icon: '📤',
    content: (
      <div className="space-y-3">
        <p>Download your finished ad.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Platform:</strong> Choose from 20+ sizes (Instagram, TikTok, LinkedIn, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Single Download:</strong> Export the current platform size</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Batch Export:</strong> Download all selected platforms as a ZIP</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">The preview updates in real-time as you make changes!</p>
      </div>
    ),
  },
  {
    title: 'Tips & Shortcuts',
    icon: '⚡',
    content: (
      <div className="space-y-3">
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Undo/Redo:</strong> Use the context bar buttons or Ctrl+Z / Ctrl+Y</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Dark Mode:</strong> Toggle with the sun/moon button</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Refresh:</strong> Use the refresh button to reload the app (useful for PWA)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Install App:</strong> Use the Install button to add to your device</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Multi-image layouts:</strong> Assign different images to different cells</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Layer overlays:</strong> Image overlay + cell overlay = more control</span>
          </li>
        </ul>
        <div className="bg-ui-surface-inset rounded-lg p-3 text-sm mt-4">
          <strong>Need more help?</strong> Check the project README on GitHub for detailed documentation.
        </div>
      </div>
    ),
  },
]

export default memo(function TutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const step = tutorialSteps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === tutorialSteps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ui-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{step.icon}</span>
            <h2 className="text-lg font-semibold text-ui-text">{step.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ui-text-muted hover:bg-ui-surface-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-ui-text">
          {step.content}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-ui-border flex items-center justify-between">
          {/* Step indicators */}
          <div className="flex gap-1.5">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : 'bg-ui-surface-hover hover:bg-ui-text-faint'
                }`}
                title={tutorialSteps[index].title}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover transition-colors"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Get Started
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
