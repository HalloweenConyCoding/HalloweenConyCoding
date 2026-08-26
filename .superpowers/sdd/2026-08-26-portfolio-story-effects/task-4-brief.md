# Task 4 brief — project memory and final validation

Read this first — it is your requirements, with the exact values to use verbatim.

## Scope

Complete the target project handoff after Tasks 1–3. Update only the target root `PROJECT.md` for project memory; generated `graphify-out/` changes are allowed only as the output of the required Graphify update. Do not alter source implementation in this task.

## Project memory

Add a concise newest entry to `PROJECT.md` recording:

- the four-paragraph My Story refresh with semantic emphasis;
- the AIS green-to-white gradient;
- the retained local vanilla ShinyText library;
- `CHATCHON` at 6.4 seconds and the hero role line at 3.2 seconds;
- root-only ASCII ripple removal with task-planner subpage preservation;
- validation performed and the fact that no commit/push was made.

Do not add secrets or a chat transcript. Preserve all existing PROJECT.md detail.

## Required validation

Run and record results for:

1. `node --check library/text/shiny_text/shiny_text.js`
2. A focused static check of four My Story paragraphs, required classes/text, exactly two root bare `data-shiny-text` elements, speeds/directions, no root ASCII ripple stylesheet/script/data hook, retained ripple files/subpage hooks, and all local root `href`/`src` paths resolving to existing files.
3. `git diff --check`.
4. `graphify update .` from the target root.
5. Browser smoke against the local root page after scripts initialize:
   - both hero strings are visible;
   - computed ShinyText durations are `6.4s` and `3.2s`;
   - leftward sweep configuration and background clipping are active;
   - no page console errors or failed local asset requests.
6. Browser smoke with `prefers-reduced-motion: reduce`:
   - both hero strings remain readable;
   - animation is disabled for both.

Use the available local browser automation tooling if installed. If a browser check cannot run, report the exact blocker and complete all non-browser checks; do not claim runtime validation passed.

## Preservation and constraints

- Work only in the target project.
- Preserve existing unrelated edits, the Task 1 library tree, Task 2 story/CSS, Task 3 hero wiring, task-planner subpage ripple hooks, and external project state.
- Do not modify the external CELL_ANTENNA reference project.
- Do not commit or push; do not spawn subagents.

## Report

Write the full report to:
`.superpowers/sdd/2026-08-26-portfolio-story-effects/task-4-report.md`

Return only status, changed paths, one-line validation summary, and concerns after writing the report.
