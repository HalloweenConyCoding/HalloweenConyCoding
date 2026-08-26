# Task 3 brief — wire ShinyText to the hero

Read this first — it is your requirements, with the exact values to use verbatim.

## Scope

Update only `index.html` for the root portfolio page. The retained local library is already present at `library/text/shiny_text/shiny_text.css` and `library/text/shiny_text/shiny_text.js`.

## Exact hero markup

Use these two elements in the existing hero location:

```html
<h1 class="hero-name" data-shiny-text data-shiny-color="#173b59" data-shiny-color-shine="#ffffff" data-shiny-speed="6.4" data-shiny-spread="110" data-shiny-direction="left">CHATCHON</h1>
<p class="hero-tagline" data-shiny-text data-shiny-color="#55718c" data-shiny-color-shine="#ffffff" data-shiny-speed="3.2" data-shiny-spread="110" data-shiny-direction="left">Telecommunication Analyst &bull; Radio Planner &bull; Developer</p>
```

`CHATCHON` must be slower than the tagline: `6.4` versus `3.2` seconds. Preserve the existing hero classes and visible layout.

## Required asset wiring

- Add `<link rel="stylesheet" href="library/text/shiny_text/shiny_text.css">` in the document head.
- Add `<script src="library/text/shiny_text/shiny_text.js"></script>` near the end of the body so the library auto-initializes both bare `data-shiny-text` elements.
- Remove the root `index.html` ASCII ripple stylesheet link and ASCII ripple script tag.
- Remove any root `index.html` `data-ascii-glitch` attribute.
- Preserve `mainpage_component/vengeance_ui/ascii_glitch_ripple/ascii-glitch-ripple.css` and `.js` and preserve their existing task-planner subpage wiring in `categories/projects/task-planner/tasks.html` and `calendar.html`.

## Constraints

- Work only in the target project and only modify `index.html` for this task.
- Do not modify the external CELL_ANTENNA reference project, My Story copy/CSS, README, root PROJECT.md, library files, or subpages.
- Do not commit or push; do not spawn subagents.
- Preserve unrelated existing user edits.

## Verification

Run source checks confirming:

- exactly two root-page bare `data-shiny-text` elements;
- title speed `6.4`, tagline speed `3.2`, both direction `left`;
- root `index.html` has no `data-ascii-glitch`, ASCII ripple stylesheet link, or ASCII ripple script tag;
- both local ShinyText assets exist;
- preserved ripple files and task-planner subpage hooks still exist;
- every local `href`/`src` in root `index.html` resolves to an existing target file;
- `node --check library/text/shiny_text/shiny_text.js` and `git diff --check` pass.

Write the full report to:
`.superpowers/sdd/2026-08-26-portfolio-story-effects/task-3-report.md`

Return only status, changed paths, one-line verification summary, and concerns after writing the report.
