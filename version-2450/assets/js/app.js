(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.getElementById('siteNav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });
        start();
    }

    function setupSearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = document.getElementById('pageSearchInput');
        var lists = Array.prototype.slice.call(document.querySelectorAll('.searchable-list'));
        if (input && query) {
            input.value = query;
        }
        function apply(value) {
            var needle = String(value || '').trim().toLowerCase();
            lists.forEach(function (list) {
                Array.prototype.slice.call(list.querySelectorAll('[data-search]')).forEach(function (item) {
                    var text = item.getAttribute('data-search') || '';
                    item.classList.toggle('hidden-by-search', needle !== '' && text.indexOf(needle) === -1);
                });
            });
        }
        apply(query);
        if (input) {
            input.addEventListener('input', function () {
                apply(input.value);
            });
        }
    }

    function setupPlayer() {
        var video = document.querySelector('.movie-video[data-hls]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-hls');
        var shell = video.closest('.player-shell');
        var button = document.querySelector('[data-player-start]');
        var hlsInstance = null;
        var loaded = false;
        function attachSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function playVideo() {
            attachSource();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
            if (shell) {
                shell.classList.add('playing');
            }
        }
        if (button) {
            button.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('playing');
            }
        });
        video.addEventListener('pause', function () {
            if (shell) {
                shell.classList.remove('playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
})();
