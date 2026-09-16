# PROJECT.md

## Current State
Plain static portfolio. Root homepage now uses native scrolling with a clockwork cream hero, dark project gallery, About/story disclosure, compact AI team atlas, Uncharted teaser, and contact section. The public Tasks demo uses the current workspace's flat board presentation with the existing session-only sample data.

## Current Goal
Review the completed local homepage redesign and its scroll-linked background depth before publishing. No commit or push has been made.

## Key Decisions
- Preserve the clockwork/celestial identity with ivory, navy, bronze, and teal; show real project interfaces early.
- Keep one navigation/motion controller and native scrolling at every size. No pinned chapters or floating rail.
- Keep content visible without JavaScript. Mobile navigation supports hidden/inert state, Escape, and destination focus.
- Preserve the local ShinyText effect on the name with an 8-second wipe; keep the role line static. Respect reduced-motion and forced-colors preferences.
- Keep parallax limited to decorative background layers: the hero texture, astrolabe, and celestial stars use separate slow amplitudes while foreground content remains stable. Mobile uses smaller offsets and reduced-motion disables transforms.
- Keep the depth stack explicit: translucent underlays use `z-index: 0`, while hero/project content sits at `z-index: 1`; no decorative layer is allowed to become an opaque foreground sheet.
- Use native details for the full biography, preserving all four existing paragraphs.
- Public preview images contain public interfaces or seeded demo data only. Never copy private workspace data or persistence settings into the public demo.
- Capture the Planning Tools landing controls completely and retain the image's natural aspect ratio.

## Active Problems / Limits
- Native OS reduced-motion rendering was not toggled during this review. Its CSS fallback was inspected; an isolated preference fixture exercised the controller's instant-scroll and zero-reveal path.
- External Google Fonts remain optional; local/system font fallbacks are defined.

## Architecture / Important Files
- `index.html`: semantic homepage sections and links; preserved original section IDs plus About and Connect.
- `mainpage_component/profile_style.css`: homepage tokens, layouts, states, responsive and accessibility styles.
- `mainpage_component/profile_motion.js`: navigation, focus, header theme, and optional 480ms reveals.
- `mainpage_component/profile_parallax.js`: small clamped progress/offset helpers used by the single rAF motion controller.
- `library/text/shiny_text/`: existing shared name-wipe component, unchanged.
- `mainpage_component/previews/`: public-safe screenshots with provenance in README.
- `categories/projects/task-planner/tasks.html`: flat board presentation. `tasks.js`: priority attributes and mounted-card entry animation.
- `categories/projects/task-planner/demo-persistence.js`: unchanged memory-only Task 1–6 / Event 1–6 seeds.
- `tests/mainpage.behavior.test.mjs`: CUA-driven mobile behavior regression checks.

## Workflow Rules for Agents
- Read this file before editing; update after meaningful decisions or validation.
- Keep static-site deployment and existing subpage boundaries.
- Preserve user backups and unrelated changes.
- Never store secrets, private workspace content, or sensitive company data.

## Recent Work Log
Newest first.
- 2026-09-16 - Tuned narrow viewport motion and refreshed the profile stylesheet cache key.
  - Changed: The in-app preview runs at 515px, so its mobile branch now uses 72/108/88px amplitudes for texture/astrolabe/stars. Bumped the `profile_style.css` query string so browsers cannot keep the pre-parallax stylesheet, which had no transform declarations.
  - Validation: The depth-layer test failed against the old stylesheet query and lower mobile amplitudes, then passed after the update; live mobile scroll changed the texture from `11.556px` to `-15.772px` and the astrolabe from `-17.334px` to `23.658px` with no overflow.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-16 - Increased the profile background depth after visual review.
  - Changed: Raised the translucent texture/stars contrast, set the astrolabe to `.68` opacity, made the underlay/content stacking order explicit, and increased desktop/mobile parallax amplitudes so the movement reads during normal scrolling.
  - Validation: `profile_depth_layers.test.cjs` reproduced the missing explicit stack before the change and now passes; parallax math and JavaScript syntax checks pass; the live browser reports translucent layer opacities, content above underlays, visible offset changes, and no horizontal overflow.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-16 - Added depth to the profile homepage background.
  - Changed: Added a dependency-free parallax helper and connected the existing motion controller to the hero texture, astrolabe, and celestial stars. Decorative layers overscan their bounds to avoid edge gaps; mobile amplitudes are reduced and the reduced-motion CSS fallback removes transforms.
  - Validation: `profile_parallax.test.cjs` passed; both parallax scripts passed Node syntax checks; the CUA desktop preview showed distinct layer offsets after scrolling; the mobile preview stayed at zero horizontal overflow and passed all 12 homepage behavior checks.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-06 - Implemented the approved homepage redesign and public Tasks presentation refresh.
  - Validation: 12 CUA mobile regression checks passed; no horizontal overflow at 320, 390, and 768px; desktop anchor clearance/theme and all team portraits checked; native story disclosure and no-script fallback checked; name animation computed at 8 seconds. Public task edit/status-change and refresh-reset verified using only sample tasks.
  - Fixed during review: WebKit focusout prematurely closing menu links; doubled anchor offsets; truncated Planning Tools hero snapshot.
  - No commit, push, or deployment.
- 2026-08-27 - Completed portfolio story/effect handoff validation:
  - Changed: Recorded the four-paragraph My Story refresh with semantic emphasis, the AIS green-to-white gradient, the retained local vanilla ShinyText library, `CHATCHON` at 6.4 seconds, the hero role line at 3.2 seconds, root-only ASCII ripple removal with task-planner subpage preservation, and the validation/no-commit/no-push state.
  - Validation: Static checks, ShinyText syntax, Graphify update, browser smoke, and reduced-motion browser smoke completed for the Task 4 handoff.
  - Next: Human review; no commit or push was made.
- 2026-07-04 - Added Task Planner public demo:
  - Changed: Added a `Task Planner` DEMO card between Radio Planning Tools and CodeSnippet, created `categories/projects/task-planner/`, copied the real Tasks and Calendar pages into the demo bundle, and replaced workspace-file persistence with memory-only seeded demo data (`Task 1` through `Task 6`, `Event 1` through `Event 6` with category tags).
  - Validation: JavaScript syntax checks passed, HTTP smoke returned 200 for demo home/tasks/calendar, browser automation confirmed task edit/reset, task drag/reset, calendar event edit/reset, seeded event/task labels, zero console errors, and no mobile horizontal overflow on the Tasks page.
  - Next: After the public demo is accepted, create the downloadable local ZIP package with empty/sample `data/workspace-data.js`.

- 2026-06-20 - Applied Claude Opus 4.8 GSAP diagnosis fixes:
  - Changed: Re-enabled pinned chapter mode by replacing the impossible height guard, removed duplicate nav handling from `profile_motion.js`, taught inline nav to use ScrollTrigger positions, isolated `updateAtmosphere()` from chapter mode, restored smooth-scroll fallback, gated the rail on chapter mode, and made reveal content safe/visible while GSAP animates components.
  - Validation: `node --check` passed; browser smoke confirmed desktop `chapter-mode-active` with 4 pinned sections, chapter rail visible only in chapter mode, nav/chapter-dot jumps target ScrollTrigger positions, mobile has 0 pins and hidden rail, reduced motion has 0 pins and no hidden reveal content. Browser console still reports blocked Google Fonts due restricted network; this is pre-existing external font loading, not a GSAP runtime error.
  - Next: Human visual review for pacing; defer low-risk cleanup like unused GSAP plugin deletion unless requested.

- 2026-06-20 - Stabilized the broken desktop homepage after the GSAP chapter rollout:
  - Changed: Added a guard in `mainpage_component/profile_motion.js` so pinned desktop chapters only activate when every section fits within a single viewport; otherwise the homepage falls back to natural scroll.
  - Validation: Local `http.server` on port 8123, browser automation at `http://127.0.0.1:8123/index.html`, desktop verification that `chapter-mode-active` no longer activates for the tall live sections, and mobile fallback check at 390x844.
  - Next: Human visual review to decide whether to redesign the homepage into true single-screen chapters later or keep the stabilized natural-scroll behavior.
- 2026-06-19 - Implemented GSAP chapter scroll layer:
  - Changed: Added local GSAP script loading, `profile_motion.js`, chapter rail, desktop pinned chapters, mobile/reduced-motion fallback, and public-safe AI Team homepage copy.
  - Validation: `node --check` passed for `profile_motion.js`, local `http.server` returned HTTP 200 for `/index.html`, static searches confirmed local GSAP paths plus removal of stale public wording, and Chrome smoke checks passed for desktop pinned chapters, mobile non-pinned navigation, reduced-motion readability, and no horizontal overflow.
  - Next: Human visual review for final pacing and taste.
- 2026-06-19 - Planned GSAP chapter scroll redesign:
  - Changed: Added project memory for the static homepage.
  - Validation: Pending implementation validation.
  - Next: Implement local GSAP scripts, chapter rail, pinned desktop motion, reduced-motion/mobile fallback.

## Detailed Notes
- None yet.
