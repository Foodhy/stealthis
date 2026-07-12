/* Aperture Studio — Session Types
   Vanilla JS: renders session cards, opens a detail panel, toasts on booking. */

(function () {
  "use strict";

  var ICONS = {
    rings:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="14" r="5.5"/><circle cx="15.5" cy="14" r="5.5"/><path d="M8.5 8.5 10 4.5h4l1.5 4"/></svg>',
    portrait:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
    family:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="8" r="3"/><circle cx="16.5" cy="8" r="3"/><path d="M2.5 20c0-3 2.2-5 5-5s5 2 5 5M11.5 20c0-3 2.2-5 5-5s5 2 5 5"/></svg>',
    product:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2z"/><path d="m4 6.5 8 4.5 8-4.5M12 11v9"/></svg>',
    event:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4m8 3V4M3 11h18"/></svg>',
    realestate:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>',
  };

  var ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var SESSIONS = [
    {
      id: "wedding",
      label: "Full Day",
      title: "Wedding",
      icon: "rings",
      from: 2400,
      blurb: "Candid, unhurried coverage from first look to last dance.",
      duration: "8–10 hours",
      deliverables: "600+ edited images",
      turnaround: "4–6 weeks",
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "portrait",
      label: "Studio",
      title: "Portrait",
      icon: "portrait",
      from: 320,
      blurb: "Editorial headshots and personal branding under soft light.",
      duration: "60–90 minutes",
      deliverables: "25 edited images",
      turnaround: "5–7 days",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "family",
      label: "On Location",
      title: "Family",
      icon: "family",
      from: 380,
      blurb: "Warm, playful sessions at home or your favourite trail.",
      duration: "90 minutes",
      deliverables: "40 edited images",
      turnaround: "1–2 weeks",
      img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "product",
      label: "Commercial",
      title: "Product",
      icon: "product",
      from: 540,
      blurb: "Clean e-commerce and lifestyle shots that convert.",
      duration: "Half day",
      deliverables: "Up to 20 SKUs",
      turnaround: "3–5 days",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "event",
      label: "Coverage",
      title: "Event",
      icon: "event",
      from: 650,
      blurb: "Conferences, launches and parties documented start to finish.",
      duration: "4 hours",
      deliverables: "300+ edited images",
      turnaround: "48 hours",
      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "realestate",
      label: "Property",
      title: "Real Estate",
      icon: "realestate",
      from: 210,
      blurb: "Bright, wide interiors and drone exteriors that sell listings.",
      duration: "1–2 hours",
      deliverables: "30 HDR images",
      turnaround: "24 hours",
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60",
    },
  ];

  var grid = document.getElementById("grid");
  var detail = document.getElementById("detail");
  var toastEl = document.getElementById("toast");
  var activeId = null;
  var toastTimer;

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function toast(msg) {
    toastEl.innerHTML = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 3200);
  }

  /* ---- render cards ---- */
  SESSIONS.forEach(function (s) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.setAttribute("data-id", s.id);
    card.setAttribute(
      "aria-label",
      s.title + " session, from " + money(s.from) + ". View details."
    );

    card.innerHTML =
      '<div class="card__img" style="background-image:url(' + s.img + ')"></div>' +
      '<div class="card__scrim"></div>' +
      '<div class="card__top">' +
        '<span class="card__icon">' + ICONS[s.icon] + "</span>" +
        '<span class="badge">from <b>' + money(s.from) + "</b></span>" +
      "</div>" +
      '<p class="card__label">' + s.label + "</p>" +
      '<div class="card__body">' +
        '<h3 class="card__title">' + s.title + "</h3>" +
        '<p class="card__blurb">' + s.blurb + "</p>" +
        '<span class="card__cta">View details ' + ARROW + "</span>" +
      "</div>";

    card.addEventListener("click", function () {
      openDetail(s.id);
    });
    grid.appendChild(card);
  });

  /* ---- detail panel ---- */
  function openDetail(id) {
    var s = SESSIONS.find(function (x) {
      return x.id === id;
    });
    if (!s) return;
    activeId = id;

    document.getElementById("detailLabel").textContent = s.label + " Session";
    document.getElementById("detailTitle").textContent = s.title;
    document.getElementById("detailBlurb").textContent = s.blurb;
    document.getElementById("detailPrice").innerHTML =
      "Starting <b>" + money(s.from) + "</b>";

    document.getElementById("detailMeta").innerHTML =
      metaBlock("Duration", s.duration) +
      metaBlock("Deliverables", s.deliverables) +
      metaBlock("Turnaround", s.turnaround);

    detail.hidden = false;
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // highlight source card via aria-expanded semantics
    var cards = grid.querySelectorAll(".card");
    cards.forEach(function (c) {
      c.setAttribute(
        "aria-pressed",
        c.getAttribute("data-id") === id ? "true" : "false"
      );
    });
  }

  function metaBlock(term, val) {
    return "<div><dt>" + term + "</dt><dd>" + val + "</dd></div>";
  }

  document.getElementById("detailClose").addEventListener("click", function () {
    detail.hidden = true;
    activeId = null;
  });

  document.getElementById("bookBtn").addEventListener("click", function () {
    var s = SESSIONS.find(function (x) {
      return x.id === activeId;
    });
    if (!s) return;
    toast("Request sent for <b>" + s.title + "</b> — we'll email you within 24h.");
  });

  /* Escape closes the panel */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !detail.hidden) {
      detail.hidden = true;
      activeId = null;
    }
  });
})();
