(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2800);
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeMobile() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    mobileNav.hidden = true;
  }
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMobile();
    });
  }

  /* ---------- smooth scroll for data-scroll + any in-page anchor ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMobile();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", id);
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- animated counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function animateCount(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = performance.now();
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- hero card progress bar ---------- */
  var bar = document.querySelector(".card__bar span");
  if (bar) {
    setTimeout(function () {
      bar.style.width = bar.style.getPropertyValue("--w") || "62%";
    }, 500);
  }

  /* ---------- mandate filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var roles = Array.prototype.slice.call(document.querySelectorAll("#rolesList .role"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var filter = chip.getAttribute("data-filter");
      var shown = 0;
      roles.forEach(function (role) {
        var match = filter === "all" || role.getAttribute("data-cat") === filter;
        role.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      toast(
        shown +
          " mandate" +
          (shown === 1 ? "" : "s") +
          (filter === "all" ? " in view" : " in this practice")
      );
    });
  });

  /* ---------- bookmark toggles ---------- */
  var bookmarks = Array.prototype.slice.call(document.querySelectorAll(".bookmark"));
  bookmarks.forEach(function (b) {
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", String(!on));
      var roleName = "this mandate";
      var li = b.closest(".role");
      if (li) {
        var h = li.querySelector("h3");
        if (h) roleName = h.textContent.trim();
      }
      toast(on ? "Removed " + roleName : "Saved — " + roleName);
    });
  });

  /* ---------- access form ---------- */
  var form = document.getElementById("accessForm");
  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var fields = ["name", "email", "role"];
      fields.forEach(function (id) {
        var input = form.elements[id];
        var wrap = input.closest(".field");
        var valid = input.value.trim() !== "";
        if (id === "email") valid = emailRe.test(input.value.trim());
        if (wrap) wrap.classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        toast("Please complete the highlighted fields.");
        return;
      }
      var name = form.elements["name"].value.trim().split(" ")[0];
      form.reset();
      toast("Thank you, " + name + " — a partner will be in touch within a day.");
    });
    form.addEventListener("input", function (e) {
      var wrap = e.target.closest(".field.is-invalid");
      if (wrap) wrap.classList.remove("is-invalid");
    });
  }
})();
