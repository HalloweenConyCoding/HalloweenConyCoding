# Graph Report - HalloweenConyCoding  (2026-07-04)

## Corpus Check
- 55 files · ~2,833,156 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1034 nodes · 1913 edges · 54 communities (45 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c6c76fe8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 52|Community 52]]

## God Nodes (most connected - your core abstractions)
1. `Draggable()` - 29 edges
2. `Draggable()` - 28 edges
3. `AsciiGlitchRipple` - 18 edges
4. `Tween()` - 16 edges
5. `Dc()` - 16 edges
6. `ba()` - 15 edges
7. `r()` - 12 edges
8. `s()` - 12 edges
9. `savePopover()` - 11 edges
10. `ce()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `persistCalendar()` --calls--> `describeSaveResult()`  [INFERRED]
  categories/projects/task-planner/calendar.js → categories/projects/task-planner/assets/js/core/ui.js
- `savePopover()` --calls--> `showToast()`  [INFERRED]
  categories/projects/task-planner/calendar.js → categories/projects/task-planner/assets/js/core/ui.js
- `Draggable()` --calls--> `fe()`  [INFERRED]
  mainpage_component/gsap/Draggable.min.js → mainpage_component/gsap/SplitText.min.js
- `Draggable()` --calls--> `_a()`  [INFERRED]
  mainpage_component/gsap/Draggable.min.js → mainpage_component/gsap/gsap.min.js
- `Draggable()` --calls--> `re()`  [INFERRED]
  mainpage_component/gsap/Draggable.min.js → mainpage_component/gsap/gsap.min.js

## Communities (54 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (101): _a(), Aa(), Ad(), Ae(), Animation(), Ao(), _assertThisInitialized(), Ba() (+93 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (56): Hd(), A(), B(), C(), Db(), Dc(), Eb(), G() (+48 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (69): animateChipIntoPlace(), applyUrgency(), buttons, clearDropTargets(), closePopover(), createEventChip(), createTagDot(), createTaskPill() (+61 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (54): ge(), ze(), $(), A(), aa(), _assertThisInitialized(), Ba(), da() (+46 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (37): xd(), $(), aa(), arcToSegment(), ba(), ca(), cacheRawPathMeasurements(), convertToPath() (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (33): Anchor(), arcToSegment(), C(), Ca(), copyRawPath(), Da(), db(), DraggableSVG() (+25 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (37): C1: `canUsePinnedChapters()` guard never passes → pin mode is dead code, C2: Two nav click handlers both fire → competing scroll tweens, C3: Inline `updateAtmosphere()` conflicts with pinning, code:js (function canUsePinnedChapters(shells) {), code:js (return function () {), code:css (.star-field, .dust-field { content-visibility: auto; }), code:js (// blend: 0 = full library (light), 1 = full celestial (dark), code:css (.chapter-rail { display: none; /* ...existing styles... */ }) (+29 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (28): $(), A(), Aa(), B(), ba(), ea(), fa(), FlipState() (+20 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (33): $(), A(), aa(), _assertThisInitialized(), Ba(), da(), Draggable(), Ea() (+25 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (29): $(), arcToSegment(), ba(), ca(), cacheRawPathMeasurements(), convertToPath(), D(), getGlobalMatrix() (+21 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (20): describeSaveResult(), escapeHtml(), formatSaveStamp(), reflectSaveIndicator(), setSaveIndicator(), showToast(), persistCalendar(), activePriority (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (22): E(), Ec(), Fc(), Gc(), H(), Hc(), J(), Jc() (+14 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (22): buildCodexCard(), buildFlowView(), buildHierarchy(), buildNodeCard(), CODEX_GRID, createEl(), fieldPair(), FLOW_CONTAINER (+14 more)

### Community 13 - "Community 13"
Cohesion: 0.1
Nodes (19): buildCodexCard(), buildHierarchy(), createEl(), createFlipBurst(), fieldPair(), HIERARCHY_ROOT, navLinks, NODE_DATA (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (18): buildCodexCard(), buildHierarchy(), createEl(), fieldPair(), HIERARCHY_ROOT, navLinks, NODE_DATA, NODE_MAP (+10 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (18): A(), B(), E(), I(), l(), m(), n(), o() (+10 more)

### Community 16 - "Community 16"
Cohesion: 0.16
Nodes (20): buildAgentCard(), buildHero(), buildHierarchy(), buildParticles(), buildRuneBackground(), buildTopbar(), corner(), el() (+12 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (16): $(), aa(), da(), fa(), L(), m(), N(), O() (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.16
Nodes (3): AsciiGlitchRipple, instance, instances

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (16): constructor(), ee(), fe(), he(), I(), J, kill(), le() (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.15
Nodes (12): canUsePinnedChapters(), chapterScrollTarget(), clamp01(), findChapterTrigger(), getChapterContentHeight(), list(), pinReveal(), refreshProgressFromScroll() (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (8): GROUPS, NODE_DATA, NODE_MAP, PIPELINE_COLORS, PIPELINE_LABELS, PORTRAIT_PATHS(), sigilMap, SIGILS

### Community 22 - "Community 22"
Cohesion: 0.32
Nodes (12): A(), B(), l(), m(), p(), q(), r(), s() (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.4
Nodes (9): arcToSegment(), CustomEase(), m(), n(), q(), r(), stringToRawPath(), t() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.44
Nodes (9): A(), k(), l(), m(), n(), o(), p(), u() (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.36
Nodes (8): l(), m(), n(), p(), q(), s(), t(), u()

### Community 26 - "Community 26"
Cohesion: 0.2
Nodes (8): Active Problems, Architecture / Important Files, Current Goal, Current State, Detailed Notes, Key Decisions, Recent Work Log, Workflow Rules for Agents

### Community 27 - "Community 27"
Cohesion: 0.2
Nodes (10): code:powershell (rg -n "Radio Planning Tools|CodeSnippet|project-grid|cel-car), code:text (Radio Planning Tools appears before CodeSnippet inside .proj), code:html (<div class="cel-card featured reveal reveal-delay-3">), code:html (<p class="cel-card-desc">...</p>), code:html (<div class="cel-card featured reveal reveal-delay-3">), code:html (<div class="cel-card featured reveal reveal-delay-4">), code:css (.cel-card-status.demo {), code:powershell (rg -n "Task Planner|◆ DEMO|categories/projects/task-planner/) (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.2
Nodes (10): code:powershell (node --check "C:\Beer\Programming\Personal_Project\Halloween), code:text (All commands exit with code 0.), code:powershell (python -m http.server 8123), code:text (Serving HTTP on :: port 8123 or Serving HTTP on 0.0.0.0 port), code:powershell ($base = "http://127.0.0.1:8123/categories/projects/task-plan), code:text (home=200 tasks=200 calendar=200), code:text (http://127.0.0.1:8123/categories/projects/task-planner/index), code:text (Ctrl+C) (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (9): code:powershell (git status --short), code:text (M PROJECT.md), code:powershell (git diff --check), code:text (No output.), code:powershell (rg -n "showOpenFilePicker|showSaveFilePicker|indexedDB|local), code:text (No runtime persistence references remain in the public demo ), code:powershell (graphify update .), code:text (Graphify completes. If graph.html is skipped because the gra) (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.39
Nodes (5): f(), g(), h(), i(), l()

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (7): 🚀 About Me, 🌐 Connect With Me, 🌟 Featured Project, 📊 GitHub Profile and Activities, 🔧 Key Features, 🧰 Technical Skills, 🧩 What I Build

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (7): code:html (<!DOCTYPE html>), code:javascript ((function () {), File Structure, Scope, Self-Review, Task 3: Add Demo Landing Page And In-Memory Persistence, Task Planner Demo Page Implementation Plan

### Community 33 - "Community 33"
Cohesion: 0.43
Nodes (6): clone(), demoData, result(), sections, startedAt, writeSection()

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (7): code:powershell (New-Item -ItemType Directory -Force -Path "C:\Beer\Programmi), code:text (All three target folders exist.), code:powershell ($src = "C:\Beer\Programming\Personal_Project\Cony-Workspace\), code:text (The copied tasks.html and calendar.html still resemble the r), code:powershell (Get-ChildItem "C:\Beer\Programming\Personal_Project\Hallowee), code:text (Output includes tasks.html, tasks.js, calendar.html, calenda), Task 2: Copy The Real Demo Page Bundle

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (7): code:html (<script src="data/workspace-data.js"></script>), code:html (<script src="demo-persistence.js"></script>), code:html (<span class="save-status-label">Demo - resets on refresh</sp), code:javascript (const pages = [), code:powershell (rg -n "data/workspace-data|persistence\.js|showOpenFilePicke), code:text (No matches, except comments if deliberately added to explain), Task 4: Rewire Copied Pages For Demo Mode

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (5): curtain, href, pages, shell, sidebar

### Community 38 - "Community 38"
Cohesion: 0.47
Nodes (4): CharSet(), emojiSafeSplit(), i(), p()

### Community 39 - "Community 39"
Cohesion: 0.53
Nodes (4): s(), ScrollSmoother(), t(), v()

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (4): code:markdown (- 2026-07-04 - Added Task Planner demo project direction:), code:powershell (rg -n "Task Planner demo|two-page public demo|memory-only de), code:text (The new recent-work entry is present.), Task 6: Update Project Memory

## Knowledge Gaps
- **168 isolated node(s):** `NODE_DATA`, `NODE_MAP`, `HIERARCHY_ROOT`, `CODEX_GRID`, `FLOW_CONTAINER` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fe()` connect `Community 19` to `Community 8`, `Community 11`, `Community 3`, `Community 1`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `Draggable()` connect `Community 3` to `Community 0`, `Community 19`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `Draggable()` connect `Community 8` to `Community 0`, `Community 19`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Draggable()` (e.g. with `te` and `fe()`) actually correct?**
  _`Draggable()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Draggable()` (e.g. with `fe()` and `_a()`) actually correct?**
  _`Draggable()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `NODE_DATA`, `NODE_MAP`, `HIERARCHY_ROOT` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._