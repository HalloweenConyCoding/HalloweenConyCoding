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
      role_id: 'VAULT_KEEPER',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Keeps the public story consistent and preserves visible context.',
      non_scope: 'Keeps confidential notes and raw history out of view.',
      operating_rule: 'Retain what is useful and omit what is private.',
      independence_flag: false
    },
    {
      id: 'forge',
      display_name: 'FORGE',
      role_id: 'BUILDER',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Turns the approved public brief into working page structure.',
      non_scope: 'Avoids widening scope beyond the approved public page.',
      operating_rule: 'Build only what the page needs right now.',
      independence_flag: false
    },
    {
      id: 'lens',
      display_name: 'LENS',
      role_id: 'REVIEW',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Checks readability, balance, and hierarchy before release.',
      non_scope: 'Avoids hidden operational detail.',
      operating_rule: 'Inspect the page for clarity and visual drift.',
      independence_flag: false
    },
    {
      id: 'void',
      display_name: 'VOID',
      role_id: 'RISK_CHECK',
      reports_to: 'cony',
      group: 'core',
      level: 2,
      pipeline: 'core',
      scope: 'Looks for weak assumptions and exposed seams in the public page.',
      non_scope: 'Avoids private troubleshooting and escalation detail.',
      operating_rule: 'Pressure-test the page and leave the copy safe.',
      independence_flag: false
    },
    {
      id: 'win',
      display_name: 'WIN',
      role_id: 'INDEPENDENT_DOMAIN',
      reports_to: 'cony',
      group: 'domain',
      level: 2,
      pipeline: 'independent',
      scope: 'Represents a separate public lane while staying inside the org chart.',
      non_scope: 'Keeps the lane separate from the core row.',
      operating_rule: 'Remain visible, but keep the lane independent.',
      independence_flag: true
    },
    {
      id: 'telecom',
      display_name: 'TELECOM',
      role_id: 'DOMAIN_LEAD',
      reports_to: 'cony',
      group: 'domain',
      level: 2,
      pipeline: 'domain',
      scope: 'Carries a narrow public domain perspective for the team story.',
      non_scope: 'Keeps the domain view focused on the public page.',
      operating_rule: 'Keep the domain surface narrow and readable.',
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

    forge: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <rect x="19" y="17" width="22" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <line x1="30" y1="26" x2="30" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="14" y1="15" x2="19" y2="20" stroke="currentColor" stroke-width="1" opacity="0.6"/>
      <line x1="46" y1="15" x2="41" y2="20" stroke="currentColor" stroke-width="1" opacity="0.6"/>
      <line x1="12" y1="22" x2="19" y2="22" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
      <line x1="41" y1="22" x2="48" y2="22" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>
    </svg>`,

    lens: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <circle cx="26" cy="26" r="11" stroke="currentColor" stroke-width="1.5"/>
      <line x1="34" y1="34" x2="47" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="26" cy="26" r="4" fill="currentColor" opacity="0.6"/>
      <circle cx="26" cy="26" r="1.5" fill="currentColor"/>
    </svg>`,

    void: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <path d="M30 11L43 18L43 34Q43 45 30 50Q17 45 17 34L17 18Z" stroke="currentColor" stroke-width="1.5"/>
      <path d="M30 19L27 28L33 30L29 42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    win: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <path d="M34 13Q21 19 21 30Q21 41 34 47Q25 43 25 30Q25 17 34 13Z" fill="currentColor" opacity="0.5"/>
      <path d="M40 18L41 21L44 21L42 23L43 26L40 24L37 26L38 23L36 21L39 21Z" fill="currentColor" opacity="0.7"/>
    </svg>`,

    telecom: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="30" y1="16" x2="30" y2="44" stroke="currentColor" stroke-width="2"/>
      <line x1="22" y1="44" x2="38" y2="44" stroke="currentColor" stroke-width="1.5"/>
      <line x1="25" y1="35" x2="35" y2="35" stroke="currentColor" stroke-width="1"/>
      <line x1="27" y1="28" x2="33" y2="28" stroke="currentColor" stroke-width="0.8"/>
      <path d="M38 19Q43 25 38 31" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
      <path d="M42 15Q50 25 42 35" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    </svg>`
  };

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
     CODEX CARD BUILDER (flip card)
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
    const portraitPath = `../Agent Portraits/${node.id}.png`;

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

    const portraitFrame = createEl('div', 'portrait-frame');
    const portrait = createEl('div', 'portrait placeholder');
    portrait.dataset.portrait = portraitPath;
    /* We'll try to load the image later; fallback to initial */
    const initial = createEl('span', 'portrait-initial');
    initial.textContent = node.display_name.charAt(0);
    portrait.append(initial);

    const sigilOverlay = createEl('div', 'sigil-overlay');
    sigilOverlay.innerHTML = SIGILS[node.id] || '';

    portraitFrame.append(portrait, sigilOverlay);

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
        note: 'Shared execution lane',
        names: ['wise', 'forge', 'lens', 'void'],
        independent: false
      },
      {
        label: 'Domain leads',
        note: 'WIN stays visible but separate',
        names: ['win', 'telecom'],
        independent: true
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
      { label: 'Core leads', note: 'shared execution lane', ids: ['wise', 'forge', 'lens', 'void'], rowClass: 'lane-core' },
      { label: 'Domain leads', note: 'WIN stays visible but separate', ids: ['win', 'telecom'], rowClass: 'lane-domain', isInfinite: true }
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
        const portraitPath = `../Agent Portraits/${node.id}.png`;

        const mini = createEl('div', 'mini-card');
        mini.dataset.id = node.id;
        mini.dataset.pipeline = node.pipeline;
        mini.style.setProperty('--pipeline-color', pipelineColor);

        const avatar = createEl('div', 'mini-avatar');
        avatar.dataset.portrait = portraitPath;
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
     PORTRAIT LOADER
     Attempts to load real portrait images; falls back to initial.
     ═══════════════════════════════════════════════════════════════ */

  const loadPortraits = () => {
    /* Codex grid cards */
    document.querySelectorAll('.portrait[data-portrait]').forEach((el) => {
      const path = el.dataset.portrait;
      const img = new Image();
      img.onload = () => {
        el.classList.remove('placeholder');
        el.style.backgroundImage = `url('${path}')`;
        /* Hide the initial letter */
        const initial = el.querySelector('.portrait-initial');
        if (initial) initial.style.display = 'none';
      };
      img.onerror = () => { /* Keep placeholder */ };
      img.src = path;
    });

    /* Mini cards in flow view */
    document.querySelectorAll('.mini-avatar[data-portrait]').forEach((el) => {
      const path = el.dataset.portrait;
      const img = new Image();
      img.onload = () => {
        el.classList.add('has-portrait');
        el.style.backgroundImage = `url('${path}')`;
        el.textContent = '';
      };
      img.onerror = () => { /* Keep initial letter */ };
      img.src = path;
    });
  };

  /* ═══════════════════════════════════════════════════════════════
     FLIP CARD INTERACTION
     ═══════════════════════════════════════════════════════════════ */

  const initFlipCards = () => {
    document.querySelectorAll('.codex-card').forEach((card) => {
      card.addEventListener('click', () => {
        const isFlipped = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
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

  requestAnimationFrame(() => {
    initFlipCards();
    initViewToggle();
    loadPortraits();
    initRevealAnimations();
  });

  window.addEventListener('hashchange', syncActiveFromViewport);
  window.addEventListener('load', syncActiveFromViewport, { once: true });
  requestAnimationFrame(syncActiveFromViewport);
})();
