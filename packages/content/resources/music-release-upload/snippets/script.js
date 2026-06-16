(function () {
  "use strict";

  /* ---------- cover palettes (accent pulled from "art") ---------- */
  var COVERS = [
    { a: "#8b5cf6", b: "#ff3d71" },
    { a: "#1db954", b: "#0ea5e9" },
    { a: "#f59e0b", b: "#ff3d71" },
    { a: "#06b6d4", b: "#8b5cf6" },
    { a: "#ec4899", b: "#6366f1" },
    { a: "#22c55e", b: "#eab308" }
  ];
  var coverIndex = -1;
  var hasArt = false;

  /* ---------- state ---------- */
  var tracks = [
    { title: "Paper Lanterns", feat: "Velvet Static", isrc: "US-S1Z-26-00001", dur: 222 },
    { title: "Glass Harbor", feat: "", isrc: "US-S1Z-26-00002", dur: 198 },
    { title: "Slow Tide", feat: "Marlowe Hale", isrc: "US-S1Z-26-00003", dur: 246 },
    { title: "Reservoir (Reprise)", feat: "", isrc: "US-S1Z-26-00004", dur: 171 }
  ];
  var step = 0;
  var uid = 100;

  /* ---------- elements ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var dropzone = $("dropzone");
  var dzCover = $("dzCover");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var prevBtn = $("prevBtn");
  var nextBtn = $("nextBtn");
  var tracklist = $("tracklist");

  /* ---------- toast ---------- */
  var toastEl = $("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  /* ---------- COVER / DROPZONE ---------- */
  function applyCover(idx) {
    var c = COVERS[idx];
    document.documentElement.style.setProperty("--cv-a", c.a);
    document.documentElement.style.setProperty("--cv-b", c.b);
    var grad = "linear-gradient(135deg, " + c.a + ", " + c.b + ")";
    dzCover.style.background = grad;
  }
  function pickCover() {
    coverIndex = (coverIndex + 1) % COVERS.length;
    hasArt = true;
    dropzone.classList.add("has-art");
    applyCover(coverIndex);
    renderPreview();
    renderReview();
  }
  dropzone.addEventListener("click", function () {
    pickCover();
    toast("Cover artwork attached");
  });
  $("shuffleCover").addEventListener("click", function () {
    if (!hasArt) { pickCover(); } else { pickCover(); }
    toast("Artwork shuffled");
  });

  /* ---------- DETAIL FIELDS ---------- */
  ["fTitle", "fArtist", "fLabel", "fGenre", "fDate"].forEach(function (id) {
    $(id).addEventListener("input", function () { renderPreview(); renderReview(); });
  });

  var explicitBtn = $("fExplicit");
  explicitBtn.addEventListener("click", function () {
    var on = explicitBtn.getAttribute("aria-checked") === "true";
    explicitBtn.setAttribute("aria-checked", String(!on));
    renderPreview();
    renderReview();
  });
  function isExplicit() { return explicitBtn.getAttribute("aria-checked") === "true"; }

  /* ---------- WAVEFORM (deterministic from seed) ---------- */
  function waveBars(seed) {
    var bars = "";
    var x = seed * 9301 + 49297;
    for (var i = 0; i < 28; i++) {
      x = (x * 9301 + 49297) % 233280;
      var h = 20 + Math.floor((x / 233280) * 80);
      bars += '<span style="height:' + h + '%"></span>';
    }
    return bars;
  }

  /* ---------- TRACKLIST RENDER ---------- */
  function renderTracks() {
    tracklist.innerHTML = "";
    tracks.forEach(function (t, i) {
      var li = document.createElement("li");
      li.className = "track";
      li.draggable = true;
      li.dataset.index = i;
      li.innerHTML =
        '<span class="track-handle" title="Drag to reorder" aria-hidden="true">⋮⋮</span>' +
        '<span class="track-index">' + (i + 1) + '</span>' +
        '<div class="track-main">' +
          '<div class="track-fields">' +
            '<input data-k="title" type="text" placeholder="Track title" value="' + esc(t.title) + '" aria-label="Track title" />' +
            '<input data-k="feat" type="text" placeholder="Featured artists" value="' + esc(t.feat) + '" aria-label="Featured artists" />' +
            '<input data-k="isrc" type="text" placeholder="ISRC" value="' + esc(t.isrc) + '" aria-label="ISRC code" />' +
          '</div>' +
          '<div class="track-audio">' +
            '<div class="wave" aria-hidden="true">' + waveBars(i + 3) + '</div>' +
            '<span class="audio-state">audio uploaded · ' + fmt(t.dur) + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="track-remove" type="button" title="Remove track" aria-label="Remove track">✕</button>';

      // field bindings
      li.querySelectorAll(".track-fields input").forEach(function (inp) {
        inp.addEventListener("input", function () {
          tracks[Number(li.dataset.index)][inp.dataset.k] = inp.value;
          renderPreview();
          renderReview();
        });
      });
      // remove
      li.querySelector(".track-remove").addEventListener("click", function () {
        if (tracks.length <= 1) { toast("A release needs at least one track"); return; }
        tracks.splice(Number(li.dataset.index), 1);
        renderTracks(); renderPreview(); renderReview();
        toast("Track removed");
      });

      bindDrag(li);
      tracklist.appendChild(li);
    });
    $("trackCount").textContent =
      tracks.length + " track" + (tracks.length === 1 ? "" : "s") + " · " + fmt(totalDur()) + " total";
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function totalDur() { return tracks.reduce(function (a, t) { return a + t.dur; }, 0); }

  /* ---------- DRAG & DROP REORDER ---------- */
  var dragIdx = null;
  function bindDrag(li) {
    li.addEventListener("dragstart", function (e) {
      dragIdx = Number(li.dataset.index);
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    li.addEventListener("dragend", function () {
      li.classList.remove("dragging");
      clearTargets();
      dragIdx = null;
    });
    li.addEventListener("dragover", function (e) {
      e.preventDefault();
      clearTargets();
      li.classList.add("drop-target");
    });
    li.addEventListener("drop", function (e) {
      e.preventDefault();
      var to = Number(li.dataset.index);
      if (dragIdx === null || dragIdx === to) return;
      var moved = tracks.splice(dragIdx, 1)[0];
      tracks.splice(to, 0, moved);
      renderTracks(); renderPreview(); renderReview();
      toast("Reordered to #" + (to + 1));
    });
  }
  function clearTargets() {
    Array.prototype.forEach.call(tracklist.children, function (c) { c.classList.remove("drop-target"); });
  }

  $("addTrack").addEventListener("click", function () {
    uid++;
    tracks.push({
      title: "Untitled Track",
      feat: "",
      isrc: "US-S1Z-26-" + String(uid).padStart(5, "0"),
      dur: 150 + Math.floor(Math.random() * 130)
    });
    renderTracks(); renderPreview(); renderReview();
    toast("Track added");
  });

  /* ---------- PREVIEW (simulated player) ---------- */
  var rcCover = $("rcCover");
  var rcPlay = $("rcPlay");
  var scrubFill = $("scrubFill");
  var scrubKnob = $("scrubKnob");
  var scrubber = $("scrubber");
  var playing = false;
  var cur = 0;           // seconds into current track
  var activeTrack = 0;
  var timer = null;

  function curDur() { return tracks[activeTrack] ? tracks[activeTrack].dur : 0; }

  function renderPreview() {
    $("rcTitle").textContent = $("fTitle").value || "Untitled Release";
    $("rcArtist").textContent = $("fArtist").value || "Unknown Artist";
    var year = ($("fDate").value || "2026").slice(0, 4);
    $("rcMeta").textContent = $("fGenre").value + " · " + year;
    $("rcLabel").textContent = $("fLabel").value || "Independent";
    $("rcExplicit").hidden = !isExplicit();

    if (activeTrack >= tracks.length) activeTrack = 0;
    $("rcNow").textContent = "Now playing: " + ((tracks[activeTrack] && tracks[activeTrack].title) || "—");
    $("rcDur").textContent = fmt(curDur());

    // tracklist
    var ul = $("rcList");
    ul.innerHTML = "";
    tracks.forEach(function (t, i) {
      var li = document.createElement("li");
      if (i === activeTrack) li.className = "active";
      var feat = t.feat ? ' <span class="rc-li-feat">(feat. ' + esc(t.feat) + ")</span>" : "";
      li.innerHTML =
        '<span class="rc-li-num">' + (i + 1) + '</span>' +
        '<span class="rc-li-title">' + esc(t.title || "Untitled") + feat + '</span>' +
        (isExplicit() ? '<span class="rc-li-e">E</span>' : '') +
        '<span class="rc-li-time">' + fmt(t.dur) + '</span>';
      li.addEventListener("click", function () { selectTrack(i, true); });
      ul.appendChild(li);
    });
    updateScrub();
  }

  function updateScrub() {
    var pct = curDur() ? (cur / curDur()) * 100 : 0;
    scrubFill.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    $("rcCur").textContent = fmt(cur);
    scrubber.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  function selectTrack(i, autoplay) {
    activeTrack = i;
    cur = 0;
    renderPreview();
    if (autoplay && !playing) startPlay();
    else updateScrub();
  }

  function tick() {
    cur += 1;
    if (cur >= curDur()) {
      // advance to next track
      if (activeTrack < tracks.length - 1) {
        selectTrack(activeTrack + 1, false);
      } else {
        stopPlay();
        cur = 0;
        updateScrub();
        toast("Reached end of release");
        return;
      }
    }
    updateScrub();
  }

  function startPlay() {
    playing = true;
    rcPlay.setAttribute("aria-pressed", "true");
    rcCover.classList.add("playing");
    clearInterval(timer);
    timer = setInterval(tick, 1000);
  }
  function stopPlay() {
    playing = false;
    rcPlay.setAttribute("aria-pressed", "false");
    rcCover.classList.remove("playing");
    clearInterval(timer);
  }
  rcPlay.addEventListener("click", function () {
    if (playing) stopPlay(); else startPlay();
  });

  /* scrubber interaction */
  function seekFromEvent(e) {
    var rect = scrubber.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var pct = Math.min(1, Math.max(0, x / rect.width));
    cur = pct * curDur();
    updateScrub();
  }
  var seeking = false;
  scrubber.addEventListener("pointerdown", function (e) {
    seeking = true; scrubber.setPointerCapture(e.pointerId); seekFromEvent(e);
  });
  scrubber.addEventListener("pointermove", function (e) { if (seeking) seekFromEvent(e); });
  scrubber.addEventListener("pointerup", function () { seeking = false; });
  scrubber.addEventListener("keydown", function (e) {
    var d = curDur();
    if (e.key === "ArrowRight") { cur = Math.min(d, cur + 5); updateScrub(); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { cur = Math.max(0, cur - 5); updateScrub(); e.preventDefault(); }
    else if (e.key === "Home") { cur = 0; updateScrub(); e.preventDefault(); }
    else if (e.key === "End") { cur = d; updateScrub(); e.preventDefault(); }
  });

  /* ---------- REVIEW ---------- */
  function renderReview() {
    var list = $("checklist");
    var titledTracks = tracks.filter(function (t) { return t.title && t.title.trim() && t.title !== "Untitled Track"; }).length;
    var rows = [
      { k: "Release title", v: $("fTitle").value || "—", ok: !!$("fTitle").value.trim() },
      { k: "Primary artist", v: $("fArtist").value || "—", ok: !!$("fArtist").value.trim() },
      { k: "Cover artwork", v: hasArt ? "Attached" : "Missing", ok: hasArt },
      { k: "Genre / date", v: $("fGenre").value + " · " + ($("fDate").value || "—"), ok: !!$("fDate").value },
      { k: "Tracks", v: tracks.length + " (" + titledTracks + " titled)", ok: tracks.length >= 1 && titledTracks === tracks.length },
      { k: "Total runtime", v: fmt(totalDur()), ok: true },
      { k: "Content rating", v: isExplicit() ? "Explicit" : "Clean", ok: true }
    ];
    list.innerHTML = rows.map(function (r) {
      return '<li><span class="ck-key">' + r.k + '</span>' +
        '<span class="ck-val">' + esc(r.v) + '</span>' +
        '<span class="ck-flag ' + (r.ok ? "ok" : "warn") + '">' + (r.ok ? "Ready" : "Check") + '</span></li>';
    }).join("");
  }

  /* ---------- STEPPER ---------- */
  function validateStep(s) {
    if (s === 0) {
      if (!$("fTitle").value.trim()) { toast("Add a release title to continue"); return false; }
      if (!$("fArtist").value.trim()) { toast("Add a primary artist to continue"); return false; }
      if (!hasArt) { toast("Pick cover artwork to continue"); return false; }
    }
    if (s === 1) {
      var empty = tracks.some(function (t) { return !t.title.trim(); });
      if (empty) { toast("Every track needs a title"); return false; }
    }
    return true;
  }

  function goStep(s) {
    step = s;
    panels.forEach(function (p) { p.classList.toggle("is-active", Number(p.dataset.panel) === s); });
    steps.forEach(function (b) {
      var i = Number(b.dataset.step);
      b.classList.toggle("is-active", i === s);
      b.classList.toggle("is-done", i < s);
      if (i === s) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    prevBtn.disabled = s === 0;
    if (s < 2) {
      nextBtn.style.display = "";
      nextBtn.textContent = s === 0 ? "Next: Tracks" : "Next: Review";
    } else {
      nextBtn.style.display = "none";
    }
    if (s === 2) renderReview();
  }

  steps.forEach(function (b) {
    b.addEventListener("click", function () {
      var target = Number(b.dataset.step);
      // forward navigation must validate intermediate steps
      if (target > step) {
        for (var i = step; i < target; i++) { if (!validateStep(i)) return; }
      }
      goStep(target);
    });
  });
  nextBtn.addEventListener("click", function () {
    if (!validateStep(step)) return;
    goStep(Math.min(2, step + 1));
  });
  prevBtn.addEventListener("click", function () { goStep(Math.max(0, step - 1)); });

  /* ---------- PUBLISH ---------- */
  $("publish").addEventListener("click", function () {
    if (!validateStep(0) || !validateStep(1)) { goStep(0); return; }
    if (!$("fRights").checked) { toast("Confirm you control the rights"); return; }
    var btn = $("publish");
    btn.disabled = true;
    btn.textContent = "Distributing…";
    setTimeout(function () {
      btn.textContent = "Published ✓";
      toast('"' + ($("fTitle").value || "Release") + '" sent to stores');
      setTimeout(function () { btn.disabled = false; btn.textContent = "Publish release"; }, 2400);
    }, 1100);
  });

  /* ---------- INIT ---------- */
  pickCover();          // start with an attached cover so preview is themed
  renderTracks();
  renderPreview();
  renderReview();
  goStep(0);
})();
