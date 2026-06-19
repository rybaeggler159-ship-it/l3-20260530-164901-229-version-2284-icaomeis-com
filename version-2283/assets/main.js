(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    if (slides.length > 1) {
      start();
    }
  }

  function setupBackToTop() {
    var button = qs('[data-back-to-top]');

    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 480);
    });
  }

  function setupFilters() {
    qsa('[data-filter-area]').forEach(function (area) {
      var input = qs('[data-filter-input]', area);
      var type = qs('[data-filter-type]', area);
      var region = qs('[data-filter-region]', area);
      var year = qs('[data-filter-year]', area);
      var count = qs('[data-filter-count]', area);
      var cards = qsa('[data-search-card]', area);
      var params = new URLSearchParams(window.location.search);
      var urlQuery = params.get('q') || '';

      if (input && urlQuery && input.hasAttribute('data-query-input')) {
        input.value = urlQuery;
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var typeValue = normalize(type ? type.value : '');
        var regionValue = normalize(region ? region.value : '');
        var yearValue = normalize(year ? year.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year
          ].join(' '));

          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
          var matchesRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
          var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
          var isVisible = matchesQuery && matchesType && matchesRegion && matchesYear;

          card.classList.toggle('is-hidden', !isVisible);

          if (isVisible) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [input, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function () {
        var input = qs('input[name="q"]', form);

        if (input) {
          input.value = input.value.trim();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupBackToTop();
    setupFilters();
    setupSearchForms();
  });
})();
