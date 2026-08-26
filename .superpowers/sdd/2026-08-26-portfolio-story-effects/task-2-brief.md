# Task 2 brief — refresh My Story copy and emphasis

Read this first — it is your requirements, with the exact values to use verbatim.

## Scope

Update only the My Story body copy in `index.html` and the scoped AIS gradient rule in `mainpage_component/profile_style.css`. Preserve the rest of the existing page, including unrelated existing user edits.

## Exact HTML

Replace the existing My Story paragraph block with exactly these four paragraphs:

```html
<p class="bio-text">I graduated in <strong>Electrical Engineering</strong> from <span class="highlight"><strong>Chulalongkorn University</strong></span>, with a focus on communications and telecommunications. Today, I work at <strong class="ais-gradient">AIS</strong> (Advanced Info Service Public Company Limited) in Thailand, where I support <strong class="teal">4G and 5G</strong> network planning and optimization.</p>
<p class="bio-text">Although my role is in telecommunications, much of the work I enjoy most involves <strong class="teal">data</strong>. I work with information from different sources, clean and validate datasets, analyse KPI trends, and create visualizations to support engineering decisions. Through both assigned and self-initiated projects, I have become increasingly interested in how data can be structured and used to solve practical problems.</p>
<p class="bio-text">When existing tools do not fit my team’s workflow, I build my own. Using <strong class="teal">Python, pandas, Excel, Power Query, QGIS, and Power BI</strong>, I have created tools for data processing, geospatial visualization, antenna analysis, KPI analysis, and workflow automation. My <span class="highlight"><strong>Radio Planning Tools</strong></span> project grew from this interest in combining technical knowledge, data, and software to make everyday work more effective.</p>
<p class="bio-text">I am still connected to telecommunications, but I am increasingly interested in developing further in <strong class="teal">data analytics</strong>. I enjoy taking complex information, making it more structured and understandable, and creating practical tools for the people who use them. I am also currently developing my <span class="highlight"><strong>SQL</strong></span> skills as I continue building toward this direction.</p>
```

## Exact CSS

Add this rule beside the existing `.bio-text` emphasis rules:

```css
.bio-text .ais-gradient {
  color: transparent;
  background: linear-gradient(90deg, #5b9828 0%, #8ec53d 48%, #ffffff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}
```

## Constraints and verification

- Work only in the target project.
- Do not modify the external CELL_ANTENNA reference project.
- Do not modify the hero markup, asset links, scripts, library tree, README, root PROJECT.md, or subpage files in this task.
- Do not commit or push; do not spawn subagents.
- Verify My Story has exactly four `.bio-text` paragraphs, all requested content appears, `AIS` has class `ais-gradient`, `4G and 5G` and data/tool terms have visible emphasis, and no literal `**` markers remain in the My Story HTML.

## Report

Write the full report to:
`.superpowers/sdd/2026-08-26-portfolio-story-effects/task-2-report.md`

Return only status, changed paths, one-line verification summary, and concerns after writing the report.
