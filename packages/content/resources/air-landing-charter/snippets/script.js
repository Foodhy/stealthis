(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3600);
  }

  /* ---------- smooth scroll for data-scroll buttons ---------- */
  document.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.querySelector(btn.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMobile();
    });
  });

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  function closeMobile() {
    if (!burger) return;
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      var open = burger.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      mobileNav.classList.toggle("open", open);
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMobile);
    });
  }

  /* ---------- fleet data + tabs ---------- */
  var FLEET = {
    light: {
      tag: "Light Jet",
      name: "Méridian Phenom 300E",
      desc: "Nimble and efficient for short hops and quick getaways — ideal for regional jaunts and one-day round trips.",
      pax: "6",
      range: "2,010 nm",
      speed: "453 kt",
      price: "$4,200/hr",
      features: [
        ["Best for", "1–3 hour sectors, KTEB → KMVY, EGGW → LFMN"],
        ["Cabin", "Stand-up comfort for six, refreshment centre"],
        ["Runway", "Access to short fields larger jets cannot reach"]
      ]
    },
    mid: {
      tag: "Midsize Jet",
      name: "Méridian Praetor 600",
      desc: "The everyday workhorse of the fleet — transcontinental range with a fully appointed cabin and a generous baggage hold.",
      pax: "9",
      range: "4,018 nm",
      speed: "466 kt",
      price: "$7,600/hr",
      features: [
        ["Best for", "Coast-to-coast U.S. or transatlantic with a tailwind"],
        ["Cabin", "Flat-floor stand-up cabin, full galley, enclosed lavatory"],
        ["Connectivity", "Ka-band Wi-Fi suitable for live video calls"]
      ]
    },
    heavy: {
      tag: "Heavy Jet",
      name: "Méridian Global 7500",
      desc: "Long-range flagship with four living zones and a permanent crew rest — intercontinental in a single, seamless leg.",
      pax: "14",
      range: "7,700 nm",
      speed: "516 kt",
      price: "$14,900/hr",
      features: [
        ["Best for", "Nonstop New York → Tokyo, London → Cape Town"],
        ["Cabin", "Four zones: dining, conference, lounge, private suite"],
        ["Crew", "Dedicated cabin host and onboard chef on request"]
      ]
    }
  };

  var els = {
    tag: document.getElementById("fleetTag"),
    name: document.getElementById("fleetName"),
    desc: document.getElementById("fleetDesc"),
    pax: document.getElementById("specPax"),
    range: document.getElementById("specRange"),
    speed: document.getElementById("specSpeed"),
    price: document.getElementById("specPrice"),
    features: document.getElementById("fleetFeatures"),
    card: document.getElementById("fleetCard")
  };

  function renderFleet(key) {
    var d = FLEET[key];
    if (!d) return;
    els.tag.textContent = d.tag;
    els.name.textContent = d.name;
    els.desc.textContent = d.desc;
    els.pax.textContent = d.pax;
    els.range.textContent = d.range;
    els.speed.textContent = d.speed;
    els.price.textContent = d.price;
    els.features.innerHTML = d.features
      .map(function (f) {
        return (
          '<li><span class="ff-mark" aria-hidden="true">◆</span>' +
          "<span><b>" + f[0] + "</b><span>" + f[1] + "</span></span></li>"
        );
      })
      .join("");
    // subtle re-entrance animation
    els.card.style.opacity = "0";
    els.card.style.transform = "translateY(10px)";
    requestAnimationFrame(function () {
      els.card.style.transition = "opacity .4s ease, transform .4s ease";
      els.card.style.opacity = "1";
      els.card.style.transform = "none";
    });
  }

  var tabs = document.querySelectorAll(".ftab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderFleet(tab.getAttribute("data-fleet"));
    });
  });
  renderFleet("light");

  /* ---------- form validation helpers ---------- */
  function markInvalid(field) {
    field.classList.add("invalid");
    field.addEventListener(
      "input",
      function () { field.classList.remove("invalid"); },
      { once: true }
    );
  }
  function validate(form) {
    var ok = true;
    var firstBad = null;
    form.querySelectorAll("[required]").forEach(function (f) {
      var val = (f.value || "").trim();
      var bad = !val;
      if (f.type === "email" && val) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (bad) {
        markInvalid(f);
        ok = false;
        if (!firstBad) firstBad = f;
      }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  /* ---------- rail (hero) form -> scroll to full quote ---------- */
  var railForm = document.getElementById("railForm");
  if (railForm) {
    railForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(railForm)) {
        toast("Please complete the route and date.");
        return;
      }
      var data = new FormData(railForm);
      // prefill the full quote form
      var setIf = function (id, v) {
        var el = document.getElementById(id);
        if (el && v) el.value = v;
      };
      setIf("qFrom", data.get("from"));
      setIf("qTo", data.get("to"));
      setIf("qDate", data.get("date"));
      var quote = document.getElementById("quote");
      if (quote) quote.scrollIntoView({ behavior: "smooth", block: "start" });
      toast("Carried over — just add your details below.");
    });
  }

  /* ---------- full quote form ---------- */
  var quoteForm = document.getElementById("quoteForm");
  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(quoteForm)) {
        toast("A few fields still need your attention.");
        return;
      }
      var data = new FormData(quoteForm);
      var name = (data.get("name") || "").trim().split(" ")[0] || "there";
      var from = (data.get("from") || "").trim();
      var to = (data.get("to") || "").trim();
      var btn = quoteForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }
      setTimeout(function () {
        quoteForm.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Send request";
        }
        toast(
          "Thank you, <strong>" +
            name +
            "</strong> — an advisor will reach out about " +
            (from && to ? from + " → " + to : "your trip") +
            " within the hour."
        );
      }, 900);
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* ---------- min date = today on date inputs ---------- */
  var today = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach(function (d) {
    d.min = today;
  });
})();
