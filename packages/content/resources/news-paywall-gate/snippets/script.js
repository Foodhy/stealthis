(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg, accent) {
    if (!toastEl) return;
    toastEl.innerHTML = accent
      ? msg.replace(accent, '<span class="toast__accent">' + accent + "</span>")
      : msg;
    toastEl.hidden = false;
    // force reflow so the transition runs every time
    void toastEl.offsetWidth;
    toastEl.setAttribute("data-show", "true");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.setAttribute("data-show", "false");
    }, 2600);
  }

  /* ---------- free-article counter ---------- */
  var FREE_LIMIT = 3;
  var articlesRead = 1; // this story counts as #1

  var meterText = document.getElementById("meterText");
  var meterPips = document.getElementById("meterPips");
  var gateRead = document.getElementById("gateRead");

  function renderMeter() {
    var remaining = Math.max(0, FREE_LIMIT - articlesRead);
    if (meterText) {
      if (remaining > 0) {
        meterText.innerHTML =
          "You&rsquo;ve read <strong>" +
          articlesRead +
          "</strong> of " +
          FREE_LIMIT +
          " free articles this month &middot; " +
          remaining +
          (remaining === 1 ? " left." : " left.");
      } else {
        meterText.innerHTML =
          "You&rsquo;ve used all <strong>" +
          FREE_LIMIT +
          "</strong> free articles this month.";
      }
    }
    if (gateRead) gateRead.textContent = String(articlesRead);
    if (meterPips) {
      var html = "";
      for (var i = 0; i < FREE_LIMIT; i++) {
        html += '<i class="' + (i < articlesRead ? "used" : "") + '"></i>';
      }
      meterPips.innerHTML = html;
    }
  }
  renderMeter();

  /* ---------- plan toggle ---------- */
  var PLANS = {
    monthly: {
      amount: "$8",
      per: "/ month",
      note: "Billed monthly. Cancel anytime.",
    },
    annual: {
      amount: "$67",
      per: "/ year",
      note: "Billed annually at $67 — that&rsquo;s $5.58/month. Save 30%.",
    },
  };
  var currentPlan = "monthly";

  var planAmount = document.getElementById("planAmount");
  var planPer = document.getElementById("planPer");
  var planNote = document.getElementById("planNote");
  var planButtons = Array.prototype.slice.call(
    document.querySelectorAll(".plan__opt")
  );

  function setPlan(plan) {
    if (!PLANS[plan]) return;
    currentPlan = plan;
    var p = PLANS[plan];
    if (planAmount) planAmount.textContent = p.amount;
    if (planPer) planPer.textContent = p.per;
    if (planNote) planNote.innerHTML = p.note;
    planButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-plan") === plan;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  planButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setPlan(btn.getAttribute("data-plan"));
    });
  });

  /* ---------- subscribe / unlock ---------- */
  var story = document.getElementById("story");
  var subscribeBtn = document.getElementById("subscribe");
  var rest = document.getElementById("rest");

  function unlock() {
    if (story.getAttribute("data-locked") === "false") return;
    story.setAttribute("data-locked", "false");
    if (rest) rest.hidden = false;

    var label =
      currentPlan === "annual" ? "Annual" : "Monthly";
    var price = PLANS[currentPlan].amount;

    if (subscribeBtn) {
      subscribeBtn.textContent = "Subscribed — enjoy The Harbor Review";
      subscribeBtn.disabled = true;
    }

    // unlimited reading once subscribed
    if (meterText)
      meterText.innerHTML =
        "<strong>Subscriber</strong> &middot; unlimited access unlocked.";
    if (meterPips) meterPips.innerHTML = "";

    toast("Welcome aboard — " + label + " plan active (" + price + ").", price);

    // smooth-scroll to where the gate was so the reader continues
    if (rest && rest.scrollIntoView) {
      rest.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (subscribeBtn) subscribeBtn.addEventListener("click", unlock);

  /* sign-in acts as an unlock shortcut for the demo */
  var signin = document.getElementById("signin");
  if (signin) {
    signin.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Signed in — restoring your subscription.");
      setTimeout(unlock, 500);
    });
  }

  /* ---------- share ---------- */
  var shareBtn = document.querySelector("[data-share]");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () {
            toast("Link copied to clipboard.");
          },
          function () {
            toast("Share this story with a colleague.");
          }
        );
      } else {
        toast("Share this story with a colleague.");
      }
    });
  }
})();
