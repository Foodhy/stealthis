(function () {
  "use strict";

  var AIRPORTS = {
    "new york": "JFK", "newyork": "JFK", "nyc": "JFK",
    "london": "LHR", "paris": "CDG", "tokyo": "HND", "madrid": "MAD",
    "los angeles": "LAX", "san francisco": "SFO", "miami": "MIA",
    "dubai": "DXB", "singapore": "SIN", "sydney": "SYD",
    "são paulo": "GRU", "sao paulo": "GRU", "berlin": "BER",
    "rome": "FCO", "amsterdam": "AMS", "barcelona": "BCN",
    "toronto": "YYZ", "chicago": "ORD", "hong kong": "HKG",
    "delhi": "DEL", "mumbai": "BOM", "doha": "DOH", "istanbul": "IST"
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Toast ---------- */
  var toastWrap = $("#toastWrap");
  function toast(title, sub, type) {
    var el = document.createElement("div");
    el.className = "toast" + (type ? " " + type : "");
    var ok = type === "success";
    var icon = ok
      ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5z"/></svg>';
    el.innerHTML = '<span class="t-ico">' + icon + '</span><div class="t-body"><b>' +
      title + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>';
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, 3400);
  }

  /* ---------- Dates ---------- */
  function iso(d) { return d.toISOString().slice(0, 10); }
  function plusDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return d; }
  function fmtDate(str) {
    if (!str) return "";
    var d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  }

  function initDates() {
    var today = iso(new Date());
    $$(".date").forEach(function (inp) { inp.min = today; });
    var firstDepart = $(".depart");
    var firstReturn = $(".return");
    if (firstDepart) firstDepart.value = iso(plusDays(14));
    if (firstReturn) firstReturn.value = iso(plusDays(21));
  }

  /* ---------- Airport code resolution ---------- */
  function syncCode(input) {
    var codeEl = input.parentNode.querySelector(".ap-code");
    var key = input.value.trim().toLowerCase();
    var code = AIRPORTS[key];
    if (code) {
      input.setAttribute("data-code", code);
      if (codeEl) codeEl.textContent = code;
    } else if (input.value.trim().length >= 3 && /^[a-z]{3}$/i.test(input.value.trim())) {
      var up = input.value.trim().toUpperCase();
      input.setAttribute("data-code", up);
      if (codeEl) codeEl.textContent = up;
    } else {
      input.setAttribute("data-code", "");
      if (codeEl) codeEl.textContent = "—";
    }
  }

  document.addEventListener("input", function (e) {
    if (e.target.classList.contains("ap")) syncCode(e.target);
  });

  /* ---------- Swap ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".swap");
    if (!btn) return;
    var leg = btn.closest(".leg");
    var from = $(".field-from .ap", leg);
    var to = $(".field-to .ap", leg);
    var fv = from.value, fc = from.getAttribute("data-code");
    from.value = to.value; from.setAttribute("data-code", to.getAttribute("data-code"));
    to.value = fv; to.setAttribute("data-code", fc);
    syncCode(from); syncCode(to);
    btn.classList.toggle("spin");
    toast("Airports swapped", from.getAttribute("data-code") + " → " + to.getAttribute("data-code"));
  });

  /* ---------- Trip tabs ---------- */
  var tripType = "round";
  var legs = $("#legs");
  var addLegBtn = $("#addLeg");

  function applyTripType(type) {
    tripType = type;
    $$(".trip-tab").forEach(function (t) {
      var on = t.getAttribute("data-trip") === type;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });

    var multi = type === "multi";
    addLegBtn.hidden = !multi;

    // Remove extra legs when leaving multi-city
    if (!multi) {
      $$(".leg", legs).slice(1).forEach(function (l) { l.remove(); });
    }

    $$(".leg", legs).forEach(function (leg, i) {
      var ret = $(".field-return", leg);
      var removeBtn = $(".leg-remove", leg);
      if (type === "round") {
        ret.style.display = "";
        leg.classList.remove("no-return");
      } else {
        ret.style.display = "none";
        leg.classList.add("no-return");
      }
      removeBtn.hidden = !(multi && i > 0);
    });

    if (multi && $$(".leg", legs).length === 1) addLeg();
  }

  $$(".trip-tab").forEach(function (t) {
    t.addEventListener("click", function () { applyTripType(t.getAttribute("data-trip")); });
  });

  var legCounter = 1;
  function addLeg() {
    if ($$(".leg", legs).length >= 5) {
      toast("Maximum reached", "Up to 5 flights per multi-city search.");
      return;
    }
    var i = legCounter++;
    var prev = $$(".leg", legs).pop();
    var prevTo = prev ? $(".field-to .ap", prev) : null;
    var startCity = prevTo ? prevTo.value : "";
    var startCode = prevTo ? prevTo.getAttribute("data-code") : "";

    var div = document.createElement("div");
    div.className = "leg no-return";
    div.setAttribute("data-leg", i);
    div.innerHTML =
      '<div class="field field-from"><label for="from-' + i + '">From</label>' +
      '<div class="airport-input"><span class="ai-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16l7-2 4-9 2 1-1 7 5-2 1 2-7 4-1 4-2-1 1-4z"/></svg></span>' +
      '<input id="from-' + i + '" class="ap" type="text" autocomplete="off" placeholder="City or airport" value="' + startCity + '" data-code="' + startCode + '" />' +
      '<span class="ap-code">' + (startCode || "—") + '</span></div></div>' +
      '<button class="swap" type="button" aria-label="Swap origin and destination"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4l-4 4 4 4"/><path d="M3 8h13"/><path d="M17 20l4-4-4-4"/><path d="M21 16H8"/></svg></button>' +
      '<div class="field field-to"><label for="to-' + i + '">To</label>' +
      '<div class="airport-input"><span class="ai-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16l-7-2-4-9-2 1 1 7-5-2-1 2 7 4 1 4 2-1-1-4z"/></svg></span>' +
      '<input id="to-' + i + '" class="ap" type="text" autocomplete="off" placeholder="City or airport" data-code="" />' +
      '<span class="ap-code">—</span></div></div>' +
      '<div class="field field-depart"><label for="depart-' + i + '">Depart</label>' +
      '<input id="depart-' + i + '" class="date depart" type="date" /></div>' +
      '<div class="field field-return" style="display:none"><label>Return</label><input class="date return" type="date" disabled /></div>' +
      '<button class="leg-remove" type="button" aria-label="Remove flight"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    legs.appendChild(div);

    var newDepart = $(".depart", div);
    newDepart.min = iso(new Date());
    newDepart.value = iso(plusDays(14 + i * 7));
  }

  addLegBtn.addEventListener("click", addLeg);

  document.addEventListener("click", function (e) {
    var rm = e.target.closest(".leg-remove");
    if (!rm) return;
    var leg = rm.closest(".leg");
    if ($$(".leg", legs).length <= 1) return;
    leg.remove();
  });

  /* ---------- Passengers + cabin ---------- */
  var paxTrigger = $("#paxTrigger");
  var paxPanel = $("#paxPanel");
  var paxLabel = $("#paxLabel");
  var counts = { adults: 1, children: 0, infants: 0 };
  var limits = { adults: [1, 9], children: [0, 8], infants: [0, 4] };
  var cabin = "Economy";

  function renderPax() {
    $$(".stepper-row").forEach(function (row) {
      var type = row.getAttribute("data-type");
      var val = counts[type];
      $(".step-val", row).textContent = val;
      $(".minus", row).disabled = val <= limits[type][0];
      $(".plus", row).disabled = val >= limits[type][1] ||
        (type === "infants" && val >= counts.adults);
    });
    var total = counts.adults + counts.children + counts.infants;
    paxLabel.textContent = total + " passenger" + (total !== 1 ? "s" : "") + " · " + cabin;
  }

  $$(".stepper").forEach(function (st) {
    var row = st.closest(".stepper-row");
    var type = row.getAttribute("data-type");
    $(".plus", st).addEventListener("click", function () {
      if (counts[type] < limits[type][1] && !(type === "infants" && counts[type] >= counts.adults)) {
        counts[type]++; renderPax();
      }
    });
    $(".minus", st).addEventListener("click", function () {
      if (counts[type] > limits[type][0]) {
        counts[type]--;
        if (counts.infants > counts.adults) counts.infants = counts.adults;
        renderPax();
      }
    });
  });

  $$(".cabin").forEach(function (c) {
    c.addEventListener("click", function () {
      cabin = c.getAttribute("data-cabin");
      $$(".cabin").forEach(function (x) {
        var on = x === c;
        x.classList.toggle("active", on);
        x.setAttribute("aria-checked", on ? "true" : "false");
      });
      renderPax();
    });
  });

  function openPax(open) {
    paxPanel.hidden = !open;
    paxTrigger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  paxTrigger.addEventListener("click", function () { openPax(paxPanel.hidden); });
  $("#paxDone").addEventListener("click", function () { openPax(false); paxTrigger.focus(); });
  document.addEventListener("click", function (e) {
    if (!paxPanel.hidden && !e.target.closest(".pax-wrap")) openPax(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !paxPanel.hidden) { openPax(false); paxTrigger.focus(); }
  });

  /* ---------- Validation + search ---------- */
  var form = $("#searchForm");
  var formError = $("#formError");

  function showError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.hidden = true;

    var legEls = $$(".leg", legs);
    for (var i = 0; i < legEls.length; i++) {
      var leg = legEls[i];
      var from = $(".field-from .ap", leg);
      var to = $(".field-to .ap", leg);
      var depart = $(".depart", leg);
      if (!from.value.trim() || !from.getAttribute("data-code")) {
        showError("Please enter a valid origin airport."); from.focus(); return;
      }
      if (!to.value.trim() || !to.getAttribute("data-code")) {
        showError("Please enter a valid destination airport."); to.focus(); return;
      }
      if (from.getAttribute("data-code") === to.getAttribute("data-code")) {
        showError("Origin and destination must be different."); to.focus(); return;
      }
      if (!depart.value) {
        showError("Please choose a departure date."); depart.focus(); return;
      }
      if (tripType === "round") {
        var ret = $(".return", leg);
        if (!ret.value) { showError("Please choose a return date."); ret.focus(); return; }
        if (ret.value < depart.value) {
          showError("Return date can't be before departure."); ret.focus(); return;
        }
      }
    }

    var first = legEls[0];
    var fc = $(".field-from .ap", first).getAttribute("data-code");
    var tc = $(".field-to .ap", first).getAttribute("data-code");
    var total = counts.adults + counts.children + counts.infants;
    var depV = $(".depart", first).value;
    var dateLabel = tripType === "round"
      ? fmtDate(depV) + " – " + fmtDate($(".return", first).value)
      : tripType === "multi"
        ? legEls.length + " flights"
        : fmtDate(depV) + " · One way";

    toast(
      "Searching " + fc + " → " + tc,
      total + " passenger" + (total !== 1 ? "s" : "") + " · " + cabin + " · " + dateLabel,
      "success"
    );

    addRecent({
      from: fc,
      fc: $(".field-from .ap", first).value,
      to: tc,
      tc: $(".field-to .ap", first).value,
      pax: total,
      date: dateLabel
    });
  });

  /* ---------- Recent searches ---------- */
  var recentList = $("#recentList");

  function addRecent(s) {
    // de-dup
    $$(".recent-item", recentList).forEach(function (li) {
      if (li.dataset.from === s.from && li.dataset.to === s.to) li.remove();
    });
    var li = document.createElement("li");
    li.className = "recent-item";
    li.dataset.from = s.from; li.dataset.fc = s.fc;
    li.dataset.to = s.to; li.dataset.tc = s.tc;
    li.innerHTML =
      '<span class="ri-route"><b>' + s.from + '</b><span class="arrow" aria-hidden="true">→</span><b>' + s.to + '</b></span>' +
      '<span class="ri-meta">' + s.fc + ' · ' + s.tc + ' · ' + s.pax + ' pax</span>' +
      '<span class="ri-date">' + s.date + '</span>';
    var empty = $(".recent-empty", recentList);
    if (empty) empty.remove();
    recentList.insertBefore(li, recentList.firstChild);
    while ($$(".recent-item", recentList).length > 5) recentList.lastChild.remove();
  }

  $("#clearRecent").addEventListener("click", function () {
    recentList.innerHTML = '<li class="recent-empty">No recent searches yet — search a route to see it here.</li>';
    toast("Recent searches cleared", "");
  });

  /* ---------- Fill from recent / popular ---------- */
  function fillRoute(from, fc, to, tc) {
    var first = $$(".leg", legs)[0];
    var fromI = $(".field-from .ap", first);
    var toI = $(".field-to .ap", first);
    fromI.value = fc; fromI.setAttribute("data-code", from);
    toI.value = tc; toI.setAttribute("data-code", to);
    syncCode(fromI); syncCode(toI);
    // ensure displayed code matches dataset even without dictionary hit
    $(".field-from .ap-code", first).textContent = from;
    $(".field-to .ap-code", first).textContent = to;
    fromI.setAttribute("data-code", from);
    toI.setAttribute("data-code", to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  recentList.addEventListener("click", function (e) {
    var item = e.target.closest(".recent-item");
    if (!item) return;
    fillRoute(item.dataset.from, item.dataset.fc, item.dataset.to, item.dataset.tc);
    toast("Search filled", item.dataset.from + " → " + item.dataset.to + " — review and search.");
  });

  $("#routeGrid").addEventListener("click", function (e) {
    var card = e.target.closest(".route-card");
    if (!card) return;
    fillRoute(card.dataset.from, card.dataset.fc, card.dataset.to, card.dataset.tc);
    toast("Popular route selected", card.dataset.fc + " → " + card.dataset.tc);
  });

  /* ---------- Init ---------- */
  initDates();
  renderPax();
  $$(".ap").forEach(syncCode);
})();
