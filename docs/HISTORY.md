# Changelog

## 2026-01-27

### Multi-Image Layout Support

Added support for multiple images per layout:

**New `imageCells` array in layout presets**
- Changed from single `imageCell` to `imageCells` array
- Backward compatible - still supports old `imageCell` format
- Layouts can now define multiple image cells (e.g., `imageCells: [0, 3]` for diagonal images)

**Layouts with multiple images**
- `quad-grid` - 2 images (diagonal: top-left and bottom-right)
- `stacked-quad` - 2 images (stacked rows)
- `header-quad` - 2 images (diagonal in grid)
- `wide-feature` - 2 images (first column + center)
- `tall-feature` - 2 images (second + third row)
- `columns-four` - 2 images (alternating columns)
- `asymmetric-grid` - 2 images (diagonal)

**Sample images for multi-image layouts**
- `loadSampleImage` now loads different sample images for each image cell
- Avoids repeating the same sample image when possible

---

### Layout-Aware Looks System

Implemented intelligent Look presets that apply visual styling based on the current layout:

**Per-layout settings for all 12 Looks**
- Clean, Minimal, Soft (Clean category)
- Bold, Dramatic, Punch (Bold category)
- Vintage, Retro, Film (Vintage category)
- Noir, Mono, Duotone (Mono category)

Each Look now has unique `imageOverlay` settings for all 28 layouts (336 total combinations).

**Clear separation of concerns**
- **Looks control**: Fonts, image filters (grayscale, sepia, blur, contrast, brightness), image overlay
- **Layouts control**: Grid structure, text cell placements, per-cell text alignments (both global and cellAlignments)
- Looks do NOT override text alignment - this is entirely controlled by the layout preset

**Auto-load sample images**
- Random sample image loads automatically on app start when no images uploaded
- Images assigned to layout's image cells

---

### UI Reorganization and Export Improvements

Completed high-priority TODO items focused on UI workflow and export improvements:

**Presets Tab Changes**
- Swapped section order: Layout presets now appear before Complete Designs (layout-first workflow)
- Layout section expanded by default, Complete Designs collapsed
- Complete Designs now filter by current layout type (only shows presets matching fullbleed/rows/columns)
- Added "No designs match the current layout type" message when filtered list is empty

**Platform Selector Improvements**
- Separated into its own card/section (was combined with canvas preview)
- Entire platform list wrapped in collapsible section (collapsed by default)
- All categories collapsed by default for less overwhelming initial view
- Header shows current platform name and dimensions

**Export Improvements**
- Changed "Download All (ZIP)" to "Download Multiple (ZIP)"
- Added platform selection UI with category grouping
- Select All / Clear buttons for quick selection
- Per-category selection by clicking category name
- Shows count of selected platforms
- Only exports selected platforms instead of all 20

**Cell Assignment Cleanup**
- Added automatic cleanup when layout changes reduce cell count
- Cleans up: textCells, cellImages, cellAlignments, cellOverlays, padding.cellOverrides, frame.cellFrames
- Prevents stale references to non-existent cells
- Applied to setLayout, applyStylePreset, and applyLayoutPreset functions

---

## 2026-01-25

### Redesigned layout presets with more complex options

Completely rewrote layout presets to provide more complex, interesting layouts while reducing redundant basic options:

**New structure (28 layouts, down from 20)**
- **Basic (3)**: Full Bleed, Top/Bottom, Left/Right - essential foundations only
- **Split (6)**: Golden ratio variations, Three Rows/Columns - varied proportions
- **Grid (10)**: 2×2, L-shapes (4 directions), T-layouts, Feature center/middle - multi-cell layouts
- **Asymmetric (9)**: Mosaic, Stacked, Sidebar+Stack, Header+2×2, Wide/Tall feature, Four columns, Asymmetric grid - creative uneven arrangements

**Changes**
- Removed redundant mirror variations (hero-top/hero-bottom, left-image/right-image, etc.)
- Added golden ratio (62/38) splits for more professional proportions
- Added L-shape layouts in all 4 directions (left, right, top, bottom)
- Added T-layout and Inverted-T for header/footer emphasis
- Added multi-cell grids: 2×2, Header+2×2, Sidebar+3 rows
- Added asymmetric arrangements: Mosaic, Four rows, Four columns
- All layouts have proper aspect ratio filtering (square, portrait, landscape)
- Updated categories: Basic, Split, Grid, Asymmetric (was: Image Focus, Balanced, Text Focus, Grid)
- Updated suggested layouts helper for new preset IDs

---

## 2026-01-24

### Multi-image system with per-cell assignment

Replaced single background image with a flexible multi-image system:

**Image Library**
- Upload multiple images to a shared library
- Images can be reused across cells
- Remove images from library (auto-removes from cells)

**Per-Cell Assignment**
- Assign different images to different cells (1 per cell max)
- Per-cell image settings: fit (cover/contain), position, filters
- Cell selector in Media tab shows which cells have images

**Frame System**
- Outer frame: Colored border around entire canvas
- Per-cell frames: Colored border within individual cells
- Frame width is percentage of cell's padding (keeps dimensions simple)
- Frame colors: Theme colors + neutral colors

### Added paper size export options (6 new platforms)

Added A3, A4, and A5 paper sizes in both portrait and landscape orientations for print use:

**Print (new category)**
- A3 Portrait (1754×2480) - Large poster size
- A3 Landscape (2480×1754)
- A4 Portrait (1240×1754) - Standard document size
- A4 Landscape (1754×1240)
- A5 Portrait (874×1240) - Flyer size
- A5 Landscape (1240×874)

All dimensions calculated at 150 DPI (suitable for screen/web exports). Total platforms now 20.

---

## 2026-01-20

### Added new platform dimensions (8 new platforms)

Expanded from 6 social media platforms to 14 total platforms organized by category:

**Website (new)**
- Hero Standard (1920×600) - Standard website hero banner
- Hero Tall (1920×800) - Taller hero for more impact
- Hero Full HD (1920×1080) - Full viewport hero
- OG Image (1200×630) - Social share preview image

**Banners (new)**
- LinkedIn Banner (1584×396) - Profile/company banner
- YouTube Banner (2560×1440) - Channel art

**Other (new)**
- Email Header (800×400) - Email campaign header
- Zoom Background (1920×1080) - Virtual meeting background

**Existing (renamed for clarity)**
- LinkedIn Post (was "LinkedIn")
- Facebook Post (was "Facebook")

PlatformPreview component now groups platforms by category for easier navigation.

### Added new overlay effects (13 new overlays)

Expanded from 11 overlay types to 24 total, organized by category:

**Radial (new)**
- Radial Soft - Subtle center glow
- Radial Ring - Ring-shaped gradient

**Effects (new)**
- Blur Edges - Soft vignette using box-shadow
- Frame - Border effect on all edges
- Duotone - Grayscale image with color tint (uses blend mode)

**Blend Modes (new)**
- Multiply - Darkening blend
- Screen - Lightening blend
- Overlay - Contrast blend
- Color Burn - Intense darkening

**Textures (new)**
- Noise - Random dot texture via SVG filter
- Film Grain - Fine grain texture via SVG filter

Technical implementation:
- Added `category` property to overlay types for UI grouping
- Added `blendMode` property for CSS mix-blend-mode
- Added `special` property for custom rendering (noise, grain, blur-edges, duotone)
- Created `<SvgFilters>` component with feTurbulence-based filters for noise/grain
- Updated MediaTab and StyleTab to display overlays grouped by category

---

## 2026-01-18

### Export fixes

- **Fixed text wrapping mismatch** between preview and export - removed `skipFonts: true` from html-to-image which was causing different font metrics during capture
- **Hide canvas during export** - set opacity to 0 while capturing to prevent visible size flash
- **Added export overlay** - "Exporting..." message with spinner shown over canvas during export

### Layout tab simplification

- **Moved Image Cell to Media tab** - now in Background Image section with other image settings
- **Removed Cell Assignment section** - eliminated redundant small grid selectors
- **Integrated alignment into Structure section** - context-aware based on selection:
  - Section (row/column) selected: alignment applies to all cells in that section
  - Cell selected: alignment applies to just that cell
  - Nothing selected: sets global alignment
- Reduced from 3 grids to 1 main structure grid

### Media tab enhancements

- **Added Image Cell selector** - shows in Background Image section for multi-cell layouts
- **Added Image Overlay section** - controls for overlay type, color, and opacity
  - Uses global `state.overlay` (same system as templates)
  - Type: Solid, 8 gradient directions, Vignette, Spotlight
  - Color: Theme colors (Primary/Secondary/Accent) + Neutrals
  - Opacity slider (0 = disabled)

### UI fixes

- **Fixed cell grid selectors not scaling** - changed from fixed 80x52px to aspect-ratio based sizing so all cells are visible regardless of layout structure

---

## 2026-01-17

### Post-refactor cleanup

Deleted legacy components that were replaced by the new workflow-based UI:
- `ImageUploader.jsx` → replaced by `MediaTab.jsx`
- `TextEditor.jsx` → replaced by `ContentTab.jsx`
- `LayoutSelector.jsx` → replaced by `LayoutTab.jsx`
- `ThemePicker.jsx` → replaced by `StyleTab.jsx`
- `FontSelector.jsx` → replaced by `StyleTab.jsx`
- `StylePresetSelector.jsx` → replaced by `TemplatesTab.jsx`
- `docs/REFACTOR_PLAN.md` → implementation complete, no longer needed

Updated documentation:
- Removed legacy component references from CLAUDE.md
- Moved cleanup tasks from TODO.md to HISTORY.md

### Documentation overhaul

Created comprehensive documentation:
- `docs/USER_GUIDE.md` - Full user documentation explaining every tab, control, and workflow
- `docs/TESTING_GUIDE.md` - 20+ manual test scenarios with step-by-step instructions

Updated existing documentation:
- `README.md` - Rewrote to reflect current workflow-based UI, fixed outdated references
- `CLAUDE.md` - Added USER_GUIDE.md and TESTING_GUIDE.md entries with purpose, when to read, when to update

### Major UI refactor: Workflow-based tabs

Reorganized from feature-based tabs (Image, Layout, Text, Theme, Fonts) to workflow-based tabs:

**New tab structure: Templates | Media | Content | Layout | Style**

- **Templates** - Entry point combining Complete Designs (style presets) and Layout Only presets
- **Media** - Image + logo upload, positioning, and filters (collapsible sections)
- **Content** - Text editing with visibility, cell assignment, alignment, colors, sizes (grouped by Title/Tagline, Body, CTA, Footnote)
- **Layout** - Simplified to Structure grid editing + Cell Assignment only
- **Style** - Themes + Typography + per-cell Overlay + Spacing

New components created:
- `CollapsibleSection.jsx` - Reusable collapsible section for all tabs
- `TemplatesTab.jsx` - Merges Quick Styles + Layout presets
- `MediaTab.jsx` - Streamlined image/logo controls
- `ContentTab.jsx` - Text editing with cell placement
- `LayoutTab.jsx` - Structure + alignment
- `StyleTab.jsx` - Themes, fonts, overlay, spacing

### Text placement selector validation

- Text element cell assignments now auto-reset when layout structure changes
- Added `validateTextCells()` helper to reset out-of-bounds cell assignments
- Validation runs on layout type change, section removal, and subdivision removal
- Increased cell selector size (80x52px) for better mobile touch targets

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
