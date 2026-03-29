// No dynamic JS needed — flip cards use CSS :hover.
// Touch devices: tap to flip
document.querySelectorAll('.team-card').forEach(card => {
  let flipped = false;
  card.addEventListener('click', () => {
    flipped = !flipped;
    card.style.transform = flipped ? 'rotateY(180deg)' : '';
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');
    if (flipped) {
      front.style.transform = 'rotateY(-180deg)';
      back.style.transform = 'rotateY(0deg)';
    } else {
      front.style.transform = '';
      back.style.transform = '';
    }
  });
});
