/* ============================================================
   NEWSPAPER / EDITORIAL — Interactive Script
   - Badge section filter (click to activate/deactivate)
   - Ghost button "read more" underline animation
   - Profile headline "BREAKING" ticker
   - Input character counter with editorial feedback
   - Masthead date/edition ticker
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. Badge section filter — click to toggle active state
  ---------------------------------------------------------- */
  const badges = document.querySelectorAll('.badge');

  badges.forEach(function (badge) {
    badge.addEventListener('click', function () {
      const isActive = badge.classList.contains('badge-active');

      // Allow multiple active badges — just toggle clicked one
      if (isActive) {
        badge.classList.remove('badge-active');
      } else {
        badge.classList.add('badge-active');
      }
    });
  });

  /* ----------------------------------------------------------
     2. Headline kicker — cycle "BREAKING" / "EXCLUSIVE" / "OPINION"
  ---------------------------------------------------------- */
  const kicker = document.querySelector('.headline-kicker');
  if (kicker) {
    const labels = ['BREAKING', 'EXCLUSIVE', 'OPINION', 'ANALYSIS', 'SPECIAL REPORT'];
    let idx = 0;

    setInterval(function () {
      idx = (idx + 1) % labels.length;
      kicker.style.opacity = '0';
      setTimeout(function () {
        kicker.textContent = '';
        // Rebuild inner structure (kicker uses ::before line via CSS)
        // So we just update text and re-add the ::before via class
        const dash = document.createElement('span');
        dash.style.cssText = 'display:inline-block;width:16px;height:2px;background:#CC0000;flex-shrink:0;margin-right:6px;vertical-align:middle';
        kicker.appendChild(dash);
        kicker.appendChild(document.createTextNode(labels[idx]));
        kicker.style.opacity = '1';
        kicker.style.transition = 'opacity 0.4s';
      }, 300);
    }, 4000);
  }

  /* ----------------------------------------------------------
     3. Input character counter + editorial feedback
  ---------------------------------------------------------- */
  const letterInput = document.getElementById('letter-input');
  const inputHint = document.querySelector('.input-hint');

  if (letterInput && inputHint) {
    const maxLength = 80;
    const editorialComments = [
      'Letters may be edited for length and clarity.',
      'Thank you. Our editors will review your submission.',
      'All submissions become property of The Gazette.',
      'Please include your city of residence.',
      'Anonymous letters will not be published.',
    ];
    let commentIdx = 0;

    letterInput.addEventListener('input', function () {
      const len = letterInput.value.length;
      const remaining = maxLength - len;

      if (len === 0) {
        inputHint.textContent = 'Letters may be edited for length and clarity.';
        inputHint.style.color = '';
        return;
      }

      if (remaining <= 10) {
        inputHint.textContent = remaining + ' characters remaining';
        inputHint.style.color = '#CC0000';
      } else {
        inputHint.textContent = len + ' characters';
        inputHint.style.color = '';
      }
    });

    letterInput.setAttribute('maxlength', maxLength);

    // On enter: show editorial acknowledgement
    letterInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const val = letterInput.value.trim();
      if (!val) return;

      commentIdx = (commentIdx + 1) % editorialComments.length;
      inputHint.textContent = '✓ ' + editorialComments[commentIdx];
      inputHint.style.color = '#1A8C1A';

      setTimeout(function () {
        letterInput.value = '';
        inputHint.textContent = 'Letters may be edited for length and clarity.';
        inputHint.style.color = '';
      }, 2500);
    });
  }

  /* ----------------------------------------------------------
     4. Read more links — underline ripple on hover
     (CSS handles the visual; JS adds a class for fine control)
  ---------------------------------------------------------- */
  const readMoreLinks = document.querySelectorAll('.read-more-link, .btn-ghost');

  readMoreLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      link.style.textDecorationThickness = '2px';
    });

    link.addEventListener('mouseleave', function () {
      link.style.textDecorationThickness = '';
    });
  });

  /* ----------------------------------------------------------
     5. Subscribe button — confirmation flash
  ---------------------------------------------------------- */
  const subscribeBtn = document.querySelector('.btn-primary');
  if (subscribeBtn) {
    const originalText = subscribeBtn.textContent.trim();

    subscribeBtn.addEventListener('click', function () {
      subscribeBtn.textContent = 'SUBSCRIBED ✓';
      subscribeBtn.style.background = '#1A1008';
      subscribeBtn.style.borderColor = '#1A1008';
      subscribeBtn.disabled = true;

      setTimeout(function () {
        subscribeBtn.textContent = originalText;
        subscribeBtn.style.background = '';
        subscribeBtn.style.borderColor = '';
        subscribeBtn.disabled = false;
      }, 2000);
    });
  }

  /* ----------------------------------------------------------
     6. Section banner — click to cycle section names
  ---------------------------------------------------------- */
  const sectionLabel = document.querySelector('.section-label');
  if (sectionLabel) {
    const sections = [
      'STYLE & DESIGN',
      'WORLD NEWS',
      'ARTS & CULTURE',
      'OPINION',
      'SPORTS',
      'TECHNOLOGY',
    ];
    let sectionIdx = 0;

    sectionLabel.style.cursor = 'pointer';
    sectionLabel.title = 'Click to switch section';

    sectionLabel.addEventListener('click', function () {
      sectionIdx = (sectionIdx + 1) % sections.length;
      sectionLabel.style.opacity = '0';
      sectionLabel.style.transition = 'opacity 0.2s';

      setTimeout(function () {
        sectionLabel.textContent = sections[sectionIdx];
        sectionLabel.style.opacity = '1';
      }, 200);
    });
  }
})();
