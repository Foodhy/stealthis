const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const total = slides.length;

let current = 0;

function goTo(index) {
  if (index < 0 || index >= total) return;

  // Exit current slide
  slides[current].classList.remove('active');
  slides[current].classList.add('exit-left');
  setTimeout(() => slides[current].classList.remove('exit-left'), 400);

  current = index;

  // Enter new slide
  slides[current].classList.add('active');

  // Update dots
  dots.forEach((dot, i) => dot.classList.toggle('active', i === current));

  // Update next button
  if (current === total - 1) {
    nextBtn.textContent = 'Get Started';
    nextBtn.classList.add('finish');
    skipBtn.style.visibility = 'hidden';
  } else {
    nextBtn.textContent = 'Next';
    nextBtn.classList.remove('finish');
    skipBtn.style.visibility = 'visible';
  }
}

nextBtn.addEventListener('click', () => {
  if (current === total - 1) {
    // "Get Started" action
    nextBtn.textContent = 'Done!';
    setTimeout(() => {
      nextBtn.textContent = 'Get Started';
      goTo(0);
      skipBtn.style.visibility = 'visible';
    }, 1500);
  } else {
    goTo(current + 1);
  }
});

skipBtn.addEventListener('click', () => goTo(total - 1));

dots.forEach(dot => {
  dot.addEventListener('click', () => goTo(Number(dot.dataset.step)));
});
