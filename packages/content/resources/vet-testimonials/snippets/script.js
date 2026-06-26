(function () {
  'use strict';

  var carousel = document.getElementById('carousel');
  var track = document.getElementById('track');
  var slides = track ? Array.prototype.slice.call(track.children) : [];
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var dotsWrap = document.getElementById('dots');
  if (!track || slides.length === 0) return;

  var index = 0;
  var count = slides.length;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AUTO_MS = 5500;
  var timer = null;

  // Build dots
  var dots = [];
  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.className = 'dot';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    b.addEventListener('click', function () {
      goTo(i);
      restart();
    });
    dotsWrap.appendChild(b);
    dots.push(b);
  });

  function render() {
    track.style.transform = 'translateX(' + -index * 100 + '%)';
    dots.forEach(function (d, i) {
      d.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    slides.forEach(function (s, i) {
      s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });
  }

  function goTo(i) {
    index = (i + count) % count;
    render();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function start() {
    if (reduceMotion || timer) return;
    timer = window.setInterval(next, AUTO_MS);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    stop();
    start();
  }

  nextBtn.addEventListener('click', function () { next(); restart(); });
  prevBtn.addEventListener('click', function () { prev(); restart(); });

  // Keyboard arrows when carousel has focus
  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); restart(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); restart(); }
  });

  // Pause on hover / focus
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  // Animate trust counters once when scrolled into view
  var nums = Array.prototype.slice.call(document.querySelectorAll('.trust__num'));
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }
    var startTime = null;
    var dur = 1400;
    function step(ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min((ts - startTime) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && nums.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  } else {
    nums.forEach(animateCount);
  }

  render();
  start();
})();
