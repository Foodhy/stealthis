(function () {
  "use strict";

  /* ── Helpers ───────────────────────── */
  var money = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("is-show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
      setTimeout(function () { toastEl.hidden = true; }, 240);
    }, 2400);
  }

  /* product silhouettes (inline SVG) keyed by type */
  var ICONS = {
    headphones: '<svg viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0116 0v2" fill="none" stroke="#fff" stroke-width="1.7"/><rect x="3" y="13" width="4" height="7" rx="2" fill="#fff"/><rect x="17" y="13" width="4" height="7" rx="2" fill="#fff"/></svg>',
    mug: '<svg viewBox="0 0 24 24"><path d="M5 7h11v8a4 4 0 01-4 4H9a4 4 0 01-4-4z" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M16 9h2a2 2 0 010 4h-2" fill="none" stroke="#fff" stroke-width="1.7"/></svg>',
    shoe: '<svg viewBox="0 0 24 24"><path d="M3 16h13l4-2 1 4H3z" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 16l1-6 4 2 2-2 2 3" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    watch: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="3" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M9 7V4h6v3M9 17v3h6v-3M12 10v2.5l1.6 1" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
    lamp: '<svg viewBox="0 0 24 24"><path d="M8 4h8l3 6H5z" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 10v8M9 20h6" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>',
    bottle: '<svg viewBox="0 0 24 24"><path d="M10 3h4v3l1 2v11a2 2 0 01-2 2h-2a2 2 0 01-2-2V8l1-2z" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 12h6" stroke="#fff" stroke-width="1.7"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7z" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 016 0v2" fill="none" stroke="#fff" stroke-width="1.7"/></svg>',
    candle: '<svg viewBox="0 0 24 24"><rect x="8" y="9" width="8" height="11" rx="2" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M12 9V6m0 0c1.4-1.2 1.4-2.5 0-4-1.4 1.5-1.4 2.8 0 4z" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>'
  };
  var TINTS = {
    headphones: "#3457ff", mug: "#e0245e", shoe: "#1f9d55", watch: "#7b5cff",
    lamp: "#c2710c", bottle: "#0d9488", bag: "#db2777", candle: "#a16207"
  };
  function tile(type, size) {
    var t = TINTS[type] || "#3457ff";
    return '<span class="thumb" style="background:linear-gradient(135deg,' + t + ',' + shade(t) + ')">' + (ICONS[type] || ICONS.bag) + "</span>";
  }
  function shade(hex) {
    // simple lighten by mixing toward a violet
    return "color-mix(in srgb," + hex + " 70%, #7b5cff)";
  }

  /* ── Data (fictional) ───────────────── */
  var ORDERS = [
    {
      id: "NMB-48207", placed: "Jun 9, 2026", status: "transit", statusLabel: "In transit",
      eta: "Arrives Jun 16", carrier: "NimbusExpress", track: "1Z-NX-77 4109 220",
      items: [
        { type: "headphones", name: "Aurora Wireless Headphones", qty: 1, price: 149.0 },
        { type: "bottle", name: "Glacier Insulated Bottle 24oz", qty: 2, price: 28.0 }
      ],
      ship: 0, address: "Jordan Reyes · 88 Larkspur Ln, Apt 12, Portland, OR 97204"
    },
    {
      id: "NMB-47913", placed: "May 28, 2026", status: "delivered", statusLabel: "Delivered",
      eta: "Delivered Jun 2", carrier: "NimbusExpress", track: "1Z-NX-77 3998 014",
      items: [
        { type: "shoe", name: "Trailwind Runner — Slate", qty: 1, price: 118.0 },
        { type: "watch", name: "Pulse Field Watch", qty: 1, price: 189.0 }
      ],
      ship: 0, address: "Jordan Reyes · 88 Larkspur Ln, Apt 12, Portland, OR 97204"
    },
    {
      id: "NMB-47640", placed: "May 14, 2026", status: "delivered", statusLabel: "Delivered",
      eta: "Delivered May 18", carrier: "PostNimbus", track: "PN-77 5521 882",
      items: [
        { type: "lamp", name: "Halo Desk Lamp — Brass", qty: 1, price: 96.0 },
        { type: "candle", name: "Member Cedar Candle", qty: 3, price: 22.0 },
        { type: "mug", name: "Stoneware Mug Set (4)", qty: 1, price: 44.0 }
      ],
      ship: 5.99, address: "Jordan Reyes · 200 Office Park Rd, Suite 9, Portland, OR 97209"
    },
    {
      id: "NMB-47102", placed: "Apr 30, 2026", status: "processing", statusLabel: "Processing",
      eta: "Ships within 2 days", carrier: "—", track: "Pending",
      items: [
        { type: "bag", name: "Daybreak Weekender Bag", qty: 1, price: 168.0 }
      ],
      ship: 0, address: "Jordan Reyes · 88 Larkspur Ln, Apt 12, Portland, OR 97204"
    }
  ];

  var addresses = [
    { id: "a1", label: "Home", recipient: "Jordan Reyes", line: "88 Larkspur Ln, Apt 12", city: "Portland, OR", zip: "97204", default: true },
    { id: "a2", label: "Office", recipient: "Jordan Reyes", line: "200 Office Park Rd, Suite 9", city: "Portland, OR", zip: "97209", default: false }
  ];

  var RETURNS = [
    { type: "watch", name: "Pulse Field Watch", order: "NMB-47913", status: "transit", statusLabel: "Refund in transit" },
    { type: "mug", name: "Stoneware Mug Set (4)", order: "NMB-47640", status: "delivered", statusLabel: "Refunded $44.00" }
  ];

  /* ── Section switching ──────────────── */
  var navlinks = Array.prototype.slice.call(document.querySelectorAll(".navlink"));
  var panels = {
    orders: document.getElementById("panel-orders"),
    addresses: document.getElementById("panel-addresses"),
    payment: document.getElementById("panel-payment"),
    returns: document.getElementById("panel-returns"),
    profile: document.getElementById("panel-profile")
  };
  function showSection(name) {
    navlinks.forEach(function (b) {
      var on = b.dataset.section === name;
      b.classList.toggle("is-active", on);
      if (on) { b.setAttribute("aria-current", "page"); } else { b.removeAttribute("aria-current"); }
    });
    Object.keys(panels).forEach(function (k) {
      var p = panels[k];
      if (!p) return;
      var on = k === name;
      p.hidden = !on;
      p.classList.toggle("is-active", on);
    });
  }
  navlinks.forEach(function (b) {
    b.addEventListener("click", function () { showSection(b.dataset.section); });
  });

  /* ── Orders render + filter ─────────── */
  var ordersList = document.getElementById("ordersList");
  var ordersEmpty = document.getElementById("ordersEmpty");
  var activeFilter = "all";

  function renderOrders() {
    var rows = ORDERS.filter(function (o) {
      return activeFilter === "all" || o.status === activeFilter;
    });
    ordersEmpty.hidden = rows.length > 0;
    ordersList.innerHTML = rows.map(function (o) {
      var total = o.items.reduce(function (s, i) { return s + i.price * i.qty; }, 0) + o.ship;
      var count = o.items.reduce(function (s, i) { return s + i.qty; }, 0);
      var thumbs = o.items.slice(0, 3).map(function (i) { return tile(i.type); }).join("");
      if (o.items.length > 3) {
        thumbs += '<span class="thumb thumb--more">+' + (o.items.length - 3) + "</span>";
      }
      var secondAction = o.status === "delivered"
        ? '<button class="btn btn--ghost btn--sm" data-reorder="' + o.id + '">Reorder</button>'
        : '<button class="btn btn--ghost btn--sm" data-track="' + o.id + '">Track</button>';
      return (
        '<li class="order">' +
          '<div class="order__top">' +
            '<dl class="order__meta"><dt>Order</dt><dd>#' + esc(o.id) + "</dd></dl>" +
            '<dl class="order__meta"><dt>Placed</dt><dd>' + esc(o.placed) + "</dd></dl>" +
            '<dl class="order__meta"><dt>Total</dt><dd>' + money(total) + "</dd></dl>" +
            '<span class="order__status"><span class="badge badge--' + o.status + '">' + esc(o.statusLabel) + "</span></span>" +
          "</div>" +
          '<div class="order__body">' +
            '<div class="thumbs">' + thumbs + "</div>" +
            '<div class="order__summary">' +
              '<p class="order__items">' + count + (count === 1 ? " item" : " items") + " · " + esc(o.eta) + "</p>" +
              '<p class="order__total">Total <b>' + money(total) + "</b></p>" +
            "</div>" +
            '<div class="order__actions">' +
              secondAction +
              '<button class="btn btn--brand btn--sm" data-detail="' + o.id + '">View details</button>' +
            "</div>" +
          "</div>" +
        "</li>"
      );
    }).join("");
  }

  document.querySelectorAll(".seg__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".seg__btn").forEach(function (x) {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      activeFilter = b.dataset.filter;
      renderOrders();
    });
  });

  ordersList.addEventListener("click", function (e) {
    var d = e.target.closest("[data-detail]");
    var r = e.target.closest("[data-reorder]");
    var t = e.target.closest("[data-track]");
    if (d) openOrder(d.getAttribute("data-detail"));
    else if (r) { toast("Items added to your cart — ready to reorder."); }
    else if (t) { openOrder(t.getAttribute("data-track")); }
  });

  /* ── Order drawer ───────────────────── */
  var drawer = document.getElementById("orderDrawer");
  var drawerPanel = drawer.querySelector(".drawer__panel");
  var drawerBody = document.getElementById("drawerBody");
  var drawerTitle = document.getElementById("drawerTitle");
  var lastTrigger = null;

  function trackSteps(status) {
    var stages = [
      { key: "ordered", label: "Order placed", when: "Confirmed" },
      { key: "processing", label: "Processing", when: "Packed at warehouse" },
      { key: "transit", label: "In transit", when: "On the way" },
      { key: "delivered", label: "Delivered", when: "Left at front door" }
    ];
    var order = ["processing", "transit", "delivered"];
    var idx = status === "delivered" ? 3 : status === "transit" ? 2 : 1; // current stage index
    return stages.map(function (s, i) {
      var cls = i < idx ? "is-done" : i === idx ? "is-current" : "";
      var check = i < idx ? '<svg viewBox="0 0 24 24"><path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' : "";
      return (
        '<div class="track__step ' + cls + '">' +
          '<span class="track__dot">' + check + "</span>" +
          '<span class="track__txt"><span class="track__label">' + s.label + '</span><br><span class="track__when">' + s.when + "</span></span>" +
        "</div>"
      );
    }).join("");
  }

  function openOrder(id) {
    var o = ORDERS.filter(function (x) { return x.id === id; })[0];
    if (!o) return;
    lastTrigger = document.activeElement;
    drawerTitle.textContent = "#" + o.id;
    var sub = o.items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    var lines = o.items.map(function (i) {
      return (
        '<div class="dline">' +
          tile(i.type) +
          '<div><p class="dline__name">' + esc(i.name) + '</p><p class="dline__qty">Qty ' + i.qty + " · " + money(i.price) + " each</p></div>" +
          '<span class="dline__price">' + money(i.price * i.qty) + "</span>" +
        "</div>"
      );
    }).join("");
    drawerBody.innerHTML =
      '<p style="font-weight:700;margin-bottom:4px">' + esc(o.statusLabel) + " · " + esc(o.eta) + "</p>" +
      '<div class="track">' + trackSteps(o.status) + "</div>" +
      '<p style="font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:4px">Items</p>' +
      lines +
      '<div class="drawer__totals">' +
        '<div class="drawer__row"><span>Subtotal</span><span>' + money(sub) + "</span></div>" +
        '<div class="drawer__row"><span>Shipping</span><span>' + (o.ship ? money(o.ship) : "Free") + "</span></div>" +
        '<div class="drawer__row drawer__row--grand"><span>Total</span><span>' + money(sub + o.ship) + "</span></div>" +
      "</div>" +
      '<div class="drawer__ship"><b>Carrier:</b> ' + esc(o.carrier) + ' &nbsp;·&nbsp; <b>Tracking:</b> ' + esc(o.track) + "<br><b>Ship to:</b> " + esc(o.address) + "</div>";
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { drawerPanel.focus(); }, 60);
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }
  drawer.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeDrawer);
  });

  /* ── Addresses ──────────────────────── */
  var addrGrid = document.getElementById("addrGrid");
  function renderAddresses() {
    addrGrid.innerHTML = addresses.map(function (a) {
      return (
        '<article class="addr' + (a.default ? " is-default" : "") + '">' +
          '<div class="addr__top"><span class="addr__label">' + esc(a.label) + "</span>" +
            (a.default ? '<span class="addr__chip">Default</span>' : "") + "</div>" +
          '<p>' + esc(a.recipient) + "</p>" +
          '<p class="addr__line">' + esc(a.line) + "</p>" +
          '<p class="addr__line">' + esc(a.city) + " " + esc(a.zip) + "</p>" +
          '<div class="addr__actions">' +
            '<button class="linkbtn" data-edit="' + a.id + '">Edit</button>' +
            '<button class="linkbtn" data-default="' + a.id + '"' + (a.default ? " disabled" : "") + ">Set default</button>" +
            '<button class="linkbtn linkbtn--danger" data-remove="' + a.id + '">Remove</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");
  }
  addrGrid.addEventListener("click", function (e) {
    var ed = e.target.closest("[data-edit]");
    var df = e.target.closest("[data-default]");
    var rm = e.target.closest("[data-remove]");
    if (ed) openAddrModal(ed.getAttribute("data-edit"));
    else if (df) {
      var id = df.getAttribute("data-default");
      addresses.forEach(function (a) { a.default = a.id === id; });
      renderAddresses();
      toast("Default address updated.");
    } else if (rm) {
      var rid = rm.getAttribute("data-remove");
      var target = addresses.filter(function (a) { return a.id === rid; })[0];
      addresses = addresses.filter(function (a) { return a.id !== rid; });
      if (target && target.default && addresses.length) addresses[0].default = true;
      renderAddresses();
      toast("Address removed.");
    }
  });

  /* ── Address modal ──────────────────── */
  var addrModal = document.getElementById("addrModal");
  var addrForm = document.getElementById("addrForm");
  var addrModalTitle = document.getElementById("addrModalTitle");
  var modalTrigger = null;
  function openAddrModal(id) {
    modalTrigger = document.activeElement;
    addrForm.reset();
    if (id) {
      var a = addresses.filter(function (x) { return x.id === id; })[0];
      if (!a) return;
      addrModalTitle.textContent = "Edit address";
      addrForm.id.value = a.id;
      addrForm.label.value = a.label;
      addrForm.recipient.value = a.recipient;
      addrForm.line.value = a.line;
      addrForm.city.value = a.city;
      addrForm.zip.value = a.zip;
      addrForm.default.checked = a.default;
    } else {
      addrModalTitle.textContent = "Add address";
      addrForm.id.value = "";
    }
    addrModal.classList.add("is-open");
    addrModal.setAttribute("aria-hidden", "false");
    setTimeout(function () { addrForm.label.focus(); }, 60);
  }
  function closeAddrModal() {
    addrModal.classList.remove("is-open");
    addrModal.setAttribute("aria-hidden", "true");
    if (modalTrigger && modalTrigger.focus) modalTrigger.focus();
  }
  document.getElementById("addAddressBtn").addEventListener("click", function () { openAddrModal(null); });
  addrModal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeAddrModal);
  });
  addrForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!addrForm.checkValidity()) { addrForm.reportValidity(); return; }
    var data = {
      id: addrForm.id.value || "a" + Date.now(),
      label: addrForm.label.value.trim(),
      recipient: addrForm.recipient.value.trim(),
      line: addrForm.line.value.trim(),
      city: addrForm.city.value.trim(),
      zip: addrForm.zip.value.trim(),
      default: addrForm.default.checked
    };
    var existing = addresses.filter(function (a) { return a.id === data.id; })[0];
    if (data.default) addresses.forEach(function (a) { a.default = false; });
    if (existing) {
      Object.keys(data).forEach(function (k) { existing[k] = data[k]; });
    } else {
      if (!addresses.length) data.default = true;
      addresses.push(data);
    }
    renderAddresses();
    closeAddrModal();
    toast(existing ? "Address updated." : "Address added.");
  });

  /* ── Add card (demo) ────────────────── */
  document.getElementById("addCardBtn").addEventListener("click", function () {
    toast("Opening secure card form…");
  });
  document.getElementById("logoutBtn").addEventListener("click", function () {
    toast("Signing out…");
  });

  /* ── Returns ────────────────────────── */
  var returnsList = document.getElementById("returnsList");
  returnsList.innerHTML = RETURNS.map(function (r) {
    var t = TINTS[r.type] || "#3457ff";
    return (
      '<li class="return">' +
        '<span class="return__thumb" style="background:linear-gradient(135deg,' + t + "," + shade(t) + ')">' + (ICONS[r.type] || ICONS.bag) + "</span>" +
        '<div class="return__info"><p class="return__name">' + esc(r.name) + '</p><p class="return__sub">From order #' + esc(r.order) + "</p></div>" +
        '<span class="return__status badge badge--' + r.status + '">' + esc(r.statusLabel) + "</span>" +
      "</li>"
    );
  }).join("");

  /* ── Profile form ───────────────────── */
  var profileForm = document.getElementById("profileForm");
  var emailInput = document.getElementById("pf-email");
  var emailErr = document.getElementById("err-email");
  var sideName = document.getElementById("sideName");
  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    if (!emailOk) {
      emailErr.hidden = false;
      emailInput.setAttribute("aria-invalid", "true");
      emailInput.focus();
      return;
    }
    emailErr.hidden = true;
    emailInput.removeAttribute("aria-invalid");
    var name = profileForm.name.value.trim();
    if (name) sideName.textContent = name;
    toast("Profile saved.");
  });
  emailInput.addEventListener("input", function () {
    if (emailErr.hidden) return;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      emailErr.hidden = true;
      emailInput.removeAttribute("aria-invalid");
    }
  });

  /* ── Global key handling + focus trap ─ */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (addrModal.classList.contains("is-open")) closeAddrModal();
      else if (drawer.classList.contains("is-open")) closeDrawer();
    }
    if (e.key === "Tab") {
      var openLayer = addrModal.classList.contains("is-open")
        ? addrModal.querySelector(".modal__panel")
        : drawer.classList.contains("is-open") ? drawerPanel : null;
      if (!openLayer) return;
      var foci = openLayer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!foci.length) return;
      var first = foci[0], last = foci[foci.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ── Init ───────────────────────────── */
  renderOrders();
  renderAddresses();
})();
