# Grumpy Cam Canvas 🫩 Style Guide 🎨

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

### Primary Palette

| Name | Hex | Usage | Vibe |
|------|-----|-------|------|
| **Electric Violet** | `#8B5CF6` | Primary actions, focus states | Creative energy |
| **Hot Pink** | `#EC4899` | Accent, highlights, CTAs | Attention-grabbing |
| **Cyber Cyan** | `#06B6D4` | Secondary actions, links | Fresh and modern |

### Background Colors

| Mode | Primary | Secondary | Subtle |
|------|---------|-----------|--------|
| **Light** | `#FAFAFA` | `#FFFFFF` | `#F4F4F5` |
| **Dark** | `#0F0F23` | `#1A1A2E` | `#16213E` |

*Note: Our dark mode uses deep indigo tones instead of pure black — feels more creative, less oppressive.*

### Semantic Colors

| Name | Hex | Light BG | Dark BG | Usage |
|------|-----|----------|---------|-------|
| **Success** | `#10B981` | `#ECFDF5` | `rgba(16,185,129,0.15)` | Saved, exported, done! |
| **Warning** | `#F59E0B` | `#FFFBEB` | `rgba(245,158,11,0.15)` | Heads up! |
| **Error** | `#EF4444` | `#FEF2F2` | `rgba(239,68,68,0.15)` | Oops, fix this |
| **Info** | `#3B82F6` | `#EFF6FF` | `rgba(59,130,246,0.15)` | FYI |

### Gradient Magic ✨

Gradients are our secret weapon. Use them for:
- Hero sections
- Primary buttons (on hover)
- Empty state illustrations
- Accent borders

```css
/* The Signature Gradient */
--gradient-creative: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%);

/* Subtle button hover */
--gradient-button: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);

/* Background accent */
--gradient-glow: radial-gradient(ellipse at top, rgba(139,92,246,0.15) 0%, transparent 50%);
```

### Color Tokens (CSS Variables)

```css
:root {
  /* Core */
  --color-primary: #8B5CF6;
  --color-secondary: #EC4899;
  --color-accent: #06B6D4;

  /* Text */
  --text-primary: #18181B;
  --text-secondary: #71717A;
  --text-muted: #A1A1AA;
  --text-inverse: #FAFAFA;

  /* Backgrounds */
  --bg-page: #FAFAFA;
  --bg-card: #FFFFFF;
  --bg-subtle: #F4F4F5;
  --bg-elevated: #FFFFFF;

  /* Borders */
  --border-default: #E4E4E7;
  --border-subtle: #F4F4F5;
  --border-focus: #8B5CF6;

  /* Interactive */
  --interactive-primary: #8B5CF6;
  --interactive-hover: #7C3AED;
  --interactive-active: #6D28D9;
}

.dark {
  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --text-inverse: #18181B;

  --bg-page: #0F0F23;
  --bg-card: #1A1A2E;
  --bg-subtle: #16213E;
  --bg-elevated: #1E1E3F;

  --border-default: #2D2D4A;
  --border-subtle: #252542;
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
<h1 class="text-4xl font-bold tracking-tight">Make Ads That Pop</h1>
<h2 class="text-2xl font-semibold">Your Templates</h2>

<!-- Body -->
<p class="text-base text-zinc-600 dark:text-zinc-400">Create stunning social ads...</p>

<!-- Captions & Labels -->
<span class="text-xs font-medium text-zinc-500 uppercase tracking-wide">Platform</span>
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

In dark mode, we rely more on:
- Border highlights (`border-zinc-700`)
- Subtle background gradients
- Glow effects for emphasis

```css
/* Dark mode card */
.card-dark {
  background: linear-gradient(180deg, #1A1A2E 0%, #16213E 100%);
  border: 1px solid rgba(255,255,255,0.06);
}
```

---

## Components

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | `--color-primary` | White | None | Main actions |
| **Secondary** | Transparent | `--text-primary` | `--border-default` | Secondary actions |
| **Ghost** | Transparent | `--text-secondary` | None | Tertiary actions |
| **Danger** | `#EF4444` | White | None | Destructive actions |

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
<button class="h-10 px-4 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg
               transition-all hover:scale-[1.02] active:scale-[0.98]">
  Create Ad
</button>

<!-- Secondary Button -->
<button class="h-10 px-4 border border-zinc-200 dark:border-zinc-700
               hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
  Cancel
</button>
```

### Inputs

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 0 12px |
| Border | 1px solid `--border-default` |
| Border Radius | 8px |
| Focus Ring | 2px `--color-primary` with 2px offset |

```html
<input
  class="h-10 w-full px-3 border border-zinc-200 dark:border-zinc-700 rounded-lg
         bg-white dark:bg-zinc-800
         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
         placeholder:text-zinc-400"
  placeholder="Enter your headline..."
/>
```

### Cards

```html
<div class="bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50
            p-5 shadow-sm hover:shadow-md transition-shadow">
  <!-- Content -->
</div>
```

### Tabs

Active tab should feel *selected*, not just different.

```html
<!-- Tab container -->
<div class="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
  <!-- Active tab -->
  <button class="px-4 py-2 bg-white dark:bg-zinc-700 rounded-md font-medium shadow-sm">
    Templates
  </button>
  <!-- Inactive tab -->
  <button class="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
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
import { Sparkles, Download, Image, Type } from 'lucide-react';

// Standard usage
<Sparkles className="w-5 h-5 text-violet-500" />

// In button
<button className="flex items-center gap-2">
  <Download className="w-4 h-4" />
  Export
</button>
```

---

## Dark Mode

Our dark mode isn't just "invert the colors" — it's crafted.

### Key Principles

1. **Deep indigo backgrounds** (not pure black) — feels creative
2. **Reduced contrast for comfort** — `#FAFAFA` text, not `#FFFFFF`
3. **Glows over shadows** — light draws the eye in dark mode
4. **Slightly desaturated colors** — prevents eye strain

### Background Hierarchy

| Level | Light | Dark |
|-------|-------|------|
| Page | `#FAFAFA` | `#0F0F23` |
| Card | `#FFFFFF` | `#1A1A2E` |
| Elevated | `#FFFFFF` + shadow | `#1E1E3F` + glow |
| Sunken | `#F4F4F5` | `#0A0A1A` |

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

```css
/* Our focus ring */
:focus-visible {
  outline: none;
  ring: 2px solid var(--color-primary);
  ring-offset: 2px;
}
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
<button class="h-10 px-4 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg
               shadow-sm hover:shadow transition-all hover:scale-[1.02]">

<!-- Card container -->
<div class="bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50
            p-5 shadow-sm">

<!-- Section header -->
<h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">

<!-- Secondary text -->
<p class="text-sm text-zinc-500 dark:text-zinc-400">

<!-- Input field -->
<input class="h-10 w-full px-3 border border-zinc-200 dark:border-zinc-700 rounded-lg
              focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">

<!-- Badge/pill -->
<span class="px-2 py-0.5 text-xs font-medium bg-violet-100 dark:bg-violet-900/30
             text-violet-700 dark:text-violet-300 rounded-full">
```

### The Grumpy Cam Canvas 🫩 Palette at a Glance

```
Primary Actions:    #8B5CF6 (Electric Violet)
Accents & CTAs:     #EC4899 (Hot Pink)
Secondary:          #06B6D4 (Cyber Cyan)
Success:            #10B981 (Emerald)
Warning:            #F59E0B (Amber)
Error:              #EF4444 (Red)

Light backgrounds:  #FAFAFA → #FFFFFF → #F4F4F5
Dark backgrounds:   #0F0F23 → #1A1A2E → #16213E
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
