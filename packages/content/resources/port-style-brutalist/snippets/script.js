/* ============================================================
   BRUTALIST PORTFOLIO — interactions (vanilla JS, no libs)
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

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
    }, 2600);
  }

  /* ---------- marquee: duplicate track for seamless loop ---------- */
  var track = document.getElementById("marqueeTrack");
  if (track) {
    track.innerHTML += track.innerHTML; // double content -> -50% loop is seamless
    // click to pause/resume the loud marquee
    var marquee = track.closest(".marquee");
    if (marquee) {
      marquee.style.cursor = "pointer";
      marquee.addEventListener("click", function () {
        track.classList.toggle("paused");
      });
    }
  }

  /* ---------- INVERT theme toggle ---------- */
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var inverted = document.body.classList.toggle("invert");
      themeBtn.setAttribute("aria-pressed", String(inverted));
      themeBtn.textContent = inverted ? "REVERT" : "INVERT";
      toast(inverted ? "LIGHTS OUT. INVERTED." : "BACK TO PAPER.");
    });
  }

  /* ---------- count-up stats ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }
    var start = null;
    var dur = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- reveal-on-scroll: stats + skill bars ---------- */
  var revealed = new WeakSet();
  function reveal(el) {
    if (revealed.has(el)) return;
    revealed.add(el);
    if (el.hasAttribute("data-count")) countUp(el);
    if (el.classList.contains("bar")) el.classList.add("is-filled");
  }
  var watch = [].slice.call(
    document.querySelectorAll("[data-count], .bar")
  );
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    watch.forEach(function (el) {
      io.observe(el);
    });
  } else {
    watch.forEach(reveal);
  }

  /* ---------- work filters ---------- */
  var chips = [].slice.call(document.querySelectorAll(".chip"));
  var cards = [].slice.call(document.querySelectorAll(".work-card"));
  var emptyMsg = document.getElementById("workEmpty");

  function applyFilter(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var tags = card.getAttribute("data-tags") || "";
      var match = filter === "all" || tags.split(" ").indexOf(filter) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- work cards: keyboard activation -> toast ---------- */
  cards.forEach(function (card) {
    function open() {
      var titleEl = card.querySelector("h3");
      var title = titleEl ? titleEl.textContent : "PROJECT";
      toast("OPENING CASE STUDY: " + title + " (DEMO)");
    }
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  /* ---------- fictional social links -> toast ---------- */
  [].slice.call(document.querySelectorAll("[data-toast]")).forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast(a.getAttribute("data-toast"));
    });
  });

  /* ---------- contact form validation ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    function setErr(id, msg) {
      var field = document.getElementById(id);
      var wrap = field ? field.closest(".field") : null;
      var slot = form.querySelector('.err[data-for="' + id + '"]');
      if (wrap) wrap.classList.toggle("has-err", !!msg);
      if (field) field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (slot) slot.textContent = msg || "";
      return !msg;
    }
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();

      var ok = true;
      ok = setErr("cf-name", name ? "" : "TYPE YOUR NAME.") && ok;
      ok =
        setErr(
          "cf-email",
          !email ? "EMAIL REQUIRED." : !emailRe.test(email) ? "THAT EMAIL IS BROKEN." : ""
        ) && ok;
      ok = setErr("cf-msg", msg ? "" : "SAY SOMETHING.") && ok;

      if (!ok) {
        toast("FIX THE RED BITS.");
        var firstBad = form.querySelector(".field.has-err input, .field.has-err textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      form.reset();
      ["cf-name", "cf-email", "cf-msg"].forEach(function (id) {
        setErr(id, "");
      });
      toast("SENT. NICE. (NOT REALLY — IT'S A DEMO.)");
    });

    // clear an error as the user fixes it
    ["cf-name", "cf-email", "cf-msg"].forEach(function (id) {
      var f = document.getElementById(id);
      if (f)
        f.addEventListener("input", function () {
          var wrap = f.closest(".field");
          if (wrap && wrap.classList.contains("has-err")) setErr(id, "");
        });
    });
  }

  /* ---------- back to top ---------- */
  var topBtn = document.getElementById("topBtn");
  if (topBtn) {
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }
})();
