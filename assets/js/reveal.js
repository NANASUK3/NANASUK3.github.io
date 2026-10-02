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

  /* ===== Anchor scrolling =====
     Same-page hash links reveal everything along the way first, then smooth
     scroll with the browser's native animation, so the landing section is
     fully visible on arrival. Runs in the capture phase to pre-empt the
     theme's own smooth-scroll plugin, which conflicts with per-step
     smoothing. */

  function revealInstantly(el) {
    el.classList.add('reveal-instant');
    el.classList.add('is-revealed');
    void el.offsetWidth;
    window.setTimeout(function () {
      el.classList.remove('reveal-instant');
    }, 50);
  }

  function revealInRange(fromY, toY) {
    var lo = Math.min(fromY, toY);
    var hi = Math.max(fromY, toY) + window.innerHeight * 1.2;
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var top = rect.top + window.scrollY;
      if (top <= hi && top + rect.height >= lo) revealInstantly(el);
    });
  }

  function targetPosition(target) {
    var margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    var y = target.getBoundingClientRect().top + window.scrollY - margin;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(y, max));
  }

  function jumpTo(target) {
    var targetY = targetPosition(target);
    var reduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    revealInRange(window.scrollY, targetY);
    window.scrollTo({ top: targetY, behavior: reduced ? 'auto' : 'smooth' });
  }

  function handleAnchorClick(event) {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    var link = event.target.closest('a[href*="#"]');
    if (!link) return;

    var url = new URL(link.href, location.href);
    if (url.hostname !== location.hostname) return;
    if (url.pathname.replace(/\/+$/, '') !== location.pathname.replace(/\/+$/, '')) return;

    var id = decodeURIComponent(url.hash.slice(1));
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();
    jumpTo(target);
    history.pushState(null, '', url.hash);
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

    // If the page loaded directly onto a hash target, make everything up to
    // and around it visible immediately instead of fading in.
    if (location.hash.length > 1) {
      var initialTarget = document.getElementById(
        decodeURIComponent(location.hash.slice(1))
      );
      if (initialTarget) {
        revealInRange(0, targetPosition(initialTarget) + window.innerHeight);
      }
    }
  }

  document.addEventListener('click', handleAnchorClick, true);
  window.addEventListener('hashchange', function () {
    revealInRange(
      window.scrollY - window.innerHeight,
      window.scrollY + window.innerHeight * 1.2
    );
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
