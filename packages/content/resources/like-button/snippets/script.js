const likeBtn = document.getElementById('like-btn');
const likeCountEl = document.getElementById('like-count');
let count = 1234;
let liked = false;

likeBtn.addEventListener('click', () => {
  liked = !liked;
  
  if (liked) {
    likeBtn.classList.add('liked');
    count++;
  } else {
    likeBtn.classList.remove('liked');
    count--;
  }
  
  likeCountEl.textContent = count.toLocaleString();
});
