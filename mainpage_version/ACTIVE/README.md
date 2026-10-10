# Chatchon — The Observatory

A separate first version of the portfolio: ancient clock → antenna station → coding workspace → astronomy terrace. The root homepage and its supporting files remain unchanged.

## View locally

Serve the **repository root**, not just this folder:

```sh
python3 -m http.server 8123 --bind 127.0.0.1
```

The new entry is `/mainpage_version/ACTIVE/`. Existing project links resolve relative to the repository root. GitHub Pages can serve the same nested path; this work does not replace the root homepage or publish anything.

The website requires no build, npm installation, external font service, credentials, or backend. Three.js 0.160.1 and its MIT license are retained under `assets/vendor/`.

## Understand the scene

- `index.html` and `styles.css` hold the readable portfolio, disclosures, links, and fallback atmosphere.
- `js/world.mjs` assembles the landmarks from boxes, cylinders, rings, and generated textures. The clock numerals and screen content are canvas textures; the objects around them have real depth.
- `js/camera-path.mjs` maps actual chapter positions to a smooth route. Position and viewing direction move separately. Time-based damping softens the camera response.
- `js/main.mjs` owns the renderer, native chapter navigation, viewport composition, motion preferences, and frame scheduling.

Your HTML content stays in the document as the camera moves behind it. Scroll upward to reverse the journey. Keyboard navigation and direct chapter links work independently of the 3D background.

## Checks

From the repository root:

```sh
node --test mainpage_version/ACTIVE/tests/camera-path.test.mjs
python3 mainpage_version/ACTIVE/tests/browser-smoke.py --phase all
node --test tests/*.test.cjs
```

The browser checks require the server above, Python Playwright, and Chromium at `/usr/bin/chromium` (the tested cloud environment). They use Chromium's software WebGL mode to verify rendering in the cloud. Screenshot evidence goes to `/tmp/observatory-review/`; it is not a permanent hosted preview. `--phase content` checks the no-JavaScript layout; `--phase journey` adds WebGL and navigation checks.

The original test suite has a known failure in `tests/task-planner-connection.test.cjs`: it expects the former Tasks icon rather than `tasks-checklist-dark.svg`. This version does not alter that assertion or its application files.

## Rendering and motion

Desktop rendering caps device pixel ratio at 1.5; screens 700 CSS pixels wide or narrower cap it at 1. The clock hands move subtly during the first camera transition. Drawing stops once the camera settles in every chapter, including the clock, to keep the detailed scene from continuously using the GPU. Hidden pages stop scheduling animation. Reduced motion shows a stable clock view. Forced colors removes decorative rendering. Missing WebGL, failed runtime loading, and lost rendering contexts leave readable HTML and native navigation over the CSS atmosphere.

## Runtime integrity

`assets/vendor/PROVENANCE.md` records the registry archive integrity and extracted module SHA-256. To refresh the runtime, acquire the exact version with `npm pack three@0.160.1` in a temporary directory, compare the archive SHA-512 with `npm view three@0.160.1 dist.integrity`, then retain only `build/three.module.js` and `LICENSE`. Do not disable TLS or package-integrity verification. A version change requires retesting the complete journey and fallbacks.

## Scope and remaining work

The first scene is now an ancient magical library: a separately loaded GLB astronomical clock on the left, portfolio copy on the right, tall walnut bookcases, books, writing desks, candles, celestial instruments, Gothic window, subtle rune halo and moonlit haze. The clock includes original carved geometry and a generated engraved dial texture. This is a rendered 3D scene; no room photograph or storyboard image is used as its backdrop. It is still an interpretation of the supplied visual reference, not a claim of matching its photorealism.

The station, workstation and astronomy scenes remain the functional geometry prototypes. Further visual refinement and physical-device performance review remain outstanding. The current root `index.html` is unchanged.

Phone viewport checks do not establish physical-phone GPU speed or battery use. Cloud frame timing comes from software rendering and is not a hardware performance guarantee. Test on Beer's phone when a hosted review is requested. No Site or GitHub deployment has been created by this implementation.

## Implementation decisions and review evidence

The accepted visual storyboard is retained as `docs/storyboard.png`. Review screenshots are in `docs/review/`; `library-magic-desktop.png` and `library-magic-mobile.png` show the latest ancient magical library; `clock-refined.png` and `clock-refined-mobile.png` preserve the preceding clock detail pass; the other images preserve the functional prototype. These are browser renders, while the storyboard is an illustrative target.

The tower camera was pulled back and raised to keep the antennas visible. The workstation view moved to a more frontal angle because the initial phone view showed the screen edge-on. Chapter measurements include the native anchor offset, and the current-chapter indicator tolerates one-pixel rounding. These are composition/measurement adjustments to the draft route, preserving the agreed journey.

A fresh independent reviewer confirmed that direct Coding links, reloads, browser back, and restored plain-URL scrolling initialize the camera at the correct view. The review identified a low-frame-rate damping issue; the integrated browser regression reproduced it at 10 FPS, then passed at 10, 30, and 60 FPS after using actual elapsed time for camera motion. Decorative clock updates retain their own bounded delta. Malformed percent-encoded anchors were also reproduced and fixed.

The unavailable-WebGL fixture blocks all context names, including `experimental-webgl`. Fixed-duration idle checks were replaced with measured stability because software-rendered frames vary in duration. These changes affect validation, not the public flow. Execution bookkeeping lives outside the checkout; a premature content-check completion note was corrected after its asynchronous output was collected, and the corrected content checks passed before final verification.

Observed cloud render sample at 1440×900: 152 draw calls and 14,110 triangles; median interval 182.6 ms across twelve software-rendered frames while other validation was running. This establishes geometry/rendering evidence, not production hardware speed. Physical-phone review is still needed.

Prototype validation before the library pass: 7 Node camera tests and 67 browser checks passed, including actual WebGL rendering, keyboard navigation, no-script content, fallbacks, motion preferences, hidden/idle scheduling, and integrated timing. Existing root tests remain at 3 passing files and 1 unchanged stale-icon failure. Existing application files were compared against commit `3a4e68a` and have no changes.

The preceding clock detail pass retained the same camera route and HTML content. Its textures are deterministic canvas surfaces authored in `js/clock.mjs`; gears use extruded annular geometry and masonry/bolts use instancing to reduce separate draw calls. No external model or texture assets are required.

## Clock and library assets

Model and texture sources are recorded in `assets/models/PROVENANCE.md`; the Three.js loader, geometry utility and reflection-environment sources are recorded in `assets/vendor/PROVENANCE.md`. `js/library.mjs` assembles the room, merges fixed geometry by material, and instances books. The GLB has roughly 115,000 triangles and occupies about 7 MB, including embedded maps. Shadows are computed once for the static room; the moving hands do not refresh them. Reflection lighting is generated locally. These choices need physical-phone validation before publication.

The scene keeps native scrolling and the original camera route. Desktop camera composition shifts from clock-left at the intro to landmark-right in the later sections; mobile retains its overhead model / readable card layout. Loading is asynchronous, with cancellation checks so context loss during loading cannot re-enable a disposed renderer. Asset-load failure retains the HTML fallback. `python3 mainpage_version/ACTIVE/tests/library-assets.py` checks successful GLB loading, failed-model navigation, and context loss while initialization is pending.

The detailed scene initially drew continuously at the intro, causing cloud software-renderer input and screenshot timeouts. A regression instrument tracks outstanding animation callbacks rather than inferring idleness from frame intervals; it failed against continuous intro drawing and verifies that drawing stops at rest. Browser captures allow longer software-GPU screenshot timeouts, and motion-preference assertions wait for observed draws rather than a fixed 150 ms delay. These checks are not a device-speed benchmark.

Library-pass validation: 7 camera tests and 68 complete browser checks passed, including real WebGL journey/navigation, idle intro scheduling, preferences, hidden tabs, context failure and integrated camera timing. The separate asset integration checks passed for successful GLB loading, failed-model navigation and context loss during loading. The latter was observed failing before cancellation checks were added, then passing. A fresh reviewer confirmed hand pivots and batching and identified that cancellation issue; it is fixed, and asset provenance is updated. Existing root tests still have 3 passing files and the unchanged `tests/task-planner-connection.test.cjs` stale-icon failure. No existing application files were changed; no deployment was created.
