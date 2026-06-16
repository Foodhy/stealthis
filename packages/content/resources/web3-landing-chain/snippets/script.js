/* ============================================================
   Lumen Chain — L1/L2 landing interactions (vanilla JS)
   UI-only simulation. No wallet, RPC, or on-chain calls.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  /* ---------- data-toast buttons ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () {
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ============================================================
     STARFIELD
     ============================================================ */
  (function starfield() {
    var canvas = document.getElementById("starfield");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0,
      h = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var count = Math.round((w * h) / 6500);
      count = Math.max(40, Math.min(220, count));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 0.8 + 0.2, // depth → size/speed
          tw: Math.random() * Math.PI * 2, // twinkle phase
        });
      }
    }

    var palette = ["91,140,255", "0,255,163", "200,215,255"];

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        // gentle drift upward, wrap around
        s.y -= s.z * 0.12;
        if (s.y < -2) {
          s.y = h + 2;
          s.x = Math.random() * w;
        }
        var twinkle = 0.55 + 0.45 * Math.sin(t * 0.0014 + s.tw);
        var r = s.z * 1.4;
        var c = palette[i % palette.length];
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + c + "," + (0.18 + s.z * 0.5 * twinkle).toFixed(3) + ")";
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    var raf = null;
    resize();
    window.addEventListener("resize", resize);

    if (prefersReduced) {
      // static single paint
      var tNow = 0;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var c = palette[i % palette.length];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.z * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + c + "," + (0.18 + s.z * 0.45).toFixed(3) + ")";
        ctx.fill();
      }
    } else {
      raf = requestAnimationFrame(frame);
    }
  })();

  /* ============================================================
     COUNT-UP METRICS
     ============================================================ */
  function formatValue(el, val) {
    var fmt = el.getAttribute("data-format");
    if (fmt === "compact") {
      // 128400 -> 128.4K, 412 -> 412
      if (val >= 1000) {
        var k = val / 1000;
        return (k >= 100 ? Math.round(k) : k.toFixed(1)).toString() + "K";
      }
      return Math.round(val).toString();
    }
    if (fmt === "fixed") {
      var dec = parseInt(el.getAttribute("data-decimals") || "2", 10);
      return val.toFixed(dec);
    }
    // int with thousands separators
    return Math.round(val).toLocaleString("en-US");
  }

  function animateCount(el) {
    if (el.dataset.done === "1") return;
    el.dataset.done = "1";
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    if (prefersReduced) {
      el.textContent = formatValue(el, target);
      return;
    }
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      // easeOutExpo
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = formatValue(el, target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatValue(el, target);
    }
    requestAnimationFrame(step);
  }

  /* ============================================================
     SCROLL OBSERVERS — counts + comparison bars
     ============================================================ */
  var counts = document.querySelectorAll(".count");
  var barGroups = document.querySelectorAll("[data-bars]");

  function fillBars(group) {
    if (group.dataset.done === "1") return;
    group.dataset.done = "1";
    group.querySelectorAll(".bar-fill").forEach(function (bar, i) {
      var pct = Math.max(0, Math.min(100, parseFloat(bar.getAttribute("data-fill")) || 0));
      setTimeout(
        function () {
          bar.style.width = pct + "%";
        },
        prefersReduced ? 0 : i * 110
      );
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          if (el.classList.contains("count")) animateCount(el);
          else if (el.hasAttribute("data-bars")) fillBars(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.35 }
    );
    counts.forEach(function (c) {
      io.observe(c);
    });
    barGroups.forEach(function (g) {
      io.observe(g);
    });
  } else {
    counts.forEach(animateCount);
    barGroups.forEach(fillBars);
  }

  /* ============================================================
     CODE TABS
     ============================================================ */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".code-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".code-panel"));

  function activateTab(tab) {
    var name = tab.getAttribute("data-tab");
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
    });
    panels.forEach(function (p) {
      var on = p.getAttribute("data-panel") === name;
      p.classList.toggle("is-active", on);
      if (on) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "");
    });
  }

  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () {
      activateTab(tab);
    });
    // roving-tabindex keyboard nav
    tab.addEventListener("keydown", function (e) {
      var dir = 0;
      if (e.key === "ArrowRight") dir = 1;
      else if (e.key === "ArrowLeft") dir = -1;
      else return;
      e.preventDefault();
      var next = (idx + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      activateTab(tabs[next]);
    });
  });

  /* ============================================================
     COPY-TO-CLIPBOARD (active code panel)
     ============================================================ */
  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var active = document.querySelector(".code-panel.is-active code");
      var text = active ? active.innerText : "";
      var done = function () {
        copyBtn.classList.add("is-copied");
        copyBtn.textContent = "Copied ✓";
        toast("Snippet copied to clipboard");
        setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          copyBtn.textContent = "Copy";
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        } catch (err) {
          toast("Copy not supported in this browser");
        }
      }
    });
  }

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  var burger = document.getElementById("navBurger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      mobileMenu.hidden = !open;
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        mobileMenu.hidden = true;
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================================
     LIVE BLOCK HEIGHT (simulated)
     ============================================================ */
  var liveBlock = document.getElementById("liveBlock");
  if (liveBlock) {
    var height = 19482006;
    var render = function () {
      liveBlock.textContent = "#" + height.toLocaleString("en-US");
    };
    render();
    if (!prefersReduced) {
      setInterval(function () {
        height += Math.floor(Math.random() * 3) + 1;
        render();
      }, 1600);
    }
  }
})();
