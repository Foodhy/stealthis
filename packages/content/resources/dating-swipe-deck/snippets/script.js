(function () {
  "use strict";

  // --- Fictional profile data ---
  var PROFILES = [
    {
      name: "Mara", age: 27, verified: true, online: true, dist: "2 km away",
      bio: "Ceramicist chasing good light and better tacos. Ask me about kilns.",
      interests: ["Pottery", "Film photography", "Tacos", "Vinyl"],
      grad: "linear-gradient(150deg,#ff8fb1,#ff5e6c 55%,#8b5cf6)"
    },
    {
      name: "Dev", age: 31, verified: false, online: false, dist: "5 km away",
      bio: "Trail runner, terrible at chess, great at making playlists.",
      interests: ["Trail running", "Chess", "Synthwave", "Cold brew"],
      grad: "linear-gradient(150deg,#8b5cf6,#7c3aed 60%,#2a1a2e)"
    },
    {
      name: "Priya", age: 29, verified: true, online: true, dist: "1 km away",
      bio: "Weekend baker and full-time plant hoarder. My sourdough has a name.",
      interests: ["Baking", "Plants", "Bouldering", "Podcasts"],
      grad: "linear-gradient(150deg,#ffb199,#ff5e6c 50%,#e63950)"
    },
    {
      name: "Theo", age: 34, verified: false, online: true, dist: "8 km away",
      bio: "Jazz drummer by night, UX designer by day. Will duet you on karaoke.",
      interests: ["Jazz", "Design", "Karaoke", "Ramen"],
      grad: "linear-gradient(150deg,#a78bfa,#8b5cf6 55%,#ff5e6c)"
    },
    {
      name: "Noor", age: 26, verified: true, online: false, dist: "3 km away",
      bio: "Marine biologist. I will show you tide-pool photos, you have been warned.",
      interests: ["Diving", "Oceans", "Watercolor", "Board games"],
      grad: "linear-gradient(150deg,#7dd3fc,#8b5cf6 55%,#ff8fb1)"
    },
    {
      name: "Léo", age: 30, verified: false, online: true, dist: "6 km away",
      bio: "Cyclist and amateur cheesemonger. Yes, that is a real hobby.",
      interests: ["Cycling", "Cheese", "Wine", "Sci-fi"],
      grad: "linear-gradient(150deg,#fda4af,#e63950 55%,#7c3aed)"
    }
  ];

  var THRESHOLD = 110; // px to trigger a swipe
  var MAX_ROT = 18;    // deg

  var deck = document.getElementById("deck");
  var emptyEl = document.getElementById("empty");
  var remainingEl = document.getElementById("remaining");
  var toastEl = document.getElementById("toast");
  var btnRewind = document.getElementById("rewind");
  var btnNope = document.getElementById("nope");
  var btnSuper = document.getElementById("super");
  var btnLike = document.getElementById("like");
  var btnReset = document.getElementById("reset");

  var queue = [];      // remaining profiles (top = last item)
  var history = [];    // {profile, dir} for rewind
  var toastTimer;

  // ---- rendering ----
  function buildCard(profile) {
    var card = document.createElement("article");
    card.className = "card";
    card.setAttribute("aria-label", profile.name + ", " + profile.age);

    var chips = profile.interests.map(function (i) {
      return '<span class="chip">' + i + "</span>";
    }).join("");

    card.innerHTML =
      '<div class="card-photo" style="background-image:' + profile.grad + '"></div>' +
      '<div class="card-top-fade"></div>' +
      '<span class="card-dist">📍 ' + profile.dist + "</span>" +
      (profile.online ? '<span class="card-online"><span class="dot"></span>Online</span>' : "") +
      '<div class="stamp stamp-like">LIKE</div>' +
      '<div class="stamp stamp-nope">NOPE</div>' +
      '<div class="stamp stamp-super">SUPER</div>' +
      '<div class="card-info">' +
        '<div class="card-name"><h2>' + profile.name + "</h2>" +
          '<span class="age">' + profile.age + "</span>" +
          (profile.verified ? '<span class="verified" title="Verified">✔ verified</span>' : "") +
        "</div>" +
        '<p class="card-bio">' + profile.bio + "</p>" +
        '<div class="chips">' + chips + "</div>" +
      "</div>";

    attachDrag(card);
    return card;
  }

  function render() {
    // remove existing cards (keep empty state node)
    var cards = deck.querySelectorAll(".card");
    cards.forEach(function (c) { c.remove(); });

    // render up to 3 cards from top of queue (queue end = topmost)
    var count = queue.length;
    var visible = Math.min(3, count);
    for (var i = 0; i < visible; i++) {
      var profile = queue[count - 1 - i];
      var card = buildCard(profile);
      // insert so topmost is last in DOM order (higher paint, but z-index handles it)
      deck.insertBefore(card, emptyEl);
      if (i === 0) card.classList.add("top");
      else if (i === 1) card.classList.add("next");
      else card.classList.add("later");
      requestAnimationFrame(function (c) {
        return function () { c.classList.add("stack-anim"); };
      }(card));
    }

    remainingEl.textContent = count;
    emptyEl.hidden = count > 0;
    btnRewind.disabled = history.length === 0;
    var noCards = count === 0;
    btnNope.disabled = noCards;
    btnSuper.disabled = noCards;
    btnLike.disabled = noCards;
  }

  function topCard() { return deck.querySelector(".card.top"); }

  // ---- drag engine ----
  function attachDrag(card) {
    var startX = 0, startY = 0, curX = 0, curY = 0, active = false;

    function down(e) {
      if (!card.classList.contains("top")) return;
      active = true;
      card.classList.add("dragging");
      card.classList.remove("settle");
      var p = point(e);
      startX = p.x; startY = p.y;
      card.setPointerCapture && e.pointerId != null && card.setPointerCapture(e.pointerId);
    }

    function move(e) {
      if (!active) return;
      var p = point(e);
      curX = p.x - startX;
      curY = p.y - startY;
      apply(card, curX, curY);
      updateStamps(card, curX);
    }

    function up() {
      if (!active) return;
      active = false;
      card.classList.remove("dragging");
      if (curX > THRESHOLD) { flingOut(card, "like"); }
      else if (curX < -THRESHOLD) { flingOut(card, "nope"); }
      else { springBack(card); }
      curX = 0; curY = 0;
    }

    card.addEventListener("pointerdown", down);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", up);
    card.addEventListener("pointercancel", up);
    card.addEventListener("pointerleave", function (e) { if (active && e.pointerType === "mouse") up(); });
  }

  function point(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function apply(card, x, y) {
    var rot = Math.max(-MAX_ROT, Math.min(MAX_ROT, x / 12));
    card.style.transform = "translate(" + x + "px," + y + "px) rotate(" + rot + "deg)";
  }

  function updateStamps(card, x) {
    var like = card.querySelector(".stamp-like");
    var nope = card.querySelector(".stamp-nope");
    var likeOp = Math.max(0, Math.min(1, x / THRESHOLD));
    var nopeOp = Math.max(0, Math.min(1, -x / THRESHOLD));
    like.style.opacity = likeOp;
    nope.style.opacity = nopeOp;
  }

  function springBack(card) {
    card.classList.add("settle");
    card.style.transform = "translate(0,0) rotate(0deg)";
    var like = card.querySelector(".stamp-like");
    var nope = card.querySelector(".stamp-nope");
    if (like) like.style.opacity = 0;
    if (nope) nope.style.opacity = 0;
  }

  // ---- swipe out ----
  function flingOut(card, dir, isSuper) {
    var profile = queue.pop();
    history.push({ profile: profile, dir: dir });

    card.classList.add("settle");
    card.classList.remove("top");
    var dx = dir === "like" ? window.innerWidth : -window.innerWidth;
    var rot = dir === "like" ? 26 : -26;

    if (isSuper) {
      var sstamp = card.querySelector(".stamp-super");
      if (sstamp) sstamp.style.opacity = 1;
      card.style.transform = "translateY(-140%) rotate(0deg)";
    } else {
      card.style.transform = "translate(" + dx + "px," + (-40) + "px) rotate(" + rot + "deg)";
    }
    card.style.opacity = "0";

    // promote the cards behind
    promoteStack();

    window.setTimeout(function () { card.remove(); finalizeAfterSwipe(); }, 380);

    // feedback
    if (dir === "like") {
      if (isSuper) {
        toast("⭐", "Super Liked " + profile.name + "!");
      } else if (Math.random() < 0.5) {
        toast("💘", "It's a match with " + profile.name + "!");
      } else {
        toast("💚", "You liked " + profile.name);
      }
    } else {
      toast("👋", "Passed on " + profile.name);
    }
  }

  function promoteStack() {
    var cards = deck.querySelectorAll(".card");
    cards.forEach(function (c) {
      if (c.classList.contains("next")) {
        c.classList.remove("next");
        c.classList.add("top");
      } else if (c.classList.contains("later")) {
        c.classList.remove("later");
        c.classList.add("next");
      }
    });
  }

  function finalizeAfterSwipe() {
    // add a fresh 3rd card if available and not already rendered
    var rendered = deck.querySelectorAll(".card").length;
    var total = queue.length;
    if (total > rendered) {
      var idx = total - 1 - rendered; // next unrendered from top
      var profile = queue[idx];
      var card = buildCard(profile);
      deck.insertBefore(card, deck.firstChild);
      card.classList.add("later");
      requestAnimationFrame(function () { card.classList.add("stack-anim"); });
    }
    remainingEl.textContent = queue.length;
    emptyEl.hidden = queue.length > 0;
    btnRewind.disabled = history.length === 0;
    var noCards = queue.length === 0;
    btnNope.disabled = noCards;
    btnSuper.disabled = noCards;
    btnLike.disabled = noCards;
  }

  // ---- button-driven swipe ----
  function programmaticSwipe(dir, isSuper) {
    var card = topCard();
    if (!card) return;
    flingOut(card, dir, isSuper);
  }

  function rewind() {
    if (history.length === 0) return;
    var last = history.pop();
    queue.push(last.profile);
    render();
    var top = topCard();
    if (top) {
      top.classList.add("settle");
      top.style.transform = "translate(0,-16px) scale(1.02)";
      requestAnimationFrame(function () {
        top.style.transform = "translate(0,0) scale(1)";
      });
    }
    toast("↺", "Brought back " + last.profile.name);
  }

  function resetDeck() {
    queue = PROFILES.slice();
    history = [];
    render();
    toast("✨", "Deck reshuffled");
  }

  // ---- toast ----
  function toast(emoji, msg) {
    if (!toastEl) return;
    toastEl.innerHTML = '<span class="toast-emoji">' + emoji + "</span>" + msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1900);
  }

  function pulse(btn) {
    btn.classList.remove("pulse");
    void btn.offsetWidth;
    btn.classList.add("pulse");
  }

  // ---- wire up ----
  btnNope.addEventListener("click", function () { pulse(btnNope); programmaticSwipe("nope"); });
  btnLike.addEventListener("click", function () { pulse(btnLike); programmaticSwipe("like"); });
  btnSuper.addEventListener("click", function () { pulse(btnSuper); programmaticSwipe("like", true); });
  btnRewind.addEventListener("click", function () { pulse(btnRewind); rewind(); });
  btnReset.addEventListener("click", resetDeck);

  // keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { programmaticSwipe("nope"); }
    else if (e.key === "ArrowRight") { programmaticSwipe("like"); }
    else if (e.key === "ArrowUp") { programmaticSwipe("like", true); }
    else if (e.key.toLowerCase() === "r") { rewind(); }
  });

  // init
  queue = PROFILES.slice();
  render();
})();
