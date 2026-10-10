# Observatory Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution, or superpowers:subagent-driven-development if the user chooses delegation. Steps use checkbox syntax for tracking.

**Goal:** Build a complete, reviewable first version of Beer's portfolio with a scroll-driven journey from an ancient clock to an antenna station, coding workspace, and astronomy terrace.

**Architecture:** Semantic HTML sits above one decorative Three.js canvas. One controller measures native document scrolling and drives a smooth camera route through a procedurally constructed observatory. Responsive layouts and rendering fallbacks preserve the content independently of 3D rendering.

**Tech Stack:** HTML, CSS, browser ES modules, Three.js 0.160.1, Node's built-in test runner, Python Playwright, and existing Chromium. No React, bundler, or backend.

**Spec:** `mainpage_version/ACTIVE/docs/2026-10-10-observatory-design.md`

## Global Constraints

- Create the new page at `mainpage_version/ACTIVE/index.html`; leave root `index.html` and all existing application files and tests unchanged.
- Use the existing isolated checkout; do not create a worktree unless explicitly requested.
- Keep all new implementation, tests, runtime assets, and documentation inside ACTIVE. Documentation already approved and committed: `3a4e68a`.
- Four chapters: Time, Connection, Creation, Discovery. One connected ancient observatory with modern equipment.
- Use weathered bronze, stone, ivory text, navy skies, and restrained teal illumination.
- Preserve native scrolling, semantic content, existing project destinations, biography, skills, team access, and contact.
- Initial models use simple geometry; imported models, dynamic shadows, postprocessing, elaborate shaders, and pointer parallax are deferred.
- Pixel-ratio cap: 1.5 desktop and 1 on narrow screens. Honor reduced motion, forced colors, unavailable WebGL, and hidden-document state.
- Acquire the pinned runtime with package integrity verification intact and retain its MIT license and provenance.
- No GitHub push, deployment, publication, or homepage routing changes in this implementation.
- Known existing test mismatch: `tests/task-planner-connection.test.cjs:66` expects the former Tasks icon. Report this separately; do not change it.

## Review Focus

- Opening a deep link or restoring scroll must show the correct camera view without first flying from the intro: Task 3 browser checks.
- A phone rotation or layout change must preserve readable content and recompute the route: Tasks 1 and 3 browser checks.
- Missing runtime assets, failed WebGL initialization, or context loss must retain usable links and content: Task 4 browser checks.
- Motion preferences changed while the page is open must stop animation and camera travel immediately: Task 4 browser checks.
- Nested GitHub Pages paths must resolve assets and subpage links without origin-root assumptions: Tasks 1 and 4 checks.

## Files and interfaces

Paths below are relative to `mainpage_version/ACTIVE/`.

| File | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | Four-chapter semantic portfolio and responsive reading layout |
| `js/camera-path.mjs` | Dependency-free scroll mapping, camera interpolation, and damping |
| `js/world.mjs` | Landmark construction, lighting, and clock animation |
| `js/main.mjs` | Navigation, renderer lifecycle, camera integration, and preference handling |
| `assets/vendor/three.module.js`, `LICENSE.three.txt`, `PROVENANCE.md` | Verified pinned runtime, license, and acquisition record |
| `tests/camera-path.test.mjs` | Meaningful route-boundary, reversal, layout, and time-step checks |
| `tests/browser-smoke.py` | Browser functional checks and screenshot capture |
| `README.md` | Local viewing, checks, architecture, portability, and limitations |

Browser state: set `document.documentElement.dataset.renderMode` to `loading`, `webgl`, or `fallback`; update only after the corresponding state is established. Treat the canvas as decorative with `aria-hidden="true"` and `pointer-events: none`. Browser checks inspect actual renderer output as well as this state; the state alone is insufficient.

### Task 1: Readable four-chapter page

**Files:** Create `index.html`, `styles.css`, and `tests/browser-smoke.py`.

**Consumes:** Existing root content and public subpages, read-only. **Produces:** chapter elements `#intro`, `#telecom`, `#coding`, and `#explore`, each with `data-chapter`; canvas `#world`; accessible chapter navigation.

- [x] Add browser checks asserting exactly four chapters, one main landmark, a name heading, preserved biography and skills, visible contact links, and real anchor destinations. Before creating the entry, run the checks and confirm the missing page fails.
- [x] Create the HTML content and CSS layout. Intro carries the biography disclosure; Telecom carries Radio Planning Tools; Coding carries Task Planner, CodeSnippet, skills, and the AI team link; Explore carries creative interests and contact. Use the public-safe Task Planner description from its actual landing page.
- [x] Resolve existing repo destinations relative to ACTIVE: `../../categories/...` and `../../mainpage_component/previews/...`. Keep external destinations unchanged. Use system fonts initially and CSS fallback atmosphere; essential viewing requires no external font service.
- [x] Test at 1440×900, 390×844, and 320×740 with JavaScript disabled. Assert all essential content and links remain usable, all local references resolve, and `document.documentElement.scrollWidth <= innerWidth`. Test portrait-to-landscape resize.
- [x] Run from the repository root: `python3 -m http.server 8123 --bind 127.0.0.1`. Then run `python3 mainpage_version/ACTIVE/tests/browser-smoke.py --phase content`. Expected: explicit nonzero executed check count, zero failures. Commit only Task 1 files after reviewing the diff.

### Task 2: Pure camera route

**Files:** Create `js/camera-path.mjs` and `tests/camera-path.test.mjs`.

**Consumes:** measured chapter start positions, current `scrollY`, maximum document scroll, viewport shape. **Produces:** `progressFor(scrollY, chapterStarts, maxScroll) -> number`; `sampleCamera(progress, narrow) -> {position: number[3], target: number[3], fov: number}`; `damp(current, target, dtSeconds) -> number`.

- [x] Write failing Node tests. Assert `progressFor(0,[0,1000,2000,3000],4000) === 0`, `progressFor(2000,[0,1000,2000,3000],4000) === 0.5`, and `progressFor(4000,[0,1000,2000,3000],4000) === 1`. Test clamped overscroll, reverse traversal, short documents, duplicate starts, and measurements changed after resize.
- [x] Add camera tests for exact endpoint states, finite intermediate samples, continuous position and target across chapter boundaries, and narrow-screen composition. Compare damping over one second at 30 and 60 time steps within `1e-6` tolerance; assert `dtSeconds === 0` preserves the current value.
- [x] Run `node --test mainpage_version/ACTIVE/tests/camera-path.test.mjs`; confirm failures arise from missing implementation before adding it.
- [x] Implement monotonic measured progress, smooth position/target interpolation, and exponential time-based damping with a 0.18-second response constant. Use five route states: clock close `(8,6,14) -> (0,5,0)`, courtyard/station `(22,9,12) -> (20,6,-4)`, raised station/workspace approach `(27,7,-12) -> (36,3,-15)`, telescope terrace `(49,5,-20) -> (52,4,-29)`, and sky finish `(53,7,-24) -> (54,17,-45)`. Position precedes target; starting FOV is 48 degrees desktop and 58 narrow. Adjust these values only when browser composition or collision checks demonstrate a need, recording the reason.
- [x] Run the Node suite and confirm every test executes and passes. Commit only the camera module and its test file.

### Task 3: World and scroll integration

**Files:** Create `js/world.mjs`, `js/main.mjs`, vendor runtime/license/provenance; update the new entry and browser checks.

**Consumes:** Task 1 DOM and Task 2 camera APIs. **Produces:** `createWorld() -> {scene, update(dtSeconds), dispose()}` from `world.mjs`; `main.mjs` owns one renderer, perspective camera, and scheduler.

- [x] Add failing browser checks for successful WebGL mode, a rendered image distinct from the CSS fallback, four landmark groups, distinct views at chapter anchors, reverse-scroll restoration, keyboard destination focus, and direct hash load/reload at Coding. Confirm these checks fail before integration.
- [x] Acquire `three@0.160.1` using npm's normal verified package acquisition in a temporary directory outside the checkout. Retain only `build/three.module.js` and `LICENSE` inside ACTIVE. Record version, registry integrity metadata, local SHA-256, and source in `PROVENANCE.md`. If integrity or TLS checks fail, diagnose without disabling verification. No root manifest or lockfile changes.
- [x] Implement the world: clock at `(0,0,0)`, station at `(20,0,-4)`, open workspace at `(36,0,-15)`, telescope at `(52,0,-29)`, and distant sky objects beyond the terrace. Name landmark groups `clock`, `station`, `workstation`, and `telescope`. Use shared materials, static lights, open architecture, and a small generated canvas texture containing only illustrative code. The update API animates subtle clock movement; dispose releases owned geometry, textures, and materials.
- [x] Implement the single controller. Measure chapters after layout, drive the camera from Task 2, initialize from current scroll, and recompute on resize/layout changes. Interpolate the viewing target separately from camera position. Apply pixel-ratio caps at a narrow breakpoint of 700 CSS pixels. Keep native anchor behavior with accessible destination focus and respect reduced motion in navigation. Do not import the root homepage controller.
- [x] Run the Node suite and `python3 mainpage_version/ACTIVE/tests/browser-smoke.py --phase journey`. Use headless Chromium with supported software WebGL if required by the cloud host, and report that limitation. A WebGL failure must fail the normal-rendering check even if fallback works.
- [x] Capture and inspect screenshots at every landmark for desktop and mobile. Check the full route between landmarks for wall/geometry collisions, text overlap, and abrupt turns. Store review images outside the checkout under `/tmp/observatory-review/`. Correct composition, rerun affected checks, and commit only the new version's Task 3 files.

### Task 4: Resilience, performance, and review package

**Files:** Update `js/main.mjs`, `styles.css`, and browser checks; create `README.md`.

**Consumes:** functioning journey from Task 3. **Produces:** validated fallback/lifecycle behavior and portable development instructions.

- [x] Add failing checks for blocked Three.js requests, forced WebGL initialization failure, context loss, initial and dynamically changed reduced-motion preferences, forced colors, and hidden-document state. Assert usable HTML, no uncaught errors, stationary camera in reduced motion, decorative canvas hidden in forced colors, and no frame scheduling while hidden.
- [x] Implement renderer initialization/error handling, context-loss fallback, preference listeners, visibility suspension, and cleanup. When motion is reduced, draw a stable clock view without decorative movement. Rendering resumes after visibility returns only if needed; keep one scheduler and avoid continuous work when camera and scene animation are idle.
- [x] Complete browser checks for mobile navigation, keyboard links, nested-path assets, new page console errors, and every local project destination. Record normal-rendering and fallback results separately. Capture available frame timing and renderer object counts as cloud observations, not real-phone performance guarantees.
- [x] Write README commands for serving from the repository root and checking `/mainpage_version/ACTIVE/`, running Node and browser tests, refreshing the verified vendor dependency, and understanding the module responsibilities. Explain that no build step is needed, GitHub Pages must serve the nested path, and physical-phone review and detailed artwork remain later work.
- [x] Run `node --test mainpage_version/ACTIVE/tests/camera-path.test.mjs` and `python3 mainpage_version/ACTIVE/tests/browser-smoke.py --phase all`; expected: all new checks execute and pass. Run existing `node --test tests/*.test.cjs`; expected baseline is three passing files and the known icon assertion failure, with no new failures. Preserve runner exit codes.
- [x] Verify `git diff 3a4e68a -- index.html mainpage_component library categories tests PROJECT.md` is empty. Inspect all new source and screenshots, verify asset/license provenance, and address findings before claiming completion. Commit only ACTIVE files; do not push or publish. Report the new page, checks, known existing failure, rendering limitations, and remaining visual polish.

## Execution handoff

Recommended execution: native, with the assistant implementing the four tasks in this session. The tasks share camera, layout, and scene interfaces, and the first deliverable is a contained prototype; native execution keeps that context together. Delegated implementation is available only if the user chooses it. Review this plan before execution; approval of the earlier design did not review this newly written plan.
