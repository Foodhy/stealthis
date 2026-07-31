/* ---------- Toast helper ---------- */
const toastEl = document.getElementById("toast");
let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

/* ---------- Repairability dial + criteria bars ---------- */
const SCORE = 7;
const CIRC = 2 * Math.PI * 66; // dial circumference (~414.7)
const dialValue = document.getElementById("dial-value");
const dialNum = document.getElementById("dial-num");

function animateDial() {
  dialValue.style.strokeDashoffset = String(CIRC * (1 - SCORE / 10));
  const start = performance.now();
  const DUR = 1100;
  function tick(now) {
    const t = Math.min((now - start) / DUR, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    dialNum.textContent = String(Math.round(eased * SCORE));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  document.querySelectorAll(".crit-fill").forEach((bar, i) => {
    const score = Number(bar.dataset.score) || 0;
    setTimeout(() => { bar.style.width = score * 10 + "%"; }, 150 + i * 120);
  });
}

const scoreCard = document.querySelector(".score-card");
const dialObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateDial();
      dialObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
dialObserver.observe(scoreCard);

/* ---------- Exploded view ---------- */
const LAYERS = [
  { id: "grille", el: document.getElementById("layer-grille"), collapsed: 128, exploded: 60 },
  { id: "driver", el: document.getElementById("layer-driver"), collapsed: 160, exploded: 180 },
  { id: "pcb", el: document.getElementById("layer-pcb"), collapsed: 190, exploded: 300 },
  { id: "battery", el: document.getElementById("layer-battery"), collapsed: 222, exploded: 420 },
  { id: "shell", el: document.getElementById("layer-shell"), collapsed: 256, exploded: 540 },
];

const DETAILS = {
  grille: {
    tag: "E1",
    title: "Fabric grille + LED ring",
    desc: "Acoustic fabric sleeve over a polycarbonate frame, with the halo LED diffuser seated on four rubber posts. No fasteners at this stage.",
    parts: [
      { no: "GR-88F", desc: "Acoustic fabric sleeve, charcoal weave" },
      { no: "DF-HALO2", desc: "LED diffuser ring, milky PC" },
      { no: "LED-24RGB", desc: "24× side-fire RGB LEDs on flex" },
    ],
    conns: [
      { no: "ZIF-12", desc: "12-pin ZIF, halo flex → main PCB" },
    ],
    adhesive: { level: "warn", text: "<strong>No adhesive.</strong> The sleeve is friction-fit — roll it off from the bottom hem. Pulling straight up shears the diffuser posts." },
  },
  driver: {
    tag: "E2",
    title: "40 mm full-range driver",
    desc: "Neodymium full-range driver in a sealed basket, sharing its bracket with the 3-mic far-field array. Held by four T6 Torx screws.",
    parts: [
      { no: "DRV-40N", desc: "40 mm neodymium driver, 4 Ω / 5 W" },
      { no: "BRK-A1", desc: "Glass-filled nylon bracket" },
      { no: "MEMS-VA4 ×3", desc: "Sonaria digital MEMS mic array" },
    ],
    conns: [
      { no: "JST-SH 2P", desc: "Voice-coil leads → amp output" },
      { no: "FLEX-MIC3", desc: "0.3 mm mic flex, folded twice" },
    ],
    adhesive: { level: "warn", text: "<strong>Light tack only.</strong> A foam gasket seals the basket rim — it survives about three openings before it stops sealing." },
  },
  pcb: {
    tag: "E3",
    title: "Main logic board",
    desc: "Single 6-layer board carrying the SoC, radio, amp and power stages. Three brass standoffs, one T6 at the antenna corner, RF shield over U1/U2.",
    parts: [
      { no: "KMX-4410A", desc: "Quad-core SoC under soldered shield" },
      { no: "WFB-6E", desc: "Wi-Fi 6 / BT 5.3 combo module" },
      { no: "AMP-D23L", desc: "Class-D amplifier, 5 W" },
      { no: "PMC-330", desc: "PMIC + linear charger" },
    ],
    conns: [
      { no: "JST-PH 2P", desc: "Battery input — disconnect FIRST" },
      { no: "ZIF-12", desc: "Halo LED flex latch" },
      { no: "USB-C 16P", desc: "Board-mounted power inlet" },
    ],
    adhesive: { level: "danger", text: "<strong>Live circuits.</strong> No glue here, but the board is powered until the battery lead is pulled. Ground yourself; the RF shield edges are sharp." },
  },
  battery: {
    tag: "E4",
    title: "Li-Po battery pack",
    desc: "Custom 3.7 V / 1.4 Ah pouch cell with an integrated protection board, seated in a kraft-lined tray on two stretch-release tabs.",
    parts: [
      { no: "BAT-14LP", desc: "Li-Po pouch, 3.7 V 1.4 Ah / 5.2 Wh" },
      { no: "BMS-1S2A", desc: "1S protection PCB, 2 A cutoff" },
    ],
    conns: [
      { no: "JST-PH 2P", desc: "Pack lead → main board" },
      { no: "NTC-10K", desc: "Thermistor bonded to pouch face" },
    ],
    adhesive: { level: "danger", text: "<strong>Stretch-release tabs ×2.</strong> Pull slowly at a shallow angle (~15 cm of stretch each). If one snaps: 90% isopropyl, plastic card, patience. Never pry with metal." },
  },
  shell: {
    tag: "E5",
    title: "Base shell + port block",
    desc: "Injection-moulded ABS base with a silicone foot, USB-C cutout and the passive radiator chamber moulded into the floor.",
    parts: [
      { no: "SHL-ABS7", desc: "ABS lower housing, textured" },
      { no: "RAD-P52", desc: "52 mm passive radiator, glued" },
      { no: "FT-SIL1", desc: "Silicone anti-slip foot ring" },
    ],
    conns: [
      { no: "NONE", desc: "No electrical connections in the shell" },
    ],
    adhesive: { level: "warn", text: "<strong>Perimeter glue on the radiator.</strong> The passive radiator is bonded in — heat mat at 70 °C for 3 minutes before picking around the rim." },
  },
};

const stage = document.getElementById("stage");
const range = document.getElementById("explode-range");
const readout = document.getElementById("explode-readout");

function applyExplode(pct) {
  const t = pct / 100;
  LAYERS.forEach((layer) => {
    const y = layer.collapsed + (layer.exploded - layer.collapsed) * t;
    layer.el.setAttribute("transform", `translate(0 ${y.toFixed(1)})`);
  });
  stage.classList.toggle("exploded-on", t > 0.3);
  readout.textContent = `SEPARATION ${pct}%`;
}

range.addEventListener("input", () => applyExplode(Number(range.value)));
applyExplode(0);

/* Auto-explode gently the first time the stage scrolls into view */
let autoPlayed = false;
const stageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !autoPlayed) {
      autoPlayed = true;
      stageObserver.disconnect();
      const start = performance.now();
      const DUR = 1400;
      function step(now) {
        const t = Math.min((now - start) / DUR, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = Math.round(eased * 65);
        range.value = String(v);
        applyExplode(v);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  });
}, { threshold: 0.5 });
stageObserver.observe(stage);

/* ---------- Detail card ---------- */
const detailTag = document.getElementById("detail-tag");
const detailTitle = document.getElementById("detail-title");
const detailDesc = document.getElementById("detail-desc");
const detailBody = document.getElementById("detail-body");
const partList = document.getElementById("part-list");
const connList = document.getElementById("conn-list");
const adhesiveNote = document.getElementById("adhesive-note");
const chips = Array.from(document.querySelectorAll(".layer-chip"));

function renderList(ul, items) {
  ul.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    const no = document.createElement("span");
    no.className = "part-no";
    no.textContent = item.no;
    const desc = document.createElement("span");
    desc.className = "part-desc";
    desc.textContent = item.desc;
    li.append(no, desc);
    ul.appendChild(li);
  });
}

function selectLayer(id, opts = {}) {
  const data = DETAILS[id];
  if (!data) return;
  detailTag.textContent = data.tag;
  detailTitle.textContent = data.title;
  detailDesc.textContent = data.desc;
  renderList(partList, data.parts);
  renderList(connList, data.conns);
  adhesiveNote.className = "adhesive-note" + (data.adhesive.level === "danger" ? " danger" : "");
  adhesiveNote.innerHTML = data.adhesive.text;
  detailBody.hidden = false;

  LAYERS.forEach((l) => l.el.classList.toggle("selected", l.id === id));
  chips.forEach((c) => c.classList.toggle("active", c.dataset.layer === id));

  if (Number(range.value) < 25) {
    range.value = "60";
    applyExplode(60);
  }
  if (!opts.silent) toast(`${data.tag} — ${data.title}`);
}

LAYERS.forEach((layer) => {
  layer.el.addEventListener("click", () => selectLayer(layer.id));
  layer.el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectLayer(layer.id);
    }
  });
});
chips.forEach((chip) => {
  chip.addEventListener("click", () => selectLayer(chip.dataset.layer));
});

/* ---------- Print button ---------- */
document.getElementById("print-btn").addEventListener("click", () => {
  toast("BENCH SHEET QUEUED — CHECK THE PLOTTER");
});

/* ---------- Chapter reveal on scroll ---------- */
const chapterEls = document.querySelectorAll(".chapter");
chapterEls.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(16px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
});
const chapterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      chapterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
chapterEls.forEach((el) => chapterObserver.observe(el));
