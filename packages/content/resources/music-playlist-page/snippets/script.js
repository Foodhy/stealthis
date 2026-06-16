(function () {
  "use strict";

  /* ---------- Data: fictional tracks ---------- */
  var TRACKS = [
    { title: "Paper Lanterns", artist: "Neon Tides", album: "Midnight Reservoir", added: "3 days ago", addedTs: 3, plays: 1842203, dur: 222, liked: true, g1: "#8b5cf6", g2: "#3b1d8a" },
    { title: "Velvet Static", artist: "Aurora Vale", album: "Glass Cathedral", added: "1 week ago", addedTs: 7, plays: 984551, dur: 198, liked: false, g1: "#ff3d71", g2: "#7a1338" },
    { title: "Slow Tide", artist: "Neon Tides", album: "Midnight Reservoir", added: "1 week ago", addedTs: 7, plays: 2310887, dur: 241, liked: true, g1: "#1db954", g2: "#0d5a2c" },
    { title: "Cobalt Rooms", artist: "Halcyon Drift", album: "Low Orbit", added: "2 weeks ago", addedTs: 14, plays: 612034, dur: 176, liked: false, g1: "#38bdf8", g2: "#134e6b" },
    { title: "Rainfall Theory", artist: "Mara Keene", album: "Quiet Engine", added: "3 weeks ago", addedTs: 21, plays: 1455920, dur: 263, liked: false, g1: "#f59e0b", g2: "#7c4a06" },
    { title: "Ghost Lights", artist: "Aurora Vale", album: "Glass Cathedral", added: "1 month ago", addedTs: 30, plays: 728410, dur: 209, liked: true, g1: "#ec4899", g2: "#6d1640" },
    { title: "Undertow", artist: "Halcyon Drift", album: "Low Orbit", added: "1 month ago", addedTs: 30, plays: 1990066, dur: 187, liked: false, g1: "#22d3ee", g2: "#0e5563" },
    { title: "Last Train Home", artist: "Mara Keene", album: "Quiet Engine", added: "2 months ago", addedTs: 60, plays: 3045112, dur: 254, liked: false, g1: "#a78bfa", g2: "#4c2a8a" }
  ];
  TRACKS.forEach(function (t, i) { t.id = i; t.order = i; });

  /* ---------- Helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function fmt(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function plays(n) { return n.toLocaleString("en-US"); }
  function grad(t) { return "linear-gradient(135deg, " + t.g1 + ", " + t.g2 + ")"; }

  var toasts = $("#toasts");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(function () { el.remove(); }, 2800);
  }

  /* ---------- Build rows ---------- */
  var tbody = $("#tbody");
  var search = $("#search");
  var sortSel = $("#sort");
  var empty = $("#empty");

  function buildRow(t) {
    var li = document.createElement("li");
    li.className = "row";
    li.dataset.id = t.id;
    li.innerHTML =
      '<span class="c-idx">' +
        '<span class="idx-num">' + (t.order + 1) + '</span>' +
        '<span class="idx-play">' +
          '<span class="play-tri ic-play"></span>' +
          '<span class="idx-eq"><i></i><i></i><i></i><i></i></span>' +
        '</span>' +
      '</span>' +
      '<span class="c-title">' +
        '<span class="tk-cover" style="background:' + grad(t) + '"></span>' +
        '<span class="tk-txt">' +
          '<span class="tk-name">' + t.title + '</span>' +
          '<span class="tk-artist">' + t.artist + '</span>' +
        '</span>' +
      '</span>' +
      '<span class="c-album">' + t.album + '</span>' +
      '<span class="c-added">' + t.added + '</span>' +
      '<span class="c-plays">' + plays(t.plays) + '</span>' +
      '<button class="like-btn" aria-pressed="' + t.liked + '" aria-label="Like ' + t.title + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.7 8.9 2.1 5.5 5.3 5.1 7.2 4.9 9 6 12 9c3-3 4.8-4.1 6.7-3.9 3.2.4 4.6 3.8 3.3 6.6C19.5 16.4 12 21 12 21z"/></svg>' +
      '</button>' +
      '<span class="c-dur">' + fmt(t.dur) + '</span>';
    return li;
  }

  function render() {
    var q = search.value.trim().toLowerCase();
    var list = TRACKS.slice();

    var sort = sortSel.value;
    var by = {
      custom: function (a, b) { return a.order - b.order; },
      title: function (a, b) { return a.title.localeCompare(b.title); },
      artist: function (a, b) { return a.artist.localeCompare(b.artist); },
      added: function (a, b) { return a.addedTs - b.addedTs; },
      plays: function (a, b) { return b.plays - a.plays; },
      duration: function (a, b) { return a.dur - b.dur; }
    }[sort];
    list.sort(by);

    if (q) {
      list = list.filter(function (t) {
        return (t.title + " " + t.artist + " " + t.album).toLowerCase().indexOf(q) > -1;
      });
    }

    tbody.innerHTML = "";
    list.forEach(function (t) { tbody.appendChild(buildRow(t)); });
    empty.hidden = list.length > 0;
    syncActiveRow();
  }

  /* ---------- Like toggles ---------- */
  function syncLikeCount() {
    var base = 12489;
    var extra = TRACKS.filter(function (t) { return t.liked; }).length;
    $("#likeCount").textContent = (base + extra).toLocaleString("en-US");
  }

  tbody.addEventListener("click", function (e) {
    var likeBtn = e.target.closest(".like-btn");
    if (likeBtn) {
      e.stopPropagation();
      var row = likeBtn.closest(".row");
      var t = TRACKS[+row.dataset.id];
      t.liked = !t.liked;
      likeBtn.setAttribute("aria-pressed", String(t.liked));
      if (current && current.id === t.id) npLike.setAttribute("aria-pressed", String(t.liked));
      syncLikeCount();
      toast(t.liked ? "Added to Liked Songs" : "Removed from Liked Songs");
      return;
    }
    var row2 = e.target.closest(".row");
    if (row2) playTrack(TRACKS[+row2.dataset.id], true);
  });

  /* ---------- Player engine ---------- */
  var nowbar = $("#nowbar");
  var npCover = $("#npCover"), npTitle = $("#npTitle"), npArtist = $("#npArtist");
  var npLike = $("#npLike"), npPlay = $("#npPlay");
  var npCur = $("#npCur"), npTot = $("#npTot");
  var scrub = $("#scrub"), scrubFill = $("#scrubFill"), scrubKnob = $("#scrubKnob");
  var btnPlay = $("#btnPlay");

  var current = null;
  var playing = false;
  var elapsed = 0;
  var shuffle = false;
  var timer = null;

  function playOrder() {
    // current visible/sorted order of ids
    return Array.prototype.map.call(tbody.children, function (r) { return +r.dataset.id; });
  }

  function syncActiveRow() {
    Array.prototype.forEach.call(tbody.children, function (r) {
      var on = current && +r.dataset.id === current.id;
      r.classList.toggle("active", on);
      r.classList.toggle("paused", on && !playing);
    });
  }

  function setScrub(pct) {
    scrubFill.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    scrub.setAttribute("aria-valuenow", Math.round(pct));
  }

  function tick() {
    if (!playing || !current) return;
    elapsed += 1;
    if (elapsed >= current.dur) { next(); return; }
    npCur.textContent = fmt(elapsed);
    setScrub((elapsed / current.dur) * 100);
  }

  function startTimer() { clearInterval(timer); timer = setInterval(tick, 1000); }

  function setPlaying(on) {
    playing = on;
    nowbar.classList.toggle("paused", !on);
    npPlay.setAttribute("aria-pressed", String(on));
    npPlay.setAttribute("aria-label", on ? "Pause" : "Play");
    btnPlay.setAttribute("aria-pressed", String(on));
    $(".lbl", btnPlay).textContent = on ? "Pause" : "Play";
    syncActiveRow();
    if (on) startTimer(); else clearInterval(timer);
  }

  function loadTrack(t, resetTime) {
    current = t;
    if (resetTime) elapsed = 0;
    nowbar.hidden = false;
    npCover.style.background = grad(t);
    npTitle.textContent = t.title;
    npArtist.textContent = t.artist;
    npLike.setAttribute("aria-pressed", String(t.liked));
    npTot.textContent = fmt(t.dur);
    npCur.textContent = fmt(elapsed);
    setScrub((elapsed / t.dur) * 100);
    document.body.style.setProperty("--theme", t.g1);
    syncActiveRow();
  }

  function playTrack(t, resetTime) {
    var same = current && current.id === t.id;
    loadTrack(t, resetTime && !same);
    if (same) { setPlaying(!playing); }
    else { setPlaying(true); }
  }

  function firstInView() {
    var order = playOrder();
    return order.length ? TRACKS[order[0]] : TRACKS[0];
  }

  function next() {
    var order = playOrder();
    if (!order.length) return;
    if (shuffle) {
      var pool = order.filter(function (id) { return !current || id !== current.id; });
      var pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : order[0];
      playTrack(TRACKS[pick], true);
      return;
    }
    var idx = current ? order.indexOf(current.id) : -1;
    var nextId = order[(idx + 1) % order.length];
    playTrack(TRACKS[nextId], true);
  }

  function prev() {
    if (elapsed > 3) { elapsed = 0; loadTrack(current, false); return; }
    var order = playOrder();
    if (!order.length) return;
    var idx = current ? order.indexOf(current.id) : 0;
    var prevId = order[(idx - 1 + order.length) % order.length];
    playTrack(TRACKS[prevId], true);
  }

  /* ---------- Top + bar controls ---------- */
  btnPlay.addEventListener("click", function () {
    if (!current) playTrack(firstInView(), true);
    else setPlaying(!playing);
  });
  npPlay.addEventListener("click", function () {
    if (!current) playTrack(firstInView(), true);
    else setPlaying(!playing);
  });
  $("#npNext").addEventListener("click", next);
  $("#npPrev").addEventListener("click", prev);

  npLike.addEventListener("click", function () {
    if (!current) return;
    current.liked = !current.liked;
    npLike.setAttribute("aria-pressed", String(current.liked));
    var row = tbody.querySelector('.row[data-id="' + current.id + '"] .like-btn');
    if (row) row.setAttribute("aria-pressed", String(current.liked));
    syncLikeCount();
    toast(current.liked ? "Added to Liked Songs" : "Removed from Liked Songs");
  });

  var btnShuffle = $("#btnShuffle");
  btnShuffle.addEventListener("click", function () {
    shuffle = !shuffle;
    btnShuffle.setAttribute("aria-pressed", String(shuffle));
    toast(shuffle ? "Shuffle on" : "Shuffle off");
    if (shuffle && !playing) playTrack(firstInView(), true);
  });

  var btnLikeAll = $("#btnLikeAll");
  btnLikeAll.addEventListener("click", function () {
    var on = btnLikeAll.getAttribute("aria-pressed") !== "true";
    btnLikeAll.setAttribute("aria-pressed", String(on));
    toast(on ? "Saved to Your Library" : "Removed from Your Library");
  });

  /* ---------- Scrubber: click, drag, keyboard ---------- */
  function seekFromX(clientX) {
    if (!current) return;
    var rect = scrub.getBoundingClientRect();
    var pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    elapsed = Math.round(pct * current.dur);
    npCur.textContent = fmt(elapsed);
    setScrub(pct * 100);
  }
  var dragging = false;
  scrub.addEventListener("pointerdown", function (e) {
    if (!current) return;
    dragging = true;
    scrub.setPointerCapture(e.pointerId);
    seekFromX(e.clientX);
  });
  scrub.addEventListener("pointermove", function (e) { if (dragging) seekFromX(e.clientX); });
  scrub.addEventListener("pointerup", function () { dragging = false; });
  scrub.addEventListener("keydown", function (e) {
    if (!current) return;
    if (e.key === "ArrowLeft") { elapsed = Math.max(0, elapsed - 5); }
    else if (e.key === "ArrowRight") { elapsed = Math.min(current.dur, elapsed + 5); }
    else if (e.key === "Home") { elapsed = 0; }
    else if (e.key === "End") { elapsed = current.dur - 1; }
    else return;
    e.preventDefault();
    npCur.textContent = fmt(elapsed);
    setScrub((elapsed / current.dur) * 100);
  });

  /* ---------- Search + sort ---------- */
  search.addEventListener("input", render);
  sortSel.addEventListener("change", function () {
    render();
    toast("Sorted by " + sortSel.options[sortSel.selectedIndex].text.toLowerCase());
  });

  /* ---------- Popovers (share + more) ---------- */
  function wirePopover(btn, pop) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !pop.hidden;
      closeAllPops();
      if (!open) { pop.hidden = false; btn.setAttribute("aria-expanded", "true"); }
    });
  }
  function closeAllPops() {
    [["#btnShare", "#sharePop"], ["#btnMore", "#morePop"]].forEach(function (p) {
      $(p[1]).hidden = true;
      $(p[0]).setAttribute("aria-expanded", "false");
    });
  }
  wirePopover($("#btnShare"), $("#sharePop"));
  wirePopover($("#btnMore"), $("#morePop"));
  document.addEventListener("click", closeAllPops);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAllPops(); });

  $("#sharePop").addEventListener("click", function (e) { e.stopPropagation(); });
  Array.prototype.forEach.call(document.querySelectorAll(".share-chip"), function (c) {
    c.addEventListener("click", function () { closeAllPops(); toast("Shared via " + c.dataset.share); });
  });

  var copyBtn = $("#copyBtn"), copyInput = $("#copyInput");
  copyBtn.addEventListener("click", function () {
    var done = function () {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("done");
      toast("Link copied to clipboard");
      setTimeout(function () { copyBtn.textContent = "Copy link"; copyBtn.classList.remove("done"); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyInput.value).then(done, function () {
        copyInput.select(); document.execCommand && document.execCommand("copy"); done();
      });
    } else {
      copyInput.select(); document.execCommand && document.execCommand("copy"); done();
    }
  });

  $("#morePop").addEventListener("click", function (e) {
    var item = e.target.closest(".menu-item");
    if (item) { closeAllPops(); toast(item.dataset.act); }
  });

  /* ---------- Editable title ---------- */
  var plTitle = $("#plTitle");
  plTitle.addEventListener("click", function () { startEdit(); });
  plTitle.addEventListener("keydown", function (e) {
    if (!plTitle.isContentEditable && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); startEdit(); }
  });
  function startEdit() {
    plTitle.contentEditable = "true";
    plTitle.classList.add("editing");
    plTitle.focus();
    var r = document.createRange();
    r.selectNodeContents(plTitle);
    var sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(r);
  }
  function endEdit(save) {
    plTitle.contentEditable = "false";
    plTitle.classList.remove("editing");
    var v = plTitle.textContent.trim();
    if (!v) { plTitle.textContent = "Untitled playlist"; }
    if (save) { document.title = plTitle.textContent + " — Playlist"; toast("Playlist renamed"); }
  }
  plTitle.addEventListener("keydown", function (e) {
    if (!plTitle.isContentEditable) return;
    if (e.key === "Enter") { e.preventDefault(); plTitle.blur(); }
    if (e.key === "Escape") { plTitle.blur(); }
  });
  plTitle.addEventListener("blur", function () { if (plTitle.isContentEditable) endEdit(true); });

  /* ---------- Footer stats ---------- */
  function initStats() {
    $("#trackCount").textContent = TRACKS.length;
    var total = TRACKS.reduce(function (s, t) { return s + t.dur; }, 0);
    var min = Math.round(total / 60);
    $("#totalDur").textContent = min + " min";
    syncLikeCount();
  }

  /* ---------- Init ---------- */
  initStats();
  render();
})();
