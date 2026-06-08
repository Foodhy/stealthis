(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.querySelector("[data-toast]");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 3200);
  }

  /* ---------- Photo data ---------- */
  var ORDER = ["living", "kitchen", "bedroom", "bath", "garden", "facade"];
  var LABELS = {
    living: "Living room · south light",
    kitchen: "Chef's kitchen",
    bedroom: "Primary suite",
    bath: "Spa bath",
    garden: "Walled garden",
    facade: "Front façade at dusk"
  };
  var current = "living";

  var mainPh = document.querySelector(".gallery__main .ph");
  var mainCaption = document.querySelector(".gallery__caption");
  var countEl = document.querySelector("[data-count]");
  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".thumb"));

  function setPhotoClass(el, key) {
    ORDER.forEach(function (k) {
      el.classList.remove("ph--" + k);
    });
    el.classList.add("ph--" + key);
  }

  function selectPhoto(key) {
    if (!LABELS[key]) return;
    current = key;
    setPhotoClass(mainPh, key);
    if (mainCaption) mainCaption.textContent = LABELS[key];
    if (countEl) countEl.textContent = (ORDER.indexOf(key) + 1) + " / " + ORDER.length;
    thumbs.forEach(function (t) {
      var active = t.getAttribute("data-thumb") === key;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (lbOpen) renderLightbox();
  }

  thumbs.forEach(function (t) {
    t.addEventListener("click", function () {
      selectPhoto(t.getAttribute("data-thumb"));
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.querySelector("[data-lb]");
  var lbImg = document.querySelector("[data-lb-img]");
  var lbCap = document.querySelector("[data-lb-cap]");
  var lbOpen = false;
  var lastFocus = null;

  function renderLightbox() {
    setPhotoClass(lbImg, current);
    lbCap.textContent = LABELS[current];
  }

  function openLightbox() {
    lastFocus = document.activeElement;
    renderLightbox();
    lb.hidden = false;
    lbOpen = true;
    document.body.style.overflow = "hidden";
    var closeBtn = lb.querySelector("[data-lb-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    lbOpen = false;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(dir) {
    var i = ORDER.indexOf(current);
    var next = (i + dir + ORDER.length) % ORDER.length;
    selectPhoto(ORDER[next]);
  }

  var mainBtn = document.querySelector("[data-lightbox]");
  if (mainBtn) mainBtn.addEventListener("click", openLightbox);
  var lbClose = document.querySelector("[data-lb-close]");
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  var lbPrev = document.querySelector("[data-lb-prev]");
  if (lbPrev) lbPrev.addEventListener("click", function () { step(-1); });
  var lbNext = document.querySelector("[data-lb-next]");
  if (lbNext) lbNext.addEventListener("click", function () { step(1); });
  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!lbOpen) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* ---------- Read more ---------- */
  var readBtn = document.querySelector("[data-readmore]");
  if (readBtn) {
    var moreP = document.querySelector(".block__more");
    readBtn.addEventListener("click", function () {
      var expanded = readBtn.getAttribute("aria-expanded") === "true";
      readBtn.setAttribute("aria-expanded", expanded ? "false" : "true");
      moreP.hidden = expanded;
      readBtn.textContent = expanded ? "Read more" : "Read less";
    });
  }

  /* ---------- Save / Share ---------- */
  var saveBtn = document.querySelector("[data-save]");
  if (saveBtn) {
    var saveLabel = saveBtn.querySelector("[data-save-label]");
    saveBtn.addEventListener("click", function () {
      var saved = saveBtn.getAttribute("aria-pressed") === "true";
      saveBtn.setAttribute("aria-pressed", saved ? "false" : "true");
      if (saveLabel) saveLabel.textContent = saved ? "Save" : "Saved";
      var heart = saveBtn.querySelector(".heart");
      if (heart) heart.textContent = saved ? "♡" : "♥";
      toast(saved ? "Removed from saved homes." : "Saved to your collection.");
    });
  }
  var shareBtn = document.querySelector("[data-share]");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      toast("Listing link copied to clipboard.");
    });
  }
  var callBtn = document.querySelector("[data-call]");
  if (callBtn) {
    callBtn.addEventListener("click", function () {
      toast("Calling Eleanor Vane · (555) 0142-880…");
    });
  }

  /* ---------- Payment estimate ---------- */
  var priceInput = document.getElementById("price");
  var downInput = document.getElementById("down");
  var rateInput = document.getElementById("rate");
  var termInput = document.getElementById("term");
  var monthlyEl = document.querySelector("[data-monthly]");
  var piEl = document.querySelector("[data-pi]");
  var taxEl = document.querySelector("[data-tax]");
  var downPctEl = document.querySelector("[data-downpct]");
  var downAmtEl = document.querySelector("[data-downamt]");
  var rateVEl = document.querySelector("[data-ratev]");

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function recalc() {
    var price = parseFloat(priceInput.value) || 0;
    var downPct = parseFloat(downInput.value) || 0;
    var rate = parseFloat(rateInput.value) || 0;
    var years = parseInt(termInput.value, 10) || 30;

    var downAmt = price * (downPct / 100);
    var loan = Math.max(price - downAmt, 0);
    var monthlyRate = rate / 100 / 12;
    var n = years * 12;

    var pi;
    if (monthlyRate === 0) {
      pi = loan / n;
    } else {
      var f = Math.pow(1 + monthlyRate, n);
      pi = loan * (monthlyRate * f) / (f - 1);
    }
    var tax = price * 0.0075 / 12;   // ~0.75% annual property tax
    var ins = price * 0.00169 / 12;  // illustrative insurance
    var total = pi + tax + ins;

    if (downPctEl) downPctEl.textContent = downPct + "%";
    if (downAmtEl) downAmtEl.textContent = money(downAmt) + " down";
    if (rateVEl) rateVEl.textContent = rate.toFixed(1) + "%";
    if (piEl) piEl.textContent = money(pi);
    if (taxEl) taxEl.textContent = money(tax);
    if (monthlyEl) monthlyEl.textContent = money(total);
  }

  [priceInput, downInput, rateInput, termInput].forEach(function (el) {
    if (el) el.addEventListener("input", recalc);
  });
  recalc();

  /* ---------- Tour form ---------- */
  var form = document.querySelector("[data-tour]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      if (!name.value.trim()) {
        name.focus();
        toast("Please add your name so Eleanor can reach you.");
        return;
      }
      if (!email.checkValidity() || !email.value.trim()) {
        email.focus();
        toast("Please enter a valid email address.");
        return;
      }
      var first = name.value.trim().split(" ")[0];
      toast("Thanks, " + first + "! Eleanor will confirm your tour shortly.");
      form.reset();
    });
  }
})();
