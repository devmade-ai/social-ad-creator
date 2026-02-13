import { useState, memo } from 'react'

const tutorialSteps = [
  {
    title: 'Welcome',
    icon: '👋',
    content: (
      <div className="space-y-3">
        <p>CanvaGrid helps you create visual designs — social posts, ads, presentations, stories, and more.</p>
        <p className="text-ui-text-muted">Your design is made up of <strong>cells</strong> — the boxes in your grid. Each cell can hold an image, text, or both.</p>
        <div className="bg-ui-surface-inset rounded-lg p-3 text-sm">
          <strong>Suggested workflow:</strong> Pick a preset → Add images → Write text → Tweak the layout → Style it → Download
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
            <span><strong>Layout:</strong> Choose how to arrange your cells — single image, side-by-side, stacked, and more. Filter by shape (square, tall, wide).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Themes:</strong> Pick a color scheme from 12 presets, or set your own custom colors.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Looks:</strong> Apply a visual style — changes fonts and image effects without touching your layout or colors.</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Tip: Presets are just a starting point — you can customize everything after.</p>
      </div>
    ),
  },
  {
    title: 'Media',
    icon: '🖼️',
    content: (
      <div className="space-y-3">
        <p>Add images to your design.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Sample Images:</strong> Browse free sample images by category — click one to add it.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Upload:</strong> Add your own images, then drag them into the cell you want.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Adjust:</strong> For each image, you can change the zoom, position, color tint, and filters like black & white or blur.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Logo:</strong> Optionally add a logo and choose its position and size.</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Tip: Check out the AI Prompt Helper for ideas to use with AI image generators!</p>
      </div>
    ),
  },
  {
    title: 'Content',
    icon: '✏️',
    content: (
      <div className="space-y-3">
        <p>Add text to your design. There are two modes:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Structured:</strong> Ready-made text slots — Title, Tagline, Body, Call to Action, and Footnote. Pick which cell each one appears in.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Freeform:</strong> Write anything you want in each cell. Supports rich text formatting.</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Both modes let you change alignment, color, size, bold/italic, and letter spacing.</p>
      </div>
    ),
  },
  {
    title: 'Structure',
    icon: '📐',
    content: (
      <div className="space-y-3">
        <p>Adjust how your grid is arranged.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Layout type:</strong> Switch between a single full image, rows, or columns.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Resize:</strong> Drag the dividers between cells to make them bigger or smaller.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Text position:</strong> Control where text sits inside a cell — top, center, bottom, left, right.</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Tip: Click a cell first, then change its text position.</p>
      </div>
    ),
  },
  {
    title: 'Style',
    icon: '🎭',
    content: (
      <div className="space-y-3">
        <p>Fine-tune the visual details.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Fonts:</strong> Pick different fonts for your title and body text.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Color tints:</strong> Add a color layer over individual cells — great for making text more readable over images.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Spacing:</strong> Add breathing room around the edges or between cells.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Borders:</strong> Add colored borders around the whole design or individual cells.</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">Looking for color themes? Those are in the Presets tab.</p>
      </div>
    ),
  },
  {
    title: 'Export',
    icon: '📤',
    content: (
      <div className="space-y-3">
        <p>Download your finished design as an image.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Pick a size:</strong> Choose from 20+ sizes for Instagram, TikTok, LinkedIn, print, and more.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Download:</strong> Save the current size as a single image.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Batch download:</strong> Export multiple sizes at once in a ZIP file.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>All pages:</strong> If you have multiple pages, download them all as numbered images in a ZIP.</span>
          </li>
        </ul>
        <p className="text-ui-text-muted text-sm">The preview on the right updates live as you make changes.</p>
      </div>
    ),
  },
  {
    title: 'Tips',
    icon: '⚡',
    content: (
      <div className="space-y-3">
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Undo/Redo:</strong> Press Ctrl+Z to undo, Ctrl+Y to redo (or use the buttons below the tabs).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Dark mode:</strong> Click the sun/moon button to switch.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Multiple pages:</strong> Use the page controls below the tabs to add pages — great for stories, books, or slide decks.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Reader mode:</strong> Click "View" to see your pages full-screen. Use arrow keys to flip through them.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Different images per cell:</strong> Each cell can have its own image — assign them in the Media tab.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Stacking color tints:</strong> You can add a tint on an image <em>and</em> on its cell for layered effects.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">•</span>
            <span><strong>Install as app:</strong> Click "Install" to add CanvaGrid to your device for quick access.</span>
          </li>
        </ul>
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
