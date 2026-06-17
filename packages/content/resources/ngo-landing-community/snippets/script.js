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
    }, 3200);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("primary-nav");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Nav scroll shadow ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated impact counters ---------- */
  var counters = document.querySelectorAll(".stat strong[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCount(en.target);
            co.unobserve(en.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Next gathering banner ---------- */
  var nextEl = document.getElementById("nextGathering");
  if (nextEl) {
    var schedule = [
      { day: 0, h: 9, label: "Sunday Worship at 9:00 AM" },
      { day: 0, h: 11, label: "Sunday Worship at 11:00 AM" },
      { day: 3, h: 18.5, label: "Wednesday Gathering at 6:30 PM" },
      { day: 5, h: 12, label: "Community Lunch on Friday at noon" },
      { day: 5, h: 19, label: "Youth Night on Friday at 7:00 PM" }
    ];
    var now = new Date();
    var nowDay = now.getDay();
    var nowH = now.getHours() + now.getMinutes() / 60;
    var best = null, bestDelta = Infinity;
    schedule.forEach(function (s) {
      var delta = (s.day - nowDay + 7) % 7 + (s.h - nowH) / 24;
      if (delta < 0) delta += 7;
      if (delta < bestDelta) { bestDelta = delta; best = s; }
    });
    nextEl.textContent = best ? "Next gathering: " + best.label + " — we'd love to see you." : "";
  }

  /* ---------- Ministry filter ---------- */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll("#programGrid .card");
  var emptyNote = document.getElementById("emptyNote");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var f = chip.getAttribute("data-filter");
      var shown = 0;
      cards.forEach(function (card) {
        var match = f === "all" || card.getAttribute("data-cat") === f;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      if (emptyNote) emptyNote.hidden = shown !== 0;
    });
  });

  /* ---------- Event RSVP ---------- */
  document.querySelectorAll(".event__rsvp").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-done")) return;
      btn.classList.add("is-done");
      btn.textContent = "Saved ✓";
      toast("You're on the list for " + btn.getAttribute("data-event") + ". See you there!");
    });
  });

  /* ---------- Give thermometer ---------- */
  var fill = document.getElementById("thermoFill");
  if (fill) {
    var raised = 62400, goal = 90000;
    requestAnimationFrame(function () {
      fill.style.width = Math.min((raised / goal) * 100, 100) + "%";
    });
  }

  /* ---------- Give form ---------- */
  var amtBtns = document.querySelectorAll(".amt");
  var amtInput = document.getElementById("giveAmount");
  var btnAmt = document.getElementById("giveBtnAmt");
  function syncBtn() {
    var v = parseFloat(amtInput.value);
    btnAmt.textContent = v > 0 ? "$" + v.toLocaleString("en-US") : "";
  }
  amtBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      amtBtns.forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      amtInput.value = b.getAttribute("data-amt");
      syncBtn();
    });
  });
  if (amtInput) {
    amtInput.addEventListener("input", function () {
      amtBtns.forEach(function (x) {
        x.classList.toggle("is-active", x.getAttribute("data-amt") === amtInput.value);
      });
      syncBtn();
    });
    syncBtn();
  }
  var giveForm = document.getElementById("giveForm");
  if (giveForm) {
    giveForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = parseFloat(amtInput.value);
      if (!v || v < 1) {
        amtInput.classList.add("is-invalid");
        amtInput.focus();
        toast("Please enter a gift amount.");
        return;
      }
      amtInput.classList.remove("is-invalid");
      var fund = document.getElementById("giveFund").value;
      var recurring = document.getElementById("recurring").checked;
      toast("Thank you! $" + v.toLocaleString("en-US") + (recurring ? "/mo" : "") + " to the " + fund + ". (Demo)");
      giveForm.reset();
      amtInput.value = "50";
      amtBtns.forEach(function (x) { x.classList.toggle("is-active", x.getAttribute("data-amt") === "50"); });
      syncBtn();
    });
  }

  /* ---------- Connect form ---------- */
  var connectForm = document.getElementById("connectForm");
  if (connectForm) {
    connectForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cName");
      var email = document.getElementById("cEmail");
      var ok = true;
      [name, email].forEach(function (f) {
        var valid = f.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value) : f.value.trim().length > 1;
        f.classList.toggle("is-invalid", !valid);
        if (!valid && ok) { f.focus(); ok = false; }
      });
      if (!ok) { toast("Please fill in your name and a valid email."); return; }
      var interest = document.getElementById("cInterest").value;
      toast("Thanks, " + name.value.split(" ")[0] + "! Our welcome team will reach out about " + interest.toLowerCase() + ".");
      connectForm.reset();
    });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
