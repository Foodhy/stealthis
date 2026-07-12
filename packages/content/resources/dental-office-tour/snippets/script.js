(function () {
  "use strict";

  // Fictional but realistic tour data. Unsplash placeholder imagery.
  var ROOMS = [
    {
      area: "reception",
      label: "Reception",
      title: "Welcome Lounge",
      desc: "Step in to a bright, plant-filled lounge with warm lighting, a coffee bar, and comfy seating. Check-in takes under a minute.",
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=70",
    },
    {
      area: "reception",
      label: "Reception",
      title: "Family Waiting Area",
      desc: "A quiet corner with a kids' play nook, ceiling-mounted screens, and free Wi-Fi so the whole family stays relaxed.",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70",
    },
    {
      area: "operatory",
      label: "Operatory",
      title: "Operatory 1 — Comfort Suite",
      desc: "Reclining chair with memory foam, an overhead TV, noise-cancelling headphones, and a warm blanket on request.",
      img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=70",
    },
    {
      area: "operatory",
      label: "Operatory",
      title: "Operatory 2 — Digital Bay",
      desc: "Fitted with intraoral scanners and a chairside monitor so you can see exactly what we see, in real time.",
      img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=70",
    },
    {
      area: "operatory",
      label: "Operatory",
      title: "Hygiene Room",
      desc: "A calm space dedicated to cleanings and check-ups, with a garden-facing window and gentle ultrasonic tools.",
      img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=70",
    },
    {
      area: "lab",
      label: "Sterilization Lab",
      title: "Sterilization Center",
      desc: "Glass-walled and fully visible — every instrument is autoclaved and pouch-sealed on-site so you can watch our standards at work.",
      img: "https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?auto=format&fit=crop&w=1200&q=70",
    },
    {
      area: "lab",
      label: "Sterilization Lab",
      title: "Imaging &amp; X-Ray Suite",
      desc: "Low-dose digital radiography and 3D cone-beam imaging, shielded and calibrated for the clearest, safest scans.",
      img: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=1200&q=70",
    },
    {
      area: "consult",
      label: "Consult",
      title: "Consultation Room",
      desc: "A private, screen-side room where we walk through your treatment plan, answer questions, and talk options — no pressure.",
      img: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=70",
    },
  ];

  var AMENITIES = [
    { icon: "😌", mint: true, title: "Sedation options", note: "Nitrous & oral sedation for anxious visits." },
    { icon: "📺", mint: false, title: "Ceiling TVs", note: "Netflix & headphones in every operatory." },
    { icon: "🛋️", mint: false, title: "Warm blankets", note: "Cozy up during longer appointments." },
    { icon: "🧼", mint: true, title: "Open sterilization", note: "Glass-walled lab you can see into." },
    { icon: "♿", mint: false, title: "Step-free access", note: "Ramp entry & wide, accessible rooms." },
    { icon: "☕", mint: true, title: "Coffee & Wi-Fi", note: "Complimentary bar in the lounge." },
  ];

  var gallery = document.getElementById("gallery");
  var amWrap = document.getElementById("amenities");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  var lb = document.getElementById("lightbox");
  var lbImage = document.getElementById("lbImage");
  var lbBadge = document.getElementById("lbBadge");
  var lbTitle = document.getElementById("lbTitle");
  var lbDesc = document.getElementById("lbDesc");
  var lbCounter = document.getElementById("lbCounter");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");

  var currentFilter = "all";
  var visible = [];   // indices into ROOMS matching current filter
  var lbPos = 0;      // position within `visible`
  var lastFocused = null;

  function decode(html) {
    var t = document.createElement("textarea");
    t.innerHTML = html;
    return t.value;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Render gallery ---------- */
  function renderGallery() {
    gallery.innerHTML = "";
    visible = [];
    ROOMS.forEach(function (room, idx) {
      if (currentFilter !== "all" && room.area !== currentFilter) return;
      visible.push(idx);
      var pos = visible.length - 1;

      var card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.style.animationDelay = (pos * 0.05) + "s";
      card.setAttribute("aria-label", "Open " + decode(room.title) + " in tour viewer");
      card.innerHTML =
        '<div class="card-media">' +
          '<div class="ph" style="background-image:url(' + room.img + ')"></div>' +
          '<span class="badge">' + room.label + '</span>' +
          '<span class="card-zoom" aria-hidden="true">⤢</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + room.title + '</h3>' +
          '<p>' + room.desc.slice(0, 78) + (decode(room.desc).length > 78 ? '…' : '') + '</p>' +
        '</div>';
      card.addEventListener("click", function () { openLightbox(pos); });
      gallery.appendChild(card);
    });
  }

  /* ---------- Render amenities ---------- */
  function renderAmenities() {
    AMENITIES.forEach(function (a) {
      var li = document.createElement("li");
      li.className = "am-item" + (a.mint ? " mint" : "");
      li.innerHTML =
        '<span class="am-icon" aria-hidden="true">' + a.icon + '</span>' +
        '<span class="am-text"><strong>' + a.title + '</strong><span>' + a.note + '</span></span>';
      amWrap.appendChild(li);
    });
  }

  /* ---------- Filters ---------- */
  function updateCounts() {
    var counts = { all: ROOMS.length, reception: 0, operatory: 0, lab: 0, consult: 0 };
    ROOMS.forEach(function (r) { counts[r.area]++; });
    document.querySelectorAll(".count").forEach(function (el) {
      var key = el.getAttribute("data-count");
      el.textContent = counts[key];
    });
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      currentFilter = chip.getAttribute("data-filter");
      renderGallery();
    });
  });

  /* ---------- Lightbox ---------- */
  function paintLightbox() {
    var room = ROOMS[visible[lbPos]];
    lbImage.style.backgroundImage = "url(" + room.img + ")";
    lbBadge.textContent = room.label;
    lbTitle.innerHTML = room.title;
    lbDesc.innerHTML = room.desc;
    lbCounter.textContent = (lbPos + 1) + " / " + visible.length;
  }

  function openLightbox(pos) {
    if (!visible.length) return;
    lbPos = pos;
    lastFocused = document.activeElement;
    paintLightbox();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function step(delta) {
    if (!visible.length) return;
    lbPos = (lbPos + delta + visible.length) % visible.length;
    paintLightbox();
  }

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { step(-1); });
  lbNext.addEventListener("click", function () { step(1); });
  lb.querySelector(".lb-backdrop").addEventListener("click", closeLightbox);

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") { closeLightbox(); }
    else if (e.key === "ArrowLeft") { step(-1); }
    else if (e.key === "ArrowRight") { step(1); }
    else if (e.key === "Tab") {
      // Simple focus trap across the interactive controls.
      var focusables = [lbClose, lbPrev, lbNext];
      var i = focusables.indexOf(document.activeElement);
      if (i === -1) { e.preventDefault(); lbClose.focus(); return; }
      e.preventDefault();
      var dir = e.shiftKey ? -1 : 1;
      focusables[(i + dir + focusables.length) % focusables.length].focus();
    }
  });

  /* ---------- Header actions ---------- */
  document.getElementById("shareBtn").addEventListener("click", function () {
    var link = "https://brightleaf.dental/tour";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(
        function () { toast("Tour link copied to clipboard ✓"); },
        function () { toast("Tour link: " + link); }
      );
    } else {
      toast("Tour link: " + link);
    }
  });

  document.getElementById("requestBtn").addEventListener("click", function () {
    toast("Thanks! Our front desk will reach out to book your visit.");
  });

  /* ---------- Init ---------- */
  updateCounts();
  renderGallery();
  renderAmenities();
})();
