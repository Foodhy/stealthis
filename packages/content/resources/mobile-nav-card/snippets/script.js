const gridScreen = document.querySelector('.grid-screen');
const detailScreens = document.querySelectorAll('.detail-screen');
const navCards = document.querySelectorAll('.nav-card');
const backBtns = document.querySelectorAll('.back-btn');

function showDetail(target) {
  gridScreen.classList.remove('active');
  detailScreens.forEach(s => {
    s.classList.toggle('active', s.dataset.screen === target);
  });
}

function showGrid() {
  detailScreens.forEach(s => s.classList.remove('active'));
  gridScreen.classList.add('active');
}

navCards.forEach(card => {
  card.addEventListener('click', () => {
    showDetail(card.dataset.target);
  });
});

backBtns.forEach(btn => {
  btn.addEventListener('click', showGrid);
});
