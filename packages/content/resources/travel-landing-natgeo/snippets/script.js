/* ===================================================================
   Terra Expedition — documentary travel landing
   Vanilla JS only. Every interaction works.
   =================================================================== */
(function () {
  "use strict";

  var doc = document;
  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------- toast helper ---------------- */
  var toastEl = doc.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------------- search panel ---------------- */
  var searchToggle = doc.getElementById("searchToggle");
  var searchPanel = doc.getElementById("searchPanel");
  var searchForm = doc.getElementById("searchForm");
  var searchInput = doc.getElementById("searchInput");

  function setSearch(open) {
    if (!searchPanel || !searchToggle) return;
    searchPanel.hidden = !open;
    searchToggle.setAttribute("aria-expanded", String(open));
    if (open && searchInput) {
      window.setTimeout(function () {
        searchInput.focus();
      }, 30);
    }
  }
  if (searchToggle) {
    searchToggle.addEventListener("click", function () {
      setSearch(searchPanel.hidden);
    });
  }
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (searchInput && searchInput.value.trim()) || "";
      if (!q) {
        toast("Type a region or expedition to search.");
        if (searchInput) searchInput.focus();
        return;
      }
      toast('No live results — "' + q + '" is a fictional search.');
      setSearch(false);
    });
  }

  /* ---------------- mobile nav ---------------- */
  var menuToggle = doc.getElementById("menuToggle");
  var mobileNav = doc.getElementById("mobileNav");

  function setMenu(open) {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(mobileNav.hidden);
    });
  }
  if (mobileNav) {
    Array.prototype.forEach.call(
      mobileNav.querySelectorAll("a"),
      function (a) {
        a.addEventListener("click", function () {
          setMenu(false);
        });
      }
    );
  }

  // Close overlays on Escape
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (searchPanel && !searchPanel.hidden) {
        setSearch(false);
        if (searchToggle) searchToggle.focus();
      }
      if (mobileNav && !mobileNav.hidden) {
        setMenu(false);
        if (menuToggle) menuToggle.focus();
      }
    }
  });

  /* ---------------- hero / header buttons ---------------- */
  function scrollToId(id) {
    var el = doc.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start"
    });
  }

  var joinBtn = doc.getElementById("joinBtn");
  if (joinBtn) {
    joinBtn.addEventListener("click", function () {
      scrollToId("subscribe");
      var email = doc.getElementById("email");
      if (email)
        window.setTimeout(
          function () {
            email.focus();
          },
          prefersReduced ? 0 : 500
        );
    });
  }

  var readStory = doc.getElementById("readStory");
  if (readStory) {
    readStory.addEventListener("click", function () {
      scrollToId("stories");
    });
  }

  var watchFilm = doc.getElementById("watchFilm");
  if (watchFilm) {
    watchFilm.addEventListener("click", function () {
      toast("Field film reel is fictional — enjoy the still frames.");
    });
  }

  /* ---------------- save / wishlist stories ---------------- */
  var savedCount = 0;
  Array.prototype.forEach.call(
    doc.querySelectorAll(".save-btn"),
    function (btn) {
      btn.addEventListener("click", function () {
        var pressed = btn.getAttribute("aria-pressed") === "true";
        var next = !pressed;
        btn.setAttribute("aria-pressed", String(next));
        var ico = btn.querySelector(".save-btn__ico");
        var label = btn.querySelector(".save-btn__label");
        var title = btn.getAttribute("data-title") || "Story";
        if (next) {
          savedCount++;
          if (ico) ico.textContent = "♥"; // filled heart
          if (label) label.textContent = "Saved";
          toast("Saved “" + title + "” to your reading list.");
        } else {
          savedCount = Math.max(0, savedCount - 1);
          if (ico) ico.textContent = "♡"; // outline heart
          if (label) label.textContent = "Save story";
          toast("Removed “" + title + "” from your list.");
        }
      });
    }
  );

  /* ---------------- expedition map waypoints ---------------- */
  var WAYPOINTS = [
    {
      region: "Patagonia Coast",
      meta: "Andes & Fjords, Chile · Leg 1 of 5",
      terrain: "Wind-scoured fjordland",
      dist: "0 km",
      team: "6 in the field"
    },
    {
      region: "Mid-Pacific",
      meta: "Open ocean · Leg 2 of 5",
      terrain: "Abyssal dive site",
      dist: "9,820 km",
      team: "4 aboard, 2 submersible"
    },
    {
      region: "Upper Mustang",
      meta: "Himalaya, Nepal · Leg 3 of 5",
      terrain: "High alpine desert",
      dist: "24,560 km",
      team: "5 trekking"
    },
    {
      region: "Erg Chebbi",
      meta: "Sahara, Morocco · Leg 4 of 5",
      terrain: "Active dune field",
      dist: "38,140 km",
      team: "6 in the field"
    },
    {
      region: "Western Amazon",
      meta: "Rainforest, Peru · Leg 5 of 5",
      terrain: "Flooded canopy",
      dist: "48,230 km",
      team: "7 at canopy camp"
    }
  ];

  var pins = Array.prototype.slice.call(doc.querySelectorAll(".pin"));
  var mapCard = doc.getElementById("mapCard");
  var els = {
    region: doc.getElementById("mapRegion"),
    meta: doc.getElementById("mapMeta"),
    terrain: doc.getElementById("mapTerrain"),
    dist: doc.getElementById("mapDist"),
    team: doc.getElementById("mapTeam")
  };
  var activeWp = 3; // Erg Chebbi starts active (matches markup)

  function selectWaypoint(index, announce) {
    var wp = WAYPOINTS[index];
    if (!wp) return;
    activeWp = index;

    pins.forEach(function (pin) {
      var i = parseInt(pin.getAttribute("data-wp"), 10);
      var isActive = i === index;
      pin.classList.toggle("pin--active", isActive);
      if (isActive) {
        pin.setAttribute("aria-current", "true");
      } else {
        pin.removeAttribute("aria-current");
      }
    });

    if (els.region) els.region.textContent = wp.region;
    if (els.meta) els.meta.textContent = wp.meta;
    if (els.terrain) els.terrain.textContent = wp.terrain;
    if (els.dist) els.dist.textContent = wp.dist;
    if (els.team) els.team.textContent = wp.team;

    // brief flash to draw the eye
    if (mapCard && !prefersReduced) {
      mapCard.style.transition = "none";
      mapCard.style.opacity = "0.4";
      window.requestAnimationFrame(function () {
        mapCard.style.transition = "opacity 0.3s ease";
        mapCard.style.opacity = "1";
      });
    }
    if (announce) toast("Waypoint → " + wp.region);
  }

  pins.forEach(function (pin) {
    pin.addEventListener("click", function () {
      var i = parseInt(pin.getAttribute("data-wp"), 10);
      selectWaypoint(i, true);
    });
    pin.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var i = parseInt(pin.getAttribute("data-wp"), 10);
        selectWaypoint(i, true);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        var next = pins[(parseInt(pin.getAttribute("data-wp"), 10) + 1) % pins.length];
        if (next) next.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        var cur = parseInt(pin.getAttribute("data-wp"), 10);
        var prev = pins[(cur - 1 + pins.length) % pins.length];
        if (prev) prev.focus();
      }
    });
  });
  // sync initial state without toast
  selectWaypoint(activeWp, false);

  /* ---------------- count-up stat band ---------------- */
  function formatNum(n, suffix) {
    var s = Math.round(n).toLocaleString("en-US");
    return s + (suffix || "");
  }

  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (prefersReduced) {
      el.textContent = formatNum(target, suffix);
      return;
    }
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatNum(target * eased, suffix);
      if (p < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = formatNum(target, suffix);
      }
    }
    window.requestAnimationFrame(step);
  }

  var statNums = Array.prototype.slice.call(
    doc.querySelectorAll(".stat__num")
  );
  if ("IntersectionObserver" in window && statNums.length) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach(function (el) {
      statObserver.observe(el);
    });
  } else {
    statNums.forEach(runCount);
  }

  /* ---------------- reveal on scroll ---------------- */
  var revealTargets = Array.prototype.slice.call(
    doc.querySelectorAll(".story, .map__card, .section-head, .band__title")
  );
  if ("IntersectionObserver" in window && !prefersReduced) {
    revealTargets.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(22px)";
      el.style.transition =
        "opacity 0.6s ease, transform 0.6s cubic-bezier(0.2,0.8,0.2,1)";
    });
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            window.setTimeout(function () {
              el.style.opacity = "1";
              el.style.transform = "none";
            }, Math.min(i * 60, 240));
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------------- scroll-spy nav highlight ---------------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav a"));
  var sections = navLinks
    .map(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      return doc.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navLinks.forEach(function (a) {
              var match = a.getAttribute("href") === "#" + id;
              a.classList.toggle("is-current", match);
              if (match) {
                a.setAttribute("aria-current", "true");
              } else {
                a.removeAttribute("aria-current");
              }
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      spyObserver.observe(s);
    });
  }

  /* ---------------- subscribe form ---------------- */
  var subForm = doc.getElementById("subForm");
  var subError = doc.getElementById("subError");
  var emailInput = doc.getElementById("email");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(msg) {
    if (!subError) return;
    subError.textContent = msg;
    subError.hidden = false;
    if (emailInput) emailInput.classList.add("is-invalid");
  }
  function clearError() {
    if (subError) subError.hidden = true;
    if (emailInput) emailInput.classList.remove("is-invalid");
  }

  if (subForm) {
    subForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (emailInput && emailInput.value.trim()) || "";
      if (!val) {
        showError("Please enter your email to join the Society.");
        if (emailInput) emailInput.focus();
        return;
      }
      if (!EMAIL_RE.test(val)) {
        showError("That doesn’t look like a valid email address.");
        if (emailInput) emailInput.focus();
        return;
      }
      clearError();
      subForm.reset();
      toast("Welcome aboard — your first dispatch is on its way.");
    });
  }
  if (emailInput) {
    emailInput.addEventListener("input", clearError);
  }
})();
