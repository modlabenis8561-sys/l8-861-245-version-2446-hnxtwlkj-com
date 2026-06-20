(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initSearchForms() {
    selectAll('form.site-search, form.big-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');

        if (!input || !input.value.trim()) {
          return;
        }

        event.preventDefault();
        var action = form.getAttribute('action') || 'search.html';
        window.location.href = action + '?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initInlineFilter() {
    var filter = document.querySelector('[data-filter-input]');

    if (!filter) {
      return;
    }

    var cards = selectAll('[data-search]');

    function applyFilter() {
      var keyword = normalize(filter.value);

      cards.forEach(function (card) {
        var source = normalize(card.getAttribute('data-search'));
        var matched = !keyword || source.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !matched);
      });
    }

    filter.addEventListener('input', applyFilter);

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      filter.value = q;
    }

    applyFilter();
  }

  function initPlayer() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-button');
      var message = shell.querySelector('.player-message');
      var hlsInstance = null;
      var initialized = false;

      if (!video || !button) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function attachSource() {
        var src = video.getAttribute('data-src');

        if (!src) {
          setMessage('播放源暂不可用');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请刷新页面重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
          setMessage('浏览器正在尝试直接播放 HLS 视频源');
        }

        initialized = true;
      }

      function playVideo() {
        if (!initialized) {
          attachSource();
        }

        shell.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('请再次点击播放器开始播放');
          });
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setMessage('');
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function initBackToTop() {
    var button = document.querySelector('.back-to-top');

    if (!button) {
      return;
    }

    function updateVisibility() {
      button.classList.toggle('is-visible', window.scrollY > 500);
    }

    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHeroSlider();
    initSearchForms();
    initInlineFilter();
    initPlayer();
    initBackToTop();
  });
}());
