# Task Planner Demo Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Task Planner` DEMO project card to the HalloweenConyCoding homepage and create a realistic two-page public demo for Tasks and Calendar.

**Architecture:** Keep the homepage card minimal: title, `◆ DEMO`, stats, and link only, with no descriptive copy row. Build `categories/projects/task-planner/` as a small static demo bundle copied from the real `Cony-Workspace\VERSION\ACTIVE` Tasks and Calendar pages, replacing file-backed persistence with an in-memory demo shim so interactions work until refresh/close and no user data is saved.

**Tech Stack:** Static HTML/CSS/JavaScript, copied vanilla workspace pages, local GSAP files, demo-only in-memory `workspacePersistence` shim, GitHub Pages-compatible relative paths.

---

## Scope

Build now:
- Homepage project card inserted after `Radio Planning Tools` and before `CodeSnippet`.
- Homepage card status label: `◆ DEMO`.
- Remove homepage card copy/description row for Task Planner.
- New demo landing page: `categories/projects/task-planner/index.html`.
- New demo subpages:
  - `categories/projects/task-planner/tasks.html`
  - `categories/projects/task-planner/calendar.html`
- Demo pages should mostly look like the real files from `C:\Beer\Programming\Personal_Project\Cony-Workspace\VERSION\ACTIVE`.
- Demo pages should allow interaction: move task cards, click cards/events, add tasks/events, edit details.
- Demo pages must not persist data to file, browser storage, cache, IndexedDB, or localStorage. State can live only in JavaScript memory and is lost on refresh/close.

Do not build now:
- Working downloadable ZIP.
- `data/workspace-data.js` package for users.
- File System Access API save/connect flow.
- Real user data storage.
- Sync, backend, login, analytics, or cloud data.

## File Structure

- Modify `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\index.html`
  - Insert the Task Planner project card between the existing Radio Planning Tools and CodeSnippet cards.
- Modify `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\mainpage_component\profile_style.css`
  - Add `.cel-card-status.demo`.
- Create folder `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\`.
- Create `categories\projects\task-planner\index.html`
  - Small demo landing page with links to Tasks and Calendar.
- Copy from `C:\Beer\Programming\Personal_Project\Cony-Workspace\VERSION\ACTIVE\` into `categories\projects\task-planner\`:
  - `tasks.html`
  - `tasks.js`
  - `calendar.html`
  - `calendar.js`
  - `style.css`
  - `nav.js`
  - `spotlight.js`
  - `assets\js\core\ui.js`
  - `vengeance_ui\ascii_glitch_ripple\ascii-glitch-ripple.css`
  - `vengeance_ui\ascii_glitch_ripple\ascii-glitch-ripple.js`
  - `gsap\gsap.min.js`
  - `gsap\CustomEase.min.js`
  - `gsap\Draggable.min.js`
- Create `categories\projects\task-planner\demo-persistence.js`
  - In-memory replacement for the real persistence layer.
- Modify copied `tasks.html` and `calendar.html`
  - Remove `data/workspace-data.js`.
  - Replace `persistence.js` with `demo-persistence.js`.
- Modify copied `nav.js`
  - Keep only `Demo Home`, `Tasks`, and `Calendar`.
- Modify `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\PROJECT.md`
  - Add a concise recent-work entry after implementation.

---

### Task 1: Add Homepage Card

**Files:**
- Modify: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\index.html`
- Modify: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\mainpage_component\profile_style.css`

- [ ] **Step 1: Confirm current insertion point**

Run:

```powershell
rg -n "Radio Planning Tools|CodeSnippet|project-grid|cel-card-status" "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\index.html"
```

Expected:

```text
Radio Planning Tools appears before CodeSnippet inside .project-grid.
```

- [ ] **Step 2: Insert the Task Planner card without a copy row**

In `index.html`, place this complete card immediately after the closing `</div>` for the `Radio Planning Tools` card and before the existing `CodeSnippet` card:

```html
          <div class="cel-card featured reveal reveal-delay-3">
            <div class="cel-card-header">
              <h3 class="cel-card-title">Task Planner</h3>
              <span class="cel-card-status demo">◆ DEMO</span>
            </div>
            <div class="cel-card-stats">
              <div class="cel-stat">
                <span class="cel-stat-dot dev"></span>
                <span class="cel-stat-text">Tasks</span>
              </div>
              <div class="cel-stat">
                <span class="cel-stat-dot live"></span>
                <span class="cel-stat-text">Calendar</span>
              </div>
            </div>
            <a href="categories/projects/task-planner/index.html" target="_blank" rel="noopener noreferrer" class="cel-card-link">
              Open Task Planner
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
```

Do not include:

```html
<p class="cel-card-desc">...</p>
```

- [ ] **Step 3: Adjust reveal delay on CodeSnippet**

Change the existing `CodeSnippet` card wrapper from:

```html
          <div class="cel-card featured reveal reveal-delay-3">
```

to:

```html
          <div class="cel-card featured reveal reveal-delay-4">
```

- [ ] **Step 4: Add DEMO status style**

In `mainpage_component/profile_style.css`, add this block after `.cel-card-status.active` and before `.cel-card-status.dormant`:

```css
.cel-card-status.demo {
  background: rgba(201, 168, 76, 0.14);
  color: var(--cel-brass-bright);
  border: 1px solid rgba(201, 168, 76, 0.28);
}
```

- [ ] **Step 5: Verify homepage structure**

Run:

```powershell
rg -n "Task Planner|◆ DEMO|categories/projects/task-planner/index.html|CodeSnippet" "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\index.html"
rg -n "cel-card-status.demo" "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\mainpage_component\profile_style.css"
```

Expected:

```text
Task Planner appears before CodeSnippet.
The Task Planner card has no cel-card-desc paragraph.
The link points to categories/projects/task-planner/index.html.
.cel-card-status.demo exists in profile_style.css.
```

---

### Task 2: Copy The Real Demo Page Bundle

**Files:**
- Create/copy under: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\`

- [ ] **Step 1: Create required folders**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\assets\js\core" | Out-Null
New-Item -ItemType Directory -Force -Path "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\vengeance_ui\ascii_glitch_ripple" | Out-Null
New-Item -ItemType Directory -Force -Path "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\gsap" | Out-Null
```

Expected:

```text
All three target folders exist.
```

- [ ] **Step 2: Copy real Tasks and Calendar files**

Run:

```powershell
$src = "C:\Beer\Programming\Personal_Project\Cony-Workspace\VERSION\ACTIVE"
$dst = "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner"
Copy-Item -Force -Path "$src\tasks.html" -Destination "$dst\tasks.html"
Copy-Item -Force -Path "$src\tasks.js" -Destination "$dst\tasks.js"
Copy-Item -Force -Path "$src\calendar.html" -Destination "$dst\calendar.html"
Copy-Item -Force -Path "$src\calendar.js" -Destination "$dst\calendar.js"
Copy-Item -Force -Path "$src\style.css" -Destination "$dst\style.css"
Copy-Item -Force -Path "$src\nav.js" -Destination "$dst\nav.js"
Copy-Item -Force -Path "$src\spotlight.js" -Destination "$dst\spotlight.js"
Copy-Item -Force -Path "$src\assets\js\core\ui.js" -Destination "$dst\assets\js\core\ui.js"
Copy-Item -Force -Path "$src\vengeance_ui\ascii_glitch_ripple\ascii-glitch-ripple.css" -Destination "$dst\vengeance_ui\ascii_glitch_ripple\ascii-glitch-ripple.css"
Copy-Item -Force -Path "$src\vengeance_ui\ascii_glitch_ripple\ascii-glitch-ripple.js" -Destination "$dst\vengeance_ui\ascii_glitch_ripple\ascii-glitch-ripple.js"
Copy-Item -Force -Path "$src\gsap\gsap.min.js" -Destination "$dst\gsap\gsap.min.js"
Copy-Item -Force -Path "$src\gsap\CustomEase.min.js" -Destination "$dst\gsap\CustomEase.min.js"
Copy-Item -Force -Path "$src\gsap\Draggable.min.js" -Destination "$dst\gsap\Draggable.min.js"
```

Expected:

```text
The copied tasks.html and calendar.html still resemble the real ACTIVE pages before persistence rewiring.
```

- [ ] **Step 3: Verify copied files**

Run:

```powershell
Get-ChildItem "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner" -Recurse -File |
  Select-Object FullName, Length
```

Expected:

```text
Output includes tasks.html, tasks.js, calendar.html, calendar.js, style.css, nav.js, spotlight.js, ui.js, ascii-glitch assets, and three GSAP files.
```

---

### Task 3: Add Demo Landing Page And In-Memory Persistence

**Files:**
- Create: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\index.html`
- Create: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\demo-persistence.js`

- [ ] **Step 1: Create demo landing page**

Create `categories/projects/task-planner/index.html` with this complete content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Planner Demo - HalloweenConyCoding</title>
  <meta name="description" content="Interactive public demo for the local-first Task Planner.">
  <link rel="stylesheet" href="style.css">
  <style>
    .demo-home {
      min-height: 100vh;
      padding: clamp(28px, 6vw, 64px);
      background:
        radial-gradient(circle at 16% 14%, rgba(32, 178, 170, 0.12), transparent 30%),
        radial-gradient(circle at 82% 18%, rgba(201, 168, 76, 0.14), transparent 28%),
        var(--bg);
      color: var(--text);
    }
    .demo-home-inner { max-width: 1080px; margin: 0 auto; }
    .demo-top { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 54px; }
    .demo-back, .demo-pill { font-family: var(--font-mono); font-size: 12px; color: var(--text-2); text-decoration: none; }
    .demo-pill { border: 1px solid var(--border); border-radius: 999px; padding: 7px 11px; color: var(--accent, #e2c66d); }
    .demo-hero { max-width: 760px; margin-bottom: 34px; }
    .demo-kicker { margin: 0 0 12px; font-family: var(--font-mono); font-size: 12px; color: var(--accent, #e2c66d); letter-spacing: 0.08em; }
    .demo-title { margin: 0; font-size: clamp(42px, 9vw, 86px); line-height: 0.95; letter-spacing: -0.025em; }
    .demo-copy { margin: 22px 0 0; max-width: 64ch; color: var(--text-2); line-height: 1.75; }
    .demo-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .demo-card { display: block; min-height: 220px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); padding: 22px; text-decoration: none; color: inherit; box-shadow: 0 18px 60px rgba(0,0,0,0.28); }
    .demo-card:hover { border-color: var(--border-2); transform: translateY(-2px); }
    .demo-card h2 { margin: 0 0 10px; font-size: 26px; }
    .demo-card p { margin: 0; color: var(--text-2); line-height: 1.6; }
    .demo-note { margin-top: 18px; color: var(--text-3); font-size: 13px; line-height: 1.6; }
    @media (max-width: 760px) {
      .demo-grid { grid-template-columns: 1fr; }
      .demo-top { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
  <main class="demo-home">
    <div class="demo-home-inner">
      <nav class="demo-top" aria-label="Task Planner demo navigation">
        <a class="demo-back" href="../../../index.html">← Back to HalloweenConyCoding</a>
        <span class="demo-pill">◆ DEMO - session only</span>
      </nav>

      <section class="demo-hero">
        <p class="demo-kicker">INTERACTIVE PUBLIC PREVIEW</p>
        <h1 class="demo-title">Task Planner</h1>
        <p class="demo-copy">
          Try the Tasks and Calendar pages with demo data. You can add, edit, click, and move items, but this public demo does not save anything. Refreshing or closing the page resets the demo.
        </p>
      </section>

      <section class="demo-grid" aria-label="Task Planner demo pages">
        <a class="demo-card spotlight-card" href="tasks.html">
          <h2>Tasks</h2>
          <p>Kanban-style task board with add, edit, priority, due date, delete, and drag-to-move behavior.</p>
        </a>
        <a class="demo-card spotlight-card" href="calendar.html">
          <h2>Calendar</h2>
          <p>Month, week, and agenda views with clickable dates, event editing, and task due-date visibility.</p>
        </a>
      </section>

      <p class="demo-note">
        The later ZIP version will add local workspace-file saving. This demo intentionally keeps state in memory only.
      </p>
    </div>
  </main>
  <script src="spotlight.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create in-memory persistence shim**

Create `categories/projects/task-planner/demo-persistence.js` with this complete content:

```javascript
(function () {
  'use strict';

  const startedAt = new Date().toISOString();
  const demoData = {
    tasks: [
      {
        id: 'demo-task-1',
        title: 'Prepare weekly planning notes',
        detail: 'Collect the key actions, pending decisions, and blockers before the team sync.',
        col: 'todo',
        priority: 'high',
        due: '2026-07-08',
        createdAt: '2026-07-04T08:00:00.000Z'
      },
      {
        id: 'demo-task-2',
        title: 'Review optimization actions',
        detail: 'Check which items are ready to move from in progress to done.',
        col: 'progress',
        priority: 'med',
        due: '2026-07-09',
        createdAt: '2026-07-04T08:10:00.000Z'
      },
      {
        id: 'demo-task-3',
        title: 'Archive completed follow-ups',
        detail: 'Keep the demo board tidy before preparing the local ZIP package.',
        col: 'done',
        priority: 'low',
        due: '2026-07-17',
        createdAt: '2026-07-04T08:20:00.000Z'
      }
    ],
    calendarNotes: {
      '2026-07-08': [
        { id: 'demo-event-1', title: 'Planning review', time: '09:30', tag: 'work', note: 'Demo event. Edits reset after refresh.' }
      ],
      '2026-07-09': [
        { id: 'demo-event-2', title: 'Team follow-up', time: '14:00', tag: 'deadline' }
      ]
    }
  };

  const sections = {
    tasks: demoData.tasks,
    notes: [],
    noteCategories: [],
    noteTagOptions: [],
    noteTemplates: [],
    sites: [],
    siteStatusPipeline: [],
    links: [],
    calendarNotes: demoData.calendarNotes,
    habitsList: [],
    habitsChecks: {},
    journal: {},
    analyzerCharts: [],
    rfAnalyzer: {},
    siteAudits: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function result(source, status, extra) {
    return Object.assign({
      data: clone(sections),
      source: source || 'memory',
      status: status || 'buffered',
      migrated: false,
      dirty: true,
      hasHandle: false,
      permission: 'demo-memory-only',
      savedAt: startedAt,
      reason: 'demo-memory-only'
    }, extra || {});
  }

  function writeSection(section, value) {
    sections[section] = clone(value);
    return Promise.resolve(result('memory', 'buffered'));
  }

  window.workspacePersistence = {
    loadWorkspaceData: function () {
      return Promise.resolve(result('memory', 'buffered'));
    },
    readLocalSnapshot: function () {
      return clone(sections);
    },
    saveWorkspaceData: function (data) {
      Object.keys(sections).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(data || {}, key)) {
          sections[key] = clone(data[key]);
        }
      });
      return Promise.resolve(result('memory', 'buffered'));
    },
    bufferWorkspaceData: function (data) {
      return this.saveWorkspaceData(data);
    },
    saveSection: writeSection,
    bufferSection: writeSection,
    autoSaveSection: writeSection,
    saveToDisk: function () {
      return Promise.resolve(result('memory', 'blocked', { reason: 'demo-no-disk-save' }));
    },
    connect: function () {
      return Promise.resolve(false);
    },
    subscribe: function (listener) {
      if (typeof listener === 'function') {
        listener({
          data: clone({ meta: { version: 1, savedAt: startedAt, savedBy: 'DEMO' }, sections }),
          dirty: true,
          hasHandle: false,
          supportsFileSystemAccess: false,
          indexedDbMode: 'disabled',
          permission: 'demo-memory-only',
          restoreBuffer: null,
          status: { kind: 'demo', message: 'Demo only - changes reset on refresh.' },
          hint: 'Demo state is in memory only.',
          lastError: '',
          machineLabel: 'DEMO'
        });
      }
      return function unsubscribe() {};
    }
  };
})();
```

---

### Task 4: Rewire Copied Pages For Demo Mode

**Files:**
- Modify: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\tasks.html`
- Modify: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\calendar.html`
- Modify: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\nav.js`

- [ ] **Step 1: Replace real persistence scripts**

In both `tasks.html` and `calendar.html`, replace:

```html
<script src="data/workspace-data.js"></script>
<script src="persistence.js"></script>
```

with:

```html
<script src="demo-persistence.js"></script>
```

- [ ] **Step 2: Add demo-only banner text to each page header**

In both copied pages, find the header area that contains `id="save-status"` and preserve it, but make sure the visible save status eventually reads as demo/session-only via the shim and `WorkspaceUI.reflectSaveIndicator`.

If a static label is needed in the HTML, use:

```html
<span class="save-status-label">Demo - resets on refresh</span>
```

- [ ] **Step 3: Restrict sidebar navigation to demo pages**

In copied `nav.js`, replace the full `pages` array with:

```javascript
  const pages = [
    { href: 'index.html', label: 'Demo Home', icon: `<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>` },
    { href: 'tasks.html', label: 'Tasks', icon: `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>` },
    { href: 'calendar.html', label: 'Calendar', icon: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>` }
  ];
```

- [ ] **Step 4: Verify no real persistence references remain**

Run:

```powershell
rg -n "data/workspace-data|persistence\.js|showOpenFilePicker|showSaveFilePicker|indexedDB|localStorage|workspace-crash-buffer|workspace-file-handle" "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner"
```

Expected:

```text
No matches, except comments if deliberately added to explain that those APIs are not used.
```

---

### Task 5: Validate Demo Interactions

**Files:**
- Verify all files under `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\`

- [ ] **Step 1: Run syntax checks**

Run:

```powershell
node --check "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\tasks.js"
node --check "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\calendar.js"
node --check "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\demo-persistence.js"
node --check "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner\nav.js"
```

Expected:

```text
All commands exit with code 0.
```

- [ ] **Step 2: Start a temporary local server**

Run from `C:\Beer\Programming\Personal_Project\HalloweenConyCoding`:

```powershell
python -m http.server 8123
```

Expected:

```text
Serving HTTP on :: port 8123 or Serving HTTP on 0.0.0.0 port 8123.
```

- [ ] **Step 3: Smoke-check HTTP responses**

Run in a second terminal:

```powershell
$base = "http://127.0.0.1:8123/categories/projects/task-planner"
$home = Invoke-WebRequest -Uri "$base/index.html" -UseBasicParsing
$tasks = Invoke-WebRequest -Uri "$base/tasks.html" -UseBasicParsing
$calendar = Invoke-WebRequest -Uri "$base/calendar.html" -UseBasicParsing
"home=$($home.StatusCode) tasks=$($tasks.StatusCode) calendar=$($calendar.StatusCode)"
```

Expected:

```text
home=200 tasks=200 calendar=200
```

- [ ] **Step 4: Browser interaction checks**

Open:

```text
http://127.0.0.1:8123/categories/projects/task-planner/index.html
http://127.0.0.1:8123/categories/projects/task-planner/tasks.html
http://127.0.0.1:8123/categories/projects/task-planner/calendar.html
```

Check:
- Demo home links open Tasks and Calendar.
- Tasks page visually matches the real workspace closely.
- Tasks page loads seeded demo tasks.
- Add a task.
- Edit a task detail.
- Drag a task card to another column.
- Refresh the page and confirm demo data resets.
- Calendar page visually matches the real workspace closely.
- Calendar page loads seeded demo events and task due dates.
- Add a calendar event.
- Edit a calendar event detail.
- Refresh the page and confirm demo events reset.
- Browser console has no missing `workspacePersistence`, `WorkspaceUI`, or missing asset errors.
- Mobile width around 390px has no horizontal overflow.

- [ ] **Step 5: Stop the local server**

Return to the terminal running `python -m http.server 8123` and press:

```text
Ctrl+C
```

Expected:

```text
The server stops cleanly.
```

---

### Task 6: Update Project Memory

**Files:**
- Modify: `C:\Beer\Programming\Personal_Project\HalloweenConyCoding\PROJECT.md`

- [ ] **Step 1: Add a concise recent-work entry**

Under `## Recent Work Log`, insert this entry above the current newest item:

```markdown
- 2026-07-04 - Added Task Planner demo project direction:
  - Changed: Planned and implemented a `Task Planner` DEMO card between Radio Planning Tools and CodeSnippet, plus a two-page public demo under `categories/projects/task-planner/` using copied Tasks and Calendar pages with memory-only demo persistence.
  - Validation: Homepage structure checks, no real persistence references, JavaScript syntax checks, local server smoke, desktop interaction review, refresh-reset review, and mobile overflow review.
  - Next: After the public demo is accepted, create the downloadable local ZIP package with empty/sample `data/workspace-data.js`.
```

- [ ] **Step 2: Verify memory entry**

Run:

```powershell
rg -n "Task Planner demo|two-page public demo|memory-only demo persistence|data/workspace-data.js" "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\PROJECT.md"
```

Expected:

```text
The new recent-work entry is present.
```

---

### Task 7: Final Diff Review

**Files:**
- Review all changed files in `C:\Beer\Programming\Personal_Project\HalloweenConyCoding`

- [ ] **Step 1: Inspect changed files**

Run:

```powershell
git status --short
```

Expected changed files include:

```text
 M PROJECT.md
 M index.html
 M mainpage_component/profile_style.css
?? categories/projects/task-planner/
```

- [ ] **Step 2: Check whitespace**

Run:

```powershell
git diff --check
```

Expected:

```text
No output.
```

- [ ] **Step 3: Review persistence boundary**

Run:

```powershell
rg -n "showOpenFilePicker|showSaveFilePicker|indexedDB|localStorage|workspace-crash-buffer|workspace-file-handle|data/workspace-data|persistence\.js" "C:\Beer\Programming\Personal_Project\HalloweenConyCoding\categories\projects\task-planner"
```

Expected:

```text
No runtime persistence references remain in the public demo bundle.
```

- [ ] **Step 4: Graphify update after code changes**

Run from `C:\Beer\Programming\Personal_Project\HalloweenConyCoding`:

```powershell
graphify update .
```

Expected:

```text
Graphify completes. If graph.html is skipped because the graph is too large, report that separately from implementation success.
```

- [ ] **Step 5: Final handoff**

Report:
- Changed files.
- Validation commands and results.
- Whether the local server was stopped.
- That demo interactions work but reset on refresh/close.
- That the working ZIP package remains the next separate task after demo acceptance.
- That GitHub Desktop human review remains required before commit or publication.

---

## Self-Review

- Spec coverage: The plan covers DEMO status, homepage insertion between Planning Tools and CodeSnippet, removal of the homepage copy row, a demo landing page, Tasks and Calendar subpages, real-page visual reuse, clickable/add/edit/move interactions, and memory-only state that resets after refresh/close.
- Placeholder scan: No placeholder implementation steps remain; code blocks provide exact snippets, copy commands, or complete new file content.
- Type and naming consistency: The project slug is consistently `task-planner`, the homepage title is consistently `Task Planner`, and the status text is consistently `◆ DEMO`.
