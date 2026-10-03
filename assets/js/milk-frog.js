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

    var frames = {
      idle: ['idle-0.webp', 'idle-1.webp', 'idle-2.webp', 'idle-3.webp'],
      greet: ['greet-0.webp', 'greet-1.webp', 'greet-2.webp', 'greet-3.webp', 'greet-4.webp'],
      laugh: ['laugh-0.webp', 'laugh-1.webp', 'laugh-2.webp', 'laugh-3.webp', 'laugh-4.webp'],
      working: ['working-0.webp']
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
      var id = ++sequenceId;
      var sequence = frames.idle;
      var index = 0;

      if (motionQuery.matches) {
        show(sequence[0]);
        return;
      }

      function tick() {
        if (id !== sequenceId || document.hidden) return;
        show(sequence[index]);
        index = (index + 1) % sequence.length;
        timers.push(window.setTimeout(tick, 260));
      }

      tick();
    }

    function play(name) {
      var sequence = frames[name];
      if (!sequence) return;

      clearTimers();
      var id = ++sequenceId;
      var index = 0;

      if (motionQuery.matches || sequence.length === 1) {
        show(sequence[0]);
        if (name !== 'working') {
          timers.push(window.setTimeout(startIdle, 850));
        }
        return;
      }

      function tick() {
        if (id !== sequenceId || document.hidden) return;
        show(sequence[index]);
        index += 1;
        if (index < sequence.length) {
          timers.push(window.setTimeout(tick, 135));
        } else {
          timers.push(window.setTimeout(startIdle, 420));
        }
      }

      tick();
    }

    function handleEnter() {
      preload(frames.greet);
      if (motionQuery.matches || hoverTimer !== null) return;
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
      preload(frames.greet);
    });
    button.addEventListener('click', function () {
      preload(frames.laugh);
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

    preload(frames.idle.slice(1));
    startIdle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMilkFrog);
  } else {
    initMilkFrog();
  }
})();
