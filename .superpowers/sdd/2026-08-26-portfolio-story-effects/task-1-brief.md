# Task 1 brief — prune the pasted library

Read this first — it is your requirements, with the exact values to use verbatim.

## Scope

In the target static portfolio project, reduce the pasted `library` tree to the local vanilla ShinyText assets needed by the next hero-wiring task.

## Required files

Keep exactly these library assets:

- `library/PROJECT.md`
- `library/text/shiny_text/shiny_text.css`
- `library/text/shiny_text/shiny_text.js`

Delete only these exact paths after listing and confirming the inventory:

- `library/background/`
- `library/component/`
- `library/cursor_effect/`
- `library/icon/`
- `library/text/curved_loop/`
- `library/text/gradient_text/`
- `library/text/scrambled_text/`
- `library/text/scroll_float/`
- `library/text/text_type/`
- `library/text/variable_proximity/`
- `library/text/shiny_text/usage.html`

Update `library/PROJECT.md` to document that this retained library is the local vanilla ShinyText effect used by the portfolio hero. Remove stale current-state claims that the library is background-only or that deleted assets are retained. Keep useful historical context without claiming deleted paths are active.

## Constraints

- Work only in `C:\Beer\Programming\Personal_Project\HalloweenConyCoding`.
- The cleanup is user-approved. Do not ask for a second approval.
- Do not modify `index.html`, `README.md`, `PROJECT.md`, `mainpage_component`, or the external CELL_ANTENNA project in this task.
- Do not commit or push.
- You are not alone in the codebase: do not revert edits made by others, and accommodate existing untracked plan/library work.
- Do not spawn subagents or reviewers.

## Verification

Run a recursive remaining-file check and verify the three keep paths exist, the listed deletion paths are absent, and no target source file currently references a deleted `library/...` path. Report commands and results.

## Report

Write the full implementation report to:
`.superpowers/sdd/2026-08-26-portfolio-story-effects/task-1-report.md`

The report must include changed/deleted paths, verification commands with outputs, concerns, and whether the task is DONE or BLOCKED. Return only a short status summary after writing the report.
