(function () {
  "use strict";

  var input = document.getElementById("caption-input");
  var charCount = document.getElementById("char-count");
  var live = document.getElementById("live-caption");
  var liveText = document.getElementById("live-caption-text");
  var styleBtns = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));
  var cornerBtns = Array.prototype.slice.call(document.querySelectorAll(".corner-btn"));
  var presetBtn = document.getElementById("preset-btn");
  var copyBtn = document.getElementById("copy-btn");
  var toastEl = document.getElementById("toast");

  var STYLE_CLASSES = {
    yellow: "cap-yellow",
    location: "cap-location",
    narration: "cap-narration",
    chapter: "cap-chapter"
  };
  var CORNER_CLASSES = {
    "top-left": "cap-top-left",
    "top-right": "cap-top-right",
    "bottom-left": "cap-bottom-left",
    "bottom-right": "cap-bottom-right"
  };

  var state = {
    style: "yellow",
    corner: "top-left",
    text: input.value
  };

  // Fictional, style-matched preset captions.
  var PRESETS = [
    { style: "yellow", corner: "top-left", text: "MEANWHILE, ON THE NEON RONIN ROOFTOP…" },
    { style: "location", corner: "top-right", text: "SECTOR 9 — 03:14 A.M." },
    { style: "narration", corner: "bottom-left", text: "I never asked to carry the blade. It chose me." },
    { style: "chapter", corner: "top-left", text: "RAIN CIRCUIT" },
    { style: "location", corner: "bottom-right", text: "IRON VANGUARD H.Q. — PRESENT DAY" },
    { style: "narration", corner: "bottom-right", text: "The rain hadn't stopped in forty-one days." },
    { style: "yellow", corner: "bottom-left", text: "LATER, BENEATH THE COPPER SPIRE…" }
  ];
  var presetIndex = 0;

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1900);
  }

  function render() {
    // Reset to base class, then re-apply current style + corner.
    live.className = "caption " + STYLE_CLASSES[state.style] + " " + CORNER_CLASSES[state.corner];
    live.setAttribute("data-style", state.style);
    live.setAttribute("data-corner", state.corner);

    var text = state.text.trim() || "Your caption…";

    if (state.style === "chapter") {
      liveText.innerHTML =
        '<small>Chapter Seven</small>' + escapeHtml(text);
    } else {
      liveText.textContent = text;
    }

    charCount.textContent = String(state.text.length);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function setActive(buttons, attr, value) {
    buttons.forEach(function (b) {
      var on = b.getAttribute(attr) === value;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  // --- Text input ---
  input.addEventListener("input", function () {
    state.text = input.value;
    render();
  });

  // --- Style picker ---
  styleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.style = btn.getAttribute("data-style");
      setActive(styleBtns, "data-style", state.style);
      render();
    });
  });

  // --- Corner picker ---
  cornerBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.corner = btn.getAttribute("data-corner");
      setActive(cornerBtns, "data-corner", state.corner);
      render();
    });
  });

  // Keyboard arrow navigation within each radiogroup.
  function wireArrows(buttons, key) {
    buttons.forEach(function (btn, i) {
      btn.addEventListener("keydown", function (e) {
        var next = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % buttons.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + buttons.length) % buttons.length;
        if (next === -1) return;
        e.preventDefault();
        var target = buttons[next];
        state[key] = target.getAttribute(key === "style" ? "data-style" : "data-corner");
        setActive(buttons, key === "style" ? "data-style" : "data-corner", state[key]);
        render();
        target.focus();
      });
    });
  }
  wireArrows(styleBtns, "style");
  wireArrows(cornerBtns, "corner");

  // --- Surprise me preset ---
  presetBtn.addEventListener("click", function () {
    var p = PRESETS[presetIndex % PRESETS.length];
    presetIndex++;
    state.style = p.style;
    state.corner = p.corner;
    state.text = p.text;
    input.value = p.text;
    setActive(styleBtns, "data-style", state.style);
    setActive(cornerBtns, "data-corner", state.corner);
    render();
    toast("Lettered a fresh caption ✍");
  });

  // --- Copy HTML ---
  function buildHtml() {
    var cls = "caption " + STYLE_CLASSES[state.style] + " " + CORNER_CLASSES[state.corner];
    var text = state.text.trim() || "Your caption…";
    if (state.style === "chapter") {
      return (
        '<div class="' + cls + '">\n' +
        '  <span class="caption-text"><small>Chapter Seven</small>' + escapeHtml(text) + "</span>\n" +
        "</div>"
      );
    }
    return (
      '<div class="' + cls + '">\n' +
      '  <span class="caption-text">' + escapeHtml(text) + "</span>\n" +
      "</div>"
    );
  }

  copyBtn.addEventListener("click", function () {
    var html = buildHtml();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(html).then(
        function () {
          toast("Caption HTML copied ✓");
        },
        function () {
          fallbackCopy(html);
        }
      );
    } else {
      fallbackCopy(html);
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
      toast("Caption HTML copied ✓");
    } catch (err) {
      toast("Copy failed — select manually");
    }
    document.body.removeChild(ta);
  }

  render();
})();
