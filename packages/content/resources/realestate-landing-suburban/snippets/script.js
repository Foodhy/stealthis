(function () {
  "use strict";

  /* ---------------- Toast helper ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------------- Listing data ---------------- */
  var HOMES = [
    {
      id: "mg1", price: 612000, style: "colonial", status: "new",
      address: "84 Birchwood Lane", hood: "Cedar Hollow",
      beds: 4, baths: 3, sqft: 2640, rating: 9,
      school: "Cedar Hollow Elementary", roof: "#8a5530", body: "#f3e7d4", sky: "#f3c98f"
    },
    {
      id: "mg2", price: 489000, style: "ranch", status: "sale",
      address: "12 Sunny Meadow Ct", hood: "Maple Grove",
      beds: 3, baths: 2, sqft: 1890, rating: 8,
      school: "Maple Grove Primary", roof: "#a9683c", body: "#efe2cc", sky: "#f6dcb0"
    },
    {
      id: "mg3", price: 735000, style: "craftsman", status: "open",
      address: "27 Willow Bend Rd", hood: "Willowbrook",
      beds: 5, baths: 4, sqft: 3120, rating: 10,
      school: "Willowbrook Academy", roof: "#7a5331", body: "#e7d6bb", sky: "#eecf9d"
    },
    {
      id: "mg4", price: 525000, style: "colonial", status: "sale",
      address: "5 Garden Gate Way", hood: "Sunnyside Park",
      beds: 4, baths: 3, sqft: 2410, rating: 7,
      school: "Sunnyside Elementary", roof: "#8a5530", body: "#f1e3cd", sky: "#e7e0c4"
    },
    {
      id: "mg5", price: 398000, style: "ranch", status: "pending",
      address: "60 Clover Field Dr", hood: "Maple Grove",
      beds: 3, baths: 2, sqft: 1640, rating: 6,
      school: "Clover Field School", roof: "#a9683c", body: "#eedfca", sky: "#f3c98f"
    },
    {
      id: "mg6", price: 668000, style: "craftsman", status: "new",
      address: "19 Maplewood Terrace", hood: "Cedar Hollow",
      beds: 4, baths: 3, sqft: 2780, rating: 9,
      school: "Maplewood Charter", roof: "#7a5331", body: "#e9d8bd", sky: "#f6dcb0"
    },
    {
      id: "mg7", price: 559000, style: "colonial", status: "sale",
      address: "31 Hawthorne Circle", hood: "Willowbrook",
      beds: 4, baths: 3, sqft: 2520, rating: 8,
      school: "Hawthorne Day School", roof: "#8a5530", body: "#f3e7d4", sky: "#eecf9d"
    },
    {
      id: "mg8", price: 432000, style: "ranch", status: "open",
      address: "8 Prairie View Ln", hood: "Sunnyside Park",
      beds: 3, baths: 2, sqft: 1720, rating: 5,
      school: "Prairie View Elementary", roof: "#a9683c", body: "#efe2cc", sky: "#e7e0c4"
    },
    {
      id: "mg9", price: 812000, style: "craftsman", status: "new",
      address: "44 Orchard Hill Rd", hood: "Cedar Hollow",
      beds: 5, baths: 4, sqft: 3340, rating: 10,
      school: "Orchard Hill Magnet", roof: "#7a5331", body: "#e7d6bb", sky: "#f3c98f"
    }
  ];

  var STATUS = {
    new: { cls: "badge-new", label: "Just listed" },
    sale: { cls: "badge-sale", label: "For sale" },
    pending: { cls: "badge-pending", label: "Pending" },
    open: { cls: "badge-open", label: "Open house" }
  };

  var fmtPrice = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0
  });
  var fmtNum = new Intl.NumberFormat("en-US");

  var state = { style: "all", minRating: 1 };
  var favs = {};

  /* ---------------- Render ---------------- */
  var grid = document.getElementById("home-grid");
  var emptyEl = document.getElementById("empty");

  function scoreClass(r) {
    if (r >= 8) return "s-hi";
    if (r >= 6) return "s-mid";
    return "s-lo";
  }

  function cardHTML(h) {
    var st = STATUS[h.status];
    var sc = scoreClass(h.rating);
    return (
      '<article class="home" data-id="' + h.id + '">' +
        '<div class="home-photo" style="background:linear-gradient(180deg,' + h.sky + ' 0%,#e7e0c4 100%)">' +
          '<span class="roof" style="background:linear-gradient(180deg,' + h.roof + ',' + h.roof + ')"></span>' +
          '<div class="home-badges"><span class="badge ' + st.cls + '">' + st.label + '</span></div>' +
          '<button class="home-fav" type="button" aria-pressed="false" aria-label="Save ' + h.address + '">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.2 8.4 1.9 5 5.3 5c2 0 3.4 1.1 4.7 2.8C11.3 6.1 12.7 5 14.7 5 18.1 5 19.8 8.4 22 11.8 19.5 16.4 12 21 12 21z"/></svg>' +
          "</button>" +
          '<span class="home-style-tag">' + h.style + "</span>" +
        "</div>" +
        '<div class="home-body">' +
          '<div class="home-price">' + fmtPrice.format(h.price) + "</div>" +
          '<div class="home-addr">' + h.address + '<span class="hood">' + h.hood + "</span></div>" +
          '<div class="school">' +
            '<span class="school-score ' + sc + '">' + h.rating + "</span>" +
            '<span class="school-meta"><strong>' + h.school + "</strong>School rating " + h.rating + "/10</span>" +
          "</div>" +
          '<div class="home-specs">' +
            "<span>🛏 " + h.beds + " bd</span>" +
            "<span>🛁 " + h.baths + " ba</span>" +
            "<span>📐 " + fmtNum.format(h.sqft) + " sqft</span>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var list = HOMES.filter(function (h) {
      var styleOk = state.style === "all" || h.style === state.style;
      var ratingOk = h.rating >= state.minRating;
      return styleOk && ratingOk;
    });

    grid.innerHTML = list.map(cardHTML).join("");
    emptyEl.hidden = list.length !== 0;

    // restore fav state
    Array.prototype.forEach.call(grid.querySelectorAll(".home"), function (card) {
      var id = card.getAttribute("data-id");
      if (favs[id]) {
        var btn = card.querySelector(".home-fav");
        btn.classList.add("is-fav");
        btn.setAttribute("aria-pressed", "true");
      }
    });
  }

  /* ---------------- Favorites (event delegation) ---------------- */
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".home-fav");
    if (!btn) return;
    var card = btn.closest(".home");
    var id = card.getAttribute("data-id");
    favs[id] = !favs[id];
    btn.classList.toggle("is-fav", favs[id]);
    btn.setAttribute("aria-pressed", favs[id] ? "true" : "false");
    var addr = card.querySelector(".home-addr").childNodes[0].textContent;
    toast(favs[id] ? "Saved " + addr + " to your shortlist" : "Removed " + addr);
  });

  /* ---------------- Style chooser ---------------- */
  var styleRow = document.getElementById("style-row");
  styleRow.addEventListener("click", function (e) {
    var card = e.target.closest(".style-card");
    if (!card) return;
    state.style = card.getAttribute("data-style");
    Array.prototype.forEach.call(styleRow.children, function (c) {
      var active = c === card;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-pressed", active ? "true" : "false");
    });
    render();
    var name = card.querySelector(".sc-name").textContent;
    toast(state.style === "all" ? "Showing every home style" : "Filtered to " + name + " homes");
  });

  /* ---------------- School-rating slider ---------------- */
  var rating = document.getElementById("rating");
  var ratingVal = document.getElementById("rating-val");
  function syncSlider() {
    var v = parseInt(rating.value, 10);
    state.minRating = v;
    ratingVal.textContent = v + "+";
    var pct = ((v - rating.min) / (rating.max - rating.min)) * 100;
    rating.style.setProperty("--fill", pct + "%");
    render();
  }
  rating.addEventListener("input", syncSlider);
  rating.addEventListener("change", function () {
    toast("Showing homes rated " + rating.value + "/10 and up");
  });

  /* ---------------- Search form ---------------- */
  var search = document.getElementById("search");
  search.addEventListener("submit", function (e) {
    e.preventDefault();
    var hood = document.getElementById("neighborhood").value.trim();
    var beds = document.getElementById("beds").value;
    var parts = [];
    if (hood) parts.push("in " + hood);
    if (beds !== "0") parts.push(beds + "+ beds");
    toast(parts.length ? "Searching homes " + parts.join(", ") + "…" : "Browsing all neighborhoods…");
    document.getElementById("homes").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------------- CTA form ---------------- */
  var ctaForm = document.getElementById("cta-form");
  ctaForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("cta-name").value.trim() || "there";
    toast("Thanks " + name + " — a neighborhood guide will reach out to book your tour!");
    ctaForm.reset();
  });

  /* ---------------- Init ---------------- */
  syncSlider(); // sets fill + initial render
})();
