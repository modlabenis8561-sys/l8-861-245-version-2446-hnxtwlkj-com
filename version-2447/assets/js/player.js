(function() {
  window.initMoviePlayer = function(options) {
    var video = document.getElementById(options.videoId);
    var layer = document.getElementById(options.layerId);
    var button = document.getElementById(options.buttonId);
    var hlsInstance = null;
    var ready = false;

    if (!video || !layer || !button || !options.url) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(options.url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = options.url;
      }
    }

    function play() {
      prepare();
      layer.classList.add("is-hidden");
      var started = video.play();

      if (started && typeof started.catch === "function") {
        started.catch(function() {
          layer.classList.remove("is-hidden");
        });
      }
    }

    layer.addEventListener("click", play);
    button.addEventListener("click", play);

    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function() {
      layer.classList.add("is-hidden");
    });

    video.addEventListener("ended", function() {
      layer.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
