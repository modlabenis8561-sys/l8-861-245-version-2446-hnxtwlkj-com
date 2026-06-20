(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupSearch() {
    var areas = document.querySelectorAll("[data-search-area]");
    areas.forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var buttons = area.querySelectorAll("[data-filter]");
      var scope = area.parentElement || document;
      var cards = scope.querySelectorAll("[data-card]");
      var activeFilter = "all";

      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
          card.classList.toggle("is-hidden-card", !(matchedText && matchedFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
    });
  }

  function setupSlider() {
    var slider = document.querySelector("[data-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var prev = slider.querySelector("[data-prev]");
    var next = slider.querySelector("[data-next]");
    var dotsWrap = slider.querySelector("[data-dots]");
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function render() {
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }
    }

    function go(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      render();
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        go(index + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, dotIndex) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换");
        dot.addEventListener("click", function () {
          go(dotIndex);
          play();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(index + 1);
        play();
      });
    }

    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    slider.addEventListener("mouseleave", play);
    render();
    play();
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player-video]");
    if (!video) {
      return;
    }
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-toggle]");
    var stream = video.getAttribute("data-stream");
    var loaded = false;
    var hls = null;

    function hideCover() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    function attach() {
      if (loaded || !stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }

    function start() {
      attach();
      hideCover();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("play", hideCover);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupSearch();
    setupSlider();
    setupPlayer();
  });
})();
