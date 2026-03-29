const likeBtn = document.querySelector(".action-btn.like");
const commentInput = document.querySelector(".card-input input");
const sendBtn = document.querySelector(".send-comment");

let liked = false;
let likesCount = 42;

likeBtn.addEventListener("click", () => {
  liked = !liked;
  const countEl = likeBtn.querySelector(".count");
  const iconEl = likeBtn.querySelector(".icon");

  if (liked) {
    likesCount++;
    likeBtn.style.color = "#ef4444";
    iconEl.textContent = "♥";
  } else {
    likesCount--;
    likeBtn.style.color = "";
    iconEl.textContent = "♡";
  }
  countEl.textContent = likesCount;
});

commentInput.addEventListener("input", () => {
  sendBtn.disabled = commentInput.value.trim() === "";
});

sendBtn.addEventListener("click", () => {
  if (commentInput.value.trim()) {
    alert("Comment posted: " + commentInput.value);
    commentInput.value = "";
    sendBtn.disabled = true;
  }
});
