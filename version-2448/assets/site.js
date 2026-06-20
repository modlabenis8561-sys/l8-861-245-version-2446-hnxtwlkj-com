
(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initializeMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
    });
  }

  function initializeHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initializeLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));

    inputs.forEach(function (input) {
      var grid = document.querySelector(input.getAttribute("data-local-filter"));

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.textContent
          ].join(" ").toLowerCase();

          card.hidden = keyword && text.indexOf(keyword) === -1;
        });
      });
    });
  }

  function renderSearchCard(movie) {
    var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class="movie-card">",
      "  <a class="movie-card__poster" href="" + escapeHtml(movie.href) + "" aria-label="观看 " + escapeHtml(movie.title) + "">",
      "    <img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy" onerror="this.classList.add('image-missing')">",
      "    <span class="movie-card__play">▶</span>",
      "    <span class="movie-card__year">" + escapeHtml(movie.year) + "</span>",
      "  </a>",
      "  <div class="movie-card__body">",
      "    <h3><a href="" + escapeHtml(movie.href) + "">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class="movie-card__meta">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</div>",
      "    <div class="movie-card__tags">" + tagHtml + "</div>",
      "  </div>",
      "</article>"
    ].join("
");
  }

  function initializeSearchPage() {
    var input = document.getElementById("site-search-input");
    var button = document.getElementById("site-search-button");
    var results = document.getElementById("search-results");
    var empty = document.getElementById("search-empty");
    var typeFilter = document.getElementById("search-type-filter");
    var yearFilter = document.getElementById("search-year-filter");
    var data = window.MOVIE_SEARCH_INDEX || [];

    if (!input || !results || !data.length) {
      return;
    }

    function applySearch() {
      var keyword = input.value.trim().toLowerCase();
      var selectedType = typeFilter ? typeFilter.value : "";
      var selectedYear = yearFilter ? yearFilter.value : "";

      var matches = data.filter(function (movie) {
        var text = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ").toLowerCase();

        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var typeMatched = !selectedType || String(movie.type).indexOf(selectedType) !== -1 || String(movie.genre).indexOf(selectedType) !== -1;
        var yearMatched = !selectedYear || String(movie.year) === selectedYear;

        return keywordMatched && typeMatched && yearMatched;
      }).slice(0, 180);

      results.innerHTML = matches.map(renderSearchCard).join("
");

      if (empty) {
        empty.hidden = matches.length > 0;
      }
    }

    input.addEventListener("input", applySearch);
    if (button) {
      button.addEventListener("click", applySearch);
    }
    if (typeFilter) {
      typeFilter.addEventListener("change", applySearch);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applySearch);
    }
  }

  function initializePlayer() {
    var player = document.querySelector("[data-player]");

    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var startButton = player.querySelector("[data-player-start]");
    var loading = player.querySelector("[data-player-loading]");
    var errorBox = player.querySelector("[data-player-error]");
    var source = player.getAttribute("data-src");
    var hasLoaded = false;
    var hlsInstance = null;

    function showLoading(show) {
      if (loading) {
        loading.hidden = !show;
      }
    }

    function showError(message) {
      showLoading(false);
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
      }
      if (startButton) {
        startButton.classList.remove("is-hidden");
      }
    }

    function hideError() {
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = "";
      }
    }

    function loadSource() {
      if (hasLoaded || !video || !source) {
        return Promise.resolve();
      }

      hasLoaded = true;
      hideError();
      showLoading(true);

      return new Promise(function (resolve) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            showLoading(false);
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              showError("网络加载异常，播放器正在等待重新加载。");
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              showError("媒体解码异常，正在尝试恢复播放。");
              hlsInstance.recoverMediaError();
            } else {
              showError("当前浏览器无法播放此视频源。");
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            showLoading(false);
            resolve();
          }, { once: true });
        } else {
          showError("当前浏览器不支持 HLS 播放，请更换浏览器后重试。");
          resolve();
        }
      });
    }

    function playVideo() {
      loadSource().then(function () {
        if (!video) {
          return;
        }
        if (startButton) {
          startButton.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (startButton) {
              startButton.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (startButton) {
      startButton.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (startButton) {
          startButton.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (startButton && !video.ended) {
          startButton.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeMenu();
    initializeHeroSlider();
    initializeLocalFilters();
    initializeSearchPage();
    initializePlayer();
  });
})();
