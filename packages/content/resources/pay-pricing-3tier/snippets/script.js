(function () {
  "use strict";

  var toastWrap = document.getElementById("toast-wrap");
  var toastTimers = [];

  /**
   * Show a transient toast message at the bottom of the screen.
   * @param {string} msg
   */
  function toast(msg) {
    if (!toastWrap) return;

    var el = document.createElement("div");
    el.className = "toast";

    var dot = document.createElement("span");
    dot.className = "toast__dot";

    var text = document.createElement("span");
    text.textContent = msg;

    el.appendChild(dot);
    el.appendChild(text);
    toastWrap.appendChild(el);

    // Force reflow so the transition runs.
    void el.offsetWidth;
    el.classList.add("is-in");

    var hide = window.setTimeout(function () {
      el.classList.remove("is-in");
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 2400);

    toastTimers.push(hide);
    // Keep at most 3 visible toasts.
    while (toastWrap.children.length > 3) {
      toastWrap.removeChild(toastWrap.firstChild);
    }
  }

  // Delegate CTA clicks.
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-cta]") : null;
    if (!btn) return;
    var plan = btn.getAttribute("data-cta");
    toast("Selected the " + plan + " plan");
  });

  // Allow Escape to dismiss any visible toasts.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !toastWrap) return;
    Array.prototype.forEach.call(toastWrap.querySelectorAll(".toast"), function (t) {
      t.classList.remove("is-in");
      window.setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 300);
    });
  });
})();
