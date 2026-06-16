/* ─────────────────────────────────────────────
   NÉANT — High-Fashion Editorial
   Vanilla JS: cursor-follow accent, scroll reveal,
   image index hover, smooth scroll, toast.
   ───────────────────────────────────────────── */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ── toast helper ── */
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

  /* ── cursor-follow neon accent ── */
  var cursor = document.getElementById("cursor");
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (cursor && finePointer && !prefersReduced) {
    var cx = window.innerWidth / 2,
      cy = window.innerHeight / 2;
    var tx = cx,
      ty = cy;
    var raf;

    function loop() {
      // easing toward target for an elegant lag
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform =
        "translate(" + cx + "px," + cy + "px)" +
        (cursor.classList.contains("is-hot") ? " scale(3.2)" : "");
      raf = requestAnimationFrame(loop);
    }

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!cursor.classList.contains("is-active")) {
        cursor.classList.add("is-active");
      }
    });
    document.addEventListener("mouseleave", function () {
      cursor.classList.remove("is-active");
    });

    // grow over interactive / image elements
    var hotSelector =
      "a, button, .plate, .index__item, .plate__img";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hotSelector)) cursor.classList.add("is-hot");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hotSelector)) cursor.classList.remove("is-hot");
    });

    loop();
    window.addEventListener("beforeunload", function () {
      cancelAnimationFrame(raf);
    });
  } else if (cursor) {
    cursor.style.display = "none";
  }

  /* ── scroll reveal of plates / blocks ── */
  var reveals = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ── image index hover + click ── */
  var plates = {};
  document.querySelectorAll("[data-plate]").forEach(function (p) {
    plates[p.getAttribute("data-plate")] = p;
  });

  function lightPlate(key, on) {
    var p = plates[key];
    if (p) p.classList.toggle("is-lit", on);
  }

  document.querySelectorAll(".index__item").forEach(function (btn) {
    var key = btn.getAttribute("data-target");

    btn.addEventListener("mouseenter", function () {
      lightPlate(key, true);
    });
    btn.addEventListener("mouseleave", function () {
      lightPlate(key, false);
    });
    btn.addEventListener("focus", function () {
      lightPlate(key, true);
    });
    btn.addEventListener("blur", function () {
      lightPlate(key, false);
    });

    btn.addEventListener("click", function () {
      var p = plates[key];
      if (!p) return;
      p.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "center",
      });
      // brief flash to confirm
      p.classList.add("is-lit");
      setTimeout(function () {
        p.classList.remove("is-lit");
      }, 1400);
      toast("Plate " + btn.querySelector("span").textContent + " — in frame");
    });
  });

  /* ── smooth in-page nav + scroll-to-top ── */
  function smoothTo(target) {
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }

  document
    .querySelectorAll('a[href^="#"]')
    .forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          smoothTo(target);
        }
      });
    });

  var topBtn = document.querySelector("[data-scroll-top]");
  if (topBtn) {
    topBtn.addEventListener("click", function () {
      smoothTo(document.getElementById("top"));
      toast("Back to the top");
    });
  }

  /* ── welcome flourish ── */
  setTimeout(function () {
    toast("Issue Nº 14 — The Negative Issue");
  }, 900);
})();
