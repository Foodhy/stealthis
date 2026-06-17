(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  /* ---------- sticky nav state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("primary-nav");
  function closeMenu() {
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    links.classList.remove("open");
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      links.classList.toggle("open", !open);
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up ---------- */
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* ---------- terminal typewriter ---------- */
  var term = document.getElementById("termCode");
  if (term) {
    var lines = [
      { t: "$ ", c: "tk-g" }, { t: "northbyte deploy --env prod\n", c: "tk-w" },
      { t: "→ ", c: "tk-k" }, { t: "running 412 tests", c: "tk-w" }, { t: " … ", c: "tk-c" }, { t: "all green\n", c: "tk-g" },
      { t: "→ ", c: "tk-k" }, { t: "building image", c: "tk-w" }, { t: " … ", c: "tk-c" }, { t: "ok (38s)\n", c: "tk-g" },
      { t: "→ ", c: "tk-k" }, { t: "rolling out canary 5% → 100%\n", c: "tk-w" },
      { t: "✓ ", c: "tk-g" }, { t: "p99 latency", c: "tk-w" }, { t: " 41ms", c: "tk-g" }, { t: "  uptime", c: "tk-w" }, { t: " 99.98%\n", c: "tk-g" },
      { t: "# ", c: "tk-c" }, { t: "shipped to prod. no incidents.", c: "tk-c" }
    ];
    if (reduce) {
      term.innerHTML = lines.map(function (s) {
        return '<span class="' + s.c + '">' + escapeHtml(s.t) + "</span>";
      }).join("");
    } else {
      var li = 0, ci = 0, current = null;
      function tick() {
        if (li >= lines.length) {
          setTimeout(function () { term.innerHTML = ""; li = 0; ci = 0; current = null; tick(); }, 3800);
          return;
        }
        var seg = lines[li];
        if (ci === 0) {
          current = document.createElement("span");
          current.className = seg.c;
          term.appendChild(current);
        }
        current.textContent += seg.t.charAt(ci);
        ci++;
        if (ci >= seg.t.length) { li++; ci = 0; }
        var ch = seg.t.charAt(Math.max(ci - 1, 0));
        var delay = ch === "\n" ? 240 : (18 + Math.random() * 38);
        setTimeout(tick, delay);
      }
      tick();
    }
  }
  function escapeHtml(s) {
    return s.replace(/[&<>]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]; });
  }

  /* ---------- testimonials carousel ---------- */
  var quotes = Array.prototype.slice.call(document.querySelectorAll(".quote"));
  var qdots = Array.prototype.slice.call(document.querySelectorAll(".qdot"));
  var qi = 0, qTimer;
  function showQuote(n) {
    qi = (n + quotes.length) % quotes.length;
    quotes.forEach(function (q, i) { q.classList.toggle("is-active", i === qi); });
    qdots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === qi);
      d.setAttribute("aria-selected", String(i === qi));
    });
  }
  function autoQuote() {
    clearInterval(qTimer);
    if (reduce) return;
    qTimer = setInterval(function () { showQuote(qi + 1); }, 5500);
  }
  qdots.forEach(function (d, i) {
    d.addEventListener("click", function () { showQuote(i); autoQuote(); });
  });
  if (quotes.length) { showQuote(0); autoQuote(); }

  /* ---------- contact form ---------- */
  var form = document.getElementById("startForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      ["f-name", "f-email", "f-scope"].forEach(function (id) {
        var el = document.getElementById(id);
        var field = el.closest(".field");
        var valid = el.value.trim().length > 0;
        if (id === "f-email") valid = valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        field.classList.toggle("invalid", !valid);
        if (!valid && ok) { ok = false; firstBad = el; }
      });
      if (!ok) { if (firstBad) firstBad.focus(); toast("Please fill in every field correctly."); return; }
      var name = document.getElementById("f-name").value.trim().split(" ")[0];
      form.reset();
      toast("Thanks, " + name + " — a senior engineer will reply within a day.");
    });
    form.addEventListener("input", function (e) {
      var f = e.target.closest(".field");
      if (f) f.classList.remove("invalid");
    });
  }

  /* ---------- back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- CTA link toasts ---------- */
  document.querySelectorAll('a[href="#start"]').forEach(function (a) {
    a.addEventListener("click", function () {
      setTimeout(function () { toast("Tell us what you're building below ↓"); }, 360);
    });
  });
})();
