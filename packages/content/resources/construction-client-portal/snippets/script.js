(function () {
  "use strict";

  /* ---- animate progress bar on load ---- */
  var bar = document.querySelector(".progress__bar");
  if (bar) {
    var target = bar.style.getPropertyValue("--pct") || "62%";
    bar.style.setProperty("--pct", "0%");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.style.setProperty("--pct", target);
      });
    });
  }

  /* ---- lightbox for site photos ---- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lastFocus = null;

  function openLightbox(btn) {
    lastFocus = btn;
    var bg = btn.style.background || getComputedStyle(btn).background;
    lbImg.style.background = bg;
    lbCap.textContent = btn.getAttribute("data-caption") || "";
    lightbox.hidden = false;
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll(".shot").forEach(function (btn) {
    btn.addEventListener("click", function () { openLightbox(btn); });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ---- pay invoices: settle balance + update running total ---- */
  var balanceEl = document.getElementById("balance");

  function parseMoney(str) {
    return Number(String(str).replace(/[^0-9.]/g, "")) || 0;
  }
  function fmtMoney(n) {
    return "$" + n.toLocaleString("en-US");
  }

  document.querySelectorAll(".pay-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var amount = Number(btn.getAttribute("data-amount")) || 0;
      var row = btn.closest("tr");

      // mark paid
      var badge = document.createElement("span");
      badge.className = "badge badge--done";
      badge.textContent = "Paid";
      btn.replaceWith(badge);
      if (row) {
        row.classList.add("paid-anim");
        setTimeout(function () { row.classList.remove("paid-anim"); }, 1200);
      }

      // update outstanding balance
      if (balanceEl) {
        var current = parseMoney(balanceEl.textContent);
        balanceEl.textContent = fmtMoney(Math.max(0, current - amount));
      }
    });
  });

  /* ---- message composer ---- */
  var composer = document.getElementById("composer");
  var input = document.getElementById("msgInput");
  var thread = document.getElementById("thread");

  function timeStamp() {
    var d = new Date();
    var h = d.getHours();
    var m = String(d.getMinutes()).padStart(2, "0");
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    var month = d.toLocaleString("en-US", { month: "short" });
    return month + " " + d.getDate() + ", " + h + ":" + m + " " + ampm;
  }

  if (composer && input && thread) {
    composer.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;

      var li = document.createElement("li");
      li.className = "msg msg--client";
      li.innerHTML =
        '<span class="msg__who">You</span><p></p><time></time>';
      li.querySelector("p").textContent = text;
      li.querySelector("time").textContent = timeStamp();
      thread.appendChild(li);

      input.value = "";
      input.focus();
      thread.scrollTop = thread.scrollHeight;
    });
  }
})();
