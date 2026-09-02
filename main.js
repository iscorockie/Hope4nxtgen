/* programmes-carousel.js
   Slider for the "Five Programmes. One Mission." section.
   Navigation via dots, swipe, and autoplay (no arrow buttons).
*/

(function () {
  'use strict';

  var VISIBLE_COUNT = 3; // cards visible at once
  var AUTO_DELAY = 5000; // ms between auto-advances
  var GAP_PX = 24; // must match the CSS gap on .carousel-track

  var track = document.getElementById('carouselTrack');
  var viewport = document.getElementById('carouselViewport');
  var dotsEl = document.getElementById('carouselDots');

  if (!track || !viewport) return;

  var cards = Array.from(track.querySelectorAll('.prog-card'));
  var totalCards = cards.length;

  function getVisibleCount() {
    if (window.matchMedia('(max-width: 560px)').matches) return 1;
    if (window.matchMedia('(max-width: 900px)').matches) return 2;
    return VISIBLE_COUNT;
  }

  var visible = getVisibleCount();
  var maxIndex = Math.max(0, totalCards - visible);
  var current = 0;
  var timer = null;

  /* ---------- dots ---------- */
  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (var i = 0; i <= maxIndex; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.dataset.index = i;
      dot.addEventListener('click', function () {
        goTo(parseInt(this.dataset.index, 10));
        resetTimer();
      });
      dotsEl.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsEl) return;
    var dots = dotsEl.querySelectorAll('.carousel-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === current);
    });
  }

  /* ---------- movement ---------- */
  function getCardWidth() {
    var card = cards[0];
    if (!card) return 0;
    var style = window.getComputedStyle(card);
    var margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    return card.offsetWidth + margin;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex));
    var cardW = getCardWidth();
    var offset = current * (cardW + GAP_PX);
    track.style.transform = 'translateX(-' + offset + 'px)';
    updateDots();
  }

  function next() {
    goTo(current < maxIndex ? current + 1 : 0);
  }
  function prev() {
    goTo(current > 0 ? current - 1 : maxIndex);
  }

  /* ---------- auto-play ---------- */
  function startTimer() {
    timer = setInterval(next, AUTO_DELAY);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  /* ---------- card clicks ---------- */
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var programme = this.dataset.programme;
      if (typeof showWork === 'function') {
        showWork(programme);
      }
    });
  });

  /* ---------- pause on hover ---------- */
  viewport.addEventListener('mouseenter', function () {
    clearInterval(timer);
  });
  viewport.addEventListener('mouseleave', startTimer);

  /* ---------- touch / swipe ---------- */
  var touchStartX = 0;
  viewport.addEventListener(
    'touchstart',
    function (e) {
      touchStartX = e.changedTouches[0].clientX;
      clearInterval(timer);
    },
    { passive: true }
  );
  viewport.addEventListener(
    'touchend',
    function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
      }
      startTimer();
    },
    { passive: true }
  );

  /* ---------- responsive: recalc on resize ---------- */
  var resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      var v = getVisibleCount();
      if (v !== visible) {
        visible = v;
        maxIndex = Math.max(0, totalCards - visible);
        current = Math.min(current, maxIndex);
        buildDots();
      }
      goTo(current);
    }, 150);
  });

  /* ---------- init ---------- */
  buildDots();
  goTo(0);
  startTimer();
})();
