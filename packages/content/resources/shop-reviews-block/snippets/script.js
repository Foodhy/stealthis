(function () {
  "use strict";

  /* ---------- Data (fictional) ---------- */
  var AVATARS = ["#3457ff", "#e0245e", "#1f9d55", "#7c3aed", "#0ea5e9", "#f59e0b", "#ef4444", "#14b8a6"];

  var reviews = [
    { id: 1, name: "Priya N.", verified: true, stars: 5, daysAgo: 2, helpful: 41,
      title: "Best pair I've owned", body: "Sound is crisp and the noise cancelling actually works on my commute. Battery easily lasts the week with daily use." },
    { id: 2, name: "Marcus T.", verified: true, stars: 5, daysAgo: 4, helpful: 28,
      title: "Worth every cent", body: "Super comfortable for long calls, the cushions don't get hot. Pairing to two devices at once is a game changer." },
    { id: 3, name: "Dana K.", verified: true, stars: 4, daysAgo: 6, helpful: 17,
      title: "Great, with one nitpick", body: "Audio quality is excellent and they fold up neatly. Only wish the app had a proper EQ — the presets are a bit limited." },
    { id: 4, name: "Leo R.", verified: false, stars: 3, daysAgo: 9, helpful: 6,
      title: "Decent but mids feel flat", body: "Comfortable and well built. Bass is strong but vocals sit a little far back for my taste. Fine for podcasts." },
    { id: 5, name: "Sofia M.", verified: true, stars: 5, daysAgo: 12, helpful: 33,
      title: "Travel essential now", body: "Took them on a 9-hour flight and barely heard the engine. Quick-charge gave me 4 hours from a 10 minute top up." },
    { id: 6, name: "Owen B.", verified: true, stars: 4, daysAgo: 15, helpful: 11,
      title: "Solid all-rounder", body: "Clean design, light on the head, and the controls are intuitive. Mic could be a touch clearer outdoors." },
    { id: 7, name: "Hana L.", verified: true, stars: 2, daysAgo: 20, helpful: 4,
      title: "Connection drops for me", body: "Love the sound when they work, but they disconnect from my laptop every so often. Hoping a firmware update fixes it." },
    { id: 8, name: "Ben C.", verified: false, stars: 5, daysAgo: 24, helpful: 9,
      title: "Exceeded expectations", body: "Was skeptical at this price but these punch way above. The case feels premium and clicks shut nicely." },
    { id: 9, name: "Yara F.", verified: true, stars: 1, daysAgo: 31, helpful: 2,
      title: "Mine arrived faulty", body: "Right earcup crackled out of the box. Support sent a replacement quickly though, so adjusting my hopes." },
    { id: 10, name: "Theo W.", verified: true, stars: 4, daysAgo: 38, helpful: 14,
      title: "Comfy and clean sound", body: "Wear them most of the workday without fatigue. Transparency mode is handy when someone walks up to my desk." }
  ];

  var PAGE = 4;
  var state = { filter: "all", sort: "recent", shown: PAGE };

  /* ---------- Helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(name) {
    var p = name.trim().split(/\s+/);
    return (p[0][0] + (p[1] ? p[1][0] : "")).toUpperCase();
  }
  function avatarColor(id) { return AVATARS[id % AVATARS.length]; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function relDate(days) {
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    if (days < 30) { var w = Math.round(days / 7); return plural(w, "week") + " ago"; }
    var m = Math.round(days / 30); return plural(m, "month") + " ago";
  }
  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><use href="#star"/></svg>';
  function starsRow(n, cls) {
    var out = "";
    for (var i = 1; i <= 5; i++) out += '<span class="s ' + (i <= n ? "on" : "") + ' ' + (cls || "") + '">' + STAR + "</span>";
    return out;
  }

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span class="dot"></span>' + esc(msg);
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- Summary + breakdown ---------- */
  function computeSummary() {
    var counts = [0, 0, 0, 0, 0, 0];
    var total = 0, sum = 0, recommend = 0;
    reviews.forEach(function (r) {
      counts[r.stars]++; total++; sum += r.stars;
      if (r.stars >= 4) recommend++;
    });
    return { counts: counts, total: total, avg: total ? sum / total : 0, recPct: total ? Math.round((recommend / total) * 100) : 0 };
  }

  function renderSummary() {
    var s = computeSummary();
    $("#avgNum").textContent = s.avg.toFixed(1);
    $("#avgCount").textContent = "Based on " + plural(s.total, "review");
    $("#recPct").textContent = s.recPct + "%";

    // average stars with half-star support
    var avgEl = $("#avgStars");
    avgEl.setAttribute("aria-label", s.avg.toFixed(1) + " out of 5 stars");
    var html = "";
    for (var i = 1; i <= 5; i++) {
      var cls = "s";
      if (s.avg >= i) cls += " on";
      else if (s.avg >= i - 0.5) cls += " half on";
      html += '<span class="' + cls + '">' + STAR + "</span>";
    }
    avgEl.innerHTML = html;

    // distribution bars
    $$(".bar-row").forEach(function (row) {
      var star = +row.dataset.stars;
      var c = s.counts[star];
      var pct = s.total ? Math.round((c / s.total) * 100) : 0;
      $(".bar-fill", row).style.setProperty("--w", pct + "%");
      $(".bar-pct", row).textContent = pct + "%";
      row.setAttribute("aria-label", plural(c, "review") + " at " + star + " stars, " + pct + " percent");
    });
  }

  /* ---------- Filter + sort + render list ---------- */
  function filteredSorted() {
    var list = reviews.filter(function (r) {
      return state.filter === "all" || r.stars === +state.filter;
    });
    var by = {
      recent: function (a, b) { return a.daysAgo - b.daysAgo; },
      helpful: function (a, b) { return b.helpful - a.helpful; },
      high: function (a, b) { return b.stars - a.stars || a.daysAgo - b.daysAgo; },
      low: function (a, b) { return a.stars - b.stars || a.daysAgo - b.daysAgo; }
    };
    return list.slice().sort(by[state.sort]);
  }

  function reviewCard(r) {
    var li = document.createElement("li");
    li.className = "rv";
    li.innerHTML =
      '<div class="rv-head">' +
        '<span class="avatar" style="background:' + avatarColor(r.id) + '" aria-hidden="true">' + esc(initials(r.name)) + "</span>" +
        '<div class="rv-meta">' +
          '<div class="rv-name">' + esc(r.name) +
            (r.verified ? '<span class="verified"><svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M8.2 13.3 5 10.1l1.4-1.4 1.8 1.8 5-5L14.6 7l-6.4 6.3Z"/></svg>Verified</span>' : "") +
          "</div>" +
          '<div class="rv-date">' + relDate(r.daysAgo) + "</div>" +
        "</div>" +
        '<div class="rv-stars" role="img" aria-label="' + r.stars + ' out of 5 stars">' + starsRow(r.stars) + "</div>" +
      "</div>" +
      '<h3 class="rv-title">' + esc(r.title) + "</h3>" +
      '<p class="rv-body">' + esc(r.body) + "</p>" +
      '<div class="rv-foot">' +
        '<button class="helpful" type="button" data-id="' + r.id + '" aria-pressed="false">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 10h3v11H2V10Zm6.5 11c-.7 0-1.3-.4-1.6-1H7V10c0-.3.1-.5.3-.7l6-6 .9.9c.2.2.3.5.3.8v.2L13.6 9H21c.8 0 1.5.7 1.5 1.5v2c0 .2 0 .4-.1.6l-2.3 5.5c-.3.7-.9 1.1-1.6 1.1H8.5Z"/></svg>' +
          'Helpful <span class="hc">(' + r.helpful + ")</span>" +
        "</button>" +
        '<span class="rv-foot-note">' + plural(r.helpful, "person") + " found this helpful</span>" +
      "</div>";
    return li;
  }

  function render() {
    var list = filteredSorted();
    var ul = $("#reviewList");
    ul.innerHTML = "";

    if (!list.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.innerHTML = "<strong>No reviews match this filter</strong>Try selecting a different star rating.";
      ul.appendChild(empty);
      $("#loadMore").hidden = true;
    } else {
      list.slice(0, state.shown).forEach(function (r) { ul.appendChild(reviewCard(r)); });
      $("#loadMore").hidden = state.shown >= list.length;
      if (!$("#loadMore").hidden) {
        $("#loadMore").textContent = "Load more reviews (" + (list.length - state.shown) + " more)";
      }
    }

    // result meta
    var shown = Math.min(state.shown, list.length);
    var noun = state.filter === "all" ? "review" : state.filter + "-star review";
    $("#resultMeta").textContent = "Showing " + shown + " of " + plural(list.length, noun);
  }

  /* ---------- Events: filter pills + breakdown rows ---------- */
  function setFilter(val) {
    state.filter = val;
    state.shown = PAGE;
    $$(".pill").forEach(function (p) {
      var on = p.dataset.filter === val;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $$(".bar-row").forEach(function (row) {
      row.classList.toggle("is-on", val !== "all" && row.dataset.stars === val);
    });
    render();
  }

  $$(".pill").forEach(function (p) {
    p.addEventListener("click", function () { setFilter(p.dataset.filter); });
  });
  $$(".bar-row").forEach(function (row) {
    row.addEventListener("click", function () {
      var val = state.filter === row.dataset.stars ? "all" : row.dataset.stars;
      setFilter(val);
    });
  });

  $("#sort").addEventListener("change", function () {
    state.sort = this.value;
    state.shown = PAGE;
    render();
  });

  $("#loadMore").addEventListener("click", function () {
    state.shown += PAGE;
    render();
  });

  /* ---------- Helpful votes (event delegation) ---------- */
  var voted = {};
  $("#reviewList").addEventListener("click", function (e) {
    var btn = e.target.closest(".helpful");
    if (!btn) return;
    var id = +btn.dataset.id;
    var rev = reviews.filter(function (r) { return r.id === id; })[0];
    if (!rev) return;

    if (voted[id]) {
      rev.helpful--; voted[id] = false;
      btn.classList.remove("voted");
      btn.setAttribute("aria-pressed", "false");
    } else {
      rev.helpful++; voted[id] = true;
      btn.classList.add("voted");
      btn.setAttribute("aria-pressed", "true");
      toast("Thanks — marked as helpful");
    }
    $(".hc", btn).textContent = "(" + rev.helpful + ")";
    var note = btn.parentNode.querySelector(".rv-foot-note");
    if (note) note.textContent = plural(rev.helpful, "person") + " found this helpful";
  });

  /* ---------- Star rating input ---------- */
  var starBtns = $$(".star-btn");
  var chosen = 0, hint = $("#starHint");
  var WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  function paint(n) {
    starBtns.forEach(function (b) { b.classList.toggle("on", +b.dataset.val <= n); });
  }
  function commit(n) {
    chosen = n;
    starBtns.forEach(function (b) {
      b.setAttribute("aria-checked", +b.dataset.val === n ? "true" : "false");
      b.tabIndex = +b.dataset.val === n ? 0 : -1;
    });
    if (n === 0) { starBtns[0].tabIndex = 0; }
    paint(n);
    hint.textContent = n ? WORDS[n] + " · " + n + "/5" : "Tap to rate";
  }
  commit(0);

  starBtns.forEach(function (b) {
    b.addEventListener("mouseenter", function () { paint(+b.dataset.val); });
    b.addEventListener("click", function () { commit(+b.dataset.val); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault(); var n = Math.min(5, (chosen || 0) + 1); commit(n); starBtns[n - 1].focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault(); var m = Math.max(1, (chosen || 1) - 1); commit(m); starBtns[m - 1].focus();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault(); commit(+b.dataset.val);
      }
    });
  });
  $("#starInput").addEventListener("mouseleave", function () { paint(chosen); });

  /* ---------- Submit form ---------- */
  var form = $("#reviewForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = $("#rvName"), bodyEl = $("#rvBody");
    var name = nameEl.value.trim(), body = bodyEl.value.trim();

    nameEl.parentNode.classList.remove("err");
    bodyEl.parentNode.classList.remove("err");

    if (!chosen) { $("#starInput").classList.add("err"); toast("Please pick a star rating"); starBtns[0].focus(); return; }
    if (!name) { nameEl.parentNode.classList.add("err"); toast("Please add your name"); nameEl.focus(); return; }
    if (!body) { bodyEl.parentNode.classList.add("err"); toast("Please write your review"); bodyEl.focus(); return; }
    $("#starInput").classList.remove("err");

    var newId = Math.max.apply(null, reviews.map(function (r) { return r.id; })) + 1;
    reviews.push({
      id: newId, name: name, verified: true, stars: chosen, daysAgo: 0,
      helpful: 0, title: chosen >= 4 ? "Great experience" : "My honest take",
      body: body
    });

    // reset form, refresh UI, surface the new review
    form.reset();
    commit(0);
    state.filter = "all";
    state.sort = "recent";
    $("#sort").value = "recent";
    state.shown = PAGE;
    setFilter("all");
    renderSummary();
    toast("Review published — thank you!");
    $("#reviewList").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- Init ---------- */
  renderSummary();
  render();
})();
