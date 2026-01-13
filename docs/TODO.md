# TODO

Future enhancements and ideas for the Social Ad Creator.

## Completed Features

### Layout & Positioning Overhaul

- [x] Per-cell text alignment (horizontal + vertical)
- [x] Move overlay controls to Image tab
- [x] Text element grouping (Title+Tagline, Body+Heading, CTA, Footnote)
- [x] Image as layer over cells with cell selection
- [x] Text groups assignable to any cell
- [x] Layout Tab sub-tabs (Presets, Structure, Alignment, Placement)
- [x] Unified cell selector grid component
- [x] Structure tab with contextual section/cell selection

### Text Tab Improvements

- [x] Sub-tabs for Text tab (Content, Style, Placement)
- [x] Text placement controls accessible from Text tab
- [x] Separated content editing from styling

### Theme System

- [x] Expanded to 12 preset themes (Dark, Light, Corporate, Minimal, Slate, Vibrant, Sunset, Ocean, Forest, Earth, Neon, Candy)

### Responsive & Display

- [x] Responsive preview canvas that adapts to device width
- [x] Undo/redo functionality (Ctrl+Z / Ctrl+Y)

---

## In Progress / Planned

### Image Tab Enhancements

- [ ] Quick presets with overlay combinations (e.g., "Dramatic Dark", "Light & Airy", "Vintage")
- [ ] Sample/placeholder images for quick testing
- [ ] Image filters beyond grayscale (sepia, blur, contrast)

### Layout Tab Enhancements

- [ ] Per-cell/section overlay controls (apply overlays to specific cells)
- [ ] Allow overlays on rows/columns independently
- [ ] Consider overlay intensity per cell

### Padding & Spacing

- [ ] Investigate consistent padding controls
- [ ] Global padding setting
- [ ] Per-cell padding overrides
- [ ] Text margin controls

### Tab Consolidation

- [ ] Consider merging Logo and Image tabs
- [ ] Unified media controls (position, size, fit options)
- [ ] Similar sub-tab pattern for combined tab

---

## Potential Improvements

### Content & Presets

- [ ] Save/load designs to localStorage
- [ ] Add preset text styles (e.g., "Bold Statement", "Elegant Quote")
- [ ] Template gallery with complete designs

### Visual Effects

- [ ] More overlay types (diagonal gradient, radial from corner)
- [ ] Text shadow/stroke options
- [ ] Animation preview for story formats

### Typography

- [ ] Line height controls
- [ ] Letter spacing controls
- [ ] Text transform (uppercase, capitalize)

### Usability

- [ ] Keyboard shortcuts for common actions
- [ ] Aspect ratio lock for custom sizes
- [ ] Image cropping/repositioning within frame

---

## Technical Improvements

- [ ] Loading states during export
- [ ] Error boundaries
- [ ] TypeScript migration
- [ ] Unit tests for config utilities
- [ ] Optimize re-renders with React.memo
- [ ] PWA support for offline use
