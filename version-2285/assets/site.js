
(function() {
  function initMobileNav() {
    const toggle = document.querySelector('[data-mobile-nav-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function() {
      nav.classList.toggle('hidden');
    });
  }

  function initVideoPlayers() {
    const players = document.querySelectorAll('video[data-hls-src]');
    if (!players.length) return;
    players.forEach(function(video) {
      const src = video.getAttribute('data-hls-src');
      if (!src) return;
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function(_, data) {
          if (data && data.fatal) {
            try { hls.destroy(); } catch (e) {}
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    });
  }

  function sortCards(cards, mode) {
    const arr = Array.from(cards);
    arr.sort(function(a, b) {
      const ay = parseInt(a.dataset.year || '0', 10);
      const by = parseInt(b.dataset.year || '0', 10);
      const at = (a.dataset.title || '').toLowerCase();
      const bt = (b.dataset.title || '').toLowerCase();
      const aScore = parseInt(a.dataset.score || '0', 10);
      const bScore = parseInt(b.dataset.score || '0', 10);
      if (mode === 'year-asc') return ay - by;
      if (mode === 'title-asc') return at.localeCompare(bt, 'zh-Hans-CN');
      if (mode === 'score-desc') return bScore - aScore;
      return by - ay;
    });
    return arr;
  }

  function initCollections() {
    const sections = document.querySelectorAll('[data-collection]');
    sections.forEach(function(section) {
      const search = section.querySelector('[data-search]');
      const sort = section.querySelector('[data-sort]');
      const grid = section.querySelector('[data-grid]');
      const empty = section.querySelector('[data-empty]');
      if (!grid) return;
      const original = Array.from(grid.querySelectorAll('[data-card]'));
      function apply() {
        const q = (search && search.value ? search.value.trim().toLowerCase() : '');
        const mode = sort ? sort.value : 'year-desc';
        let cards = original.filter(function(card) {
          const blob = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
          return !q || blob.indexOf(q) !== -1;
        });
        cards = sortCards(cards, mode);
        grid.innerHTML = '';
        cards.forEach(function(card) { grid.appendChild(card); });
        if (empty) empty.hidden = cards.length !== 0;
      }
      if (search) search.addEventListener('input', apply);
      if (sort) sort.addEventListener('change', apply);
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initMobileNav();
    initVideoPlayers();
    initCollections();
  });
})();
