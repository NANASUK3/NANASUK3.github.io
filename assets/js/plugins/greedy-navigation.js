/*
 * Greedy navigation, implemented with browser APIs.
 *
 * The old jQuery version recursively called updateNav() while the logo itself
 * was wider than the reserved control area on narrow screens. This version
 * moves only available items and stops when the logo is the last visible item.
 */
(function () {
  'use strict';

  var nav = document.getElementById('site-nav');
  if (!nav) return;

  var button = nav.querySelector('button');
  var visibleLinks = nav.querySelector('.visible-links');
  var hiddenLinks = nav.querySelector('.hidden-links');
  if (!button || !visibleLinks || !hiddenLinks) return;

  var updateFrame = 0;
  var menuOpen = false;
  var logoClass = 'masthead__menu-item--lg';

  if (!hiddenLinks.id) hiddenLinks.id = 'site-nav-overflow';
  button.type = 'button';
  button.setAttribute('aria-controls', hiddenLinks.id);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Open navigation');

  function getContentWidth() {
    var styles = window.getComputedStyle(nav);
    var padding =
      parseFloat(styles.paddingLeft || '0') +
      parseFloat(styles.paddingRight || '0');
    return Math.max(0, nav.getBoundingClientRect().width - padding);
  }

  function getMovableItems() {
    return Array.prototype.filter.call(
      visibleLinks.children,
      function (item) {
        return !item.classList.contains(logoClass);
      }
    );
  }

  function isOverflowing(availableWidth) {
    return visibleLinks.getBoundingClientRect().width > availableWidth + 0.5;
  }

  function moveLastToHidden() {
    var items = getMovableItems();
    if (!items.length) return false;
    hiddenLinks.insertBefore(items[items.length - 1], hiddenLinks.firstChild);
    return true;
  }

  function restoreHiddenItems() {
    while (hiddenLinks.firstElementChild) {
      visibleLinks.appendChild(hiddenLinks.firstElementChild);
    }
  }

  function setMenuOpen(open) {
    menuOpen = Boolean(open && hiddenLinks.children.length);
    hiddenLinks.classList.toggle('hidden', !menuOpen);
    button.classList.toggle('close', menuOpen);
    button.setAttribute('aria-expanded', String(menuOpen));
    button.setAttribute('aria-label', menuOpen ? 'Close navigation' : 'Open navigation');
  }

  function updateNav() {
    updateFrame = 0;

    // Rebuild from the complete list so resize in either direction is stable.
    restoreHiddenItems();
    button.classList.add('hidden');
    setMenuOpen(false);

    var availableWidth = getContentWidth();
    while (isOverflowing(availableWidth) && moveLastToHidden()) {
      // Keep moving links until they fit or only the logo remains.
    }

    if (hiddenLinks.children.length) {
      button.classList.remove('hidden');
      availableWidth = Math.max(0, getContentWidth() - button.offsetWidth - 30);
      while (isOverflowing(availableWidth) && moveLastToHidden()) {
        // The menu button itself consumes part of the available width.
      }
    }

    button.setAttribute('count', String(hiddenLinks.children.length));
    if (!hiddenLinks.children.length) setMenuOpen(false);
  }

  function scheduleUpdate() {
    if (updateFrame) return;
    updateFrame = window.requestAnimationFrame(updateNav);
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  });

  hiddenLinks.addEventListener('click', function () {
    setMenuOpen(false);
  });

  document.addEventListener('click', function (event) {
    if (menuOpen && !nav.contains(event.target)) setMenuOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
      button.focus();
    }
  });

  window.addEventListener('resize', scheduleUpdate, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(nav);
  updateNav();
})();
