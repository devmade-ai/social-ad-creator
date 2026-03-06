// Looks presets - layout-aware visual styles
// Each Look defines how it should appear on each layout preset
// Settings include: fonts, image filters, and per-layout overlay/alignment

// Default image filters (no effect)
const defaultFilters = { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 }

// Helper to create overlay config
const overlay = (type, color, opacity) => ({ type, color, opacity })

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
    layouts: duotoneLayouts,
  },
]

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
    ...fallbackSettings,
  }
}
