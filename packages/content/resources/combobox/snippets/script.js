(function () {
  document.querySelectorAll("[data-combobox]").forEach(initCombobox);

  function initCombobox(root) {
    var input = root.querySelector(".combobox-input");
    var list = root.querySelector(".combobox-list");
    var options = Array.from(root.querySelectorAll(".combobox-option"));
    var activeIndex = -1;
    var selectedValue = null;

    function open() {
      root.classList.add("is-open");
      input.setAttribute("aria-expanded", "true");
    }

    function close() {
      root.classList.remove("is-open");
      input.setAttribute("aria-expanded", "false");
      activeIndex = -1;
      clearActive();
    }

    function clearActive() {
      options.forEach(function (o) { o.classList.remove("is-active"); });
    }

    function setActive(idx) {
      clearActive();
      var visible = getVisible();
      if (idx < 0 || idx >= visible.length) return;
      activeIndex = idx;
      visible[idx].classList.add("is-active");
      visible[idx].scrollIntoView({ block: "nearest" });
    }

    function getVisible() {
      return options.filter(function (o) { return !o.classList.contains("is-hidden"); });
    }

    function selectOption(opt) {
      selectedValue = opt.getAttribute("data-value");
      input.value = opt.textContent;
      options.forEach(function (o) { o.classList.remove("is-selected"); });
      opt.classList.add("is-selected");
      close();
    }

    function filter() {
      var query = input.value.toLowerCase().trim();
      var anyVisible = false;

      options.forEach(function (opt) {
        var text = opt.textContent.toLowerCase();
        if (text.indexOf(query) !== -1) {
          opt.classList.remove("is-hidden");
          anyVisible = true;
        } else {
          opt.classList.add("is-hidden");
        }
      });

      /* Remove or add empty message */
      var existing = list.querySelector(".combobox-empty");
      if (!anyVisible) {
        if (!existing) {
          var msg = document.createElement("li");
          msg.className = "combobox-empty";
          msg.textContent = "No results found";
          list.appendChild(msg);
        }
      } else if (existing) {
        existing.remove();
      }

      activeIndex = -1;
      clearActive();
    }

    input.addEventListener("focus", function () {
      open();
      filter();
    });

    input.addEventListener("input", function () {
      open();
      filter();
    });

    input.addEventListener("keydown", function (e) {
      var visible = getVisible();

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!root.classList.contains("is-open")) { open(); filter(); }
        var next = activeIndex + 1;
        if (next >= visible.length) next = 0;
        setActive(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!root.classList.contains("is-open")) { open(); filter(); }
        var prev = activeIndex - 1;
        if (prev < 0) prev = visible.length - 1;
        setActive(prev);
      } else if (e.key === "Enter") {
        e.preventDefault();
        var vis = getVisible();
        if (activeIndex >= 0 && activeIndex < vis.length) {
          selectOption(vis[activeIndex]);
        }
      } else if (e.key === "Escape") {
        close();
        input.blur();
      }
    });

    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        selectOption(opt);
      });
      opt.addEventListener("mouseenter", function () {
        var vis = getVisible();
        var idx = vis.indexOf(opt);
        if (idx !== -1) setActive(idx);
      });
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) close();
    });
  }
}());
