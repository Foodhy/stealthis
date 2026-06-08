(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  function formatCount(n) {
    return n.toLocaleString("en-US");
  }

  /* ---------- Clap / recommend counter ---------- */
  var clapBtn = document.getElementById("clapBtn");
  var clapCount = document.getElementById("clapCount");

  if (clapBtn && clapCount) {
    var base = parseInt(clapCount.textContent.replace(/[^0-9]/g, ""), 10) || 0;
    var added = 0;
    var bumpTimer = null;

    clapBtn.addEventListener("click", function () {
      added += 1;
      var total = base + added;
      clapCount.textContent = formatCount(total);
      clapBtn.classList.add("is-clapped");

      clapBtn.classList.remove("is-bumped");
      void clapBtn.offsetWidth; // restart animation
      clapBtn.classList.add("is-bumped");
      window.clearTimeout(bumpTimer);
      bumpTimer = window.setTimeout(function () {
        clapBtn.classList.remove("is-bumped");
      }, 320);

      var label = clapBtn.querySelector(".clap__label");
      if (label) label.textContent = "Recommended";

      if (added === 1) {
        toast("Thanks — your recommendation was counted.");
      } else {
        toast("+" + added + " from you. The desk appreciates it.");
      }
    });
  }

  /* ---------- Share ---------- */
  var shareBtn = document.getElementById("shareBtn");
  var copyBtn = document.getElementById("copyBtn");

  var shareData = {
    title: "The Quiet Architecture of a City That Forgot to Look Up",
    text: "Eleanor Hartwell on the unremarkable infrastructure of being together.",
    url: (window.location && window.location.href) || "https://example.com/opinion"
  };

  function copyLink() {
    var url = shareData.url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () {
          toast("Link copied to clipboard.");
        },
        function () {
          fallbackCopy(url);
        }
      );
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast("Link copied to clipboard.");
    } catch (e) {
      toast("Copy this link: " + text);
    }
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share(shareData).then(
          function () {
            toast("Shared. Thank you for passing it on.");
          },
          function () {
            /* user dismissed — stay quiet */
          }
        );
      } else {
        copyLink();
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyLink);
  }

  /* ---------- Newsletter signup ---------- */
  var signup = document.getElementById("signup");
  if (signup) {
    signup.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = signup.querySelector("input[type='email']");
      var value = input ? input.value.trim() : "";
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!valid) {
        toast("Please enter a valid email address.");
        if (input) input.focus();
        return;
      }
      toast("You're on the list. The Commons arrives Thursdays.");
      signup.reset();
    });
  }
})();
