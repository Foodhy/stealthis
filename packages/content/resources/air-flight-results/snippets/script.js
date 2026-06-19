(function () {
  "use strict";

  // ── Fictional flight data ───────────────────────────────
  const AIRLINES = {
    NV: { name: "Nimbus Air", color: "#0a66c2" },
    AU: { name: "Aurora Atlantic", color: "#ff7a33" },
    PV: { name: "Polaris Voyage", color: "#1f9d62" },
    MR: { name: "Meridian Skyways", color: "#7b5cd6" },
  };

  // duration in minutes, times 24h, prices USD
  const FLIGHTS = [
    {
      id: "NV482", airline: "NV", flightNo: "NV 482",
      depTime: "10:15", depCode: "SFO", arrTime: "06:20", arrCode: "LHR",
      dayOffset: "+1", durMin: 545, stops: 0, price: 612, depMins: 615,
      fares: { eco: 612, plus: 748, biz: 1990 },
    },
    {
      id: "PV119", airline: "PV", flightNo: "PV 119",
      depTime: "07:40", depCode: "SFO", arrTime: "04:05", arrCode: "LHR",
      dayOffset: "+1", durMin: 625, stops: 1, stopCode: "YYZ", stopMin: 75, price: 498, depMins: 460,
      fares: { eco: 498, plus: 629, biz: 1670 },
    },
    {
      id: "AU707", airline: "AU", flightNo: "AU 707",
      depTime: "13:30", depCode: "SFO", arrTime: "08:55", arrCode: "LHR",
      dayOffset: "+1", durMin: 625, stops: 0, price: 689, depMins: 810,
      fares: { eco: 689, plus: 815, biz: 2140 },
    },
    {
      id: "MR233", airline: "MR", flightNo: "MR 233",
      depTime: "21:50", depCode: "SFO", arrTime: "20:15", arrCode: "LHR",
      dayOffset: "+1", durMin: 625, stops: 1, stopCode: "ORD", stopMin: 110, price: 544, depMins: 1310,
      fares: { eco: 544, plus: 672, biz: 1820 },
    },
    {
      id: "NV906", airline: "NV", flightNo: "NV 906",
      depTime: "16:05", depCode: "SFO", arrTime: "10:30", arrCode: "LHR",
      dayOffset: "+1", durMin: 625, stops: 0, price: 731, depMins: 965,
      fares: { eco: 731, plus: 868, biz: 2280 },
    },
  ];

  const FARE_DEFS = [
    { key: "eco", name: "Economy Light", cls: "is-eco", perks: [
      { ok: true, t: "1 personal item" }, { ok: false, t: "No checked bag" }, { ok: false, t: "Seat at check-in" },
    ]},
    { key: "plus", name: "Economy Flex", cls: "", perks: [
      { ok: true, t: "1 carry-on + 1 bag" }, { ok: true, t: "Free seat select" }, { ok: true, t: "Changes allowed" },
    ]},
    { key: "biz", name: "Business", cls: "", perks: [
      { ok: true, t: "Lie-flat seat" }, { ok: true, t: "2 checked bags" }, { ok: true, t: "Lounge access" },
    ]},
  ];

  // ── State ───────────────────────────────────────────────
  const state = {
    stops: "any",
    windows: new Set(),
    maxPrice: 1450,
    airlines: new Set(Object.keys(AIRLINES)),
    sort: "best",
    selected: null,
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const fmtMoney = (n) => "$" + n.toLocaleString("en-US");
  const fmtDur = (m) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
  const windowOf = (mins) => {
    const h = mins / 60;
    if (h < 6) return "early";
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    return "evening";
  };

  // ── Toast ───────────────────────────────────────────────
  let toastTimer;
  function toast(msg, ok) {
    const el = $("#toast");
    el.innerHTML = (ok ? '<span class="check">✓</span>' : "") + msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // ── Build airline filter list ───────────────────────────
  function buildAirlineList() {
    const ul = $("#airlineList");
    ul.innerHTML = "";
    Object.entries(AIRLINES).forEach(([code, a]) => {
      const min = Math.min(...FLIGHTS.filter((f) => f.airline === code).map((f) => f.price));
      const li = document.createElement("li");
      li.innerHTML = `
        <label class="airline-row">
          <input type="checkbox" data-airline="${code}" checked />
          <span class="airline-dot" style="background:${a.color}"></span>
          <span class="airline-name">${a.name}</span>
          <span class="airline-from tnum">from ${fmtMoney(min)}</span>
        </label>`;
      ul.appendChild(li);
    });
    ul.addEventListener("change", (e) => {
      const cb = e.target.closest("input[data-airline]");
      if (!cb) return;
      const code = cb.dataset.airline;
      if (cb.checked) state.airlines.add(code);
      else state.airlines.delete(code);
      render();
    });
  }

  // ── Filtering + sorting ─────────────────────────────────
  function visibleFlights() {
    return FLIGHTS.filter((f) => {
      if (state.stops === "0" && f.stops !== 0) return false;
      if (state.stops === "1" && f.stops > 1) return false;
      if (state.windows.size && !state.windows.has(windowOf(f.depMins))) return false;
      if (f.price > state.maxPrice) return false;
      if (!state.airlines.has(f.airline)) return false;
      return true;
    });
  }

  function sortFlights(list) {
    const arr = list.slice();
    if (state.sort === "cheapest") arr.sort((a, b) => a.price - b.price);
    else if (state.sort === "fastest") arr.sort((a, b) => a.durMin - b.durMin);
    else arr.sort((a, b) => (a.price + a.durMin * 0.45) - (b.price + b.durMin * 0.45));
    return arr;
  }

  // ── Render a single card ────────────────────────────────
  function cardHTML(f, idx) {
    const a = AIRLINES[f.airline];
    const stopsLabel = f.stops === 0
      ? '<span class="tl-stops direct">Direct</span>'
      : `<span class="tl-stops stop">${f.stops} stop · ${f.stopCode} ${fmtDur(f.stopMin)}</span>`;
    let tag = "";
    if (state.sort === "best" && idx === 0) tag = '<span class="fc-tag best">Best value</span>';
    else if (state.sort === "fastest" && idx === 0) tag = '<span class="fc-tag fastest">Fastest</span>';

    const fares = FARE_DEFS.map((d) => `
      <div class="fare ${d.cls}" data-fare="${d.key}">
        <div class="fare-name">${d.name}</div>
        <div class="fare-price tnum">${fmtMoney(f.fares[d.key])} <span>/ person</span></div>
        <ul class="fare-perks">
          ${d.perks.map((p) => `<li class="${p.ok ? "" : "no"}"><span class="ico">${p.ok ? "✓" : "✕"}</span>${p.t}</li>`).join("")}
        </ul>
        <button type="button" class="fare-select" data-fare-select="${d.key}">Select ${fmtMoney(f.fares[d.key])}</button>
      </div>`).join("");

    return `
    <li>
      <article class="flight-card" data-id="${f.id}">
        <div class="fc-main">
          <div>
            <div class="fc-airline">
              <span class="fc-logo" style="background:${a.color}">${f.airline}</span>
              <div>
                <div class="fc-airline-name">${a.name}</div>
                <div class="fc-flightno tnum">${f.flightNo} · Boeing 787-9</div>
              </div>
              ${tag}
            </div>
            <div class="timeline">
              <div class="tl-end dep">
                <div class="tl-time tnum">${f.depTime}</div>
                <div class="tl-code">${f.depCode}</div>
              </div>
              <div class="tl-path">
                <span class="tl-dur tnum">${fmtDur(f.durMin)}</span>
                <span class="tl-line"><span class="tl-plane" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M21 16.5 14 12V5.5a2 2 0 1 0-4 0V12L3 16.5V18l7-2.2V20l-2 1.4V22l4-1 4 1v-.6L14 20v-4.2L21 18v-1.5Z"/></svg>
                </span></span>
                ${stopsLabel}
              </div>
              <div class="tl-end arr">
                <div class="tl-time tnum">${f.arrTime}<sup style="font-size:11px;color:var(--sunrise)">${f.dayOffset}</sup></div>
                <div class="tl-code">${f.arrCode}</div>
              </div>
            </div>
          </div>
          <div class="fc-buy">
            <div class="fc-price tnum">${fmtMoney(f.price)}<small>per person</small></div>
            <button type="button" class="fc-fares-toggle" data-toggle aria-expanded="false">
              View fares <span class="caret" aria-hidden="true">▾</span>
            </button>
          </div>
        </div>
        <div class="fc-fares">
          <div class="fares-grid">${fares}</div>
        </div>
      </article>
    </li>`;
  }

  // ── Render results ──────────────────────────────────────
  function render() {
    const all = FLIGHTS.length;
    const sorted = sortFlights(visibleFlights());
    const list = $("#flightList");
    const empty = $("#emptyState");

    $(".count-line").innerHTML = `<span id="resultCount">${sorted.length}</span> of ${all} flights · prices per person incl. taxes`;

    if (!sorted.length) {
      list.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    list.innerHTML = sorted.map((f, i) => cardHTML(f, i)).join("");

    if (state.selected) {
      const sel = list.querySelector(`[data-id="${state.selected}"]`);
      if (sel) sel.classList.add("is-selected");
    }
  }

  // ── Sort summaries ──────────────────────────────────────
  function updateSortSubs() {
    const v = FLIGHTS;
    $("#cheapSub").textContent = fmtMoney(Math.min(...v.map((f) => f.price)));
    $("#fastSub").textContent = fmtDur(Math.min(...v.map((f) => f.durMin)));
    const best = sortFlights(v.slice())[0];
    $("#bestSub").textContent = `${fmtMoney(best.price)} · ${fmtDur(best.durMin)}`;
  }

  // ── Event wiring ────────────────────────────────────────
  function wire() {
    // stops segmented
    $$(".seg-btn").forEach((b) => b.addEventListener("click", () => {
      $$(".seg-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      state.stops = b.dataset.stops;
      render();
    }));

    // departure windows
    $$('input[name="depwin"]').forEach((cb) => cb.addEventListener("change", () => {
      if (cb.checked) state.windows.add(cb.value);
      else state.windows.delete(cb.value);
      render();
    }));

    // price range
    const range = $("#priceRange");
    const out = $("#priceOut");
    range.addEventListener("input", () => {
      state.maxPrice = +range.value;
      out.textContent = fmtMoney(state.maxPrice);
      render();
    });

    // sort tabs
    $$(".sort-tab").forEach((t) => t.addEventListener("click", () => {
      $$(".sort-tab").forEach((x) => { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      t.classList.add("is-active");
      t.setAttribute("aria-selected", "true");
      state.sort = t.dataset.sort;
      render();
    }));

    // delegated clicks within results
    $("#flightList").addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-toggle]");
      if (toggle) {
        const card = toggle.closest(".flight-card");
        const open = card.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.childNodes[0].nodeValue = open ? "Hide fares " : "View fares ";
        return;
      }
      const fare = e.target.closest("[data-fare-select]");
      if (fare) {
        const card = fare.closest(".flight-card");
        const id = card.dataset.id;
        state.selected = id;
        $$(".flight-card").forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        const f = FLIGHTS.find((x) => x.id === id);
        const def = FARE_DEFS.find((d) => d.key === fare.dataset.fareSelect);
        toast(`${AIRLINES[f.airline].name} ${f.flightNo} — ${def.name} selected · ${fmtMoney(f.fares[def.key])}`, true);
        return;
      }
    });

    // reset
    function resetAll() {
      state.stops = "any";
      state.windows.clear();
      state.maxPrice = 1450;
      state.airlines = new Set(Object.keys(AIRLINES));
      state.selected = null;
      $$(".seg-btn").forEach((x, i) => x.classList.toggle("is-active", i === 0));
      $$('input[name="depwin"]').forEach((cb) => (cb.checked = false));
      $$('input[data-airline]').forEach((cb) => (cb.checked = true));
      range.value = 1450;
      out.textContent = "$1,450";
      render();
      toast("Filters reset");
    }
    $("#resetFilters").addEventListener("click", resetAll);
    $("#emptyReset").addEventListener("click", resetAll);

    $("#editSearch").addEventListener("click", () => toast("Search editor is illustrative only"));
  }

  // ── Init ────────────────────────────────────────────────
  buildAirlineList();
  updateSortSubs();
  wire();
  render();
})();
