(function () {
  'use strict';

  function initMilkFrog() {
    var pet = document.querySelector('[data-milk-frog-pet]');
    if (!pet) return;

    var button = pet.querySelector('.milk-frog-pet__button');
    var image = pet.querySelector('.milk-frog-pet__image');
    if (!button || !image) return;

    var base = pet.getAttribute('data-asset-base') || '/images/milk-frog/';
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var idleFile = 'idle-0.webp';
    var laughFile = motionQuery.matches ? 'laugh-0.webp' : 'laugh-60.webp';
    var animationTimer = null;
    var preloaded = Object.create(null);
    var animationId = 0;

    function source(file) {
      return base.replace(/\/$/, '') + '/' + file;
    }

    function preload(file) {
      if (preloaded[file]) return;

      var loader = new Image();
      loader.decoding = 'async';
      loader.src = source(file);
      preloaded[file] = loader;
    }

    function showIdle() {
      image.src = source(idleFile);
    }

    function stopAnimation() {
      if (animationTimer !== null) {
        window.clearTimeout(animationTimer);
        animationTimer = null;
      }
      animationId += 1;
      showIdle();
    }

    function playLaugh() {
      var currentId = ++animationId;
      var duration = motionQuery.matches ? 850 : 1000;

      if (animationTimer !== null) {
        window.clearTimeout(animationTimer);
        animationTimer = null;
      }

      preload(laughFile);

      // Reset to the static pose first so a second click reliably restarts
      // the animated WebP even when the previous click used the same URL.
      image.src = source(idleFile);
      window.requestAnimationFrame(function () {
        if (currentId !== animationId) return;
        image.src = source(laughFile);
      });

      animationTimer = window.setTimeout(function () {
        if (currentId !== animationId) return;
        animationTimer = null;
        showIdle();
      }, duration);
    }

    function preloadLaugh() {
      preload(motionQuery.matches ? 'laugh-0.webp' : 'laugh-60.webp');
    }

    button.addEventListener('pointerenter', preloadLaugh, { passive: true });
    button.addEventListener('pointerdown', preloadLaugh, { passive: true });
    button.addEventListener('focus', preloadLaugh);
    button.addEventListener('click', playLaugh);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAnimation();
      }
    });

    function updateReducedMotion() {
      laughFile = motionQuery.matches ? 'laugh-0.webp' : 'laugh-60.webp';
      if (animationTimer !== null) stopAnimation();
    }

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', updateReducedMotion);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(updateReducedMotion);
    }

    // Keep the first paint static and warm the click asset while the page is idle.
    showIdle();
    window.setTimeout(preloadLaugh, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMilkFrog);
  } else {
    initMilkFrog();
  }
})();
