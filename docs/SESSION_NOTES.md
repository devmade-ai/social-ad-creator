# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Mobile crash debugging — TDZ error in BottomSheet + debug system improvement.

## Accomplished

### BottomSheet TDZ crash fix
- `handleTouchMove`'s `useCallback` dependency array referenced `snapToNearest` before its `const` declaration — temporal dead zone crash
- Bug introduced in commit `89ac172` (safety snap timeout) which added `snapToNearest` to `handleTouchMove`'s deps
- Fix: moved `snapToNearest` declaration above `handleTouchMove` and `finishTouch`
- Hook call order changed (positions 14-15 swapped) — safe because old order always crashed, no prior hook state exists
- Mobile-only: BottomSheet only renders in MobileLayout, not DesktopLayout
- Scanned entire codebase for similar TDZ patterns — none found

### Debug system stack trace capture
- `console.error` interceptor now extracts `Error.stack` from Error objects in args
- Global error handler now captures `e.error?.stack`
- Both improvements make minified crash debugging drastically easier (this crash took extensive analysis without stack traces)

## Current state

- **Branch:** `claude/debug-canvagrid-mobile-0Om3w` — pushed (2 commits)
- Build passes, 133 tests pass
- No other TDZ patterns found in codebase

## Key context

- The error appeared as `Cannot access 'm' before initialization` — minified variable name with no stack trace in debug report
- Source-map tracing only pointed to React DOM's error re-throw location, not the user code that caused it
- The fix was to reorder declarations, not change any logic
- AI_MISTAKES.md updated with the TDZ pattern for future prevention
