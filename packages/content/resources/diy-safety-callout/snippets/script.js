/* DIY Safety Callout System — interactions
   Expanders, dismissible (localStorage), and the live callout builder. */

(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- read-more expanders ---------- */
  document.querySelectorAll(".expander-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.closest(".callout-expander");
      var open = wrap.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- dismissible callout (localStorage remember) ---------- */
  var dismissible = document.getElementById("dismissible-callout");
  var dismissedNote = document.getElementById("dismissed-note");
  var restoreBtn = document.getElementById("restore-dismissed");

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) {
      /* private mode — degrade to session-only behavior */
    }
  }

  if (dismissible && dismissedNote) {
    var key = "callout-dismissed:" + dismissible.dataset.dismissKey;

    if (storageGet(key) === "1") {
      dismissible.hidden = true;
      dismissedNote.hidden = false;
    }

    var dismissBtn = dismissible.querySelector(".dismiss-btn");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", function () {
        dismissible.classList.add("is-dismissing");
        setTimeout(function () {
          dismissible.hidden = true;
          dismissible.classList.remove("is-dismissing");
          dismissedNote.hidden = false;
          storageSet(key, "1");
          toast("Warning dismissed — remembered on this device");
        }, 250);
      });
    }

    if (restoreBtn) {
      restoreBtn.addEventListener("click", function () {
        storageSet(key, null);
        dismissedNote.hidden = true;
        dismissible.hidden = false;
        toast("Warning restored");
      });
    }
  }

  /* ---------- live builder ---------- */
  var LEVELS = {
    danger: {
      label: "Danger",
      role: ' role="alert"',
      glyph:
        '<svg viewBox="0 0 24 24" class="glyph"><path d="M13 2 4 14h6l-1.5 8L19 9h-6l1.5-7z" fill="currentColor"/></svg>'
    },
    warning: {
      label: "Warning",
      role: ' role="alert"',
      glyph:
        '<svg viewBox="0 0 24 24" class="glyph"><path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.3.9 2.2 1.9 2.4-.5-1.4.4-2.3 1.2-3.1 1.9 1.5 3.4 3.7 3.4 6.2A5.9 5.9 0 0 1 11 21a5.9 5.9 0 0 1-6-6c0-4.6 4.3-6.5 7-13z" fill="currentColor"/></svg>'
    },
    tip: {
      label: "Pro Tip",
      role: "",
      glyph:
        '<svg viewBox="0 0 24 24" class="glyph"><path d="M12 2a7 7 0 0 0-4 12.8c.7.5 1 1.3 1 2.2h6c0-.9.3-1.7 1-2.2A7 7 0 0 0 12 2zM9.5 19h5v1a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 9.5 20v-1z" fill="currentColor"/></svg>'
    },
    note: {
      label: "Note",
      role: "",
      glyph:
        '<svg viewBox="0 0 24 24" class="glyph"><path d="M12 2a4 4 0 0 0-4 4c0 2.9 2.4 4.9 3.3 8.1.1.5.3.9.7.9s.6-.4.7-.9C13.6 10.9 16 8.9 16 6a4 4 0 0 0-4-4zm0 2.5A1.5 1.5 0 1 1 12 7.5 1.5 1.5 0 0 1 12 4.5zM11 17h2v5h-2z" fill="currentColor"/></svg>'
    }
  };

  var form = document.getElementById("builder-form");
  var titleInput = document.getElementById("builder-title");
  var textInput = document.getElementById("builder-text");
  var preview = document.getElementById("builder-preview");
  var codeOut = document.getElementById("builder-code");
  var copyBtn = document.getElementById("copy-html");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function currentLevel() {
    var checked = form && form.querySelector('input[name="level"]:checked');
    return (checked && checked.value) || "danger";
  }

  function buildMarkup(level, title, text, indent) {
    var cfg = LEVELS[level];
    var pad = indent ? "  " : "";
    var lines = [
      '<div class="callout callout--' + level + '"' + cfg.role + ">",
      pad + '  <div class="callout-plate" aria-hidden="true">',
      pad + "    " + cfg.glyph,
      pad + "  </div>",
      pad + '  <div class="callout-body">',
      pad + '    <span class="callout-label">' + cfg.label + "</span>",
      pad + '    <h3 class="callout-title">' + escapeHtml(title) + "</h3>",
      pad + '    <p class="callout-text">' + escapeHtml(text) + "</p>",
      pad + "  </div>",
      pad + "</div>"
    ];
    return lines.join("\n");
  }

  function render() {
    if (!form || !preview || !codeOut) return;
    var level = currentLevel();
    var title = titleInput.value.trim() || "Untitled callout";
    var text = textInput.value.trim() || "Describe the hazard or advice here.";

    preview.innerHTML = buildMarkup(level, title, text, false);
    codeOut.value = buildMarkup(level, title, text, false);
  }

  if (form) {
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
    render();
  }

  if (copyBtn && codeOut) {
    copyBtn.addEventListener("click", function () {
      var html = codeOut.value;

      function done() {
        toast("Callout HTML copied to clipboard");
      }

      function fallback() {
        codeOut.focus();
        codeOut.select();
        try {
          document.execCommand("copy");
          done();
        } catch (e) {
          toast("Copy failed — select the code manually");
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(html).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  /* ---------- PPE chip playful ack ---------- */
  document.querySelectorAll(".ppe-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      toast(chip.textContent.trim() + " — checked");
    });
  });
})();
