(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Time-aware greeting ---------- */
  (function () {
    var el = document.getElementById("time-greeting");
    if (!el) return;
    var h = new Date().getHours();
    var g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    el.textContent = g;
  })();

  /* ---------- Next-class countdown ---------- */
  (function () {
    var cd = document.getElementById("countdown");
    if (!cd) return;
    var hEl = cd.querySelector('[data-cd="h"]');
    var mEl = cd.querySelector('[data-cd="m"]');
    var sEl = cd.querySelector('[data-cd="s"]');

    // Target: ~1h 47m 30s from load (deterministic feel, still ticks).
    var target = Date.now() + (1 * 3600 + 47 * 60 + 30) * 1000;

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function tick() {
      var diff = Math.max(0, target - Date.now());
      var total = Math.floor(diff / 1000);
      var h = Math.floor(total / 3600);
      var m = Math.floor((total % 3600) / 60);
      var s = total % 60;
      hEl.textContent = pad(h);
      mEl.textContent = pad(m);
      sEl.textContent = pad(s);
      if (diff <= 0) {
        clearInterval(timer);
        var badge = document.querySelector(".badge-live");
        if (badge) badge.textContent = "Class started";
      }
    }
    tick();
    var timer = setInterval(tick, 1000);
  })();

  /* ---------- Check-in button ---------- */
  (function () {
    var btn = document.getElementById("checkin-btn");
    if (!btn) return;
    var label = btn.querySelector(".ci-label");
    btn.addEventListener("click", function () {
      if (btn.classList.contains("checked")) return;
      btn.classList.add("pulse");
      setTimeout(function () {
        btn.classList.remove("pulse");
      }, 600);
      btn.classList.add("checked");
      label.textContent = "✓ Checked in — see you in Studio 2";
      var streak = document.getElementById("streak-count");
      if (streak) {
        streak.textContent = String((parseInt(streak.textContent, 10) || 0) + 1);
      }
      var today = document.querySelector(".day.today");
      if (today) {
        today.classList.remove("today");
        today.classList.add("done");
      }
      toast("Checked in to HIIT Inferno 🔥");
    });
  })();

  /* ---------- Goals ring ---------- */
  (function () {
    var list = document.getElementById("goal-list");
    var ring = document.getElementById("ring-fill");
    var ringNum = document.getElementById("ring-num");
    var totalEl = document.getElementById("goal-total");
    var pctBadge = document.getElementById("goal-pct-badge");
    if (!list || !ring) return;

    var boxes = Array.prototype.slice.call(list.querySelectorAll("[data-goal]"));
    var total = boxes.length;
    var CIRC = 2 * Math.PI * 52; // r = 52
    ring.style.strokeDasharray = CIRC.toFixed(1);
    if (totalEl) totalEl.textContent = String(total);

    function update(announce) {
      var done = boxes.filter(function (b) {
        return b.checked;
      }).length;
      var frac = total ? done / total : 0;
      ring.style.strokeDashoffset = (CIRC * (1 - frac)).toFixed(1);
      ring.classList.toggle("complete", done === total && total > 0);
      if (ringNum) ringNum.textContent = String(done);
      var pct = Math.round(frac * 100);
      if (pctBadge) pctBadge.textContent = pct + "%";
      if (announce) {
        if (done === total) {
          toast("All weekly goals complete! 💪");
        } else {
          toast(done + " of " + total + " goals done");
        }
      }
    }

    boxes.forEach(function (b) {
      b.addEventListener("change", function () {
        update(true);
      });
    });

    update(false);
  })();

  /* ---------- Quick actions ---------- */
  (function () {
    var labels = {
      book: "Opening class schedule…",
      log: "Log a workout — pick a routine",
      scan: "Hold your QR to the reader to scan in",
      badges: "Showing all 18 achievements"
    };
    document.querySelectorAll("[data-action]").forEach(function (el) {
      el.addEventListener("click", function () {
        var a = el.getAttribute("data-action");
        toast(labels[a] || "Done");
      });
    });
  })();

  /* ---------- Cancel bookings ---------- */
  (function () {
    document.querySelectorAll(".bk-cancel").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest(".booking");
        if (!row) return;
        var name = row.querySelector(".bk-name");
        var nm = name ? name.textContent : "Booking";
        row.classList.add("removing");
        setTimeout(function () {
          row.remove();
          toast("Cancelled: " + nm);
        }, 300);
      });
    });
  })();

  /* ---------- Bell ---------- */
  (function () {
    var bell = document.getElementById("bell-btn");
    if (!bell) return;
    bell.addEventListener("click", function () {
      var dot = bell.querySelector(".dot");
      if (dot) dot.style.display = "none";
      toast("2 new: class reminder · new PR logged");
    });
  })();
})();
