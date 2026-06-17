(function () {
  "use strict";

  // ---- state ----
  var state = {
    amount: 50,
    freq: "once",
    designation: "Where needed most",
    coverFees: true,
    anon: false,
    fname: "",
    lname: "",
    email: "",
    step: 1,
  };

  var FEE_RATE = 0.029;
  var FEE_FLAT = 0.3;

  // ---- helpers ----
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  function fee() {
    return state.amount > 0 ? state.amount * FEE_RATE + FEE_FLAT : 0;
  }
  function total() {
    return state.amount + (state.coverFees ? fee() : 0);
  }
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // impact equivalence — meals at 38¢ each, plus a flavor line
  function impact() {
    var meals = Math.max(1, Math.round(state.amount / 2.5));
    var line, emoji, when;
    if (state.amount >= 250) {
      emoji = "🚛";
      line = "Stocks an entire pantry shelf";
      when = "and delivers " + meals + " meals across the county.";
    } else if (state.amount >= 100) {
      emoji = "📦";
      line = "Fills " + Math.round(state.amount / 25) + " emergency food boxes";
      when = "— about " + meals + " meals for local families.";
    } else if (state.amount >= 50) {
      emoji = "🍲";
      line = "Provides " + meals + " hot meals";
      when = "delivered this week to a local shelter.";
    } else {
      emoji = "🥪";
      line = "Serves " + meals + " school lunches";
      when = "for kids who'd otherwise go hungry.";
    }
    if (state.freq === "monthly") {
      when = when + " Every month.";
    }
    return { meals: meals, line: line, emoji: emoji, when: when };
  }

  // ---- renderers ----
  function renderImpact(animate) {
    var i = impact();
    $("#impactLine").textContent = i.line;
    $("#impactWhen").textContent = i.when;
    var em = $("#impactEmoji");
    em.textContent = i.emoji;
    if (animate) {
      em.classList.remove("pop");
      void em.offsetWidth;
      em.classList.add("pop");
    }
  }

  function renderFee() {
    $("#feeAmt").textContent = money(fee()).replace(/\.00$/, ".00");
  }

  function renderSubmitAmt() {
    var label = money(total()) + (state.freq === "monthly" ? "/mo" : "");
    $("#submitAmt").textContent = label;
  }

  function renderAll(animate) {
    renderImpact(animate);
    renderFee();
    renderSubmitAmt();
  }

  // ---- amount selection ----
  var customInput = $("#customAmt");

  function setAmount(val, fromCustom) {
    state.amount = val;
    $$(".amt[data-amt]").forEach(function (b) {
      var on = parseInt(b.getAttribute("data-amt"), 10) === val && !fromCustom;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    if (!fromCustom) customInput.value = "";
    renderAll(true);
  }

  $$(".amt[data-amt]").forEach(function (b) {
    b.addEventListener("click", function () {
      setAmount(parseInt(b.getAttribute("data-amt"), 10), false);
    });
  });

  customInput.addEventListener("input", function () {
    var v = parseInt(customInput.value, 10);
    $$(".amt[data-amt]").forEach(function (b) {
      b.classList.remove("is-on");
      b.setAttribute("aria-checked", "false");
    });
    state.amount = isNaN(v) || v < 1 ? 0 : v;
    renderAll(true);
  });

  // ---- frequency ----
  $$(".freq-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      state.freq = b.getAttribute("data-freq");
      $$(".freq-btn").forEach(function (x) {
        var on = x === b;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-checked", on ? "true" : "false");
      });
      renderAll(true);
    });
  });

  // ---- designation / cover / anon ----
  $("#designation").addEventListener("change", function (e) { state.designation = e.target.value; });
  $("#coverFees").addEventListener("change", function (e) {
    state.coverFees = e.target.checked;
    renderSubmitAmt();
  });
  $("#anon").addEventListener("change", function (e) { state.anon = e.target.checked; });

  // ---- step navigation ----
  var panels = {};
  $$(".panel[data-step]").forEach(function (p) { panels[p.getAttribute("data-step")] = p; });

  function showStep(step) {
    state.step = step;
    Object.keys(panels).forEach(function (k) {
      panels[k].classList.toggle("is-hidden", k !== String(step));
    });
    $$(".step[data-step-dot]").forEach(function (dot) {
      var n = parseInt(dot.getAttribute("data-step-dot"), 10);
      dot.classList.toggle("is-active", n === step);
      dot.classList.toggle("is-done", n < step && step !== "done");
    });
    if (step === "done") {
      $$(".step[data-step-dot]").forEach(function (dot) { dot.classList.add("is-done"); dot.classList.remove("is-active"); });
    }
    var card = $(".give");
    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ---- validation ----
  function setError(input, msg) {
    var holder = input.closest(".field");
    var err = holder ? $("[data-err]", holder) : null;
    if (err) err.textContent = msg || "";
    input.classList.toggle("invalid", !!msg);
  }

  function validateStep1() {
    if (state.amount < 1) { toast("Please choose a donation amount."); customInput.focus(); return false; }
    return true;
  }

  function validateStep2() {
    var ok = true;
    var f = $("#fname"), l = $("#lname"), e = $("#email");
    [f, l, e].forEach(function (i) { setError(i, ""); });
    if (!f.value.trim()) { setError(f, "Required"); ok = false; }
    if (!l.value.trim()) { setError(l, "Required"); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim())) { setError(e, "Enter a valid email"); ok = false; }
    if (ok) { state.fname = f.value.trim(); state.lname = l.value.trim(); state.email = e.value.trim(); }
    return ok;
  }

  function validateStep3() {
    var ok = true;
    var c = $("#card"), x = $("#exp"), v = $("#cvc");
    [c, x, v].forEach(function (i) { setError(i, ""); });
    var digits = c.value.replace(/\s/g, "");
    if (!/^\d{15,16}$/.test(digits)) { setError(c, "Enter a 15–16 digit card number"); ok = false; }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(x.value.trim())) { setError(x, "Use MM/YY"); ok = false; }
    if (!/^\d{3,4}$/.test(v.value.trim())) { setError(v, "3–4 digits"); ok = false; }
    return ok;
  }

  // ---- review ----
  function buildReview() {
    var i = impact();
    var rows = [
      ["Gift amount", money(state.amount) + (state.freq === "monthly" ? " / month" : " one-time")],
      ["Goes to", state.designation],
      ["Processing fee", state.coverFees ? money(fee()) + " (covered)" : "Not covered"],
      ["Donor", state.anon ? "Anonymous" : (state.fname + " " + state.lname)],
      ["Receipt to", state.email],
      ["Your impact", i.line.toLowerCase()],
    ];
    var html = rows.map(function (r) {
      return "<li><span>" + r[0] + "</span><b>" + escapeHtml(r[1]) + "</b></li>";
    }).join("");
    html += "<li class='total'><span>Total " + (state.freq === "monthly" ? "monthly" : "today") +
      "</span><b>" + money(total()) + "</b></li>";
    $("#reviewList").innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---- next / back wiring ----
  $$("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cur = state.step;
      if (cur === 1 && !validateStep1()) return;
      if (cur === 2 && !validateStep2()) return;
      if (cur === 3 && !validateStep3()) return;
      if (cur === 3) buildReview();
      showStep(cur + 1);
    });
  });

  $$("[data-back]").forEach(function (btn) {
    btn.addEventListener("click", function () { showStep(state.step - 1); });
  });

  // ---- submit ----
  $("#donateForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("#submitBtn");
    btn.disabled = true;
    btn.textContent = "Processing…";
    setTimeout(function () {
      var i = impact();
      $("#thankName").textContent = state.anon ? "friend" : state.fname;
      $("#successAmt").textContent = "You gave " + money(total()) + (state.freq === "monthly" ? " every month" : "");
      $("#successImpact").textContent = "That's " + i.line.charAt(0).toLowerCase() + i.line.slice(1) + ".";
      showStep("done");
      bumpThermo();
      addDonor();
      btn.disabled = false;
      btn.innerHTML = "Give <span id='submitAmt'>" + money(total()) + "</span>";
      toast("Gift confirmed — thank you! 💚");
    }, 1100);
  });

  // ---- restart ----
  $("#restartBtn").addEventListener("click", function () {
    showStep(1);
    setAmount(50, false);
    state.freq = "once";
    $$(".freq-btn").forEach(function (x) {
      var on = x.getAttribute("data-freq") === "once";
      x.classList.toggle("is-on", on);
      x.setAttribute("aria-checked", on ? "true" : "false");
    });
    ["fname", "lname", "email", "card", "exp", "cvc"].forEach(function (id) {
      var el = $("#" + id); if (el) { el.value = ""; el.classList.remove("invalid"); }
    });
    $$("[data-err]").forEach(function (e) { e.textContent = ""; });
  });

  // ---- thermometer bump on donation ----
  function bumpThermo() {
    var fill = $("#barFill");
    var pctEl = $("#goalPct");
    var cur = parseFloat(fill.style.width) || 73;
    var next = Math.min(99, cur + Math.max(0.3, state.amount / 4000 * 100));
    fill.style.width = next.toFixed(1) + "%";
    pctEl.textContent = Math.round(next) + "%";
    var bar = fill.parentElement;
    bar.setAttribute("aria-valuenow", Math.round(next));
  }

  function addDonor() {
    var list = $("#donorList");
    var name = state.anon ? "Anonymous" : (state.fname + " " + (state.lname ? state.lname.charAt(0) + "." : ""));
    var li = document.createElement("li");
    li.innerHTML = "<span class='dot'></span> " + escapeHtml(name) + " gave <b>$" +
      state.amount + "</b>" + (state.freq === "monthly" ? " · monthly" : "");
    li.style.opacity = "0";
    list.insertBefore(li, list.firstChild);
    requestAnimationFrame(function () {
      li.style.transition = "opacity 0.5s";
      li.style.opacity = "1";
    });
    while (list.children.length > 5) list.removeChild(list.lastChild);
  }

  // ---- init ----
  renderAll(false);
})();
