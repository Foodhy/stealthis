(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- theme toggle ---------- */
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var light = document.documentElement.getAttribute("data-theme") === "light";
      var next = light ? null : "light";
      if (next) document.documentElement.setAttribute("data-theme", next);
      else document.documentElement.removeAttribute("data-theme");
      var nowLight = !light;
      themeToggle.setAttribute("aria-pressed", String(nowLight));
      themeToggle.querySelector(".theme-label").textContent = nowLight ? "Light" : "Dark";
      themeToggle.querySelector(".theme-ico").textContent = nowLight ? "◑" : "◐";
    });
  }

  /* ---------- prompt → streaming demo ---------- */
  var promptInput = document.getElementById("promptInput");
  var runBtn = document.getElementById("runBtn");
  var resultEmpty = document.getElementById("resultEmpty");
  var resultBody = document.getElementById("resultBody");
  var rbText = document.getElementById("rbText");
  var rbMeta = document.getElementById("rbMeta");
  var rbFoot = document.getElementById("rbFoot");
  var tokCount = document.getElementById("tokCount");
  var streamState = document.getElementById("streamState");
  var copyBtn = document.getElementById("copyBtn");
  var regenBtn = document.getElementById("regenBtn");

  // auto-grow textarea
  function autoGrow() {
    promptInput.style.height = "auto";
    promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + "px";
  }
  if (promptInput) {
    autoGrow();
    promptInput.addEventListener("input", autoGrow);
    promptInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
    });
  }

  // canned responses keyed by intent — picked by simple keyword match
  var CANNED = [
    {
      match: ["summar", "q3", "launch", "bullet"],
      text: "Here's a tight summary of the Q3 launch:\n\n• Shipped Lumina 3.5 with a 280K-token context — 2.3× longer documents in one pass.\n• Cut median response latency 41% while holding answer quality steady on internal evals.\n• Opened the streaming SDK to 65+ integrations, with day-one connectors for Slack and Notion.\n\nTagline: “Think bigger. Ship faster. Lumina 3.5.”"
    },
    {
      match: ["cold email", "cto", "infra", "cost"],
      text: "Subject: Trim 30% off your infra bill this quarter\n\nHi {Name},\n\nMost platform teams overspend on idle compute they can't see. Lumina maps your workloads, flags waste, and drafts the migration plan — usually surfacing a 25–35% reduction in the first week.\n\nWorth a 15-minute look? I'll bring a sample teardown of a stack like yours.\n\n— The Lumina team"
    },
    {
      match: ["vector", "database", "pm", "product manager"],
      text: "Vector databases, for a PM:\n\n1. They store meaning as coordinates, not exact text — “dog” and “puppy” land close together.\n2. A search finds nearest neighbors, so you match by intent instead of keywords.\n3. That powers semantic search, recommendations, and RAG for AI features.\n4. The win: relevance without brittle keyword rules."
    },
    {
      match: ["checklist", "5-step", "5 step", "launch plan", "mobile app"],
      text: "5-step mobile app launch checklist:\n\n1. Lock scope — freeze the v1 feature list and write the one-line value prop.\n2. Polish — run a device matrix pass and fix the top 10 friction points.\n3. Stage — ship a TestFlight/closed beta to ~100 users, watch crash-free rate.\n4. Prep store — screenshots, keywords, and a 30-second preview video.\n5. Launch — submit for review, schedule announcements, and stand up day-one support."
    }
  ];
  var FALLBACK = "Got it. Here's a first pass:\n\n• I broke your request into clear, actionable steps.\n• Each point is concrete enough to act on today.\n• Ask a follow-up and I'll refine the tone, length, or depth.\n\nThis is a canned demo response — in the real product, Lumina streams a live answer here.";

  function pickResponse(prompt) {
    var p = prompt.toLowerCase();
    var best = null, bestScore = 0;
    CANNED.forEach(function (c) {
      var score = c.match.reduce(function (s, k) { return s + (p.indexOf(k) > -1 ? 1 : 0); }, 0);
      if (score > bestScore) { bestScore = score; best = c; }
    });
    return best && bestScore > 0 ? best.text : FALLBACK;
  }

  var streaming = false;
  var streamTimer = null;
  var lastPrompt = "";

  function setState(state) {
    streamState.textContent = state;
    streamState.setAttribute("data-state", state);
  }

  function tokenize(text) {
    // split into word-ish tokens, keeping whitespace/newlines attached
    return text.match(/\s*\S+|\s+/g) || [text];
  }

  function run() {
    if (streaming) return;
    var prompt = (promptInput.value || "").trim();
    if (!prompt) { toast("Type a prompt first"); promptInput.focus(); return; }
    lastPrompt = prompt;
    startStream(pickResponse(prompt));
  }

  function startStream(fullText) {
    streaming = true;
    runBtn.disabled = true;
    regenBtn && (regenBtn.disabled = true);
    resultEmpty.hidden = true;
    resultBody.hidden = false;
    rbFoot.hidden = true;
    setState("streaming");
    var t0 = performance.now();

    var tokens = tokenize(fullText);
    var i = 0;
    rbText.innerHTML = "";
    var span = document.createElement("span");
    rbText.appendChild(span);
    var cursor = document.createElement("span");
    cursor.className = "cursor";
    rbText.appendChild(cursor);

    function finish() {
      streaming = false;
      runBtn.disabled = false;
      regenBtn && (regenBtn.disabled = false);
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      var ms = Math.round(performance.now() - t0);
      var words = fullText.trim().split(/\s+/).length;
      rbMeta.textContent = "responded in " + (ms / 1000).toFixed(1) + "s";
      tokCount.textContent = "~" + Math.round(words * 1.3) + " tokens";
      rbFoot.hidden = false;
      setState("done");
    }

    if (reduceMotion) {
      span.textContent = fullText;
      finish();
      return;
    }

    function step() {
      if (i >= tokens.length) { finish(); return; }
      span.textContent += tokens[i];
      i++;
      var delay = 14 + Math.random() * 36;
      if (/[.\n!?]/.test(tokens[i - 1] || "")) delay += 90;
      streamTimer = setTimeout(step, delay);
    }
    step();
  }

  if (runBtn) runBtn.addEventListener("click", run);

  if (regenBtn) regenBtn.addEventListener("click", function () {
    if (!lastPrompt) return;
    startStream(pickResponse(lastPrompt));
  });

  if (copyBtn) copyBtn.addEventListener("click", function () {
    var text = rbText.textContent || "";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Copied to clipboard"); },
        function () { toast("Copy failed"); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("Copied to clipboard"); }
      catch (e) { toast("Copy failed"); }
      document.body.removeChild(ta);
    }
  });

  // example chips
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (streaming) { clearTimeout(streamTimer); streaming = false; runBtn.disabled = false; }
      promptInput.value = chip.getAttribute("data-prompt");
      autoGrow();
      run();
    });
  });

  /* ---------- animated stat counters ---------- */
  var counters = document.querySelectorAll(".stats strong[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute("data-count"); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = performance.now(), dur = 1100;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- CTA form ---------- */
  var ctaForm = document.getElementById("ctaForm");
  var ctaMsg = document.getElementById("ctaMsg");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("email").value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        ctaMsg.textContent = "Please enter a valid work email.";
        ctaMsg.className = "cta-fine err";
        document.getElementById("email").focus();
        return;
      }
      ctaMsg.textContent = "You're in — check " + email + " for your trial link.";
      ctaMsg.className = "cta-fine ok";
      ctaForm.reset();
      toast("Welcome to Lumina ✦");
    });
  }
})();
