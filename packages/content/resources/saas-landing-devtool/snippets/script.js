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
    }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) { reject(e); }
    });
  }

  /* ---------- Copy install command ---------- */
  var copyInstall = document.getElementById("copyInstall");
  var installCmd = document.getElementById("installCmd");
  if (copyInstall && installCmd) {
    copyInstall.addEventListener("click", function () {
      var cmd = installCmd.textContent.trim();
      copyText(cmd).then(function () {
        copyInstall.classList.add("copied");
        var label = copyInstall.querySelector(".copy-label");
        if (label) label.textContent = "Copied";
        toast("Copied: " + cmd);
        setTimeout(function () {
          copyInstall.classList.remove("copied");
          if (label) label.textContent = "Copy";
        }, 1800);
      }).catch(function () { toast("Copy failed — select manually"); });
    });
  }

  /* ---------- Code tab switcher ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = document.querySelectorAll(".code-panel");

  function activateTab(tab) {
    var key = tab.getAttribute("data-tab");
    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.setAttribute("tabindex", active ? "0" : "-1");
    });
    panels.forEach(function (p) {
      var match = p.getAttribute("data-panel") === key;
      p.classList.toggle("is-active", match);
      if (match) { p.removeAttribute("hidden"); } else { p.setAttribute("hidden", ""); }
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var next;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); next.focus(); activateTab(next); }
    });
  });

  /* ---------- Copy active code sample ---------- */
  var copyCode = document.getElementById("copyCode");
  if (copyCode) {
    copyCode.addEventListener("click", function () {
      var active = document.querySelector(".code-panel.is-active code");
      if (!active) return;
      copyText(active.textContent).then(function () {
        copyCode.classList.add("copied");
        copyCode.textContent = "Copied";
        toast("Code sample copied to clipboard");
        setTimeout(function () {
          copyCode.classList.remove("copied");
          copyCode.textContent = "Copy";
        }, 1800);
      }).catch(function () { toast("Copy failed"); });
    });
  }

  /* ---------- Typed terminal ---------- */
  var termBody = document.getElementById("termBody");
  if (termBody) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lines = [
      { t: "$ pulsar deploy --prod", cls: "tprompt" },
      { t: "→ Building checkout (node 20, edge runtime)…", cls: "tdim" },
      { t: "✓ Compiled 142 modules in 1.8s", cls: "" },
      { t: "→ Uploading bundle 4.2 MB to iad, fra, sin…", cls: "tdim" },
      { t: "✓ Deployed dpl_9f3a2 in 11.4s", cls: "tok" },
      { t: "  https://checkout.pulsar.app is live", cls: "" }
    ];

    function buildLine(line) {
      var span = document.createElement("span");
      if (line.cls) span.className = line.cls;
      span.textContent = line.t;
      return span;
    }

    if (reduce) {
      lines.forEach(function (l) {
        termBody.appendChild(buildLine(l));
        termBody.appendChild(document.createTextNode("\n"));
      });
    } else {
      var li = 0;
      var cursor = document.createElement("span");
      cursor.className = "tcursor";
      cursor.textContent = "█";

      function typeLine() {
        if (li >= lines.length) {
          li = 0;
          setTimeout(function () { termBody.textContent = ""; termBody.appendChild(cursor); typeLine(); }, 2600);
          return;
        }
        var line = lines[li];
        var span = buildLine(line);
        termBody.insertBefore(span, cursor);
        var ci = 0;
        var full = line.t;
        span.textContent = "";
        (function typeChar() {
          if (ci <= full.length) {
            span.textContent = full.slice(0, ci);
            ci++;
            setTimeout(typeChar, 18 + Math.random() * 22);
          } else {
            termBody.insertBefore(document.createTextNode("\n"), cursor);
            li++;
            setTimeout(typeLine, 380);
          }
        })();
      }
      termBody.appendChild(cursor);
      typeLine();
    }
  }

  /* ---------- Animated GitHub stat counters ---------- */
  var counted = false;
  function animateCounters() {
    if (counted) return;
    counted = true;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var dur = 1100;
      var start = performance.now();
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  var proof = document.getElementById("proof");
  if (proof && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCounters(); obs.disconnect(); }
      });
    }, { threshold: 0.3 });
    obs.observe(proof);
  } else {
    animateCounters();
  }

  /* ---------- Star button ---------- */
  var starBtn = document.getElementById("starBtn");
  var starLabel = document.getElementById("starLabel");
  var ghStars = document.getElementById("ghStars");
  var navStars = document.getElementById("navStars");
  var base = 24832;
  var starred = false;
  if (starBtn) {
    starBtn.addEventListener("click", function () {
      starred = !starred;
      starBtn.classList.toggle("starred", starred);
      var val = base + (starred ? 1 : 0);
      if (starLabel) starLabel.textContent = starred ? "Starred" : "Star";
      if (ghStars) ghStars.textContent = val.toLocaleString("en-US");
      if (navStars) navStars.textContent = val.toLocaleString("en-US");
      toast(starred ? "Thanks for the star! ★" : "Star removed");
    });
  }
})();
