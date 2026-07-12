(function () {
  "use strict";

  var GRADIENTS = {
    florist: "linear-gradient(135deg,#e8b7b0,#f4ece4)",
    caterer: "linear-gradient(135deg,#c9a24b,#e8cf9a)",
    band: "linear-gradient(135deg,#6b5555,#c98a86)",
    venue: "linear-gradient(135deg,#c98a86,#fbeeec)"
  };
  var CAT_LABEL = { florist: "Florist", caterer: "Caterer", band: "Band", venue: "Venue" };

  var VENDORS = [
    { id: "v1", name: "Wildbloom Atelier", cat: "florist", price: 3, rating: 4.9, reviews: 214, city: "Savannah, GA", blurb: "Garden-gathered arrangements with heirloom roses and trailing greenery.", tags: ["Bridal bouquets", "Arches", "Seasonal"], featured: 9 },
    { id: "v2", name: "The Gilded Fork", cat: "caterer", price: 4, rating: 4.8, reviews: 176, city: "Charleston, SC", blurb: "Farm-to-table plated dinners and grazing tables for intimate receptions.", tags: ["Plated", "Vegan menu", "Tastings"], featured: 8 },
    { id: "v3", name: "Velvet & Brass", cat: "band", price: 3, rating: 4.7, reviews: 132, city: "Nashville, TN", blurb: "Eight-piece soul and motown band that keeps the dance floor glowing.", tags: ["Live band", "DJ set", "First dance"], featured: 7 },
    { id: "v4", name: "Marigold Manor", cat: "venue", price: 4, rating: 4.9, reviews: 98, city: "Napa Valley, CA", blurb: "Restored vineyard estate with olive-grove ceremony lawn and stone barn.", tags: ["Outdoor", "150 guests", "On-site suites"], featured: 10 },
    { id: "v5", name: "Petal & Vine Co.", cat: "florist", price: 2, rating: 4.6, reviews: 143, city: "Austin, TX", blurb: "Wild, unstructured stems in dusty rose and soft cream palettes.", tags: ["Boutonnieres", "Centerpieces", "Dried florals"], featured: 6 },
    { id: "v6", name: "Saffron Table", cat: "caterer", price: 3, rating: 4.7, reviews: 121, city: "Portland, OR", blurb: "Globally inspired family-style feasts with a wood-fired dessert bar.", tags: ["Family style", "Gluten-free", "Late-night bites"], featured: 6 },
    { id: "v7", name: "Golden Hour Strings", cat: "band", price: 2, rating: 4.8, reviews: 87, city: "Asheville, NC", blurb: "Acoustic trio and string quartet for ceremonies and cocktail hours.", tags: ["Ceremony", "Acoustic", "Requests"], featured: 5 },
    { id: "v8", name: "The Ivory Conservatory", cat: "venue", price: 3, rating: 4.8, reviews: 64, city: "Portland, ME", blurb: "Glasshouse ballroom flooded with light and framed by climbing jasmine.", tags: ["Indoor", "90 guests", "Rain-ready"], featured: 5 },
    { id: "v9", name: "Fern & Firefly", cat: "florist", price: 4, rating: 5.0, reviews: 76, city: "Sonoma, CA", blurb: "Editorial installations, hanging cloud florals and candlelit tablescapes.", tags: ["Installations", "Luxe", "Candlelight"], featured: 9 },
    { id: "v10", name: "Copper Kettle Kitchen", cat: "caterer", price: 2, rating: 4.5, reviews: 158, city: "Denver, CO", blurb: "Comfort-forward buffets, wood-smoked mains and a build-your-own bar.", tags: ["Buffet", "BBQ", "Bar service"], featured: 4 },
    { id: "v11", name: "Midnight Marmalade", cat: "band", price: 4, rating: 4.9, reviews: 54, city: "New Orleans, LA", blurb: "Brass-led party band with a second-line parade to send you off.", tags: ["Brass", "Second line", "Horns"], featured: 7 },
    { id: "v12", name: "Lakeshore Pavilion", cat: "venue", price: 2, rating: 4.6, reviews: 112, city: "Lake Geneva, WI", blurb: "Waterfront timber pavilion with sunset ceremonies over the pier.", tags: ["Waterfront", "120 guests", "Sunset"], featured: 4 }
  ];

  var PRICE_TXT = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var searchEl = document.getElementById("search");
  var sortEl = document.getElementById("sort");
  var savedToggle = document.getElementById("savedToggle");
  var savedCountEl = document.getElementById("savedCount");
  var resultLine = document.getElementById("resultLine");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var toastWrap = document.getElementById("toastWrap");
  var clearAll = document.getElementById("clearAll");

  var state = { cat: "all", q: "", sort: "featured", savedOnly: false };
  var saved = {};

  function toast(msg, icon) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="ic">' + (icon || "✓") + "</span><span>" + msg + "</span>";
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  function stars(rating) {
    var full = Math.round(rating);
    var s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }

  function matches(v) {
    if (state.cat !== "all" && v.cat !== state.cat) return false;
    if (state.savedOnly && !saved[v.id]) return false;
    if (state.q) {
      var hay = (v.name + " " + v.city + " " + v.cat + " " + v.tags.join(" ")).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function sortList(list) {
    var arr = list.slice();
    switch (state.sort) {
      case "rating": arr.sort(function (a, b) { return b.rating - a.rating; }); break;
      case "price-asc": arr.sort(function (a, b) { return a.price - b.price || b.rating - a.rating; }); break;
      case "price-desc": arr.sort(function (a, b) { return b.price - a.price || b.rating - a.rating; }); break;
      default: arr.sort(function (a, b) { return b.featured - a.featured || b.rating - a.rating; });
    }
    return arr;
  }

  function card(v) {
    var el = document.createElement("article");
    el.className = "vendor";

    var isSaved = !!saved[v.id];
    el.innerHTML =
      '<div class="cover" style="background-image:' + GRADIENTS[v.cat] + '">' +
        '<span class="cat-badge">' + CAT_LABEL[v.cat] + "</span>" +
        '<span class="price-badge"><span>' + PRICE_TXT[v.price] + '</span><span class="dim">tier</span></span>' +
        '<button class="heart' + (isSaved ? " is-saved" : "") + '" aria-pressed="' + isSaved + '" aria-label="' + (isSaved ? "Remove " : "Save ") + v.name + '">' +
          '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.9-10-9.3C.2 8.3 1.7 4.5 5.2 4.5c2 0 3.3 1.1 4.1 2.3.7 1 .7 1 .7 1s0 0 .7-1c.8-1.2 2.1-2.3 4.1-2.3 3.5 0 5 3.8 3.2 7.2C19.5 16.1 12 21 12 21z"/></svg>' +
        "</button>" +
      "</div>" +
      '<div class="body">' +
        '<div class="vendor-top">' +
          "<h3>" + v.name + "</h3>" +
          '<span class="rating"><span class="star">' + stars(v.rating) + '</span>' + v.rating.toFixed(1) + ' <span class="rev">(' + v.reviews + ")</span></span>" +
        "</div>" +
        '<span class="loc"><svg viewBox="0 0 24 24"><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>' + v.city + "</span>" +
        '<p class="blurb">' + v.blurb + "</p>" +
        '<div class="tags">' + v.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("") + "</div>" +
        '<div class="actions">' +
          '<button class="btn-book" data-book>Book vendor</button>' +
        "</div>" +
      "</div>";

    var heart = el.querySelector(".heart");
    heart.addEventListener("click", function () {
      var nowSaved = !saved[v.id];
      saved[v.id] = nowSaved;
      heart.classList.toggle("is-saved", nowSaved);
      heart.setAttribute("aria-pressed", String(nowSaved));
      heart.setAttribute("aria-label", (nowSaved ? "Remove " : "Save ") + v.name);
      if (nowSaved) { heart.classList.add("pop"); setTimeout(function () { heart.classList.remove("pop"); }, 400); }
      updateSavedCount();
      toast(nowSaved ? "Saved " + v.name + " to favourites" : "Removed " + v.name, nowSaved ? "♥" : "✗");
      if (state.savedOnly) render();
    });

    var book = el.querySelector("[data-book]");
    book.addEventListener("click", function () {
      book.textContent = "Enquiry sent ✓";
      book.classList.add("booked");
      book.disabled = true;
      toast("Enquiry sent to " + v.name + " · they reply within 48h", "✉");
    });

    return el;
  }

  function updateSavedCount() {
    var n = Object.keys(saved).filter(function (k) { return saved[k]; }).length;
    savedCountEl.textContent = n;
  }

  function render() {
    var list = sortList(VENDORS.filter(matches));
    grid.innerHTML = "";
    if (!list.length) {
      grid.hidden = true;
      empty.hidden = false;
    } else {
      grid.hidden = false;
      empty.hidden = true;
      list.forEach(function (v, i) {
        var c = card(v);
        c.style.animationDelay = Math.min(i * 45, 360) + "ms";
        grid.appendChild(c);
      });
    }
    var total = VENDORS.length;
    resultLine.textContent = "Showing " + list.length + " of " + total + " vendors" +
      (state.cat !== "all" ? " · " + CAT_LABEL[state.cat] : "") +
      (state.savedOnly ? " · saved only" : "");
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-selected", "false"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      state.cat = chip.getAttribute("data-cat");
      render();
    });
  });

  var t;
  searchEl.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      state.q = searchEl.value.trim().toLowerCase();
      render();
    }, 120);
  });

  sortEl.addEventListener("change", function () {
    state.sort = sortEl.value;
    render();
  });

  savedToggle.addEventListener("click", function () {
    state.savedOnly = !state.savedOnly;
    savedToggle.setAttribute("aria-pressed", String(state.savedOnly));
    render();
  });

  clearAll.addEventListener("click", function () {
    state.cat = "all";
    state.q = "";
    state.savedOnly = false;
    searchEl.value = "";
    savedToggle.setAttribute("aria-pressed", "false");
    chips.forEach(function (c) {
      var on = c.getAttribute("data-cat") === "all";
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", String(on));
    });
    render();
  });

  updateSavedCount();
  render();
})();
