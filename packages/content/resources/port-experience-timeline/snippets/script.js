/* ============================================================
   Maya Okafor — Experience / Résumé Timeline
   Vanilla JS: dataset toggle, expand/collapse, expand-all.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Data (fictional but believable) ---------- */
  var DATA = {
    work: [
      {
        company: "Northwind Health",
        title: "Senior Product Designer",
        dates: "2023 — Present",
        place: "Remote · Berlin",
        current: true,
        bullets: [
          ["Lead designer for the clinician scheduling suite — shipped a unified booking flow that cut <b>double-bookings by 41%</b> across 200+ clinics."],
          ["Built and govern <b>Aurora</b>, a 90-component design system adopted by 6 product teams; reduced new-screen build time from days to hours."],
          ["Run weekly design critiques and mentor 3 mid-level designers."]
        ],
        stack: ["Figma", "Design Systems", "Tokens", "Accessibility", "Storybook"]
      },
      {
        company: "Cartograph",
        title: "Product Designer, Platform",
        dates: "2021 — 2023",
        place: "Amsterdam",
        current: false,
        bullets: [
          ["Redesigned the map-editing canvas; the new layer model raised <b>task completion from 62% to 88%</b> in usability testing."],
          ["Partnered with engineering on a tokenized theming layer powering light, dark, and high-contrast modes."],
          ["Owned end-to-end research for the onboarding revamp — 5 studies, 40+ participants."]
        ],
        stack: ["Figma", "User Research", "Prototyping", "Theming", "Maps"]
      },
      {
        company: "Loft & Co.",
        title: "Product Designer",
        dates: "2019 — 2021",
        place: "London",
        current: false,
        bullets: [
          ["Designed the checkout and saved-payments experience for a marketplace serving <b>1.2M monthly buyers</b>."],
          ["Introduced a component library in Figma that became the team's single source of truth."],
          ["Shipped an accessibility pass bringing key flows to <b>WCAG AA</b>."]
        ],
        stack: ["Figma", "Sketch", "Interaction Design", "A/B Testing"]
      },
      {
        company: "Bright Labs",
        title: "UX Designer",
        dates: "2017 — 2019",
        place: "London",
        current: false,
        bullets: [
          ["First designer on a B2B analytics dashboard — defined the visual language from scratch."],
          ["Built reusable charting patterns adopted across 4 client products."],
          ["Facilitated discovery workshops translating stakeholder goals into testable flows."]
        ],
        stack: ["Sketch", "Data Viz", "Wireframing", "Workshops"]
      },
      {
        company: "Freelance",
        title: "UI / Visual Designer",
        dates: "2016 — 2017",
        place: "Remote",
        current: false,
        bullets: [
          ["Delivered marketing sites and brand kits for <b>11 early-stage startups</b>."],
          ["Set up lightweight design-to-handoff workflows for small dev teams."]
        ],
        stack: ["Figma", "Branding", "Landing Pages", "Webflow"]
      }
    ],
    education: [
      {
        company: "Royal College of Art",
        title: "MA, Interaction Design",
        dates: "2014 — 2016",
        place: "London",
        current: false,
        bullets: [
          ["Thesis on <b>accessible data visualization</b> for low-vision users — shortlisted for the graduate showcase."],
          ["Built tangible interaction prototypes blending hardware and screen."]
        ],
        stack: ["Interaction Design", "Research", "Prototyping"]
      },
      {
        company: "University of Leeds",
        title: "BA (Hons), Graphic & Communication Design",
        dates: "2011 — 2014",
        place: "Leeds",
        current: false,
        bullets: [
          ["Graduated <b>First Class</b>; specialised in typography and editorial systems."],
          ["President of the student design society; ran a print-zine collective."]
        ],
        stack: ["Typography", "Editorial", "Print"]
      },
      {
        company: "Interaction Design Foundation",
        title: "Certificate, Design Systems",
        dates: "2022",
        place: "Online",
        current: false,
        bullets: [
          ["Completed the design-systems track covering tokens, governance, and contribution models."]
        ],
        stack: ["Design Systems", "Governance"]
      }
    ]
  };

  /* ---------- Elements ---------- */
  var listEl = document.getElementById("timeline");
  var toggleAllBtn = document.getElementById("toggle-all");
  var toastEl = document.getElementById("toast");
  var segButtons = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));
  var downloadLink = document.querySelector("[data-download]");

  var currentView = "work";
  var idCounter = 0;

  /* ---------- Helpers ---------- */
  var chevronSVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 9l6 6 6-6"/></svg>';

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition replays
    void toastEl.offsetWidth;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
      setTimeout(function () { toastEl.hidden = true; }, 240);
    }, 2200);
  }

  /* ---------- Build one entry ---------- */
  function buildEntry(item, view) {
    var id = "entry-" + (++idCounter);
    var li = el("li", "entry");
    li.dataset.kind = view;
    if (item.current) li.classList.add("is-current");

    li.appendChild(el("span", "entry-dot"));

    var card = el("div", "entry-card");

    /* header button */
    var head = el("button", "entry-head");
    head.type = "button";
    head.setAttribute("aria-expanded", "false");
    head.setAttribute("aria-controls", id);

    var titleRow = el("div", "entry-title-row");
    var titleVerb = view === "education" ? " at " : " · ";
    var h3 = el("h3", "entry-title",
      item.title + '<span class="entry-sep">' + titleVerb + '</span>' +
      '<span class="entry-company">' + item.company + "</span>");
    titleRow.appendChild(h3);
    if (item.current) {
      titleRow.appendChild(el("span", "badge-current", "Current"));
    }
    head.appendChild(titleRow);

    var meta = el("div", "entry-meta");
    meta.appendChild(el("span", "dates", item.dates));
    meta.appendChild(el("span", "place", item.place));
    head.appendChild(meta);

    head.appendChild(el("span", "chevron", chevronSVG));
    card.appendChild(head);

    /* collapsible body */
    var body = el("div", "entry-body");
    body.id = id;
    var inner = el("div", "entry-body-inner");
    var pad = el("div", "entry-body-pad");

    var ul = el("ul", "bullets");
    item.bullets.forEach(function (b) {
      ul.appendChild(el("li", null, b[0]));
    });
    pad.appendChild(ul);

    var chips = el("div", "chips");
    chips.setAttribute("aria-label", "Tools and skills");
    item.stack.forEach(function (s) {
      chips.appendChild(el("span", "chip", s));
    });
    pad.appendChild(chips);

    inner.appendChild(pad);
    body.appendChild(inner);
    card.appendChild(body);
    li.appendChild(card);

    /* interaction */
    head.addEventListener("click", function () {
      toggleEntry(li, head);
    });

    return li;
  }

  function toggleEntry(li, head, force) {
    var open = typeof force === "boolean" ? force : !li.classList.contains("is-open");
    li.classList.toggle("is-open", open);
    head.setAttribute("aria-expanded", open ? "true" : "false");
    syncToggleAll();
  }

  /* ---------- Render a dataset ---------- */
  function render(view) {
    currentView = view;
    listEl.innerHTML = "";
    DATA[view].forEach(function (item, i) {
      var entry = buildEntry(item, view);
      entry.style.animationDelay = Math.min(i * 45, 260) + "ms";
      listEl.appendChild(entry);
    });
    // Open the most recent / current role by default for a useful first view.
    var firstEntry = listEl.querySelector(".entry");
    if (firstEntry) {
      toggleEntry(firstEntry, firstEntry.querySelector(".entry-head"), true);
    }
    syncToggleAll();
  }

  /* ---------- Segmented control ---------- */
  function selectView(view, btn) {
    if (view === currentView && btn.classList.contains("is-active")) return;
    segButtons.forEach(function (b) {
      var active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    render(view);
    toast(view === "work" ? "Showing work experience" : "Showing education");
  }

  segButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectView(btn.dataset.view, btn);
    });
    // arrow-key navigation within the tablist
    btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var idx = segButtons.indexOf(btn);
      var next = e.key === "ArrowRight"
        ? (idx + 1) % segButtons.length
        : (idx - 1 + segButtons.length) % segButtons.length;
      segButtons[next].focus();
      selectView(segButtons[next].dataset.view, segButtons[next]);
    });
  });

  /* ---------- Expand all / collapse all ---------- */
  function entriesOpenState() {
    var entries = Array.prototype.slice.call(listEl.querySelectorAll(".entry"));
    var openCount = entries.filter(function (en) {
      return en.classList.contains("is-open");
    }).length;
    return { total: entries.length, open: openCount, entries: entries };
  }

  function syncToggleAll() {
    var s = entriesOpenState();
    var allOpen = s.total > 0 && s.open === s.total;
    toggleAllBtn.setAttribute("aria-expanded", allOpen ? "true" : "false");
    toggleAllBtn.querySelector(".toggle-label").textContent =
      allOpen ? "Collapse all" : "Expand all";
  }

  toggleAllBtn.addEventListener("click", function () {
    var s = entriesOpenState();
    var shouldOpen = !(s.total > 0 && s.open === s.total);
    s.entries.forEach(function (en) {
      toggleEntry(en, en.querySelector(".entry-head"), shouldOpen);
    });
    toast(shouldOpen ? "Expanded all entries" : "Collapsed all entries");
  });

  /* ---------- Footer download (demo) ---------- */
  if (downloadLink) {
    downloadLink.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Résumé download is disabled in this demo");
    });
  }

  /* ---------- Init ---------- */
  render("work");
})();
