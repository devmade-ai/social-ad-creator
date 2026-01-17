# UI Refactor Plan: Workflow-Based Tab Structure

## Overview

Reorganize the UI from feature-based tabs to workflow-based tabs, with Templates as the entry point and collapsible sections instead of nested sub-tabs.

**Goal:** Match the user's mental model of creating an ad: Pick a design → Upload assets → Write content → Adjust style → Export

---

## Current State

**Top-level tabs:** Image, Layout, Text, Theme, Fonts

**Layout sub-tabs (5):** Structure, Placement, Overlay, Spacing, Layouts

**Quick Styles:** Floating above preview, applies theme + font + layout + overlay + filters

**Problems:**
- Layout tab is overloaded (5 sub-tabs)
- Quick Styles sounds like "style" but changes layout too
- Overlay/Spacing are in Layout but are visual polish, not structure
- Theme and Fonts are separate tabs but both are styling
- Text placement is in Layout → Placement, not with text content

---

## Proposed State

### Tab Structure

```
Templates → Media → Content → Layout → Style
```

| Tab | Purpose | User Thinks |
|-----|---------|-------------|
| **Templates** | Pick a complete starting design | "What should my ad look like?" |
| **Media** | Upload image and logo | "Let me add my visuals" |
| **Content** | Write and place text | "What do I want to say?" |
| **Layout** | Fine-tune grid structure (advanced) | "I want to customize the arrangement" |
| **Style** | Adjust colors, fonts, effects | "Let me tweak how it looks" |

---

### Tab Details

#### 1. Templates — *"Pick a starting design"*

First tab, the entry point for most users.

```
[Grid of template previews with visual thumbnails]

Categories: All | Suggested | Minimal | Bold | Corporate | Creative

Each template applies:
├── Layout structure (rows/columns/cells)
├── Text cell placements
├── Overlay settings
├── Filter settings (e.g., grayscale)
└── Neutral base theme (swappable via Style → Themes)
```

**Key behavior:** Templates use a neutral/generic color theme. Users can swap colors later via Style → Themes without losing the template's layout/overlay/filter settings.

**Merges:** Current "Quick Styles" + current "Layouts" sub-tab

---

#### 2. Media — *"Upload your assets"*

```
▼ Background Image
  - Upload area (drag-drop or click)
  - Fit: Cover / Contain
  - Position: X/Y adjustment
  - Grayscale toggle

▼ Logo
  - Upload area
  - Position: 9 options (corners, edges, center)
  - Size: Small / Medium / Large
```

**Same as current Image tab**, just renamed for clarity.

---

#### 3. Content — *"Write your message"*

All text-related controls in one place.

```
▼ Title & Tagline
  Title:   [________________] [👁] [Cell ▾] [Align ▾] [Color ▾]
  Tagline: [________________] [👁] [Cell ▾] [Align ▾] [Color ▾]

▼ Body
  Heading: [________________] [👁] [Cell ▾] [Align ▾] [Color ▾]
  Body:    [________________] [👁] [Cell ▾] [Align ▾] [Color ▾]

▼ Call to Action
  CTA:     [________________] [👁] [Cell ▾] [Align ▾] [Color ▾]

▼ Footnote
  Footnote:[________________] [👁] [Cell ▾] [Align ▾] [Color ▾]
```

Controls per text element:
- Text input field
- Visibility toggle (👁)
- Cell assignment dropdown
- Horizontal alignment
- Color picker (theme colors + neutrals)

**Moves IN:** Text visibility, cell assignment, alignment, color (from Layout → Placement)

**Rationale:** "Where does my text go?" is a content decision — users think about it while writing, not while designing grid structure.

---

#### 4. Layout — *"Fine-tune structure"* (advanced)

For power users who want to customize beyond templates.

```
▼ Structure
  - Type: Full / Rows / Columns
  - Section sizes (click to edit)
  - Subdivision controls

▼ Cell Assignment
  - Image cell selector
  - Interactive grid preview
```

**Simplified from 5 sub-tabs to 2 sections.**

**Moves OUT:**
- Overlay → Style tab
- Spacing → Style tab
- Layouts (presets) → Templates tab

---

#### 5. Style — *"Customize appearance"*

All visual polish controls together.

```
▼ Themes
  [4 theme preset swatches]
  Custom: Primary / Secondary / Accent color pickers

  Note: Changing theme only changes colors, preserves template's
  layout/overlay/filter settings

▼ Typography
  Font family selector (15 fonts)
  Categories: Sans-serif | Serif | Display

▼ Overlay
  - Enable toggle
  - Type: Solid, Gradient (8 directions), Vignette, Spotlight
  - Intensity slider
  - Per-cell mode (click cell to customize)

  Note: Can override template's overlay settings

▼ Spacing
  - Global padding slider
  - Per-cell overrides (click cell to customize)
```

**Merges:** Current Theme tab + Fonts tab + Layout → Overlay + Layout → Spacing

---

## Naming Conventions

| Term | What It Means | Applies |
|------|---------------|---------|
| **Template** | Complete starting design | Layout + overlay + filters + text placement + neutral theme |
| **Theme** | Color scheme only | Primary, secondary, accent, background colors |
| **Layout** | Grid structure | Rows, columns, cells, subdivisions |
| **Structure** | Same as Layout | Used in Layout tab for the controls |

---

## User Workflows

### Quick Path (80% of users)

1. **Templates** → Pick a design that looks good
2. **Media** → Upload background image (maybe logo)
3. **Content** → Write headline, tagline, CTA
4. **Style → Themes** → Pick different colors if desired
5. **Export** → Download

### Custom Path (power users)

1. **Templates** → Pick a starting point (or skip)
2. **Media** → Upload and adjust image
3. **Content** → Write text, adjust cell placements
4. **Layout** → Customize grid structure
5. **Style** → Fine-tune colors, fonts, overlay, spacing
6. **Export** → Download

---

## Migration: Current → Proposed

| Current Location | Proposed Location |
|------------------|-------------------|
| Image tab | Media tab |
| Layout → Layouts sub-tab | Templates tab |
| Layout → Structure sub-tab | Layout → Structure section |
| Layout → Placement sub-tab (cell assignment) | Layout → Cell Assignment section |
| Layout → Placement sub-tab (text controls) | Content tab |
| Layout → Overlay sub-tab | Style → Overlay section |
| Layout → Spacing sub-tab | Style → Spacing section |
| Text tab | Content tab |
| Theme tab | Style → Themes section |
| Fonts tab | Style → Typography section |
| Quick Styles (floating) | Templates tab (merged with layouts) |

---

## Component Changes Needed

| Current Component | Change |
|-------------------|--------|
| `StylePresetSelector.jsx` | Merge into new `TemplatesTab.jsx` |
| `LayoutSelector.jsx` | Simplify to Structure + Cell Assignment only |
| `ImageUploader.jsx` | Rename to `MediaTab.jsx` (mostly same) |
| `TextEditor.jsx` | Expand to `ContentTab.jsx` (add placement controls) |
| `ThemePicker.jsx` | Merge into new `StyleTab.jsx` |
| `FontSelector.jsx` | Merge into new `StyleTab.jsx` |
| New: `CollapsibleSection.jsx` | Reusable component for all tabs |

---

## Template Behavior Change

**Current Quick Styles:** Apply specific theme + font + layout + overlay

**Proposed Templates:** Apply layout + overlay + filters + text placement + **neutral base theme**

**Why neutral theme?**
- User picks Template for the design/structure
- User picks Theme for the colors
- These become independent choices
- Changing theme doesn't lose template's design work

**Neutral theme options:**
- Light: White/off-white background, dark text
- Dark: Dark background, light text
- Or: Template includes both light/dark variant

---

## Open Questions

1. **Should Templates show with current image or placeholder?**
   - With current image: More accurate preview
   - With placeholder: Faster, no dependency

2. **Per-cell alignment: Keep or remove?**
   - Current: Cell has default alignment, elements can override
   - Option: Just per-element alignment, remove cell-level fallback (simpler)

3. **Template categories - what groupings?**
   - Current Layouts: Image Focus, Text Focus, Balanced, Grid
   - Could add: Minimal, Bold, Corporate, Creative, etc.

4. **Export tab or keep in main area?**
   - Current: Platform selector + export buttons in main preview area
   - Could be 6th tab, but probably fine as-is

---

## Implementation Order

1. Create `CollapsibleSection.jsx` component
2. Create `StyleTab.jsx` (merge Theme + Fonts + Overlay + Spacing)
3. Create `ContentTab.jsx` (merge Text + placement controls)
4. Simplify `LayoutSelector.jsx` (remove Overlay, Spacing, Presets)
5. Create `TemplatesTab.jsx` (merge Quick Styles + Layouts)
6. Rename `ImageUploader.jsx` → `MediaTab.jsx`
7. Update `App.jsx` with new tab structure
8. Update state management if needed
9. Test all workflows
10. Update documentation

---

## Session Notes

**Date:** 2026-01-17

**Discussed:**
- Current Layout tab has too many sub-tabs (5)
- Workflow-based organization matches user mental model
- Templates should be entry point (renamed from Quick Styles)
- Templates should use neutral theme so colors are swappable
- Collapsible sections better than nested sub-tabs

**Decision:** Proceed with this refactor plan in future session.
