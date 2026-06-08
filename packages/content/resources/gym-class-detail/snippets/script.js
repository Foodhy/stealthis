(function () {
  "use strict";

  // ---- State ----
  var TOTAL = 20;
  var state = {
    booked: 14,
    total: TOTAL,
    isBookedByMe: false,
    isWaitlisted: false,
    following: false,
  };

  // ---- Elements ----
  var $ = function (sel) { return document.querySelector(sel); };

  var els = {
    book: $("[data-book]"),
    bookLabel: $(".btn-book__label"),
    progress: $("[data-progress]"),
    fill: $("[data-fill]"),
    bookedEl: $("[data-booked]"),
    totalEl: $("[data-total]"),
    hint: $("[data-hint]"),
    follow: $("[data-follow]"),
    toastWrap: $("[data-toast-wrap]"),
    avatars: $("[data-avatars]"),
    more: $("[data-more]"),
    names: $("[data-names]"),
  };

  // ---- Toast helper ----
  function toast(msg, kind) {
    if (!els.toastWrap) return;
    var t = document.createElement("div");
    t.className = "toast" + (kind === "warn" ? " toast--warn" : "");
    t.textContent = msg;
    els.toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-out");
      t.addEventListener("animationend", function () { t.remove(); });
    }, 2600);
  }

  // ---- Render ----
  function spotsLeft() {
    return Math.max(0, state.total - state.booked);
  }

  function isFull() {
    return state.booked >= state.total;
  }

  function render() {
    var left = spotsLeft();
    var pct = Math.min(100, (state.booked / state.total) * 100);

    els.fill.style.width = pct + "%";
    els.bookedEl.textContent = String(state.booked);
    els.totalEl.textContent = String(state.total);
    els.progress.setAttribute("aria-valuenow", String(state.booked));
    els.progress.classList.toggle("is-full", isFull());

    // hint
    els.hint.classList.remove("is-warn", "is-full");
    if (isFull()) {
      if (state.isWaitlisted) {
        els.hint.textContent = "Class is full — you're on the waitlist.";
      } else {
        els.hint.textContent = "Class is full — join the waitlist.";
      }
      els.hint.classList.add("is-full");
    } else if (left <= 6) {
      els.hint.textContent = left + " spots left — fills up fast.";
      els.hint.classList.add("is-warn");
    } else {
      els.hint.textContent = left + " spots available.";
    }

    // CTA
    els.book.classList.remove("is-booked", "is-waitlist");
    if (state.isBookedByMe) {
      els.book.classList.add("is-booked");
      els.bookLabel.textContent = "Booked ✓ — Cancel?";
      els.book.setAttribute("aria-pressed", "true");
    } else if (state.isWaitlisted) {
      els.book.classList.add("is-waitlist");
      els.bookLabel.textContent = "On waitlist — Leave?";
      els.book.setAttribute("aria-pressed", "true");
    } else if (isFull()) {
      els.book.classList.add("is-waitlist");
      els.bookLabel.textContent = "Join waitlist";
      els.book.setAttribute("aria-pressed", "false");
    } else {
      els.bookLabel.textContent = "Book this class";
      els.book.setAttribute("aria-pressed", "false");
    }
  }

  // ---- Roster ----
  var myAvatar = null;
  function addMyAvatar() {
    if (myAvatar) return;
    myAvatar = document.createElement("li");
    myAvatar.className = "avatar";
    myAvatar.textContent = "ME";
    myAvatar.style.setProperty("--clr", "#c6ff3a");
    myAvatar.style.marginLeft = "-10px";
    els.avatars.insertBefore(myAvatar, els.more);
    bumpMore(1);
  }
  function removeMyAvatar() {
    if (!myAvatar) return;
    myAvatar.remove();
    myAvatar = null;
    bumpMore(-1);
  }
  function bumpMore(delta) {
    var cur = parseInt((els.more.textContent || "+0").replace("+", ""), 10) || 0;
    els.more.textContent = "+" + Math.max(0, cur + delta);
  }

  // ---- Actions ----
  function onBook() {
    if (state.isBookedByMe) {
      // cancel booking
      state.isBookedByMe = false;
      state.booked = Math.max(0, state.booked - 1);
      removeMyAvatar();
      toast("Booking cancelled. Your credit is back.", "warn");
    } else if (state.isWaitlisted) {
      // leave waitlist
      state.isWaitlisted = false;
      toast("Left the waitlist.", "warn");
    } else if (isFull()) {
      // join waitlist
      state.isWaitlisted = true;
      toast("You're on the waitlist — we'll text you if a spot opens.");
    } else {
      // book
      state.isBookedByMe = true;
      state.booked += 1;
      addMyAvatar();
      toast("You're in! HIIT Burn 45 · Mon 6:30 AM.");
    }
    render();
  }

  function onFollow() {
    state.following = !state.following;
    els.follow.classList.toggle("is-following", state.following);
    els.follow.textContent = state.following ? "Following" : "Follow";
    toast(
      state.following
        ? "Following coach Mara Reyes."
        : "Unfollowed Mara Reyes.",
      state.following ? undefined : "warn"
    );
  }

  // ---- Wire up ----
  els.book.addEventListener("click", onBook);
  els.follow.addEventListener("click", onFollow);

  render();
})();
