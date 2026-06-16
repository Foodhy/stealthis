(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- friendly metadata for each hotspot ---- */
  var FRIENDS = {
    sun: { emoji: "☀️", label: "The sun blinked and beamed.", color: "#ffd23f" },
    cloud: { emoji: "☁️", label: "A fluffy cloud drifted by.", color: "#5ec5d6" },
    bird: { emoji: "🐦", label: "The little bird hopped up high.", color: "#5ec5d6" },
    dog: { emoji: "🐶", label: "The puppy wagged its tail.", color: "#caa06a" },
    door: { emoji: "🚪", label: "The cottage door swung open.", color: "#ff8a3d" }
  };
  var TOTAL = Object.keys(FRIENDS).length;

  var found = Object.create(null); // name -> true
  var foundCount = 0;

  /* ---- elements ---- */
  var fxLayer = document.getElementById("fxLayer");
  var sceneFrame = document.getElementById("scene");
  var countNow = document.getElementById("countNow");
  var counterNum = countNow ? countNow.parentElement : null;
  var pipsWrap = document.getElementById("pips");
  var foundList = document.getElementById("foundList");
  var resetBtn = document.getElementById("resetBtn");
  var cheer = document.getElementById("cheer");
  var againBtn = document.getElementById("againBtn");
  var soundToggle = document.getElementById("sound");
  var dyslexiaToggle = document.getElementById("dyslexia");
  var toastEl = document.getElementById("toast");
  var hotspots = Array.prototype.slice.call(
    document.querySelectorAll(".hotspot")
  );

  /* ---- build sun rays once ---- */
  (function buildRays() {
    var rays = document.getElementById("sunRays");
    if (!rays) return;
    var SVGNS = "http://www.w3.org/2000/svg";
    for (var i = 0; i < 8; i++) {
      var r = document.createElementNS(SVGNS, "rect");
      r.setAttribute("x", "676");
      r.setAttribute("y", "20");
      r.setAttribute("width", "8");
      r.setAttribute("height", "24");
      r.setAttribute("rx", "4");
      r.setAttribute("fill", "#ffd23f");
      r.setAttribute("transform", "rotate(" + i * 45 + " 680 96)");
      rays.appendChild(r);
    }
  })();

  /* ---- toast helper ---- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  /* ---- tiny WebAudio "pop" so sound words feel alive (no asset files) ---- */
  var audioCtx = null;
  function beep(name) {
    if (!soundToggle || !soundToggle.checked) return;
    if (prefersReduced) return;
    try {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = new AC();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
      // pick a friendly note per friend
      var notes = { sun: 660, cloud: 392, bird: 880, dog: 294, door: 523 };
      var base = notes[name] || 523;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(base, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        base * 1.5,
        audioCtx.currentTime + 0.12
      );
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 0.28
      );
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      /* audio unavailable — interactions still work */
    }
  }

  /* ---- map SVG coords to fx-layer pixel position ---- */
  function bubbleAt(clientX, clientY, word) {
    if (!fxLayer) return;
    var rect = sceneFrame.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;

    var b = document.createElement("div");
    b.className = "bubble";
    b.textContent = word;
    b.style.left = x + "px";
    b.style.top = y + "px";
    fxLayer.appendChild(b);
    window.setTimeout(function () {
      if (b.parentNode) b.parentNode.removeChild(b);
    }, 1300);

    if (!prefersReduced) sparkles(x, y);
  }

  var SPARK_COLORS = ["#ff8a3d", "#5ec5d6", "#ffd23f", "#ff6f9c", "#7bd389", "#b78bff"];
  function sparkles(x, y) {
    var n = 9;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.className = "spark";
      var angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      var dist = 36 + Math.random() * 34;
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.background = SPARK_COLORS[i % SPARK_COLORS.length];
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      fxLayer.appendChild(s);
      (function (node) {
        window.setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        }, 750);
      })(s);
    }
  }

  /* ---- center of a hotspot's hit area, in client coords ---- */
  function hotspotCenter(hs) {
    var hit = hs.querySelector(".hit");
    var target = hit || hs;
    var r = target.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.32 };
  }

  /* ---- play a hotspot ---- */
  function activate(hs, clientX, clientY) {
    var name = hs.getAttribute("data-name");
    var word = hs.getAttribute("data-word") || "Hooray!";
    if (!name) return;

    // animation
    hs.classList.remove("play", "spin");
    // force reflow so re-adding restarts the animation
    void hs.offsetWidth;
    hs.classList.add("play");
    if (name === "sun") hs.classList.add("spin");
    var dur = prefersReduced ? 50 : 950;
    window.setTimeout(function () {
      hs.classList.remove("play", "spin");
    }, dur);

    // bubble + sparkles
    var pt =
      typeof clientX === "number"
        ? { x: clientX, y: clientY }
        : hotspotCenter(hs);
    bubbleAt(pt.x, pt.y, word);
    beep(name);

    // discovery bookkeeping (counts once)
    if (!found[name]) {
      found[name] = true;
      foundCount++;
      hs.classList.add("found");
      hs.setAttribute("aria-pressed", "true");
      updateCount();
      markPip(name);
      addLogRow(name);
      if (foundCount === TOTAL) {
        window.setTimeout(celebrate, 600);
      } else {
        toast(word + "  " + foundCount + " of " + TOTAL + " found");
      }
    } else {
      toast(word);
    }
  }

  function updateCount() {
    if (!countNow) return;
    countNow.textContent = String(foundCount);
    if (counterNum && !prefersReduced) {
      counterNum.classList.remove("bump");
      void counterNum.offsetWidth;
      counterNum.classList.add("bump");
    }
  }

  function markPip(name) {
    if (!pipsWrap) return;
    var pip = pipsWrap.querySelector('[data-for="' + name + '"]');
    if (pip) pip.classList.add("on");
  }

  function addLogRow(name) {
    if (!foundList) return;
    var empty = foundList.querySelector(".found-empty");
    if (empty) empty.remove();
    var info = FRIENDS[name];
    var li = document.createElement("li");
    li.className = "added";
    var em = document.createElement("span");
    em.className = "li-emoji";
    em.setAttribute("aria-hidden", "true");
    em.textContent = info.emoji;
    var txt = document.createElement("span");
    txt.textContent = info.label;
    li.appendChild(em);
    li.appendChild(txt);
    foundList.appendChild(li);
  }

  function celebrate() {
    if (cheer) {
      cheer.hidden = false;
      if (againBtn) againBtn.focus();
    }
    confettiBurst();
  }

  function confettiBurst() {
    if (prefersReduced || !fxLayer) return;
    var rect = sceneFrame.getBoundingClientRect();
    for (var i = 0; i < 26; i++) {
      sparkles(Math.random() * rect.width, Math.random() * rect.height * 0.7);
    }
  }

  /* ---- reset ---- */
  function reset() {
    found = Object.create(null);
    foundCount = 0;
    hotspots.forEach(function (hs) {
      hs.classList.remove("found", "play", "spin");
      hs.removeAttribute("aria-pressed");
    });
    if (pipsWrap) {
      Array.prototype.forEach.call(
        pipsWrap.querySelectorAll(".pip"),
        function (p) {
          p.classList.remove("on");
        }
      );
    }
    if (foundList) {
      foundList.innerHTML =
        '<li class="found-empty">Tap a friend to start the story…</li>';
    }
    updateCount();
    if (cheer) cheer.hidden = true;
    toast("Fresh meadow! Find the 5 surprises.");
  }

  /* ---- wire hotspots (pointer + keyboard) ---- */
  hotspots.forEach(function (hs) {
    hs.addEventListener("click", function (e) {
      activate(hs, e.clientX, e.clientY);
    });
    hs.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        activate(hs); // centered bubble for keyboard users
      }
    });
  });

  if (resetBtn) resetBtn.addEventListener("click", reset);
  if (againBtn) againBtn.addEventListener("click", reset);

  // close celebration on Escape or backdrop click
  if (cheer) {
    cheer.addEventListener("click", function (e) {
      if (e.target === cheer) cheer.hidden = true;
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && cheer && !cheer.hidden) cheer.hidden = true;
  });

  /* ---- toggles ---- */
  if (dyslexiaToggle) {
    dyslexiaToggle.addEventListener("change", function () {
      document.body.classList.toggle("easy-read", dyslexiaToggle.checked);
      toast(
        dyslexiaToggle.checked
          ? "Easy-read font on"
          : "Easy-read font off"
      );
    });
  }
  if (soundToggle) {
    soundToggle.addEventListener("change", function () {
      toast(soundToggle.checked ? "Sound words on 🔊" : "Sound words off 🔇");
    });
  }

  // first run
  updateCount();
})();
