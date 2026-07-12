(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* ---------- Reel data ---------- */
  var reels = [
    {
      id: "hero",
      title: "Northwind — Winter Launch",
      cat: "brand",
      catLabel: "Brand film",
      runtime: "01:48:00",
      poster: "linear-gradient(135deg,#2a1a10,#0a0a0b)",
      desc: "A 90-second brand film introducing Northwind's cold-weather line, cut for cinema and a 6s bumper.",
      result: "+41% branded search in 30 days"
    },
    {
      id: "pulse",
      title: "Pulse Athletic — Sprint",
      cat: "tvc",
      catLabel: "TVC",
      runtime: "00:30:00",
      poster: "linear-gradient(135deg,#3a1414,#0a0a0b)",
      desc: "National 30-second TV commercial built around a single unbroken sprint and a one-line payoff.",
      result: "2.4x ROAS across broadcast"
    },
    {
      id: "halcyon",
      title: "Halcyon — Product Reveal",
      cat: "product",
      catLabel: "Product",
      runtime: "00:52:00",
      poster: "linear-gradient(135deg,#12242a,#0a0a0b)",
      desc: "Macro-lens product film for Halcyon's flagship device, engineered for silent-autoplay feeds.",
      result: "3.1x add-to-cart vs. control"
    },
    {
      id: "oktane",
      title: "Oktane — 6s Bumpers",
      cat: "social",
      catLabel: "Social",
      runtime: "00:06:00",
      poster: "linear-gradient(135deg,#2a2410,#0a0a0b)",
      desc: "A set of nine six-second vertical bumpers, each testing a different hook against watch-through.",
      result: "88% avg. completion rate"
    },
    {
      id: "meridian",
      title: "Meridian — Founders",
      cat: "brand",
      catLabel: "Brand film",
      runtime: "02:10:00",
      poster: "linear-gradient(135deg,#1c1030,#0a0a0b)",
      desc: "A documentary-style founder film for Meridian's Series B, used across web, sales, and hiring.",
      result: "+19% qualified pipeline"
    },
    {
      id: "foxglove",
      title: "Foxglove — Unboxing",
      cat: "product",
      catLabel: "Product",
      runtime: "00:44:00",
      poster: "linear-gradient(135deg,#102a1c,#0a0a0b)",
      desc: "Tactile unboxing film for Foxglove skincare, colour-graded for warmth and premium feel.",
      result: "+27% repeat purchase"
    },
    {
      id: "vesper",
      title: "Vesper — City Nights",
      cat: "social",
      catLabel: "Social",
      runtime: "00:15:00",
      poster: "linear-gradient(135deg,#241030,#0a0a0b)",
      desc: "Vertical 15-second nightlife spots for Vesper, shot handheld for authenticity in-feed.",
      result: "5.2M organic views"
    },
    {
      id: "bright",
      title: "Bright & Co — Anthem",
      cat: "tvc",
      catLabel: "TVC",
      runtime: "01:00:00",
      poster: "linear-gradient(135deg,#2a1a2a,#0a0a0b)",
      desc: "A 60-second brand anthem for Bright & Co, delivered in broadcast, OLV, and cutdown specs.",
      result: "+33% ad-recall lift"
    },
    {
      id: "okt2",
      title: "Oktane — Launch Teaser",
      cat: "brand",
      catLabel: "Brand film",
      runtime: "00:24:00",
      poster: "linear-gradient(135deg,#102030,#0a0a0b)",
      desc: "A teaser cut preceding Oktane's product film, seeded two weeks ahead of the reveal.",
      result: "62k waitlist signups"
    }
  ];

  var reelMap = {};
  reels.forEach(function (r) { reelMap[r.id] = r; });

  /* ---------- Render grid ---------- */
  var grid = document.getElementById("reelGrid");
  function render(list) {
    grid.innerHTML = "";
    list.forEach(function (r, i) {
      var card = document.createElement("article");
      card.className = "card";
      card.dataset.cat = r.cat;
      card.dataset.reel = r.id;
      card.style.animationDelay = (i * 0.04) + "s";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Play reel: " + r.title);
      card.innerHTML =
        '<div class="card-poster" style="background-image:' + r.poster + '"></div>' +
        '<span class="card-badge">' + r.catLabel + '</span>' +
        '<span class="card-play"><span class="play" aria-hidden="true"></span></span>' +
        '<div class="card-overlay">' +
          '<span class="card-title">' + r.title + '</span>' +
          '<span class="card-sub"><span class="card-runtime">' + r.runtime + '</span> · brand campaign</span>' +
        '</div>';
      grid.appendChild(card);
    });
  }
  render(reels);

  /* ---------- Filters ---------- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      var f = chip.dataset.filter;
      var list = f === "all" ? reels : reels.filter(function (r) { return r.cat === f; });
      render(list);
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbPoster = document.getElementById("lbPoster");
  var lbTitle = document.getElementById("lbTitle");
  var lbDesc = document.getElementById("lbDesc");
  var lbResult = document.getElementById("lbResult");
  var lbRuntime = document.getElementById("lbRuntime");
  var lastFocus = null;

  function openReel(id) {
    var r = reelMap[id];
    if (!r) return;
    lastFocus = document.activeElement;
    lbPoster.style.backgroundImage = r.poster;
    lbTitle.textContent = r.title;
    lbDesc.textContent = r.desc;
    lbResult.textContent = r.result;
    lbRuntime.textContent = r.runtime;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = lightbox.querySelector(".lightbox-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeReel() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Grid card clicks (delegated) + keyboard
  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (card) openReel(card.dataset.reel);
  });
  grid.addEventListener("keydown", function (e) {
    var card = e.target.closest(".card");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openReel(card.dataset.reel);
    }
  });

  // Hero "watch the reel"
  document.querySelectorAll("[data-reel]").forEach(function (btn) {
    if (btn.closest("#reelGrid")) return;
    btn.addEventListener("click", function () { openReel(btn.dataset.reel); });
  });

  lightbox.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeReel();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) closeReel();
  });

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById("hamburger");
  var navLinks = document.getElementById("navLinks");
  hamburger.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Count-up stats ---------- */
  var counted = false;
  function runCounts() {
    if (counted) return;
    counted = true;
    document.querySelectorAll(".stat-num").forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || "";
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      var start = null;
      var dur = 1500;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Reveal + stats via IntersectionObserver ---------- */
  var statsSection = document.getElementById("stats");
  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          revObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { revObs.observe(el); });

    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounts(); statObs.disconnect(); }
      });
    }, { threshold: 0.4 });
    if (statsSection) statObs.observe(statsSection);
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
    runCounts();
  }

  /* ---------- Testimonials ---------- */
  var quotes = [
    {
      text: "The launch film paid for itself in eleven days. Vantablack treated our conversion rate like the star of the shoot — and it showed.",
      name: "Dana Reyes",
      role: "VP Growth, Pulse Athletic"
    },
    {
      text: "We briefed a number, not a look. They came back with a film that hit both — and a performance readout that made the next round easy to sign off.",
      name: "Marcus Feld",
      role: "CMO, Halcyon"
    },
    {
      text: "Fastest brief-to-broadcast we've ever run. Eighteen days from kickoff to a national spot that beat our recall benchmark by a third.",
      name: "Priya Anand",
      role: "Brand Director, Bright & Co"
    }
  ];
  var qText = document.getElementById("quoteText");
  var qName = document.getElementById("quoteName");
  var qRole = document.getElementById("quoteRole");
  var dotsWrap = document.getElementById("dots");
  var qIndex = 0;
  var qTimer;

  quotes.forEach(function (_, i) {
    var d = document.createElement("button");
    d.setAttribute("role", "tab");
    d.setAttribute("aria-label", "Testimonial " + (i + 1));
    if (i === 0) d.classList.add("is-active");
    d.addEventListener("click", function () { showQuote(i, true); });
    dotsWrap.appendChild(d);
  });
  function showQuote(i, manual) {
    qIndex = i;
    var q = quotes[i];
    qText.style.opacity = "0";
    setTimeout(function () {
      qText.textContent = q.text;
      qName.textContent = q.name;
      qRole.textContent = q.role;
      qText.style.opacity = "1";
    }, 200);
    Array.prototype.forEach.call(dotsWrap.children, function (d, di) {
      d.classList.toggle("is-active", di === i);
    });
    if (manual) restartQuoteTimer();
  }
  function nextQuote() { showQuote((qIndex + 1) % quotes.length, false); }
  function restartQuoteTimer() {
    clearInterval(qTimer);
    qTimer = setInterval(nextQuote, 5500);
  }
  restartQuoteTimer();

  /* ---------- Quote form ---------- */
  var form = document.getElementById("quoteForm");
  function setErr(id, msg) {
    var field = document.getElementById(id).closest(".field");
    var err = document.querySelector('[data-err="' + id + '"]');
    if (msg) {
      field.classList.add("is-invalid");
      err.textContent = msg;
    } else {
      field.classList.remove("is-invalid");
      err.textContent = "";
    }
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("qName");
    var email = document.getElementById("qEmail");
    var budget = document.getElementById("qBudget");
    var ok = true;

    if (!name.value.trim()) { setErr("qName", "Please add your name."); ok = false; }
    else setErr("qName", "");

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) { setErr("qEmail", "We need an email to reply."); ok = false; }
    else if (!emailRe.test(email.value.trim())) { setErr("qEmail", "That email looks off."); ok = false; }
    else setErr("qEmail", "");

    if (!budget.value) { setErr("qBudget", "Pick a budget range."); ok = false; }
    else setErr("qBudget", "");

    if (ok) {
      form.reset();
      toast("Brief received — we'll quote you within a day.");
    } else {
      toast("Please fix the highlighted fields.");
    }
  });

  // Clear error on input
  ["qName", "qEmail", "qBudget"].forEach(function (id) {
    var el = document.getElementById(id);
    var ev = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(ev, function () { setErr(id, ""); });
  });
})();
