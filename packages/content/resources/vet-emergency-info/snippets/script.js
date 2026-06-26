// Vet — Emergency Info: live open/closed indicator + copy-address.
(function () {
  "use strict";

  // Mocked weekly general (non-emergency) hours, 24h clock.
  // Index 0 = Sunday … 6 = Saturday. null = closed that day.
  var HOURS = {
    0: null, // Sun
    1: { open: 8, close: 19 }, // Mon
    2: { open: 8, close: 19 }, // Tue
    3: { open: 8, close: 19 }, // Wed
    4: { open: 8, close: 20 }, // Thu
    5: { open: 8, close: 18 }, // Fri
    6: { open: 9, close: 14 }, // Sat
  };

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function fmt(hour) {
    var h = ((hour + 11) % 12) + 1;
    var ampm = hour < 12 || hour === 24 ? "AM" : "PM";
    return h + " " + ampm;
  }

  function nextOpen(now) {
    // Find the next day (including future) that has hours.
    for (var i = 1; i <= 7; i++) {
      var d = (now.getDay() + i) % 7;
      if (HOURS[d]) {
        var label = i === 1 ? "tomorrow" : DAYS[d];
        return label + " at " + fmt(HOURS[d].open);
      }
    }
    return "soon";
  }

  function computeStatus() {
    var now = new Date();
    var today = HOURS[now.getDay()];
    var hour = now.getHours() + now.getMinutes() / 60;

    if (today && hour >= today.open && hour < today.close) {
      return {
        state: "open",
        text: "Open now",
        detail:
          "General hours: open until " +
          fmt(today.close) +
          " today. Emergency line is staffed 24/7.",
      };
    }
    // Closed: see if we open later today.
    if (today && hour < today.open) {
      return {
        state: "closed",
        text: "Closed",
        detail:
          "General clinic opens at " +
          fmt(today.open) +
          " today. For emergencies, call now — we answer 24/7.",
      };
    }
    return {
      state: "closed",
      text: "Closed",
      detail:
        "General clinic reopens " +
        nextOpen(now) +
        ". For emergencies, call now — we answer 24/7.",
    };
  }

  function render() {
    var pill = document.getElementById("status");
    var text = document.getElementById("status-text");
    var detail = document.getElementById("status-detail");
    if (!pill || !text) return;

    var s = computeStatus();
    pill.setAttribute("data-state", s.state);
    text.textContent = s.text;
    if (detail) detail.textContent = s.detail;
  }

  // Copy address
  var copyBtn = document.getElementById("copy-addr");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var addrEl = document.getElementById("er-address");
      var copied = document.getElementById("copied");
      var addr = addrEl ? addrEl.textContent.trim().replace(/\s+/g, " ") : "";

      var done = function () {
        if (!copied) return;
        copied.hidden = false;
        clearTimeout(copyBtn._t);
        copyBtn._t = setTimeout(function () {
          copied.hidden = true;
        }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = addr;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  render();
  // Re-check status every minute so it flips at opening/closing time.
  setInterval(render, 60 * 1000);
})();
