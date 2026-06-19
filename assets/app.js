(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupMenu() {
    var button = one(".menu-button");
    var menu = one(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = all(".hero-slide");
    if (!slides.length) {
      return;
    }
    var dots = all(".hero-dot");
    var prev = one(".hero-prev");
    var next = one(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupSearch() {
    var inputs = all(".site-search");
    if (!inputs.length) {
      return;
    }

    inputs.forEach(function (input) {
      var scope = input.closest("main") || document;
      var cards = all(".movie-card", scope);
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
        });
      });
    });
  }

  function setupSort() {
    all(".sort-select").forEach(function (select) {
      var section = select.closest("main") || document;
      var grid = one(".sortable-grid", section);
      if (!grid) {
        return;
      }
      var original = all(".movie-card", grid);
      select.addEventListener("change", function () {
        var cards = all(".movie-card", grid);
        var value = select.value;
        if (value === "default") {
          cards = original.slice();
        } else if (value === "year-desc") {
          cards.sort(function (a, b) {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          });
        } else if (value === "year-asc") {
          cards.sort(function (a, b) {
            return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
          });
        } else if (value === "title") {
          cards.sort(function (a, b) {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
          });
        }
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    });
  }

  function attachHls(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }
    video.src = source;
    return Promise.resolve();
  }

  window.setupMoviePlayer = function (source) {
    var video = one(".movie-video");
    var box = one(".player-box");
    var cover = one(".player-cover");
    if (!video || !box || !source) {
      return;
    }
    var ready = false;

    function start() {
      var begin = ready ? Promise.resolve() : attachHls(video, source).then(function () {
        ready = true;
      });
      begin.then(function () {
        box.classList.add("is-playing");
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupSort();
  });
})();
