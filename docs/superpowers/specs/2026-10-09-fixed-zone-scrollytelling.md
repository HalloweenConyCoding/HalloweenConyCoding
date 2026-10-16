# Fixed-zone portfolio scrollytelling design

Status: implemented in the current checkout on 2026-10-10; pending human visual review.

## Intent

Keep three groups: A intro, B collection with four topics, C contact. Each group occupies a fixed viewport stage while scrolling advances its story. It moves out as the next group enters. This supersedes the existing prohibition on pinned chapters for capable desktop viewports; native scrolling remains mandatory.

## Global constraints

- Edit the current checkout; preserve `backup/` and unrelated changes.
- Scope is the root profile homepage; do not change project subpages.
- Use checked-in GSAP and ScrollTrigger; no CDN or new runtime dependency.
- Keep native scroll; no wheel interception, scroll snapping, or simulated scroll position.
- Preserve existing section IDs, links, biography paragraphs, public preview assets, and the 8-second name wipe.
- Use approved public or demo imagery only; do not copy private workspace data.
- Maintain one continuous fixed wallpaper, independent decorative parallax layers, and viewport-wide color filters.
- Keep content readable without JavaScript, without GSAP, with reduced motion, and with forced colors.
- Do not commit, push, or deploy without user authorization.

## Stage and sequence

Let H be the usable viewport height below the measured header. Desktop enhancement requires width >= 1024px and H >= 640px. All scenes must fit H with a 24px vertical safety margin; otherwise use native flow for the whole page. Measure after fonts and images settle, and again on resize.

Each zone owns a `.story-stage` inside its existing `.profile-zone`. Only these stages are pinned, below the header; scenes inside remain semantic sections or articles. No nested pins. A and B use explicit zone heights with `pinSpacing:false`; contact uses `pinSpacing:true` and its outer zone grows with the pin spacer so the footer follows the stage without overlap. Entering the next zone releases the previous stage upward with normal scrolling; a broad crossfade softens the visual handoff. Do not overlap pointer-active zones.

Initial scroll budget, excluding the natural handoff: A = 1.5H, B = 8H, C = 1H. These are scroll distances, not timer durations. The final contact remains visible at the document bottom; footer follows naturally after the contact pin spacer. User testing may adjust distances without changing the sequence.

| Stage | B progress | Behavior |
|---|---:|---|
| Archive / Radio | 0–.20 | Radio rises from below with opacity 0→1, decelerates and settles vertically; archive title stays readable. |
| Archive / Task + Code | .20–.40 | Task enters from right, Code from left, opacity 0→1. Opposing motion evokes crossing paths without obscuring card text. Final x=0, no sideways bounce. |
| Workbench | .40–.68 | Left topic+heading, Body1, Body2, story link appear in sequence. Right skills card enters from right concurrently. |
| Operating atlas | .68–.88 | Team text and portraits arrive together, then hold. |
| Horizon | .88–1 | Final collection topic enters and holds before contact. |

Within each B interval, first 25% is entrance, middle 55% is readable hold, final 20% is exit. Initial Radio entrance begins at B entry, so scrolling starts its reveal when it is actually in view. Preserve the requested up/right/left directions. Use bounded vertical settlement up to 6px for Radio only; no elastic horizontal easing. Workbench text beats occupy the first 40% of its interval, followed by a 40% hold and 20% exit.

A starts fully visible on first load, holds for its first 80%, then fades and rises up to 48px. C enters over its first 25%, then holds through the bottom. Entry and exit opacity/transform are determined by progress; scrolling backward reconstructs the same states. Use GSAP scrub 0.6 seconds, not independently timed `play()` reveals. Do not animate any scene after its hold position settles.

## Background and header

Keep the currently approved wallpaper, full viewport coverage including at the bottom. Intro light tint stays fixed to the screen. Fade it out across the A→B handoff, starting 0.35H before B arrives and ending 0.65H after B arrives. Apply the contact warm tint over the equivalent B→C interval. Use continuous smoothstep interpolation, normal blending, and no section-local image or rectangular tint edges.

One controller owns these tint opacities. Decorative parallax retains its existing separate ownership. Header uses the same continuous tone value: switch light/dark at .65/.35 hysteresis thresholds, retaining state between them. A monotonic scroll through either boundary must cause at most one theme switch. Geometry must not be recomputed from animated child rectangles.

## Interaction and fallback

Retain existing nav and mobile menu. Provide compact Previous/Next scene controls within the pinned stage, with visible focus and a textual scene indicator; no floating chapter rail. These let keyboard users reach every scene. Native anchors and browser history resolve to the beginning of the relevant readable hold, then focus the original destination section. Keep actual scroll position as the source of truth.

Add `id="story-tools"` to the paired tools scene so it also has a navigable destination. Preserve all six original section IDs. Previous/Next traverses seven scenes, including this additional archive beat.

Only the active scene participates in focus and accessibility trees; outgoing decorative fades are inert. Do not hide a scene containing keyboard focus: move focus to the next scene heading when a navigation action changes scene, or retain the focused scene until focus leaves during pointer scrolling. Once focus leaves, reconcile to current scroll progress. Controls always remain operable.

Keep the biography as native `details`. Opening it switches the whole homepage to natural flow for the remainder of that visit, preserving the summary's viewport position and focus. All four paragraphs then expand normally. Closing it does not automatically repin or cause a jump. Reload can restore enhanced mode. Do not introduce an internal scrollbar or modal just to fit it into a pinned frame.

Short/narrow viewports, reduced motion, forced colors, failed runtime, or an oversized scene use visible native flow. No hidden content is allowed before successful initialization. Live preference changes tear down pins and restore styles, inert states, and usable anchors. Resize rebuilds preserve the semantic scene and local progress when eligible; falling back preserves the current heading position rather than a stale absolute scroll offset.

## Acceptance

- A, all five B scenes covering four topics, and C are independently readable and navigable.
- Slow forward/reverse scrolling produces corresponding states and repeatable reveals; settled cards do not shake.
- Both color boundaries blend without hard lines or blinking during small touchpad reversals or monotonic scrolling.
- Wallpaper covers the full screen throughout, with observable independent depth motion.
- No horizontal overflow, unreachable content, focus on invisible controls, nested pin spacers, or duplicate animation writers.
- Native flow retains original content and links under every fallback.
- Validate desktop, short desktop, mobile, resize, restored scroll, direct hashes, keyboard, biography expansion, and preference changes in a real browser.
