(function () {
  'use strict';

  function initMilkFrog() {
    var pet = document.querySelector('[data-milk-frog-pet]');
    if (!pet) return;

    var button = pet.querySelector('.milk-frog-pet__button');
    var image = pet.querySelector('.milk-frog-pet__image');
    var base = pet.getAttribute('data-asset-base') || '/images/milk-frog/';
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var timers = [];
    var hoverTimer = null;
    var sequenceId = 0;
    var preloaded = Object.create(null);

    var sequences = {
      idle: { animated: 'idle-24.webp', fallback: 'idle-0.webp', duration: 0 },
      greet: { animated: 'greet-24.webp', fallback: 'greet-0.webp', duration: 1008 },
      laugh: { animated: 'laugh-24.webp', fallback: 'laugh-0.webp', duration: 1008 },
      working: { animated: null, fallback: 'working-0.webp', duration: 0 }
    };

    function source(file) {
      return base + file;
    }

    function clearTimers() {
      timers.forEach(function (timer) { window.clearTimeout(timer); });
      timers = [];
      if (hoverTimer !== null) {
        window.clearTimeout(hoverTimer);
        hoverTimer = null;
      }
    }

    function preload(sequence) {
      sequence.forEach(function (file) {
        if (preloaded[file]) return;
        var imageLoader = new Image();
        imageLoader.decoding = 'async';
        imageLoader.src = source(file);
        preloaded[file] = imageLoader;
      });
    }

    function show(file) {
      image.src = source(file);
    }

    function startIdle() {
      clearTimers();
      sequenceId += 1;

      if (motionQuery.matches || !sequences.idle.animated) {
        show(sequences.idle.fallback);
      } else {
        preload([sequences.idle.animated]);
        show(sequences.idle.animated);
      }
    }

    function play(name) {
      var sequence = sequences[name];
      if (!sequence) return;

      clearTimers();
      sequenceId += 1;

      if (motionQuery.matches || !sequence.animated) {
        show(sequence.fallback);
        if (sequence.duration) timers.push(window.setTimeout(startIdle, sequence.duration));
        return;
      }

      preload([sequence.animated]);
      show(sequence.animated);
      if (sequence.duration) timers.push(window.setTimeout(startIdle, sequence.duration));
    }

    function handleEnter() {
      if (motionQuery.matches) return;
      preload([sequences.greet.animated]);
      if (hoverTimer !== null) return;
      hoverTimer = window.setTimeout(function () {
        hoverTimer = null;
        play('greet');
      }, 280);
    }

    function handleLeave() {
      if (hoverTimer !== null) {
        window.clearTimeout(hoverTimer);
        hoverTimer = null;
      }
    }

    button.addEventListener('pointerenter', handleEnter);
    button.addEventListener('pointerleave', handleLeave);
    button.addEventListener('focus', function () {
      if (motionQuery.matches) return;
      preload([sequences.greet.animated]);
    });
    button.addEventListener('click', function () {
      if (!motionQuery.matches) preload([sequences.laugh.animated]);
      play('laugh');
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearTimers();
        sequenceId += 1;
      } else {
        startIdle();
      }
    });

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', startIdle);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(startIdle);
    }

    if (!motionQuery.matches) preload([sequences.idle.animated]);
    startIdle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMilkFrog);
  } else {
    initMilkFrog();
  }
})();
