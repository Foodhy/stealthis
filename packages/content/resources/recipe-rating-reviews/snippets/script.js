(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------- Seed data ---------- */
  // Distribution counts for 5..1 stars
  var dist = { 5: 221, 4: 59, 3: 19, 2: 9, 1: 4 };

  var reviews = [
    {
      id: "r1",
      name: "Marisol Vega",
      stars: 5,
      madeIt: true,
      date: "2026-05-28",
      text: "The charred tomatoes make this. I let them blister hard in the pan and the saffron came through beautifully. Added a pinch of chili flakes — restaurant quality.",
      helpful: 47,
      voted: false
    },
    {
      id: "r2",
      name: "Daniel Okafor",
      stars: 5,
      madeIt: true,
      date: "2026-06-09",
      text: "Made it for friends and everyone asked for the recipe. Bucatini is the right call — it holds the oil and tomato so well.",
      helpful: 31,
      voted: false
    },
    {
      id: "r3",
      name: "Priya Nair",
      stars: 4,
      madeIt: true,
      date: "2026-06-02",
      text: "Lovely weeknight dish. I bloomed the saffron in a little warm pasta water first which deepened the color and flavor. Knocked off a star only because mine needed more salt than stated.",
      helpful: 18,
      voted: false
    },
    {
      id: "r4",
      name: "Tomás Herrera",
      stars: 5,
      madeIt: false,
      date: "2026-06-11",
      text: "Saving this for the weekend — the photos and the saffron idea sold me instantly. Will report back.",
      helpful: 6,
      voted: false
    },
    {
      id: "r5",
      name: "Greta Lindqvist",
      stars: 3,
      madeIt: true,
      date: "2026-05-19",
      text: "Good but a touch one-note for my taste. Next time I'll finish with lemon zest and torn basil to brighten it up.",
      helpful: 12,
      voted: false
    },
    {
      id: "r6",
      name: "Amir Haddad",
      stars: 4,
      madeIt: true,
      date: "2026-06-13",
      text: "Quick, fragrant, and very forgiving. Used spaghetti since I had no bucatini and it still worked great.",
      helpful: 9,
      voted: false
    }
  ];

  var avatarColors = ["#d6452b", "#e8a33d", "#7c8a6b", "#c8775a", "#b8351e", "#5c534a"];

  /* ---------- Aggregate computation ---------- */
  var aggBig = document.getElementById("aggBig");
  var aggStars = document.getElementById("aggStars");
  var aggCount = document.getElementById("aggCount");
  var madeCount = document.getElementById("madeCount");

  function computeAggregate() {
    var total = 0, weighted = 0;
    for (var s = 5; s >= 1; s--) {
      total += dist[s];
      weighted += s * dist[s];
    }
    var avg = total ? weighted / total : 0;
    return { total: total, avg: avg };
  }

  function renderStarBar(container, value) {
    var stars = container.querySelectorAll(".star");
    stars.forEach(function (star, i) {
      var fill = Math.max(0, Math.min(1, value - i)) * 100;
      star.style.setProperty("--fill", fill + "%");
    });
  }

  function buildStarSpan(value) {
    var span = document.createElement("span");
    span.className = "stars stars--display review__stars";
    span.setAttribute("role", "img");
    span.setAttribute("aria-label", value + " out of 5 stars");
    for (var i = 0; i < 5; i++) {
      var st = document.createElement("span");
      st.className = "star";
      st.textContent = "★";
      var fill = Math.max(0, Math.min(1, value - i)) * 100;
      st.style.setProperty("--fill", fill + "%");
      span.appendChild(st);
    }
    return span;
  }

  function renderAggregate() {
    var a = computeAggregate();
    aggBig.textContent = a.avg.toFixed(1);
    aggCount.textContent = a.total.toLocaleString("en-US");
    if (aggStars) {
      aggStars.setAttribute("aria-label", "Rated " + a.avg.toFixed(1) + " out of 5 stars");
      renderStarBar(aggStars, a.avg);
    }
    // distribution bars
    document.querySelectorAll(".dist__row").forEach(function (row) {
      var s = +row.getAttribute("data-star");
      var pct = a.total ? (dist[s] / a.total) * 100 : 0;
      var fill = row.querySelector(".dist__fill");
      var num = row.querySelector(".dist__num");
      if (fill) fill.style.setProperty("--pct", pct.toFixed(1) + "%");
      if (num) num.textContent = dist[s].toLocaleString("en-US");
    });
    var made = reviews.filter(function (r) { return r.madeIt; }).length;
    // keep the seeded "made it" number plausible relative to the visible reviews
    if (madeCount) madeCount.textContent = (204 + (window.__userMade ? 1 : 0)).toLocaleString("en-US");
  }

  /* ---------- Rate this recipe ---------- */
  var starInput = document.getElementById("starInput");
  var rateLive = document.getElementById("rateLive");
  var rateHint = document.getElementById("rateHint");
  var userRated = false;
  var labels = {
    1: "Didn’t work for me",
    2: "Just okay",
    3: "Good",
    4: "Really good",
    5: "Loved it"
  };

  starInput.addEventListener("change", function (e) {
    var input = e.target;
    if (input.name !== "rating") return;
    var value = +input.value;
    starInput.classList.add("is-set");

    // Optimistic aggregate update: only count the very first rating from this user.
    if (userRated) {
      // user is changing their existing rating — remove old, add new
      dist[window.__userRating] = Math.max(0, dist[window.__userRating] - 1);
    }
    dist[value] = dist[value] + 1;
    window.__userRating = value;
    window.__userMade = true;
    userRated = true;

    renderAggregate();
    rateLive.textContent = "Thanks! You rated this " + value + " ★ — " + labels[value] + ".";
    rateHint.textContent = "Tap another star to change your rating.";
    toast("Your " + value + "★ rating was added");
  });

  /* ---------- Reviews render + sort ---------- */
  var listEl = document.getElementById("reviewList");
  var reviewsN = document.getElementById("reviewsN");
  var tpl = document.getElementById("reviewTpl");
  var sortSel = document.getElementById("sortSel");

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function sortReviews(mode) {
    var arr = reviews.slice();
    if (mode === "newest") {
      arr.sort(function (a, b) { return b.date.localeCompare(a.date); });
    } else if (mode === "highest") {
      arr.sort(function (a, b) { return b.stars - a.stars || b.helpful - a.helpful; });
    } else {
      arr.sort(function (a, b) { return b.helpful - a.helpful; });
    }
    return arr;
  }

  function renderReviews() {
    var mode = sortSel.value;
    var arr = sortReviews(mode);
    listEl.innerHTML = "";
    arr.forEach(function (r, idx) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = r.id;

      var av = node.querySelector("[data-avatar]");
      av.textContent = r.name.trim().charAt(0).toUpperCase();
      av.style.background = avatarColors[idx % avatarColors.length];

      node.querySelector("[data-name]").textContent = r.name;

      var badge = node.querySelector("[data-badge]");
      if (r.madeIt) badge.hidden = false;

      var starsHolder = node.querySelector("[data-stars]");
      starsHolder.replaceWith(buildStarSpan(r.stars));

      var t = node.querySelector("[data-date]");
      t.textContent = fmtDate(r.date);
      t.setAttribute("datetime", r.date);

      node.querySelector("[data-text]").textContent = r.text;

      var btn = node.querySelector("[data-helpful]");
      var nEl = node.querySelector("[data-helpful-n]");
      nEl.textContent = r.helpful;
      btn.setAttribute("aria-pressed", r.voted ? "true" : "false");
      btn.addEventListener("click", function () {
        r.voted = !r.voted;
        r.helpful += r.voted ? 1 : -1;
        nEl.textContent = r.helpful;
        btn.setAttribute("aria-pressed", r.voted ? "true" : "false");
        toast(r.voted ? "Marked review as helpful" : "Removed helpful vote");
        // re-sort live if currently sorting by helpful
        if (sortSel.value === "helpful") renderReviews();
      });

      listEl.appendChild(node);
    });
    if (reviewsN) reviewsN.textContent = "(" + arr.length + ")";
  }

  sortSel.addEventListener("change", function () {
    renderReviews();
    var label = sortSel.options[sortSel.selectedIndex].text;
    toast("Sorted by " + label.toLowerCase());
  });

  /* ---------- Init ---------- */
  renderAggregate();
  renderReviews();
})();
