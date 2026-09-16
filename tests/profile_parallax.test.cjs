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

assert.equal(parallax.offsetFor(0, 40), -20);
assert.equal(parallax.offsetFor(0.5, 40), 0);
assert.equal(parallax.offsetFor(1, 40), 20);
assert.equal(parallax.offsetFor(0.5, 40, -1), 0);

console.log('PASS profile parallax math');
