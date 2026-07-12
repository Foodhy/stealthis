(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Profile data (fictional) ---------- */
  var profiles = [
    {
      name: "Sofia",
      age: 27,
      city: "2 miles away · Lisbon",
      grad: "linear-gradient(135deg,#ff5e6c,#8b5cf6)",
      match: "94% match",
      tags: ["Ceramics", "Trail runs", "Jazz vinyl"],
      verified: true
    },
    {
      name: "Marcus",
      age: 30,
      city: "5 miles away · Berlin",
      grad: "linear-gradient(135deg,#8b5cf6,#22d3ee)",
      match: "88% match",
      tags: ["Rock climbing", "Ramen", "Film photo"],
      verified: true
    },
    {
      name: "Aria",
      age: 25,
      city: "3 miles away · Austin",
      grad: "linear-gradient(135deg,#ff8fb1,#ff5e6c)",
      match: "91% match",
      tags: ["Painting", "Cold brew", "Corgis"],
      verified: false
    },
    {
      name: "Leo",
      age: 29,
      city: "1 mile away · Madrid",
      grad: "linear-gradient(135deg,#fbbf24,#ff5e6c)",
      match: "85% match",
      tags: ["Surfing", "Vinyl", "Tacos"],
      verified: true
    },
    {
      name: "Noor",
      age: 26,
      city: "4 miles away · Amsterdam",
      grad: "linear-gradient(135deg,#34d399,#8b5cf6)",
      match: "97% match",
      tags: ["Cycling", "Bookshops", "Matcha"],
      verified: true
    }
  ];

  var stack = document.getElementById("cardStack");
  var idx = 0;
  var busy = false;

  function buildCard(p) {
    var card = document.createElement("article");
    card.className = "profile-card";
    card.style.background = p.grad;

    var badge = document.createElement("span");
    badge.className = "match-badge";
    badge.textContent = p.match;
    card.appendChild(badge);

    var body = document.createElement("div");
    body.className = "card-body";

    var name = document.createElement("div");
    name.className = "card-name";
    name.appendChild(document.createTextNode(p.name + ", " + p.age));
    if (p.verified) {
      var v = document.createElement("span");
      v.className = "verify";
      v.textContent = "✓";
      v.setAttribute("aria-label", "verified");
      name.appendChild(v);
    }
    body.appendChild(name);

    var meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = p.city;
    body.appendChild(meta);

    var tags = document.createElement("div");
    tags.className = "card-tags";
    p.tags.forEach(function (t) {
      var s = document.createElement("span");
      s.className = "card-tag";
      s.textContent = t;
      tags.appendChild(s);
    });
    body.appendChild(tags);

    card.appendChild(body);
    return card;
  }

  // Render two stacked cards for depth
  function renderStack() {
    stack.innerHTML = "";
    var current = profiles[idx % profiles.length];
    var next = profiles[(idx + 1) % profiles.length];

    var back = buildCard(next);
    back.style.transform = "scale(0.94) translateY(10px)";
    back.style.opacity = "0.85";
    stack.appendChild(back);

    var front = buildCard(current);
    stack.appendChild(front);
    return front;
  }

  var topCard = renderStack();

  function swipe(dir, label) {
    if (busy || !topCard) return;
    busy = true;
    var name = profiles[idx % profiles.length].name;
    topCard.classList.add("leaving-" + dir);
    toast(label + " " + name);
    setTimeout(function () {
      idx = (idx + 1) % profiles.length;
      topCard = renderStack();
      busy = false;
    }, 460);
  }

  var likeBtn = document.getElementById("likeBtn");
  var passBtn = document.getElementById("passBtn");
  var starBtn = document.getElementById("starBtn");
  if (likeBtn) likeBtn.addEventListener("click", function () { swipe("like", "Liked"); });
  if (passBtn) passBtn.addEventListener("click", function () { swipe("pass", "Passed on"); });
  if (starBtn) starBtn.addEventListener("click", function () { swipe("star", "Super liked"); });

  // Auto-advance the stack gently
  var auto = setInterval(function () {
    if (!busy) swipe("like", "Someone liked");
  }, 5200);
  stack.addEventListener("mouseenter", function () { clearInterval(auto); });

  /* ---------- Store buttons ---------- */
  document.querySelectorAll(".store-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Opening " + btn.getAttribute("data-store") + "… 💘");
    });
  });

  /* ---------- Animated stat counters ---------- */
  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return Math.round(n / 1000) + "K";
    return String(n);
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-target"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var isPercent = suffix === "%";
    var start = null;
    var dur = 1600;
    function step(ts) {
      if (start === null) start = ts;
      var prog = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      var val = Math.round(target * eased);
      el.textContent = (isPercent ? val : formatNum(val)) + suffix;
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counted = false;
  var statsSection = document.getElementById("stats");
  if ("IntersectionObserver" in window && statsSection) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !counted) {
          counted = true;
          document.querySelectorAll(".stat-num").forEach(countUp);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(statsSection);
  } else {
    document.querySelectorAll(".stat-num").forEach(countUp);
  }
})();
