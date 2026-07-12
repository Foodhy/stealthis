(function () {
  "use strict";

  var playBtn = document.getElementById("playBtn");
  var wave = document.getElementById("wave");
  var nowTitle = document.getElementById("nowTitle");
  var playTime = document.getElementById("playTime");
  var toastEl = document.getElementById("toast");
  var showList = document.getElementById("showList");
  var subscribeBtn = document.getElementById("subscribeBtn");
  var statWeek = document.getElementById("statWeek");

  var playing = false;
  var toastTimer = null;

  /* ---- toast helper ---- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---- build waveform bars ---- */
  var BAR_COUNT = 40;
  for (var i = 0; i < BAR_COUNT; i++) {
    var bar = document.createElement("span");
    // vary animation duration + delay per bar for an organic ripple
    var dur = (0.6 + Math.random() * 0.8).toFixed(2);
    bar.style.setProperty("--dur", dur + "s");
    bar.style.animationDelay = (-Math.random() * 1.2).toFixed(2) + "s";
    wave.appendChild(bar);
  }

  /* ---- play / pause ---- */
  function setPlaying(state) {
    playing = state;
    playBtn.setAttribute("aria-pressed", state ? "true" : "false");
    playBtn.setAttribute("aria-label", state ? "Pause featured episode" : "Play featured episode");
    wave.classList.toggle("is-playing", state);
    var active = showList.querySelector(".show.is-active");
    if (active) {
      active.classList.toggle("is-playing-src", state);
    }
  }

  playBtn.addEventListener("click", function () {
    setPlaying(!playing);
    toast(playing ? "Playing · " + nowTitle.textContent : "Paused");
  });

  /* ---- show cards -> load into player ---- */
  var shows = showList.querySelectorAll(".show");
  shows.forEach(function (btn) {
    btn.addEventListener("click", function () {
      shows.forEach(function (s) { s.classList.remove("is-active"); });
      btn.classList.add("is-active");

      nowTitle.textContent = btn.getAttribute("data-title");
      playTime.textContent = btn.getAttribute("data-time");

      // vary waveform tempo slightly per show
      var speed = 0.7 + Math.random() * 0.5;
      wave.querySelectorAll("span").forEach(function (b) {
        var base = 0.6 + Math.random() * 0.8;
        b.style.setProperty("--dur", (base * speed).toFixed(2) + "s");
      });

      setPlaying(true);
      toast("Loaded · " + btn.querySelector(".show__name").textContent);
    });
  });

  // mark first show active by default
  if (shows.length) shows[0].classList.add("is-active");

  /* ---- platform chips ---- */
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      toast("Following on " + chip.getAttribute("data-platform"));
    });
  });

  /* ---- subscribe ---- */
  subscribeBtn.addEventListener("click", function () {
    toast("Subscribed to Frequency Network");
  });

  /* ---- count-up ticker ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var start = 0;
    var t0 = null;
    var dur = 1100;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (statWeek) countUp(statWeek);

  /* ---- keyboard: space toggles play when body focused ---- */
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && (e.target === document.body)) {
      e.preventDefault();
      playBtn.click();
    }
  });
})();
