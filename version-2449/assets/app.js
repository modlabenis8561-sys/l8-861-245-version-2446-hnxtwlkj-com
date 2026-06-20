(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobileNav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-index")) || 0);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var search = scope.querySelector(".movie-search");
    var filters = Array.prototype.slice.call(scope.querySelectorAll(".movie-filter"));

    if (!cards.length) {
      return;
    }

    function apply() {
      var query = normalize(search ? search.value : "");
      var values = {};

      filters.forEach(function (filter) {
        values[filter.getAttribute("data-filter")] = normalize(filter.value);
      });

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));

        var matched = !query || haystack.indexOf(query) !== -1;

        Object.keys(values).forEach(function (key) {
          var value = values[key];
          var cardValue = normalize(card.getAttribute("data-" + key));

          if (value && cardValue.indexOf(value) === -1) {
            matched = false;
          }
        });

        card.classList.toggle("is-hidden", !matched);
      });
    }

    if (search) {
      search.addEventListener("input", apply);
    }

    filters.forEach(function (filter) {
      filter.addEventListener("change", apply);
    });

    if (search && search.id === "siteSearch") {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        search.value = q;
      }
    }

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(initFilters);

  if (typeof window.setupMoviePlayer !== "function") {
    window.setupMoviePlayer = function (options) {
      var video = document.getElementById(options.videoId);
      var button = document.getElementById(options.buttonId);
      var attached = false;
      var hlsInstance = null;

      if (!video || !options.source) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = options.source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(options.source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = options.source;
        }
      }

      function play() {
        attach();

        if (button) {
          button.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 && button) {
          button.classList.remove("is-hidden");
        }
      });

      video.addEventListener("ended", function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    };
  }
})();
