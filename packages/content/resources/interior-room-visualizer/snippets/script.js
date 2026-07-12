(function () {
  "use strict";

  /* ---------- palette data ---------- */
  var PALETTES = {
    wall: [
      { name: "Plaster", hex: "#e9e2d6", hex2: "#ddd4c4" },
      { name: "Sage", hex: "#c6cdb4", hex2: "#b1ba9c" },
      { name: "Clay Wash", hex: "#e3c9b6", hex2: "#d3b39c" },
      { name: "Fog", hex: "#d6d4cf", hex2: "#c2c0ba" },
      { name: "Walnut Deep", hex: "#6f5540", hex2: "#5c4433" }
    ],
    floor: [
      { name: "Pale Oak", hex: "#d8c3a0", hex2: "#c3a878" },
      { name: "Walnut", hex: "#8c6a4f", hex2: "#6f5038" },
      { name: "Ash", hex: "#cfc7bb", hex2: "#b3a99a" },
      { name: "Terrazzo", hex: "#e0d8cc", hex2: "#cabfae" },
      { name: "Ebony", hex: "#4a4038", hex2: "#332c26" }
    ],
    accent: [
      { name: "Terracotta", hex: "#c47b56", hex2: "#a8613e" },
      { name: "Olive", hex: "#9caf88", hex2: "#7f9268" },
      { name: "Ochre", hex: "#cf9c4d", hex2: "#b3822f" },
      { name: "Rust", hex: "#a8543a", hex2: "#8a3f28" },
      { name: "Slate Blue", hex: "#7d94a6", hex2: "#607889" }
    ]
  };

  var MATERIALS = [
    {
      name: "Bouclé", swatch: "#cbb79c",
      hex: "#cbb79c", hex2: "#b6a084",
      tex: "repeating-radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0 2px, transparent 2px 5px)"
    },
    {
      name: "Linen", swatch: "#d9cdb8",
      hex: "#d9cdb8", hex2: "#c3b49b",
      tex: "repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 4px)"
    },
    {
      name: "Velvet", swatch: "#7d5c6d",
      hex: "#7d5c6d", hex2: "#5f4351",
      tex: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.15))"
    },
    {
      name: "Leather", swatch: "#8a5a3c",
      hex: "#8a5a3c", hex2: "#6c4429",
      tex: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.16) 0 30%, transparent 60%)"
    }
  ];

  var DAY_STOPS = [
    { max: 25, name: "Overcast", rgb: "180, 200, 224", amt: 0.28, tag: "cool" },
    { max: 55, name: "Daylight", rgb: "236, 232, 214", amt: 0.36, tag: "golden" },
    { max: 80, name: "Golden", rgb: "255, 214, 160", amt: 0.5, tag: "golden" },
    { max: 101, name: "Sunset", rgb: "255, 176, 122", amt: 0.6, tag: "golden" }
  ];

  /* ---------- state ---------- */
  var state = {
    wall: 0, floor: 0, accent: 0, material: 0, daylight: 70
  };

  var root = document.documentElement;
  var saved = [];

  /* ---------- helpers ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }

  var liveEl = $("#live");
  function announce(msg) { liveEl.textContent = msg; }

  function copyHex(hex) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).then(
        function () { toast("Copied " + hex); },
        function () { toast(hex); }
      );
    } else {
      toast(hex);
    }
  }

  function dayStop(v) {
    for (var i = 0; i < DAY_STOPS.length; i++) {
      if (v < DAY_STOPS[i].max) return DAY_STOPS[i];
    }
    return DAY_STOPS[DAY_STOPS.length - 1];
  }

  /* ---------- render ---------- */
  function apply() {
    var w = PALETTES.wall[state.wall];
    var f = PALETTES.floor[state.floor];
    var a = PALETTES.accent[state.accent];
    var m = MATERIALS[state.material];
    var d = dayStop(state.daylight);

    root.style.setProperty("--wall", w.hex);
    root.style.setProperty("--wall-2", w.hex2);
    root.style.setProperty("--floor", f.hex);
    root.style.setProperty("--floor-2", f.hex2);
    root.style.setProperty("--accent", a.hex);
    root.style.setProperty("--sofa", m.hex);
    root.style.setProperty("--sofa-2", m.hex2);
    root.style.setProperty("--sofa-tex", m.tex);
    root.style.setProperty("--day", d.amt);
    root.style.setProperty("--daycolor", d.rgb);

    $("#room").setAttribute("data-daylight", d.tag);

    // current labels
    $("#cur-wall").textContent = w.name;
    $("#cur-floor").textContent = f.name;
    $("#cur-accent").textContent = a.name;
    $("#cur-material").textContent = m.name;
    $("#cur-light").textContent = d.name;

    // spec
    setSpec("wall", w.hex, w.name);
    setSpec("floor", f.hex, f.name);
    setSpec("accent", a.hex, a.name);
    setSpec("material", m.hex, m.name);

    // pressed states
    updatePressed("wall", state.wall);
    updatePressed("floor", state.floor);
    updatePressed("accent", state.accent);
    updateMatPressed();
  }

  function setSpec(key, hex, name) {
    var dd = document.querySelector('[data-spec="' + key + '"]');
    dd.innerHTML = "";
    var sw = document.createElement("span");
    sw.className = "sw";
    sw.style.background = hex;
    var label = document.createElement("span");
    label.textContent = name;
    var hx = document.createElement("span");
    hx.className = "hex";
    hx.textContent = hex.toUpperCase();
    dd.appendChild(sw);
    dd.appendChild(label);
    dd.appendChild(hx);
  }

  function updatePressed(group, idx) {
    var btns = document.querySelectorAll('#sw-' + group + ' .swatch');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", i === idx ? "true" : "false");
    }
  }
  function updateMatPressed() {
    var btns = document.querySelectorAll('#sw-material .mat');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", i === state.material ? "true" : "false");
    }
  }

  /* ---------- build controls ---------- */
  function buildSwatches(group) {
    var host = $("#sw-" + group);
    PALETTES[group].forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "swatch";
      b.style.background = "linear-gradient(180deg, " + p.hex + ", " + p.hex2 + ")";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", group + " " + p.name + " " + p.hex);
      b.title = p.name + " · " + p.hex.toUpperCase() + " (click to copy)";
      b.addEventListener("click", function () {
        if (state[group] === i) {
          copyHex(p.hex.toUpperCase());
          return;
        }
        state[group] = i;
        apply();
        announce(group + " set to " + p.name);
      });
      host.appendChild(b);
    });
  }

  function buildMaterials() {
    var host = $("#sw-material");
    MATERIALS.forEach(function (m, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mat";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "Upholstery " + m.name);
      var tex = document.createElement("span");
      tex.className = "tex";
      tex.style.background = m.tex + ", linear-gradient(180deg," + m.hex + "," + m.hex2 + ")";
      var t = document.createElement("span");
      t.textContent = m.name;
      b.appendChild(tex);
      b.appendChild(t);
      b.addEventListener("click", function () {
        state.material = i;
        apply();
        announce("Upholstery set to " + m.name);
      });
      host.appendChild(b);
    });
  }

  /* ---------- saved looks ---------- */
  function schemeDots(s) {
    return [
      PALETTES.wall[s.wall].hex,
      PALETTES.floor[s.floor].hex,
      PALETTES.accent[s.accent].hex,
      MATERIALS[s.material].swatch
    ];
  }

  function renderChips() {
    var host = $("#chips");
    host.innerHTML = "";
    $("#empty").style.display = saved.length ? "none" : "";
    saved.forEach(function (item) {
      var li = document.createElement("li");
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.setAttribute("aria-label", "Restore look " + item.label);

      var dots = document.createElement("span");
      dots.className = "dots";
      schemeDots(item.scheme).forEach(function (c) {
        var d = document.createElement("span");
        d.style.background = c;
        dots.appendChild(d);
      });
      var name = document.createElement("span");
      name.textContent = item.label;
      chip.appendChild(dots);
      chip.appendChild(name);
      chip.addEventListener("click", function () {
        state.wall = item.scheme.wall;
        state.floor = item.scheme.floor;
        state.accent = item.scheme.accent;
        state.material = item.scheme.material;
        state.daylight = item.scheme.daylight;
        $("#daylight").value = item.scheme.daylight;
        apply();
        toast("Restored “" + item.label + "”");
        announce("Restored look " + item.label);
      });

      var x = document.createElement("button");
      x.type = "button";
      x.className = "chip-x";
      x.innerHTML = "&times;";
      x.setAttribute("aria-label", "Remove look " + item.label);
      x.addEventListener("click", function (e) {
        e.stopPropagation();
        saved = saved.filter(function (s) { return s.id !== item.id; });
        renderChips();
        toast("Removed look");
      });

      li.appendChild(chip);
      li.appendChild(x);
      host.appendChild(li);
    });
  }

  var seq = 0;
  function saveLook() {
    var label = PALETTES.wall[state.wall].name + " · " + PALETTES.accent[state.accent].name;
    saved.unshift({
      id: ++seq,
      label: label,
      scheme: {
        wall: state.wall, floor: state.floor, accent: state.accent,
        material: state.material, daylight: state.daylight
      }
    });
    if (saved.length > 8) saved.pop();
    renderChips();
    toast("Saved “" + label + "”");
    announce("Saved look " + label);
  }

  function shuffle() {
    state.wall = Math.floor(Math.random() * PALETTES.wall.length);
    state.floor = Math.floor(Math.random() * PALETTES.floor.length);
    state.accent = Math.floor(Math.random() * PALETTES.accent.length);
    state.material = Math.floor(Math.random() * MATERIALS.length);
    state.daylight = 30 + Math.floor(Math.random() * 65);
    $("#daylight").value = state.daylight;
    apply();
    toast("Fresh scheme rolled");
    announce("Random scheme applied");
  }

  /* ---------- init ---------- */
  buildSwatches("wall");
  buildSwatches("floor");
  buildSwatches("accent");
  buildMaterials();

  $("#daylight").addEventListener("input", function (e) {
    state.daylight = parseInt(e.target.value, 10);
    apply();
  });
  $("#save").addEventListener("click", saveLook);
  $("#shuffle").addEventListener("click", shuffle);

  // spec hex click-to-copy
  $("#spec").addEventListener("click", function (e) {
    var dd = e.target.closest("dd");
    if (!dd) return;
    var hx = dd.querySelector(".hex");
    if (hx) copyHex(hx.textContent);
  });

  // seed a couple of tasteful saved looks
  saved = [
    { id: ++seq, label: "Sage · Olive", scheme: { wall: 1, floor: 0, accent: 1, material: 0, daylight: 60 } },
    { id: ++seq, label: "Clay Wash · Terracotta", scheme: { wall: 2, floor: 1, accent: 0, material: 3, daylight: 78 } }
  ];

  apply();
  renderChips();
})();
