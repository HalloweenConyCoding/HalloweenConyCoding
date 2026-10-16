# Motion and Transition QA

## Why this exists

Scroll-linked motion can look correct during the entrance and still fail at the edges: clipped layers create visible bands, reveal timelines can keep writing transforms after the user thinks they finished, and a theme trigger at the exact document boundary can flash when a touchpad settles.

## Fixed-zone story checks added 2026-10-10

- Give each fixed zone one pin owner and one scrubbed timeline. Keep the zone's native document content as the fallback; add absolute scene placement and hide scene controls only after measured capacity passes. Never nest pins or intercept wheel input.
- Measure the usable stage below the live header and the tallest scene after fonts/images settle. Recheck after resize. If width, height, scene fit, reduced-motion, forced-colors, or GSAP setup fails, remove the pins and restore inline styles, inert/ARIA state, and natural reading order.
- Treat native `scrollY` as the sole progress source. Derive scene and tone from trigger start/end geometry so browser restoration, anchors, previous/next, reverse scrolling, and resize all resolve to the same state.
- Keep foreground transforms, theme-filter opacities, and header tone under one story controller while active. The navigation/parallax controller must stop its own reveal/tint writes during that period. Decorative parallax remains independently owned by the atmosphere controller.
- During pointer scrolling, an outgoing scene may stay accessible while it contains focus. Reconcile inert state when focus leaves, and keep its GSAP-owned targets at readable opacity and their settled transform while it is retained; inert/ARIA state alone does not prevent its exit timeline from fading focused content away. A navigation action should scroll to the readable hold, then focus its original semantic destination.
- Capture the biography summary's screen position on the summary click before the native `details` toggle expands. The later `toggle` event arrives after the disclosure's layout has changed; capture there and the summary can jump when pins are removed. Preserve that pre-toggle viewport top through teardown, retain summary focus, and do not repin after collapse.
- On an active-to-flow resize, preserve the current scene heading's viewport position. On a return to eligible dimensions, resolve the nearest readable scene and rebuild its pin rather than reusing a stale document offset. Verify zero pin spacers in fallback and exactly three after desktop re-entry.
- Leave a spatial buffer around theme thresholds and let one-way scene progress remain monotonic across small scroll reversals. Check both forward and backward full passes, direct hashes, browser history, contact at document bottom, footer placement, and responsive overflow.
- Browser verification for this pass covered 1440×900 desktop, 1024×600 live resize fallback, 390×844 mobile, 640×360 compact fallback, direct hashes/history, focused outgoing scenes, biography expansion, repeated scene traversal, and the contact/footer boundary. The available CUA browser did not expose reduced-motion/forced-colors emulation; model gates, event listeners, and CSS fallback rules were checked, but live preference toggles remain unverified.

## Motion ownership reference

| Property/state | Owner while fixed story is active | Fallback owner |
|---|---|---|
| Scene opacity and transform | `profile_story.js` zone timeline | Native CSS plus `profile_motion.js` reveals |
| Intro/collection/contact filter opacity | `profile_story.js` continuous tone model | `profile_motion.js` GSAP crossfades |
| Header theme and active navigation | `profile_motion.js`, from the story tone callback | `profile_motion.js` native section thresholds |
| Wallpaper layer `--parallax-y` | `profile_motion.js` decorative parallax loop | Same |
| Pin spacers and stage height | GSAP ScrollTrigger through `profile_story.js` | No pins; natural section flow |

## Required checks for future motion passes

- Trace every scroll trigger to its visual owner. A fixed wallpaper should remain continuous; section-local layers must not be clipped at a section edge unless their mask fades before the edge.
- Sample the final transform after the entrance, then continue scrolling in small increments. Side-entry cards should report `opacity: 1` and `x: 0`; any bounce belongs only to the axis that was intentionally designed to dampen.
- When a focused scene is retained during pointer scrolling, inspect computed opacity along the focused element's ancestor chain as well as `inert`/`aria-hidden`; a descendant card can reach opacity 0 while its scene root remains at opacity 1. Restore normal timeline ownership when focus leaves.
- For sequential section copy, verify the ordered beats independently (opacity and offset), then verify the companion card starts on its intended axis and reaches an exact final transform. Scroll back across the same trigger and confirm the sequence reverses instead of leaving stale inline values.
- If a reveal is effectively finished before the reader reaches the content, move the trigger closer to the section’s actual viewport arrival and lengthen the timeline/stagger together; changing duration alone can still leave the animation starting too early.
- Every translated reveal must be tested for document-width impact while it is still off-screen. Clip the owning section or grid at its intended horizontal boundary so the entrance cannot create a page-level scrollbar.
- Test forward, reverse, and forward replay. Confirm the trigger reverses cleanly and the next forward pass finishes at the exact final state.
- Treat theme changes as state transitions with an enter threshold and a separate exit threshold. Never make the exact document bottom the only paper-state trigger; leave enough spatial buffer for touchpad micro-reversals.
- Theme-sensitive fixed layers must not swap blend modes or gradient images at the same moment as the state change. Keep the treatment stable and crossfade opacity/filter (or crossfade separate overlay layers) so both directions remain continuous.
- Check every zone boundary and the footer, not only the first project reveal. Capture desktop and 390×844 mobile screenshots, verify zero horizontal overflow, and inspect browser error/warning logs.

## Evidence from 2026-09-19

- Full-width wallpaper seams came from section backgrounds and a clipped local galaxy layer; transparent section surfaces plus overlapping zone ramps removed them.
- Task Planner and CodeSnippet shook because a horizontal overshoot continued after their main reveal; their final state now settles directly at `x: 0`.
- The header flashed because the bottom override switched to paper at the maximum scroll and immediately reverted on a tiny upward movement; buffered, directional theme thresholds fixed it.
- The remaining one-way flash at both theme boundaries came from the fixed galaxy changing blend mode/filter and the gradient changing background image with `data-theme`; a stable blend mode, interpolated opacity/filter, and one shared gradient removed that second source.

## AI team flip regression — 2026-10-10

- Perspective alone does not animate a face swap. Keep both faces rendered; rotate one preserve-3d wrapper, hide each backface, and keep clipping/overflow on the individual faces rather than flattening the wrapper. Verify intermediate computed rotations in both directions, not merely the final flipped class.
- Separate card-opening controls from readable details. A root click or Enter/Space toggle can close the card while readers select text, activate the return control, or scroll. Use native controls with explicit open/close state, inactive-face inertness and restored focus. Keep return outside the detail scroll, and reset detail scroll on reopening.
- Browser evidence: forward/back intermediate turns, settled transforms, details staying open, scrollable role fields, native Enter/Space, Escape, focus restoration, all 23 agents and no horizontal overflow passed on desktop/mobile. Test module: `tests/ai_team.behavior.test.mjs`.
