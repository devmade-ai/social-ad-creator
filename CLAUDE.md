# READ AND FOLLOW THE FUCKING PROCESS, PRINCIPLES, CODE STANDARDS, DOCUMENTATION, AI NOTES, TRIGGERS, AND PROHIBITIONS EVERY TIME

## Fetching External CLAUDE.md

The shared scaffolding (Process, Principles, Code Standards, Documentation, AI Notes, Triggers, Prohibitions, Suggested Implementations) is maintained in the sister project `devmade-ai/glow-props`.

To fetch the latest version:
```bash
curl -sf "https://devmade-ai.github.io/glow-props/CLAUDE.md"
```

When fetching updates, merge changes into the shared sections while preserving canva-grid-specific content (Project Info, Architecture, State Structure, Tab Details, etc.).

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

### REMINDER: READ AND FOLLOW THE FUCKING PROCESS EVERY TIME

## Principles

1. **User-first design** - Align with how real people will use the tool (top priority)
2. **Simplicity** - Simple flow, clear guidance, non-overwhelming visuals, accurate interpretation
3. **Document WHY** - Explain decisions and how they align with tool goals
4. **Testability** - Ensure correctness and alignment with usage goals can be verified
5. **Know the purpose** - Always be aware of what the tool is for
6. **Follow conventions** - Best practices and consistent patterns
7. **Repeatable process** - Follow consistent steps to ensure all the above

### REMINDER: READ AND FOLLOW THE FUCKING PRINCIPLES EVERY TIME

## Code Standards

### Code Organization

- Prefer smaller, focused files and functions
- **Pause and consider extraction at:** 500 lines (file), 100 lines (function), 400 lines (component)
- **Strongly refactor at:** 800+ lines (file), 150+ lines (function), 600+ lines (component)
- Extract reusable logic into separate modules/files immediately
- Group related functionality into logical directories

### Decision Documentation in Code

Non-trivial code changes must include comments explaining:
- **What** was the requirement or instruction
- **Why** this approach was chosen
- **What alternatives** were considered and why they were rejected

```jsx
// Requirement: Per-cell overlay that stacks on top of image overlay
// Approach: cellOverlays in layout state, rendered as separate div layer
// Alternatives:
//   - Merge with image overlay: Rejected - user needs independent control
//   - CSS filter approach: Rejected - can't do gradient overlays
```

### Cleanup

- Remove `console.log`/`console.debug` statements before marking work complete
- Delete unused imports, variables, and dead code immediately
- Remove commented-out code unless explicitly marked `// KEEP:` with reason
- Remove temporary/scratch files after implementation is complete

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing input validation at boundaries
- Security concerns (XSS via dangerouslySetInnerHTML, unsanitized user input)
- Performance issues (unnecessary re-renders, missing keys, large re-computations)

Report findings even if not directly related to current task.

### User Experience (Non-Negotiable)

All end users are non-technical. This overrides cleverness.

- UI must be intuitive without instructions
- Use plain language - no jargon or developer-speak in user-facing text
- Error messages must say what went wrong AND what to do next, in simple terms
- Confirm destructive actions with clear consequences explained
- Provide feedback for all user actions (loading states, success confirmations)

### Commit Message Format

All commits must include metadata footers:

```
type(scope): subject

Body explaining why.

Tags: tag1, tag2, tag3
Complexity: 1-5
Urgency: 1-5
Impact: internal|user-facing|infrastructure|api
Risk: low|medium|high
Debt: added|paid|neutral
Epic: feature-name
Semver: patch|minor|major
```

**Tags:** Use descriptive tags relevant to the change (e.g., docs, state, layout, export, pwa, text, media, ui)
**Complexity:** 1=trivial, 2=small, 3=medium, 4=large, 5=major rewrite
**Urgency:** 1=planned, 2=normal, 3=elevated, 4=urgent, 5=critical
**Impact:** internal, user-facing, infrastructure, or api
**Risk:** low=safe change, medium=could break things, high=touches critical paths
**Debt:** added=introduced shortcuts, paid=cleaned up debt, neutral=neither
**Epic:** groups related commits under one feature/initiative name
**Semver:** patch=bugfix, minor=new feature, major=breaking change

These footers are required on every commit. No exceptions.

### REMINDER: READ AND FOLLOW THE FUCKING CODE STANDARDS EVERY TIME

## Documentation

**AI assistants automatically maintain these documents.** Update them as you work - don't wait for the user to ask. This ensures context is always current for the next session.

### `CLAUDE.md`

**Purpose:** AI preferences, project overview, architecture, key state structures.
**When to read:** At the start of every session, before doing any work.
**When to update:** When project architecture changes, state structure changes, or preferences evolve.
**What to include:**

- Process, Principles, AI Notes: Update when learning new patterns or preferences
- Project Status: Current working features (bullet list)
- Architecture: File structure with brief descriptions
- Key State Structure: Important state shapes with comments
- Any section that becomes outdated after feature changes

**Why:** This is the primary context for AI assistants. Accurate info here prevents mistakes.

### `docs/SESSION_NOTES.md`

**Purpose:** Compact context summary for session continuity (like `/compact` output).
**When to read:** At the start of a session to quickly understand what was done previously.
**When to update:** Rewrite at session end with a fresh summary. Clear previous content.
**What to include:**

- **Worked on:** Brief description of focus area
- **Accomplished:** Bullet list of completions
- **Current state:** Where things stand (working/broken/in-progress)
- **Key context:** Important info the next session needs to know

**Why:** Enables quick resumption without re-reading entire codebase. Not a changelog - a snapshot.

### `docs/TODO.md`

**Purpose:** AI-managed backlog of ideas and potential improvements.
**When to read:** When looking for work to do, or when the user asks about pending tasks.
**When to update:** When noticing potential improvements. Move completed items to HISTORY.md.
**What to include:**

- Group by category (Features, UX, Technical, etc.)
- Use `- [ ]` for pending items only
- Brief description of what and why
- When complete, move to HISTORY.md (don't keep in TODO)

**Why:** User reviews this to prioritize work. Keeps TODO focused on pending items only.

### `docs/HISTORY.md`

**Purpose:** Changelog and record of completed work.
**When to read:** When you need historical context about why something was built a certain way.
**When to update:** When completing TODO items or making significant changes.
**What to include:**

- Completed TODO items (organized by category)
- Bug fixes and changes (organized by date)
- Brief description of what was done

**Why:** Historical context separate from active TODO. Tracks what's been accomplished.

### `docs/USER_ACTIONS.md`

**Purpose:** Manual actions requiring user intervention outside the codebase.
**When to read:** When something requires manual user intervention (deployments, API keys, external config).
**When to update:** When tasks need external action. Clear when completed.
**What to include:**

- Action title and description
- Why it's needed
- Steps to complete
- Keep empty when nothing pending (with placeholder text)

**Why:** Some tasks require credentials, dashboards, or manual config the AI can't do.

### `docs/AI_MISTAKES.md`

**Purpose:** Record significant AI mistakes and learnings to prevent repetition.
**When to read:** When starting a session, to avoid repeating past mistakes.
**When to update:** After making a mistake that wasted time or broke things.
**What to include:**

- What went wrong
- Why it happened
- How to prevent it
- Date (for context)

**Why:** AI assistants repeat mistakes across sessions. This document builds institutional memory.

### `README.md`

**Purpose:** User-facing guide for the application.
**When to read:** When you need a quick overview of what the tool does and its main features.
**When to update:** When features change that affect how users interact with the tool.
**What to include:**

- What the tool does (overview)
- Current features (keep in sync with actual functionality)
- How to use each feature (user guide)
- Getting started / installation
- Tech stack and deployment info

**Why:** Users and contributors read this first. Must accurately reflect the current state.

### `docs/USER_GUIDE.md`

**Purpose:** Comprehensive user documentation explaining how to use every feature.
**When to read:** When you need to understand what users can do with the tool, or how a feature is supposed to work from the user's perspective.
**When to update:** When adding new features, changing UI workflows, or modifying how existing features work.
**What to include:**

- Tab-by-tab walkthrough of the interface
- Explanation of every control and what it does
- Workflow tips and best practices
- Organized by user tasks, not technical implementation

**Why:** Serves as the authoritative reference for user-facing behavior. Helps ensure AI assistants understand the user experience.

### `docs/TESTING_GUIDE.md`

**Purpose:** Manual test scenarios for verifying the application works correctly.
**When to read:** Before testing changes, or when you need to verify specific functionality works.
**When to update:** When adding new features that need test coverage, or when existing tests become outdated.
**What to include:**

- Step-by-step test scenarios with exact actions
- Where to click/look for each step
- Expected results for each action
- Regression checklist for quick verification

**Why:** Ensures consistent, thorough testing. Prevents regressions by documenting what to verify after changes.

### `docs/STYLE_GUIDE.md`

**Purpose:** Visual design system documentation (colors, typography, spacing, components).
**When to read:** When implementing UI changes, adding new components, or adjusting visual design.
**When to update:** When the design system evolves (new colors, spacing tokens, component patterns).
**What to include:**

- Color palette with hex values and semantic tokens
- Typography scale and font choices
- Spacing system and border radius tokens
- Component patterns (buttons, inputs, cards, tabs)
- Dark mode specifications
- Accessibility requirements

**Why:** Ensures visual consistency across the application. Reference for implementing new UI.

### REMINDER: READ AND FOLLOW THE FUCKING DOCUMENTATION EVERY TIME

## AI Notes

<!-- Reminders and learnings for AI assistants - add to this as needed -->

- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Clean up completed or obsolete docs/files and remove references to them
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users.
- **NEVER use the AskUserQuestion tool.** It breaks the session UI — the input selector covers context, gets stuck awaiting input, and provides zero value. Instead, list options as numbered text in your response and let the user reply with a number or text. This is absolute and applies to every session, every project, no exceptions.
- **ASK before assuming.** When a user reports a bug, ask clarifying questions (which mode? what did you type? what do you see?) BEFORE writing code. Don't guess the cause and build a fix on an assumption - you'll waste time fixing the wrong thing. One clarifying question saves multiple wrong commits.
- **Always read files before editing.** Use the Read tool on every file before attempting to Edit it. Editing without reading first will fail.
- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. The `sharp` package may not be installed (used by prebuild icon generation), so use `./node_modules/.bin/vite build` directly to skip the prebuild step.
- **Communication style:** Direct, concise responses. No filler phrases or conversational padding. State facts and actions. Ask specific questions with concrete options when clarification is needed.
- **PWA install prompt race condition:** `beforeinstallprompt` is captured by an inline script in `index.html` before React mounts. The `usePWAInstall` hook checks `window.__pwaInstallPrompt` on mount. Never remove that inline script.
- **PWA icon purposes:** Never combine `"any maskable"` in a single icon entry. Use separate entries with individual `purpose` values. Dedicated 1024px maskable icon at `pwa-maskable-1024.png`.
- **Debug system (dev only):** `src/utils/debugLog.js` is an in-memory 200-entry circular buffer with pub/sub. `src/components/DebugPill.jsx` renders in a separate React root (survives App crashes). Only mounted in `import.meta.env.DEV`. Use `debugLog(source, event, details, severity)` to add entries.
- **pdf-lib image handling:** pdf-lib embeds PNG directly (FlateDecode — no re-encoding). Digital PDF uses pxToPt=0.5 (144 DPI) for reasonable page sizes (~7.5" for 1080px platforms). Captures at user-selected pixelRatio (1x/2x/3x), giving integer px/pt ratios (2/4/6). Print formats use pixelRatio:1 with 72/150 conversion. History: (1) pixelRatio:2 + 72/96 → 2.667:1 ratio → gradient banding. (2) 1:1 mapping + page scaled with pixelRatio → identical quality. (3) pxToPt=1 fixed page → 15" pages too large for mobile viewers. (4) pxToPt=0.5 → reasonable page size + sharp rendering. Diagnostic image download enabled in dev mode.
- **Design storage is IndexedDB:** `utils/designStorage.js` wraps IndexedDB with async save/load/list/delete. One-time migration from localStorage runs on first mount via `migrateFromLocalStorage()`. Never use localStorage for designs.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead
- **Mobile breakpoint:** `useIsMobile` hook uses `matchMedia('(max-width: 1023px)')` — matches Tailwind `lg` breakpoint. App.jsx conditionally renders entirely different layouts for mobile vs desktop. When modifying layout/UI in App.jsx, always check both code paths.
- **BottomSheet snap points:** closed (0), half (50vh), full (85vh). Uses `transform: translateY()` for GPU-composited animation (no layout reflow). During drag, DOM updated directly via refs — React state only updates on snap (touchend). Sheet state resets when switching tabs. Props: `snapPoint`/`onSnapChange` (discrete snap values, not continuous height).
- **Sister project reference:** `devmade-ai/glow-props` shares the same CLAUDE.md scaffolding (process, principles, standards). Its `Suggested Implementations` section documents PWA patterns, debug system, and icon generation that were adopted here. Check it for future cross-pollination: `https://github.com/devmade-ai/glow-props/blob/main/CLAUDE.md`

### REMINDER: READ AND FOLLOW THE FUCKING AI NOTES EVERY TIME

## Prohibitions

Never:
- Start implementation without understanding full scope
- Create files outside established project structure
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Ignore errors or warnings in build/console output
- Make "while I'm here" changes without asking first
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Proceed with assumptions when a single clarifying question would prevent a wrong commit
- Use interactive input prompts or selection UIs — list options as numbered text instead

### REMINDER: READ AND FOLLOW THE FUCKING PROHIBITIONS EVERY TIME

## Triggers

Single-word commands that invoke focused analysis passes. Each trigger has a short alias. Type the word or alias to activate.

| # | Trigger | Alias | What it does |
|---|---------|-------|--------------|
| 1 | `review` | `rev` | Code review — bugs, UI, UX, simplification |
| 2 | `audit` | `aud` | Code quality — hacks, anti-patterns, latent bugs, race conditions |
| 3 | `docs` | `doc` | Documentation accuracy vs actual code |
| 4 | `mobile` | `tap` | Mobile UX — touch targets, viewport, safe areas |
| 5 | `clean` | `cln` | Hygiene — duplication, refactor candidates, dead code |
| 6 | `performance` | `perf` | Re-renders, expensive ops, bundle size, DB/API, memory |
| 7 | `security` | `sec` | Injection, auth gaps, data exposure, insecure defaults, CVEs |
| 8 | `debug` | `dbg` | Debug pill coverage — missing logs, noise |
| 9 | `improve` | `imp` | Open-ended — architecture, DX, anything else |
| 10 | `start` | `go` | Sequential sweep of all 9 above, one at a time |

### Trigger behavior

- Each trigger runs a single focused pass and reports findings.
- Findings are listed as numbered text — never interactive prompts or selection UIs.
- One trigger per response. Never combine multiple triggers in a single response.

### `start` / `go` behavior

Runs all 9 triggers in priority sequence, one at a time:

`rev` → `aud` → `doc` → `tap` → `cln` → `perf` → `sec` → `dbg` → `imp`

After each trigger completes and findings are presented, the user responds with one of:
1. `fix` — apply the suggested fixes, then move to the next trigger
2. `skip` — skip this trigger's findings and move to the next trigger
3. `stop` — end the sweep entirely

Rules:
- Always pause after each trigger — never auto-advance to the next one.
- Never run multiple triggers in one response.
- Wait for the user's explicit `fix`, `skip`, or `stop` before proceeding.

### REMINDER: READ AND FOLLOW THE FUCKING TRIGGERS EVERY TIME

---

## Quick Reference

```
LANGUAGE=JavaScript (ES2020+)
FRAMEWORK=React 18
BUNDLER=Vite
STYLING=Tailwind CSS (utility classes in JSX - no separate stylesheets)
TEST_RUNNER=Manual (see docs/TESTING_GUIDE.md)
PACKAGE_MANAGER=npm
DEPLOY=Vercel (auto-deploy on push to main)
NAMING=camelCase (variables/functions), PascalCase (components)
FILE_NAMING=PascalCase.jsx (components), camelCase.js (hooks/utils/config)
COMPONENT_STRUCTURE=flat (src/components/)
DOCS_PATH=/docs
```

---

## Project Info

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CanvaGrid - A browser-based visual design tool. Users can upload images, add text overlays, choose layouts, and export designs for social media, web, print, and presentations. Supports multi-page documents for books, stories, and slide decks.

## Project Status

Core features working:

- **Multi-page support**: Create multi-page documents (books, stories, presentations)
  - Pages array with add/duplicate/delete/reorder via ContextBar
  - Per-page: images, layout, text, overlays, padding, frames
  - Shared across pages: theme, fonts, platform, logo
- **Reader mode**: Clean full-screen view with page navigation (arrow keys, buttons, dots)
- **Freeform text mode**: Toggle on Content tab between Guided and Freeform
  - Per-cell multi-block text editors with independent content, color, size, alignment
  - Automatic markdown rendering (uses `marked` library)
- Multi-image system: Image library with per-cell assignment
  - Upload multiple images to a shared library
  - Assign different images to different cells (1 per cell)
  - Per-cell image settings: fit, position, filters
- Logo upload with position (corners, center) and size options
- Frame system: Colored borders using percentage of padding
- Flexible layout system with sub-tab organization (see Layout Tab Sub-tabs below)
- Per-cell structured text (guided mode):
  - Each cell has its own text elements: title, tagline, bodyHeading, bodyText, cta, footnote
  - Text elements organized in groups: Title+Tagline, Body, CTA, Footnote
- Theme system with 12 color themes and custom colors
- Overlay system with 26 effects:
  - Basic: Solid color
  - Linear gradients: 8 directions (↑↓←→ and diagonals)
  - Radial: Vignette, Spotlight, Radial Soft, Radial Ring, 4 corner radials (↖↗↙↘)
  - Effects: Blur Edges, Frame, Duotone
  - Blend modes: Multiply, Screen, Overlay, Color Burn
  - Textures: Noise, Film Grain
- 15 Google Fonts (sans-serif, serif, display categories)
- Export to 27 formats across 12 platform groups:
  - Social: Instagram (Feed Portrait/Square/Feed Landscape/Story), Facebook (Feed/Square/Story/Cover), TikTok, LinkedIn (Square/Portrait/Landscape), Twitter/X
  - Website: Hero (Standard/Tall/Full HD), OG Image
  - Banners: LinkedIn Banner, YouTube Banner
  - Print: A3, A4, A5 (Portrait & Landscape at 150 DPI)
  - Other: Email Header, Zoom Background
- **Export format selection**: PNG, JPG, or WebP with per-platform recommendations
- Single download, ZIP batch download, multi-page ZIP export, and PDF export
- **PDF export**: Save as PDF via pdf-lib (PNG at 2x for lossless quality, with JPEG fallback)
- **Platform specs**: Two-level selector (platform → format), tips, file size limits, recommended formats
- Responsive preview that adapts to device width
- **PWA support**: Installable app with offline capability and update prompts
  - Inline `beforeinstallprompt` capture in index.html (race condition fix)
  - Explicit manifest `id` for stable install identity
  - Dedicated 1024px maskable icon with separated icon purposes
- **Debug system (dev only)**: In-memory event log with floating DebugPill (separate React root)
- **Toast notifications**: Non-blocking feedback for exports, saves, deletes, warnings
- **Inline confirmations**: ConfirmButton replaces browser confirm() for destructive actions
- **Export progressive disclosure**: Secondary options collapse into "More export options"
- **Canvas controls**: Empty state guidance, contextual quick-actions for selected cell
- **Keyboard shortcuts**: 1-5 for tab switching, shortcut overlay panel (header button)
- **Mobile-first layout** (viewport < 1024px): Bottom nav bar (MobileNav), touch-draggable bottom sheet (BottomSheet) for tab content, edge-to-edge canvas, swipe-between-pages gesture, compact header with overflow menu, platform info strip

## Current Tab Structure

**Top-level tabs:** Presets, Media, Content, Structure, Style (+ Export on mobile)

### Desktop layout (>= 1024px)

Tabs render as a full-width horizontal nav bar below the header (website header pattern), with underline-style active indicator. Below the tabs is a unified ContextBar containing: cell selector | page management | undo/redo.

```
Header (scrolls away)
Tab Nav Bar (sticky, full-width, underline active indicator)
Context Bar: [Cell grid] | [Page thumbnails + actions] | [Undo/Redo]
Sidebar (tab content) | Main (platform selector + canvas + export)
```

### Mobile layout (< 1024px, detected by `useIsMobile` hook)

Fixed viewport with edge-to-edge canvas. Tab content lives in a touch-draggable BottomSheet with three snap points (closed/half/full). Navigation via fixed MobileNav bar at bottom.

```
Compact Header (hamburger overflow menu: Save, View, Install, Dark Mode, Help, Shortcuts)
Platform Info Strip (current format name + dimensions)
Canvas (edge-to-edge, swipe left/right for page navigation)
ContextBar (cell grid + page thumbnails + undo/redo)
BottomSheet (active tab content, drag to resize)
MobileNav (fixed bottom: Presets, Media, Content, Structure, Style, Export)
```

Export is a dedicated tab on mobile (vs. sidebar section on desktop) containing only download controls — platform selection lives in the Presets tab. Tapping the active tab toggles the bottom sheet open/closed.

Tab descriptions (workflow-based organization):
- **Presets** - Start here: Platform selection (canvas size), layout presets (with aspect ratio filtering), color themes, and visual looks
- **Media** - Sample images, upload images to library, assign to cells, per-image overlay & filters, logo
- **Content** - Write text, set visibility, cell assignment, alignment, color, size
- **Structure** - Fine-tune grid structure (section sizes, subdivisions, reorder)
- **Style** - Typography, per-cell overlay, spacing, frames

## Tech Stack

- Vite + React 18
- Tailwind CSS
- html-to-image for rendering
- JSZip + file-saver for batch export
- marked for markdown parsing (freeform text mode)
- Vercel deployment

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
```

## Architecture

```
src/
├── components/     # React components
│   ├── AdCanvas.jsx           # Core rendering (cell-based layout)
│   ├── CollapsibleSection.jsx # Reusable collapsible section for tab content
│   ├── TemplatesTab.jsx       # Layout presets, themes, and looks
│   ├── MediaTab.jsx           # Sample images, image + logo upload, fit, position, filters
│   ├── ContentTab.jsx         # Text editing with cell assignment
│   ├── LayoutTab.jsx          # Grid structure + cell alignment
│   ├── StyleTab.jsx           # Typography, overlay, spacing (themes in Presets tab)
│   ├── ContextBar.jsx         # Sticky bar: cell selector + page management + undo/redo
│   ├── PlatformPreview.jsx    # Platform selector
│   ├── ExportButtons.jsx      # Export controls (single, multi-platform, multi-page)
│   ├── TutorialModal.jsx      # In-app help walkthrough (8 steps covering all tabs)
│   ├── SaveLoadModal.jsx      # Save/load/delete designs (IndexedDB)
│   ├── LogoUploader.jsx       # Logo upload, position, and size controls
│   ├── InstallInstructionsModal.jsx # Manual PWA install instructions
│   ├── ErrorBoundary.jsx      # Error handling wrapper
│   ├── AlignmentPicker.jsx    # Reusable alignment button group
│   ├── MiniCellGrid.jsx       # Compact cell grid for ContextBar
│   ├── Toast.jsx              # Toast notification system (ToastProvider + useToast hook)
│   ├── ConfirmButton.jsx      # Inline confirmation replacing browser confirm()
│   ├── Tooltip.jsx            # Portal-based tooltip (prevents clipping at container edges)
│   ├── KeyboardShortcutsOverlay.jsx # Keyboard shortcuts modal
│   ├── EmptyStateGuide.jsx    # Empty canvas guidance (below canvas on mobile, overlay on desktop)
│   ├── QuickActionsBar.jsx    # Cell quick-action shortcuts (Image, Text, Style)
│   ├── BottomSheet.jsx        # Touch-draggable bottom sheet for mobile tab content (3 snap points)
│   ├── MobileNav.jsx          # Fixed bottom navigation bar for mobile (6 tabs incl. Export)
│   └── DebugPill.jsx          # Floating debug panel (separate React root, dev only)
├── config/         # Configuration
│   ├── layouts.js        # 26 overlay types (solid, gradients, radial, effects, blends, textures)
│   ├── layoutPresets.js  # 27 layouts with SVG icons and categories
│   ├── stylePresets.js   # Look presets (fonts + filters + overlay effects per layout)
│   ├── platforms.js      # 27 formats across 12 platform groups (nested: platformGroups + flat: platforms)
│   ├── sampleImages.js   # CDN manifest URL for sample images (fetched at runtime)
│   ├── themes.js         # 12 color themes
│   ├── fonts.js          # 15 Google Fonts
│   ├── textDefaults.js   # Default text layer state (shared by AdCanvas + ContentTab)
│   └── alignment.jsx     # Alignment icon components and option arrays
├── hooks/
│   ├── useAdState.js     # Central state (multi-page, per-cell text, freeformText, layout)
│   ├── useHistory.js     # Undo/redo history management (shallowEqual skips base64)
│   ├── useDarkMode.js    # Dark mode toggle
│   ├── useOnlineStatus.js # Online/offline detection
│   ├── useFocusTrap.js   # Focus trap for modals (Tab/Shift+Tab boundary wrapping)
│   ├── useIsMobile.js    # matchMedia hook: viewport < 1024px (Tailwind lg breakpoint)
│   ├── usePWAInstall.js  # PWA install prompt state
│   └── usePWAUpdate.js   # PWA update detection state
├── utils/
│   ├── cellUtils.js      # Cell counting, shifting, swapping, cleanup utilities
│   ├── designStorage.js  # IndexedDB wrapper for design persistence
│   └── debugLog.js       # In-memory debug event store (200-entry circular buffer)
├── App.jsx
└── main.jsx
```

## Key State Structure

```js
// Multi-page support
// pages[activePage] = null means active page data is at top-level
// pages[otherIndex] = { ...perPageFields } for inactive pages
pages: [null, { images: [...], layout: {...}, text: {...}, ... }]
activePage: 0  // Index of active page

// Per-page fields: activeStylePreset, activeLayoutPreset, images, cellImages,
//   defaultImageSettings, text, layout, padding, frame, textMode, freeformText
// Shared fields: theme, fonts, platform, exportFormat, logo, logoPosition, logoSize

// Text mode: 'structured' (guided text groups) or 'freeform' (per-cell blocks)
// UI labels this as "Guided" / "Freeform" but state value remains 'structured'
textMode: 'structured'

// Freeform text — array of independently styled markdown blocks per cell.
// Content is always parsed as markdown via `marked` — no per-cell toggle.
freeformText: {
  0: [  // Array of block objects per cell
    { id: 'block-xxx', content: 'Hello **world**', color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, spacerAbove: 0, spacerBelow: 0, lineAbove: false, lineBelow: false },
    { id: 'block-yyy', content: 'Second block', color: 'primary', size: 0.8, bold: false, italic: false, letterSpacing: 0, textAlign: null, spacerAbove: 0, spacerBelow: 0, lineAbove: false, lineBelow: false },
  ],
  1: [ /* ... */ ],
}

// Image library - all uploaded images with individual settings including overlay
images: [
  {
    id: 'img-123',
    src: 'data:...',
    name: 'hero.jpg',
    fit: 'cover',
    position: { x: 50, y: 50 },
    filters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
    overlay: { type: 'solid', color: 'primary', opacity: 0 }  // Per-image overlay
  },
]

// Per-cell image assignments (just the image ID - settings are on the image itself)
cellImages: {
  0: 'img-123',  // Maps cell index to image ID
}

layout: {
  type: 'fullbleed' | 'rows' | 'columns',
  structure: [
    { size: 50, subdivisions: 1, subSizes: [100] },  // Section with optional subdivisions
    { size: 50, subdivisions: 2, subSizes: [50, 50] }
  ],
  textAlign: 'center',           // Global horizontal alignment fallback
  textVerticalAlign: 'center',   // Global vertical alignment fallback
  cellAlignments: [{ textAlign, textVerticalAlign }, ...]  // Per-cell overrides
  cellOverlays: {}  // Per-cell overlay settings
  cellBackgrounds: {}  // Per-cell background color override (color key, e.g. 'secondary', 'accent', 'off-white')
}

// Frame settings (colored border using percentage of padding)
frame: {
  outer: { percent: 0, color: 'primary' },  // Outer canvas frame
  cellFrames: { 0: { percent: 50, color: 'accent' } }  // Per-cell frames
}

// Per-cell structured text — each cell has its own text elements
text: {
  0: {  // cell index
    title: {
      content: '...',
      visible: true,
      color: 'secondary',
      size: 1,
      bold: true,
      italic: false,
      letterSpacing: 0,
      textAlign: null,         // Per-element horizontal alignment (null = use cell default)
      textVerticalAlign: null, // Per-element vertical alignment (null = use cell default)
    },
    // ... same structure for tagline, bodyHeading, bodyText, cta, footnote
  },
  1: { title: {...}, bodyText: {...} },  // Another cell
}

// Alignment fallback chain: element.textAlign → cellAlignments[cell] → layout.textAlign
```

## Tab Details (New Workflow-Based UI)

### Presets Tab (formerly Templates)
Entry point for users. Four sections:
- **Platform** - Target size selector (Instagram, TikTok, LinkedIn, print, etc.) — sets canvas dimensions. Shown on mobile only (desktop has platform selector always visible above canvas).
- **Layout** - Grid structure presets with aspect ratio filtering (All, Square, Portrait, Landscape) and category filtering
- **Themes** - 12 preset color themes + custom color inputs
- **Looks** - Visual effect presets that apply overlay, fonts, and filters without changing layout or colors

### Media Tab
Collapsible sections:
- **Sample Images** - CDN-hosted sample images with category filtering (manifest fetched at runtime from jsDelivr)
- **AI Image Prompt** - Helper for generating AI image prompts
- **Images** - Upload to library, cell selector, assign images to cells, per-image settings (fit, position)
- **Image Overlay** - Per-image overlay controls (type, color, opacity) for selected image
- **Advanced Filters** - Per-image: grayscale, sepia, blur, contrast, brightness
- **Logo** - Upload, position (corners/center), size

### Content Tab
Top-level toggle: **Guided** / **Freeform** (state value remains `'structured'` for backwards compat)

**Guided mode** - Text groups organized by purpose, each in a collapsible section:
- **Title & Tagline** - Paired text elements
- **Body** - Heading + body text
- **Call to Action** - CTA button text
- **Footnote** - Fine print
- Each text element has: visibility toggle, text input, alignment, color, size, bold/italic, letter spacing
- Text alignment controls (horizontal + vertical) per cell — moved from Structure tab

**Freeform mode** - Per-cell multi-block text editors:
- Multiple independently styled markdown blocks per cell (add/remove/reorder)
- Per-block controls: alignment, color, size, bold/italic, letter spacing, spacers, line decorators
- Automatic markdown rendering (content always parsed via `marked`)

### Structure Tab (formerly Layout)
Collapsible sections:
- **Structure** - Layout type (Full/Rows/Columns), interactive grid for editing section/cell sizes, add/remove sections and subdivisions, reorder sections (move up/down for rows, left/right for columns)

### Style Tab
Collapsible sections:
- **Typography** - Title font + body font selectors with preview
- **Overlay** - Per-cell overlay controls (stacks on top of image overlay)
- **Spacing** - Global padding + per-cell custom padding, outer frame + cell frames

Note: Color themes are in the Presets tab, not Style.

## Preset Types

| Name | Location | What It Applies | Config File |
|------|----------|-----------------|-------------|
| **Layouts** | Presets → Layout | Grid structure + image/text cell placements (filterable by aspect ratio) | `layoutPresets.js` |
| **Themes** | Presets → Themes | Color scheme only (primary, secondary, accent) | `themes.js` |
| **Looks** | Presets → Looks | Fonts + image filters + overlay (without changing layout or colors) | `stylePresets.js` |
