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
- [x] Keyboard shortcuts for undo/redo

### Image/Media Tab

- [x] Quick presets with overlay combinations (Dramatic Dark, Light & Airy, Vintage, etc.)
- [x] Sample images for quick testing (5 devMade samples in public/samples/)
- [x] Image filters (grayscale, sepia, blur, contrast, brightness)
- [x] Merged Logo and Image tabs into unified Media tab
- [x] Rename "Media" tab to "Image" (clearer naming)
- [x] Make default platform Instagram Square (most common use case)
- [x] Reorder platforms: Instagram Square, TikTok, LinkedIn, Instagram Story as first 4
- [x] Smart layout suggestions based on image aspect ratio and platform

### Layout Tab Enhancements

- [x] Per-cell overlay controls (enable/disable, custom settings per cell)
- [x] Overlay sub-tab in Layout for cell-specific configuration
- [x] Spacing sub-tab with global and per-cell padding controls
- [x] Remove "type" from presets (unnecessary complexity)
- [x] Default presets filter to "All" instead of "Suggested"
- [x] Consolidate placement sub-tabs: move image placement to unified "Placement" tab
- [x] Merge text alignments and placements into same tab
- [x] Use standard alignment icons (SVG-based, clear visual indicators)
- [x] Improve cell references - simple numbers (1, 2, 3) instead of row/column naming
- [x] Make cell selector smaller on wider devices (max-width constrained)
- [x] Cell selector matches selected platform's aspect ratio
- [x] Make sub-tabs more prominent - larger, bolder styling
- [x] Separate text into individual elements instead of groups
- [x] Per-element editing: visibility, color, text content inline
- [x] Image quick controls: contain/cover toggle, grayscale toggle, overlay slider

### Text Tab

- [x] Remove sub-tabs - simplify to single tab (content and style together)

### Export

- [x] Loading states during export with progress indicator

### Image Tab UX Overhaul

- [x] Reorganize section order: Upload → Remove → Settings → Effects → Logo
- [x] Collapsible sections with sensible defaults (Settings open, effects collapsed)
- [x] Remove Quick Layout from Image tab (belongs in Layout tab)
- [x] Clear visual hierarchy for first-time users

### Typography

- [x] Bold/italic text options per text element
- [x] Letter spacing controls (Tight, Normal, Wide, Wider)

### Layout Tab (continued)

- [x] Use fixed units for padding (px) instead of percentages for consistency across cell sizes

---

## Potential Improvements

### Content & Presets

- [ ] Save/load designs to localStorage
- [ ] Template gallery with complete designs

### Visual Effects

- [ ] More overlay types (diagonal gradient, radial from corner)
- [ ] Animation preview for story formats

### Usability

- [ ] Aspect ratio lock for custom sizes
- [ ] Image cropping/repositioning within frame

---

## Technical Improvements

- [x] Error boundaries for graceful error handling
- [x] Optimize re-renders with React.memo
- [ ] TypeScript migration
- [ ] Unit tests for config utilities
- [ ] PWA support for offline use
