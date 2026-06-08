(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  /* ---------- Animated lifestyle dials ---------- */
  var CIRCUMFERENCE = 2 * Math.PI * 52; // r = 52
  var dials = Array.prototype.slice.call(document.querySelectorAll(".dial"));

  function fillDial(dial) {
    if (dial.dataset.done === "1") return;
    dial.dataset.done = "1";

    var score = Math.max(0, Math.min(100, parseInt(dial.dataset.score, 10) || 0));
    var fill = dial.querySelector(".dial__fill");
    var num = dial.querySelector(".dial__num");
    var offset = CIRCUMFERENCE * (1 - score / 100);

    // Trigger the stroke animation on next frame.
    requestAnimationFrame(function () {
      fill.style.strokeDashoffset = String(offset);
    });

    // Count the number up in step with the ring.
    var DURATION = 1100;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / DURATION);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - t, 3);
      num.textContent = String(Math.round(eased * score));
      if (t < 1) requestAnimationFrame(tick);
      else num.textContent = String(score);
    }
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && dials.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fillDial(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    dials.forEach(function (d) {
      io.observe(d);
    });
  } else {
    // Fallback: just fill them.
    dials.forEach(fillDial);
  }

  /* ---------- Amenity category filter ---------- */
  var filterBar = document.getElementById("filters");
  var amenities = Array.prototype.slice.call(
    document.querySelectorAll(".amen")
  );
  var emptyMsg = document.getElementById("amenEmpty");

  function applyFilter(cat) {
    var visible = 0;
    amenities.forEach(function (item) {
      var show = cat === "all" || item.dataset.cat === cat;
      item.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });
    if (emptyMsg) emptyMsg.hidden = visible !== 0;
  }

  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      filterBar.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      applyFilter(btn.dataset.filter);
    });
  }

  /* ---------- Favorite (save) listings ---------- */
  document.querySelectorAll(".card__fav").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var saved = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!saved));
      btn.textContent = saved ? "♡" : "♥";
      var card = btn.closest(".card");
      var addr = card
        ? card.querySelector(".card__addr").textContent.trim()
        : "listing";
      toast(saved ? "Removed " + addr : "Saved " + addr + " to favorites");
    });
  });

  /* ---------- Save guide ---------- */
  var saveGuide = document.getElementById("saveGuide");
  if (saveGuide) {
    saveGuide.addEventListener("click", function () {
      toast("Maplewood Heights guide saved to your account");
    });
  }
})();
