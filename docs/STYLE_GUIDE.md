# CanvaGrid Style Guide 🎨

A vibrant, creative design system for makers who want their ads to *pop*.

---

## The Vibe

**We're not a fintech app.** We're a creative tool for people who want to make scroll-stopping content. Our design should feel:

- **Energetic** — Colors that inspire, not bore
- **Confident** — Bold choices, not safe defaults
- **Playful** — Delightful details, not sterile interfaces
- **Approachable** — Friendly, not intimidating

> "If your design tool looks boring, your ads will be boring." — Nobody, but it's true

---

## Color System

### DaisyUI Themes

The UI chrome uses **DaisyUI 5** with 16 curated themes (8 light, 8 dark). Users independently select a theme for each mode via the `ThemeSelector` dropdown in the header. Colors adapt automatically via `data-theme` attribute on `<html>`.

**Light themes:** Lo-Fi (default), Nord, Emerald, Cupcake, Garden, Autumn, Pastel, Caramel
**Dark themes:** Black (default), Night, Forest, Dracula, Dim, Synthwave, Luxury, Coffee

Theme catalog is defined in `src/config/daisyuiThemes.js`. Registered in `src/index.css` via `@plugin "daisyui"`.

The 19 content themes in `src/config/themes.js` are for the **design canvas** — they use inline styles and are completely separate from the DaisyUI UI chrome.

### DaisyUI Token Usage

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `base-100` | `bg-base-100` | Page/card backgrounds |
| `base-200` | `bg-base-200` | Elevated surfaces, insets |
| `base-300` | `bg-base-300` | Hover states, borders |
| `base-content` | `text-base-content` | Default text |
| `primary` | `bg-primary` | Primary actions, active states |
| `primary-content` | `text-primary-content` | Text on primary background |
| `secondary` | `bg-secondary` | Secondary accents (layout grid) |
| `neutral` | `bg-neutral` | Neutral info toasts |
| `error` | `bg-error`, `text-error` | Destructive actions, errors |
| `success` | `bg-success`, `text-success` | Success feedback |
| `warning` | `bg-warning`, `text-warning` | Warnings, caution states |

### Opacity Modifiers

Use opacity modifiers on DaisyUI tokens instead of hardcoded colors:

```html
<!-- Muted text -->
<span class="text-base-content/70">Secondary text</span>
<span class="text-base-content/60">Subtle text</span>
<span class="text-base-content/40">Faint text</span>

<!-- Light backgrounds -->
<div class="bg-primary/10">Tinted primary background</div>
<div class="bg-error/10">Light error background</div>
```

### Gradient

```css
/* The Signature Gradient — uses DaisyUI primary/secondary/accent oklch values */
@utility bg-gradient-creative {
  background: linear-gradient(135deg, oklch(var(--p)) 0%, oklch(var(--s)) 50%, oklch(var(--a)) 100%);
}
```

---

## Typography

### Font Stack

**Headlines:** Space Grotesk or Poppins
**Body:** Inter or DM Sans

```css
--font-display: 'Space Grotesk', 'Poppins', system-ui, sans-serif;
--font-body: 'Inter', 'DM Sans', system-ui, sans-serif;
```

*Why these?*
- **Space Grotesk** — Geometric with personality, great for headlines
- **Inter** — Designed for screens, excellent readability
- Both are Google Fonts (free & fast)

### Type Scale

| Style | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Display** | 48px | 700 | 1.1 | -0.02em | Hero headlines |
| **H1** | 36px | 700 | 1.2 | -0.02em | Page titles |
| **H2** | 28px | 600 | 1.3 | -0.01em | Section headers |
| **H3** | 22px | 600 | 1.4 | 0 | Card headers |
| **H4** | 18px | 600 | 1.4 | 0 | Subsections |
| **Body** | 15px | 400 | 1.6 | 0 | Main content |
| **Body SM** | 14px | 400 | 1.5 | 0 | Secondary text |
| **Caption** | 12px | 500 | 1.4 | 0.01em | Labels, hints |
| **Overline** | 11px | 600 | 1.3 | 0.08em | Category labels (UPPERCASE) |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasized body, labels |
| Semibold | 600 | Subheadings, buttons |
| Bold | 700 | Headlines, important actions |

### Tailwind Classes

```html
<!-- Headlines (use display font) -->
<h1 class="text-4xl font-bold tracking-tight text-base-content">Make Ads That Pop</h1>
<h2 class="text-2xl font-semibold text-base-content">Your Templates</h2>

<!-- Body -->
<p class="text-base text-base-content/70">Create stunning social ads...</p>

<!-- Captions & Labels -->
<span class="text-xs font-medium text-base-content/60 uppercase tracking-wide">Platform</span>
```

---

## Spacing

### Base Unit: 4px

We use a 4px base unit for tighter control (vs 8px). This lets us be more precise with small UI elements.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `xs` | 4px | `p-1` | Tiny gaps, icon padding |
| `sm` | 8px | `p-2` | Small gaps, inline spacing |
| `md` | 12px | `p-3` | Default padding |
| `lg` | 16px | `p-4` | Card padding, comfortable gaps |
| `xl` | 24px | `p-6` | Section padding |
| `2xl` | 32px | `p-8` | Large section gaps |
| `3xl` | 48px | `p-12` | Page margins |
| `4xl` | 64px | `p-16` | Hero spacing |

### Common Patterns

```css
/* Card padding */
padding: 20px 24px;  /* p-5 px-6 */

/* Section gaps */
gap: 24px;  /* gap-6 */

/* Inline element spacing */
gap: 8px;  /* gap-2 */

/* Form field spacing */
margin-bottom: 16px;  /* mb-4 */
```

---

## Border Radius

Keep it friendly with generous rounding.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `sm` | 6px | `rounded-md` | Small buttons, badges |
| `md` | 8px | `rounded-lg` | Inputs, standard elements |
| `lg` | 12px | `rounded-xl` | Cards, modals |
| `xl` | 16px | `rounded-2xl` | Large cards, hero elements |
| `full` | 9999px | `rounded-full` | Pills, avatars, toggles |

**Pro tip:** Our cards use `rounded-xl` (12px) — it's the sweet spot between modern and not-too-bubbly.

---

## Shadows

### Light Mode

| Name | Value | Usage |
|------|-------|-------|
| `sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle lift |
| `md` | `0 2px 8px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, popovers |
| `glow` | `0 0 20px rgba(139,92,246,0.3)` | Focused elements, CTAs |

### Dark Mode

In dark mode (DaisyUI `night` theme), we rely more on:
- Border highlights (`border-base-300`)
- Subtle background differences (`bg-base-200`, `bg-base-300`)
- Glow effects for emphasis (`shadow-glow`)

DaisyUI handles light/dark automatically via `data-theme` — no need for manual `dark:` class pairs.

---

## Components

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | `bg-primary` | `text-primary-content` | None | Main actions |
| **Secondary** | Transparent | `text-base-content` | `border-base-300` | Secondary actions |
| **Ghost** | Transparent | `text-base-content/70` | None | Tertiary actions |
| **Danger** | `bg-error` | `text-error-content` | None | Destructive actions |

**Sizes:**

| Size | Height | Padding | Font Size | Radius |
|------|--------|---------|-----------|--------|
| `sm` | 32px | 0 12px | 13px | 6px |
| `md` | 40px | 0 16px | 14px | 8px |
| `lg` | 48px | 0 24px | 15px | 8px |

**Hover States:**
- Primary: Darken + subtle scale (1.02)
- Secondary: Light background fill
- Ghost: Background appears

```html
<!-- Primary Button -->
<button class="h-10 px-4 bg-primary hover:bg-primary/80 text-primary-content font-medium rounded-lg
               transition-all hover:scale-[1.02] active:scale-[0.98]">
  Create Ad
</button>

<!-- Secondary Button -->
<button class="h-10 px-4 border border-base-300 hover:bg-base-200 rounded-lg transition-colors">
  Cancel
</button>
```

### Inputs

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 0 12px |
| Border | 1px solid `border-base-300` |
| Border Radius | 8px |
| Focus Ring | 2px `primary` with 2px offset |

```html
<input
  class="h-10 w-full px-3 border border-base-300 rounded-lg
         bg-base-100
         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
         placeholder:text-base-content/50"
  placeholder="Enter your headline..."
/>
```

### Cards

```html
<div class="bg-base-100 rounded-xl border border-base-300 p-5 shadow-sm hover:shadow-md transition-shadow">
  <!-- Content -->
</div>
```

### Tabs

Active tab should feel *selected*, not just different.

```html
<!-- Tab container -->
<div class="flex gap-1 p-1 bg-base-200 rounded-lg">
  <!-- Active tab -->
  <button class="px-4 py-2 bg-base-100 rounded-md font-medium shadow-sm">
    Templates
  </button>
  <!-- Inactive tab -->
  <button class="px-4 py-2 text-base-content/60 hover:text-base-content">
    Media
  </button>
</div>
```

---

## Motion & Delight

### Transitions

**Default timing:** `150ms ease` for micro-interactions
**Emphasis timing:** `200ms ease-out` for larger movements

```css
/* Standard transition */
transition: all 150ms ease;

/* Color/opacity only (smoother) */
transition: color 150ms ease, background-color 150ms ease, opacity 150ms ease;

/* Transform (playful) */
transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Hover Effects

| Element | Effect |
|---------|--------|
| Buttons | Slight scale (1.02) + color shift |
| Cards | Lift shadow + slight translate Y (-2px) |
| Icons | Color change + subtle rotate or scale |
| Images | Subtle zoom (1.05) with overflow hidden |

### Micro-animations to Consider

- **Export button:** Pulse or shimmer when export is ready
- **Template cards:** Gentle hover lift
- **Success states:** Quick checkmark animation
- **Loading:** Gradient shimmer, not boring spinner
- **Tab switch:** Smooth background slide

---

## Iconography

**Primary:** Lucide React
**Style:** Rounded, friendly, consistent 1.5px stroke

| Size | Dimensions | Usage |
|------|------------|-------|
| `xs` | 14px | Inline with small text |
| `sm` | 16px | Buttons, inline actions |
| `md` | 20px | Standard UI icons |
| `lg` | 24px | Section headers, emphasis |
| `xl` | 32px | Empty states, features |

```jsx
// Standard usage — always use DaisyUI semantic tokens
<svg className="w-5 h-5 text-primary" />

// In button
<button className="flex items-center gap-2">
  <svg className="w-4 h-4" />
  Export
</button>
```

---

## Dark Mode

DaisyUI handles light/dark automatically via `data-theme`. Users pick independent themes per mode.

### Key Principles

1. **DaisyUI themes handle colors** — no manual dark: class pairs needed
2. **Dual-layer theming** — `.dark` class for Tailwind utilities + `data-theme` for DaisyUI
3. **16 curated themes** — 8 light + 8 dark, independently selectable

### Background Hierarchy

All backgrounds use DaisyUI tokens that adapt per theme:

| Level | Token | Usage |
|-------|-------|-------|
| Page | `bg-base-100` | Page and card backgrounds |
| Elevated | `bg-base-200` | Inset areas, elevated surfaces |
| Hover | `bg-base-300` | Hover states, stronger borders |

---

## Accessibility

Even fun design needs to be usable.

### Contrast Ratios

| Text Type | Minimum | Target |
|-----------|---------|--------|
| Body text | 4.5:1 | 7:1 |
| Large text (18px+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |

### Focus States

All interactive elements must have visible focus states.

```html
<!-- Focus ring uses DaisyUI primary token -->
<button class="outline-none focus-visible:ring-2 focus-visible:ring-primary">
```

### Motion Sensitivity

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Quick Reference

### Common Class Combos

```html
<!-- Primary action button -->
<button class="h-10 px-4 bg-primary hover:bg-primary/80 text-primary-content font-medium rounded-lg
               shadow-sm hover:shadow transition-all hover:scale-[1.02]">

<!-- Card container -->
<div class="bg-base-100 rounded-xl border border-base-300 p-5 shadow-sm">

<!-- Section header -->
<h2 class="text-xl font-semibold text-base-content">

<!-- Secondary text -->
<p class="text-sm text-base-content/60">

<!-- Input field -->
<input class="h-10 w-full px-3 border border-base-300 rounded-lg
              focus:ring-2 focus:ring-primary focus:ring-offset-2">

<!-- Badge/pill -->
<span class="px-2 py-0.5 text-xs font-medium bg-primary/15 text-primary rounded-full">
```

### DaisyUI Semantic Tokens at a Glance

```
Primary actions:    bg-primary / text-primary-content
Secondary accents:  bg-secondary / text-secondary-content
Accent highlights:  bg-accent / text-accent-content
Success:            bg-success / text-success
Warning:            bg-warning / text-warning
Error:              bg-error / text-error

Backgrounds:        bg-base-100 → bg-base-200 → bg-base-300
Text:               text-base-content (full) → /70 → /60 → /40
Borders:            border-base-300

Actual hex values vary per selected DaisyUI theme.
```

---

## Philosophy

1. **Color is energy** — Don't be afraid of it
2. **Whitespace is breathing room** — Let elements breathe
3. **Consistency builds trust** — Same patterns everywhere
4. **Delight is in the details** — The small animations matter
5. **Fun ≠ unprofessional** — Vibrant can still be polished

---

*Last updated: January 2026*
