# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Complete debug system implementation per glow-props DEBUG_SYSTEM.md pattern — upgrade from dev-only to alpha-phase production tool.

## Accomplished

### Debug system completion (10 items from task list)
1. **Console interception** — `console.error`/`console.warn` patched at module load in `debugLog.js` with HMR guard and re-entrancy guard to capture React warnings automatically.
2. **Static `#debug-root`** — Replaced dynamic `createElement` with static `<div id="debug-root">` in `index.html`. DebugPill mounts into this separate React root.
3. **PWA Diagnostics tab** — Third tab in DebugPill. Active health checks: HTTPS, SW registration state, manifest validation, standalone mode, `beforeinstallprompt` receipt. Monotonic counter for stale-run cancellation.
4. **Pre-React inline pill** — Inline `<script>` in `index.html` with `window.__debugPushError()` global, named error/rejection handlers, and 20-second loading timeout warning.
5. **URL redaction** — `debugGenerateReport()` and Env tab redact query params (`?[redacted]`) and hash (`#[redacted]`) to prevent token leaking in shared reports.
6. **Subscriber replay** — New subscribers receive existing entries immediately on subscribe.
7. **DEV-only gating removed** — `mountDebugPill()` called unconditionally in `main.jsx`. `__debugClearLoadTimer()` called on mount.
8. **Success severity** — Added `success: '#4ade80'` to `SEVERITY_COLORS`.
9. **`debugGenerateReport()`** — Report generation moved from pill component into `debugLog.js` module for reuse.
10. **Embed mode skip** — Pill skipped when `?embed=` is in URL (checked at both mount and component level).

### Self-review fixes (2 rounds)
11. **Re-entrancy guard** — Console interception could infinite-loop if `debugLog` itself threw. Added boolean guard with `try/finally`.
12. **Pre-React error replay** — `window.__debugErrors` from inline script replayed into structured debug log at module load, then cleared.
13. **Duplicate listener deregistration** — Inline script's error handlers are now named so `debugLog.js` can `removeEventListener` after takeover.
14. **Stale-run stuck state** — PWA diagnostics `isStale()` early returns now call `setRunning(false)`.
15. **notify() simplified** — Removed unused `entry` parameter.
16. **Unused import removed** — `getEntries` no longer imported in DebugPill.

### Audit fixes (round 3)
17. **Dead badge code removed** — `debug-pre-error-count` getElementById in inline script referenced a non-existent element.
18. **copyReport awaited** — `copyToClipboard` is async; now awaited with accurate success/failure log entry using `success`/`warn` severity.
19. **Monotonic nextId** — `clearEntries` no longer resets `nextId` to 1, preventing duplicate React keys when new entries are added after clear.

### Full branch audit fixes (round 4)
20. **BurgerMenu ArrowUp off-by-one** — When no button focused (`idx === -1`), ArrowUp went to `length - 2` instead of last item.
21. **BottomSheet spurious snapToNearest** — `handleTouchEnd` fired snap logic on non-drag content taps. Added `isDragging` guard.
22. **Dead `getPageCount`** — Defined in `useAdState` but never called. Removed.
23. **useDarkMode double-execution** — `comboId` redundant in effect deps. Moved to ref for logging.
24. **Dead `comboMapStr`** — Built but never used in `generate-theme-meta.mjs`. Removed.
25. **oklchToHex L=1% boundary** — Regex now captures `%` explicitly instead of `L > 1` heuristic.

## Current state

- **Branch:** `claude/add-console-interception-JGFQj` — 7 commits, pushed
- Build passes, 72 tests pass, no errors
- All 10 original task items + 4 audit rounds complete

## Key context

- **Dual error capture layers:** Inline script (pre-React) → `debugLog.js` module (post-mount). Inline handlers deregistered after module takes over to prevent duplicates. Pre-React errors replayed with `pre-react` source tag.
- **Console interception has re-entrancy guard:** Shared `intercepting` boolean prevents infinite loop if `debugLog` itself triggers `console.error`.
- **DebugPill uses inline styles, not Tailwind:** Separate React root has no DaisyUI `data-theme`, so component classes won't resolve. Intentional per pattern.
- **ErrorBoundary bridges to both systems:** Calls `debugLog()` (React debug log) and `__debugPushError()` (pre-React inline pill) for maximum visibility.
