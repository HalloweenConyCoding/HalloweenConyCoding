(function () {
  'use strict';

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var ScrollSmoother = window.ScrollSmoother;

  // No GSAP at all: leave content fully visible on native scroll.
  if (!gsap || !ScrollTrigger) {
    document.querySelectorAll('.reveal').forEach(function (n) { n.classList.add('visible'); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) { gsap.registerPlugin(window.ScrollToPlugin); }
  if (ScrollSmoother) { gsap.registerPlugin(ScrollSmoother); }

  document.documentElement.style.scrollBehavior = 'auto';

  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var progressFill = document.getElementById('chapterProgressFill');
  var darkSections = { celestial: true, 'ai-team': true, uncharted: true };

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function list(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function setProgress(p) {
    if (!progressFill) { return; }
    if (window.innerWidth <= 768) { gsap.set(progressFill, { scaleX: clamp01(p), scaleY: 1 }); }
    else { gsap.set(progressFill, { scaleX: 1, scaleY: clamp01(p) }); }
  }

  function setDarkMode(sectionId) {
    var isDark = !!darkSections[sectionId];
    body.classList.toggle('chapter-mode-dark', isDark);
    var starState = isDark ? 'running' : 'paused';
    var dustState = isDark ? 'paused' : 'running';
    document.querySelectorAll('.star').forEach(function (n) { n.style.animationPlayState = starState; });
    document.querySelectorAll('.dust-mote').forEach(function (n) { n.style.animationPlayState = dustState; });
  }

  function clearAtmosphereInlineStyles() {
    ['atmosLib', 'atmosCel', 'clockGrand', 'sunbeams', 'veilAiTeam', 'veilUncharted'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) { gsap.set(node, { clearProps: 'opacity,transform,clipPath' }); }
    });
  }

  // Section theme (nav colours + this event) is wired in index.html's IntersectionObserver.
  window.addEventListener('hcc:sectionchange', function (event) {
    if (event.detail && event.detail.id) { setDarkMode(event.detail.id); }
  });

  // Chapter-rail progress (works on native scroll or ScrollSmoother).
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { setProgress(self.progress); } });

  // Reduced motion: everything visible, no smoothing, no parallax.
  if (reduceMotion.matches) {
    document.querySelectorAll('.reveal').forEach(function (n) { n.classList.add('visible'); });
    setDarkMode('library');
    return;
  }

  var mm = gsap.matchMedia();

  // ══════════════════════════════════════════════════════════════════════
  //  DESKTOP — premium smooth scroll, directional theme wipes, varied
  //  per-section choreography, and selective pinning of short sections.
  // ══════════════════════════════════════════════════════════════════════
  mm.add('(min-width: 769px)', function () {
    body.classList.add('smooth-mode', 'motion-ready');
    window.__hccMotionOwned = true;   // index.html's inline atmosphere stands down
    clearAtmosphereInlineStyles();
    setDarkMode('library');

    var smoother = null;
    if (ScrollSmoother && document.getElementById('smooth-wrapper')) {
      smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.15,
        effects: true,
        normalizeScroll: true
      });
      window.__hccSmoother = smoother;
    }

    // Pin a section only when it fully fits the viewport — otherwise content would
    // be hidden behind the pin. Tall sections fall back to scroll-in reveals.
    function pinReveal(sel, build) {
      var sec = document.querySelector(sel);
      if (!sec) { return; }

      // Sections are min-height:100vh, so scrollHeight == viewport when content fits
      // and exceeds it only when the real content is taller. Pin only when it fits.
      if (sec.scrollHeight <= window.innerHeight + 4) {
        var tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sec,
            start: 'top top',
            end: '+=120%',
            scrub: 0.6,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        build(tl, sec);
      } else {
        var items = list('.reveal', sec);
        if (!items.length && sec.firstElementChild) { items = [sec.firstElementChild]; }
        revealGroup(items, { autoAlpha: 0, y: 50 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 },
          { trigger: sec, start: 'top 75%' });
      }
    }

    // Reliable scroll-reveal. Plays on enter while scrolling, and a deterministic
    // post-refresh pass (revealChecks, run after ScrollTrigger.refresh) handles any
    // element already in view at load — which onEnter alone misses under ScrollSmoother.
    var revealChecks = [];
    function revealGroup(targets, fromVars, toVars, opts) {
      opts = opts || {};
      targets = (targets || []).filter(Boolean);
      if (!targets.length) { return; }
      gsap.set(targets, fromVars);
      var done = false;
      function play() { if (done) { return; } done = true; gsap.to(targets, toVars); }
      var st = ScrollTrigger.create({
        trigger: opts.trigger || targets[0],
        start: opts.start || 'top 86%',
        onEnter: play
      });
      revealChecks.push(function () { if (st.scroll() >= st.start) { play(); } });
    }

    function revealTimeline(build, trigger, start) {
      var tl = gsap.timeline({ paused: true });
      build(tl);
      var done = false;
      function play() { if (done) { return; } done = true; tl.play(); }
      var st = ScrollTrigger.create({
        trigger: trigger,
        start: start || 'top 80%',
        onEnter: play
      });
      revealChecks.push(function () { if (st.scroll() >= st.start) { play(); } });
    }

    var ctx = gsap.context(function () {

      /* ── Directional theme transitions ──────────────────────────────
         Each new theme slips in from its own direction as you reach it. */

      // Library → Celestial: the dark sky wipes in from the RIGHT.
      var atmosCel = document.getElementById('atmosCel');
      if (atmosCel) {
        gsap.set(atmosCel, { opacity: 1, clipPath: 'inset(0 0 0 100%)' });
        gsap.to(atmosCel, {
          clipPath: 'inset(0 0 0 0%)', ease: 'none',
          scrollTrigger: { trigger: '#celestial', start: 'top 92%', end: 'top 35%', scrub: 0.6 }
        });
      }

      // AI Team: teal blueprint accent wipes DOWN from the top.
      var veilAi = document.getElementById('veilAiTeam');
      if (veilAi) {
        gsap.set(veilAi, { clipPath: 'inset(100% 0 0 0)' });
        gsap.to(veilAi, {
          clipPath: 'inset(0% 0 0 0)', ease: 'none',
          scrollTrigger: { trigger: '#ai-team', start: 'top 95%', end: 'top 45%', scrub: 0.6 }
        });
      }

      // Uncharted: muted slate haze wipes in from the LEFT.
      var veilUn = document.getElementById('veilUncharted');
      if (veilUn) {
        gsap.set(veilUn, { clipPath: 'inset(0 100% 0 0)' });
        gsap.to(veilUn, {
          clipPath: 'inset(0 0% 0 0)', ease: 'none',
          scrollTrigger: { trigger: '#uncharted', start: 'top 95%', end: 'top 45%', scrub: 0.6 }
        });
      }

      /* ── Decorative parallax (depth, never hides content) ──────────── */
      if (smoother) { smoother.effects('#orbitalSystem', { speed: 0.9 }); }
      var clock = document.getElementById('clockGrand');
      if (clock) {
        gsap.to(clock, { yPercent: 18, ease: 'none',
          scrollTrigger: { trigger: '#library', start: 'top top', end: 'bottom top', scrub: true } });
      }
      var sun = document.getElementById('sunbeams');
      if (sun) {
        gsap.to(sun, { yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: '#library', start: 'top top', end: 'bottom top', scrub: true } });
      }

      /* ── LIBRARY (tall): hero rises, cards swing in from alternating sides ── */
      var lib = document.getElementById('library');
      revealGroup(
        list('.hero .section-label, .hero-name, .hero-handle, .hero-tagline, .hero-subtitle', lib),
        { autoAlpha: 0, y: 64 },
        { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12 },
        { trigger: lib, start: 'top 75%' }
      );
      list('.lib-card', lib).forEach(function (card, i) {
        var fromLeft = i % 2 === 0;
        revealGroup([card],
          { autoAlpha: 0, x: fromLeft ? -100 : 100, rotateZ: fromLeft ? -2.5 : 2.5 },
          { autoAlpha: 1, x: 0, rotateZ: 0, duration: 1.05, ease: 'power3.out' },
          { start: 'top 88%' });
      });

      /* ── CELESTIAL (tall): orbital system assembles, cards rise & unclip ── */
      var cel = document.getElementById('celestial');
      var rings = list('.orbital-ring', cel);
      var cores = list('.orbital-core, .orbital-dot', cel);
      gsap.set(rings, { autoAlpha: 0, scale: 0.35 });
      gsap.set(cores, { autoAlpha: 0, scale: 0 });
      revealTimeline(function (tl) {
        tl.to(rings, { autoAlpha: 1, scale: 1, rotate: '+=140', duration: 1.1, ease: 'power3.out', stagger: 0.12 }, 0)
          .to(cores, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.06 }, 0.35);
      }, cel, 'top 78%');

      revealGroup(list('.celestial-title', cel),
        { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' },
        { start: 'top 85%' });

      list('.cel-card', cel).forEach(function (card, i) {
        var dir = i % 2 === 0 ? -1 : 1;
        revealGroup([card],
          { autoAlpha: 0, y: 80, x: 44 * dir, clipPath: 'inset(0 0 100% 0)' },
          { autoAlpha: 1, y: 0, x: 0, clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.out' },
          { start: 'top 88%' });
      });
      list('.dormant-card', cel).forEach(function (card) {
        revealGroup([card],
          { autoAlpha: 0, scale: 0.6, y: 30 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' },
          { start: 'top 90%' });
      });

      /* ── AI TEAM (short → pinned): title unwipes, card swings in from the right ── */
      pinReveal('#ai-team', function (tl, sec) {
        var title = list('.ai-team-title', sec);
        var card = list('.ai-team-card', sec);
        gsap.set(title, { autoAlpha: 0, x: -50, clipPath: 'inset(0 100% 0 0)' });
        gsap.set(card, { autoAlpha: 0, x: 140, rotationY: 14, transformOrigin: 'right center' });
        tl.to(title, { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'power2.out' }, 0.05)
          .to(card, { autoAlpha: 1, x: 0, rotationY: 0, duration: 0.5, ease: 'power3.out' }, 0.22)
          .to(card, { y: -22, duration: 0.32 }, 0.72);
      });

      /* ── UNCHARTED (short → pinned): rings bloom from centre, text rises ── */
      pinReveal('#uncharted', function (tl, sec) {
        var uRings = list('.uncharted-ring', sec);
        var title = list('.uncharted-title', sec);
        var badge = list('.uncharted-badge', sec);
        var desc = list('.uncharted-desc', sec);
        var text = title.concat(badge).concat(desc);
        gsap.set(uRings, { autoAlpha: 0, scale: 0 });
        gsap.set(text, { autoAlpha: 0, y: 44 });
        tl.to(uRings, { autoAlpha: 0.85, scale: 1, rotate: '+=90', duration: 0.5, ease: 'power3.out', stagger: 0.07 }, 0)
          .to(title, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' }, 0.32)
          .to(badge, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'back.out(2)' }, 0.46)
          .to(desc, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' }, 0.56)
          .to(uRings, { scale: 1.16, autoAlpha: 0.5, duration: 0.4 }, 0.72);
      });

    }); // gsap.context

    ScrollTrigger.refresh();
    // Positions are final now — reveal anything already in view at load.
    revealChecks.forEach(function (fn) { fn(); });

    // Safety net: time-based reveals need requestAnimationFrame. In a headless
    // renderer or a tab that never becomes visible, rAF can stay frozen and the
    // tweens never advance — so force all hidden content visible if the ticker
    // hasn't moved. (No effect on real browsers, where the ticker is running.)
    var frameAtInit = gsap.ticker.frame;
    window.setTimeout(function () {
      // A live 60fps rAF advances ~90+ frames in 1.6s; a frozen ticker advances a
      // handful. Well under that and time-based reveals can't run — show everything.
      if (gsap.ticker.frame - frameAtInit < 30) {
        list('.reveal, .hero-name, .hero-handle, .hero-subtitle, .hero .section-label, .hero-tagline, ' +
             '.lib-card, .cel-card, .dormant-card, .celestial-title, .orbital-ring, .orbital-core, .orbital-dot, ' +
             '.ai-team-title, .ai-team-card, .uncharted-ring, .uncharted-title, .uncharted-badge, .uncharted-desc')
          .forEach(function (n) { gsap.set(n, { clearProps: 'opacity,visibility,transform,clipPath' }); });
      }
    }, 1600);

    return function () {
      window.__hccMotionOwned = false;
      window.__hccSmoother = null;
      body.classList.remove('smooth-mode', 'chapter-mode-dark');
      document.documentElement.style.scrollBehavior = '';
      ctx.revert();
      if (smoother) { smoother.kill(); }
      clearAtmosphereInlineStyles();
    };
  });

  // ══════════════════════════════════════════════════════════════════════
  //  MOBILE — native scroll, inline atmosphere, CSS reveals via the
  //  IntersectionObserver in index.html.
  // ══════════════════════════════════════════════════════════════════════
  mm.add('(max-width: 768px)', function () {
    body.classList.add('motion-ready');
    setDarkMode('library');
    return function () {};
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { passive: true });
})();
