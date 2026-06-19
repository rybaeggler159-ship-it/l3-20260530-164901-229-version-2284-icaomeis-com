(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-menu]");
        if (menuButton && menu) {
            menuButton.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                    slide.setAttribute("aria-hidden", slideIndex === current ? "false" : "true");
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
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
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var input = document.querySelector("[data-search-input]");
        var list = document.querySelector("[data-search-list]");
        if (input && list) {
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var categoryFilter = document.querySelector("[data-category-filter]");
            var yearFilter = document.querySelector("[data-year-filter]");
            var regionFilter = document.querySelector("[data-region-filter]");
            var result = document.querySelector("[data-search-result]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || params.get("keyword") || "";
            input.value = initial;

            function textOf(card) {
                return [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-category") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();
            }

            function apply() {
                var keyword = input.value.trim().toLowerCase();
                var category = categoryFilter ? categoryFilter.value : "";
                var year = yearFilter ? yearFilter.value : "";
                var region = regionFilter ? regionFilter.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var matchKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                    var matchCategory = !category || card.getAttribute("data-category") === category;
                    var matchYear = !year || card.getAttribute("data-year") === year;
                    var matchRegion = !region || card.getAttribute("data-region") === region;
                    var match = matchKeyword && matchCategory && matchYear && matchRegion;
                    card.classList.toggle("search-hide", !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (result) {
                    result.textContent = visible + " 部影片";
                }
            }

            input.addEventListener("input", apply);
            if (categoryFilter) {
                categoryFilter.addEventListener("change", apply);
            }
            if (yearFilter) {
                yearFilter.addEventListener("change", apply);
            }
            if (regionFilter) {
                regionFilter.addEventListener("change", apply);
            }
            apply();
        }
    });
})();
