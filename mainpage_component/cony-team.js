(function () {
  'use strict';

  const NODE_DATA = Object.freeze([
    {
      id: 'me',
      display_name: 'ME',
      role_id: 'PUBLIC_OWNER',
      reports_to: 'none',
      group: 'top',
      level: 0,
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
      scope: 'Carries a narrow public domain perspective for the team story.',
      non_scope: 'Keeps the domain view focused on the public page.',
      operating_rule: 'Keep the domain surface narrow and readable.',
      independence_flag: false
    }
  ]);

  const NODE_MAP = new Map(NODE_DATA.map((node) => [node.id, node]));
  const HIERARCHY_ROOT = document.querySelector('#hierarchy-root');
  const DOSSIER_GRID = document.querySelector('#dossier-grid');

  const navLinks = Array.from(document.querySelectorAll('.anchor-nav a[href^="#"]'));
  const targets = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const createEl = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  };

  const fieldPair = (label, value) => {
    const field = createEl('dl', 'node-field');
    field.append(createEl('dt', null, label), createEl('dd', null, String(value)));
    return field;
  };

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
      card.append(fieldPair('Operating rule', node.operating_rule));
    } else if (variant === 'lead') {
      card.append(createEl('p', 'node-card__summary', node.operating_rule));
      card.append(fieldPair('Scope', node.scope));
    } else if (variant === 'dossier') {
      const fields = createEl('div', 'node-fields');
      fields.append(
        fieldPair('Display name', node.display_name),
        fieldPair('Role ID', node.role_id),
        fieldPair('Reports to', reportsToLabel),
        fieldPair('Group', node.group),
        fieldPair('Level', node.level),
        fieldPair('Scope', node.scope),
        fieldPair('Non-scope', node.non_scope),
        fieldPair('Operating rule', node.operating_rule),
        fieldPair('Independence flag', node.independence_flag ? 'true' : 'false')
      );
      card.append(fields);
    }

    return card;
  };

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
        const node = NODE_MAP.get(name);
        if (node) row.append(buildNodeCard(node, 'lead'));
      });
      panel.append(heading, row);
      groups.append(panel);
    });

    HIERARCHY_ROOT.append(stack, groups);
  };

  const buildDossiers = () => {
    if (!DOSSIER_GRID) return;
    NODE_DATA.forEach((node) => {
      DOSSIER_GRID.append(buildNodeCard(node, 'dossier'));
    });
  };

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
  }, {
    threshold: 0.45,
    rootMargin: '-20% 0px -55% 0px'
  });

  targets.forEach((target) => observer.observe(target));

  const syncActiveFromViewport = () => {
    const preferred =
      (location.hash && document.querySelector(location.hash)) ||
      targets.find((target) => {
        const rect = target.getBoundingClientRect();
        return rect.top <= window.innerHeight * 0.35 && rect.bottom > window.innerHeight * 0.2;
      }) ||
      targets[0];

    if (preferred?.id) {
      setActive(`#${preferred.id}`);
    }
  };

  buildHierarchy();
  buildDossiers();

  window.addEventListener('hashchange', syncActiveFromViewport);
  window.addEventListener('load', syncActiveFromViewport, { once: true });
  requestAnimationFrame(syncActiveFromViewport);
})();
