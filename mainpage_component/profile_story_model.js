/* Pure progress model for the profile's scroll-driven story. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ProfileStoryModel = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var scenes = [
    { name: 'radio', start: 0, end: .20 },
    { name: 'tools', start: .20, end: .40 },
    { name: 'workbench', start: .40, end: .68 },
    { name: 'team', start: .68, end: .88 },
    { name: 'horizon', start: .88, end: 1 }
  ];
  var anchors = {
    library: { zone: 'intro', progress: .4 },
    celestial: { zone: 'collection', progress: .1 },
    'story-tools': { zone: 'collection', progress: .25 },
    about: { zone: 'collection', progress: .53 },
    'ai-team': { zone: 'collection', progress: .74 },
    uncharted: { zone: 'collection', progress: .93 },
    connect: { zone: 'contact', progress: .3 }
  };

  function clamp(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.min(1, Math.max(0, number));
  }

  function sample(zone, progress) {
    var p = clamp(progress);
    if (zone === 'intro') return { scene: 'intro', phase: p < .8 ? 'hold' : 'exit', localProgress: p };
    if (zone === 'contact') return { scene: 'contact', phase: p < .25 ? 'enter' : 'hold', localProgress: p };
    if (zone !== 'collection') throw new RangeError('Unknown story zone: ' + zone);

    var scene = scenes[scenes.length - 1];
    for (var i = 0; i < scenes.length; i += 1) {
      if (p >= scenes[i].start && (p < scenes[i].end || scenes[i].end === 1)) {
        scene = scenes[i];
        break;
      }
    }
    var localProgress = Math.round(clamp((p - scene.start) / (scene.end - scene.start)) * 1000000) / 1000000;
    return {
      scene: scene.name,
      phase: localProgress < .25 ? 'enter' : localProgress < .8 ? 'hold' : 'exit',
      localProgress: localProgress
    };
  }

  function workbenchPhase(progress) {
    var p = clamp(progress);
    if (p < .4) return { phase: 'enter', localProgress: Math.round(p / .4 * 1000000) / 1000000 };
    if (p < .8) return { phase: 'hold', localProgress: Math.round((p - .4) / .4 * 1000000) / 1000000 };
    return { phase: 'exit', localProgress: Math.round((p - .8) / .2 * 1000000) / 1000000 };
  }

  function smoothstep(value) {
    var t = clamp(value);
    return t * t * (3 - 2 * t);
  }

  function tone(scrollY, collectionStart, contactStart, height) {
    var h = Math.max(1, Number(height) || 1);
    var introProgress = (Number(scrollY) - (Number(collectionStart) - .35 * h)) / h;
    var contactProgress = (Number(scrollY) - (Number(contactStart) - .35 * h)) / h;
    var intro = 1 - smoothstep(introProgress);
    var contact = smoothstep(contactProgress);
    return { intro: intro, contact: contact, light: Math.max(intro, contact) };
  }

  function headerTheme(light, previous) {
    var value = clamp(light);
    if (value >= .65) return 'paper';
    if (value <= .35) return 'night';
    if (previous === 'paper' || previous === 'night') return previous;
    return value >= .5 ? 'paper' : 'night';
  }

  function eligible(width, height, maxSceneHeight, reduced, forcedColors) {
    return Number(width) >= 1024 && Number(height) >= 640 &&
      Number(maxSceneHeight) <= Number(height) - 24 && !reduced && !forcedColors;
  }

  function anchorProgress(id) {
    var target = anchors[String(id || '').replace(/^#/, '')];
    return target ? { zone: target.zone, progress: target.progress } : null;
  }

  return { sample: sample, workbenchPhase: workbenchPhase, tone: tone, headerTheme: headerTheme, eligible: eligible, anchorProgress: anchorProgress };
}));
