const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const helperPath = __dirname + '/../mainpage_component/profile_parallax.js';
const source = fs.existsSync(helperPath) ? fs.readFileSync(helperPath, 'utf8') : '';
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context, { filename: 'profile_parallax.js' });

const parallax = context.window.ProfileParallax;
assert.ok(parallax, 'ProfileParallax helper should be available');

assert.equal(parallax.sectionProgress({ top: 800, height: 800, viewportHeight: 800 }), 0);
assert.equal(parallax.sectionProgress({ top: 0, height: 800, viewportHeight: 800 }), 0.5);
assert.equal(parallax.sectionProgress({ top: -800, height: 800, viewportHeight: 800 }), 1);

assert.equal(parallax.pageProgress(0, 2000, 800), 0);
assert.equal(parallax.pageProgress(600, 2000, 800), 0.5);
assert.equal(parallax.pageProgress(1200, 2000, 800), 1);

assert.equal(parallax.offsetFor(0, 40), -20);
assert.equal(parallax.offsetFor(0.5, 40), 0);
assert.equal(parallax.offsetFor(1, 40), 20);
assert.equal(parallax.offsetFor(0.5, 40, -1), 0);
assert.equal(parallax.scrollOffset(0, 800, 72, 1, 240), 0);
assert.equal(parallax.scrollOffset(800, 800, 72, 1, 240), 72);
assert.equal(parallax.scrollOffset(800, 800, 72, -1, 240), -72);
assert.equal(parallax.scrollOffset(6400, 800, 72, 1, 180), 180, 'scroll travel must cap instead of drifting indefinitely');
assert.equal(parallax.scrollOffset('bad', 800, 72, 1, 180), 0);

console.log('PASS profile parallax math');
