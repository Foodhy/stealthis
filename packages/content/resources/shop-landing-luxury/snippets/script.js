/* Maison Aurelle — luxury boutique landing
   Vanilla JS. No external libraries. Every interaction works. */
(function () {
  "use strict";

  var fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
  var money = function (n) { return fmt.format(n); };

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    primaryNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Active-section nav highlight ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".primary-nav a[href^='#']")
  );
  var sectionMap = navLinks
    .map(function (a) {
      var sec = document.querySelector(a.getAttribute("href"));
      return sec ? { link: a, sec: sec } : null;
    })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sectionMap.length) {
    var secIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          var item = sectionMap.find(function (m) { return m.sec === e.target; });
          if (item && e.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            item.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sectionMap.forEach(function (m) { secIo.observe(m.sec); });
  }

  /* ---------- Radiogroups: metal + size ---------- */
  function wireRadioGroup(selector, onChange) {
    var groups = document.querySelectorAll(selector);
    Array.prototype.forEach.call(groups, function (group) {
      var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
      function select(idx) {
        radios.forEach(function (r, i) {
          var on = i === idx;
          r.classList.toggle("is-on", on);
          r.setAttribute("aria-checked", String(on));
          r.tabIndex = on ? 0 : -1;
        });
        if (onChange) onChange(radios[idx]);
      }
      // init tabindex from current state
      var initial = radios.findIndex(function (r) { return r.classList.contains("is-on"); });
      if (initial < 0) initial = 0;
      select(initial);

      radios.forEach(function (r, i) {
        r.addEventListener("click", function () { select(i); });
        r.addEventListener("keydown", function (e) {
          var dir = 0;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") dir = 1;
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") dir = -1;
          else return;
          e.preventDefault();
          var next = (i + dir + radios.length) % radios.length;
          select(next);
          radios[next].focus();
        });
      });
    });
  }

  var selectedMetal = "Champagne gold";
  var selectedSize = "49";
  wireRadioGroup(".swatches", function (el) {
    selectedMetal = el.getAttribute("data-name") || el.textContent.trim();
  });
  wireRadioGroup(".sizes", function (el) {
    selectedSize = el.textContent.trim();
  });

  /* ---------- Private salon (cart) ---------- */
  var BASE_PIECE_PRICE = 48000;
  var cart = []; // { id, name, meta, price, art }

  var salon = document.getElementById("salon");
  var salonBody = document.getElementById("salonBody");
  var salonTotal = document.getElementById("salonTotal");
  var cartBtn = document.getElementById("cartBtn");
  var cartCount = document.getElementById("cartCount");
  var salonClose = document.getElementById("salonClose");
  var salonScrim = document.getElementById("salonScrim");
  var lastFocus = null;

  function ringArt() {
    return (
      '<svg viewBox="0 0 80 80" aria-hidden="true">' +
      '<ellipse cx="40" cy="56" rx="20" ry="17" fill="none" stroke="#caa54d" stroke-width="4"/>' +
      '<path d="M40 18 28 30 40 44 52 30Z" fill="#e6cf8f"/>' +
      "</svg>"
    );
  }

  function openSalon() {
    if (!salon) return;
    lastFocus = document.activeElement;
    salon.classList.add("open");
    salon.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (salonClose) salonClose.focus();
  }
  function closeSalon() {
    if (!salon) return;
    salon.classList.remove("open");
    salon.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function renderSalon() {
    if (!salonBody) return;
    if (!cart.length) {
      salonBody.innerHTML =
        '<div class="salon-empty"><span>✦</span>Your salon is empty.<br>Add a piece to begin a consultation.</div>';
    } else {
      salonBody.innerHTML = cart
        .map(function (item, i) {
          return (
            '<div class="salon-item">' +
            '<div class="salon-thumb">' + (item.art || ringArt()) + "</div>" +
            "<div>" +
            "<h3>" + item.name + "</h3>" +
            "<p>" + item.meta + "</p>" +
            '<button class="salon-remove" data-remove="' + i + '">Remove</button>' +
            "</div>" +
            '<div class="salon-item-price">' + money(item.price) + "</div>" +
            "</div>"
          );
        })
        .join("");
    }
    var total = cart.reduce(function (s, it) { return s + it.price; }, 0);
    if (salonTotal) salonTotal.textContent = money(total);

    if (cartCount) {
      cartCount.textContent = String(cart.length);
      cartCount.classList.toggle("show", cart.length > 0);
    }
    if (cartBtn) {
      cartBtn.setAttribute(
        "aria-label",
        "Open private salon, " + cart.length + (cart.length === 1 ? " item" : " items")
      );
    }
  }

  function addToCart(item) {
    cart.push(item);
    renderSalon();
  }

  if (salonBody) {
    salonBody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-remove]");
      if (!btn) return;
      var idx = parseInt(btn.getAttribute("data-remove"), 10);
      if (!isNaN(idx)) {
        var removed = cart.splice(idx, 1)[0];
        renderSalon();
        if (removed) toast(removed.name + " removed");
      }
    });
  }

  if (cartBtn) cartBtn.addEventListener("click", openSalon);
  if (salonClose) salonClose.addEventListener("click", closeSalon);
  if (salonScrim) salonScrim.addEventListener("click", closeSalon);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && salon && salon.classList.contains("open")) closeSalon();
  });

  var salonCheckout = document.getElementById("salonCheckout");
  if (salonCheckout) {
    salonCheckout.addEventListener("click", function () {
      if (!cart.length) {
        toast("Add a piece to begin");
        return;
      }
      toast("A salon director will be in touch");
      closeSalon();
    });
  }

  /* ---------- Reserve the hero piece ---------- */
  var reserveBtn = document.getElementById("reserveBtn");
  var priceVal = document.getElementById("priceVal");
  if (reserveBtn) {
    reserveBtn.addEventListener("click", function () {
      addToCart({
        name: "The Aurelle Solitaire",
        meta: selectedMetal + " · size " + selectedSize,
        price: BASE_PIECE_PRICE,
        art: ringArt(),
      });
      toast("Added to your private salon");
      openSalon();
    });
  }
  if (priceVal) priceVal.textContent = money(BASE_PIECE_PRICE);

  /* ---------- Collection (editorial) ---------- */
  var pieces = [
    { name: "Étoile Pendant", meta: "0.9ct · 18k champagne", price: 12400, tag: "1 of 1", tint: "linear-gradient(155deg,#fbf6ea,#efe3c6)" },
    { name: "Lueur Eternity Band", meta: "Pavé · 1.4ct total", price: 18900, tag: "Édition Hiver", tint: "linear-gradient(155deg,#f7efe2,#e7d6b0)" },
    { name: "Onde Drop Earrings", meta: "Briolette · rose gold", price: 9600, tag: "1 of 1", tint: "linear-gradient(155deg,#f9efe9,#ecd6c9)" },
    { name: "Sillage Cuff", meta: "Hand-engraved · noir", price: 21500, tag: "Retired soon", tint: "linear-gradient(155deg,#efece6,#d9d2c6)" },
    { name: "Aube Solitaire", meta: "1.6ct cushion", price: 32800, tag: "Édition Hiver", tint: "linear-gradient(155deg,#fbf6ea,#f0e2c2)" },
    { name: "Volute Tennis Bracelet", meta: "3.2ct line · champagne", price: 27400, tag: "1 of 1", tint: "linear-gradient(155deg,#f6f0e6,#e4d4ab)" },
  ];

  var miniArt = [
    '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 14 26 30 40 66 54 30Z" fill="#e6cf8f"/><path d="M26 30 54 30 40 14Z" fill="#fffaf0" opacity=".85"/><path d="M26 30 40 66 40 30Z" fill="#caa54d" opacity=".7"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="40" rx="26" ry="20" fill="none" stroke="#caa54d" stroke-width="6"/><circle cx="40" cy="20" r="5" fill="#e6cf8f"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="30" cy="26" r="8" fill="#e6cf8f"/><circle cx="50" cy="26" r="8" fill="#e6cf8f"/><path d="M30 34 30 56M50 34 50 56" stroke="#caa54d" stroke-width="3"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M18 30 Q40 20 62 30 L58 50 Q40 60 22 50Z" fill="none" stroke="#caa54d" stroke-width="4"/><circle cx="40" cy="40" r="4" fill="#e6cf8f"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="52" rx="18" ry="15" fill="none" stroke="#caa54d" stroke-width="5"/><path d="M40 16 30 30 40 42 50 30Z" fill="#e6cf8f"/></svg>',
    '<svg viewBox="0 0 80 80" aria-hidden="true"><g fill="#e6cf8f"><circle cx="24" cy="44" r="6"/><circle cx="40" cy="40" r="6"/><circle cx="56" cy="44" r="6"/></g><path d="M18 44 H62" stroke="#caa54d" stroke-width="2"/></svg>',
  ];

  var collGrid = document.getElementById("collGrid");
  if (collGrid) {
    collGrid.innerHTML = pieces
      .map(function (p, i) {
        return (
          '<article class="coll-card">' +
          '<div class="card-stage" style="background:' + p.tint + '">' +
          '<span class="card-tag">' + p.tag + "</span>" +
          (miniArt[i % miniArt.length]) +
          "</div>" +
          '<div class="card-body">' +
          '<h3 class="card-name">' + p.name + "</h3>" +
          '<p class="card-meta">' + p.meta + "</p>" +
          '<div class="card-foot">' +
          '<span class="card-price">' + money(p.price) + "</span>" +
          '<button class="card-add" data-add="' + i + '" aria-pressed="false">Add</button>' +
          "</div></div></article>"
        );
      })
      .join("");

    collGrid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add]");
      if (!btn) return;
      var idx = parseInt(btn.getAttribute("data-add"), 10);
      var p = pieces[idx];
      if (!p) return;
      var card = btn.closest(".coll-card");
      if (card) card.classList.add("is-saved");
      btn.textContent = "Saved";
      btn.setAttribute("aria-pressed", "true");
      addToCart({
        name: p.name,
        meta: p.meta,
        price: p.price,
        art: miniArt[idx % miniArt.length],
      });
      toast(p.name + " added to your salon");
    });
  }

  /* ---------- Atelier stat counters ---------- */
  var statEls = Array.prototype.slice.call(document.querySelectorAll(".craft-stats dt[data-to]"));
  var statsDone = false;
  function runStats() {
    if (statsDone) return;
    statsDone = true;
    statEls.forEach(function (el) {
      var to = parseInt(el.getAttribute("data-to"), 10) || 0;
      var start = null;
      var dur = 1400;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(to);
      }
      requestAnimationFrame(step);
    });
  }
  var atelier = document.getElementById("atelier");
  if (atelier && "IntersectionObserver" in window) {
    var statIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runStats(); statIo.disconnect(); }
        });
      },
      { threshold: 0.4 }
    );
    statIo.observe(atelier);
  } else {
    runStats();
  }

  /* ---------- Appointment form ---------- */
  var apptForm = document.getElementById("apptForm");
  var apptEmail = document.getElementById("apptEmail");
  var apptNote = document.getElementById("apptNote");
  if (apptForm && apptEmail && apptNote) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    apptForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = apptEmail.value.trim();
      if (!emailRe.test(val)) {
        apptEmail.classList.add("invalid");
        apptEmail.focus();
        apptNote.textContent = "Please enter a valid email address.";
        apptNote.classList.remove("ok");
        return;
      }
      apptEmail.classList.remove("invalid");
      apptEmail.value = "";
      apptNote.textContent = "Thank you — our salon director will write within two days.";
      apptNote.classList.add("ok");
      toast("Appointment requested");
    });
    apptEmail.addEventListener("input", function () {
      apptEmail.classList.remove("invalid");
    });
  }

  renderSalon();
})();
