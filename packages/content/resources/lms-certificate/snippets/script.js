(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var host = document.getElementById("toastHost");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind === "info" ? " toast--info" : "");
    var ico = document.createElement("span");
    ico.className = "toast__ico";
    ico.setAttribute("aria-hidden", "true");
    ico.textContent = kind === "info" ? "i" : "✓";
    var txt = document.createElement("span");
    txt.textContent = msg;
    el.appendChild(ico);
    el.appendChild(txt);
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 280);
    }, 2600);
  }

  /* ---------- Faux QR (deterministic from code) ---------- */
  function buildQR(seed) {
    var box = document.getElementById("qr");
    if (!box) return;
    var n = 0;
    for (var i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
    var cells = 121; // 11 x 11
    var rng = n || 1;
    for (var c = 0; c < cells; c++) {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff;
      var on = (rng >> 8) & 1;
      // force the three finder-pattern corners on for a QR look
      var row = Math.floor(c / 11), col = c % 11;
      var finder =
        (row < 3 && col < 3) ||
        (row < 3 && col > 7) ||
        (row > 7 && col < 3);
      if (finder) on = (row === 0 || row === 2 || row === 8 || row === 10 || col === 0 || col === 2 || col === 8 || col === 10 || (row === 1 && col === 1) || (row === 1 && col === 9) || (row === 9 && col === 1)) ? 1 : 0;
      var cell = document.createElement("i");
      if (on) cell.style.background = "var(--ink)";
      else cell.style.background = "transparent";
      box.appendChild(cell);
    }
  }

  /* ---------- Actions ---------- */
  var code = document.getElementById("verifyCode").textContent.trim();
  buildQR(code);

  var downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      var orig = downloadBtn.innerHTML;
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = "Preparing…";
      setTimeout(function () {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = orig;
        toast("Certificate saved as Brightpath-UXW-Certificate.pdf");
      }, 950);
    });
  }

  var printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      toast("Opening print dialog…", "info");
      setTimeout(function () { window.print(); }, 300);
    });
  }

  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var url = "https://verify.brightpath.academy/9F4K2A";
      if (navigator.share) {
        navigator.share({
          title: "My UX Writing certificate",
          text: "I completed Foundations of UX Writing on Brightpath Academy!",
          url: url
        }).then(function () {
          toast("Shared!");
        }).catch(function () { /* user cancelled */ });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          toast("Share link copied to clipboard");
        }).catch(function () {
          toast("Share link: " + url, "info");
        });
      } else {
        toast("Share link: " + url, "info");
      }
    });
  }

  var linkedinBtn = document.getElementById("linkedinBtn");
  if (linkedinBtn) {
    linkedinBtn.addEventListener("click", function () {
      toast("Opening LinkedIn — Add to profile", "info");
      // Demo: would open LinkedIn "Add certification" pre-filled flow.
    });
  }

  /* ---------- Copy verification code ---------- */
  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      function done() {
        copyBtn.classList.add("is-copied");
        var prev = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        toast("Verification code copied: " + code);
        setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          copyBtn.textContent = prev;
        }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); }
        catch (e) { toast("Copy failed — code: " + code, "info"); }
        ta.remove();
      }
    });
  }

  /* ---------- Study mode toggle ---------- */
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var on = document.body.classList.toggle("study");
      themeBtn.setAttribute("aria-pressed", on ? "true" : "false");
      toast(on ? "Study mode on" : "Study mode off", "info");
    });
  }
})();
