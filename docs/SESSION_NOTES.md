# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
PWA (Progressive Web App) conversion

## Accomplished

1. **Added PWA support via vite-plugin-pwa**
   - Installed `vite-plugin-pwa` and `sharp` (for icon generation)
   - Configured manifest with app name, colors, icons
   - Set up Workbox service worker with Google Fonts caching
   - Sample images excluded from precache (too large)

2. **Created app icon**
   - SVG icon in `public/icon.svg` (purple gradient, stylized layout)
   - PNG generation script at `scripts/generate-icons.mjs`
   - Generates 192x192, 512x512, and apple-touch-icon at build time
   - Runs automatically via `prebuild` npm script

3. **Install button (Vercel/Supabase style)**
   - `usePWAInstall` hook manages install state
   - Purple "Install" button in header (only shows when installable)
   - Non-intrusive - no popup on first visit

4. **Update button (same pattern)**
   - `usePWAUpdate` hook manages update state
   - Green "Update" button in header (only shows when update available)
   - Checks for updates every hour

5. **Updated index.html with PWA meta tags**
   - theme-color, apple-mobile-web-app-capable, apple-touch-icon, etc.

## Current state
- **Build**: Passing
- PWA manifest and service worker generated in `dist/`
- Ready for deployment - users can install to home screen after merge

## Key context

- Both Install and Update use header buttons (not popups)
- GitHub Actions auto-deploys on push to main
- Service worker uses `registerType: 'prompt'` for user-controlled updates
- New hooks in `src/hooks/`: `usePWAInstall.js`, `usePWAUpdate.js`
