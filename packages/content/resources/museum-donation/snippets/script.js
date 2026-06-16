(function () {
  "use strict";

  var FEE_RATE = 0.025;

  var state = {
    cadence: "once", // "once" | "monthly"
    amount: 75, // selected gift amount in dollars
    coverFee: false,
  };

  var els = {
    form: document.getElementById("give-form"),
    cadBtns: Array.prototype.slice.call(document.querySelectorAll(".cad-btn")),
    cadTag: document.getElementById("cad-tag"),
    chips: Array.prototype.slice.call(document.querySelectorAll(".chip")),
    custom: document.getElementById("custom-amt"),
    customWrap: document.querySelector(".custom"),
    coverFee: document.getElementById("cover-fee"),
    feeSub: document.getElementById("fee-sub"),
    feeRow: document.getElementById("fee-row"),
    designation: document.getElementById("designation"),
    impactLine: document.getElementById("impact-line"),
    sumGift: document.getElementById("sum-gift"),
    sumFee: document.getElementById("sum-fee"),
    sumTotal: document.getElementById("sum-total"),
    donateBtn: document.getElementById("donate-btn"),
    donateLabel: document.getElementById("donate-label"),
    toast: document.getElementById("toast"),
  };

  // ---- helpers ----
  function fmt(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtShort(n) {
    if (n >= 1000 && n % 1000 === 0) return "$" + (n / 1000) + ",000";
    return "$" + n.toLocaleString("en-US");
  }

  var toastTimer = null;
  function toast(msg) {
    if (!els.toast) return;
    els.toast.innerHTML = '<span class="t-mark" aria-hidden="true">◆</span>' + msg;
    els.toast.hidden = false;
    // force reflow so the transition runs
    void els.toast.offsetWidth;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
      setTimeout(function () {
        els.toast.hidden = true;
      }, 280);
    }, 3200);
  }

  // ---- impact copy ----
  function impactFor(amount, designation) {
    if (amount <= 0) return "Choose an amount to see the difference it makes.";
    var tiers = {
      general: [
        [40, "keeps the galleries open and free on Thursday evenings"],
        [100, "sponsors a class field trip for ten students"],
        [250, "supports a week of free community programming"],
        [600, "underwrites a visiting-artist talk"],
        [Infinity, "names you a Curator's Circle supporter for the year"],
      ],
      acquisitions: [
        [75, "helps frame and mat a new work on paper"],
        [200, "supports research for a future acquisition"],
        [750, "contributes toward acquiring an emerging artist's print"],
        [Infinity, "joins the Acquisitions Council shaping the collection"],
      ],
      education: [
        [40, "covers art supplies for a children's workshop"],
        [100, "sponsors a class field trip for ten students"],
        [300, "funds a teaching-artist residency day"],
        [Infinity, "endows a full season of school visits"],
      ],
      conservation: [
        [60, "supplies archival materials for the studio"],
        [180, "funds an hour with a paintings conservator"],
        [800, "supports the conservation of a fragile work on canvas"],
        [Infinity, "helps restore a major work for return to the gallery"],
      ],
    };
    var table = tiers[designation] || tiers.general;
    for (var i = 0; i < table.length; i++) {
      if (amount <= table[i][0]) {
        return "A <strong>" + fmt(amount) + "</strong> " + cadenceWord() + " gift " + table[i][1] + ".";
      }
    }
    return "A <strong>" + fmt(amount) + "</strong> gift makes a lasting difference.";
  }

  function cadenceWord() {
    return state.cadence === "monthly" ? "monthly" : "one-time";
  }

  // ---- recompute & render ----
  function render() {
    var amount = state.amount > 0 ? state.amount : 0;
    var fee = state.coverFee ? Math.round(amount * FEE_RATE * 100) / 100 : 0;
    var total = amount + fee;

    els.sumGift.textContent = fmt(amount);
    els.sumFee.textContent = fmt(fee);
    els.sumTotal.textContent = fmt(total);
    els.feeRow.hidden = !state.coverFee;

    var suffix = state.cadence === "monthly" ? " / month" : "";
    if (amount > 0) {
      els.donateLabel.textContent = "Donate " + fmt(total) + suffix;
      els.donateBtn.disabled = false;
    } else {
      els.donateLabel.textContent = "Enter an amount";
      els.donateBtn.disabled = false;
    }

    els.feeSub.textContent = state.coverFee
      ? "Adding " + fmt(fee) + " (2.5%) so 100% of your gift reaches the museum."
      : "Add 2.5% so 100% of your gift reaches the museum.";

    els.cadTag.textContent = state.cadence === "monthly" ? "per month" : "per gift";

    els.impactLine.querySelector(".impact-text").innerHTML = impactFor(amount, els.designation.value);
  }

  // ---- preset chips ----
  function selectChip(btn) {
    els.chips.forEach(function (c) {
      var on = c === btn;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    els.custom.value = "";
    els.customWrap.classList.remove("is-on");
    state.amount = parseFloat(btn.getAttribute("data-amount")) || 0;
    render();
  }

  els.chips.forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectChip(btn);
    });
  });

  // ---- custom amount ----
  els.custom.addEventListener("input", function () {
    // strip everything except digits and a single dot
    var raw = els.custom.value.replace(/[^0-9.]/g, "");
    var parts = raw.split(".");
    if (parts.length > 2) raw = parts[0] + "." + parts.slice(1).join("");
    els.custom.value = raw;

    var val = parseFloat(raw);
    if (raw !== "" && !isNaN(val) && val > 0) {
      els.chips.forEach(function (c) {
        c.classList.remove("is-on");
        c.setAttribute("aria-pressed", "false");
      });
      els.customWrap.classList.add("is-on");
      state.amount = Math.round(val * 100) / 100;
    } else {
      els.customWrap.classList.remove("is-on");
      state.amount = 0;
    }
    render();
  });

  els.custom.addEventListener("blur", function () {
    var val = parseFloat(els.custom.value);
    if (!isNaN(val) && val > 0) {
      els.custom.value = (Math.round(val * 100) / 100).toString();
    }
  });

  // ---- cadence toggle ----
  els.cadBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.cadence = btn.getAttribute("data-cadence");
      els.cadBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      render();
    });
  });

  // ---- cover fee ----
  els.coverFee.addEventListener("change", function () {
    state.coverFee = els.coverFee.checked;
    render();
    if (state.coverFee) toast("Thank you — you're covering the processing fee.");
  });

  // ---- designation ----
  els.designation.addEventListener("change", render);

  // ---- submit ----
  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (state.amount <= 0) {
      els.custom.focus();
      toast("Please choose or enter a gift amount.");
      return;
    }
    var fee = state.coverFee ? Math.round(state.amount * FEE_RATE * 100) / 100 : 0;
    var total = state.amount + fee;
    var desigText = els.designation.options[els.designation.selectedIndex].text;

    els.donateBtn.classList.add("is-busy");
    els.donateBtn.disabled = true;
    var prev = els.donateLabel.textContent;
    els.donateLabel.textContent = "Processing…";

    setTimeout(function () {
      els.donateBtn.classList.remove("is-busy");
      els.donateBtn.disabled = false;
      els.donateLabel.textContent = prev;
      var word = state.cadence === "monthly" ? "monthly gift" : "gift";
      toast("Thank you! Your " + fmt(total) + " " + word + " to " + desigText + " is confirmed (demo).");
    }, 900);
  });

  // initial paint
  render();
})();
