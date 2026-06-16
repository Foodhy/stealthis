(function () {
  "use strict";

  var TAIL_ORDER = ["tail-left", "tail-right", "tail-down"];
  var TAIL_LABEL = {
    "tail-left": "left",
    "tail-right": "right",
    "tail-down": "down",
  };

  var balloons = Array.prototype.slice.call(
    document.querySelectorAll(".balloon")
  );
  var segBtns = Array.prototype.slice.call(
    document.querySelectorAll(".seg-btn")
  );
  var textInput = document.getElementById("balloon-text");
  var applyBtn = document.getElementById("apply-text");

  var activeStyle = "speech";
  var toastTimer = null;

  /* ---- toast helper ---- */
  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-on");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-on");
    }, 1900);
  }

  /* ---- find which balloon is the active style ---- */
  function activeBalloon() {
    for (var i = 0; i < balloons.length; i++) {
      if (balloons[i].getAttribute("data-type") === activeStyle) {
        return balloons[i];
      }
    }
    return null;
  }

  function currentTail(balloon) {
    for (var i = 0; i < TAIL_ORDER.length; i++) {
      if (balloon.classList.contains(TAIL_ORDER[i])) return TAIL_ORDER[i];
    }
    return null;
  }

  /* ---- cycle tail direction on click ---- */
  function cycleTail(balloon) {
    var type = balloon.getAttribute("data-type");
    if (type === "caption") {
      toast("Caption boxes have no tail.");
      return;
    }
    var current = currentTail(balloon);
    var idx = TAIL_ORDER.indexOf(current);
    var next = TAIL_ORDER[(idx + 1) % TAIL_ORDER.length];
    if (current) balloon.classList.remove(current);
    balloon.classList.add(next);
    toast(cap(type) + " tail → " + TAIL_LABEL[next]);
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  balloons.forEach(function (balloon) {
    balloon.addEventListener("click", function () {
      cycleTail(balloon);
    });
    balloon.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        cycleTail(balloon);
      }
    });
  });

  /* ---- style selector (focus + highlight the matching balloon) ---- */
  function setActiveStyle(style, btn) {
    activeStyle = style;
    segBtns.forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });

    var target = activeBalloon();
    if (target) {
      // brief pulse so the user can spot the active style
      target.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.06)" },
          { transform: "scale(1)" },
        ],
        { duration: 320, easing: "ease-out" }
      );
      target.focus({ preventScroll: false });
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    toast("Editing: " + cap(style));
  }

  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActiveStyle(btn.getAttribute("data-style"), btn);
    });
    // arrow-key navigation across the radiogroup
    btn.addEventListener("keydown", function (e) {
      var idx = segBtns.indexOf(btn);
      var nextIdx = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIdx = (idx + 1) % segBtns.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIdx = (idx - 1 + segBtns.length) % segBtns.length;
      }
      if (nextIdx !== null) {
        e.preventDefault();
        var nb = segBtns[nextIdx];
        nb.focus();
        setActiveStyle(nb.getAttribute("data-style"), nb);
      }
    });
  });

  /* ---- apply lettering to the active balloon ---- */
  function applyText() {
    var value = (textInput.value || "").trim();
    if (!value) {
      toast("Type some lettering first!");
      textInput.focus();
      return;
    }
    var target = activeBalloon();
    if (!target) return;
    var p = target.querySelector(".balloon-text");
    if (!p) return;

    // shout balloons read as upper-case lettering
    p.textContent = activeStyle === "shout" ? value.toUpperCase() : value;

    target.animate(
      [{ opacity: 0.35 }, { opacity: 1 }],
      { duration: 260, easing: "ease-out" }
    );
    toast(cap(activeStyle) + " lettering set.");
  }

  applyBtn.addEventListener("click", applyText);
  textInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      applyText();
    }
  });

  // greet once mounted
  toast("Click any balloon to cycle its tail.");
})();
