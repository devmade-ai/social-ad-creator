// Looks presets - layout-aware visual styles
// Each Look defines how it should appear on each layout preset
// Settings include: fonts, image filters, and per-layout overlay/alignment

// Default image filters (no effect)
const defaultFilters = { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 }

// Helper to create overlay config
const overlay = (type, color, opacity) => ({ type, color, opacity })

// All layout keys used in the app
const ALL_LAYOUTS = [
  'hero', 'split-horizontal', 'split-vertical',
  'golden-left', 'golden-right', 'golden-top', 'golden-bottom',
  'thirds-horizontal', 'thirds-vertical',
  'quad-grid', 'l-shape-right', 'l-shape-left', 'l-shape-bottom', 'l-shape-top',
  't-layout', 'inverted-t', 'feature-center', 'feature-middle',
  'mosaic-left', 'mosaic-right', 'stacked-quad', 'sidebar-stack',
  'header-quad', 'wide-feature', 'tall-feature', 'columns-four', 'asymmetric-grid',
]

// Helper to generate layout objects from defaults + overrides
// Reduces boilerplate: specify a base style, then override specific layouts
const buildLayouts = (base, overrides = {}) => {
  const result = {}
  for (const key of ALL_LAYOUTS) {
    result[key] = overrides[key] || base
  }
  return result
}

// ============================================================================
// CLEAN LOOK - Minimal overlay, crisp and clear
// Philosophy: Let the content speak, subtle enhancements only where needed
// ============================================================================
const cleanLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-horizontal': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// MINIMAL LOOK - Ultra-light touch, content first
// Philosophy: Almost invisible styling, modern left-aligned aesthetic
// ============================================================================
const minimalLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('solid', 'secondary', 5),
    textAlign: 'left',
    textVerticalAlign: 'end',
  },
  'split-horizontal': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('solid', 'primary', 0),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// SOFT LOOK - Gentle gradient, easy on the eyes
// Philosophy: Smooth gradients toward text, comfortable viewing
// ============================================================================
const softLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('gradient-up', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'end',
  },
  'split-horizontal': {
    imageOverlay: overlay('gradient-down', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('gradient-right', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('gradient-right', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('gradient-left', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('gradient-down', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('gradient-up', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('gradient-right', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('gradient-left', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('gradient-down', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('gradient-up', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('gradient-up', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('gradient-down', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('gradient-right', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('gradient-left', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('gradient-right', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// BOLD LOOK - Strong gradient, high impact
// Philosophy: Make a statement with strong gradients and contrast
// ============================================================================
const boldLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('gradient-up', 'primary', 70),
    textAlign: 'center',
    textVerticalAlign: 'end',
  },
  'split-horizontal': {
    imageOverlay: overlay('gradient-down', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('gradient-right', 'primary', 40),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('gradient-right', 'primary', 40),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('gradient-left', 'primary', 40),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('gradient-down', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('gradient-up', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('solid', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('solid', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('solid', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('gradient-right', 'primary', 45),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('gradient-left', 'primary', 45),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('gradient-down', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('gradient-up', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('gradient-up', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('solid', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('solid', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('gradient-right', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('gradient-left', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('solid', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('gradient-right', 'primary', 45),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('solid', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('solid', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('solid', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('solid', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('solid', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// DRAMATIC LOOK - Deep vignette, cinematic feel
// Philosophy: Focus attention with vignette, high contrast
// ============================================================================
const dramaticLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('vignette', 'primary', 60),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-horizontal': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('vignette', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// PUNCH LOOK - Top-heavy gradient, attention-grabbing
// Philosophy: Reverse gradient from top, text at top for impact
// ============================================================================
const punchLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('gradient-down', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'split-horizontal': {
    imageOverlay: overlay('gradient-up', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('gradient-left', 'primary', 35),
    textAlign: 'right',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('gradient-left', 'primary', 35),
    textAlign: 'right',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('gradient-right', 'primary', 35),
    textAlign: 'right',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('gradient-up', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('gradient-down', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('gradient-down', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('gradient-down', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('gradient-left', 'primary', 40),
    textAlign: 'right',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('gradient-right', 'primary', 40),
    textAlign: 'right',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('gradient-up', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('gradient-down', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'inverted-t': {
    imageOverlay: overlay('gradient-up', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'feature-center': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'feature-middle': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('gradient-down', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'mosaic-right': {
    imageOverlay: overlay('gradient-down', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'stacked-quad': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'sidebar-stack': {
    imageOverlay: overlay('gradient-right', 'primary', 40),
    textAlign: 'right',
    textVerticalAlign: 'start',
  },
  'header-quad': {
    imageOverlay: overlay('gradient-down', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'wide-feature': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'tall-feature': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'columns-four': {
    imageOverlay: overlay('gradient-down', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('gradient-down', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'start',
  },
}

// ============================================================================
// VINTAGE LOOK - Warm sepia tones, nostalgic feel
// Philosophy: Old photo warmth, soft vignette, classic serif fonts
// ============================================================================
const vintageLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-horizontal': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('vignette', 'primary', 20),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('vignette', 'primary', 20),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('vignette', 'primary', 20),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('vignette', 'primary', 20),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('vignette', 'primary', 20),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('vignette', 'primary', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// RETRO LOOK - Faded colors, throwback vibes
// Philosophy: 70s/80s aesthetic with accent color gradients
// ============================================================================
const retroLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('gradient-up', 'accent', 40),
    textAlign: 'center',
    textVerticalAlign: 'end',
  },
  'split-horizontal': {
    imageOverlay: overlay('gradient-down', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('gradient-right', 'accent', 30),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('gradient-right', 'accent', 30),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('gradient-left', 'accent', 30),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('gradient-down', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('gradient-up', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('solid', 'accent', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('solid', 'accent', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('solid', 'accent', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('gradient-right', 'accent', 35),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('gradient-left', 'accent', 35),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('gradient-down', 'accent', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('gradient-up', 'accent', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('gradient-up', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('gradient-down', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('solid', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('solid', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('gradient-right', 'accent', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('gradient-left', 'accent', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('solid', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('gradient-right', 'accent', 35),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('solid', 'accent', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('solid', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('solid', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('solid', 'accent', 25),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('solid', 'accent', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// FILM LOOK - Classic film look with grain effect
// Philosophy: Analog photography with grain texture
// ============================================================================
const filmLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('film-grain', 'primary', 20),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-horizontal': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('film-grain', 'primary', 12),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('film-grain', 'primary', 12),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('film-grain', 'primary', 12),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('film-grain', 'primary', 12),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('film-grain', 'primary', 18),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('film-grain', 'primary', 12),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('film-grain', 'primary', 15),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// NOIR LOOK - Black & white, dramatic contrast
// Philosophy: High contrast B&W with strong vignette
// ============================================================================
const noirLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('vignette', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'end',
  },
  'split-horizontal': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('vignette', 'primary', 40),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('vignette', 'primary', 30),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('vignette', 'primary', 35),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// MONO LOOK - Subtle grayscale, modern feel
// Philosophy: Contemporary minimalist B&W with clean lines
// ============================================================================
const monoLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('solid', 'primary', 20),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'split-horizontal': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('solid', 'primary', 8),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('solid', 'primary', 8),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('solid', 'primary', 8),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('solid', 'primary', 8),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('solid', 'primary', 15),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('solid', 'primary', 8),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('solid', 'primary', 10),
    textAlign: 'left',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// DUOTONE LOOK - Two-color effect, stylized look
// Philosophy: Modern graphic design with duotone overlay
// ============================================================================
const duotoneLayouts = {
  // ----- BASIC -----
  'hero': {
    imageOverlay: overlay('duotone', 'primary', 60),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-horizontal': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'split-vertical': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- SPLIT VARIATIONS -----
  'golden-left': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-right': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-top': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'golden-bottom': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-horizontal': {
    imageOverlay: overlay('duotone', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'thirds-vertical': {
    imageOverlay: overlay('duotone', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- GRID LAYOUTS -----
  'quad-grid': {
    imageOverlay: overlay('duotone', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-right': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-left': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-bottom': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'l-shape-top': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  't-layout': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'inverted-t': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-center': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'feature-middle': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  // ----- ASYMMETRIC LAYOUTS -----
  'mosaic-left': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'mosaic-right': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'stacked-quad': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'sidebar-stack': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'header-quad': {
    imageOverlay: overlay('duotone', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'wide-feature': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'tall-feature': {
    imageOverlay: overlay('duotone', 'primary', 55),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'columns-four': {
    imageOverlay: overlay('duotone', 'primary', 45),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  'asymmetric-grid': {
    imageOverlay: overlay('duotone', 'primary', 50),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
}

// ============================================================================
// TEXT STYLES PER LOOK CATEGORY
// Defined before lookPresets to avoid TDZ (Temporal Dead Zone) with const.
// ============================================================================

// Clean/Minimal — neutral, let content speak
const cleanTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'secondary', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Soft — same palette as clean but slightly lighter feel
const softTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'accent', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Bold — strong contrast, heavy titles
const boldTextStyles = {
  title: { color: 'white', bold: true },
  tagline: { color: 'off-white', bold: false },
  bodyHeading: { color: 'white', bold: true },
  bodyText: { color: 'off-white', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Dramatic — cinematic, high-contrast text
const dramaticTextStyles = {
  title: { color: 'white', bold: true },
  tagline: { color: 'light-gray', bold: false },
  bodyHeading: { color: 'white', bold: true },
  bodyText: { color: 'off-white', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Punch — attention-grabbing, accent-heavy
const punchTextStyles = {
  title: { color: 'white', bold: true },
  tagline: { color: 'accent', bold: true },
  bodyHeading: { color: 'white', bold: true },
  bodyText: { color: 'off-white', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'off-white', bold: false },
}

// Vintage — warm, classic serif feel
const vintageTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'accent', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Retro — faded, throwback
const retroTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'secondary', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Film — classic film, muted elegance
const filmTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'secondary', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Noir — high-contrast B&W, dramatic
const noirTextStyles = {
  title: { color: 'white', bold: true },
  tagline: { color: 'off-white', bold: false },
  bodyHeading: { color: 'white', bold: true },
  bodyText: { color: 'light-gray', bold: false },
  cta: { color: 'white', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Monochrome — subtle grayscale, modern
const monoTextStyles = {
  title: { color: 'white', bold: true },
  tagline: { color: 'light-gray', bold: false },
  bodyHeading: { color: 'white', bold: true },
  bodyText: { color: 'light-gray', bold: false },
  cta: { color: 'off-white', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// Duotone — two-color stylized, accent-driven
const duotoneTextStyles = {
  title: { color: 'white', bold: true },
  tagline: { color: 'accent', bold: false },
  bodyHeading: { color: 'white', bold: true },
  bodyText: { color: 'off-white', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// ============================================================================
// WORDPRESS-ERA LOOK PRESETS
// Requirement: Visual looks inspired by WordPress default theme design eras
// Approach: Font pairings, filter aesthetics, and overlay styles from WP themes
// Alternatives:
//   - Exact WP reproduction: Rejected — CanvaGrid overlays differ from WP CSS
//   - Single "WordPress" look: Rejected — WP spans 15 years of distinct aesthetics
// ============================================================================

// --- Editorial (TT24 style) — warm, refined, serif headings ---
const editorialLayouts = buildLayouts(
  { imageOverlay: overlay('solid', 'primary', 10), textAlign: 'left', textVerticalAlign: 'center' },
  {
    'hero': { imageOverlay: overlay('gradient-bottom', 'primary', 35), textAlign: 'center', textVerticalAlign: 'end' },
    'split-horizontal': { imageOverlay: overlay('solid', 'primary', 8), textAlign: 'left', textVerticalAlign: 'center' },
    'golden-left': { imageOverlay: overlay('solid', 'primary', 8), textAlign: 'left', textVerticalAlign: 'center' },
    'golden-right': { imageOverlay: overlay('solid', 'primary', 8), textAlign: 'left', textVerticalAlign: 'center' },
    'wide-feature': { imageOverlay: overlay('gradient-bottom', 'primary', 30), textAlign: 'center', textVerticalAlign: 'end' },
    'tall-feature': { imageOverlay: overlay('gradient-bottom', 'primary', 30), textAlign: 'left', textVerticalAlign: 'end' },
  }
)
const editorialTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'accent', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'gray', bold: false },
}

// --- Pastel (TT21 style) — soft, airy, system sans feel ---
const pastelLayouts = buildLayouts(
  { imageOverlay: overlay('solid', 'primary', 12), textAlign: 'center', textVerticalAlign: 'center' },
  {
    'hero': { imageOverlay: overlay('radial-soft', 'primary', 20), textAlign: 'center', textVerticalAlign: 'center' },
    'split-vertical': { imageOverlay: overlay('solid', 'primary', 10), textAlign: 'left', textVerticalAlign: 'center' },
    'golden-left': { imageOverlay: overlay('solid', 'primary', 10), textAlign: 'left', textVerticalAlign: 'center' },
    'golden-right': { imageOverlay: overlay('solid', 'primary', 10), textAlign: 'left', textVerticalAlign: 'center' },
    'sidebar-stack': { imageOverlay: overlay('solid', 'primary', 8), textAlign: 'left', textVerticalAlign: 'center' },
  }
)
const pastelTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'secondary', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'dark-gray', bold: false },
}

// --- Typeset (TT16 style) — classic blog feel, serif + sans pairing ---
const typesetLayouts = buildLayouts(
  { imageOverlay: overlay('solid', 'primary', 15), textAlign: 'left', textVerticalAlign: 'center' },
  {
    'hero': { imageOverlay: overlay('gradient-bottom', 'primary', 40), textAlign: 'left', textVerticalAlign: 'end' },
    'split-horizontal': { imageOverlay: overlay('solid', 'primary', 12), textAlign: 'left', textVerticalAlign: 'center' },
    'split-vertical': { imageOverlay: overlay('solid', 'primary', 12), textAlign: 'left', textVerticalAlign: 'center' },
    'wide-feature': { imageOverlay: overlay('gradient-bottom', 'primary', 35), textAlign: 'left', textVerticalAlign: 'end' },
    'quad-grid': { imageOverlay: overlay('solid', 'primary', 10), textAlign: 'center', textVerticalAlign: 'center' },
  }
)
const typesetTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'secondary', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'gray', bold: false },
}

// --- Brutalist (TT22/23 style) — sharp, high contrast, minimal decoration ---
const brutalistLayouts = buildLayouts(
  { imageOverlay: overlay('solid', 'primary', 0), textAlign: 'left', textVerticalAlign: 'end' },
  {
    'hero': { imageOverlay: overlay('solid', 'primary', 20), textAlign: 'left', textVerticalAlign: 'end' },
    'split-horizontal': { imageOverlay: overlay('solid', 'primary', 0), textAlign: 'left', textVerticalAlign: 'end' },
    'split-vertical': { imageOverlay: overlay('solid', 'primary', 0), textAlign: 'left', textVerticalAlign: 'end' },
    'wide-feature': { imageOverlay: overlay('solid', 'primary', 15), textAlign: 'left', textVerticalAlign: 'end' },
    'tall-feature': { imageOverlay: overlay('solid', 'primary', 15), textAlign: 'left', textVerticalAlign: 'end' },
  }
)
const brutalistTextStyles = {
  title: { color: 'secondary', bold: true },
  tagline: { color: 'secondary', bold: false },
  bodyHeading: { color: 'secondary', bold: true },
  bodyText: { color: 'secondary', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'gray', bold: false },
}

// --- Vivid (TT13 style) — warm, bold, colorful, magazine-inspired ---
const vividLayouts = buildLayouts(
  { imageOverlay: overlay('solid', 'accent', 18), textAlign: 'center', textVerticalAlign: 'center' },
  {
    'hero': { imageOverlay: overlay('gradient-bottom', 'accent', 45), textAlign: 'center', textVerticalAlign: 'end' },
    'split-horizontal': { imageOverlay: overlay('solid', 'accent', 15), textAlign: 'center', textVerticalAlign: 'center' },
    'split-vertical': { imageOverlay: overlay('solid', 'accent', 15), textAlign: 'left', textVerticalAlign: 'center' },
    'golden-left': { imageOverlay: overlay('gradient-right', 'accent', 25), textAlign: 'left', textVerticalAlign: 'center' },
    'golden-right': { imageOverlay: overlay('gradient-left', 'accent', 25), textAlign: 'left', textVerticalAlign: 'center' },
    'wide-feature': { imageOverlay: overlay('gradient-bottom', 'accent', 40), textAlign: 'center', textVerticalAlign: 'end' },
  }
)
const vividTextStyles = {
  title: { color: 'white', bold: true },
  tagline: { color: 'off-white', bold: false },
  bodyHeading: { color: 'white', bold: true },
  bodyText: { color: 'off-white', bold: false },
  cta: { color: 'accent', bold: true },
  footnote: { color: 'light-gray', bold: false },
}

// ============================================================================
// LOOK PRESETS ARRAY
// ============================================================================

export const lookPresets = [
  // ========== CLEAN CATEGORY ==========
  {
    id: 'clean',
    name: 'Clean',
    category: 'clean',
    description: 'Minimal overlay, crisp and clear',
    preview: { style: 'clean' },
    fonts: { title: 'inter', body: 'inter' },
    imageFilters: { ...defaultFilters },
    textStyles: cleanTextStyles,
    layouts: cleanLayouts,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    category: 'clean',
    description: 'Ultra-light touch, content first',
    preview: { style: 'minimal' },
    fonts: { title: 'dm-sans', body: 'dm-sans' },
    imageFilters: { ...defaultFilters, contrast: 95, brightness: 105 },
    textStyles: cleanTextStyles,
    layouts: minimalLayouts,
  },
  {
    id: 'soft',
    name: 'Soft',
    category: 'clean',
    description: 'Gentle gradient, easy on the eyes',
    preview: { style: 'soft' },
    fonts: { title: 'raleway', body: 'open-sans' },
    imageFilters: { ...defaultFilters, contrast: 95, brightness: 102 },
    textStyles: softTextStyles,
    layouts: softLayouts,
  },

  // ========== BOLD CATEGORY ==========
  {
    id: 'bold',
    name: 'Bold',
    category: 'bold',
    description: 'Strong gradient, high impact',
    preview: { style: 'bold' },
    fonts: { title: 'bebas-neue', body: 'inter' },
    imageFilters: { ...defaultFilters, contrast: 110, brightness: 95 },
    textStyles: boldTextStyles,
    layouts: boldLayouts,
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    category: 'bold',
    description: 'Deep vignette, cinematic feel',
    preview: { style: 'dramatic' },
    fonts: { title: 'oswald', body: 'lato' },
    imageFilters: { ...defaultFilters, contrast: 115, brightness: 92 },
    textStyles: dramaticTextStyles,
    layouts: dramaticLayouts,
  },
  {
    id: 'punch',
    name: 'Punch',
    category: 'bold',
    description: 'Top-heavy gradient, attention-grabbing',
    preview: { style: 'punch' },
    fonts: { title: 'archivo-black', body: 'dm-sans' },
    imageFilters: { ...defaultFilters, contrast: 108, brightness: 98 },
    textStyles: punchTextStyles,
    layouts: punchLayouts,
  },

  // ========== VINTAGE CATEGORY ==========
  {
    id: 'vintage',
    name: 'Vintage',
    category: 'vintage',
    description: 'Warm sepia tones, nostalgic feel',
    preview: { style: 'vintage' },
    fonts: { title: 'playfair', body: 'lora' },
    imageFilters: { ...defaultFilters, sepia: 30, brightness: 98 },
    textStyles: vintageTextStyles,
    layouts: vintageLayouts,
  },
  {
    id: 'retro',
    name: 'Retro',
    category: 'vintage',
    description: 'Faded colors, throwback vibes',
    preview: { style: 'retro' },
    fonts: { title: 'oswald', body: 'lato' },
    imageFilters: { ...defaultFilters, sepia: 25, contrast: 105, brightness: 95 },
    textStyles: retroTextStyles,
    layouts: retroLayouts,
  },
  {
    id: 'film',
    name: 'Film',
    category: 'vintage',
    description: 'Classic film look with grain effect',
    preview: { style: 'film' },
    fonts: { title: 'merriweather', body: 'merriweather' },
    imageFilters: { ...defaultFilters, sepia: 15, contrast: 108, brightness: 96 },
    textStyles: filmTextStyles,
    layouts: filmLayouts,
  },

  // ========== NOIR CATEGORY ==========
  {
    id: 'noir',
    name: 'Noir',
    category: 'noir',
    description: 'Black & white, dramatic contrast',
    preview: { style: 'noir' },
    fonts: { title: 'bebas-neue', body: 'inter' },
    imageFilters: { ...defaultFilters, grayscale: 100, contrast: 120, brightness: 90 },
    textStyles: noirTextStyles,
    layouts: noirLayouts,
  },
  {
    id: 'monochrome',
    name: 'Mono',
    category: 'noir',
    description: 'Subtle grayscale, modern feel',
    preview: { style: 'mono' },
    fonts: { title: 'space-grotesk', body: 'dm-sans' },
    imageFilters: { ...defaultFilters, grayscale: 100, contrast: 105 },
    textStyles: monoTextStyles,
    layouts: monoLayouts,
  },
  {
    id: 'duotone',
    name: 'Duotone',
    category: 'noir',
    description: 'Two-color effect, stylized look',
    preview: { style: 'duotone' },
    fonts: { title: 'montserrat', body: 'inter' },
    imageFilters: { ...defaultFilters, contrast: 110, brightness: 95 },
    textStyles: duotoneTextStyles,
    layouts: duotoneLayouts,
  },

  // ========== WORDPRESS-ERA CATEGORY ==========
  // Requirement: Look presets inspired by WordPress default theme design eras
  {
    id: 'editorial',
    name: 'Editorial',
    category: 'wordpress',
    description: 'Warm serif elegance, refined and readable',
    preview: { style: 'editorial' },
    fonts: { title: 'cardo', body: 'inter' },
    imageFilters: { ...defaultFilters, contrast: 102, brightness: 100 },
    textStyles: editorialTextStyles,
    layouts: editorialLayouts,
  },
  {
    id: 'pastel',
    name: 'Pastel',
    category: 'wordpress',
    description: 'Soft colors, airy and minimal',
    preview: { style: 'pastel' },
    fonts: { title: 'manrope', body: 'manrope' },
    imageFilters: { ...defaultFilters, contrast: 95, brightness: 105 },
    textStyles: pastelTextStyles,
    layouts: pastelLayouts,
  },
  {
    id: 'typeset',
    name: 'Typeset',
    category: 'wordpress',
    description: 'Classic serif + sans, traditional blog aesthetic',
    preview: { style: 'typeset' },
    fonts: { title: 'merriweather', body: 'source-sans' },
    imageFilters: { ...defaultFilters },
    textStyles: typesetTextStyles,
    layouts: typesetLayouts,
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    category: 'wordpress',
    description: 'Sharp, high contrast, no decoration',
    preview: { style: 'brutalist' },
    fonts: { title: 'source-serif', body: 'libre-franklin' },
    imageFilters: { ...defaultFilters, contrast: 112, brightness: 98 },
    textStyles: brutalistTextStyles,
    layouts: brutalistLayouts,
  },
  {
    id: 'vivid',
    name: 'Vivid',
    category: 'wordpress',
    description: 'Bold, warm, magazine-inspired color',
    preview: { style: 'vivid' },
    fonts: { title: 'bitter', body: 'source-sans' },
    imageFilters: { ...defaultFilters, contrast: 108, brightness: 98 },
    textStyles: vividTextStyles,
    layouts: vividLayouts,
  },
]

// ============================================================================
// TEXT STYLE PRESETS
// Requirement: Looks define per-element text styling (color, bold) so presets
//   feel complete instead of half-finished.
// Approach: Top-level textStyles per look (not per-layout) since text styling
//   is aesthetically consistent regardless of grid structure.
// Alternatives:
//   - Per-layout textStyles: Rejected — adds massive duplication for no
//     user-visible benefit; text aesthetics are about the look, not the grid.
//   - Override all text fields: Rejected — only color/bold are visual identity;
//     content, size, visibility, alignment are user choices to preserve.
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get a look preset by ID
export const getLookPreset = (id) => {
  return lookPresets.find(preset => preset.id === id)
}

// Get layout-specific settings for a look
// Returns the layout settings if defined, otherwise returns fallback
export const getLookSettingsForLayout = (lookId, layoutId) => {
  const look = getLookPreset(lookId)
  if (!look) return null

  // Get layout-specific settings
  const layoutSettings = look.layouts?.[layoutId]

  if (layoutSettings) {
    return {
      fonts: look.fonts,
      imageFilters: look.imageFilters,
      textStyles: look.textStyles,
      ...layoutSettings,
    }
  }

  // Fallback to hero settings or defaults
  const fallbackSettings = look.layouts?.['hero'] || {
    imageOverlay: { type: 'solid', color: 'primary', opacity: 0 },
    textAlign: 'center',
    textVerticalAlign: 'center',
  }

  return {
    fonts: look.fonts,
    imageFilters: look.imageFilters,
    textStyles: look.textStyles,
    ...fallbackSettings,
  }
}
