# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Sample images UX + Semantic color system

## Accomplished

- **Collapsible sample images**: Sample images now in collapsible section within Images
- **Two sample images by default**: 2 random samples loaded on app start
- **Spacing section reorganization**: Outer frame moved below global padding
- **Alpha label**: Added "Alpha" badge to header
- **Dark mode color fixes**: Fixed missing dark: variants across 6 components
- **Semantic color system**: Created CSS variables and Tailwind tokens for theming:
  - `text-ui-text-*` (default, muted, subtle, faint)
  - `bg-ui-surface-*` (default, elevated, inset, hover)
  - `border-ui-border-*` (default, subtle, strong)

## Current state
- **Build**: Passing
- Semantic colors partially adopted (text colors mostly done, some bg/border patterns remain)
- Colors auto-switch between light/dark via CSS variables

## Key context

- **Color token location**: CSS variables in `src/index.css`, Tailwind config in `tailwind.config.js` under `ui` namespace
- **Usage pattern**: `text-ui-text-muted` instead of `text-zinc-600 dark:text-zinc-300`
- Remaining old patterns can be refactored incrementally
