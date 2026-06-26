(function () {
  'use strict';

  /* ---------- Dismissible offer banner ---------- */
  var offer = document.getElementById('offer');
  var offerClose = document.getElementById('offerClose');
  if (offerClose && offer) {
    offerClose.addEventListener('click', function () {
      offer.setAttribute('hidden', '');
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- "Book" buttons focus the request form ---------- */
  document.querySelectorAll('[data-book]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pet = document.getElementById('pet');
      if (pet) {
        // let the smooth-scroll happen, then place the cursor
        setTimeout(function () { pet.focus(); }, 450);
      }
    });
  });

  /* ---------- Quick booking form ---------- */
  var form = document.getElementById('quickForm');
  var note = document.getElementById('formNote');
  if (form && note) {
    // Default the date picker to tomorrow.
    var day = document.getElementById('day');
    if (day && !day.value) {
      var t = new Date();
      t.setDate(t.getDate() + 1);
      day.value = t.toISOString().slice(0, 10);
      day.min = new Date().toISOString().slice(0, 10);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var pet = form.pet.value.trim();
      var reason = form.reason.value;
      var when = form.day.value;

      note.classList.remove('is-err');

      if (!pet || !reason || !when) {
        note.textContent = 'Please fill in every field so we can find a slot.';
        note.classList.add('is-err');
        return;
      }

      var date = new Date(when + 'T00:00:00');
      var pretty = date.toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric'
      });

      note.textContent = '🐾 Thanks! We will text you to confirm ' + pet +
        '’s ' + reason.toLowerCase() + ' for ' + pretty + '.';
      form.reset();
      if (day) day.value = '';
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
