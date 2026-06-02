(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     NODE DATA — unchanged wording
     ═══════════════════════════════════════════════════════════════ */
  const NODE_DATA = Object.freeze([
    {
      id: 'me',
      display_name: 'ME',
      role_id: 'PUBLIC_OWNER',
      reports_to: 'none',
      group: 'top',
      level: 0,
      pipeline: 'top',
      scope: 'Keeps the public frame minimal, clear, and safe.',
      non_scope: 'Keeps private details out of view.',
      operating_rule: 'Stay brief and keep the page public-safe.',
      independence_flag: false
    },
    {
      id: 'cony',
      display_name: 'CONY',
      role_id: 'ORCHESTRATOR',
      reports_to: 'me',
      group: 'executive',
      level: 1,
      pipeline: 'top',
      scope: 'Owns the public hierarchy and keeps the page cohesive.',
      non_scope: 'Keeps private operations out of view.',
      operating_rule: 'Route work through the smallest safe surface.',
      independence_flag: false
    },
    {
      id: 'wise',
      display_name: 'WISE',
      role_id: 'WISE',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Keeps memory, routing context, and knowledge organization aligned.',
      non_scope: 'Does not do direct implementation or public-facing design work.',
      operating_rule: 'Preserve context without widening the public surface.',
      independence_flag: false
    },
    {
      id: 'orin',
      display_name: 'ORIN',
      role_id: 'ORIN',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Builds repo, code, documentation, and file changes safely.',
      non_scope: 'Does not act as the final approver or domain lead.',
      operating_rule: 'Implement the smallest correct change set.',
      independence_flag: false
    },
    {
      id: 'argus',
      display_name: 'ARGUS',
      role_id: 'ARGUS',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Prepares commit review packages and checks changed files.',
      non_scope: 'Does not replace final human review.',
      operating_rule: 'Keep review evidence concise and actionable.',
      independence_flag: false
    },
    {
      id: 'thales',
      display_name: 'THALES',
      role_id: 'THALES',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Reads primary or provided sources and extracts evidence.',
      non_scope: 'Does not invent facts or conclusions beyond the source.',
      operating_rule: 'Anchor claims in the available evidence.',
      independence_flag: false
    },
    {
      id: 'vera',
      display_name: 'VERA',
      role_id: 'VERA',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Verifies claims, dates, figures, and source alignment.',
      non_scope: 'Does not replace source extraction or critique.',
      operating_rule: 'Check facts before any conclusion is repeated.',
      independence_flag: false
    },
    {
      id: 'nyx',
      display_name: 'NYX',
      role_id: 'NYX',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Finds contradictions, weak assumptions, and failure modes.',
      non_scope: 'Does not block work without actionable findings.',
      operating_rule: 'Pressure-test the plan and surface risks clearly.',
      independence_flag: false
    },
    {
      id: 'win',
      display_name: 'WIN',
      role_id: 'WIN',
      reports_to: 'cony',
      group: 'domain',
      level: 2,
      pipeline: 'independent',
      scope: 'Handles investment research only, with no trading execution.',
      non_scope: 'Does not connect to broker activity or production action.',
      operating_rule: 'Keep research separate from action.',
      independence_flag: true
    },
    {
      id: 'nexus',
      display_name: 'NEXUS',
      role_id: 'NEXUS',
      reports_to: 'cony',
      group: 'domain',
      level: 2,
      pipeline: 'domain',
      scope: 'Leads telecom planning, AIS conventions, QGIS, KPI, and MML work.',
      non_scope: 'Does not guess unsafe network commands or production values.',
      operating_rule: 'Route telecom work into the right specialist lane.',
      independence_flag: false
    },
    {
      id: 'muse',
      display_name: 'MUSE',
      role_id: 'MUSE',
      reports_to: 'cony',
      group: 'domain',
      level: 2,
      pipeline: 'domain',
      scope: 'Leads public page, UX/UI, styling, and interaction work.',
      non_scope: 'Does not override safe page identity or private details.',
      operating_rule: 'Preserve page identity while improving presentation.',
      independence_flag: false
    },
    {
      id: 'marconi',
      display_name: 'MARCONI',
      role_id: 'MARCONI',
      reports_to: 'nexus',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles 2G/3G/4G/5G, band, system, and cell-code logic.',
      non_scope: 'Does not invent config values or naming rules.',
      operating_rule: 'Keep RAT logic precise and traceable.',
      independence_flag: false
    },
    {
      id: 'regis',
      display_name: 'REGIS',
      role_id: 'REGIS',
      reports_to: 'nexus',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles AIS naming/config conventions and scenario values.',
      non_scope: 'Does not replace telecom validation or MML generation.',
      operating_rule: 'Protect naming conventions first.',
      independence_flag: false
    },
    {
      id: 'terra',
      display_name: 'TERRA',
      role_id: 'TERRA',
      reports_to: 'nexus',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles QGIS planning, geometry, and cell pie wedges.',
      non_scope: 'Does not blur geometry or map styling logic.',
      operating_rule: 'Keep map tooling geometrically correct.',
      independence_flag: false
    },
    {
      id: 'prism',
      display_name: 'PRISM',
      role_id: 'PRISM',
      reports_to: 'nexus',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles PRB, CELL_RANGE, throughput, and weekly KPI trends.',
      non_scope: 'Does not guess missing data joins or metrics.',
      operating_rule: 'Keep KPI interpretation accurate.',
      independence_flag: false
    },
    {
      id: 'delta',
      display_name: 'DELTA',
      role_id: 'DELTA',
      reports_to: 'nexus',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles Excel/Power Query MML generation and tilt/power commands.',
      non_scope: 'Does not invent missing telecom inputs.',
      operating_rule: 'Generate telecom commands safely.',
      independence_flag: false
    },
    {
      id: 'talos',
      display_name: 'TALOS',
      role_id: 'TALOS',
      reports_to: 'nexus',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles Python/pandas automation and telecom tooling implementation.',
      non_scope: 'Does not replace domain validation or human approval.',
      operating_rule: 'Build safe, traceable telecom tools.',
      independence_flag: false
    },
    {
      id: 'vivd',
      display_name: 'VIVD',
      role_id: 'VIVD',
      reports_to: 'muse',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Sets overall brand and visual direction.',
      non_scope: 'Does not override layout details that belong elsewhere.',
      operating_rule: 'Keep the visual identity coherent.',
      independence_flag: false
    },
    {
      id: 'nova',
      display_name: 'NOVA',
      role_id: 'NOVA',
      reports_to: 'muse',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles page layout, hierarchy, components, and readability.',
      non_scope: 'Does not rewrite page logic or motion systems.',
      operating_rule: 'Keep layouts clear and balanced.',
      independence_flag: false
    },
    {
      id: 'axiom',
      display_name: 'AXIOM',
      role_id: 'AXIOM',
      reports_to: 'muse',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles page logic, calculations, and input/output behavior.',
      non_scope: 'Does not take over visual composition.',
      operating_rule: 'Keep behavior technically correct.',
      independence_flag: false
    },
    {
      id: 'rhythm',
      display_name: 'RHYTHM',
      role_id: 'RHYTHM',
      reports_to: 'muse',
      group: 'subagent',
      level: 3,
      pipeline: 'domain',
      scope: 'Handles GSAP, parallax, scrub, hover, and microinteraction flow.',
      non_scope: 'Does not introduce motion that hides content.',
      operating_rule: 'Use motion to clarify, not distract.',
      independence_flag: false
    }
  ]);

  const NODE_MAP = new Map(NODE_DATA.map((n) => [n.id, n]));
  const HIERARCHY_ROOT = document.querySelector('#hierarchy-root');
  const CODEX_GRID = document.querySelector('#codex-grid');
  const FLOW_CONTAINER = document.querySelector('#hierarchy-flow');

  const navLinks = Array.from(document.querySelectorAll('.anchor-nav a[href^="#"]'));
  const targets = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  /* ═══════════════════════════════════════════════════════════════
     SVG SIGILS — one per agent
     ═══════════════════════════════════════════════════════════════ */

  const SIGILS = {
    me: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <circle cx="30" cy="30" r="23" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
      <path d="M14 30Q30 16 46 30Q30 44 14 30Z" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="30" cy="30" r="5.5" fill="currentColor" opacity="0.8"/>
      <circle cx="30" cy="30" r="2.5" fill="currentColor"/>
      <line x1="30" y1="3" x2="30" y2="9" stroke="currentColor" stroke-width="0.8"/>
      <line x1="30" y1="51" x2="30" y2="57" stroke="currentColor" stroke-width="0.8"/>
      <line x1="3" y1="30" x2="9" y2="30" stroke="currentColor" stroke-width="0.8"/>
      <line x1="51" y1="30" x2="57" y2="30" stroke="currentColor" stroke-width="0.8"/>
    </svg>`,

    cony: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <path d="M17 38L17 25L22 30L27 22L30 19L33 22L38 30L43 25L43 38Z" stroke="currentColor" stroke-width="1.5"/>
      <line x1="17" y1="38" x2="43" y2="38" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="30" cy="25" r="2" fill="currentColor" opacity="0.6"/>
      <ellipse cx="30" cy="32" rx="18" ry="6" stroke="currentColor" stroke-width="0.7" opacity="0.4" transform="rotate(-15 30 32)"/>
    </svg>`,

    wise: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <path d="M13 40L13 22Q21 19 30 23Q39 19 47 22L47 40Q39 37 30 41Q21 37 13 40Z" stroke="currentColor" stroke-width="1.5"/>
      <line x1="30" y1="23" x2="30" y2="41" stroke="currentColor" stroke-width="1"/>
      <path d="M25 17Q30 13 35 17Q30 21 25 17Z" stroke="currentColor" stroke-width="1"/>
      <circle cx="30" cy="17" r="2" fill="currentColor" opacity="0.7"/>
    </svg>`,

    orin: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <rect x="19" y="17" width="22" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <line x1="30" y1="26" x2="30" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="14" y1="15" x2="19" y2="20" stroke="currentColor" stroke-width="1" opacity="0.6"/>
      <line x1="46" y1="15" x2="41" y2="20" stroke="currentColor" stroke-width="1" opacity="0.6"/>
      <line x1="12" y1="22" x2="19" y2="22" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
      <line x1="41" y1="22" x2="48" y2="22" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    </svg>`,

    muse: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <circle cx="26" cy="26" r="11" stroke="currentColor" stroke-width="1.5"/>
      <line x1="34" y1="34" x2="47" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="26" cy="26" r="4" fill="currentColor" opacity="0.6"/>
      <circle cx="26" cy="26" r="1.5" fill="currentColor"/>
    </svg>`,

    nyx: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <path d="M30 11L43 18L43 34Q43 45 30 50Q17 45 17 34L17 18Z" stroke="currentColor" stroke-width="1.5"/>
      <path d="M30 19L27 28L33 30L29 42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    win: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <path d="M34 13Q21 19 21 30Q21 41 34 47Q25 43 25 30Q25 17 34 13Z" fill="currentColor" opacity="0.5"/>
      <path d="M40 18L41 21L44 21L42 23L43 26L40 24L37 26L38 23L36 21L39 21Z" fill="currentColor" opacity="0.7"/>
    </svg>`,

    nexus: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="30" y1="16" x2="30" y2="44" stroke="currentColor" stroke-width="2"/>
      <line x1="22" y1="44" x2="38" y2="44" stroke="currentColor" stroke-width="1.5"/>
      <line x1="25" y1="35" x2="35" y2="35" stroke="currentColor" stroke-width="1"/>
      <line x1="27" y1="28" x2="33" y2="28" stroke="currentColor" stroke-width="0.8"/>
      <path d="M38 19Q43 25 38 31" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
      <path d="M42 15Q50 25 42 35" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    </svg>`
  };

  Object.assign(SIGILS, {
    argus: SIGILS.muse,
    thales: SIGILS.wise,
    vera: SIGILS.muse,
    marconi: SIGILS.nexus,
    regis: SIGILS.wise,
    terra: SIGILS.nexus,
    prism: SIGILS.muse,
    delta: SIGILS.orin,
    talos: SIGILS.orin,
    vivd: SIGILS.wise,
    nova: SIGILS.muse,
    axiom: SIGILS.muse,
    rhythm: SIGILS.nyx
  });

  /* ═══════════════════════════════════════════════════════════════
     PIPELINE COLORS
     ═══════════════════════════════════════════════════════════════ */

  const PIPELINE_COLORS = {
    top: '#d4af37',
    core: '#c9a84c',
    domain: '#c9a84c',
    independent: '#8b5cf6'
  };

  const PIPELINE_LABELS = {
    top: 'Executive',
    core: 'Core lead',
    domain: 'Domain lead',
    independent: 'Independent'
  };

  /* ═══════════════════════════════════════════════════════════════
     PORTRAIT PATH RESOLVER
     Tries portrait-${id}.png first (root level), then portraits/${id}.png (subfolder)
     ═══════════════════════════════════════════════════════════════ */

  const PORTRAIT_PATHS = (nodeId) => [
    `portrait-${nodeId}.png`,
    `portraits/${nodeId}.png`
  ];

  /* Try loading a portrait with multiple paths and retry */
  const tryLoadPortrait = (paths, onSuccess, onAllFail, retryCount = 0) => {
    if (paths.length === 0) {
      if (retryCount < 2) {
        /* Retry up to 2 times with a delay */
        setTimeout(() => {
          tryLoadPortrait(
            PORTRAIT_PATHS(paths._nodeId || ''),
            onSuccess,
            onAllFail,
            retryCount + 1
          );
        }, 500 * (retryCount + 1));
      } else {
        if (onAllFail) onAllFail();
      }
      return;
    }

    const [currentPath, ...remainingPaths] = paths;
    /* Store nodeId for retry */
    remainingPaths._nodeId = paths._nodeId || currentPath.replace(/^portrait-/, '').replace(/^portraits\//, '').replace(/\.png$/, '');

    const img = new Image();
    img.onload = () => {
      onSuccess(currentPath);
    };
    img.onerror = () => {
      tryLoadPortrait(remainingPaths, onSuccess, onAllFail, retryCount);
    };
    img.src = currentPath;
  };

  /* ═══════════════════════════════════════════════════════════════
     DOM HELPERS
     ═══════════════════════════════════════════════════════════════ */

  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  };

  const fieldPair = (label, value) => {
    const field = createEl('dl', 'back-field');
    field.append(createEl('dt', null, label), createEl('dd', null, String(value)));
    return field;
  };

  const nodeFieldPair = (label, value) => {
    const field = createEl('dl', 'node-field');
    field.append(createEl('dt', null, label), createEl('dd', null, String(value)));
    return field;
  };

  /* ═══════════════════════════════════════════════════════════════
     MAGICAL FLIP PARTICLE BURST
     ═══════════════════════════════════════════════════════════════ */

  const createFlipBurst = (card) => {
    const container = createEl('div', 'flip-particles');
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const numParticles = 12;

    for (let i = 0; i < numParticles; i++) {
      const particle = createEl('span', 'flip-particle');
      const angle = (Math.PI * 2 / numParticles) * i + (Math.random() - 0.5) * 0.5;
      const distance = 40 + Math.random() * 60;
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.style.setProperty('--px', px + 'px');
      particle.style.setProperty('--py', py + 'px');
      particle.style.animationDelay = (Math.random() * 0.15) + 's';
      particle.style.width = (3 + Math.random() * 4) + 'px';
      particle.style.height = particle.style.width;

      /* Some particles use violet for independent cards */
      if (card.dataset.pipeline === 'independent' && Math.random() > 0.5) {
        particle.style.background = '#a78bfa';
        particle.style.boxShadow = '0 0 8px #8b5cf6, 0 0 16px rgba(139, 92, 246, 0.3)';
      }

      container.append(particle);
    }

    card.append(container);
    /* Remove particles after animation */
    setTimeout(() => {
      container.remove();
    }, 1200);
  };

  /* ═══════════════════════════════════════════════════════════════
     CODEX CARD BUILDER (flip card)
     Front: PORTRAIT hero + name/role at bottom
     Back:  Full dossier details
     ═══════════════════════════════════════════════════════════════ */

  const buildCodexCard = (node, index) => {
    const reportsToLabel =
      node.reports_to === 'none'
        ? 'none'
        : NODE_MAP.get(node.reports_to)?.display_name ?? node.reports_to;

    const pipelineColor = PIPELINE_COLORS[node.pipeline] || PIPELINE_COLORS.core;
    const pipelineLabel = PIPELINE_LABELS[node.pipeline] || node.pipeline;
    const total = NODE_DATA.length;
    const num = String(index + 1).padStart(2, '0');

    const card = createEl('article', 'codex-card reveal');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `${node.display_name}, ${node.role_id}. Click to flip.`);
    card.dataset.node = node.id;
    card.dataset.pipeline = node.pipeline;
    card.style.setProperty('--pipeline-color', pipelineColor);

    /* Add stagger delay */
    const delayClass = `reveal-delay-${Math.min((index % 4) + 1, 4)}`;
    card.classList.add(delayClass);

    /* Pipeline tab */
    const tab = createEl('span', 'pipeline-tab');
    tab.textContent = pipelineLabel;

    /* Inner wrapper */
    const inner = createEl('div', 'codex-inner');

    /* ── Front face ── */
    const front = createEl('div', 'face front');

    const frontId = createEl('span', 'front-id');
    frontId.textContent = `${num} / ${total}`;

    /* Portrait frame — takes up the majority of the card */
    const portraitFrame = createEl('div', 'portrait-frame');
    const portrait = createEl('div', 'portrait placeholder');
    /* Store node ID for portrait loading */
    portrait.dataset.nodeId = node.id;
    /* Fallback initial shown when no portrait loads */
    const initial = createEl('span', 'portrait-initial');
    initial.textContent = node.display_name.charAt(0);
    portrait.append(initial);

    /* Sigil watermark at bottom of portrait */
    const sigilOverlay = createEl('div', 'sigil-overlay');
    sigilOverlay.innerHTML = SIGILS[node.id] || '';

    portraitFrame.append(portrait, sigilOverlay);

    /* Name + role band at bottom of card */
    const frontInfo = createEl('div', 'front-info');
    const frontName = createEl('h2', 'front-name');
    frontName.textContent = node.display_name;
    const frontRole = createEl('div', 'front-role');
    frontRole.textContent = node.role_id;
    frontInfo.append(frontName, frontRole);

    const flipHint = createEl('span', 'flip-hint');
    flipHint.textContent = 'flip \u2192';

    front.append(frontId, portraitFrame, frontInfo, flipHint);

    /* ── Back face ── */
    const back = createEl('div', 'face back');

    const backAccent = createEl('div', 'back-accent');

    const backHead = createEl('div', 'back-head');
    const backPipe = createEl('span', 'back-pipe');
    const dot = createEl('i', `dot dot-${node.pipeline === 'independent' ? 'domain' : 'core'}`);
    backPipe.append(dot, document.createTextNode(pipelineLabel));
    const backClose = createEl('span', 'back-close');
    backClose.textContent = '\u2190 back';
    backHead.append(backPipe, backClose);

    const backTitle = createEl('div', 'back-title');
    const backName = createEl('h3');
    backName.textContent = node.display_name;
    const backRole = createEl('span', 'role');
    backRole.textContent = node.role_id;
    backTitle.append(backName, backRole);

    const backQuote = createEl('p', 'back-quote');
    backQuote.textContent = node.scope;

    const backFields = createEl('div', 'back-fields');
    backFields.append(
      fieldPair('Non-scope', node.non_scope),
      fieldPair('Reports to', reportsToLabel),
      fieldPair('Group', node.group),
      fieldPair('Level', node.level),
      fieldPair('Independence', node.independence_flag ? 'true' : 'false')
    );

    const ruleBox = createEl('div', 'rule-box');
    ruleBox.textContent = node.operating_rule;

    back.append(backAccent, backHead, backTitle, backQuote, backFields, ruleBox);

    inner.append(front, back);
    card.append(tab, inner);

    return card;
  };

  /* ═══════════════════════════════════════════════════════════════
     HIERARCHY NODE CARD (original layout)
     ═══════════════════════════════════════════════════════════════ */

  const buildNodeCard = (node, variant) => {
    const reportsToLabel =
      node.reports_to === 'none'
        ? 'none'
        : NODE_MAP.get(node.reports_to)?.display_name ?? node.reports_to;

    const card = createEl(
      'article',
      [
        'node-card',
        `node-card--${variant}`,
        `node-card--${node.group}`,
        node.independence_flag ? 'node-card--independent' : ''
      ].filter(Boolean).join(' ')
    );
    card.dataset.node = node.id;

    const header = createEl('div', 'node-card__header');
    const titleWrap = document.createElement('div');
    const title = createEl('h3', 'node-card__title', node.display_name);
    const subtitle = createEl('span', 'node-card__subtitle', node.role_id);
    titleWrap.append(title, subtitle);

    const badges = createEl('div', 'node-badges');
    badges.append(
      createEl('span', 'badge', `reports to ${reportsToLabel}`),
      createEl('span', 'badge', `group ${node.group}`),
      createEl('span', 'badge', `level ${node.level}`)
    );
    if (node.independence_flag) {
      badges.append(createEl('span', 'badge badge--independent', 'independent lane'));
    }

    header.append(titleWrap, badges);
    card.append(header);

    if (variant === 'hub') {
      card.append(createEl('p', 'node-card__summary', node.scope));
      card.append(nodeFieldPair('Operating rule', node.operating_rule));
    } else if (variant === 'lead') {
      card.append(createEl('p', 'node-card__summary', node.operating_rule));
      card.append(nodeFieldPair('Scope', node.scope));
    } else if (variant === 'dossier') {
      const fields = createEl('div', 'node-fields');
      fields.append(
        nodeFieldPair('Display name', node.display_name),
        nodeFieldPair('Role ID', node.role_id),
        nodeFieldPair('Reports to', reportsToLabel),
        nodeFieldPair('Group', node.group),
        nodeFieldPair('Level', node.level),
        nodeFieldPair('Scope', node.scope),
        nodeFieldPair('Non-scope', node.non_scope),
        nodeFieldPair('Operating rule', node.operating_rule),
        nodeFieldPair('Independence flag', node.independence_flag ? 'true' : 'false')
      );
      card.append(fields);
    }

    return card;
  };

  /* ═══════════════════════════════════════════════════════════════
     HIERARCHY BUILDER (Section 01)
     ═══════════════════════════════════════════════════════════════ */

  const buildHierarchy = () => {
    if (!HIERARCHY_ROOT) return;

    const stack = createEl('div', 'hierarchy-stack');
    stack.append(
      buildNodeCard(NODE_MAP.get('me'), 'hub'),
      createEl('div', 'hierarchy-connector'),
      buildNodeCard(NODE_MAP.get('cony'), 'hub')
    );

    const groups = createEl('div', 'lead-groups');
    [
      {
        label: 'Core leads',
        note: 'memory, build, review, fact, critique',
        names: ['wise', 'orin', 'argus', 'thales', 'vera', 'nyx'],
        independent: false
      },
      {
        label: 'Domain leads',
        note: 'WIN, NEXUS, MUSE',
        names: ['win', 'nexus', 'muse'],
        independent: true
      },
      {
        label: 'NEXUS subagents',
        note: 'telecom specialists',
        names: ['marconi', 'regis', 'terra', 'prism', 'delta', 'talos'],
        independent: false
      },
      {
        label: 'MUSE subagents',
        note: 'design specialists',
        names: ['vivd', 'nova', 'axiom', 'rhythm'],
        independent: false
      }
    ].forEach((group) => {
      const panel = createEl(
        'section',
        `lead-group${group.independent ? ' lead-group--independent' : ''}`
      );
      const heading = createEl('div', 'lead-group__heading');
      heading.append(
        createEl('strong', null, group.label),
        createEl('span', null, group.note)
      );
      const row = createEl('div', 'lead-grid');
      group.names.forEach((name) => {
        const n = NODE_MAP.get(name);
        if (n) row.append(buildNodeCard(n, 'lead'));
      });
      panel.append(heading, row);
      groups.append(panel);
    });

    HIERARCHY_ROOT.append(stack, groups);
  };

  /* ═══════════════════════════════════════════════════════════════
     CODEX GRID BUILDER (Section 02 — grid view)
     ═══════════════════════════════════════════════════════════════ */

  const buildCodexGrid = () => {
    if (!CODEX_GRID) return;
    NODE_DATA.forEach((node, i) => {
      CODEX_GRID.append(buildCodexCard(node, i));
    });
  };

  /* ═══════════════════════════════════════════════════════════════
     FLOW VIEW BUILDER (Section 02 — pipeline view)
     ═══════════════════════════════════════════════════════════════ */

  const buildFlowView = () => {
    if (!FLOW_CONTAINER) return;

    const wrap = createEl('div', 'flow-wrap');
    const wrapLabel = createEl('span', 'flow-wrap-label');
    wrapLabel.textContent = 'production \u00b7 pipeline';

    const lanes = [
      { label: 'Top', note: 'command chain', ids: ['me', 'cony'], rowClass: 'lane-top' },
      { label: 'Core leads', note: 'memory, build, review, fact, critique', ids: ['wise', 'orin', 'argus', 'thales', 'vera', 'nyx'], rowClass: 'lane-core' },
      { label: 'Domain leads', note: 'WIN, NEXUS, MUSE', ids: ['win', 'nexus', 'muse'], rowClass: 'lane-domain', isInfinite: true },
      { label: 'NEXUS subagents', note: 'telecom specialists', ids: ['marconi', 'regis', 'terra', 'prism', 'delta', 'talos'], rowClass: 'lane-core' },
      { label: 'MUSE subagents', note: 'design specialists', ids: ['vivd', 'nova', 'axiom', 'rhythm'], rowClass: 'lane-core' }
    ];

    lanes.forEach((lane) => {
      const laneEl = createEl('div', 'flow-lane');
      const labelEl = createEl('div', 'flow-lane-label');
      const row1 = createEl('span');
      row1.style.display = 'flex';
      row1.style.alignItems = 'center';
      row1.style.gap = '8px';

      const dotEl = createEl('span', `dot dot-${lane.isInfinite ? 'domain' : 'top'}`);
      dotEl.style.width = '10px';
      dotEl.style.height = '10px';
      dotEl.style.borderRadius = '50%';
      dotEl.style.display = 'inline-block';
      row1.append(dotEl, document.createTextNode(lane.label));
      const small = createEl('small');
      small.textContent = lane.note;
      labelEl.append(row1, small);

      const rowEl = createEl('div', `flow-row ${lane.rowClass}`);

      lane.ids.forEach((id) => {
        const node = NODE_MAP.get(id);
        if (!node) return;

        const pipelineColor = PIPELINE_COLORS[node.pipeline] || PIPELINE_COLORS.core;

        const mini = createEl('div', 'mini-card');
        mini.dataset.id = node.id;
        mini.dataset.pipeline = node.pipeline;
        mini.style.setProperty('--pipeline-color', pipelineColor);

        const avatar = createEl('div', 'mini-avatar');
        avatar.dataset.nodeId = node.id;
        avatar.textContent = node.display_name.charAt(0);

        const meta = createEl('div', 'mini-meta');
        const name = createEl('div', 'mini-name');
        name.textContent = node.display_name;
        const role = createEl('div', 'mini-role');
        role.textContent = node.role_id;
        const sig = createEl('div', 'mini-sig');
        sig.textContent = node.operating_rule;
        meta.append(name, role, sig);

        mini.append(avatar, meta);
        rowEl.append(mini);
      });

      laneEl.append(labelEl, rowEl);
      wrap.append(laneEl);
    });

    wrap.prepend(wrapLabel);
    FLOW_CONTAINER.append(wrap);
  };

  /* ═══════════════════════════════════════════════════════════════
     PORTRAIT LOADER — FIXED with multiple paths and retry
     ═══════════════════════════════════════════════════════════════ */

  const loadPortraits = () => {
    /* Codex grid cards */
    document.querySelectorAll('.portrait[data-node-id]').forEach((el) => {
      const nodeId = el.dataset.nodeId;
      if (!nodeId) return;

      const paths = PORTRAIT_PATHS(nodeId);
      tryLoadPortrait(
        paths,
        (successPath) => {
          el.classList.remove('placeholder');
          el.style.backgroundImage = `url('${successPath}')`;
          /* Hide the initial letter */
          const initial = el.querySelector('.portrait-initial');
          if (initial) initial.style.display = 'none';
        },
        null /* onAllFail — keep placeholder */
      );
    });

    /* Mini cards in flow view */
    document.querySelectorAll('.mini-avatar[data-node-id]').forEach((el) => {
      const nodeId = el.dataset.nodeId;
      if (!nodeId) return;

      const paths = PORTRAIT_PATHS(nodeId);
      tryLoadPortrait(
        paths,
        (successPath) => {
          el.classList.add('has-portrait');
          el.style.backgroundImage = `url('${successPath}')`;
          el.textContent = '';
        },
        null /* onAllFail — keep initial letter */
      );
    });
  };

  /* ═══════════════════════════════════════════════════════════════
     FLIP CARD INTERACTION — with magical burst effect
     ═══════════════════════════════════════════════════════════════ */

  const initFlipCards = () => {
    document.querySelectorAll('.codex-card').forEach((card) => {
      card.addEventListener('click', () => {
        const isFlipped = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');

        /* Add magical burst effect */
        card.classList.add('flipping');
        createFlipBurst(card);
        setTimeout(() => {
          card.classList.remove('flipping');
        }, 600);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  };

  /* ═══════════════════════════════════════════════════════════════
     VIEW TOGGLE (Codex Grid / Pipeline Flow)
     ═══════════════════════════════════════════════════════════════ */

  const initViewToggle = () => {
    const btnGrid = document.getElementById('btn-grid');
    const btnFlow = document.getElementById('btn-flow');
    if (!btnGrid || !btnFlow) return;

    btnGrid.addEventListener('click', () => {
      document.body.dataset.view = 'grid';
      btnGrid.setAttribute('aria-pressed', 'true');
      btnFlow.setAttribute('aria-pressed', 'false');
    });

    btnFlow.addEventListener('click', () => {
      document.body.dataset.view = 'flow';
      btnFlow.setAttribute('aria-pressed', 'true');
      btnGrid.setAttribute('aria-pressed', 'false');
    });
  };

  /* ═══════════════════════════════════════════════════════════════
     NAVIGATION ACTIVE STATE
     ═══════════════════════════════════════════════════════════════ */

  const setActive = (hash) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) {
      setActive(`#${visible.target.id}`);
    }
  }, { threshold: 0.45, rootMargin: '-20% 0px -55% 0px' });

  targets.forEach((target) => observer.observe(target));

  const syncActiveFromViewport = () => {
    const preferred =
      (location.hash && document.querySelector(location.hash)) ||
      targets.find((target) => {
        const rect = target.getBoundingClientRect();
        return rect.top <= window.innerHeight * 0.35 && rect.bottom > window.innerHeight * 0.2;
      }) ||
      targets[0];
    if (preferred?.id) setActive(`#${preferred.id}`);
  };

  /* ═══════════════════════════════════════════════════════════════
     SCROLL REVEAL
     ═══════════════════════════════════════════════════════════════ */

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  const initRevealAnimations = () => {
    document.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.observe(el);
    });
  };

  /* ═══════════════════════════════════════════════════════════════
     TOPBAR SCROLL SHADOW
     ═══════════════════════════════════════════════════════════════ */

  const topbar = document.getElementById('topbar');
  let topbarTicking = false;

  const updateTopbar = () => {
    if (window.scrollY > 10) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
    topbarTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!topbarTicking) {
      requestAnimationFrame(updateTopbar);
      topbarTicking = true;
    }
  }, { passive: true });

  /* ═══════════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════════ */

  buildHierarchy();
  buildCodexGrid();
  buildFlowView();

  /* Load portraits immediately — no waiting for requestAnimationFrame */
  loadPortraits();

  requestAnimationFrame(() => {
    initFlipCards();
    initViewToggle();
    initRevealAnimations();
  });

  /* Also retry portrait loading after a short delay in case images weren't ready */
  setTimeout(loadPortraits, 1000);

  window.addEventListener('hashchange', syncActiveFromViewport);
  window.addEventListener('load', syncActiveFromViewport, { once: true });
  requestAnimationFrame(syncActiveFromViewport);
})();
