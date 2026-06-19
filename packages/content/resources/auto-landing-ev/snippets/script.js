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
    }, 2600);
  }

  /* ---------- nav: scroll state + mobile toggle ---------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMobile() {
    if (!mobileNav) return;
    mobileNav.hidden = true;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.hidden;
      mobileNav.hidden = !open;
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMobile();
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en, i) {
          if (en.isIntersecting) {
            var el = en.target;
            setTimeout(function () {
              el.classList.add("is-in");
            }, Math.min(i * 60, 240));
            io.unobserve(el);
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
      el.classList.add("is-in");
    });
  }

  /* ---------- animated stat counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function fmt(el, val) {
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var thousands = el.getAttribute("data-thousands") === "1";
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var num = decimals ? val.toFixed(decimals) : Math.round(val).toString();
    if (thousands) num = Math.round(val).toLocaleString("en-US");
    el.textContent = prefix + num + suffix;
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dur = 1400;
    var start = performance.now();
    function step(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      fmt(el, target * eased);
      if (t < 1) requestAnimationFrame(step);
      else fmt(el, target);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCount(en.target);
            cio.unobserve(en.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  } else {
    counters.forEach(function (el) {
      fmt(el, parseFloat(el.getAttribute("data-count")));
    });
  }

  /* ---------- model tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".model-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".model-card"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-model");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      panels.forEach(function (p) {
        var on = p.getAttribute("data-panel") === key;
        p.hidden = !on;
        p.classList.toggle("is-active", on);
      });
    });
  });

  // "Order X" buttons inside model cards -> sync configurator + scroll
  document.querySelectorAll("[data-order]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var model = btn.getAttribute("data-order");
      selectModelInConfig(model);
      toast("Loaded " + model + " into your build");
    });
  });

  /* ---------- charging simulator ---------- */
  var ringFg = document.getElementById("ringFg");
  var chargePct = document.getElementById("chargePct");
  var chargeRange = document.getElementById("chargeRange");
  var chargeKw = document.getElementById("chargeKw");
  var chargeEta = document.getElementById("chargeEta");
  var chargeState = document.getElementById("chargeState");
  var chargeReset = document.getElementById("chargeReset");
  var CIRC = 2 * Math.PI * 52; // ~326.7
  var chargeTimer = null;
  var pct = 18;

  function renderCharge() {
    var clamped = Math.max(0, Math.min(100, pct));
    if (ringFg) ringFg.style.strokeDashoffset = String(CIRC * (1 - clamped / 100));
    if (chargePct) chargePct.textContent = Math.round(clamped);
    // range added since 18% baseline, ~4 mi per %
    if (chargeRange) chargeRange.textContent = Math.round(Math.max(0, clamped - 18) * 4);
    // kW tapers as battery fills (charge curve)
    var kw = clamped < 60 ? 250 : Math.round(250 - (clamped - 60) * 4.4);
    if (chargeKw) chargeKw.textContent = Math.max(40, kw);
    // eta to 80%
    if (chargeEta) {
      if (clamped >= 80) {
        chargeEta.textContent = "Done";
      } else {
        var mins = Math.ceil((80 - clamped) * 0.32);
        var mm = String(mins % 60).padStart(2, "0");
        chargeEta.textContent = "00:" + mm;
      }
    }
    if (chargeState) chargeState.textContent = clamped >= 80 ? "Ready to drive" : "Charging";
  }

  function startCharge() {
    if (chargeTimer) clearInterval(chargeTimer);
    chargeTimer = setInterval(function () {
      if (pct >= 80) {
        clearInterval(chargeTimer);
        chargeTimer = null;
        renderCharge();
        toast("Charged to 80% — ready to roll");
        return;
      }
      pct += pct < 60 ? 1.6 : 0.9; // realistic taper
      if (pct > 80) pct = 80;
      renderCharge();
    }, 120);
  }

  if (chargeReset) {
    chargeReset.addEventListener("click", function () {
      pct = 18;
      renderCharge();
      startCharge();
      toast("Charging session restarted");
    });
  }
  // kick off the sim when it enters view
  var chargePanel = document.querySelector(".charge-panel");
  if (chargePanel && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            renderCharge();
            startCharge();
            sio.unobserve(en.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    sio.observe(chargePanel);
  } else {
    renderCharge();
  }

  /* ---------- configurator ---------- */
  var config = {
    model: { label: "Aero", price: 48990 },
    pack: { label: "Standard", price: 0 },
    fsd: { label: "Autopilot", price: 0 },
    paint: { label: "Pearl White", price: 0 },
  };
  var summaryList = document.getElementById("summaryList");
  var totalPrice = document.getElementById("totalPrice");

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function renderSummary() {
    if (!summaryList) return;
    var rows = [
      ["Model", config.model.label, config.model.price],
      ["Range pack", config.pack.label, config.pack.price],
      ["Autonomy", config.fsd.label, config.fsd.price],
      ["Paint", config.paint.label, config.paint.price],
    ];
    summaryList.innerHTML = rows
      .map(function (r) {
        var add = r[2] > 0 ? "+" + money(r[2]) : "Included";
        return (
          '<li><span>' + r[0] + ": " + r[1] + "</span><span>" + add + "</span></li>"
        );
      })
      .join("");
    var total =
      config.model.price + config.pack.price + config.fsd.price + config.paint.price;
    if (totalPrice) totalPrice.textContent = money(total);
  }

  function setOption(group, btn) {
    config[group] = {
      label: btn.getAttribute("data-val"),
      price: parseInt(btn.getAttribute("data-price") || "0", 10),
    };
    var siblings = document.querySelectorAll('[data-cfg="' + group + '"]');
    siblings.forEach(function (s) {
      s.classList.toggle("is-active", s === btn);
    });
    renderSummary();
  }

  document.querySelectorAll("[data-cfg]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setOption(btn.getAttribute("data-cfg"), btn);
    });
  });

  // sync configurator model when chosen from model cards
  function selectModelInConfig(modelName) {
    var btn = document.querySelector('[data-cfg="model"][data-val="' + modelName + '"]');
    if (btn) setOption("model", btn);
    var order = document.getElementById("order");
    if (order) order.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  var reserveBtn = document.getElementById("reserveBtn");
  if (reserveBtn) {
    reserveBtn.addEventListener("click", function () {
      toast(
        "Reservation placed — Voltway " +
          config.model.label +
          " in " +
          config.paint.label
      );
    });
  }

  renderSummary();
})();
