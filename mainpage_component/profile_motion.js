/* Homepage progressive enhancement: native scrolling, accessible navigation,
   and optional one-shot reveals. No GSAP or hidden-content dependency. */
(function () {
  'use strict';
  var doc = document;
  var toggle = doc.getElementById('navToggle');
  var menu = doc.getElementById('navLinks');
  var header = doc.getElementById('mainNav');
  if (!toggle || !menu || !header || !window.matchMedia) return;
  var mobile = window.matchMedia('(max-width: 760px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sections = Array.from(doc.querySelectorAll('main > section[id]'));
  var navLinks = Array.from(menu.querySelectorAll('a[href^="#"]'));
  var parallax = window.ProfileParallax;
  var parallaxLayers = parallax ? [
    { element: doc.querySelector('.hero-texture'), section: doc.getElementById('library'), amount: 72, mobileAmount: 72, direction: -1 },
    { element: doc.querySelector('.astrolabe'), section: doc.getElementById('library'), amount: 112, mobileAmount: 108, direction: 1 },
    { element: doc.querySelector('.stars'), section: doc.getElementById('celestial'), amount: 88, mobileAmount: 88, direction: -1 }
  ].filter(function (layer) { return layer.element && layer.section; }) : [];
  var atmosphereLayers = parallax ? [
    { element: doc.querySelector('.profile-atmo-gradient'), amount: 24, mobileAmount: 16, travel: 30, mobileTravel: 20, maxTravel: 96, mobileMaxTravel: 72, direction: -1 },
    { element: doc.querySelector('.profile-atmo-texture'), amount: 30, mobileAmount: 20, travel: 38, mobileTravel: 24, maxTravel: 120, mobileMaxTravel: 88, direction: 1 },
    { element: doc.querySelector('.profile-atmo-grid-far'), amount: 34, mobileAmount: 24, travel: 46, mobileTravel: 30, maxTravel: 150, mobileMaxTravel: 108, direction: -1 },
    { element: doc.querySelector('.profile-atmo-grid-near'), amount: 62, mobileAmount: 42, travel: 82, mobileTravel: 50, maxTravel: 250, mobileMaxTravel: 150, direction: 1 },
    { element: doc.querySelector('.profile-atmo-stars-far'), amount: 26, mobileAmount: 20, travel: 36, mobileTravel: 24, maxTravel: 130, mobileMaxTravel: 90, direction: -1 },
    { element: doc.querySelector('.profile-atmo-stars-near'), amount: 54, mobileAmount: 34, travel: 72, mobileTravel: 46, maxTravel: 220, mobileMaxTravel: 140, direction: 1 },
    { element: doc.querySelector('.profile-atmo-nebula-teal'), amount: 90, mobileAmount: 54, travel: 112, mobileTravel: 68, maxTravel: 320, mobileMaxTravel: 204, direction: -1 },
    { element: doc.querySelector('.profile-atmo-nebula-gold'), amount: 132, mobileAmount: 76, travel: 150, mobileTravel: 90, maxTravel: 420, mobileMaxTravel: 270, direction: 1 },
    { element: doc.querySelector('.profile-atmo-galaxy'), amount: 150, mobileAmount: 90, travel: 124, mobileTravel: 74, maxTravel: 360, mobileMaxTravel: 222, direction: -1 },
    { element: doc.querySelector('.profile-atmo-clock-far'), amount: 170, mobileAmount: 96, travel: 96, mobileTravel: 64, maxTravel: 260, mobileMaxTravel: 192, direction: -1 },
    { element: doc.querySelector('.profile-atmo-clock-near'), amount: 230, mobileAmount: 126, travel: 142, mobileTravel: 88, maxTravel: 380, mobileMaxTravel: 264, direction: 1 },
    { element: doc.querySelector('.profile-atmo-dust'), amount: 74, mobileAmount: 44, travel: 88, mobileTravel: 54, maxTravel: 260, mobileMaxTravel: 162, direction: -1 }
  ].filter(function (layer) { return layer.element; }) : [];
  var open = false;
  var scheduled = false;
  var animations = new Set();
  doc.documentElement.classList.add('js');

  function setMenu(next, restoreFocus) {
    open = mobile.matches && next;
    var hide = mobile.matches && !open;
    menu.hidden = hide;
    menu.inert = hide;
    menu.setAttribute('aria-hidden', String(hide));
    toggle.setAttribute('aria-expanded', String(open));
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }
  function syncViewport() {
    // Keep focus visible when a desktop link becomes part of a closed mobile menu.
    var focusWasInside = menu.contains(doc.activeElement);
    toggle.hidden = !mobile.matches;
    setMenu(false, mobile.matches && focusWasInside);
    requestUpdate();
  }
  toggle.addEventListener('click', function () { setMenu(!open, false); });
  doc.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && open) { event.preventDefault(); setMenu(false, true); }
  });
  doc.addEventListener('pointerdown', function (event) {
    if (open && !header.contains(event.target)) setMenu(false, false);
  });
  header.addEventListener('focusout', function (event) {
    // WebKit can blur to the body before a pointer click reaches an anchor.
    // Only a known keyboard destination outside the header closes the menu here.
    if (open && event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false, false);
  });

  function destination(hash) {
    if (!hash || hash === '#') return null;
    try { return doc.getElementById(decodeURIComponent(hash.slice(1))); }
    catch (_) { return null; }
  }
  function focusDestination(target, smooth) {
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start', behavior: smooth && !reduced.matches ? 'smooth' : 'instant' });
    requestUpdate();
  }
  doc.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    var hash = anchor.getAttribute('href');
    var target = destination(hash);
    if (!target) return;
    event.preventDefault();
    setMenu(false, false);
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    focusDestination(target, anchor.classList.contains('skip-link') ? false : true);
  });
  window.addEventListener('hashchange', function () {
    var target = destination(window.location.hash);
    setMenu(false, false);
    if (target) focusDestination(target, false);
  });

  function update() {
    scheduled = false;
    var threshold = header.getBoundingClientRect().height + 32;
    var active = sections[0];
    sections.forEach(function (section) { if (section.getBoundingClientRect().top <= threshold) active = section; });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= doc.documentElement.scrollHeight - 4) active = sections[sections.length - 1];
    if (!active) return;
    doc.body.dataset.theme = active.dataset.theme || 'paper';
    navLinks.forEach(function (link) {
      if (link.getAttribute('href') === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    updateParallax();
  }
  function requestUpdate() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(update); }
  }
  function preferenceChange() {
    if (reduced.matches) { animations.forEach(function (animation) { animation.cancel(); }); animations.clear(); }
    requestUpdate();
  }

  function updateParallax() {
    if (!parallax) return;
    var viewportHeight = window.innerHeight;
    atmosphereLayers.forEach(function (layer) {
      var offset = reduced.matches ? 0 : parallax.scrollOffset(window.scrollY, viewportHeight, mobile.matches ? layer.mobileTravel : layer.travel, layer.direction, mobile.matches ? layer.mobileMaxTravel : layer.maxTravel);
      layer.element.style.setProperty('--parallax-y', offset.toFixed(3) + 'px');
    });
    parallaxLayers.forEach(function (layer) {
      var offset = 0;
      if (!reduced.matches) {
        var rect = layer.section.getBoundingClientRect();
        var progress = parallax.sectionProgress({ top: rect.top, height: rect.height, viewportHeight: viewportHeight });
        offset = parallax.offsetFor(progress, mobile.matches ? layer.mobileAmount : layer.amount, layer.direction);
      }
      layer.element.style.setProperty('--parallax-y', offset.toFixed(3) + 'px');
    });
  }
  function listen(query, callback) {
    if (query.addEventListener) query.addEventListener('change', callback);
    else query.addListener(callback);
  }
  listen(mobile, syncViewport);
  listen(reduced, preferenceChange);
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { once: true });
  doc.addEventListener('toggle', requestUpdate, true);
  syncViewport();
  update();

  // Content is visible before, during, and after initialization. WAAPI adds
  // decoration only: no inline opacity/visibility survives cancellation or errors.
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (reduced.matches || typeof entry.target.animate !== 'function') return;
        var animation = entry.target.animate([
          { opacity: 0.7, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
        animations.add(animation);
        animation.onfinish = function () { animations.delete(animation); };
        animation.oncancel = function () { animations.delete(animation); };
      });
    }, { threshold: 0.08 });
    doc.querySelectorAll('.reveal').forEach(function (element) { observer.observe(element); });
  }
  var initial = destination(window.location.hash);
  if (initial) focusDestination(initial, false);
}());
