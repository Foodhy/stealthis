(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2800);
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  function closeMenu() {
    burger.classList.remove("is-open");
    mobileNav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = mobileNav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
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
      el.classList.add("is-in");
    });
  }

  /* ---------- hero stat count-up ---------- */
  var stats = [
    { id: "statMembers", to: 96, suffix: "" },
    { id: "statSqft", to: 12000, suffix: "" },
    { id: "statYears", to: 8, suffix: "" }
  ];
  function fmt(n) {
    return n.toLocaleString("en-US");
  }
  function countUp(el, to) {
    var start = performance.now();
    var dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var heroSeen = false;
  function maybeCount() {
    if (heroSeen) return;
    var hero = document.getElementById("hero");
    if (hero.getBoundingClientRect().top < window.innerHeight) {
      heroSeen = true;
      stats.forEach(function (s) {
        var el = document.getElementById(s.id);
        if (el) countUp(el, s.to);
      });
    }
  }
  maybeCount();
  window.addEventListener("scroll", maybeCount, { passive: true });

  /* ---------- amenities ---------- */
  var amenities = [
    { icon: "🖨", name: "Riso print studio", desc: "2-color GR3770 + drying rack", status: "free", label: "Open now" },
    { icon: "📷", name: "Photo bay & cyc wall", desc: "Blackout, 3 strobes, tethered", status: "busy", label: "In use · til 4pm" },
    { icon: "🪵", name: "Dust-walled woodshop", desc: "Table saw, sander, 12 clamps", status: "free", label: "Open now" },
    { icon: "🔥", name: "Twin ceramic kilns", desc: "Bisque + glaze, 1280°C", status: "soon", label: "Firing 9am" },
    { icon: "🎞", name: "Wet darkroom", desc: "B&W, 2 enlargers, chem stocked", status: "free", label: "Open now" },
    { icon: "☕", name: "Loft café & cold brew", desc: "Bottomless · roasted in-house", status: "free", label: "Always on" }
  ];
  var statusMap = {
    free: { cls: "is-free", booked: "Booked you a slot — fob will glow amber when it's yours." },
    busy: { cls: "is-busy", booked: "Added you to the waitlist — we'll ping you when it frees up." },
    soon: { cls: "is-soon", booked: "Reserved your turn after the current firing finishes." }
  };
  var amenGrid = document.getElementById("amenGrid");
  if (amenGrid) {
    amenities.forEach(function (a) {
      var s = statusMap[a.status];
      var card = document.createElement("button");
      card.type = "button";
      card.className = "amen-card";
      card.innerHTML =
        '<div class="amen-card__head">' +
        '<span class="amen-card__icon" aria-hidden="true">' + a.icon + "</span>" +
        '<span class="amen-status ' + s.cls + '">' + a.label + "</span>" +
        "</div>" +
        "<h3>" + a.name + "</h3>" +
        "<p>" + a.desc + "</p>";
      card.setAttribute("aria-label", a.name + " — " + a.label + ". Tap to book.");
      card.addEventListener("click", function () {
        toast(a.name + " · " + s.booked);
      });
      amenGrid.appendChild(card);
    });
  }

  /* ---------- pricing toggle ---------- */
  var billBtns = document.querySelectorAll(".bill-toggle__btn");
  var priceNums = document.querySelectorAll(".price__num");
  billBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-bill");
      billBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      priceNums.forEach(function (n) {
        var val = n.getAttribute(mode === "annual" ? "data-annual" : "data-monthly");
        if (val) n.textContent = val;
      });
      toast(mode === "annual" ? "Annual pricing — 15% off, billed yearly." : "Switched to monthly pricing.");
    });
  });

  /* ---------- plan buttons ---------- */
  document.querySelectorAll("[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () {
      var plan = b.getAttribute("data-plan");
      toast(plan + " selected — let's book your tour to lock it in.");
      var tour = document.getElementById("tour");
      if (tour) tour.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- day picker ---------- */
  var dayPick = document.getElementById("dayPick");
  var dayInput = document.getElementById("tDay");
  if (dayPick) {
    dayPick.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        dayPick.querySelectorAll("button").forEach(function (x) {
          x.classList.remove("is-active");
        });
        b.classList.add("is-active");
        dayInput.value = b.getAttribute("data-day");
      });
    });
  }

  /* ---------- tour form ---------- */
  var form = document.getElementById("tourForm");
  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#tName");
      var email = form.querySelector("#tEmail");
      var craft = form.querySelector("#tCraft");
      [name, email, craft].forEach(function (f) {
        f.classList.remove("is-error");
      });
      var bad = null;
      if (!name.value.trim()) bad = name;
      else if (!emailRe.test(email.value.trim())) bad = email;
      else if (!craft.value) bad = craft;

      if (bad) {
        bad.classList.add("is-error");
        bad.focus();
        toast("Just need a name, a valid email and your craft.");
        return;
      }
      if (!dayInput.value) {
        toast("Pick a preferred day for your tour.");
        dayPick.querySelector("button").focus();
        return;
      }
      toast("Tour requested for " + dayInput.value + " — see you at Warehouse 14, " + name.value.trim().split(" ")[0] + "!");
      form.reset();
      dayPick.querySelectorAll("button").forEach(function (x) {
        x.classList.remove("is-active");
      });
      dayInput.value = "";
    });
  }

  /* ---------- live amenity drift (subtle) ---------- */
  setInterval(function () {
    var cards = document.querySelectorAll(".amen-status.is-busy");
    if (!cards.length) return;
    // gentle pulse on a busy amenity to feel alive
    var pick = cards[Math.floor(Math.random() * cards.length)];
    pick.animate(
      [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }],
      { duration: 900, easing: "ease-in-out" }
    );
  }, 5000);
})();
