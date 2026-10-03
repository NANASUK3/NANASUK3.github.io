/*
 * Small site-wide helpers.
 *
 * The theme used to bundle jQuery and several plugins for features that this
 * site does not use. Keep the only global layout adjustment here and use
 * browser APIs so the homepage does not need a runtime dependency.
 */
(function () {
  'use strict';

  function init() {
    var footer = document.querySelector('.page__footer');
    if (!footer) return;

    var frame = 0;

    function updateFooterSpace() {
      frame = 0;
      var styles = window.getComputedStyle(footer);
      var marginTop = parseFloat(styles.marginTop) || 0;
      var marginBottom = parseFloat(styles.marginBottom) || 0;
      document.body.style.marginBottom =
        footer.offsetHeight + marginTop + marginBottom + 'px';
    }

    function scheduleFooterUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateFooterSpace);
    }

    updateFooterSpace();
    window.addEventListener('resize', scheduleFooterUpdate, { passive: true });

    if ('ResizeObserver' in window) {
      new ResizeObserver(scheduleFooterUpdate).observe(footer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
