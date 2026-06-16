(function () {
  "use strict";

  // ---- fictional flavour pools ----
  var SFX = ["POW", "BAM", "WHAM", "ZAP", "KRAK", "BOOM", "SLASH", "FWOOM", "THWIP"];
  var SCENES = [
    "Rooftop chase under neon rain",
    "Close-up: the Ronin's masked eyes",
    "Wide shot of the flooded Lowtown market",
    "The Iron Vanguard kicks the door in",
    "Silhouette draws a humming blade",
    "Spark of recognition between rivals",
    "Splash page: city skyline at dawn",
    "Hand reaching for a dropped data-chip",
  ];
  var CAPTIONS = [
    "Rain never stopped in Lowtown.",
    "Three years since the Sundering.",
    "She knew that mask anywhere.",
    "“You shouldn't have come back.”",
    "The blade remembered everything.",
    "",
  ];

  // ---- state ----
  var panels = []; // { id, sfx, scene, caption, alt }
  var nextId = 1;
  var dragId = null;

  // ---- elements ----
  var $ = function (id) { return document.getElementById(id); };
  var listEl = $("panelList");
  var emptyEl = $("emptyState");
  var tpl = $("panelTpl");
  var readerEl = $("reader");
  var readerEmpty = $("readerEmpty");
  var toastEl = $("toast");
  var statusChip = $("statusChip");

  var titleField = $("titleField");
  var seriesField = $("seriesField");
  var numberField = $("numberField");

  // ---- toast helper ----
  var toastTimer = null;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (kind ? " toast--" + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast";
    }, 2600);
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---- mutations ----
  function addPanel(opts) {
    opts = opts || {};
    panels.push({
      id: nextId++,
      sfx: opts.sfx || pick(SFX),
      scene: opts.scene || pick(SCENES),
      caption: opts.caption != null ? opts.caption : pick(CAPTIONS),
      alt: opts.alt || "",
    });
  }

  function removePanel(id) {
    panels = panels.filter(function (p) { return p.id !== id; });
  }

  function indexOfId(id) {
    for (var i = 0; i < panels.length; i++) if (panels[i].id === id) return i;
    return -1;
  }

  function move(id, dir) {
    var i = indexOfId(id);
    var j = i + dir;
    if (i < 0 || j < 0 || j >= panels.length) return;
    var tmp = panels[i];
    panels[i] = panels[j];
    panels[j] = tmp;
  }

  function reorder(fromId, toId) {
    var from = indexOfId(fromId);
    var to = indexOfId(toId);
    if (from < 0 || to < 0 || from === to) return;
    var moved = panels.splice(from, 1)[0];
    panels.splice(to, 0, moved);
  }

  // ---- rendering ----
  function render() {
    renderList();
    renderPreview();
    syncCounts();
  }

  function renderList() {
    listEl.innerHTML = "";
    emptyEl.style.display = panels.length ? "none" : "block";

    panels.forEach(function (p, i) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = String(p.id);

      node.querySelector(".panel__idx").textContent = i + 1;
      node.querySelector(".panel__sfx").textContent = p.sfx + "!";
      node.querySelector(".panel__name").textContent = "Panel " + (i + 1) + " · " + p.scene;

      var capInput = node.querySelector('[data-field="caption"]');
      var altInput = node.querySelector('[data-field="alt"]');
      capInput.value = p.caption;
      altInput.value = p.alt;

      capInput.addEventListener("input", function () {
        p.caption = capInput.value;
        renderPreview();
      });
      altInput.addEventListener("input", function () {
        p.alt = altInput.value;
        altInput.classList.remove("invalid");
      });

      // move / delete buttons
      node.querySelectorAll("[data-act]").forEach(function (btn) {
        var act = btn.getAttribute("data-act");
        if (act === "up") btn.disabled = i === 0;
        if (act === "down") btn.disabled = i === panels.length - 1;
        btn.addEventListener("click", function () {
          if (act === "del") {
            removePanel(p.id);
            toast("Panel removed.");
            render();
          } else {
            move(p.id, act === "up" ? -1 : 1);
            render();
            flash(p.id);
          }
        });
      });

      // drag to reorder
      node.addEventListener("dragstart", function (e) {
        dragId = p.id;
        node.classList.add("dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(p.id));
        }
      });
      node.addEventListener("dragend", function () {
        node.classList.remove("dragging");
        dragId = null;
        clearDropTargets();
      });
      node.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (dragId == null || dragId === p.id) return;
        clearDropTargets();
        node.classList.add("drop-target");
      });
      node.addEventListener("dragleave", function () {
        node.classList.remove("drop-target");
      });
      node.addEventListener("drop", function (e) {
        e.preventDefault();
        node.classList.remove("drop-target");
        if (dragId == null) return;
        reorder(dragId, p.id);
        render();
        flash(dragId);
      });

      listEl.appendChild(node);
    });
  }

  function clearDropTargets() {
    var ts = listEl.querySelectorAll(".drop-target");
    for (var i = 0; i < ts.length; i++) ts[i].classList.remove("drop-target");
  }

  function flash(id) {
    var el = listEl.querySelector('.panel[data-id="' + id + '"]');
    if (!el) return;
    el.classList.remove("flash");
    void el.offsetWidth; // reflow to restart animation
    el.classList.add("flash");
  }

  function renderPreview() {
    $("previewSeries").textContent = seriesField.value.trim() || "Untitled Series";
    var num = numberField.value.trim();
    var t = titleField.value.trim() || "Untitled episode";
    $("previewTitle").textContent = (num ? "#" + num + " · " : "") + t;

    if (!panels.length) {
      readerEl.innerHTML = "";
      readerEl.appendChild(readerEmpty);
      readerEmpty.style.display = "block";
      return;
    }

    readerEl.innerHTML = "";
    panels.forEach(function (p, i) {
      var fig = document.createElement("figure");
      fig.className = "rpanel";

      var num = document.createElement("span");
      num.className = "rpanel__num";
      num.textContent = i + 1;
      fig.appendChild(num);

      if (p.caption && p.caption.trim()) {
        var balloon = document.createElement("div");
        balloon.className = "rpanel__balloon";
        balloon.textContent = p.caption.trim();
        fig.appendChild(balloon);
      } else {
        var ph = document.createElement("span");
        ph.className = "rpanel__placeholder";
        ph.textContent = p.sfx + "!";
        fig.appendChild(ph);
      }

      var cap = document.createElement("figcaption");
      cap.className = "sr-only";
      cap.style.position = "absolute";
      cap.style.width = "1px";
      cap.style.height = "1px";
      cap.style.overflow = "hidden";
      cap.style.clip = "rect(0 0 0 0)";
      cap.textContent = p.alt || p.scene;
      fig.setAttribute("role", "img");
      fig.setAttribute("aria-label", p.alt || p.scene);
      fig.appendChild(cap);

      readerEl.appendChild(fig);
    });
  }

  function syncCounts() {
    var n = panels.length;
    $("panelCountTop").textContent = n;
    $("panelCountList").textContent = n;
  }

  // ---- validation + publish ----
  function publish() {
    var problems = [];

    if (!titleField.value.trim()) {
      titleField.classList.add("invalid");
      problems.push("an episode title");
    } else {
      titleField.classList.remove("invalid");
    }

    if (!panels.length) {
      problems.push("at least one panel");
    }

    var missingAlt = 0;
    listEl.querySelectorAll('[data-field="alt"]').forEach(function (inp) {
      if (!inp.value.trim()) {
        inp.classList.add("invalid");
        missingAlt++;
      }
    });
    if (missingAlt) {
      problems.push(missingAlt + " panel" + (missingAlt > 1 ? "s" : "") + " missing alt text");
    }

    if (problems.length) {
      toast("Can't publish yet — add " + problems.join(", ") + ".", "err");
      return;
    }

    var vis = document.querySelector('input[name="vis"]:checked');
    statusChip.textContent = "Published";
    statusChip.className = "chip chip--live";
    toast(
      "“" + titleField.value.trim() + "” published — " +
        panels.length + " panels, " + (vis ? vis.value : "public") + ".",
      "ok"
    );
  }

  function markDraft() {
    if (statusChip.textContent !== "Draft") {
      statusChip.textContent = "Draft";
      statusChip.className = "chip chip--draft";
    }
  }

  // ---- wire up controls ----
  $("dropzone").addEventListener("click", function () {
    addPanel();
    render();
    flash(panels[panels.length - 1].id);
    toast("Panel added.");
    markDraft();
  });

  // simulate real drag-drop file upload
  var dz = $("dropzone");
  ["dragenter", "dragover"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) {
      e.preventDefault();
      dz.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) {
      e.preventDefault();
      dz.classList.remove("dragover");
    });
  });
  dz.addEventListener("drop", function (e) {
    var count = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files.length : 0;
    count = count || 2; // simulate at least a couple
    for (var i = 0; i < count; i++) addPanel();
    render();
    toast(count + " panel" + (count > 1 ? "s" : "") + " added.");
    markDraft();
  });

  $("addOneBtn").addEventListener("click", function () {
    addPanel();
    render();
    flash(panels[panels.length - 1].id);
    markDraft();
  });

  $("addBatchBtn").addEventListener("click", function () {
    for (var i = 0; i < 3; i++) addPanel();
    render();
    toast("3 panels added.");
    markDraft();
  });

  $("clearBtn").addEventListener("click", function () {
    if (!panels.length) {
      toast("Nothing to clear.");
      return;
    }
    panels = [];
    render();
    toast("All panels cleared.");
    markDraft();
  });

  $("publishBtn").addEventListener("click", publish);

  [titleField, seriesField, numberField].forEach(function (f) {
    f.addEventListener("input", function () {
      renderPreview();
      titleField.classList.remove("invalid");
      markDraft();
    });
  });

  document.querySelectorAll('input[name="vis"]').forEach(function (r) {
    r.addEventListener("change", markDraft);
  });

  // ---- seed with a small starter sequence ----
  addPanel({ sfx: "KRAK", scene: "Rooftop chase under neon rain", caption: "Rain never stopped in Lowtown.", alt: "A masked figure leaps across wet rooftops under neon signs." });
  addPanel({ sfx: "SLASH", scene: "Silhouette draws a humming blade", caption: "", alt: "Close-up of a glowing blade being drawn from its sheath." });
  addPanel({ sfx: "BOOM", scene: "The Iron Vanguard kicks the door in", caption: "“You shouldn't have come back.”", alt: "An armored figure smashes through a steel door, sparks flying." });
  render();
})();
