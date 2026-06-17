(() => {
  "use strict";

  /* ---------- fictional data ---------- */
  const GRADIENTS = {
    Music: "linear-gradient(135deg,#4c1d95,#7c3aed 55%,#ff3d81)",
    Comedy: "linear-gradient(135deg,#7c2d12,#f59e0b)",
    Sports: "linear-gradient(135deg,#0c4a6e,#0ea5e9)",
    Arts: "linear-gradient(135deg,#831843,#ff3d81)",
    Festival: "linear-gradient(135deg,#14532d,#16a34a 60%,#84cc16)"
  };
  const CAT_DOT = {
    Music: "dot-music", Comedy: "dot-comedy", Sports: "dot-sports",
    Arts: "dot-arts", Festival: "dot-festival"
  };

  // day offsets from "today" so date chips behave deterministically
  const EVENTS = [
    { id: "e1", title: "Neon Cartography — Live", cat: "Music", venue: "Aurora Hall", city: "Harbor District", off: 0, time: "8:00 PM", price: 42, pop: 98, stock: "hot", featured: true },
    { id: "e2", title: "Midnight Roast Showcase", cat: "Comedy", venue: "The Velvet Cellar", city: "Old Town", off: 1, time: "9:30 PM", price: 24, pop: 71, stock: "low" },
    { id: "e3", title: "Riverside Derby: Foxes vs Tide", cat: "Sports", venue: "Granite Arena", city: "Riverside", off: 2, time: "7:15 PM", price: 35, pop: 88, stock: "ok", featured: true },
    { id: "e4", title: "Glass Garden — Light Exhibit", cat: "Arts", venue: "Pier 9 Gallery", city: "Harbor District", off: 5, time: "All day", price: 18, pop: 54, stock: "ok" },
    { id: "e5", title: "Lowtide Folk Festival", cat: "Festival", venue: "Brookline Commons", city: "Brookline", off: 6, time: "12:00 PM", price: 65, pop: 93, stock: "low", featured: true },
    { id: "e6", title: "Static Bloom + Paper Tigers", cat: "Music", venue: "Echo Room", city: "Old Town", off: 3, time: "8:30 PM", price: 29, pop: 76, stock: "ok" },
    { id: "e7", title: "Improv After Dark", cat: "Comedy", venue: "Loft 21", city: "Brookline", off: 4, time: "10:00 PM", price: 16, pop: 48, stock: "out" },
    { id: "e8", title: "Harbor Half Marathon", cat: "Sports", venue: "Seawall Track", city: "Harbor District", off: 12, time: "6:00 AM", price: 40, pop: 62, stock: "ok" },
    { id: "e9", title: "Strings & Steel Quartet", cat: "Arts", venue: "Old Town Chapel", city: "Old Town", off: 8, time: "7:00 PM", price: 27, pop: 58, stock: "low" },
    { id: "e10", title: "Velvet Pulse — Tour Finale", cat: "Music", venue: "Aurora Hall", city: "Harbor District", off: 18, time: "9:00 PM", price: 58, pop: 95, stock: "hot", featured: true },
    { id: "e11", title: "Riverside Night Market", cat: "Festival", venue: "Quay Plaza", city: "Riverside", off: 9, time: "5:00 PM", price: 0, pop: 67, stock: "ok" },
    { id: "e12", title: "Standup Marathon: 12 Comics", cat: "Comedy", venue: "The Velvet Cellar", city: "Old Town", off: 22, time: "8:00 PM", price: 22, pop: 51, stock: "ok" }
  ];

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const TODAY = new Date();

  const dateForOff = (off) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + off);
    return d;
  };

  /* ---------- state ---------- */
  const saved = new Set();
  const filters = { q: "", city: "", cat: "", date: "any" };
  let sort = "date";

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const fmtPrice = (p) => (p === 0 ? "Free" : "$" + p);

  let toastT;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function matchesDate(ev) {
    const off = ev.off;
    switch (filters.date) {
      case "today": return off === 0;
      case "week": return off >= 0 && off <= 7;
      case "month": return off >= 0 && off <= 31;
      case "weekend": {
        const wd = dateForOff(off).getDay();
        return off <= 9 && (wd === 5 || wd === 6 || wd === 0);
      }
      default: return true;
    }
  }

  function visibleEvents() {
    const q = filters.q.trim().toLowerCase();
    let list = EVENTS.filter((ev) => {
      if (filters.city && ev.city !== filters.city) return false;
      if (filters.cat && ev.cat !== filters.cat) return false;
      if (!matchesDate(ev)) return false;
      if (q) {
        const hay = (ev.title + " " + ev.venue + " " + ev.cat + " " + ev.city).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (sort === "popularity") return b.pop - a.pop;
      if (sort === "price") return a.price - b.price;
      return a.off - b.off;
    });
    return list;
  }

  /* ---------- renderers ---------- */
  function stockBadge(ev) {
    if (ev.stock === "out") return '<span class="stock-badge stock-out">Sold out</span>';
    if (ev.stock === "low") return '<span class="stock-badge stock-low">Few left</span>';
    if (ev.stock === "hot") return '<span class="stock-badge stock-hot">Selling fast</span>';
    return "";
  }

  function eventCard(ev) {
    const d = dateForOff(ev.off);
    const card = document.createElement("article");
    card.className = "card";
    card.style.setProperty("--ph", GRADIENTS[ev.cat]);
    const isSaved = saved.has(ev.id);
    card.innerHTML = `
      <div class="card-media">
        <span class="cat-tag"><span class="dot ${CAT_DOT[ev.cat]}"></span>${ev.cat}</span>
        ${stockBadge(ev)}
        <span class="date-flag"><span class="m">${MONTHS[d.getMonth()]}</span><span class="d">${d.getDate()}</span></span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${ev.title}</h3>
        <p class="card-venue">◎ ${ev.venue} · ${ev.city}</p>
        <p class="card-when">${WEEKDAYS[d.getDay()]} · ${ev.time}</p>
        <div class="card-foot">
          <span class="price">${fmtPrice(ev.price)} <small>${ev.price ? "from" : ""}</small></span>
          <button class="save ${isSaved ? "is-saved" : ""}" type="button"
            aria-pressed="${isSaved}" aria-label="${isSaved ? "Remove from saved" : "Save event"}">${isSaved ? "♥" : "♡"}</button>
        </div>
      </div>`;
    card.querySelector(".save").addEventListener("click", () => toggleSave(ev, card));
    return card;
  }

  function renderResults() {
    const list = visibleEvents();
    const grid = $("#results");
    grid.innerHTML = "";
    list.forEach((ev) => grid.appendChild(eventCard(ev)));
    $("#empty").hidden = list.length !== 0;
    $("#resultCount").textContent =
      list.length + (list.length === 1 ? " event" : " events");

    const parts = [];
    if (filters.cat) parts.push(filters.cat);
    if (filters.city) parts.push("in " + filters.city);
    $("#resultsTitle").textContent = parts.length ? parts.join(" ") : "All events";
  }

  function renderFeatured() {
    const car = $("#carousel");
    car.innerHTML = "";
    EVENTS.filter((e) => e.featured).forEach((ev) => {
      const d = dateForOff(ev.off);
      const a = document.createElement("a");
      a.className = "feat-card";
      a.href = "#results";
      a.style.setProperty("--ph", GRADIENTS[ev.cat]);
      a.innerHTML = `
        <span class="feat-badge">${ev.cat} · Featured</span>
        <h3>${ev.title}</h3>
        <p class="feat-meta"><span>📍 ${ev.venue}</span><span>${MONTHS[d.getMonth()]} ${d.getDate()} · ${ev.time}</span></p>
        <p class="feat-price">${fmtPrice(ev.price)}${ev.price ? " and up" : ""}</p>`;
      a.addEventListener("click", () => toast("Opening " + ev.title));
      car.appendChild(a);
    });
  }

  function renderTrending() {
    const ol = $("#trending");
    ol.innerHTML = "";
    [...EVENTS].sort((a, b) => b.pop - a.pop).slice(0, 6).forEach((ev) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="trend-info">
          <span class="trend-name">${ev.title}</span>
          <span class="trend-meta">${ev.cat} · ${ev.pop}% interest</span>
        </span>`;
      li.addEventListener("click", () => {
        $("#q").value = ev.title;
        filters.q = ev.title;
        renderResults();
        toast("Filtered to “" + ev.title + "”");
      });
      ol.appendChild(li);
    });
  }

  /* ---------- saving ---------- */
  function toggleSave(ev, card) {
    const btn = card.querySelector(".save");
    if (saved.has(ev.id)) {
      saved.delete(ev.id);
      btn.classList.remove("is-saved");
      btn.textContent = "♡";
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Save event");
      toast("Removed from saved");
    } else {
      saved.add(ev.id);
      btn.classList.add("is-saved");
      btn.textContent = "♥";
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", "Remove from saved");
      toast("Saved " + ev.title);
    }
    $("#savedCount").textContent = saved.size;
  }

  /* ---------- wiring ---------- */
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    filters.q = $("#q").value;
    filters.city = $("#location").value;
    filters.cat = $("#category").value;
    renderResults();
    toast(visibleEvents().length + " events found");
  });

  $("#q").addEventListener("input", (e) => { filters.q = e.target.value; renderResults(); });
  $("#location").addEventListener("change", (e) => { filters.city = e.target.value; renderResults(); });
  $("#category").addEventListener("change", (e) => { filters.cat = e.target.value; renderResults(); });
  $("#sort").addEventListener("change", (e) => { sort = e.target.value; renderResults(); });

  $("#dateChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $("#dateChips").querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    filters.date = chip.dataset.date;
    renderResults();
  });

  $("#savedBtn").addEventListener("click", () => {
    toast(saved.size ? saved.size + " event(s) saved" : "No saved events yet");
  });

  const scrollCar = (dir) => $("#carousel").scrollBy({ left: dir * 440, behavior: "smooth" });
  $("#carNext").addEventListener("click", () => scrollCar(1));
  $("#carPrev").addEventListener("click", () => scrollCar(-1));

  /* ---------- init ---------- */
  renderFeatured();
  renderTrending();
  renderResults();
})();
