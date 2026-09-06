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
  }
  function requestUpdate() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(update); }
  }
  function preferenceChange() {
    if (reduced.matches) { animations.forEach(function (animation) { animation.cancel(); }); animations.clear(); }
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
