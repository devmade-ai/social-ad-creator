# Changelog

## 2026-03-30

### TODO cleanup

- Removed "Wire App.jsx layout components" from TODO — already completed (2026-03-28), App.jsx delegates to ReaderMode/MobileLayout/DesktopLayout
- Updated "TypeScript migration" — corrected description to reflect actual state (~30% config, ~11% utils, 0% hooks/components)
- Updated "Expand unit test coverage" — corrected from "27 tests, 2 files" to "56 tests, 5 files" and updated untested targets
- Updated "Template gallery" declined reason — removed stale "revisit after save/load" since save/load is implemented
- Updated "Image cropping" declined reason — removed "sliders planned" since X/Y sliders are implemented
- Added 8 glow-props alignment items (cross-tab sync, meta theme-color, color-scheme, safe localStorage, timer leaks, z-index scale, burger menu a11y, print CSS)
- Moved "Considered & Declined" section from TODO.md to HISTORY.md — decision records, not actionable work

### Declined Feature Decisions

| Item | Reason |
|------|--------|
| Pinch-to-zoom on canvas | Canvas fits viewport at full resolution. Complex gesture conflicts with page swipe. High complexity, low ROI. |
| Template gallery with complete designs | Base64 images make templates heavy. Layout+theme+look presets cover most starting points. Would need a lightweight format without embedded images. |
| Looks define text visibility per layout | Visibility is a user content choice, not a style preset decision. Could confuse users. |
| Animation preview for story formats | High complexity, low ROI for a static design tool. Out of scope. |
| Aspect ratio lock for custom sizes | 42 platform presets cover most use cases. Niche need. |
| Image cropping within frame | Repositioning with preset grid + X/Y sliders covers the use case. True cropping needs a crop UI — revisit if users request. |
| Memoize getOverlayStyle / renderCellImage | Cost is trivial (simple object creation per cell per render). Memoizing adds complexity without measurable gain. |
| Inline onClick handlers in .map() loops | Lists are small (< 20 items). Extracting to useCallback adds boilerplate with no measurable perf gain. |

## 2026-03-29

### WordPress design token integration

Added fonts, color themes, and look presets derived from the WordPress default theme design tokens document (2010–2025).

**Fonts (9 new, 24 total):**
- Sans-serif: Manrope (TT25), Libre Franklin (TT17), Source Sans 3 (TT13), Noto Sans (TT15)
- Serif: Source Serif 4 (TT22), Bitter (TT13), Cardo (TT24), Literata (TT25), Noto Serif (TT15)

**Color themes (8 new, 20 total):**
- Classic (TT22 teal+peach), Sage (TT21 green pastels), Warm (TT13 beige+orange), Cream (TT20 warm+pink), Parchment (TT24 white+rust), Midnight (TT25 dark+yellow), Dusk (TT25 purple+lilac), Grove (TT23 green+neon)

**Look presets (15 new, 27 total):**
- One per WP default theme year: Heritage (2010), Neutral (2011), Airy (2012), Vivid (2013), Magazine (2014), Readable (2015), Typeset (2016), Enterprise (2017), Gutenberg (2019), Warmth (2020), Pastel (2021), Botanical (2022), Fluid (2023), Editorial (2024), Flux (2025)

**Infrastructure:**
- `buildLayouts(base, overrides)` helper reduces per-look layout boilerplate from ~150 lines to ~15
- 9-point verification: font accuracy, Google Fonts availability, overlay validity, WCAG contrast, ID uniqueness, name collisions, font refs, build/tests, doc counts
- Renamed 3 themes (Minimal→Muted, Pastel→Sage, Editorial→Parchment) to avoid name overlap with look presets

## 2026-03-28

### Remaining TODO items completed

**Extract large components:**
- ExportButtons.jsx (701→579): Extracted captureAsBlob, captureForPdf, waitForPaint, etc. to utils/exportHelpers.js
- AdCanvas.jsx (878→840): Extracted buildFilterStyle, getAlignItems, etc. to utils/canvasRenderers.js
- LayoutTab.jsx (952→912): Extracted cellToSection, getFirstCellOfSection to utils/layoutHelpers.js
- MediaTab.jsx (1397→882): Extracted SampleImagesSection.jsx and AIPromptHelper.jsx
- ContentTab.jsx (915→419): Extracted TextStyleControls.jsx and FreeformEditor.jsx

**Extract App.jsx paths:**
- Created ReaderMode.jsx, MobileLayout.jsx, DesktopLayout.jsx
- App.jsx render branches now use extracted components (wired via linter)

**Platform picker search:**
- Added text search/filter input to PlatformPreview.jsx platform selector
- Auto-expands matching categories when searching

**Long-press cell actions:**
- CellContextMenu component with 3 actions (Media, Content, Style tabs)
- 500ms touch timeout on cell overlay divs, cancelled on move

**Unit tests:**
- Added Jest with ESM support, 27 tests across 2 test files
- cellUtils: normalizeStructure, getCellInfo, countCells, cleanupOrphanedCells
- layoutPresets: getSuggestedLayouts, getPresetsByAspectRatio

**TypeScript migration (Phases 1-2):**
- tsconfig.json added
- Migrated config: textDefaults.ts, fonts.ts, sampleImages.ts (with interfaces)
- Migrated utils: layoutHelpers.ts (with Section interface)

### 6 TODO items implemented

**High Priority (3 items):**
- **Unassigned image feedback** — `addImage()` now returns `{ id, assigned }`. MediaTab shows toast "Image added to library — all cells already have images" when no cell available. 4 call sites updated.
- **Accessibility pass** — ~20 elements across 5 files: `aria-label` on platform chevrons/format buttons (PlatformPreview), `role="menuitem"` on mobile menu items (App), `aria-label` on overlay type buttons (StyleTab), `aria-label` on color picker (TemplatesTab), `aria-hidden="true"` on decorative SVGs (MobileNav, App), `aria-label="Main navigation"` on nav element (MobileNav).
- **Phase 4: Platform format data** — Added 15 new formats across 7 platform groups: Pinterest (Pin, Story Pin), Snapchat (Snap Ad, Story), YouTube (Thumbnail, End Screen), WhatsApp (Status), Threads (Post, Story), Product Images (Square, Portrait), Store Banners (Hero, Category). New 'ecommerce' category. Total: 18 groups, 42 formats.

**Medium Priority (3 items):**
- **Lazy font loading** — Only 2 active fonts (title + body) load on mount. Remaining 13 load when StyleTab Fonts section expands via `onExpand` callback. Reduces initial HTTP requests from 15 to 2.
- **Looks per-element text styling** — Added `textStyles` to all 20 look presets with per-element color and bold overrides. `applyStylePreset` in useAdState merges styles into text elements (preserving content/visible/size). 5 style palettes: clean, bold, dark, warm, artistic.
- **Calculate imageAspectRatio** — Derived from first image's `naturalWidth/Height` in App.jsx. Passed as prop to TemplatesTab. "Suggested" layouts now adapt to image orientation (landscape → horizontal layouts, portrait → vertical).

### Lazy font loading

- Connected `onLoadAllFonts` callback in StyleTab to CollapsibleSection's `onExpand` prop on the Fonts section
- App.jsx already had the full implementation (state, useMemo filter, useCallback, prop passing) — only the StyleTab wiring was missing
- Result: Only 2 active fonts load on mount instead of 15, reducing initial HTTP requests by 13

---

## 2026-03-27

### Code review and audit sweep — 17 fixes across 13 files

**Review fixes (10 components):**
- MediaTab CellGrid: Replaced mutable `let cellIndex` render var with useMemo+Map pattern
- BottomSheet: Added onTouchCancel handler via shared snapToNearest callback
- ExportButtons: Replaced setTimeout(300) in PDF multi-page with double waitForPaint()
- ContextBar: Improved delete confirmation label ("Delete page X?" not "Delete p X?")
- LogoUploader: Added 10MB file size validation with toast feedback
- SaveLoadModal: Time-inclusive default name + aria-label on search input
- MobileNav: Active tab indicator persists when sheet is closed
- PlatformPreview: Reset showTips on platform change
- StyleTab: Extracted OverlayTypeButton component (reduced ~50 lines duplication)
- TemplatesTab: Actionable empty state message

**Audit fixes (4 files):**
- ExportButtons: exportLockRef mutex prevents concurrent exports
- useAdState loadDesign: Filters page data to PAGE_FIELDS only (prevents orphaned field pollution)
- useAdState extractPageData: structuredClone try/catch with JSON round-trip fallback
- cellUtils: pruneOrphanedKeys helper with NaN guard replaces 5 duplicate loops
- debugLog: HMR-safe guard for global listeners

**Documentation fixes:**
- TODO.md: Removed 3 completed items (state validation, export timeout, DOMPurify sanitization)
- CLAUDE.md: Corrected pxToPt value (1, not 0.5), added ColorPicker + ThemeColorPicker to Architecture
- TutorialModal: Fixed section names to match actual UI (Images, Image Overlay & Filters, Frames, Background)
- SESSION_NOTES.md: Refreshed with current context

---

## 2026-03-15

### Mobile redesign — dedicated mobile layout with bottom sheet and bottom nav

**New files:**
- `src/hooks/useIsMobile.js` — matchMedia hook detecting viewport < 1024px (Tailwind lg breakpoint)
- `src/components/BottomSheet.jsx` — Touch-draggable bottom sheet with 3 snap points (closed/half/full) for mobile tab content
- `src/components/MobileNav.jsx` — Fixed bottom navigation bar with 6 tabs (Presets, Media, Content, Structure, Style, Export)

**App.jsx refactor:**
- Conditional mobile/desktop layout rendering via `useIsMobile`
- Mobile: fixed viewport, edge-to-edge canvas, bottom sheet for controls, compact header with hamburger overflow menu, swipe-between-pages gesture, platform info strip
- Desktop: unchanged (sidebar + tab nav bar pattern)
- Export promoted to dedicated tab on mobile (vs sidebar section on desktop)

**Touch optimizations:**
- `CollapsibleSection.jsx` — Larger touch targets on mobile (py-3 vs py-2.5)
- `index.css` — Larger range input thumbs on mobile (24px), removed body safe-area padding (now per-component)
- `EmptyStateGuide.jsx` — Moved from canvas overlay to below canvas (normal document flow)

---

## 2026-03-12

### UX/UI improvements — 8 features inspired by design editor analysis

- **Toast notifications** — `Toast.jsx` with `ToastProvider` + `useToast` hook. Replaces all `alert()` calls. Auto-dismiss, severity levels, stacking at bottom-center.
- **Inline confirmations** — `ConfirmButton.jsx` replaces browser `confirm()` in page delete and design delete. Two-state button with auto-reset.
- **Export progressive disclosure** — Secondary export options (PDF, All Pages, Multi-Platform) now collapse into "More export options" toggle. Reduces visual noise.
- **Contextual quick-actions** — Below canvas shows Image/Text/Style shortcuts for selected cell. Reduces tab-hopping.
- **Theme hover previews** — Enlarged color swatches with labels appear on hover over theme presets.
- **Look hover previews** — Description tooltips appear on hover over look presets.
- **Empty state guidance** — Canvas shows "Browse Presets" / "Upload Images" buttons when empty.
- **Zoom controls** — Floating −/% /+ controls on canvas. Click percentage to reset to auto-fit.
- **Keyboard shortcuts** — 1-5 for tab switching. Shortcut overlay panel accessible from header.

### Code quality improvements

- **Portal-based tooltips** — `Tooltip.jsx` uses `createPortal` to render tooltips at document.body, preventing clipping at sidebar overflow boundaries. Replaces inline absolute tooltips in TemplatesTab.
- **Removed addToast prop drilling** — ExportButtons and SaveLoadModal now use `useToast()` hook directly instead of receiving `addToast` as a prop.
- **App.jsx component extraction** — Extracted `KeyboardShortcutsOverlay`, `EmptyStateGuide`, `ZoomControls`, and `QuickActionsBar` to reduce App.jsx from 950+ to ~820 lines.
- **Freeform text empty state fix** — `isCanvasEmpty` now correctly detects freeform text blocks (arrays of objects, not single objects).

---

## 2026-03-09

### PDF mobile quality fix — page dimensions no longer scale with pixelRatio

**Root cause:** PDF page dimensions were multiplied by pixelRatio (`widthPt = platform.width * pdfPixelRatio`), so higher quality just made a bigger page with the same pixel density. Mobile viewers scaled the oversized page down, making Low/Standard/High look identical.

**Fix:** Page stays at `platform.width × platform.height` points for digital formats. Higher pixelRatio captures more pixels into the same page size, giving clean 2:1 (standard) or 3:1 (high) pixel-per-point ratios. Mobile viewers now render the right-sized page with genuinely higher pixel detail at higher quality levels.

---

## 2026-03-08

### PDF export quality and file size fix

**Root cause identified and fixed** — jsPDF handles JPEG and PNG completely differently:
- JPEG: embedded directly as DCT_DECODE stream (no re-encoding) → small files
- PNG: decoded to raw pixels, re-compressed with deflate → 5-10x larger files
- Switched PDF capture from PNG to JPEG at pixelRatio:2, quality 0.92
- Switched from `toDataURL()` to `toBlob()` → `Uint8Array` to skip ~33% base64 overhead
- Added `MAX_PDF_PIXELS` budget (16M) to prevent canvas memory crashes on large formats

### Per-cell structured text model

**Replaced `textCells` indirection with per-cell text** — Text elements now stored directly per cell:
- Old: `text.title = {...}` + `textCells.title = 2` (global text + cell assignment)
- New: `text[2].title = {...}` (text stored directly on the cell)
- Removed `textCells` from all layout presets (35+ entries cleaned up)
- Moved text alignment controls from Structure tab to Content tab
- Extracted `defaultTextLayer` to `config/textDefaults.js` (shared by AdCanvas + ContentTab)
- Extracted alignment icons/options to `config/alignment.jsx`

### Section reorder (move up/down)

- Added move up/down buttons for rows and move left/right for columns in Structure tab
- Bidirectional cell index remapping via `swapCellIndices()` in `cellUtils.js`
- Selection follows the moved section

### IndexedDB migration

**Replaced localStorage with IndexedDB** — No practical size limits, handles binary natively:
- New `utils/designStorage.js` with async save/load/list/delete API
- One-time auto-migration from `canvagrid-designs` localStorage key
- Text format migration runs during transfer (old global text → per-cell)
- `SaveLoadModal` updated to async with loading states, error handling, error banner

### History comparison optimization

**Replaced full JSON.stringify with `shallowEqual`** in `useHistory.js`:
- Reference equality first, then per-key comparison
- `images` key: compares by ID + non-src metadata (skips multi-MB base64)
- `logo` key: reference change = content change (skips base64)
- Other keys: falls back to JSON.stringify per-key

### Mobile UX improvements

- Increased touch targets across all interactive elements (buttons, swatches, toggles)
- Added `active:scale-*` feedback on buttons and controls
- Delete button visible on mobile in SaveLoadModal (was hover-only)
- Added offline status banner in App.jsx
- Added `viewport-fit=cover` and safe-area padding for notched devices
- Used `100dvh` for proper mobile viewport height

### Cleanup

- Removed dead `txn()` helper from `designStorage.js`
- Removed backward compatibility code from load path (migration handles it)
- Added error handling to `handleDelete` in `SaveLoadModal`
- Fixed stale comments referencing PNG in PDF export

---

## 2026-03-06

### Platform specs system and export format selection

**platforms.js restructured** — Flat array replaced with nested `platformGroups` structure:
- Each platform group has: id, name, category, tips[], formats[]
- Each format has: id, name, width, height, recommendedFormat, maxFileSize
- Flat `platforms` export derived from groups for backward compatibility
- Helper functions: `findFormat(id)`, `findPlatformGroup(id)`
- Centralized `categoryLabels` and `categoryOrder` (removed duplicates from components)

**Platform selector redesigned** — Two-level hierarchy in PlatformPreview.jsx:
- Category → Platform → Format nesting
- Single-format platforms select on click, multi-format expand to show variants
- Info bar shows current format specs (dimensions, recommended format, max file size)
- Collapsible tips per platform with practical advice

**Export format selection** — PNG/JPG/WebP toggle in ExportButtons.jsx:
- Three-button toggle above export buttons, persists in state as `exportFormat`
- "Use recommended" link when platform suggests a different format
- All export paths updated: single, multi-platform ZIP, all-pages ZIP
- PDF export uses PNG at 2x internally — pdf-lib embeds directly via FlateDecode for sharp, small files
- Uses html-to-image's `toCanvas` + `canvas.toBlob` for all formats

**Format additions:**
- Instagram: 2 → 4 formats (added Feed Portrait 1080×1350, Feed Landscape 1080×566)
- Facebook: 1 → 4 formats (added Square Post, Story, Cover Photo)
- All existing platforms now have tips and file spec metadata

---

## 2026-03-03

### Documentation audit and code comment compliance

Full codebase audit comparing documentation against actual implementation.

**Fixed in CLAUDE.md**
- Layout presets count: 20 → 27 (Architecture section)
- Platform count: 14 → 20 (Architecture section)
- Overlay count: "20+" → "26" with corner radials listed (Project Status)
- Added missing fields to Key State Structure (bold, italic, letterSpacing, textVerticalAlign)
- Added 4 unlisted components to Architecture (TutorialModal, SaveLoadModal, LogoUploader, InstallInstructionsModal)
- Added STYLE_GUIDE.md entry to Documentation section
- Removed dead reference to non-existent docs/EXTRACTION_PLAYBOOK.md

**Added decision documentation comments**
- useAdState.js, App.jsx, MediaTab.jsx, LayoutTab.jsx, ContentTab.jsx, StyleTab.jsx, usePWAInstall.js

## 2026-02-27

### Migrated from GitHub Pages to Vercel

Replaced GitHub Pages deployment with Vercel for simpler SPA routing, no base-path hacks, and auto-deploy on push.

**Removed**
- `.github/workflows/deploy.yml` — GitHub Actions workflow
- `gh-pages` npm dependency
- `predeploy` and `deploy` npm scripts
- `base: '/canva-grid/'` from vite.config.js

**Changed**
- All `/canva-grid/` base-path prefixes removed from index.html, vite.config.js (PWA manifest id/scope/start_url)
- PWA manifest id changed from `/canva-grid/` to `/`
- README.md, CLAUDE.md deployment references updated

**Added**
- `vercel.json` with SPA rewrite rule for client-side routing

### PWA hardening (from glow-props cross-pollination)

Adopted patterns from sister project `devmade-ai/glow-props` CLAUDE.md:

**Inline beforeinstallprompt capture (index.html)**
- Added inline non-module script before React mounts to capture `beforeinstallprompt` event
- Prevents event loss on cached SW repeat visits where event fires before React hydrates
- `usePWAInstall.js` now checks `window.__pwaInstallPrompt` on mount as fallback

**Explicit manifest id (vite.config.js)**
- Added explicit `id` to PWA manifest (now `/` after Vercel migration)
- Prevents Chrome from deriving install identity from `start_url`, which would break if URL changes

**Dedicated maskable icon (vite.config.js, generate-icons.mjs)**
- Added 1024px dedicated maskable icon (`pwa-maskable-1024.png`)
- Separated icon entries by purpose — never combine `"any maskable"` in single entry
- Extended icon generation from 3 to 5 sizes (added 48px favicon + 1024px maskable)
- Added 48px `favicon.png` link in index.html

### Debug system (dev only)

**debugLog.js** - In-memory event store
- 200-entry circular buffer with pub/sub pattern
- Entries: id, timestamp, source, severity, event, details
- Global `error` and `unhandledrejection` listeners at load time

**DebugPill.jsx** - Floating debug panel
- Separate React root (survives App crashes)
- Collapsed: "dbg" pill with error/warning badge counts
- Expanded: Log tab (color-coded, auto-scroll, timestamps) + Env tab (URL, UA, screen, SW status, etc.)
- Copy button generates full debug report to clipboard (with textarea fallback)
- Only mounted when `import.meta.env.DEV` is true

---

## 2026-02-13

### Fixed frame rendering artifact

Replaced `box-shadow: inset` with `border` + `box-sizing: border-box` for all frame overlays in AdCanvas.jsx (fullbleed cell frame, grid cell frame, outer canvas frame). The inset box-shadow caused a thin visible line at the outer edge due to sub-pixel anti-aliasing. CSS `border` renders with crisp, pixel-aligned edges.

### Sample images pagination and category scroll

- Added pagination to sample images grid (15 per page, Prev/Next controls, page counter)
- Page resets to 1 when switching categories
- Category filter chips changed from flex-wrap to horizontal scroll with right-edge fade indicator

---

## 2026-02-12

### Decoupled sample images — runtime manifest fetch

Moved all sample image generation concerns out of this repo. The assets repo (`devmade-ai/canva-grid-assets`) is now the single source of truth. This app fetches a `manifest.json` from CDN at runtime instead of bundling a static config.

**Config Changes (`src/config/sampleImages.js`)**
- Replaced auto-generated 26-line config with a single `SAMPLE_MANIFEST_URL` constant
- App no longer needs to know about categories or images at build time

**UI Changes (`MediaTab.jsx` SampleImagesSection)**
- Fetches manifest.json on mount with loading/error/empty states
- Loading: spinner with "Loading sample images..." text
- Error: message with "Try again" button
- Empty: "No sample images available" message
- Category chips only render when categories exist in manifest
- CDN base URL comes from manifest's `cdnBase` field (not a hardcoded constant)

**PWA Changes (`vite.config.js`)**
- Added `StaleWhileRevalidate` rule for manifest.json (7-day cache, before CacheFirst image rule)
- Ensures new images appear on next online visit while serving cached manifest offline

**Removed from this repo**
- `scripts/generate-samples.mjs` — belongs in the assets repo
- `generate-samples` npm script from package.json
- `sample-sources` and `sample-output` from .gitignore (no longer relevant)

### Earlier: Migrated sample images to CDN with categories

Replaced 10 bundled sample images (13MB in `public/samples/`) with a CDN-hosted system supporting categorized images.

- Added category filter chips (All + per-category) matching TemplatesTab style
- Thumbnails loaded from CDN with `loading="lazy"` for performance
- Full images fetched on click with loading spinner overlay and 30-second timeout
- Added jsDelivr CDN runtime caching (CacheFirst, 200 max entries, 30-day expiry)
- Deleted `public/samples/` directory (13MB removed from repo)

---

## 2026-02-10

### Global cell selection + sticky ContextBar

- **ContextBar component**: New sticky bar below header with page nav, miniature cell grid selector, and undo/redo
- **Global selectedCell state**: Single source of truth for which cell is being edited, passed to StyleTab, ContentTab, MediaTab
- **Canvas click-to-select**: Clicking a cell in the preview sets the global selected cell (with highlight border)
- **Header simplified**: No longer sticky (ContextBar is), undo/redo and page nav moved to ContextBar
- **StyleTab**: Overlay and spacing sections now use global selectedCell — removed toggle-to-null handlers, null guards, deselect buttons, and overview sections (always-selected model)
- **ContentTab**: Freeform mode uses global selectedCell — added lower bound check for cell index clamping
- **MediaTab**: Auto-selects image assigned to global selectedCell when cell changes

### Auto-assign images, export fix

- **Auto-assign images to cells**: `addImage` now assigns new images to the first unoccupied image cell based on `layout.imageCells`
- **Fixed multi-page export**: Was exporting first page twice with overlaid text. Fixed by adding double `requestAnimationFrame` wait for browser paint between page switches, and always restoring to original page after export

### UI Fixes: Presets, Pages, Content

- Removed confusing blue/green indicator dots from page thumbnails (too small, no legend)
- Fixed PageStrip mobile responsiveness: thumbnails wrap instead of being squeezed
- Fixed markdown rendering: `whiteSpace: pre-wrap` was conflicting with HTML from `marked`
- Made Auto alignment icon visually distinct from Center (was identical geometry, only opacity differed)
- Moved Sample Images from Media tab to Presets tab (better fits "start here" workflow)

## 2026-02-09

### Multi-Page Support, Reader Mode, and Freeform Text

Added multi-page document creation, a reader view for viewing pages, and a freeform per-cell text mode with optional markdown support.

**Multi-Page System (useAdState.js)**
- Pages array in state: each page stores its own images, layout, text, overlays, etc.
- Shared across pages: theme, fonts, platform, logo
- Active page data lives at top-level (zero changes needed to existing components)
- Page management: `addPage`, `duplicatePage`, `removePage`, `movePage`, `setActivePage`
- `getPageState(index)` for rendering page thumbnails/previews
- Save/load handles multi-page state (with legacy single-page backward compatibility)

**PageStrip Component (PageStrip.jsx)**
- Horizontal strip showing page thumbnails with page numbers
- Add, duplicate, delete, move left/right controls
- Scrollable for many pages
- Always visible in editor

**Reader Mode (App.jsx)**
- "View" button in header toggles reader mode
- Clean full-screen view with no editing controls
- Page navigation: Previous/Next buttons + dot indicators
- Arrow key navigation (left/right/up/down)
- Escape key exits reader mode
- Dark mode toggle available in reader

**Freeform Text Mode (ContentTab.jsx)**
- Structured/Freeform toggle at top of Content tab
- Structured: existing text groups (Title, Tagline, Body, CTA, Footnote)
- Freeform: per-cell text editors with independent content per cell
- Per-cell controls: alignment, color, size
- Markdown toggle per cell (MD button)

**Markdown Rendering (AdCanvas.jsx)**
- Added `marked` library for markdown parsing
- Freeform cells with markdown enabled render formatted HTML
- Supports: headings, bold, italic, lists, blockquotes, code, links, horizontal rules
- CSS styles for markdown content in `index.css` (`.freeform-markdown` class)
- Falls back to plain text rendering when markdown is off

**Multi-Page Export (ExportButtons.jsx)**
- "Download All Pages (ZIP)" button appears when multiple pages exist
- Exports each page as a numbered PNG (page-001, page-002, etc.)
- Progress indicator during export
- Existing single-page and multi-platform export unchanged

**New Dependencies**
- `marked` - Markdown parser for freeform text cells

---

## 2026-02-04

### Save/Load Designs to localStorage

Added ability to save and load designs for persistence across browser sessions:

**useAdState.js**
- `saveDesign(name)` - Saves current state to localStorage with timestamp
- `loadDesign(designId)` - Loads a saved design and resets history
- `getSavedDesigns()` - Returns list of saved designs (id, name, savedAt)
- `deleteDesign(designId)` - Removes a saved design

**SaveLoadModal.jsx**
- Tab-based UI: "Save Current" and "Load" tabs
- Save tab: Name input + save button
- Load tab: List of saved designs with load/delete actions
- Shows date/time for each saved design

**App.jsx**
- Added "Save" button to desktop and mobile headers
- Opens SaveLoadModal for save/load operations

### Restored Fine-Grained Image Position Sliders

Re-added x/y position sliders for precise image positioning:

**MediaTab.jsx**
- Added X and Y range sliders (0-100%) below the 3x3 position preset grid
- Shows current percentage value next to each slider
- Works alongside preset buttons for quick + fine control

### Added Corner Radial Overlay Types

Added 4 new radial gradient overlays that emanate from corners:

**layouts.js**
- `radial-tl` (Corner ↖) - Radial from top-left corner
- `radial-tr` (Corner ↗) - Radial from top-right corner
- `radial-bl` (Corner ↙) - Radial from bottom-left corner
- `radial-br` (Corner ↘) - Radial from bottom-right corner

Note: Diagonal linear gradients (↖ ↗ ↙ ↘) already existed.

---

## 2026-02-03

### Documentation Accuracy Fixes

Fixed outdated references to "Complete Designs" across documentation and user-facing content:

**CLAUDE.md updates**
- Fixed Presets tab description: Layout, Themes, Looks (not "Complete Designs + Layout Only")
- Fixed Style tab description: Removed "Themes" (themes are in Presets tab, not Style)
- Updated architecture comments for StyleTab.jsx and TemplatesTab.jsx
- Added AI Note: "CRITICAL: Keep TutorialModal.jsx up to date" since it's user-facing

**TutorialModal.jsx updates (user-facing!)**
- Presets step: Now shows Layout, Themes, Looks sections
- Style step: Removed Themes, added note that themes are in Presets tab

USER_GUIDE.md was already accurate.

---

### PWA Support

Added Progressive Web App support for installable app and offline capability:

**Core PWA Setup**
- Added `vite-plugin-pwa` with Workbox service worker
- Created app icon (SVG in `public/icon.svg`, PNG generation via `scripts/generate-icons.mjs`)
- Configured manifest with app name, colors, icons
- Added PWA meta tags to index.html (theme-color, apple-touch-icon, etc.)

**Install & Update UX (Vercel/Supabase style)**
- `usePWAInstall` hook - manages install prompt state
- `usePWAUpdate` hook - manages update detection state
- Purple "Install" button in header (only shows when installable)
- Green "Update" button in header (only shows when update available)
- Non-intrusive: no popups, just header buttons that appear when relevant

**Technical Details**
- `registerType: 'prompt'` for user-controlled updates
- Google Fonts cached via Workbox runtime caching
- Sample images excluded from precache (too large, not essential offline)
- Icons auto-generated at build time via `prebuild` npm script

---

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

### eb92465 - Add CanvaGrid implementation

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
