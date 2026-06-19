(function () {
  "use strict";

  var STEP_ORDER = ["checkin", "diagnosing", "approval", "repair", "ready"];
  var PROGRESS = { checkin: 12, diagnosing: 34, approval: 52, repair: 72, ready: 100 };

  var els = {
    steps: document.getElementById("steps"),
    fill: document.getElementById("progressFill"),
    chip: document.getElementById("statusChip"),
    track: document.querySelector(".progress-track"),
    thread: document.getElementById("thread"),
    composer: document.getElementById("composer"),
    msgInput: document.getElementById("msgInput"),
    feedPulse: document.getElementById("feedPulse"),
    refreshBtn: document.getElementById("refreshBtn"),
    approval: document.getElementById("approvalBanner"),
    approveBtn: document.getElementById("approveBtn"),
    declineBtn: document.getElementById("declineBtn"),
    addonLine: document.getElementById("addonLine"),
    orderTotal: document.getElementById("orderTotal"),
    repairTime: document.getElementById("repairTime"),
    etaTime: document.getElementById("etaTime"),
    etaNote: document.getElementById("etaNote"),
    toast: document.getElementById("toast"),
  };

  var state = { current: "repair", total: 578.4, approvalShown: false };
  var toastTimer = null;

  function toast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2400);
  }

  function nowLabel() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setProgress(stepKey) {
    var pct = PROGRESS[stepKey] || 0;
    els.fill.style.width = pct + "%";
    if (els.track) els.track.setAttribute("aria-valuenow", String(pct));
  }

  function renderSteps() {
    var idx = STEP_ORDER.indexOf(state.current);
    Array.prototype.forEach.call(els.steps.children, function (li, i) {
      li.classList.remove("done", "active");
      if (i < idx) li.classList.add("done");
      else if (i === idx) li.classList.add("active");
    });
  }

  function addBubble(text, who, opts) {
    opts = opts || {};
    var li = document.createElement("li");
    li.className = "bubble " + (who === "me" ? "me" : "shop");
    var span = document.createElement("span");
    span.className = "bub-text";
    if (opts.html) span.innerHTML = text;
    else span.textContent = text;
    var time = document.createElement("span");
    time.className = "bub-time";
    time.textContent = nowLabel();
    li.appendChild(span);
    li.appendChild(time);
    els.thread.appendChild(li);
    els.thread.scrollTop = els.thread.scrollHeight;
    if (who !== "me") pulseFeed();
  }

  function pulseFeed() {
    els.feedPulse.classList.add("live");
    setTimeout(function () {
      els.feedPulse.classList.remove("live");
    }, 4200);
  }

  function showApproval() {
    if (state.approvalShown) return;
    state.approvalShown = true;
    els.approval.hidden = false;
    els.chip.dataset.state = "approval";
    els.chip.textContent = "Needs approval";
    state.current = "approval";
    renderSteps();
    setProgress("approval");
    addBubble(
      "While we're in there — rear brake pads are down to <b>2mm</b>. Want us to swap them for <b>$184.00</b>? Approve below.",
      "shop",
      { html: true }
    );
    toast("New request from the shop");
  }

  // Composer
  els.composer.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = els.msgInput.value.trim();
    if (!v) return;
    addBubble(v, "me");
    els.msgInput.value = "";
    setTimeout(function () {
      addBubble("Got it — passing that along to your tech. 👍", "shop");
    }, 1100);
  });

  // Refresh
  els.refreshBtn.addEventListener("click", function () {
    els.refreshBtn.classList.add("spinning");
    setTimeout(function () {
      els.refreshBtn.classList.remove("spinning");
    }, 600);
    if (!state.approvalShown) {
      showApproval();
    } else {
      toast("You're all caught up");
    }
  });

  // Approve
  els.approveBtn.addEventListener("click", function () {
    els.approval.hidden = true;
    els.addonLine.hidden = false;
    state.total += 184;
    els.orderTotal.textContent = money(state.total);
    state.current = "repair";
    els.chip.dataset.state = "inrepair";
    els.chip.textContent = "In repair";
    renderSteps();
    setProgress("repair");
    addBubble("Approved — go ahead with the brakes.", "me");
    setTimeout(function () {
      addBubble("Thanks! Brake pads added to the order. Knocking it all out now.", "shop");
    }, 1000);
    els.etaTime.textContent = "Today, 5:10 PM";
    els.etaNote.textContent = "Updated · added brake work";
    toast("Work approved — total updated");
  });

  // Decline
  els.declineBtn.addEventListener("click", function () {
    els.approval.hidden = true;
    state.current = "repair";
    els.chip.dataset.state = "inrepair";
    els.chip.textContent = "In repair";
    renderSteps();
    setProgress("repair");
    addBubble("Let's skip the brakes for today, thanks.", "me");
    setTimeout(function () {
      addBubble("No problem — we'll note it for next visit. Finishing the coil job now.", "shop");
    }, 1000);
    toast("Add-on declined");
  });

  // Scripted live feed → leads into approval request
  function startTimeline() {
    renderSteps();
    setTimeout(function () {
      setProgress("repair");
    }, 400);

    setTimeout(function () {
      addBubble("Old coil pack is out. New one and plugs going in now — nice clean install.", "shop");
    }, 3200);

    setTimeout(showApproval, 7000);
  }

  startTimeline();
})();
