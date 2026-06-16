// The Copper Kettle — farmhouse cookbook landing
// Vanilla JS: reveal-on-scroll, recipe-of-the-day rotator, newsletter validation + toast.
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- recipe of the day rotator ---------- */
  var recipes = [
    { title: "Rosemary Hearth Bread", meta: "45 min · serves 6 · easy" },
    { title: "Sunday Tomato Galette", meta: "55 min · serves 4 · medium" },
    { title: "White Bean & Sage Pot", meta: "1 hr 10 min · serves 6 · easy" },
    { title: "Brown-Butter Pear Crostata", meta: "50 min · serves 8 · medium" },
    { title: "Cider-Braised Lamb Shanks", meta: "3 hr 20 min · serves 4 · medium" },
    { title: "Lemon-Roasted Carrots", meta: "35 min · serves 4 · easy" }
  ];

  var rotdTitle = document.querySelector('[data-rotd="title"]');
  var rotdMeta = document.querySelector('[data-rotd="meta"]');
  var rotdDots = document.querySelector("[data-rotd-dots]");
  var rotdIndex = 0;
  var rotdTimer = null;

  function buildDots() {
    if (!rotdDots) return;
    rotdDots.innerHTML = "";
    recipes.forEach(function (_, i) {
      var dot = document.createElement("span");
      dot.className = "dot" + (i === rotdIndex ? " active" : "");
      rotdDots.appendChild(dot);
    });
  }

  function renderRotd() {
    var r = recipes[rotdIndex];
    if (rotdTitle) rotdTitle.textContent = r.title;
    if (rotdMeta) rotdMeta.textContent = r.meta;
    if (rotdDots) {
      var dots = rotdDots.querySelectorAll(".dot");
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle("active", i === rotdIndex);
      }
    }
  }

  function nextRotd() {
    rotdIndex = (rotdIndex + 1) % recipes.length;
    renderRotd();
  }

  if (rotdTitle) {
    // start on a pseudo-random recipe so it feels like "today's" pick
    rotdIndex = new Date().getDate() % recipes.length;
    buildDots();
    renderRotd();
    if (!prefersReduced) {
      rotdTimer = setInterval(nextRotd, 4500);
    }
    // tapping the card advances and pauses auto-rotation briefly
    var rotdCard = rotdTitle.closest(".rotd");
    if (rotdCard) {
      rotdCard.style.cursor = "pointer";
      rotdCard.setAttribute("tabindex", "0");
      rotdCard.setAttribute("role", "button");
      rotdCard.setAttribute("aria-label", "Recipe of the day — tap for another");
      var advance = function () {
        clearInterval(rotdTimer);
        nextRotd();
        if (!prefersReduced) rotdTimer = setInterval(nextRotd, 4500);
      };
      rotdCard.addEventListener("click", advance);
      rotdCard.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advance();
        }
      });
    }
  }

  /* ---------- newsletter form ---------- */
  var form = document.getElementById("newsForm");
  var emailInput = document.getElementById("email");
  var hint = document.getElementById("emailHint");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setHint(text, state) {
    if (!hint) return;
    hint.textContent = text;
    hint.classList.remove("error", "ok");
    if (state) hint.classList.add(state);
  }

  if (form && emailInput) {
    emailInput.addEventListener("input", function () {
      if (emailInput.classList.contains("invalid") && emailRe.test(emailInput.value.trim())) {
        emailInput.classList.remove("invalid");
        emailInput.setAttribute("aria-invalid", "false");
        setHint("Looks good — hit send.", null);
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = emailInput.value.trim();
      if (!value) {
        emailInput.classList.add("invalid");
        emailInput.setAttribute("aria-invalid", "true");
        setHint("Pop your email in first, please.", "error");
        emailInput.focus();
        return;
      }
      if (!emailRe.test(value)) {
        emailInput.classList.add("invalid");
        emailInput.setAttribute("aria-invalid", "true");
        setHint("Hmm, that email doesn't look quite right.", "error");
        emailInput.focus();
        return;
      }
      emailInput.classList.remove("invalid");
      emailInput.setAttribute("aria-invalid", "false");
      setHint("You're on the list — check your inbox on Sunday.", "ok");
      toast("Welcome to the table 🌿 A recipe is on its way.");
      form.reset();
    });
  }
})();
