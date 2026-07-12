(function () {
  "use strict";

  // ---- Fictional but believable data -------------------------------------
  var PHOTOS = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&q=80"
  ];
  var GRADS = [
    "linear-gradient(135deg,#ff5e6c,#8b5cf6)",
    "linear-gradient(135deg,#ff8fb1,#7c3aed)",
    "linear-gradient(135deg,#fbb040,#ff5e6c)",
    "linear-gradient(135deg,#8b5cf6,#38bdf8)",
    "linear-gradient(135deg,#ff5e6c,#ff8fb1)"
  ];

  var FIRST = ["Mara", "Leo", "Priya", "Diego", "Aya", "Noah", "Sofia", "Ravi", "Elena", "Kai",
    "Nina", "Theo", "Luna", "Marco", "Zoe", "Ivan", "Rosa", "Sam", "Yuki", "Ben"];
  var CITIES = ["Downtown", "Riverside", "Old Town", "Harbor", "Midtown", "The Heights", "Seaside", "Parkview"];
  var INTERESTS = ["Coffee", "Hiking", "Vinyl", "Yoga", "Ramen", "Film", "Climbing", "Painting",
    "Dogs", "Travel", "Board games", "Live music", "Baking", "Cycling"];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  var uid = 0;
  function makeProfile() {
    var tags = [];
    var pool = INTERESTS.slice();
    for (var i = 0; i < 2; i++) tags.push(pool.splice(rand(0, pool.length - 1), 1)[0]);
    return {
      id: ++uid,
      name: pick(FIRST),
      age: rand(21, 39),
      city: pick(CITIES),
      dist: rand(1, 78),
      online: Math.random() > 0.42,
      isNew: Math.random() > 0.7,
      verified: Math.random() > 0.55,
      photo: pick(PHOTOS),
      grad: pick(GRADS),
      tags: tags,
      liked: false
    };
  }

  var profiles = [];
  function seed(n) { for (var i = 0; i < n; i++) profiles.push(makeProfile()); }
  seed(14);

  // ---- Elements ----------------------------------------------------------
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var distance = document.getElementById("distance");
  var age = document.getElementById("age");
  var distanceOut = document.getElementById("distanceOut");
  var ageOut = document.getElementById("ageOut");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-vibe]"));
  var shuffleBtn = document.getElementById("shuffleBtn");
  var loadMore = document.getElementById("loadMore");
  var resultCount = document.getElementById("resultCount");
  var likedCount = document.getElementById("likedCount");
  var likedPill = document.getElementById("likedPill");
  var toastEl = document.getElementById("toast");

  var vibe = "all";
  var likes = 0;

  // ---- Toast -------------------------------------------------------------
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2000);
  }

  // ---- Filtering ---------------------------------------------------------
  function visible() {
    var maxD = +distance.value;
    var maxA = +age.value;
    return profiles.filter(function (p) {
      if (p.dist > maxD) return false;
      if (p.age > maxA) return false;
      if (vibe === "online" && !p.online) return false;
      if (vibe === "new" && !p.isNew) return false;
      if (vibe === "verified" && !p.verified) return false;
      return true;
    });
  }

  // ---- Render ------------------------------------------------------------
  function cardHTML(p) {
    var status = p.online
      ? '<span class="status"><span class="dot"></span>Online</span>'
      : '<span class="status off"><span class="dot"></span>Away</span>';
    var badge = p.verified ? '<span class="verified" title="Verified">✓</span>' : "";
    var tags = p.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("");
    var likedCls = p.liked ? " liked" : "";
    var pressed = p.liked ? "true" : "false";
    var label = (p.liked ? "Unlike " : "Like ") + p.name;
    return (
      '<article class="card" tabindex="0" data-id="' + p.id + '" ' +
        'aria-label="' + p.name + ", " + p.age + ", " + p.city + ", " + p.dist + ' km away">' +
        '<div class="photo" style="background-image:' + p.grad + ";background-image:url(" + p.photo + ')"></div>' +
        '<div class="scrim"></div>' +
        status + badge +
        '<button class="like' + likedCls + '" type="button" data-like="' + p.id + '" ' +
          'aria-pressed="' + pressed + '" aria-label="' + label + '">♥</button>' +
        '<div class="meta">' +
          '<div class="name-row"><span class="name">' + p.name + '</span>' +
          '<span class="age">' + p.age + "</span></div>" +
          '<div class="place">📍 ' + p.city + " · " + p.dist + ' km</div>' +
          '<div class="tags">' + tags + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var list = visible();
    grid.innerHTML = list.map(cardHTML).join("");
    empty.hidden = list.length !== 0;
    var onlineCount = list.filter(function (p) { return p.online; }).length;
    resultCount.textContent = list.length + " people · " + onlineCount + " online";
  }

  // ---- Like handling -----------------------------------------------------
  function toggleLike(id, btn) {
    var p = profiles.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    p.liked = !p.liked;
    btn.classList.toggle("liked", p.liked);
    btn.setAttribute("aria-pressed", p.liked ? "true" : "false");
    btn.setAttribute("aria-label", (p.liked ? "Unlike " : "Like ") + p.name);

    if (p.liked) {
      likes++;
      spawnBurst(btn);
      likedPill.classList.remove("bump");
      void likedPill.offsetWidth;
      likedPill.classList.add("bump");
      toast("You liked " + p.name + " 💖");
    } else {
      likes = Math.max(0, likes - 1);
      toast("Removed " + p.name);
    }
    likedCount.textContent = likes;
  }

  function spawnBurst(btn) {
    var card = btn.closest(".card");
    if (!card) return;
    var b = document.createElement("span");
    b.className = "burst";
    b.textContent = pick(["💖", "💘", "✨", "💕"]);
    b.style.right = "16px";
    b.style.bottom = "84px";
    card.appendChild(b);
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 900);
  }

  // ---- Events ------------------------------------------------------------
  grid.addEventListener("click", function (e) {
    var likeBtn = e.target.closest("[data-like]");
    if (likeBtn) {
      e.stopPropagation();
      toggleLike(+likeBtn.getAttribute("data-like"), likeBtn);
      return;
    }
    var card = e.target.closest(".card");
    if (card) {
      var name = card.querySelector(".name").textContent;
      toast("Opening " + name + "'s profile…");
    }
  });

  // keyboard: Enter/Space on a focused card likes the profile
  grid.addEventListener("keydown", function (e) {
    var card = e.target.closest(".card");
    if (!card) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      var btn = card.querySelector("[data-like]");
      if (btn) toggleLike(+btn.getAttribute("data-like"), btn);
    }
  });

  distance.addEventListener("input", function () {
    distanceOut.textContent = distance.value + " km";
    render();
  });
  age.addEventListener("input", function () {
    ageOut.textContent = age.value;
    render();
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-on");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-on");
      chip.setAttribute("aria-pressed", "true");
      vibe = chip.getAttribute("data-vibe");
      render();
    });
  });

  shuffleBtn.addEventListener("click", function () {
    for (var i = profiles.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = profiles[i]; profiles[i] = profiles[j]; profiles[j] = t;
    }
    render();
    toast("Fresh deck shuffled 🔀");
  });

  loadMore.addEventListener("click", function () {
    loadMore.classList.add("loading");
    loadMore.textContent = "Finding people…";
    setTimeout(function () {
      seed(8);
      render();
      loadMore.classList.remove("loading");
      loadMore.textContent = "Load more people";
      toast("8 new people nearby ✨");
      var feed = document.getElementById("feed");
      feed.scrollTo({ top: feed.scrollHeight, behavior: "smooth" });
    }, 700);
  });

  likedPill.addEventListener("click", function () {
    toast(likes === 0 ? "No likes yet — tap a heart 💗" : "You have " + likes + " like" + (likes === 1 ? "" : "s"));
  });

  render();
})();
