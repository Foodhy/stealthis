// Greendale Vet Specialty landing — vanilla JS, no libraries.
(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    // Close the menu after tapping a link
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Referral form: lightweight inline confirmation ---------- */
  var form = document.getElementById('referralForm');
  var status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var vet = form.vetName.value.trim();
      var email = form.vetEmail.value.trim();
      var patient = form.patient.value.trim();
      var service = form.service.value;

      if (!vet || !email || !patient || !service) {
        status.textContent = 'Please complete the clinic, email, patient and specialty fields.';
        status.className = 'form-status err';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Please enter a valid email so our coordinator can reach you.';
        status.className = 'form-status err';
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      // Simulate a submit — wire this to your real intake endpoint.
      window.setTimeout(function () {
        status.textContent =
          'Referral received for ' + patient + ' (' + service + '). A specialty coordinator will call ' + vet + ' within 2 hours.';
        status.className = 'form-status ok';
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = 'Send referral'; }
      }, 650);
    });
  }
})();
