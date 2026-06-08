(function () {
  "use strict";

  /* ── Toast helper ─────────────────────── */
  var toastWrap = document.getElementById("toasts");

  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="toast__dot" aria-hidden="true"></span><span></span>';
    el.querySelector("span:last-child").textContent = msg;
    toastWrap.appendChild(el);
    // force reflow so the transition runs
    void el.offsetWidth;
    el.classList.add("show");

    window.setTimeout(function () {
      el.classList.remove("show");
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }, 2600);
  }

  /* ── Status machine ───────────────────── */
  // Each step: machine-readable key, the pill label, and the label for the
  // button that advances *to the next* step.
  var FLOW = [
    { key: "confirmed", label: "Confirmed", next: "Check in" },
    { key: "checkedin", label: "Checked-in", next: "Begin service" },
    { key: "service", label: "In service", next: "Complete" },
    { key: "done", label: "Done", next: null }
  ];

  var stepIndex = 0;

  var pill = document.getElementById("status");
  var pillLabel = document.getElementById("status-label");
  var advanceBtn = document.getElementById("advance");

  var ARRIVAL_MSG = {
    checkedin: "Aria Vance checked in — Léa has been notified.",
    service: "Service started at chair 3. Timer running.",
    done: "Appointment complete. Receipt ready to send."
  };

  function render() {
    var step = FLOW[stepIndex];
    pill.setAttribute("data-status", step.key);
    pillLabel.textContent = step.label;

    if (step.next) {
      advanceBtn.textContent = step.next;
      advanceBtn.disabled = false;
    } else {
      advanceBtn.textContent = "Completed";
      advanceBtn.disabled = true;
    }
  }

  advanceBtn.addEventListener("click", function () {
    if (stepIndex >= FLOW.length - 1) return;
    stepIndex += 1;
    render();
    var step = FLOW[stepIndex];
    if (ARRIVAL_MSG[step.key]) toast(ARRIVAL_MSG[step.key]);
  });

  /* ── Totals (derived from the line items) ─ */
  var DISCOUNT_RATE = 0.1; // Atelier member

  function money(n) {
    var sign = n < 0 ? "−" : "";
    var v = Math.abs(n).toFixed(2);
    // trim a trailing ".00" to a clean dollar figure
    v = v.replace(/\.00$/, "");
    return sign + "$" + v;
  }

  function parsePrice(txt) {
    var m = txt.replace(/[^0-9.]/g, "");
    return m ? parseFloat(m) : 0;
  }

  function recalc() {
    var subtotal = 0;
    document.querySelectorAll("#lines .line__price").forEach(function (el) {
      subtotal += parsePrice(el.textContent);
    });
    var discount = subtotal * DISCOUNT_RATE;
    var total = subtotal - discount;

    document.getElementById("subtotal").textContent = money(subtotal);
    document.getElementById("discount").textContent = money(-discount);
    document.getElementById("total").textContent = money(total);
  }

  /* ── Secondary actions ────────────────── */
  document.getElementById("reschedule").addEventListener("click", function () {
    toast("Reschedule link sent to Aria — choose a new slot.");
  });

  document.getElementById("message").addEventListener("click", function () {
    toast("Message thread opened with Aria Vance.");
  });

  /* ── Init ─────────────────────────────── */
  recalc();
  render();
})();
