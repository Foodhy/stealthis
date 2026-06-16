(function () {
  "use strict";

  var DURATION = 560; // total seconds (9:20)
  var current = 0; // current playback time, seconds
  var playing = false;
  var rates = [1, 1.25, 1.5, 2];
  var rateIndex = 0;
  var timer = null;
  var lastTick = 0;

  var stage = document.getElementById("stage");
  var bigPlay = document.getElementById("bigPlay");
  var playToggle = document.getElementById("playToggle");
  var rateBtn = document.getElementById("rateBtn");
  var scrub = document.getElementById("scrub");
  var scrubFill = document.getElementById("scrubFill");
  var scrubThumb = document.getElementById("scrubThumb");
  var scrubMarkers = document.getElementById("scrubMarkers");
  var timeCurrent = document.getElementById("timeCurrent");
  var liveTime = document.getElementById("liveTime");
  var stageChapter = document.getElementById("stageChapter");
  var stageChapterNo = stageChapter.querySelector(".stage-chapter-no");
  var stageChapterLabel = stageChapter.querySelector(".stage-chapter-label");
  var toastEl = document.getElementById("toast");

  var stepEls = Array.prototype.slice.call(
    document.querySelectorAll("#steps .step")
  );
  var steps = stepEls.map(function (el) {
    return {
      el: el,
      btn: el.querySelector(".step-btn"),
      start: parseInt(el.getAttribute("data-start"), 10),
      end: parseInt(el.getAttribute("data-end"), 10),
      name: el.querySelector(".step-name").textContent.trim(),
      no: el.querySelector(".step-no").textContent.trim(),
    };
  });

  var activeIndex = -1;
  var toastTimer = null;

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  // Build chapter markers on the scrubber.
  steps.forEach(function (step) {
    var mark = document.createElement("span");
    mark.className = "chapter-mark";
    mark.style.left = (step.start / DURATION) * 100 + "%";
    mark.title = step.name;
    scrubMarkers.appendChild(mark);
  });

  function stepIndexAt(t) {
    for (var i = steps.length - 1; i >= 0; i--) {
      if (t >= steps[i].start) return i;
    }
    return 0;
  }

  function render() {
    var pct = (current / DURATION) * 100;
    scrubFill.style.width = pct + "%";
    scrubThumb.style.left = pct + "%";
    timeCurrent.textContent = fmt(current);
    liveTime.textContent = fmt(current);

    scrub.setAttribute("aria-valuenow", Math.round(pct));
    scrub.setAttribute(
      "aria-valuetext",
      fmt(current) + " of " + fmt(DURATION)
    );

    var idx = stepIndexAt(current);
    if (idx !== activeIndex) {
      setActive(idx);
    }
  }

  function setActive(idx) {
    activeIndex = idx;
    steps.forEach(function (step, i) {
      var on = i === idx;
      step.el.classList.toggle("is-active", on);
      step.el.classList.toggle("is-done", i < idx);
      if (on) {
        step.btn.setAttribute("aria-current", "step");
        // keep active step in view within the scroll container
        if (typeof step.el.scrollIntoView === "function") {
          step.el.scrollIntoView({ block: "nearest" });
        }
      } else {
        step.btn.removeAttribute("aria-current");
      }
    });
    var s = steps[idx];
    stageChapterNo.textContent = s.no;
    stageChapterLabel.textContent = s.name;
  }

  function play() {
    if (playing) return;
    if (current >= DURATION) current = 0;
    playing = true;
    stage.setAttribute("data-state", "playing");
    playToggle.setAttribute("aria-pressed", "true");
    playToggle.setAttribute("aria-label", "Pause");
    playToggle.setAttribute("data-playing", "true");
    liveTime.setAttribute("aria-live", "polite");
    lastTick = performance.now();
    loop();
  }

  function pause() {
    if (!playing) return;
    playing = false;
    stage.setAttribute("data-state", "paused");
    playToggle.setAttribute("aria-pressed", "false");
    playToggle.setAttribute("aria-label", "Play");
    playToggle.removeAttribute("data-playing");
    liveTime.setAttribute("aria-live", "off");
    if (timer) cancelAnimationFrame(timer);
  }

  function toggle() {
    playing ? pause() : play();
  }

  function loop() {
    timer = requestAnimationFrame(function (now) {
      var dt = ((now - lastTick) / 1000) * rates[rateIndex];
      lastTick = now;
      current += dt;
      if (current >= DURATION) {
        current = DURATION;
        render();
        pause();
        toast("Recipe complete — buen provecho! 🍽️");
        return;
      }
      render();
      loop();
    });
  }

  function seek(t) {
    current = Math.min(DURATION, Math.max(0, t));
    render();
  }

  function seekFromClientX(clientX) {
    var rect = scrub.getBoundingClientRect();
    var ratio = (clientX - rect.left) / rect.width;
    seek(ratio * DURATION);
  }

  // --- Wire up controls ---
  bigPlay.addEventListener("click", function (e) {
    e.stopPropagation();
    play();
  });

  stage.addEventListener("click", toggle);

  playToggle.addEventListener("click", toggle);

  rateBtn.addEventListener("click", function () {
    rateIndex = (rateIndex + 1) % rates.length;
    var r = rates[rateIndex];
    rateBtn.textContent = r + "×";
    rateBtn.setAttribute("aria-label", "Playback speed, currently " + r + "x");
    toast("Speed " + r + "×");
  });

  // Scrubber: click + drag
  var dragging = false;
  scrub.addEventListener("pointerdown", function (e) {
    dragging = true;
    scrub.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  });
  scrub.addEventListener("pointermove", function (e) {
    if (dragging) seekFromClientX(e.clientX);
  });
  scrub.addEventListener("pointerup", function (e) {
    dragging = false;
    try {
      scrub.releasePointerCapture(e.pointerId);
    } catch (err) {}
  });

  // Scrubber keyboard
  scrub.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 30 : 5;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      seek(current + step);
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      seek(current - step);
      e.preventDefault();
    } else if (e.key === "Home") {
      seek(0);
      e.preventDefault();
    } else if (e.key === "End") {
      seek(DURATION);
      e.preventDefault();
    } else if (e.key === " " || e.key === "Enter") {
      toggle();
      e.preventDefault();
    }
  });

  // Click a step to seek
  steps.forEach(function (step) {
    step.btn.addEventListener("click", function () {
      seek(step.start);
      toast("Jumped to " + fmt(step.start) + " · " + step.name);
    });
  });

  // Keyboard shortcuts (space anywhere not in a control)
  document.addEventListener("keydown", function (e) {
    if (e.key === " " && e.target === document.body) {
      toggle();
      e.preventDefault();
    }
  });

  // initial paint
  render();
})();
