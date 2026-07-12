(function () {
  "use strict";

  // --- Data: fictional proofs from a wedding shoot ---
  var IMAGES = [
    "1519741497674-611481863552",
    "1511285560929-80b456fea0bc",
    "1520854221256-17451cc331bf",
    "1465495976277-4387d4b0b4c6",
    "1522673607200-164d1b6ce486",
    "1519225421980-715cb0215aed",
    "1583939003579-730e3918a45a",
    "1606216794074-735e91aa2c92",
    "1537633552985-df8429e8048b",
    "1494955870715-970a55b95a63",
    "1460978812857-470ed1c77af0",
    "1591604466107-ec97de577aff",
    "1546032996-6dfacbacbf3f",
    "1525258946800-98cfd641d0de",
    "1519671482749-fd09be7ccebf",
    "1511795409834-ef04bbd61622",
    "1470163395405-d2b80e7450ed",
    "1481066717861-df19a2a75f5c"
  ];
  var SHAPES = ["", "tall", "wide", "", "", "tall", "", "wide", "", "", "tall", "", "wide", "", "", "tall", "", ""];

  var proofs = IMAGES.map(function (id, i) {
    return {
      id: "AV-" + String(2401 + i),
      url: "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=640&q=70",
      shape: SHAPES[i % SHAPES.length],
      fav: false,
      sel: false
    };
  });

  // --- Elements ---
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var selCountEl = document.getElementById("selCount");
  var favCountEl = document.getElementById("favCount");
  var filterAll = document.getElementById("filterAll");
  var filterFav = document.getElementById("filterFav");
  var downloadBtn = document.getElementById("downloadBtn");
  var clearBtn = document.getElementById("clearBtn");
  var toastEl = document.getElementById("toast");

  var filter = "all"; // "all" | "fav"
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function bump(el) {
    el.classList.remove("bump");
    // force reflow to restart the animation
    void el.offsetWidth;
    el.classList.add("bump");
  }

  // --- Build cards ---
  function render() {
    grid.innerHTML = "";
    var visible = proofs.filter(function (p) {
      return filter === "all" || p.fav;
    });

    if (visible.length === 0) {
      grid.hidden = true;
      empty.hidden = false;
    } else {
      grid.hidden = false;
      empty.hidden = true;
    }

    visible.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "proof" + (p.shape ? " " + p.shape : "");
      if (p.fav) li.classList.add("is-fav");
      if (p.sel) li.classList.add("is-selected");
      li.dataset.id = p.id;

      var img = document.createElement("div");
      img.className = "proof-img";
      img.style.backgroundImage = "url('" + p.url + "')";

      var shade = document.createElement("div");
      shade.className = "proof-shade";

      var seq = document.createElement("div");
      seq.className = "proof-seq";
      seq.setAttribute("aria-hidden", "true");

      // heart
      var heart = document.createElement("button");
      heart.type = "button";
      heart.className = "ctrl heart" + (p.fav ? " is-on" : "");
      heart.innerHTML = p.fav ? "♥" : "♡";
      heart.setAttribute("aria-pressed", String(p.fav));
      heart.setAttribute("aria-label", (p.fav ? "Remove favorite" : "Add favorite") + " " + p.id);
      heart.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleFav(p, heart, li);
      });

      // checkbox / select
      var check = document.createElement("button");
      check.type = "button";
      check.className = "ctrl check" + (p.sel ? " is-on" : "");
      check.setAttribute("aria-pressed", String(p.sel));
      check.setAttribute("aria-label", (p.sel ? "Deselect" : "Select for retouch") + " " + p.id);
      check.innerHTML = '<span class="box" aria-hidden="true">✓</span><span class="lbl">' +
        (p.sel ? "Selected" : "Select") + "</span>";
      check.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleSel(p, check, li);
      });

      var meta = document.createElement("div");
      meta.className = "proof-meta";
      var pid = document.createElement("span");
      pid.className = "proof-id";
      pid.textContent = p.id;
      meta.appendChild(pid);

      li.appendChild(img);
      li.appendChild(shade);
      li.appendChild(seq);
      li.appendChild(heart);
      li.appendChild(check);
      li.appendChild(meta);
      grid.appendChild(li);
    });

    updateSeq();
    updateCounts();
  }

  function toggleFav(p, heart, li) {
    p.fav = !p.fav;
    heart.classList.toggle("is-on", p.fav);
    heart.innerHTML = p.fav ? "♥" : "♡";
    heart.setAttribute("aria-pressed", String(p.fav));
    heart.classList.remove("pop");
    void heart.offsetWidth;
    if (p.fav) heart.classList.add("pop");
    li.classList.toggle("is-fav", p.fav);
    bump(favCountEl);
    updateCounts();

    // If viewing favorites and this was un-favorited, drop it from the grid
    if (filter === "fav" && !p.fav) {
      setTimeout(render, 180);
    }
  }

  function toggleSel(p, check, li) {
    p.sel = !p.sel;
    check.classList.toggle("is-on", p.sel);
    check.setAttribute("aria-pressed", String(p.sel));
    check.querySelector(".lbl").textContent = p.sel ? "Selected" : "Select";
    li.classList.toggle("is-selected", p.sel);
    bump(selCountEl);
    updateSeq();
    updateCounts();
  }

  // Number selected cards in selection order
  function updateSeq() {
    var order = 0;
    var selectedIds = proofs.filter(function (p) { return p.sel; }).map(function (p) { return p.id; });
    var map = {};
    selectedIds.forEach(function (id, i) { map[id] = i + 1; });
    Array.prototype.forEach.call(grid.children, function (li) {
      var seq = li.querySelector(".proof-seq");
      if (!seq) return;
      var n = map[li.dataset.id];
      seq.textContent = n ? n : "";
    });
    order = selectedIds.length;
    return order;
  }

  function updateCounts() {
    var sel = proofs.filter(function (p) { return p.sel; }).length;
    var fav = proofs.filter(function (p) { return p.fav; }).length;
    selCountEl.textContent = sel;
    favCountEl.textContent = fav;
    downloadBtn.disabled = sel === 0;
    clearBtn.disabled = sel === 0 && fav === 0;
  }

  // --- Filter ---
  function setFilter(next) {
    filter = next;
    var isAll = next === "all";
    filterAll.classList.toggle("is-active", isAll);
    filterFav.classList.toggle("is-active", !isAll);
    filterAll.setAttribute("aria-pressed", String(isAll));
    filterFav.setAttribute("aria-pressed", String(!isAll));
    render();
  }

  filterAll.addEventListener("click", function () { setFilter("all"); });
  filterFav.addEventListener("click", function () { setFilter("fav"); });

  downloadBtn.addEventListener("click", function () {
    var sel = proofs.filter(function (p) { return p.sel; });
    if (sel.length === 0) return;
    toast("Preparing " + sel.length + " high-res file" + (sel.length === 1 ? "" : "s") + " for download…");
  });

  clearBtn.addEventListener("click", function () {
    var had = proofs.some(function (p) { return p.sel || p.fav; });
    proofs.forEach(function (p) { p.sel = false; p.fav = false; });
    if (filter === "fav") filter = "all", setFilter("all");
    else render();
    if (had) toast("Selection and favorites cleared");
  });

  // Pre-seed a couple of picks so the UI feels alive on load
  proofs[2].fav = true;
  proofs[2].sel = true;
  proofs[7].fav = true;
  proofs[10].sel = true;

  render();
})();
