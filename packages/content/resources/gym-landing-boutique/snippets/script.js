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
    }, 2800);
  }

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!menu || !toggle) return;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Class-time rotator ---------- */
  var rides = [
    { name: "Ride45 · Neon Hour", meta: "6:30 PM · Studio A · with Mara V.", spots: 7 },
    { name: "Rhythm · Sunset Set", meta: "7:15 PM · Studio B · with Deon K.", spots: 12 },
    { name: "HIIT Sculpt · Burn", meta: "8:00 PM · Floor 2 · with Sasha L.", spots: 4 },
    { name: "Ride45 · Bass Drop", meta: "8:45 PM · Studio A · with Rio O.", spots: 9 },
  ];
  var rideName = document.getElementById("rideName");
  var rideMeta = document.getElementById("rideMeta");
  var rideSpots = document.getElementById("rideSpots");
  var rideBody = rideName ? rideName.closest(".next-ride-body") : null;
  var ri = 0;

  function spotColor(n) {
    if (n <= 4) return "var(--danger, #f87171)";
    if (n <= 8) return "var(--warn, #fbbf24)";
    return "var(--ok, #34d399)";
  }

  function renderRide() {
    var r = rides[ri];
    if (rideName) rideName.textContent = r.name;
    if (rideMeta) rideMeta.textContent = r.meta;
    if (rideSpots) {
      rideSpots.textContent = r.spots + " bikes left";
      rideSpots.style.background = spotColor(r.spots);
    }
  }
  renderRide();

  if (rideBody) {
    setInterval(function () {
      rideBody.classList.add("swap");
      setTimeout(function () {
        ri = (ri + 1) % rides.length;
        renderRide();
        rideBody.classList.remove("swap");
      }, 320);
    }, 3600);
  }

  /* ---------- Book buttons ---------- */
  document.querySelectorAll(".card-btn, .pack-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var card = btn.closest(".card, .pack");
      var label = card ? card.querySelector(".card-name, .pack-name") : null;
      toast(label ? "🎟️ " + label.textContent.trim() + " added — see you on the floor!" : "Added!");
    });
  });

  /* ---------- Claim form ---------- */
  var form = document.getElementById("claimForm");
  if (form) {
    var input = document.getElementById("email");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        input.classList.add("invalid");
        input.focus();
        toast("Enter a valid email to claim your ride.");
        setTimeout(function () {
          input.classList.remove("invalid");
        }, 500);
        return;
      }
      input.value = "";
      toast("🔥 Free ride locked in — check your inbox for the code!");
    });
  }
})();
