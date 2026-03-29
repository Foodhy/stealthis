let comments = [
  {
    id: 1,
    name: "Sarah Kim",
    color: "#0ea5e9",
    text: "This is exactly what I needed! Copying the sidebar component right now 🚀",
    time: new Date(Date.now() - 3600000 * 2),
    likes: 14,
    liked: false,
    replies: [
      {
        id: 11,
        name: "Marcus Reed",
        color: "#8b5cf6",
        text: "Same here — saved me hours of work.",
        time: new Date(Date.now() - 3600000),
        likes: 5,
        liked: false,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    name: "Julia Lee",
    color: "#f59e0b",
    text: "The breadcrumb with SEO structured data injection is a really nice touch. Love the attention to detail.",
    time: new Date(Date.now() - 86400000),
    likes: 8,
    liked: false,
    replies: [],
  },
  {
    id: 3,
    name: "David Okonkwo",
    color: "#34d399",
    text: "Is there a React version of the sidebar component planned?",
    time: new Date(Date.now() - 86400000 * 2),
    likes: 3,
    liked: false,
    replies: [],
  },
];
let nextId = 100;

function timeAgo(date) {
  const sec = Math.floor((Date.now() - date) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return Math.floor(sec / 60) + " min ago";
  if (sec < 86400)
    return Math.floor(sec / 3600) + " hour" + (Math.floor(sec / 3600) > 1 ? "s" : "") + " ago";
  return Math.floor(sec / 86400) + " day" + (Math.floor(sec / 86400) > 1 ? "s" : "") + " ago";
}

function buildComment(c, isReply = false) {
  const el = document.createElement("div");
  el.className = isReply ? "comment reply" : "comment";
  el.dataset.id = c.id;

  const repliesHTML = c.replies?.length
    ? `<div class="replies-wrap">${c.replies.map((r) => buildComment(r, true).outerHTML).join("")}</div>`
    : "";

  el.innerHTML = `
    <div class="comment-header">
      <div class="comment-av" style="background:${c.color};width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:0.65rem;font-weight:700;color:#fff;flex-shrink:0">${c.name
        .split(" ")
        .map((n) => n[0])
        .join("")}</div>
      <span class="comment-name">${c.name}</span>
      <span class="comment-time">${timeAgo(c.time)}</span>
    </div>
    <p class="comment-body">${c.text}</p>
    <div class="comment-actions">
      <button class="action-btn like-btn ${c.liked ? "liked" : ""}" data-id="${c.id}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="${c.liked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="like-count">${c.likes}</span>
      </button>
      ${!isReply ? `<button class="action-btn reply-btn" data-id="${c.id}">Reply</button>` : ""}
    </div>
    ${repliesHTML}
    ${
      !isReply
        ? `<div class="inline-reply-form" id="replyForm-${c.id}" hidden>
      <div class="comment-av" style="background:#818cf8;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:0.6rem;font-weight:700;color:#fff">You</div>
      <div class="comment-form-inner" style="flex:1">
        <textarea class="comment-textarea" rows="2" placeholder="Write a reply…"></textarea>
        <div class="comment-form-footer">
          <button class="comment-submit-btn cancel-reply-btn" data-id="${c.id}" style="background:transparent;border:1px solid #2a2d3a;color:#64748b;margin-right:8px">Cancel</button>
          <button class="comment-submit-btn submit-reply-btn" data-id="${c.id}">Reply</button>
        </div>
      </div>
    </div>`
        : ""
    }
  `;
  return el;
}

function renderComments() {
  const list = document.getElementById("commentList");
  list.innerHTML = "";
  comments.forEach((c) => list.appendChild(buildComment(c)));
  document.getElementById("commentsCount").textContent = comments.reduce(
    (a, c) => a + 1 + (c.replies?.length || 0),
    0
  );

  // Events
  list.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = +btn.dataset.id;
      const c = findComment(id);
      if (!c) return;
      c.liked = !c.liked;
      c.likes += c.liked ? 1 : -1;
      renderComments();
    });
  });
  list.querySelectorAll(".reply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const form = document.getElementById("replyForm-" + btn.dataset.id);
      if (form) form.hidden = !form.hidden;
    });
  });
  list.querySelectorAll(".cancel-reply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const form = document.getElementById("replyForm-" + btn.dataset.id);
      if (form) form.hidden = true;
    });
  });
  list.querySelectorAll(".submit-reply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const form = document.getElementById("replyForm-" + btn.dataset.id);
      const ta = form?.querySelector("textarea");
      if (!ta?.value.trim()) return;
      const c = findComment(+btn.dataset.id);
      if (c) {
        c.replies.push({
          id: nextId++,
          name: "You",
          color: "#818cf8",
          text: ta.value.trim(),
          time: new Date(),
          likes: 0,
          liked: false,
          replies: [],
        });
        renderComments();
      }
    });
  });
}

function findComment(id) {
  for (const c of comments) {
    if (c.id === id) return c;
    if (c.replies) for (const r of c.replies) if (r.id === id) return r;
  }
  return null;
}

// Top comment form
const topForm = document.getElementById("topCommentForm");
const topTA = document.getElementById("topTextarea");
const topCC = document.getElementById("topCharCount");
topTA?.addEventListener("input", () => {
  const n = topTA.value.length;
  topCC.textContent = n + " / 500";
  topCC.classList.toggle("warn", n > 450);
});
topForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const txt = topTA.value.trim();
  if (!txt) return;
  comments.unshift({
    id: nextId++,
    name: "You",
    color: "#818cf8",
    text: txt,
    time: new Date(),
    likes: 0,
    liked: false,
    replies: [],
  });
  topTA.value = "";
  topCC.textContent = "0 / 500";
  renderComments();
});

renderComments();
