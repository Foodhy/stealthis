(function () {
  "use strict";

  var SHOTS = ["WIDE", "MEDIUM", "CLOSE-UP", "EXTREME CU", "OTS", "TWO-SHOT", "POV", "ESTABLISHING"];
  var MOVES = ["STATIC", "PAN L→R", "PAN R→L", "TILT UP", "TILT DOWN", "DOLLY IN", "DOLLY OUT", "CRANE", "HANDHELD", "TRACKING"];
  var LENSES = ["18mm", "24mm", "35mm", "50mm", "85mm", "135mm"];

  var uid = 0;
  function nid() { uid += 1; return "n" + uid; }

  // Seed data
  var scenes = [
    {
      id: nid(), title: "1. Harbor at Dawn",
      frames: [
        { id: nid(), slug: "Fog rolls over the empty docks", shot: "ESTABLISHING", move: "CRANE", lens: "24mm", dur: 6 },
        { id: nid(), slug: "Lighthouse beam sweeps the water", shot: "WIDE", move: "PAN L→R", lens: "35mm", dur: 4 },
        { id: nid(), slug: "Mara steps off the last ferry", shot: "MEDIUM", move: "TRACKING", lens: "50mm", dur: 5 },
      ],
    },
    {
      id: nid(), title: "2. The Warehouse Meet",
      frames: [
        { id: nid(), slug: "Rusted door slides open, light spills in", shot: "CLOSE-UP", move: "DOLLY IN", lens: "85mm", dur: 3 },
        { id: nid(), slug: "Mara scans the room, hand on the strap", shot: "OTS", move: "HANDHELD", lens: "35mm", dur: 4 },
        { id: nid(), slug: "The broker turns from the shadows", shot: "TWO-SHOT", move: "STATIC", lens: "50mm", dur: 5 },
        { id: nid(), slug: "Extreme detail: briefcase latch clicks", shot: "EXTREME CU", move: "STATIC", lens: "135mm", dur: 2 },
      ],
    },
    {
      id: nid(), title: "3. Rooftop Chase",
      frames: [
        { id: nid(), slug: "Neon skyline, sirens bloom below", shot: "WIDE", move: "TILT DOWN", lens: "24mm", dur: 4 },
        { id: nid(), slug: "Feet pound across the gravel roof", shot: "POV", move: "HANDHELD", lens: "18mm", dur: 3 },
      ],
    },
  ];

  var board = document.getElementById("board");
  var tpl = document.getElementById("frameTpl");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function cycle(list, cur, dir) {
    var i = list.indexOf(cur);
    if (i === -1) i = 0;
    i = (i + dir + list.length) % list.length;
    return list[i];
  }

  var globalIndex = 0; // running frame number across all scenes

  function buildFrame(frame, scene) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = frame.id;
    node.classList.add("pop");
    node.querySelector(".fnum").textContent = "#" + String(globalIndex).padStart(2, "0");
    node.querySelector(".dur-badge").textContent = frame.dur + "s";

    var slug = node.querySelector(".slug");
    slug.value = frame.slug;
    slug.addEventListener("input", function () { frame.slug = slug.value; });

    var shotB = node.querySelector(".badge.shot");
    var moveB = node.querySelector(".badge.move");
    var lensB = node.querySelector(".badge.lens");
    shotB.textContent = frame.shot;
    moveB.textContent = frame.move;
    lensB.textContent = frame.lens;

    node.querySelectorAll("[data-cycle]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        var dir = e.shiftKey ? -1 : 1;
        var kind = b.dataset.cycle;
        if (kind === "shot") { frame.shot = cycle(SHOTS, frame.shot, dir); b.textContent = frame.shot; }
        else if (kind === "move") { frame.move = cycle(MOVES, frame.move, dir); b.textContent = frame.move; }
        else { frame.lens = cycle(LENSES, frame.lens, dir); b.textContent = frame.lens; }
      });
    });

    var durIn = node.querySelector(".dur-input");
    durIn.value = frame.dur;
    durIn.addEventListener("input", function () {
      var v = parseInt(durIn.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      if (v > 600) v = 600;
      frame.dur = v;
      node.querySelector(".dur-badge").textContent = v + "s";
      updateMeta();
    });
    durIn.addEventListener("blur", function () { durIn.value = frame.dur; });

    node.querySelectorAll("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var act = b.dataset.act;
        var i = scene.frames.indexOf(frame);
        if (act === "del") {
          scene.frames.splice(i, 1);
          toast("Frame removed");
        } else if (act === "dup") {
          var copy = Object.assign({}, frame, { id: nid() });
          scene.frames.splice(i + 1, 0, copy);
          toast("Frame duplicated");
        } else if (act === "left" && i > 0) {
          scene.frames.splice(i - 1, 0, scene.frames.splice(i, 1)[0]);
          toast("Moved earlier");
        } else if (act === "right" && i < scene.frames.length - 1) {
          scene.frames.splice(i + 1, 0, scene.frames.splice(i, 1)[0]);
          toast("Moved later");
        } else { return; }
        render();
      });
    });

    globalIndex += 1;
    return node;
  }

  function buildScene(scene, sIdx) {
    var sec = document.createElement("section");
    sec.className = "scene";
    if (scene.collapsed) sec.classList.add("collapsed");
    sec.dataset.id = scene.id;

    var head = document.createElement("div");
    head.className = "scene-head";

    var caret = document.createElement("span");
    caret.className = "scene-caret";
    caret.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var idx = document.createElement("span");
    idx.className = "scene-idx tc";
    idx.textContent = "SC " + String(sIdx + 1).padStart(2, "0");

    var title = document.createElement("input");
    title.className = "scene-title";
    title.value = scene.title;
    title.setAttribute("aria-label", "Scene title");
    title.addEventListener("input", function () { scene.title = title.value; });
    title.addEventListener("click", function (e) { e.stopPropagation(); });

    var totalDur = scene.frames.reduce(function (a, f) { return a + f.dur; }, 0);
    var stat = document.createElement("span");
    stat.className = "scene-stat";
    stat.textContent = scene.frames.length + " shots · " + fmt(totalDur);

    var addBtn = document.createElement("button");
    addBtn.className = "scene-add";
    addBtn.type = "button";
    addBtn.textContent = "+";
    addBtn.title = "Add frame to scene";
    addBtn.setAttribute("aria-label", "Add frame to scene");
    addBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      scene.collapsed = false;
      scene.frames.push({
        id: nid(), slug: "New shot — describe the action",
        shot: SHOTS[1], move: MOVES[0], lens: LENSES[3], dur: 3,
      });
      render();
      toast("Frame added");
    });

    var delBtn = document.createElement("button");
    delBtn.className = "scene-del";
    delBtn.type = "button";
    delBtn.textContent = "✕";
    delBtn.title = "Delete scene";
    delBtn.setAttribute("aria-label", "Delete scene");
    delBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      scenes = scenes.filter(function (s) { return s.id !== scene.id; });
      render();
      toast("Scene deleted");
    });

    head.appendChild(caret);
    head.appendChild(idx);
    head.appendChild(title);
    head.appendChild(stat);
    head.appendChild(addBtn);
    head.appendChild(delBtn);
    head.addEventListener("click", function () {
      scene.collapsed = !scene.collapsed;
      sec.classList.toggle("collapsed", scene.collapsed);
    });

    var frames = document.createElement("div");
    frames.className = "frames";
    scene.frames.forEach(function (f) { frames.appendChild(buildFrame(f, scene)); });

    sec.appendChild(head);
    sec.appendChild(frames);
    return sec;
  }

  function buildTimeline() {
    var track = document.getElementById("timelineTrack");
    track.innerHTML = "";
    var total = 0;
    scenes.forEach(function (s) { s.frames.forEach(function (f) { total += f.dur; }); });
    if (total === 0) return;
    scenes.forEach(function (s, si) {
      s.frames.forEach(function (f) {
        var seg = document.createElement("div");
        seg.className = "tl-seg" + (si % 2 ? " scene-alt" : "");
        seg.style.flex = f.dur;
        seg.title = f.slug + " — " + f.dur + "s";
        if (f.dur >= 4) {
          var sp = document.createElement("span");
          sp.textContent = f.dur + "s";
          seg.appendChild(sp);
        }
        track.appendChild(seg);
      });
    });
  }

  function updateMeta() {
    var frames = 0, total = 0;
    scenes.forEach(function (s) {
      frames += s.frames.length;
      s.frames.forEach(function (f) { total += f.dur; });
    });
    document.getElementById("totalFrames").textContent = frames + (frames === 1 ? " frame" : " frames");
    document.getElementById("totalScenes").textContent = scenes.length + (scenes.length === 1 ? " scene" : " scenes");
    document.getElementById("totalRuntime").textContent = fmt(total);
    buildTimeline();
    // refresh per-scene stat labels without full re-render
    document.querySelectorAll(".scene").forEach(function (el, i) {
      var s = scenes[i];
      if (!s) return;
      var td = s.frames.reduce(function (a, f) { return a + f.dur; }, 0);
      var st = el.querySelector(".scene-stat");
      if (st) st.textContent = s.frames.length + " shots · " + fmt(td);
    });
  }

  function render() {
    globalIndex = 1;
    board.innerHTML = "";
    scenes.forEach(function (s, i) { board.appendChild(buildScene(s, i)); });
    updateMeta();
  }

  // Top-level actions
  document.getElementById("addScene").addEventListener("click", function () {
    scenes.push({
      id: nid(), title: (scenes.length + 1) + ". New Scene",
      frames: [{ id: nid(), slug: "Opening shot of the scene", shot: SHOTS[0], move: MOVES[0], lens: LENSES[2], dur: 4 }],
    });
    render();
    toast("Scene added");
    board.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  var allCollapsed = false;
  document.getElementById("collapseAll").addEventListener("click", function (e) {
    allCollapsed = !allCollapsed;
    scenes.forEach(function (s) { s.collapsed = allCollapsed; });
    e.target.textContent = allCollapsed ? "Expand all" : "Collapse all";
    render();
  });

  render();
})();
