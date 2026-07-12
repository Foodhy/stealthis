/* Tool Call Card — a pending→running→success/error state machine per card. */
(function () {
  "use strict";

  var STATUS_LABEL = {
    pending: "Pending",
    running: "Running",
    success: "Success",
    error: "Error",
  };

  /* Seeded tool calls, one per state so every branch is visible. */
  var CALLS = [
    {
      id: "wx",
      name: "get_weather",
      args: { location: "Kyoto, JP", units: "metric", forecast_days: 3 },
      state: "success",
      latency: 412,
      tokens: { prompt: 186, completion: 74 },
      result: {
        location: "Kyoto, JP",
        temp_c: 27.4,
        condition: "Partly cloudy",
        humidity: 0.61,
        forecast: [
          { day: "Tue", high: 29, low: 21 },
          { day: "Wed", high: 26, low: 20 },
        ],
      },
    },
    {
      id: "db",
      name: "query_database",
      args: {
        sql: "SELECT id, email FROM users WHERE plan = 'pro' LIMIT 20",
        readonly: true,
      },
      state: "running",
      latency: 0,
      tokens: { prompt: 241, completion: 0 },
      result: null,
    },
    {
      id: "http",
      name: "http_request",
      args: {
        method: "POST",
        url: "https://api.billing.internal/v2/charge",
        body: { amount_cents: 4900, currency: "usd" },
      },
      state: "error",
      latency: 1830,
      tokens: { prompt: 210, completion: 38 },
      result: {
        error: "UpstreamTimeout",
        status: 504,
        message: "Billing gateway did not respond within 1500ms",
        retryable: true,
      },
    },
    {
      id: "search",
      name: "web_search",
      args: { query: "state machines in ui components", top_k: 5 },
      state: "pending",
      latency: 0,
      tokens: { prompt: 0, completion: 0 },
      result: null,
    },
  ];

  /* ---------- JSON pretty-printer with lightweight highlighting ---------- */
  function esc(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlight(value) {
    var json = JSON.stringify(value, null, 2);
    return json.replace(
      /("(\\.|[^"\\])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
      function (match) {
        var cls = "tok-num";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "tok-key" : "tok-str";
        } else if (/true|false/.test(match)) {
          cls = "tok-bool";
        } else if (/null/.test(match)) {
          cls = "tok-null";
        }
        return '<span class="' + cls + '">' + esc(match) + "</span>";
      }
    );
  }

  /* ---------- clipboard with fallback ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (e) {
        reject(e);
      }
    });
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  /* ---------- icons ---------- */
  var ICON = {
    chev:
      '<svg class="chev" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.2l2 1.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    tokens:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5l5.6 3.2v6.6L8 14.5 2.4 11.3V4.7L8 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 8l5.6-3.3M8 8v6.5M8 8L2.4 4.7" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    retry:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 4.5A5.5 5.5 0 1 0 14 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13 1.5v3.2h-3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    run:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 3.2l7.4 4.8-7.4 4.8V3.2z" fill="currentColor"/></svg>',
    copy:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.6" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 10.5A1.5 1.5 0 0 1 2.5 9V3.5A1.5 1.5 0 0 1 4 2h5.5a1.5 1.5 0 0 1 1.5 1.5" stroke="currentColor" stroke-width="1.3"/></svg>',
    check:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.2 3L13 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  /* ---------- render a single card ---------- */
  var root = document.getElementById("cards");

  function fmtLatency(ms) {
    if (ms >= 1000) return (ms / 1000).toFixed(2) + "s";
    return Math.round(ms) + "ms";
  }

  function resultBlock(call) {
    var hasResult = call.state === "success" || call.state === "error";
    var running = call.state === "running";
    var expandable = hasResult;
    var summary =
      call.state === "success"
        ? "Result"
        : call.state === "error"
        ? "Error payload"
        : running
        ? "Awaiting result…"
        : "No result yet";

    var bodyHtml;
    if (hasResult) {
      var lines = JSON.stringify(call.result, null, 2).split("\n").length;
      bodyHtml =
        '<div class="result__body"><pre class="code">' +
        highlight(call.result) +
        "</pre></div>" +
        '<div class="result__actions"><button type="button" class="copy" data-copy>' +
        ICON.copy +
        "<span>Copy</span></button></div>";
      var _ = lines;
    } else if (running) {
      bodyHtml =
        '<div class="placeholder"><span class="pill__dot" style="border:2px solid rgba(34,211,238,.3);border-top-color:var(--accent-2);width:12px;height:12px;border-radius:50%;animation:spin .7s linear infinite"></span>' +
        '<span style="flex:1"><span class="bar" style="display:block;width:70%;margin-bottom:6px"></span><span class="bar" style="display:block;width:45%"></span></span></div>';
    } else {
      bodyHtml =
        '<div class="placeholder">Call has not run yet — press Run below.</div>';
    }

    var meta =
      hasResult && call.result
        ? '<span class="result__meta">' +
          Object.keys(call.result).length +
          " keys</span>"
        : "";

    return (
      '<div class="result">' +
      '<button type="button" class="result__toggle" aria-expanded="false" ' +
      (expandable ? "" : "disabled ") +
      'data-toggle>' +
      ICON.chev +
      "<span>" +
      summary +
      "</span>" +
      meta +
      "</button>" +
      '<div class="result__panel" data-panel><div class="result__inner">' +
      bodyHtml +
      "</div></div>" +
      "</div>"
    );
  }

  function cardHtml(call) {
    var canAct = call.state !== "running";
    var actionLabel = call.state === "pending" ? "Run" : "Retry";
    var actionIcon = call.state === "pending" ? ICON.run : ICON.retry;

    return (
      '<article class="card" data-state="' +
      call.state +
      '" data-id="' +
      call.id +
      '" aria-label="Tool call ' +
      call.name +
      '">' +
      '<div class="card__head">' +
      '<div class="fn"><span class="fn__label">Function</span>' +
      '<span class="fn__name">' +
      esc(call.name) +
      '<span class="paren">()</span></span></div>' +
      '<span class="pill"><span class="pill__dot"></span>' +
      STATUS_LABEL[call.state] +
      "</span>" +
      "</div>" +
      '<div class="blk"><div class="blk__label">Arguments</div>' +
      '<pre class="code">' +
      highlight(call.args) +
      "</pre></div>" +
      resultBlock(call) +
      '<div class="card__foot">' +
      '<span class="badge badge--lat">' +
      ICON.clock +
      "<span>latency <b data-latency>" +
      (call.latency ? fmtLatency(call.latency) : "—") +
      "</b></span></span>" +
      '<span class="badge badge--tok">' +
      ICON.tokens +
      "<span><b data-tokens>" +
      (call.tokens.prompt + call.tokens.completion) +
      "</b> tok</span></span>" +
      '<span class="spacer"></span>' +
      '<button type="button" class="btn" data-action ' +
      (canAct ? "" : "disabled") +
      ">" +
      actionIcon +
      "<span>" +
      actionLabel +
      "</span></button>" +
      "</div>" +
      "</article>"
    );
  }

  function render() {
    root.innerHTML = CALLS.map(cardHtml).join("");
  }

  /* ---------- disclosure toggle ---------- */
  function toggleDisclosure(btn) {
    var open = btn.getAttribute("aria-expanded") === "true";
    var panel = btn.parentElement.querySelector("[data-panel]");
    btn.setAttribute("aria-expanded", String(!open));
    panel.setAttribute("data-open", String(!open));
  }

  /* ---------- run / retry: drive the state machine ---------- */
  var timers = {};

  function setCallState(call, state) {
    call.state = state;
    var card = root.querySelector('[data-id="' + call.id + '"]');
    if (!card) return;
    card.outerHTML = cardHtml(call);
  }

  function runCall(call) {
    if (call.state === "running") return;
    if (timers[call.id]) return;

    // move to running with a live latency counter
    call.state = "running";
    call.latency = 0;
    call.tokens.completion = 0;
    call.result = null;
    setCallState(call, "running");

    var card = root.querySelector('[data-id="' + call.id + '"]');
    var latEl = card.querySelector("[data-latency]");
    var tokEl = card.querySelector("[data-tokens]");

    // Decide outcome + a realistic duration. The billing call fails.
    var willFail = call.name === "http_request";
    var duration = willFail ? 1500 + Math.random() * 500 : 350 + Math.random() * 900;
    var completionTokens = willFail ? 38 : 40 + Math.floor(Math.random() * 90);

    var start = performance.now();
    function tick(now) {
      var elapsed = Math.min(now - start, duration);
      if (latEl) latEl.textContent = fmtLatency(elapsed);
      if (tokEl) {
        var grown = Math.floor((elapsed / duration) * completionTokens);
        tokEl.textContent = call.tokens.prompt + grown;
      }
      if (elapsed < duration) {
        timers[call.id] = requestAnimationFrame(tick);
      } else {
        delete timers[call.id];
        finish(call, willFail, duration, completionTokens);
      }
    }
    timers[call.id] = requestAnimationFrame(tick);
  }

  function finish(call, failed, duration, completionTokens) {
    call.latency = duration;
    call.tokens.completion = completionTokens;
    if (failed) {
      call.state = "error";
      call.result = {
        error: "UpstreamTimeout",
        status: 504,
        message: "Billing gateway did not respond within 1500ms",
        retryable: true,
      };
    } else {
      call.state = "success";
      call.result = resultFor(call);
    }
    setCallState(call, call.state);
    // auto-open the freshly resolved result
    var card = root.querySelector('[data-id="' + call.id + '"]');
    var btn = card && card.querySelector("[data-toggle]");
    if (btn && !btn.disabled) toggleDisclosure(btn);
  }

  function resultFor(call) {
    switch (call.name) {
      case "get_weather":
        return {
          location: call.args.location,
          temp_c: Math.round((24 + Math.random() * 6) * 10) / 10,
          condition: "Partly cloudy",
          humidity: Math.round(Math.random() * 40 + 45) / 100,
          forecast: [
            { day: "Tue", high: 29, low: 21 },
            { day: "Wed", high: 26, low: 20 },
          ],
        };
      case "query_database":
        return {
          rows: 12,
          took_ms: Math.round(call.latency),
          sample: [
            { id: 8021, email: "ada@lovelace.dev" },
            { id: 8044, email: "grace@hopper.dev" },
          ],
        };
      case "web_search":
        return {
          query: call.args.query,
          top_k: call.args.top_k,
          results: [
            { title: "State machines in UI", url: "https://example.dev/fsm-ui" },
            { title: "XState vs hand-rolled", url: "https://example.dev/xstate" },
          ],
        };
      default:
        return { ok: true };
    }
  }

  /* ---------- event delegation ---------- */
  root.addEventListener("click", function (e) {
    var toggle = e.target.closest("[data-toggle]");
    if (toggle && !toggle.disabled) {
      toggleDisclosure(toggle);
      return;
    }

    var copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
      var card = copyBtn.closest(".card");
      var call = findCall(card.getAttribute("data-id"));
      copyText(JSON.stringify(call.result, null, 2)).then(
        function () {
          var span = copyBtn.querySelector("span");
          var prev = span.textContent;
          copyBtn.innerHTML = ICON.check + "<span>Copied</span>";
          toast("Result copied to clipboard");
          setTimeout(function () {
            copyBtn.innerHTML = ICON.copy + "<span>" + prev + "</span>";
          }, 1400);
        },
        function () {
          toast("Copy failed — select the text manually");
        }
      );
      return;
    }

    var action = e.target.closest("[data-action]");
    if (action && !action.disabled) {
      var c = findCall(action.closest(".card").getAttribute("data-id"));
      runCall(c);
    }
  });

  function findCall(id) {
    for (var i = 0; i < CALLS.length; i++) {
      if (CALLS[i].id === id) return CALLS[i];
    }
    return null;
  }

  render();
})();
