(function () {
  "use strict";

  /* ---------- toast helper ---------- */
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

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
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
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- lineup filter ---------- */
  var chips = document.querySelectorAll(".chip");
  var models = document.querySelectorAll(".model");
  var emptyMsg = document.getElementById("lineupEmpty");
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
      models.forEach(function (m) {
        var match = f === "all" || m.getAttribute("data-cat") === f;
        m.style.display = match ? "" : "none";
        if (match) {
          shown++;
          m.classList.add("is-in");
        }
      });
      if (emptyMsg) emptyMsg.hidden = shown !== 0;
    });
  });

  /* ---------- quote / rsvp buttons ---------- */
  document.addEventListener("click", function (e) {
    var quoteBtn = e.target.closest("[data-quote]");
    if (quoteBtn) {
      var name = quoteBtn.getAttribute("data-quote");
      var price = Number(quoteBtn.getAttribute("data-price"));
      toast("Quote saved for " + name + " — $" + price.toLocaleString() + ". We'll call you.");
      return;
    }
    var rsvpBtn = e.target.closest("[data-rsvp]");
    if (rsvpBtn) {
      rsvpBtn.textContent = "Going ✓";
      rsvpBtn.disabled = true;
      rsvpBtn.style.opacity = "0.7";
      toast("You're in: " + rsvpBtn.getAttribute("data-rsvp") + ". Ride safe.");
      return;
    }
  });

  /* ---------- service buttons ---------- */
  var bookService = document.getElementById("bookService");
  if (bookService) {
    bookService.addEventListener("click", function () {
      toast("Service drop-off requested — Bay 2 reserved for you.");
    });
  }

  /* ---------- finance calculator ---------- */
  var price = document.getElementById("price");
  var down = document.getElementById("down");
  var term = document.getElementById("term");
  var priceOut = document.getElementById("priceOut");
  var downOut = document.getElementById("downOut");
  var termOut = document.getElementById("termOut");
  var monthly = document.getElementById("monthly");
  var APR = 0.049;

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function calc() {
    if (!price || !down || !term || !monthly) return;
    var p = Number(price.value);
    var d = Math.min(Number(down.value), p);
    var n = Number(term.value);
    var principal = Math.max(p - d, 0);
    var r = APR / 12;
    var pay = principal === 0 ? 0 : (principal * r) / (1 - Math.pow(1 + r, -n));
    if (priceOut) priceOut.textContent = money(p);
    if (downOut) downOut.textContent = money(d);
    if (termOut) termOut.textContent = n + " mo";
    monthly.innerHTML = money(pay) + "<small>/mo</small>";
  }
  [price, down, term].forEach(function (el) {
    if (el) el.addEventListener("input", calc);
  });
  calc();

  var applyBtn = document.getElementById("applyBtn");
  if (applyBtn) {
    applyBtn.addEventListener("click", function () {
      toast("Pre-approval started — soft check only, no impact to your score.");
    });
  }

  /* ---------- test ride form ---------- */
  var rideForm = document.getElementById("rideForm");
  var ctaNote = document.getElementById("ctaNote");
  if (rideForm) {
    rideForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = rideForm.querySelector("#rname");
      var bike = rideForm.querySelector("#rbike");
      if (!name.value.trim()) {
        if (ctaNote) ctaNote.textContent = "Tell us your name first.";
        name.focus();
        return;
      }
      if (!bike.value) {
        if (ctaNote) ctaNote.textContent = "Pick a machine to ride.";
        bike.focus();
        return;
      }
      if (ctaNote) {
        ctaNote.textContent =
          "Booked, " + name.value.trim().split(" ")[0] + "! Your " + bike.value + " will be fueled and waiting.";
      }
      toast("Test ride booked — see you at 221 Forge St.");
      rideForm.reset();
    });
  }
})();
