// Flat Design — script.js
// Bouncy press feedback on buttons.

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.style.transform = 'scale(0.93)';
    setTimeout(() => { btn.style.transform = ''; }, 150);
  });
});

// Toggle follow state on primary button
const followBtn = document.querySelector('.btn-primary');
if (followBtn) {
  let following = false;
  followBtn.addEventListener('click', () => {
    following = !following;
    followBtn.textContent = following ? 'Following ✓' : 'Follow';
    followBtn.style.background = following ? '#4ecdc4' : '';
  });
}
