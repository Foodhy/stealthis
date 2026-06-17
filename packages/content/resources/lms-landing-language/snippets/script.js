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
    }, 2400);
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en, i) {
          if (en.isIntersecting) {
            var el = en.target;
            setTimeout(function () {
              el.classList.add("in");
            }, Math.min(i * 50, 200));
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- languages grid ---------- */
  var LANGS = [
    { flag: "🇪🇸", name: "Spanish", learners: "5.8M", pct: 92, tag: "pop" },
    { flag: "🇫🇷", name: "French", learners: "4.1M", pct: 84, tag: "pop" },
    { flag: "🇯🇵", name: "Japanese", learners: "3.7M", pct: 78, tag: "pop" },
    { flag: "🇩🇪", name: "German", learners: "2.9M", pct: 71 },
    { flag: "🇮🇹", name: "Italian", learners: "2.2M", pct: 66 },
    { flag: "🇰🇷", name: "Korean", learners: "3.3M", pct: 81, tag: "pop" },
    { flag: "🇧🇷", name: "Portuguese", learners: "1.6M", pct: 58 },
    { flag: "🇨🇳", name: "Mandarin", learners: "2.4M", pct: 63 },
    { flag: "🇳🇱", name: "Dutch", learners: "640K", pct: 44 },
    { flag: "🇸🇪", name: "Swedish", learners: "390K", pct: 38, tag: "new" },
    { flag: "🇸🇦", name: "Arabic", learners: "1.1M", pct: 52 },
    { flag: "🇰🇪", name: "Swahili", learners: "210K", pct: 31, tag: "new" }
  ];

  var langGrid = document.getElementById("langGrid");
  if (langGrid) {
    var frag = document.createDocumentFragment();
    LANGS.forEach(function (l) {
      var card = document.createElement("button");
      card.className = "lang-card reveal";
      card.type = "button";
      var pill = l.tag === "new"
        ? '<span class="lang-pill pill-new">New</span>'
        : l.tag === "pop"
          ? '<span class="lang-pill pill-pop">Popular</span>'
          : "";
      card.innerHTML =
        '<div class="lang-top"><span class="lang-flag">' + l.flag + "</span>" + pill + "</div>" +
        '<span class="lang-name">' + l.name + "</span>" +
        '<span class="lang-learners">' + l.learners + " learners</span>" +
        '<div class="lang-bar"><span data-pct="' + l.pct + '"></span></div>';
      card.addEventListener("click", function () {
        toast("Starting your free " + l.name + " course 🦉");
      });
      frag.appendChild(card);
    });
    langGrid.appendChild(frag);

    // animate bars when grid enters view
    if ("IntersectionObserver" in window) {
      var barObs = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              langGrid.querySelectorAll(".lang-bar span").forEach(function (b) {
                b.style.width = b.getAttribute("data-pct") + "%";
              });
              obs.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );
      barObs.observe(langGrid);
    } else {
      langGrid.querySelectorAll(".lang-bar span").forEach(function (b) {
        b.style.width = b.getAttribute("data-pct") + "%";
      });
    }
  }

  /* ---------- pricing toggle ---------- */
  var PRICES = {
    monthly: {
      super: ["$9.99", "/mo", "Billed monthly"],
      fam: ["$16.99", "/mo", "Up to 6 accounts"]
    },
    yearly: {
      super: ["$5.99", "/mo", "Billed $71.88 yearly"],
      fam: ["$9.99", "/mo", "Billed $119.88 yearly"]
    }
  };
  var billOpts = document.querySelectorAll(".bill-opt");
  function setPeriod(period) {
    var p = PRICES[period];
    var set = function (id, vals) {
      var amt = document.getElementById("price" + id);
      var per = document.getElementById("per" + id);
      var note = document.getElementById("note" + id);
      if (amt) amt.textContent = vals[0];
      if (per) per.textContent = vals[1];
      if (note) note.textContent = vals[2];
    };
    set("Super", p.super);
    set("Fam", p.fam);
  }
  billOpts.forEach(function (opt) {
    opt.addEventListener("click", function () {
      billOpts.forEach(function (o) {
        o.classList.remove("is-active");
      });
      opt.classList.add("is-active");
      setPeriod(opt.getAttribute("data-period"));
    });
  });

  /* ---------- store + plan CTAs ---------- */
  document.querySelectorAll(".store-btn").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      toast("App download is just a demo 🙂");
    });
  });
  document.querySelectorAll(".price-card .btn").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      var plan = b.closest(".price-card").querySelector("h3").textContent;
      toast("You picked the " + plan + " plan!");
    });
  });

  /* ---------- count-up streak/xp floaties ---------- */
  function countUp(el, target, suffix) {
    if (!el) return;
    var start = 0;
    var dur = 1100;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var prog = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      var val = Math.round(eased * target);
      el.textContent = val.toLocaleString() + (suffix || "");
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  countUp(document.getElementById("streakNum"), 137);
  countUp(document.getElementById("xpNum"), 2480);

  /* ---------- interactive phone lesson demo ---------- */
  var BANK = ["The", "cat", "dog", "drinks", "eats", "milk", "water"];
  var CORRECT = ["The", "cat", "drinks", "milk"];

  var bankEl = document.getElementById("wordBank");
  var answerEl = document.getElementById("answerSlots");
  var checkBtn = document.getElementById("checkBtn");
  var resultEl = document.getElementById("lessonResult");
  var continueBtn = document.getElementById("continueBtn");
  var lessonBar = document.getElementById("lessonBar");
  var heartsEl = document.getElementById("appHearts");
  var speaker = document.getElementById("speaker");
  var answer = [];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function renderBank() {
    if (!bankEl) return;
    bankEl.innerHTML = "";
    shuffle(BANK).forEach(function (w) {
      var chip = document.createElement("button");
      chip.className = "chip";
      chip.type = "button";
      chip.textContent = w;
      chip.addEventListener("click", function () {
        if (chip.classList.contains("used")) return;
        chip.classList.add("used");
        addWord(w, chip);
      });
      bankEl.appendChild(chip);
    });
  }

  function addWord(word, sourceChip) {
    answer.push({ word: word, source: sourceChip });
    var placed = document.createElement("button");
    placed.className = "chip placed";
    placed.type = "button";
    placed.textContent = word;
    placed.addEventListener("click", function () {
      // remove from answer, restore bank chip
      var idx = answer.findIndex(function (a) {
        return a.placed === placed;
      });
      if (idx > -1) {
        answer[idx].source.classList.remove("used");
        answer.splice(idx, 1);
      }
      placed.remove();
      updateCheck();
    });
    answer[answer.length - 1].placed = placed;
    answerEl.appendChild(placed);
    updateCheck();
  }

  function updateCheck() {
    if (checkBtn) checkBtn.disabled = answer.length === 0;
  }

  function loseHeart() {
    if (!heartsEl) return;
    var alive = heartsEl.querySelectorAll("span:not(.dead)");
    if (alive.length) alive[alive.length - 1].classList.add("dead");
  }

  function resetLesson() {
    answer = [];
    if (answerEl) answerEl.innerHTML = "";
    if (resultEl) {
      resultEl.classList.remove("show", "wrong");
      resultEl.hidden = true;
    }
    if (lessonBar) lessonBar.style.width = "20%";
    renderBank();
    updateCheck();
  }

  if (checkBtn) {
    checkBtn.addEventListener("click", function () {
      var attempt = answer.map(function (a) { return a.word; });
      var correct =
        attempt.length === CORRECT.length &&
        attempt.every(function (w, i) { return w === CORRECT[i]; });

      resultEl.hidden = false;
      // force reflow so transition runs
      void resultEl.offsetWidth;
      var icon = resultEl.querySelector(".result-icon");
      var title = resultEl.querySelector(".result-title");
      var sub = resultEl.querySelector(".result-sub");

      if (correct) {
        resultEl.classList.remove("wrong");
        resultEl.classList.add("show");
        icon.textContent = "✓";
        title.textContent = "Nicely done!";
        sub.textContent = "+12 XP · streak extended 🔥";
        if (lessonBar) lessonBar.style.width = "40%";
        toast("Correct! +12 XP earned ⚡");
      } else {
        resultEl.classList.add("wrong", "show");
        icon.textContent = "✕";
        title.textContent = "Not quite!";
        sub.textContent = 'Answer: "The cat drinks milk"';
        loseHeart();
        toast("Oops — try arranging the words again");
      }
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", resetLesson);
  }

  if (speaker) {
    speaker.addEventListener("click", function () {
      speaker.classList.remove("ping");
      void speaker.offsetWidth;
      speaker.classList.add("ping");
      toast("🔊 El gato bebe leche");
    });
  }

  renderBank();
  updateCheck();
})();
