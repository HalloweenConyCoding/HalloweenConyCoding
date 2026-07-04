/* ============================================
   Shared cursor-follow spotlight
   Sets --mx / --my (percent) on the hovered .spotlight-card so a CSS radial
   glow can track the pointer. Event-delegated (survives re-renders, no per-card
   listeners), reduced-motion aware, transform-free.
   Pair with the .spotlight-card rules in style.css. Set --spot-color (and
   optionally --spot-radius) per card to tint the glow.
   ============================================ */
(function () {
  if (typeof document === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('pointermove', function (event) {
    const card = event.target && event.target.closest ? event.target.closest('.spotlight-card') : null;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    card.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width) * 100 + '%');
    card.style.setProperty('--my', ((event.clientY - rect.top) / rect.height) * 100 + '%');
  }, { passive: true });
})();
