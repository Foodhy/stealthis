// Skeuomorphism — script.js
// Physical button press: add/remove .is-pressed on mousedown/mouseup.
// Also: subtle click sound via Web Audio API (optional, user gesture required).

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousedown', () => {
    btn.style.transform = 'translateY(1px)';
  });

  btn.addEventListener('mouseup', () => {
    btn.style.transform = '';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// Primary button: toggle commission state
const primaryBtn = document.querySelector('.btn-primary');
if (primaryBtn) {
  let commissioned = false;
  primaryBtn.addEventListener('click', () => {
    commissioned = !commissioned;
    primaryBtn.textContent = commissioned ? 'Enquiry Sent ✓' : 'Commission';
    if (commissioned) {
      primaryBtn.style.background = 'linear-gradient(to bottom, #c8ddb0 0%, #88b860 40%, #6a9a42 100%)';
      primaryBtn.style.color = '#1a3a0a';
    } else {
      primaryBtn.style.background = '';
      primaryBtn.style.color = '';
    }
  });
}

// Input: subtle focus ring enhancement already in CSS,
// but we add a soft "paper crinkle" class toggle for fun.
document.querySelectorAll('.field-input').forEach(input => {
  input.addEventListener('focus', () => input.closest('.field').classList.add('focused'));
  input.addEventListener('blur',  () => input.closest('.field').classList.remove('focused'));
});
