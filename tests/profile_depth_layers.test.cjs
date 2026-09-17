const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync(__dirname + '/../mainpage_component/profile_style.css', 'utf8');
const motion = fs.readFileSync(__dirname + '/../mainpage_component/profile_motion.js', 'utf8');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(escaped + '\\s*\\{([^}]*)\\}'));
  assert.ok(match, `Expected CSS rule for ${selector}`);
  return match[1];
}

function property(body, name) {
  const match = body.match(new RegExp('(?:^|;)\\s*' + name + '\\s*:\\s*([^;]+)'));
  assert.ok(match, `Expected ${name} declaration`);
  return match[1].trim();
}

const texture = rule('.hero-texture');
const stars = rule('.stars');
const astrolabe = rule('.astrolabe');
const heroGrid = rule('.hero-grid');
const projectsWrap = rule('.projects > .wrap');
const projects = rule('.projects');
const connect = rule('.connect');
const atmosphere = rule('.profile-atmosphere');
const paper = rule('.paper');
const night = rule('.night');

assert.equal((html.match(/class="profile-atmosphere"/g) || []).length, 1, 'profile needs one fixed atmosphere root');
for (const layer of ['profile-atmo-gradient', 'profile-atmo-texture', 'profile-atmo-grid-far', 'profile-atmo-grid-near', 'profile-atmo-stars-far', 'profile-atmo-stars-near', 'profile-atmo-nebula-teal', 'profile-atmo-nebula-gold', 'profile-atmo-galaxy', 'profile-atmo-clock-far', 'profile-atmo-clock-near', 'profile-atmo-dust']) {
  assert.match(html, new RegExp(`class="[^"]*${layer}[^"]*"`), `missing ${layer} atmosphere layer`);
}
assert.ok(fs.existsSync(__dirname + '/../mainpage_component/profile_galaxy_showcase.png'), 'generated showcase galaxy asset must be present');
assert.equal(property(atmosphere, 'position'), 'fixed', 'atmosphere must stay fixed behind the page');
assert.equal(property(atmosphere, 'z-index'), '0', 'atmosphere must be the lowest page layer');
assert.match(property(paper, 'background-color'), /^rgba\(/, 'paper sections must reveal the atmosphere');
assert.match(property(night, 'background-color'), /^rgba\(/, 'night sections must reveal the atmosphere');
for (const selector of ['.profile-atmo-gradient', '.profile-atmo-texture', '.profile-atmo-grid', '.profile-atmo-stars', '.profile-atmo-nebula', '.profile-atmo-galaxy', '.profile-atmo-clock', '.profile-atmo-dust']) {
  assert.match(property(rule(selector), 'transform'), /var\(--parallax-y/);
}

for (const [body, name] of [[texture, 'hero texture'], [stars, 'celestial stars']]) {
  const opacity = Number(property(body, 'opacity'));
  assert.ok(opacity >= 0.1 && opacity < 1, `${name} must be visible but translucent`);
  assert.equal(property(body, 'z-index'), '0', `${name} must sit as an explicit underlay`);
}
assert.match(texture, /profile_galaxy_showcase\.png/, 'hero texture must use the generated galaxy artwork');
assert.doesNotMatch(texture, /library_bg\.png/, 'deprecated library picture must not remain as the hero texture');
assert.match(stars, /profile_galaxy_showcase\.png/, 'showcase stars must use the generated galaxy artwork');
assert.doesNotMatch(stars, /cosmic_bg\.png/, 'deprecated purple cosmic picture must not remain in the showcase');

assert.equal(property(astrolabe, 'opacity'), '.68', 'astrolabe must remain translucent');
assert.equal(property(astrolabe, 'z-index'), '0', 'astrolabe must sit below the preview content');
assert.equal(property(heroGrid, 'position'), 'relative', 'hero content needs a stacking context above the underlay');
assert.equal(property(heroGrid, 'z-index'), '1', 'hero content must sit above the underlay');
assert.equal(property(projectsWrap, 'position'), 'relative', 'project content needs a stacking context above the stars');
assert.equal(property(projectsWrap, 'z-index'), '1', 'project content must sit above the stars');
assert.match(projects, /linear-gradient\(to bottom/, 'showcase must fade into the preceding section');
assert.match(connect, /linear-gradient\(to bottom/, 'contact must fade out of the night sections');

const sectionMotion = motion.match(/var parallaxLayers = parallax \? \[([\s\S]*?)\n  \].*?;\n/);
assert.ok(sectionMotion, 'existing local layers must remain connected to the controller');
const sectionAmounts = [...sectionMotion[1].matchAll(/amount:\s*(\d+),\s*mobileAmount:\s*(\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
assert.equal(sectionAmounts.length, 3, 'existing local layers need parallax amplitudes');
assert.ok(sectionAmounts.every(([desktop, mobile]) => desktop >= 60 && mobile >= 64), 'existing local layers must remain visible at both breakpoints');
const atmosphereMotion = motion.match(/var atmosphereLayers = parallax \? \[([\s\S]*?)\n  \].*?;\n/);
assert.ok(atmosphereMotion, 'fixed atmosphere layers must be connected to the controller');
const atmosphereAmounts = [...atmosphereMotion[1].matchAll(/amount:\s*(\d+),\s*mobileAmount:\s*(\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
assert.ok(atmosphereAmounts.length >= 10, 'fixed atmosphere needs multiple independent layers');
assert.ok(new Set(atmosphereAmounts.map(([desktop]) => desktop)).size >= 4, 'fixed atmosphere layers need different desktop speeds');
assert.ok(atmosphereAmounts.every(([desktop, mobile]) => desktop >= 24 && mobile >= 16), 'fixed atmosphere layers need visible movement at both breakpoints');
const atmosphereTravel = [...atmosphereMotion[1].matchAll(/travel:\s*(\d+),\s*mobileTravel:\s*(\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
assert.ok(atmosphereTravel.length >= 10, 'fixed atmosphere layers need responsive scroll travel');
assert.ok(new Set(atmosphereTravel.map(([desktop]) => desktop)).size >= 4, 'fixed atmosphere layers need different scroll speeds');
assert.ok(atmosphereTravel.every(([desktop, mobile]) => desktop >= 30 && mobile >= 20), 'fixed atmosphere layers must move within one viewport scroll');
assert.match(motion, /querySelector\('\.hero-texture'\), section: doc\.getElementById\('library'\)/);
assert.match(motion, /querySelector\('\.astrolabe'\), section: doc\.getElementById\('library'\)/);
assert.match(motion, /querySelector\('\.stars'\), section: doc\.getElementById\('celestial'\)/);
assert.match(html, /profile_style\.css\?v=20260918g/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918f/);

console.log('PASS profile depth layer stack');
