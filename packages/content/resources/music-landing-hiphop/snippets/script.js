(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function parseLen(str) {
    var p = String(str).split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  /* ---------- toast ---------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* ============================================================
     SIMULATED PLAYER
     One shared transport drives: hero button, cover button,
     per-track buttons, equalizer, boombox, scrubber.
  ============================================================ */
  var tracks = $$(".track");
  var trackData = tracks.map(function (li) {
    return {
      el: li,
      name: li.getAttribute("data-name"),
      len: parseLen(li.getAttribute("data-len")),
      playBtn: $(".track__play", li)
    };
  });

  var player = {
    index: 0,
    pos: 0,
    playing: false,
    timer: null
  };

  // shared UI refs
  var eq = $("#eq");
  var boombox = $("#boombox");
  var heroBtn = $("#playHero");
  var heroLabel = $("#playLabel");
  var coverBtn = $("#coverPlay");
  var nowTrack = $("#nowTrack");
  var curTime = $("#curTime");
  var scrubFill = $("#scrubFill");
  var scrubKnob = $("#scrubKnob");
  var scrubBar = $("#scrubBar");
  var scrubCur = $("#scrubCur");
  var scrubTotal = $("#scrubTotal");

  function currentLen() {
    return trackData[player.index].len;
  }

  function renderTransport() {
    var t = trackData[player.index];
    var len = t.len;
    var ratio = len ? player.pos / len : 0;
    var pct = Math.min(100, ratio * 100);

    if (scrubFill) scrubFill.style.width = pct + "%";
    if (scrubKnob) scrubKnob.style.left = pct + "%";
    if (scrubBar) scrubBar.setAttribute("aria-valuenow", Math.round(pct));
    if (scrubCur) scrubCur.textContent = fmt(player.pos);
    if (scrubTotal) scrubTotal.textContent = fmt(len);
    if (curTime) curTime.textContent = fmt(player.pos);
    if (nowTrack) nowTrack.textContent = t.name.replace("—", "—");
  }

  function setPlayingVisuals(on) {
    if (eq) eq.classList.toggle("is-active", on);
    if (boombox) boombox.classList.toggle("is-active", on);

    if (heroBtn) {
      heroBtn.setAttribute("aria-pressed", String(on));
      heroBtn.classList.toggle("is-playing", on);
    }
    if (heroLabel) heroLabel.textContent = on ? "Pause" : "Play album";

    if (coverBtn) {
      coverBtn.setAttribute("aria-pressed", String(on));
    }

    trackData.forEach(function (t, i) {
      var active = on && i === player.index;
      t.el.classList.toggle("is-playing", active);
      t.playBtn.setAttribute("aria-pressed", String(active));
    });
  }

  function tick() {
    player.pos += 1;
    if (player.pos >= currentLen()) {
      // advance to next track, loop at the end
      player.pos = 0;
      player.index = (player.index + 1) % trackData.length;
      renderTransport();
      toast("Up next — " + trackData[player.index].name);
    }
    renderTransport();
  }

  function play() {
    if (player.playing) return;
    player.playing = true;
    setPlayingVisuals(true);
    clearInterval(player.timer);
    player.timer = setInterval(tick, 1000);
    renderTransport();
  }

  function pause() {
    player.playing = false;
    clearInterval(player.timer);
    setPlayingVisuals(false);
  }

  function toggle() {
    player.playing ? pause() : play();
  }

  function selectTrack(i, autoplay) {
    player.index = i;
    player.pos = 0;
    renderTransport();
    if (autoplay) {
      pause();
      play();
    }
  }

  // wire main buttons
  if (heroBtn) heroBtn.addEventListener("click", toggle);
  if (coverBtn) coverBtn.addEventListener("click", toggle);

  // per-track play buttons
  trackData.forEach(function (t, i) {
    t.playBtn.addEventListener("click", function () {
      if (player.playing && player.index === i) {
        pause();
      } else {
        selectTrack(i, true);
      }
    });
  });

  // like toggles
  $$(".track__like").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      var name = btn
        .getAttribute("aria-label")
        .replace("Like ", "");
      toast(on ? "Removed " + name : "Added " + name + " to your likes");
    });
  });

  /* ---------- scrubber (click, drag, keyboard) ---------- */
  function seekFromEvent(clientX) {
    if (!scrubBar) return;
    var rect = scrubBar.getBoundingClientRect();
    var ratio = (clientX - rect.left) / rect.width;
    ratio = Math.min(1, Math.max(0, ratio));
    player.pos = Math.round(ratio * currentLen());
    renderTransport();
  }

  if (scrubBar) {
    var dragging = false;
    scrubBar.addEventListener("pointerdown", function (e) {
      dragging = true;
      scrubBar.setPointerCapture(e.pointerId);
      seekFromEvent(e.clientX);
    });
    scrubBar.addEventListener("pointermove", function (e) {
      if (dragging) seekFromEvent(e.clientX);
    });
    scrubBar.addEventListener("pointerup", function (e) {
      dragging = false;
      try { scrubBar.releasePointerCapture(e.pointerId); } catch (err) {}
    });
    scrubBar.addEventListener("keydown", function (e) {
      var step = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") step = 5;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") step = -5;
      else if (e.key === "Home") { player.pos = 0; renderTransport(); e.preventDefault(); return; }
      else if (e.key === "End") { player.pos = currentLen(); renderTransport(); e.preventDefault(); return; }
      else return;
      player.pos = Math.min(currentLen(), Math.max(0, player.pos + step));
      renderTransport();
      e.preventDefault();
    });
  }

  // init transport display
  renderTransport();

  /* ============================================================
     EQUALIZER "bump" — randomize bar heights when active so it
     reads as reacting to the beat (on top of CSS keyframes).
  ============================================================ */
  if (eq && !prefersReduced) {
    var eqBars = $$("i", eq);
    setInterval(function () {
      if (!eq.classList.contains("is-active")) return;
      eqBars.forEach(function (bar) {
        bar.style.animationDuration = (0.35 + Math.random() * 0.4).toFixed(2) + "s";
      });
    }, 700);
  }

  /* ============================================================
     MARQUEE TICKER — JS-driven for a continuous loop. We clone
     the content so it scrolls seamlessly.
  ============================================================ */
  var ticker = $("#ticker");
  if (ticker && !prefersReduced) {
    ticker.innerHTML += ticker.innerHTML; // duplicate for seamless loop
    var tx = 0;
    var halfWidth = ticker.scrollWidth / 2;
    function marquee() {
      tx -= 0.6;
      if (Math.abs(tx) >= halfWidth) tx = 0;
      ticker.style.transform = "translateX(" + tx + "px)";
      requestAnimationFrame(marquee);
    }
    requestAnimationFrame(marquee);
  }

  /* ============================================================
     TOUR DATES — tickets / sold out feedback
  ============================================================ */
  $$(".date").forEach(function (row) {
    var btn = $(".date__btn", row);
    if (!btn || btn.disabled) return;
    btn.addEventListener("click", function () {
      var city = $(".date__city", row).textContent.trim();
      var venue = $(".date__venue", row).textContent.trim();
      toast("Tickets — " + city + " @ " + venue);
    });
  });

  /* ============================================================
     MERCH — add to cart
  ============================================================ */
  var cart = 0;
  $$(".prod").forEach(function (card) {
    var btn = $(".prod__btn", card);
    if (!btn || btn.disabled) return;
    btn.addEventListener("click", function () {
      cart += 1;
      var name = $(".prod__name", card).textContent.trim();
      toast(name + " added — cart (" + cart + ")");
    });
  });

  /* ============================================================
     VISUALIZER — simulated video playback
  ============================================================ */
  var vBtn = $("#visualPlay");
  var vLabel = $("#visualLabel");
  var vScreen = $("#visualScreen");
  var vTime = $("#visualTime");
  var vState = { playing: false, pos: 0, len: parseLen("3:21"), timer: null };

  function vRender() {
    if (vTime) vTime.textContent = fmt(vState.pos) + " / 3:21";
  }
  function vTick() {
    vState.pos += 1;
    if (vState.pos >= vState.len) {
      vStop();
      toast("Video ended");
      return;
    }
    vRender();
  }
  function vPlay() {
    vState.playing = true;
    if (vScreen) vScreen.classList.add("is-playing");
    if (vBtn) { vBtn.setAttribute("aria-pressed", "true"); vBtn.classList.add("is-playing"); }
    if (vLabel) vLabel.textContent = "Pause";
    clearInterval(vState.timer);
    vState.timer = setInterval(vTick, 1000);
  }
  function vStop() {
    vState.playing = false;
    clearInterval(vState.timer);
    if (vScreen) vScreen.classList.remove("is-playing");
    if (vBtn) { vBtn.setAttribute("aria-pressed", "false"); vBtn.classList.remove("is-playing"); }
    if (vLabel) vLabel.textContent = "Watch video";
  }
  if (vBtn) {
    vBtn.addEventListener("click", function () {
      vState.playing ? vStop() : vPlay();
    });
  }
  vRender();

  /* ============================================================
     SOCIAL links → toast (no real navigation)
  ============================================================ */
  $$("[data-toast]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast(a.getAttribute("data-toast"));
    });
  });

  /* ============================================================
     STICKY CTA — reveal after scrolling past the hero, hide
     near the footer.
  ============================================================ */
  var sticky = $("#sticky");
  var hero = $(".hero");
  var foot = $(".foot");
  if (sticky) {
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      var heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 400;
      var nearFooter = foot
        ? y + window.innerHeight > foot.offsetTop + 80
        : false;
      var show = y > heroBottom && !nearFooter;
      sticky.classList.toggle("is-visible", show);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
