// Layout presets for quick start
// Each preset defines layout settings and text group placements
// Organized into categories for better UX

// Categories for organizing presets
export const presetCategories = [
  { id: 'image-focus', name: 'Image Focus', description: 'Layouts that emphasize visual content' },
  { id: 'text-focus', name: 'Text Focus', description: 'Layouts optimized for text-heavy content' },
  { id: 'balanced', name: 'Balanced', description: 'Equal emphasis on image and text' },
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
      { type: 'rect', props: { x: 0, y: 0, width: 8, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 8, y: 0, width: 32, height: 30, fill: '#e5e7eb' } },
    ]
  },
  'side-accent-right': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 32, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 32, y: 0, width: 8, height: 30, fill: '#3b82f6' } },
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
  'center-focus': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 10, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 10, y: 0, width: 20, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 30, y: 0, width: 10, height: 30, fill: '#3b82f6' } },
    ]
  },
  'text-sandwich': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 8, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 8, width: 40, height: 14, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 22, width: 40, height: 8, fill: '#e5e7eb' } },
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
      splitType: 'none',
      sections: 2,
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: null, textVerticalAlign: null },
        { textAlign: null, textVerticalAlign: null },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: null },
      bodyGroup: { cell: null },
      cta: { cell: null },
      footnote: { cell: null },
    },
  },
  {
    id: 'hero-top',
    name: 'Hero Top Text',
    description: 'Full image with text aligned to top',
    category: 'image-focus',
    layout: {
      splitType: 'none',
      sections: 2,
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'start',
      cellAlignments: [
        { textAlign: null, textVerticalAlign: null },
        { textAlign: null, textVerticalAlign: null },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: null },
      bodyGroup: { cell: null },
      cta: { cell: null },
      footnote: { cell: null },
    },
  },
  {
    id: 'hero-bottom',
    name: 'Hero Bottom Text',
    description: 'Full image with text aligned to bottom',
    category: 'image-focus',
    layout: {
      splitType: 'none',
      sections: 2,
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'end',
      cellAlignments: [
        { textAlign: null, textVerticalAlign: null },
        { textAlign: null, textVerticalAlign: null },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: null },
      bodyGroup: { cell: null },
      cta: { cell: null },
      footnote: { cell: null },
    },
  },
  {
    id: 'two-thirds-left',
    name: 'Large Image Left',
    description: 'Image takes 2/3, text on right strip',
    category: 'image-focus',
    layout: {
      splitType: 'vertical',
      sections: 3,
      imageCells: [0, 1],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 2 },
      bodyGroup: { cell: 2 },
      cta: { cell: 2 },
      footnote: { cell: 2 },
    },
  },
  {
    id: 'two-thirds-right',
    name: 'Large Image Right',
    description: 'Text strip on left, image takes 2/3',
    category: 'image-focus',
    layout: {
      splitType: 'vertical',
      sections: 3,
      imageCells: [1, 2],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 0 },
      cta: { cell: 0 },
      footnote: { cell: 0 },
    },
  },
  {
    id: 'two-thirds-top',
    name: 'Large Image Top',
    description: 'Image takes 2/3 top, text bar below',
    category: 'image-focus',
    layout: {
      splitType: 'horizontal',
      sections: 3,
      imageCells: [0, 1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 2 },
      bodyGroup: { cell: 2 },
      cta: { cell: 2 },
      footnote: { cell: 2 },
    },
  },
  {
    id: 'two-thirds-bottom',
    name: 'Large Image Bottom',
    description: 'Text bar on top, image takes 2/3 below',
    category: 'image-focus',
    layout: {
      splitType: 'horizontal',
      sections: 3,
      imageCells: [1, 2],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 0 },
      cta: { cell: 0 },
      footnote: { cell: 0 },
    },
  },

  // ========== BALANCED CATEGORY ==========
  {
    id: 'left-image',
    name: 'Image Left / Text Right',
    description: 'Classic 50-50 split with image on left',
    category: 'balanced',
    layout: {
      splitType: 'vertical',
      sections: 2,
      imageCells: [0],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: 1 },
      bodyGroup: { cell: 1 },
      cta: { cell: 1 },
      footnote: { cell: 1 },
    },
  },
  {
    id: 'right-image',
    name: 'Text Left / Image Right',
    description: 'Classic 50-50 split with image on right',
    category: 'balanced',
    layout: {
      splitType: 'vertical',
      sections: 2,
      imageCells: [1],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 0 },
      cta: { cell: 0 },
      footnote: { cell: 0 },
    },
  },
  {
    id: 'top-image',
    name: 'Image Top / Text Bottom',
    description: 'Horizontal 50-50 split with image on top',
    category: 'balanced',
    layout: {
      splitType: 'horizontal',
      sections: 2,
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'start' },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: 1 },
      bodyGroup: { cell: 1 },
      cta: { cell: 1 },
      footnote: { cell: 1 },
    },
  },
  {
    id: 'bottom-image',
    name: 'Text Top / Image Bottom',
    description: 'Horizontal 50-50 split with image below',
    category: 'balanced',
    layout: {
      splitType: 'horizontal',
      sections: 2,
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'end' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: null, textVerticalAlign: null },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 0 },
      cta: { cell: 0 },
      footnote: { cell: 0 },
    },
  },
  {
    id: 'text-sandwich',
    name: 'Image Sandwich',
    description: 'Image in middle with text bars above and below',
    category: 'balanced',
    layout: {
      splitType: 'horizontal',
      sections: 3,
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 2 },
      cta: { cell: 2 },
      footnote: { cell: 2 },
    },
  },

  // ========== TEXT FOCUS CATEGORY ==========
  {
    id: 'side-accent-left',
    name: 'Left Accent Strip',
    description: 'Narrow image strip on left, large text area',
    category: 'text-focus',
    layout: {
      splitType: 'vertical',
      sections: 3,
      imageCells: [0],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 1 },
      bodyGroup: { cell: 2 },
      cta: { cell: 2 },
      footnote: { cell: 2 },
    },
  },
  {
    id: 'side-accent-right',
    name: 'Right Accent Strip',
    description: 'Large text area with narrow image strip on right',
    category: 'text-focus',
    layout: {
      splitType: 'vertical',
      sections: 3,
      imageCells: [2],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 1 },
      cta: { cell: 1 },
      footnote: { cell: 1 },
    },
  },
  {
    id: 'banner-top',
    name: 'Top Image Banner',
    description: 'Thin image banner at top, large text area below',
    category: 'text-focus',
    layout: {
      splitType: 'horizontal',
      sections: 3,
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'start',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'start' },
        { textAlign: 'center', textVerticalAlign: 'start' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 1 },
      bodyGroup: { cell: 2 },
      cta: { cell: 2 },
      footnote: { cell: 2 },
    },
  },
  {
    id: 'banner-bottom',
    name: 'Bottom Image Banner',
    description: 'Large text area with thin image banner at bottom',
    category: 'text-focus',
    layout: {
      splitType: 'horizontal',
      sections: 3,
      imageCells: [2],
      textAlign: 'center',
      textVerticalAlign: 'end',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'end' },
        { textAlign: 'center', textVerticalAlign: 'end' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 0 },
      bodyGroup: { cell: 1 },
      cta: { cell: 1 },
      footnote: { cell: 1 },
    },
  },
  {
    id: 'center-focus',
    name: 'Center Text Focus',
    description: 'Image strips on sides, text in center column',
    category: 'text-focus',
    layout: {
      splitType: 'vertical',
      sections: 3,
      imageCells: [0, 2],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textGroups: {
      titleGroup: { cell: 1 },
      bodyGroup: { cell: 1 },
      cta: { cell: 1 },
      footnote: { cell: 1 },
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
    return ['side-accent-right', 'banner-top', 'center-focus']
  }

  // Wide image (landscape)
  if (imageAspectRatio > 1.3) {
    suggestions.push('hero', 'top-image', 'bottom-image', 'banner-top', 'banner-bottom')
  }
  // Tall image (portrait)
  else if (imageAspectRatio < 0.8) {
    suggestions.push('left-image', 'right-image', 'side-accent-left', 'side-accent-right')
  }
  // Square-ish image
  else {
    suggestions.push('hero', 'left-image', 'right-image', 'two-thirds-left', 'two-thirds-right')
  }

  // Platform-specific adjustments
  if (platform === 'instagram-story' || platform === 'tiktok') {
    // Vertical formats - prioritize horizontal splits
    suggestions.unshift('top-image', 'bottom-image', 'two-thirds-top', 'text-sandwich')
  }

  return [...new Set(suggestions)].slice(0, 4) // Return unique top 4 suggestions
}

// Helper to flip a layout horizontally (swap left/right)
export const flipLayoutHorizontal = (layout, textGroups) => {
  if (layout.splitType !== 'vertical') return { layout, textGroups }

  const newImageCells = layout.imageCells.map(cell => layout.sections - 1 - cell).sort((a, b) => a - b)
  const newCellAlignments = [...layout.cellAlignments].reverse()

  // Flip text group cell assignments
  const newTextGroups = { ...textGroups }
  Object.keys(newTextGroups).forEach(key => {
    if (newTextGroups[key].cell !== null) {
      newTextGroups[key] = { cell: layout.sections - 1 - newTextGroups[key].cell }
    }
  })

  return {
    layout: { ...layout, imageCells: newImageCells, cellAlignments: newCellAlignments },
    textGroups: newTextGroups,
  }
}

// Helper to flip a layout vertically (swap top/bottom)
export const flipLayoutVertical = (layout, textGroups) => {
  if (layout.splitType !== 'horizontal') return { layout, textGroups }

  const newImageCells = layout.imageCells.map(cell => layout.sections - 1 - cell).sort((a, b) => a - b)
  const newCellAlignments = [...layout.cellAlignments].reverse()

  // Flip text group cell assignments
  const newTextGroups = { ...textGroups }
  Object.keys(newTextGroups).forEach(key => {
    if (newTextGroups[key].cell !== null) {
      newTextGroups[key] = { cell: layout.sections - 1 - newTextGroups[key].cell }
    }
  })

  return {
    layout: { ...layout, imageCells: newImageCells, cellAlignments: newCellAlignments },
    textGroups: newTextGroups,
  }
}

// Helper to rotate layout (columns <-> rows)
export const rotateLayout = (layout) => {
  if (layout.splitType === 'none') return layout

  return {
    ...layout,
    splitType: layout.splitType === 'vertical' ? 'horizontal' : 'vertical',
  }
}
