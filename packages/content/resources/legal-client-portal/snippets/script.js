(function () {
  "use strict";

  var live = document.getElementById("live");
  function announce(msg) {
    if (live) live.textContent = msg;
  }

  function money(n) {
    return "$" + n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /* ---------- Tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panes = {
    matters: document.getElementById("pane-matters"),
    documents: document.getElementById("pane-documents"),
    invoices: document.getElementById("pane-invoices"),
    messages: document.getElementById("pane-messages"),
  };

  function activate(name) {
    tabs.forEach(function (tab) {
      var on = tab.dataset.tab === name;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    Object.keys(panes).forEach(function (key) {
      var pane = panes[key];
      if (!pane) return;
      var on = key === name;
      pane.classList.toggle("is-active", on);
      pane.hidden = !on;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      activate(tab.dataset.tab);
    });
    tab.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = (i + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next].dataset.tab);
    });
  });

  /* ---------- Quick actions jump to a tab ---------- */
  document.querySelectorAll("[data-go]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.dataset.go;
      activate(target);
      var pane = panes[target];
      if (pane) pane.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Summary refs ---------- */
  var statBalance = document.getElementById("statBalance");
  var statBalanceHint = document.getElementById("statBalanceHint");
  var statMessages = document.getElementById("statMessages");
  var invCount = document.getElementById("invCount");
  var msgCount = document.getElementById("msgCount");
  var notifDot = document.getElementById("notifDot");

  function recalcBalance() {
    var due = document.querySelectorAll('.inv:not(.inv--paid)');
    var total = 0;
    due.forEach(function (el) {
      total += Number(el.dataset.amount || 0);
    });
    if (statBalance) statBalance.textContent = money(total);
    if (statBalanceHint) {
      statBalanceHint.textContent =
        due.length === 0
          ? "All invoices paid"
          : due.length + " invoice" + (due.length === 1 ? "" : "s") + " due";
    }
    if (invCount) invCount.textContent = String(due.length);
  }

  function recalcMessages() {
    var unread = document.querySelectorAll(".msg[data-unread]").length;
    if (statMessages) statMessages.textContent = String(unread);
    if (msgCount) msgCount.textContent = String(unread);
    if (notifDot) notifDot.classList.toggle("is-hidden", unread === 0);
  }

  /* ---------- Pay invoice (inline confirm) ---------- */
  document.querySelectorAll("[data-pay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".inv");
      if (!row) return;

      if (btn.dataset.confirming !== "true") {
        btn.dataset.confirming = "true";
        btn.dataset.label = btn.textContent;
        btn.textContent = "Confirm payment";
        btn.classList.add("paybtn--confirm");
        announce("Press confirm to pay invoice " + (row.querySelector(".inv__title") ? row.querySelector(".inv__title").textContent : ""));
        setTimeout(function () {
          if (btn.dataset.confirming === "true") {
            btn.dataset.confirming = "false";
            btn.textContent = btn.dataset.label || "Pay now";
            btn.classList.remove("paybtn--confirm");
          }
        }, 4000);
        return;
      }

      // Confirmed
      row.dataset.amount = "0";
      row.classList.add("inv--paid");
      var status = row.querySelector(".inv__status");
      if (status) {
        status.className = "badge badge--ok inv__status";
        status.textContent = "Paid";
      }
      btn.classList.remove("paybtn--confirm");
      btn.textContent = "Paid";
      btn.disabled = true;
      recalcBalance();
      announce("Invoice paid. Outstanding balance updated.");
    });
  });

  /* ---------- Mark message read ---------- */
  document.querySelectorAll("[data-read]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".msg");
      if (!row) return;
      row.removeAttribute("data-unread");
      row.classList.remove("msg--unread");
      row.classList.add("is-read");
      btn.textContent = "Read";
      btn.disabled = true;
      recalcMessages();
      announce("Message marked as read.");
    });
  });

  /* ---------- Acknowledge document ---------- */
  document.querySelectorAll("[data-ack]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".doc");
      if (!row) return;
      var status = row.querySelector(".doc__status");
      if (status) {
        status.className = "badge badge--ok doc__status";
        status.textContent = "Signed";
      }
      btn.textContent = "Acknowledged";
      btn.disabled = true;
      announce("Document acknowledged.");
    });
  });

  /* ---------- Notifications button focuses messages ---------- */
  var notifBtn = notifDot ? notifDot.closest(".iconbtn") : null;
  if (notifBtn) {
    notifBtn.addEventListener("click", function () {
      activate("messages");
      if (panes.messages) panes.messages.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Initial sync
  recalcBalance();
  recalcMessages();
})();
