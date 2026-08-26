# Portfolio Story and Text Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the portfolio My Story copy with semantic colored emphasis, add the requested AIS left-to-right green-to-white gradient, and replace the root page’s ASCII ripple usage with the retained local vanilla ShinyText effect on `CHATCHON` and the hero role line, while pruning unused pasted library files.

**Architecture:** Keep the existing static HTML/CSS architecture. Retain the copied vanilla ShinyText library under `library/text/shiny_text`, load it from the root page, and configure each hero element through its data attributes. Keep the existing ASCII ripple implementation available for subpages that use it, but remove its root-page wiring because the root page will no longer contain ripple-marked text.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, local library assets, PowerShell validation, Node syntax checking, and the repository’s Graphify update command.

**Spec:** In-chat user-approved requirements from 2026-08-26; no separate spec file was requested.

## Global Constraints

- Work only in `C:\Beer\Programming\Personal_Project\HalloweenConyCoding` and inspect only `C:\Beer\Programming\Personal_Project\Code\Assigned_Project\CELL_ANTENNA DB\VERSION\ACTIVE\index.html` plus its directly corresponding CSS/JS/library files as read-only references.
- Preserve existing unrelated user changes in `README.md`, `index.html`, and generated Graphify output.
- Do not commit, push, or modify the external reference project.
- Delete only the explicitly listed unused pasted-library paths after inspecting the library inventory and confirming they have no current consumer in the target project; the user explicitly approved pruning this pasted library to the effect being wired.
- Keep the retained effect local; do not add a CDN dependency.
- Use semantic HTML for emphasis and preserve the requested visible wording; do not leave Markdown `**` markers in rendered HTML.
- Make `CHATCHON` slower than `Telecommunication Analyst • Radio Planner • Developer` by using ShinyText durations of `6.4s` and `3.2s`, respectively.
- Respect the existing reduced-motion behavior supplied by the retained ShinyText CSS.
- Run `graphify update .` after source changes, as required by the repository instructions.

---

## Task 1: Prune the pasted library to the effect actually used

**Files:**

- Keep `library/PROJECT.md`.
- Keep `library/text/shiny_text/shiny_text.css`.
- Keep `library/text/shiny_text/shiny_text.js`.
- Delete the exact unused paths listed below.

**Interfaces:** The root page will consume the vanilla `window.ShinyText` data-attribute interface from `shiny_text.js`; no React runtime or build step will be introduced.

- [ ] Re-list `library` recursively and verify the keep set before deletion.
- [ ] Delete only these unused directories/files:
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
- [ ] Update `library/PROJECT.md` so it documents the retained local vanilla ShinyText effect and does not claim the library is background-only.
- [ ] Verify the remaining library tree contains the keep set, no deleted path is referenced by the target project, and no React-only effect is referenced by the root page.

## Task 2: Replace My Story copy and add visual emphasis

**Files:**

- `index.html`
- `mainpage_component/profile_style.css`

**Interfaces:** `.bio-text`, `.highlight`, and `.teal` remain the existing visual language. Add `.bio-text .ais-gradient` as a scoped style for the AIS word.

- [ ] Replace the existing three My Story paragraphs with exactly these four semantic paragraphs:

```html
<p class="bio-text">I graduated in <strong>Electrical Engineering</strong> from <span class="highlight"><strong>Chulalongkorn University</strong></span>, with a focus on communications and telecommunications. Today, I work at <strong class="ais-gradient">AIS</strong> (Advanced Info Service Public Company Limited) in Thailand, where I support <strong class="teal">4G and 5G</strong> network planning and optimization.</p>
<p class="bio-text">Although my role is in telecommunications, much of the work I enjoy most involves <strong class="teal">data</strong>. I work with information from different sources, clean and validate datasets, analyse KPI trends, and create visualizations to support engineering decisions. Through both assigned and self-initiated projects, I have become increasingly interested in how data can be structured and used to solve practical problems.</p>
<p class="bio-text">When existing tools do not fit my team’s workflow, I build my own. Using <strong class="teal">Python, pandas, Excel, Power Query, QGIS, and Power BI</strong>, I have created tools for data processing, geospatial visualization, antenna analysis, KPI analysis, and workflow automation. My <span class="highlight"><strong>Radio Planning Tools</strong></span> project grew from this interest in combining technical knowledge, data, and software to make everyday work more effective.</p>
<p class="bio-text">I am still connected to telecommunications, but I am increasingly interested in developing further in <strong class="teal">data analytics</strong>. I enjoy taking complex information, making it more structured and understandable, and creating practical tools for the people who use them. I am also currently developing my <span class="highlight"><strong>SQL</strong></span> skills as I continue building toward this direction.</p>
```

- [ ] Add this scoped AIS gradient beside the existing `.bio-text` emphasis rules:

```css
.bio-text .ais-gradient {
  color: transparent;
  background: linear-gradient(90deg, #5b9828 0%, #8ec53d 48%, #ffffff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}
```

- [ ] Verify the four paragraphs contain the requested wording, visible emphasis classes, and no literal Markdown `**` markers.

## Task 3: Wire the retained ShinyText effect to the hero

**Files:**

- `index.html`

**Interfaces:** Load `library/text/shiny_text/shiny_text.css` in the document head and `library/text/shiny_text/shiny_text.js` near the end of the body. Use bare `data-shiny-text` attributes because the library auto-initializer requires the attribute to be present without a value.

- [ ] Add the local ShinyText stylesheet link in the document head.
- [ ] Replace the hero title and tagline with:

```html
<h1 class="hero-name" data-shiny-text data-shiny-color="#173b59" data-shiny-color-shine="#ffffff" data-shiny-speed="6.4" data-shiny-spread="110" data-shiny-direction="left">CHATCHON</h1>
<p class="hero-tagline" data-shiny-text data-shiny-color="#55718c" data-shiny-color-shine="#ffffff" data-shiny-speed="3.2" data-shiny-spread="110" data-shiny-direction="left">Telecommunication Analyst &bull; Radio Planner &bull; Developer</p>
```

- [ ] Remove any root-page `data-ascii-glitch` attribute from the hero and remove the root page’s ASCII ripple stylesheet/script tags; preserve the underlying `mainpage_component/vengeance_ui/ascii_glitch_ripple` files for subpages.
- [ ] Add the ShinyText script so both hero elements initialize on page load.
- [ ] Verify there are exactly two root-page `data-shiny-text` elements, the title speed is slower than the tagline speed, every local `href`/`src` in root `index.html` resolves to an existing file, and the task-planner subpage ripple files/hooks remain present.

## Task 4: Validate, refresh project memory, and hand off for human review

**Files:**

- `PROJECT.md`
- Generated Graphify files under `graphify-out/` as produced by the required update command.

- [ ] Capture the target’s initial `git status --short`, `git diff --name-only`, and diffs for existing modified files before implementation so unrelated work can be preserved and compared at handoff.
- [ ] Add a concise newest entry to `PROJECT.md` recording the story refresh, retained local ShinyText library, asymmetric hero speeds, and validation performed; do not add secrets or a chat transcript.
- [ ] Run `node --check library/text/shiny_text/shiny_text.js`.
- [ ] Run focused static checks for the four My Story paragraphs, required classes/text, exactly two ShinyText elements, speed ordering, absence of root-page ripple markers, existence of local assets, and preservation of the task-planner subpage ripple hooks.
- [ ] Run a browser smoke check against the local page after ShinyText initialization: both hero strings are visible, their computed animation durations are `6.4s` and `3.2s`, background clipping is active, and the console has no page errors.
- [ ] Repeat the browser smoke check with `prefers-reduced-motion: reduce` and confirm both hero strings remain readable with animation disabled.
- [ ] Run `git diff --check` from the target project.
- [ ] Run `graphify update .` from the target project and inspect the resulting status/diff.
- [ ] Review the final diff and status against the captured baseline to confirm only the requested source/library cleanup, project-memory update, generated Graphify changes, and the new plan are present; preserve unrelated pre-existing edits.
- [ ] Do not commit or push; stop at the human review gate.

**Validation command outline:**

```powershell
node --check library/text/shiny_text/shiny_text.js
git diff --check
graphify update .
git status --short
git diff --stat
```
