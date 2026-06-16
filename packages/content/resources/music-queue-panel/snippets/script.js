(function () {
  "use strict";

  /* ---------- data ---------- */
  var THEMES = ["#1db954", "#8b5cf6", "#ff3d71", "#2dd4bf", "#f472b6", "#38bdf8"];

  var nowPlaying = {
    title: "Paper Lanterns",
    artist: "Neon Tides",
    art: 0,
    duration: 222 // 3:42
  };

  var queue = [
    { title: "Velvet Static", artist: "Halcyon Mode", art: 1, dur: 198 },
    { title: "Glass Harbor", artist: "Neon Tides", art: 2, dur: 245 },
    { title: "Reservoir Drift", artist: "Ivory Lanes", art: 3, dur: 174 },
    { title: "Slow Motion Rain", artist: "Halcyon Mode", art: 4, dur: 263 },
    { title: "Afterglow", artist: "Velour Skies", art: 5, dur: 211 }
  ];

  /* ---------- elements ---------- */
  var listEl = document.getElementById("trackList");
  var tpl = document.getElementById("trackTpl");
  var countEl = document.getElementById("queueCount");
  var emptyEl = document.getElementById("emptyState");
  var clearBtn = document.getElementById("clearBtn");
  var closeBtn = document.getElementById("closeBtn");
  var panel = document.querySelector(".panel");

  var npTitle = document.getElementById("npTitle");
  var npArtist = document.getElementById("npArtist");
  var npCover = panel.querySelector(".cover--lg");
  var playBtn = document.getElementById("playBtn");
  var nowBlock = document.getElementById("nowPlaying");

  var scrubBar = document.getElementById("scrubBar");
  var scrubFill = document.getElementById("scrubFill");
  var scrubKnob = document.getElementById("scrubKnob");
  var curTime = document.getElementById("curTime");
  var durTime = document.getElementById("durTime");

  /* ---------- helpers ---------- */
  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function setTheme(artIndex) {
    panel.style.setProperty("--theme", THEMES[artIndex % THEMES.length]);
  }

  /* ---------- now playing ---------- */
  var playing = true;
  var elapsed = 0;
  var tickTimer;

  function applyNowPlaying() {
    npTitle.textContent = nowPlaying.title;
    npArtist.textContent = nowPlaying.artist;
    npCover.setAttribute("data-art", String(nowPlaying.art));
    durTime.textContent = fmt(nowPlaying.duration);
    scrubBar.setAttribute("aria-valuemax", String(nowPlaying.duration));
    setTheme(nowPlaying.art);
    renderScrub();
  }

  function renderScrub() {
    var pct = nowPlaying.duration ? (elapsed / nowPlaying.duration) * 100 : 0;
    pct = Math.min(100, Math.max(0, pct));
    scrubFill.style.width = pct + "%";
    scrubKnob.style.left = pct + "%";
    curTime.textContent = fmt(elapsed);
    scrubBar.setAttribute("aria-valuenow", String(Math.floor(elapsed)));
  }

  function tick() {
    if (!playing) return;
    elapsed += 1;
    if (elapsed >= nowPlaying.duration) {
      // auto-advance to next queued track
      if (queue.length) {
        promote(0, true);
      } else {
        elapsed = nowPlaying.duration;
        setPlaying(false);
        toast("Queue finished");
      }
      return;
    }
    renderScrub();
  }

  function startClock() {
    clearInterval(tickTimer);
    tickTimer = setInterval(tick, 1000);
  }

  function setPlaying(state) {
    playing = state;
    playBtn.setAttribute("aria-pressed", String(state));
    playBtn.setAttribute("aria-label", state ? "Pause" : "Play");
    panel.classList.toggle("paused", !state);
  }

  playBtn.addEventListener("click", function () {
    setPlaying(!playing);
    toast(playing ? "Playing" : "Paused");
  });

  /* ---------- scrubber interaction ---------- */
  function seekFromClientX(clientX) {
    var rect = scrubBar.getBoundingClientRect();
    var ratio = (clientX - rect.left) / rect.width;
    ratio = Math.min(1, Math.max(0, ratio));
    elapsed = ratio * nowPlaying.duration;
    renderScrub();
  }
  var seeking = false;
  scrubBar.addEventListener("pointerdown", function (e) {
    seeking = true;
    scrubBar.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  });
  scrubBar.addEventListener("pointermove", function (e) {
    if (seeking) seekFromClientX(e.clientX);
  });
  scrubBar.addEventListener("pointerup", function () { seeking = false; });
  scrubBar.addEventListener("keydown", function (e) {
    var step = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") step = 5;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") step = -5;
    else if (e.key === "Home") { elapsed = 0; renderScrub(); e.preventDefault(); return; }
    else if (e.key === "End") { elapsed = nowPlaying.duration; renderScrub(); e.preventDefault(); return; }
    else return;
    elapsed = Math.min(nowPlaying.duration, Math.max(0, elapsed + step));
    renderScrub();
    e.preventDefault();
  });

  /* ---------- queue rendering ---------- */
  function render() {
    listEl.innerHTML = "";
    queue.forEach(function (t, i) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.index = String(i);
      node.querySelector(".cover--sm").setAttribute("data-art", String(t.art));
      node.querySelector(".track__title").textContent = t.title;
      node.querySelector(".track__artist").textContent = t.artist;
      node.querySelector(".track__dur").textContent = fmt(t.dur);

      var up = node.querySelector('[data-act="up"]');
      var down = node.querySelector('[data-act="down"]');
      up.disabled = i === 0;
      down.disabled = i === queue.length - 1;

      listEl.appendChild(node);
    });
    countEl.textContent = String(queue.length);
    emptyEl.hidden = queue.length > 0;
    clearBtn.disabled = queue.length === 0;
    clearBtn.style.opacity = queue.length === 0 ? "0.4" : "";
  }

  /* ---------- queue actions ---------- */
  function move(from, to) {
    if (to < 0 || to >= queue.length) return;
    var item = queue.splice(from, 1)[0];
    queue.splice(to, 0, item);
    render();
  }

  function remove(i) {
    var t = queue.splice(i, 1)[0];
    render();
    toast("Removed “" + t.title + "”");
  }

  function promote(i, isAuto) {
    var t = queue.splice(i, 1)[0];
    if (!t) return;
    nowPlaying = { title: t.title, artist: t.artist, art: t.art, duration: t.dur };
    elapsed = 0;
    applyNowPlaying();
    setPlaying(true);
    render();
    nowBlock.animate(
      [{ transform: "scale(0.985)", opacity: 0.65 }, { transform: "none", opacity: 1 }],
      { duration: 260, easing: "ease-out" }
    );
    if (!isAuto) toast("Now playing “" + t.title + "”");
  }

  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    var row = e.target.closest(".track");
    if (!row) return;
    var i = Number(row.dataset.index);
    if (btn) {
      var act = btn.dataset.act;
      if (act === "up") move(i, i - 1);
      else if (act === "down") move(i, i + 1);
      else if (act === "remove") remove(i);
      e.stopPropagation();
      return;
    }
    promote(i);
  });

  listEl.addEventListener("keydown", function (e) {
    var row = e.target.closest(".track");
    if (!row) return;
    if (e.target.tagName === "BUTTON") return;
    if (e.key === "Enter" || e.key === " ") {
      promote(Number(row.dataset.index));
      e.preventDefault();
    }
  });

  clearBtn.addEventListener("click", function () {
    if (!queue.length) return;
    queue = [];
    render();
    toast("Queue cleared");
  });

  closeBtn.addEventListener("click", function () {
    toast("Panel closed (demo)");
  });

  /* ---------- drag & drop reorder ---------- */
  var dragIndex = null;

  listEl.addEventListener("dragstart", function (e) {
    var row = e.target.closest(".track");
    if (!row) return;
    dragIndex = Number(row.dataset.index);
    row.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(dragIndex)); } catch (err) {}
  });

  listEl.addEventListener("dragend", function () {
    dragIndex = null;
    Array.prototype.forEach.call(listEl.children, function (c) {
      c.classList.remove("dragging", "drop-target");
    });
  });

  listEl.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    var row = e.target.closest(".track");
    Array.prototype.forEach.call(listEl.children, function (c) {
      c.classList.remove("drop-target");
    });
    if (row && Number(row.dataset.index) !== dragIndex) {
      row.classList.add("drop-target");
    }
  });

  listEl.addEventListener("drop", function (e) {
    e.preventDefault();
    var row = e.target.closest(".track");
    if (!row || dragIndex === null) return;
    var target = Number(row.dataset.index);
    if (target === dragIndex) return;
    move(dragIndex, target);
    toast("Reordered queue");
  });

  /* ---------- init ---------- */
  applyNowPlaying();
  setPlaying(true);
  render();
  startClock();
})();
