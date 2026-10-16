/* Scroll-story enhancement lifecycle. Native document scrolling is always the source of truth. */
(function (window, document) {
  'use strict';
  var root = document.documentElement;
  var model = window.ProfileStoryModel;
  var instance = null;
  var toneCallback = null;
  var modeCallback = null;
  var zoneNames = ['intro', 'collection', 'contact'];
  var sceneOrder = ['intro', 'radio', 'tools', 'workbench', 'team', 'horizon', 'contact'];
  var sceneDestinations = { intro: 'library', radio: 'celestial', tools: 'story-tools', workbench: 'about', team: 'ai-team', horizon: 'uncharted', contact: 'connect' };
  var budgets = { intro: 1.5, collection: 8, contact: 1 };
  var intervals = {
    radio: [0, .20], tools: [.20, .40], workbench: [.40, .68],
    team: [.68, .88], horizon: [.88, 1]
  };

  function clamp(value) { return Math.max(0, Math.min(1, value)); }

  function createController() {
    var active = false;
    var destroyed = false;
    var permanentFlow = false;
    var scheduled = false;
    var previousFocusedScene = null;
    var focusScheduled = false;
    var stageHeight = 0;
    var viewportWidth = 0;
    var viewportHeight = 0;
    var triggers = [];
    var timelines = [];
    var animated = new Map();
    var sceneAttributes = new Map();
    var controlAttributes = new Map();
    var zoneStyleAttributes = new Map();
    var rootStageHeight = '';
    var tintStyleAttributes = new Map();
    var currentScene = 'intro';
    var announcedActive = false;
    var retainedFocusedControls = null;
    var navigationToken = 0;
    var savedStoryPosition = null;
    var pendingDetailsAnchor = null;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var forcedColors = window.matchMedia('(forced-colors: active)');
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var tints = {
      intro: document.querySelector('.profile-atmo-zone-tint-intro'),
      collection: document.querySelector('.profile-atmo-zone-tint-collection'),
      contact: document.querySelector('.profile-atmo-zone-tint-contact')
    };

    function headerHeight() {
      var header = document.getElementById('mainNav');
      return header ? header.getBoundingClientRect().height : 0;
    }

    function sceneElements() {
      return Array.from(document.querySelectorAll('[data-story-scene]'));
    }

    function capacity() {
      if (!model || !gsap || !ScrollTrigger || permanentFlow) return false;
      var availableHeight = Math.max(0, window.innerHeight - headerHeight());
      var maxSceneHeight = 0;
      var wasActive = root.classList.contains('story-active');
      if (wasActive) root.classList.remove('story-active');
      root.classList.add('story-measuring');
      try {
        maxSceneHeight = sceneElements().reduce(function (height, scene) {
          return Math.max(height, scene.getBoundingClientRect().height);
        }, 0);
      } finally {
        root.classList.remove('story-measuring');
        if (wasActive) root.classList.add('story-active');
      }
      return model.eligible(window.innerWidth, availableHeight, maxSceneHeight, reduced.matches, forcedColors.matches);
    }

    function rememberAttribute(map, element, name) {
      if (!map.has(element)) map.set(element, { present: element.hasAttribute(name), value: element.getAttribute(name) });
    }

    function restoreAttributeMap(map, name) {
      map.forEach(function (saved, element) {
        if (saved.present) element.setAttribute(name, saved.value);
        else element.removeAttribute(name);
      });
      map.clear();
    }

    function rememberStyle(element, map) {
      if (!map.has(element)) map.set(element, element.getAttribute('style'));
    }

    function restoreStyles(map) {
      map.forEach(function (value, element) {
        if (value === null) element.removeAttribute('style');
        else element.setAttribute('style', value);
      });
      map.clear();
    }

    function gsapSet(element, values) {
      if (!element) return;
      rememberStyle(element, animated);
      gsap.set(element, values);
    }

    function allTriggers() {
      triggers.forEach(function (item) { item.trigger.kill(); });
      timelines.forEach(function (timeline) { timeline.kill(); });
      triggers = [];
      timelines = [];
    }

    function announceMode(next) {
      if (announcedActive === next) return;
      announcedActive = next;
      if (typeof modeCallback === 'function') modeCallback(next, { permanentFlow: permanentFlow });
    }

    function deactivate() {
      if (!active && !root.classList.contains('story-active')) return;
      allTriggers();
      active = false;
      root.classList.remove('story-active');
      if (rootStageHeight) root.style.setProperty('--story-stage-height', rootStageHeight);
      else root.style.removeProperty('--story-stage-height');
      rootStageHeight = '';
      restoreStyles(animated);
      restoreStyles(tintStyleAttributes);
      restoreStyles(zoneStyleAttributes);
      sceneAttributes.forEach(function (saved, scene) {
        if (saved.aria.present) scene.setAttribute('aria-hidden', saved.aria.value);
        else scene.removeAttribute('aria-hidden');
        if (saved.inert.present) scene.setAttribute('inert', saved.inert.value);
        else scene.removeAttribute('inert');
        scene.classList.remove('story-focus-retained');
      });
      sceneAttributes.clear();
      controlAttributes.forEach(function (saved, controls) {
        if (saved.aria.present) controls.setAttribute('aria-hidden', saved.aria.value);
        else controls.removeAttribute('aria-hidden');
        if (saved.inert.present) controls.setAttribute('inert', saved.inert.value);
        else controls.removeAttribute('inert');
      });
      controlAttributes.clear();
      previousFocusedScene = null;
      retainedFocusedControls = null;
      announceMode(false);
    }

    function phaseForScene(timeline, sceneName, targets, fromVars, enterEase) {
      var interval = intervals[sceneName];
      var start = interval[0];
      var end = interval[1];
      var width = end - start;
      var overlap = sceneName === 'radio' ? 0 : Math.min(.04, width * .2);
      var enterStart = Math.max(0, start - overlap);
      var enterDuration = width * .25 + overlap;
      var exitDuration = width * .20;
      var exitStart = end - exitDuration;
      targets = targets.filter(Boolean);
      targets.forEach(function (target) {
        gsapSet(target, fromVars);
        timeline.to(target, {
          opacity: 1, x: 0, y: 0,
          duration: enterDuration,
          ease: enterEase || 'power3.out'
        }, enterStart);
        timeline.to(target, {
          opacity: 0, x: 0, y: -24,
          duration: exitDuration,
          ease: 'power2.in'
        }, exitStart);
      });
    }

    function addRadioMotion(timeline) {
      var radio = document.querySelector('#celestial .project-featured');
      var heading = document.querySelector('#celestial .section-heading');
      if (heading) phaseForScene(timeline, 'radio', [heading], { opacity: 0, x: 0, y: 24 });
      if (radio) {
        var interval = intervals.radio;
        var enterDuration = (interval[1] - interval[0]) * .25;
        var exitDuration = (interval[1] - interval[0]) * .20;
        gsapSet(radio, { opacity: 0, x: 0, y: 82 });
        timeline.to(radio, { opacity: 1, y: -6, duration: enterDuration * .84, ease: 'power3.out' }, 0);
        timeline.to(radio, { y: 0, duration: enterDuration * .16, ease: 'power2.out' }, enterDuration * .84);
        timeline.to(radio, { opacity: 0, y: -24, duration: exitDuration, ease: 'power2.in' }, interval[1] - exitDuration);
      }
    }

    function addToolsMotion(timeline) {
      var heading = document.querySelector('#story-tools .tools-heading');
      var task = document.querySelector('#story-tools [data-gsap-reveal=\"right\"]');
      var code = document.querySelector('#story-tools [data-gsap-reveal=\"left\"]');
      if (heading) phaseForScene(timeline, 'tools', [heading], { opacity: 0, x: 0, y: 28 });
      var interval = intervals.tools;
      var width = interval[1] - interval[0];
      var overlap = Math.min(.04, width * .2);
      var enterStart = interval[0] - overlap;
      var enterDuration = width * .25 + overlap;
      var exitStart = interval[1] - width * .2;
      var exitDuration = width * .2;
      [[task, 132], [code, -132]].forEach(function (entry) {
        if (!entry[0]) return;
        gsapSet(entry[0], { opacity: 0, x: entry[1], y: 0 });
        timeline.to(entry[0], { opacity: 1, x: 0, duration: enterDuration, ease: 'power3.out' }, enterStart);
        timeline.to(entry[0], { opacity: 0, x: 0, y: -22, duration: exitDuration, ease: 'power2.in' }, exitStart);
      });
    }

    function addWorkbenchMotion(timeline) {
      var beats = Array.from(document.querySelectorAll('#about [data-gsap-about]'));
      var card = document.querySelector('#about [data-gsap-about-card=\"right\"]');
      var interval = intervals.workbench;
      var width = interval[1] - interval[0];
      var sequence = width * .40;
      var step = sequence / Math.max(1, beats.length);
      beats.forEach(function (beat, index) {
        gsapSet(beat, { opacity: 0, x: 0, y: 18 });
        timeline.to(beat, { opacity: 1, y: 0, duration: step, ease: 'power3.out' }, interval[0] + index * step);
      });
      if (card) {
        gsapSet(card, { opacity: 0, x: 132, y: 0 });
        timeline.to(card, { opacity: 1, x: 0, duration: sequence, ease: 'power3.out' }, interval[0]);
      }
      var exitDuration = width * .20;
      var exitStart = interval[1] - exitDuration;
      beats.concat(card ? [card] : []).forEach(function (element) {
        timeline.to(element, { opacity: 0, x: 0, y: -22, duration: exitDuration, ease: 'power2.in' }, exitStart);
      });
    }

    function addSimpleScene(timeline, sceneName, selector, fromVars) {
      var element = document.querySelector(selector);
      if (element) phaseForScene(timeline, sceneName, [element], fromVars);
    }

    function buildTimeline(zoneName) {
      var timeline = gsap.timeline();
      var progressProxy = { value: 0 };
      timeline.to(progressProxy, { value: 1, duration: 1, ease: 'none' }, 0);
      if (zoneName === 'intro') {
        var hero = document.getElementById('library');
        gsapSet(hero, { opacity: 1, x: 0, y: 0 });
        timeline.to(hero, { opacity: 1, x: 0, y: 0, duration: .8, ease: 'none' }, 0);
        timeline.to(hero, { opacity: 0, y: -48, duration: .2, ease: 'power2.in' }, .8);
      } else if (zoneName === 'collection') {
        addRadioMotion(timeline);
        addToolsMotion(timeline);
        addWorkbenchMotion(timeline);
        addSimpleScene(timeline, 'team', '#ai-team .team-panel', { opacity: 0, x: 0, y: 32 });
        addSimpleScene(timeline, 'horizon', '#uncharted .uncharted-row', { opacity: 0, x: 0, y: 28 });
      } else {
        var contact = document.getElementById('connect');
        gsapSet(contact, { opacity: 0, x: 0, y: 34 });
        timeline.to(contact, { opacity: 1, x: 0, y: 0, duration: .25, ease: 'power3.out' }, 0);
        timeline.to(contact, { opacity: 1, x: 0, y: 0, duration: .75, ease: 'none' }, .25);
      }
      timelines.push(timeline);
      return timeline;
    }

    function syncAccessibility(sceneName) {
      var focused = document.activeElement && document.activeElement.closest
        ? document.activeElement.closest('[data-story-scene]') : null;
      if (focused && focused.dataset.storyScene !== sceneName) previousFocusedScene = focused;
      else if (!focused || focused.dataset.storyScene === sceneName) previousFocusedScene = null;
      var retained = previousFocusedScene;
      sceneElements().forEach(function (scene) {
        if (!sceneAttributes.has(scene)) {
          sceneAttributes.set(scene, {
            aria: { present: scene.hasAttribute('aria-hidden'), value: scene.getAttribute('aria-hidden') },
            inert: { present: scene.hasAttribute('inert'), value: scene.getAttribute('inert') }
          });
        }
        var visible = scene.dataset.storyScene === sceneName || scene === retained;
        scene.classList.toggle('story-focus-retained', scene === retained && scene.dataset.storyScene !== sceneName);
        scene.inert = !visible;
        if (visible) scene.removeAttribute('aria-hidden');
        else scene.setAttribute('aria-hidden', 'true');
      });
    }

    function sceneZone(sceneName) {
      if (sceneName === 'intro' || sceneName === 'contact') return sceneName;
      return 'collection';
    }

    function syncControls(sceneName) {
      var activeZone = sceneZone(sceneName);
      var focused = document.activeElement && document.activeElement.closest
        ? document.activeElement.closest('[data-story-controls]') : null;
      if (focused && focused.closest('.story-stage') && focused.closest('.story-stage').dataset.storyStage !== activeZone) retainedFocusedControls = focused;
      else if (!focused || focused === retainedFocusedControls || (focused.closest('.story-stage') && focused.closest('.story-stage').dataset.storyStage === activeZone)) retainedFocusedControls = null;
      var retained = retainedFocusedControls;
      document.querySelectorAll('[data-story-controls]').forEach(function (controls) {
        if (!controlAttributes.has(controls)) {
          controlAttributes.set(controls, {
            aria: { present: controls.hasAttribute('aria-hidden'), value: controls.getAttribute('aria-hidden') },
            inert: { present: controls.hasAttribute('inert'), value: controls.getAttribute('inert') }
          });
        }
        var stage = controls.closest('.story-stage');
        var visible = (stage && stage.dataset.storyStage === activeZone) || controls === retained;
        controls.inert = !visible;
        if (visible) controls.removeAttribute('aria-hidden');
        else controls.setAttribute('aria-hidden', 'true');
      });
    }

    function sceneFor(zoneName, progress) {
      return zoneName === 'collection' ? model.sample(zoneName, progress) : model.sample(zoneName, progress);
    }

    function updateStatus(sceneName) {
      var index = sceneOrder.indexOf(sceneName);
      if (index < 0) return;
      document.querySelectorAll('[data-story-status]').forEach(function (status) {
        status.textContent = 'Scene ' + (index + 1) + ' of ' + sceneOrder.length;
      });
      document.querySelectorAll('[data-story-prev]').forEach(function (button) { button.disabled = index === 0; });
      document.querySelectorAll('[data-story-next]').forEach(function (button) { button.disabled = index === sceneOrder.length - 1; });
    }

    function setZoneState(zoneName, progress) {
      var sample = sceneFor(zoneName, progress);
      currentScene = sample.scene;
      syncAccessibility(currentScene);
      syncControls(currentScene);
      updateStatus(currentScene);
      var introStart = triggers.filter(function (item) { return item.name === 'collection'; })[0];
      var contactStart = triggers.filter(function (item) { return item.name === 'contact'; })[0];
      if (introStart && contactStart && tints.intro && tints.collection && tints.contact) {
        var tone = model.tone(window.scrollY, introStart.trigger.start, contactStart.trigger.start, stageHeight);
        gsapSet(tints.intro, { opacity: tone.intro });
        gsapSet(tints.collection, { opacity: .78 * (1 - Math.max(tone.intro, tone.contact)) });
        gsapSet(tints.contact, { opacity: tone.contact });
        if (typeof toneCallback === 'function') {
          toneCallback({
            intro: tone.intro, contact: tone.contact, light: tone.light,
            zone: zoneName, scene: sample.scene, progress: progress,
            workbench: sample.scene === 'workbench' ? model.workbenchPhase(sample.localProgress) : null
          });
        }
      }
    }

    function zoneStateAtScroll() {
      if (!triggers.length) return;
      var y = window.scrollY;
      var selected = triggers[triggers.length - 1];
      for (var i = 0; i < triggers.length; i += 1) {
        if (y <= triggers[i].trigger.end) { selected = triggers[i]; break; }
      }
      var progress = clamp((y - selected.trigger.start) / Math.max(1, selected.trigger.end - selected.trigger.start));
      setZoneState(selected.name, progress);
    }

    function progressAtScroll(y) {
      if (!triggers.length) return null;
      var selected = triggers[triggers.length - 1];
      for (var i = 0; i < triggers.length; i += 1) {
        if (y <= triggers[i].trigger.end) { selected = triggers[i]; break; }
      }
      return {
        zone: selected.name,
        progress: clamp((y - selected.trigger.start) / Math.max(1, selected.trigger.end - selected.trigger.start)),
        scene: currentScene
      };
    }

    function flowDestinationAtScroll() {
      var targetY = Math.max(headerHeight(), window.innerHeight * .56);
      var best = null;
      var bestDistance = Infinity;
      sceneElements().forEach(function (scene) {
        var rect = scene.getBoundingClientRect();
        var center = rect.top + Math.min(rect.height, window.innerHeight) * .5;
        var distance = Math.abs(center - targetY);
        if (distance < bestDistance) { bestDistance = distance; best = scene; }
      });
      return best ? best.id : null;
    }

    function scrollToProgress(zoneName, progress, focusTarget, instant) {
      var entry = triggers.filter(function (item) { return item.name === zoneName; })[0];
      if (!entry) return false;
      var targetY = entry.trigger.start + clamp(progress) * (entry.trigger.end - entry.trigger.start);
      var targetScene = model.sample(zoneName, progress).scene;
      var token = ++navigationToken;
      window.scrollTo({ top: targetY, behavior: instant || reduced.matches ? 'instant' : 'smooth' });
      function settle(frames) {
        if (destroyed || token !== navigationToken) return;
        var y = window.scrollY;
        zoneStateAtScroll();
        var reached = Math.abs(y - targetY) <= 3;
        if (!focusTarget || (reached && currentScene === targetScene)) {
          if (focusTarget) {
            focusTarget.focus({ preventScroll: true });
            syncAccessibility(currentScene);
            syncControls(currentScene);
          }
          return;
        }
        if (frames >= 240) return;
        window.requestAnimationFrame(function () { settle(frames + 1); });
      }
      window.requestAnimationFrame(function () { settle(0); });
      return true;
    }

    function navigate(id, options) {
      options = options || {};
      if (!active || !model) return false;
      var anchorId = sceneDestinations[id] || String(id || '').replace(/^#/, '');
      var anchor = model.anchorProgress(anchorId);
      var target = document.getElementById(anchorId);
      if (!anchor || !target) return false;
      return scrollToProgress(anchor.zone, anchor.progress, options.focus === false ? null : target, options.instant === true);
    }

    function navigateByStep(direction) {
      var index = sceneOrder.indexOf(currentScene);
      var destinationIndex = Math.max(0, Math.min(sceneOrder.length - 1, index + direction));
      return navigate(sceneOrder[destinationIndex], { focus: true, instant: false });
    }

    function onControlsClick(event) {
      var button = event.target.closest && event.target.closest('[data-story-prev], [data-story-next]');
      if (!button || !active) return;
      event.preventDefault();
      navigateByStep(button.hasAttribute('data-story-next') ? 1 : -1);
    }

    function preserveElementTop(element, top, attempt) {
      if (!element) return;
      attempt = attempt || 0;
      window.requestAnimationFrame(function () {
        if (destroyed || !element.isConnected) return;
        var delta = element.getBoundingClientRect().top - top;
        if (Math.abs(delta) > 1) window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' });
        if (attempt < 2) preserveElementTop(element, top, attempt + 1);
      });
    }

    function focusAnchorForScene(sceneName) {
      var scene = document.querySelector('[data-story-scene="' + sceneName + '"]');
      return document.activeElement && scene && scene.contains(document.activeElement)
        ? document.activeElement
        : scene && (scene.querySelector('h1, h2') || scene);
    }

    function onDetailsToggle(event) {
      var details = event.target;
      if (!details || details.tagName !== 'DETAILS' || !details.open || !details.closest('[data-story-scene="workbench"]')) return;
      var pending = pendingDetailsAnchor && pendingDetailsAnchor.details === details ? pendingDetailsAnchor : null;
      pendingDetailsAnchor = null;
      useNativeFlow(details.querySelector('summary'), true, pending && pending.top);
    }

    function onSummaryClick(event) {
      var summary = event.target.closest && event.target.closest('#about details.story > summary');
      var details = summary && summary.parentElement;
      if (!details || details.open || !active) return;
      pendingDetailsAnchor = { details: details, top: summary.getBoundingClientRect().top };
    }

    function onScroll() {
      if (scheduled || destroyed || !active) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        if (active) zoneStateAtScroll();
      });
    }

    function onFocusChange() {
      if (!active || focusScheduled || destroyed) return;
      focusScheduled = true;
      window.requestAnimationFrame(function () {
        focusScheduled = false;
        if (active) zoneStateAtScroll();
      });
    }

    function activate() {
      if (active || destroyed || permanentFlow || !capacity()) return false;
      var header = headerHeight();
      stageHeight = Math.round(window.innerHeight - header);
      announceMode(true);
      rootStageHeight = root.style.getPropertyValue('--story-stage-height');
      root.classList.add('story-active', 'story-eligible');
      root.style.setProperty('--story-stage-height', stageHeight + 'px');
      zoneNames.forEach(function (name) {
        var zone = document.querySelector('[data-zone=\"' + name + '\"]');
        if (zone) {
          rememberStyle(zone, zoneStyleAttributes);
          if (name === 'contact') zone.style.removeProperty('height');
          else zone.style.height = Math.round(stageHeight * budgets[name]) + 'px';
        }
      });
      Object.keys(tints).forEach(function (name) {
        if (tints[name]) rememberStyle(tints[name], tintStyleAttributes);
      });
      try {
        gsap.registerPlugin(ScrollTrigger);
        zoneNames.forEach(function (name) {
          var zone = document.querySelector('[data-zone=\"' + name + '\"]');
          var stage = zone && zone.querySelector('.story-stage');
          if (!zone || !stage) throw new Error('Missing story stage: ' + name);
          var timeline = buildTimeline(name);
          var trigger = ScrollTrigger.create({
            id: 'profile-story-' + name,
            trigger: zone,
            pin: stage,
            pinSpacing: name === 'contact',
            start: function () { return 'top ' + Math.round(headerHeight()) + 'px'; },
            end: function () { return '+=' + Math.round(stageHeight * budgets[name]); },
            animation: timeline,
            scrub: .6,
            invalidateOnRefresh: true,
            onUpdate: function (self) { setZoneState(name, self.progress); }
          });
          triggers.push({ name: name, trigger: trigger, timeline: timeline });
        });
        active = true;
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        ScrollTrigger.refresh();
        zoneStateAtScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return true;
      } catch (error) {
        deactivate();
        root.classList.remove('story-eligible');
        return false;
      }
    }

    function refreshNow() {
      scheduled = false;
      if (destroyed || permanentFlow) return;
      var wasActive = active;
      var progressSnapshot = wasActive ? progressAtScroll(window.scrollY) : null;
      var flowAnchor = !wasActive && !window.location.hash && window.scrollY > headerHeight() + 20 ? flowDestinationAtScroll() : null;
      var flowAnchorElement = null;
      var flowAnchorTop = 0;
      if (wasActive && progressSnapshot) {
        flowAnchorElement = focusAnchorForScene(progressSnapshot.scene);
        flowAnchorTop = flowAnchorElement ? flowAnchorElement.getBoundingClientRect().top : 0;
      }
      var fits = capacity();
      if (active && fits && viewportWidth === window.innerWidth && viewportHeight === window.innerHeight) {
        ScrollTrigger.refresh();
        zoneStateAtScroll();
        return;
      }
      if (active) {
        window.removeEventListener('scroll', onScroll);
        deactivate();
      }
      root.classList.toggle('story-eligible', fits);
      if (fits && activate()) {
        if (progressSnapshot) scrollToProgress(progressSnapshot.zone, progressSnapshot.progress, null, true);
        else if (flowAnchor) navigate(flowAnchor, { focus: false, instant: true });
      } else if (!fits && flowAnchorElement) {
        preserveElementTop(flowAnchorElement, flowAnchorTop);
      }
    }

    function scheduleRefresh() {
      if (scheduled || destroyed) return;
      scheduled = true;
      window.requestAnimationFrame(refreshNow);
    }

    function preferenceChanged() { refreshNow(); }
    function isActive() { return active; }
    function refresh() {
      if (active && ScrollTrigger) ScrollTrigger.refresh();
      else scheduleRefresh();
    }
    function useNativeFlow(preserveElement, focusElement, preservedTop) {
      var element = preserveElement || (active ? focusAnchorForScene(currentScene) : null);
      var elementTop = typeof preservedTop === 'number' ? preservedTop : (element ? element.getBoundingClientRect().top : 0);
      permanentFlow = true;
      navigationToken += 1;
      window.removeEventListener('scroll', onScroll);
      deactivate();
      root.classList.remove('story-eligible');
      if (focusElement && element && typeof element.focus === 'function') element.focus({ preventScroll: true });
      preserveElementTop(element, elementTop);
    }
    function destroy() {
      if (destroyed) return;
      window.removeEventListener('resize', scheduleRefresh);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pageshow', scheduleRefresh);
      document.removeEventListener('toggle', onDetailsToggle, true);
      document.removeEventListener('click', onSummaryClick, true);
      document.removeEventListener('click', onControlsClick);
      document.removeEventListener('focusin', onFocusChange);
      document.removeEventListener('focusout', onFocusChange);
      reduced.removeEventListener('change', preferenceChanged);
      forcedColors.removeEventListener('change', preferenceChanged);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {});
      deactivate();
      root.classList.remove('story-eligible', 'story-measuring');
      destroyed = true;
    }

    window.addEventListener('resize', scheduleRefresh, { passive: true });
    window.addEventListener('pageshow', scheduleRefresh);
    reduced.addEventListener('change', preferenceChanged);
    forcedColors.addEventListener('change', preferenceChanged);
    document.addEventListener('toggle', onDetailsToggle, true);
    document.addEventListener('click', onSummaryClick, true);
    document.addEventListener('click', onControlsClick);
    document.addEventListener('focusin', onFocusChange);
    document.addEventListener('focusout', onFocusChange);
    window.addEventListener('load', scheduleRefresh, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleRefresh);
    refreshNow();
    return { isActive: isActive, navigate: navigate, refresh: refresh, destroy: destroy, useNativeFlow: useNativeFlow };
  }

  window.ProfileStory = {
    init: function (options) {
      options = options || {};
      if (typeof options.onTone === 'function') toneCallback = options.onTone;
      if (typeof options.onMode === 'function') modeCallback = options.onMode;
      if (!instance) instance = createController();
      else if (typeof options.onTone === 'function' || typeof options.onMode === 'function') instance.refresh();
      return instance;
    }
  };
}(window, document));
