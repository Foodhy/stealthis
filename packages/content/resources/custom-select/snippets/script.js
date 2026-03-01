(function () {
  function buildSelect(wrap) {
    var isMulti = wrap.classList.contains("cs-multi");
    var trigger = wrap.querySelector(".cs-trigger");
    var dropdown = wrap.querySelector(".cs-dropdown");
    var list = wrap.querySelector(".cs-list");
    var emptyMsg = wrap.querySelector(".cs-empty");
    var search = wrap.querySelector(".cs-search");
    var tagInput = wrap.querySelector(".cs-tag-input");
    var tagsContainer = wrap.querySelector(".cs-tags");
    var valueEl = wrap.querySelector(".cs-value");
    var placeholder = wrap.dataset.placeholder || "Select…";
    var selected = [];
    var focusedIdx = -1;

    function getOptions() {
      return Array.from(list.querySelectorAll(".cs-option:not([hidden])"));
    }

    function open() {
      wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      if (search) { search.value = ""; filterOptions(""); search.focus(); }
      if (tagInput) tagInput.focus();
      focusedIdx = -1;
    }

    function close() {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      focusedIdx = -1;
    }

    function toggle() {
      wrap.classList.contains("is-open") ? close() : open();
    }

    function filterOptions(q) {
      var allOptions = Array.from(list.querySelectorAll(".cs-option"));
      var q2 = q.toLowerCase();
      var visible = 0;
      allOptions.forEach(function (o) {
        var match = o.textContent.toLowerCase().includes(q2);
        o.hidden = !match;
        if (match) visible++;
      });
      emptyMsg.hidden = visible > 0;
      // Hide group labels if all children in group are hidden
      Array.from(list.querySelectorAll(".cs-group-label")).forEach(function (lbl) {
        var next = lbl.nextElementSibling;
        var hasVisible = false;
        while (next && !next.classList.contains("cs-group-label")) {
          if (!next.hidden) hasVisible = true;
          next = next.nextElementSibling;
        }
        lbl.style.display = hasVisible ? "" : "none";
      });
    }

    function moveFocus(dir) {
      var opts = getOptions();
      if (!opts.length) return;
      focusedIdx = Math.max(0, Math.min(opts.length - 1, focusedIdx + dir));
      opts.forEach(function (o, i) { o.classList.toggle("is-focused", i === focusedIdx); });
      opts[focusedIdx].scrollIntoView({ block: "nearest" });
    }

    function selectOption(opt) {
      if (isMulti) {
        var val = opt.dataset.value;
        var idx = selected.indexOf(val);
        if (idx === -1) {
          selected.push(val);
          opt.classList.add("is-selected");
        } else {
          selected.splice(idx, 1);
          opt.classList.remove("is-selected");
        }
        renderTags();
      } else {
        Array.from(list.querySelectorAll(".cs-option")).forEach(function (o) { o.classList.remove("is-selected"); });
        opt.classList.add("is-selected");
        valueEl.textContent = opt.textContent;
        valueEl.classList.add("has-value");
        close();
      }
    }

    function renderTags() {
      tagsContainer.innerHTML = "";
      selected.forEach(function (val) {
        var opt = list.querySelector('[data-value="' + val + '"]');
        var label = opt ? opt.textContent : val;
        var tag = document.createElement("span");
        tag.className = "cs-tag";
        tag.textContent = label;
        var rm = document.createElement("button");
        rm.className = "cs-tag-remove";
        rm.textContent = "×";
        rm.setAttribute("aria-label", "Remove " + label);
        rm.addEventListener("click", function (e) {
          e.stopPropagation();
          selected = selected.filter(function (v) { return v !== val; });
          var o = list.querySelector('[data-value="' + val + '"]');
          if (o) o.classList.remove("is-selected");
          renderTags();
        });
        tag.appendChild(rm);
        tagsContainer.appendChild(tag);
      });
      tagInput.placeholder = selected.length ? "" : placeholder;
    }

    // Events
    trigger.addEventListener("click", function (e) {
      if (e.target.classList.contains("cs-tag-remove")) return;
      toggle();
    });

    if (search) {
      search.addEventListener("input", function () { filterOptions(search.value); focusedIdx = -1; });
      search.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(1); }
        if (e.key === "ArrowUp") { e.preventDefault(); moveFocus(-1); }
        if (e.key === "Enter") { e.preventDefault(); var opts = getOptions(); if (opts[focusedIdx]) selectOption(opts[focusedIdx]); }
        if (e.key === "Escape") close();
      });
    }

    if (tagInput) {
      tagInput.addEventListener("input", function () { filterOptions(tagInput.value); });
      tagInput.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(1); }
        if (e.key === "ArrowUp") { e.preventDefault(); moveFocus(-1); }
        if (e.key === "Enter") { e.preventDefault(); var opts = getOptions(); if (opts[focusedIdx]) selectOption(opts[focusedIdx]); }
        if (e.key === "Backspace" && tagInput.value === "" && selected.length) {
          var last = selected[selected.length - 1];
          selected.pop();
          var o = list.querySelector('[data-value="' + last + '"]');
          if (o) o.classList.remove("is-selected");
          renderTags();
        }
        if (e.key === "Escape") close();
      });
    }

    list.addEventListener("click", function (e) {
      var opt = e.target.closest(".cs-option");
      if (opt) { e.stopPropagation(); selectOption(opt); }
    });

    if (!isMulti && valueEl) {
      valueEl.textContent = placeholder;
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
        if (e.key === "ArrowDown") { e.preventDefault(); if (!wrap.classList.contains("is-open")) open(); moveFocus(1); }
        if (e.key === "ArrowUp") { e.preventDefault(); moveFocus(-1); }
        if (e.key === "Escape") close();
      });
    }

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
  }

  document.querySelectorAll(".cs-wrap").forEach(buildSelect);
}());
