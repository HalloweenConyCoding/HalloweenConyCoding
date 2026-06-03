export const NODE_DATA = Object.freeze([
  {
    id: 'me',
    display_name: 'ME',
    role_id: 'OWNER',
    reports_to: 'none',
    group: 'top',
    level: 0,
    pipeline: 'top',
    scope: 'Keeps the frame minimal, clear, and safe.',
    non_scope: 'Keeps private details out of view.',
    operating_rule: 'Stay brief and keep the page safe.',
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
    scope: 'Owns the hierarchy and keeps the page cohesive.',
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
    non_scope: 'Does not do direct implementation or outward design work.',
    operating_rule: 'Preserve context without widening the surface.',
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
    scope: 'Leads page, UX/UI, styling, and interaction work.',
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
    id: 'vivid',
    display_name: 'VIVID',
    role_id: 'VIVID',
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

export const NODE_MAP = new Map(NODE_DATA.map(n => [n.id, n]));

export const PIPELINE_COLORS = {
  top: '#d4af37',
  core: '#1a9b7a',
  domain: '#c8923a',
  independent: '#8b5cf6'
};

export const PIPELINE_LABELS = {
  top: 'Executive',
  core: 'Core Lead',
  domain: 'Domain Lead',
  independent: 'Independent'
};

export const PORTRAIT_PATHS = (nodeId) => [
  `../Agent Portraits/${nodeId}.png`,
  `../Agent Portraits/old_png/${nodeId}.png`
];

export const SIGILS = {
  me: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><circle cx="30" cy="30" r="23" stroke="currentColor" stroke-width="0.5" opacity="0.3"/><path d="M14 30Q30 16 46 30Q30 44 14 30Z" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="30" r="5.5" fill="currentColor" opacity="0.8"/><circle cx="30" cy="30" r="2.5" fill="currentColor"/><line x1="30" y1="3" x2="30" y2="9" stroke="currentColor" stroke-width="0.8"/><line x1="30" y1="51" x2="30" y2="57" stroke="currentColor" stroke-width="0.8"/><line x1="3" y1="30" x2="9" y2="30" stroke="currentColor" stroke-width="0.8"/><line x1="51" y1="30" x2="57" y2="30" stroke="currentColor" stroke-width="0.8"/></svg>`,
  cony: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M17 38L17 25L22 30L27 22L30 19L33 22L38 30L43 25L43 38Z" stroke="currentColor" stroke-width="1.5"/><line x1="17" y1="38" x2="43" y2="38" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="25" r="2" fill="currentColor" opacity="0.6"/><ellipse cx="30" cy="32" rx="18" ry="6" stroke="currentColor" stroke-width="0.7" opacity="0.4" transform="rotate(-15 30 32)"/></svg>`,
  wise: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M13 40L13 22Q21 19 30 23Q39 19 47 22L47 40Q39 37 30 41Q21 37 13 40Z" stroke="currentColor" stroke-width="1.5"/><line x1="30" y1="23" x2="30" y2="41" stroke="currentColor" stroke-width="1"/><path d="M25 17Q30 13 35 17Q30 21 25 17Z" stroke="currentColor" stroke-width="1"/><circle cx="30" cy="17" r="2" fill="currentColor" opacity="0.7"/></svg>`,
  orin: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><rect x="19" y="17" width="22" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/><line x1="30" y1="26" x2="30" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="15" x2="19" y2="20" stroke="currentColor" stroke-width="1" opacity="0.6"/><line x1="46" y1="15" x2="41" y2="20" stroke="currentColor" stroke-width="1" opacity="0.6"/></svg>`,
  muse: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><circle cx="26" cy="26" r="11" stroke="currentColor" stroke-width="1.5"/><line x1="34" y1="34" x2="47" y2="47" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="26" cy="26" r="4" fill="currentColor" opacity="0.6"/><circle cx="26" cy="26" r="1.5" fill="currentColor"/></svg>`,
  nyx: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M30 11L43 18L43 34Q43 45 30 50Q17 45 17 34L17 18Z" stroke="currentColor" stroke-width="1.5"/><path d="M30 19L27 28L33 30L29 42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  win: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M34 13Q21 19 21 30Q21 41 34 47Q25 43 25 30Q25 17 34 13Z" fill="currentColor" opacity="0.5"/><path d="M40 18L41 21L44 21L42 23L43 26L40 24L37 26L38 23L36 21L39 21Z" fill="currentColor" opacity="0.7"/></svg>`,
  nexus: `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><line x1="30" y1="16" x2="30" y2="44" stroke="currentColor" stroke-width="2"/><line x1="22" y1="44" x2="38" y2="44" stroke="currentColor" stroke-width="1.5"/><line x1="25" y1="35" x2="35" y2="35" stroke="currentColor" stroke-width="1"/><line x1="27" y1="28" x2="33" y2="28" stroke="currentColor" stroke-width="0.8"/><path d="M38 19Q43 25 38 31" stroke="currentColor" stroke-width="1.2" opacity="0.7"/><path d="M42 15Q50 25 42 35" stroke="currentColor" stroke-width="1" opacity="0.5"/></svg>`
};

// Fill remaining sigils
const sigilMap = {
  argus: 'muse', thales: 'wise', vera: 'muse',
  marconi: 'nexus', regis: 'wise', terra: 'nexus',
  prism: 'muse', delta: 'orin', talos: 'orin',
  vivid: 'wise', nova: 'muse', axiom: 'muse', rhythm: 'nyx'
};
Object.entries(sigilMap).forEach(([id, src]) => { SIGILS[id] = SIGILS[src]; });