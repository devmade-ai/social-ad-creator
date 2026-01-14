// Layout presets for quick start
// Each preset defines layout settings and text group placements
// Using the new nested grid structure

// Categories for organizing presets
export const presetCategories = [
  { id: 'image-focus', name: 'Image Focus', description: 'Layouts that emphasize visual content' },
  { id: 'text-focus', name: 'Text Focus', description: 'Layouts optimized for text-heavy content' },
  { id: 'balanced', name: 'Balanced', description: 'Equal emphasis on image and text' },
  { id: 'grid', name: 'Grid', description: 'Multi-cell layouts with nested structure' },
]

// SVG icon definitions for each preset (rendered as small preview diagrams)
// Blue (#3b82f6) = image area, Gray (#e5e7eb) = text area
export const presetIcons = {
  'hero': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 8, y: 10, width: 24, height: 10, fill: '#e5e7eb', opacity: 0.8 } },
    ]
  },
  'hero-top': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 8, y: 4, width: 24, height: 10, fill: '#e5e7eb', opacity: 0.8 } },
    ]
  },
  'hero-bottom': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 8, y: 16, width: 24, height: 10, fill: '#e5e7eb', opacity: 0.8 } },
    ]
  },
  'left-image': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 30, fill: '#e5e7eb' } },
    ]
  },
  'right-image': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 30, fill: '#3b82f6' } },
    ]
  },
  'top-image': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 15, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 15, width: 40, height: 15, fill: '#e5e7eb' } },
    ]
  },
  'bottom-image': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 15, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 15, width: 40, height: 15, fill: '#3b82f6' } },
    ]
  },
  'two-thirds-left': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 27, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 27, y: 0, width: 13, height: 30, fill: '#e5e7eb' } },
    ]
  },
  'two-thirds-right': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 13, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 13, y: 0, width: 27, height: 30, fill: '#3b82f6' } },
    ]
  },
  'two-thirds-top': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 20, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 20, width: 40, height: 10, fill: '#e5e7eb' } },
    ]
  },
  'two-thirds-bottom': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 10, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 10, width: 40, height: 20, fill: '#3b82f6' } },
    ]
  },
  'side-accent-left': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 10, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 10, y: 0, width: 30, height: 30, fill: '#e5e7eb' } },
    ]
  },
  'side-accent-right': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 30, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 30, y: 0, width: 10, height: 30, fill: '#3b82f6' } },
    ]
  },
  'banner-top': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 8, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 8, width: 40, height: 22, fill: '#e5e7eb' } },
    ]
  },
  'banner-bottom': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 22, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 22, width: 40, height: 8, fill: '#3b82f6' } },
    ]
  },
  // New grid-based icons
  'image-top-split-bottom': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 18, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 18, width: 20, height: 12, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 20, y: 18, width: 20, height: 12, fill: '#d1d5db' } },
    ]
  },
  'split-top-image-bottom': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 12, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 12, fill: '#d1d5db' } },
      { type: 'rect', props: { x: 0, y: 12, width: 40, height: 18, fill: '#3b82f6' } },
    ]
  },
  'image-left-split-right': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 15, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 20, y: 15, width: 20, height: 15, fill: '#d1d5db' } },
    ]
  },
  'split-left-image-right': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 15, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 15, width: 20, height: 15, fill: '#d1d5db' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 30, fill: '#3b82f6' } },
    ]
  },
  'three-row-middle-image': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 10, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 10, width: 40, height: 10, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 20, width: 40, height: 10, fill: '#d1d5db' } },
    ]
  },
}

export const layoutPresets = [
  // ========== IMAGE FOCUS CATEGORY ==========
  {
    id: 'hero',
    name: 'Full Bleed Hero',
    description: 'Full image with centered text overlay - great for impactful visuals',
    category: 'image-focus',
    layout: {
      type: 'fullbleed',
      structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
      imageCell: 0,
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [],
    },
    textCells: {
      title: null,
      tagline: null,
      bodyHeading: null,
      bodyText: null,
      cta: null,
      footnote: null,
    },
  },
  {
    id: 'hero-top',
    name: 'Hero Top Text',
    description: 'Full image with text aligned to top',
    category: 'image-focus',
    layout: {
      type: 'fullbleed',
      structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
      imageCell: 0,
      textAlign: 'center',
      textVerticalAlign: 'start',
      cellAlignments: [],
    },
    textCells: {
      title: null,
      tagline: null,
      bodyHeading: null,
      bodyText: null,
      cta: null,
      footnote: null,
    },
  },
  {
    id: 'hero-bottom',
    name: 'Hero Bottom Text',
    description: 'Full image with text aligned to bottom',
    category: 'image-focus',
    layout: {
      type: 'fullbleed',
      structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
      imageCell: 0,
      textAlign: 'center',
      textVerticalAlign: 'end',
      cellAlignments: [],
    },
    textCells: {
      title: null,
      tagline: null,
      bodyHeading: null,
      bodyText: null,
      cta: null,
      footnote: null,
    },
  },
  {
    id: 'two-thirds-left',
    name: 'Large Image Left',
    description: 'Image takes 2/3, text on right strip',
    category: 'image-focus',
    layout: {
      type: 'columns',
      structure: [
        { size: 66, subdivisions: 1, subSizes: [100] },
        { size: 34, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 0,
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1,
      tagline: 1,
      bodyHeading: 1,
      bodyText: 1,
      cta: 1,
      footnote: 1,
    },
  },
  {
    id: 'two-thirds-right',
    name: 'Large Image Right',
    description: 'Text strip on left, image takes 2/3',
    category: 'image-focus',
    layout: {
      type: 'columns',
      structure: [
        { size: 34, subdivisions: 1, subSizes: [100] },
        { size: 66, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 1,
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 0,
      bodyText: 0,
      cta: 0,
      footnote: 0,
    },
  },
  {
    id: 'two-thirds-top',
    name: 'Large Image Top',
    description: 'Image takes 2/3 top, text bar below',
    category: 'image-focus',
    layout: {
      type: 'rows',
      structure: [
        { size: 66, subdivisions: 1, subSizes: [100] },
        { size: 34, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 0,
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1,
      tagline: 1,
      bodyHeading: 1,
      bodyText: 1,
      cta: 1,
      footnote: 1,
    },
  },
  {
    id: 'two-thirds-bottom',
    name: 'Large Image Bottom',
    description: 'Text bar on top, image takes 2/3 below',
    category: 'image-focus',
    layout: {
      type: 'rows',
      structure: [
        { size: 34, subdivisions: 1, subSizes: [100] },
        { size: 66, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 1,
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 0,
      bodyText: 0,
      cta: 0,
      footnote: 0,
    },
  },

  // ========== BALANCED CATEGORY ==========
  {
    id: 'left-image',
    name: 'Image Left / Text Right',
    description: 'Classic 50-50 split with image on left',
    category: 'balanced',
    layout: {
      type: 'columns',
      structure: [
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 0,
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1,
      tagline: 1,
      bodyHeading: 1,
      bodyText: 1,
      cta: 1,
      footnote: 1,
    },
  },
  {
    id: 'right-image',
    name: 'Text Left / Image Right',
    description: 'Classic 50-50 split with image on right',
    category: 'balanced',
    layout: {
      type: 'columns',
      structure: [
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 1,
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 0,
      bodyText: 0,
      cta: 0,
      footnote: 0,
    },
  },
  {
    id: 'top-image',
    name: 'Image Top / Text Bottom',
    description: 'Horizontal 50-50 split with image on top',
    category: 'balanced',
    layout: {
      type: 'rows',
      structure: [
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 0,
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'start' },
      ],
    },
    textCells: {
      title: 1,
      tagline: 1,
      bodyHeading: 1,
      bodyText: 1,
      cta: 1,
      footnote: 1,
    },
  },
  {
    id: 'bottom-image',
    name: 'Text Top / Image Bottom',
    description: 'Horizontal 50-50 split with image below',
    category: 'balanced',
    layout: {
      type: 'rows',
      structure: [
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 1,
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'end' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 0,
      bodyText: 0,
      cta: 0,
      footnote: 0,
    },
  },
  {
    id: 'three-row-middle-image',
    name: 'Image Sandwich',
    description: 'Image in middle with text bars above and below',
    category: 'balanced',
    layout: {
      type: 'rows',
      structure: [
        { size: 30, subdivisions: 1, subSizes: [100] },
        { size: 40, subdivisions: 1, subSizes: [100] },
        { size: 30, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 1,
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 2,
      bodyText: 2,
      cta: 2,
      footnote: 2,
    },
  },

  // ========== TEXT FOCUS CATEGORY ==========
  {
    id: 'side-accent-left',
    name: 'Left Accent Strip',
    description: 'Narrow image strip on left, large text area',
    category: 'text-focus',
    layout: {
      type: 'columns',
      structure: [
        { size: 25, subdivisions: 1, subSizes: [100] },
        { size: 75, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 0,
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1,
      tagline: 1,
      bodyHeading: 1,
      bodyText: 1,
      cta: 1,
      footnote: 1,
    },
  },
  {
    id: 'side-accent-right',
    name: 'Right Accent Strip',
    description: 'Large text area with narrow image strip on right',
    category: 'text-focus',
    layout: {
      type: 'columns',
      structure: [
        { size: 75, subdivisions: 1, subSizes: [100] },
        { size: 25, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 1,
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 0,
      bodyText: 0,
      cta: 0,
      footnote: 0,
    },
  },
  {
    id: 'banner-top',
    name: 'Top Image Banner',
    description: 'Thin image banner at top, large text area below',
    category: 'text-focus',
    layout: {
      type: 'rows',
      structure: [
        { size: 25, subdivisions: 1, subSizes: [100] },
        { size: 75, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 0,
      textAlign: 'center',
      textVerticalAlign: 'start',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'start' },
      ],
    },
    textCells: {
      title: 1,
      tagline: 1,
      bodyHeading: 1,
      bodyText: 1,
      cta: 1,
      footnote: 1,
    },
  },
  {
    id: 'banner-bottom',
    name: 'Bottom Image Banner',
    description: 'Large text area with thin image banner at bottom',
    category: 'text-focus',
    layout: {
      type: 'rows',
      structure: [
        { size: 75, subdivisions: 1, subSizes: [100] },
        { size: 25, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 1,
      textAlign: 'center',
      textVerticalAlign: 'end',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'end' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 0,
      bodyText: 0,
      cta: 0,
      footnote: 0,
    },
  },

  // ========== GRID CATEGORY (NEW - uses nested subdivisions) ==========
  {
    id: 'image-top-split-bottom',
    name: 'Image Top + 2 Below',
    description: 'Full-width image on top, two text cells below',
    category: 'grid',
    layout: {
      type: 'rows',
      structure: [
        { size: 60, subdivisions: 1, subSizes: [100] },
        { size: 40, subdivisions: 2, subSizes: [50, 50] },
      ],
      imageCell: 0,
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1,
      tagline: 1,
      bodyHeading: 2,
      bodyText: 2,
      cta: 2,
      footnote: 2,
    },
  },
  {
    id: 'split-top-image-bottom',
    name: '2 Above + Image Bottom',
    description: 'Two text cells on top, full-width image below',
    category: 'grid',
    layout: {
      type: 'rows',
      structure: [
        { size: 40, subdivisions: 2, subSizes: [50, 50] },
        { size: 60, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 2,
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 1,
      bodyText: 1,
      cta: 1,
      footnote: 1,
    },
  },
  {
    id: 'image-left-split-right',
    name: 'Image Left + 2 Right',
    description: 'Full-height image on left, two text cells on right',
    category: 'grid',
    layout: {
      type: 'columns',
      structure: [
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 2, subSizes: [50, 50] },
      ],
      imageCell: 0,
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1,
      tagline: 1,
      bodyHeading: 2,
      bodyText: 2,
      cta: 2,
      footnote: 2,
    },
  },
  {
    id: 'split-left-image-right',
    name: '2 Left + Image Right',
    description: 'Two text cells on left, full-height image on right',
    category: 'grid',
    layout: {
      type: 'columns',
      structure: [
        { size: 50, subdivisions: 2, subSizes: [50, 50] },
        { size: 50, subdivisions: 1, subSizes: [100] },
      ],
      imageCell: 2,
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0,
      tagline: 0,
      bodyHeading: 1,
      bodyText: 1,
      cta: 1,
      footnote: 1,
    },
  },
]

// Helper function to get presets by category
export const getPresetsByCategory = (categoryId) => {
  return layoutPresets.filter(preset => preset.category === categoryId)
}

// Helper function to get layout suggestions based on image aspect ratio
export const getSuggestedLayouts = (imageAspectRatio, platform) => {
  const suggestions = []

  if (!imageAspectRatio) {
    // No image - suggest text-focused layouts
    return ['side-accent-right', 'banner-top', 'hero']
  }

  // Wide image (landscape)
  if (imageAspectRatio > 1.3) {
    suggestions.push('hero', 'top-image', 'bottom-image', 'image-top-split-bottom', 'banner-top')
  }
  // Tall image (portrait)
  else if (imageAspectRatio < 0.8) {
    suggestions.push('left-image', 'right-image', 'image-left-split-right', 'side-accent-left')
  }
  // Square-ish image
  else {
    suggestions.push('hero', 'left-image', 'right-image', 'two-thirds-left', 'image-top-split-bottom')
  }

  // Platform-specific adjustments
  if (platform === 'instagram-story' || platform === 'tiktok') {
    // Vertical formats - prioritize horizontal splits
    suggestions.unshift('top-image', 'bottom-image', 'two-thirds-top', 'image-top-split-bottom')
  }

  return [...new Set(suggestions)].slice(0, 4)
}
