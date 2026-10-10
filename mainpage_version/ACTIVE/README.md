# Chatchon — Floating portfolio prototype

Entry: `/mainpage_version/ACTIVE/`. The existing root homepage stays unchanged.

The scroll journey stages four floating subjects in order: ancient magical clock, antenna station, coding screen, then a planet with orbiting moons and stars. Each has a different camera angle. A full-screen procedural atmosphere blends from amber to blue, teal and violet as the camera moves; outgoing subjects fade away and incoming subjects come forward. The scene contains no room, shelves, courtyard, floor, display plinth, desk or architecture. It retains the detailed authored clock; the antenna, screen and space models remain stylized prototype geometry.

## Run and verify

Serve the repository root:

```sh
python3 -m http.server 8123 --bind 127.0.0.1 --directory /workspace/HalloweenConyCoding
node --test mainpage_version/ACTIVE/tests/camera-path.test.mjs
python3 mainpage_version/ACTIVE/tests/browser-smoke.py --phase all
python3 mainpage_version/ACTIVE/tests/library-assets.py
python3 mainpage_version/ACTIVE/tests/floating-fade.py
node --test tests/*.test.cjs
```

The runtime has no build or external asset dependencies. Browser checks use Python Playwright and `/usr/bin/chromium`. The root suite has an existing failure in `tests/task-planner-connection.test.cjs`: the expected Tasks icon is stale. Existing root source is unchanged.

## Runtime

`js/world.mjs` builds and stages the subjects, owns their fade weights and atmosphere palettes, and disposes graphics resources. `js/library.mjs` loads just the floating astronomical clock and its sparks/orbit; its filename is retained from the preceding library experiment. `js/camera-path.mjs` maps measured chapter positions to camera movement. `js/main.mjs` handles rendering, viewport framing, preferences, native links and frame scheduling. HTML remains readable when 3D is unavailable.

Camera movement and transitions follow scrolling in either direction. Rendering stops when the camera settles, including at the intro; hidden tabs stop scheduling. Reduced motion retains a stable intro scene, and forced colors removes the decorative canvas. WebGL loss or GLB failure leaves native HTML navigation available. Desktop pixel ratio is capped at 1.5; phone pixel ratio is capped at 1. Physical-phone performance is not established by cloud software-GPU checks.

## Review and assets

Current browser screenshots use `docs/review/floating-{mobile,desktop}-{intro,telecom,coding,explore}.png`. Earlier library screenshots and the original storyboard are retained as historical review evidence. They describe superseded visual directions.

The Blender build script removes the clock's display plinth for this version; separate hand pivots remain. The dial is generated decorative artwork, not a scientifically accurate astronomical instrument. Asset sources and licenses are recorded in `assets/models/PROVENANCE.md` and `assets/vendor/PROVENANCE.md`. No room photo is used. Three.js 0.160.1 and its loader/reflection modules are vendored locally under MIT.

The preceding version was published through GitHub Pages at `/HalloweenConyCoding/mainpage_version/ACTIVE/`. This revision updates that same prototype path after verification.

Versioned module and model URLs refresh the preceding preview on existing phone browsers. A real WebGL pixel regression checks stage fading after an initial opaque render, reverse scrolling and a repeated transition. The independent review identified a stale opaque shader when transparency changes; the coding-screen material reproduced that failure before the fix, and the pixel test passed after updating the shader on transparency changes.

Final floating-revision verification: 7 camera tests and all 70 browser checks passed, including the absence of room architecture and one visible subject per chapter. Model success, failed-model navigation and context-loss-during-loading checks passed with versioned URLs. Pixel fade/reverse/repeated-transition checks passed after the reproduced shader fix. The root suite remains at 3 passing files and the pre-existing stale Tasks icon failure. Root `index.html` is unchanged. Desktop/phone screenshots are actual WebGL captures; physical-phone GPU performance remains to be reviewed on the hosted prototype.
