# File Map

## Purpose

Quick navigation guide for the static portfolio and its public project pages.

## Entry Points

- `index.html` - Portfolio homepage.
- `categories/projects/task-planner/index.html` - Public Workspace landing page.
- `categories/projects/task-planner/tasks.html` - Public Tasks page.
- `categories/projects/task-planner/calendar.html` - Public Calendar page.

## Major Folders / Files

- `categories/projects/task-planner/nav.js` - Shared left-rail navigation and transitions for Public Workspace pages.
- `categories/projects/task-planner/persistence.js` - Local workspace-file connection and guarded persistence.
- `library/icon/cony-workspace/` - Shared icons used by project pages, including the dark Tasks rail icon.
- `library/component/` - Reusable page components.
- `mainpage_component/` - Homepage styles, scripts, previews, and local animation libraries.
- `docs/project-memory/` - Project-specific navigation and continuity notes.

## Generated / Cache Outputs

- `graphify-out/` - Generated knowledge graph; refresh with `graphify update .` and do not hand-edit.

## Protected / No-Touch Areas

- Public Workspace data must remain empty/public-safe; never copy private workspace data or machine-specific paths here.
- Preserve existing user changes and backups.

## Validation Commands

- `node --check categories/projects/task-planner/nav.js` - Check navigation script syntax.
- `git diff --check` - Check edited tracked files for whitespace errors.
