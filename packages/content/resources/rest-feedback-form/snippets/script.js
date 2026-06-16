/* =============================================
   Post-Meal Feedback Form — Interactive Logic
   ============================================= */

(function () {
  'use strict';

  // ---- State ----
  const state = {
    step: 1,
    mood: null,
    ratings: { food: 0, service: 0, ambiance: 0, value: 0 },
    comment: '',
    contact: false,
    email: '',
  };

  const MOOD_LABELS = {
    terrible: { emoji: '😞', label: 'Terrible', sub: 'We\'re sorry to hear that' },
    poor:     { emoji: '😐', label: 'Poor',     sub: 'We\'ll work to do better' },
    okay:     { emoji: '🙂', label: 'Okay',     sub: 'Thanks for letting us know' },
    great:    { emoji: '😊', label: 'Great',    sub: 'So glad you enjoyed it!' },
    amazing:  { emoji: '🤩', label: 'Amazing',  sub: 'We\'re thrilled to hear that!' },
  };

  const DIM_LABELS = {
    food:     'Food Quality',
    service:  'Service',
    ambiance: 'Ambiance',
    value:    'Value',
  };

  // ---- Element references ----
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  const steps = {
    1: $('#step-1'),
    2: $('#step-2'),
    3: $('#step-3'),
    4: $('#step-4'),
  };

  const progressDots = $$('.progress-dot');
  const progressFill = $('#progress-fill');

  // ---- Progress helpers ----
  function updateProgress(currentStep) {
    // Progress fill: 0% at step 1, 33% at step 2, 66% at step 3, 100% at step 4
    const pct = ((currentStep - 1) / 3) * 100;
    progressFill.style.width = pct + '%';

    progressDots.forEach((dot) => {
      const dotStep = parseInt(dot.dataset.step, 10);
      dot.classList.toggle('active', dotStep === currentStep);
      dot.classList.toggle('completed', dotStep < currentStep);
    });
  }

  // ---- Step navigation ----
  function goToStep(nextStep) {
    const current = steps[state.step];
    const next = steps[nextStep];

    if (!next) return;

    // Hide current, show next
    if (current) current.classList.add('hidden');

    // Force reflow so animation re-triggers
    next.classList.remove('hidden');
    void next.offsetWidth;

    state.step = nextStep;
    updateProgress(nextStep);

    // Special setup for step 4
    if (nextStep === 4) renderSummary();
  }

  // ---- Step 1: Emoji mood ----
  $$('.emoji-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mood = btn.dataset.mood;
      $$('.emoji-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Auto-advance after brief delay
      setTimeout(() => goToStep(2), 400);
    });
  });

  // ---- Step 2: Star ratings ----
  $$('.stars').forEach((starGroup) => {
    const dimension = starGroup.dataset.dimension;
    const starBtns = $$('.star-btn', starGroup);

    starBtns.forEach((star, idx) => {
      const value = parseInt(star.dataset.value, 10);

      // Click
      star.addEventListener('click', () => {
        state.ratings[dimension] = value;
        updateStarDisplay(starGroup, value);
        hideStep2Error();
      });

      // Hover
      star.addEventListener('mouseenter', () => {
        highlightStarsUpTo(starBtns, idx);
      });

      star.addEventListener('mouseleave', () => {
        resetStarHover(starBtns, state.ratings[dimension]);
      });
    });
  });

  function updateStarDisplay(group, selectedValue) {
    $$('.star-btn', group).forEach((btn) => {
      const val = parseInt(btn.dataset.value, 10);
      btn.classList.toggle('selected', val <= selectedValue);
      btn.classList.remove('hover-active');
      // Swap character
      btn.textContent = val <= selectedValue ? '★' : '☆';
    });
  }

  function highlightStarsUpTo(btns, hoverIdx) {
    btns.forEach((btn, idx) => {
      if (idx <= hoverIdx) {
        btn.classList.add('hover-active');
        btn.textContent = '★';
      } else {
        btn.classList.remove('hover-active');
        const dim = btn.closest('.stars').dataset.dimension;
        btn.textContent = parseInt(btn.dataset.value, 10) <= state.ratings[dim] ? '★' : '☆';
      }
    });
  }

  function resetStarHover(btns, selectedValue) {
    btns.forEach((btn) => {
      btn.classList.remove('hover-active');
      const val = parseInt(btn.dataset.value, 10);
      btn.textContent = val <= selectedValue ? '★' : '☆';
    });
  }

  function hideStep2Error() {
    $('#step2-error').classList.add('hidden');
  }

  // Step 2 back/next
  $('#back-2').addEventListener('click', () => goToStep(1));

  $('#next-2').addEventListener('click', () => {
    const anyRated = Object.values(state.ratings).some((v) => v > 0);
    if (!anyRated) {
      $('#step2-error').classList.remove('hidden');
      return;
    }
    goToStep(3);
  });

  // ---- Step 3: Comment + contact ----
  const commentInput = $('#comment-input');
  const charUsed = $('#char-used');
  const contactCheckbox = $('#contact-checkbox');
  const emailField = $('#email-field');
  const emailInput = $('#email-input');

  commentInput.addEventListener('input', () => {
    state.comment = commentInput.value;
    charUsed.textContent = commentInput.value.length;
  });

  contactCheckbox.addEventListener('change', () => {
    state.contact = contactCheckbox.checked;
    emailField.classList.toggle('hidden', !contactCheckbox.checked);
    if (contactCheckbox.checked) emailInput.focus();
  });

  emailInput.addEventListener('input', () => {
    state.email = emailInput.value;
  });

  $('#back-3').addEventListener('click', () => goToStep(2));

  $('#submit-btn').addEventListener('click', () => {
    goToStep(4);
  });

  // ---- Step 4: Summary render ----
  function renderSummary() {
    const moodData = MOOD_LABELS[state.mood] || { emoji: '🙂', label: 'No mood selected', sub: '' };

    // Mood block
    const summaryMood = $('#summary-mood');
    summaryMood.innerHTML = `
      <span class="summary-mood-emoji">${moodData.emoji}</span>
      <div>
        <div class="summary-mood-text">${moodData.label}</div>
        <div class="summary-mood-sub">${moodData.sub}</div>
      </div>
    `;

    // Rating chips
    const summaryChips = $('#summary-chips');
    summaryChips.innerHTML = '';

    const dims = Object.keys(state.ratings);
    const ratedDims = dims.filter((d) => state.ratings[d] > 0);

    if (ratedDims.length === 0) {
      summaryChips.innerHTML = `<p style="font-size:0.8rem;color:var(--warm-gray);">No ratings submitted.</p>`;
    } else {
      ratedDims.forEach((dim) => {
        const score = state.ratings[dim];
        const filledStars = '★'.repeat(score);
        const emptyStars = '☆'.repeat(5 - score);
        const chip = document.createElement('div');
        chip.className = 'summary-chip';
        chip.innerHTML = `
          <span class="chip-label">${DIM_LABELS[dim]}</span>
          <span class="chip-stars">${filledStars}<span class="empty">${emptyStars}</span></span>
        `;
        summaryChips.appendChild(chip);
      });
    }
  }

  // ---- Restart ----
  $('#restart-btn').addEventListener('click', () => {
    // Reset state
    state.step = 1;
    state.mood = null;
    state.ratings = { food: 0, service: 0, ambiance: 0, value: 0 };
    state.comment = '';
    state.contact = false;
    state.email = '';

    // Reset UI — emoji
    $$('.emoji-btn').forEach((b) => b.classList.remove('selected'));

    // Reset stars
    $$('.stars').forEach((group) => {
      $$('.star-btn', group).forEach((btn) => {
        btn.classList.remove('selected', 'hover-active');
        btn.textContent = '☆';
      });
    });

    // Reset fields
    commentInput.value = '';
    charUsed.textContent = '0';
    contactCheckbox.checked = false;
    emailField.classList.add('hidden');
    emailInput.value = '';

    // Reset error
    $('#step2-error').classList.add('hidden');

    // Navigate
    goToStep(1);
  });

  // ---- Init ----
  updateProgress(1);
})();
