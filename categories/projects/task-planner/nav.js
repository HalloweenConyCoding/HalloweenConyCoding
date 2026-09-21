/* ============================================
   WorkspaceV3 — Shared Sidebar Nav
   Inject sidebar into every page
   ============================================ */
/* global gsap */

(function() {
  const pages = [
    { href: 'index.html', label: 'Workspace', icon: '../../../library/icon/cony-workspace/hub-command-orbit.svg' },
    { href: 'calendar.html', label: 'Calendar', icon: '../../../library/icon/cony-workspace/calendar-grid.svg' },
    { href: 'tasks.html', label: 'Tasks', icon: '../../../library/icon/cony-workspace/tasks-stack.svg' }
  ];

  const current = window.location.pathname.split('/').pop() || 'index.html';

  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="8"/>
        <line x1="12" y1="16" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="8" y2="12"/>
        <line x1="16" y1="12" x2="22" y2="12"/>
      </svg>
    </div>
    ${pages.map(p => `
      <a class="nav-item${p.href === current ? ' active' : ''}" href="${p.href}" data-nav-link>
        <img class="nav-icon" src="${p.icon}" alt="" aria-hidden="true">
        <span class="nav-tooltip">${p.label}</span>
      </a>
    `).join('')}
  `;

  // Insert at start of app-shell or body
  const shell = document.querySelector('.app-shell');
  if (shell) {
    shell.insertBefore(sidebar, shell.firstChild);
  }

  // Page transitions
  const curtain = document.getElementById('page-curtain');
  if (curtain) {
    document.querySelectorAll('[data-nav-link]').forEach(link => {
      if (link.href === window.location.href) return;
      link.addEventListener('click', e => {
        e.preventDefault();
        const href = link.getAttribute('href');
        gsap.set(curtain, { clipPath: 'circle(0% at 50% 50%)', pointerEvents: 'all' });
        gsap.to(curtain, {
          clipPath: 'circle(150% at 50% 50%)',
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: () => { window.location.href = href; }
        });
      });
    });
  }

  // Vertical dock interaction adapted from the latest ACTIVE workspace nav.
  const reduceMotion = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navItems = Array.from(sidebar.querySelectorAll('.nav-item'));

  function resetDock() {
    gsap.to(navItems, {
      x: 0,
      scale: 1,
      duration: reduceMotion ? 0 : 0.28,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  }

  function updateDock(clientY) {
    if (reduceMotion) return;
    const distance = 92;
    const maxShift = 15;
    const maxScale = 0.16;

    navItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const raw = Math.max(0, 1 - Math.abs(clientY - centerY) / distance);
      const influence = raw * raw * (3 - 2 * raw);

      gsap.to(item, {
        x: Math.round(influence * maxShift * 10) / 10,
        scale: 1 + influence * maxScale,
        duration: 0.2,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  }

  sidebar.addEventListener('pointermove', event => updateDock(event.clientY));
  sidebar.addEventListener('pointerleave', resetDock);

  navItems.forEach(item => {
    item.addEventListener('focus', () => {
      const rect = item.getBoundingClientRect();
      updateDock(rect.top + rect.height / 2);
    });
    item.addEventListener('blur', resetDock);
  });

})();
