(function () {
  "use strict";

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  /* ---------- reading progress ---------- */
  var bar = document.getElementById("progressBar");
  var progressBox = bar ? bar.parentElement : null;
  var ticking = false;
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    if (bar) bar.style.width = pct.toFixed(2) + "%";
    if (progressBox) progressBox.setAttribute("aria-valuenow", Math.round(pct));
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navbar = document.getElementById("navbar");
  if (navToggle && navbar) {
    navToggle.addEventListener("click", function () {
      var open = navbar.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.textContent = open ? "CLOSE" : "MENU";
    });
    navbar.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && navbar.classList.contains("is-open")) {
        navbar.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "MENU";
      }
    });
  }

  /* nav current state */
  Array.prototype.forEach.call(navbar ? navbar.querySelectorAll("a") : [], function (a) {
    a.addEventListener("click", function () {
      Array.prototype.forEach.call(navbar.querySelectorAll("a"), function (x) {
        x.classList.remove("is-current");
        x.removeAttribute("aria-current");
      });
      a.classList.add("is-current");
      a.setAttribute("aria-current", "page");
    });
  });

  /* ---------- countdown ---------- */
  var deadline = new Date();
  deadline.setDate(deadline.getDate() + 9);
  deadline.setHours(23, 59, 0, 0);
  var pads = {
    d: document.getElementById("cdD"),
    h: document.getElementById("cdH"),
    m: document.getElementById("cdM"),
    s: document.getElementById("cdS")
  };
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function tick() {
    var diff = Math.max(0, deadline.getTime() - Date.now());
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (pads.d) pads.d.textContent = pad2(d);
    if (pads.h) pads.h.textContent = pad2(h);
    if (pads.m) pads.m.textContent = pad2(m);
    if (pads.s) pads.s.textContent = pad2(sec);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- skull / upvote ---------- */
  var skullBtn = document.querySelector(".js-skull");
  if (skullBtn) {
    skullBtn.addEventListener("click", function () {
      var n = parseInt(skullBtn.getAttribute("data-count"), 10) || 0;
      var on = skullBtn.classList.toggle("is-on");
      n += on ? 1 : -1;
      skullBtn.setAttribute("data-count", String(n));
      skullBtn.textContent = on ? "SKULL GIVEN ✓" : "GIVE IT A SKULL";
      var meta = document.querySelector(".potd__meta");
      if (meta) meta.innerHTML = "BY <b>K. ABERNATHY</b> · " + n + " SKULLS";
      toast(on ? "Skull registered — " + n + " total" : "Skull withdrawn");
    });
  }

  /* ---------- contest enter ---------- */
  var enterBtn = document.querySelector(".js-enter");
  var entryCount = document.getElementById("entryCount");
  if (enterBtn) {
    enterBtn.addEventListener("click", function () {
      if (enterBtn.disabled) return;
      enterBtn.disabled = true;
      enterBtn.textContent = "ENTRY LOGGED ✓";
      if (entryCount) entryCount.textContent = "1,285";
      toast("Entry #1285 logged — demo only");
    });
  }

  /* ---------- tag cloud ---------- */
  var cloud = document.getElementById("cloud");
  if (cloud) {
    cloud.addEventListener("click", function (e) {
      var b = e.target.closest(".cl");
      if (!b) return;
      var on = b.classList.toggle("is-on");
      var active = cloud.querySelectorAll(".cl.is-on").length;
      toast(
        (on ? "Filtering by #" : "Removed #") + b.textContent + " — " + active + " tag(s) active"
      );
    });
  }

  /* ---------- article river: load more ---------- */
  var river = document.getElementById("river");
  var loadBtn = document.getElementById("loadMore");
  var loadCount = document.getElementById("loadCount");
  var loadNote = document.getElementById("loadNote");
  var TOTAL = 34;

  var BATCHES = [
    [
      ["NETWORKING", "thumb--net", "We Put A Whole Mesh Network In A Fire Extinguisher Cabinet", "Eleven nodes, solar buffered, LoRa backhaul. It has survived two winters and one very curious raccoon.", "NKECHI HARLOW", "1d", 74],
      ["KEYBOARDS", "thumb--key", "Hand-Wiring 68 Switches Taught Me To Hate Diode Orientation", "A full build log with the three mistakes everyone makes and the continuity test that catches all of them.", "TOMÁS RIEDEL", "1d", 96],
      ["REVERSE ENG", "thumb--chip", "The Undocumented Opcode That Unlocks A Discontinued Motor Driver", "Fuzzing the SPI register map for six hours turned a bricked drawer of chips into working stock.", "HANS DELACROIX", "2d", 143],
      ["CNC", "thumb--grid", "Cutting Aluminium On A Machine Designed For Foam", "Chip load, rigidity and a lot of coolant. Feeds and speeds table included, plus the parts that snapped.", "ISOBEL FRIEND", "2d", 39],
      ["SENSORS", "thumb--wave", "A Load Cell In A Doormat Knows Exactly Who Is Home", "Four strain gauges, one instrumentation amp, and a gait signature classifier that runs on a microcontroller.", "MARLA OKONKWO", "2d", 68],
      ["POWER", "thumb--power", "Building A Bench Supply That Refuses To Blow Up Your Prototype", "Programmable current limit with a hardware latch, because software foldback is always half a millisecond late.", "DEV OYELARAN", "3d", 112]
    ],
    [
      ["LASERS", "thumb--laser", "Engraving Anodised Aluminium With A Diode That Should Not Manage It", "Focus stacking on the Z axis and a paint mask that turns 5 W into something surprisingly crisp.", "PRIYA VANTERPOOL", "3d", 47],
      ["RETROCOMPUTING", "thumb--scope", "Restoring A Terminal Whose Flyback Died In 1987", "Rewinding the transformer by hand, plus the safe discharge procedure we should all be following.", "TOMÁS RIEDEL", "3d", 85],
      ["AUDIO", "thumb--audio", "A Reverb Tank Made From A Radiator And Two Contact Mics", "Impulse responses measured, files released, and yes it does sound like a haunted plumbing system.", "NKECHI HARLOW", "4d", 52],
      ["SHOP TALK", "thumb--solder", "The Cheapest Fume Extractor That Actually Moves Air", "We tested six builds with an anemometer. The winner is a computer fan and a carbon filter, correctly ducted.", "HANS DELACROIX", "4d", 133],
      ["PCB DESIGN", "thumb--pcb", "Silkscreen Art That Survives The Fab House Design Rule Check", "Halftone dithering, minimum feature sizes, and the exact gerber layer stack that made ours print clean.", "ISOBEL FRIEND", "5d", 61],
      ["ROBOTS", "thumb--bot", "A Delta Arm That Sorts Resistors Faster Than You Can Read Them", "Machine vision on a colour band, 900 ms per part, and a hopper printed from the leftovers of another project.", "MARLA OKONKWO", "5d", 104]
    ]
  ];

  var batchIndex = 0;
  var shown = 10;

  function buildPost(d) {
    var art = document.createElement("article");
    art.className = "post post--in";
    art.tabIndex = 0;
    art.innerHTML =
      '<div class="post__thumb ' + d[1] + '" aria-hidden="true"></div>' +
      '<div class="post__body">' +
      '<span class="tag">' + d[0] + "</span>" +
      '<h3 class="post__title">' + d[2] + "</h3>" +
      '<p class="post__dek">' + d[3] + "</p>" +
      '<p class="post__meta"><span>' + d[4] + "</span>" +
      '<span class="mono">· ' + d[5] + " · " + d[6] + " COMMENTS</span></p>" +
      "</div>";
    return art;
  }

  function appendBatch() {
    if (!river || batchIndex >= BATCHES.length) return;
    var batch = BATCHES[batchIndex++];
    var nodes = [];
    batch.forEach(function (d) {
      var el = buildPost(d);
      river.appendChild(el);
      nodes.push(el);
    });
    shown += batch.length;

    nodes.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add("is-on");
      }, 60 * i + 30);
    });

    if (loadCount) loadCount.textContent = "[" + shown + " / " + TOTAL + "]";

    if (batchIndex >= BATCHES.length) {
      loadBtn.disabled = true;
      loadBtn.textContent = "THAT IS THE WHOLE ARCHIVE ";
      loadBtn.appendChild(loadCount || document.createTextNode(""));
      if (loadNote) loadNote.textContent = "End of the river. Go build something.";
      toast("All " + shown + " posts loaded");
    } else {
      toast("+" + batch.length + " posts appended");
    }
    if (nodes[0]) nodes[0].focus({ preventScroll: true });
    updateProgress();
  }

  if (loadBtn) {
    loadBtn.addEventListener("click", function () {
      if (loadBtn.disabled) return;
      loadBtn.classList.add("is-busy");
      var original = loadBtn.firstChild;
      if (original && original.nodeType === 3) original.nodeValue = "FETCHING… ";
      setTimeout(function () {
        loadBtn.classList.remove("is-busy");
        if (original && original.nodeType === 3 && batchIndex + 1 < BATCHES.length + 1) {
          original.nodeValue = "LOAD MORE POSTS ";
        }
        appendBatch();
      }, 420);
    });
  }

  /* ---------- reveal existing posts on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-on");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -40px 0px" }
    );
    Array.prototype.forEach.call(document.querySelectorAll(".post--in"), function (el) {
      io.observe(el);
    });
  }

  /* ---------- posts are keyboard-activatable ---------- */
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("post")) {
      e.preventDefault();
      var t = e.target.querySelector(".post__title");
      toast("Opening: " + (t ? t.textContent.slice(0, 44) : "post"));
    }
  });
  if (river) {
    river.addEventListener("click", function (e) {
      var p = e.target.closest(".post");
      if (!p) return;
      var t = p.querySelector(".post__title");
      toast("Opening: " + (t ? t.textContent.slice(0, 44) : "post"));
    });
  }

  toast("SOLDER & SMOKE — front page loaded");
})();
