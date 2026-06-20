(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-primary-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("img.movie-cover, img.hero-cover, img.detail-poster, img.rank-cover").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-missing");
            });
        });

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                if (timer || slides.length < 2) {
                    return;
                }
                timer = setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    stop();
                    show(dotIndex);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search]");
            var select = scope.querySelector("[data-sort]");
            var targetSelector = scope.getAttribute("data-target") || "[data-card-grid]";
            var grid = document.querySelector(targetSelector);
            var empty = document.querySelector(scope.getAttribute("data-empty") || "[data-no-results]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var hay = (card.getAttribute("data-search-text") || "").toLowerCase();
                    var matched = !keyword || hay.indexOf(keyword) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            function applySort() {
                if (!select) {
                    return;
                }
                var mode = select.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === "year-desc") {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    }
                    if (mode === "year-asc") {
                        return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
                    }
                    if (mode === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    }
                    return Number(a.getAttribute("data-index") || 0) - Number(b.getAttribute("data-index") || 0);
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                cards = sorted;
                applyFilter();
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (select) {
                select.addEventListener("change", applySort);
            }
            applyFilter();
        });

        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play]");
            var stream = player.getAttribute("data-stream") || "";
            var attached = false;
            var hlsInstance = null;

            function attach(done) {
                if (!video || !stream) {
                    return;
                }
                if (attached) {
                    if (done) {
                        done();
                    }
                    return;
                }
                attached = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (done) {
                            done();
                        }
                    });
                } else {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", function () {
                        if (done) {
                            done();
                        }
                    }, { once: true });
                    video.load();
                }
            }

            function play() {
                attach(function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                    player.classList.add("is-playing");
                });
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!attached) {
                        play();
                        return;
                    }
                    if (video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    player.classList.remove("is-playing");
                });
                video.addEventListener("emptied", function () {
                    if (hlsInstance && typeof hlsInstance.destroy === "function") {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            }
        });
    });
})();
