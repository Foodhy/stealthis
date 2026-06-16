/* ===== Storybook — Kid Profile + Avatar Picker ===== */
(function () {
  "use strict";

  var STORE_KEY = "stealthis.kidProfile.v1";

  /* ---------- option data ---------- */
  var SKINS = [
    { id: "porcelain", color: "#ffe0c4" },
    { id: "peach",     color: "#ffd0a8" },
    { id: "honey",     color: "#f0b07a" },
    { id: "caramel",   color: "#cf8f57" },
    { id: "cocoa",     color: "#a06a3c" },
    { id: "espresso",  color: "#6f4423" }
  ];

  var HAIR_COLORS = [
    { id: "blonde",    color: "#f4c95d" },
    { id: "ginger",    color: "#e07b39" },
    { id: "brown",     color: "#7a4a2b" },
    { id: "black",     color: "#2c2535" },
    { id: "bubblegum", color: "#ff6f9c" },
    { id: "mint",      color: "#5ec5d6" }
  ];

  var HAIR_STYLES = [
    { id: "short",   label: "Short",   emoji: "💇" },
    { id: "curly",   label: "Curly",   emoji: "🌀" },
    { id: "long",    label: "Long",    emoji: "💁" },
    { id: "buns",    label: "Buns",    emoji: "🎀" },
    { id: "spiky",   label: "Spiky",   emoji: "⚡" },
    { id: "bald",    label: "None",    emoji: "🥚" }
  ];

  var EYES = [
    { id: "happy",   label: "Happy",   emoji: "😄" },
    { id: "round",   label: "Round",   emoji: "👀" },
    { id: "wink",    label: "Wink",    emoji: "😉" },
    { id: "star",    label: "Stars",   emoji: "🤩" },
    { id: "sleepy",  label: "Sleepy",  emoji: "😌" }
  ];

  var ACCESSORIES = [
    { id: "none",    label: "None",    emoji: "🚫" },
    { id: "glasses", label: "Glasses", emoji: "🤓" },
    { id: "bow",     label: "Bow",     emoji: "🎀" },
    { id: "crown",   label: "Crown",   emoji: "👑" },
    { id: "cap",     label: "Cap",     emoji: "🧢" }
  ];

  var BGS = [
    { id: "sunny",   color: "#ffd23f" },
    { id: "sky",     color: "#7ec8ff" },
    { id: "mint",    color: "#7bd389" },
    { id: "berry",   color: "#ff8fb3" },
    { id: "grape",   color: "#b79bff" },
    { id: "coral",   color: "#ff9d6e" }
  ];

  var AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12];

  var DEFAULT = {
    name: "",
    age: 7,
    skin: "honey",
    hairColor: "brown",
    hairStyle: "curly",
    eyes: "happy",
    accessory: "none",
    bg: "sunny"
  };

  var state = Object.assign({}, DEFAULT);

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function find(list, id) {
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return list[0];
  }
  function darken(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, ((n >> 16) & 255) - amt);
    var g = Math.max(0, ((n >> 8) & 255) - amt);
    var b = Math.max(0, (n & 255) - amt);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  /* ---------- SVG part builders ---------- */
  function eyeSvg(kind, x) {
    switch (kind) {
      case "round":
        return '<g><circle cx="' + x + '" cy="118" r="10" fill="#fff"/>' +
               '<circle cx="' + x + '" cy="119" r="5.5" fill="#2c2350"/>' +
               '<circle cx="' + (x - 2) + '" cy="116" r="1.8" fill="#fff"/></g>';
      case "wink":
        if (x > 120) return '<path d="M' + (x - 11) + ' 118q11 7 22 0" fill="none" stroke="#2c2350" stroke-width="4" stroke-linecap="round"/>';
        return '<g><circle cx="' + x + '" cy="118" r="9" fill="#fff"/><circle cx="' + x + '" cy="119" r="5" fill="#2c2350"/><circle cx="' + (x - 2) + '" cy="116" r="1.6" fill="#fff"/></g>';
      case "star":
        return star(x, 118, 8, "#ffd23f", "#b58800");
      case "sleepy":
        return '<path d="M' + (x - 10) + ' 119q10 6 20 0" fill="none" stroke="#2c2350" stroke-width="4" stroke-linecap="round"/>';
      default: // happy
        return '<g><circle cx="' + x + '" cy="118" r="8.5" fill="#fff"/>' +
               '<circle cx="' + x + '" cy="119" r="5" fill="#2c2350"/>' +
               '<circle cx="' + (x - 2) + '" cy="116" r="1.7" fill="#fff"/></g>';
    }
  }
  function star(cx, cy, r, fill, stroke) {
    var pts = [], i, ang, rad;
    for (i = 0; i < 10; i++) {
      ang = (Math.PI / 5) * i - Math.PI / 2;
      rad = i % 2 === 0 ? r : r * 0.45;
      pts.push((cx + Math.cos(ang) * rad).toFixed(1) + "," + (cy + Math.sin(ang) * rad).toFixed(1));
    }
    return '<polygon points="' + pts.join(" ") + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5" stroke-linejoin="round"/>';
  }

  function hairFrontSvg(style, color) {
    var d = darken(color, 26);
    switch (style) {
      case "short":
        return '<path d="M56 110c0-44 28-66 64-66s64 22 64 66c-10-22-30-30-30-30s4 14-6 18c-6-18-22-22-28-22s-22 4-28 22c-10-4-6-18-6-18s-20 8-30 30z" fill="' + color + '"/>' +
               '<path d="M120 44c34 0 56 18 62 50-12-30-40-36-62-36s-50 6-62 36c6-32 28-50 62-50z" fill="' + d + '" opacity=".35"/>';
      case "curly":
        return '<g fill="' + color + '">' +
               circ(64, 88, 18) + circ(86, 70, 20) + circ(116, 62, 22) + circ(150, 68, 20) + circ(176, 88, 18) +
               circ(58, 116, 15) + circ(184, 116, 15) +
               '</g><g fill="' + d + '" opacity=".3">' + circ(96, 66, 9) + circ(140, 66, 9) + '</g>';
      case "long":
        return '<path d="M52 118c0-46 30-70 68-70s68 24 68 70c-8-20-22-28-22-28s2 12-6 16c-8-16-24-20-40-20s-32 4-40 20c-8-4-6-16-6-16s-14 8-22 28z" fill="' + color + '"/>';
      case "buns":
        return circ(64, 78, 17, color) + circ(176, 78, 17, color) +
               '<path d="M62 112c0-42 26-62 58-62s58 20 58 62c-8-18-22-24-22-24s2 10-6 14c-8-14-22-18-30-18s-22 4-30 18c-8-4-6-14-6-14s-14 6-22 24z" fill="' + color + '"/>' +
               circ(64, 78, 7, d) + circ(176, 78, 7, d);
      case "spiky":
        return '<path d="M60 112 70 62l16 36 10-46 18 40 14-46 14 46 18-40 10 46 16-36 10 50c-12-24-148-24-150 0z" fill="' + color + '"/>';
      default: // bald
        return "";
    }
  }
  function hairBackSvg(style, color) {
    var d = darken(color, 18);
    if (style === "long") {
      return '<path d="M48 110c0 60 16 96 16 96l14-6c-6-30-8-58-6-86zM192 110c0 60-16 96-16 96l-14-6c6-30 8-58 6-86z" fill="' + d + '"/>';
    }
    if (style === "buns" || style === "curly") {
      return '<path d="M56 116c0 26 6 44 6 44l10-4c-4-16-6-30-5-42zM184 116c0 26-6 44-6 44l-10-4c4-16 6-30 5-42z" fill="' + d + '"/>';
    }
    return "";
  }
  function circ(cx, cy, r, fill) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + (fill ? ' fill="' + fill + '"' : "") + '/>';
  }

  function accessorySvg(kind) {
    switch (kind) {
      case "glasses":
        return '<g fill="none" stroke="#2c2350" stroke-width="4">' +
               '<rect x="74" y="106" width="32" height="26" rx="9" fill="#bfe9f0" fill-opacity=".5"/>' +
               '<rect x="134" y="106" width="32" height="26" rx="9" fill="#bfe9f0" fill-opacity=".5"/>' +
               '<path d="M106 116h28" /></g>';
      case "bow":
        return '<g transform="translate(120 52)"><path d="M0 0L-26-12 -26 12z" fill="#ff6f9c"/><path d="M0 0L26-12 26 12z" fill="#ff6f9c"/><circle r="7" fill="#ff97b6"/></g>';
      case "crown":
        return '<g transform="translate(120 50)"><path d="M-34 6 -34-18 -16-4 0-22 16-4 34-18 34 6z" fill="#ffd23f" stroke="#e0a800" stroke-width="2.5" stroke-linejoin="round"/>' +
               '<circle cx="0" cy="-12" r="3.5" fill="#ff6f9c"/><circle cx="-22" cy="-2" r="3" fill="#5ec5d6"/><circle cx="22" cy="-2" r="3" fill="#5ec5d6"/></g>';
      case "cap":
        return '<g><path d="M58 96c0-36 28-56 62-56s62 20 62 54c0 6-2 8-2 8H60s-2-2-2-6z" fill="#5ec5d6"/>' +
               '<path d="M178 100c22 2 38 10 38 18 0 4-4 6-10 6-8 0-18-10-34-12z" fill="#3ba6b8"/>' +
               '<circle cx="120" cy="48" r="6" fill="#ffd23f"/></g>';
      default:
        return "";
    }
  }

  /* ---------- render avatar into a given <svg> root ---------- */
  function paintAvatar(svgRoot, st) {
    var skin = find(SKINS, st.skin).color;
    var skinShade = darken(skin, 26);
    var hairColor = find(HAIR_COLORS, st.hairColor).color;
    var bg = find(BGS, st.bg).color;

    $("#head", svgRoot).setAttribute("fill", skin);
    $("#ear1", svgRoot).setAttribute("fill", skin);
    $("#ear2", svgRoot).setAttribute("fill", skin);
    $("#bgRect", svgRoot).setAttribute("fill", bg);
    $("#shoulders", svgRoot).setAttribute("fill", darken(bg, 40));

    $("#eyes", svgRoot).innerHTML = eyeSvg(st.eyes, 92) + eyeSvg(st.eyes, 148);
    $("#hairBack", svgRoot).innerHTML = hairBackSvg(st.hairStyle, hairColor);
    $("#hairFront", svgRoot).innerHTML = hairFrontSvg(st.hairStyle, hairColor);
    $("#accessory", svgRoot).innerHTML = accessorySvg(st.accessory);

    // nose tint follows skin
    var smile = $("#smile", svgRoot);
    if (smile) smile.setAttribute("stroke", skinShade);
  }

  function render(animate) {
    var svg = $("#avatarSvg");
    paintAvatar(svg, state);
    if (animate) {
      svg.classList.remove("bump");
      void svg.offsetWidth; // reflow to restart animation
      svg.classList.add("bump");
    }
    $("#stageName").textContent = state.name ? "Hello, " + state.name + "!" : "Hello, friend!";
    $("#stageAge").textContent = "I am " + state.age + " years old";

    // sync swatch checked state
    document.querySelectorAll(".swatch").forEach(function (el) {
      var key = el.parentElement.getAttribute("data-key");
      el.setAttribute("aria-checked", state[key] === el.dataset.val ? "true" : "false");
      el.tabIndex = state[key] === el.dataset.val ? 0 : -1;
    });
    document.querySelectorAll(".age-btn").forEach(function (el) {
      el.setAttribute("aria-pressed", String(Number(el.dataset.age) === state.age));
    });
  }

  /* ---------- build option swatches ---------- */
  function buildSwatches(key, list, colored) {
    var group = document.querySelector('[data-key="' + key + '"]');
    group.innerHTML = "";
    list.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch" + (colored ? "" : " chip");
      btn.setAttribute("role", "radio");
      btn.dataset.val = opt.id;
      if (colored) {
        btn.style.background = opt.color;
        btn.setAttribute("aria-label", opt.id);
        btn.title = opt.id;
      } else {
        btn.innerHTML = '<span class="chip-emoji" aria-hidden="true">' + opt.emoji + '</span>' +
                        '<span class="swatch-label">' + opt.label + '</span>';
        btn.setAttribute("aria-label", opt.label);
      }
      btn.addEventListener("click", function () { setOption(key, opt.id); });
      group.appendChild(btn);
    });

    // arrow-key roving focus within the radiogroup
    group.addEventListener("keydown", function (e) {
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].indexOf(e.key) === -1) return;
      e.preventDefault();
      var items = Array.prototype.slice.call(group.querySelectorAll(".swatch"));
      var idx = items.indexOf(document.activeElement);
      if (idx === -1) idx = 0;
      var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
      var next = (idx + dir + items.length) % items.length;
      items[next].focus();
      setOption(key, items[next].dataset.val);
    });
  }

  function setOption(key, val) {
    if (state[key] === val) return;
    state[key] = val;
    render(true);
    save();
  }

  /* ---------- age picker ---------- */
  function buildAges() {
    var picker = $("#agePicker");
    AGES.forEach(function (age) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "age-btn";
      b.dataset.age = String(age);
      b.textContent = String(age);
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", age + " years old");
      b.addEventListener("click", function () {
        state.age = age;
        render(false);
        save();
      });
      picker.appendChild(b);
    });
  }

  /* ---------- persistence ---------- */
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        Object.keys(DEFAULT).forEach(function (k) {
          if (data[k] !== undefined && data[k] !== null) state[k] = data[k];
        });
      }
    } catch (e) {}
  }

  /* ---------- randomize ---------- */
  function pick(list) { return list[Math.floor(Math.random() * list.length)].id; }
  function randomize() {
    state.skin = pick(SKINS);
    state.hairColor = pick(HAIR_COLORS);
    state.hairStyle = pick(HAIR_STYLES);
    state.eyes = pick(EYES);
    state.accessory = pick(ACCESSORIES);
    state.bg = pick(BGS);
    state.age = AGES[Math.floor(Math.random() * AGES.length)];
    render(true);
    save();
    toast("Ta-da! A brand new look 🎨");
  }

  /* ---------- save modal ---------- */
  var lastFocused = null;
  function openModal() {
    // build a standalone copy of the avatar for the modal
    var src = $("#avatarSvg");
    var clone = src.cloneNode(true);
    clone.classList.remove("bump");
    clone.removeAttribute("id");
    var holder = $("#modalAvatar");
    holder.innerHTML = "";
    holder.appendChild(clone);

    var who = state.name ? state.name : "Your buddy";
    $("#modalTitle").textContent = "All done, " + (state.name || "friend") + "! 🎉";
    $("#modalMsg").textContent = who + " is " + state.age + " and ready for story time.";

    spawnConfetti();
    var modal = $("#saveModal");
    lastFocused = document.activeElement;
    modal.hidden = false;
    $("#modalClose").focus();
    document.addEventListener("keydown", onModalKey);
  }
  function closeModal() {
    $("#saveModal").hidden = true;
    document.removeEventListener("keydown", onModalKey);
    if (lastFocused) lastFocused.focus();
  }
  function onModalKey(e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") { e.preventDefault(); $("#modalClose").focus(); }
  }
  function spawnConfetti() {
    var box = $("#confetti");
    box.innerHTML = "";
    var colors = ["#ff8a3d", "#5ec5d6", "#ffd23f", "#ff6f9c", "#7bd389", "#a78bfa"];
    for (var i = 0; i < 26; i++) {
      var c = document.createElement("i");
      c.style.left = (Math.random() * 100) + "%";
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.4) + "s";
      c.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      box.appendChild(c);
    }
  }

  /* ---------- wire up ---------- */
  function init() {
    buildSwatches("skin", SKINS, true);
    buildSwatches("hairColor", HAIR_COLORS, true);
    buildSwatches("hairStyle", HAIR_STYLES, false);
    buildSwatches("eyes", EYES, false);
    buildSwatches("accessory", ACCESSORIES, false);
    buildSwatches("bg", BGS, true);
    buildAges();

    load();

    var nameInput = $("#kidName");
    nameInput.value = state.name;
    nameInput.addEventListener("input", function () {
      state.name = nameInput.value.replace(/[<>]/g, "").trim();
      $("#stageName").textContent = state.name ? "Hello, " + state.name + "!" : "Hello, friend!";
      save();
    });

    $("#randomBtn").addEventListener("click", randomize);

    $("#resetBtn").addEventListener("click", function () {
      state = Object.assign({}, DEFAULT);
      nameInput.value = "";
      render(true);
      save();
      toast("Fresh start! 🌱");
    });

    $("#profileForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!state.name) {
        toast("Add your name first 😊");
        nameInput.focus();
        return;
      }
      save();
      openModal();
    });

    $("#modalClose").addEventListener("click", closeModal);
    $("#modalBackdrop").addEventListener("click", closeModal);

    $("#dyslexia").addEventListener("change", function (e) {
      document.body.classList.toggle("easyread", e.target.checked);
      toast(e.target.checked ? "Easy-read font on 📖" : "Back to normal font");
    });

    render(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
