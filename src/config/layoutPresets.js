// Layout presets for quick start
// Each preset defines layout settings and text group placements
// Using the new nested grid structure

// Categories for organizing presets
export const presetCategories = [
  { id: 'basic', name: 'Basic', description: 'Simple foundational layouts' },
  { id: 'split', name: 'Split', description: 'Two-zone layouts with varied proportions' },
  { id: 'grid', name: 'Grid', description: 'Multi-cell complex layouts' },
  { id: 'asymmetric', name: 'Asymmetric', description: 'Creative uneven arrangements' },
]

// Aspect ratio categories for filtering
export const aspectRatioCategories = [
  { id: 'all', name: 'All' },
  { id: 'square', name: 'Square' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'landscape', name: 'Landscape' },
]

// SVG icon definitions for each preset (rendered as small preview diagrams)
// Blue (#3b82f6) = image area, Gray (#e5e7eb) = text area, Darker gray (#d1d5db) = secondary text
export const presetIcons = {
  // ===== BASIC =====
  'hero': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 8, y: 10, width: 24, height: 10, fill: '#e5e7eb', opacity: 0.8 } },
    ]
  },
  'split-horizontal': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 15, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 15, width: 40, height: 15, fill: '#e5e7eb' } },
    ]
  },
  'split-vertical': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 30, fill: '#e5e7eb' } },
    ]
  },

  // ===== SPLIT VARIATIONS =====
  'golden-left': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 25, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 25, y: 0, width: 15, height: 30, fill: '#e5e7eb' } },
    ]
  },
  'golden-right': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 15, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 15, y: 0, width: 25, height: 30, fill: '#3b82f6' } },
    ]
  },
  'golden-top': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 19, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 19, width: 40, height: 11, fill: '#e5e7eb' } },
    ]
  },
  'golden-bottom': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 11, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 11, width: 40, height: 19, fill: '#3b82f6' } },
    ]
  },
  'thirds-horizontal': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 10, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 10, width: 40, height: 10, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 20, width: 40, height: 10, fill: '#d1d5db' } },
    ]
  },
  'thirds-vertical': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 13, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 13, y: 0, width: 14, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 27, y: 0, width: 13, height: 30, fill: '#d1d5db' } },
    ]
  },

  // ===== GRID LAYOUTS =====
  'quad-grid': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 15, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 15, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 15, width: 20, height: 15, fill: '#d1d5db' } },
      { type: 'rect', props: { x: 20, y: 15, width: 20, height: 15, fill: '#3b82f6' } },
    ]
  },
  'l-shape-right': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 24, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 24, y: 0, width: 16, height: 15, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 24, y: 15, width: 16, height: 15, fill: '#d1d5db' } },
    ]
  },
  'l-shape-left': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 16, height: 15, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 15, width: 16, height: 15, fill: '#d1d5db' } },
      { type: 'rect', props: { x: 16, y: 0, width: 24, height: 30, fill: '#3b82f6' } },
    ]
  },
  'l-shape-bottom': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 18, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 18, width: 20, height: 12, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 20, y: 18, width: 20, height: 12, fill: '#d1d5db' } },
    ]
  },
  'l-shape-top': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 12, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 12, fill: '#d1d5db' } },
      { type: 'rect', props: { x: 0, y: 12, width: 40, height: 18, fill: '#3b82f6' } },
    ]
  },
  't-layout': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 10, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 10, width: 20, height: 20, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 20, y: 10, width: 20, height: 20, fill: '#d1d5db' } },
    ]
  },
  'inverted-t': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 20, height: 20, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 20, y: 0, width: 20, height: 20, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 20, width: 40, height: 10, fill: '#d1d5db' } },
    ]
  },
  'feature-center': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 10, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 10, y: 0, width: 20, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 30, y: 0, width: 10, height: 30, fill: '#d1d5db' } },
    ]
  },
  'feature-middle': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 8, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 8, width: 40, height: 14, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 22, width: 40, height: 8, fill: '#d1d5db' } },
    ]
  },

  // ===== ASYMMETRIC LAYOUTS =====
  'mosaic-left': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 24, height: 20, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 24, y: 0, width: 16, height: 20, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 20, width: 40, height: 10, fill: '#d1d5db' } },
    ]
  },
  'mosaic-right': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 16, height: 20, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 16, y: 0, width: 24, height: 20, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 20, width: 40, height: 10, fill: '#d1d5db' } },
    ]
  },
  'stacked-quad': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 8, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 8, width: 40, height: 8, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 16, width: 40, height: 8, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 24, width: 40, height: 6, fill: '#c4c9cf' } },
    ]
  },
  'sidebar-stack': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 12, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 12, y: 0, width: 28, height: 10, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 12, y: 10, width: 28, height: 10, fill: '#d1d5db' } },
      { type: 'rect', props: { x: 12, y: 20, width: 28, height: 10, fill: '#c4c9cf' } },
    ]
  },
  'header-quad': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 10, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 10, width: 20, height: 10, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 20, y: 10, width: 20, height: 10, fill: '#d1d5db' } },
      { type: 'rect', props: { x: 0, y: 20, width: 20, height: 10, fill: '#c4c9cf' } },
      { type: 'rect', props: { x: 20, y: 20, width: 20, height: 10, fill: '#3b82f6' } },
    ]
  },
  'wide-feature': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 8, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 8, y: 0, width: 8, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 16, y: 0, width: 16, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 32, y: 0, width: 8, height: 30, fill: '#c4c9cf' } },
    ]
  },
  'tall-feature': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 40, height: 6, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 6, width: 40, height: 6, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 12, width: 40, height: 12, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 0, y: 24, width: 40, height: 6, fill: '#c4c9cf' } },
    ]
  },
  'columns-four': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 10, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 10, y: 0, width: 10, height: 30, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 20, y: 0, width: 10, height: 30, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 30, y: 0, width: 10, height: 30, fill: '#c4c9cf' } },
    ]
  },
  'asymmetric-grid': {
    viewBox: '0 0 40 30',
    elements: [
      { type: 'rect', props: { x: 0, y: 0, width: 25, height: 18, fill: '#3b82f6' } },
      { type: 'rect', props: { x: 25, y: 0, width: 15, height: 18, fill: '#e5e7eb' } },
      { type: 'rect', props: { x: 0, y: 18, width: 15, height: 12, fill: '#d1d5db' } },
      { type: 'rect', props: { x: 15, y: 18, width: 25, height: 12, fill: '#3b82f6' } },
    ]
  },
}

export const layoutPresets = [
  // ========== BASIC CATEGORY (Essential foundations) ==========
  {
    id: 'hero',
    name: 'Full Bleed',
    description: 'Full image with centered text overlay',
    category: 'basic',
    aspectRatios: ['square', 'portrait', 'landscape'],
    layout: {
      type: 'fullbleed',
      structure: [{ size: 100, subdivisions: 1, subSizes: [100] }],
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [],
    },
    textCells: {
      title: null, tagline: null, bodyHeading: null, bodyText: null, cta: null, footnote: null,
    },
  },
  {
    id: 'split-horizontal',
    name: 'Top / Bottom',
    description: 'Image top, text bottom - clean separation',
    category: 'basic',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 1, bodyText: 1, cta: 1, footnote: 1,
    },
  },
  {
    id: 'split-vertical',
    name: 'Left / Right',
    description: 'Image left, text right - classic layout',
    category: 'basic',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [0],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 1, bodyText: 1, cta: 1, footnote: 1,
    },
  },

  // ========== SPLIT CATEGORY (Two-zone with varied proportions) ==========
  {
    id: 'golden-left',
    name: 'Golden Left',
    description: 'Large image left (62%), text panel right',
    category: 'split',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 62, subdivisions: 1, subSizes: [100] },
        { size: 38, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [0],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 1, bodyText: 1, cta: 1, footnote: 1,
    },
  },
  {
    id: 'golden-right',
    name: 'Golden Right',
    description: 'Text panel left, large image right (62%)',
    category: 'split',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 38, subdivisions: 1, subSizes: [100] },
        { size: 62, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 0, bodyText: 0, cta: 0, footnote: 0,
    },
  },
  {
    id: 'golden-top',
    name: 'Golden Top',
    description: 'Large image top (62%), text bar below',
    category: 'split',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 62, subdivisions: 1, subSizes: [100] },
        { size: 38, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 1, bodyText: 1, cta: 1, footnote: 1,
    },
  },
  {
    id: 'golden-bottom',
    name: 'Golden Bottom',
    description: 'Text bar top, large image below (62%)',
    category: 'split',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 38, subdivisions: 1, subSizes: [100] },
        { size: 62, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 0, bodyText: 0, cta: 0, footnote: 0,
    },
  },
  {
    id: 'thirds-horizontal',
    name: 'Three Rows',
    description: 'Header, image center, footer - sandwich layout',
    category: 'split',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 33, subdivisions: 1, subSizes: [100] },
        { size: 34, subdivisions: 1, subSizes: [100] },
        { size: 33, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'thirds-vertical',
    name: 'Three Columns',
    description: 'Sidebar, center image, sidebar - flanked layout',
    category: 'split',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 33, subdivisions: 1, subSizes: [100] },
        { size: 34, subdivisions: 1, subSizes: [100] },
        { size: 33, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },

  // ========== GRID CATEGORY (Multi-cell layouts) ==========
  {
    id: 'quad-grid',
    name: '2×2 Grid',
    description: 'Four equal cells - diagonal images layout',
    category: 'grid',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'rows',
      structure: [
        { size: 50, subdivisions: 2, subSizes: [50, 50] },
        { size: 50, subdivisions: 2, subSizes: [50, 50] },
      ],
      imageCells: [0, 3],  // Diagonal: top-left and bottom-right
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'l-shape-right',
    name: 'L-Shape Right',
    description: 'Large image left, two text cells stacked right',
    category: 'grid',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 60, subdivisions: 1, subSizes: [100] },
        { size: 40, subdivisions: 2, subSizes: [50, 50] },
      ],
      imageCells: [0],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'end' },
        { textAlign: 'left', textVerticalAlign: 'start' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'l-shape-left',
    name: 'L-Shape Left',
    description: 'Two text cells stacked left, large image right',
    category: 'grid',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 40, subdivisions: 2, subSizes: [50, 50] },
        { size: 60, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [2],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'end' },
        { textAlign: 'left', textVerticalAlign: 'start' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 1, bodyText: 1, cta: 1, footnote: 1,
    },
  },
  {
    id: 'l-shape-bottom',
    name: 'L-Shape Bottom',
    description: 'Large image top, two text cells below',
    category: 'grid',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 60, subdivisions: 1, subSizes: [100] },
        { size: 40, subdivisions: 2, subSizes: [50, 50] },
      ],
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'l-shape-top',
    name: 'L-Shape Top',
    description: 'Two text cells top, large image below',
    category: 'grid',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 40, subdivisions: 2, subSizes: [50, 50] },
        { size: 60, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [2],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 1, bodyText: 1, cta: 1, footnote: 1,
    },
  },
  {
    id: 't-layout',
    name: 'T-Layout',
    description: 'Header bar, then image and text side by side',
    category: 'grid',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 30, subdivisions: 1, subSizes: [100] },
        { size: 70, subdivisions: 2, subSizes: [50, 50] },
      ],
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'inverted-t',
    name: 'Inverted T',
    description: 'Image and text side by side, then footer bar',
    category: 'grid',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 70, subdivisions: 2, subSizes: [50, 50] },
        { size: 30, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'feature-center',
    name: 'Center Feature',
    description: 'Narrow sidebars with wide center image',
    category: 'grid',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 25, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 25, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'feature-middle',
    name: 'Middle Feature',
    description: 'Thin bars top/bottom, wide image center',
    category: 'grid',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 20, subdivisions: 1, subSizes: [100] },
        { size: 60, subdivisions: 1, subSizes: [100] },
        { size: 20, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },

  // ========== ASYMMETRIC CATEGORY (Creative arrangements) ==========
  {
    id: 'mosaic-left',
    name: 'Mosaic Left',
    description: 'Large image with small cells wrapped around',
    category: 'asymmetric',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 65, subdivisions: 2, subSizes: [60, 40] },
        { size: 35, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [0],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'mosaic-right',
    name: 'Mosaic Right',
    description: 'Small cells left, large image right with footer',
    category: 'asymmetric',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 65, subdivisions: 2, subSizes: [40, 60] },
        { size: 35, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1],
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
  {
    id: 'stacked-quad',
    name: 'Four Rows',
    description: 'Four stacked rows - dual image story layout',
    category: 'asymmetric',
    aspectRatios: ['portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 20, subdivisions: 1, subSizes: [100] },
        { size: 35, subdivisions: 1, subSizes: [100] },
        { size: 30, subdivisions: 1, subSizes: [100] },
        { size: 15, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1, 2],  // Two images stacked
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 1, bodyText: 1, cta: 3, footnote: 3,
    },
  },
  {
    id: 'sidebar-stack',
    name: 'Sidebar + Stack',
    description: 'Image sidebar with three stacked text rows',
    category: 'asymmetric',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 35, subdivisions: 1, subSizes: [100] },
        { size: 65, subdivisions: 3, subSizes: [33, 34, 33] },
      ],
      imageCells: [0],
      textAlign: 'left',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 3, footnote: 3,
    },
  },
  {
    id: 'header-quad',
    name: 'Header + 2×2',
    description: 'Header row with two images in grid below',
    category: 'asymmetric',
    aspectRatios: ['square', 'portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 30, subdivisions: 1, subSizes: [100] },
        { size: 35, subdivisions: 2, subSizes: [50, 50] },
        { size: 35, subdivisions: 2, subSizes: [50, 50] },
      ],
      imageCells: [1, 4],  // Top-left and bottom-right of grid
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 2, bodyText: 2, cta: 3, footnote: 3,
    },
  },
  {
    id: 'wide-feature',
    name: 'Wide Feature',
    description: 'Four columns with two images',
    category: 'asymmetric',
    aspectRatios: ['landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 20, subdivisions: 1, subSizes: [100] },
        { size: 20, subdivisions: 1, subSizes: [100] },
        { size: 40, subdivisions: 1, subSizes: [100] },
        { size: 20, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [0, 2],  // First column and wide feature
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 3, footnote: 3,
    },
  },
  {
    id: 'tall-feature',
    name: 'Tall Feature',
    description: 'Four rows with two images',
    category: 'asymmetric',
    aspectRatios: ['portrait'],
    layout: {
      type: 'rows',
      structure: [
        { size: 15, subdivisions: 1, subSizes: [100] },
        { size: 20, subdivisions: 1, subSizes: [100] },
        { size: 45, subdivisions: 1, subSizes: [100] },
        { size: 20, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [1, 2],  // Second row and tall feature
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 0, tagline: 0, bodyHeading: 2, bodyText: 2, cta: 3, footnote: 3,
    },
  },
  {
    id: 'columns-four',
    name: 'Four Columns',
    description: 'Four columns with alternating images',
    category: 'asymmetric',
    aspectRatios: ['landscape'],
    layout: {
      type: 'columns',
      structure: [
        { size: 25, subdivisions: 1, subSizes: [100] },
        { size: 25, subdivisions: 1, subSizes: [100] },
        { size: 25, subdivisions: 1, subSizes: [100] },
        { size: 25, subdivisions: 1, subSizes: [100] },
      ],
      imageCells: [0, 2],  // Alternating: image, text, image, text
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 3, footnote: 3,
    },
  },
  {
    id: 'asymmetric-grid',
    name: 'Asymmetric Grid',
    description: 'Uneven 2×2 grid with diagonal images',
    category: 'asymmetric',
    aspectRatios: ['square', 'landscape'],
    layout: {
      type: 'rows',
      structure: [
        { size: 60, subdivisions: 2, subSizes: [62, 38] },
        { size: 40, subdivisions: 2, subSizes: [38, 62] },
      ],
      imageCells: [0, 3],  // Diagonal: large top-left and large bottom-right
      textAlign: 'center',
      textVerticalAlign: 'center',
      cellAlignments: [
        { textAlign: 'center', textVerticalAlign: 'center' },
        { textAlign: 'left', textVerticalAlign: 'center' },
        { textAlign: 'right', textVerticalAlign: 'center' },
        { textAlign: 'center', textVerticalAlign: 'center' },
      ],
    },
    textCells: {
      title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2,
    },
  },
]

// Helper function to get presets by category
export const getPresetsByCategory = (categoryId) => {
  return layoutPresets.filter(preset => preset.category === categoryId)
}

// Helper function to get presets by aspect ratio
export const getPresetsByAspectRatio = (aspectRatioId) => {
  if (aspectRatioId === 'all') return layoutPresets
  return layoutPresets.filter(preset => preset.aspectRatios?.includes(aspectRatioId))
}

// Helper function to get layout suggestions based on image aspect ratio
export const getSuggestedLayouts = (imageAspectRatio, platform) => {
  const suggestions = []

  if (!imageAspectRatio) {
    // No image - suggest text-focused layouts
    return ['hero', 'split-vertical', 'l-shape-right']
  }

  // Wide image (landscape)
  if (imageAspectRatio > 1.3) {
    suggestions.push('hero', 'split-vertical', 'golden-left', 'l-shape-right', 'feature-center')
  }
  // Tall image (portrait)
  else if (imageAspectRatio < 0.8) {
    suggestions.push('hero', 'split-horizontal', 'golden-top', 'l-shape-bottom', 't-layout')
  }
  // Square-ish image
  else {
    suggestions.push('hero', 'quad-grid', 'l-shape-right', 'l-shape-bottom', 'mosaic-left')
  }

  // Platform-specific adjustments
  if (platform === 'instagram-story' || platform === 'tiktok') {
    // Vertical formats - prioritize horizontal splits
    suggestions.unshift('split-horizontal', 'golden-top', 't-layout', 'stacked-quad')
  }

  return [...new Set(suggestions)].slice(0, 5)
}
