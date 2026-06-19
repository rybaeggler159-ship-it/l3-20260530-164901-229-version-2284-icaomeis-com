const toggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dots = Array.from(document.querySelectorAll('.hero-dot'));
if (slides.length && dots.length) {
    let active = 0;
    const showSlide = (index) => {
        active = index;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    };
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => showSlide(i));
    });
    setInterval(() => {
        showSlide((active + 1) % slides.length);
    }, 5200);
}

const searchInput = document.querySelector('[data-search-input]');
const yearSelect = document.querySelector('[data-year-select]');
const sortSelect = document.querySelector('[data-sort-select]');
const searchGrid = document.querySelector('[data-search-grid]');
if (searchInput && searchGrid) {
    const cards = Array.from(searchGrid.querySelectorAll('.movie-card'));
    const applyFilter = () => {
        const query = searchInput.value.trim().toLowerCase();
        const year = yearSelect ? yearSelect.value : '';
        cards.forEach((card) => {
            const content = [card.dataset.title, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
            const matchQuery = !query || content.includes(query);
            const matchYear = !year || card.dataset.year === year;
            card.style.display = matchQuery && matchYear ? '' : 'none';
        });
        if (sortSelect) {
            const visible = cards.filter((card) => card.style.display !== 'none');
            visible.sort((a, b) => {
                if (sortSelect.value === 'title') {
                    return a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN');
                }
                return Number(b.dataset.year) - Number(a.dataset.year);
            });
            visible.forEach((card) => searchGrid.appendChild(card));
        }
    };
    searchInput.addEventListener('input', applyFilter);
    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilter);
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilter);
    }
}
