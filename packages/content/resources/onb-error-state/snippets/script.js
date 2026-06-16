(function () {
  "use strict";

  /* ---- Framing copy for each error variant ---- */
  var FRAMES = {
    generic: {
      title: "Something went wrong",
      desc: "We couldn’t load your revenue analytics. This is on our side — please try again in a moment.",
      code: "ERR_500_GATEWAY · req_8f3a1c",
      icon: "warn",
      // generic 500s usually succeed on retry
      failRetry: false
    },
    offline: {
      title: "You appear to be offline",
      desc: "We can’t reach the server right now. Check your connection and try again.",
      code: "ERR_NETWORK · ECONNRESET",
      icon: "wifi",
      // first network retry stays failing to feel real
      failRetry: true
    },
    notfound: {
      title: "We couldn’t find that data",
      desc: "This report may have been moved or deleted. Try reloading, or contact support if it should be here.",
      code: "ERR_404_NOT_FOUND · revenue/30d",
      icon: "search",
      failRetry: false
    }
  };

  var ICONS = {
    warn:
      '<svg class="art__svg" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="54" class="art__ring"/><path class="art__tri" d="M60 28 L92 84 L28 84 Z"/><line class="art__bang" x1="60" y1="50" x2="60" y2="68"/><circle class="art__dot" cx="60" cy="76" r="2.6"/></svg>',
    wifi:
      '<svg class="art__svg" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="54" class="art__ring"/><g stroke="var(--danger)" stroke-width="5" stroke-linecap="round" fill="none"><path d="M34 56 C50 42 70 42 86 56"/><path d="M44 68 C53 60 67 60 76 68"/></g><circle cx="60" cy="80" r="3.4" fill="var(--danger)"/><line x1="40" y1="40" x2="80" y2="80" stroke="var(--danger)" stroke-width="5" stroke-linecap="round"/></svg>',
    search:
      '<svg class="art__svg" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="54" class="art__ring"/><circle cx="54" cy="54" r="18" stroke="var(--danger)" stroke-width="5" fill="rgba(212,80,62,0.08)"/><line x1="68" y1="68" x2="84" y2="84" stroke="var(--danger)" stroke-width="6" stroke-linecap="round"/></svg>'
  };

  var currentFrame = "generic";

  var stage = document.querySelector(".stage");
  var errState = document.querySelector('[data-state="error"]');
  var okState = document.querySelector('[data-state="ok"]');
  var artBox = errState.querySelector(".art");
  var elTitle = document.getElementById("stTitle");
  var elDesc = document.getElementById("stDesc");
  var elCode = document.getElementById("stCode");
  var retryBtn = document.getElementById("retryBtn");
  var retryNote = document.getElementById("retryNote");
  var copyBtn = document.getElementById("copyBtn");
  var supportBtn = document.getElementById("supportBtn");
  var breakBtn = document.getElementById("breakBtn");
  var toastEl = document.getElementById("toast");

  var retryCount = 0;
  var toastTimer;

  /* ---- Toast helper ---- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  /* ---- Apply a framing variant ---- */
  function applyFrame(key) {
    var f = FRAMES[key];
    if (!f) return;
    currentFrame = key;
    retryCount = 0;
    artBox.innerHTML = ICONS[f.icon];
    elTitle.textContent = f.title;
    elDesc.textContent = f.desc;
    elCode.textContent = f.code;
    retryNote.textContent = "";
    retryNote.classList.remove("is-error");
    showError();
  }

  function showError() {
    okState.hidden = true;
    errState.hidden = false;
    // re-trigger entrance animation
    errState.style.animation = "none";
    void errState.offsetWidth;
    errState.style.animation = "";
  }

  function showSuccess() {
    errState.hidden = true;
    okState.hidden = false;
    okState.style.animation = "none";
    void okState.offsetWidth;
    okState.style.animation = "";
  }

  /* ---- Retry flow: spinner -> resolve ---- */
  function doRetry() {
    if (retryBtn.classList.contains("is-loading")) return;
    retryCount++;
    var f = FRAMES[currentFrame];
    retryBtn.classList.add("is-loading");
    retryBtn.setAttribute("aria-busy", "true");
    retryBtn.querySelector(".btn__txt").textContent = "Retrying…";
    retryNote.textContent = "Reconnecting and reloading data…";
    retryNote.classList.remove("is-error");

    setTimeout(function () {
      retryBtn.classList.remove("is-loading");
      retryBtn.removeAttribute("aria-busy");
      retryBtn.querySelector(".btn__txt").textContent = "Try again";

      // network framing fails the first attempt, succeeds after
      var willFail = f.failRetry && retryCount < 2;
      if (willFail) {
        retryNote.textContent = "Still can’t reach the server. Please check your connection.";
        retryNote.classList.add("is-error");
        toast("Retry failed — still offline");
      } else {
        retryNote.textContent = "";
        toast("Data loaded successfully");
        showSuccess();
      }
    }, 1500);
  }

  /* ---- Copy error code ---- */
  function copyCode() {
    var text = elCode.textContent.trim();
    var done = function () { toast("Error code copied"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  /* ---- Segmented control wiring ---- */
  function wireSegments() {
    document.querySelectorAll(".seg").forEach(function (group) {
      var btns = group.querySelectorAll(".seg__btn");
      btns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          btns.forEach(function (b) {
            b.classList.remove("is-active");
            b.setAttribute("aria-pressed", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");

          if (btn.dataset.frame) {
            applyFrame(btn.dataset.frame);
          } else if (btn.dataset.layout) {
            stage.setAttribute("data-layout", btn.dataset.layout);
          }
        });
      });
    });
  }

  /* ---- Events ---- */
  retryBtn.addEventListener("click", doRetry);
  copyBtn.addEventListener("click", copyCode);
  breakBtn.addEventListener("click", function () {
    applyFrame(currentFrame);
    toast("Simulated a fresh failure");
  });
  supportBtn.addEventListener("click", function (e) {
    e.preventDefault();
    toast("Opening support — ref " + elCode.textContent.trim());
  });

  // Esc resets the demo back to the error state
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !okState.hidden) {
      applyFrame(currentFrame);
    }
  });

  wireSegments();
  applyFrame("generic");
})();
