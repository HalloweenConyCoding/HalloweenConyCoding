# Code Canvas Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair faithful pasted-code rendering, editing geometry, language selection, dependency failures, and image copying in Code Canvas.

**Architecture:** Keep the existing standalone HTML page and its native textarea. Build balanced preview rows from the full-source highlighted fragment, share layout measurements across editing and preview layers, and make export a guarded operation with a shared PNG promise and download recovery. Browser regression checks exercise real DOM layout and highlighting; Node VM tests cover export and dependency failure paths.

**Tech Stack:** HTML, CSS, browser JavaScript, Highlight.js 11.9.0, html2canvas 1.4.1, Node built-in test runner, Codex CUA browser API.

**Spec:** `docs/superpowers/specs/2026-10-07-code-canvas-reliability.md`

## Global Constraints

- Keep the static standalone page at `categories/projects/code-snippet/CodeSnippet.html` and the existing portfolio link.
- Keep the five languages: HTML, JavaScript, Markdown, CSS, and Python.
- Keep the five existing themes and the existing code-window export scope.
- Keep Highlight.js 11.9.0 and html2canvas 1.4.1; add no production dependency or build step.
- Preserve pasted text exactly through rendering and control changes, including tabs, Unicode, blank lines, and a trailing newline.
- Keep full-source highlighting context and produce one independent preview row per logical source line.
- Align textarea and preview text metrics, wrapping, and insets at 375px, 640px, 641px, and 1000px viewport widths, with line numbers on and off.
- Switching language must preserve the textarea value and selection. Load the initial HTML sample only during initialization.
- Failed highlighting must retain a readable, escaped plain-text preview.
- Only one export may be in flight; clipboard failure must offer the same PNG as a download.
- Report copy, download, and capture failure accurately; a null PNG blob must not be reported as success.
- Validate existing themes and language presets and keep a regression reproduction for every repair.

## Review Focus

- Nested tokens crossing multiple newlines: every row retains its token classes and all punctuation inside its code cell (Task 1).
- Empty text, final blank lines, tabs, Thai, emoji, and HTML-like strings: source survives without executable DOM (Task 1).
- Crossing mobile breakpoints, late fonts, and line-count digit boundaries: caret, wrapping, and gutter measurements stay aligned (Task 2).
- Switching the already-selected language and selecting a different grammar after a paste: text and selection survive (Task 3).
- Clipboard rejection, missing capabilities, null PNG blobs, capture failure, and repeated shortcuts: one capture with accurate recoverable outcomes (Task 4).

---

## File map and execution setup

- Modify `categories/projects/code-snippet/CodeSnippet.html`: current inline renderer, CSS geometry, state, and export handlers. Retain its existing single-page structure.
- Create `tests/code-canvas.behavior.test.mjs`: reusable CUA browser checks, following `tests/mainpage.behavior.test.mjs` conventions. Export `runRenderingChecks(tab)`, `runLayoutChecks(tab, viewport)`, and `runLanguageChecks(tab)`; each returns `{ passed: number, scope: string }` and throws on failed assertions.
- Create `tests/code-canvas-failures.test.cjs`: Node built-in tests loading the actual inline script with a small DOM/event double; export and initialization fault coverage. Read the real page on each test run.
- Keep the spec, plan, and screenshot evidence together. Do not alter unrelated portfolio or project pages.

At implementation time read the required execution skill and using-git-worktrees skill, then inspect attached worktrees and current changes before selecting the checkout. Use a localhost server and CUA for browser interaction. The bundled Node path on this host is `/Users/beer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; resolve dependencies again if the host changes. Commit each completed task only as allowed by the execution workflow and sandbox.

### Task 1: Preserve multiline token structure and readable fallback

**Files:**
- Modify: `categories/projects/code-snippet/CodeSnippet.html:1551-1581,1786-1797`
- Create: `tests/code-canvas.behavior.test.mjs`
- Create: `tests/code-canvas-failures.test.cjs`

**Interfaces:**
- Consumes: `codeInput.value`, `currentLang`, and optional `hljs.highlight(code, { language })`.
- Produces: `renderCodeRows(code: string, language: string): void`, which replaces `#codeLines` with one `.code-line` containing `.ln` and `.lc` per logical line; no content may escape `.lc`. `highlightCode(): void` reads the current input, delegates rendering, and schedules layout synchronization.
- Browser test entry: `runRenderingChecks(tab): Promise<{ passed: number, scope: string }>`.

- [ ] **Step 1: Add browser rendering regressions and a dependency failure test.** Assert JS multiline comments, template literals, Python triple-quoted strings, multiline HTML attributes, and Markdown fenced blocks retain full lexical scopes across rows. For each fixture assert row count equals `input.split('\n').length`, `.lc` text joined with `\n` equals the textarea value exactly, and each row has exactly its number and code cell with no orphan text. Include empty input, trailing blank lines, `\t`, Thai, emoji, `&`, `<img onerror=...>`, and `</script>`; assert no executable elements are created. Add `initializes_readable_preview_without_highlighter` and `renders_plain_text_when_highlighting_throws` to the VM suite.
- [ ] **Step 2: Run the failures against the existing page.** Serve the repo with `python3 -m http.server 8765 --bind 127.0.0.1`, import the browser module in CUA, and call `runRenderingChecks(tab)`. Run `node --test --test-name-pattern='highlighter|highlighting' tests/code-canvas-failures.test.cjs`. Expect broken row/text assertions and failed initialization fallback.
- [ ] **Step 3: Implement `renderCodeRows(code: string, language: string): void`.** Highlight the full source once, parse the resulting escaped markup into a detached fragment, and traverse text and spans, closing/reopening the active ancestor spans at newline boundaries. Create empty code cells without inserting synthetic spaces. If the library/grammar is unavailable or throws, build rows using source text nodes. Initialize the sample before the first render.
- [ ] **Step 4: Repeat the focused browser and VM checks.** Expect exact source round trips, retained token classes on continuation lines, and readable dependency fallback. Run all five built-in samples through the same row checks.
- [ ] **Step 5: Commit the renderer repair and its regression checks.** Suggested message: `fix: preserve multiline code canvas rendering`.

### Task 2: Align editing geometry and resynchronize size changes

**Files:**
- Modify: `categories/projects/code-snippet/CodeSnippet.html:350-370,672-763,1038-1044,1587-1613,1727-1780`
- Modify: `tests/code-canvas.behavior.test.mjs`

**Interfaces:**
- Consumes: balanced rows from Task 1 and `lineNumbersVisible: boolean`.
- Produces: `syncEditorLayout(): void`, coalescing pending animation-frame work to synchronize textarea width, text inset, height, and any internal scroll offset with the preview. Retain `syncTextareaHeight(): void` as a delegating wrapper until all call sites are migrated.
- CSS interface: container `--code-font-size`, `--code-line-height`, `--code-gutter-width`, `--code-padding-right`, and `--code-tab-size`; both layers consume the same values. No gutter width is written to individual rows.
- Browser test entry: `runLayoutChecks(tab, viewport): Promise<{ passed: number, scope: string }>`.

- [ ] **Step 1: Add geometry regression checks.** At 375, 640, 641, and 1000px, compare computed font family/size/weight/style, line height, tab size, wrapping rules, and text-start X within 1px. Check 9/10/99/100/999/1000-line inputs and numbers on/off; hidden gutter width must be zero. A 200-character first line followed by `SECOND` and `THIRD` must keep textarea height at least preview height after viewport changes without typing. Exercise tab indentation and bold/italic token classes, dragging then shrinking the viewport, and returning from mobile to desktop. Verify `aria-pressed` and canceled drag state.
- [ ] **Step 2: Run `runLayoutChecks(tab, viewport)` against the current implementation.** Expect font mismatch, nonzero hidden gutter, and stale height failures. Use fresh DOM geometry observations after each deterministic UI action.
- [ ] **Step 3: Implement shared CSS geometry and `syncEditorLayout(): void`.** Calculate gutter width from number digits plus padding using the shared font metrics; numbers-off state sets the container gutter variable to zero. Remove gutter width transitions that temporarily desynchronize the layers. Use consistent normal token weight/style, shared wrapping/tab rules, explicit textarea width, and breakpoint-driven shared font variables. Observe container size and schedule synchronization after `document.fonts.ready`; schedule one measurement per frame. Clamp desktop width to the viewport and clean up drag state on cancellation/blur.
- [ ] **Step 4: Repeat layout and rendering checks.** Expect geometry tolerances to pass and no orphan text or wrapping drift. Check late font loading with a cold browser load; record separately if the browser cannot reproduce delayed fonts.
- [ ] **Step 5: Commit the layout repair and checks.** Suggested message: `fix: align code canvas editing and preview layout`.

### Task 3: Preserve the snippet during language and theme selection

**Files:**
- Modify: `categories/projects/code-snippet/CodeSnippet.html:1507-1548,1618-1621,1786-1797`
- Modify: `tests/code-canvas.behavior.test.mjs`

**Interfaces:**
- Consumes: `highlightCode(): void` and the native textarea as the source of truth.
- Produces: `setLanguage(lang: string): void`, preserving value, selectionStart, selectionEnd, and selectionDirection while updating filename, active/pressed language state, and rendering. Initialization alone assigns `SAMPLE_CODE.html`.
- Browser test entry: `runLanguageChecks(tab): Promise<{ passed: number, scope: string }>`.

- [ ] **Step 1: Add language-state checks.** Paste `const pasted = "KEEP ME";\n`, select a substring through native keyboard input, click the current language, then each other language. Assert exact value and selection offsets survive and filename/active pill reflect the selected grammar. Repeat all five themes and assert source preservation. Test switching language while the highlighter is unavailable through the VM fixture.
- [ ] **Step 2: Run `runLanguageChecks(tab)`.** Expect the same-language and different-language value-preservation assertions to fail against sample-replacing behavior.
- [ ] **Step 3: Implement nondestructive `setLanguage(lang: string): void`.** Remove sample assignment from this function and initialize the sample once in `init()`. Treat `codeInput.value` as authoritative; remove redundant `currentCode` state if no remaining reader needs it. Reject unsupported internal language values without changing user text. Preserve selection and expose selected language through `aria-pressed`.
- [ ] **Step 4: Repeat state and rendering checks.** Expect exact text/selection preservation, correct filenames, and readable grammar fallback.
- [ ] **Step 5: Commit the state repair and checks.** Suggested message: `fix: preserve snippets when switching canvas language`.

### Task 4: Make copying guarded and recoverable

**Files:**
- Modify: `categories/projects/code-snippet/CodeSnippet.html:1628-1716`
- Modify: `tests/code-canvas-failures.test.cjs`
- Modify: `tests/code-canvas.behavior.test.mjs`

**Interfaces:**
- Consumes: `syncEditorLayout(): void`, current theme/language, optional `html2canvas`, optional `ClipboardItem`, and optional `navigator.clipboard.write`.
- Produces: `captureCodePng(): Promise<Blob>` (wait for fonts/layout, render the code window, reject absent renderer or null PNG); `downloadPng(blob: Blob, language: string): void` (object URL download, scheduled URL cleanup); and `copyAsImage(): Promise<void>` (one in-flight operation, immediate gesture-scoped clipboard registration, copy/download/error state).
- `showToast(message: string): void` replaces its prior dismissal timer; a separate button reset timer cannot overwrite a newer operation.

- [ ] **Step 1: Add export fault regressions.** Execute the actual inline script in the VM. Assert `registers_clipboard_write_before_capture_resolves`, `downloads_on_clipboard_rejection`, `downloads_without_clipboard_item`, `downloads_without_clipboard_api`, `captures_once_for_repeated_shortcuts`, `rejects_null_png`, `recovers_after_capture_failure`, and `reports_download_as_downloaded`. Use a deferred capture promise; verify one shared blob identity, no download on successful copy, no success on capture failure, and restored button/guard state after failure. Include missing html2canvas and stale toast/button timer behavior.
- [ ] **Step 2: Run `node --test tests/code-canvas-failures.test.cjs`.** Expect gesture ordering, fallback, and concurrent operation assertions to fail before the repair.
- [ ] **Step 3: Implement the export interfaces.** Acquire the guard before any await. Construct one PNG promise and synchronously pass it into `ClipboardItem` and `clipboard.write` when PNG clipboard capabilities exist, catching synchronous construction errors and asynchronous write failures. Reuse the resolved PNG for download recovery. Do not convert a failed capture into a second capture or an invalid data URL. Use accurate `Copied!`/`Downloaded!` labels, restore the guard through `finally`, and replace old feedback timers. Preserve existing transparent export appearance.
- [ ] **Step 4: Run the complete failure suite and perform real browser export checks.** Confirm a PNG reaches the clipboard and inspect the image for complete code rows, selected theme, filename, and absent editing overlay. Compare line numbers on/off. Run all three CUA regression groups. Verify Safari/WebKit if an available browser supports it; otherwise record the gesture-order test and vendor documentation as evidence without claiming Safari execution. Check a large 1000-line paste for editing and an explicit capture error recovery if canvas limits are reached.
- [ ] **Step 5: Commit the export repair and final validation record.** Suggested message: `fix: recover code canvas image exports and block duplicates`.

## Self-review and scrutinize-9arm gate

All eight audit findings map to Tasks 1–4; all five review-focus conditions have owning checks. Renderer and layout tests use real browser DOM, while VM doubles are restricted to explicit dependency/export fault routing. No new production files, editor framework, sample picker, opaque-background redesign, or build system is required.

The simpler alternative pass keeps the existing app structure. The proposed trace is input → full-source highlight or safe fallback → balanced rows → shared layout → guarded capture → immediate clipboard registration → copy or same-blob download. This closes the demonstrated failure paths. The main remaining external limit is browser-specific clipboard/canvas behavior; the final report must state which real browsers were exercised.

Verdict: the plan is ready for review before execution. Implementation has not started.
