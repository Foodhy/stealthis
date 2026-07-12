(function () {
  "use strict";

  /* ---------- Trace data (a realistic agent run) ---------- */
  const TRACE = [
    {
      kind: "thought",
      label: "Break the task into subgoals",
      tokens: 128,
      duration: 640,
      payload: {
        reasoning:
          "User wants the cheapest NYC → Tokyo flight next month. I should resolve the date window, query a flight search tool, then compare fares.",
        plan: ["resolve_dates", "search_flights", "rank_by_price"],
      },
    },
    {
      kind: "tool",
      label: "Call <code>resolve_dates</code>",
      tokens: 74,
      duration: 210,
      payload: {
        name: "resolve_dates",
        arguments: { expression: "next month", from: "2026-07-01" },
      },
      substeps: [
        { name: "parse relative range", ok: true, duration: 40 },
        { name: "clamp to calendar", ok: true, duration: 22 },
      ],
    },
    {
      kind: "observation",
      label: "Date window resolved",
      tokens: 46,
      duration: 12,
      payload: { start: "2026-08-01", end: "2026-08-31", days: 31 },
    },
    {
      kind: "tool",
      label: "Call <code>search_flights</code>",
      tokens: 312,
      duration: 1840,
      payload: {
        name: "search_flights",
        arguments: {
          origin: "JFK",
          destination: "HND",
          depart_between: ["2026-08-01", "2026-08-31"],
          cabin: "economy",
          sort: "price_asc",
          max_results: 5,
        },
      },
      substeps: [
        { name: "query carrier: ANA", ok: true, duration: 610 },
        { name: "query carrier: JAL", ok: true, duration: 580 },
        { name: "query carrier: United", ok: true, duration: 640 },
      ],
    },
    {
      kind: "observation",
      label: "Received 5 fare candidates",
      tokens: 268,
      duration: 18,
      payload: {
        results: [
          { carrier: "ANA", price_usd: 812, stops: 1, depart: "2026-08-19" },
          { carrier: "United", price_usd: 848, stops: 1, depart: "2026-08-12" },
          { carrier: "JAL", price_usd: 903, stops: 0, depart: "2026-08-22" },
        ],
        currency: "USD",
      },
    },
    {
      kind: "tool",
      label: "Call <code>currency_convert</code>",
      tokens: 58,
      duration: 900,
      error: true,
      payload: {
        name: "currency_convert",
        arguments: { amount: 812, from: "USD", to: "JPY" },
        error: {
          code: "UPSTREAM_TIMEOUT",
          message: "FX rate provider did not respond within 900ms",
          retryable: true,
        },
      },
      substeps: [{ name: "http GET /rates", ok: false, duration: 900 }],
    },
    {
      kind: "thought",
      label: "Recover from failed conversion",
      tokens: 90,
      duration: 380,
      payload: {
        reasoning:
          "Currency conversion timed out but it is non-critical — the user did not request JPY. I will proceed and report the USD price directly.",
        decision: "skip_conversion",
      },
    },
    {
      kind: "answer",
      label: "Cheapest flight found",
      tokens: 156,
      duration: 520,
      payload: {
        answer:
          "The cheapest NYC → Tokyo flight next month is ANA at $812 (1 stop), departing Aug 19, 2026.",
        confidence: 0.94,
        sources: ["search_flights"],
      },
    },
  ];

  /* ---------- Icons ---------- */
  const ICONS = {
    thought:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3Z"/><path d="M9 21h6"/></svg>',
    tool:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6a3.5 3.5 0 0 1 4.7 4.4l-9 9-3.7-3.7 9-9Z"/></svg>',
    observation:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.4"/></svg>',
    answer:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4.5 4.5L19 6.5"/></svg>',
    error:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 16.5v.5"/></svg>',
  };
  const CHEV =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  const CLOCK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const COIN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/></svg>';
  const COPY =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  const KIND_LABEL = {
    thought: "Thought",
    tool: "Tool call",
    observation: "Observation",
    answer: "Answer",
  };

  /* ---------- DOM refs ---------- */
  const traceEl = document.getElementById("trace");
  const emptyEl = document.getElementById("empty");
  const runBtn = document.getElementById("run-btn");
  const expandBtn = document.getElementById("expand-btn");
  const statusBar = document.getElementById("status-bar");
  const toast = document.getElementById("toast");
  const segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg"));

  const stat = {
    steps: document.getElementById("stat-steps"),
    duration: document.getElementById("stat-duration"),
    tokens: document.getElementById("stat-tokens"),
    errors: document.getElementById("stat-errors"),
  };
  const errCell = stat.errors.closest(".summary__cell");

  let running = false;
  let filter = "all";
  let allExpanded = false;

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function highlightJson(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      function (match) {
        let cls = "tok-num";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "tok-key" : "tok-str";
        } else if (/true|false/.test(match)) {
          cls = "tok-bool";
        } else if (/null/.test(match)) {
          cls = "tok-null";
        }
        return '<span class="' + cls + '">' + escapeHtml(match) + "</span>";
      }
    );
  }

  function fmtSecs(ms) {
    return (ms / 1000).toFixed(2) + "s";
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1700);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      /* fall through to legacy path */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  /* ---------- Build one step node ---------- */
  function buildStep(step, index) {
    const li = document.createElement("li");
    li.className = "step" + (step.error ? " is-error" : "");
    li.dataset.kind = step.kind;
    li.dataset.index = String(index);
    li.setAttribute("aria-expanded", "false");

    const iconKey = step.error ? "error" : step.kind;
    const bodyId = "step-body-" + index;

    let metaHtml =
      '<span class="m" title="wall-clock duration">' +
      CLOCK +
      fmtSecs(step.duration) +
      "</span>" +
      '<span class="m" title="tokens used">' +
      COIN +
      step.tokens +
      "</span>";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "step__head";
    head.setAttribute("aria-expanded", "false");
    head.setAttribute("aria-controls", bodyId);
    head.innerHTML =
      '<span class="step__chev" aria-hidden="true">' +
      CHEV +
      "</span>" +
      '<span class="step__kind">' +
      (step.error ? "Error" : KIND_LABEL[step.kind]) +
      "</span>" +
      '<span class="step__label">' +
      step.label +
      "</span>" +
      '<span class="step__meta">' +
      metaHtml +
      "</span>";

    const dot = document.createElement("span");
    dot.className = "step__dot";
    dot.setAttribute("aria-hidden", "true");
    dot.innerHTML = ICONS[iconKey];

    const body = document.createElement("div");
    body.className = "step__body";
    body.id = bodyId;
    body.setAttribute("role", "region");

    const inner = document.createElement("div");
    inner.className = "step__body-inner";

    // substeps
    if (step.substeps && step.substeps.length) {
      const sub = document.createElement("ul");
      sub.className = "substeps";
      step.substeps.forEach(function (s) {
        const sli = document.createElement("li");
        sli.className = "substep " + (s.ok ? "is-ok" : "is-error");
        sli.innerHTML =
          '<span class="substep__dot" aria-hidden="true"></span>' +
          '<span class="substep__name">' +
          escapeHtml(s.name) +
          "</span>" +
          '<span class="substep__dur">' +
          fmtSecs(s.duration) +
          "</span>";
        sub.appendChild(sli);
      });
      inner.appendChild(sub);
    }

    // payload
    const pay = document.createElement("figure");
    pay.className = "payload";
    pay.innerHTML =
      '<div class="payload__bar">' +
      '<span class="payload__tag">' +
      (step.kind === "tool" ? "tool_call.json" : step.error ? "error.json" : "payload.json") +
      "</span>" +
      '<button class="copy-btn" type="button">' +
      COPY +
      "<span>Copy</span></button>" +
      "</div>" +
      "<pre><code>" +
      highlightJson(step.payload) +
      "</code></pre>";

    const copyBtn = pay.querySelector(".copy-btn");
    copyBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      copyText(JSON.stringify(step.payload, null, 2)).then(function (ok) {
        showToast(ok ? "Payload copied to clipboard" : "Copy failed");
      });
    });

    inner.appendChild(pay);
    body.appendChild(inner);

    head.addEventListener("click", function () {
      toggleStep(li);
    });

    li.appendChild(dot);
    li.appendChild(head);
    li.appendChild(body);
    return li;
  }

  function toggleStep(li, force) {
    const expanded = force != null ? force : li.getAttribute("aria-expanded") !== "true";
    const body = li.querySelector(".step__body");
    const head = li.querySelector(".step__head");
    li.setAttribute("aria-expanded", String(expanded));
    head.setAttribute("aria-expanded", String(expanded));
    body.style.maxHeight = expanded ? body.scrollHeight + 40 + "px" : "0px";
  }

  /* ---------- Filtering ---------- */
  function applyFilter() {
    const steps = traceEl.querySelectorAll(".step");
    let visible = 0;
    steps.forEach(function (li) {
      const kind = li.dataset.kind;
      const isErr = li.classList.contains("is-error");
      let show = true;
      if (filter === "tools") show = kind === "tool";
      else if (filter === "errors") show = isErr;
      li.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });
    if (steps.length) {
      emptyEl.classList.toggle("is-hidden", visible > 0);
      if (visible === 0) {
        emptyEl.querySelector(".empty__msg").innerHTML =
          "No steps match the <strong>" + filter + "</strong> filter.";
      }
    }
  }

  /* ---------- Stats ---------- */
  function updateStats(upto) {
    let steps = 0;
    let dur = 0;
    let tokens = 0;
    let errors = 0;
    for (let i = 0; i < upto; i++) {
      const s = TRACE[i];
      steps++;
      dur += s.duration;
      tokens += s.tokens;
      if (s.error) errors++;
    }
    stat.steps.textContent = steps;
    stat.duration.textContent = fmtSecs(dur);
    stat.tokens.textContent = tokens.toLocaleString();
    stat.errors.textContent = errors;
    errCell.classList.toggle("has-errors", errors > 0);
  }

  function setStatus(text, done) {
    statusBar.classList.toggle("is-done", !!done);
    if (!text) {
      statusBar.innerHTML = "";
      return;
    }
    const pulse = done ? "" : '<span class="status-bar__pulse" aria-hidden="true"></span>';
    statusBar.innerHTML = pulse + "<span>" + escapeHtml(text) + "</span>";
  }

  /* ---------- Streaming run ---------- */
  function delay(ms) {
    return new Promise(function (res) {
      setTimeout(res, ms);
    });
  }

  async function run() {
    if (running) return;
    running = true;
    allExpanded = false;
    expandBtn.textContent = "Expand all";
    expandBtn.disabled = true;
    traceEl.innerHTML = "";
    emptyEl.classList.add("is-hidden");
    runBtn.classList.add("is-running");
    runBtn.querySelector(".btn__label").textContent = "Running…";
    updateStats(0);

    for (let i = 0; i < TRACE.length; i++) {
      const step = TRACE[i];
      setStatus("Executing step " + (i + 1) + " / " + TRACE.length + " — " + KIND_LABEL[step.kind] + "…");

      const node = buildStep(step, i);
      node.classList.add("is-streaming");
      traceEl.appendChild(node);
      traceEl.scrollTop = traceEl.scrollHeight;

      // simulate the step "thinking/executing" using its own duration (scaled)
      await delay(Math.min(520, 180 + step.duration * 0.18));
      node.classList.remove("is-streaming");
      updateStats(i + 1);
      applyFilter();
    }

    setStatus("Run complete — " + TRACE.length + " steps, " + stat.tokens.textContent + " tokens", true);
    runBtn.classList.remove("is-running");
    runBtn.querySelector(".btn__label").textContent = "Run again";
    expandBtn.disabled = false;
    running = false;
  }

  /* ---------- Events ---------- */
  runBtn.addEventListener("click", run);

  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      filter = btn.dataset.filter;
      applyFilter();
    });
  });

  expandBtn.addEventListener("click", function () {
    allExpanded = !allExpanded;
    expandBtn.textContent = allExpanded ? "Collapse all" : "Expand all";
    traceEl.querySelectorAll(".step").forEach(function (li) {
      if (!li.classList.contains("is-hidden")) toggleStep(li, allExpanded);
    });
  });

  setStatus("Idle — no trace loaded yet.", true);
})();
