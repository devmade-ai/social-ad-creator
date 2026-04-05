# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Replace custom UI components with DaisyUI 5 equivalents throughout the codebase.

## Accomplished

### DaisyUI component migration
1. **4 modals → DaisyUI `modal` + native `<dialog>`** — TutorialModal, SaveLoadModal, InstallInstructionsModal, KeyboardShortcutsOverlay. Replaced hand-rolled fixed overlays with `<dialog>` (native focus trapping, Escape handling, `::backdrop`). Removed `useFocusTrap` imports from all 4 modal components (still used by BurgerMenu).
2. **CollapsibleSection → DaisyUI `collapse`** — Used `collapse collapse-arrow` with checkbox input for state control. Preserved `onExpand` callback (font loading) and subtitle-when-collapsed behavior via CSS sibling selector.
3. **SaveLoadModal tabs → DaisyUI `tabs tabs-border`** — Replaced custom border-bottom tab buttons with DaisyUI tab component and proper `role="tablist"`.
4. **SaveLoadModal error → DaisyUI `alert alert-error alert-soft`** — Replaced custom error div with DaisyUI alert component.
5. **Toast → DaisyUI `toast` + `alert`** — Container uses DaisyUI `toast toast-center toast-bottom` for positioning; each notification uses `alert alert-{type}` for severity styling. Kept auto-dismiss and exit animation logic.
6. **Progress bar → DaisyUI `progress progress-primary`** — ExportButtons progress replaced custom div-based bar. Removed `bg-gradient-creative` utility from index.css.
7. **DebugPill badges → DaisyUI `badge badge-error/warning`** — Replaced inline-styled count spans.
8. **Keyboard shortcuts → DaisyUI `kbd kbd-sm`** — Replaced hand-rolled kbd styling. Also added DaisyUI `divider` between sections.
9. **Install instructions note → DaisyUI `alert alert-warning alert-soft`** — Replaced custom warning box.
10. **Removed `bg-gradient-creative` utility** from index.css (no longer used) and STYLE_GUIDE.md.

## Current state

- **Working** — On branch `claude/daisyui-tailwind-utilities-cK7x6`
- Build passes (1080 KiB JS, 129 KiB CSS)

## Key context

- **Modals use native `<dialog>`** — No more `z-[60]` fixed positioning or manual backdrop. The browser's top layer handles stacking. `useFocusTrap` removed from all modals (BurgerMenu still uses it).
- **CollapsibleSection subtitle** — Hidden when expanded via CSS rule `.collapse > input:checked ~ .collapse-title .subtitle-when-collapsed { display: none }` in index.css.
- **Toast still custom logic** — DaisyUI provides positioning (`toast`) and styling (`alert`), but auto-dismiss timer and exit animation remain custom (DaisyUI has no toast lifecycle).
- **DebugPill stays inline styles** — Dev-only component in separate React root; only badges converted to DaisyUI classes.
