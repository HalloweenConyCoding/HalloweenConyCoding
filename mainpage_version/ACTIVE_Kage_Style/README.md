# Chatchon · Kage design

This folder uses the original Kage scene, camera transitions, and layout with Chatchon’s portfolio content from the repository root homepage. The wordmark, biography, project cards, skills, contact links, loader, navigation, footer, and metadata have been personalized. The project cards link to Radio Planning Tools, Task Planner, and CodeSnippet; the skills section also links to the CONY AI team.

Public preview: https://halloweenconycoding.github.io/HalloweenConyCoding/mainpage_version/ACTIVE_Kage_Style/

## Source

Imported from the published `@designcodeio/threeui@1.2.0` npm package, specifically `lib-dist/assets/landing-pages/kage.html` and every local asset it references. The standalone page includes the authored 3D scene, camera transitions, layout, and interactions. This is the distributed standalone implementation, not the separate React wrapper project from the laptop.

The original imported HTML, preserved in `source-code/upstream-kage.html`, matches the canonical Kage SHA-256 recorded in the study handoff:

```
c8e06b90397ac246baf0ab6f32f5f6b570acc6fe03c7009f711b579fb72d9f49
```

`source-code/upstream-kage.html` preserves an untouched reference for later content edits. `source-code/manifest.json` records the initial upstream import paths, sizes, hashes, and registry archive integrity. Its `index.html` hash describes the original import before personalization, not the current edited entrypoint. Upstream MIT, third-party, asset, and font notices are preserved under `source-code/licenses/`. Keep these notices when modifying or distributing the page.

## Run and review

Serve the repository root with any static HTTP server; no dependency installation or build is needed. Open `/mainpage_version/ACTIVE_Kage_Style/`.

The original import passed 22 Chromium assertions at 390 × 844 and 1440 × 900 covering page loading, WebGL rendering, local asset loading, typography, horizontal overflow, chapter navigation, camera movement, mobile menu behavior, return to top, and browser errors. The personalized page passed phone and desktop WebGL checks for the new eight-letter name, portfolio copy, local project destinations, contact links, navigation, camera movement, and browser errors. Three additional phone fallback checks passed after waiting for the original asynchronous startup to finish. Personalized screenshots have the `chatchon-` prefix. Checks use software WebGL with the original `?shot=0` review parameter and reduced motion; physical phone performance has not been measured. Review screenshots are in `docs/review/`.

This import leaves the repository root homepage and `mainpage_version/ACTIVE/` unchanged.
