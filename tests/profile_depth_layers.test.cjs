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

for (const [body, name] of [[texture, 'hero texture'], [stars, 'celestial stars']]) {
  const opacity = Number(property(body, 'opacity'));
  assert.ok(opacity >= 0.1 && opacity < 1, `${name} must be visible but translucent`);
  assert.equal(property(body, 'z-index'), '0', `${name} must sit as an explicit underlay`);
}

assert.equal(property(astrolabe, 'opacity'), '.68', 'astrolabe must remain translucent');
assert.equal(property(astrolabe, 'z-index'), '0', 'astrolabe must sit below the preview content');
assert.equal(property(heroGrid, 'position'), 'relative', 'hero content needs a stacking context above the underlay');
assert.equal(property(heroGrid, 'z-index'), '1', 'hero content must sit above the underlay');
assert.equal(property(projectsWrap, 'position'), 'relative', 'project content needs a stacking context above the stars');
assert.equal(property(projectsWrap, 'z-index'), '1', 'project content must sit above the stars');

const amounts = [...motion.matchAll(/amount:\s*(\d+),\s*mobileAmount:\s*(\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
assert.equal(amounts.length, 3, 'all three decorative layers need parallax amplitudes');
assert.ok(amounts.every(([desktop, mobile]) => desktop >= 60 && mobile >= 64), 'parallax amplitudes must be visible at both breakpoints');
assert.match(motion, /querySelector\('\.hero-texture'\), section: doc\.getElementById\('library'\)/);
assert.match(motion, /querySelector\('\.astrolabe'\), section: doc\.getElementById\('library'\)/);
assert.match(motion, /querySelector\('\.stars'\), section: doc\.getElementById\('celestial'\)/);
assert.match(html, /profile_style\.css\?v=20260916/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260906c/);

console.log('PASS profile depth layer stack');
