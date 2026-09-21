const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'categories/projects/task-planner/index.html'), 'utf8');
const landingCss = path.join(root, 'categories/projects/task-planner/landing.css');
const landingJs = path.join(root, 'categories/projects/task-planner/landing.js');
const shinyJs = path.join(root, 'library/text/shiny_text/shiny_text.js');
const shinyCss = path.join(root, 'library/text/shiny_text/shiny_text.css');

assert.match(html, /class="landing-page"/);
assert.match(html, /PUBLIC WORKSPACE/);
assert.match(html, /Choose your workspace file/);
assert.match(html, /Grant read and write permission/);
assert.match(html, /Use Tasks or Calendar/);
assert.match(html, /connection-visual/);
assert.match(html, /workspace-data\.js/);
assert.match(html, /No upload/);
assert.match(html, /No server copy/);
assert.match(html, /not sent to HalloweenConyCoding/);
assert.match(html, /Download workspace template/);
assert.match(html, /id="download-workspace-template"/);
assert.match(html, /href="tasks\.html"/);
assert.match(html, /href="calendar\.html"/);
assert.match(html, /data-shiny-text/);
assert.match(html, /href="landing\.css"/);
assert.match(html, /href="\.\.\/\.\.\/\.\.\/library\/text\/shiny_text\/shiny_text\.css"/);
assert.match(html, /src="\.\.\/\.\.\/\.\.\/library\/text\/shiny_text\/shiny_text\.js"/);
assert.match(html, /src="landing\.js"/);
assert.doesNotMatch(html, /DEMO|session only|seeded demo|later ZIP version/i);
assert.ok(fs.existsSync(landingCss));
assert.ok(fs.existsSync(landingJs));
assert.ok(fs.existsSync(shinyJs));
assert.ok(fs.existsSync(shinyCss));

const landingJsSource = fs.readFileSync(landingJs, 'utf8');
assert.match(landingJsSource, /window\.WORKSPACE_DATA/);
assert.match(landingJsSource, /tasks:\s*\[\]/);
assert.match(landingJsSource, /calendarNotes:\s*\{\}/);
assert.match(landingJsSource, /workspace-data\.js/);
assert.match(landingJsSource, /application\/javascript/);

const sandbox = { document: { addEventListener() {} }, setTimeout };
sandbox.window = sandbox;
vm.runInNewContext(landingJsSource, sandbox);
const templateSource = sandbox.PublicWorkspaceLanding.createWorkspaceTemplateSource();
const templateMatch = templateSource.match(/^window\.WORKSPACE_DATA = ([\s\S]*);\n$/);
assert.ok(templateMatch, 'template must be a complete WORKSPACE_DATA assignment');
const template = JSON.parse(templateMatch[1]);
assert.deepEqual(template.sections.tasks, []);
assert.deepEqual(template.sections.calendarNotes, {});
assert.equal(template.meta.savedBy, 'PUBLIC WORKSPACE');

const shinyJsSource = fs.readFileSync(shinyJs, 'utf8');
const shinyCssSource = fs.readFileSync(shinyCss, 'utf8');
assert.match(shinyJsSource, /global\.ShinyText\s*=\s*ShinyText/);
assert.match(shinyJsSource, /global\.initShinyTexts/);
assert.match(shinyCssSource, /prefers-reduced-motion/);
assert.match(shinyCssSource, /forced-colors/);
assert.match(shinyCssSource, /animation:\s*none/);

console.log('PASS Task Planner landing contract');
