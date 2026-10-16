# Fixed-zone Scrollytelling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage into three fixed scroll-driven zones with reversible scenes and smooth continuous theme handoffs.

**Architecture:** A focused story controller owns pins, foreground scene transforms, scene accessibility, and zone tints. The existing controller retains navigation, menu, and decorative parallax, delegating anchor resolution and header tone to the story controller when active. A pure progress model defines scene intervals and supports deterministic tests; native flow is the baseline.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, checked-in GSAP/ScrollTrigger, Node built-in test runner, existing CUA browser checks.

**Spec:** `docs/superpowers/specs/2026-10-09-fixed-zone-scrollytelling.md`

## Global Constraints

- Edit the current checkout; preserve `backup/` and unrelated changes.
- Scope is the root profile homepage; do not change project subpages.
- Use checked-in GSAP and ScrollTrigger; no CDN or new runtime dependency.
- Keep native scroll; no wheel interception, scroll snapping, or simulated scroll position.
- Preserve existing section IDs, links, biography paragraphs, public preview assets, and the 8-second name wipe.
- Use approved public or demo imagery only; do not copy private workspace data.
- Maintain one continuous fixed wallpaper, independent decorative parallax layers, and viewport-wide color filters.
- Keep content readable without JavaScript, without GSAP, with reduced motion, and with forced colors.
- Do not commit, push, or deploy without user authorization.

Model addendum: ProfileStoryModel.workbenchPhase(localProgress) returns the 40/40/20 enter/hold/exit partition for the workbench copy. It is separately tested from the shared scene transition partition.

## Review Focus

1. Short screen, zoom, or enlarged fonts: scenes fall back rather than clipping (Task 2).
2. Small reverse scroll and monotonic boundary crossing: theme does not blink and settled cards remain still (Task 3).
3. Direct hash, history, or restored scroll: intended scene is visible and focusable after geometry refresh (Task 4).
4. Focus held in an outgoing scene and expanded biography: controls never become invisible with focus inside (Task 4).
5. Resize or live accessibility preference changes during a pin: teardown restores readable flow without spacers or overflow (Task 4).

---

## File map and shared interfaces

- Modify `index.html`: stage/scene wrappers, scene controls, script order and cache versions; preserve content and section IDs.
- Modify `mainpage_component/profile_style.css`: enhancement-only stage layout, scene placement, fallback and focus styles.
- Create `mainpage_component/profile_story_model.js`: pure progress/geometry model, UMD export for browser and CommonJS tests.
- Create `mainpage_component/profile_story.js`: runtime lifecycle, pin timelines, accessibility and navigation integration.
- Modify `mainpage_component/profile_motion.js`: remove competing foreground/tint writers in story mode; retain menu and background parallax.
- Create `tests/profile_story_model.test.cjs`: real Node behavioral assertions for the model.
- Create `tests/profile_story.behavior.test.mjs`: CUA behavioral checks, exporting `runStoryChecks(tab)`; execute in a browser, not merely `node --test`.
- Modify `tests/profile_depth_layers.test.cjs`: replace obsolete reveal/timing contracts with current asset/layout contracts.
- Preserve `tests/mainpage.behavior.test.mjs` mobile checks; extend only if the fallback changes its observed behavior.
- Update `PROJECT.md` and `docs/project-memory/MOTION_TRANSITION_QA.md` after validation.

Model interface: `ProfileStoryModel.sample(zone, progress)` → `{scene, phase, localProgress}`; zone is `intro|collection|contact`, progress clamped to [0,1], scene is `intro|radio|tools|workbench|team|horizon|contact`, phase is `enter|hold|exit`. `tone(scrollY, collectionStart, contactStart, height)` → `{intro, contact, light}` with values [0,1]. `headerTheme(light, previous)` → `paper|night`. `eligible(width, height, maxSceneHeight, reduced, forcedColors)` → boolean. `anchorProgress(id)` → `{zone, progress}` for the six existing section IDs plus `story-tools`, or null for an unknown ID.

Runtime interface: `window.ProfileStory.init({onTone})` → controller with `isActive(): boolean`, `navigate(id, {focus, instant}): boolean`, `refresh(): void`, `destroy(): void`. `navigate` returns false in fallback so the caller uses existing native anchor behavior. `onTone({light})` supplies the model tone to the existing header controller. Runtime initialization is synchronous; deferred refresh follows font/image readiness. Use the current header height to calculate H.

### Task 1: Deterministic story model

The workbench-specific text rhythm uses workbenchPhase and must not reuse the scene's generic 25/55/20 partition.

**Files:** Create model and Node tests listed above.

**Interfaces:** Produces `ProfileStoryModel` exactly as defined in the shared interfaces; no DOM or GSAP dependencies.

- [x] Write tests asserting B scene boundaries 0/.20/.40/.68/.88/1, entrance/hold/exit partitions, workbench 40/40/20 split, A starts in hold and exits at .80, C holds after .25, and clamping at negative/over-one inputs.
- [x] Add tests asserting intro/contact tone endpoints at boundary−.35H and boundary+.65H, monotonic smooth interpolation, header retention between .35 and .65, and eligibility at width 1024, H 640, maxSceneHeight H−24.
- [x] Run `node --test tests/profile_story_model.test.cjs`; expect failure because the model is absent.
- [x] Implement the model exports, smoothstep tone interpolation, and anchor mapping to readable hold starts. `#celestial` selects Radio and `#story-tools` selects tools; remaining IDs map to their matching scenes. Test all seven mappings and null for unknown IDs.
- [x] Run the same command; require all assertions passing. Review diff as the task checkpoint; no commit.

### Task 2: Semantic stage structure and capacity fallback

**Files:** Modify `index.html`, `profile_style.css`; create `profile_story.js` and browser test module.

**Interfaces:** Consumes `eligible(...)`; produces `ProfileStory.init(...)` and lifecycle methods. Navigation and tone callback can remain inactive until later tasks, returning false for navigation.

- [x] Add browser checks for exactly three stages, preserved six destinations, all five collection scenes, original links/biography, and visible flow when story enhancement is disabled. Assert no horizontal overflow at widths 390 and 1440.
- [x] Run checks on the existing page; expect failure on missing stage/scene structure. Record actual browser output.
- [x] Add wrappers without duplicating original content. Radio and the two tool cards become separate archive scenes while retaining `#celestial`; give the paired tools scene `id="story-tools"` and `tabindex="-1"`. Add previous/next controls traversing all seven scenes and scene status to each enhanced stage. Keep controls hidden in fallback.
- [x] Implement initialization, measured capacity checking, class activation only after successful setup, and complete destroy cleanup. Load model then runtime before existing motion controller; keep checked-in GSAP ahead of runtime.
- [x] Add/run capacity checks at 1440×900, 1024×600, 390×844, and oversized-scene fixture; assert short/oversized scenes use native flow with all text reachable. Check at 200% browser zoom manually. Require passing browser output and Node model tests; checkpoint diff without commit.

### Task 3: Scroll timelines and continuous atmosphere

**Files:** Modify `profile_story.js`, `profile_motion.js`, `profile_style.css`, and story browser checks.

**Interfaces:** Consumes model sampling/tone; implements `onTone({light})`. Existing header uses `headerTheme(light, previous)` during active story mode; legacy behavior remains exclusively in fallback.

- [x] Add browser assertions for scene positions/opacity at entrance, hold and exit, identical settled values after forward/backward traversal, and unchanged tool-card x throughout holds. Add boundary samples for monotonic tone and at most one header switch per one-way crossing; reverse jitter inside the hysteresis band must retain state.
- [x] Run these checks before motion implementation; the initial check failed because the runtime was defined but never initialized.
- [x] Build one scrubbed timeline per zone using A=1.5H, B=8H, C=1H, scrub .6, and the spec intervals. Pin stages below measured header, with no nested pins. Apply the requested directional entrances, Radio-only <=6px settlement, sequential workbench text and concurrent right card. Use exact settled transforms, no timed replay reveals.
- [x] Integrate atmosphere tone with a single writer and broad handoff ranges. Remove/bypass legacy GSAP and WAAPI reveals on story-owned scenes and legacy tint writers while active. Retain existing decorative parallax. Ensure initial intro opacity is 1 and contact remains visible at bottom.
- [x] Run browser checks and inspect screenshots at both handoffs and bottom: no tint edges, uncovered wallpaper, horizontal movement during holds, or duplicate animation writes. Run model tests and `node --test tests/profile_parallax.test.cjs`; require passes. Checkpoint diff without commit.

### Task 4: Navigation, focus, biography and lifecycle

**Files:** Modify runtime, existing motion controller, and browser checks.

**Interfaces:** Completes `navigate(id, {focus, instant})`, `refresh()`, `destroy()`; existing hash/menu handlers call `navigate` first and use native behavior only when false.

- [x] Add browser checks for each direct hash, previous/next navigation, history back/forward, a restored mid-page load, and keyboard focus on matching destinations. Assert inactive scenes are inert and no focused descendant is hidden.
- [x] Add tests for focused outgoing link during pointer scroll, biography expansion, and live resize eligibility changes. Assert original focus survives, all biography paragraphs are reachable, pin spacers are removed on teardown, and width never exceeds the viewport. The browser harness cannot emulate live reduced-motion/forced-colors toggles; model eligibility, runtime change listeners, and CSS fallback contracts are covered instead.
- [x] Run the checks before lifecycle integration; navigation and biography position assertions exposed gaps that were corrected before final validation.
- [x] Implement refresh-aware anchor geometry using zone trigger start plus budget×anchor progress; map existing section IDs, preserve native history semantics, and focus destinations after scrolling. Previous/next controls use the same mapping.
- [x] Implement active-scene inert state, focus retention policy from the spec, and biography opening that switches permanently to flow for that visit. Preserve the summary's pre-toggle screen position during teardown, keep native details, and never automatically repin on collapse.
- [x] Implement resize rebuild preserving scene/local progress, font/image refresh, initial hash/restoration reconciliation, and preference-driven teardown. On initialization errors remove owned styles and reveal all content.
- [x] Run the browser lifecycle/navigation checks plus `runMobileChecks(tab)` from the existing helper. Require explicit passing outputs, not just successful module loading. Checkpoint diff without commit.

### Task 5: Integrated review and project record

**Files:** Modify `tests/profile_depth_layers.test.cjs`, `PROJECT.md`, `docs/project-memory/MOTION_TRANSITION_QA.md`; adjust homepage files only for verified defects.

**Interfaces:** No new runtime interface; validates complete Tasks 1–4 against the spec.

- [x] Replace superseded static timing assertions with local-runtime, continuous-wallpaper and enhancement-fallback contracts. Retain independent depth and public asset/privacy checks.
- [x] Run `node --test tests/profile_story_model.test.cjs tests/profile_parallax.test.cjs tests/profile_depth_layers.test.cjs`, syntax-check both new scripts and `profile_motion.js`, and run `git diff --check`; require zero failures. (Focused suite: 11/11; syntax and diff checks clean.)
- [x] Execute desktop, mobile, navigation, focus, biography, live resize, motion traversal, and contact-bottom browser suites on a local server; inspect representative screenshots and record checks that could not be emulated. (Focused scene-retention follow-up: 4/4; direct media-preference toggles unavailable.)
- [x] Review code paths for single property ownership, pin teardown, opacity/filter coverage, content preservation, and private-data exclusion. Report the unavailable live media-preference toggle check as a limitation. (Found and fixed a focused outgoing scene whose descendant opacity still followed the GSAP exit; the new browser check verifies computed opacity until focus leaves.)
- [x] Update project goal/architecture and replace the old no-pinning rule with the responsive policy. Record motion ownership, measured geometry, hysteresis, capacity fallback, and focus lessons in the motion QA document. Preserve backups and unrelated changes; no commit/push/deploy.

## Plan self-review

Spec coverage: stage structure/capacity → Task 2; scene directions/holds/reversal and atmosphere/header → Task 3; keyboard/hash/history/biography/preferences → Task 4; privacy, fallback and recorded validation → Task 5. Shared interface names are consistent across tasks. All five Review Focus cases have assigned browser checks. Scope stays within the root homepage and existing approved assets.

## Execution handoff

Native inline execution selected by the user. These five tasks share one motion controller and geometry contract, so implementing them in one session reduces interface drift.
