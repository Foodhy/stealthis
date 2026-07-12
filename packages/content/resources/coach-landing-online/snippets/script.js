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

  /* ---------- Animated hero stat counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Phone screen rotator ---------- */
  var screens = Array.prototype.slice.call(document.querySelectorAll("[data-screen]"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll("#dots [role=tab]"));
  var phone = document.getElementById("phone");
  var current = 0;
  var autoTimer;

  function goTo(i) {
    current = (i + screens.length) % screens.length;
    screens.forEach(function (s, idx) {
      s.classList.toggle("is-active", idx === current);
    });
    tabs.forEach(function (t, idx) {
      t.setAttribute("aria-selected", idx === current ? "true" : "false");
    });
  }
  function next() { goTo(current + 1); }
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 3400);
  }
  function stopAuto() { clearInterval(autoTimer); }

  tabs.forEach(function (t, idx) {
    t.addEventListener("click", function () {
      goTo(idx);
      startAuto();
    });
  });
  if (phone) {
    phone.addEventListener("mouseenter", stopAuto);
    phone.addEventListener("mouseleave", startAuto);
    phone.addEventListener("focus", stopAuto);
    phone.addEventListener("blur", startAuto);
    phone.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { next(); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { goTo(current - 1); e.preventDefault(); }
    });
  }
  if (screens.length) startAuto();

  /* ---------- Pricing billing toggle ---------- */
  var billOpts = Array.prototype.slice.call(document.querySelectorAll(".bill-opt"));
  var priceEls = Array.prototype.slice.call(document.querySelectorAll(".price strong[data-monthly]"));

  function animatePrice(el, to) {
    var from = parseInt(el.textContent.replace(/[^0-9]/g, ""), 10) || 0;
    var start = performance.now();
    var dur = 450;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function setBilling(period) {
    billOpts.forEach(function (b) {
      var on = b.getAttribute("data-bill") === period;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    priceEls.forEach(function (el) {
      var val = parseInt(el.getAttribute("data-" + period), 10);
      animatePrice(el, val);
    });
  }
  billOpts.forEach(function (b) {
    b.addEventListener("click", function () {
      setBilling(b.getAttribute("data-bill"));
    });
  });

  /* ---------- Training days range ---------- */
  var days = document.getElementById("days");
  var daysVal = document.getElementById("daysVal");
  if (days && daysVal) {
    days.addEventListener("input", function () {
      daysVal.textContent = days.value;
    });
  }

  /* ---------- Apply form validation ---------- */
  var form = document.getElementById("applyForm");
  function setError(name, msg) {
    var field = form.querySelector('[name="' + name + '"]').closest(".field");
    var err = form.querySelector('[data-err="' + name + '"]');
    if (msg) {
      field.classList.add("invalid");
      if (err) err.textContent = msg;
    } else {
      field.classList.remove("invalid");
      if (err) err.textContent = "";
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var goal = form.goal.value;

      if (name.length < 2) { setError("name", "Please enter your name."); ok = false; }
      else setError("name", "");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Enter a valid email address."); ok = false; }
      else setError("email", "");

      if (!goal) { setError("goal", "Pick your main goal."); ok = false; }
      else setError("goal", "");

      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select");
        if (firstBad) firstBad.focus();
        toast("Check the highlighted fields.");
        return;
      }

      toast("Application sent! Coach Mara will reach out within one business day.");
      form.reset();
      if (daysVal) daysVal.textContent = "4";
    });

    // Clear error on input
    ["name", "email", "goal"].forEach(function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      if (el) el.addEventListener("input", function () { setError(n, ""); });
    });
  }

  /* ---------- Scroll reveal + counter trigger ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          var cs = entry.target.querySelectorAll("[data-count]");
          cs.forEach(function (c) {
            if (!c.dataset.done) { c.dataset.done = "1"; runCount(c); }
          });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
    counters.forEach(runCount);
  }
})();
