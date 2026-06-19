/* Skyward Airlines — Destinations page (vanilla JS, illustrative only) */
(function () {
  "use strict";

  // Fictional destination network. Photos via deterministic Unsplash source URLs.
  var IMG = function (id) {
    return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=640&q=70";
  };

  var DESTINATIONS = [
    { city: "Lisbon", country: "Portugal", code: "LIS", region: "Europe", price: 389, time: "8h 05m", cabin: "A321neo · Economy & Premium", freq: "3 weekly", featured: true,
      copy: "Pastel facades, tram-clattering hills and golden Atlantic light. Direct daytime service three times weekly aboard the new A321neo.",
      img: "1585208798174-6cedd86e019a", tags: ["Direct", "New route", "Atlantic coast", "Visa-free 90d"] },
    { city: "Tokyo", country: "Japan", code: "HND", region: "Asia", price: 742, time: "13h 40m", cabin: "B787-9 · Economy to Suite", freq: "Daily",
      copy: "Neon districts, quiet shrines and the world's best transit. Overnight departures land you mid-morning at Haneda.", img: "1540959733332-eab4deabeeaf" },
    { city: "Reykjavik", country: "Iceland", code: "KEF", region: "Europe", price: 311, time: "5h 50m", cabin: "A320neo · Economy", freq: "5 weekly",
      copy: "Geothermal lagoons, lava fields and the aurora. Stopover programme lets you add up to 7 nights for free.", img: "1504218817356-1c12c3b9d9d6", deal: true },
    { city: "Marrakech", country: "Morocco", code: "RAK", region: "Africa", price: 268, time: "3h 25m", cabin: "A320 · Economy", freq: "4 weekly",
      copy: "Souks, riads and the snow-tipped Atlas on the horizon. A short hop into a different world.", img: "1597212618440-806262de4f6b", deal: true },
    { city: "New York", country: "United States", code: "JFK", region: "Americas", price: 498, time: "7h 55m", cabin: "B787-9 · Economy & Business", freq: "Daily",
      copy: "Skyline, galleries and 24-hour energy. Lie-flat business suites on every departure.", img: "1496442226666-8d4d0e62e6e9" },
    { city: "Singapore", country: "Singapore", code: "SIN", region: "Asia", price: 689, time: "12h 30m", cabin: "A350-900 · Economy to Suite", freq: "6 weekly",
      copy: "Hawker stalls, hyper-gardens and a spotless transit hub. The Jewel waterfall is worth the layover.", img: "1525625293386-3f8f99389edd" },
    { city: "Cape Town", country: "South Africa", code: "CPT", region: "Africa", price: 612, time: "11h 20m", cabin: "A350-900 · Economy & Business", freq: "3 weekly",
      copy: "Table Mountain, vineyards and two oceans meeting at the Cape. Seasonal summer schedule.", img: "1580060839134-75a5edca2e99" },
    { city: "Buenos Aires", country: "Argentina", code: "EZE", region: "Americas", price: 734, time: "13h 05m", cabin: "B787-9 · Economy & Business", freq: "4 weekly",
      copy: "Tango, steak and grand boulevards. Overnight service with a full lie-flat business cabin.", img: "1589909202802-8f4aadce1849" },
    { city: "Amsterdam", country: "Netherlands", code: "AMS", region: "Europe", price: 214, time: "6h 40m", cabin: "A320neo · Economy", freq: "Daily",
      copy: "Canals, masterpieces and bicycle bells. Our most frequent European link, twice daily in summer.", img: "1534351590666-13e3e96b5017", deal: true },
    { city: "Bangkok", country: "Thailand", code: "BKK", region: "Asia", price: 658, time: "12h 10m", cabin: "A350-900 · Economy to Suite", freq: "5 weekly",
      copy: "Temples, street food and the river of kings. A gateway to all of Southeast Asia.", img: "1508009603885-50cf7c579365" },
    { city: "Vancouver", country: "Canada", code: "YVR", region: "Americas", price: 545, time: "9h 35m", cabin: "B787-9 · Economy & Business", freq: "5 weekly",
      copy: "Mountains meeting the sea, with the city right between them. Ski and surf in the same week.", img: "1560814304-4f05b8e0c1d2" },
    { city: "Nairobi", country: "Kenya", code: "NBO", region: "Africa", price: 587, time: "10h 50m", cabin: "B787-9 · Economy & Business", freq: "3 weekly",
      copy: "Safari gateway with a national park inside the city limits. Daytime arrival for onward connections.", img: "1547471080-7cc2caa01a7e" }
  ];

  var REGIONS = ["All", "Europe", "Asia", "Americas", "Africa"];

  // ---- State ----
  var state = { region: "All", query: "", sort: "featured" };

  // ---- Elements ----
  var grid = document.getElementById("grid");
  var emptyEl = document.getElementById("empty");
  var resultCount = document.getElementById("resultCount");
  var regionsEl = document.getElementById("regions");
  var searchInput = document.getElementById("searchInput");
  var sortSelect = document.getElementById("sortSelect");

  // ---- Toast helper ----
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  // ---- Featured spotlight ----
  function renderFeatured() {
    var f = DESTINATIONS.find(function (d) { return d.featured; }) || DESTINATIONS[0];
    document.getElementById("featuredBg").style.backgroundImage =
      "url('" + IMG(f.img) + "')";
    document.getElementById("featuredTitle").textContent = f.city;
    document.getElementById("featuredSub").textContent = f.code + " · " + f.country + " · " + f.region;
    document.getElementById("featuredCopy").textContent = f.copy;
    document.getElementById("featuredPrice").textContent = "$" + f.price;
    var tagWrap = document.getElementById("featuredTags");
    tagWrap.innerHTML = "";
    (f.tags || []).forEach(function (tag) {
      var s = document.createElement("span");
      s.className = "tag";
      s.textContent = tag;
      tagWrap.appendChild(s);
    });
    document.getElementById("featuredBook").addEventListener("click", function () {
      toast("Searching fares to " + f.city + " — illustrative only.");
    });
  }

  // ---- Region chips ----
  function renderRegions() {
    REGIONS.forEach(function (r) {
      var b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.textContent = r;
      b.setAttribute("aria-selected", String(r === state.region));
      b.addEventListener("click", function () {
        state.region = r;
        regionsEl.querySelectorAll(".chip").forEach(function (c) {
          c.setAttribute("aria-selected", String(c === b));
        });
        render();
      });
      regionsEl.appendChild(b);
    });
  }

  // ---- Filtering / sorting ----
  function getList() {
    var q = state.query.trim().toLowerCase();
    var list = DESTINATIONS.filter(function (d) {
      if (state.region !== "All" && d.region !== state.region) return false;
      if (!q) return true;
      return (
        d.city.toLowerCase().indexOf(q) !== -1 ||
        d.country.toLowerCase().indexOf(q) !== -1 ||
        d.code.toLowerCase().indexOf(q) !== -1 ||
        d.region.toLowerCase().indexOf(q) !== -1
      );
    });
    switch (state.sort) {
      case "price-asc": list.sort(function (a, b) { return a.price - b.price; }); break;
      case "price-desc": list.sort(function (a, b) { return b.price - a.price; }); break;
      case "az": list.sort(function (a, b) { return a.city.localeCompare(b.city); }); break;
      default:
        list.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    }
    return list;
  }

  // ---- Card rendering ----
  function render() {
    var list = getList();
    grid.innerHTML = "";
    resultCount.textContent = list.length + (list.length === 1 ? " destination" : " destinations");
    emptyEl.hidden = list.length !== 0;

    list.forEach(function (d) {
      var card = document.createElement("button");
      card.className = "card";
      card.type = "button";
      card.setAttribute("role", "listitem");
      card.setAttribute("aria-label", "Quick view " + d.city + ", " + d.country + ", from $" + d.price);
      card.innerHTML =
        '<div class="card-img" style="background-image:url(\'' + IMG(d.img) + '\')">' +
          '<span class="card-code">' + d.code + '</span>' +
          (d.deal ? '<span class="card-deal">Deal</span>' : '') +
          '<span class="card-region">' + d.region + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<span class="card-city">' + d.city + '</span>' +
          '<span class="card-country">' + d.country + '</span>' +
          '<div class="card-foot">' +
            '<span class="card-price"><span class="from">From</span><span class="amt">$' + d.price + '</span></span>' +
            '<span class="card-time">✈ ' + d.time + '</span>' +
          '</div>' +
        '</div>';
      card.addEventListener("click", function () { openQuickView(d); });
      grid.appendChild(card);
    });
  }

  // ---- Quick view modal ----
  var overlay = document.getElementById("overlay");
  var lastFocus = null;

  function openQuickView(d) {
    lastFocus = document.activeElement;
    document.getElementById("qvImg").style.backgroundImage = "url('" + IMG(d.img) + "')";
    document.getElementById("qvTitle").textContent = d.city;
    document.getElementById("qvSub").textContent = d.country + " · " + d.region;
    document.getElementById("qvCode").textContent = d.code;
    document.getElementById("qvCopy").textContent = d.copy;
    document.getElementById("qvTime").textContent = d.time;
    document.getElementById("qvCabin").textContent = d.cabin.split(" · ")[0];
    document.getElementById("qvFreq").textContent = d.freq;
    document.getElementById("qvPrice").textContent = "$" + d.price;
    var book = document.getElementById("qvBook");
    book.onclick = function () { toast("Searching fares to " + d.city + " — illustrative only."); };
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("modalClose").focus();
  }
  function closeQuickView() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.getElementById("modalClose").addEventListener("click", closeQuickView);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeQuickView();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeQuickView();
  });

  // ---- Inputs ----
  var debounce;
  searchInput.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      state.query = searchInput.value;
      render();
    }, 120);
  });
  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    render();
  });

  // ---- Init ----
  renderFeatured();
  renderRegions();
  render();
})();
