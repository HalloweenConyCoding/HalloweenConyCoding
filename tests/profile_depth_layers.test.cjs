const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = (path) => fs.readFileSync(__dirname + '/../' + path, 'utf8');
const css = read('mainpage_component/profile_style.css');
const motion = read('mainpage_component/profile_motion.js');
const story = read('mainpage_component/profile_story.js');
const model = read('mainpage_component/profile_story_model.js');
const html = read('index.html');

function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(escaped + '\\s*\\{([^}]*)\\}'));
  assert.ok(match, `Expected CSS rule for ${selector}`);
  return match[1];
}

function property(body, name) {
  const match = body.match(new RegExp('(?:^|;)\\s*' + name + '\\s*:\\s*([^;]+)'));
  assert.ok(match, `Expected ${name} declaration`);
  return match[1].trim();
}

// Keep the layered wallpaper independent from the fixed-zone foreground system.
assert.equal((html.match(/class="profile-atmosphere"/g) || []).length, 1, 'profile needs one fixed atmosphere root');
for (const layer of ['profile-atmo-gradient', 'profile-atmo-texture', 'profile-atmo-grid-far', 'profile-atmo-grid-near', 'profile-atmo-stars-far', 'profile-atmo-stars-near', 'profile-atmo-nebula-teal', 'profile-atmo-nebula-gold', 'profile-atmo-galaxy', 'profile-atmo-clock-far', 'profile-atmo-clock-near', 'profile-atmo-dust']) {
  assert.match(html, new RegExp(`class="[^\"]*${layer}[^\"]*"`), `missing ${layer} atmosphere layer`);
}
assert.ok(fs.existsSync(__dirname + '/../mainpage_component/profile_galaxy_showcase.png'), 'generated showcase wallpaper must be present');
assert.ok(fs.existsSync(__dirname + '/../mainpage_component/previews/radio-tool-v8.jpg'), 'current V8 calculator preview must be present');
assert.match(html, /src="mainpage_component\/previews\/radio-tool-v8\.jpg"/);
assert.equal(property(rule(css, '.profile-atmosphere'), 'position'), 'fixed');
assert.equal(property(rule(css, '.profile-atmosphere'), 'z-index'), '0');
assert.match(property(rule(css, '.paper'), 'background-color'), /^rgba\(/);
assert.match(property(rule(css, '.night'), 'background-color'), /^(rgba\(|transparent)/);
for (const selector of ['.profile-atmo-gradient', '.profile-atmo-texture', '.profile-atmo-grid', '.profile-atmo-stars', '.profile-atmo-nebula', '.profile-atmo-galaxy', '.profile-atmo-clock', '.profile-atmo-dust']) {
  assert.match(property(rule(css, selector), 'transform'), /var\(--parallax-y/);
}
assert.doesNotMatch(html, /class="stars"|class="hero-texture"/, 'zones must share the fixed wallpaper');
assert.equal(property(rule(css, '.hero.paper'), 'background-color'), 'transparent');
assert.equal(property(rule(css, '.footer.paper'), 'background-color'), 'transparent');
assert.equal(property(rule(css, '.profile-atmo-galaxy'), 'mix-blend-mode'), 'normal');
assert.match(property(rule(css, '.profile-atmo-galaxy'), 'transition'), /opacity 1\.1s ease, filter 1\.1s ease/);
assert.doesNotMatch(css, /body\[data-theme="night"\]\s+\.profile-atmo-gradient/);

// The semantic document remains usable before enhancement and in every fallback.
assert.deepEqual([...html.matchAll(/data-zone="([^"]+)"/g)].map((match) => match[1]), ['intro', 'collection', 'contact']);
assert.deepEqual([...html.matchAll(/data-story-scene="([^"]+)"/g)].map((match) => match[1]), ['intro', 'radio', 'tools', 'workbench', 'team', 'horizon', 'contact']);
for (const id of ['library', 'celestial', 'story-tools', 'about', 'ai-team', 'uncharted', 'connect']) assert.match(html, new RegExp(`id="${id}"`), `missing story destination #${id}`);
assert.equal((html.match(/data-story-controls/g) || []).length, 3, 'each zone must own its scene controls');
assert.match(html, /data-story-prev/);
assert.match(html, /data-story-next/);
assert.match(html, /data-story-status/);
assert.equal(property(rule(css, '.story-controls'), 'display'), 'none', 'controls stay hidden in native flow');
assert.match(rule(css, '.story-active .story-stage'), /height:\s*var\(--story-stage-height\)/, 'stage positioning is enhancement-only');
assert.match(rule(css, '.story-active .story-stage > \[data-story-scene\]'), /position:\s*absolute/);
assert.equal((html.match(/class="bio-text"/g) || []).length, 4, 'all original biography paragraphs must remain');
assert.doesNotMatch(html, /\/Users\/[^"' ]+/, 'public homepage must not include a machine-specific path');

// Checked-in animation libraries load before the story controller; no runtime CDN is needed.
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1]);
const positions = ['mainpage_component/gsap/gsap.min.js', 'mainpage_component/gsap/ScrollTrigger.min.js', 'mainpage_component/profile_story_model.js', 'mainpage_component/profile_story.js', 'mainpage_component/profile_motion.js'].map((src) => scripts.findIndex((item) => item.startsWith(src)));
assert.ok(positions.every((position) => position >= 0), 'all story and animation scripts must be loaded locally');
assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]), 'GSAP, model, runtime and motion controller must load in dependency order');
assert.ok(positions.every((position) => !/^https?:/.test(scripts[position])), 'story runtime must not depend on a CDN');
assert.match(html, /profile_style\.css\?v=\d{8}[a-z]?/, 'the current stylesheet must keep a cache-busting version');

// Story controller contract: one scrubbed pin owner per zone, measured capacity,
// scene accessibility, native-flow teardown and legacy-motion handoff.
assert.match(story, /var budgets = \{ intro: 1\.5, collection: 8, contact: 1 \}/);
assert.match(story, /pin: stage/);
assert.match(story, /pinSpacing: name === 'contact'/);
assert.match(story, /scrub: \.6/);
assert.match(story, /model\.eligible\(window\.innerWidth, availableHeight, maxSceneHeight, reduced\.matches, forcedColors\.matches\)/);
assert.match(story, /scene\.inert = !visible/);
assert.match(story, /scene\.setAttribute\('aria-hidden', 'true'\)/);
assert.match(story, /function navigate\(id, options\)/);
assert.match(story, /function refresh\(\)/);
assert.match(story, /function destroy\(\)/);
assert.match(story, /function useNativeFlow\(/);
assert.match(story, /window\.addEventListener\('resize', scheduleRefresh/);
assert.match(story, /reduced\.addEventListener\('change', preferenceChanged\)/);
assert.match(story, /forcedColors\.addEventListener\('change', preferenceChanged\)/);
assert.match(story, /document\.fonts\.ready\.then\(scheduleRefresh\)/);
assert.match(story, /onSummaryClick/);
assert.match(story, /preserveElementTop\(element, elementTop\)/);
assert.match(motion, /window\.ProfileStory\.init/);
assert.match(motion, /storyController && storyController\.isActive\(\)/, 'legacy reveals and tint updates must yield to active story mode');
assert.match(model, /function eligible\(width, height, maxSceneHeight, reduced, forcedColors\)/);
assert.match(model, /!reduced && !forcedColors/);
assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /@media \(forced-colors:\s*active\)/);

// The independent parallax controller still gives each fixed layer its own speed.
const atmosphereMotion = motion.match(/var atmosphereLayers = parallax \? \[([\s\S]*?)\n  \].*?;/);
assert.ok(atmosphereMotion, 'fixed wallpaper layers must remain connected to the parallax controller');
const amounts = [...atmosphereMotion[1].matchAll(/amount:\s*(\d+),\s*mobileAmount:\s*(\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
const travel = [...atmosphereMotion[1].matchAll(/travel:\s*(\d+),\s*mobileTravel:\s*(\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
assert.ok(amounts.length >= 10 && new Set(amounts.map(([desktop]) => desktop)).size >= 4, 'wallpaper layers need independent depth amplitudes');
assert.ok(travel.length >= 10 && new Set(travel.map(([desktop]) => desktop)).size >= 4, 'wallpaper layers need independent scroll speeds');
assert.match(motion, /querySelector\('\.astrolabe'\), section: doc\.getElementById\('library'\)/);

console.log('PASS profile depth layers and story runtime contracts');
