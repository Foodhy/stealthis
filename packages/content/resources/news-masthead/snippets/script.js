/* =========================================================
   News — Masthead / Nameplate Variants
   Vanilla JS: variant switching, live name editing, gallery
   ========================================================= */
(function () {
  "use strict";

  /* ---- Variant catalogue ---------------------------------------------- */
  var VARIANTS = [
    {
      id: "broadsheet",
      label: "Broadsheet",
      desc: "Centered · Latin motto",
      note: "Classic centered nameplate flanked by a Latin motto and an Est. line.",
    },
    {
      id: "modern",
      label: "Modern",
      desc: "Left-aligned · red rule",
      note: "Lean, left-aligned wordmark with a single red hairline.",
    },
    {
      id: "tabloid",
      label: "Tabloid",
      desc: "Condensed · all caps",
      note: "Loud condensed caps over a red edition banner.",
    },
    {
      id: "gothic",
      label: "Gothic",
      desc: "Heavy · ornamented",
      note: "Heavy serif with small-caps strips and leaf ornaments.",
    },
    {
      id: "magazine",
      label: "Magazine",
      desc: "Minimal · tracked",
      note: "Airy, widely-tracked minimal wordmark.",
    },
  ];

  /* ---- Element refs ---------------------------------------------------- */
  var sheet = document.getElementById("sheet");
  var nameEl = document.getElementById("masthead-name");
  var dateEl = document.getElementById("masthead-date");
  var input = document.getElementById("paper-name");
  var segButtons = Array.prototype.slice.call(
    document.querySelectorAll(".seg__btn")
  );
  var grid = document.getElementById("gallery-grid");
  var toastEl = document.getElementById("toast");

  var current = "broadsheet";
  var DEFAULT_NAME = (input && input.value) || "The Meridian Courier";

  /* ---- Toast helper ---------------------------------------------------- */
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---- Live dateline --------------------------------------------------- */
  function setDate() {
    if (!dateEl) return;
    var d = new Date();
    var opts = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    try {
      dateEl.textContent = d.toLocaleDateString("en-US", opts);
    } catch (e) {
      /* leave the server-rendered fallback */
    }
  }

  /* ---- Apply a variant to the live preview ----------------------------- */
  function applyVariant(id, announce) {
    var meta = null;
    for (var i = 0; i < VARIANTS.length; i++) {
      if (VARIANTS[i].id === id) {
        meta = VARIANTS[i];
        break;
      }
    }
    if (!meta) return;
    current = id;

    if (sheet) sheet.setAttribute("data-variant", id);

    segButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-variant") === id;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (grid) {
      Array.prototype.forEach.call(grid.children, function (card) {
        card.classList.toggle(
          "is-active",
          card.getAttribute("data-variant") === id
        );
      });
    }

    if (announce) toast("Applied the " + meta.label + " nameplate.");
  }

  /* ---- Live name editing ----------------------------------------------- */
  function syncName(raw) {
    var name = (raw == null ? "" : raw).replace(/\s+/g, " ").trim();
    var display = name || DEFAULT_NAME;
    if (nameEl) nameEl.textContent = display;
    // Update every gallery plate preview
    if (grid) {
      Array.prototype.forEach.call(
        grid.querySelectorAll(".plate__name"),
        function (el) {
          el.textContent = display;
        }
      );
    }
  }

  /* ---- Build the gallery of nameplates ---------------------------------- */
  function buildGallery() {
    if (!grid) return;
    grid.innerHTML = "";
    var name = (input && input.value.trim()) || DEFAULT_NAME;

    VARIANTS.forEach(function (v) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "plate plate--" + v.id;
      card.setAttribute("data-variant", v.id);
      card.setAttribute(
        "aria-label",
        "Apply the " + v.label + " nameplate to the live edition"
      );

      var preview = document.createElement("div");
      preview.className = "plate__preview";

      var pname = document.createElement("div");
      pname.className = "plate__name";
      pname.textContent = name;

      var rule = document.createElement("div");
      rule.className = "plate__rule";

      preview.appendChild(pname);
      preview.appendChild(rule);

      var metaRow = document.createElement("div");
      metaRow.className = "plate__meta";

      var label = document.createElement("span");
      label.className = "plate__label";
      label.textContent = v.label;

      var badge = document.createElement("span");
      badge.className = "plate__badge";
      badge.textContent = "Live";
      label.appendChild(document.createTextNode(" "));
      label.appendChild(badge);

      var desc = document.createElement("span");
      desc.className = "plate__desc";
      desc.textContent = v.desc;

      metaRow.appendChild(label);
      metaRow.appendChild(desc);

      card.appendChild(preview);
      card.appendChild(metaRow);

      card.addEventListener("click", function () {
        applyVariant(v.id, true);
        if (sheet && sheet.scrollIntoView) {
          sheet.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      grid.appendChild(card);
    });
  }

  /* ---- Wire controls --------------------------------------------------- */
  segButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyVariant(btn.getAttribute("data-variant"), true);
    });
  });

  if (input) {
    input.addEventListener("input", function () {
      syncName(input.value);
    });
    input.addEventListener("blur", function () {
      var trimmed = input.value.replace(/\s+/g, " ").trim();
      if (!trimmed) {
        input.value = DEFAULT_NAME;
        syncName(DEFAULT_NAME);
        toast("Restored the default nameplate.");
      }
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        input.blur();
        toast("Nameplate set.");
      }
    });
  }

  /* ---- Init ------------------------------------------------------------ */
  setDate();
  buildGallery();
  applyVariant(current, false);
  syncName(input ? input.value : DEFAULT_NAME);
})();
