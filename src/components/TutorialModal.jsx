// Requirement: In-app help walkthrough for new users.
// Approach: DaisyUI modal (native <dialog>) with step navigation and dot indicators.
// Alternatives:
//   - Hand-rolled fixed overlay + backdrop-blur: Replaced — <dialog> provides
//     native focus trapping, Escape handling, and ::backdrop pseudo-element.

import { useState, useCallback, memo, useRef } from 'react'
import { useDialogSync } from '../hooks/useDialogSync'

const tutorialSteps = [
  {
    title: 'Welcome',
    icon: '👋',
    content: (
      <div className="space-y-3">
        <p>CanvaGrid helps you create visual designs — social posts, ads, presentations, stories, and more.</p>
        <p className="text-base-content/70">Your design is made up of <strong>cells</strong> — the boxes in your grid. Each cell can hold an image, text, or both.</p>
        <div className="bg-base-200 rounded-lg p-3 text-sm">
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
            <span className="text-primary">•</span>
            <span><strong>Platform:</strong> Pick a size for your design — Instagram, TikTok, LinkedIn, print, and more. This sets the canvas dimensions. Use the search box to find platforms by name.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Layout:</strong> Choose how to arrange your cells — single image, side-by-side, stacked, and more. Filter by shape (square, tall, wide).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Themes:</strong> Pick a color scheme from 19 presets, each with light and dark variants. Or set your own custom colors.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Looks:</strong> Apply a visual style — changes fonts and image effects without touching your layout or colors.</span>
          </li>
        </ul>
        <p className="text-base-content/70 text-sm">Tip: Presets are just a starting point — you can customize everything after.</p>
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
            <span className="text-primary">•</span>
            <span><strong>Sample Images:</strong> Browse free sample images by category — click one to add it.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Images:</strong> Upload your own images, then assign them to cells. Adjust fit and position per image.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Image Overlay & Filters:</strong> Add a color tint to any image, or apply filters like black & white, sepia, or blur.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Logo:</strong> Optionally add a logo and choose its position and size.</span>
          </li>
        </ul>
        <p className="text-base-content/70 text-sm">Tip: Check out the AI Prompt Helper for ideas to use with AI image generators!</p>
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
            <span className="text-primary">•</span>
            <span><strong>Guided:</strong> Ready-made text slots — Title, Tagline, Body, Call to Action, and Footnote. Each cell has its own text elements.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Freeform:</strong> Write anything you want in each cell. Supports rich text formatting.</span>
          </li>
        </ul>
        <p className="text-base-content/70 text-sm">Both modes let you change alignment, color, size, bold/italic, and letter spacing. Text alignment controls (horizontal + vertical) are here too.</p>
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
            <span className="text-primary">•</span>
            <span><strong>Layout type:</strong> Switch between a single full image, rows, or columns.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Resize:</strong> Drag the dividers between cells to make them bigger or smaller.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Reorder:</strong> Move rows up/down or columns left/right to rearrange sections.</span>
          </li>
        </ul>
        <p className="text-base-content/70 text-sm">Tip: Text alignment controls are in the Content tab.</p>
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
            <span className="text-primary">•</span>
            <span><strong>Fonts:</strong> Pick different fonts for your title and body text.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Background:</strong> Override the theme color for individual cells.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Color Tint:</strong> Add a color layer over individual cells — great for making text more readable over images.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Frames:</strong> Add colored borders around the whole design or individual cells.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Spacing:</strong> Add breathing room around the edges or between cells.</span>
          </li>
        </ul>
        <p className="text-base-content/70 text-sm">Looking for color themes? Those are in the Presets tab.</p>
      </div>
    ),
  },
  {
    title: 'Export',
    icon: '📤',
    content: (
      <div className="space-y-3">
        <p>Download your finished design.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>File format:</strong> Choose PNG, JPG, or WebP. Each platform shows a recommended format.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Download:</strong> Single image, batch ZIP (multiple sizes), all pages ZIP, or PDF.</span>
          </li>
        </ul>
        <p className="text-base-content/70 text-sm">Pick your target size in the Presets tab first — the preview updates live as you make changes.</p>
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
            <span className="text-primary">•</span>
            <span><strong>Undo/Redo:</strong> Press Ctrl+Z to undo, Ctrl+Y to redo (or use the buttons below the tabs).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Theme:</strong> Use the theme buttons in the header to switch between light/dark mode and choose a style (Mono or Luxe).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Multiple pages:</strong> Use the page controls below the tabs to add pages — great for stories, books, or slide decks.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Reader mode:</strong> Click "View" to see your pages full-screen. Use arrow keys to flip through them.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Different images per cell:</strong> Each cell can have its own image — assign them in the Media tab.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Stacking color tints:</strong> You can add a tint on an image <em>and</em> on its cell for layered effects.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Install as app:</strong> Click "Install" to add CanvaGrid to your device for quick access.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span><strong>Mobile long-press:</strong> On mobile, long-press any cell on the canvas to quickly jump to Media, Content, or Style for that cell.</span>
          </li>
        </ul>
      </div>
    ),
  },
]

export default memo(function TutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const dialogRef = useRef(null)

  const handleOpen = useCallback(() => setCurrentStep(0), [])
  const { handleBackdropClick } = useDialogSync(dialogRef, isOpen, onClose, handleOpen)

  const step = tutorialSteps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === tutorialSteps.length - 1

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      onClick={handleBackdropClick}
    >
      <div className="modal-box max-w-lg flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{step?.icon}</span>
            <h3 className="text-lg font-semibold text-base-content">{step?.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn btn-sm btn-circle btn-ghost"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto text-base-content">
          {step?.content}
        </div>

        {/* Footer */}
        <div className="modal-action justify-between items-center">
          {/* Step indicators */}
          <div className="flex gap-1.5">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : 'bg-base-300 hover:bg-base-content/40'
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
                className="btn btn-ghost btn-sm"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={onClose}
                className="btn btn-primary btn-sm"
              >
                Get Started
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn btn-primary btn-sm"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  )
})
