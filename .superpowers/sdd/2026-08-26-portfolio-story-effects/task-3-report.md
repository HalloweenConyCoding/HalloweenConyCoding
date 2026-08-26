# Task 3 implementation report — wire ShinyText to the hero

## Status

PASS. Task 3 is implemented in the root portfolio page.

## Scope and changes

- Updated `index.html` only for implementation changes.
- Replaced the root ASCII ripple stylesheet link with `library/text/shiny_text/shiny_text.css`.
- Replaced the hero title markup with the exact ShinyText attributes from the brief, including speed `6.4` and direction `left`.
- Added the exact ShinyText attributes to the hero tagline, including speed `3.2` and direction `left`.
- Replaced the root ASCII ripple script tag with `library/text/shiny_text/shiny_text.js` near the end of the body.
- Preserved the ASCII ripple library files and task-planner subpage hooks in `tasks.html` and `calendar.html`.

## Verification

All requested source checks passed:

- Exactly two root-page bare `data-shiny-text` elements.
- Title speed `6.4`; tagline speed `3.2`; both directions `left`.
- No root `data-ascii-glitch`, ASCII ripple stylesheet link, or ASCII ripple script tag.
- Both local ShinyText assets exist.
- Preserved ripple files and both task-planner subpage hooks exist.
- Every local `href`/`src` in root `index.html` resolves to an existing target.
- `node --check library/text/shiny_text/shiny_text.js` passed.
- `git diff --check` passed.

## Concerns

- No visual browser preview was performed; validation is source-based as requested.
- The working tree contained pre-existing edits to `index.html` (My Story copy), `mainpage_component/profile_style.css`, and untracked project files. The My Story edits were preserved and not treated as part of Task 3.
- No commit or push was performed. Human review remains required.
- `graphify update .` was not run because the brief restricts modifications to `index.html` and this report; running it could alter graph artifacts outside the requested scope.

## Changed paths for this task

- `index.html`
- `.superpowers/sdd/2026-08-26-portfolio-story-effects/task-3-report.md`
