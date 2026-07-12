(function () {
  "use strict";

  var TOTAL = 134; // 2:14 in seconds
  var stage = document.getElementById("stage");
  var poster = document.getElementById("poster");
  var player = document.getElementById("player");
  var track = document.getElementById("track");
  var tcNow = document.getElementById("tcNow");
  var toggleBtn = document.getElementById("toggleBtn");
  var muteBtn = document.getElementById("muteBtn");
  var closeBtn = document.getElementById("closeBtn");
  var backBtn = document.getElementById("backBtn");
  var fwdBtn = document.getElementById("fwdBtn");
  var sceneLabel = document.getElementById("sceneLabel");
  var toastEl = document.getElementById("toast");

  var current = 0;
  var playing = false;
  var muted = false;
  var timer = null;
  var toastTimer = null;

  var scenes = [
    { at: 0, label: "01 · Coastal Roast — brand film" },
    { at: 34, label: "02 · Meridian Watches — spot" },
    { at: 66, label: "03 · Field Notes — documentary" },
    { at: 98, label: "04 · Aurora Run — title sequence" }
  ];

  var clients = [
    ["Meridian", "◆"], ["Coastal", "▲"], ["Aurora", "✦"], ["Field&Co", "◈"],
    ["Northwind", "❖"], ["Lumen", "◐"], ["Veranda", "⬡"], ["Halcyon", "✧"]
  ];

  /* ---- clock ---- */
  function fmt(sec) {
    var f = Math.floor((sec % 1) * 24); // fake 24fps frame count
    var s = Math.floor(sec) % 60;
    var m = Math.floor(sec / 60);
    return pad(m) + ":" + pad(s) + ":" + pad(f);
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function sceneFor(sec) {
    var label = scenes[0].label;
    for (var i = 0; i < scenes.length; i++) {
      if (sec >= scenes[i].at) label = scenes[i].label;
    }
    return label;
  }

  function render() {
    var pct = (current / TOTAL) * 100;
    track.value = Math.round(current);
    track.style.setProperty("--pct", pct + "%");
    tcNow.textContent = fmt(current);
    var lbl = sceneFor(current);
    if (sceneLabel.textContent !== lbl) sceneLabel.textContent = lbl;
  }

  /* ---- toast ---- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("toast--show");
    }, 2400);
  }

  /* ---- playback ---- */
  function tick() {
    current += 0.25;
    if (current >= TOTAL) {
      current = TOTAL;
      render();
      pause();
      toast("Reel complete — encore?");
      return;
    }
    render();
  }

  function play() {
    playing = true;
    player.setAttribute("data-paused", "false");
    toggleBtn.setAttribute("aria-label", "Pause");
    swapToggleIcon();
    clearInterval(timer);
    timer = setInterval(tick, 250);
  }
  function pause() {
    playing = false;
    player.setAttribute("data-paused", "true");
    toggleBtn.setAttribute("aria-label", "Play");
    swapToggleIcon();
    clearInterval(timer);
  }
  function swapToggleIcon() {
    toggleBtn.querySelector(".ic-pause").hidden = !playing;
    toggleBtn.querySelector(".ic-play").hidden = playing;
  }

  function openPlayer() {
    if (stage.getAttribute("data-state") === "player") return;
    stage.setAttribute("data-state", "player");
    poster.style.opacity = "0";
    setTimeout(function () {
      poster.hidden = true;
      player.hidden = false;
      if (current >= TOTAL) current = 0;
      render();
      play();
    }, 260);
  }

  function closePlayer() {
    pause();
    player.hidden = true;
    poster.hidden = false;
    // force reflow so opacity transition replays
    void poster.offsetWidth;
    poster.style.opacity = "1";
    stage.setAttribute("data-state", "poster");
  }

  function seekBy(delta) {
    current = Math.max(0, Math.min(TOTAL, current + delta));
    render();
  }

  /* ---- wire up ---- */
  document.getElementById("playPad").addEventListener("click", openPlayer);
  document.getElementById("playBtn").addEventListener("click", openPlayer);

  toggleBtn.addEventListener("click", function () {
    playing ? pause() : play();
  });
  closeBtn.addEventListener("click", closePlayer);
  backBtn.addEventListener("click", function () { seekBy(-10); toast("‹ back 10s"); });
  fwdBtn.addEventListener("click", function () { seekBy(10); toast("forward 10s ›"); });

  muteBtn.addEventListener("click", function () {
    muted = !muted;
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    muteBtn.querySelector(".ic-vol").hidden = muted;
    muteBtn.querySelector(".ic-mute").hidden = !muted;
    toast(muted ? "Muted" : "Sound on");
  });

  track.addEventListener("input", function () {
    current = Number(track.value);
    render();
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-book]"), function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Booking request sent — we'll reply within a day.");
    });
  });

  /* keyboard: space toggles play when player open */
  document.addEventListener("keydown", function (e) {
    var open = stage.getAttribute("data-state") === "player";
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.code === "Space" && tag !== "input") {
      e.preventDefault();
      if (!open) openPlayer();
      else playing ? pause() : play();
    } else if (e.key === "Escape" && open) {
      closePlayer();
    }
  });

  /* build marquee (duplicated for seamless loop) */
  var row = document.getElementById("logoRow");
  var set = clients.concat(clients);
  set.forEach(function (c) {
    var li = document.createElement("li");
    li.className = "logo";
    li.innerHTML = '<span class="logo__glyph">' + c[1] + "</span>" + c[0];
    row.appendChild(li);
  });

  render();
})();
