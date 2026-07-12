(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- live count ticker ---------- */
  var liveEl = document.getElementById("liveCount");
  var live = 1284;
  if (liveEl) {
    setInterval(function () {
      live += Math.floor(Math.random() * 7) - 2; // drift up-ish
      if (live < 1180) live = 1180;
      liveEl.textContent = live.toLocaleString();
    }, 2200);
  }

  /* ---------- spotlight profiles ---------- */
  var profiles = [
    {
      name: "Mia", age: 26, dist: "1.2 mi", badge: "🔥 Active now",
      bio: "Rooftop cocktails > small talk. Show me your worst dad joke.",
      tags: ["Cocktails", "Live music", "Spontaneous"],
      grad: "linear-gradient(135deg,#ff5e6c,#ff8fb1)"
    },
    {
      name: "Leo", age: 29, dist: "0.8 mi", badge: "✨ New here",
      bio: "Taco crawl tonight? I know a place. Bring your appetite.",
      tags: ["Foodie", "Vinyl", "Night owl"],
      grad: "linear-gradient(135deg,#8b5cf6,#6d28d9)"
    },
    {
      name: "Priya", age: 24, dist: "2.1 mi", badge: "🔥 Active now",
      bio: "Trivia champ looking for a partner in (harmless) crime.",
      tags: ["Trivia", "Coffee", "Adventures"],
      grad: "linear-gradient(135deg,#fbbf24,#f97316)"
    },
    {
      name: "Sam", age: 31, dist: "1.5 mi", badge: "💜 Popular",
      bio: "Late-night ramen and even later conversations. You in?",
      tags: ["Ramen", "Films", "No-strings"],
      grad: "linear-gradient(135deg,#34d399,#0ea5e9)"
    }
  ];

  var spotlight = document.getElementById("spotlight");
  var spotDots = document.getElementById("spotDots");
  var idx = 0;

  function renderSpot() {
    var p = profiles[idx];
    spotlight.innerHTML =
      '<article class="spot-card" style="background:' + p.grad + '">' +
        '<span class="spot-badge">' + p.badge + '</span>' +
        '<span class="spot-dist">📍 ' + p.dist + '</span>' +
        '<div class="spot-info">' +
          '<div class="spot-name">' + p.name + ", " + p.age +
            ' <span class="spot-verified" title="Verified">✔️</span></div>' +
          '<p class="spot-bio">' + p.bio + "</p>" +
          '<div class="spot-tags">' + p.tags.map(function (t) {
            return "<span>" + t + "</span>";
          }).join("") + "</div>" +
        "</div>" +
        '<button class="spot-like" type="button" aria-label="Like ' + p.name + '">💗</button>' +
      "</article>";

    var likeBtn = spotlight.querySelector(".spot-like");
    likeBtn.addEventListener("click", function () {
      likeBtn.classList.remove("liked");
      void likeBtn.offsetWidth; // reflow to restart animation
      likeBtn.classList.add("liked");
      toast("You liked " + p.name + " — they'll see it tonight 💗");
    });

    renderDots();
  }

  function renderDots() {
    spotDots.innerHTML = profiles.map(function (_, i) {
      return '<button type="button" role="tab" aria-label="Profile ' + (i + 1) +
        '" class="' + (i === idx ? "on" : "") + '"></button>';
    }).join("");
  }

  spotDots.addEventListener("click", function (e) {
    var btns = Array.prototype.slice.call(spotDots.children);
    var i = btns.indexOf(e.target);
    if (i > -1) { idx = i; renderSpot(); }
  });

  document.getElementById("spotNext").addEventListener("click", function () {
    idx = (idx + 1) % profiles.length; renderSpot();
  });
  document.getElementById("spotPrev").addEventListener("click", function () {
    idx = (idx - 1 + profiles.length) % profiles.length; renderSpot();
  });

  renderSpot();

  /* ---------- vibe filters + match list ---------- */
  var allMatches = [
    { name: "Chloe", meta: "26 · 1.1 mi · online", match: 96, vibe: "tonight", emoji: "🍸", g: "linear-gradient(135deg,#ff5e6c,#ff8fb1)" },
    { name: "Deshawn", meta: "30 · 0.6 mi · online", match: 91, vibe: "tonight", emoji: "🎧", g: "linear-gradient(135deg,#8b5cf6,#6d28d9)" },
    { name: "Ana", meta: "27 · 2.4 mi · online", match: 88, vibe: "coffee", emoji: "☕", g: "linear-gradient(135deg,#fbbf24,#f97316)" },
    { name: "Ravi", meta: "28 · 1.9 mi · online", match: 84, vibe: "coffee", emoji: "📚", g: "linear-gradient(135deg,#34d399,#059669)" },
    { name: "Nadia", meta: "25 · 3.0 mi · online", match: 93, vibe: "adventure", emoji: "🎢", g: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
    { name: "Theo", meta: "32 · 1.3 mi · online", match: 79, vibe: "adventure", emoji: "🏔️", g: "linear-gradient(135deg,#f43f5e,#a855f7)" },
    { name: "Jules", meta: "29 · 0.9 mi · online", match: 90, vibe: "nostrings", emoji: "🎈", g: "linear-gradient(135deg,#ec4899,#8b5cf6)" },
    { name: "Kai", meta: "27 · 2.2 mi · online", match: 82, vibe: "nostrings", emoji: "🌙", g: "linear-gradient(135deg,#22d3ee,#3b82f6)" }
  ];

  var matchesEl = document.getElementById("matches");
  var vibes = document.getElementById("vibes");

  function renderMatches(vibe) {
    var list = allMatches.filter(function (m) { return m.vibe === vibe; });
    // pad with a top-tonight pick so every vibe shows 3
    var extra = allMatches.filter(function (m) { return m.vibe !== vibe; })
      .sort(function (a, b) { return b.match - a.match; }).slice(0, 3 - list.length);
    list = list.concat(extra).slice(0, 3);

    matchesEl.innerHTML = list.map(function (m, i) {
      return '<li class="match" style="animation-delay:' + (i * 60) + 'ms">' +
        '<span class="m-avatar" style="background:' + m.g + '">' + m.emoji +
          '<span class="on-dot"></span></span>' +
        '<span class="m-body">' +
          '<span class="m-name">' + m.name + '</span>' +
          '<span class="m-meta">' + m.meta + '</span>' +
        '</span>' +
        '<span class="m-match">' + m.match + '% match</span>' +
      '</li>';
    }).join("");
  }

  vibes.addEventListener("click", function (e) {
    var btn = e.target.closest(".vibe");
    if (!btn) return;
    Array.prototype.forEach.call(vibes.children, function (b) {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    renderMatches(btn.dataset.vibe);
  });

  renderMatches("tonight");

  /* ---------- count-up stats on scroll ---------- */
  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return Math.round(n / 1000) + "K";
    return String(n);
  }
  function countUp(el) {
    var to = parseInt(el.dataset.to, 10);
    var suffix = el.dataset.suffix || "";
    var start = performance.now();
    var dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(to * eased);
      el.textContent = (to >= 1000 ? formatNum(val) : val) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var statsWrap = document.getElementById("stats");
  if ("IntersectionObserver" in window && statsWrap) {
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !seen) {
          seen = true;
          statsWrap.querySelectorAll(".stat-num").forEach(countUp);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(statsWrap);
  } else if (statsWrap) {
    statsWrap.querySelectorAll(".stat-num").forEach(countUp);
  }

  /* ---------- signup form ---------- */
  var form = document.getElementById("signupForm");
  var email = document.getElementById("email");
  var field = email.closest(".field");
  var errEl = document.getElementById("emailErr");
  var joinBtn = document.getElementById("joinBtn");
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = email.value.trim();
    if (!re.test(val)) {
      field.classList.remove("invalid");
      void field.offsetWidth;
      field.classList.add("invalid");
      errEl.textContent = val ? "Hmm, that email looks off." : "Enter your email to join.";
      email.focus();
      return;
    }
    field.classList.remove("invalid");
    errEl.textContent = "";
    joinBtn.textContent = "You're in! 🎉";
    joinBtn.disabled = true;
    toast("Welcome! Finding people near you tonight… 💗");
    setTimeout(function () {
      joinBtn.textContent = "Join free tonight";
      joinBtn.disabled = false;
      email.value = "";
    }, 3200);
  });

  email.addEventListener("input", function () {
    if (field.classList.contains("invalid") && re.test(email.value.trim())) {
      field.classList.remove("invalid");
      errEl.textContent = "";
    }
  });

  /* ---------- login button ---------- */
  document.getElementById("loginBtn").addEventListener("click", function () {
    toast("Log in coming soon — join free for now! ✨");
  });

})();
