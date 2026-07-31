/* FIXWELL — fictional repair-manual landing. Vanilla JS only. */
(function () {
  "use strict";

  /* ---------------- data ---------------- */
  var DEVICES = [
    { name: "Nimbus 12", cat: "Phone", abbr: "PH", score: 7, guides: 64 },
    { name: "Nimbus 12 Ultra", cat: "Phone", abbr: "PH", score: 5, guides: 41 },
    { name: "Nimbus 9 Mini", cat: "Phone", abbr: "PH", score: 8, guides: 52 },
    { name: "Corvid X3", cat: "Phone", abbr: "PH", score: 4, guides: 29 },
    { name: "Lumen Book Air", cat: "Laptop", abbr: "LT", score: 6, guides: 38 },
    { name: "Lumen Book Pro 16", cat: "Laptop", abbr: "LT", score: 3, guides: 47 },
    { name: "Fernpad 11", cat: "Tablet", abbr: "TB", score: 5, guides: 22 },
    { name: "Fernpad Studio", cat: "Tablet", abbr: "TB", score: 2, guides: 18 },
    { name: "Orbit Station 5", cat: "Console", abbr: "CS", score: 7, guides: 33 },
    { name: "Orbit Handheld", cat: "Console", abbr: "CS", score: 9, guides: 26 },
    { name: "Hearth 400 Washer", cat: "Appliance", abbr: "AP", score: 9, guides: 31 },
    { name: "Hearth Dishwasher D2", cat: "Appliance", abbr: "AP", score: 8, guides: 24 },
    { name: "Kettleworks Grinder", cat: "Appliance", abbr: "AP", score: 10, guides: 12 },
    { name: "Drift Pro Buds", cat: "Headphones", abbr: "HP", score: 2, guides: 15 },
    { name: "Drift Over-Ear 3", cat: "Headphones", abbr: "HP", score: 6, guides: 19 },
    { name: "Solstice Watch S2", cat: "Wearable", abbr: "WR", score: 3, guides: 11 }
  ];

  var FEATURED = [
    { name: "Nimbus 12", cat: "Phone", score: 7, guides: 64, fixes: "8,412", art: "phone" },
    { name: "Lumen Book Pro 16", cat: "Laptop", score: 3, guides: 47, fixes: "6,905", art: "laptop" },
    { name: "Hearth 400 Washer", cat: "Appliance", score: 9, guides: 31, fixes: "5,238", art: "washer" },
    { name: "Drift Pro Buds", cat: "Headphones", score: 2, guides: 15, fixes: "4,117", art: "buds" }
  ];

  var STEPS = [
    { t: "Power down & discharge", ico: "power" },
    { t: "Heat the rear adhesive", ico: "heat" },
    { t: "Lift with suction handle", ico: "suction" },
    { t: "Remove 4× T3 screws", ico: "screw" },
    { t: "Disconnect the battery", ico: "plug" },
    { t: "Pull adhesive tabs", ico: "tab" },
    { t: "Seat the new cell", ico: "battery" },
    { t: "Reconnect & test", ico: "plug" },
    { t: "Re-seal and calibrate", ico: "check" }
  ];

  var PRODUCTS = [
    { name: "Fixwell 64-Bit Driver Kit", sku: "FW-TK-064", price: "39.95", badge: "Best seller", art: "kit" },
    { name: "Nimbus 12 Battery + Adhesive", sku: "FW-BT-N12", price: "28.50", badge: "Genuine cell", art: "battery" },
    { name: "Anti-Static Spudger Set (6)", sku: "FW-SP-006", price: "11.20", badge: "Lifetime", art: "spudger" },
    { name: "Suction Handle Pro", sku: "FW-SH-002", price: "16.75", badge: "New", art: "suction" }
  ];

  /* ---------------- svg icons ---------------- */
  var S = function (d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + (extra || "") + "</svg>";
  };
  var ART = {
    phone: S('<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 5.5h4"/>'),
    laptop: S('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M1.5 19.5h21"/>'),
    washer: S('<rect x="4" y="2.5" width="16" height="19" rx="2"/><circle cx="12" cy="14" r="4.2"/><path d="M7.2 6h2.2"/>'),
    buds: S('<path d="M8 4a4 4 0 0 1 4 4v6a3 3 0 1 1-6 0V9"/><circle cx="17" cy="8" r="3.2"/><path d="M17 11.2V17a3 3 0 0 1-3 3"/>'),
    kit: S('<rect x="2.5" y="7.5" width="19" height="12" rx="2"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M2.5 13h19M11 13v2.5h2V13"/>'),
    battery: S('<rect x="2.5" y="7" width="16" height="10" rx="2"/><path d="M21.5 10.5v3M6 12h6"/>'),
    spudger: S('<path d="M3 20l9-9M12 11l6.5-6.5a2 2 0 0 1 3 2.6L15 14M12 11l3 3"/>'),
    suction: S('<path d="M4.5 9.5h15L17 15H7z"/><path d="M12 15v5M9.5 20h5M4.5 9.5a7.5 7.5 0 0 1 15 0"/>'),
    power: S('<path d="M12 3v9"/><path d="M6.5 6.8a8 8 0 1 0 11 0"/>'),
    heat: S('<path d="M12 3c3 3.5 1 5 2.5 7S18 13 18 15a6 6 0 0 1-12 0c0-2.5 2-4 3-6"/>'),
    screw: S('<circle cx="12" cy="12" r="8"/><path d="M9 9l6 6M15 9l-6 6"/>'),
    plug: S('<path d="M9 3v6M15 3v6M6 9h12v3a6 6 0 0 1-12 0zM12 18v3"/>'),
    tab: S('<path d="M4 8h13a3 3 0 0 1 0 6H7"/><path d="M7 11l-3 3 3 3"/>'),
    check: S('<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.3l2.6 2.6 4.8-5.3"/>')
  };

  /* ---------------- helpers ---------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var scoreClass = function (n) { return n >= 7 ? "good" : n >= 4 ? "mid" : "bad"; };

  var toastWrap = $("#toasts");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="dot"></span><span></span>';
    el.lastChild.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 260);
    }, 2400);
  }

  /* ---------------- header ---------------- */
  var hdr = $("#hdr");
  window.addEventListener("scroll", function () {
    hdr.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  var menuBtn = $("#menu-btn"), navM = $("#nav-m");
  menuBtn.addEventListener("click", function () {
    var open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    navM.classList.toggle("open", !open);
    navM.hidden = open;
  });
  navM.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      menuBtn.setAttribute("aria-expanded", "false");
      navM.classList.remove("open"); navM.hidden = true;
    }
  });

  /* ---------------- cart ---------------- */
  var cart = $("#cart"), cartN = $("#cart-n"), count = 0;
  function addToCart(name) {
    count++;
    cartN.textContent = String(count);
    cart.classList.add("has", "pop");
    cart.setAttribute("aria-label", "Cart, " + count + (count === 1 ? " item" : " items"));
    setTimeout(function () { cart.classList.remove("pop"); }, 360);
    toast("Added to cart — " + name);
  }
  cart.addEventListener("click", function () {
    toast(count ? count + " item(s) in your cart" : "Your cart is empty");
  });

  /* ---------------- search + suggestions ---------------- */
  var q = $("#q"), sugg = $("#sugg"), active = -1, current = [];

  function closeSugg() {
    sugg.hidden = true; sugg.innerHTML = ""; active = -1; current = [];
    q.setAttribute("aria-expanded", "false");
  }

  function highlight(name, term) {
    var i = name.toLowerCase().indexOf(term.toLowerCase());
    if (i < 0 || !term) return esc(name);
    return esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + term.length)) + "</mark>" + esc(name.slice(i + term.length));
  }

  function render(term) {
    var t = term.trim().toLowerCase();
    if (!t) { closeSugg(); return; }
    current = DEVICES.filter(function (d) {
      return d.name.toLowerCase().indexOf(t) > -1 || d.cat.toLowerCase().indexOf(t) > -1;
    }).slice(0, 7);

    if (!current.length) {
      sugg.innerHTML = '<li class="s-empty" role="option" aria-disabled="true">No device matches “' + esc(term) + '” — request a guide</li>';
    } else {
      sugg.innerHTML = current.map(function (d, i) {
        return '<li role="option" id="opt-' + i + '" aria-selected="false" data-i="' + i + '">' +
          '<span class="s-ico">' + d.abbr + "</span>" +
          "<span><span class=\"s-name\">" + highlight(d.name, term) + "</span><br>" +
          '<span class="s-sub">' + esc(d.cat) + " · " + d.guides + " guides</span></span>" +
          '<span class="s-score mono">' + d.score + "/10</span></li>";
      }).join("");
    }
    sugg.hidden = false;
    q.setAttribute("aria-expanded", "true");
    active = -1;
    q.removeAttribute("aria-activedescendant");
  }

  function setActive(i) {
    var items = sugg.querySelectorAll("li[data-i]");
    if (!items.length) return;
    if (active > -1 && items[active]) items[active].setAttribute("aria-selected", "false");
    active = (i + items.length) % items.length;
    items[active].setAttribute("aria-selected", "true");
    items[active].scrollIntoView({ block: "nearest" });
    q.setAttribute("aria-activedescendant", "opt-" + active);
  }

  function pick(i) {
    var d = current[i];
    if (!d) return;
    q.value = d.name;
    closeSugg();
    toast("Opening " + d.name + " — " + d.guides + " guides");
  }

  q.addEventListener("input", function () { render(q.value); });
  q.addEventListener("focus", function () { if (q.value.trim()) render(q.value); });
  q.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (sugg.hidden) render(q.value); else setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") {
      if (!sugg.hidden && active > -1) { e.preventDefault(); pick(active); }
      else { doSearch(); }
    } else if (e.key === "Escape") { closeSugg(); }
  });
  sugg.addEventListener("mousedown", function (e) {
    var li = e.target.closest("li[data-i]");
    if (li) { e.preventDefault(); pick(Number(li.dataset.i)); }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search")) closeSugg();
  });

  function doSearch() {
    var v = q.value.trim();
    closeSugg();
    toast(v ? 'Searching manuals for “' + v + '”' : "Type a device name to search");
  }
  $("#go").addEventListener("click", doSearch);

  Array.prototype.forEach.call(document.querySelectorAll(".chip-h"), function (c) {
    c.addEventListener("click", function () {
      q.value = c.textContent;
      q.focus();
      render(q.value);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== q && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); q.focus(); q.select();
    }
  });

  /* ---------------- render lists ---------------- */
  $("#devs").innerHTML = FEATURED.map(function (d) {
    return '<li class="dev reveal"><div class="dev-art">' + ART[d.art] + "</div>" +
      '<div class="dev-top"><span><span class="dev-name">' + esc(d.name) + '</span><br>' +
      '<span class="dev-cat">' + esc(d.cat) + "</span></span>" +
      '<span class="score ' + scoreClass(d.score) + '" title="Repairability ' + d.score + ' of 10">' + d.score + "</span></div>" +
      '<div class="dev-foot"><span><b>' + d.guides + "</b> guides · <b>" + d.fixes + "</b> fixes</span>" +
      '<span class="dev-go">Open &rarr;</span></div></li>';
  }).join("");

  $("#steps").innerHTML = STEPS.map(function (s, i) {
    return '<li class="step reveal" tabindex="0" role="button" data-step="' + (i + 1) + '">' +
      '<div class="step-thumb">' + ART[s.ico] + "</div>" +
      '<div class="step-n">STEP ' + String(i + 1).padStart(2, "0") + "</div>" +
      '<div class="step-t">' + esc(s.t) + "</div></li>";
  }).join("");

  $("#steps").addEventListener("click", function (e) {
    var st = e.target.closest(".step"); if (st) selectStep(st);
  });
  $("#steps").addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      var st = e.target.closest(".step");
      if (st) { e.preventDefault(); selectStep(st); }
    }
  });
  function selectStep(st) {
    Array.prototype.forEach.call($("#steps").children, function (c) { c.classList.remove("on"); });
    st.classList.add("on");
    toast("Step " + st.dataset.step + " of 9 — " + STEPS[st.dataset.step - 1].t);
  }

  $("#prods").innerHTML = PRODUCTS.map(function (p) {
    return '<li class="prod reveal"><div class="prod-art"><span class="prod-badge">' + esc(p.badge) + "</span>" +
      ART[p.art] + "</div>" +
      '<div class="prod-body"><span class="prod-name">' + esc(p.name) + "</span>" +
      '<span class="prod-sku">' + esc(p.sku) + "</span>" +
      '<div class="prod-foot"><span class="price">$' + p.price + "</span>" +
      '<button class="btn-add" type="button" data-name="' + esc(p.name) + '">Add to cart</button></div></div></li>';
  }).join("");

  $("#prods").addEventListener("click", function (e) {
    var b = e.target.closest(".btn-add");
    if (b) addToCart(b.dataset.name);
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-toast]"), function (b) {
    b.addEventListener("click", function () { toast(b.dataset.toast); });
  });

  /* ---------------- reveal + counters ---------------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function countUp(el) {
    var to = Number(el.dataset.to), sfx = el.dataset.suffix || "", dur = 1400, t0 = null;
    if (reduce) { el.textContent = to.toLocaleString("en-US") + sfx; return; }
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString("en-US") + sfx;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        if (en.target.classList.contains("stat-n")) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 55 + "ms";
      io.observe(el);
    });
    document.querySelectorAll(".stat-n").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll(".stat-n").forEach(countUp);
  }
})();
