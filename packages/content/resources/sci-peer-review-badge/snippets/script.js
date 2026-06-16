(function () {
  "use strict";

  // ---- icon set (inline SVG paths) ----
  var ICONS = {
    check:
      '<svg viewBox="0 0 16 16"><path d="M6.2 11.3 3 8.1l1.1-1.1 2.1 2.1 5.6-5.6L13 4.6z"/></svg>',
    lockOpen:
      '<svg viewBox="0 0 16 16"><path d="M4 7V5a4 4 0 0 1 7.4-2.1l-1.4.8A2.4 2.4 0 0 0 5.6 5v2H12a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm4 2.4a1.1 1.1 0 0 0-.5 2.1v1.1h1v-1.1A1.1 1.1 0 0 0 8 9.4z"/></svg>',
    diamond: '<svg viewBox="0 0 16 16"><path d="M3 6l5-4 5 4-5 8z"/></svg>',
    doc:
      '<svg viewBox="0 0 16 16"><path d="M4 1h5l3 3v11H4zm5 0v3h3z"/></svg>',
    pin:
      '<svg viewBox="0 0 16 16"><path d="M8 1a4 4 0 0 1 4 4c0 3-4 9-4 9S4 8 4 5a4 4 0 0 1 4-4zm0 2.4A1.6 1.6 0 1 0 8 6.6 1.6 1.6 0 0 0 8 3.4z"/></svg>',
    db:
      '<svg viewBox="0 0 16 16"><ellipse cx="8" cy="4" rx="5" ry="2"/><path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4c0 1.1-2.2 2-5 2S3 5.1 3 4z"/></svg>',
    code:
      '<svg viewBox="0 0 16 16"><path d="M5.5 4 2 8l3.5 4 1.1-1L4 8l2.6-3zM10.5 4l-1.1 1L12 8l-2.6 3 1.1 1L14 8z"/></svg>',
    repeat:
      '<svg viewBox="0 0 16 16"><path d="M4 4h6V2l3 3-3 3V6H4v3H2V5a1 1 0 0 1 1-1zm8 8H6v2l-3-3 3-3v2h6V7h2v4a1 1 0 0 1-1 1z"/></svg>'
  };

  // ---- badge catalog ----
  var BADGES = {
    reviewed: {
      cls: "badge-reviewed",
      icon: "check",
      label: "Peer-reviewed",
      group: "review",
      desc: "Manuscript evaluated by independent referees and accepted after revision. Reviewer reports are openly posted."
    },
    gold: {
      cls: "badge-gold",
      icon: "lockOpen",
      label: "Gold OA",
      group: "access",
      access: true,
      desc: "Gold open access: the final published version is free to read, funded by an article-processing charge."
    },
    green: {
      cls: "badge-green",
      icon: "lockOpen",
      label: "Green OA",
      group: "access",
      access: true,
      desc: "Green open access: the author-accepted manuscript is self-archived in an open repository."
    },
    diamond: {
      cls: "badge-diamond",
      icon: "diamond",
      label: "Diamond OA",
      group: "access",
      access: true,
      desc: "Diamond open access: free to read and free to publish — no fees to authors or readers."
    },
    preprint: {
      cls: "badge-preprint",
      icon: "doc",
      label: "Preprint",
      group: "review",
      desc: "A non-peer-reviewed version was posted to a preprint server prior to formal review."
    },
    registered: {
      cls: "badge-registered",
      icon: "pin",
      label: "Registered Report",
      group: "review",
      desc: "Study design and analysis plan were peer-reviewed and accepted in principle before data collection."
    },
    data: {
      cls: "badge-data",
      icon: "db",
      label: "Data available",
      group: "artifact",
      desc: "The underlying datasets are deposited in a public archive with a persistent identifier."
    },
    code: {
      cls: "badge-code",
      icon: "code",
      label: "Code available",
      group: "artifact",
      desc: "Analysis and processing code is published openly under an OSI-approved licence."
    },
    reproduced: {
      cls: "badge-reproduced",
      icon: "repeat",
      label: "Reproduced",
      group: "artifact",
      desc: "An independent group re-ran the workflow and confirmed the reported results."
    }
  };

  var ORDER = [
    "reviewed",
    "diamond",
    "gold",
    "green",
    "preprint",
    "registered",
    "data",
    "code",
    "reproduced"
  ];

  // ---- helpers ----
  function pill(key, opts) {
    opts = opts || {};
    var b = BADGES[key];
    var btn = document.createElement(opts.tag || "span");
    btn.className = "badge-pill " + b.cls;
    btn.setAttribute("role", "listitem");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute("aria-label", b.label + ": " + b.desc);
    if (!opts.noTip) btn.setAttribute("data-tip", b.desc);
    btn.innerHTML = ICONS[b.icon] + "<span>" + b.label + "</span>";
    return btn;
  }

  function pillMarkup(key) {
    var b = BADGES[key];
    return (
      '<span class="badge-pill ' +
      b.cls +
      '" tabindex="0" aria-label="' +
      b.label +
      '" data-tip="' +
      b.desc.replace(/"/g, "&quot;") +
      '">' +
      ICONS[b.icon] +
      "<span>" +
      b.label +
      "</span></span>"
    );
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1900);
  }

  // ---- 1. article meta strip ----
  var articleBadges = [
    "reviewed",
    "diamond",
    "preprint",
    "registered",
    "data",
    "code",
    "reproduced"
  ];
  var metaStrip = document.getElementById("metaStrip");
  articleBadges.forEach(function (k) {
    metaStrip.appendChild(pill(k));
  });

  // ---- 2. legend gallery ----
  var legendGrid = document.getElementById("legendGrid");
  ORDER.forEach(function (k) {
    var b = BADGES[k];
    var card = document.createElement("div");
    card.className = "legend-card";
    card.setAttribute("data-group", b.group);
    var p = pill(k, { noTip: true });
    card.appendChild(p);
    var body = document.createElement("div");
    body.className = "legend-body";
    body.innerHTML =
      "<strong>" + b.label + "</strong><span>" + b.desc + "</span>";
    card.appendChild(body);
    legendGrid.appendChild(card);
  });

  // ---- filter chips ----
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      var f = chip.getAttribute("data-filter");
      legendGrid.querySelectorAll(".legend-card").forEach(function (card) {
        var match = f === "all" || card.getAttribute("data-group") === f;
        card.classList.toggle("is-dim", !match);
      });
    });
  });

  // ---- 3. builder ----
  var controls = document.getElementById("builderControls");
  var previewStrip = document.getElementById("previewStrip");
  var codeOut = document.getElementById("codeOut");

  var state = {
    reviewed: true,
    access: "diamond",
    preprint: false,
    registered: false,
    data: true,
    code: true,
    reproduced: false
  };

  function addGroupLabel(text) {
    var l = document.createElement("span");
    l.className = "toggle-group-label";
    l.textContent = text;
    controls.appendChild(l);
  }

  function checkbox(key) {
    var b = BADGES[key];
    var lab = document.createElement("label");
    lab.className = "toggle" + (state[key] ? " is-on" : "");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!state[key];
    input.addEventListener("change", function () {
      state[key] = input.checked;
      lab.classList.toggle("is-on", input.checked);
      render();
    });
    lab.appendChild(input);
    lab.appendChild(document.createTextNode(b.label));
    controls.appendChild(lab);
  }

  function radio(key) {
    var b = BADGES[key];
    var lab = document.createElement("label");
    lab.className = "toggle" + (state.access === key ? " is-on" : "");
    var input = document.createElement("input");
    input.type = "radio";
    input.name = "access";
    input.value = key;
    input.checked = state.access === key;
    input.addEventListener("change", function () {
      state.access = input.checked ? key : state.access;
      controls
        .querySelectorAll('input[name="access"]')
        .forEach(function (r) {
          r.closest(".toggle").classList.toggle("is-on", r.checked);
        });
      render();
    });
    lab.appendChild(input);
    lab.appendChild(document.createTextNode(b.label));
    controls.appendChild(lab);
  }

  addGroupLabel("Review status");
  checkbox("reviewed");
  checkbox("preprint");
  checkbox("registered");
  addGroupLabel("Open-access tier (pick one)");
  ["diamond", "gold", "green"].forEach(radio);
  addGroupLabel("Artifacts");
  checkbox("data");
  checkbox("code");
  checkbox("reproduced");

  function activeKeys() {
    var keys = [];
    if (state.reviewed) keys.push("reviewed");
    keys.push(state.access);
    if (state.preprint) keys.push("preprint");
    if (state.registered) keys.push("registered");
    if (state.data) keys.push("data");
    if (state.code) keys.push("code");
    if (state.reproduced) keys.push("reproduced");
    // keep canonical order
    return ORDER.filter(function (k) {
      return keys.indexOf(k) !== -1;
    });
  }

  function render() {
    var keys = activeKeys();
    previewStrip.innerHTML = "";
    keys.forEach(function (k) {
      previewStrip.appendChild(pill(k));
    });
    var html =
      '<div class="article-badges">\n  ' +
      keys.map(pillMarkup).join("\n  ") +
      "\n</div>";
    codeOut.textContent = html;
  }
  render();

  // ---- copy HTML ----
  document.getElementById("copyBtn").addEventListener("click", function () {
    var text = codeOut.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          toast("Meta-strip HTML copied to clipboard");
        },
        function () {
          fallbackCopy(text);
        }
      );
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast("Meta-strip HTML copied to clipboard");
    } catch (e) {
      toast("Copy failed — select the code manually");
    }
    document.body.removeChild(ta);
  }

  // ---- 4. figure bar chart (fictional data) ----
  var FIG = [
    { label: "Peer-reviewed", val: 100, cls: "badge-reviewed" },
    { label: "Diamond OA", val: 64, cls: "badge-diamond" },
    { label: "Green OA", val: 71, cls: "badge-green" },
    { label: "Data", val: 58, cls: "badge-data" },
    { label: "Code", val: 49, cls: "badge-code" },
    { label: "Reproduced", val: 17, cls: "badge-reproduced" }
  ];
  var figBars = document.getElementById("figBars");
  FIG.forEach(function (d) {
    var col = document.createElement("div");
    col.className = "fig-bar";
    var bar = document.createElement("div");
    bar.className = "bar " + d.cls;
    var lab = document.createElement("div");
    lab.className = "bar-label";
    lab.textContent = d.label;
    bar.setAttribute("data-val", d.val + "%");
    bar.style.height = "0%";
    col.appendChild(bar);
    col.appendChild(lab);
    figBars.appendChild(col);
    // reuse each badge's accent colour for its bar via a hidden probe
    var probe = document.createElement("span");
    probe.className = "badge-pill " + d.cls;
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);
    bar.style.background = getComputedStyle(probe).color;
    document.body.removeChild(probe);
  });

  // animate bars when scrolled into view
  function animateFig() {
    figBars.querySelectorAll(".bar").forEach(function (bar, i) {
      var v = FIG[i].val;
      setTimeout(function () {
        bar.style.height = v + "%";
      }, 80 * i);
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateFig();
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(figBars);
  } else {
    animateFig();
  }
})();
