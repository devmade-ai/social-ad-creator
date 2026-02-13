# READ AND FOLLOW THE FUCKING PROCESS, PRINCIPLES, DOCUMENTATION, DOCUMENTATION GUIDELINES, AND AI NOTES EVERY TIME

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

### REMINDER: READ AND FOLLOW THE FUCKING DOCUMENTATION EVERY TIME

## AI Notes

<!-- Reminders and learnings for AI assistants - add to this as needed -->

- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Clean up completed or obsolete docs/files and remove references to them
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users.
- **ASK before assuming.** When a user reports a bug, ask clarifying questions (which mode? what did you type? what do you see?) BEFORE writing code. Don't guess the cause and build a fix on an assumption - you'll waste time fixing the wrong thing. One clarifying question saves multiple wrong commits.
- **Always read files before editing.** Use the Read tool on every file before attempting to Edit it. Editing without reading first will fail.
- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. The `sharp` package may not be installed (used by prebuild icon generation), so use `./node_modules/.bin/vite build` directly to skip the prebuild step.

### REMINDER: READ AND FOLLOW THE FUCKING AI NOTES EVERY TIME

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
- **Freeform text mode**: Toggle on Content tab between Structured and Freeform
  - Per-cell text editors with independent content, color, size, alignment
  - Optional markdown per cell (uses `marked` library)
- Multi-image system: Image library with per-cell assignment
  - Upload multiple images to a shared library
  - Assign different images to different cells (1 per cell)
  - Per-cell image settings: fit, position, filters
- Logo upload with position (corners, center) and size options
- Frame system: Colored borders using percentage of padding
- Flexible layout system with sub-tab organization (see Layout Tab Sub-tabs below)
- Text groups with cell assignment (structured mode):
  - Title + Tagline (paired)
  - Body Heading + Body Text (paired)
  - CTA (independent)
  - Footnote (independent)
- Theme system with 12 color themes and custom colors
- Overlay system with 20+ effects:
  - Basic: Solid color
  - Linear gradients: 8 directions (↑↓←→ and diagonals)
  - Radial: Vignette, Spotlight, Radial Soft, Radial Ring
  - Effects: Blur Edges, Frame, Duotone
  - Blend modes: Multiply, Screen, Overlay, Color Burn
  - Textures: Noise, Film Grain
- 15 Google Fonts (sans-serif, serif, display categories)
- Export to 20 platforms:
  - Social: Instagram Square/Story, TikTok, LinkedIn, Facebook, Twitter/X
  - Website: Hero (Standard/Tall/Full HD), OG Image
  - Banners: LinkedIn Banner, YouTube Banner
  - Print: A3, A4, A5 (Portrait & Landscape at 150 DPI)
  - Other: Email Header, Zoom Background
- Single download, ZIP batch download, and multi-page ZIP export
- Responsive preview that adapts to device width
- PWA support: Installable app with offline capability and update prompts

## Current Tab Structure

**Top-level tabs (horizontal nav bar):** Presets, Media, Content, Structure, Style

Tabs render as a full-width horizontal nav bar below the header (website header pattern), with underline-style active indicator. Below the tabs is a unified ContextBar containing: cell selector | page management | undo/redo.

Layout:
```
Header (scrolls away)
Tab Nav Bar (sticky, full-width, underline active indicator)
Context Bar: [Cell grid] | [Page thumbnails + actions] | [Undo/Redo]
Sidebar (tab content) | Main (platform selector + canvas + export)
```

Tab descriptions (workflow-based organization):
- **Presets** - Start here: Layout presets (with aspect ratio filtering), color themes, and visual looks
- **Media** - Sample images, upload images to library, assign to cells, per-image overlay & filters, logo
- **Content** - Write text, set visibility, cell assignment, alignment, color, size
- **Structure** - Fine-tune grid structure and cell alignment
- **Style** - Typography, per-cell overlay, spacing, frames

## Tech Stack

- Vite + React 18
- Tailwind CSS
- html-to-image for rendering
- JSZip + file-saver for batch export
- marked for markdown parsing (freeform text mode)
- GitHub Pages deployment

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run deploy           # Deploy to GitHub Pages
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
│   └── ErrorBoundary.jsx      # Error handling wrapper
├── config/         # Configuration
│   ├── layouts.js        # 20+ overlay types (solid, gradients, radial, effects, blends, textures)
│   ├── layoutPresets.js  # 20 layouts with SVG icons and categories
│   ├── stylePresets.js   # Look presets (fonts + filters + overlay effects per layout)
│   ├── platforms.js      # 14 platform sizes (social, web, banners, other)
│   ├── sampleImages.js   # CDN manifest URL for sample images (fetched at runtime)
│   ├── themes.js         # 12 color themes
│   └── fonts.js          # 15 Google Fonts
├── hooks/
│   ├── useAdState.js     # Central state (multi-page, textGroups, freeformText, layout)
│   ├── useHistory.js     # Undo/redo history management
│   ├── useDarkMode.js    # Dark mode toggle
│   ├── usePWAInstall.js  # PWA install prompt state
│   └── usePWAUpdate.js   # PWA update detection state
├── utils/
│   └── export.js         # Export utilities
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
//   defaultImageSettings, text, textCells, layout, padding, frame, textMode, freeformText
// Shared fields: theme, fonts, platform, logo, logoPosition, logoSize

// Text mode: 'structured' (text groups) or 'freeform' (per-cell text)
textMode: 'structured'

// Freeform text (per-cell content, active when textMode='freeform')
freeformText: {
  0: { content: 'Hello **world**', markdown: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null },
  1: { content: 'Plain text here', markdown: false, color: 'primary', size: 0.8, bold: false, italic: false, letterSpacing: 0, textAlign: null },
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
  imageCells: [0],               // Array of cell indices that contain images (supports multi-image layouts)
  textAlign: 'center',           // Global horizontal alignment fallback
  textVerticalAlign: 'center',   // Global vertical alignment fallback
  cellAlignments: [{ textAlign, textVerticalAlign }, ...]  // Per-cell overrides
  cellOverlays: {}  // Per-cell overlay settings
}

// Frame settings (colored border using percentage of padding)
frame: {
  outer: { percent: 0, color: 'primary' },  // Outer canvas frame
  cellFrames: { 0: { percent: 50, color: 'accent' } }  // Per-cell frames
}

text: {
  title: {
    content: '...',
    visible: true,
    color: 'secondary',
    size: 1,
    textAlign: null,         // Per-element horizontal alignment (null = use cell default)
  },
  // ... same structure for tagline, bodyHeading, bodyText, cta, footnote
}

textCells: {
  title: null,      // null = auto, number = specific cell index
  tagline: null,
  // ...
}

// Alignment fallback chain: element.textAlign → cellAlignments[cell] → layout.textAlign
```

## Tab Details (New Workflow-Based UI)

### Presets Tab (formerly Templates)
Entry point for users. Three sections:
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
Top-level toggle: **Structured** / **Freeform**

**Structured mode** - Text groups organized by purpose, each in a collapsible section:
- **Title & Tagline** - Paired text elements
- **Body** - Heading + body text
- **Call to Action** - CTA button text
- **Footnote** - Fine print
- Each text element has: visibility toggle, text input, cell assignment, alignment, color, size, bold/italic, letter spacing

**Freeform mode** - Per-cell text editors:
- One text block per cell with independent content
- Per-cell controls: alignment, color, size
- MD toggle per cell for markdown formatting (renders via `marked`)

### Structure Tab (formerly Layout)
Collapsible sections:
- **Structure** - Layout type (Full/Rows/Columns), interactive grid for editing section/cell sizes, add/remove sections and subdivisions
- **Text Alignment** - Context-aware alignment controls (section selected = all cells in section, cell selected = that cell, nothing = global)

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
