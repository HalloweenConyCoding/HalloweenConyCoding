(function () {
  'use strict';

  const NODE_DATA = Object.freeze([
    { id: 'me', display_name: 'ME', role_id: 'OWNER', reports_to: 'none', group: 'top', level: 0, pipeline: 'top', scope: 'Keeps the frame minimal, clear, and safe.', non_scope: 'Keeps private details out of view.', operating_rule: 'Stay brief and keep the page safe.', independence_flag: false },
    { id: 'cony', display_name: 'CONY', role_id: 'ORCHESTRATOR', reports_to: 'me', group: 'executive', level: 1, pipeline: 'top', scope: 'Owns the hierarchy and keeps the page cohesive.', non_scope: 'Keeps private operations out of view.', operating_rule: 'Route work through the smallest safe surface.', independence_flag: false },
    { id: 'wise', display_name: 'WISE', role_id: 'WISE', reports_to: 'cony', group: 'core', level: 2, pipeline: 'core', scope: 'Keeps memory, routing context, and knowledge organization aligned.', non_scope: 'Does not do direct implementation or outward design work.', operating_rule: 'Preserve context without widening the surface.', independence_flag: false },
    { id: 'orin', display_name: 'ORIN', role_id: 'ORIN', reports_to: 'cony', group: 'core', level: 2, pipeline: 'core', scope: 'Builds repo, code, documentation, and file changes safely.', non_scope: 'Does not act as the final approver or domain lead.', operating_rule: 'Implement the smallest correct change set.', independence_flag: false },
    { id: 'argus', display_name: 'ARGUS', role_id: 'ARGUS', reports_to: 'cony', group: 'core', level: 2, pipeline: 'core', scope: 'Prepares commit review packages and checks changed files.', non_scope: 'Does not replace final human review.', operating_rule: 'Keep review evidence concise and actionable.', independence_flag: false },
    { id: 'thales', display_name: 'THALES', role_id: 'THALES', reports_to: 'cony', group: 'core', level: 2, pipeline: 'core', scope: 'Reads primary or provided sources and extracts evidence.', non_scope: 'Does not invent facts or conclusions beyond the source.', operating_rule: 'Anchor claims in the available evidence.', independence_flag: false },
    { id: 'vera', display_name: 'VERA', role_id: 'VERA', reports_to: 'cony', group: 'core', level: 2, pipeline: 'core', scope: 'Verifies claims, dates, figures, and source alignment.', non_scope: 'Does not replace source extraction or critique.', operating_rule: 'Check facts before any conclusion is repeated.', independence_flag: false },
    { id: 'nyx', display_name: 'NYX', role_id: 'NYX', reports_to: 'cony', group: 'core', level: 2, pipeline: 'core', scope: 'Finds contradictions, weak assumptions, and failure modes.', non_scope: 'Does not block work without actionable findings.', operating_rule: 'Pressure-test the plan and surface risks clearly.', independence_flag: false },
    { id: 'win', display_name: 'WIN', role_id: 'WIN', reports_to: 'cony', group: 'domain', level: 2, pipeline: 'independent', scope: 'Handles investment research only, with no trading execution.', non_scope: 'Does not connect to broker activity or production action.', operating_rule: 'Keep research separate from action.', independence_flag: true },
    { id: 'nexus', display_name: 'NEXUS', role_id: 'NEXUS', reports_to: 'cony', group: 'domain', level: 2, pipeline: 'domain', scope: 'Leads telecom planning, AIS conventions, QGIS, KPI, and MML work.', non_scope: 'Does not guess unsafe network commands or production values.', operating_rule: 'Route telecom work into the right specialist lane.', independence_flag: false },
    { id: 'pylon', display_name: 'PYLON', role_id: 'PYLON', reports_to: 'nexus', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Stewards the Antenna Master Editor route, product rules, and stewardship decisions.', non_scope: 'Does not replace implementation, deployment, or human approval.', operating_rule: 'Keep product stewardship separate from execution.', independence_flag: false },
    { id: 'muse', display_name: 'MUSE', role_id: 'MUSE', reports_to: 'cony', group: 'domain', level: 2, pipeline: 'domain', scope: 'Leads page, UX/UI, styling, and interaction work.', non_scope: 'Does not override safe page identity or private details.', operating_rule: 'Preserve page identity while improving presentation.', independence_flag: false },
    { id: 'marconi', display_name: 'MARCONI', role_id: 'MARCONI', reports_to: 'nexus', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles 2G/3G/4G/5G, band, system, and cell-code logic.', non_scope: 'Does not invent config values or naming rules.', operating_rule: 'Keep RAT logic precise and traceable.', independence_flag: false },
    { id: 'regis', display_name: 'REGIS', role_id: 'REGIS', reports_to: 'nexus', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles AIS naming/config conventions and scenario values.', non_scope: 'Does not replace telecom validation or MML generation.', operating_rule: 'Protect naming conventions first.', independence_flag: false },
    { id: 'terra', display_name: 'TERRA', role_id: 'TERRA', reports_to: 'nexus', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles QGIS planning, geometry, and cell pie wedges.', non_scope: 'Does not blur geometry or map styling logic.', operating_rule: 'Keep map tooling geometrically correct.', independence_flag: false },
    { id: 'prism', display_name: 'PRISM', role_id: 'PRISM', reports_to: 'nexus', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles PRB, CELL_RANGE, throughput, and weekly KPI trends.', non_scope: 'Does not guess missing data joins or metrics.', operating_rule: 'Keep KPI interpretation accurate.', independence_flag: false },
    { id: 'delta', display_name: 'DELTA', role_id: 'DELTA', reports_to: 'nexus', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles Excel/Power Query MML generation and tilt/power commands.', non_scope: 'Does not invent missing telecom inputs.', operating_rule: 'Generate telecom commands safely.', independence_flag: false },
    { id: 'talos', display_name: 'TALOS', role_id: 'TALOS', reports_to: 'nexus', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles Python/pandas automation and telecom tooling implementation.', non_scope: 'Does not replace domain validation or human approval.', operating_rule: 'Build safe, traceable telecom tools.', independence_flag: false },
    { id: 'vivid', display_name: 'VIVID', role_id: 'VIVID', reports_to: 'muse', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Sets overall brand and visual direction.', non_scope: 'Does not override layout details that belong elsewhere.', operating_rule: 'Keep the visual identity coherent.', independence_flag: false },
    { id: 'nova', display_name: 'NOVA', role_id: 'NOVA', reports_to: 'muse', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles page layout, hierarchy, components, and readability.', non_scope: 'Does not rewrite page logic or motion systems.', operating_rule: 'Keep layouts clear and balanced.', independence_flag: false },
    { id: 'spectra', display_name: 'SPECTRA', role_id: 'SPECTRA', reports_to: 'muse', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles live UI preview, visible-state inspection, and mapping visual feedback to the exact page surface.', non_scope: 'Does not replace implementation, brand direction, layout ownership, or protected page logic.', operating_rule: 'Inspect the visible UI before changing it.', independence_flag: false },
    { id: 'axiom', display_name: 'AXIOM', role_id: 'AXIOM', reports_to: 'muse', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles page logic, calculations, and input/output behavior.', non_scope: 'Does not take over visual composition.', operating_rule: 'Keep behavior technically correct.', independence_flag: false },
    { id: 'rhythm', display_name: 'RHYTHM', role_id: 'RHYTHM', reports_to: 'muse', group: 'subagent', level: 3, pipeline: 'domain', scope: 'Handles parallax, hover states, scroll flow, and microinteraction rhythm.', non_scope: 'Does not introduce motion that hides content.', operating_rule: 'Use motion to clarify, not distract.', independence_flag: false }
  ]);

  const NODE_MAP = new Map(NODE_DATA.map((node) => [node.id, node]));
  const ROLE_LABELS = Object.freeze({
    me: 'Owner',
    cony: 'Orchestrator',
    wise: 'Memory Lead',
    orin: 'Build Lead',
    argus: 'Review Lead',
    thales: 'Source Lead',
    vera: 'Verification Lead',
    nyx: 'Risk Review',
    win: 'Research Lead',
    nexus: 'Telecom Lead',
    muse: 'Design Lead',
    marconi: 'RAT Logic',
    regis: 'Naming Rules',
    terra: 'Map Planning',
    prism: 'KPI Review',
    delta: 'Network Command Tools',
    talos: 'Automation',
    vivid: 'Brand Design',
    nova: 'Layout Design',
    spectra: 'Visual Preview',
    axiom: 'Page Logic',
    rhythm: 'Motion Design'
  });
  const PIPELINE_COLORS = { top: '#d4af37', core: '#1a9b7a', domain: '#c8923a', independent: '#8b5cf6' };
  const PIPELINE_LABELS = { top: 'Executive', core: 'Core Lead', domain: 'Domain Lead', independent: 'Independent' };
  const GROUPS = [
    { id: 'executive-council', label: 'Executive Council', note: 'apex authority', names: ['me', 'cony'], large: true, accentColor: '#d4af37' },
    { id: 'core-leads', label: 'Core Leads', note: 'memory · build · review · fact · critique', names: ['wise', 'orin', 'argus', 'thales', 'vera', 'nyx'], accentColor: '#1a9b7a' },
    { id: 'domain-leads', label: 'Domain Leads', note: 'WIN · NEXUS · MUSE', names: ['win', 'nexus', 'muse'], accentColor: '#c8923a' },
    { id: 'nexus-subagents', label: 'NEXUS Subagents', note: 'telecom specialists', names: ['pylon', 'marconi', 'regis', 'terra', 'prism', 'delta', 'talos'], accentColor: '#c8923a', indent: true },
    { id: 'muse-subagents', label: 'MUSE Subagents', note: 'design specialists', names: ['vivid', 'nova', 'spectra', 'axiom', 'rhythm'], accentColor: '#c8923a', indent: true }
  ];

  const PORTRAIT_PATHS = Object.freeze(Object.fromEntries(
    NODE_DATA.map((node) => [node.id, `../Agent Portraits/${node.id}.png`])
  ));

  const RUNES = [
    { size: 320, x: 10, y: 15, speed: 40, dir: 1, opacity: 0.05 },
    { size: 220, x: 75, y: 8, speed: 28, dir: -1, opacity: 0.07 },
    { size: 180, x: 55, y: 45, speed: 18, dir: 1, opacity: 0.06 },
    { size: 140, x: 20, y: 65, speed: 12, dir: -1, opacity: 0.09 },
    { size: 260, x: 82, y: 60, speed: 35, dir: 1, opacity: 0.04 },
    { size: 100, x: 40, y: 80, speed: 8, dir: -1, opacity: 0.1 },
    { size: 160, x: 65, y: 25, speed: 22, dir: 1, opacity: 0.06 },
    { size: 80, x: 30, y: 35, speed: 6, dir: -1, opacity: 0.12 }
  ];

  const SIGILS = {
    me: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><circle cx="30" cy="30" r="23" stroke="currentColor" stroke-width="0.5" opacity="0.3"/><path d="M14 30Q30 16 46 30Q30 44 14 30Z" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="30" r="5.5" fill="currentColor" opacity="0.8"/></svg>',
    cony: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M17 38L17 25L22 30L27 22L30 19L33 22L38 30L43 25L43 38Z" stroke="currentColor" stroke-width="1.5"/><line x1="17" y1="38" x2="43" y2="38" stroke="currentColor" stroke-width="1.5"/></svg>',
    wise: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M13 40L13 22Q21 19 30 23Q39 19 47 22L47 40Q39 37 30 41Q21 37 13 40Z" stroke="currentColor" stroke-width="1.5"/><line x1="30" y1="23" x2="30" y2="41" stroke="currentColor" stroke-width="1"/></svg>',
    orin: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><rect x="19" y="17" width="22" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/><line x1="30" y1="26" x2="30" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    muse: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><circle cx="26" cy="26" r="11" stroke="currentColor" stroke-width="1.5"/><line x1="34" y1="34" x2="47" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    nyx: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M30 11L43 18L43 34Q43 45 30 50Q17 45 17 34L17 18Z" stroke="currentColor" stroke-width="1.5"/><path d="M30 19L27 28L33 30L29 42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    win: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M34 13Q21 19 21 30Q21 41 34 47Q25 43 25 30Q25 17 34 13Z" fill="currentColor" opacity="0.5"/></svg>',
    nexus: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><line x1="30" y1="16" x2="30" y2="44" stroke="currentColor" stroke-width="2"/><path d="M38 19Q43 25 38 31" stroke="currentColor" stroke-width="1.2" opacity="0.7"/></svg>'
  };

  Object.entries({ argus: 'muse', thales: 'wise', vera: 'muse', marconi: 'nexus', regis: 'wise', terra: 'nexus', prism: 'muse', delta: 'orin', talos: 'orin', vivid: 'wise', nova: 'muse', spectra: 'muse', axiom: 'muse', rhythm: 'nyx' }).forEach(([id, source]) => {
    SIGILS[id] = SIGILS[source];
  });

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function runeSvg() {
    return '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="47" stroke="currentColor" stroke-width="0.6"/><circle cx="50" cy="50" r="38" stroke="currentColor" stroke-width="0.4" stroke-dasharray="4 3"/><circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width="0.5"/><polygon points="50,8 90,72 10,72" stroke="currentColor" stroke-width="0.6" fill="none"/><polygon points="50,92 10,28 90,28" stroke="currentColor" stroke-width="0.4" fill="none" opacity="0.6"/><circle cx="50" cy="50" r="5" stroke="currentColor" stroke-width="0.8"/><line x1="50" y1="3" x2="50" y2="97" stroke="currentColor" stroke-width="0.3" opacity="0.4"/><line x1="3" y1="50" x2="97" y2="50" stroke="currentColor" stroke-width="0.3" opacity="0.4"/><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" stroke-width="0.3" opacity="0.3"/></svg>';
  }

  function buildRuneBackground(root) {
    const wrap = el('div', 'rune-background');
    const layer = el('div', 'rune-layer');
    RUNES.forEach((cfg) => {
      const rune = el('div', 'rune-circle');
      rune.style.left = `${cfg.x}%`;
      rune.style.top = `${cfg.y}%`;
      rune.style.opacity = cfg.opacity;
      rune.style.animationDuration = `${cfg.speed}s`;
      rune.style.setProperty('--rune-size', `${cfg.size}px`);
      rune.style.setProperty('--rune-rotation', cfg.dir < 0 ? '-360deg' : '360deg');
      rune.innerHTML = runeSvg();
      layer.append(rune);
    });
    wrap.append(layer, el('div', 'ambient-glow'));
    root.append(wrap);

    let mouseX = 0;
    let mouseY = 0;
    let posX = 0;
    let posY = 0;
    window.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    const tick = () => {
      posX += (mouseX - posX) * 0.05;
      posY += (mouseY - posY) * 0.05;
      layer.style.transform = `translate(${posX * 8}px, ${posY * 8}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function buildParticles(root) {
    const field = el('div', 'particle-field');
    for (let index = 0; index < 24; index += 1) {
      const particle = el('div', 'dust-particle');
      const size = 1 + Math.random() * 2;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.opacity = `${0.03 + Math.random() * 0.06}`;
      particle.style.animationDuration = `${12 + Math.random() * 20}s`;
      particle.style.animationDelay = `${Math.random() * -25}s`;
      particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
      field.append(particle);
    }
    root.append(field);
  }

  function buildTopbar(root) {
    const progress = el('div', 'scroll-progress');
    const topbar = el('header', 'topbar');
    topbar.id = 'topbar';
    const brand = el('a', 'brand');
    brand.href = 'index.html';
    brand.append(el('span', 'brand-mark font-cinzel', 'CONY'), el('span', 'brand-label font-mono', 'Operating Team'));
    const nav = el('nav', 'nav-links');
    [{ href: '#hierarchy', label: 'Operating structure' }].forEach((link) => {
      const anchor = el('a', 'font-mono', link.label);
      anchor.href = link.href;
      nav.append(anchor);
    });
    topbar.append(brand, nav);
    root.append(progress, topbar);
  }

  function corner(position) {
    const node = el('div', `corner-ornament ${position}`);
    node.innerHTML = '<svg viewBox="0 0 80 80" fill="none"><path d="M0 0L40 0L40 3L3 3L3 40L0 40Z" fill="currentColor"/><path d="M0 0L22 0C10 10 10 10 0 22Z" fill="currentColor" opacity="0.3"/><line x1="6" y1="6" x2="28" y2="6" stroke="currentColor" stroke-width="0.5" opacity="0.4"/><line x1="6" y1="6" x2="6" y2="28" stroke="currentColor" stroke-width="0.5" opacity="0.4"/><circle cx="16" cy="16" r="6" stroke="currentColor" stroke-width="0.7" opacity="0.25"/></svg>';
    return node;
  }

  function buildHero(root) {
    const section = el('section', 'hero-section');
    section.id = 'hero';
    section.dataset.section = 'hero';
    const ornaments = el('div', 'corner-ornaments');
    ['tl', 'tr', 'bl', 'br'].forEach((position) => ornaments.append(corner(position)));
    const kicker = el('p', 'hero-kicker font-mono', 'CONY Operating Overview');
    const title = el('h1', 'hero-title font-cinzel');
    title.innerHTML = '<span>CONY</span><span class="sub">Operating Team</span>';
    const rule = el('div', 'gold-rule hero-rule');
    const copy = el('p', 'hero-copy font-cormorant', 'CONY leads the operating hierarchy. From there the team branches into core leads, domain leads, and specialist subagents, with each card opening into the role details that shape the overview.');
    const actions = el('div', 'hero-actions');
    [
      { href: '#executive-council', label: 'Executive Council', primary: true },
      { href: '#core-leads', label: 'Core Leads' },
      { href: '#domain-leads', label: 'Domain Leads' }
    ].forEach((item) => {
      const link = el('a', `hero-link${item.primary ? ' primary' : ''} font-cinzel`, item.label);
      link.href = item.href;
      actions.append(link);
    });
    const subActions = el('div', 'hero-actions secondary');
    [
      { href: '#nexus-subagents', label: 'NEXUS Subagents' },
      { href: '#muse-subagents', label: 'MUSE Subagents' }
    ].forEach((item) => {
      const link = el('a', 'hero-link font-cinzel', item.label);
      link.href = item.href;
      subActions.append(link);
    });
    const marker = el('div', 'me-marker font-mono');
    marker.innerHTML = '<span>CONY</span><span>Team role map</span>';
    const scroll = el('div', 'scroll-indicator');
    scroll.innerHTML = '<span class="font-mono">DESCEND</span><i></i>';
    section.append(ornaments, kicker, title, rule, copy, actions, subActions, marker, scroll);
    root.append(section);
  }

  function buildAgentCard(node, index, totalCount) {
    const pipelineColor = PIPELINE_COLORS[node.pipeline] || PIPELINE_COLORS.core;
    const pipelineLabel = PIPELINE_LABELS[node.pipeline] || node.pipeline;
    const roleLabel = ROLE_LABELS[node.id] || pipelineLabel;
    const reportsToLabel = node.reports_to === 'none' ? 'none' : (NODE_MAP.get(node.reports_to)?.display_name || node.reports_to);
    const card = el('article', 'codex-card reveal');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `${node.display_name}, ${roleLabel}. Click to flip.`);
    card.dataset.node = node.id;
    card.dataset.pipeline = node.pipeline;
    card.style.setProperty('--pipeline-color', pipelineColor);

    const tab = el('div', 'pipeline-tab font-mono', pipelineLabel);
    const front = el('div', 'card-face card-front');
    const portraitWrap = el('div', 'portrait-wrap');
    const portrait = el('img', 'agent-portrait');
    portrait.src = PORTRAIT_PATHS[node.id] || PORTRAIT_PATHS.me;
    portrait.alt = `${node.display_name} portrait`;
    portrait.loading = 'lazy';
    portrait.decoding = 'async';
    portrait.addEventListener('error', () => {
      portraitWrap.classList.add('portrait-fallback');
      portraitWrap.innerHTML = SIGILS[node.id] || SIGILS.me;
    }, { once: true });
    portraitWrap.append(portrait);
    const frontText = el('div', 'front-text');
    frontText.append(el('h2', 'font-cinzel', node.display_name), el('div', 'card-role font-mono', roleLabel));
    front.append(
      el('span', 'sequence font-mono', `${String(index + 1).padStart(2, '0')} / ${totalCount}`),
      portraitWrap,
      frontText,
      el('span', 'flip-hint font-mono', 'flip →')
    );

    const back = el('div', 'card-face card-back');
    const backScroll = el('div', 'card-back-scroll');
    backScroll.innerHTML = `<div class="back-head"><div class="back-pipeline font-mono"><i class="diamond"></i><span>${pipelineLabel}</span></div><button class="back-button font-mono" type="button">&larr; back</button></div><div class="back-title"><h3 class="font-cinzel">${node.display_name}</h3><span class="font-mono">${node.role_id}</span></div><p class="back-quote font-cormorant">"${node.scope}"</p>`;
    [['Non-scope', node.non_scope], ['Reports to', reportsToLabel], ['Group', node.group], ['Level', node.level], ['Independence', node.independence_flag ? 'true' : 'false']].forEach(([label, value]) => {
      const field = el('dl', 'field');
      field.append(el('dt', 'font-mono', label), el('dd', 'font-mono', String(value)));
      backScroll.append(field);
    });
    const rule = el('div', 'rule-box');
    rule.innerHTML = `<small class="font-mono">Operating rule</small><span class="font-cormorant">${node.operating_rule}</span>`;
    backScroll.append(rule);
    back.append(backScroll);

    const flip = () => {
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    };
    card.addEventListener('click', (event) => {
      if (event.target.closest('.back-button')) return;
      flip();
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        flip();
      }
    });
    back.querySelector('.back-button')?.addEventListener('click', (event) => {
      event.stopPropagation();
      flip();
    });
    backScroll.addEventListener('wheel', (event) => event.stopPropagation(), { passive: true });
    card.append(tab, front, back);
    return card;
  }

  function buildHierarchy(root) {
    const section = el('section', 'hierarchy-section');
    section.id = 'hierarchy';
    section.dataset.section = 'hierarchy';
    const heading = el('div', 'section-heading');
    heading.innerHTML = '<p class="section-label font-mono">Operating Structure</p><h2 id="hierarchy-title" class="section-title font-cinzel">Team structure</h2><div class="gold-rule section-rule"></div><p class="section-copy font-cormorant">CONY leads the visible hierarchy, followed by the core leads, the domain leads, and the specialist subagents that extend each lane. Each card flips to show the full role details.</p>';
    const groups = el('div', 'hierarchy-groups');
    GROUPS.forEach((group) => {
      const groupNode = el('div', `hierarchy-group${group.indent ? ' indent' : ''}`);
      groupNode.id = group.id;
      groupNode.style.setProperty('--group-color', group.accentColor);
      const groupHeading = el('div', 'group-heading reveal');
      groupHeading.innerHTML = `${group.indent ? '<i class="indent-line"></i>' : ''}<strong class="font-cinzel">${group.label}</strong><span class="font-mono">${group.note}</span><i class="rule"></i>`;
      const grid = el('div', `card-grid${group.large ? ' large' : ''}`);
      group.names.map((name) => NODE_MAP.get(name)).filter(Boolean).forEach((node, index, nodes) => {
        grid.append(buildAgentCard(node, index, nodes.length));
      });
      groupNode.append(groupHeading, grid);
      groups.append(groupNode);
    });
    section.append(heading, groups);
    root.append(section);
  }

  function initTopbar() {
    const topbar = document.getElementById('topbar');
    const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const targets = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--scroll-pct', `${Math.min(100, (window.scrollY / max) * 100)}%`);
      topbar?.classList.toggle('is-scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!targets.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible?.target?.id) return;
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { threshold: 0.3 });
    targets.forEach((target) => observer.observe(target));
  }

  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
  }

  function init() {
    const app = document.getElementById('app');
    if (!app) return;
    const shell = el('main', 'app-shell');
    buildRuneBackground(shell);
    buildParticles(shell);
    buildTopbar(shell);
    buildHero(shell);
    buildHierarchy(shell);
    app.append(shell);
    initTopbar();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
