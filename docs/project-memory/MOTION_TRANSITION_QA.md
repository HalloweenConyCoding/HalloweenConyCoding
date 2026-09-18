# Motion and Transition QA

## Why this exists

Scroll-linked motion can look correct during the entrance and still fail at the edges: clipped layers create visible bands, reveal timelines can keep writing transforms after the user thinks they finished, and a theme trigger at the exact document boundary can flash when a touchpad settles.

## Required checks for future motion passes

- Trace every scroll trigger to its visual owner. A fixed wallpaper should remain continuous; section-local layers must not be clipped at a section edge unless their mask fades before the edge.
- Sample the final transform after the entrance, then continue scrolling in small increments. Side-entry cards should report `opacity: 1` and `x: 0`; any bounce belongs only to the axis that was intentionally designed to dampen.
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
