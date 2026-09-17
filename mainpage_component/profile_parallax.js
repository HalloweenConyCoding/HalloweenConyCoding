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

  function pageProgress(scrollY, scrollHeight, viewportHeight) {
    var y = Number(scrollY);
    var height = Number(scrollHeight);
    var viewport = Number(viewportHeight);
    if (!Number.isFinite(y) || !Number.isFinite(height) || !Number.isFinite(viewport) || height <= viewport) return 0.5;
    return clamp(y / (height - viewport), 0, 1);
  }

  function scrollOffset(scrollY, viewportHeight, speed, direction, limit) {
    var y = Number(scrollY);
    var viewport = Number(viewportHeight);
    var safeSpeed = Number(speed);
    var safeLimit = Number(limit);
    if (!Number.isFinite(y) || !Number.isFinite(viewport) || viewport <= 0 || !Number.isFinite(safeSpeed)) return 0;
    if (!Number.isFinite(safeLimit) || safeLimit < 0) safeLimit = Math.abs(safeSpeed) * 4;
    var safeDirection = Number(direction) < 0 ? -1 : 1;
    return clamp((y / viewport) * Math.abs(safeSpeed) * safeDirection, -safeLimit, safeLimit);
  }

  global.ProfileParallax = Object.freeze({ sectionProgress: sectionProgress, pageProgress: pageProgress, offsetFor: offsetFor, scrollOffset: scrollOffset });
}(window));
