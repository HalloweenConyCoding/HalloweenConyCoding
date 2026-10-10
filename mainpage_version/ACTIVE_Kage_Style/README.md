# Original Kage preview

This folder runs the original Kage design. Its content has deliberately been kept intact for the first preview; portfolio content can be substituted after reviewing this copy.

Public preview: https://halloweenconycoding.github.io/HalloweenConyCoding/mainpage_version/ACTIVE_Kage_Style/

## Source

Imported from the published `@designcodeio/threeui@1.2.0` npm package, specifically `lib-dist/assets/landing-pages/kage.html` and every local asset it references. The standalone page includes the authored 3D scene, camera transitions, layout, and interactions. This is the distributed standalone implementation, not the separate React wrapper project from the laptop.

`index.html` is an unchanged copy. Its SHA-256 matches the canonical Kage HTML recorded in the study handoff:

```
c8e06b90397ac246baf0ab6f32f5f6b570acc6fe03c7009f711b579fb72d9f49
```

`source-code/upstream-kage.html` preserves an untouched reference for later content edits. `source-code/manifest.json` records the imported paths, sizes, hashes, and registry archive integrity. Upstream MIT, third-party, asset, and font notices are preserved under `source-code/licenses/`. Keep these notices when modifying or distributing the page.

## Run and review

Serve the repository root with any static HTTP server; no dependency installation or build is needed. Open `/mainpage_version/ACTIVE_Kage_Style/`.

Chromium checks at 390 × 844 and 1440 × 900 passed 22 assertions covering page loading, WebGL rendering, local asset loading, typography, horizontal overflow, chapter navigation, camera movement, mobile menu behavior, return to top, and browser errors. These used software WebGL with the original `?shot=0` review parameter and reduced motion; physical phone performance has not been measured. Review screenshots are in `docs/review/`.

This import leaves the repository root homepage and `mainpage_version/ACTIVE/` unchanged.
