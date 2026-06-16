(function () {
  "use strict";

  /* ---------- fictional data ---------- */
  var TRACKS = [
    { title: "Paper Lanterns", artist: "Neon Tides", album: "Midnight Reservoir", dur: 222, plays: 4823910, liked: true, explicit: false, ca: "#8b5cf6", cb: "#1db954" },
    { title: "Velvet Static", artist: "Halcyon Drift", album: "Glasshouse", dur: 198, plays: 2210458, liked: false, explicit: true, ca: "#ff3d71", cb: "#8b5cf6" },
    { title: "Saltwater Neon", artist: "Neon Tides", album: "Midnight Reservoir", dur: 245, plays: 6740022, liked: false, explicit: false, ca: "#1db954", cb: "#22d3ee" },
    { title: "Low Tide Lullaby", artist: "Marble Coast", album: "Slow Channels", dur: 263, plays: 982304, liked: true, explicit: false, ca: "#f59e0b", cb: "#ff3d71" },
    { title: "Concrete Bloom", artist: "Sable Wren", album: "Quiet Riot Hour", dur: 187, plays: 3315677, liked: false, explicit: true, ca: "#22d3ee", cb: "#8b5cf6" },
    { title: "Half-Light Avenue", artist: "Halcyon Drift", album: "Glasshouse", dur: 231, plays: 1572988, liked: false, explicit: false, ca: "#8b5cf6", cb: "#ff3d71" },
    { title: "After the Reservoir", artist: "Neon Tides", album: "Midnight Reservoir", dur: 274, plays: 5093411, liked: true, explicit: false, ca: "#1db954", cb: "#f59e0b" }
  ];

  /* ---------- helpers ---------- */
  function fmtDur(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function fmtPlays(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  /* ---------- svg snippets ---------- */
  var SVG = {
    play: '<svg class="ico-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg class="ico-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.7-4.3-9.3-8.3C.8 9.8 2 6.4 5 6c1.9-.2 3.4.9 4 2 .6-1.1 2.1-2.2 4-2 3 .4 4.2 3.8 2.3 6.7C18.7 16.7 12 21 12 21z"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    grip: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>'
  };

  /* ---------- state ---------- */
  var rowsEl = document.getElementById("rows");
  var playAllBtn = document.getElementById("playAll");
  var playAllLabel = playAllBtn.querySelector(".tl-playall-label");
  var activeIndex = -1; // index into TRACKS of the active track (by id)
  var isPlaying = false;

  /* build rows */
  function buildRow(track, displayNum) {
    var li = document.createElement("li");
    li.className = "row";
    li.setAttribute("role", "listitem");
    li.dataset.title = track.title;
    li.tabIndex = 0;

    var explicit = track.explicit
      ? '<span class="t-explicit" title="Explicit">E</span>'
      : "";

    li.innerHTML =
      '<span class="drag-handle" draggable="true" title="Drag to reorder" aria-label="Reorder ' + track.title + '">' + SVG.grip + "</span>" +
      '<div class="cell-idx">' +
        '<span class="idx-num">' + displayNum + "</span>" +
        '<button class="idx-play" type="button" aria-label="Play ' + track.title + '" aria-pressed="false">' +
          SVG.play + SVG.pause +
        "</button>" +
        '<span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
      "</div>" +
      '<div class="cell-title">' +
        '<span class="row-art" style="--ca:' + track.ca + ";--cb:" + track.cb + '"></span>' +
        '<span class="title-text">' +
          '<span class="t-name">' + track.title + "</span>" +
          '<span class="t-artist">' + explicit + track.artist + "</span>" +
        "</span>" +
      "</div>" +
      '<span class="cell-album"><a href="#" tabindex="-1">' + track.album + "</a></span>" +
      '<span class="cell-plays">' + fmtPlays(track.plays) + "</span>" +
      '<div class="cell-dur">' +
        '<button class="icon-btn like-btn" type="button" aria-label="Like ' + track.title + '" aria-pressed="' + (track.liked ? "true" : "false") + '">' + SVG.heart + "</button>" +
        '<span class="t-dur">' + fmtDur(track.dur) + "</span>" +
        '<button class="icon-btn more-btn" type="button" aria-label="More options" aria-haspopup="true">' + SVG.more + "</button>" +
      "</div>";

    return li;
  }

  function render() {
    rowsEl.innerHTML = "";
    TRACKS.forEach(function (track, i) {
      rowsEl.appendChild(buildRow(track, i + 1));
    });
  }

  /* ---------- playback ---------- */
  function indexOfRow(rowEl) {
    return Array.prototype.indexOf.call(rowsEl.children, rowEl);
  }

  function syncRow(rowEl, playing) {
    var pressed = playing && isPlaying;
    rowEl.classList.toggle("is-playing", playing);
    rowEl.classList.toggle("is-paused", playing && !isPlaying);
    var idxBtn = rowEl.querySelector(".idx-play");
    idxBtn.setAttribute("aria-pressed", pressed ? "true" : "false");
    idxBtn.querySelector(".ico-play").style.display = pressed ? "none" : "block";
    idxBtn.querySelector(".ico-pause").style.display = pressed ? "block" : "none";
  }

  function refreshAll() {
    Array.prototype.forEach.call(rowsEl.children, function (rowEl, i) {
      syncRow(rowEl, i === activeIndex);
    });
    var anyPlaying = activeIndex >= 0 && isPlaying;
    playAllBtn.setAttribute("aria-pressed", anyPlaying ? "true" : "false");
    playAllLabel.textContent = anyPlaying ? "Pause" : "Play";
  }

  function playIndex(i) {
    if (i === activeIndex) {
      isPlaying = !isPlaying;
      refreshAll();
      toast(isPlaying ? "Resumed · " + TRACKS[i].title : "Paused");
      return;
    }
    activeIndex = i;
    isPlaying = true;
    refreshAll();
    toast("Now playing · " + TRACKS[i].title + " — " + TRACKS[i].artist);
  }

  /* ---------- delegated clicks ---------- */
  rowsEl.addEventListener("click", function (e) {
    var rowEl = e.target.closest(".row");
    if (!rowEl) return;
    var i = indexOfRow(rowEl);

    var like = e.target.closest(".like-btn");
    if (like) {
      e.stopPropagation();
      var on = like.getAttribute("aria-pressed") !== "true";
      like.setAttribute("aria-pressed", on ? "true" : "false");
      TRACKS[i].liked = on;
      toast(on ? "Added to Liked Songs ♥" : "Removed from Liked Songs");
      return;
    }

    var more = e.target.closest(".more-btn");
    if (more) {
      e.stopPropagation();
      openMenu(more, i);
      return;
    }

    if (e.target.closest(".cell-album a")) {
      e.preventDefault();
      e.stopPropagation();
      toast("Album · " + TRACKS[i].album);
      return;
    }

    // row body or idx-play button -> toggle playback
    playIndex(i);
  });

  /* keyboard: Enter/Space on a focused row plays it */
  rowsEl.addEventListener("keydown", function (e) {
    var rowEl = e.target.closest(".row");
    if (!rowEl) return;
    if (e.target.closest("button") || e.target.closest("a")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      playIndex(indexOfRow(rowEl));
    }
  });

  /* ---------- play all ---------- */
  playAllBtn.addEventListener("click", function () {
    if (activeIndex < 0) {
      playIndex(0);
    } else {
      isPlaying = !isPlaying;
      refreshAll();
      toast(isPlaying ? "Resumed playlist" : "Paused");
    }
  });

  /* ---------- ... menu ---------- */
  var menuEl = null;
  function closeMenu() {
    if (menuEl) {
      menuEl.remove();
      menuEl = null;
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("keydown", onMenuKey);
    }
  }
  function onDocClick(e) {
    if (menuEl && !menuEl.contains(e.target)) closeMenu();
  }
  function onMenuKey(e) {
    if (e.key === "Escape") closeMenu();
  }
  function openMenu(btn, i) {
    closeMenu();
    var t = TRACKS[i];
    menuEl = document.createElement("div");
    menuEl.className = "menu open";
    menuEl.setAttribute("role", "menu");
    var items = [
      { label: "Add to queue", action: function () { toast("Queued · " + t.title); } },
      { label: "Go to artist", action: function () { toast("Artist · " + t.artist); } },
      { label: "Go to album", action: function () { toast("Album · " + t.album); } },
      { sep: true },
      { label: "Copy song link", action: function () { toast("Link copied to clipboard"); } }
    ];
    items.forEach(function (it) {
      if (it.sep) {
        menuEl.appendChild(document.createElement("hr"));
        return;
      }
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "menuitem");
      b.textContent = it.label;
      b.addEventListener("click", function () {
        it.action();
        closeMenu();
      });
      menuEl.appendChild(b);
    });
    document.body.appendChild(menuEl);

    var r = btn.getBoundingClientRect();
    var mw = menuEl.offsetWidth;
    var left = Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8));
    var top = r.bottom + 6;
    if (top + menuEl.offsetHeight > window.innerHeight - 8) {
      top = r.top - menuEl.offsetHeight - 6;
    }
    menuEl.style.left = left + "px";
    menuEl.style.top = top + "px";

    setTimeout(function () {
      document.addEventListener("click", onDocClick, true);
      document.addEventListener("keydown", onMenuKey);
    }, 0);
  }

  /* ---------- drag to reorder ---------- */
  var dragRow = null;
  rowsEl.addEventListener("dragstart", function (e) {
    var handle = e.target.closest(".drag-handle");
    if (!handle) {
      e.preventDefault();
      return;
    }
    dragRow = handle.closest(".row");
    dragRow.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", dragRow.dataset.title);
    } catch (err) {}
  });

  rowsEl.addEventListener("dragover", function (e) {
    if (!dragRow) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    var over = e.target.closest(".row");
    Array.prototype.forEach.call(rowsEl.children, function (r) {
      r.classList.toggle("drag-over", r === over && r !== dragRow);
    });
    if (over && over !== dragRow) {
      var rect = over.getBoundingClientRect();
      var after = e.clientY > rect.top + rect.height / 2;
      rowsEl.insertBefore(dragRow, after ? over.nextSibling : over);
    }
  });

  function endDrag() {
    if (!dragRow) return;
    dragRow.classList.remove("dragging");
    Array.prototype.forEach.call(rowsEl.children, function (r) {
      r.classList.remove("drag-over");
    });

    // rebuild TRACKS order from DOM (match by title)
    var newOrder = [];
    Array.prototype.forEach.call(rowsEl.children, function (r) {
      var match = TRACKS.filter(function (t) { return t.title === r.dataset.title; })[0];
      if (match) newOrder.push(match);
    });
    var activeTitle = activeIndex >= 0 ? TRACKS[activeIndex].title : null;
    TRACKS.length = 0;
    Array.prototype.push.apply(TRACKS, newOrder);
    if (activeTitle) {
      activeIndex = TRACKS.map(function (t) { return t.title; }).indexOf(activeTitle);
    }

    // re-number visible indices without full rebuild
    Array.prototype.forEach.call(rowsEl.children, function (r, i) {
      r.querySelector(".idx-num").textContent = i + 1;
    });
    refreshAll();
    toast("Playlist reordered");
    dragRow = null;
  }

  rowsEl.addEventListener("drop", function (e) {
    e.preventDefault();
    endDrag();
  });
  rowsEl.addEventListener("dragend", endDrag);

  /* ---------- simulate slowly ticking play counts on active track ---------- */
  setInterval(function () {
    if (activeIndex >= 0 && isPlaying) {
      TRACKS[activeIndex].plays += Math.floor(Math.random() * 4) + 1;
      var rowEl = rowsEl.children[activeIndex];
      if (rowEl) {
        var pc = rowEl.querySelector(".cell-plays");
        if (pc) pc.textContent = fmtPlays(TRACKS[activeIndex].plays);
      }
    }
  }, 2500);

  /* ---------- init ---------- */
  render();
  refreshAll();
})();
