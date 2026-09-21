# Public Workspace Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Task Planner demo landing page with a minimal editorial Public Workspace entry page that visually demonstrates the local-file workflow, explains why personal data is not uploaded, downloads a blank `workspace-data.js` template, preserves direct Tasks and Calendar links, and uses locally bundled, restrained motion.

**Architecture:** Keep the existing Tasks and Calendar pages untouched. Give `index.html` a dedicated `landing.css` surface, use semantic HTML for the connection explanation and destination links, and use a small `landing.js` module to generate the blank JavaScript data template locally. Load the ShinyText effect from this repository's local library. The real file picker and connect-before-edit gate remain a separate integration slice.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, local ShinyText assets, Node built-in assertions for source-contract tests, and browser smoke checks through the existing CUA workflow.

**Spec:** `docs/superpowers/specs/2026-09-21-public-workspace-landing-design.md`

**Execution status:** Tasks 1–4 are implemented and their source/static checks are green. Task 5's browser smoke is pending because this environment blocks local HTTP binding and direct `file://` inspection; the remaining file-connection/persistence work is intentionally a separate integration slice.

## Global Constraints

- Keep `categories/projects/task-planner/style.css` unchanged for Tasks and Calendar; the landing page receives a dedicated `landing.css` file.
- Keep the landing page static and GitHub Pages-compatible: HTML, CSS, and local vanilla JavaScript only.
- Copy/synchronize the approved ShinyText JavaScript and CSS into `library/text/shiny_text/` in this repository, retaining the local reduced-motion and forced-colors safety behavior.
- Do not add npm, React, Vite, a server, analytics, authentication, or a new dependency.
- Do not modify `tasks.html`, `tasks.js`, `calendar.html`, `calendar.js`, or the current persistence implementation in this slice.
- The Tasks link remains `tasks.html`; the Calendar link remains `calendar.html`.
- The landing page must not claim that changes persist until the later persistence slice is complete.
- The template download must contain only empty `tasks` and `calendarNotes` sections and public template metadata; no personal workspace data may enter this repository.

## Review Focus

- A direct visit must never expose stale demo language or imply that seeded data is saved; the source-contract test owns this.
- A mobile viewport must keep rules and destination rows within the viewport; the browser smoke check owns this.
- Keyboard users must see focus and reach both destinations; the browser smoke check owns this.
- Reduced-motion and forced-colors users must receive readable ShinyText without animated or transparent text; the local-library test and browser smoke check own this.
- A missing or mistyped local effect path must fail before visual review; the asset-path test owns this.
- The template download must be valid JavaScript with the exact `window.WORKSPACE_DATA` shape expected by the later persistence slice; the landing module contract test owns this.

---

### Task 1: Lock the landing-page and local-asset contract with tests

**Files:**
- Create: `tests/task-planner-landing.test.cjs`
- Read: `categories/projects/task-planner/index.html`
- Read: `docs/superpowers/specs/2026-09-21-public-workspace-landing-design.md`

**Interfaces:**
- Consumes: the landing-page source and design contract.
- Produces: deterministic source assertions for later HTML, CSS, and library changes.

- [ ] **Step 1: Write the failing source-contract test**

Create a CommonJS test with this contract:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'categories/projects/task-planner/index.html'), 'utf8');
const landingCss = path.join(root, 'categories/projects/task-planner/landing.css');
const landingJs = path.join(root, 'categories/projects/task-planner/landing.js');
const shinyJs = path.join(root, 'library/text/shiny_text/shiny_text.js');
const shinyCss = path.join(root, 'library/text/shiny_text/shiny_text.css');

assert.match(html, /class="landing-page"/);
assert.match(html, /PUBLIC WORKSPACE/);
assert.match(html, /Choose your workspace file/);
assert.match(html, /Grant read and write permission/);
assert.match(html, /Use Tasks or Calendar/);
assert.match(html, /connection-visual/);
assert.match(html, /workspace-data\.js/);
assert.match(html, /No upload/);
assert.match(html, /No server copy/);
assert.match(html, /not sent to HalloweenConyCoding/);
assert.match(html, /Download workspace template/);
assert.match(html, /id="download-workspace-template"/);
assert.match(html, /href="tasks\.html"/);
assert.match(html, /href="calendar\.html"/);
assert.match(html, /data-shiny-text/);
assert.match(html, /href="landing\.css"/);
assert.match(html, /href="\.\.\/\.\.\/\.\.\/library\/text\/shiny_text\/shiny_text\.css"/);
assert.match(html, /src="\.\.\/\.\.\/\.\.\/library\/text\/shiny_text\/shiny_text\.js"/);
assert.match(html, /src="landing\.js"/);
assert.doesNotMatch(html, /DEMO|session only|seeded demo|later ZIP version/i);
assert.ok(fs.existsSync(landingCss));
assert.ok(fs.existsSync(landingJs));
assert.ok(fs.existsSync(shinyJs));
assert.ok(fs.existsSync(shinyCss));

const landingJsSource = fs.readFileSync(landingJs, 'utf8');
assert.match(landingJsSource, /window\.WORKSPACE_DATA/);
assert.match(landingJsSource, /tasks:\s*\[\]/);
assert.match(landingJsSource, /calendarNotes:\s*\{\}/);
assert.match(landingJsSource, /workspace-data\.js/);
assert.match(landingJsSource, /application\/javascript/);

const sandbox = { document: { addEventListener() {} }, setTimeout };
sandbox.window = sandbox;
vm.runInNewContext(landingJsSource, sandbox);
const templateSource = sandbox.PublicWorkspaceLanding.createWorkspaceTemplateSource();
const templateMatch = templateSource.match(/^window\.WORKSPACE_DATA = ([\s\S]*);\n$/);
assert.ok(templateMatch, 'template must be a complete WORKSPACE_DATA assignment');
const template = JSON.parse(templateMatch[1]);
assert.deepEqual(template.sections.tasks, []);
assert.deepEqual(template.sections.calendarNotes, {});
assert.equal(template.meta.savedBy, 'PUBLIC WORKSPACE');

console.log('PASS Task Planner landing contract');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/task-planner-landing.test.cjs`

Expected: FAIL because the current page still contains the old demo copy and does not load `landing.css` or the local ShinyText effect.

- [ ] **Step 3: Keep the test semantic**

Do not assert exact colors, pixel dimensions, or animation timing here; those belong in browser review so visual refinement does not weaken the content and navigation contract.

- [ ] **Step 4: Run the test after the later tasks**

Run: `node tests/task-planner-landing.test.cjs`

Expected: PASS with `PASS Task Planner landing contract`.

- [ ] **Step 5: Commit the test contract**

```bash
git add tests/task-planner-landing.test.cjs
git commit -m "test: define Public Workspace landing contract"
```

### Task 2: Synchronize the local ShinyText effect library

**Files:**
- Modify: `library/text/shiny_text/shiny_text.js`
- Modify: `library/text/shiny_text/shiny_text.css`
- Modify: `library/PROJECT.md`
- Read: `/Users/beer/BeerMAC/GITHUB/Cony-Workspace/library/text/shiny_text/shiny_text.js`
- Read: `/Users/beer/BeerMAC/GITHUB/Cony-Workspace/library/text/shiny_text/shiny_text.css`

**Interfaces:**
- Consumes: the current approved ShinyText source from Cony Workspace.
- Produces: local `window.ShinyText` and `window.initShinyTexts` behavior plus reduced-motion and forced-colors safety rules.

- [ ] **Step 1: Add library safety assertions to the contract test**

Read the local files in `tests/task-planner-landing.test.cjs` and assert:

```js
const shinyJsSource = fs.readFileSync(shinyJs, 'utf8');
const shinyCssSource = fs.readFileSync(shinyCss, 'utf8');
assert.match(shinyJsSource, /global\.ShinyText\s*=\s*ShinyText/);
assert.match(shinyJsSource, /global\.initShinyTexts/);
assert.match(shinyCssSource, /prefers-reduced-motion/);
assert.match(shinyCssSource, /forced-colors/);
assert.match(shinyCssSource, /animation:\s*none/);
```

- [ ] **Step 2: Run the focused test**

Run: `node tests/task-planner-landing.test.cjs`

Expected: PASS for the existing local API and safety rules.

- [ ] **Step 3: Synchronize only the approved component files**

Compare the two repositories, update the local files from the current Cony Workspace behavior, and retain the local reduced-motion and forced-colors fallback when the source files differ. Do not copy the usage page, unrelated effects, or repository-specific paths.

- [ ] **Step 4: Update the library manifest**

Add a newest-first entry to `library/PROJECT.md` stating that ShinyText is synchronized for Public Workspace, remains no-build and local, and retains reduced-motion/forced-colors behavior. Keep the active-file list limited to the two component assets.

- [ ] **Step 5: Run syntax and contract checks**

Run:

```bash
node --check library/text/shiny_text/shiny_text.js
node tests/task-planner-landing.test.cjs
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit the local library update**

```bash
git add library/text/shiny_text/shiny_text.js library/text/shiny_text/shiny_text.css library/PROJECT.md tests/task-planner-landing.test.cjs
git commit -m "feat: bundle Public Workspace text effect locally"
```

### Task 3: Replace the old demo markup with the editorial Public Workspace structure

**Files:**
- Modify: `categories/projects/task-planner/index.html`
- Create: `categories/projects/task-planner/landing.css`
- Create: `categories/projects/task-planner/landing.js`
- Read: `categories/projects/task-planner/tasks.html`
- Read: `categories/projects/task-planner/calendar.html`

**Interfaces:**
- Consumes: local ShinyText assets from Task 2 and the direct page destinations.
- Produces: semantic `landing-page`, `connection-visual`, `connection-steps`, `privacy-points`, `workspace-destinations`, and `landing-footer` hooks for styling and browser verification.

- [ ] **Step 1: Replace the old inline demo layout**

Keep the back link target `../../../index.html`, update the title and metadata, and use this structure:

```html
<body class="landing-page">
  <main class="landing-shell">
    <header class="landing-header">
      <a class="landing-back" href="../../../index.html">← HalloweenConyCoding</a>
      <p class="landing-status">LOCAL-FIRST / PUBLIC ENTRY</p>
    </header>

    <section class="landing-hero" aria-labelledby="landing-title">
      <p class="landing-eyebrow" data-shiny-text data-shiny-color="#756f64" data-shiny-color-shine="#d89b72" data-shiny-speed="8" data-shiny-spread="100">PUBLIC WORKSPACE</p>
      <h1 id="landing-title">Your workspace,<br><em>kept close.</em></h1>
      <p class="landing-lede">A focused public view of Tasks and Calendar. Your workspace file stays on your computer; this page provides the interface.</p>
    </section>

    <section class="landing-section" aria-labelledby="connection-title">
      <div class="landing-section-heading"><p class="landing-section-index">01</p><h2 id="connection-title">How the connection works</h2></div>
      <div class="connection-visual" role="img" aria-label="Your workspace file stays on your computer while Public Workspace provides the browser interface.">
        <div class="connection-node connection-file-node"><span class="node-kicker">YOUR COMPUTER</span><div class="file-sheet" aria-hidden="true"><span>JS</span><strong>workspace-data.js</strong></div><small>Choose your local file</small></div>
        <div class="connection-bridge" aria-hidden="true"><span>read ↔ write</span></div>
        <div class="connection-node connection-browser-node"><span class="node-kicker">YOUR BROWSER</span><div class="browser-window" aria-hidden="true"><span class="browser-dots"><i></i><i></i><i></i></span><span class="browser-label">Public Workspace</span><span class="browser-pages"><b>Tasks</b><b>Calendar</b></span></div><small>Use the interface here</small></div>
      </div>
      <p class="connection-caption">Think of Public Workspace as a window onto your file, not a place where your file is stored.</p>
      <ol class="connection-steps">
        <li><span class="step-number">01</span><span><strong>Choose your workspace file</strong><small>Select the local workspace data file from your computer.</small></span></li>
        <li><span class="step-number">02</span><span><strong>Grant read and write permission</strong><small>The browser asks permission before the page can work with the file.</small></span></li>
        <li><span class="step-number">03</span><span><strong>Use Tasks or Calendar</strong><small>Work through the interface while the data remains local to you.</small></span></li>
      </ol>
    </section>

    <section class="landing-section privacy-section" aria-labelledby="privacy-title">
      <div class="landing-section-heading"><p class="landing-section-index">02</p><h2 id="privacy-title">Why your data stays private</h2></div>
      <p class="privacy-lede">Your workspace file is selected and handled by your browser. It is not uploaded to HalloweenConyCoding, so we do not receive a copy of your personal tasks or calendar.</p>
      <ul class="privacy-points">
        <li><strong>No upload</strong><small>The page reads the file you choose through your browser’s local permission.</small></li>
        <li><strong>No account</strong><small>There is no sign-in or user database holding your workspace content.</small></li>
        <li><strong>No server copy</strong><small>When connected, edits go back to your own file; this public page is only the interface.</small></li>
      </ul>
    </section>

    <section class="landing-section" aria-labelledby="destinations-title">
      <div class="landing-section-heading"><p class="landing-section-index">03</p><h2 id="destinations-title">Open the workspace</h2></div>
      <button class="template-download" id="download-workspace-template" type="button">Download workspace template</button>
      <nav class="workspace-destinations" aria-label="Public Workspace pages">
        <a class="destination-row" href="tasks.html"><span><strong>Tasks</strong><small>Organize work across a focused board.</small></span><span aria-hidden="true">↗</span></a>
        <a class="destination-row" href="calendar.html"><span><strong>Calendar</strong><small>See events, deadlines, and the shape of the week.</small></span><span aria-hidden="true">↗</span></a>
      </nav>
    </section>

    <footer class="landing-footer"><p>No account. No upload. Your file stays yours.</p><p>Public Workspace · Tasks + Calendar</p></footer>
  </main>
  <script src="landing.js"></script>
  <script src="../../../library/text/shiny_text/shiny_text.js"></script>
</body>
```

- [ ] **Step 2: Create the landing stylesheet and load only local page assets**

Create `landing.css` as a page-local stylesheet, then load it and `../../../library/text/shiny_text/shiny_text.css` with repository-relative paths. Load `landing.js` before the ShinyText library so the template button is available as soon as the page is interactive. Remove the old inline `<style>` block and remove `spotlight.js`; the new interaction model is CSS-based and does not need cursor-following glow behavior.

- [ ] **Step 3: Implement the blank template download module**

Create `landing.js` with a small public API and no user-data input:

```js
(function (global) {
  'use strict';

  var TEMPLATE = {
    meta: { version: 1, savedAt: '', savedBy: 'PUBLIC WORKSPACE' },
    sections: { tasks: [], calendarNotes: {} }
  };

  function createWorkspaceTemplateSource() {
    return 'window.WORKSPACE_DATA = ' + JSON.stringify(TEMPLATE, null, 2) + ';\\n';
  }

  function downloadWorkspaceTemplate() {
    var blob = new Blob([createWorkspaceTemplateSource()], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'workspace-data.js';
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  global.PublicWorkspaceLanding = {
    createWorkspaceTemplateSource: createWorkspaceTemplateSource,
    downloadWorkspaceTemplate: downloadWorkspaceTemplate
  };

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('download-workspace-template');
    if (button) button.addEventListener('click', downloadWorkspaceTemplate);
  });
}(window));
```

- [ ] **Step 4: Add template-module assertions**

Read `landing.js` in the contract test and assert that it contains `window.WORKSPACE_DATA`, empty `tasks`, empty `calendarNotes`, the `workspace-data.js` filename, and `application/javascript`. Do not assert personal task titles or copied workspace data; the test must make private-data leakage impossible by construction.

- [ ] **Step 5: Run the source-contract test**

Run: `node tests/task-planner-landing.test.cjs`

Expected: PASS for headings, connection steps, direct links, local asset paths, and removal of demo claims.

- [ ] **Step 6: Commit the semantic landing structure**

```bash
git add categories/projects/task-planner/index.html categories/projects/task-planner/landing.js
git commit -m "feat: add Public Workspace template download"
```

### Task 4: Implement the restrained editorial visual system and interaction states

**Files:**
- Modify: `categories/projects/task-planner/landing.css`
- Modify: `categories/projects/task-planner/index.html`
- Read: `categories/projects/task-planner/landing.js`
- Read: `library/text/shiny_text/shiny_text.css`

**Interfaces:**
- Consumes: the semantic hooks from Task 3 and local ShinyText CSS.
- Produces: responsive cream/pastel styling, ruled section separators, focus-visible states, hover/press feedback, and reduced-motion behavior without changing Tasks or Calendar styles.

- [ ] **Step 1: Add page-local design tokens**

Start `landing.css` with tokens scoped to `.landing-page`:

```css
.landing-page {
  --paper: #f4efe5;
  --paper-deep: #e9dfd0;
  --ink: #292821;
  --muted: #756f64;
  --rule: rgba(41, 40, 33, 0.2);
  --accent-coral: #d89b72;
  --accent-mint: #9bb8a4;
  --accent-lilac: #b7a7c8;
  --serif: Georgia, 'Times New Roman', serif;
  --sans: Inter, ui-sans-serif, system-ui, sans-serif;
  background: var(--paper);
  color: var(--ink);
}
```

Keep the palette subdued, keep rules thin, and avoid rounded cards as the primary layout device.

- [ ] **Step 2: Style the editorial layout**

Use a centered reading column with `max-width: 1080px`, `clamp()` outer padding, a large hero heading, section headings aligned to a narrow index column, and full-width one-pixel rules. Make destination rows open ruled rows with no card shadow and no opaque panel background.

- [ ] **Step 3: Add interaction feedback**

Use `transition: color 180ms ease, background-color 180ms ease, padding 180ms ease` on links and destination rows. On hover/focus-visible, move the destination arrow a few pixels, tint the row with a low-opacity pastel wash, and underline the link text. On `:active`, reduce the translation and slightly darken the ink. Keep the focus outline at least `2px` and inside the viewport.

Style `.template-download` as the one filled action on the page: a quiet pastel border and background, a visible focus ring, and a short pressed-state transition. It must not look like a dashboard card or imply that the browser has already connected a file.

- [ ] **Step 4: Add responsive and accessibility rules**

Below `720px`, stack header metadata, let section headings use one column, keep step numbers visible beside each step, and preserve at least `44px` of vertical target height for destination rows. Add:

```css
@media (prefers-reduced-motion: reduce) {
  .landing-page *,
  .landing-page *::before,
  .landing-page *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

Do not hide content, remove focus indicators, or depend on hover for meaning.

- [ ] **Step 5: Run syntax, contract, and whitespace checks**

Run:

```bash
node tests/task-planner-landing.test.cjs
git diff --check
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit the editorial styling**

```bash
git add categories/projects/task-planner/index.html categories/projects/task-planner/landing.css
git commit -m "feat: style Public Workspace landing page editorially"
```

### Task 5: Verify desktop, mobile, keyboard, and motion behavior

**Files:**
- Read: `categories/projects/task-planner/index.html`
- Read: `categories/projects/task-planner/landing.css`
- Read: `categories/projects/task-planner/landing.js`
- Read: `tests/task-planner-landing.test.cjs`
- Modify: `PROJECT.md`

**Interfaces:**
- Consumes: the completed landing page and local effect bundle.
- Produces: browser evidence that the entry page is usable without altering Tasks or Calendar.

- [ ] **Step 1: Run static checks**

Run:

```bash
node --check library/text/shiny_text/shiny_text.js
node tests/task-planner-landing.test.cjs
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 2: Run the desktop browser smoke check**

Serve the repository with the existing static-server workflow and open `categories/projects/task-planner/index.html`. Verify:

```js
const state = await tab.playwright.evaluate(() => ({
  title: document.title,
  overflow: document.documentElement.scrollWidth > innerWidth,
  shiny: !!document.querySelector('[data-shiny-text].shiny-text'),
  templateApi: !!(window.PublicWorkspaceLanding && window.PublicWorkspaceLanding.createWorkspaceTemplateSource),
  destinations: [...document.querySelectorAll('.workspace-destinations a')].map((link) => link.getAttribute('href')),
  badAssets: [...document.images].filter((image) => image.complete && !image.naturalWidth).map((image) => image.src)
}));
if (state.title !== 'Public Workspace - HalloweenConyCoding') throw new Error('wrong page title');
if (state.overflow) throw new Error('landing page overflows horizontally');
if (!state.shiny) throw new Error('ShinyText did not initialize');
if (!state.templateApi) throw new Error('template download API did not initialize');
if (state.destinations.join('|') !== 'tasks.html|calendar.html') throw new Error('direct links changed');
if (state.badAssets.length) throw new Error('broken image asset');
```

Expected: no horizontal overflow, initialized ShinyText, initialized template API, and exact direct links.

Also evaluate `window.PublicWorkspaceLanding.createWorkspaceTemplateSource()`, confirm it starts with `window.WORKSPACE_DATA`, contains empty `tasks` and `calendarNotes` sections, and contains no personal task or event text.

- [ ] **Step 3: Verify keyboard behavior**

Tab from the page start through the back link, Tasks, and Calendar links. Confirm visible focus for each; activate each destination and confirm the URL resolves to `tasks.html` or `calendar.html` without a JavaScript-only click handler.

- [ ] **Step 4: Verify mobile behavior**

Repeat at `390 × 844`. Confirm the header stacks, rules remain inside the viewport, all three connection steps are readable, and destination rows remain comfortably tappable.

- [ ] **Step 5: Verify reduced-motion and forced-colors behavior**

Run one browser pass with `prefers-reduced-motion: reduce` and one with forced-colors emulation if available. Confirm the page remains readable, ShinyText stops animating, and focus indicators remain visible.

- [ ] **Step 6: Record the completed slice in project memory**

Add a newest-first `PROJECT.md` entry stating that the Task Planner entry page became the Public Workspace editorial landing page, the blank `workspace-data.js` template download was added without private data, direct Tasks/Calendar links were preserved, local ShinyText was bundled, and desktop/mobile/accessibility checks passed. Do not claim that file connection or persistence is implemented yet.

- [ ] **Step 7: Commit the verification record**

```bash
git add PROJECT.md
git commit -m "docs: record Public Workspace landing redesign"
```

## Self-review checklist

- Spec coverage: landing structure, local privacy explanation, direct links, local effect assets, editorial styling, restrained motion, accessibility, and responsive verification each map to a task above.
- Placeholder scan: no implementation step uses TBD, TODO, or unspecified behavior; all paths, selectors, commands, and expected outcomes are explicit.
- Interface consistency: Task 2 produces local ShinyText assets; Task 3 loads them using the exact relative paths; Task 4 styles Task 3 hooks; Task 5 verifies those same hooks.
- Scope control: Tasks and Calendar behavior and persistence remain out of scope for this first plan and are explicitly protected by the global constraints.
- Scope control: the bottom-left connect control and read-only-until-connected gate belong to a separate Tasks/Calendar integration plan; this landing plan creates the blank template and explains that handoff.
