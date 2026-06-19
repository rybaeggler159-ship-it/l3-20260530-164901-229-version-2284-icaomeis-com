function selectAll(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initHeroCarousel();
  initFilters();
  hydrateSearchQuery();
});

function initMobileMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', nav.classList.contains('is-open'));
  });
}

function initHeroCarousel() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = selectAll('[data-hero-slide]', hero);
  const thumbs = selectAll('[data-hero-thumb]', hero);
  const previous = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let activeIndex = 0;
  let timer = null;

  function show(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('is-active', thumbIndex === activeIndex);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(activeIndex + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      const index = Number(thumb.getAttribute('data-hero-thumb'));
      show(index);
      start();
    });
  });

  if (previous) {
    previous.addEventListener('click', function () {
      show(activeIndex - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(activeIndex + 1);
      start();
    });
  }

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initFilters() {
  selectAll('[data-filter-scope]').forEach(function (scope) {
    const searchInput = scope.querySelector('[data-search-input]');
    const typeFilter = scope.querySelector('[data-type-filter]');
    const yearFilter = scope.querySelector('[data-year-filter]');
    const section = scope.nextElementSibling;
    const cards = section ? selectAll('[data-card]', section) : [];
    const emptyState = section ? section.querySelector('[data-empty-state]') : null;

    function apply() {
      const query = normalize(searchInput ? searchInput.value : '');
      const typeValue = typeFilter ? typeFilter.value : '';
      const yearValue = yearFilter ? yearFilter.value : '';
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));

        const matchesQuery = !query || haystack.indexOf(query) !== -1;
        const matchesType = !typeValue || normalize(card.dataset.type || '').indexOf(normalize(typeValue)) !== -1 || haystack.indexOf(normalize(typeValue)) !== -1;
        const matchesYear = matchYear(card.dataset.year || '', yearValue);
        const visible = matchesQuery && matchesType && matchesYear;

        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
}

function hydrateSearchQuery() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  if (!query) {
    return;
  }

  const input = document.querySelector('[data-search-input]');

  if (input) {
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function matchYear(year, filter) {
  if (!filter) {
    return true;
  }

  if (filter === '2010') {
    const number = Number(year);
    return number >= 2010 && number <= 2019;
  }

  if (filter === '2000') {
    const number = Number(year);
    return number >= 2000 && number <= 2009;
  }

  if (filter === '1990') {
    const number = Number(year);
    return number > 0 && number < 2000;
  }

  return year === filter;
}
