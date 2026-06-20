(function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector("[data-card-search]");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
  var activeFilter = "";

  function applyCardFilter() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    cards.forEach(function(card) {
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle("is-hidden", !(matchedQuery && matchedFilter));
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyCardFilter);
  }

  filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      activeFilter = button.getAttribute("data-filter-value") || "";
      filterButtons.forEach(function(item) {
        item.classList.toggle("is-active", item === button);
      });
      applyCardFilter();
    });
  });
})();
