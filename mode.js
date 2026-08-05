/* mode.js — switches the site between the playable game view and the classic page.
   The classic page is what ships in the HTML, so crawlers and no-JS visitors always
   get the full document; the game is layered on top by script. */
(function () {
  'use strict';

  const STORE_KEY = 'afifi.portfolio.mode';
  const gameRoot    = document.getElementById('game-root');
  const classicRoot = document.getElementById('classic-root');
  if (!gameRoot || !classicRoot) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const listeners = [];
  let current = null;

  function stored() {
    try { return localStorage.getItem(STORE_KEY); } catch (_) { return null; }
  }

  function remember(mode) {
    try { localStorage.setItem(STORE_KEY, mode); } catch (_) { /* private mode */ }
  }

  /* Deep links to a real section (or a fresh visit under reduced-motion) should not
     drop someone into a game they didn't ask for. */
  function initialMode() {
    const saved = stored();
    if (saved === 'game' || saved === 'classic') return saved;
    if (reducedMotion) return 'classic';
    if (location.hash && location.hash !== '#hero' && document.querySelector(location.hash)) return 'classic';
    return 'game';
  }

  function apply(mode, opts) {
    if (mode !== 'game' && mode !== 'classic') return;
    const persist = !opts || opts.persist !== false;
    if (mode === current) return;
    current = mode;

    const playing = mode === 'game';
    document.body.classList.toggle('mode-game', playing);
    document.body.classList.toggle('mode-classic', !playing);

    gameRoot.hidden = !playing;
    classicRoot.hidden = playing;
    /* inert keeps the hidden view out of the tab order and the a11y tree without
       removing it from the document, so the markup stays indexable. */
    classicRoot.inert = playing;
    gameRoot.inert = !playing;

    if (persist) remember(mode);
    listeners.forEach(fn => { try { fn(mode); } catch (err) { console.error(err); } });
  }

  const Mode = {
    get current() { return current; },
    set: apply,
    toggle() { apply(current === 'game' ? 'classic' : 'game'); },
    /* Leave the game and land on a specific section of the page. */
    exitTo(hash) {
      apply('classic');
      requestAnimationFrame(() => {
        const el = hash && document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    },
    onChange(fn) { if (typeof fn === 'function') listeners.push(fn); },
    reducedMotion
  };

  window.PortfolioMode = Mode;

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-mode-switch]');
    if (!trigger) return;
    e.preventDefault();
    apply(trigger.dataset.modeSwitch);
  });

  apply(initialMode(), { persist: false });
}());
