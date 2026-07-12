(function () {
  "use strict";

  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function formatCount(n) {
    if (n >= 1000) {
      var k = n / 1000;
      return (k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")) + "K";
    }
    return String(n);
  }

  // ---- platform subscribe buttons ----
  var buttons = document.querySelectorAll(".plat");
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-platform");
      var countEl = btn.querySelector(".plat__count");
      var following = btn.classList.toggle("is-following");
      var base = parseInt(countEl.getAttribute("data-count"), 10) || 0;
      var current = following ? base + 1 : base;
      countEl.setAttribute("data-count", current);
      countEl.textContent = formatCount(current);
      countEl.classList.add("bump");
      window.setTimeout(function () {
        countEl.classList.remove("bump");
      }, 220);
      btn.setAttribute("aria-pressed", String(following));
      if (following) {
        toast("Subscribed on " + name + " — opening app…");
        // In production this would follow through to data-url.
      } else {
        toast("Unsubscribed from " + name);
      }
    });
    btn.setAttribute("aria-pressed", "false");
  });

  // ---- copy RSS ----
  var copyBtn = document.getElementById("copy-rss");
  var feedEl = document.getElementById("feed-url");

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  function markCopied() {
    var label = copyBtn.querySelector(".copy-btn__label");
    var prev = label ? label.textContent : "";
    copyBtn.classList.add("is-copied");
    if (label) label.textContent = "Copied";
    toast("RSS feed URL copied to clipboard");
    window.setTimeout(function () {
      copyBtn.classList.remove("is-copied");
      if (label) label.textContent = prev || "Copy";
    }, 1800);
  }

  if (copyBtn && feedEl) {
    copyBtn.addEventListener("click", function () {
      var url = feedEl.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(markCopied, function () {
          if (fallbackCopy(url)) markCopied();
          else toast("Couldn't copy — select the URL manually");
        });
      } else if (fallbackCopy(url)) {
        markCopied();
      } else {
        toast("Couldn't copy — select the URL manually");
      }
    });
  }
})();
