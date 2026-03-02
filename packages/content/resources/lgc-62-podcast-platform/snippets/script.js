/* ── lgc-62-podcast-platform · script.js ──────────────────────────────────── */

/* ── Category Filter ───────────────────────────────────────────────────────── */
(function initFilter() {
  var pills = document.querySelectorAll('.pill');
  var cards = document.querySelectorAll('.ep-card');
  if (!pills.length || !cards.length) return;

  function applyFilter(category) {
    pills.forEach(function(p) { p.classList.remove('active'); });

    cards.forEach(function(card) {
      var tag = card.querySelector('.ep-card-tag');
      var cardCat = tag ? tag.textContent.trim().toLowerCase() : '';
      card.style.display = (category === 'all' || cardCat === category) ? '' : 'none';
    });
  }

  pills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      pill.classList.add('active');
      applyFilter(pill.textContent.trim().toLowerCase());
    });
  });

  if (pills[0]) {
    pills[0].classList.add('active');
    applyFilter('all');
  }
})();

/* ── Play / Pause Toggle ───────────────────────────────────────────────────── */
(function initPlayButtons() {
  document.querySelectorAll('.play-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isPlaying = btn.classList.contains('playing');
      document.querySelectorAll('.play-btn.playing').forEach(function(other) {
        if (other !== btn) other.classList.remove('playing');
      });
      btn.classList.toggle('playing', !isPlaying);
    });
  });

  document.querySelectorAll('.ep-play-icon').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isPlaying = btn.classList.contains('playing');
      document.querySelectorAll('.ep-play-icon.playing').forEach(function(other) {
        if (other !== btn) other.classList.remove('playing');
      });
      btn.classList.toggle('playing', !isPlaying);
    });
  });
})();
