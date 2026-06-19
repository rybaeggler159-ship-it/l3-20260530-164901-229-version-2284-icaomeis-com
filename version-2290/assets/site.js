
(function () {
  const ready = (fn) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const toggleNav = () => {
    const nav = qs('[data-site-nav]');
    const btn = qs('[data-nav-toggle]');
    if (!nav || !btn) return;
    btn.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  };

  const initHeroSlider = () => {
    const slider = qs('[data-hero-slider]');
    if (!slider) return;

    const slides = qsa('[data-hero-slide]', slider);
    if (!slides.length) return;

    let index = 0;
    let timer;

    const setActive = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      const dots = qsa('[data-slider-dot]', slider);
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => setActive(index + 1), 5000);
    };

    qsa('[data-slider-prev]', slider).forEach((btn) => btn.addEventListener('click', () => {
      setActive(index - 1);
      play();
    }));
    qsa('[data-slider-next]', slider).forEach((btn) => btn.addEventListener('click', () => {
      setActive(index + 1);
      play();
    }));
    qsa('[data-slider-dot]', slider).forEach((dot, i) => dot.addEventListener('click', () => {
      setActive(i);
      play();
    }));

    setActive(0);
    play();
  };

  const initPlayer = () => {
    const shell = qs('[data-player-shell]');
    const video = qs('video[data-player-video]', shell || document);
    if (!shell || !video) return;

    const hlsSrc = video.dataset.hls || '';
    const mp4Src = video.dataset.mp4 || '';
    const overlayBtn = qs('[data-player-play]', shell);

    const playVideo = () => {
      video.play().catch(() => {});
    };

    if (overlayBtn) {
      overlayBtn.addEventListener('click', playVideo);
    }
    video.addEventListener('click', () => {
      if (video.paused) {
        playVideo();
      }
    });

    const attachNative = (src) => {
      if (!src) return;
      video.src = src;
      video.load();
    };

    const attachHls = () => {
      if (!hlsSrc) {
        attachNative(mp4Src);
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNative(hlsSrc);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            attachNative(mp4Src);
          }
        });
        return;
      }

      attachNative(mp4Src);
    };

    attachHls();
  };

  const initSearch = () => {
    const root = qs('[data-search-page]');
    if (!root) return;
    const input = qs('[data-search-input]', root);
    const year = qs('[data-search-year]', root);
    const type = qs('[data-search-type]', root);
    const region = qs('[data-search-region]', root);
    const genre = qs('[data-search-genre]', root);
    const results = qs('[data-search-results]', root);
    const count = qs('[data-search-count]', root);
    const hotButtons = qsa('[data-search-hot]', root);

    if (!results || !window.MOVIE_CATALOG) return;

    const params = new URLSearchParams(location.search);
    const initialQuery = params.get('q') || '';
    if (input) input.value = initialQuery;

    const matches = (item, q) => {
      if (!q) return true;
      const hay = [item.title, item.region, item.type, item.genre, item.tags, item.one_line, item.summary, item.review].join(' ').toLowerCase();
      return hay.includes(q.toLowerCase());
    };

    const render = (list) => {
      results.innerHTML = list.map((item) => `
        <article class="movie-card">
          <a class="movie-poster" href="movies/${item.slug}">
            <span class="movie-badge">${escapeHtml(item.type)} · ${escapeHtml(item.year)}</span>
            <div class="movie-title-on-card">${escapeHtml(item.title)}</div>
          </a>
          <div class="movie-body">
            <div class="movie-meta">
              <span>${escapeHtml(item.region)}</span>
              <span>${escapeHtml(item.genre)}</span>
            </div>
            <div class="movie-excerpt">${escapeHtml(item.one_line || item.summary || '')}</div>
            <a class="movie-link" href="movies/${item.slug}">进入详情 →</a>
          </div>
        </article>
      `).join('');
      if (count) count.textContent = String(list.length);
    };

    const apply = () => {
      const q = (input && input.value ? input.value.trim() : initialQuery).toLowerCase();
      const y = year && year.value ? year.value : '';
      const t = type && type.value ? type.value : '';
      const r = region && region.value ? region.value : '';
      const g = genre && genre.value ? genre.value : '';

      let list = window.MOVIE_CATALOG.filter((item) =>
        matches(item, q) &&
        (!y || String(item.year) === y) &&
        (!t || item.type === t) &&
        (!r || item.region === r) &&
        (!g || item.genre.toLowerCase().includes(g.toLowerCase()))
      );

      list.sort((a, b) => (b.score || 0) - (a.score || 0) || (a.id - b.id));
      render(list.slice(0, 120));
    };

    [input, year, type, region, genre].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });

    hotButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (input) input.value = btn.dataset.searchHot || '';
        apply();
      });
    });

    apply();
  };

  ready(() => {
    toggleNav();
    initHeroSlider();
    initPlayer();
    initSearch();
  });
})();
