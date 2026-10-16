// In cua_repl import this module and run runStoryChecks(tab) on the local homepage.
function check(value, message) { if (!value) throw new Error(message); }

export async function runStoryChecks(tab) {
  const state = await tab.playwright.evaluate(() => ({
    zones: [...document.querySelectorAll('main > [data-zone]')].map(el => ({ zone: el.dataset.zone, stage: !!el.querySelector('.story-stage') })),
    collectionScenes: [...document.querySelectorAll('[data-zone="collection"] [data-story-scene]')].map(el => el.dataset.storyScene),
    destinations: ['library', 'celestial', 'about', 'ai-team', 'uncharted', 'connect'].every(id => !!document.getElementById(id)),
    paragraphs: document.querySelectorAll('#about .bio-text').length,
    previewLinks: ['Radio Planning Tools', 'Try Task Planner', 'Open CodeSnippet', 'Explore the AI team'].map(label => [...document.querySelectorAll('a')].some(a => a.textContent.includes(label))),
    controls: [...document.querySelectorAll('.story-stage')].every(stage => stage.querySelector('[data-story-controls]')),
    controlsHidden: [...document.querySelectorAll('[data-story-controls]')].every(el => getComputedStyle(el).display === 'none'),
    fallbackVisible: (() => {
      const targets = [...document.querySelectorAll('[data-story-scene]')];
      return targets.every(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    })(),
    active: document.documentElement.classList.contains('story-active'),
    eligible: document.documentElement.classList.contains('story-eligible'),
    width: innerWidth,
    usableHeight: innerHeight - (document.getElementById('mainNav')?.getBoundingClientRect().height || 0),
    overflow: document.documentElement.scrollWidth > innerWidth
  }));
  check(state.zones.length === 3 && state.zones.every(item => item.stage), 'Each profile zone must own one story stage');
  check(state.zones.map(item => item.zone).join(',') === 'intro,collection,contact', 'The three zones must remain in A/B/C order');
  check(state.collectionScenes.join(',') === 'radio,tools,workbench,team,horizon', 'Collection must expose its five readable scenes');
  check(state.destinations && state.paragraphs === 4, 'Original destinations and all four biography paragraphs must remain');
  check(state.previewLinks.every(Boolean), 'All original project links must remain');
  check(state.controls, 'Every zone stage must contain its enhancement controls');
  if (!state.active) {
    check(state.controlsHidden, 'Story controls must stay hidden while native flow is active');
    check(state.fallbackVisible, 'Native flow must leave every scene readable when pinning is inactive');
  } else {
    check(state.eligible && !state.controlsHidden, 'Pinned mode must expose controls only after capacity succeeds');
  }
  if (state.width < 1024 || state.usableHeight < 640) check(!state.eligible, 'Short or narrow viewports must use native flow');
  if (state.width >= 1440 && state.usableHeight >= 640) check(state.eligible, 'A roomy desktop with fitting scenes should be eligible');
  check(!state.overflow, 'The homepage must not overflow horizontally');
  return { passed: 10, scope: 'stage structure, scenes, preserved content, capacity fallback and overflow' };
}

export async function runMotionChecks(tab) {
  await tab.pressKey(null, 'Home');
  await tab.playwright.waitForTimeout(700);
  const state = await tab.playwright.evaluate(() => {
    return {
      active: document.documentElement.classList.contains('story-active'),
      eligible: document.documentElement.classList.contains('story-eligible'),
      pinSpacers: document.querySelectorAll('.pin-spacer').length,
      stageHeight: getComputedStyle(document.querySelector('[data-story-stage]')).height,
      usableHeight: innerHeight - document.getElementById('mainNav').getBoundingClientRect().height,
      introOpacity: Number(getComputedStyle(document.getElementById('library')).opacity),
      introTint: Number(getComputedStyle(document.querySelector('.profile-atmo-zone-tint-intro')).opacity),
      collectionTint: Number(getComputedStyle(document.querySelector('.profile-atmo-zone-tint-collection')).opacity),
      firstSceneAccessible: !document.getElementById('library').hasAttribute('inert') && document.getElementById('library').getAttribute('aria-hidden') !== 'true'
    };
  });
  check(state.eligible, '1440×900 desktop should pass the measured stage capacity');
  check(state.active, 'Eligible desktop must activate the pinned story runtime');
  check(state.pinSpacers === 3, 'Exactly one ScrollTrigger pin must own each of the three stages');
  check(Math.abs(parseFloat(state.stageHeight) - state.usableHeight) <= 1, 'Pinned stages must fit below the measured header');
  check(state.introOpacity === 1, 'The first scene must be fully visible on first load');
  check(state.firstSceneAccessible, 'The initial scene must remain accessible');
  check(state.introTint > .99 && state.collectionTint < .01, 'The initial paper filter must be the sole visible zone tint');
  return { passed: 7, scope: 'desktop activation, zone pins, stage capacity and initial state' };
}

export async function runMotionTraversalChecks(tab) {
  async function read() {
    return tab.playwright.evaluate(() => {
      const style = selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const transform = getComputedStyle(element).transform;
        const values = transform.match(/matrix\(([^)]+)\)/);
        const matrix = values ? values[1].split(',').map(Number) : [];
        return { opacity: Number(getComputedStyle(element).opacity), x: Number((matrix.length === 6 ? matrix[4] : 0).toFixed(2)), y: Number((matrix.length === 6 ? matrix[5] : 0).toFixed(2)) };
      };
      return {
        theme: document.body.dataset.theme,
        introTint: Number(getComputedStyle(document.querySelector('.profile-atmo-zone-tint-intro')).opacity),
        intro: style('#library'), radio: style('#celestial .project-featured'),
        task: style('#story-tools [data-gsap-reveal=\"right\"]'), code: style('#story-tools [data-gsap-reveal=\"left\"]'),
        active: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null
      };
    });
  }
  async function key(name) { await tab.pressKey(null, name); await tab.playwright.waitForTimeout(750); }

  await key('Home');
  const top = await read();
  await key('PageDown');
  const aToBApproach = await read();
  await key('PageDown');
  const radioHold = await read();
  await key('PageUp');
  const handoffReverse = await read();
  await key('PageUp');
  const topAgain = await read();
  await key('PageDown');
  await key('PageDown');
  const radioReplay = await read();
  await key('PageDown');
  await key('PageDown');
  const toolsHold = await read();
  await key('ArrowDown');
  const toolsHoldAfterSmallScroll = await read();
  await key('ArrowUp');
  const toolsHoldReversed = await read();

  check(top.active === 'intro' && top.intro.opacity === 1, 'The opening scene must start visible and accessible');
  check(radioHold.active === 'radio' && radioHold.radio.opacity > .98 && Math.abs(radioHold.radio.y) <= 6, 'Radio must settle into a readable hold after entering');
  check(topAgain.intro.opacity === top.intro.opacity && topAgain.active === top.active, 'The intro must reconstruct the same state on reverse scroll');
  check(Math.abs(radioReplay.radio.opacity - radioHold.radio.opacity) < .02 && Math.abs(radioReplay.radio.y - radioHold.radio.y) < 1, 'Radio must reconstruct the same settled state after a reverse and replay');
  check(toolsHold.active === 'tools' && toolsHold.task.opacity > .98 && toolsHold.code.opacity > .98, 'Both opposing tool cards must reach full opacity in the hold');
  check(toolsHold.task.x === 0 && toolsHold.code.x === 0, 'Tool cards must settle at exactly x=0');
  check(toolsHoldAfterSmallScroll.task.x === toolsHold.task.x && toolsHoldAfterSmallScroll.code.x === toolsHold.code.x, 'Tool cards must not move sideways during the hold');
  check(toolsHoldReversed.task.x === toolsHold.task.x && toolsHoldReversed.code.x === toolsHold.code.x, 'Tool cards must retain exact x positions after a small reverse scroll');
  check(aToBApproach.introTint >= handoffReverse.introTint && top.theme === 'paper' && radioHold.theme === 'night', 'The tint and header must make one-way progress through the first handoff');
  return { passed: 9, scope: 'forward, reverse, replay, settled transforms and tint direction' };
}

export async function runContactBottomChecks(tab) {
  await tab.pressKey(null, 'End');
  await tab.playwright.waitForTimeout(1400);
  const state = await tab.playwright.evaluate(() => {
    const stage = document.querySelector('[data-story-stage="contact"]');
    const footer = document.querySelector('.footer');
    const scene = document.getElementById('connect');
    return {
      active: !scene.hasAttribute('inert') && scene.getAttribute('aria-hidden') !== 'true',
      opacity: Number(getComputedStyle(scene).opacity),
      theme: document.body.dataset.theme,
      tint: Number(getComputedStyle(document.querySelector('.profile-atmo-zone-tint-contact')).opacity),
      stage: stage.getBoundingClientRect().toJSON(),
      footer: footer.getBoundingClientRect().toJSON(),
      viewportHeight: innerHeight,
      atBottom: Math.abs(document.documentElement.scrollTop - (document.documentElement.scrollHeight - innerHeight)) <= 1,
      overflow: document.documentElement.scrollWidth > innerWidth
    };
  });
  check(state.atBottom, 'The bottom sample must reach the natural document end');
  check(state.active && state.opacity === 1, 'Contact must be fully visible and accessible at the bottom');
  check(state.theme === 'paper' && state.tint > .99, 'The contact light filter and header must finish in paper state');
  check(Math.abs(state.stage.bottom - state.footer.top) <= 2, 'The footer must follow the contact stage without a gap or overlap');
  check(state.footer.bottom <= state.viewportHeight + 1 && state.stage.height > 0, 'Contact and footer must share the final viewport');
  check(!state.overflow, 'The final pin handoff must not introduce horizontal overflow');
  return { passed: 6, scope: 'contact visibility, theme handoff and footer placement at document end' };
}

export async function runNavigationChecks(tab) {
  const base = new URL(await tab.url());
  base.searchParams.set('story', 'navigation-check');
  const anchors = {
    library: 'intro', celestial: 'radio', 'story-tools': 'tools', about: 'workbench',
    'ai-team': 'team', uncharted: 'horizon', connect: 'contact'
  };
  const direct = [];
  for (const [id, expectedScene] of Object.entries(anchors)) {
    base.hash = id;
    await tab.goto(base.href);
    await tab.playwright.waitForLoadState({ state: 'load', timeoutMs: 10000 }).catch(() => {});
    await tab.playwright.waitForTimeout(1300);
    const state = await tab.playwright.evaluate(() => ({
      hash: location.hash.slice(1),
      focus: document.activeElement?.id || '',
      active: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null,
      focusedHidden: !!document.activeElement?.closest('[data-story-scene]')?.hasAttribute('inert')
    }));
    check(state.hash === id && state.active === expectedScene, `Direct #${id} must select its story scene`);
    check(!state.focusedHidden, `A direct #${id} route must not leave focus inside an inactive scene`);
    direct.push(id);
  }

  const collection = documentBase(await tab.url());
  collection.hash = 'celestial';
  await tab.goto(collection.href);
  await tab.playwright.waitForLoadState({ state: 'load', timeoutMs: 10000 }).catch(() => {});
  await tab.playwright.waitForTimeout(650);
  await tab.playwright.locator('[data-story-stage="collection"] [data-story-next]').click();
  await tab.playwright.waitForTimeout(900);
  let state = await tab.playwright.evaluate(() => ({
    scene: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null,
    focus: document.activeElement?.id || ''
  }));
  check(state.scene === 'tools' && state.focus === 'story-tools', 'Next must navigate to the paired tools scene and focus it');
  await tab.playwright.locator('[data-story-stage="collection"] [data-story-prev]').click();
  await tab.playwright.waitForTimeout(900);
  state = await tab.playwright.evaluate(() => ({
    scene: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null,
    focus: document.activeElement?.id || ''
  }));
  check(state.scene === 'radio' && state.focus === 'celestial', 'Previous must return to Radio and focus its destination');

  await tab.playwright.getByRole('link', { name: 'About' }).click();
  await tab.playwright.waitForTimeout(1300);
  state = await tab.playwright.evaluate(() => ({ hash: location.hash.slice(1), scene: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null, focus: document.activeElement?.id || '' }));
  check(state.hash === 'about' && state.scene === 'workbench' && state.focus === 'about', 'Activating a navigation link must focus its matching visible destination');
  await tab.playwright.getByRole('link', { name: 'AI Team' }).click();
  await tab.playwright.waitForTimeout(1300);
  await tab.back();
  await tab.playwright.waitForTimeout(1000);
  state = await tab.playwright.evaluate(() => ({
    hash: location.hash.slice(1),
    scene: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null,
    focus: document.activeElement?.id || ''
  }));
  check(state.hash === 'about' && state.scene === 'workbench' && state.focus === 'about', 'Browser Back must restore the prior hash, scene and focus');
  await tab.forward();
  await tab.playwright.waitForTimeout(1000);
  state = await tab.playwright.evaluate(() => ({ hash: location.hash.slice(1), scene: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null }));
  check(state.hash === 'ai-team' && state.scene === 'team', 'Browser Forward must restore the next hash and scene');

  base.hash = '';
  await tab.goto(base.href);
  await tab.playwright.waitForLoadState({ state: 'load', timeoutMs: 10000 }).catch(() => {});
  await tab.playwright.waitForTimeout(600);
  for (let i = 0; i < 4; i += 1) await tab.pressKey(null, 'PageDown');
  await tab.playwright.waitForTimeout(900);
  const beforeReload = await tab.playwright.evaluate(() => document.documentElement.scrollTop);
  await tab.reload();
  await tab.playwright.waitForLoadState({ state: 'load', timeoutMs: 10000 }).catch(() => {});
  await tab.playwright.waitForTimeout(900);
  const restored = await tab.playwright.evaluate(() => ({
    y: document.documentElement.scrollTop,
    active: document.documentElement.classList.contains('story-active'),
    scene: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null
  }));
  check(beforeReload > 0 && restored.active && ['tools', 'workbench', 'team'].includes(restored.scene), 'Reloading mid-story must restore a meaningful active scene');
  return { passed: 20, directHashes: direct, scope: 'direct hashes, scene controls, browser history and scroll restoration' };
}

function documentBase(url) { return new URL(url); }

export async function runFocusRetentionChecks(tab) {
  const url = new URL(await tab.url());
  url.hash = 'celestial';
  await tab.goto(url.href);
  await tab.playwright.waitForLoadState({ state: 'load', timeoutMs: 10000 }).catch(() => {});
  await tab.playwright.waitForTimeout(650);
  await tab.playwright.locator('#mainNav a.nav-contact').press('Tab', { timeoutMs: 5000 });
  let state = await tab.playwright.evaluate(() => ({
    focusScene: document.activeElement?.closest('[data-story-scene]')?.dataset.storyScene || null,
    focusTag: document.activeElement?.tagName || '',
    y: document.documentElement.scrollTop
  }));
  check(state.focusScene === 'radio' && state.focusTag === 'A', 'Keyboard tab order must reach a link inside the current scene');
  await tab.pressKey(null, 'PageDown');
  await tab.pressKey(null, 'PageDown');
  await tab.playwright.waitForTimeout(900);
  state = await tab.playwright.evaluate(() => ({
    status: document.querySelector('[data-story-stage="collection"] [data-story-status]')?.textContent || '',
    toolsAccessible: !document.getElementById('story-tools').hasAttribute('inert') && document.getElementById('story-tools').getAttribute('aria-hidden') !== 'true',
    retained: !document.getElementById('celestial').hasAttribute('inert') && document.getElementById('celestial').getAttribute('aria-hidden') !== 'true',
    retainedClass: document.getElementById('celestial').classList.contains('story-focus-retained'),
    focusScene: document.activeElement?.closest('[data-story-scene]')?.dataset.storyScene || null,
    retainedOpacity: (() => {
      const scene = document.getElementById('celestial');
      let opacity = 1;
      for (let node = document.activeElement; node; node = node.parentElement) {
        opacity = Math.min(opacity, Number(getComputedStyle(node).opacity));
        if (node === scene) break;
      }
      return opacity;
    })()
  }));
  check(state.status === 'Scene 3 of 7' && state.toolsAccessible && state.focusScene === 'radio' && state.retained, 'Pointer scroll must not hide the focused outgoing scene or the current scene');
  check(state.retainedClass && state.retainedOpacity >= .99, 'A focused outgoing scene must stay fully visible while it is retained for keyboard focus');
  await tab.pressKey(null, 'Tab');
  await tab.playwright.waitForTimeout(700);
  state = await tab.playwright.evaluate(() => ({
    focusScene: document.activeElement?.closest('[data-story-scene]')?.dataset.storyScene || null,
    radioHidden: document.getElementById('celestial').hasAttribute('inert') || document.getElementById('celestial').getAttribute('aria-hidden') === 'true'
  }));
  check(state.focusScene === 'tools' && state.radioHidden, 'Once focus leaves an outgoing scene, it must become inactive');
  return { passed: 4, scope: 'keyboard focus retention during scroll and reconciliation after focus leaves' };
}

export async function runBiographyLifecycleChecks(tab) {
  const url = new URL(await tab.url());
  url.searchParams.set('story', 'biography-check');
  url.hash = 'about';
  await tab.goto(url.href);
  await tab.playwright.waitForLoadState({ state: 'load', timeoutMs: 10000 }).catch(() => {});
  await tab.playwright.waitForTimeout(700);
  const before = await tab.playwright.evaluate(() => document.querySelector('#about summary').getBoundingClientRect().top);
  await tab.playwright.locator('#about summary').click();
  await tab.playwright.waitForTimeout(900);
  const state = await tab.playwright.evaluate(() => ({
    open: document.querySelector('#about details').open,
    active: document.documentElement.classList.contains('story-active'),
    spacers: document.querySelectorAll('.pin-spacer').length,
    focused: document.activeElement === document.querySelector('#about summary'),
    paragraphs: [...document.querySelectorAll('#about .bio-text')].map(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0),
    after: document.querySelector('#about summary').getBoundingClientRect().top,
    overflow: document.documentElement.scrollWidth > innerWidth
  }));
  check(state.open && !state.active && state.spacers === 0, 'Opening the biography must switch to natural flow and remove pin spacers');
  check(state.focused && state.paragraphs.length === 4 && state.paragraphs.every(Boolean), 'Expanded biography content and summary focus must remain accessible');
  check(Math.abs(state.after - before) <= 3 && !state.overflow, 'Biography expansion must preserve the summary position without overflow');
  return { passed: 3, scope: 'biography expansion teardown, focus, position and content' };
}

export async function runResizeLifecycleChecks(tab, viewport) {
  await viewport.set({ width: 1440, height: 900 });
  try {
    const url = new URL(await tab.url());
    url.searchParams.set('story', 'resize-lifecycle-check');
    url.hash = '';
    await tab.goto(url.href);
    await tab.playwright.waitForLoadState({ state: 'load', timeoutMs: 10000 }).catch(() => {});
    await tab.playwright.waitForTimeout(550);
    for (let i = 0; i < 5; i += 1) await tab.pressKey(null, 'PageDown');
    await tab.playwright.waitForTimeout(600);
    const before = await tab.playwright.evaluate(() => ({
      active: document.documentElement.classList.contains('story-active'),
      scene: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null
    }));
    check(before.active && before.scene === 'workbench', 'The resize fixture must begin in the pinned Workbench scene');

    await viewport.set({ width: 1024, height: 600 });
    await tab.playwright.waitForTimeout(450);
    const fallback = await tab.playwright.evaluate(() => ({
      active: document.documentElement.classList.contains('story-active'),
      spacers: document.querySelectorAll('.pin-spacer').length,
      allReadable: [...document.querySelectorAll('[data-story-scene]')].every(scene => !scene.hasAttribute('inert') && scene.getAttribute('aria-hidden') !== 'true' && getComputedStyle(scene).display !== 'none'),
      headingTop: document.querySelector('#about-title').getBoundingClientRect().top,
      headingBottom: document.querySelector('#about-title').getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
      overflow: document.documentElement.scrollWidth > window.innerWidth
    }));
    check(!fallback.active && fallback.spacers === 0 && fallback.allReadable, 'A short live resize must remove pins and restore all scenes to readable flow');
    check(fallback.headingBottom > 0 && fallback.headingTop < fallback.viewportHeight && !fallback.overflow, 'Fallback must preserve the Workbench heading in the viewport without overflow');

    await viewport.set({ width: 1440, height: 900 });
    await tab.playwright.waitForTimeout(600);
    const restored = await tab.playwright.evaluate(() => ({
      active: document.documentElement.classList.contains('story-active'),
      spacers: document.querySelectorAll('.pin-spacer').length,
      scene: [...document.querySelectorAll('[data-story-scene]')].find(scene => !scene.hasAttribute('inert'))?.dataset.storyScene || null,
      overflow: document.documentElement.scrollWidth > window.innerWidth
    }));
    check(restored.active && restored.spacers === 3 && restored.scene === 'workbench' && !restored.overflow, 'Returning to an eligible viewport must rebuild the pins at the same semantic scene');
    return { passed: 4, scope: 'live resize teardown, readable fallback and semantic scene restoration' };
  } finally {
    await viewport.reset();
  }
}
