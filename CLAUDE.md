# READ AND FOLLOW THE FUCKING PROCESS, PRINCIPLES, COMMUNICATION, CODE STANDARDS, DOCUMENTATION, AI NOTES, TRIGGERS, AND PROHIBITIONS EVERY TIME

## Fetching External CLAUDE.md

The shared scaffolding (Process, Principles, Code Standards, Documentation, AI Notes, Triggers, Prohibitions, Implementation Patterns) is maintained in the sister project `devmade-ai/glow-props`.

To fetch the latest version:
```bash
curl -sf "https://devmade-ai.github.io/glow-props/CLAUDE.md"
```

When fetching updates, merge changes into the shared sections while preserving canva-grid-specific content (Project Info, Architecture, State Structure, Tab Details, etc.).

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

### REMINDER: READ AND FOLLOW THE FUCKING PROCESS EVERY TIME

## Principles

1. **User-first design** - Align with how real people will use the tool (top priority)
2. **Simplicity** - Simple flow, clear guidance, non-overwhelming visuals, accurate interpretation
3. **Document WHY** - Explain decisions and how they align with tool goals
4. **Testability** - Ensure correctness and alignment with usage goals can be verified
5. **Know the purpose** - Always be aware of what the tool is for
6. **Follow conventions** - Best practices and consistent patterns
7. **Repeatable process** - Follow consistent steps to ensure all the above

### REMINDER: READ AND FOLLOW THE FUCKING PRINCIPLES EVERY TIME

## Communication

Respond as if talking to yourself. Peer-to-peer, no servility.

- **Direct.** No filler, no preamble, no conversational padding. State facts and actions.
- **No sycophancy.** No "great question", "you're absolutely right", "excellent point". Acknowledge errors briefly and move on.
- **No hedging.** Commit to a position. "I think" / "perhaps" only when genuinely uncertain.
- **Proper solutions only.** Always suggest the right fix, not a quick hack. If the proper solution is complex, explain why the shortcut is wrong and lay out the real approach.
- **Work, not process.** Only discuss work that can be done and work that is done. Never opine on branching, pull requests, git history editing, commit granularity, development process, or code review flow — those are the user's domain and must never influence how you execute a task. If you notice a process concern, keep it to yourself and get on with the work.
- **Ask before assuming.** When a user reports a bug or makes a request, ask clarifying questions until you are certain you understand the requirement. Don't guess the cause and build a fix on an assumption — one wrong assumption wastes multiple commits.
- **Always ask at least one question before starting work.** This is the minimum bar. Even when the request seems clear, verify scope, constraints, or intent before writing code.
- **Concrete options.** When clarification is needed, list numbered options — never open-ended questions.
- **Assume competence.** The reader is a developer. Don't over-explain basics.
- **Push back.** Disagree when warranted. State your view first, then ask if they want to proceed differently.

### REMINDER: READ AND FOLLOW THE COMMUNICATION RULES EVERY TIME

## Code Standards

### Code Organization

- Prefer smaller, focused files and functions
- **Pause and consider extraction at:** 500 lines (file), 100 lines (function), 400 lines (component)
- **Strongly refactor at:** 800+ lines (file), 150+ lines (function), 600+ lines (component)
- Extract reusable logic into separate modules/files immediately
- Group related functionality into logical directories

### Decision Documentation in Code

Non-trivial code changes must include comments explaining:
- **What** was the requirement or instruction
- **Why** this approach was chosen
- **What alternatives** were considered and why they were rejected

```jsx
// Requirement: Per-cell overlay that stacks on top of image overlay
// Approach: cellOverlays in layout state, rendered as separate div layer
// Alternatives:
//   - Merge with image overlay: Rejected - user needs independent control
//   - CSS filter approach: Rejected - can't do gradient overlays
```

### Cleanup

- Remove `console.log`/`console.debug` statements before marking work complete
- Delete unused imports, variables, and dead code immediately
- Remove commented-out code unless explicitly marked `// KEEP:` with reason
- Remove temporary/scratch files after implementation is complete

### Timer and Subscription Cleanup

- Every `setTimeout`/`setInterval`/`addEventListener`/`subscribe` needs a matching cleanup (`clearTimeout`/`clearInterval`/`removeEventListener`/unsubscribe handle).
- Store timer ids in a scope the cleanup can reach. Nested timeouts → array; single-shot → local const or ref.
- In React: return cleanup from `useEffect`. In plain modules: export a `dispose()` or use `AbortController`.
- HMR-safe: guard global listener attachment behind a `window.__<featureName>Attached` flag so hot-reload doesn't double-subscribe. For frameworks exposing `import.meta.hot`, also release listeners via `import.meta.hot.dispose()`.
- See the `TIMER_LEAKS.md` implementation pattern in glow-props for concrete patterns (nested-timeout array, AbortController, per-effect dispose, HMR guard).

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing input validation at boundaries
- Security concerns (XSS via dangerouslySetInnerHTML, unsanitized user input)
- Performance issues (unnecessary re-renders, missing keys, large re-computations)

Report findings even if not directly related to current task.

### User Experience (Non-Negotiable)

All end users are non-technical. This overrides cleverness.

- UI must be intuitive without instructions
- Use plain language - no jargon or developer-speak in user-facing text
- Error messages must say what went wrong AND what to do next, in simple terms
- Confirm destructive actions with clear consequences explained
- Provide feedback for all user actions (loading states, success confirmations)

### Commit Message Format

All commits must include metadata footers:

```
type(scope): subject

Body explaining why.

Tags: tag1, tag2, tag3
Complexity: 1-5
Urgency: 1-5
Impact: internal|user-facing|infrastructure|api
Risk: low|medium|high
Debt: added|paid|neutral
Epic: feature-name
Semver: patch|minor|major
```

**Tags:** Use descriptive tags relevant to the change (e.g., docs, state, layout, export, pwa, text, media, ui)
**Complexity:** 1=trivial, 2=small, 3=medium, 4=large, 5=major rewrite
**Urgency:** 1=planned, 2=normal, 3=elevated, 4=urgent, 5=critical
**Impact:** internal, user-facing, infrastructure, or api
**Risk:** low=safe change, medium=could break things, high=touches critical paths
**Debt:** added=introduced shortcuts, paid=cleaned up debt, neutral=neither
**Epic:** groups related commits under one feature/initiative name
**Semver:** patch=bugfix, minor=new feature, major=breaking change

These footers are required on every commit. No exceptions.

### REMINDER: READ AND FOLLOW THE FUCKING CODE STANDARDS EVERY TIME

## Documentation

**AI assistants automatically maintain these documents.** Update them as you work - don't wait for the user to ask. This ensures context is always current for the next session.

### `CLAUDE.md`

**Purpose:** AI preferences, project overview, architecture, key state structures.
**When to read:** At the start of every session, before doing any work.
**When to update:** When project architecture changes, state structure changes, or preferences evolve.
**What to include:**

- Process, Principles, AI Notes: Update when learning new patterns or preferences
- Project Status: Current working features (bullet list)
- Architecture: File structure with brief descriptions
- Key State Structure: Important state shapes with comments
- Any section that becomes outdated after feature changes

**Why:** This is the primary context for AI assistants. Accurate info here prevents mistakes.

### `docs/SESSION_NOTES.md`

**Purpose:** Compact context summary for session continuity (like `/compact` output).
**When to read:** At the start of a session to quickly understand what was done previously.
**When to update:** Rewrite at session end with a fresh summary. Clear previous content.
**What to include:**

- **Worked on:** Brief description of focus area
- **Accomplished:** Bullet list of completions
- **Current state:** Where things stand (working/broken/in-progress)
- **Key context:** Important info the next session needs to know

**Why:** Enables quick resumption without re-reading entire codebase. Not a changelog - a snapshot.

### `docs/TODO.md`

**Purpose:** AI-managed backlog of ideas and potential improvements.
**When to read:** When looking for work to do, or when the user asks about pending tasks.
**When to update:** When noticing potential improvements. Delete completed items (git history tracks them).
**What to include:**

- Group by category (Features, UX, Technical, etc.)
- Use `- [ ]` for pending items only
- Brief description of what and why
- When complete, delete completed items (git history tracks them)

**Why:** User reviews this to prioritize work. Keeps TODO focused on pending items only.

### `docs/USER_ACTIONS.md`

**Purpose:** Manual actions requiring user intervention outside the codebase.
**When to read:** When something requires manual user intervention (deployments, API keys, external config).
**When to update:** When tasks need external action. Clear when completed.
**What to include:**

- Action title and description
- Why it's needed
- Steps to complete
- Keep empty when nothing pending (with placeholder text)

**Why:** Some tasks require credentials, dashboards, or manual config the AI can't do.

### `docs/AI_MISTAKES.md`

**Purpose:** Record significant AI mistakes and learnings to prevent repetition.
**When to read:** When starting a session, to avoid repeating past mistakes.
**When to update:** After making a mistake that wasted time or broke things.
**What to include:**

- What went wrong
- Why it happened
- How to prevent it
- Date (for context)

**Why:** AI assistants repeat mistakes across sessions. This document builds institutional memory.

### `README.md`

**Purpose:** User-facing guide for the application.
**When to read:** When you need a quick overview of what the tool does and its main features.
**When to update:** When features change that affect how users interact with the tool.
**What to include:**

- What the tool does (overview)
- Current features (keep in sync with actual functionality)
- How to use each feature (user guide)
- Getting started / installation
- Tech stack and deployment info

**Why:** Users and contributors read this first. Must accurately reflect the current state.

### `docs/USER_GUIDE.md`

**Purpose:** Comprehensive user documentation explaining how to use every feature.
**When to read:** When you need to understand what users can do with the tool, or how a feature is supposed to work from the user's perspective.
**When to update:** When adding new features, changing UI workflows, or modifying how existing features work.
**What to include:**

- Tab-by-tab walkthrough of the interface
- Explanation of every control and what it does
- Workflow tips and best practices
- Organized by user tasks, not technical implementation

**Why:** Serves as the authoritative reference for user-facing behavior. Helps ensure AI assistants understand the user experience.

### `docs/TESTING_GUIDE.md`

**Purpose:** Manual test scenarios for verifying the application works correctly.
**When to read:** Before testing changes, or when you need to verify specific functionality works.
**When to update:** When adding new features that need test coverage, or when existing tests become outdated.
**What to include:**

- Step-by-step test scenarios with exact actions
- Where to click/look for each step
- Expected results for each action
- Regression checklist for quick verification

**Why:** Ensures consistent, thorough testing. Prevents regressions by documenting what to verify after changes.

### `docs/STYLE_GUIDE.md`

**Purpose:** Visual design system documentation (colors, typography, spacing, components).
**When to read:** When implementing UI changes, adding new components, or adjusting visual design.
**When to update:** When the design system evolves (new colors, spacing tokens, component patterns).
**What to include:**

- Color palette with hex values and semantic tokens
- Typography scale and font choices
- Spacing system and border radius tokens
- Component patterns (buttons, inputs, cards, tabs)
- Dark mode specifications
- Accessibility requirements

**Why:** Ensures visual consistency across the application. Reference for implementing new UI.

### REMINDER: READ AND FOLLOW THE FUCKING DOCUMENTATION EVERY TIME

## AI Notes

<!-- Reminders and learnings for AI assistants - add to this as needed -->

- **All code is yours.** Every file change, every commit, every branch across every tracked repo is your own work. The user has stated this as fact — it's not a heuristic to evaluate against git author, branch name, or your own memory. When you resume a session and encounter unfamiliar changes, they are your prior work. Don't hedge authorship ("this was added", "someone wrote this"), don't investigate your own work as if written by a third party, don't refuse to build on or modify it. If you need to understand a change, read the diff. That's all.
- **Discontinued repos — skip entirely:** `plant-fur` and `coin-zapp` are discontinued. Do not check, audit, align, or include them in cross-project operations.
- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Clean up completed or obsolete docs/files and remove references to them
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users.
- **NEVER use the AskUserQuestion tool.** It breaks the session UI — the input selector covers context, gets stuck awaiting input, and provides zero value. Instead, list options as numbered text in your response and let the user reply with a number or text. This is absolute and applies to every session, every project, no exceptions.
- **Always read files before editing.** Use the Read tool on every file before attempting to Edit it. Editing without reading first will fail.
- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. The `sharp` package may not be installed (used by prebuild icon generation), so use `./node_modules/.bin/vite build` directly to skip the prebuild step.
- **ESLint setup:** ESLint 9 flat config (`eslint.config.js`) with `eslint-plugin-react-hooks@7.x` and `eslint-plugin-react-refresh` (vite preset). Run `npm run lint` before committing. The `no-unused-vars` rule has `argsIgnorePattern: '^[A-Z_]'` because ESLint's scope analysis doesn't track JSX component references (`<Foo />`) as variable usage — PascalCase function args would be false positives without this. `eslint-plugin-react-hooks@7.x` caps at ESLint 9 (doesn't support 10). When adding new `eslint-disable` comments, always include a `--` reason suffix explaining WHY the suppression is needed. Test files import Jest globals explicitly from `@jest/globals` (no ESLint global env needed).
- **Dark mode + DaisyUI dual-layer theming:** `useDarkMode.js` manages both `.dark` class (Tailwind `dark:` utilities) and `data-theme` attribute (DaisyUI component colors) on `<html>`. Users pick a theme combo (Mono or Luxe) that pairs a light + dark theme; dark/light toggle switches between them. Two combos: Mono (lofi/black), Luxe (fantasy/luxury). Two localStorage keys: `darkMode` (bool), `themeCombo` (id). Default combo: `luxe`. Cross-tab sync via `storage` event, OS preference fallback, dynamic meta theme-color per active theme. Two inline scripts in `index.html` run before React mounts: (1) flash prevention (applies `.dark` + `data-theme` + meta theme-color from localStorage before first paint), (2) PWA `beforeinstallprompt` capture. Never remove either inline script. `index.css` has `html.dark { color-scheme: dark; }` for native form inputs/scrollbars. Meta theme-color hex values and combo maps in both `daisyuiThemes.js` and the inline script are auto-generated by `scripts/generate-theme-meta.mjs` from DaisyUI's oklch definitions. Run `npm run generate-theme-meta` after DaisyUI version updates or combo changes.
- **DaisyUI color tokens:** UI chrome uses DaisyUI semantic tokens, NOT hardcoded colors. Use `bg-base-100/200/300`, `text-base-content`, `border-base-300`, `bg-primary`, `text-primary-content`, `bg-error`, `text-success`, etc. The old custom semantic tokens (`text-ui-text`, `bg-ui-surface`, `border-ui-border`) are gone — replaced by DaisyUI equivalents. Canvas design themes (19 presets in `themes.js`) still use inline styles and are unrelated to DaisyUI.
- **DaisyUI component classes for form inputs:** All form inputs MUST use DaisyUI component classes — never hand-roll Tailwind classes for inputs. Range: `range range-primary range-sm`. Checkbox: `checkbox checkbox-primary checkbox-sm`. Select: `select select-bordered select-sm`. Input: `input input-bordered input-sm`. Textarea: `textarea textarea-bordered textarea-sm`. Custom pseudo-element CSS for form inputs is forbidden — browser pseudo-element names vary across engines. Check `node_modules/daisyui/components/` for available components before writing custom form styling.
- **No low-opacity tinted backgrounds on interactive elements:** Never use `bg-primary/10`, `bg-error/15`, `bg-success/10` etc. on buttons, toggles, active states, or indicators — they become invisible on dark themes. Use `bg-base-200`/`bg-base-300` for backgrounds (guaranteed contrast on all themes) and colored text (`text-primary`, `text-error`) for semantic meaning. Pattern: `bg-base-200 text-primary hover:bg-base-300`. Only acceptable low-opacity uses: hover-only on large containers (`hover:bg-primary/10` on drop zones) and hover darkening on full-opacity buttons (`bg-primary hover:bg-primary/80`).
- **Tailwind 4 CSS-first config:** No `tailwind.config.js` or `postcss.config.js`. All config lives in `src/index.css` using `@import "tailwindcss"`, `@plugin "daisyui"`, `@theme`, `@custom-variant`, and `@utility` directives. The `@tailwindcss/vite` plugin handles processing.
- **PWA install prompt race condition:** `beforeinstallprompt` is captured by an inline script in `index.html` before React mounts. The `usePWAInstall` hook checks `window.__pwaInstallPrompt` on mount. Never remove that inline script.
- **PWA hooks use module-level singleton pattern:** Both `usePWAUpdate.js` and `usePWAInstall.js` store state at module scope (`_hasUpdate`, `_canInstall`, etc.) with a `_listeners` Set for pub/sub. React components sync via `forceRender`. This ensures state survives remounts and all consumers share values. Pure utility functions (`detectBrowser`, `wasJustUpdated`, `trackInstallEvent`, `CHROMIUM_BROWSERS`) live in `utils/pwaHelpers.js` — extracted for testability (no browser-only imports).
- **PWA iOS browser detection:** iOS Chrome uses `CriOS`, Firefox uses `FxiOS`, Edge uses `EdgiOS` in UA strings — not `Chrome`/`Firefox`/`Edg`. These are detected before the Safari fallback in `detectBrowser()`. Without this, all iOS non-Safari browsers are misdetected as `'safari'`, breaking the iOS cross-redirect install instructions.
- **PWA icon purposes:** Never combine `"any maskable"` in a single icon entry. Use separate entries with individual `purpose` values. Dedicated 1024px maskable icon at `pwa-maskable-1024.png`.
- **Debug system (alpha, all environments):** `src/utils/debugLog.js` is an in-memory 200-entry circular buffer with pub/sub, console interception (`console.error`/`console.warn` patched at module load), and `debugGenerateReport()` for clipboard reports with URL redaction. Consecutive identical messages (same source+event+severity) are deduplicated with a `count` field. Error handlers capture `Error.stack` from Error objects (`console.error` interceptor) and `e.error?.stack` (global error listener) — stack traces appear in debug report details for diagnosing minified crashes. `src/components/DebugPill.jsx` renders in static `#debug-root` div (separate React root, survives App crashes). Three tabs: Log, Env, PWA Diagnostics. Pre-React inline pill in `index.html` captures errors before bundle loads with 20s loading timeout. Skipped in embed mode (`?embed=`). Subscribers receive existing entries immediately on subscribe. Use `debugLog(source, event, details, severity)` to add entries (severity: info/success/warn/error).
- **pdf-lib image handling:** pdf-lib embeds PNG directly (FlateDecode — no re-encoding). Digital PDF uses pxToPt=1 (1:1 pixel-to-point mapping). Captures at user-selected pixelRatio (1x/2x/3x), giving integer px/pt ratios (1:1/2:1/3:1). Print formats use pixelRatio:1 with 72/150 DPI conversion for correct physical page size. History: (1) pixelRatio:2 + 72/96 → 2.667:1 ratio → gradient banding. (2) 1:1 mapping + page scaled with pixelRatio → identical quality. (3) pxToPt=1 fixed page + variable pixelRatio → current approach. Diagnostic image download enabled in dev mode.
- **Design storage is IndexedDB:** `utils/designStorage.js` wraps IndexedDB with async save/load/list/delete. One-time migration from localStorage runs on first mount via `migrateFromLocalStorage()`. Never use localStorage for designs.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead
- **Mobile breakpoint:** `useIsMobile` hook uses `matchMedia('(max-width: 1023px)')` — matches Tailwind `lg` breakpoint. App.jsx conditionally renders entirely different layouts for mobile vs desktop. When modifying layout/UI in App.jsx, always check both code paths.
- **BottomSheet snap points:** closed (0), half (45vh), full (80vh). Uses `transform: translateY()` for GPU-composited animation (no layout reflow). During drag, DOM updated directly via refs — React state only updates on snap (touchend). Sheet state resets when switching tabs. Props: `snapPoint`/`onSnapChange` (discrete snap values, not continuous height). **Declaration order matters:** `snapToNearest` must be declared before `handleTouchMove` and `finishTouch` — they reference it in `useCallback` dependency arrays, and `const`/`let` are not hoisted (TDZ crash if accessed before declaration).
- **Z-index scale:** Canvas internals 0-10, sticky headers 20, sheets/drawers 30, mobile nav 40, menu backdrop 40, menu dropdown 50, modals use native `<dialog>` top layer (no z-index needed), toasts `z-[70]`, debug 80. DebugPill uses inline `zIndex: 80`. **Two intentional deviations from glow-props Z_INDEX_SCALE.md:** (1) Modals use native `<dialog>` which renders in the browser top layer, above all z-indexes — this inverts the scale's "debug pill is always topmost" rule when a user-opened modal is active. Accepted because native `<dialog>` provides built-in focus trap, Escape handling, and inert background; and because the pill's crash-survival purpose is preserved (if App.jsx crashes, its modals unmount with it — the pill in the separate `#debug-root` React root remains visible). (2) MobileNav sits at z-40 rather than z-20 (pattern value for "bottom nav") because it must remain tappable above BottomSheet (z-30) so users can switch tabs while the sheet is open. The BurgerMenu backdrop is NOT a z-40 tie-break — the header gets `z-50` when the menu opens, creating a stacking context that reliably places the backdrop above MobileNav regardless of DOM order. Strict pattern alignment would require BottomSheet to stop above MobileNav via bottom-inset layout rather than z-stacking — a non-trivial refactor with no behavioral benefit, so intentionally not done.
- **Modals use native `<dialog>`:** All 4 modals (TutorialModal, SaveLoadModal, InstallInstructionsModal, KeyboardShortcutsOverlay) use DaisyUI `modal` component with `<dialog>` element. Native focus trapping replaces custom `useFocusTrap` for modals. `useFocusTrap` still used by BurgerMenu. Dialog sync pattern: `useEffect` calls `showModal()`/`close()` based on React `isOpen` prop; `close` event listener syncs back to React state.
- **DaisyUI component classes for UI chrome:** CollapsibleSection uses `collapse collapse-arrow`, SaveLoadModal uses `tabs tabs-border` + `alert alert-error alert-soft`, Toast uses `toast` (container) + `alert` (item styling), ExportButtons uses `progress progress-primary` + `join` (format selector), KeyboardShortcutsOverlay uses `kbd kbd-sm` + `divider`, DebugPill uses inline styles (separate React root, no theme context), InstallInstructionsModal uses `alert alert-warning alert-soft`, SampleImagesSection/App.jsx use `loading loading-spinner`, ThemeSelector uses `join` (connected button group), AIPromptHelper uses `join` (purpose/orientation/colors), BurgerMenu uses `menu menu-sm` (list styling), MobileNav uses `dock dock-sm` + `dock-active` + `dock-label`.
- **Burger menu:** `BurgerMenu.jsx` uses WAI-ARIA disclosure pattern (not `role="menu"`). DaisyUI `menu menu-sm` provides list item styling. Owns its own backdrop (z-40, `cursor-pointer` for iOS Safari). Uses `useEscapeKey` hook, `useDisclosureFocus`, `useFocusTrap`, `useId()` for `aria-controls`. Close-then-act pattern: menu closes first, action executes after 150ms delay. MenuItem interface supports `disabled`, `separator`, `destructive`, `external`, `highlight`, `highlightColor`, `iconClass`. Version footer via `version` prop. Arrow key + Home/End keyboard navigation. State managed in App.jsx, rendered in MobileLayout. Parent header needs `z-50` when open (backdrop-blur stacking context). Accepts `children` prop for the theme section (`MenuThemeSection` in MobileLayout) — dark/light toggle with sun/moon icon + combo list (Mono/Luxe) with checkmark indicators. Menu stays open on toggle and combo selection (children don't call `onClose`).
- **Implementation patterns — always fetch from glow-props.** Never look for local copies of implementation pattern files (e.g., `docs/implementations/*.md`) in downstream repos. They do not exist locally — the single source of truth is the `docs/implementations/` folder in the glow-props repo. Fetch the latest version before every implementation task.
- **PWA icon cache busting:** `vite.config.js` defines `iconVersion()` (sha256 prefix of each icon file in `public/`) and `iconCacheBustHtml()` (Vite plugin that rewrites the four icon `<link>` tags in `index.html` to `?v=<hash>`). Manifest icons use the same `versioned()` helper. Workbox config has `cleanupOutdatedCaches: true` + `ignoreURLParametersMatching: [/^utm_/, /^v$/]` — the `/^v$/` entry is required, without it Workbox precache misses versioned icon URLs and offline breaks. Plugin order: `iconCacheBustHtml()` must run before `VitePWA()`. Tripwire: `src/__tests__/iconCacheBust.test.js` asserts source and dist-level invariants. OS icon cache is the one layer no web-side change refreshes — `InstallInstructionsModal.jsx` surfaces a collapsible with platform-tailored reinstall steps (iOS long-press → Remove App, Android long-press → Uninstall, Desktop app menu → Uninstall). Pattern source: `glow-props/docs/implementations/PWA_ICON_CACHE_BUST.md`.
- **Trigger name collisions with repo conventions:** Several trigger names overlap with repo folders/concepts — `docs` (folder `docs/`), `config` (folder `src/config/`), `tests` (folder `src/__tests__/`), `mobile` (mobile-layout concept and `useIsMobile` hook), `pwa` (PWA subsystem), `state` (state files like `useAdState.js`), `api` (unused here), `ci` (CI pipeline). Context precedence: when a bare word appears as a user message on its own (or with a scope modifier like `docs branch`, `pwa staged`, `tests file <path>`), treat it as a **Triggers** invocation and run the analysis pass. When the same word appears inside a sentence or path (e.g. "update the docs", "fix the pwa manifest", "look at `src/config/`"), treat it as a normal reference to the folder/concept. Ambiguous cases — ask which was meant with numbered options.

### REMINDER: READ AND FOLLOW THE FUCKING AI NOTES EVERY TIME

## Prohibitions

Never:
- Start implementation without understanding full scope
- Create files outside established project structure
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Ignore errors or warnings in build/console output
- Make "while I'm here" changes without asking first
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Create local copies of implementation pattern files in any repo — always fetch from glow-props
- Proceed with assumptions when a single clarifying question would prevent a wrong commit
- Use interactive input prompts or selection UIs — list options as numbered text instead
- Mention branches, pull requests, squashing, rebasing, merging, or force-pushing unless the user raises the topic first. When the user does raise one, answer the specific question and stop — do not volunteer opinions on what they should do process-wise.
- Frame any work as "out of scope" or "deferred as out of scope". Work is either doable (do it) or blocked on missing user input (say exactly what input is needed). "Scope" is a process concept, not a reason to skip work.
- Offer opinions on git history editing, branch strategy, PR size or shape, review flow, or commit structure. Follow instructions; don't editorialize on how the work should be organized.

### REMINDER: READ AND FOLLOW THE FUCKING PROHIBITIONS EVERY TIME

## Triggers

Commands that invoke focused analysis passes. Each trigger is a single perspective — what you'd notice that the others wouldn't.

### How to invoke

- **One perspective** — type the trigger name or its alias (e.g. `bugs`, `sec`, `a11y`).
- **A group** — type the group name (e.g. `correctness`, `frontend`, `ops`).
- **Everything** — type `all`.
- **Meta sweep** — type `quick`, `ship`, or `risk` for pre-curated bundles.

### Scope modifiers (suffix any trigger)

- *(none)* — whole codebase.
- `branch` — diff against the branch's base (default: `main`).
- `branch <base>` — diff against a specified base.
- `staged` — staged changes only.
- `file <path>` — single file.

Examples:
- `bugs` — bugs check across the whole codebase.
- `bugs branch` — bugs check on the current branch's diff vs main.
- `correctness branch main` — every correctness trigger against the branch diff.
- `all staged` — every applicable trigger against staged files.

### Behavior rules

- One trigger pass per response. Never combine.
- Findings are numbered text — never interactive prompts or selection UIs.
- After each pass, pause. User responds with `fix` / `skip` / `stop`:
  - `fix` — apply the suggested fixes for this trigger, then move on.
  - `skip` — skip this trigger's findings and move on.
  - `stop` — end the sweep entirely.
- Groups, meta sweeps, and `all` run triggers sequentially in table order, pausing after each.
- If a trigger doesn't apply to this repo (e.g. `database` on a static site), report "N/A for this repo" and move on.

### Correctness — group `correctness`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 1 | `bugs` | `bug` | Logic errors, off-by-ones, null/undefined paths, wrong default branches, stale assumptions |
| 2 | `errors` | `err` | Missing try/catch, swallowed failures, unhelpful error surfaces to user and dev |
| 3 | `race` | `rac` | Concurrency, stale closures, async ordering, event leaks, double-fire guards |
| 4 | `types` | `typ` | `any`/`as` abuse, unsafe casts, missing generics, runtime-vs-compile-time gaps |
| 5 | `edges` | `edg` | Empty/null/zero/max/unicode/timezone boundary cases; 0-item, 1-item, 10k-item behavior |

### Security / trust — group `trust`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 6 | `security` | `sec` | Injection, XSS, CSRF, auth gaps, insecure defaults, exposed secrets in code or bundle |
| 7 | `privacy` | `pri` | PII flow, redaction, retention, client-side data leaks, telemetry overreach |
| 8 | `supply-chain` | `sup` | Dep integrity, lockfile drift, postinstall hooks, third-party scripts |

### Performance — group `speed`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 9 | `performance` | `perf` | Render loops, expensive ops in hot paths, memory leaks, large re-computations |
| 10 | `network` | `net` | Request count, caching, batching, waterfalls, payload size, compression |
| 11 | `database` | `db` | N+1, missing indexes, transaction scope, lock contention |
| 12 | `bundle` | `bun` | Code splitting, tree-shaking, duplicate deps, blocking resources |

### User-facing — group `frontend`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 13 | `ux` | `ux` | Friction, cognitive load, missing loading/empty/error states, undiscoverable affordances |
| 14 | `a11y` | `a11y` | Keyboard nav, screen reader labels, focus order, contrast, ARIA correctness |
| 15 | `mobile` | `mob` | Touch target size, viewport, safe areas, tap delay, gestures, iOS keyboard handling |
| 16 | `motion` | `mot` | `prefers-reduced-motion` respect, animation jank, 60fps budgets, autoplay, transitions that interrupt screen-reader flow |
| 17 | `forms` | `frm` | Input validation, per-field error states, submit error handling, accessible field labels, paste/autofill behavior, unsaved-changes warnings |
| 18 | `copy` | `cpy` | Microcopy, voice consistency, jargon, error messages users actually see |
| 19 | `i18n` | `i18` | Hardcoded strings, RTL readiness, date/number formatting, pluralization |
| 20 | `dark-mode` | `dm` | Semantic color usage, contrast in both themes, flash-on-load |
| 21 | `visual` | `vis` | Layout/spacing/alignment, visual hierarchy, brand consistency, dark-vs-light visual parity, inconsistent corner radii/shadows/type scale |

### Maintainability — group `quality`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 22 | `clean` | `cln` | Dead code, duplication, commented-out blocks, unused imports/exports, leftover TODOs |
| 23 | `naming` | `nam` | Identifier clarity, consistency with local norms, misleading abbreviations |
| 24 | `patterns` | `pat` | Deviation from established patterns (fleet-wide glow-props or repo-local), reinvented wheels |
| 25 | `docs` | `doc` | Docs ↔ code drift, missing docs on public API, outdated README/CLAUDE.md claims |
| 26 | `doc-cleanup` | `dcl` | Duplicated content across doc files, stale files no longer relevant, orphaned docs nothing references, superseded files that replaced but didn't delete their predecessor, sections still describing removed features |
| 27 | `tests` | `tst` | Coverage gaps on critical paths, flaky patterns, test smells, missing edge-case tests |
| 28 | `complexity` | `cpx` | Function length, nesting depth, cyclomatic complexity hotspots |
| 29 | `hacks` | `hck` | `TODO`/`FIXME`/`HACK`/`XXX` markers, `@ts-ignore`/`@ts-expect-error`, `any` escapes framed as temporary, `setTimeout` for timing fixes, quick patches waiting to be done properly |
| 30 | `simplify` | `smp` | Reinvented framework features, over-engineered abstractions, custom code that could be 1–2 stdlib/library calls, unnecessary layers |
| 31 | `reuse` | `rus` | Custom-vs-stdlib balance: how much is hand-written that shouldn't be; logic that should be extracted for reuse but isn't; abstractions generalized for a single caller; speculative parameters, defensive checks for impossible states, and configurability serving no real need |
| 32 | `back-compat` | `bck` | Orphaned feature flags, deprecated branches with no callers, `legacy*` exports, backcompat shims outliving their purpose, `// kept for compatibility` blocks |
| 33 | `comments` | `cmt` | Code comments against repo rules — WHY not WHAT, no PR-reference rot, no AI narration, no commented-out blocks unless `// KEEP:` annotated |
| 34 | `dx` | `dx` | Developer experience: README/setup clarity, dev-error message quality, source map/stack trace usefulness, debug-surface ergonomics, contribution path friction |
| 35 | `undone` | `und` | Started-but-unfinished work — partial implementations, half-wired features, WIP branches of logic, features only reachable from dev but not production |

### Operational — group `ops`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 36 | `deps` | `dep` | Outdated, unused, vulnerable, license-risky dependencies |
| 37 | `observability` | `obs` | Log coverage, metric hygiene, trace completeness, debug-pill surfaces |
| 38 | `reliability` | `rel` | Retries, timeouts, idempotency, graceful degradation, offline handling |
| 39 | `config` | `cfg` | Env var handling, secret management, config schema drift |
| 40 | `migration` | `mig` | DB migration safety, API versioning, rollback plan, backward compatibility |
| 41 | `ci` | `ci` | Pipeline health, build speed, cache effectiveness, flake rate |
| 42 | `pwa` | `pwa` | Service worker correctness, manifest validity, install prompt handling, update flow, offline behavior, icon cache-busting, standalone-mode quirks |

### Design-level — group `design`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 43 | `architecture` | `arch` | Coupling, layering violations, abstraction leaks, module boundaries |
| 44 | `api` | `api` | Interface consistency, versioning, deprecation, contract clarity |
| 45 | `state` | `sta` | Where state lives, derivation vs storage, single-source-of-truth violations |
| 46 | `data-model` | `dat` | Schema normalization, foreign-key integrity, nullable discipline |

### Fleet alignment — group `fleet`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 47 | `align` | `aln` | Drift between this repo's CLAUDE.md and glow-props CLAUDE.md — missing sections, stale rules, divergent conventions |
| 48 | `pattern-audit` | `pa` | Every glow-props implementation pattern: implemented / partial / missing / deviates — with diff notes for each |

### Meta sweeps

Run multiple triggers sequentially, pausing after each for `fix` / `skip` / `stop`. Organised roughly by cadence — pick the one that matches when you're running it.

| Trigger | Alias | Cadence | What it does |
|---------|-------|---------|--------------|
| `hot` | `h` | pre-commit | `bugs` + `types` + `errors` — fastest sanity check before committing. Pairs well with `hot staged` |
| `quick` | `q` | pre-push | `bugs` + `security` + `a11y` — the "don't ship this" triad |
| `ship` | `shp` | pre-merge | `correctness` + `trust` + `a11y` + `tests` — full pre-merge check |
| `session` | `ses` | end of session | `surface` + `wrap` + `undone` + `skipped` — "what state am I leaving this in?" |
| `tidy` | `tdy` | weekly | `clean` + `doc-cleanup` + `hacks` + `deps` + `undone` + `dx` — maintenance / hygiene sweep |
| `all` | `*` | quarterly | Every applicable trigger across every group, in order |

### Reflective passes

Single-pass, no fan-out to other triggers. Each answers one specific question about the recent work.

| Trigger | Alias | What it does |
|---------|-------|--------------|
| `risk` | `rsk` | Worst-case blast radius analysis on the current change |
| `surface` | `srf` | Reflective pass on recent changes: what was decided, what was assumed, what was skipped, what needs human review |
| `wrap` | `wrp` | Wrap-up pass before moving on — anything to double-check / strengthen / improve, anything discovered / assumed / skipped, anything to cleanup / update / tighten, anything to note / document / clarify |
| `skipped` | `skp` | What was skipped — including issues noticed outside the current changes that were intentionally left alone. Each item: what it is, where, why skipped |
| `assumed` | `asm` | What was assumed — explicit assumptions made during the work, including things treated as out of scope. Each item: the assumption, why it was made, what happens if wrong |
| `approach` | `apr` | Was the fix the best / most proper way? Honest self-review: what shortcuts were taken, what a senior reviewer would flag, what the "proper" version looks like if different |
| `cold` | `cld` | Fresh-eyes branch audit. Re-read CLAUDE.md from scratch. Review every change on the branch as if this were a new session with no prior context — don't privilege the diffs you just made. List all findings with a fix plan per item. Default scope: `branch` |

### REMINDER: READ AND FOLLOW THE TRIGGERS EVERY TIME

## Implementation Patterns (Source of Truth)

All implementation patterns live in the **glow-props** repo and are the single source of truth for all devmade-ai projects.

**Source location:** `docs/implementations/` in the glow-props repo

**How to access from any repo:**
- Fetch via GitHub Pages: `curl -sf "https://devmade-ai.github.io/glow-props/patterns/{PATTERN_NAME}.md"`
- Fetch via GitHub API: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/glow-props/contents/docs/implementations/{PATTERN_NAME}.md" | jq -r .content | base64 -d`
- To list all available patterns: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/glow-props/contents/docs/implementations" | jq -r '.[].name'`

**Rules:**
- **Always fetch the latest version** from glow-props before implementing — patterns are continuously improved
- **Never create local copies** of implementation pattern files in downstream repos
- **Do not hardcode a list of patterns** — scan the source folder to discover what's available
- The set of patterns grows over time; always check the source for new additions

---

## Quick Reference

```
LANGUAGE=JavaScript (ES2020+)
FRAMEWORK=React 18
BUNDLER=Vite
STYLING=Tailwind CSS 4 + DaisyUI 5 (utility classes in JSX, 2 theme combos: Mono + Luxe)
LINTER=ESLint 9 (flat config) + eslint-plugin-react-hooks 7.x + eslint-plugin-react-refresh
TEST_RUNNER=Jest (150 unit tests) + Manual (see docs/TESTING_GUIDE.md)
PACKAGE_MANAGER=npm
DEPLOY=Vercel (auto-deploy on push to main)
NAMING=camelCase (variables/functions), PascalCase (components)
FILE_NAMING=PascalCase.jsx (components), camelCase.js (hooks/utils/config)
COMPONENT_STRUCTURE=flat (src/components/)
DOCS_PATH=/docs
```

---

## Project Info

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CanvaGrid - A browser-based visual design tool. Users can upload images, add text overlays, choose layouts, and export designs for social media, web, print, and presentations. Supports multi-page documents for books, stories, and slide decks.

## Project Status

Core features working:

- **Multi-page support**: Create multi-page documents (books, stories, presentations)
  - Pages array with add/duplicate/delete/reorder via Structure tab
  - Per-page: images, layout, text, overlays, padding, frames
  - Shared across pages: theme, fonts, platform, logo
- **Reader mode**: Clean full-screen view with page navigation (arrow keys, buttons, dots)
- **Freeform text mode**: Toggle on Content tab between Guided and Freeform
  - Per-cell multi-block text editors with independent content, color, size, alignment
  - Automatic markdown rendering (uses `marked` library)
- Multi-image system: Image library with per-cell assignment
  - Upload multiple images to a shared library
  - Assign different images to different cells (1 per cell)
  - Per-cell image settings: fit, position, filters
- Logo upload with position (corners, center) and size options
- Frame system: Colored borders using percentage of padding
- Flexible layout system with sub-tab organization (see Layout Tab Sub-tabs below)
- Per-cell structured text (guided mode):
  - Each cell has its own text elements: title, tagline, bodyHeading, bodyText, cta, footnote
  - Text elements organized in groups: Title+Tagline, Body, CTA, Footnote
- Theme system with 19 canvas design themes (each with light and dark variants) and custom colors
  - Canvas design themes (themes.js): 19 presets for content styling — applied via inline styles
  - App UI themes (daisyuiThemes.js): 2 combo presets (Mono: lofi/black, Luxe: fantasy/luxury) — controls app chrome
- Overlay system with 26 effects:
  - Basic: Solid color
  - Linear gradients: 8 directions (↑↓←→ and diagonals)
  - Radial: Vignette, Spotlight, Radial Soft, Radial Ring, 4 corner radials (↖↗↙↘)
  - Effects: Blur Edges, Frame, Duotone
  - Blend modes: Multiply, Screen, Overlay, Color Burn
  - Textures: Noise, Film Grain
- 24 Google Fonts (sans-serif, serif, display categories)
- Export to 40 formats across 18 platform groups:
  - Social: Instagram (Feed Portrait/Square/Feed Landscape/Story), Facebook (Feed/Square/Story/Cover), TikTok, LinkedIn (Square/Portrait/Landscape), Twitter/X, Pinterest (Pin/Story), Snapchat (Ad/Story), WhatsApp (Status), Threads (Post/Story)
  - Website: Hero (Standard/Tall/Full HD), OG Image
  - Banners: LinkedIn Banner, YouTube (Banner/Thumbnail/End Screen)
  - Print: A3, A4, A5 (Portrait & Landscape at 150 DPI)
  - E-commerce: Product Images (Square/Portrait), Store Banners (Hero/Category)
  - Other: Email Header, Zoom Background
- **Export format selection**: PNG, JPG, or WebP with per-platform recommendations
- Single download, ZIP batch download, multi-page ZIP export, and PDF export
- **PDF export**: Save as PDF via pdf-lib (PNG at 2x for lossless quality, with JPEG fallback)
- **Platform specs**: Two-level selector (platform → format), tips, file size limits, recommended formats
- Responsive preview that adapts to device width
- **PWA support**: Installable app with offline capability and update prompts
  - Inline `beforeinstallprompt` capture in index.html (race condition fix)
  - Explicit manifest `id` for stable install identity
  - Dedicated 1024px maskable icon with separated icon purposes
- **Debug system (alpha, all envs)**: In-memory event log with floating DebugPill (separate React root), console interception, PWA diagnostics, pre-React inline pill
- **Toast notifications**: Non-blocking feedback for exports, saves, deletes, warnings
- **Inline confirmations**: ConfirmButton replaces browser confirm() for destructive actions
- **Export progressive disclosure**: Secondary options collapse into "More export options"
- **Canvas controls**: Empty state guidance, contextual quick-actions for selected cell
- **Keyboard shortcuts**: 1-5 for tab switching, shortcut overlay panel (header button)
- **Mobile-first layout** (viewport < 1024px): Bottom nav bar (MobileNav), touch-draggable bottom sheet (BottomSheet) for tab content, edge-to-edge canvas, swipe-between-pages gesture, compact header with overflow menu, platform info strip

## Current Tab Structure

**Top-level tabs:** Presets, Media, Content, Structure, Style (+ Export on mobile)

### Desktop layout (>= 1024px)

Tabs render as a full-width horizontal nav bar below the header (website header pattern), with underline-style active indicator. Below the tabs is a consolidated ContextBar containing: page selector + cell selector. Undo/redo lives in the header.

```
Header (scrolls away, includes undo/redo)
Tab Nav Bar (sticky, full-width, underline active indicator)
Context Bar: [Page thumbnails] | [Cell grid]
Sidebar (tab content) | Main (platform selector + canvas + export)
```

### Mobile layout (< 1024px, detected by `useIsMobile` hook)

Fixed viewport with edge-to-edge canvas. Tab content lives in a touch-draggable BottomSheet with three snap points (closed/half/full). Navigation via fixed MobileNav bar at bottom.

```
Compact Header (grid icon + app name [gradient] + undo/redo + burger menu: Help, Install, Update, Refresh, Reader, Save, Shortcuts + dark/light toggle + theme list)
Platform Info Strip (current format name + dimensions)
Canvas (edge-to-edge, swipe left/right for page navigation)
ContextBar (page thumbnails + cell grid — consolidated single row)
BottomSheet (active tab content, drag to resize — Presets opens by default on load)
MobileNav (fixed bottom: Presets, Media, Content, Structure, Style, Export)
```

Export is a dedicated tab on mobile (vs. sidebar section on desktop) containing only download controls — platform selection lives in the Presets tab. Tapping the active tab toggles the bottom sheet open/closed. Presets bottom sheet opens by default on load so users see it's active.

Tab descriptions (workflow-based organization):
- **Presets** - Start here: Platform selection (canvas size), layout presets (with aspect ratio filtering), color themes, and visual looks
- **Media** - Sample images, upload images to library, assign to cells, per-image overlay & filters, logo
- **Content** - Write text, set visibility, cell assignment, alignment, color, size
- **Structure** - Fine-tune grid structure (section sizes, subdivisions, reorder) and manage pages (add, duplicate, reorder, delete)
- **Style** - Typography, per-cell overlay, spacing, frames

## Tech Stack

- Vite 5 + React 18
- Tailwind CSS 4 + DaisyUI 5 (2 theme combos: Mono + Luxe)
- html-to-image for rendering
- JSZip + file-saver for batch export
- marked for markdown parsing (freeform text mode)
- Vercel deployment

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint (flat config, ESLint 9)
npm test                 # Run unit tests (Jest)
```

## Architecture

```
src/
├── components/     # React components
│   ├── AdCanvas.jsx           # Core rendering (cell-based layout)
│   ├── CollapsibleSection.jsx # DaisyUI collapse component wrapper (collapse-arrow, checkbox-controlled)
│   ├── TemplatesTab.jsx       # Layout presets, themes, and looks
│   ├── MediaTab.jsx           # Image management hub (upload, assign, overlay, filters, logo)
│   ├── SampleImagesSection.jsx # CDN sample images gallery with category filtering
│   ├── AIPromptHelper.jsx     # AI image prompt builder
│   ├── ContentTab.jsx         # Text editing with cell assignment
│   ├── FreeformEditor.jsx     # Per-cell freeform text block editors (FreeformBlockEditor + FreeformCellEditor)
│   ├── TextStyleControls.jsx  # Shared text styling toolbar (size, bold, italic, color, alignment, spacing)
│   ├── LayoutTab.jsx          # Grid structure + cell alignment + page management
│   ├── StyleTab.jsx           # Typography, overlay, spacing (themes in Presets tab)
│   ├── ContextBar.jsx         # Sticky bar: page selector + cell selector (consolidated single row)
│   ├── PlatformPreview.jsx    # Platform selector with search filter
│   ├── ExportButtons.jsx      # Export controls (single, multi-platform, multi-page)
│   ├── TutorialModal.jsx      # In-app help walkthrough (8 steps covering all tabs)
│   ├── SaveLoadModal.jsx      # Save/load/delete designs (IndexedDB)
│   ├── LogoUploader.jsx       # Logo upload, position, and size controls
│   ├── InstallInstructionsModal.jsx # Manual PWA install instructions
│   ├── ErrorBoundary.jsx      # Error handling wrapper
│   ├── AlignmentPicker.jsx    # Reusable alignment button group
│   ├── ColorPicker.jsx        # Theme-aware color picker for text elements
│   ├── ThemeColorPicker.jsx   # Theme color swatch picker (primary/secondary/accent/neutrals)
│   ├── ThemeSelector.jsx      # DaisyUI theme combo picker (join group: dark/light toggle + Mono/Luxe)
│   ├── MiniCellGrid.jsx       # Compact cell grid (two sizing modes: fixed-width for panels, fixed-height s/m/l for bars)
│   ├── PageDots.jsx           # Shared page thumbnails (ContextBar + Structure tab)
│   ├── Toast.jsx              # Toast notifications (DaisyUI toast container + alert styling)
│   ├── ConfirmButton.jsx      # Inline confirmation replacing browser confirm()
│   ├── Tooltip.jsx            # Portal-based tooltip (prevents clipping at container edges)
│   ├── KeyboardShortcutsOverlay.jsx # Keyboard shortcuts modal (DaisyUI modal + kbd)
│   ├── EmptyStateGuide.jsx    # Empty canvas guidance (below canvas on mobile, overlay on desktop)
│   ├── QuickActionsBar.jsx    # Cell quick-action shortcuts (Image, Text, Style)
│   ├── UndoRedoButtons.jsx    # Shared undo/redo buttons (used in both mobile + desktop headers)
│   ├── BurgerMenu.jsx         # Disclosure-pattern dropdown (WAI-ARIA, DaisyUI menu, own backdrop, close-then-act, MenuItem interface, version footer)
│   ├── BottomSheet.jsx        # Touch-draggable bottom sheet for mobile tab content (3 snap points, reduced-motion support)
│   ├── MobileNav.jsx          # DaisyUI dock bottom navigation (6 tabs incl. Export, safe area insets)
│   ├── ReaderMode.jsx         # Full-screen reader view with page navigation (useEscapeKey + arrow key handler)
│   ├── MobileLayout.jsx       # Mobile-specific layout container (header, canvas, sheet, nav)
│   ├── DesktopLayout.jsx      # Desktop-specific layout container (header, sidebar, main)
│   └── DebugPill.jsx          # Floating debug panel (separate React root, 3 tabs: Log/Env/PWA)
├── config/         # Configuration
│   ├── layouts.js        # 26 overlay types (solid, gradients, radial, effects, blends, textures)
│   ├── layoutPresets.js  # 27 layouts with SVG icons and categories
│   ├── stylePresets.js   # Look presets (fonts + filters + overlay effects per layout + text styles)
│   ├── platforms.js      # 40 formats across 18 platform groups (nested: platformGroups + flat: platforms) — spec data sourced from docs/SOCIAL_MEDIA_SPECS.md
│   ├── sampleImages.ts   # CDN manifest URL for sample images (fetched at runtime)
│   ├── themes.js         # 19 color themes with light/dark variants
│   ├── fonts.ts          # 24 Google Fonts (FontEntry interface)
│   ├── textDefaults.ts   # Default text layer state (TextLayer, FreeformBlock interfaces)
│   ├── daisyuiThemes.js  # DaisyUI theme combos (Mono + Luxe, meta colors, defaults)
│   ├── menuIcons.js      # SVG path constants for burger menu and desktop header icons (incl. sun/moon)
│   └── alignment.jsx     # Alignment icon components and option arrays
├── hooks/
│   ├── useAdState.js     # Central state (multi-page, per-cell text, freeformText, layout)
│   ├── useHistory.js     # Undo/redo history management (shallowEqual skips base64)
│   ├── useDarkMode.js    # Dark mode + combo-based DaisyUI theme selection
│   ├── useOnlineStatus.js # Online/offline detection
│   ├── useFocusTrap.js   # Focus trap for BurgerMenu (modals use native <dialog> focus trap)
│   ├── useIsMobile.js    # matchMedia hook: viewport < 1024px (Tailwind lg breakpoint)
│   ├── usePWAInstall.js  # PWA install prompt state (singleton, imports pwaHelpers)
│   ├── usePWAUpdate.js   # PWA update detection state (singleton, imports pwaHelpers)
│   ├── useTheme.js       # ThemeContext wrapping useDarkMode (eliminates prop drilling)
│   ├── useDialogSync.js  # Shared <dialog> open/close sync for DaisyUI modals (4 consumers)
│   ├── useDisclosureFocus.js # Shared focus management for disclosure-pattern components
│   └── useEscapeKey.js   # Reusable Escape key handler for disclosure components
├── utils/
│   ├── cellUtils.js      # Cell counting, shifting, swapping, cleanup utilities
│   ├── designStorage.js  # IndexedDB wrapper for design persistence
│   ├── debugLog.js       # In-memory debug event store (circular buffer, console interception, report generation)
│   ├── exportHelpers.js  # Export capture utilities (captureAsBlob, captureForPdf, waitForPaint)
│   ├── canvasRenderers.js # Canvas rendering helpers (buildFilterStyle, getAlignItems, isDuotoneOverlay)
│   ├── pwaHelpers.js     # Pure PWA utilities (detectBrowser, wasJustUpdated, trackInstallEvent, CHROMIUM_BROWSERS)
│   └── layoutHelpers.ts  # Layout-structure geometry (cellToSection, getFirstCellOfSection, Section interface)
├── App.jsx               # State orchestrator, delegates rendering to ReaderMode/MobileLayout/DesktopLayout
└── main.jsx
```

## Key State Structure

```js
// Multi-page support
// pages[activePage] = null means active page data is at top-level
// pages[otherIndex] = { ...perPageFields } for inactive pages
pages: [null, { images: [...], layout: {...}, text: {...}, ... }]
activePage: 0  // Index of active page

// Per-page fields: activeStylePreset, activeLayoutPreset, images, cellImages,
//   defaultImageSettings, text, layout, padding, frame, textMode, freeformText
// Shared fields: theme, fonts, platform, exportFormat, logo, logoPosition, logoSize

// Text mode: 'structured' (guided text groups) or 'freeform' (per-cell blocks)
// UI labels this as "Guided" / "Freeform" but state value remains 'structured'
textMode: 'structured'

// Freeform text — array of independently styled markdown blocks per cell.
// Content is always parsed as markdown via `marked` — no per-cell toggle.
freeformText: {
  0: [  // Array of block objects per cell
    { id: 'block-xxx', content: 'Hello **world**', color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, spacerAbove: 0, spacerBelow: 0, lineAbove: false, lineBelow: false },
    { id: 'block-yyy', content: 'Second block', color: 'primary', size: 0.8, bold: false, italic: false, letterSpacing: 0, textAlign: null, spacerAbove: 0, spacerBelow: 0, lineAbove: false, lineBelow: false },
  ],
  1: [ /* ... */ ],
}

// Image library - all uploaded images with individual settings including overlay
images: [
  {
    id: 'img-123',
    src: 'data:...',
    name: 'hero.jpg',
    fit: 'cover',
    position: { x: 50, y: 50 },
    filters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
    overlay: { type: 'solid', color: 'primary', opacity: 0 }  // Per-image overlay
  },
]

// Per-cell image assignments (just the image ID - settings are on the image itself)
cellImages: {
  0: 'img-123',  // Maps cell index to image ID
}

layout: {
  type: 'fullbleed' | 'rows' | 'columns',
  structure: [
    { size: 50, subdivisions: 1, subSizes: [100] },  // Section with optional subdivisions
    { size: 50, subdivisions: 2, subSizes: [50, 50] }
  ],
  textAlign: 'center',           // Global horizontal alignment fallback
  textVerticalAlign: 'center',   // Global vertical alignment fallback
  cellAlignments: [{ textAlign, textVerticalAlign }, ...]  // Per-cell overrides
  cellOverlays: {}  // Per-cell overlay settings
  cellBackgrounds: {}  // Per-cell background color override (color key, e.g. 'secondary', 'accent', 'off-white')
}

// Frame settings (colored border using percentage of padding)
frame: {
  outer: { percent: 0, color: 'primary' },  // Outer canvas frame
  cellFrames: { 0: { percent: 50, color: 'accent' } }  // Per-cell frames
}

// Per-cell structured text — each cell has its own text elements
text: {
  0: {  // cell index
    title: {
      content: '...',
      visible: true,
      color: 'secondary',
      size: 1,
      bold: true,
      italic: false,
      letterSpacing: 0,
      textAlign: null,         // Per-element horizontal alignment (null = use cell default)
      textVerticalAlign: null, // Per-element vertical alignment (null = use cell default)
    },
    // ... same structure for tagline, bodyHeading, bodyText, cta, footnote
  },
  1: { title: {...}, bodyText: {...} },  // Another cell
}

// Alignment fallback chain: element.textAlign → cellAlignments[cell] → layout.textAlign
```

## Tab Details (New Workflow-Based UI)

### Presets Tab (formerly Templates)
Entry point for users. Four sections:
- **Platform** - Target size selector (Instagram, TikTok, LinkedIn, print, etc.) — sets canvas dimensions. Shown on mobile only (desktop has platform selector always visible above canvas).
- **Layout** - Grid structure presets with aspect ratio filtering (All, Square, Portrait, Landscape) and category filtering
- **Themes** - 19 preset color themes with light/dark variant toggle + custom color inputs
- **Looks** - Visual effect presets that apply overlay, fonts, and filters without changing layout or colors

### Media Tab
Collapsible sections:
- **Sample Images** - CDN-hosted sample images with category filtering (manifest fetched at runtime from jsDelivr)
- **AI Image Prompt** - Helper for generating AI image prompts
- **Images** - Upload to library, cell selector, assign images to cells, per-image settings (fit, position)
- **Image Overlay** - Per-image overlay controls (type, color, opacity) for selected image
- **Advanced Filters** - Per-image: grayscale, sepia, blur, contrast, brightness
- **Logo** - Upload, position (corners/center), size

### Content Tab
Top-level toggle: **Guided** / **Freeform** (state value remains `'structured'` for backwards compat)

**Guided mode** - Text groups organized by purpose, each in a collapsible section:
- **Title & Tagline** - Paired text elements
- **Body** - Heading + body text
- **Call to Action** - CTA button text
- **Footnote** - Fine print
- Each text element has: visibility toggle, text input, alignment, color, size, bold/italic, letter spacing
- Text alignment controls (horizontal + vertical) per cell — moved from Structure tab

**Freeform mode** - Per-cell multi-block text editors:
- Multiple independently styled markdown blocks per cell (add/remove/reorder)
- Per-block controls: alignment, color, size, bold/italic, letter spacing, spacers, line decorators
- Automatic markdown rendering (content always parsed via `marked`)

### Structure Tab (formerly Layout)
Collapsible sections:
- **Grid** - Layout type (Full/Rows/Columns), interactive grid for editing section/cell sizes, add/remove sections and subdivisions, reorder sections (move up/down for rows, left/right for columns)
- **Pages** - Add, duplicate, reorder, and delete pages for multi-page documents

### Style Tab
Collapsible sections:
- **Typography** - Title font + body font selectors with preview
- **Overlay** - Per-cell overlay controls (stacks on top of image overlay)
- **Spacing** - Global padding + per-cell custom padding, outer frame + cell frames

Note: Color themes are in the Presets tab, not Style.

## Preset Types

| Name | Location | What It Applies | Config File |
|------|----------|-----------------|-------------|
| **Layouts** | Presets → Layout | Grid structure + image/text cell placements (filterable by aspect ratio) | `layoutPresets.js` |
| **Themes** | Presets → Themes | Color scheme with light/dark variants (primary, secondary, accent per variant) | `themes.js` |
| **Looks** | Presets → Looks | Fonts + image filters + overlay (without changing layout or colors) | `stylePresets.js` |
