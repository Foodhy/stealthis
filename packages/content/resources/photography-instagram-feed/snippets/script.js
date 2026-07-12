(function () {
  "use strict";

  var HEART =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  var COMMENT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z"/></svg>';

  // Fictional feed data. Gradients keep it dependency-free and always render.
  var PHOTOS = [
    { g: "linear-gradient(135deg,#1b2a3a,#4a6b86)", cap: "Fjord fog", likes: 2140, comments: 63, pin: "Reel" },
    { g: "linear-gradient(135deg,#6d5a3e,#c9b79c)", cap: "Golden dunes", likes: 3890, comments: 121 },
    { g: "linear-gradient(135deg,#2a2a30,#55555f)", cap: "Studio grey", likes: 980, comments: 24 },
    { g: "linear-gradient(160deg,#3a1f2b,#a6647d)", cap: "Neon alley", likes: 5420, comments: 208, pin: "Top" },
    { g: "linear-gradient(135deg,#132033,#3f5a78)", cap: "Blue hour", likes: 1760, comments: 41 },
    { g: "linear-gradient(135deg,#40331f,#b89b6a)", cap: "Harvest light", likes: 2650, comments: 77 },
    { g: "linear-gradient(150deg,#1c1c22,#3d3d47)", cap: "Long exposure", likes: 1290, comments: 33 },
    { g: "linear-gradient(135deg,#22343f,#6d94a6)", cap: "Tidal lines", likes: 4310, comments: 156, pin: "Reel" },
    { g: "linear-gradient(135deg,#4a2f22,#c98f6a)", cap: "Rust & salt", likes: 2075, comments: 58 },
    { g: "linear-gradient(160deg,#20303a,#527088)", cap: "Cold shore", likes: 3140, comments: 92 },
    { g: "linear-gradient(135deg,#2c2438,#6b5a86)", cap: "Purple dusk", likes: 1880, comments: 47 },
    { g: "linear-gradient(135deg,#3a3020,#c9b79c)", cap: "Field grain", likes: 2990, comments: 88 }
  ];

  var grid = document.getElementById("grid");
  var toastEl = document.getElementById("toast");
  var followBtn = document.getElementById("followBtn");
  var followerCountEl = document.getElementById("followerCount");

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  function fmt(n) {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + "k";
    return String(n);
  }

  // ----- Build grid -----
  PHOTOS.forEach(function (p, i) {
    var tile = document.createElement("article");
    tile.className = "tile";

    var img = document.createElement("span");
    img.className = "tile__img";
    img.style.background = p.g;
    tile.appendChild(img);

    if (p.pin) {
      var pin = document.createElement("span");
      pin.className = "tile__pin";
      pin.textContent = p.pin;
      tile.appendChild(pin);
    }

    var overlay = document.createElement("div");
    overlay.className = "tile__overlay";
    var likeMeta = document.createElement("span");
    likeMeta.className = "tile__meta";
    likeMeta.innerHTML = HEART + '<span class="js-likecount">' + fmt(p.likes) + "</span>";
    var comMeta = document.createElement("span");
    comMeta.className = "tile__meta";
    comMeta.innerHTML = COMMENT + "<span>" + fmt(p.comments) + "</span>";
    overlay.appendChild(likeMeta);
    overlay.appendChild(comMeta);
    tile.appendChild(overlay);

    var likeBtn = document.createElement("button");
    likeBtn.className = "tile__like";
    likeBtn.type = "button";
    likeBtn.innerHTML = HEART;
    likeBtn.setAttribute("aria-pressed", "false");
    likeBtn.setAttribute("aria-label", "Like photo: " + p.cap);
    tile.appendChild(likeBtn);

    var likes = p.likes;
    var liked = false;
    var countSpan = likeMeta.querySelector(".js-likecount");

    likeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      liked = !liked;
      likes += liked ? 1 : -1;
      likeBtn.classList.toggle("is-liked", liked);
      likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
      countSpan.textContent = fmt(likes);
      likeBtn.classList.remove("pop");
      void likeBtn.offsetWidth; // restart animation
      likeBtn.classList.add("pop");
      toast(liked ? "Liked “" + p.cap + "”" : "Removed like");
    });

    tile.addEventListener("click", function () {
      toast("Opening “" + p.cap + "” · " + fmt(p.comments) + " comments");
    });

    grid.appendChild(tile);
  });

  // ----- Follow toggle -----
  var followers = 18400;
  var following = false;
  followBtn.addEventListener("click", function () {
    following = !following;
    followers += following ? 1 : -1;
    followBtn.textContent = following ? "Following" : "Follow";
    followBtn.classList.toggle("is-following", following);
    followBtn.setAttribute("aria-pressed", following ? "true" : "false");
    followerCountEl.textContent = fmt(followers);
    toast(following ? "You're following @mira.kestrel" : "Unfollowed @mira.kestrel");
  });

  // ----- Tabs -----
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      toast(tab.dataset.tab === "tagged" ? "No tagged photos yet" : "Showing 12 posts");
    });
  });

  // ----- Highlights -----
  document.querySelectorAll(".highlight").forEach(function (h) {
    h.addEventListener("click", function () {
      var label = h.querySelector(".highlight__label");
      toast(label ? "Story: " + label.textContent : "Add a highlight");
    });
  });
})();
