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
    }, 3200);
  }

  /* ---------- Animated stat counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = performance.now();
    var dur = 1400;
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      var shown = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-US");
      el.textContent = shown + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  document.querySelectorAll(".stats strong[data-count]").forEach(animateCount);

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* ---------- Before / after slider ---------- */
  var ba = document.getElementById("ba");
  var baBefore = document.getElementById("baBefore");
  var baHandle = document.getElementById("baHandle");
  var dragging = false;

  function setBA(pct) {
    pct = Math.max(0, Math.min(100, pct));
    baBefore.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
    baHandle.style.left = pct + "%";
    ba.setAttribute("aria-valuenow", Math.round(pct));
  }
  function pctFromEvent(clientX) {
    var rect = ba.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }
  if (ba) {
    ba.addEventListener("pointerdown", function (e) {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      setBA(pctFromEvent(e.clientX));
    });
    ba.addEventListener("pointermove", function (e) {
      if (dragging) setBA(pctFromEvent(e.clientX));
    });
    ba.addEventListener("pointerup", function () { dragging = false; });
    ba.addEventListener("pointercancel", function () { dragging = false; });
    ba.addEventListener("keydown", function (e) {
      var cur = parseFloat(ba.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft") { setBA(cur - 4); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setBA(cur + 4); e.preventDefault(); }
      else if (e.key === "Home") { setBA(0); e.preventDefault(); }
      else if (e.key === "End") { setBA(100); e.preventDefault(); }
    });
    setBA(50);
  }

  /* ---------- Results estimator ---------- */
  var lbs = document.getElementById("lbs");
  var lbsOut = document.getElementById("lbsOut");
  var rWeekly = document.getElementById("rWeekly");
  var rWeeks = document.getElementById("rWeeks");
  var rKcal = document.getElementById("rKcal");
  var rDate = document.getElementById("rDate");
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function bump(el) {
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  function updateEstimate() {
    var goal = parseInt(lbs.value, 10);
    // Sustainable ~0.75% of an assumed 200lb starting bodyweight/week,
    // scaled slightly by goal size, capped for safety.
    var weekly = Math.min(2, Math.max(0.75, 0.9 + goal * 0.012));
    weekly = Math.round(weekly * 10) / 10;
    var weeks = Math.max(1, Math.round(goal / weekly));
    // 1 lb fat ~= 3500 kcal
    var kcal = Math.round((weekly * 3500) / 7 / 25) * 25;

    var d = new Date();
    d.setDate(d.getDate() + weeks * 7);
    var goalDate = months[d.getMonth()] + " " + d.getFullYear();

    lbsOut.textContent = goal + " lb";
    rWeekly.textContent = weekly.toFixed(1) + " lb";
    rWeeks.textContent = weeks + (weeks === 1 ? " wk" : " wks");
    rKcal.textContent = kcal + " kcal";
    rDate.textContent = goalDate;

    [rWeekly, rWeeks, rKcal, rDate].forEach(function (el) {
      bump(el.closest(".est-card"));
    });
  }
  if (lbs) {
    lbs.addEventListener("input", updateEstimate);
    updateEstimate();
  }

  /* ---------- Join form ---------- */
  var form = document.getElementById("joinForm");
  if (form) {
    var email = document.getElementById("email");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = email.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        email.classList.add("err");
        email.focus();
        toast("Please enter a valid email address.");
        return;
      }
      email.classList.remove("err");
      var goal = lbs ? lbs.value : "your";
      toast("You're in! Intake + your " + goal + " lb blueprint are on the way.");
      form.reset();
    });
    email.addEventListener("input", function () { email.classList.remove("err"); });
  }
})();
