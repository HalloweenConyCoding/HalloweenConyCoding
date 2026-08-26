# Cony Workspace Local Effect Library

## Current State
This retained library is the local vanilla ShinyText effect used by the portfolio hero.

The active assets require no React, Vite, shadcn, npm, or local server. The browser loads the CSS and JavaScript directly from the static project.

## Current Goal
Keep the small retained effect surface clear and local to the portfolio hero.

## Project Memory Companion Notes
Use this file as the entrypoint and summary. Create companion notes only when this folder grows beyond the current small-library shape.

## Key Decisions
- Package reusable effects as vanilla browser globals so file-backed pages can load them with normal `<script src="...">` tags.
- Retain `text/shiny_text/shiny_text.css` and `text/shiny_text/shiny_text.js` as the hero effect assets.
- Keep the library limited to the approved ShinyText assets; deleted pasted effects are historical context only and are not active paths.

## Active Problems
- None known.

## Architecture / Important Files
- `text/shiny_text/shiny_text.css` - local vanilla ShinyText styles used by the portfolio hero.
- `text/shiny_text/shiny_text.js` - local vanilla ShinyText browser behavior and auto-initializer.

## Preferences / Upgrade Notes
- Prefer local, no-build, no-server HTML/CSS/JS usage for effects intended to be dropped into file-backed Cony Workspace pages.

## Workflow Rules for Agents
- Read this file before planning or editing this library folder.
- Preserve no-build usage unless Beer explicitly asks for a React/Vite package.
- Validate WebGL pages with a browser smoke check after shader or render-loop edits.

## Recent Work Log
Newest first.

- 2026-08-26 - Portfolio library cleanup:
  - Changed: Retained the local vanilla ShinyText CSS and JavaScript assets plus this project manifest; removed unrelated pasted effects and the ShinyText usage page.
  - Validation: Recursive remaining-file check, retained-path existence check, approved-deletion absence check, and target-source reference scan.
  - Next: Wire the retained ShinyText effect into the portfolio hero.

- 2026-07-16 - Shared mini-calendar time-wheel scrollbar fix:
  - Changed: `component/mini_calendar/mini-calendar.css` keeps `.cony-mini-calendar-timecol` scrollable with `overflow-y:auto` while hiding the visual scrollbar cross-browser.
  - Validation: Shared contract and active 8/8 test passed.

- 2026-07-16 - Shared mini calendar portal-theme fallback fix:
  - Changed: `component/mini_calendar/mini-calendar.css` gives `.cony-mini-calendar-panel` local fallback tokens, and `component/mini_calendar/mini-calendar.js` syncs computed `--cony-mini-calendar-*` values from the mounted host to both portaled panels on mount/open so backgrounds and theme stay visible.
  - Validation: Bundled Node syntax and shared mini-calendar contract pass; active 8/8 and RF 43/43 pass.

- 2026-07-16 - Shared mini-calendar portaled-panel hidden-state regression fix:
  - Changed: `component/mini_calendar/mini-calendar.css` now explicitly hides `.cony-mini-calendar-panel[hidden]` because the date and time panels are portaled to `document.body`, so the native `hidden` attribute no longer inherits through the original subtree.
  - Validation: Focused contract/regression tests passed for the shared mini-calendar panel behavior.

- 2026-07-16 - Shared mini calendar cwd-safe contract runner:
  - Changed: `component/mini_calendar/mini-calendar.test.mjs` now resolves `mini-calendar.js` from `import.meta.url`, so the shared contract test runs from either the `Cony-Workspace` root or the sibling `CONY-AGENT-TEAM` root without cwd coupling.
  - Validation: Bundled Node contract test passed from both working directories; `VERSION/ACTIVE/verify.mjs` now calls the shared contract test through an absolute repo-root-safe path.

- 2026-07-16 - Shared mini calendar empty/live-clock contract coverage:
  - Changed: Extended `component/mini_calendar/mini-calendar.test.mjs` with deterministic fake-clock coverage for mounting with empty date/time, initial empty payload/null timestamp, and the live-clock current-month plus `is-today` path.
  - Validation: Bundled Node `--check` passed for `component/mini_calendar/mini-calendar.js` and `component/mini_calendar/mini-calendar.test.mjs`; bundled Node contract test `component/mini_calendar/mini-calendar.test.mjs` passed; `git diff --check -- library/component/mini_calendar library/PROJECT.md` planned for closeout.
  - Next: Keep production behavior unchanged unless a future review identifies a real empty-state UX bug rather than a coverage gap.

- 2026-07-16 - Shared mini calendar component:
  - Changed: Added `component/mini_calendar/mini-calendar.js`, `mini-calendar.css`, `usage.html`, `README.md`, and `mini-calendar.test.mjs` as a reusable vanilla month-grid plus 24-hour wheel picker under `window.ConyMiniCalendar.mount(...)`.
  - Validation: Planned Task 1 contract flow uses the bundled Node runtime with `node --check library/component/mini_calendar/mini-calendar.js` and `node library/component/mini_calendar/mini-calendar.test.mjs`.
  - Next: Calendar and RF Analyzer can load the local component without adding persistence or page coupling.

- 2026-07-06 - Reusable galaxy library:
  - Changed: Added `background/galaxy/galaxy-bg.js`, `background/galaxy/galaxy-example.html`, and `background/galaxy/galaxy-standalone.html`.
  - Validation: `node --check background/galaxy/galaxy-bg.js`; Chrome headless smoke of `background/galaxy/galaxy-example.html` and `background/galaxy/galaxy-standalone.html` rendered the WebGL Galaxy background.
  - Next: Use `ConyGalaxy.create(...)` from target pages.

- 2026-07-06 - Reusable dither library:
  - Changed: Added `background/dither/dither-bg.js` and `background/dither/dither-example.html`; kept `background/dither/dither-standalone.html`.
  - Validation: `node --check background/dither/dither-bg.js`; Chrome headless smoke of `background/dither/dither-example.html` rendered the WebGL dither background.
  - Next: Use `ConyDither.create(...)` from target pages.
