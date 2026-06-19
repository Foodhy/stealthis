"use strict";

/* ---------- Fleet data (fictional Skyloom Air) ---------- */
const FLEET = {
  a350: {
    tail: "SL-A350",
    name: "Airbus A350-1000",
    title: "Airbus A350-1000",
    status: "In service",
    tagline:
      "Our flagship for the world's longest routes — whisper-quiet, naturally lit, built to fly 16 hours without a refuel.",
    keyspecs: [
      { k: "Seats", v: "327", s: "" },
      { k: "Range", v: "8,700", s: "nm" },
      { k: "Cruise", v: "Mach 0.85" }
    ],
    classes: [
      { name: "Suite", dot: "#ff7a33" },
      { name: "Business", dot: "#0a66c2" },
      { name: "Premium", dot: "#1f9d62" },
      { name: "Economy", dot: "#6b7c93" }
    ],
    specs: {
      performance: [
        { dt: "Max range", dd: "8,700", sm: "nm" },
        { dt: "Cruise speed", dd: "488", sm: "kt" },
        { dt: "Service ceiling", dd: "43,100", sm: "ft" },
        { dt: "Engines", dd: "2", sm: "Trent XWB" }
      ],
      dimensions: [
        { dt: "Length", dd: "73.8", sm: "m" },
        { dt: "Wingspan", dd: "64.8", sm: "m" },
        { dt: "Height", dd: "17.1", sm: "m" },
        { dt: "MTOW", dd: "319", sm: "t" }
      ],
      cabin: [
        { dt: "Total seats", dd: "327", sm: "" },
        { dt: "Cabin width", dd: "5.61", sm: "m" },
        { dt: "Lie-flat seats", dd: "54", sm: "" },
        { dt: "Wi-Fi", dd: "Full", sm: "cabin" }
      ]
    },
    cabins: [
      { name: "Suite", layout: "1-2-1", pitch: "82", seats: 8, grad: ["#1b2c4a", "#0a66c2"], cols: [1, 2, 1] },
      { name: "Business", layout: "1-2-1", pitch: "44", seats: 46, grad: ["#0a66c2", "#084e95"], cols: [1, 2, 1] },
      { name: "Premium", layout: "2-4-2", pitch: "38", seats: 28, grad: ["#177a4c", "#1f9d62"], cols: [2, 4, 2] },
      { name: "Economy", layout: "3-3-3", pitch: "31", seats: 245, grad: ["#3a4d68", "#6b7c93"], cols: [3, 3, 3] }
    ]
  },
  b787: {
    tail: "SL-B789",
    name: "Boeing 787-9 Dreamliner",
    title: "Boeing 787-9",
    status: "In service",
    tagline:
      "The workhorse of our long-haul network — composite airframe, higher cabin humidity and dimmable windows for a softer arrival.",
    keyspecs: [
      { k: "Seats", v: "281", s: "" },
      { k: "Range", v: "7,635", s: "nm" },
      { k: "Cruise", v: "Mach 0.85" }
    ],
    classes: [
      { name: "Business", dot: "#0a66c2" },
      { name: "Premium", dot: "#1f9d62" },
      { name: "Economy", dot: "#6b7c93" }
    ],
    specs: {
      performance: [
        { dt: "Max range", dd: "7,635", sm: "nm" },
        { dt: "Cruise speed", dd: "488", sm: "kt" },
        { dt: "Service ceiling", dd: "43,000", sm: "ft" },
        { dt: "Engines", dd: "2", sm: "GEnx-1B" }
      ],
      dimensions: [
        { dt: "Length", dd: "62.8", sm: "m" },
        { dt: "Wingspan", dd: "60.1", sm: "m" },
        { dt: "Height", dd: "17.0", sm: "m" },
        { dt: "MTOW", dd: "254", sm: "t" }
      ],
      cabin: [
        { dt: "Total seats", dd: "281", sm: "" },
        { dt: "Cabin width", dd: "5.49", sm: "m" },
        { dt: "Lie-flat seats", dd: "30", sm: "" },
        { dt: "Wi-Fi", dd: "Full", sm: "cabin" }
      ]
    },
    cabins: [
      { name: "Business", layout: "1-2-1", pitch: "44", seats: 30, grad: ["#0a66c2", "#084e95"], cols: [1, 2, 1] },
      { name: "Premium", layout: "2-3-2", pitch: "38", seats: 21, grad: ["#177a4c", "#1f9d62"], cols: [2, 3, 2] },
      { name: "Economy", layout: "3-3-3", pitch: "31", seats: 230, grad: ["#3a4d68", "#6b7c93"], cols: [3, 3, 3] }
    ]
  },
  a321: {
    tail: "SL-A21N",
    name: "Airbus A321neo",
    title: "Airbus A321neo",
    status: "In service",
    tagline:
      "Single-aisle, twin-class comfort for short and medium hops — new-engine option for lower fuel burn and a quieter cabin.",
    keyspecs: [
      { k: "Seats", v: "196", s: "" },
      { k: "Range", v: "4,000", s: "nm" },
      { k: "Cruise", v: "Mach 0.78" }
    ],
    classes: [
      { name: "Business", dot: "#0a66c2" },
      { name: "Economy", dot: "#6b7c93" }
    ],
    specs: {
      performance: [
        { dt: "Max range", dd: "4,000", sm: "nm" },
        { dt: "Cruise speed", dd: "447", sm: "kt" },
        { dt: "Service ceiling", dd: "39,800", sm: "ft" },
        { dt: "Engines", dd: "2", sm: "LEAP-1A" }
      ],
      dimensions: [
        { dt: "Length", dd: "44.5", sm: "m" },
        { dt: "Wingspan", dd: "35.8", sm: "m" },
        { dt: "Height", dd: "11.8", sm: "m" },
        { dt: "MTOW", dd: "97", sm: "t" }
      ],
      cabin: [
        { dt: "Total seats", dd: "196", sm: "" },
        { dt: "Cabin width", dd: "3.70", sm: "m" },
        { dt: "Recliner seats", dd: "20", sm: "" },
        { dt: "Wi-Fi", dd: "Full", sm: "cabin" }
      ]
    },
    cabins: [
      { name: "Business", layout: "2-2", pitch: "38", seats: 20, grad: ["#0a66c2", "#084e95"], cols: [2, 2] },
      { name: "Economy", layout: "3-3", pitch: "30", seats: 176, grad: ["#3a4d68", "#6b7c93"], cols: [3, 3] }
    ]
  },
  e190: {
    tail: "SL-E290",
    name: "Embraer E190-E2",
    title: "Embraer E190-E2",
    status: "In service",
    tagline:
      "Our regional connector — a quiet, efficient jet sized for thinner routes, with no middle seats anywhere in the cabin.",
    keyspecs: [
      { k: "Seats", v: "106", s: "" },
      { k: "Range", v: "2,850", s: "nm" },
      { k: "Cruise", v: "Mach 0.78" }
    ],
    classes: [
      { name: "Business", dot: "#0a66c2" },
      { name: "Economy", dot: "#6b7c93" }
    ],
    specs: {
      performance: [
        { dt: "Max range", dd: "2,850", sm: "nm" },
        { dt: "Cruise speed", dd: "448", sm: "kt" },
        { dt: "Service ceiling", dd: "41,000", sm: "ft" },
        { dt: "Engines", dd: "2", sm: "PW1900G" }
      ],
      dimensions: [
        { dt: "Length", dd: "36.2", sm: "m" },
        { dt: "Wingspan", dd: "33.7", sm: "m" },
        { dt: "Height", dd: "10.9", sm: "m" },
        { dt: "MTOW", dd: "56", sm: "t" }
      ],
      cabin: [
        { dt: "Total seats", dd: "106", sm: "" },
        { dt: "Cabin width", dd: "2.74", sm: "m" },
        { dt: "Window seats", dd: "All", sm: "rows" },
        { dt: "Wi-Fi", dd: "Full", sm: "cabin" }
      ]
    },
    cabins: [
      { name: "Business", layout: "2-2", pitch: "37", seats: 12, grad: ["#0a66c2", "#084e95"], cols: [2, 2] },
      { name: "Economy", layout: "2-2", pitch: "31", seats: 94, grad: ["#3a4d68", "#6b7c93"], cols: [2, 2] }
    ]
  }
};

/* ---------- Toast helper ---------- */
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------- State ---------- */
let currentAc = "a350";
let currentSpec = "performance";
let currentCabin = 0;

/* ---------- Render: summary / key specs / classes ---------- */
function renderSummary(ac) {
  const d = FLEET[ac];
  document.querySelector("[data-ac-tail]").textContent = d.tail;
  document.querySelector("[data-ac-name]").textContent = d.name;
  document.querySelector("[data-ac-title]").textContent = d.title;
  document.querySelector("[data-ac-tagline]").textContent = d.tagline;
  document.querySelector("[data-ac-status]").textContent = d.status;

  document.querySelector("[data-ac-keyspecs]").innerHTML = d.keyspecs
    .map(
      (s) =>
        `<li><span class="k">${s.k}</span><span class="v">${s.v}${
          s.s ? ` <small>${s.s}</small>` : ""
        }</span></li>`
    )
    .join("");

  document.querySelector("[data-ac-classes]").innerHTML = d.classes
    .map(
      (c) =>
        `<span class="class-pill" style="--dot:${c.dot}">${c.name}</span>`
    )
    .join("");
}

/* ---------- Render: spec grid ---------- */
function renderSpecs(ac, view) {
  const rows = FLEET[ac].specs[view] || [];
  document.querySelector("[data-ac-specs]").innerHTML = rows
    .map(
      (r) =>
        `<div class="spec"><dt>${r.dt}</dt><dd>${r.dd}${
          r.sm ? ` <small>${r.sm}</small>` : ""
        }</dd></div>`
    )
    .join("");
}

/* ---------- Render: cabin gallery ---------- */
function renderCabinThumbs(ac) {
  const cabins = FLEET[ac].cabins;
  document.querySelector("[data-cabin-thumbs]").innerHTML = cabins
    .map(
      (c, i) =>
        `<button class="cabin-thumb${i === currentCabin ? " is-active" : ""}" role="tab" aria-selected="${
          i === currentCabin
        }" data-cabin-idx="${i}">${c.name}</button>`
    )
    .join("");
}

function renderCabinStage(ac) {
  const c = FLEET[ac].cabins[currentCabin];
  const art = document.querySelector("[data-cabin-art]");
  document.querySelector("[data-cabin-name]").textContent = c.name;
  art.style.background = `
    radial-gradient(120% 90% at 75% 12%, rgba(255,255,255,0.18), transparent 55%),
    linear-gradient(155deg, ${c.grad[0]}, ${c.grad[1]})`;
  // subtle "seat row" texture
  art.style.backgroundImage += "";
  const shot = document.querySelector("[data-cabin-shot]");
  shot.style.opacity = "0";
  requestAnimationFrame(() => (shot.style.opacity = "1"));

  renderSeatmap(ac);
}

/* ---------- Render: seat map ---------- */
function renderSeatmap(ac) {
  const c = FLEET[ac].cabins[currentCabin];
  const grid = document.querySelector("[data-seatmap]");
  const seatColor = c.grad[0];
  // Build a representative block of rows (cap visual rows for compactness)
  const totalCols = c.cols.reduce((a, b) => a + b, 0);
  const visRows = Math.min(8, Math.max(4, Math.round(c.seats / totalCols)));

  let html = "";
  for (let r = 0; r < visRows; r++) {
    html += '<div class="seat-row">';
    c.cols.forEach((grp, gi) => {
      for (let s = 0; s < grp; s++) {
        html += `<span class="seat" style="--seat:${seatColor};animation-delay:${(r * totalCols + gi) * 12}ms"></span>`;
      }
      if (gi < c.cols.length - 1) html += '<span class="seat aisle"></span>';
    });
    html += "</div>";
  }
  grid.innerHTML = html;

  document.querySelector("[data-seat-class]").textContent = c.name;
  document.querySelector(
    "[data-seat-note]"
  ).textContent = `${c.layout} layout · ${c.pitch}" pitch · ${c.seats} seats in this cabin`;
}

/* ---------- Full aircraft swap ---------- */
function selectAircraft(ac, announce) {
  if (!FLEET[ac]) return;
  currentAc = ac;
  currentCabin = 0;
  currentSpec = "performance";

  const panel = document.getElementById("panel");
  panel.classList.add("is-swapping");

  setTimeout(() => {
    renderSummary(ac);
    renderSpecs(ac, currentSpec);
    renderCabinThumbs(ac);
    renderCabinStage(ac);

    // reset spec pills
    document.querySelectorAll(".spec-pill").forEach((p) => {
      const on = p.dataset.spec === currentSpec;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-selected", String(on));
    });

    panel.classList.remove("is-swapping");
  }, 200);

  // tab states
  document.querySelectorAll(".ac-tab").forEach((t) => {
    const on = t.dataset.ac === ac;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", String(on));
  });

  if (announce) toast(`${FLEET[ac].name} selected`);
}

/* ---------- Wire up events ---------- */
function init() {
  // aircraft tabs
  document.querySelectorAll(".ac-tab").forEach((tab) => {
    tab.addEventListener("click", () => selectAircraft(tab.dataset.ac, true));
  });

  // keyboard nav across aircraft tabs
  const tabs = Array.from(document.querySelectorAll(".ac-tab"));
  document.querySelector(".ac-tabs").addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      selectAircraft(tabs[next].dataset.ac, true);
    }
  });

  // spec toggle
  document.querySelectorAll(".spec-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      currentSpec = pill.dataset.spec;
      document.querySelectorAll(".spec-pill").forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-selected", String(on));
      });
      renderSpecs(currentAc, currentSpec);
    });
  });

  // cabin gallery — thumbs (delegated, since they re-render)
  document.querySelector("[data-cabin-thumbs]").addEventListener("click", (e) => {
    const btn = e.target.closest(".cabin-thumb");
    if (!btn) return;
    currentCabin = Number(btn.dataset.cabinIdx);
    renderCabinThumbs(currentAc);
    renderCabinStage(currentAc);
  });

  // cabin arrows
  function step(dir) {
    const n = FLEET[currentAc].cabins.length;
    currentCabin = (currentCabin + dir + n) % n;
    renderCabinThumbs(currentAc);
    renderCabinStage(currentAc);
  }
  document.querySelector("[data-cabin-prev]").addEventListener("click", () => step(-1));
  document.querySelector("[data-cabin-next]").addEventListener("click", () => step(1));

  // hero stat count-up
  countUp();

  // reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  // first render
  selectAircraft(currentAc, false);
}

/* ---------- Hero stat count-up ---------- */
function countUp() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".hero-stats .num").forEach((el) => {
    const target = parseFloat(el.textContent);
    if (Number.isNaN(target) || reduce) return;
    const decimals = (el.textContent.split(".")[1] || "").length;
    const dur = 1100;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
