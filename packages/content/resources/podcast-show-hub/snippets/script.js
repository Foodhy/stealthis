(function () {
  "use strict";

  // --- Data (fictional Waveform network) ---
  var SHOWS = [
    { id: "s1", title: "Signal & Noise", host: "Priya Raman", category: "Technology", eps: 214, days: 2, g: ["#7c3aed", "#22d3ee"] },
    { id: "s2", title: "Cold Cases West", host: "Dana Whitlock", category: "True Crime", eps: 98, days: 1, g: ["#4c1d95", "#f472b6"] },
    { id: "s3", title: "Second Serving", host: "Marco Feliz", category: "Culture", eps: 156, days: 9, g: ["#0e7490", "#22d3ee"] },
    { id: "s4", title: "The Long Green", host: "Anaya Brooks", category: "Business", eps: 340, days: 4, g: ["#166534", "#22d3ee"] },
    { id: "s5", title: "Static Hours", host: "Leo Nakamura", category: "Music", eps: 72, days: 0, g: ["#831843", "#8b5cf6"] },
    { id: "s6", title: "Field Notes", host: "Imani Okafor", category: "Science", eps: 188, days: 6, g: ["#1e3a8a", "#22d3ee"] },
    { id: "s7", title: "Off the Clock", host: "Sam Delgado", category: "Comedy", eps: 261, days: 3, g: ["#9a3412", "#f472b6"] },
    { id: "s8", title: "Deep End", host: "Rowan Price", category: "Technology", eps: 45, days: 0, g: ["#5b21b6", "#22d3ee"] },
    { id: "s9", title: "Midnight Ledger", host: "Talia Voss", category: "True Crime", eps: 130, days: 12, g: ["#3b0764", "#f472b6"] },
    { id: "s10", title: "Small Batch", host: "Hugo Estévez", category: "Culture", eps: 84, days: 5, g: ["#155e75", "#8b5cf6"] },
    { id: "s11", title: "Ground Floor", host: "Nadia Karim", category: "Business", eps: 112, days: 8, g: ["#065f46", "#22d3ee"] },
    { id: "s12", title: "Wavelength", host: "Beckett Yu", category: "Science", eps: 203, days: 1, g: ["#1e40af", "#8b5cf6"] }
  ];

  var NEW_DAYS = 3;

  // --- State ---
  var state = { q: "", category: "All", sort: "featured" };
  var followed = {};
  var currentPlaying = null;

  // --- Elements ---
  var $grid = document.getElementById("grid");
  var $chips = document.getElementById("chips");
  var $search = document.getElementById("search");
  var $clearSearch = document.getElementById("clearSearch");
  var $sort = document.getElementById("sort");
  var $empty = document.getElementById("empty");
  var $count = document.getElementById("resultCount");
  var $resetInline = document.getElementById("resetInline");
  var $toast = document.getElementById("toast");

  // --- Toast helper ---
  var toastTimer;
  function toast(msg) {
    $toast.textContent = msg;
    $toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.classList.remove("show"); }, 2200);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function initials(title) {
    return title.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  // --- Build category chips ---
  function buildChips() {
    var counts = { All: SHOWS.length };
    SHOWS.forEach(function (s) { counts[s.category] = (counts[s.category] || 0) + 1; });
    var cats = ["All"].concat(Object.keys(counts).filter(function (c) { return c !== "All"; }).sort());

    $chips.innerHTML = cats.map(function (c) {
      return '<button type="button" class="chip' + (c === state.category ? " active" : "") +
        '" data-cat="' + esc(c) + '" aria-pressed="' + (c === state.category) + '">' +
        esc(c) + '<span class="count">' + counts[c] + '</span></button>';
    }).join("");
  }

  // --- Filtering + sorting ---
  function getVisible() {
    var q = state.q.trim().toLowerCase();
    var list = SHOWS.filter(function (s) {
      if (state.category !== "All" && s.category !== state.category) return false;
      if (q && s.title.toLowerCase().indexOf(q) < 0 && s.host.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });

    var order = { featured: 0, newest: 0, episodes: 0, az: 0 };
    if (order[state.sort] === undefined) state.sort = "featured";

    if (state.sort === "newest") list.sort(function (a, b) { return a.days - b.days; });
    else if (state.sort === "episodes") list.sort(function (a, b) { return b.eps - a.eps; });
    else if (state.sort === "az") list.sort(function (a, b) { return a.title.localeCompare(b.title); });

    return list;
  }

  function waveBars() {
    var h = [55, 90, 40, 75, 60, 95, 35, 70, 50, 85, 45, 65];
    return h.map(function (v) { return '<i style="height:' + v + '%"></i>'; }).join("");
  }

  function agoLabel(days) {
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    return days + " days ago";
  }

  function cardHTML(s) {
    var isNew = s.days <= NEW_DAYS;
    var isFollowed = !!followed[s.id];
    return '<article class="card" data-id="' + s.id + '">' +
      '<div class="cover" style="background:linear-gradient(140deg,' + s.g[0] + ',' + s.g[1] + ')">' +
        '<span class="cover-mono" aria-hidden="true">' + esc(initials(s.title)) + '</span>' +
        '<button class="play" type="button" data-play aria-label="Play latest episode of ' + esc(s.title) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
        '</button>' +
        '<div class="wave" aria-hidden="true">' + waveBars() + '</div>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-top">' +
          '<span class="badge">' + esc(s.category) + '</span>' +
          (isNew ? '<span class="badge new">New</span>' : '') +
        '</div>' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<p class="host">with <b>' + esc(s.host) + '</b> · updated ' + agoLabel(s.days) + '</p>' +
        '<div class="card-foot">' +
          '<span class="eps">' + s.eps + ' episodes</span>' +
          '<button class="follow' + (isFollowed ? " on" : "") + '" type="button" data-follow aria-pressed="' + isFollowed + '">' +
            (isFollowed ? "Following" : "Follow") + '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  // --- Render ---
  function render() {
    var list = getVisible();

    if (list.length === 0) {
      $grid.innerHTML = "";
      $grid.hidden = true;
      $empty.hidden = false;
    } else {
      $grid.hidden = false;
      $empty.hidden = true;
      $grid.innerHTML = list.map(cardHTML).join("");
    }

    var filtered = state.q.trim() !== "" || state.category !== "All";
    $count.innerHTML = "Showing <b>" + list.length + "</b> of " + SHOWS.length + " shows" +
      (state.category !== "All" ? " in " + esc(state.category) : "");
    $resetInline.hidden = !filtered;
    $clearSearch.hidden = state.q === "";
  }

  // --- Reset ---
  function reset() {
    state.q = "";
    state.category = "All";
    $search.value = "";
    buildChips();
    render();
    toast("Filters cleared");
  }

  // --- Events ---
  $search.addEventListener("input", function () {
    state.q = $search.value;
    render();
  });

  $clearSearch.addEventListener("click", function () {
    state.q = "";
    $search.value = "";
    $search.focus();
    render();
  });

  $sort.addEventListener("change", function () {
    state.sort = $sort.value;
    render();
    toast("Sorted by " + $sort.options[$sort.selectedIndex].text.toLowerCase());
  });

  $chips.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    state.category = chip.getAttribute("data-cat");
    buildChips();
    render();
  });

  $resetInline.addEventListener("click", reset);
  document.getElementById("resetEmpty").addEventListener("click", reset);

  document.getElementById("submitShow").addEventListener("click", function () {
    toast("Show submissions open in the fall — thanks for your interest!");
  });

  // Grid delegation: play + follow
  $grid.addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (!card) return;
    var id = card.getAttribute("data-id");
    var show = SHOWS.find(function (s) { return s.id === id; });
    if (!show) return;

    if (e.target.closest("[data-play]")) {
      var btn = e.target.closest("[data-play]");
      if (currentPlaying === id) {
        card.classList.remove("playing");
        btn.setAttribute("aria-label", "Play latest episode of " + show.title);
        currentPlaying = null;
        toast("Paused " + show.title);
      } else {
        var prev = $grid.querySelector(".card.playing");
        if (prev) prev.classList.remove("playing");
        card.classList.add("playing");
        btn.setAttribute("aria-label", "Pause " + show.title);
        currentPlaying = id;
        toast("Now playing · " + show.title);
      }
      return;
    }

    if (e.target.closest("[data-follow]")) {
      var fbtn = e.target.closest("[data-follow]");
      followed[id] = !followed[id];
      fbtn.classList.toggle("on", followed[id]);
      fbtn.textContent = followed[id] ? "Following" : "Follow";
      fbtn.setAttribute("aria-pressed", String(!!followed[id]));
      toast(followed[id] ? "Following " + show.title : "Unfollowed " + show.title);
    }
  });

  // --- Init ---
  buildChips();
  render();
})();
