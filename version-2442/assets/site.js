(function () {
    function findAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = findAll('[data-hero-slide]', slider);
        var dots = findAll('[data-hero-dot]', slider);
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot') || '0', 10);
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function initFilters() {
        var input = document.querySelector('[data-filter-input]');
        var cards = findAll('[data-movie-card]');
        var buttons = findAll('[data-type-value]');
        if (!input && buttons.length === 0) {
            return;
        }
        var typeValue = 'all';

        function matchesType(card) {
            if (typeValue === 'all') {
                return true;
            }
            var value = card.getAttribute('data-type') || '';
            if (typeValue === '剧') {
                return value.indexOf('剧') !== -1 || value.toLowerCase().indexOf('series') !== -1;
            }
            return value.indexOf(typeValue) !== -1;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var visible = (!keyword || haystack.indexOf(keyword) !== -1) && matchesType(card);
                card.classList.toggle('is-hidden', !visible);
            });
        }

        if (input) {
            input.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                input.value = query;
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                typeValue = button.getAttribute('data-type-value') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });

        apply();
    }

    function bindStream(video, stream) {
        if (!video || !stream) {
            return;
        }
        if (video.getAttribute('data-ready') === '1') {
            return;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            return;
        }
        video.src = stream;
    }

    function initPlayer() {
        var video = document.querySelector('.player-video');
        var button = document.querySelector('[data-play-button]');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var box = video.closest('.player-box');

        function play() {
            bindStream(video, stream);
            if (box) {
                box.classList.add('playing');
            }
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    if (box) {
                        box.classList.remove('playing');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (box) {
                box.classList.add('playing');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
