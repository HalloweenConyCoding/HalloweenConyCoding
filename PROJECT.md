# PROJECT.md

## Current State
HalloweenConyCoding is a plain static GitHub Pages-style personal homepage. The root `index.html` is the live entrypoint, with visual assets and CSS under `mainpage_component/`. The homepage has four public sections: Library, Projects, AI Team, and Uncharted, now with a desktop/tablet GSAP chapter layer and a natural-scroll fallback path.

## Current Goal
Upgrade the homepage from plain vertical scrolling into a GSAP-powered chapter experience while preserving static-site deployment and public-safe content.

## Key Decisions
- 2026-06-19 - Use local GSAP assets for homepage motion:
  - Reason: The site already contains `mainpage_component/gsap` and should not depend on CDN or build tooling.
  - Impact: Motion scripts must load from local relative paths and degrade safely without GSAP.
- 2026-06-19 - Keep mobile scrolling natural:
  - Reason: Pinned scrubbed scenes can trap or fatigue mobile users.
  - Impact: Desktop/tablet can use pinned chapters; mobile and reduced-motion use lighter reveals.

## Active Problems
- Problem: GSAP chapter mode was disabled by an over-strict height guard and also had duplicate navigation handlers.
  - Current diagnosis: canUsePinnedChapters() required every .section to be shorter than the viewport even though .section has min-height: 100vh, making pinned chapter mode dead code; nav clicks also had both inline and motion-script handlers.
  - Tried already: Read problem_and_sol.md, inspected live files, and patched C1/C2/C3/H1/H2/L1 plus a light M1 particle pause.
  - Next action: Human visual review for pacing; browser checks now confirm desktop pinned chapters are active and mobile/reduced-motion fallbacks remain safe.

## Architecture / Important Files
- `index.html`
  - Purpose: Live homepage markup and inline baseline JavaScript.
  - Notes: Must remain plain static HTML.
- `mainpage_component/profile_style.css`
  - Purpose: Homepage visual system and responsive styles.
  - Notes: Preserve existing clockwork/celestial identity while adding motion hooks.
- `mainpage_component/profile_motion.js`
  - Purpose: GSAP chapter motion layer.
  - Notes: Should be defensive and no-op when GSAP is unavailable.
- `mainpage_component/gsap/`
  - Purpose: Local GSAP runtime files.
  - Notes: Use local scripts, not CDN.

## Workflow Rules for Agents
- Always read this file before planning or editing this project.
- Update this file after meaningful decisions, problems, solutions, or project-state changes.
- Keep this file concise.
- Do not paste full chat logs.
- Move long details to `docs/project-memory/` and link them here.
- Never store secrets, API keys, passwords, private tokens, or sensitive company data.

## Recent Work Log
Newest first.
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
