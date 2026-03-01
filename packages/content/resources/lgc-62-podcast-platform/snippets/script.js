/* ── lgc-62-podcast-platform · script.js ──────────────────────────────────── */

/* ── Smooth Scroll (Lenis if available) ────────────────────────────────────── */
(function initLenis() {
  if (typeof window.Lenis === 'undefined') return;
  const lenis = new window.Lenis({ lerp: 0.08, smooth: true });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
})();

/* ── Category Filter ───────────────────────────────────────────────────────── */
(function initFilter() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.episode-card');
  if (!pills.length || !cards.length) return;

  function applyFilter(category) {
    pills.forEach(function(p) {
      p.classList.toggle('active', p.dataset.filter === category);
    });
    cards.forEach(function(card) {
      if (category === 'all') {
        card.classList.remove('hidden');
      } else {
        card.classList.toggle('hidden', card.dataset.category !== category);
      }
    });
  }

  pills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      applyFilter(pill.dataset.filter || 'all');
    });
  });

  // activate first pill on load
  var first = pills[0];
  if (first) applyFilter(first.dataset.filter || 'all');
})();

/* ── Play / Pause Toggle ───────────────────────────────────────────────────── */
(function initPlayButtons() {
  var waveform = document.querySelector('.waveform');

  function setPlaying(btn, playing) {
    btn.classList.toggle('playing', playing);
    btn.textContent = playing ? '⏸' : '▶';
    if (waveform && btn.closest('.hero-card')) {
      waveform.classList.toggle('waveform-paused', !playing);
    }
  }

  // Hero play button (may have child icon span)
  var heroPlay = document.querySelector('.hero-play');
  if (heroPlay) {
    var heroPlaying = false;
    heroPlay.addEventListener('click', function() {
      heroPlaying = !heroPlaying;
      var icon = heroPlay.querySelector('.play-icon');
      if (icon) {
        icon.textContent = heroPlaying ? '⏸' : '▶';
      } else {
        heroPlay.dataset.playing = heroPlaying;
      }
      heroPlay.classList.toggle('playing', heroPlaying);
      if (waveform) waveform.classList.toggle('waveform-paused', !heroPlaying);
    });
  }

  // Individual card play buttons
  document.querySelectorAll('.play-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isPlaying = btn.classList.contains('playing');
      // pause all others first
      document.querySelectorAll('.play-btn.playing').forEach(function(other) {
        if (other !== btn) setPlaying(other, false);
      });
      setPlaying(btn, !isPlaying);
    });
  });

  document.querySelectorAll('.episode-card-play').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isPlaying = btn.classList.contains('playing');
      document.querySelectorAll('.episode-card-play.playing').forEach(function(other) {
        if (other !== btn) { other.classList.remove('playing'); other.textContent = '▶'; }
      });
      btn.classList.toggle('playing', !isPlaying);
      btn.textContent = !isPlaying ? '⏸' : '▶';
    });
  });
})();
