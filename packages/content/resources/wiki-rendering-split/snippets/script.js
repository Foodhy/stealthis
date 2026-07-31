// Load-race simulator: runs the CSR and SSR waterfalls concurrently on a
// shared clock, lighting metric lamps as each milestone is reached.
// Nav dots scroll manually (fragment navigation is blocked inside sandboxed
// srcdoc iframes) and a scrollspy tracks the current band.

const $ = (id) => document.getElementById(id);
const startBtn = $("sim-start");
const resetBtn = $("sim-reset");
const clock = $("sim-clock");

let timers = [];
let clockTimer = null;

function lamp(id, ms) {
  const el = $(id);
  el.classList.add("lit");
  el.querySelector(".ms").textContent = `${ms} ms`;
}

function msg(side, text) {
  $(`${side}-msg-txt`).textContent = text;
  $(`${side}-msg`).classList.add("show");
}

function clearMsg(side) {
  $(`${side}-msg`).classList.remove("show");
}

function showPieces(side) {
  $(`${side}-vp`).querySelectorAll(".piece").forEach((p, i) => {
    timers.push(setTimeout(() => p.classList.add("show"), i * 90));
  });
}

function at(ms, fn) {
  timers.push(setTimeout(fn, ms));
}

const DURATION = 2600; // total simulated window (1 real ms = 1 "network" ms)

function run() {
  reset();
  startBtn.disabled = true;

  const t0 = performance.now();
  clockTimer = setInterval(() => {
    const t = Math.min(DURATION, Math.round(performance.now() - t0));
    clock.textContent = `${t} ms`;
    if (t >= DURATION) clearInterval(clockTimer);
  }, 50);

  // ── CSR lane ──────────────────────────────
  msg("csr", "GET / …");
  at(100, () => {
    lamp("csr-ttfb", 100);
    msg("csr", "200 OK — empty shell + <script src=bundle.js>");
  });
  at(400, () => {
    msg("csr", "downloading bundle.js (280 KB)…");
    $("csr-jsbar-wrap").hidden = false;
  });
  for (let p = 1; p <= 10; p++) {
    at(400 + p * 140, () => {
      $("csr-jsbar").style.width = `${p * 10}%`;
    });
  }
  at(1850, () => {
    $("csr-jsbar-wrap").hidden = true;
    $("csr-spinner").hidden = false;
    msg("csr", "app booted — fetching /api/products…");
  });
  at(2550, () => {
    $("csr-spinner").hidden = true;
    clearMsg("csr");
    showPieces("csr");
    lamp("csr-fcp", 2600);
    lamp("csr-tti", 2600);
  });

  // ── SSR lane ──────────────────────────────
  msg("ssr", "GET / … server fetching data + rendering…");
  at(400, () => {
    lamp("ssr-ttfb", 400);
    msg("ssr", "200 OK — full HTML streaming in");
  });
  at(520, () => {
    clearMsg("ssr");
    showPieces("ssr");
    lamp("ssr-fcp", 550);
  });
  at(900, () => msg("ssr", "downloading bundle.js in background…"));
  at(1350, () => {
    clearMsg("ssr");
    const vp = $("ssr-vp");
    vp.classList.remove("hydrate-flash");
    void vp.offsetWidth; // restart the flash animation
    vp.classList.add("hydrate-flash");
    lamp("ssr-tti", 1400);
  });

  at(DURATION, () => {
    startBtn.disabled = false;
    startBtn.textContent = "▶ RUN IT AGAIN";
  });
}

function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  if (clockTimer) clearInterval(clockTimer);
  clock.textContent = "0 ms";
  startBtn.disabled = false;
  ["csr", "ssr"].forEach((side) => {
    $(`${side}-vp`).querySelectorAll(".piece").forEach((p) => p.classList.remove("show"));
    $(`${side}-vp`).classList.remove("hydrate-flash");
    msg(side, "idle — press simulate");
  });
  $("csr-jsbar-wrap").hidden = true;
  $("csr-jsbar").style.width = "0";
  $("csr-spinner").hidden = true;
  document.querySelectorAll(".lamp").forEach((l) => {
    l.classList.remove("lit");
    l.querySelector(".ms").textContent = "—";
  });
}

startBtn.addEventListener("click", run);
resetBtn.addEventListener("click", () => {
  reset();
  startBtn.textContent = "▶ SIMULATE PAGE LOAD";
});
reset();

// ── nav dots + scrollspy ────────────────────
const dotLinks = Array.from(document.querySelectorAll('.topbar .dots a[href^="#"]'));
dotLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
const bands = dotLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const idx = bands.indexOf(entry.target);
      dotLinks.forEach((a, i) => a.classList.toggle("current", i === idx));
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);
bands.forEach((b) => spy.observe(b));
