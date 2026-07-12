(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Data ---------- */
  var STILLS = [
    { img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=60", tc: "00:01:14", cap: "Keeper's routine — lamp room, dawn" },
    { img: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=60", tc: "00:03:48", cap: "The tide turns on the north reef" },
    { img: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=60", tc: "00:06:02", cap: "Fog flattens the horizon line" },
    { img: "https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?auto=format&fit=crop&w=1200&q=60", tc: "00:08:37", cap: "A signal light answers offshore" },
    { img: "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?auto=format&fit=crop&w=1200&q=60", tc: "00:11:20", cap: "Oren counts down the beacon" },
    { img: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1200&q=60", tc: "00:13:55", cap: "Final frame — the automated dawn" }
  ];

  var CREDITS = [
    { role: "Director", name: "Mara Voss", dept: "Direction" },
    { role: "Editor", name: "Mara Voss", dept: "Direction" },
    { role: "Producer", name: "Ilya Renner", dept: "Direction" },
    { role: "Director of Photography", name: "Sena Okoro", dept: "Camera" },
    { role: "1st AC", name: "Tomas Beck", dept: "Camera" },
    { role: "Gaffer", name: "Priya Malhotra", dept: "Camera" },
    { role: "Production Designer", name: "Eli Fontaine", dept: "Art" },
    { role: "Colorist", name: "Wren Haas", dept: "Post" },
    { role: "Sound Designer", name: "Jonah Vega", dept: "Sound" },
    { role: "Composer", name: "Aster Lund", dept: "Sound" }
  ];

  var RELATED = [
    { title: "Low Tide", year: "2024", meta: "Documentary short", runtime: "09:41", img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=60" },
    { title: "Salt & Signal", year: "2023", meta: "Music film", runtime: "04:12", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60" },
    { title: "The Keeper", year: "2022", meta: "Narrative short", runtime: "17:30", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=60" }
  ];

  var TOTAL = 862; // 14:22 in seconds

  /* ---------- Toast helper ---------- */
  var host = $("toastHost");
  function toast(msg, icon) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="toast-ic">' + (icon || "✓") + "</span><span></span>";
    t.lastChild.textContent = msg;
    host.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 260);
    }, 2600);
  }

  /* ---------- Time formatting ---------- */
  function fmt(sec) {
    sec = Math.max(0, Math.min(TOTAL, Math.round(sec)));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return p(h) + ":" + p(m) + ":" + p(s);
  }

  /* ---------- Player transport ---------- */
  var player = $("player");
  var playBtn = $("playBtn");
  var miniPlay = $("miniPlay");
  var scrub = $("scrub");
  var fill = $("scrubFill");
  var thumb = $("scrubThumb");
  var tcCurrent = $("tcCurrent");
  var poster = player.querySelector(".poster");
  var pos = 0;
  var playing = false;
  var timer = null;

  function paintScrub() {
    var pct = (pos / TOTAL) * 100;
    fill.style.width = pct + "%";
    thumb.style.left = pct + "%";
    tcCurrent.textContent = fmt(pos);
    scrub.setAttribute("aria-valuenow", Math.round(pos));
    scrub.setAttribute("aria-valuetext", fmt(pos));
  }

  function setPlaying(state) {
    playing = state;
    player.setAttribute("data-playing", state ? "true" : "false");
    playBtn.setAttribute("aria-label", state ? "Pause film" : "Play film");
    miniPlay.textContent = state ? "❚❚" : "▶";
    if (state) {
      timer = setInterval(function () {
        pos += 1;
        if (pos >= TOTAL) { pos = TOTAL; setPlaying(false); toast("Playback complete", "✓"); }
        paintScrub();
      }, 250); // sped-up simulated transport
    } else {
      clearInterval(timer);
    }
  }

  function togglePlay() { setPlaying(!playing); }
  playBtn.addEventListener("click", togglePlay);
  miniPlay.addEventListener("click", togglePlay);

  /* seek on scrub */
  function seekFromEvent(e) {
    var rect = scrub.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    pos = Math.max(0, Math.min(1, x / rect.width)) * TOTAL;
    paintScrub();
  }
  var dragging = false;
  scrub.addEventListener("pointerdown", function (e) {
    dragging = true;
    scrub.setPointerCapture(e.pointerId);
    seekFromEvent(e);
  });
  scrub.addEventListener("pointermove", function (e) { if (dragging) seekFromEvent(e); });
  scrub.addEventListener("pointerup", function () { dragging = false; });

  scrub.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 30 : 5;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { pos = Math.min(TOTAL, pos + step); paintScrub(); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { pos = Math.max(0, pos - step); paintScrub(); e.preventDefault(); }
    else if (e.key === "Home") { pos = 0; paintScrub(); e.preventDefault(); }
    else if (e.key === "End") { pos = TOTAL; paintScrub(); e.preventDefault(); }
  });

  /* spacebar toggles play when not typing in a field */
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && document.activeElement && document.activeElement.tagName !== "BUTTON" && !lbOpen) {
      var tag = document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      togglePlay();
      e.preventDefault();
    }
  });

  paintScrub();

  /* ---------- Synopsis toggle ---------- */
  var synToggle = $("synToggle");
  var synMore = $("synMore");
  synToggle.addEventListener("click", function () {
    var open = synMore.hasAttribute("hidden");
    if (open) { synMore.removeAttribute("hidden"); } else { synMore.setAttribute("hidden", ""); }
    synToggle.setAttribute("aria-expanded", open ? "true" : "false");
    synToggle.firstChild.textContent = open ? "Hide director's notes " : "Read director's notes ";
  });

  /* ---------- Stills gallery ---------- */
  var strip = $("filmstrip");
  $("stillCount").textContent = STILLS.length + " frames";
  STILLS.forEach(function (s, i) {
    var el = document.createElement("button");
    el.className = "still";
    el.type = "button";
    el.setAttribute("role", "listitem");
    el.setAttribute("aria-label", "Open still " + (i + 1) + ": " + s.cap);
    el.style.backgroundImage = "url('" + s.img + "')";
    el.innerHTML = '<span class="still-tc">' + s.tc + "</span>";
    el.addEventListener("click", function () { openLightbox(i); });
    strip.appendChild(el);
  });

  /* ---------- Credits + filter ---------- */
  var creditList = $("creditList");
  var credFilters = $("credFilters");
  var depts = ["All"];
  CREDITS.forEach(function (c) { if (depts.indexOf(c.dept) === -1) depts.push(c.dept); });

  function renderCredits(filter) {
    creditList.innerHTML = "";
    CREDITS.filter(function (c) { return filter === "All" || c.dept === filter; }).forEach(function (c) {
      var li = document.createElement("li");
      li.className = "credit";
      li.innerHTML =
        '<span class="role">' + c.role + '</span>' +
        '<span class="name">' + c.name +
        (filter === "All" ? '<span class="dept-tag">' + c.dept + "</span>" : "") +
        "</span>";
      creditList.appendChild(li);
    });
  }

  depts.forEach(function (d, i) {
    var b = document.createElement("button");
    b.className = "pill";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.textContent = d;
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.addEventListener("click", function () {
      credFilters.querySelectorAll(".pill").forEach(function (p) { p.setAttribute("aria-selected", "false"); });
      b.setAttribute("aria-selected", "true");
      renderCredits(d);
    });
    credFilters.appendChild(b);
  });
  renderCredits("All");

  /* ---------- Related rail ---------- */
  var rail = $("relRail");
  RELATED.forEach(function (r) {
    var card = document.createElement("article");
    card.className = "rel-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", r.title + " — " + r.meta + ", " + r.runtime);
    card.innerHTML =
      '<div class="rel-thumb" style="background-image:url(\'' + r.img + "')\">" +
      '<span class="rel-runtime">' + r.runtime + "</span></div>" +
      '<div class="rel-body"><div class="rel-year">' + r.year + "</div>" +
      '<div class="rel-title">' + r.title + "</div>" +
      '<div class="rel-meta">' + r.meta + "</div></div>";
    var go = function () { toast('Opening "' + r.title + '"', "▶"); };
    card.addEventListener("click", go);
    card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    rail.appendChild(card);
  });

  /* ---------- Lightbox ---------- */
  var lightbox = $("lightbox");
  var lbImg = $("lbImg");
  var lbCap = $("lbCaption");
  var lbIndex = $("lbIndex");
  var lbOpen = false;
  var current = 0;
  var lastFocus = null;

  function renderLightbox() {
    var s = STILLS[current];
    lbImg.style.backgroundImage = "url('" + s.img + "')";
    lbCap.textContent = s.cap;
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    lbIndex.textContent = p(current + 1) + " / " + p(STILLS.length);
    // sync hero poster to the selected still for a "swap the poster frame" feel
    poster.style.backgroundImage =
      "linear-gradient(120deg, rgba(255,176,32,.28), rgba(255,77,77,.20)), url('" + s.img + "')";
  }

  function openLightbox(i) {
    current = i;
    lastFocus = document.activeElement;
    renderLightbox();
    lightbox.hidden = false;
    lbOpen = true;
    $("lbClose").focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lbOpen = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(d) {
    current = (current + d + STILLS.length) % STILLS.length;
    renderLightbox();
  }

  $("lbPrev").addEventListener("click", function () { step(-1); });
  $("lbNext").addEventListener("click", function () { step(1); });
  $("lbClose").addEventListener("click", closeLightbox);
  lightbox.querySelector("[data-close]").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (!lbOpen) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* ---------- Topbar actions ---------- */
  var saveBtn = $("saveBtn");
  var saved = false;
  saveBtn.addEventListener("click", function () {
    saved = !saved;
    saveBtn.classList.toggle("is-on", saved);
    saveBtn.innerHTML = (saved ? "★" : "☆") + " " + (saved ? "Saved" : "Save");
    toast(saved ? "Saved to your board" : "Removed from board", saved ? "★" : "☆");
  });

  $("shareBtn").addEventListener("click", function () {
    var url = "https://vossfilm.example/work/halcyon-drift";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { toast("Share link copied to clipboard", "↗"); },
        function () { toast("Share: " + url, "↗"); }
      );
    } else {
      toast("Share: " + url, "↗");
    }
  });

  $("reelBtn").addEventListener("click", function () {
    toast("Press kit requested — check your inbox", "✉");
  });
})();
