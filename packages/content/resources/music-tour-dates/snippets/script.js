(() => {
  "use strict";

  // ---- Data (fictional) -------------------------------------------------
  const SHOWS = [
    {
      id: "phx",
      month: "JUN", day: "14", year: "2026",
      city: "Phoenix, AZ", venue: "Desert Mirage Amphitheatre",
      region: "north-america", flag: "🇺🇸", regionLabel: "North America",
      status: "onsale",
      doors: "6:30 PM", start: "8:00 PM", support: "Velvet Static",
      price: "from $48",
    },
    {
      id: "la",
      month: "JUN", day: "21", year: "2026",
      city: "Los Angeles, CA", venue: "The Glass Atrium",
      region: "north-america", flag: "🇺🇸", regionLabel: "North America",
      status: "few",
      doors: "7:00 PM", start: "8:30 PM", support: "Paper Lanterns",
      price: "from $62",
    },
    {
      id: "tor",
      month: "JUL", day: "02", year: "2026",
      city: "Toronto, ON", venue: "Harbourline Hall",
      region: "north-america", flag: "🇨🇦", regionLabel: "North America",
      status: "soldout",
      doors: "6:45 PM", start: "8:15 PM", support: "Slow Marquee",
      price: "Sold out",
    },
    {
      id: "nyc",
      month: "JUL", day: "09", year: "2026",
      city: "New York, NY", venue: "Reservoir Stage",
      region: "north-america", flag: "🇺🇸", regionLabel: "North America",
      status: "onsale",
      doors: "7:00 PM", start: "8:45 PM", support: "Velvet Static",
      price: "from $58",
    },
    {
      id: "ldn",
      month: "JUL", day: "24", year: "2026",
      city: "London, UK", venue: "Camden Tide Arena",
      region: "europe", flag: "🇬🇧", regionLabel: "Europe",
      status: "few",
      doors: "6:30 PM", start: "8:00 PM", support: "Paper Lanterns",
      price: "from £45",
    },
    {
      id: "par",
      month: "JUL", day: "29", year: "2026",
      city: "Paris, FR", venue: "Salle Néon",
      region: "europe", flag: "🇫🇷", regionLabel: "Europe",
      status: "onsale",
      doors: "7:00 PM", start: "8:30 PM", support: "Cobalt Hour",
      price: "from €52",
    },
    {
      id: "ber",
      month: "AUG", day: "05", year: "2026",
      city: "Berlin, DE", venue: "Stahlwerk Halle",
      region: "europe", flag: "🇩🇪", regionLabel: "Europe",
      status: "announced",
      doors: "8:00 PM", start: "9:30 PM", support: "TBA",
      price: "Presale Fri",
    },
    {
      id: "ams",
      month: "AUG", day: "09", year: "2026",
      city: "Amsterdam, NL", venue: "Kanaal Pavilion",
      region: "europe", flag: "🇳🇱", regionLabel: "Europe",
      status: "soldout",
      doors: "7:30 PM", start: "9:00 PM", support: "Cobalt Hour",
      price: "Sold out",
    },
    {
      id: "tyo",
      month: "SEP", day: "03", year: "2026",
      city: "Tokyo, JP", venue: "Akari Dome",
      region: "asia", flag: "🇯🇵", regionLabel: "Asia",
      status: "onsale",
      doors: "5:30 PM", start: "7:00 PM", support: "Mono Garden",
      price: "from ¥7,800",
    },
    {
      id: "sel",
      month: "SEP", day: "08", year: "2026",
      city: "Seoul, KR", venue: "Hangang Skybox",
      region: "asia", flag: "🇰🇷", regionLabel: "Asia",
      status: "few",
      doors: "6:00 PM", start: "7:30 PM", support: "Mono Garden",
      price: "from ₩72,000",
    },
    {
      id: "sgp",
      month: "SEP", day: "13", year: "2026",
      city: "Singapore, SG", venue: "Marina Static Hall",
      region: "asia", flag: "🇸🇬", regionLabel: "Asia",
      status: "announced",
      doors: "7:00 PM", start: "8:30 PM", support: "TBA",
      price: "Presale soon",
    },
    {
      id: "syd",
      month: "SEP", day: "20", year: "2026",
      city: "Sydney, AU", venue: "Harbour Neon Theatre",
      region: "asia", flag: "🇦🇺", regionLabel: "Asia-Pacific",
      status: "onsale",
      doors: "6:30 PM", start: "8:00 PM", support: "Slow Marquee",
      price: "from A$74",
    },
  ];

  const STATUS = {
    onsale:    { cls: "onsale",    label: "On sale",        cta: "Tickets",   ctaCls: "tickets", disabled: false },
    few:       { cls: "few",       label: "Few left",       cta: "Tickets",   ctaCls: "tickets", disabled: false },
    soldout:   { cls: "soldout",   label: "Sold out",       cta: "Sold out",  ctaCls: "notify",  disabled: true  },
    announced: { cls: "announced", label: "Just announced", cta: "Notify me", ctaCls: "notify",  disabled: false },
  };

  // ---- Helpers ----------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2600);
  }

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let following = false;
  let currentRegion = "all";

  // ---- Render -----------------------------------------------------------
  const list = $("#show-list");

  function rowHTML(s) {
    const st = STATUS[s.status];
    const ctaInner = st.disabled
      ? `<span aria-hidden="true">✓</span> ${st.cta}`
      : (st.ctaCls === "tickets"
          ? `<span aria-hidden="true">🎟</span> ${st.cta}`
          : `${st.cta}`);

    return `
      <li class="show ${st.disabled ? "is-soldout" : ""}" data-region="${s.region}" data-id="${s.id}">
        <div class="show__main">
          <time class="date" datetime="${s.year}-${s.month}-${s.day}">
            <span class="date__mo">${s.month}</span>
            <span class="date__day">${s.day}</span>
            <span class="date__yr">${s.year}</span>
          </time>
          <div class="info">
            <p class="info__city"><span class="flag" aria-hidden="true">${s.flag}</span>${esc(s.city)}</p>
            <p class="info__venue">${esc(s.venue)}</p>
            <span class="region-tag">${esc(s.regionLabel)}</span>
          </div>
          <div class="right">
            <span class="status status--${st.cls}">${st.label}</span>
            <button
              class="cta cta--${st.ctaCls}"
              type="button"
              data-action="cta"
              data-status="${s.status}"
              ${st.disabled ? "disabled aria-disabled=\"true\"" : ""}
            >${ctaInner}</button>
          </div>
        </div>

        <button class="expand" type="button" data-action="expand" aria-expanded="false" aria-controls="det-${s.id}">
          Showtime &amp; support
          <span class="expand__chev" aria-hidden="true"></span>
        </button>
        <div class="details" id="det-${s.id}">
          <div class="details__inner">
            <div class="details__grid">
              <div class="detail"><p class="detail__k">Doors</p><p class="detail__v">${esc(s.doors)}</p></div>
              <div class="detail"><p class="detail__k">Set time</p><p class="detail__v">${esc(s.start)}</p></div>
              <div class="detail"><p class="detail__k">Support</p><p class="detail__v">${esc(s.support)}</p></div>
              <div class="detail"><p class="detail__k">Tickets</p><p class="detail__v">${esc(s.price)}</p></div>
            </div>
          </div>
        </div>
      </li>`;
  }

  function render() {
    const visible = SHOWS.filter((s) => currentRegion === "all" || s.region === currentRegion);
    list.innerHTML = visible.map(rowHTML).join("");
    $("#empty").hidden = visible.length > 0;
    $("#show-count").textContent = visible.length;
  }

  // ---- Filter counts ----------------------------------------------------
  function paintCounts() {
    $$("[data-count-for]").forEach((el) => {
      const r = el.getAttribute("data-count-for");
      el.textContent = r === "all"
        ? SHOWS.length
        : SHOWS.filter((s) => s.region === r).length;
    });
  }

  // ---- Events -----------------------------------------------------------
  // Region filter
  $(".filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    currentRegion = chip.dataset.region;
    $$(".chip").forEach((c) => {
      const on = c === chip;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", String(on));
    });
    render();
    const name = chip.textContent.trim().replace(/\s+\d+$/, "");
    toast(`Showing ${$("#show-count").textContent} ${name === "All" ? "shows" : name + " shows"}`);
  });

  // List delegation: cta + expand
  list.addEventListener("click", (e) => {
    const cta = e.target.closest('[data-action="cta"]');
    if (cta) {
      if (cta.disabled) return;
      const row = cta.closest(".show");
      const city = $(".info__city", row).textContent.trim();
      if (cta.dataset.status === "announced") {
        toast(`We'll alert you when ${city} tickets drop ⏰`);
      } else {
        toast(`Opening tickets for ${city} 🎟`);
      }
      return;
    }

    const exp = e.target.closest('[data-action="expand"]');
    if (exp) {
      const row = exp.closest(".show");
      const open = row.classList.toggle("is-open");
      exp.setAttribute("aria-expanded", String(open));
      return;
    }
  });

  // Follow / notify toggle
  const followBtn = $("#follow-btn");
  followBtn.addEventListener("click", () => {
    following = !following;
    followBtn.setAttribute("aria-pressed", String(following));
    $(".follow__label", followBtn).textContent = following ? "Notifying" : "Get notified";
    toast(following
      ? "You're on the list — we'll ping you about new Neon Tides dates 🔔"
      : "Notifications off.");
  });

  // ---- Init -------------------------------------------------------------
  paintCounts();
  render();
})();
