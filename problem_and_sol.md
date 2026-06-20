# GSAP Chapter-Pin Integration: Problems & Solutions

## Context

Codex was asked to upgrade the main page from continuous scrolling to GSAP-powered pinned-section scrolling with a chapter navigation rail and per-section motion choreography.

**What Codex delivered (all uncommitted):**
- `mainpage_component/profile_motion.js` (422 lines) — pinned chapter system with ScrollTrigger
- `mainpage_component/gsap/` — 30+ GSAP plugin files (only 3 are used)
- Modified `index.html` — added chapter-rail aside, rewired nav scroll to use GSAP, added script tags
- Modified `profile_style.css` — changed `scroll-behavior` from `smooth` to `auto`, added chapter-rail CSS, chapter-mode styles, motion-ready reveal system, `isolation` on sections, `will-change` hints

**Symptom reported:** page is laggy with strange component behavior, and the intended "obvious separated sections while scrolling" effect doesn't appear.

---

## ⚠️ Read this first — the keystone finding

**Chapter/pin mode currently never activates. The entire GSAP timeline & pinning system is dead code at runtime.**

Why: `.section` has `min-height: 100vh` (`profile_style.css` line 951), so every section's measured height is always ≥ the viewport. The activation guard `canUsePinnedChapters()` (`profile_motion.js` lines 59-66) requires *every* section to fit within `window.innerHeight − 24px`. That condition can essentially never be true, so the desktop branch always falls through to `revealNaturally()` (`profile_motion.js` line 324-325) and the pin/timeline code at lines 339-390 never executes.

**Consequences for triage:**
- This is the #1 reason the **intended redesign effect is missing** — see **C1**.
- Several issues are therefore **LATENT**: they are real bugs, but they only fire *once C1 is fixed and chapter mode actually runs*. These are **C3** and **H1**. They must be fixed *in the same change* as C1, otherwise enabling pinning will immediately expose them.
- The issues that are **active right now** (independent of chapter mode) are: **C2** (dual nav handlers — always wired), **L1** (dead chapter-rail UI on screen), and the perf items **M1/M2**.

**On the "lag" specifically:** with chapter mode dead, the heaviest *continuous* cost on scroll is **pre-existing**, not new from Codex — see the **Performance note** below. Codex's additions mostly add jank on nav-click (C2) and a non-functional UI (L1). Confirm the real frame-time cost with DevTools Performance profiling before assuming any single fix removes all lag.

---

## Quick Reference

| # | Severity | State | File(s) | Issue | Fix Type |
|---|----------|-------|---------|-------|----------|
| C1 | CRITICAL | Active | `profile_motion.js` | `canUsePinnedChapters()` guard never passes → pin mode is dead code | Senior Review |
| C2 | CRITICAL | Active | `index.html` + `profile_motion.js` | Two nav click handlers both fire → competing scroll tweens | Codex |
| C3 | CRITICAL | Latent (after C1) | `index.html` + `profile_motion.js` + `profile_style.css` | Inline `updateAtmosphere()` fights pinning (transform flip-flop + offset-based blend math) | Codex (+ small senior note) |
| H1 | HIGH | Latent (after C1) | `profile_motion.js` + `profile_style.css` | All reveals forced visible instantly in chapter mode → reveal system does nothing | Senior Review |
| H2 | HIGH | Active | `profile_style.css` | `scroll-behavior: auto` removes fallback smooth scrolling if GSAP fails | Codex |
| M1 | MEDIUM | Active | `index.html` + `profile_style.css` | 200+ CSS-animated particles run continuously regardless of visibility | Codex |
| M2 | MEDIUM | Active | `profile_style.css` | Multiple fixed layers with `backdrop-filter: blur()` (extra layer when pinning is on) | Senior Review |
| L1 | LOW | Active | `index.html` + `profile_style.css` | Chapter rail always visible even though chapter mode never runs / on mobile | Codex |
| L2 | LOW | Active | `mainpage_component/gsap/` | 25+ unused GSAP plugin files shipped | Codex |

---

## Performance note (where the real continuous cost is)

The page reads layout on **every scroll frame**, which is the most likely source of perceived lag. This is **pre-existing** code (not introduced by Codex), but it matters because the goal is a smooth page:

- `index.html` `updateAtmosphere()` (~lines 458-519) reads `document.documentElement.scrollHeight`, plus `offsetTop`/`offsetHeight` of three sections, on each `requestAnimationFrame` during scroll. These reads force layout. Reads happen before writes in the same frame (so it's ~one reflow/frame, not catastrophic), but it runs constantly.
- 120 stars + 60 dust motes + 24 gear teeth (200+ elements) animate via CSS keyframes continuously — see **M1**.

When you (or Codex) profile, expect the dominant cost to be these, combined with `backdrop-filter` compositing (**M2**). Fixing M1/M2 will give the biggest measurable frame-time win; C2/C3 fix *correctness/jank*, not steady-state cost.

---

## Detailed Problems & Solutions

### CRITICAL

---

#### C1: `canUsePinnedChapters()` guard never passes → pin mode is dead code

**State:** Active (this is the keystone).

**Symptom:** The intended pinned, separated-section scroll effect never appears. The page behaves like a normal scroller. The chapter-rail renders but is decorative.

**File:** `mainpage_component/profile_motion.js`, lines 59-66 (guard), interacting with `profile_style.css` line 951 (`.section { min-height: 100vh }`).

**Root cause:** The guard requires every section's content to fit within `window.innerHeight − 24px`:

```js
function canUsePinnedChapters(shells) {
  var viewportBudget = Math.max(1, window.innerHeight - 24);
  return shells.length === sections.length && sections.every(function(section, index) {
    var shell = shells[index];
    return !!shell && getChapterContentHeight(section, shell) <= viewportBudget;
  });
}
```

`getChapterContentHeight()` returns `Math.max(section.scrollHeight, shell.scrollHeight, shell rect height)`. Because `.section { min-height: 100vh }`, `section.scrollHeight` is always ≥ the viewport, so the result is always > `innerHeight − 24`. The guard returns `false` on every realistic screen, so the desktop branch always calls `revealNaturally()` and bails before creating any pinned timeline.

**Solution (mechanical part):** Replace the height-fitting guard with a simple shell-existence check. Pinning is *designed* for sections taller than the viewport — `pin: true` holds the section while the user scrolls through extra distance defined by `end`.

```js
function canUsePinnedChapters(shells) {
  return shells.length === sections.length && shells.every(Boolean);
}
```

Then make the per-section scroll distance scale to content. In the ScrollTrigger config (currently `end: index === sections.length - 1 ? '+=80%' : '+=118%'`, line 353), use a function so tall sections get enough scroll runway:

```js
end: function () {
  var contentH = Math.max(section.scrollHeight, window.innerHeight);
  var extra = index === sections.length - 1 ? 0.8 : 1.18;
  return '+=' + Math.round(contentH * extra) + 'px';
}
```

(`section` and `index` are in scope from the enclosing `shells.forEach(function (shell, index) { var section = sections[index]; ... })`.)

**🔶 Decision needed (Senior — do this before Codex touches C1):**
Pinning *all four* sections with `min-height: 100vh` each produces a very long page and a strong "stop-and-play per section" feel. Decide:
1. **Keep full pinning** of all sections (approve the guard + dynamic `end` above), or
2. **Pin only some** sections (e.g. hero/library + ai-team) and let the rest scroll normally, or
3. **Drop pinning entirely** and use scroll-triggered reveals per section (lighter, less janky, no pin-spacing math).

This choice changes how C3 and H1 are implemented, so resolve it first.

---

#### C2: Two nav click handlers both fire → competing scroll tweens

**State:** Active now (runs regardless of chapter mode).

**Symptom:** Clicking a nav link or chapter dot produces a scroll that starts, then jerks/re-targets before settling.

**Files:**
- `index.html` lines 681-693 — inline `bindSectionLink()` → `scrollToSectionById()`, bound to every `.nav-link` and `.chapter-dot`.
- `profile_motion.js` lines 114-145 (`wireChapterNavigation()`), called **unconditionally** at line 305 (before any guard), binding a second handler to the same anchors.

**Root cause (corrected mechanism):** Both handlers are attached to the same anchor element (the event target). The inline handler is registered first (inline script runs before `profile_motion.js` loads at the end of the body); the motion handler is registered second with the capture flag. **At the event target, listeners run in registration order regardless of the capture flag** — so the inline handler runs *first*, then the motion handler. The motion handler's `stopImmediatePropagation()` therefore comes too late to suppress the inline one. Net result: **two `gsap.to(window, { scrollTo })` tweens start on the same click**, with different durations (1.05s inline vs 0.85s motion) and slightly different targets (`offsetTop − navHeight` vs `chapterScrollTarget()`), so they fight.

**Solution for Codex:**

1. **Remove `wireChapterNavigation()` entirely** from `profile_motion.js` — delete the function (lines 114-145) and its call (line 305). Keep all nav scroll logic in the inline script (single source of truth). After removal, check whether `reduceMotion` / `findChapterTrigger` / `chapterScrollTarget` are still referenced elsewhere; `chapterScrollTarget` and `findChapterTrigger` exist only to serve `wireChapterNavigation` and can also be removed if unused.

2. **Teach the inline `scrollToSectionById()`** (`index.html`) to prefer the GSAP ScrollTrigger position when chapter mode is active, so nav clicks land at the right pinned position:

```js
function scrollToSectionById(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  let y = target.offsetTop - getNavOffset();

  // In chapter mode, snap to the section's ScrollTrigger position.
  if (document.body.classList.contains('chapter-mode-active') && window.ScrollTrigger) {
    const trigger = window.ScrollTrigger.getAll()
      .find(t => t.trigger && t.trigger.id === targetId);
    if (trigger) {
      y = targetId === 'library'
        ? Math.max(0, trigger.start)
        : Math.max(0, trigger.start + (trigger.end - trigger.start) * 0.7);
    }
  }

  if (window.gsap && window.ScrollToPlugin) {
    window.gsap.to(window, {
      duration: 1.05, ease: 'power2.inOut', overwrite: 'auto',
      scrollTo: { y, autoKill: true }
    });
  } else {
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
```

> Note: C2 can be fixed **independently and first** as a quick correctness win — it does not depend on C1.

---

#### C3: Inline `updateAtmosphere()` conflicts with pinning

**State:** Latent — only fires once C1 enables chapter mode. **Fix in the same change as C1.**

**Symptom (after C1 is enabled):** The grand clock and sunbeams jitter during scroll, and the library↔celestial background crossfade triggers at the wrong scroll positions.

**Files:**
- `index.html` lines ~502-516 — `updateAtmosphere()` writes `atmosLib.style.opacity` / `atmosCel.style.opacity` (blend) and `clockGrand.style.transform` / `sunbeams.style.transform` (parallax) every frame.
- `profile_motion.js` lines 155-163 & 196-221 — GSAP `setInitialChapterState()` / `addChapterChoreography()` animate the *same* clock & sunbeams via `xPercent`/`yPercent`/`rotate`.

**Root cause:** Two problems once pinning runs:
1. **Transform flip-flop:** every frame, the inline script overwrites the `transform` GSAP just set on the clock/sunbeams (and vice versa) → visible jitter.
2. **Blend math breaks under pinning:** the opacity crossfade is computed from `offsetTop`/`offsetHeight` of sections, but `pin: true` + `pinSpacing` insert spacer elements and shift those offsets, so the light→dark crossfade no longer lines up with what's on screen.

**Solution for Codex — make GSAP/CSS the single source of truth when pinned:**

1. In `updateAtmosphere()`, **early-return when chapter mode is active** so the inline script stops writing both opacity and transform:

```js
function updateAtmosphere() {
  if (document.body.classList.contains('chapter-mode-active')) { ticking = false; return; }
  // ... existing blend + parallax code unchanged ...
}
```

2. Because inline styles set previously will otherwise stick, **clear them when entering chapter mode**. In `profile_motion.js`, right after `body.classList.add('motion-ready', 'chapter-mode-active')` (line 330):

```js
['atmosLib', 'atmosCel', 'clockGrand', 'sunbeams'].forEach(function (id) {
  var elx = document.getElementById(id);
  if (elx) elx.style.cssText = elx.style.cssText
    .replace(/(opacity|transform)\s*:[^;]+;?/g, '');
});
```

   (Or simpler: `gsap.set('#atmosLib, #atmosCel', { clearProps: 'opacity' })` and let the clock/sunbeams be owned by the timeline.)

3. **Drive the library↔celestial crossfade from CSS** using the existing `body.chapter-mode-dark` class (already toggled by `setDarkMode()` on each section's `onEnter`). Add to `profile_style.css`:

```css
body.chapter-mode-active .atmosphere-library,
body.chapter-mode-active .atmosphere-celestial {
  transition: opacity 0.6s ease;
}
body.chapter-mode-active.chapter-mode-dark  .atmosphere-library  { opacity: 0; }
body.chapter-mode-active.chapter-mode-dark  .atmosphere-celestial { opacity: 1; }
body.chapter-mode-active:not(.chapter-mode-dark) .atmosphere-library  { opacity: 1; }
body.chapter-mode-active:not(.chapter-mode-dark) .atmosphere-celestial { opacity: 0; }
```

**🔶 Small senior note:** the CSS crossfade is a hard light/dark switch per section, vs the current smooth scroll-linked blend. If you want the *gradual* blend preserved under pinning, that's a design call — it would mean driving opacity from a dedicated ScrollTrigger `onUpdate` instead of a class. Confirm which feel you want.

---

### HIGH

---

#### H1: Reveals are forced visible instantly in chapter mode → reveal system does nothing

**State:** Latent — only fires once C1 enables chapter mode. **Fix in the same change as C1.**

**Symptom (after C1):** Inside pinned sections, `.reveal` elements are already visible from the start, so the blur/translate reveal never plays. The IntersectionObserver reveal is bypassed.

**Files:**
- `profile_motion.js` lines 330-337 — bulk-adds `visible` to every `.reveal` the moment chapter mode starts.
- `profile_style.css` lines 1768-1779 — `.motion-ready .reveal { opacity: 0; ... }` / `.motion-ready .reveal.visible { opacity: 1; ... }`.

**Root cause:** Codex gates reveals behind `.motion-ready` (good), but then immediately marks them all `visible`, defeating the gating. The GSAP timelines animate sub-elements (`.lib-card`, `.cel-card`, `.ai-team-card`), not the `.reveal` wrappers — so the two systems overlap awkwardly.

**🔶 Solution options (Senior decision):**

- **Option A — GSAP owns the reveal, per section:** remove the bulk `visible` loop (lines 333-337) and add `visible` to that section's `.reveal` children inside the section's ScrollTrigger `onEnter`. Each section gets a reveal moment as it pins. (Implementation is mechanical once approved.)
- **Option B — content always visible, GSAP does all motion:** keep content visible (drop the `.motion-ready .reveal { opacity: 0 }` rule so there's never a hidden state) and rely solely on the GSAP choreography for movement. Simplest, no flash-of-hidden-content risk.

Pick based on the storytelling pace you want; this depends on the C1 decision (full pinning vs partial vs reveals-only).

---

#### H2: `scroll-behavior: auto` removes the no-GSAP fallback

**State:** Active.

**Symptom:** If GSAP fails to load (blocked script, error), nav clicks jump instantly instead of scrolling smoothly.

**File:** `profile_style.css` line 72 (`html { scroll-behavior: auto; }`).

**Root cause:** Codex set `auto` to avoid CSS smooth-scroll fighting `gsap.to(window, { scrollTo })`. Correct intent, but it also removes the fallback when GSAP is absent.

**Solution for Codex:**

1. Restore the default in `profile_style.css`:
```css
html { scroll-behavior: smooth; }
```
2. In `profile_motion.js`, once GSAP + ScrollToPlugin are confirmed registered (after line 14), disable CSS smooth-scroll programmatically:
```js
document.documentElement.style.scrollBehavior = 'auto';
```
3. Restore it in the `mm.add()` cleanup (lines 395-404):
```js
return function () {
  document.documentElement.style.scrollBehavior = '';
  // ...existing cleanup
};
```
Result: GSAP present → CSS smooth disabled (GSAP drives scroll); GSAP absent → CSS smooth-scroll fallback works.

---

### MEDIUM

---

#### M1: 200+ CSS-animated particles run continuously regardless of visibility

**State:** Active. This is one of the larger steady-state costs (see Performance note).

**Symptom:** Scroll jank on mid-range hardware; the compositor animates off-screen particles forever.

**Files:** `index.html` — stars (lines 533-555), dust motes (558-584), gear teeth (587-601). Containers: `.star-field` (`#starField`, inside `.atmosphere-celestial`) and `.dust-field` (`#dustField`, inside `.atmosphere-library`).

**Root cause:** CSS `@keyframes` (`twinkle`, `dust-float`, gear rotation) never pause, even when the layer they live in is fully faded out.

**Solution for Codex:**

1. Add containment in `profile_style.css`:
```css
.star-field, .dust-field { content-visibility: auto; }
```
2. Pause whichever particle layer is faded out. In `updateAtmosphere()`, after the opacity writes (~line 503) — and **only in the non-chapter-mode path**, since C3 makes that function early-return in chapter mode:
```js
// blend: 0 = full library (light), 1 = full celestial (dark)
if (starField) starField.style.animationPlayState = blend > 0.05 ? 'running' : 'paused';
if (dustField) dustField.style.animationPlayState = blend < 0.95 ? 'running' : 'paused';
```
   (Stars belong to the dark layer → run when blend is non-zero; dust belongs to the light layer → run until fully dark.) For chapter mode, pause/resume them in `setDarkMode()` instead, keyed off `chapter-mode-dark`. Verify `animation-play-state` set on the container actually cascades to the children; if not, apply it to a CSS class on the container that targets `.star`/`.dust-mote` children.

---

#### M2: Stacked `position: fixed` layers with `backdrop-filter: blur()`

**State:** Active (an extra fixed layer is added while pinning, once C1 is on).

**Symptom:** GPU/compositing pressure and frame drops, especially on weaker GPUs.

**Files (`profile_style.css`):** `.atmosphere` (fixed, ~line 100), `.nav` (fixed + `backdrop-filter: blur(16px)`, ~line 672+), `.chapter-rail` (fixed + `backdrop-filter: blur(12px)`, ~line 821+). GSAP pin adds a fixed-positioned section on top while active.

**Root cause:** Each `backdrop-filter` forces a separate compositing layer that re-samples everything behind it every frame. Multiple overlapping blurred fixed layers multiply the cost.

**🔶 Solution options (Senior decision — visual trade-off):**
- **A:** Drop `backdrop-filter` on `.chapter-rail`, use a higher-opacity solid: `background: rgba(253, 246, 227, 0.88);` (and remove `-webkit-backdrop-filter`).
- **B:** Keep blur but add `contain: layout style paint;` to `.nav` and `.chapter-rail` to bound repaints.
- **C:** Reduce blur radius (e.g. `blur(4px)`) — much cheaper than 12–16px while keeping some glass feel.

Pick based on how important the glassmorphism is to you.

---

### LOW

---

#### L1: Chapter rail always visible even though chapter mode never runs

**State:** Active. Currently the rail shows on every screen as decoration.

**Symptom:** A fixed sidebar (desktop) / bar (mobile) occupies space with no working scroll-linked behavior.

**Files:** `index.html` lines ~164-184 (the `<aside class="chapter-rail">`), `profile_style.css` ~line 821+.

**Solution for Codex:** Gate visibility on chapter mode actually being active:
```css
.chapter-rail { display: none; /* ...existing styles... */ }
body.chapter-mode-active .chapter-rail { display: flex; }
```
Decide the mobile behavior inside the existing `@media (max-width: 768px)` block (hide entirely, or show as a slim bottom progress bar only).

> Depends on C1: until C1 makes `chapter-mode-active` real, this correctly hides the rail.

---

#### L2: 25+ unused GSAP plugin files shipped

**State:** Active (repo bloat only).

**Symptom:** ~500KB+ of unused minified JS in `mainpage_component/gsap/`.

**Solution for Codex:** Keep only the three files actually loaded by `index.html`:
- `gsap.min.js`
- `ScrollTrigger.min.js`
- `ScrollToPlugin.min.js`

Delete the rest.

---

## Implementation Order

Grouped by what must ship together. **Resolve the 🔶 senior decisions (C1, H1, C3-note, M2) before Codex starts each group.**

**Phase 0 — Quick independent win (Codex, no dependencies):**
1. **C2** — remove the duplicate nav handler. Fixes nav-click jank immediately.

**Phase 1 — Make chapter mode actually work (ship as ONE change):**
2. **C1** — fix the activation guard + dynamic `end`. *(Senior: choose pinning strategy first.)*
3. **C3** — stop `updateAtmosphere()` fighting the timeline; move crossfade to CSS.
4. **H1** — fix reveal handling. *(Senior: pick Option A or B.)*
5. **H2** — restore smooth-scroll fallback (small, fits naturally here).

> C3 and H1 are latent today but will break the moment C1 turns pinning on, so they cannot lag behind C1.

**Phase 2 — Performance (Codex + one senior call):**
6. **M1** — pause off-screen particles + `content-visibility`.
7. **M2** — reduce `backdrop-filter` cost. *(Senior: pick A/B/C.)*

**Phase 3 — Cleanup (Codex):**
8. **L1** — gate the chapter rail on `chapter-mode-active`.
9. **L2** — delete unused GSAP plugins.

---

## Task Assignment

### Codex Tasks (mechanical, well-specified — implement directly)

| Issue | What to do |
|-------|-----------|
| **C2** | Delete `wireChapterNavigation()` + its call from `profile_motion.js`; extend inline `scrollToSectionById()` to use ScrollTrigger position in chapter mode |
| **C1 (mechanical part)** | After senior approves strategy: swap the guard for `shells.every(Boolean)` and add the dynamic `end` function |
| **C3** | Early-return `updateAtmosphere()` in chapter mode; clear leftover inline styles on enter; add the CSS crossfade rules |
| **H2** | Restore `scroll-behavior: smooth` in CSS; set `auto` via JS when GSAP loads; restore on cleanup |
| **M1** | Add `content-visibility: auto`; pause faded-out particle layers via `animation-play-state` |
| **L1** | `.chapter-rail { display: none }` + `body.chapter-mode-active .chapter-rail { display: flex }` |
| **L2** | Delete all `mainpage_component/gsap/` files except `gsap.min.js`, `ScrollTrigger.min.js`, `ScrollToPlugin.min.js` |

### Senior Review Tasks (decide before / instead of Codex)

| Issue | Decision needed |
|-------|----------------|
| **C1** | Pin all sections, pin some, or drop pinning for plain scroll-reveals? Governs C3 + H1. |
| **H1** | Reveals = GSAP-triggered per section (A) or always-visible + GSAP-only motion (B)? |
| **C3 (note)** | Hard per-section light/dark switch, or preserve the gradual scroll-linked blend? |
| **M2** | Remove blur (A), contain it (B), or reduce radius (C) on the glass layers? |

---

## Verification (after each phase)

1. **C2:** click every nav link and chapter dot — scroll should be a single smooth motion, no jerk/re-target.
2. **C1:** confirm `document.body.classList.contains('chapter-mode-active')` is `true` on desktop and sections actually pin; check `ScrollTrigger.getAll()` returns one trigger per section.
3. **C3:** scroll through all sections watching the clock/sunbeams — no jitter; background light→dark crossfade lines up with the section on screen.
4. **H1/H2:** reveals play as intended; with GSAP scripts temporarily removed, nav clicks still scroll smoothly.
5. **M1/M2:** record a DevTools Performance trace while scrolling before and after — confirm reduced scripting/compositing time and steadier 60fps.
6. **Reduced motion:** set OS "reduce motion" and reload — page should fall back gracefully (content visible, no heavy animation).
