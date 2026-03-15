// Material Design — script.js
// Ripple effect on buttons with class .ripple

document.querySelectorAll('.ripple').forEach(el => {
  el.addEventListener('click', function (e) {
    const rect   = el.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${x}px;
      top:    ${y}px;
    `;

    el.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  });
});

// Contained button state toggle
const containedBtn = document.querySelector('.btn-contained');
if (containedBtn) {
  let active = false;
  containedBtn.addEventListener('click', () => {
    active = !active;
    containedBtn.querySelector('.btn-label').textContent = active ? 'ACTIVE' : 'CONTAINED';
    containedBtn.style.background = active ? 'var(--md-secondary)' : '';
    containedBtn.style.color = active ? 'var(--md-on-secondary)' : '';
  });
}

// Fix: Material floating label fieldset legend width sync
// The legend creates a gap in the border when floated.
// We toggle a class so CSS can widen the legend notch.
const inputs = document.querySelectorAll('.text-field-input');
inputs.forEach(input => {
  const outline = input.closest('.text-field-outlined');
  const legend  = outline && outline.querySelector('.text-field-legend');

  function updateNotch() {
    if (!legend) return;
    if (input.value.length > 0 || document.activeElement === input) {
      outline.classList.add('notched');
    } else {
      outline.classList.remove('notched');
    }
  }

  input.addEventListener('focus', updateNotch);
  input.addEventListener('blur', updateNotch);
  input.addEventListener('input', updateNotch);
  updateNotch();
});
