/* ============================================================
   Travel — "Top 10 Places" Listicle
   Vanilla JS: ranked nav, scroll-spy, surprise-me, save, share.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Data: 10 fictional beaches, ranked 1 = best ---- */
  var BEACHES = [
    {
      id: "luma-cove",
      name: "Luma Cove",
      region: "Isla Verema, South Pacific",
      tag: "Editor's pick",
      best: "Snorkelling",
      when: "May–Sep",
      cost: 4,
      rating: 4.9,
      coords: "12.4°S · 168.1°W",
      blurb:
        "A horseshoe of pale gold sand wrapped around water so clear the reef looks painted on. Spinner dolphins patrol the mouth of the cove at dawn, and a single driftwood shack serves grilled mango and coconut espresso.",
      grad:
        "radial-gradient(120% 90% at 20% 10%, #fff3d6, transparent 50%), linear-gradient(170deg,#7fd4d0 0%,#39a7b0 42%,#1f6e7a 100%)",
    },
    {
      id: "ferrowind",
      name: "Ferrowind Strand",
      region: "Nordskär, North Atlantic",
      tag: "Dramatic coast",
      best: "Storm-watching",
      when: "Oct–Feb",
      cost: 2,
      rating: 4.7,
      coords: "64.9°N · 23.6°W",
      blurb:
        "Black volcanic sand meets white surf under skies that change five times an hour. Bring a flask — the wind here has opinions — and stay for basalt sea-stacks that glow rust-red at the late northern sunset.",
      grad:
        "linear-gradient(165deg,#2b3a4a 0%,#41617a 45%,#9fb4bf 100%), radial-gradient(80% 60% at 70% 20%, rgba(232,98,63,.4), transparent 60%)",
    },
    {
      id: "palmoro",
      name: "Palmoro Bay",
      region: "Costa Dorella, Mediterranean",
      tag: "Family favourite",
      best: "Families",
      when: "Jun–Aug",
      cost: 3,
      rating: 4.8,
      coords: "39.1°N · 3.2°E",
      blurb:
        "Shallow turquoise shelves run a hundred metres out, perfect for small swimmers, while a pine-shaded promenade keeps the gelato cold. Sunset paddleboard tours leave from the old stone jetty nightly.",
      grad:
        "radial-gradient(110% 80% at 15% 5%, #fff0c6, transparent 45%), linear-gradient(175deg,#86dcd0 0%,#4fb6c4 50%,#2f7fa6 100%)",
    },
    {
      id: "saffron-mile",
      name: "Saffron Mile",
      region: "Maravelle, Indian Ocean",
      tag: "Sunset legend",
      best: "Sunsets",
      when: "Nov–Apr",
      cost: 5,
      rating: 4.9,
      coords: "4.2°S · 73.4°E",
      blurb:
        "A mile of rose-tinted sand that turns molten amber at golden hour, fringed by overwater bungalows on stilts. Bioluminescent plankton light the shallows after dark — like swimming through quiet fireworks.",
      grad:
        "linear-gradient(175deg,#ffb27a 0%,#e8623f 35%,#a93f6a 70%,#5a3a78 100%)",
    },
    {
      id: "kelp-harbor",
      name: "Kelp Harbour",
      region: "Pacific Reach, California-North",
      tag: "Wildlife",
      best: "Sea otters",
      when: "Apr–Oct",
      cost: 2,
      rating: 4.6,
      coords: "36.6°N · 121.9°W",
      blurb:
        "Tide pools brim with anemones and the kelp forest just offshore hides a raft of dozing otters. A cliff-top trail links three coves; pack a thermos and you can beach-hop the whole afternoon.",
      grad:
        "linear-gradient(170deg,#2f6f63 0%,#4f9a86 45%,#bcd9c6 100%), radial-gradient(70% 50% at 80% 15%, rgba(255,232,168,.5), transparent 55%)",
    },
    {
      id: "azulita",
      name: "Azulita Lagoon",
      region: "Caya Blanca, Caribbean",
      tag: "Calm water",
      best: "Swimming",
      when: "Dec–May",
      cost: 4,
      rating: 4.8,
      coords: "18.3°N · 78.0°W",
      blurb:
        "A reef-protected lagoon the colour of a swimming-pool advert, with sand so fine it squeaks. Hammocks strung between sea-grape trees, a floating taco bar, and zero waves bigger than a ripple.",
      grad:
        "radial-gradient(100% 80% at 20% 10%, #fffbe4, transparent 40%), linear-gradient(175deg,#9ef0e4 0%,#46c7d6 45%,#2790c0 100%)",
    },
    {
      id: "dune-songs",
      name: "Dune Songs",
      region: "Erg Soleil, Atlantic Sahara",
      tag: "Surreal",
      best: "Photography",
      when: "Sep–Mar",
      cost: 3,
      rating: 4.5,
      coords: "23.7°N · 15.9°W",
      blurb:
        "Where amber dunes pour straight into a cold green ocean — surfers and camels share the same beach. The sand hums when the trade winds rise, and night skies here are a planetarium with no roof.",
      grad:
        "linear-gradient(170deg,#f2c879 0%,#e3a24f 30%,#2f8f9a 68%,#1d5e6e 100%)",
    },
    {
      id: "glasswater",
      name: "Glasswater Point",
      region: "Tairoa, South Island",
      tag: "Surf",
      best: "Surfing",
      when: "Mar–Jun",
      cost: 2,
      rating: 4.7,
      coords: "45.9°S · 170.6°E",
      blurb:
        "A right-hand point break that peels for two hundred metres on a good swell, with a steaming espresso van parked above the cliff. Penguins waddle ashore at dusk while the last surfers paddle in.",
      grad:
        "linear-gradient(170deg,#1f4f63 0%,#2d7d8c 45%,#7fc3c9 100%), radial-gradient(60% 50% at 75% 20%, rgba(255,243,214,.4), transparent 55%)",
    },
    {
      id: "rosé-reef",
      name: "Rosé Reef",
      region: "Sanguine Isles, Tasman Sea",
      tag: "Pink sand",
      best: "Romance",
      when: "Oct–Mar",
      cost: 5,
      rating: 4.8,
      coords: "29.0°S · 159.9°E",
      blurb:
        "Crushed coral tints this sand a soft blush that deepens at low tide. A single barefoot restaurant cooks the day's catch over driftwood, and the reef just beyond the break is a riot of clownfish.",
      grad:
        "radial-gradient(110% 80% at 20% 10%, #fff2ec, transparent 45%), linear-gradient(175deg,#f6c2c8 0%,#e88a98 40%,#5fb6bf 100%)",
    },
    {
      id: "lantern-bay",
      name: "Lantern Bay",
      region: "Hồ Quế, Andaman Coast",
      tag: "Nightlife",
      best: "Beach bars",
      when: "Nov–Apr",
      cost: 3,
      rating: 4.6,
      coords: "8.0°N · 98.3°E",
      blurb:
        "By day, longtail boats ferry you to limestone islands; by night, paper lanterns float over warm water and fire-dancers spin along the tideline. Crisp, cold and barefoot — the bay that never quite sleeps.",
      grad:
        "linear-gradient(175deg,#2a2150 0%,#5a3a78 35%,#d9772f 75%,#ffce7a 100%)",
    },
  ];

  /* ---- Helpers ---- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var listEl = $("#list");
  var navListEl = $("#ranknav-list");
  var progressBar = $("#progress-bar");
  var toastEl = $("#toast");
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  function priceTier(n) {
    var on = "", off = "";
    for (var i = 0; i < n; i++) on += "$";
    for (var j = 0; j < 5 - n; j++) off += "$";
    return (
      '<span class="price"><span class="price__on">' +
      on +
      '</span><span class="price__off">' +
      off +
      "</span></span>"
    );
  }

  function stars(rating) {
    var full = Math.round(rating);
    var s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }

  function esc(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---- Render entries + nav ---- */
  var entryEls = [];

  BEACHES.forEach(function (b, i) {
    var rank = i + 1;
    var entryId = "beach-" + rank;

    var article = document.createElement("article");
    article.className = "entry";
    article.id = entryId;
    article.dataset.rank = String(rank);
    article.setAttribute("aria-labelledby", entryId + "-name");

    article.innerHTML =
      '<div class="entry__hero" style="background:' + b.grad + ';">' +
        '<span class="entry__rank">' + rank + "</span>" +
        '<div class="entry__top">' +
          '<button class="entry__save" type="button" aria-pressed="false" ' +
            'aria-label="Add ' + esc(b.name) + ' to your trip" title="Add to trip">🤍</button>' +
        "</div>" +
      "</div>" +
      '<div class="entry__body">' +
        '<p class="entry__eyebrow">' + esc(b.tag) +
          ' <span class="entry__region">· ' + esc(b.region) + "</span></p>" +
        '<h2 class="entry__name" id="' + entryId + '-name">' + esc(b.name) + "</h2>" +
        '<p class="entry__rating"><span class="entry__stars" aria-hidden="true">' +
          stars(b.rating) + "</span> " +
          '<span>' + b.rating.toFixed(1) + " · traveller score</span></p>" +
        '<p class="entry__blurb">' + esc(b.blurb) + "</p>" +
        '<ul class="facts">' +
          '<li><div class="facts__k">Best for</div><div class="facts__v">' + esc(b.best) + "</div></li>" +
          '<li><div class="facts__k">When to go</div><div class="facts__v">' + esc(b.when) + "</div></li>" +
          '<li><div class="facts__k">Price tier</div><div class="facts__v">' + priceTier(b.cost) + "</div></li>" +
        "</ul>" +
        '<div class="entry__foot">' +
          '<button class="entry__map" type="button" data-map="' + esc(b.name) + '">' +
            '<span class="minimap" aria-hidden="true"></span>' +
            "<span>View on map</span>" +
            '<span class="entry__coords">' + esc(b.coords) + "</span>" +
          "</button>" +
          '<button class="btn btn--ghost" type="button" data-next="' + rank + '">Next ↓</button>' +
        "</div>" +
      "</div>";

    listEl.appendChild(article);
    entryEls.push(article);

    // nav item
    var li = document.createElement("li");
    var link = document.createElement("button");
    link.type = "button";
    link.className = "ranknav__link";
    link.dataset.target = entryId;
    link.innerHTML =
      '<span class="ranknav__num">' + rank + "</span>" +
      '<span class="ranknav__label">' + esc(b.name) + "</span>";
    li.appendChild(link);
    navListEl.appendChild(li);
  });

  var navLinks = Array.prototype.slice.call(navListEl.querySelectorAll(".ranknav__link"));

  /* ---- Active-state syncing ---- */
  function setActive(rank) {
    navLinks.forEach(function (l) {
      var on = l.dataset.target === "beach-" + rank;
      l.classList.toggle("is-active", on);
      if (on) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
    entryEls.forEach(function (e) {
      e.classList.toggle("is-active", e.dataset.rank === String(rank));
    });
    if (progressBar) {
      progressBar.style.width = (rank / BEACHES.length) * 100 + "%";
    }
  }

  function jumpTo(rank, flash) {
    var el = document.getElementById("beach-" + rank);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(rank);
    if (flash) {
      el.classList.remove("flash");
      void el.offsetWidth; // restart animation
      el.classList.add("flash");
    }
  }

  /* ---- Scroll-spy via IntersectionObserver ---- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        // choose the entry closest to the top that is intersecting
        var best = null;
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            if (!best || en.boundingClientRect.top < best.boundingClientRect.top) {
              best = en;
            }
          }
        });
        if (best) setActive(parseInt(best.target.dataset.rank, 10));
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: 0 }
    );
    entryEls.forEach(function (e) { io.observe(e); });
  }

  /* ---- Click handlers ---- */
  navListEl.addEventListener("click", function (e) {
    var link = e.target.closest(".ranknav__link");
    if (!link) return;
    var rank = parseInt(link.dataset.target.replace("beach-", ""), 10);
    jumpTo(rank, true);
  });

  // keyboard arrows within the nav
  navListEl.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    var idx = navLinks.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    var next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
    if (next < 0) next = navLinks.length - 1;
    if (next >= navLinks.length) next = 0;
    navLinks[next].focus();
  });

  listEl.addEventListener("click", function (e) {
    var save = e.target.closest(".entry__save");
    if (save) {
      var pressed = save.getAttribute("aria-pressed") === "true";
      save.setAttribute("aria-pressed", String(!pressed));
      save.textContent = pressed ? "🤍" : "❤️";
      var name = save.getAttribute("aria-label").replace(/^Add | to your trip$/g, "");
      toast(pressed ? "Removed " + name + " from your trip" : "Saved " + name + " to your trip");
      return;
    }

    var mapBtn = e.target.closest("[data-map]");
    if (mapBtn) {
      toast("📍 Opening map for " + mapBtn.dataset.map);
      return;
    }

    var nextBtn = e.target.closest("[data-next]");
    if (nextBtn) {
      var cur = parseInt(nextBtn.dataset.next, 10);
      var nxt = cur >= BEACHES.length ? 1 : cur + 1;
      jumpTo(nxt, true);
      return;
    }
  });

  /* ---- Masthead / footer actions ---- */
  document.body.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;

    if (action === "surprise") {
      var rank = Math.floor(Math.random() * BEACHES.length) + 1;
      jumpTo(rank, true);
      toast("🎲 You landed on #" + rank + " — " + BEACHES[rank - 1].name);
    } else if (action === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActive(1);
    } else if (action === "share") {
      var shareData = {
        title: "Top 10 Beaches on Earth",
        text: "The 10 shorelines worth crossing an ocean for.",
        url: location.href,
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(location.href)
          .then(function () { toast("🔗 Link copied to clipboard"); })
          .catch(function () { toast("Share: " + location.href); });
      } else {
        toast("Share: " + location.href);
      }
    }
  });

  // initialise
  setActive(1);
})();
