(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="t-ico" aria-hidden="true">&#10003;</span><span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 3400);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    nav.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A" && navLinks.classList.contains("open")) {
      navLinks.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  });

  /* ---------- Scroll reveal + bar/ring animation ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in-view");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal, .prog, .outcomes-copy").forEach(function (el) {
    io.observe(el);
  });

  /* ---------- Animated stat counters ---------- */
  var statIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var node = en.target;
      var target = parseInt(node.getAttribute("data-count"), 10);
      var suffix = node.getAttribute("data-suffix") || "";
      var start = null, dur = 1500;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        node.textContent = val.toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statIo.unobserve(node);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".stat .num[data-count]").forEach(function (n) {
    statIo.observe(n);
  });

  /* ---------- Program filter ---------- */
  var chips = document.querySelectorAll(".chip");
  var progs = document.querySelectorAll(".prog[data-cat]");
  var emptyMsg = document.getElementById("emptyMsg");

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
      progs.forEach(function (p) {
        var match = f === "all" || p.getAttribute("data-cat") === f;
        p.classList.toggle("hide", !match);
        if (match) shown++;
      });
      emptyMsg.hidden = shown !== 0;
    });
  });

  /* ---------- Apply form validation ---------- */
  var form = document.getElementById("applyForm");
  function showErr(id, msg) {
    var input = document.getElementById(id);
    var slot = form.querySelector('.err[data-for="' + id + '"]');
    if (msg) {
      input.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      slot.textContent = msg;
    } else {
      input.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
      slot.textContent = "";
    }
    return !msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("fName").value.trim();
    var email = document.getElementById("fEmail").value.trim();
    var program = document.getElementById("fProgram").value;
    var ok = true;

    ok = showErr("fName", name ? "" : "Please enter your full name.") && ok;
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    ok = showErr("fEmail", !email ? "Email is required." : !emailOk ? "Enter a valid email." : "") && ok;
    ok = showErr("fProgram", program ? "" : "Choose a program of interest.") && ok;

    if (!ok) {
      var firstBad = form.querySelector(".invalid");
      if (firstBad) firstBad.focus();
      return;
    }
    form.reset();
    toast("Thank you, " + name.split(" ")[0] + " — your prospectus is on its way.");
  });

  form.querySelectorAll("input, select").forEach(function (el) {
    el.addEventListener("input", function () {
      if (el.classList.contains("invalid")) showErr(el.id, "");
    });
  });

  /* ---------- Smooth-scroll focus management for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var dest = document.querySelector(id);
      if (dest) {
        e.preventDefault();
        dest.scrollIntoView({ behavior: "smooth", block: "start" });
        dest.setAttribute("tabindex", "-1");
        setTimeout(function () { dest.focus({ preventScroll: true }); }, 500);
      }
    });
  });
})();
