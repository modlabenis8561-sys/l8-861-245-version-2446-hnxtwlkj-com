(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showHeroSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showHeroSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showHeroSlide(activeIndex + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var searchableCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalizeText(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function runSearch(value) {
        var keyword = normalizeText(value);
        var visibleCount = 0;

        searchableCards.forEach(function (card) {
            var text = normalizeText(card.getAttribute('data-title') + card.getAttribute('data-tags') + card.getAttribute('data-region') + card.getAttribute('data-year'));
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount ? 'none' : 'block';
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            runSearch(input.value);
        });
    });
})();
