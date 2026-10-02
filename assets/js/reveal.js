/**
 * Scroll reveal for the homepage.
 *
 * Elements marked with [data-reveal] (or auto-tagged section headings and
 * top-level blocks) fade/slide in the first time they enter the viewport.
 * Children of a [data-reveal-group] container are revealed with a small
 * stagger. Falls back to showing everything immediately when the user
 * prefers reduced motion or IntersectionObserver is unavailable.
 */
(function () {
  'use strict';

  // Tells the inline arming script in the page that this file loaded, so its
  // failsafe timeout leaves .reveal-armed in place.
  window.__revealLoaded = true;

  var REVEAL_ATTR = 'data-reveal';
  var STAGGER_MS = 110;
  var MAX_DELAY = 440;

  function collect() {
    // Children of group containers reveal one by one.
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        if (child.hasAttribute(REVEAL_ATTR)) return;
        child.setAttribute(REVEAL_ATTR, '');
        var delay = Math.min(i * STAGGER_MS, MAX_DELAY);
        if (delay > 0) child.style.setProperty('--reveal-delay', delay + 'ms');
      });
    });

    // Section headings (News / Experience / ...) and top-level blocks.
    document
      .querySelectorAll('.page__content > h2, .page__content > p, .page__content > ul')
      .forEach(function (el) {
        el.setAttribute(REVEAL_ATTR, '');
      });

    return Array.prototype.slice.call(
      document.querySelectorAll('[' + REVEAL_ATTR + ']')
    );
  }

  function init() {
    var targets = collect();
    if (!targets.length) return;

    var reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
