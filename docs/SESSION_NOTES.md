# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Major mobile redesign — dedicated mobile layout with bottom sheet, bottom nav, and touch-optimized UI.

## Accomplished

1. **`useIsMobile` hook** — matchMedia-based viewport detection (< 1024px / Tailwind lg breakpoint)
2. **`BottomSheet.jsx`** — Touch-draggable bottom sheet with 3 snap points (closed 64px / half 50vh / full 90vh) for mobile tab content
3. **`MobileNav.jsx`** — Fixed bottom nav bar with 6 tabs (Presets, Media, Content, Structure, Style, Export). Tapping active tab toggles bottom sheet
4. **`App.jsx` refactor** — Conditional mobile/desktop rendering via `useIsMobile`. Mobile gets: fixed viewport, edge-to-edge canvas, bottom sheet for controls, compact header with hamburger overflow menu, swipe-between-pages gesture, platform info strip
5. **`CollapsibleSection.jsx`** — Larger touch targets on mobile (py-3 vs py-2.5)
6. **`index.css`** — Larger range input thumbs on mobile (24px), removed body safe-area padding on mobile (now per-component)
7. **`EmptyStateGuide.jsx`** — Moved from canvas overlay to below canvas (normal document flow)

## Current state

- **Working** — Mobile and desktop layouts both functional
- App.jsx is larger due to dual layout paths — may need further extraction in future sessions
- Export is a dedicated mobile tab (vs sidebar section on desktop)

## Key context

- `useIsMobile` returns boolean, uses `matchMedia('(max-width: 1023px)')` with resize listener
- BottomSheet uses touch events for drag, CSS transitions for spring animation, resets on tab switch
- MobileNav is fixed at bottom with safe-area padding for notched devices
- Mobile header uses hamburger menu containing: Save, View, Install, Dark Mode, Help, Shortcuts
- Swipe gesture on canvas navigates between pages (touchstart/touchend with 50px threshold)
- Platform info strip shows current format name + dimensions above canvas on mobile
