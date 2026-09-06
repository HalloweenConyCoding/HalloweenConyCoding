// In cua_repl import this module, then runMobileChecks(tab) at a narrow viewport.
// All browser interactions use the supported CUA Tab API; no browser launcher.
function check(value, message) { if (!value) throw new Error(message); }
export async function runMobileChecks(tab) {
  const toggle = tab.playwright.getByRole('button', { name: 'Toggle navigation' });
  await toggle.click();
  await tab.getAXState({ emit: false });
  await toggle.press('Escape');
  await tab.getAXState({ emit: false });
  let state = await tab.playwright.evaluate(() => ({
    expanded: document.getElementById('navToggle').getAttribute('aria-expanded'),
    focus: document.activeElement.id,
    hidden: document.getElementById('navLinks').hidden,
    inert: document.getElementById('navLinks').hasAttribute('inert')
  }));
  check(state.expanded === 'false', 'Escape must close the mobile menu');
  check(state.focus === 'navToggle', 'Escape must restore toggle focus');
  check(state.hidden && state.inert, 'Closed menu must leave the accessibility and focus trees');
  await toggle.press('Tab');
  await tab.getAXState({ emit: false });
  check(await tab.playwright.evaluate(() => !document.getElementById('navLinks').contains(document.activeElement)), 'Tab must skip closed menu links');
  await toggle.click();
  await tab.getAXState({ emit: false });
  await tab.playwright.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).click();
  await tab.getAXState({ emit: false });
  state = await tab.playwright.evaluate(() => ({hash: location.hash, focus: document.activeElement.id, hidden: document.getElementById('navLinks').hidden}));
  check(state.hash === '#about', 'Section navigation must update the deep link');
  check(state.focus === 'about', 'Section navigation must focus the destination');
  check(state.hidden, 'Choosing a mobile destination must close the menu');
  await tab.playwright.getByRole('link', { name: 'Chatchon — home' }).click();
  await tab.getAXState({ emit: false });
  state = await tab.playwright.evaluate(() => ({
    light: getComputedStyle(document.getElementById('library')).backgroundColor,
    rail: [...document.querySelectorAll('.chapter-rail')].some(e => getComputedStyle(e).display !== 'none'),
    overflow: document.documentElement.scrollWidth > innerWidth,
    badImages: [...document.images].filter(e => e.complete && !e.naturalWidth).map(e => e.src),
    main: !!document.querySelector('main'),
    destinations: ['library','celestial','about','ai-team','uncharted','connect'].every(id => !!document.getElementById(id))
  }));
  check(state.light === 'rgb(247, 242, 231)', 'Library must have its own safe ivory background');
  check(!state.rail, 'A floating mobile rail must not cover reading content');
  check(!state.overflow, 'Narrow viewport must not overflow horizontally');
  check(!state.badImages.length, 'Every loaded preview must resolve');
  check(state.main && state.destinations, 'Main landmark and deep links must exist');
  return {passed: 12, scope: 'mobile menu, keyboard, deep links, safe theme, layout, assets'};
}
