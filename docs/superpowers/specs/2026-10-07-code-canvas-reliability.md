# Code Canvas reliability audit and repair specification

Date: 2026-10-07 (Asia/Bangkok)

## Goal and scope

Make pasted code render faithfully, remain editable at every supported width, survive language selection, and export reliably. This is an audit of the existing Code Canvas implementation, not a claim that a recent change introduced these defects. The working tree was clean at the start; commit `c933f09` originally added the page.

Reviewed: the entire `categories/projects/code-snippet/CodeSnippet.html`, its portfolio link in `index.html:97`, and existing test conventions. No applicable `AGENTS.md` was found in the workspace ancestry or under the reviewed paths. There are no existing Code Canvas regression tests.

## Actionable findings

### [P1] Keep multiline highlighting markup balanced — CodeSnippet.html:1564

`highlightCode()` splits an HTML string at newlines without closing and reopening active token spans. Pasting `/* first line\nsecond line\nthird line */\nconst message = \`hello\nworld\`;\nconsole.log(message);` in JS produces unhighlighted comment continuation lines and a semicolon outside the final `.lc` cell. A multiline HTML attribute similarly moves `>safe & sound</div>` outside its code cell. This breaks wrapping, alignment, and exports. Browser DOM and screenshot reproduced both cases. Even the built-in Python sample fails the per-cell text comparison.

Repair: retain full-source lexical context, then traverse the highlighted fragment and create independent, balanced rows while carrying active span classes across newlines. Do not highlight each source line independently: that loses multiline lexical context.

### [P1] Align the editing layer with the visible code — CodeSnippet.html:741

With line numbers shown, the textarea starts its text 16px inside the container while code cells start after a different gutter width. At desktop width, a three-line fixture put code cells 28.80px inside the container. At 375px viewport width, the textarea font computes to 11.84px while code cells remain 13.12px: the mobile `.lc` rule loses to `.code-line .lc`. The caret, selection, and wrapped lines therefore refer to positions different from the visible text. Token italics and bold must also be considered when matching metrics.

Repair: use one shared set of text metrics, wrapping rules, tab stops, padding, and gutter measurements for both layers. Keep preview tokens at the same font weight and style as the native editing text. A mobile font variable should affect both layers equally.

### [P1] Preserve pasted code when choosing its language — CodeSnippet.html:1528

After pasting `const pasted = "KEEP ME";`, selecting Python immediately overwrites the textarea with its sample. Clicking the currently selected language also overwrites user work. This is an existing destructive UX behavior, demonstrated through the actual controls; the current comment explicitly describes sample loading. A syntax selector needs to change the interpretation of the user's snippet without deleting it.

Repair: initialize the HTML sample once; subsequent language selections preserve the exact textarea value and selection and update highlighting, filename, and active button. Adding a sample picker is outside this repair.

### [P2] Collapse the line-number gutter completely — CodeSnippet.html:1574

Each gutter receives an inline `width`, which wins against `.no-line-nums .ln { width: 0; }`. After disabling line numbers, the browser still measured a 21.59px invisible gutter for a three-line snippet. The preview shifts while the textarea does not. The current gutter formula also omits enough space for its padding plus digits.

Repair: set a shared gutter CSS variable on the container, account for digit width plus padding, and override that variable to zero when numbers are hidden. Remove per-row inline widths. Expose the toggle's state through `aria-pressed`.

### [P2] Resynchronize layout after viewport and font changes — CodeSnippet.html:1608

Height synchronization runs for edits, toggles, and handle drags, but not when viewport size or font metrics change. A 200-character line followed by `SECOND` and `THIRD` produced matching 127px heights at 1000px width. Narrowing to 375px grew the preview to 194px while the textarea stayed 127px. The editing surface cannot cover the full preview.

Repair: observe container size changes, synchronize after fonts become ready, coalesce layout work, and update both height and text inset. Use an explicit textarea width. Clamp retained desktop card width to the available viewport; clear drag state on touch cancellation and window blur.

### [P2] Render readable text when highlighting is unavailable — CodeSnippet.html:1560

`init()` calls `setTheme()` and therefore `hljs.highlight()` before it even loads the initial textarea value. Executing the actual inline script with the highlighting dependency absent throws `ReferenceError: hljs is not defined`; input and preview remain empty. Later highlighting exceptions similarly prevent preview updates while the textarea is transparent.

Repair: load initial text before rendering; protect highlighting with capability checks and an exception boundary. Use text nodes for a readable plain-text preview if the library or selected grammar is unavailable or throws. Never inject raw pasted code as HTML.

### [P2] Recover from clipboard failures and preserve user activation — CodeSnippet.html:1636

The copy path awaits a timer, capture, and PNG conversion before calling `clipboard.write()`. WebKit requires this call within a user gesture. This is a source-backed compatibility defect, not a Safari session reproduction. Independently, code-level execution with `write()` rejecting or `ClipboardItem` absent confirms that the catch path only reports failure and never reaches the advertised download fallback. Availability of `clipboard.write` alone does not establish PNG support.

Repair: call `clipboard.write()` within the initiating event using a `ClipboardItem` whose PNG data is a promise. Share the generated blob with a download fallback if capability detection, item construction, or clipboard writing fails. Distinguish copied, downloaded, and capture-failed outcomes; reject null blobs. Wait for fonts and stable layout before capture. Keep export scope limited to the code window.

References: [WebKit clipboard API](https://webkit.org/blog/10855/async-clipboard-api/), [WebKit async write issue](https://bugs.webkit.org/show_bug.cgi?id=244812), [Highlight.js API](https://highlightjs.readthedocs.io/en/latest/api.html).

### [P2] Prevent concurrent exports from the shortcut — CodeSnippet.html:1703

The loading CSS prevents pointer clicks but not Ctrl/Cmd+Enter. Executing two `copyAsImage()` calls concurrently starts two captures and two writes; there is no in-flight guard. Success timers can then reset the UI while another operation is still running.

Repair: acquire a synchronous in-flight guard shared by the button and shortcut, disable the button semantically during capture, and release the guard on every outcome. Replace stale success/toast timers rather than accumulating them.

## Requirements

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

## Evidence and limits

Browser checks used the local page through the Codex in-app browser. All five themes changed their accent without replacing the input. All five presets produced the expected number of rows; the Python preset already has malformed cell contents. HTML-like code was escaped: no pasted image or script element appeared in the preview. Thai text, emoji, tabs, blank lines, and a final newline remained present. A real clipboard PNG was generated successfully in this browser.

Code-level fault probes executed the actual inline script in a Node VM with explicit dependency/clipboard doubles; they verify failure routing and concurrency, not real browser permissions. Safari/iOS and Firefox were not exercised. Very large snippets, browser canvas limits, touch cancellation, and late font loading need implementation-stage checks; no unsupported performance finding is asserted here.

The exported header currently has a transparent background because the captured code window has no own background and capture uses `backgroundColor: null`. This is recorded as existing export appearance, not classified as a defect without a requested appearance change.

Screenshot: `assets/2026-10-07-code-canvas-before.png` shows the broken multiline comment and displaced semicolon.

## Scrutinize-9arm design verdict

The goal is faithful paste, edit, and copy behavior. The smallest suitable repair keeps the current standalone page, fixes row construction and shared layout metrics, preserves snippet state, and hardens the existing export path. Introducing an editor framework, a build system, or a second editing panel adds unnecessary surface.

Trace checks reject two superficially simple fixes: independently highlighting each line breaks multiline context, and changing only textarea padding leaves mobile typography, hidden gutters, font loading, and resize behavior unresolved. Clipboard fallback must cover rejection as well as API absence. Regression checks must use the actual highlighted DOM; mock-only rendering tests would miss browser HTML repair.

Verdict: fix-then-ship — malformed multiline token markup already corrupts the built-in Python preview and common pasted code.
