(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Counting animation on stat band ---- */
  var stats = document.querySelectorAll(".stat-num");
  var counted = false;

  function formatNum(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;

    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = prefix + formatNum(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + formatNum(target) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function triggerCounts() {
    if (counted) return;
    counted = true;
    stats.forEach(runCount);
  }

  var statBand = document.querySelector(".stats");
  if (statBand && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            triggerCounts();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(statBand);
  } else {
    triggerCounts();
  }

  /* ---- Testimonial rotator ---- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".tst"));
  var dotsWrap = document.getElementById("rotatorDots");
  var current = 0;
  var timer = null;

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Show review " + (i + 1));
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        show(i);
        restart();
      });
      dotsWrap.appendChild(b);
    });

    var dots = Array.prototype.slice.call(dotsWrap.children);

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, idx) {
        s.classList.toggle("active", idx === current);
      });
      dots.forEach(function (d, idx) {
        d.setAttribute("aria-selected", idx === current ? "true" : "false");
      });
    }
    function next() { show(current + 1); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 5500);
    }
    restart();
  }

  /* ---- Case-type chips ---- */
  var chips = document.querySelectorAll(".chip");
  var caseTypeInput = document.getElementById("caseType");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("selected"); });
      chip.classList.add("selected");
      if (caseTypeInput) {
        var tmp = document.createElement("textarea");
        tmp.innerHTML = chip.getAttribute("data-value") || "";
        caseTypeInput.value = tmp.value;
      }
    });
  });

  /* ---- Form validation + submit ---- */
  var form = document.getElementById("evalForm");
  var success = document.getElementById("formSuccess");

  function setError(name, msg) {
    var field = form.querySelector("#" + name);
    var err = form.querySelector('.err[data-for="' + name + '"]');
    if (err) err.textContent = msg || "";
    if (field) {
      if (msg) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;

      var name = form.name.value.trim();
      if (name.length < 2) { setError("name", "Please enter your full name."); ok = false; }
      else setError("name", "");

      var phone = form.phone.value.trim();
      var phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length < 10) { setError("phone", "Enter a valid phone number."); ok = false; }
      else setError("phone", "");

      var email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Enter a valid email."); ok = false; }
      else setError("email", "");

      if (!form.consent.checked) { setError("consent", "Please agree to be contacted."); ok = false; }
      else setError("consent", "");

      if (!ok) {
        var firstErr = form.querySelector('[aria-invalid="true"]');
        if (firstErr) firstErr.focus();
        return;
      }

      // Simulated success (no network)
      var fields = form.querySelectorAll("input, textarea, button, .chip");
      fields.forEach(function (f) { if (f.type !== "hidden") f.setAttribute("disabled", "true"); });
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
})();
