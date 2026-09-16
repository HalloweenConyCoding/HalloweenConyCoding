/* Small, dependency-free helpers for the homepage's decorative depth layers. */
(function (global) {
  'use strict';

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function sectionProgress(metrics) {
    var top = Number(metrics.top);
    var height = Number(metrics.height);
    var viewportHeight = Number(metrics.viewportHeight);
    if (!Number.isFinite(top) || !Number.isFinite(height) || !Number.isFinite(viewportHeight) || height <= 0 || viewportHeight <= 0) return 0.5;
    return clamp((viewportHeight - top) / (height + viewportHeight), 0, 1);
  }

  function offsetFor(progress, amplitude, direction) {
    var safeProgress = Number.isFinite(Number(progress)) ? clamp(Number(progress), 0, 1) : 0.5;
    var safeAmplitude = Number.isFinite(Number(amplitude)) ? Number(amplitude) : 0;
    var safeDirection = Number(direction) < 0 ? -1 : 1;
    var offset = (safeProgress - 0.5) * safeAmplitude * safeDirection;
    return offset === 0 ? 0 : offset;
  }

  global.ProfileParallax = Object.freeze({ sectionProgress: sectionProgress, offsetFor: offsetFor });
}(window));
