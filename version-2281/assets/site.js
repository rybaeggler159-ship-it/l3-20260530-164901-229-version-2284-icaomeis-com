
import { H as Hls } from './hls-vendor.js';

const ready = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
};

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

async function loadJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

function initMobileNav() {
  const toggle = qs('.mobile-toggle');
  const panel = qs('.mobile-nav');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => panel.classList.toggle('open'));
}

function initHeroCarousel() {
  const root = qs('[data-hero-carousel]');
  if (!root) return;

  const slides = qsa('[data-hero-slide]', root);
  const dots = qsa('[data-hero-dot]');
  const prev = qs('[data-hero-prev]');
  const next = qs('[data-hero-next]');
  if (!slides.length) return;

  let active = 0;
  let timer = null;

  const show = (idx) => {
    active = (idx + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
  };

  const play = () => {
    stop();
    timer = window.setInterval(() => show(active + 1), 5000);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  slides.forEach((slide, i) => slide.classList.toggle('active', i === 0));
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === 0);
    dot.addEventListener('click', () => {
      show(i);
      play();
    });
  });

  prev?.addEventListener('click', () => {
    show(active - 1);
    play();
  });
  next?.addEventListener('click', () => {
    show(active + 1);
    play();
  });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', play);
  play();
}

async function initPlayers() {
  const videos = qsa('video.movie-player[data-hls]');
  if (!videos.length) return;

  for (const video of videos) {
    const hlsUrl = video.dataset.hls;
    const mp4 = qs('source[type="video/mp4"]', video)?.getAttribute('src');

    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (hlsUrl) video.src = hlsUrl;
      } else if (Hls && Hls.isSupported() && hlsUrl) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
      } else if (mp4) {
        video.src = mp4;
      }
    } catch (err) {
      if (mp4 && !video.getAttribute('src')) {
        video.src = mp4;
      }
    }
  }

  const playBtn = qs('[data-player-play]');
  const mainVideo = qs('video.movie-player');
  if (playBtn && mainVideo) {
    playBtn.addEventListener('click', async () => {
      try {
        await mainVideo.play();
      } catch (err) {
        console.warn(err);
      }
    });
  }
}

function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-top';
  btn.type = 'button';
  btn.textContent = '↑';
  btn.setAttribute('aria-label', '返回顶部');
  document.body.appendChild(btn);

  const toggle = () => {
    btn.style.display = window.scrollY > 500 ? 'inline-grid' : 'none';
  };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function cardHTML(movie) {
  const tags = (movie.tags || []).slice(0, 3).map(t => `<span>${escapeHtml(t)}</span>`).join('');
  return `
    <a class="movie-card" href="${movie.url}">
      <div class="movie-poster">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}">
        <span class="card-badge">${movie.year}</span>
      </div>
      <div class="movie-body">
        <h3>${escapeHtml(movie.title)}</h3>
        <p>${escapeHtml(movie.oneLine || '')}</p>
        <div class="movie-meta">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <div class="movie-tags">${tags}</div>
      </div>
    </a>
  `;
}

function escapeHtml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function matchMovie(movie, q) {
  const hay = [
    movie.title,
    movie.region,
    movie.type,
    movie.year,
    movie.genre,
    movie.oneLine,
    (movie.tags || []).join(' ')
  ].join(' ').toLowerCase();
  return hay.includes(q);
}

function renderSearch(items, root) {
  if (!root) return;
  if (!items.length) {
    root.innerHTML = '<div class="search-empty">未找到相关影片，请尝试其他关键词。</div>';
    return;
  }
  root.innerHTML = items.map(cardHTML).join('');
}

async function initSearchPage() {
  const form = qs('[data-search-form]');
  const input = qs('[data-search-input]');
  const results = qs('[data-search-results]');
  if (!form || !input || !results) return;

  let data = Array.isArray(window.__MOVIES__) ? window.__MOVIES__ : [];
  if (!data.length) {
    try {
      data = await loadJson('assets/movies.json');
    } catch (err) {
      results.innerHTML = '<div class="search-empty">搜索数据加载失败。</div>';
      return;
    }
  }

  const params = new URLSearchParams(location.search);
  const initial = (params.get('q') || '').trim();
  input.value = initial;

  const update = () => {
    const q = input.value.trim().toLowerCase();
    const items = q ? data.filter(m => matchMovie(m, q)).slice(0, 72) : data.slice(0, 12);
    renderSearch(items, results);
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    history.replaceState({}, '', url);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    update();
  });

  input.addEventListener('input', () => {
    window.clearTimeout(input._timer);
    input._timer = window.setTimeout(update, 180);
  });

  qsa('[data-search-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.searchChip;
      update();
      window.scrollTo({ top: results.offsetTop - 80, behavior: 'smooth' });
    });
  });

  update();
}

ready(() => {
  initMobileNav();
  initHeroCarousel();
  initBackToTop();
  initPlayers();
  initSearchPage();
});
