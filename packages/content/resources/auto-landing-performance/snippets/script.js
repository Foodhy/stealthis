(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Nav: scroll state + mobile toggle ---------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  window.addEventListener(
    "scroll",
    function () {
      nav.classList.toggle("scrolled", window.scrollY > 12);
    },
    { passive: true }
  );

  function closeMenu() {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Animated hero stat counters ---------- */
  var statBs = document.querySelectorAll("#heroStats b[data-count]");
  var statsDone = false;
  function runCounters() {
    if (statsDone) return;
    statsDone = true;
    statBs.forEach(function (b) {
      var target = parseInt(b.getAttribute("data-count"), 10);
      var suffix = b.getAttribute("data-suffix") || "";
      var start = performance.now();
      var dur = 1400;
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        b.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if ("IntersectionObserver" in window) {
    var statsIO = new IntersectionObserver(
      function (es) {
        if (es[0].isIntersecting) {
          runCounters();
          statsIO.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    var statsEl = document.getElementById("heroStats");
    if (statsEl) statsIO.observe(statsEl);
  } else {
    runCounters();
  }

  /* ---------- Hero virtual dyno pull ---------- */
  var pullBtn = document.getElementById("pullBtn");
  var ring = document.getElementById("gaugeRing");
  var rpmVal = document.getElementById("rpmVal");
  var hpVal = document.getElementById("hpVal");
  var tqVal = document.getElementById("tqVal");
  var boostVal = document.getElementById("boostVal");
  var afrVal = document.getElementById("afrVal");
  var pulling = false;

  function paintRing(frac) {
    // 0..1 of sweep; neon up to redline, orange peak segment
    var deg = Math.round(frac * 320);
    var peak = Math.max(deg - 24, 0);
    ring.style.background =
      "radial-gradient(circle at center, var(--carbon-2) 58%, transparent 59%)," +
      "conic-gradient(var(--neon) 0deg " +
      peak +
      "deg, var(--orange) " +
      peak +
      "deg " +
      deg +
      "deg, var(--carbon-3) " +
      deg +
      "deg)";
  }

  function runPull() {
    if (pulling) return;
    pulling = true;
    pullBtn.disabled = true;
    var start = performance.now();
    var dur = 2300;
    var maxRpm = 7200;
    var maxHp = 408;
    var maxTq = 369;
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 2.4);
      var rpm = Math.round(maxRpm * e);
      var hp = Math.round(maxHp * Math.pow(e, 1.15));
      var tq = Math.round(maxTq * Math.min(e * 1.3, 1));
      var boost = (1.8 * Math.min(e * 1.4, 1)).toFixed(1);
      var afr = (14.7 - 3.5 * e).toFixed(1);
      rpmVal.textContent = rpm.toLocaleString();
      hpVal.textContent = hp + " hp";
      tqVal.textContent = tq + " lb-ft";
      boostVal.textContent = boost + " bar";
      afrVal.textContent = afr;
      paintRing(e);
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        pulling = false;
        pullBtn.disabled = false;
        toast("Pull complete — peak 408 hp @ 6,400 rpm");
      }
    }
    requestAnimationFrame(frame);
  }
  paintRing(0);
  if (pullBtn) pullBtn.addEventListener("click", runPull);

  /* ---------- Dyno before/after chart ---------- */
  var dynoSvg = document.getElementById("dynoSvg");
  var areaTuned = document.getElementById("areaTuned");
  var lineStock = document.getElementById("lineStock");
  var lineTuned = document.getElementById("lineTuned");
  var chips = document.querySelectorAll(".dyno-pick .chip");
  var drCar = document.getElementById("drCar");
  var drStock = document.getElementById("drStock");
  var drGain = document.getElementById("drGain");
  var drTuned = document.getElementById("drTuned");

  var W = 600,
    H = 280,
    MAXP = 900;

  // Build a torque-like power curve scaled to a peak value.
  function curve(peak) {
    var pts = [];
    var n = 24;
    for (var i = 0; i <= n; i++) {
      var t = i / n; // 0..1 across rpm
      // rises, plateaus near top, soft fall after redline
      var shape =
        Math.sin(t * Math.PI * 0.92) * 0.78 + t * 0.34 - Math.pow(Math.max(t - 0.82, 0), 2) * 2.4;
      shape = Math.max(shape, 0.06);
      var hp = peak * Math.min(shape, 1);
      var x = t * W;
      var y = H - (hp / MAXP) * H;
      pts.push([x, y]);
    }
    return pts;
  }

  function toPath(pts) {
    return pts
      .map(function (p, i) {
        return (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1);
      })
      .join(" ");
  }
  function toArea(pts) {
    return toPath(pts) + " L" + W + " " + H + " L0 " + H + " Z";
  }

  function setBuild(stock, tuned, car) {
    var sp = curve(stock);
    var tp = curve(tuned);
    lineStock.setAttribute("d", toPath(sp));
    lineTuned.setAttribute("d", toPath(tp));
    areaTuned.setAttribute("d", toArea(tp));
    drCar.textContent = car;
    drStock.textContent = stock + " hp";
    drTuned.textContent = tuned + " hp";
    drGain.textContent = "+" + (tuned - stock) + " hp";
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      setBuild(
        parseInt(chip.dataset.stock, 10),
        parseInt(chip.dataset.tuned, 10),
        chip.dataset.car
      );
    });
  });

  // init with first chip
  if (chips.length) {
    var first = chips[0];
    setBuild(
      parseInt(first.dataset.stock, 10),
      parseInt(first.dataset.tuned, 10),
      first.dataset.car
    );
  }

  /* ---------- Build gallery spec popups ---------- */
  document.querySelectorAll(".build").forEach(function (b) {
    b.addEventListener("click", function () {
      toast(b.dataset.spec);
    });
  });

  /* ---------- Package selection ---------- */
  document.querySelectorAll(".pkg-pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pkg = btn.dataset.pkg;
      var goal = document.getElementById("bGoal");
      if (goal) {
        for (var i = 0; i < goal.options.length; i++) {
          if (goal.options[i].text.indexOf(pkg) === 0) {
            goal.selectedIndex = i;
            break;
          }
        }
      }
      toast(pkg + " selected — finish booking below");
      document.getElementById("book").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Booking form validation ---------- */
  var form = document.getElementById("bookForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["bName", "bCar", "bDate"].forEach(function (id) {
        var input = document.getElementById(id);
        var field = input.closest(".field");
        if (!input.value.trim()) {
          field.classList.add("error");
          ok = false;
        } else {
          field.classList.remove("error");
        }
      });
      if (!ok) {
        toast("Add your name, vehicle and a date");
        return;
      }
      var name = document.getElementById("bName").value.trim().split(" ")[0];
      toast("Bay request sent — we'll confirm by tomorrow, " + name + "!");
      form.reset();
    });
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field) field.classList.remove("error");
    });
  }
})();
