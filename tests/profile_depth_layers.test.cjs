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

const astrolabe = rule('.astrolabe');
const heroGrid = rule('.hero-grid');
const projectsWrap = rule('.projects > .wrap');
const projects = rule('.projects');
const collectionOverlay = rule('.profile-zone-collection::before');
const contactOverlay = rule('.profile-zone-contact::before');
const connect = rule('.connect');
const zoneCollection = rule('.profile-zone-collection');
const about = rule('.about');
const zoneTint = rule('.profile-atmo-zone-tint');
const revealCard = rule('[data-gsap-reveal]');
const aboutMotionHooks = rule('[data-gsap-about], [data-gsap-about-card]');
const footer = rule('.footer.paper');
const atmosphere = rule('.profile-atmosphere');
const paper = rule('.paper');
const night = rule('.night');

assert.equal((html.match(/class="profile-atmosphere"/g) || []).length, 1, 'profile needs one fixed atmosphere root');
for (const layer of ['profile-atmo-gradient', 'profile-atmo-texture', 'profile-atmo-grid-far', 'profile-atmo-grid-near', 'profile-atmo-stars-far', 'profile-atmo-stars-near', 'profile-atmo-nebula-teal', 'profile-atmo-nebula-gold', 'profile-atmo-galaxy', 'profile-atmo-clock-far', 'profile-atmo-clock-near', 'profile-atmo-dust']) {
  assert.match(html, new RegExp(`class="[^"]*${layer}[^"]*"`), `missing ${layer} atmosphere layer`);
}
assert.ok(fs.existsSync(__dirname + '/../mainpage_component/profile_galaxy_showcase.png'), 'generated showcase galaxy asset must be present');
assert.ok(fs.existsSync(__dirname + '/../mainpage_component/previews/radio-tool-v8.jpg'), 'current V8 calculator preview asset must be present');
assert.match(html, /src="mainpage_component\/previews\/radio-tool-v8\.jpg"/, 'profile must use the current V8 calculator preview');
assert.equal(property(atmosphere, 'position'), 'fixed', 'atmosphere must stay fixed behind the page');
assert.equal(property(atmosphere, 'z-index'), '0', 'atmosphere must be the lowest page layer');
assert.match(property(paper, 'background-color'), /^rgba\(/, 'paper sections must reveal the atmosphere');
assert.match(property(night, 'background-color'), /^(rgba\(|transparent)/, 'night sections must reveal the atmosphere');
for (const selector of ['.profile-atmo-gradient', '.profile-atmo-texture', '.profile-atmo-grid', '.profile-atmo-stars', '.profile-atmo-nebula', '.profile-atmo-galaxy', '.profile-atmo-clock', '.profile-atmo-dust']) {
  assert.match(property(rule(selector), 'transform'), /var\(--parallax-y/);
}

assert.doesNotMatch(html, /class="stars"/, 'showcase must use the continuous fixed wallpaper without a clipped local layer');
assert.doesNotMatch(html, /class="hero-texture"/, 'intro must use the fixed wallpaper instead of a duplicate local picture');
assert.match(rule('.hero.paper'), /background-color:\s*transparent/);
assert.match(footer, /background-color:\s*transparent/);
assert.match(rule('.profile-atmo-galaxy'), /inset:\s*-60%\s+-16%/);
assert.equal(property(rule('.profile-atmo-galaxy'), 'mix-blend-mode'), 'normal', 'galaxy treatment must not switch blend modes at theme boundaries');
assert.match(rule('.profile-atmo-galaxy'), /transition:\s*opacity 1\.1s ease, filter 1\.1s ease/, 'galaxy treatment must crossfade between themes');
assert.doesNotMatch(css, /body\[data-theme="night"\]\s+\.profile-atmo-gradient/, 'the fixed gradient must not swap images at theme boundaries');

assert.equal(property(astrolabe, 'opacity'), '.68', 'astrolabe must remain translucent');
assert.equal(property(astrolabe, 'z-index'), '0', 'astrolabe must sit below the preview content');
assert.equal(property(heroGrid, 'position'), 'relative', 'hero content needs a stacking context above the underlay');
assert.equal(property(heroGrid, 'z-index'), '1', 'hero content must sit above the underlay');
assert.equal(property(projectsWrap, 'position'), 'relative', 'project content needs a stacking context above the stars');
assert.equal(property(projectsWrap, 'z-index'), '1', 'project content must sit above the stars');
assert.equal(property(projects, 'background-image'), 'none', 'showcase must not start a hard-edged section surface');
assert.match(collectionOverlay, /inset:\s*-240px 0 0/, 'collection darkening must overlap the preceding section');
assert.match(collectionOverlay, /linear-gradient\(to bottom/, 'collection darkening must fade continuously');
assert.equal(property(rule('.profile-zone-collection .night'), 'background-color'), 'transparent', 'night sections must share the wallpaper');
assert.equal(property(connect, 'background-image'), 'none', 'contact must not start a hard-edged surface');
assert.match(contactOverlay, /inset:\s*0/);
assert.match(contactOverlay, /linear-gradient\(to bottom/, 'contact must fade out of the night sections');
assert.equal((html.match(/class="profile-zone /g) || []).length, 3, 'homepage must have three top-level profile zones');
assert.match(html, /class="profile-zone profile-zone-intro"[^>]*data-zone="intro"/);
assert.match(html, /class="profile-zone profile-zone-collection"[^>]*data-zone="collection"/);
assert.match(html, /class="profile-zone profile-zone-contact"[^>]*data-zone="contact"/);
assert.match(html, /gsap\.min\.js/);
assert.match(html, /ScrollTrigger\.min\.js/);
assert.ok(html.indexOf('ScrollTrigger.min.js') < html.indexOf('profile_motion.js'), 'ScrollTrigger must load before the motion controller');
assert.match(html, /class="profile-atmo-zone-tint profile-atmo-zone-tint-intro"/);
assert.match(html, /class="profile-atmo-zone-tint profile-atmo-zone-tint-collection"/);
assert.match(html, /class="profile-atmo-zone-tint profile-atmo-zone-tint-contact"/);
assert.match(html, /project-featured[^>]*data-gsap-reveal="up"/);
assert.match(html, /project-card reveal[^>]*data-gsap-reveal="right"/);
assert.match(html, /project-card reveal[^>]*data-gsap-reveal="left"/);
for (const beat of ['eyebrow', 'heading', 'body-1', 'body-2', 'story']) {
  assert.match(html, new RegExp(`data-gsap-about="${beat}"`), `missing about reveal beat ${beat}`);
}
assert.match(html, /class="capabilities reveal"[^>]*data-gsap-about-card="right"/);
const aboutBeatOrder = ['eyebrow', 'heading', 'body-1', 'body-2', 'story'].map((beat) => html.indexOf(`data-gsap-about="${beat}"`));
assert.ok(aboutBeatOrder.every((position, index) => index === 0 || position > aboutBeatOrder[index - 1]), 'about reveal beats must follow the reading order');
assert.match(motion, /ScrollTrigger/);
assert.match(motion, /gsap\.timeline/);
assert.match(motion, /data-gsap-reveal/);
assert.match(motion, /toggleActions:\s*'play none play reverse'/);
assert.match(motion, /var overshoot = direction === 'up' \? \{ y: -3 \} : null/);
assert.match(motion, /if \(overshoot\)/, 'side-card reveals must settle without a horizontal bounce');
assert.match(motion, /function initAboutRevealMotion\(\)/, 'about workbench needs its own reveal sequence');
assert.match(motion, /querySelectorAll\('\[data-gsap-about\]'\)/, 'about copy beats must be sequenced as a group');
assert.match(motion, /querySelector\('\[data-gsap-about-card="right"\]'\)/, 'about skills card needs a right-entry reveal');
assert.match(motion, /duration:\s*\.82,\s*stagger:\s*\.2/, 'about copy beats need a slower readable sequence');
assert.match(motion, /start:\s*'top 62%'[\s\S]*?end:\s*'bottom 18%'/, 'about reveal should wait until the workbench is arriving');
assert.match(motion, /toggleActions:\s*'play none play reverse'/g, 'about reveal must reverse and replay');
assert.match(motion, /paperThreshold = threshold \+ Math\.max\(180, Math\.round\(window\.innerHeight \* \.65\)\)/, 'paper header state must lead the contact boundary');
assert.match(motion, /paperExitThreshold = threshold \+ Math\.max\(120, Math\.round\(window\.innerHeight \* \.5\)\)/, 'paper header state must have a separate exit threshold');
assert.match(motion, /themeBuffer = Math\.max\(48, Math\.round\(window\.innerHeight \* \.15\)\)/, 'theme boundaries need a scroll buffer');
assert.match(zoneCollection, /margin-top|padding/);
assert.equal(property(about, 'overflow'), 'clip', 'Workbench transforms must be clipped to the section width');
assert.match(zoneTint, /opacity/);
assert.match(revealCard, /will-change|opacity|transform/);
assert.match(aboutMotionHooks, /will-change|opacity|transform/);

const sectionMotion = motion.match(/var parallaxLayers = parallax \? \[([\s\S]*?)\n  \].*?;\n/);
assert.ok(sectionMotion, 'existing local layers must remain connected to the controller');
const sectionAmounts = [...sectionMotion[1].matchAll(/amount:\s*(\d+),\s*mobileAmount:\s*(\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
assert.equal(sectionAmounts.length, 1, 'the remaining local layer needs a parallax amplitude');
assert.ok(sectionAmounts.every(([desktop, mobile]) => desktop >= 60 && mobile >= 64), 'remaining local layers must remain visible at both breakpoints');
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
assert.match(motion, /querySelector\('\.astrolabe'\), section: doc\.getElementById\('library'\)/);
assert.doesNotMatch(motion, /querySelector\('\.stars'/);
assert.match(html, /profile_style\.css\?v=20260919f/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918n/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918m/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918l/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918k/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918j/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918i/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918h/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918g/);
assert.doesNotMatch(html, /profile_style\.css\?v=20260918f/);

console.log('PASS profile depth layer stack');
