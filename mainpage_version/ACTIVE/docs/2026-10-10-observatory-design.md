# Observatory portfolio: design for the first version

## Purpose and agreed scope

Upgrade Beer's personal GitHub Pages portfolio with a connected 3D camera journey inspired by Kage's movement. The authored world is an ancient observatory containing modern engineering equipment. The four landmarks and their order are agreed: ancient clock, base station with antennas, coding workstation, then astronomy. The outdoor-to-indoor camera journey was accepted in chat.

The new entry will be `mainpage_version/ACTIVE/index.html`. Keep the root `index.html`, existing supporting files, subpages, and tests unchanged. This version will be accessible at its own nested path after an eventual GitHub Pages deployment; it will not replace the homepage automatically. No deployment, push, or change to the homepage routing is included in this design stage.

The immediate deliverable after design and implementation planning is a rough but functional 3D version. It must show the entire camera journey with readable portfolio content before detailed artwork is added. Learning continues alongside implementation, using plain-language explanations. Update the uploaded study journal only when requested.

## Visual direction

Use weathered bronze, stone, ivory text, navy skies, and restrained teal illumination. Architectural arches, circular motifs, and the observatory terrace connect all four landmarks. Keep the atmosphere calm and avoid rapid flight, flashing effects, or busy detail behind text.

Use one connected world rather than four unrelated scenes. Construct the initial objects with simple Three.js geometry. Detailed imported models, elaborate shaders, bloom, and photorealistic textures are outside the first version.

## Storyboard

| Chapter | Starting view and movement | Landmark | Content |
| --- | --- | --- | --- |
| Time | Begin facing the clock at a comfortable distance where its face is recognizable. Pull back to reveal the courtyard. | Bronze ancient clock with hands and a few exposed gears. | Name, role, short introduction, and biography entry. |
| Connection | Move across the courtyard toward the base station, then rise gently beside it. Keep the structure away from the reading area. | Tower, antenna panels, cables, and equipment cabinet. | Telecom background and Radio Planning Tools. |
| Creation | Descend toward an open observatory workspace and approach the desk. Settle beside the screen while visitors explore cards. | Desk and glowing coding screen with a public illustrative code sample. | CodeSnippet, Task Planner, skills, and AI team link. |
| Discovery | Travel through an open terrace beside a telescope, then turn upward toward the night sky. Finish in a steady wide view. | Telescope, stars, and a distant planet. | Creative exploration and contact links. |

Camera travel connects these landmarks without crossing walls or objects. Use an open archway so the move into the workstation does not require a collision or a cut. The coding screen is decorative; project text and links remain HTML. The astronomy view expresses curiosity and does not claim astronomy as professional experience.

## Content and layout

Carry over the current portfolio's identity, biography, skills, project destinations, AI team destination, LinkedIn, and GitHub links. Verify descriptions against the actual linked pages; the current homepage contains older Task Planner demo language that must not be copied into new copy blindly.

Keep semantic headings, navigation, and clickable content in HTML above a decorative fixed canvas. On desktop, reserve a quiet reading region and compose landmarks beside it. On mobile, position the landmark above or beyond a legible text surface rather than shrinking the desktop layout. Chapter height follows its actual content; do not force lengthy cards into a single viewport.

Navigation provides Intro, Telecom, Coding, and Explore/Contact destinations. Use real anchor links, keyboard access, visible focus, and destination focus handling. Maintain native page scrolling with no scroll hijacking or pinned reading stages. All essential content and links remain available without JavaScript.

## Rendering and camera architecture

Use HTML, CSS, and JavaScript with Three.js; React and a build framework are unnecessary for this version. Keep the runtime dependency local, versioned, and accompanied by its license. Preserve integrity verification when acquiring it during implementation. The version and distribution format will be chosen and verified in the implementation plan before installation.

Suggested responsibilities within ACTIVE:

- `index.html`: semantic portfolio content, navigation, decorative canvas, and fallback background.
- `styles.css`: layout, visual tokens, responsive reading surfaces, and accessibility states.
- `js/world.js`: creates the clock, antenna station, workstation, telescope, environment, and lighting.
- `js/camera-path.js`: maps measured chapter positions to camera position, viewing target, and field of view.
- `js/main.js`: initializes the renderer, navigation, resize handling, motion preferences, and the single update loop.
- `assets/vendor/`: local Three.js runtime and license notices.

This separation describes responsibilities, not permission to scaffold before planning. Prefer a small implementation over additional abstractions.

The current GitHub checkout has `profile_motion.js` and `profile_parallax.js` but lacks the handoff's `profile_story.js` and `profile_story_model.js`. Build one controller specifically for the new entry. Do not load the old homepage controller alongside it or assume unpublished Mac scripts are available.

Measure the actual chapter positions to derive scroll progress. Interpolate camera position and look-at target along a smooth route, with time-based damping so frame rate does not change the response. Recompute chapter measurements after resize or relevant layout changes. A direct hash navigation or restored scroll position must initialize the appropriate camera view. Scroll upward reverses the route.

Use one render loop. Keep small clock movement subtle; the first prototype does not require live clock accuracy. The camera route drives the story; optional pointer movement is deferred.

## Phones, motion preferences, and failures

Cap rendering resolution: start with a pixel-ratio cap of 1.5 on desktop and 1 on narrow screens. Use simple geometry, shared materials where useful, modest lighting, and no dynamic shadows or postprocessing in the first version. These are starting budgets to validate, not measured performance claims.

Pause continuous work while the document is hidden. Avoid rendering continuously when camera and scene animation are idle. Resize the renderer and camera without disturbing document scroll or losing content.

With reduced motion enabled, disable camera travel and decorative animation and show a stable representative view. Without WebGL, after initialization failure, or after context loss, retain readable HTML over a CSS background. In forced-colors mode, prioritize native readable content and hide decorative rendering. The canvas must not intercept clicks or appear as essential content to assistive technology.

Native links and text must work even if the local Three.js asset fails to load. A fallback is an intentional rendering mode, not evidence that 3D validation passed.

## Validation and completion criteria

- The root homepage and existing tracked files have no changes from this work.
- The new entry serves at its nested GitHub Pages path with all local assets resolving and existing project destinations correct.
- All four landmarks are recognizable and each chapter produces a distinct camera view.
- Forward scrolling, reverse scrolling, anchor navigation, reload at a chapter, and viewport changes produce the expected views without clipping through objects.
- Intro, biography, projects, skills, team access, and contact remain readable and usable.
- Browser checks cover desktop and phone-sized viewports, keyboard navigation, menu behavior, zero horizontal overflow, and JavaScript/local-asset failures.
- Reduced-motion, disabled JavaScript, unavailable WebGL, and hidden-document behavior are exercised separately from the normal 3D mode.
- A browser with working WebGL actually renders the geometry during validation; a passing fallback-only run is insufficient.
- Record observed browser responsiveness and available frame timing. Phone viewport emulation does not prove physical-phone GPU or battery performance; review on Beer's phone remains a later check when a hosted version is requested.

## Next stage

Review this written design, then prepare an implementation plan for the rough complete journey. The plan will establish the dependency version, file creation order, camera waypoint layout, meaningful checks, and execution method. Implementation starts after that planning stage. Publication and replacement of the current homepage are separate later decisions.
