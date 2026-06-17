(function () {
  "use strict";

  var form = document.getElementById("giveForm");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-amount]"));
  var customInput = document.getElementById("customAmt");
  var customChip = customInput.closest(".chip-custom");
  var freqBtns = Array.prototype.slice.call(document.querySelectorAll(".freq-btn"));
  var donateBtn = document.getElementById("donateBtn");
  var impactText = document.getElementById("impactText");
  var coverFee = document.getElementById("coverFee");
  var coverAmt = document.getElementById("coverAmt");
  var donorList = document.getElementById("donorList");
  var toastEl = document.getElementById("toast");

  var state = { amount: 50, frequency: "once" };

  // Impact equivalence tiers — chosen by gift size & frequency.
  function impactFor(amount, freq) {
    if (!amount || amount < 1) return "Every dollar funds the next pump part, pipe, and filter.";
    var monthly = freq === "monthly";
    if (amount < 25) return "Buys <strong>water-purification tablets</strong> for a household for a month.";
    if (amount < 50) return monthly
      ? "Keeps a <strong>handpump maintained</strong> all year long."
      : "Provides <strong>one month of clean water</strong> for a family of five.";
    if (amount < 100) return monthly
      ? "Sponsors <strong>safe water for a family</strong>, refilled every month."
      : "Delivers a <strong>household water filter</strong> that lasts two years.";
    if (amount < 250) return monthly
      ? "Funds <strong>a village caretaker's stipend</strong> to keep wells flowing."
      : "Trains <strong>two local technicians</strong> to repair community wells.";
    if (amount < 500) return monthly
      ? "Builds <strong>a new well every year</strong> through your sustained giving."
      : "Lays the <strong>pipework for a school tap stand</strong> serving 300 children.";
    return monthly
      ? "Sponsors a <strong>full village water system</strong>, sustained month after month."
      : "Funds <strong>an entire borehole well</strong> for a community of 250 people.";
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function feeFor(amount) {
    return Math.round(amount * 0.03 * 100) / 100;
  }

  function total() {
    var amt = state.amount || 0;
    return coverFee.checked ? amt + feeFor(amt) : amt;
  }

  function render() {
    impactText.innerHTML = impactFor(state.amount, state.frequency);

    var fee = feeFor(state.amount || 0);
    coverAmt.textContent = "(+" + money(fee) + ")";

    var label;
    if (!state.amount || state.amount < 1) {
      label = "Enter an amount";
      donateBtn.disabled = true;
      donateBtn.style.opacity = "0.6";
      donateBtn.style.cursor = "not-allowed";
    } else {
      donateBtn.disabled = false;
      donateBtn.style.opacity = "";
      donateBtn.style.cursor = "";
      label = "Donate " + money(total()) + (state.frequency === "monthly" ? " / month" : "");
    }
    donateBtn.textContent = label;
  }

  function clearChips() {
    chips.forEach(function (c) { c.classList.remove("is-active"); });
    customChip.classList.remove("is-active");
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      clearChips();
      chip.classList.add("is-active");
      customInput.value = "";
      state.amount = Number(chip.dataset.amount);
      render();
    });
  });

  customInput.addEventListener("input", function () {
    var val = parseFloat(customInput.value);
    clearChips();
    customChip.classList.add("is-active");
    state.amount = isNaN(val) ? 0 : Math.max(0, val);
    render();
  });

  customInput.addEventListener("focus", function () {
    clearChips();
    customChip.classList.add("is-active");
    var val = parseFloat(customInput.value);
    state.amount = isNaN(val) ? 0 : val;
    render();
  });

  freqBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      freqBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.frequency = btn.dataset.freq;
      render();
    });
  });

  coverFee.addEventListener("change", render);

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  function initials(name) {
    return name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }

  var givers = ["You", "Maya R.", "Tomás L.", "Aisha B.", "Noah W.", "Lena F."];

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!state.amount || state.amount < 1) {
      customInput.focus();
      toast("Please choose or enter a donation amount.");
      return;
    }

    var name = givers[Math.floor(Math.random() * givers.length)];
    var li = document.createElement("li");
    li.className = "is-new";
    var freqTag = state.frequency === "monthly" ? " · monthly" : "";
    li.innerHTML = '<span class="av" aria-hidden="true">' + initials(name) +
      "</span> " + name + " gave <b>" + money(total()) + "</b>" + freqTag;
    donorList.insertBefore(li, donorList.firstChild);
    while (donorList.children.length > 4) {
      donorList.removeChild(donorList.lastChild);
    }

    toast("Thank you! " + money(total()) +
      (state.frequency === "monthly" ? " / month" : "") +
      " brings clean water closer. 💧");
  });

  render();
})();
