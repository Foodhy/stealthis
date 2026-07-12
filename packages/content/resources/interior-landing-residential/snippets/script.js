(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ---------- Room explorer ---------- */
  var rooms = {
    living: {
      title: "The living room",
      chip: "Living",
      text: "A grounded, sociable space — deep seating around a low travertine table, layered wool underfoot, and warm dimmable light for the long evenings.",
      materials: ["Bouclé & wool", "Travertine", "Smoked oak"],
      img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=70"
    },
    kitchen: {
      title: "The kitchen",
      chip: "Kitchen",
      text: "The working heart of the home — olive cabinetry, honed stone counters and unlacquered brass that softens beautifully with everyday use.",
      materials: ["Olive oak", "Honed marble", "Unlacquered brass"],
      img: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=900&q=70"
    },
    bedroom: {
      title: "The bedroom",
      chip: "Bedroom",
      text: "A quiet retreat built around rest — lime-plaster walls, linen bedding and low, warm lighting for slow mornings and softer evenings.",
      materials: ["Lime plaster", "Washed linen", "Ash timber"],
      img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=70"
    },
    bath: {
      title: "The bathroom",
      chip: "Bath",
      text: "A spa-like calm in the everyday — tadelakt surfaces, aged brass fittings and a deep soaking tub set by a window of soft morning light.",
      materials: ["Tadelakt", "Aged brass", "Zellige tile"],
      img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=70"
    },
    studio: {
      title: "The home studio",
      chip: "Studio",
      text: "A focused, flexible room for making and thinking — a generous oak desk, open shelving in warm tones and daylight that lasts into the afternoon.",
      materials: ["White oak", "Cork board", "Cotton canvas"],
      img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=70"
    }
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".room-tab"));
  var roomPhoto = document.getElementById("roomPhoto");
  var roomChip = document.getElementById("roomChip");
  var roomTitle = document.getElementById("roomTitle");
  var roomText = document.getElementById("roomText");
  var roomMaterials = document.getElementById("roomMaterials");
  var panel = document.getElementById("panel-room");

  function setRoom(key) {
    var data = rooms[key];
    if (!data) return;
    // fade out
    roomPhoto.classList.add("fade-swap");
    setTimeout(function () {
      roomPhoto.style.backgroundImage =
        "linear-gradient(150deg, rgba(44,38,32,0.04), rgba(44,38,32,0.22)), url('" + data.img + "')";
      roomChip.textContent = data.chip;
      roomTitle.textContent = data.title;
      roomText.textContent = data.text;
      roomMaterials.innerHTML = "";
      data.materials.forEach(function (m) {
        var li = document.createElement("li");
        li.textContent = m;
        roomMaterials.appendChild(li);
      });
      roomPhoto.classList.remove("fade-swap");
    }, 220);
    if (panel) panel.setAttribute("aria-labelledby", "tab-" + key);
  }

  function activateTab(tab, focus) {
    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
    });
    setRoom(tab.getAttribute("data-room"));
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var idx = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") idx = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") idx = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") idx = 0;
      else if (e.key === "End") idx = tabs.length - 1;
      if (idx !== null) { e.preventDefault(); activateTab(tabs[idx], true); }
    });
  });
  // preload first room image styling
  setRoom("living");

  /* ---------- Testimonials carousel ---------- */
  var quotes = Array.prototype.slice.call(document.querySelectorAll(".quote"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".dot"));
  var qi = 0;
  var qTimer;

  function showQuote(n) {
    qi = (n + quotes.length) % quotes.length;
    quotes.forEach(function (q, i) { q.classList.toggle("is-active", i === qi); });
    dots.forEach(function (d, i) { d.classList.toggle("is-active", i === qi); });
  }
  function startQuotes() {
    clearInterval(qTimer);
    qTimer = setInterval(function () { showQuote(qi + 1); }, 5000);
  }
  dots.forEach(function (d) {
    d.addEventListener("click", function () {
      showQuote(parseInt(d.getAttribute("data-i"), 10));
      startQuotes();
    });
  });
  if (quotes.length) startQuotes();

  /* ---------- Live estimate ---------- */
  var sizeSel = document.getElementById("size");
  var scopeSel = document.getElementById("scope");
  var estValue = document.getElementById("estimateValue");
  var estNote = document.getElementById("estimateNote");

  var sizeFactor = { small: 0.7, medium: 1, large: 1.55 };
  var scopeBase = { room: 3200, multi: 6400, full: 8400 };
  var scopeLabel = { room: "Single room", multi: "Multiple rooms", full: "Full-home concept" };
  var sizeLabel = { small: "small home", medium: "medium home", large: "large home" };

  function fmt(n) { return "$" + Math.round(n / 100) * 100 + "".replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function money(n) {
    n = Math.round(n / 100) * 100;
    return "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function updateEstimate() {
    if (!estValue) return;
    var scope = scopeSel.value, size = sizeSel.value;
    var total = scopeBase[scope] * sizeFactor[size];
    estValue.textContent = money(total);
    estNote.textContent = scopeLabel[scope] + " · " + sizeLabel[size];
    estValue.style.color = "var(--clay-d)";
    setTimeout(function () { estValue.style.color = "var(--walnut)"; }, 260);
  }
  if (sizeSel) sizeSel.addEventListener("change", updateEstimate);
  if (scopeSel) scopeSel.addEventListener("change", updateEstimate);
  updateEstimate();

  /* ---------- Booking form validation ---------- */
  var form = document.getElementById("bookForm");
  function setError(field, msg) {
    var wrap = field.closest(".field");
    var err = form.querySelector('.err[data-for="' + field.id + '"]');
    if (wrap) wrap.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg || "";
    return !msg;
  }
  if (form) {
    var nameF = document.getElementById("name");
    var emailF = document.getElementById("email");
    [nameF, emailF].forEach(function (f) {
      f.addEventListener("input", function () {
        if (f.closest(".field").classList.contains("invalid")) validate(f);
      });
    });
    function validate(f) {
      if (f === nameF) {
        return setError(nameF, nameF.value.trim().length >= 2 ? "" : "Please enter your name.");
      }
      if (f === emailF) {
        var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailF.value.trim());
        return setError(emailF, ok ? "" : "Enter a valid email address.");
      }
      return true;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var okName = validate(nameF);
      var okEmail = validate(emailF);
      if (!okName || !okEmail) {
        (okName ? emailF : nameF).focus();
        toast("Please check the highlighted fields.");
        return;
      }
      var first = nameF.value.trim().split(" ")[0];
      form.reset();
      updateEstimate();
      toast("Thank you, " + first + " — we’ll be in touch within 2 days.");
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();
