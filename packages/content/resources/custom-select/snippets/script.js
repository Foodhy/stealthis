(function () {
  "use strict";

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function closeAll(except) {
    document.querySelectorAll(".cs-wrap.open").forEach(function (w) {
      if (w !== except) closeWrap(w);
    });
  }

  function closeWrap(wrap) {
    wrap.classList.remove("open");
    const trigger = wrap.querySelector(".cs-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function openWrap(wrap) {
    closeAll(wrap);
    wrap.classList.add("open");
    const trigger = wrap.querySelector(".cs-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }

  // ── Single / Grouped select ──────────────────────────────────────────────────

  function initSingle(wrap) {
    const trigger = wrap.querySelector(".cs-trigger");
    const valueEl = wrap.querySelector(".cs-value");
    const search = wrap.querySelector(".cs-search");
    const list = wrap.querySelector(".cs-list");
    const empty = wrap.querySelector(".cs-empty");
    const placeholder = wrap.dataset.placeholder || "Select…";

    valueEl.dataset.placeholder = placeholder;

    function toggle() {
      if (wrap.classList.contains("open")) {
        closeWrap(wrap);
      } else {
        openWrap(wrap);
        if (search) {
          search.value = "";
          filterOptions();
          search.focus();
        }
      }
    }

    function filterOptions() {
      const q = search ? search.value.toLowerCase() : "";
      let visible = 0;
      wrap.querySelectorAll(".cs-option").forEach(function (opt) {
        const match = opt.textContent.toLowerCase().includes(q);
        opt.hidden = !match;
        if (match) visible++;
      });
      if (empty) empty.hidden = visible > 0;
    }

    function selectOption(opt) {
      wrap.querySelectorAll(".cs-option").forEach(function (o) {
        o.classList.remove("selected");
      });
      opt.classList.add("selected");
      valueEl.textContent = opt.textContent.trim();
      closeWrap(wrap);
    }

    function moveFocus(dir) {
      const opts = Array.from(wrap.querySelectorAll(".cs-option:not([hidden])"));
      const focused = wrap.querySelector(".cs-option.focused");
      const idx = focused ? opts.indexOf(focused) : -1;
      const next = opts[Math.max(0, Math.min(opts.length - 1, idx + dir))];
      if (focused) focused.classList.remove("focused");
      if (next) {
        next.classList.add("focused");
        next.scrollIntoView({ block: "nearest" });
      }
    }

    trigger.addEventListener("click", toggle);
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") closeWrap(wrap);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!wrap.classList.contains("open")) openWrap(wrap);
        moveFocus(1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveFocus(-1);
      }
    });

    if (search) {
      search.addEventListener("input", filterOptions);
      search.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          moveFocus(1);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          moveFocus(-1);
        }
        if (e.key === "Escape") closeWrap(wrap);
        if (e.key === "Enter") {
          const focused = wrap.querySelector(".cs-option.focused");
          if (focused) selectOption(focused);
        }
      });
    }

    list.addEventListener("click", function (e) {
      const opt = e.target.closest(".cs-option");
      if (opt) selectOption(opt);
    });

    list.addEventListener("mousemove", function (e) {
      const opt = e.target.closest(".cs-option");
      if (!opt) return;
      wrap.querySelectorAll(".cs-option.focused").forEach(function (o) {
        o.classList.remove("focused");
      });
      opt.classList.add("focused");
    });
  }

  // ── Multi-select ─────────────────────────────────────────────────────────────

  function initMulti(wrap) {
    const trigger = wrap.querySelector(".cs-trigger--multi");
    const tagsEl = wrap.querySelector(".cs-tags");
    const tagInput = wrap.querySelector(".cs-tag-input");
    const list = wrap.querySelector(".cs-list");
    const empty = wrap.querySelector(".cs-empty");
    const selected = new Set();

    function toggle() {
      if (wrap.classList.contains("open")) {
        closeWrap(wrap);
      } else {
        openWrap(wrap);
        tagInput.focus();
      }
    }

    function filterOptions() {
      const q = tagInput.value.toLowerCase();
      let visible = 0;
      wrap.querySelectorAll(".cs-option").forEach(function (opt) {
        const match = opt.textContent.toLowerCase().includes(q);
        opt.hidden = !match;
        if (match) visible++;
      });
      if (empty) empty.hidden = visible > 0;
    }

    function renderTags() {
      tagsEl.innerHTML = "";
      selected.forEach(function (val) {
        const opt = wrap.querySelector('.cs-option[data-value="' + val + '"]');
        if (!opt) return;
        const tag = document.createElement("span");
        tag.className = "cs-tag";
        const label = opt.textContent.trim();
        tag.innerHTML =
          label +
          ' <button class="cs-tag-remove" data-val="' +
          val +
          '" aria-label="Remove ' +
          label +
          '">\xd7</button>';
        tagsEl.appendChild(tag);
      });
      wrap.querySelectorAll(".cs-option").forEach(function (opt) {
        opt.classList.toggle("selected", selected.has(opt.dataset.value));
      });
      tagInput.placeholder = selected.size === 0 ? wrap.dataset.placeholder || "Pick\u2026" : "";
    }

    trigger.addEventListener("click", function (e) {
      if (e.target.closest(".cs-tag-remove")) return;
      toggle();
    });

    tagsEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".cs-tag-remove");
      if (!btn) return;
      selected.delete(btn.dataset.val);
      renderTags();
    });

    tagInput.addEventListener("input", filterOptions);
    tagInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeWrap(wrap);
      if (e.key === "Backspace" && tagInput.value === "" && selected.size > 0) {
        const last = Array.from(selected).pop();
        selected.delete(last);
        renderTags();
      }
    });

    list.addEventListener("click", function (e) {
      const opt = e.target.closest(".cs-option");
      if (!opt) return;
      const val = opt.dataset.value;
      if (selected.has(val)) {
        selected.delete(val);
      } else {
        selected.add(val);
      }
      tagInput.value = "";
      filterOptions();
      renderTags();
      tagInput.focus();
    });

    renderTags();
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  document.querySelectorAll(".cs-wrap").forEach(function (wrap) {
    if (wrap.classList.contains("cs-multi")) {
      initMulti(wrap);
    } else {
      initSingle(wrap);
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".cs-wrap")) closeAll(null);
  });
})();
