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

## Recently Completed

### Image/Media Tab

- [x] Quick presets with overlay combinations (Dramatic Dark, Light & Airy, Vintage, etc.)
- [x] Sample images for quick testing (5 devMade samples in public/samples/)
- [x] Image filters (grayscale, sepia, blur, contrast, brightness)
- [x] Merged Logo and Image tabs into unified Media tab

### Layout Tab Enhancements

- [x] Per-cell overlay controls (enable/disable, custom settings per cell)
- [x] Overlay sub-tab in Layout for cell-specific configuration
- [x] Spacing sub-tab with global and per-cell padding controls

---

## In Progress / Planned

### Image Tab (formerly Media)

- [ ] Rename "Media" tab to "Image" (clearer naming)
- [ ] Make default platform Instagram Square (most common use case)
- [ ] Reorder platforms: Instagram Square, TikTok, LinkedIn, Instagram Story as first 4
- [ ] Better quick layout suggestions (smarter, more useful presets)
- [ ] More logical section ordering within tab
- [ ] Make sections collapsible and/or start collapsed
- [ ] Fix remove image placement issue

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
