(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var fmt = function (n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  /* ---------- Toast helper ---------- */
  var region = $("#toastRegion");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind === "info" ? " info" : "");
    var icon = document.createElement("span");
    icon.className = "t-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = kind === "info" ? "i" : "✓";
    var text = document.createElement("span");
    text.textContent = msg;
    el.appendChild(icon);
    el.appendChild(text);
    region.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      el.addEventListener("animationend", function () { el.remove(); });
    }, 3200);
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = $("#themeToggle");
  var themeIcon = $(".theme-icon", themeBtn);
  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeIcon.textContent = dark ? "☀️" : "🌙";
  }
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark);
  themeBtn.addEventListener("click", function () {
    applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
  });

  /* ---------- Modal machinery ---------- */
  var lastFocused = null;
  function openModal(overlay) {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    var focusable = overlay.querySelector("input, button, [tabindex]");
    if (focusable) focusable.focus();
    overlay._trap = function (e) {
      if (e.key === "Escape") { closeModal(overlay); return; }
      if (e.key !== "Tab") return;
      var items = $$("button, input, [tabindex]:not([tabindex='-1'])", overlay)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    overlay.addEventListener("keydown", overlay._trap);
  }
  function closeModal(overlay) {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (overlay._trap) overlay.removeEventListener("keydown", overlay._trap);
    if (lastFocused) lastFocused.focus();
  }
  $$(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) closeModal(overlay);
    });
    $$("[data-close]", overlay).forEach(function (b) {
      b.addEventListener("click", function () { closeModal(overlay); });
    });
  });

  /* ---------- Plan change modal ---------- */
  var planModal = $("#planModal");
  var planRadios = $$("input[name='plan']");
  var modalTotal = $("#modalTotal");

  function syncModalTotal() {
    var checked = $("input[name='plan']:checked");
    modalTotal.textContent = fmt(checked.dataset.price);
  }
  planRadios.forEach(function (r) { r.addEventListener("change", syncModalTotal); });

  $("#upgradeBtn").addEventListener("click", function () {
    // reset selection to current plan
    var current = planRadios.filter(function (r) { return r.value === $("#planBadge").textContent.trim(); })[0];
    if (current) current.checked = true;
    syncModalTotal();
    openModal(planModal);
  });

  $("#confirmPlan").addEventListener("click", function () {
    var checked = $("input[name='plan']:checked");
    var name = checked.value;
    var price = Number(checked.dataset.price);
    var seats = Number(checked.dataset.seats);

    $("#planBadge").textContent = name;
    $("#planPrice").textContent = fmt(price).replace(".00", "");
    $("#nextCharge").textContent = fmt(price);
    $("#seatMax").textContent = String(seats);
    $("#seatCount").textContent = String(Math.min(Number($("#seatCount").textContent), seats));

    // update current-plan tag inside modal
    $$(".plan-opt").forEach(function (o) { o.classList.remove("is-current"); });
    $$(".tag").forEach(function (t) { if (t.textContent === "Current") t.remove(); });
    var b = checked.closest(".plan-opt").querySelector(".opt-top b");
    if (b && !b.querySelector(".tag")) {
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "Current";
      b.appendChild(tag);
    }
    checked.closest(".plan-opt").classList.add("is-current");

    closeModal(planModal);
    toast("Plan changed to " + name + " — " + fmt(price) + "/mo");
  });

  /* ---------- Manage seats / add seats ---------- */
  function addSeats() {
    var max = $("#seatMax");
    var newMax = Number(max.textContent) + 5;
    max.textContent = String(newMax);
    // refresh the seats usage meter
    var seatLi = $$("[data-usage]")[0];
    if (seatLi) {
      var used = Number($("#seatCount").textContent);
      var pct = Math.round((used / newMax) * 100);
      var fill = seatLi.querySelector(".meter-fill");
      fill.style.setProperty("--pct", pct + "%");
      fill.classList.remove("warn");
      seatLi.querySelector(".usage-val").textContent = used + " / " + newMax;
      seatLi.querySelector(".meter").setAttribute("aria-valuenow", String(pct));
    }
    toast("Added 5 seats — now " + max.textContent + " total", "info");
  }
  $("#manageSeatsBtn").addEventListener("click", addSeats);
  $("#usageUpgrade").addEventListener("click", addSeats);

  /* ---------- Payment update form ---------- */
  $("#updatePayBtn").addEventListener("click", function () { openModal($("#payModal")); });

  var payForm = $("#payForm");

  function setErr(input, msg) {
    var err = input.parentNode.querySelector("[data-err]");
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      err.textContent = msg; err.classList.add("show");
    } else {
      input.removeAttribute("aria-invalid");
      err.textContent = ""; err.classList.remove("show");
    }
  }

  // live formatting for card number + expiry
  var ccNum = $("#ccNum");
  ccNum.addEventListener("input", function () {
    var digits = ccNum.value.replace(/\D/g, "").slice(0, 16);
    ccNum.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
  var ccExp = $("#ccExp");
  ccExp.addEventListener("input", function () {
    var d = ccExp.value.replace(/\D/g, "").slice(0, 4);
    ccExp.value = d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  });
  $("#ccCvc").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  });

  payForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var name = $("#ccName"), num = $("#ccNum"), exp = $("#ccExp"), cvc = $("#ccCvc");

    if (!name.value.trim()) { setErr(name, "Enter the name on the card."); ok = false; } else setErr(name, "");

    var rawNum = num.value.replace(/\s/g, "");
    if (rawNum.length < 15) { setErr(num, "Enter a valid card number."); ok = false; } else setErr(num, "");

    if (!/^\d{2}\/\d{2}$/.test(exp.value)) { setErr(exp, "Use MM/YY."); ok = false; }
    else {
      var mm = Number(exp.value.slice(0, 2));
      if (mm < 1 || mm > 12) { setErr(exp, "Invalid month."); ok = false; } else setErr(exp, "");
    }

    if (cvc.value.length < 3) { setErr(cvc, "3–4 digits."); ok = false; } else setErr(cvc, "");

    if (!ok) {
      var firstBad = payForm.querySelector("[aria-invalid='true']");
      if (firstBad) firstBad.focus();
      return;
    }

    var last4 = rawNum.slice(-4);
    var brand = /^4/.test(rawNum) ? "Visa" : /^5/.test(rawNum) ? "Mastercard" : /^3/.test(rawNum) ? "Amex" : "Card";
    $("#cardBrand").textContent = brand;
    $("#cardLast4").textContent = last4;
    $("#cardExp").textContent = exp.value.replace("/", " / ");

    closeModal($("#payModal"));
    payForm.reset();
    $$("[data-err]", payForm).forEach(function (s) { s.classList.remove("show"); });
    $$("input", payForm).forEach(function (i) { i.removeAttribute("aria-invalid"); });
    toast("Payment method updated — " + brand + " ••••" + last4);
  });

  /* ---------- Invoice downloads ---------- */
  $$("[data-download]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-download");
      btn.textContent = "Downloading…";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = "Download";
        btn.disabled = false;
        toast("Invoice " + id + ".pdf downloaded", "info");
      }, 700);
    });
  });

  $("#downloadAllBtn").addEventListener("click", function () {
    var n = $$("[data-download]").length;
    toast("Preparing " + n + " invoices as a ZIP archive…", "info");
  });

  /* ---------- Animate usage bars on first paint ---------- */
  window.requestAnimationFrame(function () {
    $$(".meter-fill").forEach(function (fill) {
      var target = fill.style.getPropertyValue("--pct");
      fill.style.setProperty("--pct", "0%");
      window.requestAnimationFrame(function () {
        setTimeout(function () { fill.style.setProperty("--pct", target); }, 80);
      });
    });
  });
})();
