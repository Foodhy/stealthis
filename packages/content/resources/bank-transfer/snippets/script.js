(function () {
  "use strict";

  // ---------- Data (fictional) ----------
  var ACCOUNTS = [
    { id: "main", name: "Everyday Current", iban: "DE74 1001 0010 0000 4242 01", mask: "•••• 4242", balance: 8420.55, color: "var(--navy)" },
    { id: "save", name: "Savings Pot", iban: "DE21 1001 0010 0009 9817 06", mask: "•••• 9817", balance: 15280.00, color: "var(--teal)" },
    { id: "biz",  name: "Business Spend", iban: "DE55 1001 0010 0005 0031 88", mask: "•••• 0031", balance: 3140.20, color: "var(--violet)" }
  ];

  var PAYEES = [
    { id: "p1", name: "Mara Delgado",  sub: "ES91 2100 0418 4502 0005 1332", handle: "@mara", recent: true,  verified: true },
    { id: "p2", name: "Tomás Riedel",  sub: "DE12 5001 0517 0648 4898 90",   handle: "@tomr", recent: true,  verified: false },
    { id: "p3", name: "Lena Whitfield",sub: "GB29 NWBK 6016 1331 9268 19",   handle: "@lenaw", recent: true, verified: true },
    { id: "p4", name: "Kojo Mensah",   sub: "FR14 2004 1010 0505 0001 3M02", handle: "@kojo", recent: false, verified: false },
    { id: "p5", name: "Aoife Brennan", sub: "IE29 AIBK 9311 5212 3456 78",   handle: "@aoife", recent: false, verified: true },
    { id: "p6", name: "Bright Lights Co.", sub: "NL91 ABNA 0417 1643 00",    handle: "@brightlights", recent: false, verified: true }
  ];

  var DEMO_OTP = "428190";

  // ---------- State ----------
  var state = {
    step: 1,
    payee: null,
    amount: "",          // string of digits/dot
    source: ACCOUNTS[0],
    note: ""
  };

  // ---------- Helpers ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }
  function colorFor(id) {
    var colors = ["#3b6ef6", "#0fb5a6", "#7c5cff", "#d9982b", "#1f9d62", "#2a55cc"];
    var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return colors[h % colors.length];
  }
  function fmt(n) {
    return n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function amountValue() {
    var v = parseFloat(state.amount || "0");
    return isNaN(v) ? 0 : v;
  }

  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  // ---------- Step navigation ----------
  function goto(step) {
    state.step = step;
    $$(".step").forEach(function (s) {
      s.classList.toggle("is-active", +s.dataset.step === step);
    });
    $$(".dot").forEach(function (d) {
      d.classList.toggle("is-active", +d.dataset.dot <= step);
    });
    var titles = { 1: "Send money", 2: "Enter amount", 3: "Review transfer", 4: "Verify it's you" };
    $("#stepTitle").textContent = titles[step];
    $("#backBtn").hidden = step === 1;
    if (step === 3) buildReview();
    if (step === 4) { resetOtp(); setTimeout(function () { $("#otp input").focus(); }, 60); }
    $(".phone").scrollTop = 0;
  }

  $("#backBtn").addEventListener("click", function () {
    if (state.step > 1) goto(state.step - 1);
  });

  // ---------- Step 1: payees ----------
  function payeeRow(p) {
    var btn = document.createElement("button");
    btn.className = "payee-row";
    btn.type = "button";
    var ava = '<span class="ava" style="background:' + colorFor(p.id) + '">' + initials(p.name) + '</span>';
    var vsvg = p.verified
      ? '<span class="verified" title="Verified payee"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 2l2.4 1.8 3 .2.9 2.9 2.3 1.9-.9 2.9.9 2.9-2.3 1.9-.9 2.9-3 .2L12 22l-2.4-1.8-3-.2-.9-2.9L3.4 15l.9-2.9-.9-2.9 2.3-1.9.9-2.9 3-.2L12 2z" fill="currentColor"/><path d="M9 12l2 2 4-4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
      : "";
    btn.innerHTML =
      ava +
      '<span class="payee-meta"><strong>' + p.name + vsvg + '</strong><small>' + p.sub + '</small></span>' +
      '<svg class="chev" viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.addEventListener("click", function () { choosePayee(p); });
    var li = document.createElement("li");
    li.appendChild(btn);
    return li;
  }

  function renderPayees(filter) {
    var q = (filter || "").trim().toLowerCase();
    var list = $("#payeeList");
    list.innerHTML = "";
    var matched = PAYEES.filter(function (p) {
      if (!q) return true;
      return p.name.toLowerCase().indexOf(q) > -1 ||
             p.handle.toLowerCase().indexOf(q) > -1 ||
             p.sub.toLowerCase().replace(/\s/g, "").indexOf(q.replace(/\s/g, "")) > -1;
    });
    if (!matched.length) {
      var li = document.createElement("li");
      li.innerHTML = '<p style="color:var(--muted);font-size:13.5px;padding:8px">No payees match “' + (filter || "") + '”.</p>';
      list.appendChild(li);
    } else {
      matched.forEach(function (p) { list.appendChild(payeeRow(p)); });
    }

    var row = $("#recentRow");
    row.innerHTML = "";
    PAYEES.filter(function (p) { return p.recent; }).forEach(function (p) {
      var b = document.createElement("button");
      b.className = "ava-item";
      b.type = "button";
      b.innerHTML =
        '<span class="ava" style="background:' + colorFor(p.id) + '">' + initials(p.name) + '</span>' +
        '<span class="nm">' + p.name.split(" ")[0] + '</span>';
      b.addEventListener("click", function () { choosePayee(p); });
      row.appendChild(b);
    });
  }

  $("#payeeSearch").addEventListener("input", function (e) { renderPayees(e.target.value); });

  function choosePayee(p) {
    state.payee = p;
    state.amount = "";
    $("#chipAva").textContent = initials(p.name);
    $("#chipAva").style.background = colorFor(p.id);
    $("#chipName").textContent = p.name;
    $("#chipSub").textContent = p.sub.length > 24 ? p.sub.slice(0, 24) + "…" : p.sub;
    updateAmount();
    goto(2);
  }

  // ---------- Step 2: amount ----------
  function updateAmount() {
    var raw = state.amount;
    var disp = raw === "" ? "0" : raw;
    var dec = "";
    if (disp.indexOf(".") > -1) {
      var parts = disp.split(".");
      disp = parts[0] === "" ? "0" : parts[0];
      dec = "." + (parts[1] || "").slice(0, 2).padEnd(0, "");
    }
    // format integer part with thousands
    var intNum = parseInt(disp, 10);
    var intStr = isNaN(intNum) ? "0" : intNum.toLocaleString("en-IE");
    $("#amountText").textContent = intStr;
    $("#amountDec").textContent = raw.indexOf(".") > -1 ? dec : ".00";

    var val = amountValue();
    var over = val > state.source.balance;
    $("#balanceLine").textContent = "Available · €" + fmt(state.source.balance);
    $("#amountError").hidden = !over;
    $(".amount-display").classList.toggle("is-error", over);
    $("#toSourceBtn").disabled = !(val > 0 && !over);
  }

  function pressKey(k) {
    var a = state.amount;
    if (k === "del") {
      a = a.slice(0, -1);
    } else if (k === ".") {
      if (a.indexOf(".") === -1) a = (a === "" ? "0" : a) + ".";
    } else {
      // limit 2 decimals
      if (a.indexOf(".") > -1 && a.split(".")[1].length >= 2) return;
      if (a === "0") a = k;            // replace leading zero
      else a = a + k;
      if (a.replace(".", "").length > 9) return; // sanity cap
    }
    state.amount = a;
    updateAmount();
  }

  $("#keypad").addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]");
    if (b) pressKey(b.dataset.k);
  });

  $("#quickAmts").addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]");
    if (!b) return;
    if (b.dataset.q === "max") {
      state.amount = String(state.source.balance);
    } else {
      state.amount = b.dataset.q;
    }
    updateAmount();
  });

  // keyboard support on amount step
  document.addEventListener("keydown", function (e) {
    if (state.step !== 2) return;
    if (/^[0-9]$/.test(e.key)) { pressKey(e.key); }
    else if (e.key === ".") { pressKey("."); }
    else if (e.key === "Backspace") { pressKey("del"); }
    else if (e.key === "Enter" && !$("#toSourceBtn").disabled) { goto(3); }
  });

  $("#toSourceBtn").addEventListener("click", function () {
    if (!this.disabled) goto(3);
  });

  // ---------- Step 3: source + review ----------
  function renderAccounts() {
    var wrap = $("#accounts");
    wrap.innerHTML = "";
    ACCOUNTS.forEach(function (a) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "account" + (a.id === state.source.id ? " is-selected" : "");
      btn.innerHTML =
        '<span class="card-ic" style="background:' + a.color + '">' + a.id.toUpperCase().slice(0, 3) + '</span>' +
        '<span class="account-meta"><strong>' + a.name + '</strong><small>' + a.mask + '</small></span>' +
        '<span class="bal">€' + fmt(a.balance) + '</span>' +
        '<span class="radio"></span>';
      btn.addEventListener("click", function () {
        state.source = a;
        updateAmount();
        renderAccounts();
        buildReview();
      });
      wrap.appendChild(btn);
    });
  }

  function buildReview() {
    var p = state.payee, val = amountValue();
    $("#reviewAmount").textContent = "€" + fmt(val);
    $("#reviewTo").textContent = "to " + (p ? p.name : "—");
    $("#rRecipient").textContent = p ? p.name : "—";
    $("#rIban").textContent = p ? p.sub : "—";
    $("#rAmount").textContent = "€" + fmt(val);
    renderAccounts();
  }

  $("#noteInput").addEventListener("input", function (e) { state.note = e.target.value; });

  $("#toAuthBtn").addEventListener("click", function () {
    var val = amountValue();
    if (val <= 0) { toast("Enter an amount first."); goto(2); return; }
    if (val > state.source.balance) { toast("Not enough balance in " + state.source.name + "."); return; }
    goto(4);
    toast("Verification code sent to •••• ••82");
  });

  // ---------- Step 4: OTP ----------
  var otpInputs = $$("#otp input");

  function resetOtp() {
    otpInputs.forEach(function (i) { i.value = ""; });
    $("#otp").classList.remove("is-error");
    $("#otpError").hidden = true;
    $("#confirmBtn").disabled = true;
  }

  function otpValue() { return otpInputs.map(function (i) { return i.value; }).join(""); }

  otpInputs.forEach(function (inp, idx) {
    inp.addEventListener("input", function () {
      inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
      if (inp.value && idx < otpInputs.length - 1) otpInputs[idx + 1].focus();
      $("#otp").classList.remove("is-error");
      $("#otpError").hidden = true;
      $("#confirmBtn").disabled = otpValue().length !== 6;
    });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !inp.value && idx > 0) otpInputs[idx - 1].focus();
    });
    inp.addEventListener("paste", function (e) {
      e.preventDefault();
      var d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6).split("");
      d.forEach(function (ch, i) { if (otpInputs[i]) otpInputs[i].value = ch; });
      var next = Math.min(d.length, otpInputs.length - 1);
      otpInputs[next].focus();
      $("#confirmBtn").disabled = otpValue().length !== 6;
    });
  });

  $("#autofill").addEventListener("click", function () {
    DEMO_OTP.split("").forEach(function (ch, i) { otpInputs[i].value = ch; });
    $("#otp").classList.remove("is-error");
    $("#otpError").hidden = true;
    $("#confirmBtn").disabled = false;
    otpInputs[5].focus();
  });

  $("#confirmBtn").addEventListener("click", function () {
    var btn = this;
    if (otpValue() !== DEMO_OTP) {
      $("#otp").classList.add("is-error");
      $("#otpError").hidden = false;
      resetOtpValuesOnly();
      otpInputs[0].focus();
      return;
    }
    btn.classList.add("is-loading");
    btn.disabled = true;
    $(".label", btn).textContent = "Sending…";
    setTimeout(showSuccess, 1300);
  });

  function resetOtpValuesOnly() {
    otpInputs.forEach(function (i) { i.value = ""; });
    $("#confirmBtn").disabled = true;
  }

  // ---------- Success ----------
  function showSuccess() {
    var p = state.payee, val = amountValue();
    var ref = "TRX-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
    $("#successAmt").textContent = "€" + fmt(val) + " sent";
    $("#successTo").textContent = "to " + (p ? p.name : "—") + (state.note ? " · " + state.note : "");
    $("#successRef").textContent = ref;
    $("#successFrom").textContent = state.source.name + " · " + state.source.mask;
    // deduct from balance (visual)
    state.source.balance = Math.max(0, state.source.balance - val);
    var sc = $("#success");
    sc.hidden = false;
    // restart check animation
    var mark = $(".ck-mark"), circ = $(".ck-circle");
    [mark, circ].forEach(function (el) { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });

    var btn = $("#confirmBtn");
    btn.classList.remove("is-loading");
    $(".label", btn).textContent = "Confirm & send";
  }

  $("#doneBtn").addEventListener("click", resetFlow);
  $("#againBtn").addEventListener("click", resetFlow);

  function resetFlow() {
    $("#success").hidden = true;
    state.payee = null;
    state.amount = "";
    state.note = "";
    state.source = ACCOUNTS[0];
    $("#noteInput").value = "";
    $("#payeeSearch").value = "";
    renderPayees("");
    updateAmount();
    goto(1);
  }

  // ---------- New payee sheet ----------
  function openSheet() { $("#sheetBack").hidden = false; setTimeout(function () { $("#npName").focus(); }, 80); }
  function closeSheet() { $("#sheetBack").hidden = true; $("#npName").value = ""; $("#npIban").value = ""; $("#npName").classList.remove("invalid"); $("#npIban").classList.remove("invalid"); }

  $("#newPayeeBtn").addEventListener("click", openSheet);
  $("#npCancel").addEventListener("click", closeSheet);
  $("#sheetBack").addEventListener("click", function (e) { if (e.target === this) closeSheet(); });

  $("#npSave").addEventListener("click", function () {
    var name = $("#npName").value.trim();
    var iban = $("#npIban").value.trim().toUpperCase();
    var ok = true;
    if (name.length < 2) { $("#npName").classList.add("invalid"); ok = false; }
    else $("#npName").classList.remove("invalid");
    if (iban.replace(/\s/g, "").length < 12) { $("#npIban").classList.add("invalid"); ok = false; }
    else $("#npIban").classList.remove("invalid");
    if (!ok) { toast("Check the name and IBAN."); return; }

    var p = { id: "n" + Date.now(), name: name, sub: iban, handle: "@" + name.split(" ")[0].toLowerCase(), recent: false, verified: false };
    PAYEES.unshift(p);
    closeSheet();
    toast("Payee added");
    choosePayee(p);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#sheetBack").hidden) closeSheet();
  });

  // ---------- Init ----------
  renderPayees("");
  updateAmount();
  goto(1);
})();
