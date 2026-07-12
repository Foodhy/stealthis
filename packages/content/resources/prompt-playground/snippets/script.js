(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Model catalog — pricing is USD per 1M input tokens (illustrative). *
   * ------------------------------------------------------------------ */
  var MODELS = [
    { id: "aurora-mini", name: "Aurora Mini", ctx: 32000, inPrice: 0.15, speed: 22 },
    { id: "aurora-pro", name: "Aurora Pro", ctx: 128000, inPrice: 3.0, speed: 14 },
    { id: "aurora-max", name: "Aurora Max (1M)", ctx: 1000000, inPrice: 12.0, speed: 9 },
    { id: "nimbus-flash", name: "Nimbus Flash", ctx: 64000, inPrice: 0.35, speed: 30 }
  ];

  var usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5
  });
  var intFmt = new Intl.NumberFormat("en-US");

  /* --------------------------- DOM refs --------------------------- */
  var $ = function (id) { return document.getElementById(id); };
  var systemPrompt = $("systemPrompt");
  var userPrompt = $("userPrompt");
  var compiledPreview = $("compiledPreview");
  var unresolvedBadge = $("unresolvedBadge");
  var modelSelect = $("modelSelect");
  var modelPrice = $("modelPrice");
  var temperature = $("temperature");
  var temperatureVal = $("temperatureVal");
  var topP = $("topP");
  var topPVal = $("topPVal");
  var maxTokens = $("maxTokens");
  var maxTokensVal = $("maxTokensVal");
  var varsList = $("varsList");
  var addVarBtn = $("addVarBtn");
  var charCount = $("charCount");
  var tokCount = $("tokCount");
  var ctxFill = $("ctxFill");
  var ctxLabel = $("ctxLabel");
  var costOut = $("costOut");
  var runBtn = $("runBtn");
  var clearBtn = $("clearBtn");
  var output = $("output");
  var outputEmpty = $("outputEmpty");
  var statusPill = $("statusPill");
  var latencyEl = $("latency");
  var meterBar = ctxFill.parentElement;

  /* ---------------------- Variables state ----------------------- */
  var variables = [
    { key: "persona", val: "Nova" },
    { key: "product", val: "Halo Notes" },
    { key: "audience", val: "power users" },
    { key: "length", val: "short" }
  ];

  /* ---------------------- Populate models ----------------------- */
  MODELS.forEach(function (m) {
    var opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name;
    modelSelect.appendChild(opt);
  });
  modelSelect.value = "aurora-pro";

  function currentModel() {
    return MODELS.filter(function (m) { return m.id === modelSelect.value; })[0] || MODELS[0];
  }

  /* --------------------- Token estimation ----------------------- */
  // Rough heuristic: ~1 token per 4 chars, nudged by whitespace-delimited words.
  function estimateTokens(text) {
    if (!text) return 0;
    var chars = text.length;
    var words = (text.trim().match(/\S+/g) || []).length;
    return Math.max(Math.ceil(chars / 4), Math.ceil(words * 1.3));
  }

  /* ------------------- Template interpolation ------------------- */
  var VAR_RE = /\{\{\s*([\w.-]+)\s*\}\}/g;

  function varMap() {
    var map = {};
    variables.forEach(function (v) {
      if (v.key.trim()) map[v.key.trim()] = v.val;
    });
    return map;
  }

  function resolve(text) {
    var map = varMap();
    var unresolved = [];
    var out = text.replace(VAR_RE, function (_, key) {
      if (Object.prototype.hasOwnProperty.call(map, key) && map[key] !== "") {
        return map[key];
      }
      unresolved.push(key);
      return "{{" + key + "}}";
    });
    return { text: out, unresolved: unresolved };
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Highlight resolved (accent) and unresolved (warn) template tokens.
  function highlightCompiled(system, user) {
    var map = varMap();
    function mark(text) {
      return escapeHtml(text).replace(VAR_RE, function (m, key) {
        var known = Object.prototype.hasOwnProperty.call(map, key) && map[key] !== "";
        var cls = known ? "tok" : "tok tok--unresolved";
        return '<span class="' + cls + '">' + escapeHtml(known ? map[key] : m) + "</span>";
      });
    }
    return (
      '<span style="color:var(--muted)">system:</span> ' + mark(system) +
      '\n\n<span style="color:var(--muted)">user:</span> ' + mark(user)
    );
  }

  /* ----------------------- Recompute -------------------------- */
  function refresh() {
    var sysTok = estimateTokens(systemPrompt.value);
    var userTok = estimateTokens(userPrompt.value);

    // per-editor counts
    document.querySelector('[data-count-for="systemPrompt"]').textContent = sysTok + " tok";
    document.querySelector('[data-count-for="userPrompt"]').textContent = userTok + " tok";

    var totalChars = systemPrompt.value.length + userPrompt.value.length;
    var totalTok = sysTok + userTok;

    charCount.textContent = intFmt.format(totalChars);
    tokCount.textContent = intFmt.format(totalTok);

    var model = currentModel();

    // context bar
    var pct = Math.min(100, (totalTok / model.ctx) * 100);
    ctxFill.style.width = pct.toFixed(1) + "%";
    ctxFill.setAttribute("data-warn", pct > 85 ? "true" : "false");
    meterBar.setAttribute("aria-valuenow", Math.round(pct));
    ctxLabel.textContent =
      intFmt.format(totalTok) + " / " + intFmt.format(model.ctx) + " tokens of context";

    // cost = input tokens * price-per-million
    var cost = (totalTok / 1e6) * model.inPrice;
    costOut.textContent = usd.format(cost);
    modelPrice.textContent =
      "$" + model.inPrice.toFixed(2) + " / 1M input tokens · " +
      intFmt.format(model.ctx) + " ctx";

    // compiled preview
    compiledPreview.innerHTML = highlightCompiled(systemPrompt.value, userPrompt.value);
    var res = resolve(systemPrompt.value + " " + userPrompt.value);
    var uniqueUnres = res.unresolved.filter(function (v, i, a) { return a.indexOf(v) === i; });
    if (uniqueUnres.length) {
      unresolvedBadge.hidden = false;
      unresolvedBadge.textContent = uniqueUnres.length + " unresolved";
    } else {
      unresolvedBadge.hidden = true;
    }
  }

  /* ----------------------- Variables UI ----------------------- */
  function renderVars() {
    varsList.innerHTML = "";
    if (!variables.length) {
      var empty = document.createElement("p");
      empty.className = "vars__empty";
      empty.textContent = "No variables. Add one to use in {{template}} tokens.";
      varsList.appendChild(empty);
      return;
    }
    variables.forEach(function (v, idx) {
      var row = document.createElement("div");
      row.className = "var";

      var key = document.createElement("input");
      key.className = "var__key";
      key.value = v.key;
      key.setAttribute("aria-label", "Variable name " + (idx + 1));
      key.placeholder = "name";
      key.addEventListener("input", function () {
        variables[idx].key = key.value.replace(/\s+/g, "");
        key.value = variables[idx].key;
        refresh();
      });

      var val = document.createElement("input");
      val.className = "var__val";
      val.value = v.val;
      val.setAttribute("aria-label", "Value for " + (v.key || "variable " + (idx + 1)));
      val.placeholder = "value";
      val.addEventListener("input", function () {
        variables[idx].val = val.value;
        refresh();
      });

      var del = document.createElement("button");
      del.className = "var__del";
      del.type = "button";
      del.innerHTML = "&times;";
      del.setAttribute("aria-label", "Remove variable " + (v.key || idx + 1));
      del.addEventListener("click", function () {
        variables.splice(idx, 1);
        renderVars();
        refresh();
      });

      row.appendChild(key);
      row.appendChild(val);
      row.appendChild(del);
      varsList.appendChild(row);
    });
  }

  addVarBtn.addEventListener("click", function () {
    variables.push({ key: "", val: "" });
    renderVars();
    var inputs = varsList.querySelectorAll(".var__key");
    if (inputs.length) inputs[inputs.length - 1].focus();
    refresh();
  });

  /* ----------------------- Streaming run ---------------------- */
  var rafId = null;
  var running = false;

  function buildCompletion() {
    var model = currentModel();
    var map = varMap();
    var product = map.product || "the product";
    var audience = map.audience || "your users";
    var persona = map.persona || "the assistant";
    var temp = parseFloat(temperature.value);
    var flavor = temp > 1.1
      ? "an exploratory, high-variance take"
      : temp < 0.4
        ? "a tight, deterministic take"
        : "a balanced take";

    return (
      "## " + product + " — now with Dark Mode\n\n" +
      "Hey " + audience + ", " + persona + " here. We just shipped a system-aware " +
      "Dark Mode across " + product + ". It follows your OS theme by default and " +
      "remembers per-workspace overrides.\n\n" +
      "Highlights:\n" +
      "• Automatic light/dark switching with a manual toggle\n" +
      "• Recalibrated contrast for AA-compliant readability\n" +
      "• Zero layout shift — themes swap via CSS variables\n\n" +
      "[simulated by " + model.name + " · temp " + temp.toFixed(2) +
      " · top-p " + parseFloat(topP.value).toFixed(2) + " · " + flavor + "]"
    );
  }

  function tokenize(text) {
    // split into word-ish chunks so streaming feels like tokens
    return text.match(/\s+|\S+/g) || [];
  }

  function setStatus(state, label) {
    statusPill.setAttribute("data-state", state);
    statusPill.textContent = label;
  }

  function stopStream() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    runBtn.setAttribute("data-running", "false");
    runBtn.querySelector(".btn__txt").textContent = "Run";
    runBtn.querySelector(".btn__ico").innerHTML = "&#9654;";
  }

  function runStream() {
    if (running) { // acts as a Stop button
      stopStream();
      setStatus("idle", "Stopped");
      var caretEl = output.querySelector(".caret");
      if (caretEl) caretEl.remove();
      return;
    }

    // Respect the max-tokens ceiling by truncating the simulated stream.
    var cap = parseInt(maxTokens.value, 10);
    var chunks = tokenize(buildCompletion()).slice(0, cap);
    var model = currentModel();

    running = true;
    outputEmpty.hidden = true;
    output.innerHTML = '<div class="output__body"></div>';
    var body = output.querySelector(".output__body");
    var caret = document.createElement("span");
    caret.className = "caret";
    body.appendChild(caret);

    runBtn.setAttribute("data-running", "true");
    runBtn.querySelector(".btn__txt").textContent = "Stop";
    runBtn.querySelector(".btn__ico").innerHTML = "&#9632;";
    latencyEl.hidden = false;
    setStatus("running", "Streaming");

    var i = 0;
    var start = performance.now();
    var lastEmit = start;
    // Frame-aligned streaming: emit a chunk once enough time has elapsed,
    // pacing derived from the model's simulated tokens/sec speed.
    var interval = 1000 / model.speed;

    function frame(now) {
      if (!running) return;
      if (now - lastEmit >= interval) {
        var text = document.createTextNode(chunks[i]);
        body.insertBefore(text, caret);
        i++;
        lastEmit = now;
        output.scrollTop = output.scrollHeight;
        latencyEl.textContent =
          ((now - start) / 1000).toFixed(1) + "s · " + i + " tok";
      }
      if (i < chunks.length) {
        rafId = requestAnimationFrame(frame);
      } else {
        finishStream(start, i);
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  function finishStream(start, emitted) {
    running = false;
    rafId = null;
    var caretEl = output.querySelector(".caret");
    if (caretEl) caretEl.remove();
    runBtn.setAttribute("data-running", "false");
    runBtn.querySelector(".btn__txt").textContent = "Run";
    runBtn.querySelector(".btn__ico").innerHTML = "&#9654;";
    var secs = (performance.now() - start) / 1000;
    latencyEl.textContent = secs.toFixed(1) + "s · " + emitted + " tok";
    setStatus("done", "Done");
  }

  runBtn.addEventListener("click", runStream);

  clearBtn.addEventListener("click", function () {
    stopStream();
    output.innerHTML = "";
    output.appendChild(outputEmpty);
    outputEmpty.hidden = false;
    latencyEl.hidden = true;
    setStatus("idle", "Idle");
  });

  /* ----------------------- Wire inputs ------------------------ */
  systemPrompt.addEventListener("input", refresh);
  userPrompt.addEventListener("input", refresh);
  modelSelect.addEventListener("change", refresh);

  temperature.addEventListener("input", function () {
    temperatureVal.textContent = parseFloat(temperature.value).toFixed(2);
  });
  topP.addEventListener("input", function () {
    topPVal.textContent = parseFloat(topP.value).toFixed(2);
  });
  maxTokens.addEventListener("input", function () {
    maxTokensVal.textContent = maxTokens.value;
  });

  // Keyboard shortcut: Cmd/Ctrl+Enter to run.
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runStream();
    }
  });

  /* --------------------------- Init --------------------------- */
  temperatureVal.textContent = parseFloat(temperature.value).toFixed(2);
  topPVal.textContent = parseFloat(topP.value).toFixed(2);
  maxTokensVal.textContent = maxTokens.value;
  renderVars();
  refresh();
})();
