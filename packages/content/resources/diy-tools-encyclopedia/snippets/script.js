/* DIY — Tool Encyclopedia
   Vanilla JS: renders the A–Z tool wiki, live search with highlight,
   category filters, alphabet scrollspy and a Tool-of-the-day panel. */

(function () {
  "use strict";

  /* ---------- SVG line-art icons (48x48, stroke-based) ---------- */
  const svg = (inner) =>
    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    inner +
    "</svg>";

  const ICONS = {
    grinder: svg(
      '<circle cx="15" cy="24" r="9"/><circle cx="15" cy="24" r="3"/><path d="M23 20h16a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H23"/><path d="M34 20v-4M38 20v-4"/>'
    ),
    vise: svg(
      '<path d="M8 16h32M8 30h32"/><path d="M12 16v14M36 16v14"/><path d="M8 23h8M32 23h8"/><circle cx="24" cy="23" r="3"/><path d="M16 36h16M20 30v6M28 30v6"/>'
    ),
    breadboard: svg(
      '<rect x="8" y="10" width="32" height="28" rx="3"/><path d="M14 16h.01M20 16h.01M26 16h.01M32 16h.01M14 22h.01M20 22h.01M26 22h.01M32 22h.01M14 28h.01M20 28h.01M26 28h.01M32 28h.01M14 34h.01M20 34h.01M26 34h.01M32 34h.01"/>'
    ),
    clamp: svg(
      '<path d="M14 8v32"/><path d="M14 10h20v8h-8M14 38h20v-8h-8"/><path d="M26 18v12"/><path d="M34 12h6M34 36h6"/>'
    ),
    caliper: svg(
      '<path d="M6 14h36v8H6z"/><path d="M12 22v16M12 38h6v-10M32 22v10h6"/><path d="M14 18h.01M20 18h.01M26 18h.01M32 18h.01"/>'
    ),
    circsaw: svg(
      '<circle cx="20" cy="28" r="11"/><circle cx="20" cy="28" r="3"/><path d="M20 17l3-3 3 3 3-2 2 3"/><path d="M28 14h10v8h-6"/><path d="M6 39h36"/>'
    ),
    drillpress: svg(
      '<path d="M12 8h20"/><path d="M16 8v6h12V8"/><path d="M22 14h4v10h-4z"/><path d="M24 24v6"/><path d="M14 34h20v4H14z"/><path d="M24 8V4"/><path d="M34 14l6 4"/>'
    ),
    heatgun: svg(
      '<rect x="8" y="16" width="22" height="10" rx="4"/><path d="M30 18h6M30 24h6"/><path d="M14 26v12h8V26"/><path d="M40 16v10M44 18v6"/>'
    ),
    hacksaw: svg(
      '<path d="M8 14h30a4 4 0 0 1 4 4v6"/><path d="M8 14v10a4 4 0 0 0 4 4h4"/><path d="M16 28v6h6"/><path d="M20 24h22"/><path d="M24 24l2 3 3-3 3 3 3-3 3 3"/>'
    ),
    jigsaw: svg(
      '<path d="M10 14h20a6 6 0 0 1 6 6v4H14a4 4 0 0 1-4-4z"/><path d="M14 14v-4h10v4"/><path d="M22 24v14"/><path d="M22 30l3 2-3 2 3 2"/><path d="M8 40h24"/>'
    ),
    laserlevel: svg(
      '<rect x="14" y="14" width="20" height="16" rx="3"/><circle cx="24" cy="22" r="4"/><path d="M2 22h8M38 22h8"/><path d="M20 30l-4 10M28 30l4 10"/>'
    ),
    multimeter: svg(
      '<rect x="12" y="6" width="24" height="34" rx="4"/><rect x="16" y="10" width="16" height="8" rx="1"/><circle cx="24" cy="28" r="6"/><path d="M24 28l3-4"/><path d="M18 40v4M30 40v4"/>'
    ),
    oscilloscope: svg(
      '<rect x="6" y="10" width="36" height="24" rx="3"/><path d="M10 24h5l3-8 4 14 4-10 3 4h9"/><path d="M16 40h16M20 34v6M28 34v6"/>'
    ),
    soldering: svg(
      '<path d="M6 42l10-10"/><path d="M16 32l6-6a4 4 0 0 1 5-1l3-3"/><path d="M28 24l8-8"/><path d="M34 8l6 6-4 4-6-6z"/><path d="M40 30c0-3 3-3 3-6"/>'
    ),
    studfinder: svg(
      '<rect x="16" y="6" width="16" height="34" rx="6"/><circle cx="24" cy="16" r="4"/><path d="M24 26v8"/><path d="M20 30h8"/><path d="M8 14v20M40 14v20"/>'
    ),
    tape: svg(
      '<rect x="8" y="12" width="26" height="22" rx="6"/><circle cx="21" cy="23" r="6"/><circle cx="21" cy="23" r="1.5"/><path d="M34 30h8v6h-10"/><path d="M42 30v-3"/>'
    ),
    torque: svg(
      '<circle cx="12" cy="16" r="7"/><circle cx="12" cy="16" r="2.5"/><path d="M17 21l22 18"/><path d="M36 36l4 3-2 4"/><path d="M22 22l3-3"/>'
    ),
    wirestripper: svg(
      '<path d="M24 10a6 6 0 1 1-6 8"/><path d="M20 20L10 40"/><path d="M28 20l10 20"/><path d="M22 14h4"/><path d="M14 32h6M28 32h6"/>'
    ),
  };

  /* ---------- Tool database (fictional shelf refs & pricing) ---------- */
  const TOOLS = [
    {
      ref: "T-01", name: "Angle Grinder", cat: "power", icon: "grinder",
      def: "Handheld spinning disc that cuts, grinds and polishes metal, tile and masonry depending on the wheel you mount.",
      uses: ["cutting rebar", "rust removal", "sharpening"],
      safety: "Sparks fly far — full face shield, gloves, and never remove the guard.",
      alt: "For light rust, a wire-brush drill attachment gets you 80% there.",
      facts: { weight: "1.8 kg", price: "$35–120", skill: "INTERMEDIATE" },
    },
    {
      ref: "T-02", name: "Bar Clamp", cat: "hand", icon: "clamp",
      def: "Sliding-jaw clamp on a steel bar that squeezes glue-ups and holds workpieces still while you cut or drill.",
      uses: ["glue-ups", "holding stock", "assembly"],
      alt: "Ratchet straps or heavy books can stand in for panel glue-ups.",
      facts: { weight: "0.6 kg", price: "$8–30", skill: "BEGINNER" },
    },
    {
      ref: "T-03", name: "Bench Vise", cat: "hand", icon: "vise",
      def: "Jaw-and-screw workholder bolted to the bench; the third hand every filing, sawing and bending job wants.",
      uses: ["filing", "metal bending", "sawing support"],
      alt: "A pair of bar clamps to the bench edge covers most light jobs.",
      facts: { weight: "9.5 kg", price: "$40–150", skill: "BEGINNER" },
    },
    {
      ref: "T-04", name: "Breadboard", cat: "electronics", icon: "breadboard",
      def: "Solderless prototyping board — push components and jumper wires into spring clips to test a circuit in minutes.",
      uses: ["prototyping", "learning circuits", "sensor tests"],
      alt: "Alligator-clip leads work for very small circuits (3–4 parts).",
      facts: { weight: "85 g", price: "$4–12", skill: "BEGINNER" },
    },
    {
      ref: "T-05", name: "Caliper (Digital)", cat: "measuring", icon: "caliper",
      def: "Sliding jaws with an LCD readout that measure outside, inside and depth dimensions to 0.01 mm.",
      uses: ["part fitting", "3D-print checks", "bolt sizing"],
      alt: "A steel rule plus patience — accept ±0.5 mm instead of ±0.01.",
      facts: { weight: "180 g", price: "$15–60", skill: "BEGINNER" },
    },
    {
      ref: "T-06", name: "Circular Saw", cat: "power", icon: "circsaw",
      def: "Handheld saw with a spinning toothed blade; the fastest way to rip sheet goods and crosscut lumber on site.",
      uses: ["ripping plywood", "crosscuts", "deck boards"],
      safety: "Set blade depth to material + 5 mm and keep the cord behind the cut line.",
      alt: "No track saw? Clamp a straight board as a fence for clean rips.",
      facts: { weight: "3.6 kg", price: "$50–180", skill: "INTERMEDIATE" },
    },
    {
      ref: "T-07", name: "Drill Press", cat: "power", icon: "drillpress",
      def: "Bench-mounted drill with a lever-fed spindle — perfectly perpendicular holes at repeatable depths.",
      uses: ["square holes", "metal drilling", "repeat depth"],
      safety: "Clamp the workpiece — spinning bits grab loose stock and whip it around.",
      alt: "No drill press? A drill guide jig keeps a hand drill at true 90°.",
      facts: { weight: "22 kg", price: "$120–400", skill: "INTERMEDIATE" },
    },
    {
      ref: "T-08", name: "Hacksaw", cat: "hand", icon: "hacksaw",
      def: "Fine-toothed frame saw for metal — bolts, pipe, threaded rod and the occasional stubborn zip tie.",
      uses: ["cutting bolts", "pipe trimming", "plastic stock"],
      alt: "A rotary tool with a cutoff wheel is faster on small bolts.",
      facts: { weight: "0.5 kg", price: "$8–25", skill: "BEGINNER" },
    },
    {
      ref: "T-09", name: "Heat Gun", cat: "power", icon: "heatgun",
      def: "Electric hot-air blower (up to ~600 °C) for shrinking tube, stripping paint, and softening adhesives.",
      uses: ["heat-shrink", "paint stripping", "bending PVC"],
      safety: "The nozzle stays scorching for minutes after switch-off — park it on its stand.",
      alt: "A hair dryer handles heat-shrink tube, not paint or PVC.",
      facts: { weight: "0.9 kg", price: "$20–80", skill: "BEGINNER" },
    },
    {
      ref: "T-10", name: "Jigsaw", cat: "power", icon: "jigsaw",
      def: "Reciprocating narrow blade that steers through curves and cutouts a circular saw can't touch.",
      uses: ["curved cuts", "sink cutouts", "scrollwork"],
      safety: "Let the blade stop fully before lifting it out of the kerf.",
      alt: "A coping saw does small curves by hand — slower, tighter radius.",
      facts: { weight: "2.2 kg", price: "$40–140", skill: "BEGINNER" },
    },
    {
      ref: "T-11", name: "Laser Level", cat: "measuring", icon: "laserlevel",
      def: "Self-leveling laser that throws dead-level horizontal and plumb vertical lines across the room.",
      uses: ["shelf rows", "tile layout", "gallery walls"],
      alt: "A spirit level + chalk line covers single-wall jobs fine.",
      facts: { weight: "0.5 kg", price: "$30–150", skill: "BEGINNER" },
    },
    {
      ref: "T-12", name: "Multimeter", cat: "electronics", icon: "multimeter",
      def: "The electrical Swiss army knife — measures voltage, current, resistance and continuity on one dial.",
      uses: ["continuity", "battery checks", "fault finding"],
      safety: "Never measure resistance on a live circuit — kill the power first.",
      alt: "A simple voltage tester pen confirms live/dead, nothing more.",
      facts: { weight: "320 g", price: "$15–90", skill: "BEGINNER" },
    },
    {
      ref: "T-13", name: "Oscilloscope", cat: "electronics", icon: "oscilloscope",
      def: "Draws voltage over time on a screen, revealing signals, noise and glitches a multimeter averages away.",
      uses: ["signal debug", "PWM checks", "audio circuits"],
      alt: "A $25 USB logic analyzer covers digital-only debugging.",
      facts: { weight: "2.8 kg", price: "$250–900", skill: "ADVANCED" },
    },
    {
      ref: "T-14", name: "Soldering Iron", cat: "electronics", icon: "soldering",
      def: "Temperature-controlled heated tip that fuses component leads to boards with molten solder.",
      uses: ["PCB assembly", "wire joints", "kit builds"],
      safety: "350 °C tip, ventilate fumes, and always return it to the stand — never the bench.",
      alt: "For wire-to-wire only, crimp connectors need zero heat.",
      facts: { weight: "450 g", price: "$20–110", skill: "INTERMEDIATE" },
    },
    {
      ref: "T-15", name: "Stud Finder", cat: "measuring", icon: "studfinder",
      def: "Handheld sensor that locates framing studs (and warns about live wires) behind drywall before you drill.",
      uses: ["TV mounts", "shelf anchors", "avoiding wires"],
      alt: "Knock test + a strong magnet finds drywall screws in a pinch.",
      facts: { weight: "160 g", price: "$12–50", skill: "BEGINNER" },
    },
    {
      ref: "T-16", name: "Tape Measure", cat: "measuring", icon: "tape",
      def: "Retracting steel blade with a floating hook that self-corrects for inside and outside measurements.",
      uses: ["layout", "lumber shopping", "room plans"],
      alt: "A folding rule is stiffer for overhead solo measuring.",
      facts: { weight: "280 g", price: "$6–25", skill: "BEGINNER" },
    },
    {
      ref: "T-17", name: "Torque Wrench", cat: "hand", icon: "torque",
      def: "Click-stop wrench that tightens fasteners to an exact newton-metre spec — no more snapped bolts.",
      uses: ["bike builds", "engine work", "spark plugs"],
      safety: "Wind it back to zero after use or the spring loses calibration.",
      alt: "Hand-tight plus a quarter turn works for non-critical fasteners.",
      facts: { weight: "1.4 kg", price: "$30–130", skill: "INTERMEDIATE" },
    },
    {
      ref: "T-18", name: "Wire Stripper", cat: "electronics", icon: "wirestripper",
      def: "Gauged jaws that slice insulation and pull it clean off without nicking the copper strands inside.",
      uses: ["harness work", "lamp rewiring", "speaker wire"],
      alt: "A careful knife roll works — score, flex, slide. Practice on scrap.",
      facts: { weight: "140 g", price: "$8–35", skill: "BEGINNER" },
    },
  ];

  /* ---------- State ---------- */
  let query = "";
  let activeCat = "all";
  let totdIndex = new Date().getDate() % TOOLS.length;

  /* ---------- DOM refs ---------- */
  const $ = (sel) => document.querySelector(sel);
  const entriesEl = $("#entries");
  const alphaBar = $("#alphaBar");
  const noResults = $("#noResults");
  const searchInput = $("#search");
  const clearBtn = $("#clearSearch");
  const toastEl = $("#toast");

  /* ---------- Toast helper ---------- */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
  }

  /* ---------- Utils ---------- */
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function highlight(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const rx = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return safe.replace(rx, "<mark>$1</mark>");
  }

  const CAT_LABEL = {
    hand: "Hand", power: "Power", electronics: "Electronics", measuring: "Measuring",
  };

  function matches(tool) {
    if (activeCat !== "all" && tool.cat !== activeCat) return false;
    if (!query) return true;
    const hay = (
      tool.name + " " + tool.def + " " + tool.uses.join(" ") + " " +
      CAT_LABEL[tool.cat] + " " + tool.ref + " " + (tool.alt || "")
    ).toLowerCase();
    return hay.includes(query);
  }

  /* ---------- Render entries grouped by letter ---------- */
  function cardHTML(tool) {
    const q = query;
    return (
      '<article class="tool-card" id="tool-' + tool.ref + '" data-cat="' + tool.cat + '">' +
      '<div class="tool-card-top">' +
      '<div class="tool-art">' + ICONS[tool.icon] + "</div>" +
      '<div class="tool-title-wrap">' +
      '<div class="tool-badges">' +
      '<span class="tool-ref">' + tool.ref + "</span>" +
      '<span class="tool-cat" data-cat="' + tool.cat + '">' + CAT_LABEL[tool.cat] + "</span>" +
      "</div>" +
      '<h3 class="tool-name">' + highlight(tool.name, q) + "</h3>" +
      "</div></div>" +
      '<p class="tool-def">' + highlight(tool.def, q) + "</p>" +
      '<ul class="use-chips" aria-label="Used for">' +
      tool.uses.map((u) => "<li>" + highlight(u, q) + "</li>").join("") +
      "</ul>" +
      (tool.safety
        ? '<div class="safety-strip" role="note">' +
          '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5h.01"/></svg>' +
          "<span><strong>Safety:</strong> " + esc(tool.safety) + "</span></div>"
        : "") +
      '<p class="alt-line"><span class="alt-arrow">No tool? →</span> <strong>' +
      esc(tool.alt) + "</strong></p>" +
      "</article>"
    );
  }

  function render() {
    const visible = TOOLS.filter(matches);
    const byLetter = new Map();
    visible.forEach((t) => {
      const L = t.name[0].toUpperCase();
      if (!byLetter.has(L)) byLetter.set(L, []);
      byLetter.get(L).push(t);
    });

    // remove old sections
    entriesEl.querySelectorAll(".letter-section").forEach((n) => n.remove());

    const frag = document.createDocumentFragment();
    [...byLetter.keys()].sort().forEach((L) => {
      const tools = byLetter.get(L);
      const sec = document.createElement("section");
      sec.className = "letter-section";
      sec.id = "letter-" + L;
      sec.setAttribute("aria-label", "Tools starting with " + L);
      sec.innerHTML =
        '<div class="letter-head">' +
        '<span class="letter-glyph">' + L + "</span>" +
        '<span class="letter-rule"></span>' +
        '<span class="letter-count">' + String(tools.length).padStart(2, "0") + " ENTR" +
        (tools.length === 1 ? "Y" : "IES") + "</span></div>" +
        '<div class="card-grid">' + tools.map(cardHTML).join("") + "</div>";
      frag.appendChild(sec);
    });
    entriesEl.insertBefore(frag, noResults);

    noResults.hidden = visible.length > 0;

    // stats
    $("#statCount").textContent = visible.length;
    $("#statLetters").textContent = byLetter.size;

    renderAlphaBar(byLetter);
    observeSections();
  }

  /* ---------- Alphabet index bar ---------- */
  function renderAlphaBar(byLetter) {
    alphaBar.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
      const L = String.fromCharCode(i);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "alpha-btn";
      btn.textContent = L;
      const active = byLetter.has(L);
      btn.disabled = !active;
      if (active) {
        btn.setAttribute("aria-label", "Jump to letter " + L);
        btn.addEventListener("click", () => {
          document.getElementById("letter-" + L)
            .scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      alphaBar.appendChild(btn);
    }
  }

  /* ---------- Scrollspy: highlight current letter ---------- */
  let observer;
  function observeSections() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (ents) => {
        ents.forEach((e) => {
          if (!e.isIntersecting) return;
          const L = e.target.id.replace("letter-", "");
          alphaBar.querySelectorAll(".alpha-btn").forEach((b) => {
            b.classList.toggle("is-current", b.textContent === L);
          });
        });
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    entriesEl.querySelectorAll(".letter-section").forEach((s) => observer.observe(s));
  }

  /* ---------- Search ---------- */
  let debounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      query = searchInput.value.trim().toLowerCase();
      clearBtn.hidden = !query;
      render();
    }, 120);
  });

  function resetSearch() {
    searchInput.value = "";
    query = "";
    clearBtn.hidden = true;
    render();
    searchInput.focus();
  }
  clearBtn.addEventListener("click", resetSearch);
  $("#resetSearch").addEventListener("click", () => {
    resetSearch();
    toast("SEARCH CLEARED — FULL SHELF RESTORED");
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchInput.value) resetSearch();
  });

  /* ---------- Category filters ---------- */
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      activeCat = btn.dataset.cat;
      render();
      if (activeCat !== "all") {
        const n = TOOLS.filter((t) => t.cat === activeCat).length;
        toast("FILTER: " + activeCat.toUpperCase() + " TOOLS (" + n + ")");
      }
    });
  });

  /* ---------- Tool of the day ---------- */
  function renderTotd() {
    const t = TOOLS[totdIndex];
    $("#totdArt").innerHTML = ICONS[t.icon];
    $("#totdName").textContent = t.name;
    $("#totdDef").textContent = t.def;
    $("#totdWeight").textContent = t.facts.weight;
    $("#totdPrice").textContent = t.facts.price;
    $("#totdSkill").textContent = t.facts.skill;
    $("#totdRef").textContent = t.ref + " / " + t.cat.toUpperCase();
  }

  $("#shuffleTotd").addEventListener("click", () => {
    totdIndex = (totdIndex + 1 + Math.floor(Math.random() * (TOOLS.length - 1))) % TOOLS.length;
    renderTotd();
    toast("TOOL OF THE DAY → " + TOOLS[totdIndex].name.toUpperCase());
  });

  $("#totdJump").addEventListener("click", () => {
    const t = TOOLS[totdIndex];
    // clear filters so the entry is guaranteed visible
    if (query || activeCat !== "all") {
      searchInput.value = "";
      query = "";
      clearBtn.hidden = true;
      activeCat = "all";
      document.querySelectorAll(".cat-btn").forEach((b) =>
        b.classList.toggle("is-on", b.dataset.cat === "all"));
      render();
    }
    const card = document.getElementById("tool-" + t.ref);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("is-flash");
      setTimeout(() => card.classList.remove("is-flash"), 1600);
    }
  });

  /* ---------- Init ---------- */
  render();
  renderTotd();
})();
