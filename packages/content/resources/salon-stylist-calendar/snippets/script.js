(() => {
  "use strict";

  // ---- Config ----------------------------------------------------------
  const DAY_START = 9;   // 9:00
  const DAY_END = 18;    // 6:00 pm
  const WORK_HOURS = DAY_END - DAY_START; // 9
  const HOUR_H = 84;     // must match --hour-h in CSS (px per hour)

  // ---- Helpers ---------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const pad = (n) => String(n).padStart(2, "0");

  function fmtTime(decimal) {
    let h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);
    const ampm = h >= 12 ? "pm" : "am";
    let hh = h % 12;
    if (hh === 0) hh = 12;
    return m === 0 ? `${hh}:00 ${ampm}` : `${hh}:${pad(m)} ${ampm}`;
  }

  function fmtDur(hours) {
    const m = Math.round(hours * 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h} hr ${r} min` : `${h} hr`;
  }

  const toast = (() => {
    const el = $("#toast");
    let timer;
    return (msg) => {
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove("show"), 2600);
    };
  })();

  // ---- Data: appointments per relative day offset ----------------------
  // start/end as decimal hours within the 9–18 window. svc: color|cut|treatment|break
  const SCHEDULES = {
    0: [
      { start: 9,    end: 9.5,  svc: "break", client: "Morning prep", service: "Station setup", price: 0,
        notes: "Sanitise tools, restock colour bar, review the day's bookings." },
      { start: 9.5,  end: 11,   svc: "color", client: "Eloise Marchand", service: "Balayage · Half head", price: 185,
        notes: "Returning every 8 weeks. Soft caramel ribbons, keep roots natural. Allergy patch on file." },
      { start: 11,   end: 12,   svc: "cut", client: "Priya Anand", service: "Cut & Blow-dry", price: 78,
        notes: "Loves a sleek long bob. Texturising on the ends only." },
      { start: 13,   end: 13.75, svc: "treatment", client: "Wren Holloway", service: "Olaplex Bond Treatment", price: 64,
        notes: "Bond repair after recent lightening. Gentle heat only." },
      { start: 14,   end: 16,   svc: "color", client: "Sofia Castellano", service: "Full Colour · Root to Tip", price: 220,
        notes: "Cool espresso, 6N base. Bring gloss for shine finish." },
      { start: 16.5, end: 17.5, svc: "cut", client: "Theo Lindqvist", service: "Restyle & Beard Trim", price: 92,
        notes: "Wants a sharper fade than last time. Photo saved in client file." },
    ],
    1: [
      { start: 9,    end: 9.5,  svc: "break", client: "Morning prep", service: "Station setup", price: 0,
        notes: "Sanitise tools and prep the colour bar." },
      { start: 10,   end: 11.5, svc: "color", client: "Marguerite Bellini", service: "Foil Highlights", price: 165,
        notes: "Babylights through the crown, brighten the face frame." },
      { start: 12,   end: 13,   svc: "treatment", client: "Yusuf Demir", service: "Scalp Detox Ritual", price: 58,
        notes: "Sensitive scalp — fragrance-free line." },
      { start: 14.5, end: 16,   svc: "cut", client: "Ada Okonkwo", service: "Curl Shaping Cut", price: 110,
        notes: "Dry-cut curls, diffuse finish. No heavy products." },
    ],
    2: [
      { start: 9,    end: 11,   svc: "color", client: "Camille Rousseau", service: "Colour Correction", price: 280,
        notes: "Two-step correction from box dye. Strand test before processing." },
      { start: 11.5, end: 12.5, svc: "break", client: "Lunch", service: "Break", price: 0,
        notes: "Stepping out to the café next door." },
      { start: 13,   end: 14,   svc: "cut", client: "Noah Whitfield", service: "Skin Fade & Style", price: 70,
        notes: "Regular monthly. Keep length on top." },
      { start: 15,   end: 17,   svc: "treatment", client: "Isolde Frére", service: "Keratin Smoothing", price: 240,
        notes: "Formaldehyde-free formula. 72-hour aftercare card to be given." },
    ],
    "-1": [
      { start: 9.5,  end: 11,   svc: "cut", client: "Beatrix Vance", service: "Cut & Curl Set", price: 95,
        notes: "Special event styling — soft Hollywood waves." },
      { start: 11.5, end: 13.5, svc: "color", client: "Lucia Moreau", service: "Ombré Refresh", price: 195,
        notes: "Melt the regrowth, add a warm gloss." },
      { start: 14,   end: 15,   svc: "treatment", client: "Jonah Reyes", service: "Hydration Mask", price: 52,
        notes: "Quick recovery treatment between colour appointments." },
    ],
  };

  function scheduleFor(offset) {
    return SCHEDULES[String(offset)] || [];
  }

  // ---- State -----------------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let selectedOffset = 0;
  let weekAnchor = 0; // shifts the date strip window
  let activeBlockEl = null;

  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function dateFor(offset) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d;
  }

  // ---- Render: date strip ---------------------------------------------
  const dateStrip = $("#dateStrip");

  function renderStrip() {
    dateStrip.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const offset = weekAnchor + i;
      const d = dateFor(offset);
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "day";
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", offset === selectedOffset ? "true" : "false");
      if (offset === 0) btn.classList.add("day--today");

      const count = scheduleFor(offset).filter((a) => a.svc !== "break").length;
      btn.innerHTML = `
        <span class="day__dow">${DOW[d.getDay()]}</span>
        <span class="day__num">${d.getDate()}</span>
        <span class="day__count">${count ? count + " appt" + (count > 1 ? "s" : "") : "open"}</span>`;
      btn.addEventListener("click", () => selectDay(offset));
      li.appendChild(btn);
      dateStrip.appendChild(li);
    }
  }

  function selectDay(offset) {
    selectedOffset = offset;
    renderStrip();
    renderDay();
    clearDetail();
  }

  // ---- Render: timeline ------------------------------------------------
  const axis = $("#axis");
  const grid = $("#grid");
  const blocksEl = $("#blocks");
  const timelineEl = $("#timeline");

  function buildAxisAndGrid() {
    axis.innerHTML = "";
    grid.innerHTML = "";
    const total = WORK_HOURS * HOUR_H;
    timelineEl.querySelector(".timeline__axis").style.height = total + "px";
    grid.style.height = total + "px";
    blocksEl.style.height = total + "px";

    for (let h = DAY_START; h <= DAY_END; h++) {
      const top = (h - DAY_START) * HOUR_H;
      const label = document.createElement("div");
      label.className = "axis-hour";
      label.style.top = top + "px";
      label.textContent = fmtTime(h);
      axis.appendChild(label);

      const line = document.createElement("div");
      line.className = "grid-line";
      line.style.top = top + "px";
      grid.appendChild(line);

      if (h < DAY_END) {
        const half = document.createElement("div");
        half.className = "grid-line grid-line--half";
        half.style.top = top + HOUR_H / 2 + "px";
        grid.appendChild(half);
      }
    }
  }

  function yFor(decimal) {
    return (decimal - DAY_START) * HOUR_H;
  }

  function renderDay() {
    const date = dateFor(selectedOffset);
    $("#dayLabel").textContent =
      `${DAYS_FULL[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;

    const appts = scheduleFor(selectedOffset)
      .slice()
      .sort((a, b) => a.start - b.start);

    blocksEl.innerHTML = "";
    activeBlockEl = null;

    // appointment + break blocks
    appts.forEach((appt, idx) => {
      const el = document.createElement(appt.svc === "break" ? "div" : "button");
      const span = appt.end - appt.start;
      el.className = "block" + (appt.svc === "break" ? " block--break" : "") + (span <= 0.6 ? " block--compact" : "");
      el.dataset.svc = appt.svc;
      el.style.top = yFor(appt.start) + "px";
      el.style.height = (span * HOUR_H - 6) + "px";

      const timeStr = `${fmtTime(appt.start)} – ${fmtTime(appt.end)}`;
      el.innerHTML = `
        <span class="block__time">${timeStr}</span>
        <p class="block__client">${appt.client}</p>
        <p class="block__svc">${appt.service}</p>`;

      if (appt.svc !== "break") {
        el.type = "button";
        el.setAttribute("aria-label", `${appt.client}, ${appt.service}, ${timeStr}`);
        el.addEventListener("click", () => {
          showDetail(appt, el);
        });
      }
      blocksEl.appendChild(el);
    });

    // open gaps between appointments (within working hours)
    const occupied = appts.map((a) => [a.start, a.end]).sort((a, b) => a[0] - b[0]);
    let cursor = DAY_START;
    const gaps = [];
    occupied.forEach(([s, e]) => {
      if (s - cursor >= 0.5) gaps.push([cursor, s]);
      cursor = Math.max(cursor, e);
    });
    if (DAY_END - cursor >= 0.5) gaps.push([cursor, DAY_END]);

    gaps.forEach(([s, e]) => {
      const g = document.createElement("button");
      g.className = "gap";
      g.type = "button";
      g.style.top = yFor(s) + "px";
      g.style.height = ((e - s) * HOUR_H - 6) + "px";
      const open = `${fmtTime(s)} – ${fmtTime(e)}`;
      g.innerHTML = `<span class="gap__plus">+</span> Add appointment`;
      g.setAttribute("aria-label", `Add appointment, open ${open}`);
      g.addEventListener("click", () => {
        toast(`Open slot ${open} — booking flow coming soon.`);
      });
      blocksEl.appendChild(g);
    });

    updateSummary(appts);
    positionNowLine();
  }

  // ---- Now line --------------------------------------------------------
  function positionNowLine() {
    const nl = $("#nowline");
    const now = new Date();
    const isToday = selectedOffset === 0;
    const dec = now.getHours() + now.getMinutes() / 60;
    if (isToday && dec >= DAY_START && dec <= DAY_END) {
      nl.hidden = false;
      nl.style.top = (8 + yFor(dec)) + "px";
    } else {
      nl.hidden = true;
    }
  }

  // ---- Summary ---------------------------------------------------------
  function updateSummary(appts) {
    const billable = appts.filter((a) => a.svc !== "break");
    const bookedHours = billable.reduce((s, a) => s + (a.end - a.start), 0);
    const revenue = billable.reduce((s, a) => s + a.price, 0);
    const pct = Math.round((bookedHours / WORK_HOURS) * 100);

    $("#statHours").innerHTML = `${bookedHours.toFixed(1)}<span>h</span>`;
    $("#statRev").textContent = `$${revenue.toLocaleString()}`;
    $("#statPct").textContent = `${pct}%`;
    $("#statSub").textContent = `${bookedHours.toFixed(1)} of ${WORK_HOURS} working hours`;

    const fill = $("#meterFill");
    fill.style.width = Math.min(pct, 100) + "%";
    const meter = $("#meter");
    meter.setAttribute("aria-valuenow", String(pct));
  }

  // ---- Detail panel ----------------------------------------------------
  const detailEmpty = $("#detailEmpty");
  const detailCard = $("#detailCard");

  function clearDetail() {
    detailCard.hidden = true;
    detailEmpty.style.display = "";
    if (activeBlockEl) {
      activeBlockEl.classList.remove("is-active");
      activeBlockEl = null;
    }
  }

  function showDetail(appt, el) {
    if (activeBlockEl) activeBlockEl.classList.remove("is-active");
    activeBlockEl = el;
    el.classList.add("is-active");

    detailEmpty.style.display = "none";
    detailCard.hidden = false;

    const svcLabel = { color: "Colour", cut: "Cut & Style", treatment: "Treatment" }[appt.svc];
    const dur = appt.end - appt.start;

    detailCard.innerHTML = `
      <span class="dc-tag" data-svc="${appt.svc}">${svcLabel}</span>
      <h3 class="dc-client">${appt.client}</h3>
      <p class="dc-time">${fmtTime(appt.start)} – ${fmtTime(appt.end)}</p>
      <ul class="dc-meta">
        <li><span class="k">Service</span><span class="v">${appt.service}</span></li>
        <li><span class="k">Duration</span><span class="v">${fmtDur(dur)}</span></li>
        <li><span class="k">Price</span><span class="v v--price">$${appt.price}</span></li>
      </ul>
      <p class="dc-notes"><strong>Stylist notes</strong>${appt.notes}</p>
      <div class="dc-actions">
        <button class="btn" type="button" data-act="reschedule">Reschedule</button>
        <button class="btn btn--primary" type="button" data-act="checkin">Check in</button>
      </div>`;

    detailCard.querySelector('[data-act="reschedule"]')
      .addEventListener("click", () => toast(`Reschedule requested for ${appt.client}.`));
    detailCard.querySelector('[data-act="checkin"]')
      .addEventListener("click", () => toast(`${appt.client} checked in — chair 02 is ready.`));
  }

  // ---- Week navigation -------------------------------------------------
  $("#dayPrev").addEventListener("click", () => {
    weekAnchor -= 7;
    renderStrip();
  });
  $("#dayNext").addEventListener("click", () => {
    weekAnchor += 7;
    renderStrip();
  });

  // ---- Keyboard: arrow keys move between days --------------------------
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowLeft") { selectDay(selectedOffset - 1); ensureVisible(); }
    if (e.key === "ArrowRight") { selectDay(selectedOffset + 1); ensureVisible(); }
  });

  function ensureVisible() {
    if (selectedOffset < weekAnchor) { weekAnchor = selectedOffset; renderStrip(); }
    if (selectedOffset > weekAnchor + 6) { weekAnchor = selectedOffset - 6; renderStrip(); }
  }

  // ---- Init ------------------------------------------------------------
  buildAxisAndGrid();
  renderStrip();
  renderDay();

  // keep the now-line fresh
  setInterval(positionNowLine, 60 * 1000);
})();
