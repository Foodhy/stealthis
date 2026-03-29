const trigger = document.getElementById('msTrigger');
const dropdown = document.getElementById('msDropdown');
const backdrop = document.getElementById('msBackdrop');
const selectedLabel = document.getElementById('msSelected');

function open() { dropdown.hidden = false; backdrop.hidden = false; trigger.classList.add('open'); }
function close() { dropdown.hidden = true; backdrop.hidden = true; trigger.classList.remove('open'); }

trigger.addEventListener('click', () => dropdown.hidden ? open() : close());
backdrop.addEventListener('click', close);

dropdown.querySelectorAll('.ms-option').forEach(opt => {
  opt.addEventListener('click', () => {
    // Update selection
    dropdown.querySelectorAll('.ms-option').forEach(o => {
      o.classList.remove('ms-option--selected');
      o.querySelector('.ms-check').textContent = '';
    });
    opt.classList.add('ms-option--selected');
    opt.querySelector('.ms-check').textContent = '✓';

    // Update trigger
    const color = opt.dataset.color;
    const name = opt.dataset.name;
    selectedLabel.textContent = name;
    trigger.querySelector('.ms-dot').style.background = color;
    close();
  });
});
