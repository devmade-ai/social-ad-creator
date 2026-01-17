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
- Theme system with 12 color themes and custom colors
- Overlay system (solid, 8 gradient directions, vignette, spotlight) with per-cell controls
- 15 Google Fonts (sans-serif, serif, display categories)
- Export to 6 platforms (LinkedIn, Facebook, Instagram, Twitter/X, TikTok)
- Single download and ZIP batch download
- Responsive preview that adapts to device width

## Current Tab Structure

**Top-level tabs:** Templates, Media, Content, Layout, Style

This is a workflow-based organization (as of January 2026 refactor):
- **Templates** - Start here: Complete designs (style presets) + Layout-only presets
- **Media** - Upload background image and logo, adjust fit/position/filters
- **Content** - Write text, set visibility, cell assignment, alignment, color, size
- **Layout** - Fine-tune grid structure and cell alignment
- **Style** - Themes, typography, per-cell overlay, spacing

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
│   ├── CollapsibleSection.jsx # Reusable collapsible section for tab content
│   ├── TemplatesTab.jsx       # Complete designs + layout-only presets
│   ├── MediaTab.jsx           # Image + logo upload, fit, position, filters
│   ├── ContentTab.jsx         # Text editing with cell assignment
│   ├── LayoutTab.jsx          # Grid structure + cell alignment
│   ├── StyleTab.jsx           # Themes, fonts, overlay, spacing
│   ├── PlatformPreview.jsx    # Platform selector
│   ├── ExportButtons.jsx      # Export controls
│   └── ErrorBoundary.jsx      # Error handling wrapper
├── config/         # Configuration
│   ├── layouts.js        # Overlay types and helpers
│   ├── layoutPresets.js  # 20 layouts with SVG icons and categories
│   ├── stylePresets.js   # Complete design presets (theme + fonts + layout + effects)
│   ├── platforms.js      # 6 platform sizes
│   ├── themes.js         # 12 color themes
│   └── fonts.js          # 15 Google Fonts
├── hooks/
│   ├── useAdState.js     # Central state (includes textGroups, layout)
│   ├── useHistory.js     # Undo/redo history management
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

## Tab Details (New Workflow-Based UI)

### Templates Tab
Entry point for users. Two sections:
- **Complete Designs** - Style presets that apply theme, fonts, layout, overlay, filters all at once
- **Layout Only** - Layout presets that only change grid structure (keeps current colors/fonts)

### Media Tab
Collapsible sections:
- **Background Image** - Upload, fit, position, grayscale toggle, sample images
- **Advanced Filters** - Grayscale slider, sepia, blur, contrast, brightness
- **Logo** - Upload, position (corners/center), size

### Content Tab
Text editing organized by groups, each in a collapsible section:
- **Title & Tagline** - Paired text elements
- **Body** - Heading + body text
- **Call to Action** - CTA button text
- **Footnote** - Fine print

Each text element has: visibility toggle, text input, cell assignment, alignment, color, size, bold/italic, letter spacing

### Layout Tab
Collapsible sections:
- **Structure** - Layout type (Full/Rows/Columns), interactive grid for editing section/cell sizes
- **Cell Assignment** - Image cell selector, per-cell alignment controls

### Style Tab
Collapsible sections:
- **Themes** - 12 preset themes + custom color inputs
- **Typography** - Title font + body font selectors with preview
- **Overlay** - Per-cell overlay controls (type, color, opacity)
- **Spacing** - Global padding + per-cell custom padding

## Preset Types

| Name | Location | What It Applies | Config File |
|------|----------|-----------------|-------------|
| **Complete Designs** | Templates → Complete Designs | Everything (theme, fonts, layout, overlay, filters) | `stylePresets.js` |
| **Layouts** | Templates → Layout Only | Grid structure + text cell placements only | `layoutPresets.js` |
| **Themes** | Style → Themes | Color scheme only | `themes.js` |
