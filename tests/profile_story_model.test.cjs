const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../mainpage_component/profile_story_model.js');

test('collection progress selects five scenes at the specified boundaries', () => {
  const cases = [[0, 'radio'], [.2, 'tools'], [.4, 'workbench'], [.68, 'team'], [.88, 'horizon'], [1, 'horizon']];
  for (const [progress, scene] of cases) {
    assert.equal(model.sample('collection', progress).scene, scene, `progress ${progress}`);
  }
});

test('scene phase partitions are enter 25%, hold 55%, exit 20%', () => {
  assert.deepEqual(model.sample('collection', .1), { scene: 'radio', phase: 'hold', localProgress: .5 });
  assert.deepEqual(model.sample('collection', .025), { scene: 'radio', phase: 'enter', localProgress: .125 });
  assert.deepEqual(model.sample('collection', .16), { scene: 'radio', phase: 'exit', localProgress: .8 });
  assert.deepEqual(model.sample('collection', .2), { scene: 'tools', phase: 'enter', localProgress: 0 });
});

test('workbench text sequence enters for 40%, holds for 40%, then exits for 20%', () => {
  assert.deepEqual(model.workbenchPhase(.2), { phase: 'enter', localProgress: .5 });
  assert.deepEqual(model.workbenchPhase(.4), { phase: 'hold', localProgress: 0 });
  assert.deepEqual(model.workbenchPhase(.8), { phase: 'exit', localProgress: 0 });
  assert.deepEqual(model.workbenchPhase(1), { phase: 'exit', localProgress: 1 });
});

test('intro is visible at first load then exits, and contact enters then holds', () => {
  assert.deepEqual(model.sample('intro', 0), { scene: 'intro', phase: 'hold', localProgress: 0 });
  assert.equal(model.sample('intro', .8).phase, 'exit');
  assert.deepEqual(model.sample('contact', .25), { scene: 'contact', phase: 'hold', localProgress: .25 });
  assert.equal(model.sample('contact', 1).phase, 'hold');
});

test('progress inputs clamp at both ends', () => {
  assert.deepEqual(model.sample('collection', -1), model.sample('collection', 0));
  assert.deepEqual(model.sample('collection', 2), model.sample('collection', 1));
});

test('zone tints have broad smooth handoffs over one viewport height', () => {
  const h = 1000;
  const values = Array.from({ length: 11 }, (_, i) => model.tone(650 + i * 100, 1000, 3000, h).intro);
  assert.equal(model.tone(650, 1000, 3000, h).intro, 1);
  assert.equal(model.tone(1650, 1000, 3000, h).intro, 0);
  assert.ok(values.every((value, i) => i === 0 || value <= values[i - 1]));
  assert.equal(model.tone(2650, 1000, 3000, h).contact, 0);
  assert.equal(model.tone(3650, 1000, 3000, h).contact, 1);
  assert.ok(model.tone(2150, 1000, 3000, h).light >= 0 && model.tone(2150, 1000, 3000, h).light <= 1);
});

test('header theme switches outside the hysteresis band and holds inside it', () => {
  assert.equal(model.headerTheme(.66, 'night'), 'paper');
  assert.equal(model.headerTheme(.5, 'paper'), 'paper');
  assert.equal(model.headerTheme(.5, 'night'), 'night');
  assert.equal(model.headerTheme(.34, 'paper'), 'night');
});

test('pin eligibility checks viewport, scene capacity and accessibility modes', () => {
  assert.equal(model.eligible(1024, 640, 616, false, false), true);
  assert.equal(model.eligible(1023, 800, 600, false, false), false);
  assert.equal(model.eligible(1440, 639, 600, false, false), false);
  assert.equal(model.eligible(1440, 900, 877, false, false), false);
  assert.equal(model.eligible(1440, 900, 600, true, false), false);
  assert.equal(model.eligible(1440, 900, 600, false, true), false);
});

test('all existing section hashes and the tools scene map to readable holds', () => {
  const cases = {
    library: ['intro', .4], celestial: ['collection', .1], 'story-tools': ['collection', .25],
    about: ['collection', .53], 'ai-team': ['collection', .74], uncharted: ['collection', .93], connect: ['contact', .3]
  };
  for (const [id, expected] of Object.entries(cases)) assert.deepEqual(model.anchorProgress(id), { zone: expected[0], progress: expected[1] }, id);
  assert.equal(model.anchorProgress('missing'), null);
});
