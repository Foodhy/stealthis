(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2800);
  }

  /* ---------- film stills data ---------- */
  var STILLS = [
    { title: "First light, Nazaré", tc: "00:04:11", tag: "Reel A", g: "linear-gradient(160deg,#1c2f3a,#0d1418)" },
    { title: "The mending nets", tc: "00:19:38", tag: "Reel A", g: "linear-gradient(160deg,#3a2a18,#160f08)" },
    { title: "High water", tc: "00:41:02", tag: "Reel B", g: "linear-gradient(160deg,#122430,#0a0f14)" },
    { title: "Ana at the wall", tc: "00:57:26", tag: "Reel B", g: "linear-gradient(160deg,#2c2622,#131010)" },
    { title: "The last harbour", tc: "01:12:49", tag: "Reel C", g: "linear-gradient(160deg,#1a2b2b,#0b1212)" },
    { title: "Storm coming in", tc: "01:29:03", tag: "Reel C", g: "linear-gradient(160deg,#26201a,#100c08)" },
    { title: "Empty chairs", tc: "01:38:57", tag: "Reel D", g: "linear-gradient(160deg,#1f2733,#0c1017)" },
    { title: "Coast at dusk", tc: "01:46:10", tag: "Reel D", g: "linear-gradient(160deg,#332419,#15100a)" }
  ];

  function stillBg(g) {
    return g + ",repeating-linear-gradient(115deg,rgba(255,255,255,0.03) 0 2px,transparent 2px 10px)";
  }

  /* ---------- build stills grid ---------- */
  var grid = document.getElementById("grid");
  STILLS.forEach(function (s, i) {
    var btn = document.createElement("button");
    btn.className = "still";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", "Open still: " + s.title + " at " + s.tc);
    btn.dataset.index = String(i);
    btn.innerHTML =
      '<div class="still__img" style="background:' + stillBg(s.g) + '"></div>' +
      '<span class="still__badge">' + s.tag + "</span>" +
      '<div class="still__grad"></div>' +
      '<div class="still__cap"><b>' + s.title + '</b><span class="tc">' + s.tc + "</span></div>";
    btn.addEventListener("click", function () {
      openLightbox(i);
    });
    grid.appendChild(btn);
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbTc = document.getElementById("lbTc");
  var current = 0;
  var lastFocus = null;

  function renderLightbox() {
    var s = STILLS[current];
    lbImg.style.background = stillBg(s.g);
    lbCap.textContent = s.title;
    lbTc.textContent = s.tc;
  }
  function openLightbox(i) {
    current = i;
    lastFocus = document.activeElement;
    renderLightbox();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(dir) {
    current = (current + dir + STILLS.length) % STILLS.length;
    renderLightbox();
  }
  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
  document.getElementById("lbNext").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* ---------- scroll scrubber ---------- */
  var fill = document.getElementById("scrubberFill");
  var bar = document.querySelector(".scrubber");
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    fill.style.width = (p * 100).toFixed(2) + "%";
    bar.setAttribute("aria-valuenow", String(Math.round(p * 100)));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- hero play toggle ---------- */
  var playBtn = document.getElementById("playBtn");
  var heroTc = document.getElementById("heroTc");
  var playing = false;
  var runtimeTimer;
  var elapsed = 0;
  function fmt(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = Math.floor(sec % 60);
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return p(h) + ":" + p(m) + ":" + p(s);
  }
  playBtn.addEventListener("click", function () {
    playing = !playing;
    playBtn.classList.toggle("is-playing", playing);
    var label = playBtn.querySelector(".play__label");
    if (playing) {
      label.textContent = "Playing trailer…";
      toast("▶ Trailer rolling — this is a static demo");
      runtimeTimer = setInterval(function () {
        elapsed += 1;
        heroTc.textContent = fmt(elapsed);
        if (elapsed >= 137) { // ~2:17 trailer
          playBtn.click();
        }
      }, 250);
    } else {
      label.textContent = "Watch trailer";
      clearInterval(runtimeTimer);
      elapsed = 0;
      heroTc.textContent = "01:47:22";
    }
  });

  /* ---------- pause marquee on hover/focus ---------- */
  var marquee = document.getElementById("marquee");
  // duplicate laurels so the -50% loop is seamless
  var track = marquee.querySelector(".marquee__track");
  track.innerHTML += track.innerHTML;
  ["mouseenter", "focusin"].forEach(function (ev) {
    marquee.addEventListener(ev, function () { marquee.classList.add("is-paused"); });
  });
  ["mouseleave", "focusout"].forEach(function (ev) {
    marquee.addEventListener(ev, function () { marquee.classList.remove("is-paused"); });
  });

  /* ---------- booking form ---------- */
  var form = document.getElementById("bookForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var venue = form.venue;
    var email = form.email;
    var ok = true;
    [venue, email].forEach(function (f) { f.classList.remove("invalid"); });
    if (!venue.value.trim()) { venue.classList.add("invalid"); ok = false; }
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) { email.classList.add("invalid"); ok = false; }
    if (!ok) {
      toast("Please add a venue and a valid email.");
      (venue.classList.contains("invalid") ? venue : email).focus();
      return;
    }
    toast("Thanks — booking request sent for " + venue.value.trim() + " ✓");
    form.reset();
  });

  /* ---------- smooth anchor focus for a11y ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        setTimeout(function () { target.focus({ preventScroll: true }); }, 400);
      }
    });
  });
})();
