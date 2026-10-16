// Import in cua_repl and run against the local AI team preview.
function check(value, message) { if (!value) throw new Error(message); }

async function readFlip(tab) {
  return tab.playwright.evaluate(() => {
    const card = document.querySelector('[data-node="cony"]');
    const rotor = card.querySelector('.card-inner') || card.querySelector('.card-front');
    const transform = getComputedStyle(rotor).transform;
    const matrix = transform.match(/matrix3d\(([^)]+)\)/);
    return {
      flipped: card.classList.contains('flipped'),
      rotationCos: matrix ? Number(matrix[1].split(',')[0]) : 1,
      is3d: !!matrix,
      frontRendered: getComputedStyle(card.querySelector('.card-front')).display !== 'none',
      backRendered: getComputedStyle(card.querySelector('.card-back')).display !== 'none'
    };
  });
}

export async function runFlipAnimationChecks(tab) {
  await tab.playwright.locator('[data-node="cony"] .card-front').click();
  await tab.playwright.waitForTimeout(100);
  let state = await readFlip(tab);
  check(state.flipped && state.frontRendered && state.backRendered && state.is3d && Math.abs(state.rotationCos) < .99,
    'Opening a card must pass through a visible intermediate 3D turn, rather than instantly swapping display');
  await tab.playwright.waitForTimeout(750);
  state = await readFlip(tab);
  check(state.flipped && state.rotationCos < -.99, 'The details must settle at the full reverse-side turn');
  await tab.playwright.locator('[data-node="cony"] .back-button').click();
  await tab.playwright.waitForTimeout(100);
  state = await readFlip(tab);
  check(!state.flipped && state.is3d && Math.abs(state.rotationCos) < .99, 'Returning must animate through the reverse turn');
  await tab.playwright.waitForTimeout(750);
  state = await readFlip(tab);
  check(!state.flipped && state.rotationCos > .99, 'The portrait must settle back at its original orientation');
  return { passed: 4, scope: 'animated forward and backward card flips' };
}

export async function runCardDetailsChecks(tab) {
  await tab.playwright.locator('[data-node="cony"] .card-front').click();
  await tab.playwright.waitForTimeout(750);
  await tab.playwright.locator('[data-node="cony"] .back-quote').click();
  let state = await tab.playwright.evaluate(() => {
    const card = document.querySelector('[data-node="cony"]');
    const scroll = card.querySelector('.card-back-scroll');
    return {
      open: card.classList.contains('flipped'),
      fields: [...card.querySelectorAll('.field dt')].map(el => el.textContent),
      parent: [...card.querySelectorAll('.field')].find(el => el.querySelector('dt').textContent === 'Reports to')?.querySelector('dd').textContent,
      rule: card.querySelector('.rule-box span').textContent,
      scrollable: scroll.scrollHeight > scroll.clientHeight,
      inactiveFront: card.querySelector('.card-front').hasAttribute('inert') && card.querySelector('.card-front').getAttribute('aria-hidden') === 'true'
    };
  });
  check(state.open, 'Clicking role details to read or select them must not close the card');
  check(state.fields.includes('Non-scope') && state.parent === 'ME' && state.rule.length > 0, 'Role boundaries, reporting line, and operating rule must remain available');
  check(state.scrollable, 'Details taller than the card must remain scrollable');
  check(state.inactiveFront, 'The portrait face must leave the interaction and accessibility trees while details are shown');
  await tab.playwright.locator('[data-node="cony"] .back-button').click();
  await tab.playwright.waitForTimeout(750);
  state = await tab.playwright.evaluate(() => ({
    hiddenBack: [...document.querySelectorAll('.codex-card')].every(card => card.querySelector('.card-back').hasAttribute('inert') && card.querySelector('.card-back').getAttribute('aria-hidden') === 'true'),
    count: document.querySelectorAll('.codex-card').length,
    overflow: document.documentElement.scrollWidth > innerWidth
  }));
  check(state.hiddenBack && state.count === 23, 'Every closed card must hide its reverse-side controls without losing agents');
  check(!state.overflow, 'Card flips must not introduce horizontal page overflow');
  return { passed: 6, scope: 'readable role details, hidden-face accessibility, and preserved agents' };
}

export async function runCardKeyboardChecks(tab) {
  const front = tab.playwright.locator('[data-node="cony"] .flip-button');
  const back = tab.playwright.locator('[data-node="cony"] .back-button');
  await front.press('Enter');
  await tab.playwright.waitForTimeout(750);
  let state = await tab.playwright.evaluate(() => ({open: document.querySelector('[data-node="cony"]').classList.contains('flipped'), focusBack: document.activeElement.matches('[data-node="cony"] .back-button')}));
  check(state.open && state.focusBack, 'Keyboard opening must focus the visible return control');
  await back.press('Enter');
  await tab.playwright.waitForTimeout(750);
  state = await tab.playwright.evaluate(() => ({open: document.querySelector('[data-node="cony"]').classList.contains('flipped'), focusFront: document.activeElement.matches('[data-node="cony"] .flip-button')}));
  check(!state.open && state.focusFront, 'Enter on the return button must close once and restore visible focus');
  await front.press('Space');
  await tab.playwright.waitForTimeout(750);
  await tab.playwright.locator('[data-node="cony"] .card-back-scroll').press('Space');
  check(await tab.playwright.evaluate(() => document.querySelector('[data-node="cony"]').classList.contains('flipped')), 'Space while reading scrollable details must not trigger an accidental flip');
  await tab.playwright.locator('[data-node="cony"] .card-back-scroll').press('Escape');
  await tab.playwright.waitForTimeout(750);
  state = await tab.playwright.evaluate(() => ({open: document.querySelector('[data-node="cony"]').classList.contains('flipped'), focusFront: document.activeElement.matches('[data-node="cony"] .flip-button')}));
  check(!state.open && state.focusFront, 'Escape must return to the portrait and restore focus');
  await front.press('Enter');
  await tab.playwright.waitForTimeout(750);
  check(await tab.playwright.evaluate(() => document.querySelector('[data-node="cony"] .card-back-scroll').scrollTop === 0), 'Reopening must start with the agent name and scope visible');
  await back.press('Enter');
  await tab.playwright.waitForTimeout(750);
  return { passed: 5, scope: 'native Enter/Space controls, scrolling, Escape, focus restoration and reopening' };
}
