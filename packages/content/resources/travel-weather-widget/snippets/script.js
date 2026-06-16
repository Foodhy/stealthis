(function () {
  "use strict";

  // --- Fictional climate data for Vuréndal Fjords (all temps in °C) ---
  // hi/lo = average daily high/low; feels = perceived; rainDays per month;
  // rainMm relative rainfall; daylight hours; tone good/ok/bad; emoji + desc.
  var MONTHS = [
    { m: "Jan", full: "January", hi: 1, lo: -5, feels: -8, rainMm: 95, rainDays: 17, day: 6, emoji: "❄️", desc: "Polar dark & frozen", tone: "bad", why: "Deep cold, long darkness and frequent snow keep most trails and ferries closed." },
    { m: "Feb", full: "February", hi: 2, lo: -5, feels: -7, rainMm: 80, rainDays: 15, day: 8, emoji: "🌨️", desc: "Crisp & snowy", tone: "bad", why: "Still firmly winter — bracing, beautiful for aurora hunters but harsh for hiking." },
    { m: "Mar", full: "March", hi: 5, lo: -2, feels: 1, rainMm: 70, rainDays: 13, day: 11, emoji: "🌥️", desc: "Thawing slowly", tone: "bad", why: "Thaw begins but footing is icy and many fjord roads are not yet plowed through." },
    { m: "Apr", full: "April", hi: 9, lo: 2, feels: 7, rainMm: 60, rainDays: 12, day: 14, emoji: "🌦️", desc: "Fresh & changeable", tone: "ok", why: "Waterfalls swell with melt and crowds are thin, but weather swings hour to hour." },
    { m: "May", full: "May", hi: 14, lo: 6, feels: 12, rainMm: 50, rainDays: 10, day: 17, emoji: "🌤️", desc: "Green & blooming", tone: "ok", why: "A lovely shoulder month — lush valleys, fewer visitors, the odd cold snap lingers." },
    { m: "Jun", full: "June", hi: 19, lo: 10, feels: 18, rainMm: 42, rainDays: 8, day: 19, emoji: "☀️", desc: "Mild & bright", tone: "good", why: "Long daylight, gentle temps and low rain — the fjords open and trails are clear." },
    { m: "Jul", full: "July", hi: 22, lo: 12, feels: 22, rainMm: 45, rainDays: 9, day: 18, emoji: "☀️", desc: "Warm & golden", tone: "good", why: "Peak season: warmest water, midnight-sun evenings and every cabin and ferry running." },
    { m: "Aug", full: "August", hi: 21, lo: 12, feels: 21, rainMm: 55, rainDays: 10, day: 16, emoji: "🌤️", desc: "Warm, a touch wetter", tone: "good", why: "Still excellent — ripe cloudberries and warm seas, with a few more passing showers." },
    { m: "Sep", full: "September", hi: 16, lo: 8, feels: 13, rainMm: 70, rainDays: 12, day: 13, emoji: "🍂", desc: "Amber & quiet", tone: "ok", why: "Autumn colour and northern-lights nights return, but rain picks up and days shorten fast." },
    { m: "Oct", full: "October", hi: 10, lo: 4, feels: 6, rainMm: 90, rainDays: 15, day: 10, emoji: "🌧️", desc: "Wet & windy", tone: "bad", why: "The wettest, windiest stretch — atmospheric, but ferries get cancelled often." },
    { m: "Nov", full: "November", hi: 5, lo: 0, feels: 0, rainMm: 95, rainDays: 16, day: 7, emoji: "🌧️", desc: "Grey & raw", tone: "bad", why: "Cold rain turning to sleet with very short days; most of the region winds down." },
    { m: "Dec", full: "December", hi: 2, lo: -3, feels: -6, rainMm: 92, rainDays: 17, day: 5, emoji: "❄️", desc: "Dark & frosty", tone: "bad", why: "Deepest darkness and frost — magical for aurora, but not for fjord-side exploring." }
  ];

  var BEST = [5, 6, 7]; // Jun, Jul, Aug (zero-indexed)
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  var FC_EMOJI = ["☀️", "🌤️", "🌦️", "🌧️", "⛅", "🌥️"];

  var state = { unit: "c", month: 5 };

  // --- Helpers ---
  function $(sel) { return document.querySelector(sel); }
  function el(tag, ns) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }
  function toC2(v) { return state.unit === "c" ? v : Math.round(v * 9 / 5 + 32); }
  function us() { return state.unit === "c" ? "°C" : "°F"; }
  function ud() { return state.unit === "c" ? "°" : "°"; }

  // --- Toast ---
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2000);
  }

  // --- Chart geometry ---
  var W = 720, H = 220, PADX = 24, PADTOP = 16, PADBOT = 34;
  var plotW = W - PADX * 2;
  var step = plotW / (MONTHS.length - 1);
  var temps = MONTHS.map(function (d) { return d.hi; });
  var tMin = Math.min.apply(null, temps);
  var tMax = Math.max.apply(null, temps);
  var rainMax = Math.max.apply(null, MONTHS.map(function (d) { return d.rainMm; }));

  function xAt(i) { return PADX + step * i; }
  function yTemp(t) {
    var range = tMax - tMin || 1;
    return PADTOP + (1 - (t - tMin) / range) * (H - PADTOP - PADBOT);
  }

  function buildChart() {
    var rainG = $("#rain-bars");
    var labelsG = $("#month-labels");
    var dotsG = $("#temp-dots");
    rainG.textContent = labelsG.textContent = dotsG.textContent = "";

    var baseY = H - PADBOT;
    var barW = step * 0.5;

    MONTHS.forEach(function (d, i) {
      // rainfall bar
      var bh = (d.rainMm / rainMax) * (H - PADTOP - PADBOT) * 0.62;
      var bar = el("rect");
      bar.setAttribute("class", "rain-bar");
      bar.setAttribute("data-i", i);
      bar.setAttribute("x", xAt(i) - barW / 2);
      bar.setAttribute("y", baseY - bh);
      bar.setAttribute("width", barW);
      bar.setAttribute("height", bh);
      bar.setAttribute("rx", 3);
      rainG.appendChild(bar);

      // month tick label
      var lbl = el("text");
      lbl.setAttribute("class", "tick");
      lbl.setAttribute("x", xAt(i));
      lbl.setAttribute("y", H - 12);
      lbl.setAttribute("text-anchor", "middle");
      lbl.textContent = d.m;
      labelsG.appendChild(lbl);

      // temp dot
      var dot = el("circle");
      dot.setAttribute("class", "temp-dot");
      dot.setAttribute("data-i", i);
      dot.setAttribute("cx", xAt(i));
      dot.setAttribute("cy", yTemp(d.hi));
      dot.setAttribute("r", 4);
      dotsG.appendChild(dot);
    });

    // temperature line + area
    var pts = MONTHS.map(function (d, i) { return xAt(i) + "," + yTemp(d.hi); }).join(" ");
    $("#temp-line").setAttribute("points", pts);
    var areaPts = xAt(0) + "," + baseY + " " + pts + " " + xAt(MONTHS.length - 1) + "," + baseY;
    $("#temp-area").setAttribute("points", areaPts);

    // best band
    var band = $("#best-band");
    var bx = xAt(BEST[0]) - step * 0.5;
    var bw = (BEST[BEST.length - 1] - BEST[0]) * step + step;
    band.setAttribute("x", bx);
    band.setAttribute("y", PADTOP - 4);
    band.setAttribute("width", bw);
    band.setAttribute("height", H - PADBOT - PADTOP + 6);
  }

  // --- Month strip buttons ---
  function buildStrip() {
    var strip = $("#month-strip");
    strip.textContent = "";
    MONTHS.forEach(function (d, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "month-btn" + (BEST.indexOf(i) > -1 ? " best" : "");
      b.textContent = d.m;
      b.setAttribute("role", "radio");
      b.setAttribute("data-i", i);
      b.setAttribute("aria-checked", "false");
      b.setAttribute("aria-label", d.full + (BEST.indexOf(i) > -1 ? " — best window" : ""));
      strip.appendChild(b);
    });
  }

  // --- Pseudo-random but stable forecast from a month seed ---
  function seeded(seed) {
    var x = Math.sin(seed * 99.91) * 10000;
    return x - Math.floor(x);
  }

  function buildForecast(mi) {
    var d = MONTHS[mi];
    var list = $("#fc-list");
    list.textContent = "";
    $("#fc-context").textContent = "· typical " + d.full;

    var range = tMax - tMin || 1;
    for (var k = 0; k < DAYS.length; k++) {
      var r = seeded((mi + 1) * 7 + k * 3);
      var r2 = seeded((mi + 1) * 13 + k * 5);
      var hi = Math.round(d.hi + (r - 0.5) * 5);
      var lo = Math.round(d.lo + (r2 - 0.5) * 4);
      // choose an emoji weighted by rain tendency
      var wet = d.rainDays / 17;
      var idx = r < wet ? (r2 < 0.5 ? 3 : 2) : (r2 < 0.4 ? 0 : r2 < 0.7 ? 1 : 4);
      var emoji = FC_EMOJI[idx];

      var pos = ((hi - tMin) / range) * 80 + 10;

      var li = document.createElement("li");
      li.className = "fc-item";
      li.innerHTML =
        '<span class="fc-day">' + DAYS[k] + '</span>' +
        '<span class="fc-emoji" aria-hidden="true">' + emoji + '</span>' +
        '<span class="fc-bar"><span style="left:' + pos.toFixed(0) + '%"></span></span>' +
        '<span class="fc-temps"><b>' + toC2(hi) + ud() + '</b> <i>' + toC2(lo) + ud() + '</i></span>';
      list.appendChild(li);
    }
  }

  // --- Render conditions card ---
  function renderConditions() {
    var d = MONTHS[state.month];
    $("#cond-month").textContent = d.full;
    $("#cond-temp-val").textContent = toC2(d.hi);
    $("#cond-unit").textContent = us();
    $("#cond-desc").textContent = d.desc;
    $("#cond-icon").textContent = d.emoji;
    $("#cond-hilo").textContent = toC2(d.hi) + ud() + " / " + toC2(d.lo) + ud();
    $("#cond-feels").textContent = toC2(d.feels) + ud();
    $("#cond-rain").textContent = d.rainDays + " days";
    $("#cond-day").textContent = d.day + "h";

    var v = $("#cond-verdict");
    v.setAttribute("data-tone", d.tone);
    var pill = d.tone === "good" ? "Ideal" : d.tone === "ok" ? "Shoulder" : "Off-season";
    $("#verdict-pill").textContent = pill;
    $("#verdict-text").textContent = d.why;

    buildForecast(state.month);
  }

  // --- Highlight active month across chart + strip ---
  function setActive(mi) {
    state.month = mi;
    document.querySelectorAll(".month-btn").forEach(function (b) {
      var on = +b.getAttribute("data-i") === mi;
      b.classList.toggle("active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll(".temp-dot").forEach(function (dot) {
      dot.classList.toggle("active", +dot.getAttribute("data-i") === mi);
    });
    document.querySelectorAll(".rain-bar").forEach(function (bar) {
      bar.classList.toggle("active", +bar.getAttribute("data-i") === mi);
    });
    renderConditions();
  }

  function selectMonth(mi, announce) {
    setActive(mi);
    if (announce) {
      var d = MONTHS[mi];
      var label = d.tone === "good" ? "a top pick" : d.tone === "ok" ? "a fair shoulder month" : "best avoided";
      toast(d.full + " — " + label);
    }
  }

  // --- Unit toggle ---
  function setUnit(u) {
    if (state.unit === u) return;
    state.unit = u;
    document.querySelectorAll(".unit").forEach(function (btn) {
      var on = btn.getAttribute("data-unit") === u;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    renderConditions();
    toast("Switched to " + us());
  }

  // --- Wire up events ---
  function bind() {
    $("#month-strip").addEventListener("click", function (e) {
      var btn = e.target.closest(".month-btn");
      if (btn) selectMonth(+btn.getAttribute("data-i"), true);
    });

    $("#month-strip").addEventListener("keydown", function (e) {
      var keys = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: -1, ArrowDown: 1 };
      if (e.key === "Home") { e.preventDefault(); focusMonth(0); return; }
      if (e.key === "End") { e.preventDefault(); focusMonth(MONTHS.length - 1); return; }
      if (!(e.key in keys)) return;
      e.preventDefault();
      var next = (state.month + keys[e.key] + MONTHS.length) % MONTHS.length;
      focusMonth(next);
    });

    function focusMonth(mi) {
      selectMonth(mi, true);
      var b = document.querySelector('.month-btn[data-i="' + mi + '"]');
      if (b) b.focus();
    }

    // chart dots are clickable too
    $("#temp-dots").addEventListener("click", function (e) {
      var dot = e.target.closest(".temp-dot");
      if (dot) selectMonth(+dot.getAttribute("data-i"), true);
    });

    document.querySelectorAll(".unit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setUnit(btn.getAttribute("data-unit"));
      });
    });
  }

  // --- Init ---
  buildChart();
  buildStrip();
  bind();
  setActive(state.month);
})();
