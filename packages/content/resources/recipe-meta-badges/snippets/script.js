(function () {
  "use strict";

  var DIETS = {
    veg: {
      label: "Vegetarian",
      cls: "tag--veg",
      icon:
        '<path d="M12 21c-5-3-8-7-8-11a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 4-3 8-8 11Z"/>',
    },
    vegan: {
      label: "Vegan",
      cls: "tag--vegan",
      icon:
        '<path d="M12 4c5 0 8 3 8 8 0 4-3 8-8 8s-8-4-8-8c0-5 3-8 8-8Z"/><path d="M12 20c0-6 2-9 6-11"/>',
    },
    gf: {
      label: "Gluten-free",
      cls: "tag--gf",
      icon:
        '<path d="M12 3v18M12 8c-3-2-5-1-6 1M12 8c3-2 5-1 6 1M12 13c-3-2-5-1-6 1M12 13c3-2 5-1 6 1"/><path d="M4 4l16 16"/>',
    },
    keto: {
      label: "Keto",
      cls: "tag--keto",
      icon: '<path d="M5 9c0-2 2-3 4-3 1 0 2 .5 3 .5S15 6 16 6c2 0 4 1 4 3 0 4-3 9-7 9S5 13 5 9Z"/>',
    },
  };

  var toggles = Array.prototype.slice.call(
    document.querySelectorAll(".toggle[data-diet]")
  );
  var liveList = document.getElementById("livediet");
  var emptyMsg = document.getElementById("empty");
  var summary = document.getElementById("summary");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  function svg(inner) {
    return (
      '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + inner + "</svg>"
    );
  }

  function render() {
    var active = toggles.filter(function (b) {
      return b.classList.contains("is-on");
    });

    liveList.innerHTML = "";
    active.forEach(function (b) {
      var key = b.getAttribute("data-diet");
      var d = DIETS[key];
      if (!d) return;
      var li = document.createElement("li");
      li.className = "tag " + d.cls;
      li.innerHTML = svg(d.icon) + "<span>" + d.label + "</span>";
      liveList.appendChild(li);
    });

    emptyMsg.hidden = active.length !== 0;

    var names = active.map(function (b) {
      return DIETS[b.getAttribute("data-diet")].label;
    });
    if (names.length === 0) {
      summary.textContent = "This recipe has no dietary tags.";
    } else {
      var list =
        names.length === 1
          ? names[0]
          : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
      summary.textContent =
        "This recipe is tagged " +
        list +
        " (" +
        names.length +
        (names.length === 1 ? " tag" : " tags") +
        ").";
    }
  }

  toggles.forEach(function (b) {
    b.addEventListener("click", function () {
      var on = !b.classList.contains("is-on");
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
      render();
      var name = DIETS[b.getAttribute("data-diet")].label;
      toast(name + (on ? " added" : " removed"));
    });
  });

  render();
})();
