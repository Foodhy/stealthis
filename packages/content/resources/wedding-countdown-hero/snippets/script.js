(function () {
  "use strict";

  // --- Event details -------------------------------------------------------
  var WEDDING = {
    title: "Amara & Julian — Wedding Ceremony",
    location: "The Rosewood Orchard, Napa Valley, California",
    description: "Join us as we say I do. Ceremony at 4:00 PM, reception to follow. #AmaraAndJulian2026",
    // Target date: September 12, 2026, 4:00 PM (local time)
    start: new Date(2026, 8, 12, 16, 0, 0),
    durationHours: 6,
  };

  var els = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
    countdown: document.querySelector(".countdown"),
    arrived: document.getElementById("arrived"),
    calBtn: document.getElementById("calBtn"),
    toast: document.getElementById("toast"),
  };

  // --- Countdown -----------------------------------------------------------
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function setValue(el, next) {
    if (el.textContent !== next) {
      el.textContent = next;
      el.classList.remove("pulse");
      // force reflow so the animation can restart
      void el.offsetWidth;
      el.classList.add("pulse");
    }
  }

  var finished = false;

  function tick() {
    var diff = WEDDING.start.getTime() - Date.now();

    if (diff <= 0) {
      if (!finished) {
        finished = true;
        els.countdown.hidden = true;
        els.arrived.hidden = false;
      }
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    setValue(els.days, pad(days));
    setValue(els.hours, pad(hours));
    setValue(els.minutes, pad(minutes));
    setValue(els.seconds, pad(seconds));
  }

  tick();
  setInterval(tick, 1000);

  // --- Toast helper --------------------------------------------------------
  var toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2600);
  }

  // --- Add to calendar (.ics) ---------------------------------------------
  function formatICSDate(date) {
    // Local-time floating value (no Z): YYYYMMDDTHHMMSS
    return (
      date.getFullYear() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }

  function escapeICS(text) {
    return String(text)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  function buildICS() {
    var end = new Date(WEDDING.start.getTime() + WEDDING.durationHours * 3600 * 1000);
    var stamp = formatICSDate(new Date());
    var uid = "amara-julian-" + WEDDING.start.getTime() + "@stealthis.dev";

    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Stealthis//Wedding Countdown Hero//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + stamp,
      "DTSTART:" + formatICSDate(WEDDING.start),
      "DTEND:" + formatICSDate(end),
      "SUMMARY:" + escapeICS(WEDDING.title),
      "DESCRIPTION:" + escapeICS(WEDDING.description),
      "LOCATION:" + escapeICS(WEDDING.location),
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + escapeICS(WEDDING.title),
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    return lines.join("\r\n");
  }

  els.calBtn.addEventListener("click", function () {
    try {
      var blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "amara-and-julian-save-the-date.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      toast("Save the date added to your calendar ♡");
    } catch (err) {
      toast("Could not create the calendar file.");
    }
  });
})();
