(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Build hero waveform ---------- */
  var wave = document.getElementById("wave");
  var BARS = 40;
  for (var i = 0; i < BARS; i++) {
    var s = document.createElement("span");
    var h = 20 + Math.round(Math.abs(Math.sin(i * 0.9)) * 70);
    s.style.height = h + "%";
    s.style.animationDelay = (i * 0.045) + "s";
    wave.appendChild(s);
  }

  /* ---------- Content warning ---------- */
  var cw = document.getElementById("cw");
  document.getElementById("cwClose").addEventListener("click", function () {
    cw.classList.add("hide");
  });

  /* ---------- Shared mini player ---------- */
  var mini = document.getElementById("mini");
  var miniToggle = document.getElementById("miniToggle");
  var miniClose = document.getElementById("miniClose");
  var miniTitle = document.getElementById("miniTitle");
  var miniProg = document.getElementById("miniProg");
  var progTimer;
  var progress = 0;

  function runProgress() {
    clearInterval(progTimer);
    progTimer = setInterval(function () {
      progress = (progress + 0.6) % 100;
      miniProg.style.width = progress + "%";
    }, 400);
  }
  function stopProgress() { clearInterval(progTimer); }

  function openMini(title) {
    progress = 0;
    miniTitle.textContent = title;
    miniProg.style.width = "0%";
    mini.classList.add("show");
    mini.setAttribute("aria-hidden", "false");
    miniToggle.classList.remove("paused");
    miniToggle.setAttribute("aria-label", "Pause");
    runProgress();
  }
  function closeMini() {
    mini.classList.remove("show");
    mini.setAttribute("aria-hidden", "true");
    stopProgress();
    clearActive();
    setHero(false);
  }

  miniClose.addEventListener("click", closeMini);
  miniToggle.addEventListener("click", function () {
    var paused = miniToggle.classList.toggle("paused");
    if (paused) {
      stopProgress();
      miniToggle.setAttribute("aria-label", "Play");
      pauseAll();
    } else {
      runProgress();
      miniToggle.setAttribute("aria-label", "Pause");
    }
  });

  /* ---------- Hero play ---------- */
  var heroPlay = document.getElementById("heroPlay");
  var heroTitle = "S4 · E01 — The Harbor Light Killings";
  function setHero(on) {
    heroPlay.classList.toggle("playing", on);
    heroPlay.setAttribute("aria-pressed", String(on));
    wave.classList.toggle("on", on);
  }
  heroPlay.addEventListener("click", function () {
    var on = !heroPlay.classList.contains("playing");
    if (on) {
      clearActive();
      setHero(true);
      openMini(heroTitle);
      toast("Now playing · " + heroTitle);
    } else {
      setHero(false);
      closeMini();
    }
  });

  /* ---------- Episode play buttons ---------- */
  var epButtons = Array.prototype.slice.call(document.querySelectorAll(".ep-play"));
  function clearActive() {
    epButtons.forEach(function (b) { b.classList.remove("active"); });
  }
  function pauseAll() {
    // visually keep active marker but stop hero wave animation
    wave.classList.remove("on");
  }
  epButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var isActive = btn.classList.contains("active");
      clearActive();
      setHero(false);
      if (isActive) {
        closeMini();
        return;
      }
      btn.classList.add("active");
      var ep = btn.closest(".ep");
      var title = ep.querySelector(".ep-title").textContent;
      openMini(title);
      toast("Now playing · " + title);
    });
  });

  /* ---------- Case tabs / filter ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var cases = Array.prototype.slice.call(document.querySelectorAll(".case"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var f = tab.getAttribute("data-filter");
      var shown = 0;
      cases.forEach(function (c) {
        var match = f === "all" || c.getAttribute("data-status") === f;
        c.classList.toggle("hidden", !match);
        if (match) {
          shown++;
          c.style.animation = "none";
          // force reflow to restart entry animation
          void c.offsetWidth;
          c.style.animation = "";
        }
      });
      toast(shown + (shown === 1 ? " case" : " cases") + " shown");
    });
  });

  /* ---------- Season accordion ---------- */
  var heads = Array.prototype.slice.call(document.querySelectorAll(".season-head"));
  heads.forEach(function (head) {
    head.addEventListener("click", function () {
      var season = head.parentElement;
      var open = season.classList.contains("is-open");
      if (open) {
        season.classList.remove("is-open");
        head.setAttribute("aria-expanded", "false");
      } else {
        season.classList.add("is-open");
        head.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Platform picker ---------- */
  var plats = Array.prototype.slice.call(document.querySelectorAll(".plat"));
  plats.forEach(function (p) {
    p.addEventListener("click", function () {
      plats.forEach(function (x) { x.classList.remove("picked"); });
      p.classList.add("picked");
      toast("Opening " + p.getAttribute("data-plat") + "…");
    });
  });

  /* ---------- Subscribe form ---------- */
  var form = document.getElementById("subForm");
  var email = document.getElementById("email");
  var err = document.getElementById("subErr");
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = email.value.trim();
    if (!re.test(val)) {
      email.classList.add("invalid");
      err.textContent = "Please enter a valid email address.";
      email.focus();
      return;
    }
    email.classList.remove("invalid");
    err.textContent = "";
    email.value = "";
    toast("You're on the list — case notes incoming.");
  });
  email.addEventListener("input", function () {
    if (email.classList.contains("invalid") && re.test(email.value.trim())) {
      email.classList.remove("invalid");
      err.textContent = "";
    }
  });
})();
