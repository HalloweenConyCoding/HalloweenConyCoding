/* ============================================
   WorkspaceV3 — Shared Sidebar Nav
   Inject sidebar into every page
   ============================================ */
/* global gsap */

(function() {
  const pages = [
    { href: 'index.html', label: 'Demo Home', icon: `<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>` },
    { href: 'tasks.html', label: 'Tasks', icon: `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>` },
    { href: 'calendar.html', label: 'Calendar', icon: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>` }
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${p.icon}</svg>
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

  // GSAP hover micro-animation on nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, { x: 2, duration: 0.2, ease: 'power2.out' });
      gsap.to(item.querySelector('svg'), { scale: 1.1, duration: 0.2, ease: 'power2.out', transformOrigin: 'center' });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, { x: 0, duration: 0.2, ease: 'power2.out' });
      gsap.to(item.querySelector('svg'), { scale: 1, duration: 0.2, ease: 'power2.out' });
    });
  });

})();
