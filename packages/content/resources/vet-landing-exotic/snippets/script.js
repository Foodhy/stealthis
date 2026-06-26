(function () {
  'use strict';

  /* ---------- Species filter ---------- */
  var speciesCards = document.querySelectorAll('.species-card');
  var services = document.querySelectorAll('.service-card');
  var noResults = document.querySelector('.no-results');

  function applyFilter(species) {
    var shown = 0;
    services.forEach(function (card) {
      var families = (card.getAttribute('data-species') || '').split(/\s+/);
      var match = species === 'all' || families.indexOf(species) !== -1;
      card.classList.toggle('is-dim', !match);
      if (match) shown++;
    });
    if (noResults) noResults.hidden = shown !== 0;
  }

  speciesCards.forEach(function (card) {
    card.addEventListener('click', function () {
      speciesCards.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('is-active');
      card.setAttribute('aria-pressed', 'true');
      applyFilter(card.getAttribute('data-species'));

      // scroll the services section into view on filter (skip for "all")
      if (card.getAttribute('data-species') !== 'all') {
        var section = document.getElementById('services');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Care tips rotator ---------- */
  var tips = [
    { emoji: '🦜', cat: 'For bird owners', text: 'Rotate your bird’s perches in width and texture — single-size dowels cause pressure sores called bumblefoot.' },
    { emoji: '🦎', cat: 'For reptile owners', text: 'Measure basking temps with a probe thermometer, not a stick-on dial — dial gauges can be off by 8–10°F.' },
    { emoji: '🐰', cat: 'For small-mammal owners', text: 'Unlimited timothy hay keeps rabbit and guinea-pig molars worn down and their guts moving.' },
    { emoji: '🐠', cat: 'For aquatic owners', text: 'Never change 100% of tank water at once — swap 20–30% weekly to protect your fish’s beneficial bacteria.' }
  ];

  var tipText = document.getElementById('tipText');
  var tipCat = document.getElementById('tipCat');
  var tipEmoji = document.querySelector('.tip-emoji');
  var dotsWrap = document.getElementById('tipDots');
  var current = 0;
  var timer = null;

  function renderTip(i) {
    if (!tipText) return;
    var t = tips[i];
    tipText.style.opacity = '0';
    window.setTimeout(function () {
      tipText.textContent = t.text;
      tipCat.textContent = t.cat;
      if (tipEmoji) tipEmoji.textContent = t.emoji;
      tipText.style.opacity = '1';
    }, 180);
    Array.prototype.forEach.call(dotsWrap.children, function (dot, di) {
      dot.classList.toggle('is-on', di === i);
      dot.setAttribute('aria-selected', di === i ? 'true' : 'false');
    });
    current = i;
  }

  function goTo(i) {
    renderTip(i);
    restartAuto();
  }

  function restartAuto() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(function () {
      renderTip((current + 1) % tips.length);
    }, 6000);
  }

  if (dotsWrap) {
    tips.forEach(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Care tip ' + (i + 1));
      b.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(b);
    });
    renderTip(0);
    restartAuto();
  }

  /* ---------- Booking form validation ---------- */
  var form = document.getElementById('bookForm');
  var note = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.ownerName;
      var pet = form.petName;
      var email = form.ownerEmail;
      var valid = true;

      [name, pet, email].forEach(function (input) {
        var ok = input.value.trim().length > 0;
        if (input === email) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        }
        input.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        note.textContent = 'Please fill in your name, pet and a valid email.';
        note.className = 'form-note err';
        return;
      }

      var pet2 = pet.value.trim();
      note.textContent = 'Thanks ' + name.value.trim().split(' ')[0] + '! We’ll confirm ' +
        pet2 + '’s visit by email within the hour.';
      note.className = 'form-note ok';
      form.reset();
    });
  }
})();
