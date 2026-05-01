# CanvaGrid Style Guide

A vibrant, creative design system for makers who want their work to *pop*. The styling system is **DaisyUI 5** — there are no escape hatches. This guide covers the brand voice, type scale, and accessibility requirements that complement DaisyUI's primitives. Anything not covered here defers to DaisyUI defaults.

---

## The Vibe

**We're not a fintech app.** We're a creative tool for people who want to make scroll-stopping content. Our design should feel:

- **Energetic** — Colors that inspire, not bore
- **Confident** — Bold choices, not safe defaults
- **Playful** — Delightful details, not sterile interfaces
- **Approachable** — Friendly, not intimidating

> "If your design tool looks boring, your work will be boring."

---

## DaisyUI Discipline

Every UI surface in this app uses DaisyUI components and semantic tokens. The rules:

- **Components.** Buttons → `btn` + variant. Form controls → `input input-bordered` / `select select-bordered` / `textarea textarea-bordered` / `checkbox` / `radio` / `range` / `file-input`. Panels → `card` + `card-body`. Status → `badge` / `alert` / `toast`. Overlays → `modal` / `drawer` / `dropdown`. Tabs → `tabs` + `tab`. Tooltips → `tooltip`.
- **Colors.** DaisyUI semantic tokens only — see the table below. No raw `bg-gray-*`, `text-blue-*`, `bg-white`, etc. No `dark:` color pairs — DaisyUI's `data-theme` switches both layers automatically.
- **Borders.** `border-base-300` or `border-base-content/20`. No `border-gray-*` / `border-zinc-*` / `border-slate-*`.
- **Radii.** `rounded-box` / `rounded-field` / `rounded-selector` — never arbitrary `rounded-[Xpx]`, never inline `style={{ borderRadius }}`.
- **Shadows.** DaisyUI shadows only. No arbitrary `shadow-[...]` values.
- **Inline hex.** None. No `style={{ color: '#...' }}` or `style={{ background: '#...' }}`.
- **Tinted backgrounds.** No static `bg-primary/10`, `bg-error/15`, etc. on buttons, toggles, or active-state indicators — they vanish on dark themes. Use `bg-base-200`/`bg-base-300` for backgrounds and colored text (`text-primary`, `text-error`) for semantic meaning. Hover-only low-opacity (`hover:bg-primary/10` on large drop zones, `hover:bg-primary/80` to darken a full-opacity primary button) is the only acceptable use.

If DaisyUI seems insufficient for something: stop and ask. Don't roll custom. Don't write a "we rolled custom because…" comment. See CLAUDE.md "DaisyUI is the styling system" for the full rule and rationale.

---

## Color System

The UI uses 2 theme combos — **Mono** (lofi/black) and **Luxe** (fantasy/luxury). Users pick a combo; the dark/light toggle switches between the paired themes. Combos are defined in `src/config/daisyuiThemes.js`. Registered in `src/index.css` via `@plugin "daisyui"`.

The 19 content themes in `src/config/themes.js` apply to the **design canvas only** — they use inline styles and are completely separate from DaisyUI UI chrome.

### Semantic Tokens

| Token | Tailwind Class | Usage |
|-------|----------------|-------|
| `base-100` | `bg-base-100` | Page and primary card backgrounds |
| `base-200` | `bg-base-200` | Insets, elevated surfaces, hover targets |
| `base-300` | `bg-base-300` | Stronger hover states, borders |
| `base-content` | `text-base-content` | Default text |
| `primary` / `primary-content` | `bg-primary` / `text-primary-content` | Primary actions, active states |
| `secondary` / `secondary-content` | `bg-secondary` / `text-secondary-content` | Secondary accents |
| `accent` / `accent-content` | `bg-accent` / `text-accent-content` | Highlights |
| `success` | `bg-success` / `text-success` | Success feedback |
| `warning` | `bg-warning` / `text-warning` | Warnings, caution states |
| `error` | `bg-error` / `text-error` | Destructive actions, errors |

Actual hex values vary per active theme — never hardcode.

### Text Opacity Modifiers

For muted-text hierarchy, layer opacity on `text-base-content`:

```jsx
<p className="text-base-content">Default</p>
<p className="text-base-content/70">Secondary</p>
<p className="text-base-content/60">Subtle</p>
<p className="text-base-content/40">Faint</p>
```

These read correctly across both themes. **Do not** apply the same trick to background colors of interactive elements — see the rule above.

### Background Hierarchy

| Level | Token | Usage |
|-------|-------|-------|
| Page | `bg-base-100` | Page and primary card backgrounds |
| Elevated | `bg-base-200` | Inset areas, secondary surfaces, hover backgrounds |
| Strong | `bg-base-300` | Stronger hover, dividers, borders |

---

## Typography

### Font Stack

**Headlines:** Space Grotesk
**Body:** Inter

Both via Google Fonts. The `<link>` tags carry `crossorigin="anonymous"` so the export pipeline can read CSS rules — see CLAUDE.md "Font embedding for export."

*Why these?*
- **Space Grotesk** — Geometric with personality, great for headlines
- **Inter** — Designed for screens, excellent readability

### Type Scale

| Style | Tailwind | Weight | Usage |
|-------|----------|--------|-------|
| Display | `text-5xl` | 700 | Hero headlines |
| H1 | `text-4xl` | 700 | Page titles |
| H2 | `text-2xl` | 600 | Section headers |
| H3 | `text-xl` | 600 | Card headers |
| H4 | `text-lg` | 600 | Subsections |
| Body | `text-base` | 400 | Main content |
| Body SM | `text-sm` | 400 | Secondary text |
| Caption | `text-xs` | 500 | Labels, hints |
| Overline | `text-xs uppercase tracking-wider` | 600 | Category labels |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasized body, labels |
| Semibold | 600 | Subheadings, button labels |
| Bold | 700 | Headlines, primary actions |

---

## Spacing

DaisyUI inherits Tailwind's 4px-base spacing scale. Common patterns:

| Tier | Tailwind | Usage |
|------|----------|-------|
| Tiny | `p-1` (4px) | Icon padding, micro gaps |
| Small | `p-2` (8px) | Inline spacing |
| Default | `p-3` (12px) | Standard padding |
| Comfortable | `p-4` (16px) | Card padding |
| Section | `p-6` (24px) | Section gaps |
| Large | `p-8` (32px) | Hero spacing |
| Page | `p-12` (48px) | Page margins |

---

## Border Radius

Use DaisyUI's semantic radius tokens. They scale together when a theme adjusts roundness:

| Token | Usage |
|-------|-------|
| `rounded-selector` | Pills, badges, small toggles |
| `rounded-field` | Inputs, buttons (DaisyUI components apply this automatically) |
| `rounded-box` | Cards, modals, panels (DaisyUI components apply this automatically) |
| `rounded-full` | Avatars, full-circle pills |

Don't override DaisyUI component radii. Don't introduce arbitrary `rounded-[Xpx]`. Don't set `borderRadius` inline.

---

## Shadows

Use DaisyUI's component-default shadows. `card`, `dropdown`, `modal`, `toast`, etc. ship sensible elevation. Don't introduce arbitrary `shadow-[...]` values. If a surface needs more emphasis than DaisyUI provides out of the box, it probably needs a different component (e.g., `card` instead of a bare `div`), or it needs DaisyUI's `shadow-md`/`shadow-lg` utilities.

In dark mode the visual weight comes from DaisyUI's themed background steps (`base-100` → `base-200` → `base-300`) and `border-base-300` highlights, not from heavier shadows.

---

## Components

Use DaisyUI components directly. Don't hand-roll equivalents.

| Need | Use |
|------|-----|
| Button | `btn btn-primary` / `btn btn-outline` / `btn btn-ghost` / `btn btn-error` etc. |
| Form input | `input input-bordered input-sm` |
| Select | `select select-bordered select-sm` |
| Textarea | `textarea textarea-bordered textarea-sm` |
| Checkbox | `checkbox checkbox-primary checkbox-sm` |
| Radio | `radio radio-primary radio-sm` |
| Range slider | `range range-primary range-sm` |
| Card / panel | `card` + `card-body` |
| Tabs | `tabs tabs-border` + `tab` |
| Modal | `<dialog className="modal">` + `modal-box` (use native `<dialog>` for top-layer + focus trap) |
| Drawer | `drawer` + `drawer-content` + `drawer-side` |
| Dropdown | `dropdown` + `dropdown-content` |
| Toast | `toast` (container) + `alert` (item) |
| Tooltip | `tooltip` (or `Tooltip.jsx` portal-based for clipping-safe placement) |
| Badge | `badge` + variant |
| Alert | `alert alert-error alert-soft` (etc.) |
| Spinner | `loading loading-spinner` |
| Progress | `progress progress-primary` |
| KBD chip | `kbd kbd-sm` |
| Divider | `divider` |
| Connected button group | `join` + `join-item` |
| Bottom nav | `dock dock-sm` + `dock-active` + `dock-label` |
| Menu list | `menu menu-sm` |
| Collapsible section | `collapse collapse-arrow` |

When picking a size, prefer the small variant (`*-sm`) for desktop UI density and bump up only when touch surfaces require it.

---

## Motion & Delight

### Transitions

- **Default timing:** `150ms ease` for micro-interactions
- **Emphasis timing:** `200ms ease-out` for larger movements

```css
/* Standard transition */
transition: all 150ms ease;

/* Color/opacity only (smoother) */
transition: color 150ms ease, background-color 150ms ease, opacity 150ms ease;
```

### Hover Effects

Lean on DaisyUI's built-in hover states. Most components handle this for you. For card-like surfaces, an additional subtle shadow lift is fine. Avoid heavy scale/translate transforms on small UI elements — they fight DaisyUI's default feel.

### Reduced Motion

Honor `prefers-reduced-motion`. `src/index.css` and the BottomSheet component already collapse animation/transition durations when the user has reduced motion enabled — match that pattern for any new animation you add.

---

## Iconography

**Source:** Inline SVG path constants in `src/config/menuIcons.js`.

We don't ship an icon library — every icon is a hand-curated SVG path bundled into the config so we don't add a dependency for a small icon set. New icons go into `menuIcons.js` and inherit color via `currentColor` (set the `text-*` class on the parent button or link).

| Size | Tailwind | Usage |
|------|----------|-------|
| Inline | `w-3.5 h-3.5` | Inline with small text |
| Small | `w-4 h-4` | Buttons, inline actions |
| Default | `w-5 h-5` | Standard UI icons |
| Large | `w-6 h-6` | Section headers, emphasis |
| Empty state | `w-8 h-8` | Empty states, feature highlights |

---

## Dark Mode

DaisyUI handles light/dark automatically via `data-theme`. Users pick a combo (Mono or Luxe); toggling dark/light switches between the paired themes.

### Key Principles

1. **DaisyUI tokens adapt automatically** — no manual `dark:` class pairs needed for color.
2. **Dual-layer theming** — `.dark` class for any non-DaisyUI utilities that need the legacy hook (e.g., `color-scheme: dark` for native form inputs and scrollbars), plus `data-theme` for DaisyUI component colors. Both managed by `useDarkMode.js`.
3. **First-visit default is light** — brand-aligned with the PWA icon palette. `prefers-color-scheme` is intentionally not honored; users toggle explicitly.
4. **Flash-prevention inline script in `index.html`** applies the active theme before React mounts. Don't remove it.

See `src/hooks/useDarkMode.js` for the implementation and `src/config/daisyuiThemes.js` for the combo definitions and meta colors.

---

## Accessibility

Even fun design needs to be usable.

### Contrast Ratios

DaisyUI's default themes meet WCAG AA on text. Verify with browser tools when introducing custom theme tweaks or low-opacity text.

| Text Type | Minimum |
|-----------|---------|
| Body text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components | 3:1 |

### Focus States

DaisyUI components provide visible focus rings via the active theme's `--color-primary`. Don't override unless you're verifying contrast on every theme. For non-DaisyUI custom controls, use `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.

### Motion Sensitivity

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

This override is in `src/index.css`. Match the spirit when introducing new transitions: respect the user's preference rather than relying on a global hammer.

### Keyboard Navigation

- All interactive elements must be keyboard reachable.
- Modals (`<dialog>`) provide a focus trap natively.
- The burger menu uses `useFocusTrap` for the same purpose.
- Disclosure components use `useDisclosureFocus` to return focus to the trigger on close.

---

## Philosophy

1. **Color is energy** — Don't be afraid of it
2. **Whitespace is breathing room** — Let elements breathe
3. **Consistency builds trust** — Same patterns everywhere
4. **Delight is in the details** — The small animations matter
5. **Fun ≠ unprofessional** — Vibrant can still be polished

When in doubt: defer to DaisyUI defaults. They're already considered.
