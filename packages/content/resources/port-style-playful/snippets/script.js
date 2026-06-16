(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------- Year + footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var topnav = document.querySelector(".topnav");
  if (menuToggle && topnav) {
    topnav.id = topnav.id || "topnav";
    menuToggle.setAttribute("aria-controls", topnav.id);
    menuToggle.addEventListener("click", function () {
      var open = topnav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    topnav.addEventListener("click", function (e) {
      if (e.target.closest(".navlink")) {
        topnav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Waving avatar ---------- */
  var avatar = document.getElementById("avatar");
  var hand = document.getElementById("waveHand");
  function wave() {
    if (!hand) return;
    hand.classList.remove("is-waving");
    // force reflow so the animation can restart
    void hand.offsetWidth;
    hand.classList.add("is-waving");
  }
  if (avatar) {
    avatar.addEventListener("mouseenter", wave);
    avatar.addEventListener("click", function () {
      wave();
      toast("Hi there! 👋");
    });
  }
  // wave once on load
  window.addEventListener("load", function () {
    setTimeout(wave, 600);
  });

  /* ---------- Animated stat counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = performance.now();
    var dur = 1200;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Project filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var emptyEl = document.getElementById("empty");
  var resetBtn = document.getElementById("resetFilter");

  function applyFilter(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-type") === filter;
      card.hidden = !match;
      if (match) shown++;
    });
    if (emptyEl) emptyEl.hidden = shown !== 0;
    chips.forEach(function (chip) {
      var active = chip.getAttribute("data-filter") === filter;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    var label = filter === "all" ? "all projects" : filter + " projects";
    toast(shown + " " + (shown === 1 ? "project" : "projects") + " · " + label);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyFilter(chip.getAttribute("data-filter"));
    });
  });
  if (resetBtn) {
    resetBtn.addEventListener("click", function () { applyFilter("all"); });
  }

  /* ---------- Poke a card (bouncy jelly) ---------- */
  cards.forEach(function (card) {
    function poke() {
      card.classList.remove("is-poked");
      void card.offsetWidth;
      card.classList.add("is-poked");
    }
    card.addEventListener("click", poke);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        poke();
        var title = card.querySelector(".card-title");
        toast("Boing! " + (title ? title.textContent : "Nice project") + " 🎈");
      }
    });
  });

  /* ---------- Scroll-spy nav ---------- */
  var navlinks = Array.prototype.slice.call(document.querySelectorAll("[data-spy]"));
  var spyMap = {};
  navlinks.forEach(function (l) { spyMap[l.getAttribute("data-spy")] = l; });
  var spyTargets = Object.keys(spyMap)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (spyTargets.length && "IntersectionObserver" in window) {
    var spyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navlinks.forEach(function (l) { l.classList.remove("is-current"); });
          var link = spyMap[entry.target.id];
          if (link) link.classList.add("is-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    spyTargets.forEach(function (t) { spyObs.observe(t); });
  }

  /* ---------- Copy email ---------- */
  var EMAIL = "maya@okafor.design";
  function copyEmail() {
    function done() { toast("Email copied — talk soon! 💌"); }
    function fail() { toast("Couldn't copy. Email: " + EMAIL); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done).catch(legacyCopy);
    } else {
      legacyCopy();
    }
    function legacyCopy() {
      try {
        var ta = document.createElement("textarea");
        ta.value = EMAIL;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? done() : fail();
      } catch (e) {
        fail();
      }
    }
  }
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) copyBtn.addEventListener("click", copyEmail);

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  function setError(field, msg) {
    var wrap = field.closest(".field");
    var err = wrap ? wrap.querySelector(".err") : null;
    if (wrap) wrap.classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
    field.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function validateField(field) {
    var v = field.value.trim();
    if (!v) { setError(field, "This one's required ✨"); return false; }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError(field, "Hmm, that email looks off"); return false;
    }
    setError(field, "");
    return true;
  }
  if (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, textarea"));
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { validateField(f); });
      f.addEventListener("input", function () {
        if (f.closest(".field").classList.contains("has-error")) validateField(f);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allOk = true;
      var firstBad = null;
      fields.forEach(function (f) {
        var ok = validateField(f);
        if (!ok && !firstBad) firstBad = f;
        allOk = allOk && ok;
      });
      if (!allOk) {
        if (firstBad) firstBad.focus();
        toast("Almost! Just fix the highlighted bits.");
        return;
      }
      var name = form.querySelector("#name").value.trim().split(" ")[0];
      form.reset();
      fields.forEach(function (f) { setError(f, ""); });
      toast("Thanks " + name + "! Your message is on its way 🚀");
    });
  }
})();
