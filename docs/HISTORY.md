# Changelog

## 2026-01-17

### Improved text overlay defaults with preset-based color schemes

- Added `overlay` and `textColors` to all 20 layout presets
- Hero/fullbleed presets: dark overlay (`off-black` at 40%) + white text for guaranteed readability
- Split layouts: no overlay + theme-adaptive text (`secondary`) that adapts when theme changes
- `applyLayoutPreset()` now applies colors along with layout structure
- Initial state now uses hero defaults: off-black overlay, white text, accent CTA, light-gray footnote

### Neutral colors for text and overlays

- Added 6 neutral color options: Off Black (#1a1a1a), Dark Gray (#4a4a4a), Gray (#808080), Light Gray (#d4d4d4), Off White (#f5f5f5), White (#ffffff)
- Available in all color pickers regardless of theme selection
- Works for text element colors and overlay colors
- Theme colors (Primary, Secondary, Accent) shown first, neutrals shown after a visual separator

---

## Completed Features (from TODO)

### Layout & Structure

- Per-cell text alignment (horizontal + vertical)
- Layout Tab sub-tabs (Presets, Structure, Alignment, Placement)
- Unified cell selector grid component
- Structure tab with contextual section/cell selection
- Fullbleed treated as single-cell grid
- Per-cell overlay controls with Overlay sub-tab
- Spacing sub-tab with global and per-cell padding
- Cell selector matches selected platform's aspect ratio
- Simple cell references (1, 2, 3) instead of row/column naming
- Fixed padding units (px) instead of percentages

### Text System

- Text element grouping (Title+Tagline, Body+Heading, CTA, Footnote)
- Text groups assignable to any cell
- Per-group text placement with individual cell selectors
- Per-group alignment with global fallback
- Separate text into individual elements
- Per-element editing: visibility, color, text content inline
- Bold/italic text options per text element
- Letter spacing controls (Tight, Normal, Wide, Wider)
- Simplified Text tab (removed sub-tabs)

### Image & Media

- Image as layer over cells with cell selection
- Quick presets with overlay combinations
- Sample images for quick testing
- Image filters (grayscale, sepia, blur, contrast, brightness)
- Image quick controls: contain/cover, grayscale, overlay slider
- Merged Logo and Image tabs into unified Image tab
- Reorganized Image tab: Upload → Remove → Settings → Effects → Logo
- Collapsible sections with sensible defaults

### Theme & Display

- Expanded to 12 preset themes
- Responsive preview canvas
- Standard alignment icons (SVG-based)
- More prominent sub-tabs styling

### Platform & Export

- Default platform: Instagram Square
- Reordered platforms for common use cases
- Smart layout suggestions based on image aspect ratio
- Loading states during export with progress indicator

### Technical

- Undo/redo functionality (Ctrl+Z / Ctrl+Y)
- Error boundaries for graceful error handling
- Optimized re-renders with React.memo

---

## 2026-01-10

### Bug fixes

- **Fixed image not displaying** in column/row layouts - sections now use flex sizing with absolute positioning
- **Fixed text duplication** in 3-section layouts - only first text section renders content
- **Removed redundant layout preview** from Layout tab (actual canvas preview is sufficient)
- **Fixed logo drag-drop** - added missing onDrop/onDragOver handlers
- **Fixed text vertical align on image** - now respects the vertical align setting instead of always bottom
- **Fixed text sizes on image** - overlay text now uses consistent font sizes with text sections

### Flexible layout system, logo upload, and font size controls

- **Redesigned layout system**: Replaced 16 predefined layouts with flexible configurator
  - Split type: none (fullbleed), vertical (columns), horizontal (rows)
  - 2 or 3 sections with adjustable proportions (20-80%)
  - Image position: first, middle, last
  - Text overlay on image option for split layouts
  - Text alignment (left/center/right) and vertical alignment (top/middle/bottom)
- **Added logo upload**: Position options (corners, center), size options (XS to XL)
- **Added font size controls**: Per-layer size options (XS 0.6x to XL 1.5x)
- **Text overflow protection**: Added word wrap and overflow hidden to prevent cutoff
- **Made all text layers visible by default**: Previously only title and CTA were visible

### 97a1b29 - Reorganize tabs, show all text elements, add more fonts

- Tab order: Image → Logo → Layout → Overlay → Text → Theme → Fonts
- Expanded font options from 5 to 15 fonts (sans-serif, serif, display categories)

### 821a0e4 - Fix export capturing scaled preview instead of full-size canvas

- Exported images were appearing smaller on a larger canvas
- Root cause: html-to-image was capturing the CSS-scaled preview instead of full-size canvas
- Fix: temporarily set `scale(1)` during capture, then restore original scale

### fa1af6d - Fix text layer state errors and Google Fonts export issue

- Fixed text layer state initialization errors
- Resolved Google Fonts not rendering in exported images

### df6d714 - Add overlay to all layouts and expand text layers

- Extended overlay system to apply to images in all layouts (not just background layouts)
- Expanded text layers to 6: title, tagline, body heading, body text, call to action, footnote

### eb92465 - Add Social Ad Creator implementation

- Initial feature-complete implementation
- Image upload with drag-drop
- 16 layout templates (background, vertical columns, horizontal rows)
- Theme system with 4 presets and custom colors
- Overlay system (solid, gradient up/down, vignette)
- 5 Google Fonts
- Export to 6 platforms (LinkedIn, Facebook, Instagram, Twitter/X, TikTok)
- Single download and ZIP batch download

### ab39a59 - Initial commit

- Vite + React project setup
