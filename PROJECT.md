# PROJECT.md

## Current State
Plain static portfolio. Root homepage now uses native scrolling with a clockwork cream hero, dark project gallery, About/story disclosure, compact AI team atlas, Uncharted teaser, and contact section. The public Task Planner entry is now a privacy-first Public Workspace flow with an editorial cream/pastel landing page, local workspace template download, public-safe Tasks and Calendar pages synchronized from the latest Cony Workspace structure, and a local file connection gate that keeps editing locked until write permission is granted. The profile's three semantic zones now use local GSAP/ScrollTrigger for slow tint crossfades and reversible project-card entrances.

## Current Goal
Review the completed local homepage redesign and its scroll-linked background depth before publishing. No commit or push has been made.

## Key Decisions
- Preserve the clockwork/celestial identity with ivory, navy, bronze, and teal; show real project interfaces early.
- Keep one navigation/motion controller and native scrolling at every size. No pinned chapters or floating rail. Local GSAP/ScrollTrigger is progressive enhancement only; the page remains readable if the library is unavailable.
- Keep content visible without JavaScript. Mobile navigation supports hidden/inert state, Escape, and destination focus.
- Preserve the local ShinyText effect on the name with an 8-second wipe; keep the role line static. Respect reduced-motion and forced-colors preferences.
- Keep parallax limited to decorative background layers: the astrolabe and fixed atmosphere use separate slow amplitudes while foreground content remains stable. The intro and collection use only the fixed wallpaper plus zone filters; no clipped section-local picture is layered over it. Mobile uses smaller offsets and reduced-motion disables transforms.
- Keep the depth stack explicit: translucent underlays use `z-index: 0`, while hero/project content sits at `z-index: 1`; no decorative layer is allowed to become an opaque foreground sheet.
- Use a fixed atmospheric root inspired by the Radio Planning Tools page: independent grid, texture, star, nebula, generated galaxy, orbit-clock, gradient, and dust layers use capped per-viewport scroll travel at different speeds, while section-local accents retain their own progress.
- Use native details for the full biography, preserving all four existing paragraphs.
- Public preview images contain public interfaces or seeded demo data only. Never copy private workspace data or persistence settings into the public demo.
- Capture the Planning Tools landing controls completely and retain the image's natural aspect ratio.
- Public Workspace uses only a blank generated `workspace-data.js` template (`tasks: []`, `calendarNotes: {}`); never copy the private Cony Workspace data file into this repository.
- Keep the Public Workspace landing page editorial and lightly alive: thin rules over cards, restrained pastel accents, local ShinyText, and motion that respects reduced-motion and forced-colors preferences.
- Public Workspace Tasks and Calendar may copy current public-safe page logic and reusable components from Cony Workspace, but must not copy workspace data, machine-specific paths, private task labels, or unrelated private navigation.
- Public Workspace starts with empty Tasks and Calendar data. The local `workspace-data.js` picker and bottom-left status control are the only path to editing; the persistence layer preserves unrelated sections when writing back.

## Active Problems / Limits
- Native OS reduced-motion rendering was not toggled during this review. Its CSS fallback was inspected; an isolated preference fixture exercised the controller's instant-scroll and zero-reveal path.
- External Google Fonts remain optional; local/system font fallbacks are defined.

## Architecture / Important Files
- `index.html`: semantic homepage sections and links; preserved original section IDs plus About and Connect.
- `mainpage_component/profile_style.css`: homepage tokens, layouts, states, responsive and accessibility styles.
- `mainpage_component/profile_motion.js`: navigation, focus, header theme, native parallax, GSAP zone tint crossfades, and card reveals.
- `mainpage_component/gsap/`: checked-in GSAP and ScrollTrigger runtime used without a CDN.
- `mainpage_component/profile_parallax.js`: small clamped progress/offset helpers used by the single rAF motion controller.
- `library/text/shiny_text/`: existing shared name-wipe component, unchanged.
- `mainpage_component/previews/`: public-safe screenshots with provenance in README.
- `categories/projects/task-planner/index.html`, `landing.css`, `landing.js`: Public Workspace entry, local-file explanation, privacy copy, template download, and ShinyText headline wipe.
- `categories/projects/task-planner/persistence.js`: public-safe File System Access connection, status dot, IndexedDB handle reuse, write gate, and workspace-data.js parser/serializer.
- `categories/projects/task-planner/tasks.html`, `tasks.js`, `calendar.html`, `calendar.js`: public-safe Tasks and Calendar pages synchronized from Cony Workspace ACTIVE, with empty startup data and guarded mutations.
- `library/component/mini_calendar/` and `library/component/dropdown_list/`: local copies of the reusable components required by the synchronized pages.
- `tests/mainpage.behavior.test.mjs`: CUA-driven mobile behavior regression checks.

## Workflow Rules for Agents
- Read this file before editing; update after meaningful decisions or validation.
- Keep static-site deployment and existing subpage boundaries.
- Preserve user backups and unrelated changes.
- Never store secrets, private workspace content, or sensitive company data.

## Recent Work Log
Newest first.
- 2026-09-21 - Synchronized the public Tasks and Calendar pages with the latest Cony Workspace structure.
  - Changed: Copied only the required public-safe page logic, styles, UI helper, icons, mini-calendar, and dropdown components; removed the seeded demo persistence script and private calendar title mappings. Added a local `persistence.js` that starts empty, reads/writes only a user-selected `workspace-data.js`, preserves unrelated sections, shows the bottom-left connection status dot, and blocks mutations until write permission is available. Fixed the landing headline line overlap by using independent block lines and added a restrained ShinyText wipe to the accent line.
  - Privacy boundary: No personal workspace data, private paths, profiles, or machine-specific files were copied into this repository.
  - Validation: Focused landing and connection contracts, syntax checks, personal-data scans, whitespace checks, and project regressions are being run before closeout. Browser smoke remains environment-blocked if the local file/HTTP policy is unchanged.
- 2026-09-21 - Reframed the Task Planner entry as Public Workspace.
  - Changed: Replaced the old session-only demo landing page with a ruled, editorial cream/pastel landing page that draws the local-file workflow, explains why personal data is not sent to HalloweenConyCoding, links directly to Tasks and Calendar, and offers a blank downloadable `workspace-data.js` template. Added a local landing module and local ShinyText wiring; no personal workspace data was copied. The actual file connection and read-only-until-connected gate remains planned as a separate integration slice.
  - Validation: Landing contract test passes; generated template parses as `window.WORKSPACE_DATA` with empty tasks/calendar notes; local ShinyText JavaScript syntax-checks and retains reduced-motion/forced-colors safeguards. Changes remain uncommitted because this checkout cannot write Git metadata.
  - Next: Implement and verify the browser file-connection/persistence gate against the updated Cony Workspace logic.
- 2026-09-19 - Fixed horizontal scroll from the Workbench entrance.
  - Changed: The Skills & tools card intentionally starts at `x:120`, but the About section did not clip that transform, so the document grew to 916px wide even at the top of an 828px viewport. The About section now uses `overflow: clip`, preserving the slide-in while keeping the transformed card inside the page’s horizontal boundary.
  - Validation: Live width sampling at the top, project gallery, Workbench trigger, and later collection positions stays at `scrollWidth: 828` / `bodyScrollWidth: 828`; the card still enters from the right. Depth/parallax tests, syntax checks, whitespace checks, and browser warning/error checks pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Replaced the stale Tilt Calculator card preview.
  - Changed: Inspected the public ACTIVE Cell Coverage Calculator V8 page, captured its current demo state, and created `mainpage_component/previews/radio-tool-v8.jpg` as a polished 1280×720 portfolio frame. The profile now uses this V8 asset; the older V5 image remains only as a retained reference. The generated frame contains demo inputs and no private workspace data.
  - Validation: The new preview is 1280×720, visually inspected after resizing, referenced by the homepage, and covered by the depth-layer asset test. Full tests, syntax checks, and whitespace checks pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Slowed the Workbench reveal arrival.
  - Changed: Moved the About trigger from `top 78%` to `top 62%`, extended each copy beat to `.82s` with a `.2s` stagger, and lengthened the right-card slide to `1s`. The sequence now begins as the Workbench actually enters the viewport instead of finishing before the content is readable.
  - Validation: Live desktop sampling keeps the beats at opacity 0 before the later trigger, shows the eyebrow and heading mid-sequence while the card is still traveling, then settles all five beats and the card at opacity 1/x:0. Reverse scrolling restores the staged values. All tests and syntax checks pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Added the reversible Workbench reveal sequence.
  - Changed: The About/Workbench copy now reveals in reading order—topic, heading, first paragraph, second paragraph, then the story disclosure—using staggered opacity and upward motion. The Skills & tools card enters from the right with its own fade and settles at x:0. Both are controlled by one section trigger and replay/reverse with the existing GSAP pattern.
  - Validation: Live desktop sampling shows the five beats entering one by one, the card traveling from x:120 to x:0, exact final opacity/transform values, and clean reverse values when scrolling back. Depth/parallax tests, syntax checks, whitespace checks, and the behavior test suite pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Smoothed the fixed atmosphere at both theme boundaries.
  - Changed: The galaxy layer now keeps one `normal` blend mode across paper and night and crossfades opacity/filter over 1.1s. The gradient no longer swaps its background image on a body-theme change, and header controls transition their color, border, and mobile menu surface. This removes the one-way-scroll flash at both the collection entrance and contact exit while preserving the buffered theme state.
  - Validation: Live desktop traces show the galaxy moving from paper to night and night to paper through intermediate opacity/filter values at both boundaries; depth/parallax tests, syntax checks, and whitespace checks pass. The 390×844 mobile behavior suite and browser warning/error checks remain part of the final verification.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Added buffered theme transitions for all light/dark boundaries.
  - Changed: Theme selection now tracks only real paper/night boundaries with directional hysteresis. Night enters one small buffer before its boundary and exits after passing back beyond the header threshold; paper has a larger lead-in near contact plus a separate exit threshold. This prevents touchpad micro-reversals from flashing the header.
  - Validation: Live desktop sampling stays paper from contactTop ≈ 534px through the bottom and remains stable for 280px of upward movement; the 390×844 mobile behavior suite passes and browser warnings/errors remain empty. Reusable motion-transition checks are recorded in [`docs/project-memory/MOTION_TRANSITION_QA.md`](docs/project-memory/MOTION_TRANSITION_QA.md).
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Moved the paper header state ahead of the footer boundary.
  - Changed: The header now switches to its light theme when the paper contact section is within about 65% of one viewport, instead of waiting for the exact document bottom. The existing bottom override remains as a safety net, so small touchpad reversals stay in the paper state instead of flashing dark/light.
  - Validation: Live desktop sampling changes to `paper` at contactTop ≈ 534px and stays paper through the bottom and 280px of upward movement; the 390×844 mobile behavior suite passes and the browser reports no warnings or errors.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Removed the post-entry side-card shake.
  - Changed: Task Planner and CodeSnippet now travel in from their opposing sides and settle directly at x:0; only the upward Radio Planning Tools card keeps a tiny vertical dampening pass. The shorter reveal timeline prevents a horizontal overshoot from continuing after the side cards become visible.
  - Validation: Live scroll sampling shows both side cards at opacity 1 and x:0 immediately after their entrance; later scroll steps keep x:0. Depth/parallax tests, syntax checks, and whitespace checks pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Removed the visible wallpaper seams between homepage zones.
  - Changed: Removed the clipped celestial `.stars` layer and the section-owned project/night surfaces that created hard horizontal bands. The collection now uses one translucent darkening overlay that begins 240px above the zone and fades through it, while matching contact and footer ramps carry the paper tone across the dark-to-light transition.
  - Validation: Live desktop screenshots at the project boundary, About section, contact transition, and footer show no full-width background edge; the collection remains readable while the galaxy and atmosphere stay visible. Depth/parallax tests, syntax checks, whitespace checks, and the 390×844 mobile behavior suite pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Removed the duplicate hero picture and closed the wallpaper gap at the page bottom.
  - Changed: The intro now has a transparent section surface and receives its light tone only from the fixed cream screen filter, which GSAP scrubs to zero as the collection begins. The old local hero image is gone. Contact and footer ramps were reduced so the wallpaper remains visible, and the fixed galaxy layer now has enough vertical overscan to cover its deepest parallax offset through the footer. Project-card timelines now use `play none play reverse`, replaying on a new forward pass with a tighter four-pixel settle and exact final-state lock.
  - Validation: The live desktop preview reports no `.hero-texture`, a transparent hero surface, intro tint `1 → 0` at the collection boundary, a galaxy rect extending beyond the viewport at the document bottom, and zero horizontal overflow. Repeated scroll sampling confirms cards settle at `x:0/y:0`, reverse above the trigger, and replay when crossing forward again. Depth/parallax tests, syntax checks, whitespace checks, and the existing mobile behavior suite pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-19 - Added the approved three-zone GSAP motion pass.
  - Changed: Wrapped the homepage into intro, collection, and contact zones with larger topic spacing; added three fixed atmosphere tint layers with scrubbed crossfades; and added local GSAP/ScrollTrigger card reveals. Radio Planning Tools enters from below, Task Planner from the right, and CodeSnippet from the left, each fading in with a fast-to-slow arrival, small overshoot, and damped settle. The project grid clips only the travel edge so opposing reveals do not create horizontal overflow.
  - Validation: The new depth test was red before implementation and passes after the markup, CSS, and motion controller changes. Parallax/depth tests, JavaScript syntax checks, and whitespace checks pass. Live desktop checks show the tint values crossfading at intermediate scroll positions and all three cards settling at opacity 1; the 390×844 mobile preview has zero overflow and all 12 existing behavior checks pass. Browser console reports no warnings or errors.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-18 - Smoothed the paper/night section changes.
  - Changed: Added 180px immersive gradient fades at the project showcase and contact boundaries. Those sections now use transparent bases with color ramps, so the generated atmosphere remains visible while the surface transitions from ivory to night and back.
  - Validation: Live desktop screenshots at scroll positions 520 and 660 show the project heading entering through a continuous fade instead of a hard edge; mobile reports the same gradient and retains 12 passing behavior checks. Depth/parallax tests, syntax checks, and whitespace checks pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-18 - Removed the remaining purple showcase artwork.
  - Changed: The local `.stars` layer in the project showcase no longer uses `cosmic_bg.png`; it now uses the generated blue/cyan/gold galaxy with lower saturation and a soft fade. The hero and fixed atmosphere already use the same generated asset.
  - Validation: The live desktop and mobile tabs report `profile_galaxy_showcase.png` for hero, fixed atmosphere, and showcase layers; no `cosmic_bg.png` remains in the showcase rule. Parallax/depth tests, syntax checks, mobile behavior, and whitespace checks pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-18 - Replaced the remaining old hero picture with the generated galaxy artwork.
  - Changed: `hero-texture` now points directly to `profile_galaxy_showcase.png`; `library_bg.png` is no longer used as the homepage hero background. The fixed atmosphere keeps the same asset for the showcase and parallax controller.
  - Validation: The live desktop and mobile tabs report the generated image URL for both hero and atmosphere layers; the hero screenshot now visibly shows the cyan/gold dust lane and star field. Depth/parallax tests, syntax checks, mobile behavior, and whitespace checks pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-18 - Fixed the atmosphere being visually buried by near-opaque section fills.
  - Changed: Reduced paper/night section alpha from `.91/.93` to `.68/.58`, keeping individual card surfaces opaque while allowing the generated galaxy, dust, stars, and orbit layers to read behind the showcase content. Refreshed the stylesheet cache key.
  - Validation: The live tab now reports the new stylesheet, 12 atmosphere layers, `rgba(..., 0.58)` in the showcase, and the galaxy at `0.78` opacity with a −124px one-screen offset. Desktop and mobile screenshots show the dust lane and star field; mobile behavior still passes all 12 checks.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-17 - Increased motion readability and replaced the showcase nebula artwork.
  - Changed: Added a capped `scrollOffset` helper so one normal viewport scroll moves near layers 2–3x farther than far layers without allowing indefinite drift. Added a generated, text-free galaxy asset with a calm center and cyan/gold dust lane; it is screen-blended in the night showcase and nearly invisible on paper sections. The older CSS nebula clouds remain as low-opacity support haze.
  - Validation: One live viewport scroll now moves the far clock 96px, near clock 142px, and galaxy 124px; the generated asset resolves from the page and the showcase screenshot shows the new dust lane behind stable project cards. Parallax/depth tests, syntax checks, and whitespace checks pass.
  - Next: Human visual review; no commit, push, or deployment.
- 2026-09-17 - Reworked the profile background into a fixed multi-layer atmosphere after comparing the Radio Planning Tools reference.
  - Research: The reference uses a fixed `.atmosphere` root with gradient/texture, generated stars, four nebula clouds, a rotating multi-ring clock, sunbeams, and dust. The profile previously had only three section-local layers behind mostly opaque section backgrounds.
  - Changed: Added eleven profile atmosphere nodes with independent grid, texture, stars, nebula, clock, dust, and gradient layers. Paper/night sections are translucent, content is above the atmosphere, and one rAF controller assigns distinct full-page parallax amplitudes while CSS supplies slow ambient drift/rotation.
  - Validation: The structural depth test was red before the new root existed and passes now; parallax math and syntax checks pass; the live page reports 11 layers, translucent sections, `z-index` 0/1 separation, and distinct offsets for every decorative layer after scrolling with zero overflow.
  - Next: Human visual review; no commit, push, or deployment.
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
