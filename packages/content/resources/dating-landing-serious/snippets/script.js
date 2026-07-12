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
    }, 3200);
  }

  /* ---------- animated match ticker ---------- */
  var ticker = document.getElementById("ticker");
  if (ticker) {
    var target = parseInt(ticker.getAttribute("data-target"), 10) || 0;
    var started = false;

    function runTicker() {
      if (started) return;
      started = true;
      var duration = 1800;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.floor(eased * target);
        ticker.textContent = val.toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(step);
        else ticker.textContent = target.toLocaleString("en-US");
      }
      requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              runTicker();
              io.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      io.observe(ticker);
    } else {
      runTicker();
    }
  }

  /* ---------- compatibility slider ---------- */
  var slider = document.getElementById("valuesSlider");
  var scoreOut = document.getElementById("scoreOut");
  var gauge = document.querySelector(".gauge");
  var widgetTag = document.getElementById("widgetTag");

  var tags = [
    "Not quite aligned — friendship, maybe.",
    "Some common ground to explore.",
    "Worth a conversation.",
    "A promising start — worth a first date.",
    "Strong potential. Say hello.",
    "Exceptional match. Don't overthink it.",
  ];

  function updateScore() {
    if (!slider) return;
    var v = parseInt(slider.value, 10); // 0..5
    // base 40 up to 96
    var score = Math.round(40 + (v / 5) * 56);
    if (scoreOut) scoreOut.textContent = score;
    if (gauge) {
      var turn = (score / 100).toFixed(3);
      gauge.style.setProperty("--gauge-turn", turn + "turn");
      // fallback for browsers without @property animated conic: set background directly
      gauge.style.background =
        "radial-gradient(circle at center, var(--white) 60%, transparent 61%)," +
        "conic-gradient(var(--coral) 0turn, var(--violet) " +
        turn +
        "turn, rgba(42,26,46,0.08) 0)";
    }
    if (widgetTag) widgetTag.textContent = tags[v];
  }
  if (slider) {
    slider.addEventListener("input", updateScore);
    updateScore();
  }

  /* ---------- testimonial rotator ---------- */
  var testimonials = [
    {
      q: "I'd deleted every other app. Kindred was the first one that felt like it took me seriously.",
      name: "Amara, 31",
      role: "joined for something serious",
    },
    {
      q: "The compatibility profile actually surfaced people I'd never have swiped past. I'm dating one of them now.",
      name: "Jonah, 34",
      role: "matched at 88%",
    },
    {
      q: "No games, no ghosting-by-design. Just a short list of thoughtful people every morning.",
      name: "Lena, 29",
      role: "Kindred+ member",
    },
    {
      q: "My matchmaker introduced me to someone I'd have overlooked. Six months in and it's the real thing.",
      name: "Marcus, 38",
      role: "Concierge member",
    },
  ];

  var quoteEl = document.getElementById("testiQuote");
  var nameEl = document.getElementById("testiName");
  var roleEl = document.getElementById("testiRole");
  var dotsEl = document.getElementById("testiDots");
  var current = 0;
  var autoTimer;

  function renderTesti(i) {
    var t = testimonials[i];
    if (!quoteEl) return;
    quoteEl.style.opacity = "0";
    setTimeout(function () {
      quoteEl.textContent = "“" + t.q + "”";
      nameEl.textContent = t.name;
      roleEl.textContent = t.role;
      quoteEl.style.opacity = "1";
    }, 180);
    Array.prototype.forEach.call(dotsEl.children, function (btn, idx) {
      btn.setAttribute("aria-selected", idx === i ? "true" : "false");
    });
    current = i;
  }

  function goTesti(i) {
    renderTesti((i + testimonials.length) % testimonials.length);
    restartAuto();
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () {
      goTesti(current + 1);
    }, 5000);
  }

  if (dotsEl) {
    testimonials.forEach(function (t, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Show testimonial " + (i + 1));
      b.addEventListener("click", function () {
        goTesti(i);
      });
      dotsEl.appendChild(b);
    });
    renderTesti(0);
    restartAuto();
  }

  /* ---------- email signup forms ---------- */
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function wireForm(formId, successMsg) {
    var form = document.getElementById(formId);
    if (!form) return;
    var input = form.querySelector("input[type='email']");
    var field = form.querySelector(".field");
    var hint = form.querySelector(".hint");
    var defaultHint = hint ? hint.textContent : "";

    input.addEventListener("input", function () {
      if (field.classList.contains("invalid") && isValidEmail(input.value.trim())) {
        field.classList.remove("invalid");
        if (hint) {
          hint.classList.remove("error");
          hint.textContent = defaultHint;
        }
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value.trim();
      if (!isValidEmail(val)) {
        field.classList.add("invalid");
        if (hint) {
          hint.classList.add("error");
          hint.textContent = "Please enter a valid email address.";
        }
        input.focus();
        return;
      }
      field.classList.remove("invalid");
      if (hint) {
        hint.classList.remove("error");
        hint.textContent = defaultHint;
      }
      form.reset();
      toast(successMsg);
    });
  }

  wireForm("joinForm", "Welcome to Kindred! Check your inbox to begin. 💜");
  wireForm("joinForm2", "You're in! Let's build your profile. 💜");

  /* ---------- smooth scroll for in-page nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (id === "#join") {
          var focusInput = el.querySelector("input[type='email']");
          if (focusInput) setTimeout(function () { focusInput.focus(); }, 500);
        }
      }
    });
  });
})();
