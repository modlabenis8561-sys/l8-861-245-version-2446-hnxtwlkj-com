const Hls = window.Hls;

const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
        callback();
    }
};

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const initNavigation = () => {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", () => {
        nav.classList.toggle("is-open");
    });
};

const initHero = () => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    const slides = [...hero.querySelectorAll("[data-hero-slide]")];
    const dots = [...hero.querySelectorAll("[data-hero-dot]")];
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
        return;
    }
    let active = 0;
    let timer = null;
    const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
    };
    const schedule = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(active + 1), 5600);
    };
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            schedule();
        });
    });
    if (prev) {
        prev.addEventListener("click", () => {
            show(active - 1);
            schedule();
        });
    }
    if (next) {
        next.addEventListener("click", () => {
            show(active + 1);
            schedule();
        });
    }
    schedule();
};

const initFilters = () => {
    document.querySelectorAll("[data-filter-root]").forEach((root) => {
        const input = root.querySelector("[data-search-input]");
        const selects = [...root.querySelectorAll("[data-filter-select]")];
        const cards = [...root.querySelectorAll(".movie-card")];
        const empty = root.querySelector("[data-empty-state]");
        if (!cards.length) {
            return;
        }
        let frame = 0;
        const apply = () => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
                const term = normalize(input ? input.value : "");
                const filters = selects.map((select) => ({ key: select.dataset.filterSelect, value: normalize(select.value) }));
                let visible = 0;
                cards.forEach((card) => {
                    const haystack = normalize([
                        card.dataset.title,
                        card.dataset.tags,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.type,
                        card.textContent,
                    ].join(" "));
                    const textMatch = !term || haystack.includes(term);
                    const filterMatch = filters.every((filter) => !filter.value || normalize(card.dataset[filter.key] || haystack).includes(filter.value));
                    const isVisible = textMatch && filterMatch;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            });
        };
        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach((select) => select.addEventListener("change", apply));
    });
};

const initPlayer = () => {
    const player = document.querySelector("[data-player]");
    if (!player) {
        return;
    }
    const data = document.getElementById("player-data");
    const video = player.querySelector("video");
    const button = player.querySelector("[data-play]");
    const cover = player.querySelector("[data-cover]");
    if (!data || !video || !button) {
        return;
    }
    let source = "";
    try {
        source = JSON.parse(data.textContent).source || "";
    } catch (error) {
        source = "";
    }
    let attached = false;
    let hls = null;
    const attach = () => {
        if (attached || !source) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
        if (cover) {
            cover.classList.add("is-ready");
        }
    };
    const start = () => {
        attach();
        player.classList.add("is-playing");
        video.controls = true;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(() => {});
        }
    };
    button.addEventListener("click", start);
    if (cover) {
        cover.addEventListener("click", (event) => {
            if (event.target === button || button.contains(event.target)) {
                return;
            }
            start();
        });
    }
    video.addEventListener("click", () => {
        if (!attached || video.paused) {
            start();
        }
    });
    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
};

ready(() => {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
});
