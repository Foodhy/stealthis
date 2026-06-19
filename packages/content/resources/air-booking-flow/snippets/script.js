(function () {
  "use strict";

  var PAX = 2;
  var BASE_FARE = 389; // per passenger
  var TAXES = 94;       // per passenger
  var SEAT_LABELS = { standard: "14A", "extra-legroom": "11C", front: "3A" };

  // booking state
  var state = {
    step: 1,
    bags: 0,
    seat: "standard",
    meal: "none",
    insurance: false,
    lead: { first: "", last: "", email: "" }
  };

  var prices = {
    bags: 42,        // per bag
    seat: 0,
    meal: 0,         // per pax
    insurance: 29    // flat
  };

  // ---- helpers ----
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  var toastWrap = $("#toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(function () { el.remove(); }, 300);
    }, 2400);
  }

  // ---- totals ----
  function baseTotal() { return (BASE_FARE + TAXES) * PAX; }
  function extrasTotal() {
    return (
      state.bags * prices.bags +
      prices.seat * PAX +
      prices.meal * PAX +
      (state.insurance ? prices.insurance : 0)
    );
  }
  function grandTotal() { return baseTotal() + extrasTotal(); }

  function renderSummary() {
    var lines = [];
    lines.push({ label: "Fare <span class='tnum'></span>", value: money(BASE_FARE * PAX), sub: false, note: PAX + " × " + money(BASE_FARE) });
    lines.push({ label: "Taxes &amp; fees", value: money(TAXES * PAX) });
    if (state.bags > 0) lines.push({ label: "Checked bags (" + state.bags + ")", value: money(state.bags * prices.bags) });
    if (prices.seat > 0) lines.push({ label: "Seats × " + PAX, value: money(prices.seat * PAX) });
    if (prices.meal > 0) lines.push({ label: "Meals × " + PAX, value: money(prices.meal * PAX) });
    if (state.insurance) lines.push({ label: "Travel insurance", value: money(prices.insurance) });

    var ul = $("#sumLines");
    ul.innerHTML = lines.map(function (l) {
      var note = l.note ? " <small style='color:var(--muted);font-weight:500'>" + l.note + "</small>" : "";
      return "<li><span>" + l.label + note + "</span><b class='tnum'>" + l.value + "</b></li>";
    }).join("");

    var totalEl = $("#sumTotal");
    totalEl.textContent = money(grandTotal());
    totalEl.classList.remove("flash");
    void totalEl.offsetWidth;
    totalEl.classList.add("flash");
  }

  // ---- stepper UI ----
  var STEP_LABELS = {
    1: "Continue to extras",
    2: "Continue to payment",
    3: "Review booking",
    4: "Confirm &amp; pay " // total appended
  };

  function showStep(n) {
    state.step = n;
    $$(".pane").forEach(function (p) {
      p.classList.toggle("is-active", +p.getAttribute("data-pane") === n);
    });
    $$(".step").forEach(function (s) {
      var sn = +s.getAttribute("data-step");
      s.classList.toggle("is-active", sn === n);
      s.classList.toggle("is-done", sn < n);
    });

    var nav = $("#paneNav");
    var back = $("#backBtn");
    var next = $("#nextBtn");

    if (n === 5) { nav.style.display = "none"; return; }
    nav.style.display = "flex";
    back.hidden = n === 1;
    if (n === 4) {
      next.innerHTML = "Confirm &amp; pay " + money(grandTotal());
    } else {
      next.innerHTML = STEP_LABELS[n];
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- validation ----
  function setErr(input, msg) {
    var wrap = input.closest(".field");
    if (!wrap) return;
    var err = wrap.querySelector("[data-err]");
    input.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg || "";
  }

  function validatePassengers() {
    var form = $("#paxForm");
    var ok = true;
    var reqs = $$("input[required]", form);
    reqs.forEach(function (inp) {
      var v = inp.value.trim();
      if (!v) { setErr(inp, "Required"); ok = false; return; }
      if (inp.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        setErr(inp, "Enter a valid email"); ok = false; return;
      }
      setErr(inp, "");
    });
    if (ok) {
      state.lead.first = form.firstName.value.trim();
      state.lead.last = form.lastName.value.trim();
      state.lead.email = form.email.value.trim();
    }
    return ok;
  }

  function validatePayment() {
    var form = $("#payForm");
    var ok = true;
    setErr(form.cardName, form.cardName.value.trim() ? "" : "Required");
    if (!form.cardName.value.trim()) ok = false;

    var digits = form.cardNumber.value.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(digits)) { setErr(form.cardNumber, "Enter a valid card number"); ok = false; }
    else setErr(form.cardNumber, "");

    if (!/^\d{2}\/\d{2}$/.test(form.cardExp.value.trim())) { setErr(form.cardExp, "MM/YY"); ok = false; }
    else setErr(form.cardExp, "");

    if (!/^\d{3,4}$/.test(form.cardCvc.value.trim())) { setErr(form.cardCvc, "3–4 digits"); ok = false; }
    else setErr(form.cardCvc, "");

    if (!form.terms.checked) { setErr(form.terms, "Please accept to continue"); ok = false; }
    else setErr(form.terms, "");

    return ok;
  }

  // ---- review ----
  function renderReview() {
    var seatLabel = { standard: "Standard (auto)", "extra-legroom": "Extra legroom", front: "Front cabin" }[state.seat];
    var mealLabel = { none: "No meal", chicken: "Grilled chicken", vegan: "Vegan bowl" }[state.meal];
    var rows = [
      { head: true, dt: "Itinerary" },
      { dt: "Flight", dd: "Skyward SW 418" },
      { dt: "Route", dd: "JFK → LHR · nonstop" },
      { dt: "Departs", dd: "18 Jun · 19:40" },
      { head: true, dt: "Passengers" },
      { dt: "Lead", dd: (state.lead.first + " " + state.lead.last).trim() || "—" },
      { dt: "Contact", dd: state.lead.email || "—" },
      { head: true, dt: "Extras" },
      { dt: "Checked bags", dd: state.bags ? state.bags + " bag(s)" : "None" },
      { dt: "Seat", dd: seatLabel },
      { dt: "Meal", dd: mealLabel },
      { dt: "Insurance", dd: state.insurance ? "Yes — $29" : "No" },
      { head: true, dt: "Payment" },
      { dt: "Fare + taxes", dd: money(baseTotal()) },
      { dt: "Extras", dd: money(extrasTotal()) },
      { dt: "Total due", dd: money(grandTotal()) }
    ];
    $("#reviewBody").innerHTML = rows.map(function (r) {
      if (r.head) return "<div class='row head'><dt>" + r.dt + "</dt><dd></dd></div>";
      return "<div class='row'><dt>" + r.dt + "</dt><dd>" + r.dd + "</dd></div>";
    }).join("");
  }

  // ---- confirmation ----
  function genRef() {
    var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var r = "";
    for (var i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)];
    return r;
  }
  function confirmBooking() {
    var ref = genRef();
    $("#confRef").textContent = ref;
    $("#confEmail").textContent = state.lead.email || "you@email.com";
    $("#confPax").textContent = ((state.lead.first + " " + state.lead.last).trim() || "Guest").toUpperCase();
    $("#confSeat").textContent = SEAT_LABELS[state.seat];
    $("#confTotal").textContent = money(grandTotal());
    showStep(5);
    toast("Booking " + ref + " confirmed", "good");
  }

  // ---- wiring: extras ----
  // bags stepper
  var bagRow = $(".stepper-row[data-extra='bags']");
  var bagVal = $("[data-qval]", bagRow);
  function setBags(n) {
    state.bags = Math.max(0, Math.min(8, n));
    bagVal.textContent = state.bags;
    $(".qbtn[data-q='dec']", bagRow).disabled = state.bags === 0;
    renderSummary();
  }
  $(".qbtn[data-q='inc']", bagRow).addEventListener("click", function () { setBags(state.bags + 1); });
  $(".qbtn[data-q='dec']", bagRow).addEventListener("click", function () { setBags(state.bags - 1); });

  // option groups (seat, meal)
  $$(".opt-grid").forEach(function (grid) {
    var key = grid.getAttribute("data-extra"); // "seat" | "meal"
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".opt");
      if (!btn) return;
      $$(".opt", grid).forEach(function (o) { o.setAttribute("aria-checked", "false"); });
      btn.setAttribute("aria-checked", "true");
      state[key] = btn.getAttribute("data-val");
      prices[key] = parseFloat(btn.getAttribute("data-price")) || 0;
      renderSummary();
    });
    grid.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var opts = $$(".opt", grid);
      var i = opts.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var ni = e.key === "ArrowRight" ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length;
      opts[ni].focus();
      opts[ni].click();
    });
  });
  $$(".opt").forEach(function (o) { o.tabIndex = 0; });

  // insurance switch
  var insRow = $(".toggle-row[data-extra='insurance']");
  $(".switch", insRow).addEventListener("change", function (e) {
    state.insurance = e.target.checked;
    renderSummary();
    toast(e.target.checked ? "Travel insurance added" : "Insurance removed");
  });

  // same-contact checkbox feedback
  var sc = $("input[name='sameContact']");
  if (sc) sc.addEventListener("change", function (e) {
    toast(e.target.checked ? "Contact details shared" : "Add separate contact details");
  });

  // card formatting niceties
  var cardNum = $("#payForm [name='cardNumber']");
  cardNum.addEventListener("input", function () {
    var d = cardNum.value.replace(/\D/g, "").slice(0, 16);
    cardNum.value = d.replace(/(.{4})/g, "$1 ").trim();
  });
  var cardExp = $("#payForm [name='cardExp']");
  cardExp.addEventListener("input", function () {
    var d = cardExp.value.replace(/\D/g, "").slice(0, 4);
    cardExp.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  });

  // clear field error on input
  $$("#paxForm input, #payForm input").forEach(function (inp) {
    inp.addEventListener("input", function () { setErr(inp, ""); });
  });

  // ---- nav buttons ----
  $("#nextBtn").addEventListener("click", function () {
    var n = state.step;
    if (n === 1) {
      if (!validatePassengers()) { toast("Please complete passenger details", "bad"); return; }
      showStep(2);
    } else if (n === 2) {
      showStep(3);
    } else if (n === 3) {
      if (!validatePayment()) { toast("Check your payment details", "bad"); return; }
      renderReview();
      showStep(4);
    } else if (n === 4) {
      confirmBooking();
    }
  });
  $("#backBtn").addEventListener("click", function () {
    if (state.step > 1) showStep(state.step - 1);
  });

  // stepper clicks (only backward to completed steps)
  $$(".step").forEach(function (s) {
    s.addEventListener("click", function () {
      var n = +s.getAttribute("data-step");
      if (n < state.step) showStep(n);
    });
  });

  $("#restartBtn").addEventListener("click", function () {
    state = { step: 1, bags: 0, seat: "standard", meal: "none", insurance: false, lead: { first: "", last: "", email: "" } };
    prices = { bags: 42, seat: 0, meal: 0, insurance: 29 };
    $("#paxForm").reset();
    $("#payForm").reset();
    setBags(0);
    $$(".opt-grid").forEach(function (g) {
      $$(".opt", g).forEach(function (o, i) { o.setAttribute("aria-checked", i === 0 ? "true" : "false"); });
    });
    $(".switch", insRow).checked = false;
    renderSummary();
    showStep(1);
    toast("Started a new booking");
  });

  // ---- init ----
  setBags(0);
  renderSummary();
  showStep(1);
})();
