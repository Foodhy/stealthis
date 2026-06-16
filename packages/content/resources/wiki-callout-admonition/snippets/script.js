(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
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
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /* ---------- sidebar drawer ---------- */
  var sidebar = document.getElementById("sidebar");
  var navToggle = document.getElementById("navToggle");
  var scrim = document.getElementById("scrim");

  function setNav(open) {
    if (!sidebar) return;
    sidebar.classList.toggle("is-open", open);
    if (navToggle) navToggle.setAttribute("aria-expanded", String(open));
    if (scrim) scrim.hidden = !open;
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!sidebar.classList.contains("is-open"));
    });
  }
  if (scrim) scrim.addEventListener("click", function () { setNav(false); });
  if (sidebar) {
    sidebar.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.matchMedia("(max-width: 820px)").matches) {
        setNav(false);
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* ---------- search focus shortcut ---------- */
  var searchInput = document.querySelector(".topbar-search input");
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "/" &&
      searchInput &&
      document.activeElement !== searchInput &&
      !/^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName || "")
    ) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  /* ---------- collapsible callouts ---------- */
  document.querySelectorAll("[data-fold]").forEach(function (fold) {
    var head = fold.querySelector(".callout-foldhead");
    var body = fold.querySelector(".callout-foldbody");
    if (!head || !body) return;
    head.addEventListener("click", function () {
      var open = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", String(!open));
      body.hidden = open;
    });
  });

  /* ---------- copy buttons on code callouts ---------- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      copyText(text).then(
        function () {
          var label = btn.querySelector("span");
          var prev = label ? label.textContent : "";
          if (label) label.textContent = "Copied";
          btn.classList.add("is-done");
          toast("Snippet copied to clipboard");
          setTimeout(function () {
            if (label) label.textContent = prev;
            btn.classList.remove("is-done");
          }, 1600);
        },
        function () {
          toast("Copy failed — select manually");
        }
      );
    });
  });

  /* ---------- live builder ---------- */
  var ICONS = {
    note: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    tip: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.3 1 2.5h6c0-1.2.2-1.7 1-2.5A6 6 0 0 0 12 3Z"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
    warn: '<svg viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/></svg>',
    danger: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
  };
  var ROLE = { danger: "alert", warn: "note", note: "note", tip: "note", info: "note" };

  var typePicker = document.getElementById("typePicker");
  var titleInput = document.getElementById("titleInput");
  var bodyInput = document.getElementById("bodyInput");
  var charCount = document.getElementById("charCount");
  var mount = document.getElementById("previewMount");
  var resetBtn = document.getElementById("resetBtn");
  var copyMarkup = document.getElementById("copyMarkup");

  var DEFAULTS = { type: "note", title: "Heads up", body: bodyInput ? bodyInput.value : "" };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function currentType() {
    var checked = typePicker ? typePicker.querySelector('input[name="ctype"]:checked') : null;
    return checked ? checked.value : "note";
  }

  function buildMarkup(type, title, body) {
    var role = ROLE[type] || "note";
    var safeTitle = escapeHtml(title || (type.charAt(0).toUpperCase() + type.slice(1)));
    var safeBody = escapeHtml(body || "Add your callout text here.");
    return (
      '<aside class="callout callout--' + type + '" role="' + role + '">\n' +
      '  <div class="callout-icon" aria-hidden="true">' + ICONS[type] + "</div>\n" +
      '  <div class="callout-body">\n' +
      '    <p class="callout-title">' + safeTitle + "</p>\n" +
      "    <p>" + safeBody + "</p>\n" +
      "  </div>\n" +
      "</aside>"
    );
  }

  function render() {
    if (!mount) return;
    var type = currentType();
    var title = titleInput ? titleInput.value : "";
    var body = bodyInput ? bodyInput.value : "";
    mount.innerHTML = buildMarkup(type, title, body);
    if (charCount && bodyInput) charCount.textContent = String(bodyInput.value.length);
  }

  if (typePicker) typePicker.addEventListener("change", render);
  if (titleInput) titleInput.addEventListener("input", render);
  if (bodyInput) bodyInput.addEventListener("input", render);

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      var note = typePicker ? typePicker.querySelector('input[value="' + DEFAULTS.type + '"]') : null;
      if (note) note.checked = true;
      if (titleInput) titleInput.value = DEFAULTS.title;
      if (bodyInput) bodyInput.value = DEFAULTS.body;
      render();
      toast("Builder reset");
    });
  }

  if (copyMarkup) {
    copyMarkup.addEventListener("click", function () {
      var markup = buildMarkup(
        currentType(),
        titleInput ? titleInput.value : "",
        bodyInput ? bodyInput.value : ""
      );
      copyText(markup).then(
        function () { toast("Callout markup copied"); },
        function () { toast("Copy failed — select manually"); }
      );
    });
  }

  render();
})();
