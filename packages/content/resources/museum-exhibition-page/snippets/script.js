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
    }, 2600);
  }

  /* ---------- Sticky mini-header reveal ---------- */
  var miniHeader = document.getElementById("miniHeader");
  var hero = document.getElementById("top");
  if (miniHeader && "IntersectionObserver" in window) {
    var heroObserver = new IntersectionObserver(
      function (entries) {
        var e = entries[0];
        var show = !e.isIntersecting;
        miniHeader.classList.toggle("show", show);
        miniHeader.setAttribute("aria-hidden", show ? "false" : "true");
      },
      { rootMargin: "-120px 0px 0px 0px" }
    );
    heroObserver.observe(hero);
  }

  /* ---------- Scroll-spy anchor nav ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll("#anchorNav a")
  );
  var sections = navLinks
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navLinks.forEach(function (a) {
              a.classList.toggle(
                "active",
                a.getAttribute("href") === "#" + id
              );
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- Works filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var works = Array.prototype.slice.call(document.querySelectorAll(".work"));
  var emptyMsg = document.getElementById("worksEmpty");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var visible = 0;
      works.forEach(function (work) {
        var match = filter === "all" || work.getAttribute("data-chapter") === filter;
        work.classList.toggle("hide", !match);
        if (match) visible++;
      });
      if (emptyMsg) emptyMsg.hidden = visible !== 0;
    });
  });

  /* ---------- Ticket stepper + total ---------- */
  var PRICES = { adult: 16, conc: 10, member: 0 };
  var counts = { adult: 0, conc: 0, member: 0 };
  var totalEl = document.getElementById("ticketTotal");

  function fmt(n) {
    return "£" + n.toFixed(2);
  }
  function renderTotal() {
    var sum = 0;
    Object.keys(counts).forEach(function (k) {
      sum += counts[k] * PRICES[k];
    });
    if (totalEl) totalEl.textContent = fmt(sum);
  }

  document.querySelectorAll(".stepper").forEach(function (stepper) {
    var tier = stepper.getAttribute("data-tier");
    var output = stepper.querySelector("output");
    stepper.querySelectorAll(".step").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.getAttribute("data-act");
        if (act === "inc") counts[tier] = Math.min(20, counts[tier] + 1);
        else counts[tier] = Math.max(0, counts[tier] - 1);
        if (output) output.textContent = String(counts[tier]);
        renderTotal();
      });
    });
  });

  var ticketForm = document.getElementById("ticketForm");
  if (ticketForm) {
    ticketForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var qty = counts.adult + counts.conc + counts.member;
      if (qty === 0) {
        toast("Select at least one ticket to continue.");
        return;
      }
      var sum = counts.adult * PRICES.adult + counts.conc * PRICES.conc;
      toast(
        qty + " ticket" + (qty === 1 ? "" : "s") + " held · " + fmt(sum) + " (demo)"
      );
    });
  }

  /* ---------- Hero countdown to closing ---------- */
  var countdownEl = document.getElementById("countdown");
  var closing = new Date("2026-09-28T18:00:00");
  function renderCountdown() {
    if (!countdownEl) return;
    var now = new Date();
    var diff = closing - now;
    if (diff <= 0) {
      countdownEl.textContent = "Exhibition closed";
      return;
    }
    var days = Math.floor(diff / 86400000);
    countdownEl.textContent = days + " days left on view";
  }
  renderCountdown();
  setInterval(renderCountdown, 3600000);

  /* ---------- Status badge note ---------- */
  var statusBadge = document.getElementById("statusBadge");
  if (statusBadge) {
    statusBadge.addEventListener("click", function () {
      toast("Open Tue–Sun, 10:00–18:00 · Thu until 21:00");
    });
    statusBadge.style.cursor = "pointer";
  }

  renderTotal();
})();
