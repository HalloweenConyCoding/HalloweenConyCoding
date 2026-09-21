# Public Workspace Landing Page Design

## Intent

Replace the old dark, card-heavy Task Planner demo landing page with a calm editorial entry page for the future Public Workspace. The page should explain the local-file privacy model, demonstrate the connection flow, and preserve direct access to Tasks and Calendar.

## User flow

1. A visitor opens the HalloweenConyCoding portfolio.
2. They select `02 / PRODUCTIVITY — Task Planner` and choose `Try Task Planner`.
3. The Task Planner entry page presents Public Workspace and explains that the user's workspace data remains on their computer.
4. The page shows a visual connection model: the local `workspace-data.js` file stays on the user's computer while the browser UI reads and writes through an explicit permission.
5. The visitor can download a blank `workspace-data.js` template for their own local workspace.
6. The page explains why personal data is not sent to HalloweenConyCoding: there is no upload endpoint, account, or server-side workspace copy in this flow.
7. The visitor can open Tasks or Calendar directly from the entry page.

The actual file picker, permission flow, and persistence migration are a separate integration slice. The landing-page slice owns the template download and navigation seam; the integration slice owns the connect-before-edit gate on Tasks and Calendar.

## Visual direction

- Minimal editorial composition with a restrained cream and pastel palette.
- Typographic hierarchy, generous whitespace, and thin horizontal rules provide structure.
- Use a small number of purposeful panels; do not recreate the current two-card dashboard treatment.
- Keep the page visually related to the portfolio while allowing the workspace entry page to have its own paper-like surface.
- Avoid gradients, cursor-following glows, large decorative illustrations, and constant ambient animation.

## Page structure

- Header: back link to the portfolio, `PUBLIC WORKSPACE` label, and a quiet local/private status note.
- Hero: editorial eyebrow, primary heading, short explanation, and one ShinyText treatment on the eyebrow or a short accent phrase.
- Connection section: a ruled visual diagram of the local file, browser interface, and read/write permission, followed by a three-step list with visible step numbers and concise explanations.
- Template action: a clearly labeled `Download workspace template` button that creates a blank local `workspace-data.js` file; it must not contain seeded or private data.
- Privacy section: a plain-language explanation of the browser-only boundary, with short ruled statements for no upload, no account, and no server copy.
- Destination section: two full-width ruled navigation rows for Tasks and Calendar, each with a description and arrow link.
- Footer note: no account, no upload, and the local-file connection requirement stated plainly.

The Tasks link remains `tasks.html`; the Calendar link remains `calendar.html`. The landing page must not silently load seeded demo data or claim that changes persist until the later persistence slice is complete.

## Template contract

The download must produce a JavaScript file in the same shape accepted by the current Cony Workspace persistence layer:

```js
window.WORKSPACE_DATA = {
  "meta": { "version": 1, "savedAt": "", "savedBy": "PUBLIC WORKSPACE" },
  "sections": {
    "tasks": [],
    "calendarNotes": {}
  }
};
```

The browser must construct the file locally with a Blob and an object URL. No network request, upload, account, or server-side generation is needed.

## Integration handoff

Tasks and Calendar must use the current persistence API in the later integration slice. Until a valid local file is connected with write permission, the pages show data as read-only and keep create, edit, delete, drag, and event-edit controls disabled. The bottom-left connection control opens the file picker; successful connection loads the selected file and unlocks editing. Failed, canceled, or invalid selections keep the pages read-only and explain the next action.

## Motion and interaction

- Load the local vanilla ShinyText asset from this repository; do not reference the Cony-Workspace repository at runtime.
- Use ShinyText once, with a slow, low-contrast cream/pastel sweep.
- Use CSS-only hover, focus-visible, and pressed-state feedback on navigation rows and the back link.
- Use a short page/section reveal only when it improves orientation.
- Disable continuous animation and transform-heavy motion under `prefers-reduced-motion: reduce`.
- Keep keyboard focus visible and ensure all interactive rows are real links.

## Technical boundaries

- Keep `categories/projects/task-planner/style.css` unchanged for Tasks and Calendar; the landing page receives a dedicated `landing.css` file.
- Keep the landing page static and GitHub Pages-compatible: HTML, CSS, and local vanilla JavaScript only.
- Copy/synchronize the approved ShinyText JavaScript and CSS into `library/text/shiny_text/` in this repository, retaining the local reduced-motion and forced-colors safety behavior.
- Do not add npm, React, Vite, a server, analytics, authentication, or a new dependency.
- Do not modify `tasks.html`, `tasks.js`, `calendar.html`, `calendar.js`, or the current persistence implementation in this slice.

## Acceptance criteria

- The landing page reads as a minimal editorial page at desktop and mobile widths.
- The old `DEMO`, `session only`, seeded-data, and future-ZIP claims are absent from the landing page.
- The connection model is understandable without opening another page, including a visual explanation of where the file stays.
- The privacy boundary explicitly explains why personal workspace data is not uploaded to HalloweenConyCoding.
- The landing page downloads a blank, valid `workspace-data.js` template without making a network request.
- Tasks and Calendar remain discoverable through direct links.
- ShinyText loads only from local project assets and remains accessible under reduced-motion and forced-colors preferences.
- No horizontal overflow, broken local assets, console errors, or inaccessible keyboard targets appear in browser smoke checks.
