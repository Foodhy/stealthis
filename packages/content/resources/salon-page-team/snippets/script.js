(function () {
  "use strict";

  /* ---------- Data ---------- */
  var TEAM = [
    {
      name: "Aria Vance",
      role: "Creative Director",
      specs: ["Balayage", "Lived-in Color", "Editorial"],
      tagline: "Color should look like it was always yours.",
      rating: 4.9,
      reviews: 312,
      g: ["#b08d57", "#8c6d3f"]
    },
    {
      name: "Léo Marchand",
      role: "Master Barber",
      specs: ["Fades", "Beard Sculpt", "Hot Towel"],
      tagline: "Sharp lines, soft confidence.",
      rating: 4.8,
      reviews: 248,
      g: ["#3d362f", "#1c1814"]
    },
    {
      name: "Mireille Soto",
      role: "Senior Colorist",
      specs: ["Blonding", "Toning", "Gloss"],
      tagline: "I chase light through every strand.",
      rating: 5.0,
      reviews: 401,
      g: ["#c9a78f", "#b08d57"]
    },
    {
      name: "Dario Klein",
      role: "Texture Specialist",
      specs: ["Curls", "Perms", "Treatments"],
      tagline: "Your natural pattern, only better.",
      rating: 4.7,
      reviews: 176,
      g: ["#8c6d3f", "#c9a78f"]
    },
    {
      name: "Noémie Carr",
      role: "Bridal & Updos",
      specs: ["Updos", "Bridal", "Styling"],
      tagline: "For the days you will not forget.",
      rating: 4.9,
      reviews: 289,
      g: ["#c08a3e", "#8c6d3f"]
    },
    {
      name: "Theo Nakamura",
      role: "Precision Cutting",
      specs: ["Cuts", "Fringe", "Bobs"],
      tagline: "The cut is the architecture.",
      rating: 4.8,
      reviews: 221,
      g: ["#5f8a6b", "#3d362f"]
    },
    {
      name: "Ingrid Solène",
      role: "Color Correction",
      specs: ["Color Correction", "Blonding", "Treatments"],
      tagline: "There is no mistake I cannot rewrite.",
      rating: 5.0,
      reviews: 358,
      g: ["#b3503e", "#8c6d3f"]
    },
    {
      name: "Mateo Rivas",
      role: "Stylist & Barber",
      specs: ["Cuts", "Fades", "Styling"],
      tagline: "Walk in tired, walk out new.",
      rating: 4.7,
      reviews: 194,
      g: ["#1c1814", "#b08d57"]
    }
  ];

  /* ---------- Refs ---------- */
  var grid = document.getElementById("grid");
  var filtersEl = document.getElementById("filters");
  var searchEl = document.getElementById("search");
  var countEl = document.getElementById("count");
  var countLabel = document.getElementById("count-label");
  var emptyEl = document.getElementById("empty");
  var resetEl = document.getElementById("reset");
  var joinEl = document.getElementById("join");
  var toastWrap = document.getElementById("toast-wrap");

  var state = { spec: "All", query: "" };

  /* ---------- Toast ---------- */
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.innerHTML = '<span class="dot"></span><span></span>';
    t.lastChild.textContent = msg;
    toastWrap.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("show");
    });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () {
        t.remove();
      }, 320);
    }, 2600);
  }

  /* ---------- Helpers ---------- */
  function initials(name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(function (p) {
        return p.charAt(0);
      })
      .join("")
      .toUpperCase();
  }

  function starSvg(filled) {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" class="' +
      (filled ? "" : "star-empty") +
      '"><path fill="currentColor" d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.4l-5.8 3.05 1.1-6.47L2.6 9.35l6.5-.95L12 2.5z"/></svg>'
    );
  }

  function starsFor(rating) {
    var rounded = Math.round(rating);
    var out = "";
    for (var i = 1; i <= 5; i++) out += starSvg(i <= rounded);
    return out;
  }

  /* ---------- Build filter chips ---------- */
  function buildFilters() {
    var set = {};
    TEAM.forEach(function (m) {
      m.specs.forEach(function (s) {
        set[s] = true;
      });
    });
    var specs = ["All"].concat(Object.keys(set).sort());

    specs.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = s;
      b.setAttribute("aria-pressed", s === "All" ? "true" : "false");
      b.addEventListener("click", function () {
        state.spec = s;
        Array.prototype.forEach.call(filtersEl.children, function (c) {
          c.setAttribute("aria-pressed", c === b ? "true" : "false");
        });
        render();
      });
      filtersEl.appendChild(b);
    });
  }

  /* ---------- Render grid ---------- */
  function matches(m) {
    var bySpec = state.spec === "All" || m.specs.indexOf(state.spec) !== -1;
    var q = state.query.trim().toLowerCase();
    var byName =
      !q ||
      m.name.toLowerCase().indexOf(q) !== -1 ||
      m.role.toLowerCase().indexOf(q) !== -1;
    return bySpec && byName;
  }

  function makeCard(m) {
    var li = document.createElement("li");
    li.className = "card";

    var specChips = m.specs
      .map(function (s) {
        return '<span class="spec">' + s + "</span>";
      })
      .join("");

    li.innerHTML =
      '<div class="avatar" style="background:linear-gradient(135deg,' +
      m.g[0] +
      "," +
      m.g[1] +
      ')" aria-hidden="true">' +
      initials(m.name) +
      "</div>" +
      '<h3 class="name">' +
      m.name +
      "</h3>" +
      '<p class="role">' +
      m.role +
      "</p>" +
      '<div class="rating"><span class="stars" role="img" aria-label="' +
      m.rating +
      ' out of 5 stars">' +
      starsFor(m.rating) +
      "</span><span><b>" +
      m.rating.toFixed(1) +
      "</b> · " +
      m.reviews +
      " reviews</span></div>" +
      '<p class="tagline">&ldquo;' +
      m.tagline +
      "&rdquo;</p>" +
      '<div class="specs">' +
      specChips +
      "</div>" +
      '<div class="divider" aria-hidden="true"></div>' +
      '<button class="btn book" type="button">Book with ' +
      m.name.split(" ")[0] +
      "</button>";

    var book = li.querySelector(".book");
    book.addEventListener("click", function () {
      if (book.classList.contains("is-booked")) return;
      book.classList.add("is-booked");
      book.textContent = "Requested ✓";
      toast("Booking request sent to " + m.name + ".");
      setTimeout(function () {
        book.classList.remove("is-booked");
        book.textContent = "Book with " + m.name.split(" ")[0];
      }, 3200);
    });

    return li;
  }

  function render() {
    var list = TEAM.filter(matches);
    grid.innerHTML = "";
    list.forEach(function (m) {
      grid.appendChild(makeCard(m));
    });

    countEl.textContent = list.length;
    countLabel.textContent = list.length === 1 ? "artist" : "artists";

    var none = list.length === 0;
    emptyEl.hidden = !none;
    grid.hidden = none;
  }

  /* ---------- Events ---------- */
  var debounce;
  searchEl.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      state.query = searchEl.value;
      render();
    }, 120);
  });

  resetEl.addEventListener("click", function () {
    state.spec = "All";
    state.query = "";
    searchEl.value = "";
    Array.prototype.forEach.call(filtersEl.children, function (c, i) {
      c.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    });
    render();
    searchEl.focus();
  });

  joinEl.addEventListener("click", function () {
    toast("Thank you — our director will be in touch soon.");
  });

  /* ---------- Init ---------- */
  buildFilters();
  render();
})();
