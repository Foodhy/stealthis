(function () {
  "use strict";

  // ---------- Toast helper ----------
  var toastHost = document.getElementById("toastHost");
  function toast(msg) {
    if (!toastHost) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="dot"></span><span></span>';
    el.lastChild.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () { el.remove(); }, 3100);
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fmtClock(date) {
    var h = date.getHours(), m = date.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return h + ":" + pad(m) + " " + ap;
  }
  function fmtMMSS(totalSec) {
    if (totalSec < 0) totalSec = 0;
    var m = Math.floor(totalSec / 60), s = totalSec % 60;
    return m + ":" + pad(s);
  }

  // ---------- Hero countdown engine ----------
  var heroBadge = document.getElementById("heroBadge");
  var heroBadgeLabel = document.getElementById("heroBadgeLabel");
  var heroCountdown = document.getElementById("heroCountdown");
  var heroCountdownCap = document.getElementById("heroCountdownCap");
  var heroSub = document.getElementById("heroSub");
  var heroWindow = document.getElementById("heroWindow");
  var routeFg = document.getElementById("routeFg");
  var driverMarker = document.getElementById("driverMarker");

  var routeLen = routeFg.getTotalLength();
  routeFg.style.strokeDasharray = routeLen;

  var DEFAULT_SECONDS = 12 * 60;
  var state = "enroute";        // enroute | arriving | delayed | delivered
  var remaining = DEFAULT_SECONDS;
  var routeStart = DEFAULT_SECONDS; // seconds at full distance
  var tickHandle = null;

  function setHeroBadge(stateName, label) {
    heroBadge.setAttribute("data-state", stateName);
    heroBadgeLabel.textContent = label;
    var pulse = heroBadge.querySelector(".badge-pulse");
    if (stateName === "delivered") {
      if (pulse) pulse.style.display = "none";
    } else if (pulse) {
      pulse.style.display = "";
    }
  }

  function placeDriver(progress) {
    // progress 0..1 from start to destination
    var p = Math.max(0, Math.min(1, progress));
    var pt = routeFg.getPointAtLength(routeLen * p);
    driverMarker.setAttribute("transform", "translate(" + pt.x + "," + pt.y + ")");
    // remaining route in front of driver
    routeFg.style.strokeDashoffset = routeLen * p;
  }

  function renderEnroute() {
    var progress = 1 - remaining / routeStart;
    placeDriver(progress);

    if (remaining <= 0) {
      transition("delivered", { auto: true });
      return;
    }

    if (remaining <= 60 && state !== "arriving") {
      state = "arriving";
      setHeroBadge("arriving", "Arriving now");
      heroCountdownCap.textContent = "driver is nearby";
      heroSub.textContent = "Marisol G. is pulling up — meet at the lobby door.";
      toast("Your driver is arriving now");
    } else if (remaining > 60 && state !== "delayed") {
      state = "enroute";
      setHeroBadge("enroute", "En route");
      heroCountdownCap.textContent = "until arrival";
    }
    heroCountdown.textContent = fmtMMSS(remaining);
  }

  function startTicking() {
    if (tickHandle) return;
    tickHandle = setInterval(function () {
      if (state === "delivered" || state === "delayed") return;
      remaining -= 1;
      renderEnroute();
    }, 1000);
  }
  function stopTicking() {
    if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
  }

  function arrivedClock() {
    var d = new Date();
    d.setSeconds(0);
    if (state !== "delivered") d.setMinutes(d.getMinutes() + Math.ceil(remaining / 60));
    return d;
  }

  function transition(target, opts) {
    opts = opts || {};
    state = target;

    if (target === "enroute") {
      remaining = DEFAULT_SECONDS;
      routeStart = DEFAULT_SECONDS;
      setHeroBadge("enroute", "En route");
      heroCountdownCap.textContent = "until arrival";
      heroSub.textContent = "Marisol G. is on the way with your order from Cedar & Vine.";
      heroCountdown.textContent = fmtMMSS(remaining);
      placeDriver(0);
      startTicking();
      if (!opts.silent) toast("Tracking live — 12:00 to go");
    } else if (target === "arriving") {
      remaining = 45;
      routeStart = 60;
      setHeroBadge("arriving", "Arriving now");
      heroCountdownCap.textContent = "driver is nearby";
      heroSub.textContent = "Marisol G. is pulling up — meet at the lobby door.";
      heroCountdown.textContent = fmtMMSS(remaining);
      placeDriver(1 - remaining / routeStart);
      startTicking();
      if (!opts.silent) toast("Your driver is arriving now");
    } else if (target === "delayed") {
      remaining += 9 * 60;
      routeStart = remaining;
      stopTicking();
      setHeroBadge("delayed", "+9 min late");
      heroCountdownCap.textContent = "new estimate";
      heroSub.textContent = "Heavy traffic on Lake Ave pushed the ETA back by about 9 minutes.";
      heroCountdown.textContent = fmtMMSS(remaining);
      placeDriver(0.45);
      if (!opts.silent) toast("Delivery delayed by ~9 min");
    } else if (target === "delivered") {
      stopTicking();
      var clk = fmtClock(new Date());
      remaining = 0;
      setHeroBadge("delivered", "Delivered " + clk);
      heroCountdown.textContent = "Done";
      heroCountdownCap.textContent = "left at your door";
      heroSub.textContent = "Order handed off and photo proof saved. Enjoy your meal!";
      placeDriver(1);
      if (!opts.silent && !opts.auto) toast("Marked delivered at " + clk);
      if (opts.auto) toast("Delivered — left at your door");
    }

    // update window pill text to stay coherent
    if (target === "delivered") {
      heroWindow.innerHTML = heroWindow.innerHTML.replace(/Window[^<]*/, "Delivered on time ✓");
    }

    // sync segmented control
    segButtons.forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-jump") === (target === "delivered" || target === "delayed" || target === "arriving" ? target : "enroute"));
    });
  }

  // ---------- Segmented control ----------
  var segButtons = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));
  segButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var jump = btn.getAttribute("data-jump");
      transition(jump);
    });
  });

  // ---------- Reset ----------
  document.getElementById("resetBtn").addEventListener("click", function () {
    heroWindow.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Window 6:10 – 6:30 PM';
    transition("enroute");
    toast("Demo reset");
  });

  // ---------- Live order feed (independent mini countdowns) ----------
  var feedData = [
    { name: "Theo Markham", note: "2× Spicy ramen bowl", color: "#5b8def", base: 184, st: "enroute" },
    { name: "Priya Nandakumar", note: "Cold brew + croissant", color: "#1f9d62", base: 23, st: "arriving" },
    { name: "Wren Castillo", note: "Family pizza night", color: "#e89422", base: -340, st: "delayed" },
    { name: "Dele Okonkwo", note: "Grocery run, 14 items", color: "#d4493e", base: 0, st: "delivered" }
  ];

  function badgeHtml(st, text, pulse) {
    var p = pulse ? '<span class="badge-pulse" aria-hidden="true"></span>' : "";
    return '<span class="badge" data-state="' + st + '">' + p + '<span class="badge-label">' + text + "</span></span>";
  }

  var feedList = document.getElementById("feedList");
  feedData.forEach(function (row, i) {
    var li = document.createElement("li");
    li.className = "feed-row";
    li.dataset.idx = i;
    var initials = row.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2);
    li.innerHTML =
      '<span class="feed-avatar" style="background:' + row.color + '">' + initials + "</span>" +
      '<span class="feed-main"><b>' + row.name + "</b><small>" + row.note + "</small></span>" +
      '<span class="feed-end"></span>';
    feedList.appendChild(li);
  });

  function renderFeed() {
    feedData.forEach(function (row, i) {
      var li = feedList.children[i];
      var end = li.querySelector(".feed-end");
      var html;
      if (row.st === "delivered") {
        html = badgeHtml("delivered", "Delivered", false);
      } else if (row.st === "delayed") {
        html = badgeHtml("delayed", "+" + Math.ceil(Math.abs(row.base) / 60) + " min late", true);
      } else if (row.base <= 0) {
        // arriving -> flips to delivered
        row.st = "delivered";
        html = badgeHtml("delivered", "Delivered", false);
        li.classList.add("flash");
        setTimeout(function () { li.classList.remove("flash"); }, 700);
        toast(row.name + "'s order delivered");
      } else if (row.base <= 60) {
        row.st = "arriving";
        html = badgeHtml("arriving", "Arriving · " + fmtMMSS(row.base), true);
      } else {
        row.st = "enroute";
        html = badgeHtml("enroute", fmtMMSS(row.base), true);
      }
      end.innerHTML = html;
    });
  }

  setInterval(function () {
    feedData.forEach(function (row) {
      if (row.st !== "delivered" && row.st !== "delayed") row.base -= 1;
    });
    renderFeed();
  }, 1000);

  // ---------- Init ----------
  renderFeed();
  transition("enroute", { silent: true });
})();
