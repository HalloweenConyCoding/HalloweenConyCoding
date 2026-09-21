const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const plannerRoot = path.join(root, 'categories/projects/task-planner');
const tasksHtmlPath = path.join(plannerRoot, 'tasks.html');
const calendarHtmlPath = path.join(plannerRoot, 'calendar.html');
const tasksJsPath = path.join(plannerRoot, 'tasks.js');
const calendarJsPath = path.join(plannerRoot, 'calendar.js');
const persistencePath = path.join(plannerRoot, 'persistence.js');
const stylePath = path.join(plannerRoot, 'style.css');
const componentPaths = [
  path.join(root, 'library/component/mini_calendar/mini-calendar.js'),
  path.join(root, 'library/component/mini_calendar/mini-calendar.css'),
  path.join(root, 'library/component/dropdown_list/dropdown-list.js'),
  path.join(root, 'library/component/dropdown_list/dropdown-list.css')
];

const tasksHtml = fs.readFileSync(tasksHtmlPath, 'utf8');
const calendarHtml = fs.readFileSync(calendarHtmlPath, 'utf8');
const tasksJs = fs.readFileSync(tasksJsPath, 'utf8');
const calendarJs = fs.readFileSync(calendarJsPath, 'utf8');
const persistenceJs = fs.readFileSync(persistencePath, 'utf8');
const styleCss = fs.readFileSync(stylePath, 'utf8');

for (const [name, html] of [['Tasks', tasksHtml], ['Calendar', calendarHtml]]) {
  assert.match(html, /src="persistence\.js"/, `${name} must load local persistence`);
  assert.doesNotMatch(html, /demo-persistence\.js/, `${name} must not load seeded demo persistence`);
  assert.match(html, /src="\.\.\/\.\.\/\.\.\/library\/component\/mini_calendar\/mini-calendar\.js"/, `${name} must load the local mini calendar`);
  assert.match(html, /src="\.\.\/\.\.\/\.\.\/library\/component\/dropdown_list\/dropdown-list\.js"/, `${name} must load the local dropdown component`);
  assert.match(html, /href="\.\.\/\.\.\/\.\.\/library\/component\/mini_calendar\/mini-calendar\.css"/, `${name} must load the local mini calendar styles`);
  assert.match(html, /href="\.\.\/\.\.\/\.\.\/library\/component\/dropdown_list\/dropdown-list\.css"/, `${name} must load the local dropdown styles`);
  assert.doesNotMatch(html, /Demo - resets on refresh|<title>[^<]*DEMO/i, `${name} must not expose demo language`);
  assert.match(html, /class="save-status-dot"/, `${name} must retain the header save status`);
  assert.match(html, /Connect workspace file to edit/, `${name} must explain the locked startup state`);
}

assert.ok(fs.existsSync(persistencePath), 'local persistence implementation must exist');
assert.ok(!fs.existsSync(path.join(plannerRoot, 'demo-persistence.js')), 'seeded persistence file must be removed');
componentPaths.forEach((componentPath) => assert.ok(fs.existsSync(componentPath), `missing copied component: ${componentPath}`));
assert.match(persistenceJs, /showOpenFilePicker/);
assert.match(persistenceJs, /requestPermission\(\{ mode: ['"]readwrite['"] \}\)/);
assert.match(persistenceJs, /workspace-persist-dot/);
assert.match(persistenceJs, /data-indicator/);
assert.match(persistenceJs, /guardMutation/);
assert.match(persistenceJs, /syncMutationControls/);
assert.match(persistenceJs, /window\.workspacePersistence/);
assert.match(persistenceJs, /window\.PublicWorkspacePersistenceFormat/);
assert.doesNotMatch(persistenceJs, /Users\/beer|D:\\\\Beer|WORKSPACE_PROFILES|macpro-m5|asus-tuf-f15/i);

assert.ok((tasksJs.match(/workspacePersistence\.guardMutation\(\)/g) || []).length >= 4,
  'Tasks mutation entry points must enforce the write gate');
assert.ok((calendarJs.match(/workspacePersistence\.guardMutation\(\)/g) || []).length >= 3,
  'Calendar mutation entry points must enforce the write gate');

assert.match(tasksJs, /ConyMiniCalendar/);
assert.match(tasksJs, /ConyDropdownList/);
assert.match(calendarJs, /ConyMiniCalendar/);
assert.match(calendarJs, /ConyDropdownList/);
assert.match(tasksJs, /syncSaveIndicatorFromWorkspace/);
assert.match(calendarJs, /syncSaveIndicatorFromWorkspace/);
assert.doesNotMatch(calendarJs, /KP Trader Meeting|Express Way Discuss|Survey TOPSP|Monthly MPO|UK Trip/);
for (const filePath of [tasksJsPath, calendarJsPath, ...componentPaths]) {
  const source = fs.readFileSync(filePath, 'utf8');
  assert.doesNotMatch(source, /Users\/beer|D:\\\\Beer|chatchon|AIS|workspace-data\.js\s*<\/script>/i,
    `private path or embedded data reference found in ${filePath}`);
}

assert.match(styleCss, /\.workspace-persist-dot\[data-indicator="green"\]/);
assert.match(styleCss, /\.workspace-persist-dot\[data-indicator="amber"\]/);
assert.match(styleCss, /\.workspace-persist-lock-warning/);
assert.match(styleCss, /workspace-persist-lock-fade-in/);

const sandbox = {
  document: {
    readyState: 'loading',
    addEventListener() {}
  },
  localStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  },
  setTimeout,
  clearTimeout,
  Date,
  JSON,
  Promise,
  console
};
sandbox.window = sandbox;
vm.runInNewContext(persistenceJs, sandbox);

const format = sandbox.window.PublicWorkspacePersistenceFormat;
assert.ok(format, 'persistence format helpers must be exposed for deterministic validation');
const empty = format.createDefaultData();
assert.equal(JSON.stringify(empty.sections.tasks), '[]');
assert.equal(JSON.stringify(empty.sections.calendarNotes), '{}');

const source = format.serializeData({
  meta: { version: 1, savedAt: '', savedBy: 'PUBLIC WORKSPACE' },
  sections: {
    tasks: [{ id: 'local-task', title: 'Private task' }],
    calendarNotes: { '2026-09-21': [{ id: 'local-event', title: 'Private event' }] },
    notes: [{ id: 'preserve-me' }]
  }
});
assert.match(source, /^window\.WORKSPACE_DATA = [\s\S]+;\n$/);
const parsed = format.parseWorkspaceScript(source);
assert.equal(parsed.sections.tasks[0].id, 'local-task');
assert.equal(parsed.sections.calendarNotes['2026-09-21'][0].id, 'local-event');
assert.equal(parsed.sections.notes[0].id, 'preserve-me', 'unrelated user sections must survive a public save');
assert.throws(() => format.parseWorkspaceScript('window.BAD_DATA = {};'), /does not assign window\.WORKSPACE_DATA/);

console.log('PASS Task Planner local connection contract');
