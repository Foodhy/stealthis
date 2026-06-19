(function () {
  "use strict";

  /* ── toast helper ── */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3000);
  }

  /* ── nav shrink on scroll ── */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("shrink", window.scrollY > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── mobile menu ── */
  var burger = document.getElementById("burger");
  var mobile = document.getElementById("mobileMenu");
  function closeMobile() {
    if (!mobile || !burger) return;
    mobile.hidden = true;
    burger.setAttribute("aria-expanded", "false");
  }
  if (burger && mobile) {
    burger.addEventListener("click", function () {
      var open = mobile.hidden;
      mobile.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMobile);
    });
  }

  /* ── booking / concierge actions (event delegation) ── */
  document.addEventListener("click", function (e) {
    var book = e.target.closest("[data-book], #bookBtn");
    if (book) {
      closeMobile();
      toast("Your reservation enquiry has been sent — a concierge will be in touch shortly.");
      return;
    }
    var call = e.target.closest("[data-call], #callBtn");
    if (call) {
      e.preventDefault();
      closeMobile();
      toast("Concierge line open 24h: +41 22 071 1971 (fictional).");
    }
  });

  /* ── fare quote ── */
  var quoteForm = document.getElementById("quoteForm");
  var quoteOut = document.getElementById("quoteOut");
  var basePrices = { first: 11400, business: 5950, premium: 2380 };
  var cabinNames = { first: "First Suite", business: "Business Pavilion", premium: "Premium Salon" };

  function norm(v) {
    return (v || "").trim().toUpperCase().slice(0, 3) || "—";
  }
  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var from = norm(document.getElementById("from").value);
      var to = norm(document.getElementById("to").value);
      var cabin = document.getElementById("cabin").value;
      if (from === to) {
        toast("Please choose two different airports.");
        return;
      }
      // deterministic, fictional fare: base + a hash of the route
      var seed = (from + to).split("").reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
      var fare = basePrices[cabin] + (seed % 7) * 320;
      var fmt = fare.toLocaleString("en-US");
      quoteOut.innerHTML =
        cabinNames[cabin] + " · " + from + " → " + to +
        " · from <strong>$" + fmt + "</strong> return, all-inclusive";
      toast("Indicative fare quoted for " + from + " → " + to + ".");
    });
  }

  /* ── onboard tabs ── */
  var tabs = document.querySelectorAll(".ob__tab");
  var panels = document.querySelectorAll(".ob-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-tab");
      tabs.forEach(function (t) { t.classList.toggle("is-active", t === tab); });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === name);
      });
    });
  });

  /* ── destination filter ── */
  var chips = document.querySelectorAll(".chip");
  var dests = document.querySelectorAll(".dest");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var region = chip.getAttribute("data-region");
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
      });
      var shown = 0;
      dests.forEach(function (d) {
        var match = region === "all" || d.getAttribute("data-region") === region;
        d.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      toast(shown + (shown === 1 ? " destination" : " destinations") + " in this region.");
    });
  });

  /* ── loyalty join ── */
  var joinBtn = document.getElementById("joinBtn");
  if (joinBtn) {
    joinBtn.addEventListener("click", function () {
      toast("Invitation requested — membership of Le Cercle is by referral. We will write soon.");
    });
  }

  /* ── newsletter ── */
  var newsForm = document.getElementById("newsForm");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("newsEmail").value.trim();
      if (!email) return;
      newsForm.reset();
      toast("Thank you — our journal will arrive in your inbox each season.");
    });
  }

  /* ── animated stat counters ── */
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = null;
    var dur = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(step);
  }

  /* ── scroll reveal + counters via IntersectionObserver ── */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        entry.target.querySelectorAll("[data-count]").forEach(runCounter);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.16 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
      el.querySelectorAll("[data-count]").forEach(function (c) {
        c.textContent = c.getAttribute("data-count");
      });
    });
  }
})();
