# Three-Zone GSAP Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group the homepage into intro, collection, and contact zones with slow zone tint blending and directional GSAP reveals for the three project cards.

**Architecture:** Keep native document scrolling and the existing rAF parallax controller. Add semantic zone wrappers, local GSAP/ScrollTrigger scripts, three fixed tint layers, and one ScrollTrigger timeline per project card. CSS remains the no-JS/reduced-motion fallback.

**Tech Stack:** HTML, CSS, vanilla JavaScript, local GSAP 3, local ScrollTrigger, Node assertion tests, CUA browser verification.

**Spec:** `docs/superpowers/specs/2026-09-18-three-zone-gsap-design.md`

## Global Constraints

- Preserve existing section IDs and navigation deep links.
- Use only local GSAP files already in `mainpage_component/gsap/`.
- Keep the galaxy wallpaper and project cards free of personal data.
- Reduced motion must skip GSAP movement and leave content visible.
- No horizontal overflow at mobile widths.

---

### Task 1: Add failing structural and motion contract tests

**Files:**
- Modify: `tests/profile_depth_layers.test.cjs`

- [x] **Step 1: Write failing assertions** for three zone wrappers, tint nodes, local GSAP/ScrollTrigger script order, and directional reveal attributes on Radio Planning Tools, Task Planner, and CodeSnippet.
- [x] **Step 2: Run the focused tests** and confirm they fail because the wrappers, scripts, tint nodes, and reveal attributes do not exist yet.

### Task 2: Restructure homepage markup into three zones

**Files:**
- Modify: `index.html`

- [x] **Step 1: Wrap the existing sections** in `profile-zone-intro`, `profile-zone-collection`, and `profile-zone-contact` while preserving every section ID.
- [x] **Step 2: Add local GSAP and ScrollTrigger scripts** before `profile_motion.js`.
- [x] **Step 3: Add three fixed tint nodes** inside `.profile-atmosphere` and directional reveal attributes to the three project cards.

### Task 3: Add zone spacing, tint, and reveal fallback CSS

**Files:**
- Modify: `mainpage_component/profile_style.css`

- [x] **Step 1: Add wrapper spacing** using viewport-relative margins/padding for the collection and contact boundaries.
- [x] **Step 2: Add tint layer styles** with low-opacity cream/blue/warm-cream colors and transitions.
- [x] **Step 3: Add final-state reveal fallback styles** that never hide content when JavaScript is absent or reduced motion is active.

### Task 4: Implement GSAP zone and card triggers

**Files:**
- Modify: `mainpage_component/profile_motion.js`

- [x] **Step 1: Change section discovery** to include sections inside zone wrappers.
- [x] **Step 2: Register ScrollTrigger conditionally** and create slow scrubbed zone tint crossfades.
- [x] **Step 3: Create the three card timelines** with transparent directional starts, power3 arrival, four-pixel overshoot, dampening, and reversible replay locking.
- [x] **Step 4: Exclude GSAP cards from the existing IntersectionObserver** and add reduced-motion/GSAP-unavailable fallbacks.

### Task 5: Verify and document

**Files:**
- Modify: `PROJECT.md`

- [x] **Step 1: Run static tests, syntax checks, and whitespace checks.**
- [x] **Step 2: Run CUA desktop and mobile checks** for loaded GSAP, pre/post trigger opacity and transform, tint interpolation, navigation, and overflow; reduced-motion remains covered by the controller's branch and CSS fallback.
- [x] **Step 3: Update the project log** with the final architecture and evidence.
