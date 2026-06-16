(function () {
  "use strict";

  // ---------- Data (fictional storybooks) ----------
  // c1 = cover background, c2 = accent shape color, art = inline scene id
  var BOOKS = [
    { id: "b1", title: "Pip the Brave Little Fox", author: "Mara Lindqvist", cat: "animals", age: "3–6", mins: 8, stars: 5, c1: "#ff8a3d", c2: "#ffd23f", art: "fox",
      blurb: "When the woodland lights flicker out, a tiny fox named Pip discovers that even the smallest paws can carry a very big lantern of courage." },
    { id: "b2", title: "The Whale Who Forgot the Sea", author: "Tomás Rivera", cat: "animals", age: "4–7", mins: 11, stars: 4, c1: "#5ec5d6", c2: "#a98bff", art: "whale",
      blurb: "A gentle blue whale wakes up in a tide pool with no memory of the ocean — and a hermit crab who promises to help her find her song again." },
    { id: "b3", title: "Buttons & the Tea-Party Bears", author: "Priya Anand", cat: "animals", age: "2–5", mins: 6, stars: 5, c1: "#ff6f9c", c2: "#ffd23f", art: "bear",
      blurb: "Three sleepy bears, one stack of honey cakes, and a teapot that whistles tunes. Will Buttons get a slice before nap time?" },
    { id: "b4", title: "Goodnight, Little Comet", author: "Sofia Marlowe", cat: "bedtime", age: "2–5", mins: 5, stars: 5, c1: "#3b3a7a", c2: "#ffd23f", art: "comet",
      blurb: "A drowsy comet says goodnight to every planet it passes, dimming its tail one sparkle at a time until the whole sky is hushed and warm." },
    { id: "b5", title: "The Moon Has a Pillow Fort", author: "Kenji Watanabe", cat: "bedtime", age: "3–6", mins: 7, stars: 4, c1: "#a98bff", c2: "#fff1df", art: "moon",
      blurb: "Up past the rooftops, the moon builds a fort of clouds and invites the stars in for whispered stories until everyone drifts off." },
    { id: "b6", title: "Counting Sheep on Cloud Nine", author: "Hana Brooks", cat: "bedtime", age: "2–4", mins: 4, stars: 5, c1: "#7bd389", c2: "#fff8ef", art: "sheep",
      blurb: "One fluffy sheep, two fluffy sheep… each hops onto a softer cloud, and by ten the whole flock is snoring sweet bedtime snores." },
    { id: "b7", title: "Captain Mango & the Sky Pirates", author: "Diego Salt", cat: "adventure", age: "5–8", mins: 13, stars: 5, c1: "#ff8a3d", c2: "#5ec5d6", art: "ship",
      blurb: "Hoist the banana flag! Captain Mango sails a cloud-ship over rainbow seas to rescue a kite stolen by the giggling Sky Pirates." },
    { id: "b8", title: "The Treehouse at the Edge of Maps", author: "Lena Okoye", cat: "adventure", age: "6–9", mins: 15, stars: 4, c1: "#7bd389", c2: "#ffd23f", art: "tree",
      blurb: "Two friends find a treehouse that grows a new room every night, each door opening onto a country that isn't on any map." },
    { id: "b9", title: "Rocket Boots & the Bouncing Planet", author: "Ravi Kapoor", cat: "adventure", age: "4–7", mins: 9, stars: 5, c1: "#a98bff", c2: "#ff6f9c", art: "rocket",
      blurb: "Strap on your rocket boots! On Planet Springy, the ground is a trampoline and the only way down is the bounciest bounce of all." },
    { id: "b10", title: "Hedgehog's Umbrella Garden", author: "Mei-Ling Chen", cat: "animals", age: "3–6", mins: 7, stars: 5, c1: "#7bd389", c2: "#ff6f9c", art: "fox",
      blurb: "Quill the hedgehog plants umbrellas instead of flowers, and when the spring rain comes, the whole meadow blooms into a parade of color." },
    { id: "b11", title: "Snore the Dragon's Quiet Cave", author: "Otis Greenfield", cat: "bedtime", age: "3–6", mins: 6, stars: 4, c1: "#3b3a7a", c2: "#ff8a3d", art: "moon",
      blurb: "Snore is the sleepiest dragon in the valley, and tonight he tucks the village in with one warm, glowing, gentle breath of firelight." },
    { id: "b12", title: "The Lighthouse That Sailed Away", author: "Cora Westbrook", cat: "adventure", age: "5–8", mins: 12, stars: 5, c1: "#5ec5d6", c2: "#ffd23f", art: "ship",
      blurb: "When the tide rose too high, a lonely lighthouse pulled up its anchor and set off to find the ships it had been waving to for years." }
  ];

  var CATS = {
    all: { label: "All Stories", emoji: "📚" },
    animals: { label: "Animal Friends", emoji: "🦊" },
    bedtime: { label: "Bedtime & Dreams", emoji: "🌙" },
    adventure: { label: "Big Adventures", emoji: "🚀" }
  };

  var favs = {}; // id -> true

  // ---------- Inline SVG cover artwork ----------
  function scene(id, c2) {
    switch (id) {
      case "fox":
        return '<path d="M30 64c0-18 14-30 30-30s30 12 30 30v34H30Z" fill="' + c2 + '" opacity="0.9"/>' +
          '<circle cx="60" cy="70" r="22" fill="#fff"/><path d="M40 52l8 14M80 52l-8 14" stroke="#2c2350" stroke-width="3" stroke-linecap="round"/>' +
          '<circle cx="52" cy="70" r="3.4" fill="#2c2350"/><circle cx="68" cy="70" r="3.4" fill="#2c2350"/><path d="M55 80h10l-5 5Z" fill="#2c2350"/>';
      case "whale":
        return '<path d="M22 78c10-18 66-18 76 0 6 10-6 18-18 14-10 12-30 12-40 0-12 4-24-4-18-14Z" fill="' + c2 + '"/>' +
          '<circle cx="46" cy="74" r="3.2" fill="#fff"/><path d="M78 44c4-10 14-8 14 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
      case "bear":
        return '<circle cx="60" cy="72" r="26" fill="' + c2 + '"/><circle cx="42" cy="50" r="9" fill="' + c2 + '"/><circle cx="78" cy="50" r="9" fill="' + c2 + '"/>' +
          '<circle cx="52" cy="70" r="3.2" fill="#2c2350"/><circle cx="68" cy="70" r="3.2" fill="#2c2350"/><circle cx="60" cy="78" r="4" fill="#2c2350"/>';
      case "comet":
        return '<path d="M28 96L84 40" stroke="' + c2 + '" stroke-width="10" stroke-linecap="round" opacity="0.7"/>' +
          '<circle cx="84" cy="40" r="13" fill="' + c2 + '"/><path d="M84 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" fill="#fff"/>';
      case "moon":
        return '<path d="M82 38a30 30 0 1 0 0 56 24 24 0 0 1 0-56Z" fill="' + c2 + '"/>' +
          '<circle cx="40" cy="44" r="2.6" fill="#fff"/><circle cx="92" cy="84" r="2.6" fill="#fff"/><circle cx="34" cy="80" r="2" fill="#fff"/>';
      case "sheep":
        return '<circle cx="60" cy="66" r="24" fill="' + c2 + '"/><circle cx="40" cy="58" r="11" fill="' + c2 + '"/><circle cx="80" cy="58" r="11" fill="' + c2 + '"/>' +
          '<ellipse cx="60" cy="92" rx="20" ry="6" fill="#2c2350" opacity="0.25"/><circle cx="54" cy="66" r="3" fill="#2c2350"/><circle cx="66" cy="66" r="3" fill="#2c2350"/>';
      case "ship":
        return '<path d="M30 78h60l-8 16H38Z" fill="' + c2 + '"/><path d="M60 26v52" stroke="#fff" stroke-width="4"/><path d="M60 30l24 8-24 8Z" fill="#fff"/>' +
          '<path d="M24 86c8 6 16 6 24 0 8 6 16 6 24 0 8 6 16 6 24 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>';
      case "tree":
        return '<rect x="54" y="70" width="12" height="28" rx="3" fill="#8a531f"/><circle cx="60" cy="56" r="26" fill="' + c2 + '"/>' +
          '<circle cx="44" cy="62" r="13" fill="' + c2 + '"/><circle cx="76" cy="62" r="13" fill="' + c2 + '"/><circle cx="52" cy="48" r="3" fill="#fff"/><circle cx="70" cy="52" r="3" fill="#fff"/>';
      case "rocket":
        return '<path d="M60 28c14 8 18 26 12 44l-24 0c-6-18-2-36 12-44Z" fill="' + c2 + '"/><circle cx="60" cy="52" r="7" fill="#fff"/>' +
          '<path d="M48 72l-10 14h14ZM72 72l10 14H68Z" fill="' + c2 + '"/><path d="M54 88c2 6 10 6 12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
      default:
        return '<circle cx="60" cy="64" r="24" fill="' + c2 + '"/>';
    }
  }

  function coverSVG(book) {
    return '<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cover of ' +
      esc(book.title) + '">' +
      '<rect width="120" height="160" fill="' + book.c1 + '"/>' +
      '<rect x="8" y="8" width="104" height="144" rx="6" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<circle cx="22" cy="22" r="3" fill="rgba(255,255,255,0.6)"/><circle cx="98" cy="22" r="3" fill="rgba(255,255,255,0.6)"/>' +
      scene(book.art, book.c2) +
      '<rect x="14" y="110" width="92" height="36" rx="6" fill="rgba(0,0,0,0.18)"/>' +
      '</svg>';
  }

  // ---------- DOM helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function el(id) { return document.getElementById(id); }

  var library = el("library");
  var emptyEl = el("empty");
  var searchInput = el("search");
  var searchClear = el("searchClear");
  var tabsNav = el("tabs");

  var currentCat = "all";
  var currentQuery = "";

  // ---------- Render ----------
  function matches(book) {
    var catOk = currentCat === "all" || book.cat === currentCat;
    if (!catOk) return false;
    if (!currentQuery) return true;
    var q = currentQuery.toLowerCase();
    return book.title.toLowerCase().indexOf(q) > -1 ||
           book.author.toLowerCase().indexOf(q) > -1;
  }

  function bookButton(book) {
    var btn = document.createElement("button");
    btn.className = "book" + (favs[book.id] ? " is-fav" : "");
    btn.type = "button";
    btn.setAttribute("data-id", book.id);
    btn.setAttribute("aria-label", "Open " + book.title + " by " + book.author);
    btn.innerHTML =
      '<span class="book-fav" aria-hidden="true">❤️</span>' +
      '<span class="book-cover">' + coverSVG(book) + '</span>' +
      '<span class="book-title">' + esc(book.title) + '</span>' +
      '<span class="book-author">' + esc(book.author) + '</span>';
    btn.addEventListener("click", function () { openDetail(book); });
    return btn;
  }

  function render() {
    var list = BOOKS.filter(matches);
    library.innerHTML = "";

    if (!list.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    // Group into shelves: by category when "all", else one shelf
    var groups;
    if (currentCat === "all") {
      groups = ["animals", "bedtime", "adventure"].map(function (cat) {
        return { cat: cat, items: list.filter(function (b) { return b.cat === cat; }) };
      }).filter(function (g) { return g.items.length; });
    } else {
      groups = [{ cat: currentCat, items: list }];
    }

    groups.forEach(function (g) {
      var meta = CATS[g.cat];
      var shelf = document.createElement("section");
      shelf.className = "shelf";

      var head = document.createElement("div");
      head.className = "shelf-head";
      head.innerHTML = '<h2><span aria-hidden="true">' + meta.emoji + '</span> ' + esc(meta.label) + '</h2>' +
        '<span class="count">' + g.items.length + (g.items.length === 1 ? " story" : " stories") + '</span>';
      shelf.appendChild(head);

      var board = document.createElement("div");
      board.className = "shelf-board";
      var grid = document.createElement("div");
      grid.className = "books";
      g.items.forEach(function (b) { grid.appendChild(bookButton(b)); });
      board.appendChild(grid);
      shelf.appendChild(board);

      library.appendChild(shelf);
    });
  }

  // ---------- Tabs ----------
  var tabBtns = Array.prototype.slice.call(tabsNav.querySelectorAll(".tab"));
  function selectTab(btn) {
    tabBtns.forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    currentCat = btn.getAttribute("data-cat");
    library.setAttribute("aria-labelledby", btn.id);
    render();
  }
  tabBtns.forEach(function (btn, i) {
    btn.addEventListener("click", function () { selectTab(btn); });
    btn.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabBtns[(i + dir + tabBtns.length) % tabBtns.length];
      next.focus();
      selectTab(next);
    });
  });

  // ---------- Search ----------
  searchInput.addEventListener("input", function () {
    currentQuery = searchInput.value.trim();
    searchClear.hidden = !currentQuery;
    render();
  });
  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    currentQuery = "";
    searchClear.hidden = true;
    searchInput.focus();
    render();
  });

  // ---------- Detail dialog ----------
  var overlay = el("overlay");
  var detail = el("detail");
  var lastFocused = null;
  var activeBook = null;

  function openDetail(book) {
    activeBook = book;
    lastFocused = document.activeElement;
    var meta = CATS[book.cat];

    el("detailCover").innerHTML = coverSVG(book);
    el("detailCat").innerHTML = '<span aria-hidden="true">' + meta.emoji + '</span> ' + esc(meta.label);
    el("detail-title").textContent = book.title;
    el("detailAuthor").textContent = "by " + book.author;
    el("detailAge").innerHTML = '<span aria-hidden="true">👶</span> Ages ' + esc(book.age);
    el("detailMins").innerHTML = '<span aria-hidden="true">⏱️</span> ' + book.mins + " min read";
    el("detailStars").textContent = "★★★★★☆☆☆☆☆".slice(5 - book.stars, 10 - book.stars);
    el("detailBlurb").textContent = book.blurb;

    var favBtn = el("favBtn");
    var isFav = !!favs[book.id];
    favBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
    favBtn.innerHTML = isFav ? "♥ In favorites" : "♡ Add to favorites";

    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    detail.focus();
  }

  function closeDetail() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    activeBook = null;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  el("detailClose").addEventListener("click", closeDetail);
  overlay.addEventListener("mousedown", function (e) {
    if (e.target === overlay) closeDetail();
  });

  document.addEventListener("keydown", function (e) {
    if (overlay.hidden) return;
    if (e.key === "Escape") { closeDetail(); return; }
    if (e.key === "Tab") {
      // simple focus trap
      var focusables = detail.querySelectorAll("button");
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  el("readBtn").addEventListener("click", function () {
    if (activeBook) toast('Opening "' + activeBook.title + '" — happy reading! 📖');
  });

  el("favBtn").addEventListener("click", function () {
    if (!activeBook) return;
    var id = activeBook.id;
    var btn = el("favBtn");
    if (favs[id]) {
      delete favs[id];
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = "♡ Add to favorites";
      toast("Removed from favorites");
    } else {
      favs[id] = true;
      btn.setAttribute("aria-pressed", "true");
      btn.innerHTML = "♥ In favorites";
      toast("Added to favorites! ⭐");
    }
    // update the matching card on the shelf
    var card = library.querySelector('.book[data-id="' + id + '"]');
    if (card) card.classList.toggle("is-fav", !!favs[id]);
  });

  // ---------- Dyslexia-friendly toggle ----------
  var dysToggle = el("dysToggle");
  dysToggle.addEventListener("click", function () {
    var on = dysToggle.getAttribute("aria-checked") === "true";
    dysToggle.setAttribute("aria-checked", on ? "false" : "true");
    document.body.classList.toggle("easy-read", !on);
    toast(on ? "Easy-read font off" : "Easy-read font on — bigger spacing!");
  });

  // ---------- Toast ----------
  var toastEl = el("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  // ---------- Init ----------
  render();
})();
