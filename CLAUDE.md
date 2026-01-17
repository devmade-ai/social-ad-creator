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

**These documents are maintained every session.** Keep them up to date as you work.

### `CLAUDE.md`

**Purpose:** AI preferences, project overview, architecture, key state structures.
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
**When to update:** Rewrite at session end with a fresh summary. Clear previous content.
**What to include:**

- **Worked on:** Brief description of focus area
- **Accomplished:** Bullet list of completions
- **Current state:** Where things stand (working/broken/in-progress)
- **Key context:** Important info the next session needs to know

**Why:** Enables quick resumption without re-reading entire codebase. Not a changelog - a snapshot.

### `docs/TODO.md`

**Purpose:** AI-managed backlog of ideas and potential improvements.
**When to update:** When noticing potential improvements. Move completed items to HISTORY.md.
**What to include:**

- Group by category (Features, UX, Technical, etc.)
- Use `- [ ]` for pending items only
- Brief description of what and why
- When complete, move to HISTORY.md (don't keep in TODO)

**Why:** User reviews this to prioritize work. Keeps TODO focused on pending items only.

### `docs/HISTORY.md`

**Purpose:** Changelog and record of completed work.
**When to update:** When completing TODO items or making significant changes.
**What to include:**

- Completed TODO items (organized by category)
- Bug fixes and changes (organized by date)
- Brief description of what was done

**Why:** Historical context separate from active TODO. Tracks what's been accomplished.

### `docs/USER_ACTIONS.md`

**Purpose:** Manual actions requiring user intervention outside the codebase.
**When to update:** When tasks need external action. Clear when completed.
**What to include:**

- Action title and description
- Why it's needed
- Steps to complete
- Keep empty when nothing pending (with placeholder text)

**Why:** Some tasks require credentials, dashboards, or manual config the AI can't do.

### `docs/AI_MISTAKES.md`

**Purpose:** Record significant AI mistakes and learnings to prevent repetition.
**When to update:** After making a mistake that wasted time or broke things.
**What to include:**

- What went wrong
- Why it happened
- How to prevent it
- Date (for context)

**Why:** AI assistants repeat mistakes across sessions. This document builds institutional memory.

### `README.md`

**Purpose:** User-facing guide for the application.
**When to update:** When features change that affect how users interact with the tool.
**What to include:**

- What the tool does (overview)
- Current features (keep in sync with actual functionality)
- How to use each feature (user guide)
- Getting started / installation
- Tech stack and deployment info

**Why:** Users and contributors read this first. Must accurately reflect the current state.

### REMINDER: READ AND FOLLOW THE FUCKING DOCUMENTATION EVERY TIME

## AI Notes

<!-- Reminders and learnings for AI assistants - add to this as needed -->

- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Clean up completed or obsolete docs/files and remove references to them

### REMINDER: READ AND FOLLOW THE FUCKING AI NOTES EVERY TIME

---

## Project Info

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Social Ad Creator - A browser-based tool for creating social media advertisements. Users can upload images, add text overlays, choose layouts, and export ads for multiple platforms.

## Project Status

Core features working:

- Image upload with drag-drop, object fit (cover/contain), position, grayscale
- Logo upload with position (corners, center) and size options
- Flexible layout system with sub-tab organization (see Layout Tab Sub-tabs below)
- Text groups with cell assignment:
  - Title + Tagline (paired)
  - Body Heading + Body Text (paired)
  - CTA (independent)
  - Footnote (independent)
- Theme system with 4 color themes and custom colors
- Quick Styles bar for one-click style combinations (above preview)
- Overlay system (solid, 8 gradient directions, vignette, spotlight) with per-cell controls
- 15 Google Fonts (sans-serif, serif, display categories)
- Export to 6 platforms (LinkedIn, Facebook, Instagram, Twitter/X, TikTok)
- Single download and ZIP batch download
- Responsive preview that adapts to device width

## Current Tab Structure

**Top-level tabs:** Image, Layout, Text, Theme, Fonts

## Tech Stack

- Vite + React 18
- Tailwind CSS
- html-to-image for rendering
- JSZip + file-saver for batch export
- GitHub Pages deployment

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run deploy   # Deploy to GitHub Pages
```

## Architecture

```
src/
├── components/     # React components
│   ├── AdCanvas.jsx           # Core rendering (cell-based layout)
│   ├── ImageUploader.jsx      # Image + logo upload, fit, position, grayscale
│   ├── LogoUploader.jsx       # Logo upload and positioning (used by ImageUploader)
│   ├── TextEditor.jsx         # Text layer editing
│   ├── LayoutSelector.jsx     # Layout with sub-tabs (Structure, Placement, Overlay, Spacing, Layouts)
│   ├── ThemePicker.jsx        # Color themes and custom colors
│   ├── FontSelector.jsx       # Font selection
│   ├── StylePresetSelector.jsx # Quick Styles bar (top-level, above preview)
│   ├── PlatformPreview.jsx    # Platform selector
│   ├── ExportButtons.jsx      # Export controls
│   └── ErrorBoundary.jsx      # Error handling wrapper
├── config/         # Configuration
│   ├── layouts.js        # Overlay types and helpers
│   ├── layoutPresets.js  # 20 layouts with SVG icons and categories
│   ├── platforms.js      # 6 platform sizes
│   ├── themes.js         # 4 color themes
│   └── fonts.js          # 15 Google Fonts
├── hooks/
│   ├── useAdState.js     # Central state (includes textGroups, layout)
│   └── useDarkMode.js    # Dark mode toggle
├── utils/
│   └── export.js         # Export utilities
├── App.jsx
└── main.jsx
```

## Key State Structure

```js
layout: {
  type: 'fullbleed' | 'rows' | 'columns',
  structure: [
    { size: 50, subdivisions: 1, subSizes: [100] },  // Section with optional subdivisions
    { size: 50, subdivisions: 2, subSizes: [50, 50] }
  ],
  imageCell: 0,  // Which cell the image appears in
  textAlign: 'center',           // Global horizontal alignment fallback
  textVerticalAlign: 'center',   // Global vertical alignment fallback
  cellAlignments: [{ textAlign, textVerticalAlign }, ...]  // Per-cell overrides
}

text: {
  title: {
    content: '...',
    visible: true,
    color: 'secondary',
    size: 1,
    textAlign: null,         // Per-element horizontal alignment (null = use cell default)
    textVerticalAlign: null  // Reserved for future use
  },
  // ... same structure for tagline, bodyHeading, bodyText, cta, footnote
}

textCells: {
  title: null,      // null = auto, number = specific cell index
  tagline: null,
  bodyHeading: null,
  bodyText: null,
  cta: null,
  footnote: null
}

// Alignment fallback chain: element.textAlign → cellAlignments[cell] → layout.textAlign
```

## Layout Tab Sub-tabs

The Layout tab uses a sub-tab architecture for better organization:

1. **Structure** - Fine-tune the layout grid
   - Layout type selector (Full/Rows/Columns)
   - Click section labels (R1, R2 or C1, C2) to edit row/column size
   - Click cells to edit subdivision sizes
   - Contextual controls based on selection

2. **Placement** - Text element controls with per-element alignment
   - Cell selector for per-cell vertical alignment (select cell or set global)
   - Horizontal and vertical alignment per cell (as fallback)
   - Image cell assignment
   - Text element controls: visibility toggle, cell assignment, horizontal alignment, color picker
   - Per-element horizontal alignment allows different alignments in same cell
   - Individual text elements: Title, Tagline, Body Heading, Body Text, CTA, Footnote

3. **Overlay** - Per-cell overlay controls
   - Click cell to select
   - Enable/disable overlay per cell
   - Custom overlay type and intensity per cell

4. **Spacing** - Global and per-cell padding
   - Global padding for all cells
   - Click cell for custom padding overrides

5. **Layouts** - Quick start with 20 pre-built layout templates
   - Categories: All, Suggested, Image Focus, Text Focus, Balanced, Grid
   - Smart suggestions based on image aspect ratio and platform
   - Visual SVG preview icons
   - Applies both layout structure AND text cell placements

## Preset Types (Naming Clarification)

The app has three types of "presets" - use these distinct names to avoid confusion:

| Name | Location | What It Applies | Config File |
|------|----------|-----------------|-------------|
| **Layouts** | Layout tab → Layouts sub-tab | Grid structure + text cell placements | `layoutPresets.js` |
| **Quick Styles** | Top bar above preview | Theme + font combination | `StylePresetSelector.jsx` |
| **Themes** | Theme tab | Color scheme only | `themes.js` |
